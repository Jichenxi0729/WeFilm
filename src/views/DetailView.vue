<template>
  <div class="min-h-screen bg-gray-50 pb-24">
    <div v-if="movie" class="relative">
      <div class="relative h-80 overflow-hidden">
        <img 
          v-if="(movie.backdrop || movie.cover) && !backdropError" 
          :src="movie.backdrop || movie.cover" 
          :alt="movie.title"
          class="w-full h-full object-cover"
          @error="handleBackdropError"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <svg class="w-24 h-24 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <button @click="goBack" class="absolute top-4 left-4 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors z-10">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div class="px-4 -mt-8 relative">
        <div class="flex gap-4">
          <div class="w-36 h-52 rounded-xl overflow-hidden shadow-xl bg-gray-100 flex-shrink-0 -mt-16">
            <img 
              v-if="movie.cover && !coverError" 
              :src="movie.cover" 
              :alt="movie.title"
              class="w-full h-full object-cover"
              @error="handleCoverError"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 pt-10">
            <h1 class="text-xl font-bold text-gray-900">{{ movie.title }}</h1>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span v-if="movie.releaseYear">{{ movie.releaseYear }}</span>
              <span v-if="movie.mediaType" class="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                {{ mediaTypeLabel }}
              </span>
              <span v-if="movie.runtime" class="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">
                {{ movie.runtime }}分钟
              </span>
            </div>
            <div v-if="movie.personalRating" class="flex items-center gap-2 mt-2">
              <span class="text-yellow-400 text-lg">⭐</span>
              <span class="text-lg font-medium text-yellow-600">{{ movie.personalRating }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="movie" class="p-4 space-y-4">
      <div v-if="movie.genres && movie.genres.length > 0" class="bg-white rounded-xl p-4 shadow-sm">
        <h2 class="text-sm font-medium text-gray-600 mb-2">类型</h2>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="genre in movie.genres" 
            :key="genre"
            class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
          >
            {{ genre }}
          </span>
        </div>
      </div>

      <div v-if="movie.overview" class="bg-white rounded-xl p-4 shadow-sm">
        <h2 class="text-sm font-medium text-gray-600 mb-2">剧情概要</h2>
        <p class="text-gray-700 text-sm leading-relaxed">{{ movie.overview }}</p>
      </div>

      <div v-if="movie.actors && movie.actors.length > 0" class="bg-white rounded-xl p-4 shadow-sm">
        <h2 class="text-sm font-medium text-gray-600 mb-2">演员</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="actor in movie.actors"
            :key="actor"
            @click="goToActor(actor)"
            class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            {{ actor }}
          </button>
        </div>
      </div>

      <div v-if="movie.personalReview" class="bg-white rounded-xl p-4 shadow-sm">
        <h2 class="text-sm font-medium text-gray-600 mb-2">个人评论</h2>
        <p class="text-gray-700 text-sm leading-relaxed">{{ movie.personalReview }}</p>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">观看时间</span>
          <span class="text-gray-700">{{ formatDate(movie.watchDate) }}</span>
        </div>
      </div>

      <a
        v-if="movie.tmdbId"
        :href="tmdbUrl"
        target="_blank"
        class="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <img :src="'/tmdb-logo.svg?v=' + Date.now()" alt="TMDB" class="w-8 h-8 object-contain" />
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-700">在 TMDB 查看</p>
          <p class="text-xs text-gray-400">查看更多作品信息</p>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>

    <div v-else class="flex items-center justify-center h-screen">
      <div class="text-center">
        <p class="text-gray-500">作品不存在</p>
        <button @click="goBack" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">返回</button>
      </div>
    </div>

    <div v-if="movie" class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-3 flex gap-3">
      <button 
        @click="goToEdit"
        class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        编辑
      </button>
      <button 
        @click="confirmDelete"
        class="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        删除
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useUiStore } from '../stores/uiStore'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()
const uiStore = useUiStore()

const movie = computed(() => movieStore.getMovieById(route.params.id))

const tmdbUrl = computed(() => {
  if (!movie.value?.tmdbId) return ''
  const mediaType = movie.value.mediaType === 'movie' ? 'movie' : 'tv'
  return `https://www.themoviedb.org/${mediaType}/${movie.value.tmdbId}`
})

const backdropError = ref(false)
const coverError = ref(false)

const handleBackdropError = () => {
  backdropError.value = true
}

const handleCoverError = () => {
  coverError.value = true
}

const mediaTypeLabel = computed(() => {
  const labels = {
    movie: '电影',
    tv: '剧集',
    short: '短剧'
  }
  return labels[movie.value?.mediaType] || movie.value?.mediaType
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  router.push(`/edit/${route.params.id}`)
}

const goToActor = (actorName) => {
  router.push(`/actor/${encodeURIComponent(actorName)}`)
}

const confirmDelete = () => {
  if (confirm('确定要删除这部作品吗？')) {
    movieStore.deleteMovie(route.params.id)
    uiStore.showToast('删除成功', 'success')
    setTimeout(() => {
      router.push('/')
    }, 500)
  }
}


</script>
