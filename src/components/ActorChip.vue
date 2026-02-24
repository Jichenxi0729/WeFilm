<template>
  <div 
    class="flex gap-2 py-1 px-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
    @click="$emit('click', name)"
  >
    <span>{{ name }}</span>
    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>
