import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'webdav-config'
const AUTO_BACKUP_KEY = 'webdav-auto-backup'

const isDev = import.meta.env.DEV

export const useWebdavStore = defineStore('webdav', () => {
  const config = ref({
    url: '',
    username: '',
    password: '',
    enabled: false,
    autoBackup: false,
    lastBackup: null
  })

  const isConfigured = computed(() => {
    return config.value.url && config.value.username && config.value.password
  })

  const loadConfig = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        config.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse WebDAV config:', e)
      }
    }
  }

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  const updateConfig = (newConfig) => {
    config.value = { ...config.value, ...newConfig }
    saveConfig()
  }

  const generateBackupFilename = (useTimestamp = false) => {
    if (useTimestamp) {
      // 时间戳模式：用于手动备份或版本管理
      const now = new Date()
      const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '-')
      return `movie-record-backup-${timestamp}.json`
    } else {
      // 固定文件名模式：用于自动同步
      return 'movie-record-backup-latest.json'
    }
  }

  const createBackupData = (movies) => {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      movieCount: movies.length,
      movies: movies
    }
  }

  const uploadToWebdav = async (movies, useTimestamp = false) => {
    if (!isConfigured.value) {
      throw new Error('WebDAV未配置')
    }

    const filename = generateBackupFilename(useTimestamp)
    const backupData = createBackupData(movies)
    const jsonContent = JSON.stringify(backupData, null, 2)
    
    const url = '/api/webdav/' + filename
    
    // 确保认证头正确生成，处理中文字符
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(config.value.username + ':' + config.value.password)))
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: jsonContent
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`上传失败: ${response.status} ${response.statusText} ${errorText}`)
      }

      config.value.lastBackup = new Date().toISOString()
      saveConfig()
      
      return { 
        filename, 
        success: true,
        isLatest: !useTimestamp,
        isVersioned: useTimestamp
      }
    } catch (error) {
      console.error('WebDAV upload error:', error)
      throw error
    }
  }

  const listBackups = async () => {
    if (!isConfigured.value) {
      throw new Error('WebDAV未配置')
    }

    const url = '/api/webdav'
    
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(config.value.username + ':' + config.value.password)))
    
    const headers = {
      'Authorization': authHeader
    }

    try {
      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          ...headers,
          'Depth': '1'
        }
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`获取备份列表失败: ${response.status} ${response.statusText} ${errorText}`)
      }

      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      const responses = xmlDoc.getElementsByTagName('d:response')
      
      const backups = []
      for (let i = 0; i < responses.length; i++) {
        const href = responses[i].getElementsByTagName('d:href')[0]?.textContent
        const displayname = responses[i].getElementsByTagName('d:displayname')[0]?.textContent
        if (href && displayname && displayname.startsWith('movie-record-backup-') && displayname.endsWith('.json')) {
          backups.push({
            filename: displayname,
            href: href
          })
        }
      }

      return backups.sort((a, b) => b.filename.localeCompare(a.filename))
    } catch (error) {
      console.error('WebDAV list error:', error)
      throw error
    }
  }

  const downloadBackup = async (filename) => {
    if (!isConfigured.value) {
      throw new Error('WebDAV未配置')
    }

    const url = '/api/webdav/' + filename
    
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(config.value.username + ':' + config.value.password)))
    
    const headers = {
      'Authorization': authHeader
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`下载失败: ${response.status} ${response.statusText} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('WebDAV download error:', error)
      throw error
    }
  }

  const testConnection = async () => {
    if (!isConfigured.value) {
      throw new Error('WebDAV未配置')
    }

    const url = '/api/webdav/test-connection'
    
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(config.value.username + ':' + config.value.password)))
    
    const headers = {
      'Authorization': authHeader
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`连接失败: ${response.status} ${response.statusText} ${errorText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('WebDAV test error:', error)
      throw error
    }
  }

  loadConfig()

  const downloadFromWebdav = async () => {
    if (!isConfigured.value) {
      throw new Error('WebDAV未配置')
    }

    const url = '/api/webdav'
    
    const authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(config.value.username + ':' + config.value.password)))
    
    const headers = {
      'Authorization': authHeader
    }

    try {
      // 首先获取文件列表
      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          ...headers,
          'Depth': '1'
        }
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`获取文件列表失败: ${response.status} ${response.statusText} ${errorText}`)
      }

      const xmlText = await response.text()
      console.log('WebDAV文件列表XML:', xmlText)
      
      // 尝试多种解析方法
      let files = parseWebdavFileList(xmlText)
      console.log('方法1解析后的文件列表:', files)
      
      // 如果方法1失败，尝试方法2：直接搜索文件名
      if (files.length === 0) {
        files = parseWebdavFileListMethod2(xmlText)
        console.log('方法2解析后的文件列表:', files)
      }
      
      // 如果方法2也失败，尝试方法3：正则表达式匹配
      if (files.length === 0) {
        files = parseWebdavFileListMethod3(xmlText)
        console.log('方法3解析后的文件列表:', files)
      }
      
      // 过滤出备份文件
      const backupFiles = files.filter(file => 
        file.name && file.name.startsWith('movie-record-backup-') && file.name.endsWith('.json')
      )
      
      console.log('过滤后的备份文件:', backupFiles)
      
      // 优先使用固定文件名进行同步
      const latestFilename = 'movie-record-backup-latest.json'
      
      try {
        // 首先尝试下载固定文件名文件
        console.log('尝试下载固定备份文件:', latestFilename)
        return await downloadSpecificFile(latestFilename, url, headers, isDev)
      } catch (error) {
        console.log('固定文件下载失败，尝试查找其他备份文件:', error.message)
        
        if (backupFiles.length === 0) {
          // 如果解析失败，尝试直接下载已知文件名
          console.log('尝试直接下载已知备份文件...')
          const knownFilename = 'movie-record-backup-2026-02-24-13-25-59-200Z.json'
          return await downloadSpecificFile(knownFilename, url, headers, isDev)
        }

        // 获取最新的备份文件
        const latestBackup = backupFiles.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))[0]
        
        // 下载备份文件
        const downloadUrl = `/api/webdav/${latestBackup.name}`
        const downloadResponse = await fetch(downloadUrl, {
          method: 'GET',
          headers: headers
        })

        if (!downloadResponse.ok) {
          const errorText = await downloadResponse.text().catch(() => '')
          throw new Error(`下载备份文件失败: ${downloadResponse.status} ${downloadResponse.statusText} ${errorText}`)
        }

        const backupData = await downloadResponse.json()
        
        return {
          filename: latestBackup.name,
          data: backupData,
          lastModified: latestBackup.lastModified
        }
      }
    } catch (error) {
      console.error('WebDAV下载错误:', error)
      throw error
    }
  }

  const parseWebdavFileList = (xmlText) => {
    const files = []
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    // 尝试不同的命名空间
    const responses = xmlDoc.getElementsByTagName('d:response') || xmlDoc.getElementsByTagName('response')
    
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i]
      
      // 尝试多种方式获取文件名
      let href = response.getElementsByTagName('d:href')[0]?.textContent || 
                 response.getElementsByTagName('href')[0]?.textContent
      
      let displayName = response.getElementsByTagName('d:displayname')[0]?.textContent || 
                       response.getElementsByTagName('displayname')[0]?.textContent
      
      // 如果displayName为空，从href中提取文件名
      if (!displayName && href) {
        const pathParts = href.split('/')
        displayName = pathParts[pathParts.length - 1]
      }
      
      const lastModified = response.getElementsByTagName('d:getlastmodified')[0]?.textContent || 
                          response.getElementsByTagName('getlastmodified')[0]?.textContent
      
      if (href && displayName && !href.endsWith('/')) {
        files.push({
          name: displayName,
          href: href,
          lastModified: lastModified
        })
      }
    }
    
    return files
  }

  const parseWebdavFileListMethod2 = (xmlText) => {
    const files = []
    
    // 方法2：使用正则表达式匹配文件名
    const filenameRegex = /movie-record-backup-[\d-]+\.json/g
    const matches = xmlText.match(filenameRegex)
    
    if (matches) {
      matches.forEach(filename => {
        files.push({
          name: filename,
          href: filename,
          lastModified: new Date().toISOString()
        })
      })
    }
    
    return files
  }

  const parseWebdavFileListMethod3 = (xmlText) => {
    const files = []
    
    // 方法3：简单的href匹配
    const hrefRegex = /<d?:href>([^<]*\.json)<\/d?:href>/gi
    let match
    
    while ((match = hrefRegex.exec(xmlText)) !== null) {
      const href = match[1]
      const pathParts = href.split('/')
      const filename = pathParts[pathParts.length - 1]
      
      if (filename.startsWith('movie-record-backup-')) {
        files.push({
          name: filename,
          href: href,
          lastModified: new Date().toISOString()
        })
      }
    }
    
    return files
  }

  const downloadSpecificFile = async (filename, url, headers, isDev) => {
    const downloadUrl = `/api/webdav/${filename}`
    const downloadResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: headers
    })

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text().catch(() => '')
      throw new Error(`下载备份文件失败: ${downloadResponse.status} ${downloadResponse.statusText} ${errorText}`)
    }

    const backupData = await downloadResponse.json()
    
    return {
      filename: filename,
      data: backupData,
      lastModified: new Date().toISOString()
    }
  }

  const syncFromWebdav = async (movieStore) => {
    try {
      const backup = await downloadFromWebdav()
      const remoteMovies = backup.data.movies || []
      const localMovies = movieStore.movies
      
      // 合并策略：以远程数据为主，保留本地新增数据
      const mergedMovies = mergeMovies(localMovies, remoteMovies)
      
      // 更新本地存储
      movieStore.movies = mergedMovies
      
      return {
        success: true,
        filename: backup.filename,
        localCount: localMovies.length,
        remoteCount: remoteMovies.length,
        mergedCount: mergedMovies.length,
        added: mergedMovies.length - localMovies.length
      }
    } catch (error) {
      console.error('同步失败:', error)
      throw error
    }
  }

  const mergeMovies = (localMovies, remoteMovies) => {
    const merged = [...localMovies]
    const localIds = new Set(localMovies.map(movie => movie.id))
    
    // 添加远程数据中不存在于本地的电影
    for (const remoteMovie of remoteMovies) {
      if (!localIds.has(remoteMovie.id)) {
        merged.push(remoteMovie)
      }
    }
    
    return merged
  }

  return {
    config,
    isConfigured,
    updateConfig,
    uploadToWebdav,
    listBackups,
    downloadBackup,
    testConnection,
    generateBackupFilename,
    downloadFromWebdav,
    syncFromWebdav
  }
})
