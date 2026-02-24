<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <button
        @click="toggleYearFilter"
        class="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:bg-gray-200"
      >
        <span class="text-gray-600">{{ selectedYear ? selectedYear : '年份' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button
        @click="toggleGenreFilter"
        class="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:bg-gray-200"
      >
        <span class="text-gray-600">{{ selectedGenre ? selectedGenre : '类型' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button
        @click="toggleRatingFilter"
        class="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:bg-gray-200"
      >
        <span class="text-gray-600">{{ selectedRating ? selectedRating + '分' : '评分' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div v-if="showYearFilter" class="bg-white border border-gray-200 rounded-lg p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="selectYear('')"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedYear === '' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          全部
        </button>
        <button
          v-for="year in years"
          :key="year"
          @click="selectYear(year)"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedYear === year ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <div v-if="showGenreFilter" class="bg-white border border-gray-200 rounded-lg p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="selectGenre('')"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedGenre === '' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          全部
        </button>
        <button
          v-for="genre in genres"
          :key="genre"
          @click="selectGenre(genre)"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedGenre === genre ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ genre }}
        </button>
      </div>
    </div>

    <div v-if="showRatingFilter" class="bg-white border border-gray-200 rounded-lg p-3">
      <div v-if="ratings && ratings.length > 0" class="grid grid-cols-3 gap-2">
        <button
          @click="selectRating('')"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedRating === '' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          全部
        </button>
        <button
          v-for="rating in ratings"
          :key="rating"
          @click="selectRating(rating)"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedRating === rating ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ rating }}分
        </button>
      </div>
      <div v-else class="text-center py-4 text-gray-400 text-sm">
        暂无评分数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  years: {
    type: Array,
    default: () => []
  },
  genres: {
    type: Array,
    default: () => []
  },
  ratings: {
    type: Array,
    default: () => []
  },
  selectedYear: {
    type: String,
    default: ''
  },
  selectedGenre: {
    type: String,
    default: ''
  },
  selectedRating: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:selectedYear', 'update:selectedGenre', 'update:selectedRating'])

const showYearFilter = ref(false)
const showGenreFilter = ref(false)
const showRatingFilter = ref(false)

const toggleYearFilter = () => {
  showYearFilter.value = !showYearFilter.value
  showGenreFilter.value = false
  showRatingFilter.value = false
}

const toggleGenreFilter = () => {
  showGenreFilter.value = !showGenreFilter.value
  showYearFilter.value = false
  showRatingFilter.value = false
}

const toggleRatingFilter = () => {
  showRatingFilter.value = !showRatingFilter.value
  showYearFilter.value = false
  showGenreFilter.value = false
}

const selectYear = (year) => {
  emit('update:selectedYear', year)
  showYearFilter.value = false
}

const selectGenre = (genre) => {
  emit('update:selectedGenre', genre)
  showGenreFilter.value = false
}

const selectRating = (rating) => {
  emit('update:selectedRating', rating)
  showRatingFilter.value = false
}
</script>
