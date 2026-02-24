<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 truncate flex-1 text-center">{{ actorName }}</h1>
        <div class="w-10"></div>
      </div>
    </div>

    <div v-if="actor" class="p-4">
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <img 
              v-if="actor.avatar" 
              :src="actor.avatar" 
              :alt="actor.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ actor.name }}</h2>
            <p class="text-sm text-gray-500 mt-1">出演作品: {{ actor.movies.length }}部</p>
          </div>
        </div>
      </div>

      <h3 class="text-sm font-medium text-gray-500 mt-6 mb-3">出演作品</h3>
      
      <div class="space-y-3">
        <MovieCard
          v-for="movie in actor.movies"
          :key="movie.id"
          :movie="movie"
          @click="goToDetail(movie.id)"
        />
        
        <div v-if="actor.movies.length === 0" class="text-center py-12 text-gray-500">
          暂无作品
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-64">
      <p class="text-gray-500">演员不存在</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useActorStore } from '../stores/actorStore'
import MovieCard from '../components/MovieCard.vue'

const router = useRouter()
const route = useRoute()
const actorStore = useActorStore()

const actorName = computed(() => decodeURIComponent(route.params.name))

const actor = computed(() => actorStore.getActorByName(actorName.value))

const goBack = () => {
  router.back()
}

const goToDetail = (id) => {
  router.push(`/detail/${id}`)
}
</script>
