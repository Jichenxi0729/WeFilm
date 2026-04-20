import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'movie-record-data'
const AUTO_BACKUP_KEY = 'webdav-auto-backup'

export const useMovieStore = defineStore('movie', () => {
  const movies = ref([])
  const filterState = ref({
    mediaType: '',
    year: '',
    rating: ''
  })
  let lastBackupTime = 0
  const BACKUP_DEBOUNCE = 60000

  const FILTER_STORAGE_KEY = 'movie-record-filter'
  const CALENDAR_STORAGE_KEY = 'movie-record-calendar'

  const calendarState = ref({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    selectedDate: null
  })

  const loadFilterState = () => {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY)
    if (stored) {
      try {
        filterState.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse filter state:', e)
      }
    }
  }

  const saveFilterState = () => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState.value))
  }

  const setFilterState = (type, value) => {
    if (type in filterState.value) {
      filterState.value[type] = value
      saveFilterState()
    }
  }

  const clearFilterState = () => {
    filterState.value = { mediaType: '', year: '', rating: '' }
    saveFilterState()
  }

  const loadCalendarState = () => {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY)
    if (stored) {
      try {
        calendarState.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse calendar state:', e)
      }
    }
  }

  const saveCalendarState = () => {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(calendarState.value))
  }

  const setCalendarState = (type, value) => {
    if (type in calendarState.value) {
      calendarState.value[type] = value
      saveCalendarState()
    }
  }

  loadFilterState()
  loadCalendarState()

  const loadFromStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        movies.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored movies:', e)
        movies.value = []
      }
    }
  }

  const autoBackup = async () => {
    const webdavConfig = localStorage.getItem('webdav-config')
    if (!webdavConfig) return

    try {
      const config = JSON.parse(webdavConfig)
      if (!config.autoBackup || !config.url || !config.username || !config.password) return

      const now = Date.now()
      if (now - lastBackupTime < BACKUP_DEBOUNCE) return

      const filename = `movie-record-backup-${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '-')}.json`
      const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        movieCount: movies.value.length,
        movies: movies.value
      }

      const url = '/api/webdav/' + filename
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(config.username + ':' + config.password)
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(backupData, null, 2)
      })

      if (response.ok) {
        lastBackupTime = now
        localStorage.setItem(AUTO_BACKUP_KEY, now.toString())
      }
    } catch (e) {
      console.error('Auto backup failed:', e)
    }
  }

  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies.value))
    autoBackup()
  }

  const addMovie = (movie) => {
    const newMovie = {
      ...movie,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    movies.value.push(newMovie)
    saveToStorage()
    return newMovie
  }

  const updateMovie = (id, updates) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index !== -1) {
      movies.value[index] = {
        ...movies.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()
      return movies.value[index]
    }
    return null
  }

  const deleteMovie = (id) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index !== -1) {
      movies.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  const getMovieById = (id) => {
    return movies.value.find(m => m.id === id)
  }

  const getMoviesByType = (type) => {
    if (!type) return movies.value
    return movies.value.filter(m => m.mediaType === type)
  }

  const searchMovies = (keyword) => {
    if (!keyword) return movies.value
    const lower = keyword.toLowerCase()
    return movies.value.filter(m =>
      m.title.toLowerCase().includes(lower) ||
      (m.actors && m.actors.some(a => a.name.toLowerCase().includes(lower)))
    )
  }

  const filterMovies = computed(() => {
    return movies.value.filter(m => {
      if (filterState.value.mediaType && m.mediaType !== filterState.value.mediaType) return false
      if (filterState.value.year && m.year !== filterState.value.year) return false
      if (filterState.value.rating && (!m.rating || m.rating < Number(filterState.value.rating))) return false
      return true
    })
  })

  const sortedByWatchDate = computed(() => {
    return [...movies.value].sort((a, b) => {
      if (!a.watchDate) return 1
      if (!b.watchDate) return -1
      return new Date(b.watchDate) - new Date(a.watchDate)
    })
  })

  const totalCount = computed(() => movies.value.length)

  const movieCountByType = computed(() => {
    const counts = { movie: 0, tv: 0, short: 0 }
    movies.value.forEach(m => {
      if (m.mediaType && counts.hasOwnProperty(m.mediaType)) {
        counts[m.mediaType]++
      }
    })
    return counts
  })

  const averageRating = computed(() => {
    const rated = movies.value.filter(m => m.rating && m.rating > 0)
    if (rated.length === 0) return 0
    const sum = rated.reduce((acc, m) => acc + m.rating, 0)
    return (sum / rated.length).toFixed(1)
  })

  const getRandomMovie = () => {
    if (movies.value.length === 0) return null
    const randomIndex = Math.floor(Math.random() * movies.value.length)
    return movies.value[randomIndex]
  }

  const getYearStats = computed(() => {
    const stats = {}
    movies.value.forEach(m => {
      if (m.year) {
        if (!stats[m.year]) {
          stats[m.year] = { total: 0, types: {} }
        }
        stats[m.year].total++
        if (m.mediaType) {
          stats[m.year].types[m.mediaType] = (stats[m.year].types[m.mediaType] || 0) + 1
        }
      }
    })
    return stats
  })

  const getRecentWatchDates = (days = 30) => {
    const dates = new Set()
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    movies.value.forEach(m => {
      if (m.watchDate) {
        const watchDate = new Date(m.watchDate)
        if (watchDate >= startDate && watchDate <= now) {
          dates.add(m.watchDate)
        }
      }
    })

    return Array.from(dates).sort()
  }

  loadFromStorage()

  watch(movies, () => {
    saveToStorage()
  }, { deep: true })

  return {
    movies,
    filterState,
    calendarState,
    setFilterState,
    clearFilterState,
    setCalendarState,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovieById,
    getMoviesByType,
    searchMovies,
    filterMovies,
    sortedByWatchDate,
    totalCount,
    movieCountByType,
    averageRating,
    getRandomMovie,
    getYearStats,
    getRecentWatchDates,
    loadFromStorage
  }
})
