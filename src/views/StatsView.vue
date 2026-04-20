<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-10 px-4 pt-2 pb-2 shadow-sm">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">统计</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <StatCard 
          label="观看总数" 
          :value="movieStore.totalCount" 
          variant="blue"
        >
          <template #icon>
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </template>
        </StatCard>
        
        <StatCard 
          label="本月已看" 
          :value="movieStore.currentMonthCount" 
          variant="green"
        >
          <template #icon>
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </template>
        </StatCard>
        
        <StatCard 
          label="平均评分" 
          :value="movieStore.averageRating" 
          variant="yellow"
        >
          <template #icon>
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </template>
        </StatCard>
        
        <StatCard 
          label="电影数量" 
          :value="movieStore.movieCountByType.movie" 
          variant="purple"
        >
          <template #icon>
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <StatCard 
          label="剧集数量" 
          :value="movieStore.movieCountByType.tv" 
          variant="red"
        >
          <template #icon>
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </template>
        </StatCard>
        
        <StatCard 
          label="短剧数量" 
          :value="movieStore.movieCountByType.short" 
          variant="blue"
        >
          <template #icon>
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </template>
        </StatCard>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-700">筛选</h3>
          <button
            v-if="selectedMediaType || selectedYear || selectedRating"
            @click="clearFilters"
            class="text-xs text-blue-500 hover:text-blue-600"
          >
            清除筛选
          </button>
        </div>
        <FilterBar
          :years="movieStore.allYears"
          :ratings="movieStore.allRatings"
          v-model:selectedMediaType="selectedMediaType"
          v-model:selectedYear="selectedYear"
          v-model:selectedRating="selectedRating"
        />
      </div>

      <h3 class="text-sm font-medium text-gray-500 mt-4">筛选结果</h3>
      
      <div class="space-y-3">
        <MovieCard
          v-for="movie in filteredMovies"
          :key="movie.id"
          :movie="movie"
          @click="goToDetail(movie.id)"
        />
        
        <div v-if="filteredMovies.length === 0" class="text-center py-12 text-gray-500">
          没有符合条件的作品
        </div>
      </div>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-10">
      <button 
        @click="goToHome"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/') ? 'text-blue-500' : 'text-gray-400'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs">首页</span>
      </button>
      
      <button 
        class="flex flex-col items-center gap-1 text-blue-500"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs">统计</span>
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
        <span class="text-xs">日历</span>
      </button>
      
      <button 
        @click="goToMe"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/me') ? 'text-blue-500' : 'text-gray-400'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs">我的</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import StatCard from '../components/StatCard.vue'
import FilterBar from '../components/FilterBar.vue'
import MovieCard from '../components/MovieCard.vue'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()

const selectedMediaType = ref(movieStore.filterState.mediaType)
const selectedYear = ref(movieStore.filterState.year)
const selectedRating = ref(movieStore.filterState.rating)

const updateFilter = (type, value) => {
  if (type === 'mediaType') {
    selectedMediaType.value = value
    movieStore.setFilterState('mediaType', value)
  } else if (type === 'year') {
    selectedYear.value = value
    movieStore.setFilterState('year', value)
  } else if (type === 'rating') {
    selectedRating.value = value
    movieStore.setFilterState('rating', value)
  }
}

watch(selectedMediaType, (val) => movieStore.setFilterState('mediaType', val))
watch(selectedYear, (val) => movieStore.setFilterState('year', val))
watch(selectedRating, (val) => movieStore.setFilterState('rating', val))

const clearFilters = () => {
  selectedMediaType.value = ''
  selectedYear.value = ''
  selectedRating.value = ''
  movieStore.clearFilterState()
}

const isCurrentRoute = (path) => {
  return route.path === path
}

const filteredMovies = computed(() => {
  let movies = movieStore.movies

  if (selectedMediaType.value) {
    movies = movies.filter(m => m.mediaType === selectedMediaType.value)
  }

  if (selectedYear.value) {
    const selectedYearNum = Number(selectedYear.value)
    movies = movies.filter(m => Number(m.releaseYear) === selectedYearNum)
  }

  if (selectedRating.value) {
    const selectedRatingNum = Number(selectedRating.value)
    movies = movies.filter(m => Number(m.personalRating) === selectedRatingNum)
  }

  return movies.sort((a, b) => new Date(b.watchDate) - new Date(a.watchDate))
})

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/')
}

const goToAdd = () => {
  router.push('/add')
}

const goToCalendar = () => {
  router.push('/calendar')
}

const goToMe = () => {
  router.push('/me')
}

const goToDetail = (id) => {
  router.push(`/detail/${id}`)
}
</script>
