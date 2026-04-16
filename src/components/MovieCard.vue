<template>
  <div 
    class="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click', movie)"
  >
    <div class="flex-shrink-0 w-[60px] h-[80px] rounded-lg overflow-hidden bg-gray-200">
      <img 
        v-if="movie.cover && !imageError" 
        :src="movie.cover" 
        :alt="movie.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      </div>
    </div>
    
    <div class="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <h3 class="font-medium text-gray-900 truncate">{{ movie.title }}</h3>
        <p v-if="movie.releaseYear" class="text-xs text-gray-400 mt-0.5">{{ movie.releaseYear }}</p>
        <p v-if="movie.overview" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ movie.overview }}</p>
      </div>
      
      <div class="flex items-center justify-between mt-2">
        <span v-if="movie.actors && movie.actors.length > 0" class="text-xs text-gray-500 truncate flex-1">
          {{ movie.actors.slice(0, 3).join(', ') }}
          <span v-if="movie.actors.length > 3">...</span>
        </span>
        <span v-if="movie.personalRating" class="text-xs text-yellow-500 font-medium ml-2">
          {{ movie.personalRating }}分
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

defineEmits(['click'])
</script>
