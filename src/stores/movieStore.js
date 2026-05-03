import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './authStore'
import * as idb from '../lib/indexeddb'

const STORAGE_KEY = 'movie-record-data'
const AUTO_BACKUP_KEY = 'webdav-auto-backup'
const FILTER_STORAGE_KEY = 'movie-record-filter'

// Supabase 字段 → 前端字段映射
const dbToLocal = (m) => ({
  id: m.id,
  tmdbId: m.tmdbId,
  title: m.title,
  releaseYear: m.releaseYear,
  genres: m.genres || [],
  mediaType: m.mediaType,
  personalRating: m.personalRating,
  watchDate: m.watchDate,
  overview: m.overview,
  cover: m.coverUrl,
  backdrop: m.backdropUrl,
  actors: m.actors || []
})

// 前端字段 → Supabase 字段映射
const localToDb = (m) => ({
  title: m.title,
  releaseYear: m.releaseYear || '',
  genres: m.genres || [],
  mediaType: m.mediaType || 'movie',
  personalRating: m.personalRating || '',
  watchDate: m.watchDate || new Date().toISOString().split('T')[0],
  overview: m.overview || '',
  tmdbId: m.tmdbId || '',
  coverUrl: m.cover || '',
  backdropUrl: m.backdrop || '',
  actors: m.actors || []
})

export const useMovieStore = defineStore('movie', () => {
  const movies = ref([])
  const filterState = ref({ mediaType: '', year: '', rating: '' })
  const loading = ref(false)
  let lastBackupTime = 0
  const BACKUP_DEBOUNCE = 60000

  // ========== Filter State ==========
  const loadFilterState = () => {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY)
    if (stored) {
      try { filterState.value = JSON.parse(stored) } catch {}
    }
  }
  const saveFilterState = () => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState.value))
  }
  const setFilterState = (type, value) => {
    if (type in filterState.value) { filterState.value[type] = value; saveFilterState() }
  }
  const clearFilterState = () => {
    filterState.value = { mediaType: '', year: '', rating: '' }; saveFilterState()
  }
  loadFilterState()

  // ========== 判断当前模式 ==========
  const isLoggedIn = () => {
    try {
      const authStore = useAuthStore()
      return authStore.isLoggedIn
    } catch { return false }
  }

  // ========== 加载数据 ==========
  const loadFromSupabase = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('"watchDate"', { ascending: false })

      if (error) {
        console.error('Failed to load from Supabase:', error)
        await loadFromLocal()
        return
      }
      movies.value = data.map(dbToLocal)
    } catch (e) {
      console.error('Supabase load error:', e)
      await loadFromLocal()
    } finally {
      loading.value = false
    }
  }

  const loadFromLocal = async () => {
    try {
      // 优先从 IndexedDB 读取
      const data = await idb.getAllMovies()
      if (data.length > 0) {
        movies.value = data
        return
      }
      // 如果 IndexedDB 为空，尝试从 localStorage 迁移
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.length > 0) {
          await idb.bulkImport(parsed)
          movies.value = parsed
          console.log(`Migrated ${parsed.length} movies from localStorage to IndexedDB`)
        }
      }
    } catch (e) {
      console.error('Local load error:', e)
      // 最终降级：直接从 localStorage 读
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try { movies.value = JSON.parse(stored) } catch { movies.value = [] }
      }
    }
  }

  const loadData = async () => {
    loading.value = true
    try {
      if (isLoggedIn()) {
        await loadFromSupabase()
      } else {
        await loadFromLocal()
      }
    } finally {
      loading.value = false
    }
  }

  // ========== 初始化 ==========
  // 延迟加载，等 authStore 初始化完成
  setTimeout(() => loadData(), 100)

  // ========== WebDAV 自动备份 ==========
  const autoBackup = async () => {
    const webdavConfig = localStorage.getItem('webdav-config')
    if (!webdavConfig) return
    try {
      const config = JSON.parse(webdavConfig)
      if (!config.autoBackup || !config.url || !config.username || !config.password) return
      const now = Date.now()
      if (now - lastBackupTime < BACKUP_DEBOUNCE) return
      const filename = `movie-record-backup-${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-')}.json`
      const backupData = { version: '1.0', exportDate: new Date().toISOString(), movieCount: movies.value.length, movies: movies.value }
      const url = '/api/webdav/' + filename
      const headers = { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(config.username + ':' + config.password) }
      const response = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(backupData, null, 2) })
      if (response.ok) {
        lastBackupTime = now
        config.lastBackup = new Date().toISOString()
        localStorage.setItem('webdav-config', JSON.stringify(config))
      }
    } catch (e) {
      console.error('Auto backup error:', e)
    }
  }

  // ========== CRUD ==========
  const addMovie = async (movie) => {
    if (isLoggedIn()) {
      // 已登录：写 Supabase
      try {
        const record = { ...localToDb(movie), user_id: useAuthStore().user.id }
        const { data, error } = await supabase.from('movies').insert([record]).select().single()
        if (error) throw error
        const added = dbToLocal(data)
        movies.value.unshift(added)
        autoBackup()
        return added
      } catch (e) {
        console.error('Add to Supabase failed:', e)
        throw e
      }
    } else {
      // 未登录：写 IndexedDB
      const record = await idb.addMovie(movie)
      movies.value.unshift(record)
      autoBackup()
      return record
    }
  }

  const updateMovie = async (id, updates) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index === -1) return null

    if (isLoggedIn()) {
      const fieldMap = {
        title: 'title', releaseYear: 'releaseYear', genres: 'genres',
        mediaType: 'mediaType', personalRating: 'personalRating', watchDate: 'watchDate',
        overview: 'overview', tmdbId: 'tmdbId', cover: 'coverUrl', backdrop: 'backdropUrl', actors: 'actors'
      }
      const dbUpdates = {}
      for (const [key, dbKey] of Object.entries(fieldMap)) {
        if (key in updates) dbUpdates[dbKey] = updates[key]
      }
      try {
        const { error } = await supabase.from('movies').update(dbUpdates).eq('id', id)
        if (error) console.error('Update in Supabase failed:', error)
      } catch (e) {
        console.error('Update movie error:', e)
      }
    } else {
      await idb.updateMovie(id, updates)
    }

    movies.value[index] = { ...movies.value[index], ...updates }
    autoBackup()
    return movies.value[index]
  }

  const deleteMovie = async (id) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index === -1) return false

    if (isLoggedIn()) {
      try {
        const { error } = await supabase.from('movies').delete().eq('id', id)
        if (error) console.error('Delete from Supabase failed:', error)
      } catch (e) {
        console.error('Delete movie error:', e)
      }
    } else {
      await idb.deleteMovie(id)
    }

    movies.value.splice(index, 1)
    autoBackup()
    return true
  }

  // ========== 登录后数据迁移 ==========
  const migrateLocalToSupabase = async () => {
    // 1. 获取 IndexedDB 中的本地数据
    let localMovies = []
    try {
      localMovies = await idb.getAllMovies()
    } catch {}

    // 也检查 localStorage 是否有旧数据
    if (localMovies.length === 0) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try { localMovies = JSON.parse(stored) } catch {}
      }
    }

    if (localMovies.length === 0) return 0

    const userId = useAuthStore().user.id

    // 2. 获取 Supabase 中已有数据，避免重复
    const { data: existing } = await supabase.from('movies').select('title, "watchDate"')
    const existingSet = new Set((existing || []).map(m => `${m.title}|${m.watchDate}`))

    const newRecords = localMovies
      .filter(m => !existingSet.has(`${m.title}|${m.watchDate}`))
      .map(m => ({ ...localToDb(m), user_id: userId }))

    if (newRecords.length === 0) return 0

    const { data, error } = await supabase.from('movies').insert(newRecords).select()
    if (error) {
      console.error('Migration failed:', error)
      return 0
    }

    // 3. 重新加载 Supabase 数据
    await loadFromSupabase()

    // 4. 清空 IndexedDB 本地数据（已迁移完成）
    try { await idb.clearAll() } catch {}

    return data.length
  }

  // ========== 登出时切换回本地 ==========
  const switchToLocal = async () => {
    movies.value = []
    await loadFromLocal()
  }

  // ========== 查询 & 计算属性 ==========
  const getMovieById = (id) => movies.value.find(m => m.id === id)

  const getMoviesByType = (type) => {
    if (type === 'all') return movies.value
    return movies.value.filter(m => m.mediaType === type)
  }

  const searchMovies = (keyword) => {
    if (!keyword) return movies.value
    const lower = keyword.toLowerCase()
    return movies.value.filter(m =>
      m.title.toLowerCase().includes(lower) ||
      m.overview?.toLowerCase().includes(lower) ||
      m.actors?.some(a => a.toLowerCase().includes(lower))
    )
  }

  const filterMovies = ({ type, years, genres, ratingRange }) => {
    return movies.value.filter(m => {
      if (type && type !== 'all' && m.mediaType !== type) return false
      if (years && years.length > 0 && !years.includes(m.releaseYear)) return false
      if (genres && genres.length > 0 && !m.genres?.some(g => genres.includes(g))) return false
      if (ratingRange && m.personalRating !== undefined) {
        if (m.personalRating < ratingRange[0] || m.personalRating > ratingRange[1]) return false
      }
      return true
    })
  }

  const sortedByWatchDate = computed(() =>
    [...movies.value].sort((a, b) => new Date(b.watchDate) - new Date(a.watchDate))
  )

  const totalCount = computed(() => movies.value.length)

  const movieCountByType = computed(() => ({
    movie: movies.value.filter(m => m.mediaType === 'movie').length,
    tv: movies.value.filter(m => m.mediaType === 'tv').length,
    short: movies.value.filter(m => m.mediaType === 'short').length
  }))

  const averageRating = computed(() => {
    const rated = movies.value.filter(m => m.personalRating !== undefined && m.personalRating !== null && m.personalRating !== '')
    if (rated.length === 0) return 0
    const avg = rated.reduce((acc, m) => acc + Number(m.personalRating), 0) / rated.length
    return isNaN(avg) ? 0 : avg.toFixed(1)
  })

  const currentMonthCount = computed(() => {
    const now = new Date()
    return movies.value.filter(m => {
      const d = new Date(m.watchDate)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  })

  const allYears = computed(() => {
    const years = new Set()
    movies.value.forEach(m => { const y = Number(m.releaseYear); if (y && !isNaN(y)) years.add(y) })
    return Array.from(years).sort((a, b) => b - a)
  })

  const allGenres = computed(() => {
    const genres = new Set()
    movies.value.forEach(m => m.genres?.forEach(g => genres.add(g)))
    return Array.from(genres).sort()
  })

  const allRatings = computed(() => {
    const ratings = new Set()
    movies.value.forEach(m => { const r = Number(m.personalRating); if (r && !isNaN(r) && r > 0) ratings.add(r) })
    return Array.from(ratings).sort((a, b) => a - b)
  })

  const getRandomMovie = () => {
    if (movies.value.length === 0) return null
    return movies.value[Math.floor(Math.random() * movies.value.length)]
  }

  const syncToSupabase = async () => {
    // 兼容旧逻辑，现在用 migrateLocalToSupabase 替代
    return migrateLocalToSupabase()
  }

  return {
    movies, filterState, loading,
    setFilterState, clearFilterState,
    addMovie, updateMovie, deleteMovie,
    getMovieById, getMoviesByType, searchMovies, filterMovies,
    sortedByWatchDate, totalCount, movieCountByType, averageRating,
    currentMonthCount, allYears, allGenres, allRatings, getRandomMovie,
    loadData, loadFromSupabase, syncToSupabase,
    migrateLocalToSupabase, switchToLocal
  }
})
