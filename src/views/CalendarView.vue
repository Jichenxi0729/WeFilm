<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-10 px-4 pt-2 pb-2 shadow-sm">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">日历</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div class="p-3 space-y-3">
      <Calendar
        :movies="movieStore.movies"
        :initial-year="movieStore.calendarState.year"
        :initial-month="movieStore.calendarState.month"
        @select="onCalendarSelect"
        @month-change="onMonthChange"
      />

      <div v-if="movieStore.calendarState.selectedDate">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-700">{{ movieStore.calendarState.selectedDate }}</h3>
          <button @click="clearSelection" class="text-xs text-blue-500 hover:text-blue-600">
            清除
          </button>
        </div>
        <div class="space-y-2">
          <MovieCard
            v-for="movie in selectedDateMovies"
            :key="movie.id"
            :movie="movie"
            @click="goToDetail(movie.id)"
          />
          <p v-if="selectedDateMovies.length === 0" class="text-center py-6 text-gray-400 text-sm">
            暂无观看记录
          </p>
        </div>
      </div>

      <div v-else>
        <h3 class="text-sm font-medium text-gray-700 mb-2">本月统计</h3>
        <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div class="grid grid-cols-3 gap-2">
            <div class="text-center">
              <p class="text-xl font-bold text-blue-600">{{ monthStats.total }}</p>
              <p class="text-xs text-gray-500">本月观看</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-green-600">{{ monthStats.days }}</p>
              <p class="text-xs text-gray-500">观看天数</p>
            </div>
            <div class="text-center">
              <p class="text-xl font-bold text-purple-600">{{ monthStats.types.movie || 0 }}</p>
              <p class="text-xs text-gray-500">电影</p>
            </div>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-center">
            <div>
              <p class="text-base font-bold text-red-500">{{ monthStats.types.tv || 0 }}</p>
              <p class="text-xs text-gray-500">剧集</p>
            </div>
            <div>
              <p class="text-base font-bold text-blue-400">{{ monthStats.types.short || 0 }}</p>
              <p class="text-xs text-gray-500">短剧</p>
            </div>
          </div>
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
        @click="goToStats"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/stats') ? 'text-blue-500' : 'text-gray-400'"
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

      <button class="flex flex-col items-center gap-1 text-blue-500">
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import Calendar from '../components/Calendar.vue'
import MovieCard from '../components/MovieCard.vue'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()

const selectedDateMovies = computed(() => {
  if (!movieStore.calendarState.selectedDate) return []
  return movieStore.movies
    .filter(m => m.watchDate === movieStore.calendarState.selectedDate)
    .sort((a, b) => new Date(b.watchDate) - new Date(a.watchDate))
})

const monthStats = computed(() => {
  const year = movieStore.calendarState.year
  const month = movieStore.calendarState.month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const monthMovies = movieStore.movies.filter(m => {
    if (!m.watchDate) return false
    const watchDate = new Date(m.watchDate)
    return watchDate >= firstDay && watchDate <= lastDay
  })

  const watchDays = new Set(monthMovies.map(m => m.watchDate))

  const types = { movie: 0, tv: 0, short: 0 }
  monthMovies.forEach(m => {
    if (m.mediaType && types.hasOwnProperty(m.mediaType)) {
      types[m.mediaType]++
    }
  })

  return {
    total: monthMovies.length,
    days: watchDays.size,
    types
  }
})

const onCalendarSelect = (date) => {
  movieStore.setCalendarState('selectedDate', date)
}

const onMonthChange = ({ year, month }) => {
  movieStore.setCalendarState('year', year)
  movieStore.setCalendarState('month', month)
}

const clearSelection = () => {
  movieStore.setCalendarState('selectedDate', null)
}

const goBack = () => {
  router.back()
}

const isCurrentRoute = (path) => {
  return route.path === path
}

const goToHome = () => {
  router.push('/')
}

const goToStats = () => {
  router.push('/stats')
}

const goToAdd = () => {
  router.push('/add')
}

const goToMe = () => {
  router.push('/me')
}

const goToDetail = (id) => {
  router.push(`/detail/${id}`)
}
</script>
