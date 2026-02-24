<template>
  <div v-if="uiStore.toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-50">
    <div 
      class="px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium"
      :class="bgClass"
    >
      {{ uiStore.toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/uiStore'

const uiStore = useUiStore()

const bgClass = computed(() => {
  const classes = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }
  return classes[uiStore.toastType] || classes.info
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
