<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-10 px-4 pt-4 pb-3 shadow-sm">
      <div class="flex items-center gap-3 mb-3">
        <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">TMDB搜索</h1>
      </div>
      
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索电影或剧集..."
            class="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            @keyup.enter="search"
          />
        </div>
        <button
          @click="search"
          class="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          搜索
        </button>
      </div>
    </div>

    <div class="p-4">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="flex gap-3 p-3 bg-white rounded-xl animate-pulse">
          <div class="w-16 h-24 bg-gray-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>

      <div v-else-if="results.length > 0" class="space-y-3">
        <div 
          v-for="result in results"
          :key="result.id"
          class="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          @click="selectResult(result)"
        >
          <div class="w-16 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <img 
              v-if="result.poster_path"
              :src="'https://image.tmdb.org/t/p/w92' + result.poster_path" 
              :alt="result.title || result.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 truncate">{{ result.title || result.name }}</h3>
            <p class="text-sm text-gray-500 mt-0.5">
              {{ (result.release_date || result.first_air_date)?.split('-')[0] || '未知' }}
              <span v-if="result.media_type === 'movie'" class="ml-2">电影</span>
              <span v-else class="ml-2">剧集</span>
            </p>
            <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ result.overview }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p class="text-gray-500">输入关键词搜索TMDB</p>
      </div>
    </div>

    <div v-if="showAddForm" class="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div class="min-h-screen p-4 flex items-start justify-center">
        <div class="bg-white rounded-2xl w-full max-w-lg mt-8">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-semibold">添加到我的记录</h3>
            <button @click="showAddForm = false" class="p-1 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-4 space-y-4">
            <div class="flex gap-4">
              <div class="w-24 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img 
                  v-if="selectedMovie.cover" 
                  :src="selectedMovie.cover" 
                  :alt="selectedMovie.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 space-y-3">
                <div>
                  <label class="block text-xs text-gray-500 mb-1">作品名称</label>
                  <input
                    v-model="form.title"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1">类型</label>
                    <select
                      v-model="form.mediaType"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="movie">电影</option>
                      <option value="tv">剧集</option>
                    </select>
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 mb-1">上映年份</label>
                    <input
                      v-model="form.releaseYear"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">剧情概要</label>
              <textarea
                v-model="form.overview"
                rows="2"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">演员</label>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="(actor, index) in form.actors" 
                  :key="index"
                  class="px-2 py-1 bg-gray-100 rounded-full text-xs"
                >
                  {{ actor }}
                </span>
                <span v-if="form.actors.length === 0" class="text-xs text-gray-400">无</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">类型标签</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="genre in form.genres"
                  :key="genre"
                  class="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                >
                  {{ genre }}
                </button>
                <span v-if="form.genres.length === 0" class="text-xs text-gray-400">无</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">个人评分</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="form.personalRating"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  class="flex-1"
                />
                <span class="text-sm font-medium w-8">{{ form.personalRating || 0 }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 mb-1">个人评论</label>
              <textarea
                v-model="form.personalReview"
                rows="2"
                placeholder="写下你的观后感..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
              ></textarea>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 flex gap-3">
            <button 
              @click="showAddForm = false"
              class="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button 
              @click="addToCollection"
              class="flex-1 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useUiStore } from '../stores/uiStore'
import { searchMulti, transformTmdbResult, getMovieCredits, getTvCredits, mapTmdbGenres } from '../services/tmdb'

const router = useRouter()
const movieStore = useMovieStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const showAddForm = ref(false)
const selectedMovie = reactive({})

const form = reactive({
  title: '',
  cover: '',
  overview: '',
  actors: [],
  releaseYear: '',
  genres: [],
  personalRating: 0,
  personalReview: '',
  mediaType: 'movie'
})

const goBack = () => {
  router.back()
}

const search = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  try {
    const data = await searchMulti(searchQuery.value)
    results.value = data
  } catch (error) {
    uiStore.showToast('搜索失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

const selectResult = async (result) => {
  const transformed = transformTmdbResult(result)
  
  selectedMovie.title = transformed.title
  selectedMovie.cover = transformed.cover
  
  form.title = transformed.title || ''
  form.cover = transformed.cover || ''
  form.overview = transformed.overview || ''
  form.releaseYear = transformed.releaseYear?.toString() || ''
  form.genres = mapTmdbGenres(transformed.genres) || []
  form.mediaType = transformed.mediaType === 'movie' ? 'movie' : 'tv'
  form.actors = []
  form.personalRating = 0
  form.personalReview = ''

  try {
    const credits = result.media_type === 'movie' 
      ? await getMovieCredits(result.id)
      : await getTvCredits(result.id)
    
    if (credits && credits.cast) {
      form.actors = credits.cast.slice(0, 10).map(actor => actor.name)
    }
  } catch (error) {
    console.error('Failed to fetch credits:', error)
  }
  
  showAddForm.value = true
}

const addToCollection = () => {
  if (!form.title.trim()) {
    uiStore.showToast('请输入作品名称', 'warning')
    return
  }
  
  movieStore.addMovie({
    ...form,
    watchDate: new Date().toISOString().split('T')[0]
  })
  
  uiStore.showToast('添加成功', 'success')
  showAddForm.value = false
  setTimeout(() => {
    router.push('/')
  }, 500)
}
</script>
