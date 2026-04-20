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

  loadFilterState()

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
        config.lastBackup = new Date().toISOString()
        localStorage.setItem('webdav-config', JSON.stringify(config))
        console.log('Auto backup successful:', filename)
      } else {
        const errorText = await response.text().catch(() => '')
        console.error('Auto backup failed:', response.status, response.statusText, errorText)
      }
    } catch (e) {
      console.error('Auto backup error:', e)
    }
  }

  watch(movies, () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies.value))
    autoBackup()
  }, { deep: true })

  loadFromStorage()

  const addMovie = (movie) => {
    const newMovie = {
      ...movie,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      watchDate: movie.watchDate || new Date().toISOString().split('T')[0]
    }
    movies.value.unshift(newMovie)
    return newMovie
  }

  const updateMovie = (id, updates) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index !== -1) {
      movies.value[index] = { ...movies.value[index], ...updates }
      return movies.value[index]
    }
    return null
  }

  const deleteMovie = (id) => {
    const index = movies.value.findIndex(m => m.id === id)
    if (index !== -1) {
      movies.value.splice(index, 1)
      return true
    }
    return false
  }

  const getMovieById = (id) => {
    return movies.value.find(m => m.id === id)
  }

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

  const sortedByWatchDate = computed(() => {
    return [...movies.value].sort((a, b) => 
      new Date(b.watchDate) - new Date(a.watchDate)
    )
  })

  const totalCount = computed(() => movies.value.length)

  const movieCountByType = computed(() => ({
    movie: movies.value.filter(m => m.mediaType === 'movie').length,
    tv: movies.value.filter(m => m.mediaType === 'tv').length,
    short: movies.value.filter(m => m.mediaType === 'short').length
  }))

  const averageRating = computed(() => {
    const rated = movies.value.filter(m => m.personalRating !== undefined && m.personalRating !== null && m.personalRating !== '')
    if (rated.length === 0) return 0
    const sum = rated.reduce((acc, m) => acc + Number(m.personalRating), 0)
    const avg = sum / rated.length
    return isNaN(avg) ? 0 : avg.toFixed(1)
  })

  const currentMonthCount = computed(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    return movies.value.filter(m => {
      const watchDate = new Date(m.watchDate)
      return watchDate.getFullYear() === currentYear && watchDate.getMonth() === currentMonth
    }).length
  })

  const allYears = computed(() => {
    const years = new Set()
    movies.value.forEach(m => {
      const year = Number(m.releaseYear)
      if (year && !isNaN(year)) {
        years.add(year)
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  })

  const allGenres = computed(() => {
    const genres = new Set()
    movies.value.forEach(m => {
      m.genres?.forEach(g => genres.add(g))
    })
    return Array.from(genres).sort()
  })

  const allRatings = computed(() => {
    const ratings = new Set()
    movies.value.forEach(m => {
      const rating = Number(m.personalRating)
      if (rating && !isNaN(rating) && rating > 0) {
        ratings.add(rating)
      }
    })
    return Array.from(ratings).sort((a, b) => a - b)
  })

  const getRandomMovie = () => {
    if (movies.value.length === 0) return null
    const randomIndex = Math.floor(Math.random() * movies.value.length)
    return movies.value[randomIndex]
  }

  return {
    movies,
    filterState,
    setFilterState,
    clearFilterState,
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
    currentMonthCount,
    allYears,
    allGenres,
    allRatings,
    getRandomMovie
  }
})
