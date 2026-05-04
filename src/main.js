import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/authStore'
import { useMovieStore } from './stores/movieStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化认证状态
const initApp = async () => {
  const authStore = useAuthStore()
  await authStore.initAuth()
  
  // 认证初始化完成后加载数据
  const movieStore = useMovieStore()
  await movieStore.loadData()
}

// 先挂载应用，再初始化数据
app.mount('#app')

// 在应用挂载后初始化认证和数据
initApp()
