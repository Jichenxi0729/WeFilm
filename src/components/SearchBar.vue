<template>
  <div class="relative">
    <div class="flex gap-2">
      <div class="flex-1 relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchText"
          type="text"
          :placeholder="placeholder"
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          @input="handleInput"
          @keyup.enter="handleSearch"
        />
      </div>
      <button
        v-if="showTmdbButton"
        @click="$emit('tmdb-click')"
        class="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>TMDB</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '搜索...'
  },
  showTmdbButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'tmdb-click'])

const searchText = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  searchText.value = val
})

const debouncedEmit = useDebounceFn((value) => {
  emit('update:modelValue', value)
  emit('search', value)
}, 300)

const handleInput = () => {
  debouncedEmit(searchText.value)
}

const handleSearch = () => {
  emit('update:modelValue', searchText.value)
  emit('search', searchText.value)
}
</script>
