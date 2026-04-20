<template>
  <div class="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
    <div class="flex items-center justify-between mb-2">
      <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded">
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h3 class="text-sm font-medium text-gray-700">{{ year }}年{{ month + 1 }}月</h3>
      <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded">
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-7 gap-0.5 text-center">
      <div v-for="day in weekDays" :key="day" class="text-xs text-gray-400 py-1">
        {{ day }}
      </div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="aspect-square flex flex-col items-center justify-center rounded text-sm relative cursor-pointer transition-colors"
        :class="getDayClass(day)"
        @click="day.date && selectDate(day.date)"
      >
        <span v-if="day.date" :class="day.isToday ? 'font-bold text-blue-600 text-xs' : 'text-gray-600 text-xs'">
          {{ day.day }}
        </span>
        <span
          v-if="day.date && day.count > 0"
          class="absolute bottom-0.5 w-1 h-1 rounded-full"
          :class="day.isToday ? 'bg-blue-600' : 'bg-green-500'"
        ></span>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-center gap-3 text-xs text-gray-400">
      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
        <span>有观看</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        <span>今天</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  movies: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())
const selectedDate = ref(null)

const year = computed(() => currentYear.value)
const month = computed(() => currentMonth.value)

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startWeekDay = firstDay.getDay()
  const totalDays = lastDay.getDate()

  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  for (let i = startWeekDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, date: null, count: 0, isPrevMonth: true })
  }

  const watchDates = new Map()
  props.movies.forEach(movie => {
    if (movie.watchDate) {
      const count = watchDates.get(movie.watchDate) || 0
      watchDates.set(movie.watchDate, count + 1)
    }
  })

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = currentYear.value === today.getFullYear() &&
                    currentMonth.value === today.getMonth() &&
                    d === today.getDate()
    days.push({
      day: d,
      date: dateStr,
      count: watchDates.get(dateStr) || 0,
      isToday
    })
  }

  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, date: null, count: 0, isNextMonth: true })
  }

  return days
})

const getDayClass = (day) => {
  if (!day.date) return 'text-gray-300 cursor-default'
  if (day.isToday) return 'bg-blue-50 text-blue-600'
  if (selectedDate.value === day.date) return 'bg-green-50'
  if (day.count > 0) return 'bg-green-50 hover:bg-green-100'
  return 'hover:bg-gray-50'
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (date) => {
  if (selectedDate.value === date) {
    selectedDate.value = null
  } else {
    selectedDate.value = date
  }
  emit('select', selectedDate.value)
}

watch([currentYear, currentMonth], () => {
  selectedDate.value = null
  emit('select', null)
})
</script>
