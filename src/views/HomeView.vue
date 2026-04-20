<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="sticky top-0 z-10 px-4 pt-4 pb-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <SearchBar
        v-model="searchKeyword"
        placeholder="搜索本地作品..."
        :show-tmdb-button="true"
        @search="handleSearch"
        @tmdb-click="goToTmdbSearch"
      />
      
      <div class="mt-3">
        <CategoryTabs v-model="activeTab" />
      </div>
    </div>

    <div class="p-2">
      <div :class="['grid gap-2', uiStore.gridColumns === 2 ? 'grid-cols-2' : 'grid-cols-3']">
        <div 
          v-for="movie in filteredMovies" 
          :key="movie.id"
          @click="goToDetail(movie.id)"
          class="cursor-pointer"
        >
          <div class="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-100">
            <img 
              v-if="movie.cover && !imageErrors[movie.id]" 
              :src="movie.cover" 
              :alt="movie.title"
              class="w-full h-full object-cover"
              @error="handleImageError(movie.id)"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div v-if="!uiStore.pureCoverMode" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-2">
              <p class="text-white text-xs font-medium truncate">{{ movie.title }}</p>
              <p v-if="movie.personalRating" class="text-yellow-400 text-xs mt-0.5">
                ⭐ {{ movie.personalRating }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredMovies.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p class="text-gray-500 mb-4">暂无作品</p>
        <button 
          @click="goToAdd"
          class="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          添加第一部作品
        </button>
      </div>
    </div>

    <button
      v-if="movieStore.movies.length > 0"
      @click="goToRandom"
      class="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
    >
      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>

    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-3 flex justify-around items-center z-10">
      <button 
        @click="goToHome"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs text-gray-700">首页</span>
      </button>
      
      <button 
        @click="goToStats"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/stats') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs text-gray-700">统计</span>
      </button>
      
      <button 
        @click="goToAdd"
        class="w-14 h-14 -mt-6 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      <button 
        @click="goToCalendar"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/calendar') ? 'text-blue-500' : 'text-gray-400'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs text-gray-700">日历</span>
      </button>
      
      <button 
        @click="goToMe"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/me') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs text-gray-700">我的</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useUiStore } from '../stores/uiStore'
import SearchBar from '../components/SearchBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()
const uiStore = useUiStore()

const searchKeyword = ref('')
const activeTab = computed({
  get: () => uiStore.activeTab,
  set: (value) => { uiStore.activeTab = value }
})

const imageErrors = ref({})

const handleImageError = (movieId) => {
  imageErrors.value[movieId] = true
}

const isCurrentRoute = (path) => {
  return route.path === path
}

const filteredMovies = computed(() => {
  let movies = movieStore.sortedByWatchDate
  
  if (activeTab.value !== 'all') {
    movies = movies.filter(m => m.mediaType === activeTab.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    movies = movies.filter(m => 
      m.title.toLowerCase().includes(keyword) ||
      m.overview?.toLowerCase().includes(keyword) ||
      m.actors?.some(a => a.toLowerCase().includes(keyword))
    )
  }
  
  return movies
})

const handleSearch = (keyword) => {
  searchKeyword.value = keyword
}

const goToDetail = (id) => {
  router.push(`/detail/${id}`)
}

const goToAdd = () => {
  router.push('/add')
}

const goToStats = () => {
  router.push('/stats')
}

const goToCalendar = () => {
  router.push('/calendar')
}

const goToTmdbSearch = () => {
  router.push('/tmdb-search')
}

const goToMe = () => {
  router.push('/me')
}

const goToHome = () => {
  router.push('/')
}

const goToRandom = () => {
  const randomMovie = movieStore.getRandomMovie()
  if (randomMovie) {
    router.push(`/detail/${randomMovie.id}`)
  } else {
    uiStore.showToast('暂无作品', 'warning')
  }
}
</script>
