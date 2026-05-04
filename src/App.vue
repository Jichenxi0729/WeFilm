<script setup>
import { useMovieStore } from './stores/movieStore'

const movieStore = useMovieStore()
</script>

<template>
  <div class="max-w-[640px] mx-auto min-h-screen bg-gray-50">
    <!-- 加载状态遮罩 -->
    <Transition name="fade">
      <div 
        v-if="movieStore.loading" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-50"
      >
        <div class="flex flex-col items-center gap-3">
          <!-- 加载动画 -->
          <div class="relative w-12 h-12">
            <div class="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div class="absolute inset-2 border-4 border-blue-500 rounded-full animate-spin"></div>
          </div>
          <p class="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    </Transition>
    
    <!-- 主内容 -->
    <router-view />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
