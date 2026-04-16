<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <button
        @click="toggleMediaTypeFilter"
        class="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:bg-gray-200"
      >
        <span class="text-gray-600">{{ selectedMediaType ? mediaTypeLabels[selectedMediaType] : '类型' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
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
        @click="toggleRatingFilter"
        class="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:bg-gray-200"
      >
        <span class="text-gray-600">{{ selectedRating ? selectedRating + '分' : '评分' }}</span>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div v-if="showMediaTypeFilter" class="bg-white border border-gray-200 rounded-lg p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          @click="selectMediaType('')"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedMediaType === '' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          全部
        </button>
        <button
          v-for="(label, value) in mediaTypeLabels"
          :key="value"
          @click="selectMediaType(value)"
          class="px-3 py-2 rounded-lg text-sm text-center transition-colors"
          :class="selectedMediaType === value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ label }}
        </button>
      </div>
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
  ratings: {
    type: Array,
    default: () => []
  },
  selectedMediaType: {
    type: String,
    default: ''
  },
  selectedYear: {
    type: String,
    default: ''
  },
  selectedRating: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:selectedMediaType', 'update:selectedYear', 'update:selectedRating'])

const mediaTypeLabels = {
  movie: '电影',
  tv: '剧集',
  short: '短剧'
}

const showMediaTypeFilter = ref(false)
const showYearFilter = ref(false)
const showRatingFilter = ref(false)

const toggleMediaTypeFilter = () => {
  showMediaTypeFilter.value = !showMediaTypeFilter.value
  showYearFilter.value = false
  showRatingFilter.value = false
}

const toggleYearFilter = () => {
  showYearFilter.value = !showYearFilter.value
  showMediaTypeFilter.value = false
  showRatingFilter.value = false
}

const toggleRatingFilter = () => {
  showRatingFilter.value = !showRatingFilter.value
  showMediaTypeFilter.value = false
  showYearFilter.value = false
}

const selectMediaType = (mediaType) => {
  emit('update:selectedMediaType', mediaType)
  showMediaTypeFilter.value = false
}

const selectYear = (year) => {
  emit('update:selectedYear', year)
  showYearFilter.value = false
}

const selectRating = (rating) => {
  emit('update:selectedRating', rating)
  showRatingFilter.value = false
}
</script>
