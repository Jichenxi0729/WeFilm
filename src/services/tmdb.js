import axios from 'axios'

const TMDB_BASE_URL = 'https://api.tmdb.org/3'
const IMAGE_BASE_URL = 'https://images.tmdb.org/t/p'

const getApiKey = () => {
  const key = import.meta.env.VITE_TMDB_API_KEY || ''
  console.log('TMDB API Key loaded:', key ? 'Yes' : 'No')
  return key
}

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000
})

tmdbClient.interceptors.request.use(config => {
  const apiKey = getApiKey()
  if (apiKey) {
    config.params = {
      ...config.params,
      api_key: apiKey
    }
  }
  return config
})

export const getPosterUrl = (path, size = 'w185') => {
  if (!path) return ''
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export const getBackdropUrl = (path, size = 'w780') => {
  if (!path) return ''
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export const searchMulti = async (query) => {
  if (!query) return []
  try {
    const response = await tmdbClient.get('/search/multi', {
      params: { query, language: 'zh-CN' }
    })
    return response.data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 20)
  } catch (error) {
    console.error('TMDB search error:', error)
    throw error
  }
}

export const searchMovies = async (query) => {
  if (!query) return []
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: { query, language: 'zh-CN' }
    })
    return response.data.results.slice(0, 20)
  } catch (error) {
    console.error('TMDB movie search error:', error)
    throw error
  }
}

export const searchTvShows = async (query) => {
  if (!query) return []
  try {
    const response = await tmdbClient.get('/search/tv', {
      params: { query, language: 'zh-CN' }
    })
    return response.data.results.slice(0, 20)
  } catch (error) {
    console.error('TMDB TV search error:', error)
    throw error
  }
}

export const getMovieDetails = async (id) => {
  try {
    const response = await tmdbClient.get(`/movie/${id}`, {
      params: { language: 'zh-CN' }
    })
    return response.data
  } catch (error) {
    console.error('TMDB movie details error:', error)
    throw error
  }
}

export const getTvDetails = async (id) => {
  try {
    const response = await tmdbClient.get(`/tv/${id}`, {
      params: { language: 'zh-CN' }
    })
    return response.data
  } catch (error) {
    console.error('TMDB TV details error:', error)
    throw error
  }
}

export const getMovieCredits = async (id) => {
  try {
    const response = await tmdbClient.get(`/movie/${id}/credits`, {
      params: { language: 'zh-CN' }
    })
    return response.data
  } catch (error) {
    console.error('TMDB credits error:', error)
    throw error
  }
}

export const getTvCredits = async (id) => {
  try {
    const response = await tmdbClient.get(`/tv/${id}/credits`, {
      params: { language: 'zh-CN' }
    })
    return response.data
  } catch (error) {
    console.error('TMDB credits error:', error)
    throw error
  }
}

export const getPersonDetails = async (id) => {
  try {
    const response = await tmdbClient.get(`/person/${id}`, {
      params: { language: 'zh-CN' }
    })
    return response.data
  } catch (error) {
    console.error('TMDB person details error:', error)
    throw error
  }
}

export const transformTmdbResult = (result) => {
  const isMovie = result.media_type === 'movie'
  const year = isMovie ? result.release_date : result.first_air_date
  
  return {
    tmdbId: result.id,
    title: isMovie ? result.title : result.name,
    cover: getPosterUrl(result.poster_path, 'w342'),
    backdrop: getBackdropUrl(result.backdrop_path),
    overview: result.overview,
    releaseYear: year ? year.split('-')[0] : null,
    genres: [],
    mediaType: isMovie ? 'movie' : 'tv',
    voteAverage: result.vote_average,
    tmdbData: result
  }
}

export const mapTmdbGenres = (tmdbGenres) => {
  const genreMap = {
    'Action': '动作',
    'Adventure': '冒险',
    'Animation': '动画',
    'Comedy': '喜剧',
    'Crime': '犯罪',
    'Documentary': '纪录片',
    'Drama': '剧情',
    'Family': '家庭',
    'Fantasy': '奇幻',
    'History': '历史',
    'Horror': '恐怖',
    'Music': '音乐',
    'Mystery': '悬疑',
    'Romance': '爱情',
    'Science Fiction': '科幻',
    'TV Movie': '电视电影',
    'Thriller': '惊悚',
    'War': '战争',
    'Western': '西部'
  }
  
  return tmdbGenres?.map(g => genreMap[g.name] || g.name) || []
}
