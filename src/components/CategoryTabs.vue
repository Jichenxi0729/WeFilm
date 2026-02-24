<template>
  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)"
      class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
      :class="modelValue === tab.value 
        ? 'bg-blue-500 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  tabs: {
    type: Array,
    default: () => [
      { label: '全部', value: 'all' },
      { label: '电影', value: 'movie' },
      { label: '剧集', value: 'tv' },
      { label: '短剧', value: 'short' }
    ]
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
