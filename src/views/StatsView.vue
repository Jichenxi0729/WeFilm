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
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div class="flex gap-2">
          <button
            @click="toggleChart('showTypePie')"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
            :class="showTypePie ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span class="text-sm">类型分布</span>
          </button>
          <button
            @click="toggleChart('showRatingDist')"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
            :class="showRatingDist ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span class="text-sm">评分分布</span>
          </button>
          <button
            @click="toggleChart('showMonthlyLine')"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors"
            :class="showMonthlyLine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
            </svg>
            <span class="text-sm">月观看趋势</span>
          </button>
        </div>

        <template v-if="showTypePie">
          <div class="bg-gray-50 rounded-lg p-3">
            <h3 class="text-sm font-medium text-gray-700 mb-3">作品类型分布</h3>
            <StatsChart
              type="doughnut"
              :data="typePieData"
              :height="240"
            />
          </div>
        </template>

        <template v-if="showRatingDist">
          <div class="bg-gray-50 rounded-lg p-3">
            <h3 class="text-sm font-medium text-gray-700 mb-3">评分分布</h3>
            <StatsChart
              type="bar"
              :data="ratingDistData"
              :height="220"
              :options="barOptions"
            />
          </div>
        </template>

        <template v-if="showMonthlyLine">
          <div class="bg-gray-50 rounded-lg p-3">
            <h3 class="text-sm font-medium text-gray-700 mb-3">月观看趋势</h3>
            <StatsChart
              type="line"
              :data="monthlyLineData"
              :height="220"
              :options="lineOptions"
            />
          </div>
        </template>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">观看总数</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.totalCount }}</h3>
            </div>
            <div class="bg-blue-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">本月已看</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.currentMonthCount }}</h3>
            </div>
            <div class="bg-green-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">平均评分</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.averageRating }}</h3>
            </div>
            <div class="bg-yellow-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">电影数量</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.movieCountByType.movie }}</h3>
            </div>
            <div class="bg-purple-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">剧集数量</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.movieCountByType.tv }}</h3>
            </div>
            <div class="bg-red-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">短剧数量</p>
              <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ movieStore.movieCountByType.short }}</h3>
            </div>
            <div class="bg-indigo-100 rounded-lg p-2">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
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
import StatsChart from '../components/StatsChart.vue'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()

const selectedMediaType = ref(movieStore.filterState.mediaType)
const selectedYear = ref(movieStore.filterState.year)
const selectedRating = ref(movieStore.filterState.rating)

// 图表显示状态
const showTypePie = ref(JSON.parse(localStorage.getItem('showTypePie')) || false)
const showRatingDist = ref(JSON.parse(localStorage.getItem('showRatingDist')) || false)
const showMonthlyLine = ref(JSON.parse(localStorage.getItem('showMonthlyLine')) || false)

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

const typePieData = computed(() => ({
  labels: ['电影', '剧集', '短剧'],
  datasets: [{
    data: [
      movieStore.movieCountByType.movie,
      movieStore.movieCountByType.tv,
      movieStore.movieCountByType.short
    ],
    backgroundColor: [
      '#8b5cf6',
      '#ef4444',
      '#3b82f6'
    ],
    borderWidth: 0,
    hoverOffset: 8
  }]
}))

const ratingDistData = computed(() => {
  // 初始化从0.5到10的评分计数
  const ratingCounts = {}
  for (let r = 0.5; r <= 10; r += 0.5) {
    ratingCounts[r] = 0
  }

  filteredMovies.value.forEach(m => {
    let rating = m.personalRating
    // 处理各种类型的评分值
    if (rating !== undefined && rating !== null && rating !== '') {
      rating = Number(rating)
      if (!isNaN(rating) && rating >= 0.5 && rating <= 10) {
        // 将评分四舍五入到最近的0.5
        const roundedRating = Math.round(rating * 2) / 2
        if (roundedRating in ratingCounts) {
          ratingCounts[roundedRating]++
        }
      }
    }
  })

  // 只保留有数据的评分
  const validRatings = Object.entries(ratingCounts)
    .filter(([_, count]) => count > 0)
    .sort(([a], [b]) => Number(a) - Number(b))

  // 生成颜色数组
  const colors = [
    '#fca5a5', '#f87171', '#fb923c', '#fbbf24', '#facc15',
    '#d4f566', '#a3e635', '#4ade80', '#34d399', '#2dd4bf',
    '#22d3ee', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#dc2626'
  ]

  return {
    labels: validRatings.map(([rating]) => `${rating}分`),
    datasets: [{
      label: '作品数量',
      data: validRatings.map(([_, count]) => count),
      backgroundColor: validRatings.map((_, index) => colors[index % colors.length]),
      borderRadius: 6,
      borderSkipped: false
    }]
  }
})

const monthlyLineData = computed(() => {
  const monthlyData = {}
  const now = new Date()

  // 生成最近12个月的月份键
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[key] = 0
  }

  // 统计每个月的观看数量
  filteredMovies.value.forEach(m => {
    if (m.watchDate) {
      try {
        const watchDate = new Date(m.watchDate)
        // 确保日期有效
        if (!isNaN(watchDate.getTime())) {
          const key = `${watchDate.getFullYear()}-${String(watchDate.getMonth() + 1).padStart(2, '0')}`
          if (key in monthlyData) {
            monthlyData[key]++
          }
        }
      } catch (e) {
        console.error('日期解析错误:', m.watchDate, e)
      }
    }
  })

  // 生成标签，包含年份信息以便区分不同年份的相同月份
  const labels = Object.keys(monthlyData).map(key => {
    const [year, month] = key.split('-')
    return `${month}月`
  })

  return {
    labels,
    datasets: [{
      label: '观看数量',
      data: Object.values(monthlyData),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  }
})



const barOptions = {
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      },
      grid: {
        color: '#f3f4f6'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

const lineOptions = {
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      },
      grid: {
        color: '#f3f4f6'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}



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

const toggleChart = (chartKey) => {
  if (chartKey === 'showTypePie') {
    showTypePie.value = !showTypePie.value
    localStorage.setItem('showTypePie', showTypePie.value)
  } else if (chartKey === 'showRatingDist') {
    showRatingDist.value = !showRatingDist.value
    localStorage.setItem('showRatingDist', showRatingDist.value)
  } else if (chartKey === 'showMonthlyLine') {
    showMonthlyLine.value = !showMonthlyLine.value
    localStorage.setItem('showMonthlyLine', showMonthlyLine.value)
  }
}
</script>