<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white sticky top-0 z-10 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">{{ isEditing ? '编辑作品' : '添加作品' }}</h1>
        <button @click="saveMovie" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          保存
        </button>
      </div>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex gap-4">
          <div 
            class="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors"
            @click="triggerCoverUpload"
          >
            <img v-if="form.cover && !coverError" :src="form.cover" class="w-full h-full object-cover" @error="coverError = true" />
            <div v-else class="text-center text-gray-400">
              <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">封面</span>
            </div>
          </div>
          <input ref="coverInput" type="file" accept="image/*" class="hidden" @change="handleCoverChange" />
          
          <div class="flex-1 space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">作品名称 *</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="请输入作品名称"
                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">类型</label>
                <select
                  v-model="form.mediaType"
                  class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="movie">电影</option>
                  <option value="tv">剧集</option>
                  <option value="short">短剧</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">上映年份</label>
                <input
                  v-model="form.releaseYear"
                  type="number"
                  placeholder="2024"
                  class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-600 mb-1">封面图片URL</label>
          <input
            v-model="form.cover"
            type="text"
            placeholder="输入图片地址或上传本地图片"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="mt-3">
          <label class="block text-sm font-medium text-gray-600 mb-1">背景图片URL</label>
          <input
            v-model="form.backdrop"
            type="text"
            placeholder="输入背景图片地址"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <label class="block text-sm font-medium text-gray-600 mb-2">剧情概要</label>
        <textarea
          v-model="form.overview"
          rows="3"
          placeholder="请输入剧情概要"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
        ></textarea>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-600">演员</label>
          <button @click="addActor" class="text-sm text-blue-500 hover:text-blue-400">+ 添加</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <div 
            v-for="(actor, index) in form.actors" 
            :key="index"
            class="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
          >
            <input
              v-model="form.actors[index]"
              type="text"
              placeholder="演员名字"
              class="bg-transparent border-none outline-none w-20 text-sm text-gray-900"
            />
            <button @click="removeActor(index)" class="text-gray-400 hover:text-gray-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <span v-if="form.actors.length === 0" class="text-sm text-gray-400">暂无演员</span>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <label class="block text-sm font-medium text-gray-600 mb-2">影视类型（标签）</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="genre in availableGenres"
            :key="genre"
            @click="toggleGenre(genre)"
            class="px-3 py-1 rounded-full text-sm transition-colors"
            :class="form.genres.includes(genre) 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          >
            {{ genre }}
          </button>
        </div>
        <div class="mt-3 flex gap-2">
          <input
            v-model="newGenre"
            type="text"
            placeholder="自定义类型"
            class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            @keyup.enter="addCustomGenre"
          />
          <button @click="addCustomGenre" class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            添加
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-600 mb-1">观看时间</label>
            <input
              v-model="form.watchDate"
              type="date"
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-600 mb-1">个人评分</label>
            <div class="flex items-center gap-2">
              <input
                v-model="form.personalRating"
                type="range"
                min="0"
                max="10"
                step="0.5"
                class="flex-1"
              />
              <span class="text-sm font-medium text-gray-900 w-8">{{ form.personalRating || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm">
        <label class="block text-sm font-medium text-gray-600 mb-2">个人评论</label>
        <textarea
          v-model="form.personalReview"
          rows="4"
          placeholder="写下你的观后感..."
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500 resize-none"
        ></textarea>
      </div>

      <button
        v-if="isEditing"
        @click="confirmDelete"
        class="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
      >
        删除作品
      </button>
    </div>

    <div v-if="showTmdbInfo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showTmdbInfo = false">
      <div class="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">从TMDB填充</h3>
          <button @click="showTmdbInfo = false" class="p-1 hover:bg-gray-100 rounded">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4 space-y-3">
          <div v-if="tmdbLoading" class="text-center py-8">
            <div class="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">加载中...</p>
          </div>
          <div v-else-if="tmdbResults.length === 0" class="text-center py-8 text-gray-500">
            搜索以获取TMDB结果
          </div>
          <div 
            v-else
            v-for="result in tmdbResults"
            :key="result.id"
            class="flex gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            @click="selectTmdbResult(result)"
          >
            <img 
              v-if="result.poster_path"
              :src="'https://image.tmdb.org/t/p/w92' + result.poster_path" 
              class="w-16 h-24 object-cover rounded"
            />
            <div v-else class="w-16 h-24 bg-gray-200 rounded flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ result.title || result.name }}</h4>
              <p class="text-sm text-gray-500">{{ (result.release_date || result.first_air_date)?.split('-')[0] || '未知' }}</p>
              <p class="text-xs text-gray-600 mt-1 line-clamp-2">{{ result.overview }}</p>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200">
          <input
            v-model="tmdbQuery"
            type="text"
            placeholder="在TMDB上搜索..."
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            @keyup.enter="searchTmdb"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '../stores/movieStore'
import { useUiStore } from '../stores/uiStore'
import { searchMulti, transformTmdbResult, getMovieCredits, getTvCredits, getMovieDetails, getTvDetails, getBackdropUrl, mapTmdbGenres } from '../services/tmdb'

const router = useRouter()
const route = useRoute()
const movieStore = useMovieStore()
const uiStore = useUiStore()

const isEditing = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  cover: '',
  backdrop: '',
  overview: '',
  actors: [],
  releaseYear: '',
  watchDate: new Date().toISOString().split('T')[0],
  genres: [],
  personalRating: 0,
  personalReview: '',
  mediaType: 'movie'
})

const availableGenres = ['剧情', '喜剧', '动作', '爱情', '悬疑', '惊悚', '科幻', '动画', '恐怖', '犯罪', '战争', '纪录片', '家庭', '奇幻', '冒险', '音乐', '历史', '西部', '传记', '运动']
const newGenre = ref('')
const coverInput = ref(null)
const coverError = ref(false)
const showTmdbInfo = ref(false)
const tmdbQuery = ref('')
const tmdbResults = ref([])
const tmdbLoading = ref(false)

const goBack = () => {
  router.back()
}

const triggerCoverUpload = () => {
  coverInput.value?.click()
}

const handleCoverChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.cover = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const addActor = () => {
  form.actors.push('')
}

const removeActor = (index) => {
  form.actors.splice(index, 1)
}

const toggleGenre = (genre) => {
  const index = form.genres.indexOf(genre)
  if (index === -1) {
    form.genres.push(genre)
  } else {
    form.genres.splice(index, 1)
  }
}

const addCustomGenre = () => {
  if (newGenre.value && !form.genres.includes(newGenre.value)) {
    form.genres.push(newGenre.value)
    newGenre.value = ''
  }
}

const validateForm = () => {
  if (!form.title.trim()) {
    uiStore.showToast('请输入作品名称', 'warning')
    return false
  }
  return true
}

const saveMovie = () => {
  if (!validateForm()) return
  
  const movieData = {
    ...form,
    actors: form.actors.filter(a => a.trim())
  }
  
  if (isEditing.value) {
    movieStore.updateMovie(route.params.id, movieData)
    uiStore.showToast('更新成功', 'success')
  } else {
    movieStore.addMovie(movieData)
    uiStore.showToast('添加成功', 'success')
  }
  
  setTimeout(() => {
    router.back()
  }, 500)
}

const confirmDelete = () => {
  if (confirm('确定要删除这部作品吗？')) {
    movieStore.deleteMovie(route.params.id)
    uiStore.showToast('删除成功', 'success')
    setTimeout(() => {
      router.push('/')
    }, 500)
  }
}

const searchTmdb = async () => {
  if (!tmdbQuery.value.trim()) return
  
  tmdbLoading.value = true
  try {
    const results = await searchMulti(tmdbQuery.value)
    tmdbResults.value = results
  } catch (error) {
    uiStore.showToast('搜索失败，请稍后重试', 'error')
  } finally {
    tmdbLoading.value = false
  }
}

const selectTmdbResult = async (result) => {
  const transformed = transformTmdbResult(result)
  
  form.title = transformed.title
  form.cover = transformed.cover
  form.backdrop = transformed.backdrop
  form.overview = transformed.overview
  form.releaseYear = transformed.releaseYear
  form.genres = mapTmdbGenres(transformed.genres) || []
  form.mediaType = transformed.mediaType
  
  try {
    const isMovie = result.media_type === 'movie'
    
    const details = isMovie 
      ? await getMovieDetails(result.id)
      : await getTvDetails(result.id)
    
    // 只有当详情数据有背景图片时才更新
    if (details && details.backdrop_path) {
      form.backdrop = getBackdropUrl(details.backdrop_path)
    }
    
    const credits = isMovie 
      ? await getMovieCredits(result.id)
      : await getTvCredits(result.id)
    
    if (credits && credits.cast) {
      form.actors = credits.cast.slice(0, 10).map(actor => actor.name)
    }
  } catch (error) {
    console.error('Failed to fetch details:', error)
  }
  
  showTmdbInfo.value = false
}

onMounted(() => {
  if (isEditing.value) {
    const movie = movieStore.getMovieById(route.params.id)
    if (movie) {
      Object.assign(form, movie)
    }
  }
})
</script>
