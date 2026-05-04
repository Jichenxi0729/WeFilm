<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
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
        <h2 class="text-sm font-medium text-gray-700 mb-3">云端同步</h2>

        <div v-if="!showAuthForm">
          <div v-if="authStore.isLoggedIn" class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">登录状态</p>
                <p class="text-xs text-green-500">已登录</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-700">{{ authStore.userEmail }}</p>
              </div>
            </div>
            <div class="flex gap-2 pt-2">
              <button
                @click="handleLogout"
                :disabled="authStore.loading"
                class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
              >
                {{ authStore.loading ? '登出中...' : '退出登录' }}
              </button>
            </div>
          </div>
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600">本地模式</p>
                <p class="text-xs text-gray-400">数据保存在本设备</p>
              </div>
              <button
                @click="showAuthForm = true"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                登录云端
              </button>
            </div>
            <p v-if="!isSupabaseConfigured" class="text-xs text-orange-500 mt-2">
              请先配置 Supabase 环境变量
            </p>
          </div>
        </div>

        <div v-else class="space-y-3">
          <div class="flex gap-2 mb-3">
            <button
              @click="authMode = 'login'"
              class="flex-1 py-2 text-sm rounded-lg transition-colors"
              :class="authMode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
            >
              登录
            </button>
            <button
              @click="authMode = 'register'"
              class="flex-1 py-2 text-sm rounded-lg transition-colors"
              :class="authMode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
            >
              注册
            </button>
          </div>

          <div>
            <label class="text-xs text-gray-500">邮箱</label>
            <input
              v-model="authEmail"
              type="email"
              placeholder="your@email.com"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500">密码</label>
            <input
              v-model="authPassword"
              type="password"
              placeholder="密码"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-1"
            />
          </div>

          <div v-if="authError" class="text-xs text-red-500">{{ authError }}</div>
          <div v-if="authSuccess" class="text-xs text-green-500">{{ authSuccess }}</div>

          <div class="flex gap-2 pt-2">
            <button
              @click="handleAuth"
              :disabled="authStore.loading || !authEmail || !authPassword"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {{ authStore.loading ? '处理中...' : (authMode === 'login' ? '登录' : '注册') }}
            </button>
            <button
              @click="showAuthForm = false; authError = ''; authSuccess = ''"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              取消
            </button>
          </div>
        </div>
      </div>

      <div v-if="showMigrationPrompt" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 class="text-sm font-medium text-blue-700 mb-2">数据迁移</h3>
        <p class="text-xs text-blue-600 mb-3">
          检测到您有 {{ localDataCount }} 条本地数据。是否迁移到云端？
        </p>
        <div class="flex gap-2">
          <button
            @click="handleMigrate"
            :disabled="isMigrating"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {{ isMigrating ? '迁移中...' : '迁移数据' }}
          </button>
          <button
            @click="showMigrationPrompt = false"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
          >
            暂不迁移
          </button>
        </div>
      </div>

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
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <p class="text-gray-600">纯封面展示</p>
            <p class="text-xs text-gray-400">隐藏作品名与评分</p>
          </div>
          <button
            @click="togglePureCover"
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :class="pureCoverMode ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ pureCoverMode ? '已开启' : '已关闭' }}
          </button>
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
            <button
              @click="openFilePicker"
              class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              导入
            </button>
            <input
              ref="fileInput"
              type="file"
              accept=".csv,text/csv"
              @change="importData"
              class="hidden"
            />
          </div>
          <div class="pt-3 border-t border-gray-100">
            <button
              @click="confirmClearAll"
              :disabled="movieStore.movies.length === 0"
              class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清除所有数据
            </button>
            <p class="text-xs text-gray-400 text-center mt-2">此操作不可恢复，请谨慎操作</p>
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
        @click="goToCalendar"
        class="flex flex-col items-center gap-1"
        :class="isCurrentRoute('/calendar') ? 'text-blue-500' : 'text-gray-400'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">日历</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useUiStore } from '../stores/uiStore'
import { useMovieStore } from '../stores/movieStore'
import { useWebdavStore } from '../stores/webdavStore'
import { useAuthStore } from '../stores/authStore'
import { isSupabaseConfigured } from '../lib/supabase'
import * as idb from '../lib/indexeddb'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const uiStore = useUiStore()
const movieStore = useMovieStore()
const webdavStore = useWebdavStore()
const authStore = useAuthStore()

const fileInput = ref(null)

const showWebdavConfig = ref(false)
const webdavUrl = ref('')
const webdavUsername = ref('')
const webdavPassword = ref('')
const isTesting = ref(false)
const isBackingUp = ref(false)
const isSyncing = ref(false)

const showAuthForm = ref(false)
const authMode = ref('login')
const authEmail = ref('')
const authPassword = ref('')
const authError = ref('')
const authSuccess = ref('')

const showMigrationPrompt = ref(false)
const localDataCount = ref(0)
const isMigrating = ref(false)

webdavUrl.value = webdavStore.config.url
webdavUsername.value = webdavStore.config.username
webdavPassword.value = webdavStore.config.password

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const handleAuth = async () => {
  authError.value = ''
  authSuccess.value = ''

  if (authMode.value === 'login') {
    const result = await authStore.signIn(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = '登录成功！'
      showAuthForm.value = false
      authEmail.value = ''
      authPassword.value = ''
      // 登录成功后立即从 Supabase 加载数据
      await movieStore.loadFromSupabase()
      await checkAndPromptMigration()
    } else {
      authError.value = result.error
    }
  } else {
    const result = await authStore.signUp(authEmail.value, authPassword.value)
    if (result.success) {
      authSuccess.value = '注册成功！请查收验证邮件。'
      authEmail.value = ''
      authPassword.value = ''
    } else {
      authError.value = result.error
    }
  }
}

const handleLogout = async () => {
  await authStore.signOut()
  await movieStore.switchToLocal()
}

const checkAndPromptMigration = async () => {
  if (!authStore.isLoggedIn) return

  try {
    const localData = await idb.getAllMovies()
    localDataCount.value = localData.length

    if (localDataCount.value > 0) {
      showMigrationPrompt.value = true
    }
  } catch (e) {
    console.error('检查本地数据失败:', e)
  }
}

const handleMigrate = async () => {
  isMigrating.value = true
  try {
    const count = await movieStore.migrateLocalToSupabase()
    showMigrationPrompt.value = false
    alert(`成功迁移 ${count} 条数据到云端！`)
  } catch (e) {
    alert('迁移失败: ' + e.message)
  } finally {
    isMigrating.value = false
  }
}

onMounted(async () => {
  await authStore.initAuth()
  if (authStore.isLoggedIn) {
    await checkAndPromptMigration()
  }
})

watch(() => authStore.isLoggedIn, async (loggedIn) => {
  if (loggedIn) {
    await checkAndPromptMigration()
  }
})

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

    const baseUrl = '/api/webdav/test-connection'

    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(tempConfig.username + ':' + tempConfig.password)))

    const headers = {
      'Authorization': authHeader
    }

    console.log('WebDAV测试连接:', {
      url: baseUrl,
      method: 'PUT',
      headers: headers
    })

    const response = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
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
    alert(`同步成功！\n本地数据: ${result.localCount} 条\n远程数据: ${result.remoteCount} 条\n合并后: ${result.mergedCount} 条\n新增: ${result.addedCount} 条`)
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

const gridColumns = computed(() => uiStore.gridColumns)

const setGridColumns = (cols) => {
  uiStore.gridColumns = cols
}

const pureCoverMode = computed(() => uiStore.pureCoverMode)

const togglePureCover = () => {
  uiStore.pureCoverMode = !uiStore.pureCoverMode
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

const goToCalendar = () => {
  router.push('/calendar')
}

const goToMe = () => {
  router.push('/me')
}

const openFilePicker = () => {
  fileInput.value.click()
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
      console.error('导入错误:', error)
      alert('导入失败，请检查CSV文件格式')
    }
  }
  reader.readAsText(file)
  event.target.files = null
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

const confirmClearAll = async () => {
  const count = movieStore.movies.length
  if (count === 0) return

  if (!confirm(`确定要清除所有 ${count} 条数据吗？此操作不可恢复！`)) {
    return
  }

  if (authStore.isLoggedIn) {
    if (!confirm('您当前处于登录状态，清除数据将同时删除云端数据。确定继续吗？')) {
      return
    }
  }

  try {
    await movieStore.clearAllMovies()
    uiStore.showToast('已清除所有数据', 'success')
  } catch (error) {
    uiStore.showToast('清除失败: ' + error.message, 'error')
  }
}
</script>
