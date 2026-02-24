<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
      <button @click="goBack" class="p-2 -ml-2 hover:bg-gray-100 rounded-lg">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-lg font-bold text-gray-900">我的</h1>
      <div class="w-10"></div>
    </div>

    <div class="p-4 space-y-4">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 class="text-sm font-medium text-gray-700 mb-3">WebDAV云备份</h2>
        
        <div v-if="!showWebdavConfig" class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">WebDAV状态</p>
              <p class="text-xs" :class="webdavStore.isConfigured ? 'text-green-500' : 'text-gray-400'">
                {{ webdavStore.isConfigured ? '已配置' : '未配置' }}
              </p>
            </div>
            <button
              @click="showWebdavConfig = true"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              {{ webdavStore.isConfigured ? '修改配置' : '配置' }}
            </button>
          </div>

          <div v-if="webdavStore.isConfigured" class="space-y-3 pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">立即备份</p>
                <p class="text-xs text-gray-400">上传当前数据到WebDAV</p>
              </div>
              <button
                @click="backupToWebdav"
                :disabled="isBackingUp || movieStore.movies.length === 0"
                class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isBackingUp ? '备份中...' : '备份' }}
              </button>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">自动备份</p>
                <p class="text-xs text-gray-400">每次数据变化时自动备份</p>
              </div>
              <button
                @click="toggleAutoBackup"
                class="px-4 py-2 rounded-lg text-sm transition-colors"
                :class="webdavStore.config.autoBackup ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
              >
                {{ webdavStore.config.autoBackup ? '已开启' : '已关闭' }}
              </button>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="backupToWebdav"
                :disabled="isBackingUp"
                class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ isBackingUp ? '备份中...' : '更新备份' }}
              </button>
              <button
                @click="createVersionedBackup"
                :disabled="isBackingUp"
                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ isBackingUp ? '备份中...' : '创建版本' }}
              </button>
            </div>
            
            <div class="flex gap-2 pt-2">
              <button
                @click="syncFromWebdav"
                :disabled="isSyncing"
                class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {{ isSyncing ? '同步中...' : '从云端同步' }}
              </button>
            </div>

            <div v-if="webdavStore.config.lastBackup" class="text-xs text-gray-400 pt-2">
              上次备份: {{ formatDate(webdavStore.config.lastBackup) }}
            </div>
          </div>
        </div>

        <div v-else class="space-y-3">
          <div>
            <label class="text-xs text-gray-500">WebDAV地址</label>
            <input
              v-model="webdavUrl"
              type="url"
              placeholder="https://dav.jianguoyun.com/dav/我的备份"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">用户名</label>
            <input
              v-model="webdavUsername"
              type="text"
              placeholder="你的坚果云账号"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">密码</label>
            <input
              v-model="webdavPassword"
              type="password"
              placeholder="你的坚果云密码或应用密码"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
            />
          </div>
          <div class="flex gap-2 pt-2">
            <button
              @click="saveWebdavConfig"
              :disabled="isTesting"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {{ isTesting ? '测试中...' : '保存并测试' }}
            </button>
            <button
              @click="showWebdavConfig = false"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 class="text-sm font-medium text-gray-700 mb-3">显示设置</h2>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">首页作品列数</span>
          <div class="flex gap-2">
            <button
              @click="setGridColumns(2)"
              class="px-4 py-2 rounded-lg text-sm transition-colors"
              :class="gridColumns === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              2列
            </button>
            <button
              @click="setGridColumns(3)"
              class="px-4 py-2 rounded-lg text-sm transition-colors"
              :class="gridColumns === 3 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              3列
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 class="text-sm font-medium text-gray-700 mb-3">数据管理</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">导出数据</p>
              <p class="text-xs text-gray-400">将所有作品导出为CSV文件</p>
            </div>
            <button
              @click="exportData"
              :disabled="movieStore.movies.length === 0"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导出
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">导入数据</p>
              <p class="text-xs text-gray-400">从CSV文件导入作品</p>
            </div>
            <label
              class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 cursor-pointer"
            >
              导入
              <input type="file" accept=".csv" @change="importData" class="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h2 class="text-sm font-medium text-gray-700 mb-3">数据统计</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-500">{{ movieStore.totalCount }}</p>
            <p class="text-xs text-gray-500">作品总数</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <p class="text-2xl font-bold text-yellow-500">{{ movieStore.averageRating }}</p>
            <p class="text-xs text-gray-500">平均评分</p>
          </div>
        </div>
      </div>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-3 flex justify-around items-center z-10">
      <button 
        @click="goToHome"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs text-gray-700">首页</span>
      </button>
      
      <button 
        @click="goToStats"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/stats') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs text-gray-700">统计</span>
      </button>
      
      <button 
        @click="goToAdd"
        class="w-14 h-14 -mt-6 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      <button 
        @click="goToTmdbSearch"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/tmdb-search') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span class="text-xs text-gray-700">搜索</span>
      </button>
      
      <button 
        @click="goToMe"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/me') ? 'text-blue-500' : 'text-gray-500'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs text-gray-700">我的</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUiStore } from '../stores/uiStore'
import { useMovieStore } from '../stores/movieStore'
import { useWebdavStore } from '../stores/webdavStore'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const movieStore = useMovieStore()
const webdavStore = useWebdavStore()

const showWebdavConfig = ref(false)
const webdavUrl = ref('')
const webdavUsername = ref('')
const webdavPassword = ref('')
const isTesting = ref(false)
const isBackingUp = ref(false)
const isSyncing = ref(false)

webdavUrl.value = webdavStore.config.url
webdavUsername.value = webdavStore.config.username
webdavPassword.value = webdavStore.config.password

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const saveWebdavConfig = async () => {
  if (!webdavUrl.value || !webdavUsername.value || !webdavPassword.value) {
    alert('请填写完整的WebDAV配置')
    return
  }
  
  isTesting.value = true
  try {
    const tempConfig = {
      url: webdavUrl.value,
      username: webdavUsername.value,
      password: webdavPassword.value,
      autoBackup: webdavStore.config.autoBackup || false,
      lastBackup: webdavStore.config.lastBackup
    }
    
    const isDev = import.meta.env.DEV
    let baseUrl
    if (isDev) {
      // 开发环境中，使用代理路径进行测试
      baseUrl = '/api/webdav'
    } else {
      // 生产环境中，使用配置的URL
      baseUrl = tempConfig.url.replace(/\/$/, '')
    }
    
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(tempConfig.username + ':' + tempConfig.password)))
    
    const headers = {
      'Authorization': authHeader
    }
    
    console.log('WebDAV测试连接:', {
      url: baseUrl,
      method: 'PROPFIND',
      headers: headers
    })
    
    // 使用PROPFIND方法进行WebDAV连接测试
    const response = await fetch(baseUrl, {
      method: 'PROPFIND',
      headers: {
        ...headers,
        'Depth': '0'
      }
    })
    
    console.log('WebDAV响应:', response)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`连接失败: ${response.status} ${response.statusText} ${errorText}`)
    }
    
    webdavStore.updateConfig(tempConfig)
    alert('配置保存成功，连接测试通过！')
    showWebdavConfig.value = false
  } catch (error) {
    console.error('WebDAV连接错误:', error)
    alert('连接失败: ' + error.message)
  } finally {
    isTesting.value = false
  }
}

const backupToWebdav = async () => {
  if (movieStore.movies.length === 0) {
    alert('没有数据可以备份')
    return
  }
  
  isBackingUp.value = true
  try {
    // 使用固定文件名进行备份（覆盖模式）
    const result = await webdavStore.uploadToWebdav(movieStore.movies, false)
    
    if (result.isLatest) {
      alert('备份成功！文件已更新到最新版本')
    } else {
      alert('备份成功！创建了新版本文件: ' + result.filename)
    }
  } catch (error) {
    alert('备份失败: ' + error.message)
  } finally {
    isBackingUp.value = false
  }
}

const createVersionedBackup = async () => {
  if (movieStore.movies.length === 0) {
    alert('没有数据可以备份')
    return
  }
  
  isBackingUp.value = true
  try {
    // 使用时间戳文件名创建版本备份
    const result = await webdavStore.uploadToWebdav(movieStore.movies, true)
    alert('版本备份成功！文件名: ' + result.filename)
  } catch (error) {
    alert('版本备份失败: ' + error.message)
  } finally {
    isBackingUp.value = false
  }
}

const syncFromWebdav = async () => {
  if (!webdavStore.isConfigured) {
    alert('请先配置WebDAV')
    return
  }
  
  isSyncing.value = true
  try {
    const result = await webdavStore.syncFromWebdav(movieStore)
    alert(`同步成功！\n本地数据: ${result.localCount} 条\n远程数据: ${result.remoteCount} 条\n合并后: ${result.mergedCount} 条\n新增: ${result.added} 条`)
  } catch (error) {
    alert('同步失败: ' + error.message)
  } finally {
    isSyncing.value = false
  }
}

const toggleAutoBackup = () => {
  const newAutoBackupState = !webdavStore.config.autoBackup
  webdavStore.updateConfig({
    autoBackup: newAutoBackupState
  })
  localStorage.setItem('webdav-auto-backup', newAutoBackupState.toString())
}

const gridColumns = uiStore.gridColumns

const setGridColumns = (cols) => {
  uiStore.gridColumns = cols
}

const goBack = () => {
  router.back()
}

const isCurrentRoute = (path) => {
  return route.path === path
}

const goToHome = () => {
  router.push('/')
}

const goToStats = () => {
  router.push('/stats')
}

const goToAdd = () => {
  router.push('/add')
}

const goToTmdbSearch = () => {
  router.push('/tmdb-search')
}

const goToMe = () => {
  router.push('/me')
}

const exportData = () => {
  const movies = movieStore.movies
  if (movies.length === 0) return

  const headers = ['标题', '年份', '类型', '媒体类型', '个人评分', '观影日期', '简介', '封面', '背景图', '演员']
  const rows = movies.map(m => [
    m.title || '',
    m.releaseYear || '',
    (m.genres || []).join(';'),
    m.mediaType || '',
    m.personalRating || '',
    m.watchDate || '',
    (m.overview || '').replace(/,/g, '，').replace(/\n/g, ' '),
    m.cover || '',
    m.backdrop || '',
    (m.actors || []).join(';')
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `movie-record-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const importData = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('CSV文件格式不正确')
        return
      }

      let importedCount = 0
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        if (values.length < 1 || !values[0]) continue

        const movie = {
          title: values[0] || '',
          releaseYear: values[1] ? parseInt(values[1]) : null,
          genres: values[2] ? values[2].split(';').filter(g => g) : [],
          mediaType: values[3] || 'movie',
          personalRating: values[4] ? parseFloat(values[4]) : 0,
          watchDate: values[5] || new Date().toISOString().split('T')[0],
          overview: values[6] || '',
          cover: values[7] || '',
          backdrop: values[8] || '',
          actors: values[9] ? values[9].split(';').filter(a => a) : []
        }

        if (movie.title) {
          movieStore.addMovie(movie)
          importedCount++
        }
      }

      alert(`成功导入 ${importedCount} 部作品`)
    } catch (error) {
      console.error('Import error:', error)
      alert('导入失败，请检查CSV文件格式')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  
  return result
}
</script>
