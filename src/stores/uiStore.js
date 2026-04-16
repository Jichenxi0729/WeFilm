import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const GRID_COLUMNS_KEY = 'movie-record-grid-columns'
const ACTIVE_TAB_KEY = 'movie-record-active-tab'
const PURE_COVER_KEY = 'movie-record-pure-cover'

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const loadingText = ref('')
  const showTmdbModal = ref(false)
  const toastMessage = ref('')
  const toastType = ref('info')

  const loadGridColumns = () => {
    const stored = localStorage.getItem(GRID_COLUMNS_KEY)
    if (stored) {
      return parseInt(stored, 10)
    }
    return 3
  }

  const gridColumns = ref(loadGridColumns())

  const loadActiveTab = () => {
    const stored = localStorage.getItem(ACTIVE_TAB_KEY)
    return stored || 'all'
  }

  const activeTab = ref(loadActiveTab())

  const loadPureCover = () => {
    const stored = localStorage.getItem(PURE_COVER_KEY)
    return stored === 'true'
  }

  const pureCoverMode = ref(loadPureCover())

  watch(gridColumns, (newValue) => {
    localStorage.setItem(GRID_COLUMNS_KEY, newValue.toString())
  })

  watch(activeTab, (newValue) => {
    localStorage.setItem(ACTIVE_TAB_KEY, newValue)
  })

  watch(pureCoverMode, (newValue) => {
    localStorage.setItem(PURE_COVER_KEY, newValue.toString())
  })

  const setLoading = (loading, text = '') => {
    isLoading.value = loading
    loadingText.value = text
  }

  const openTmdbModal = () => {
    showTmdbModal.value = true
  }

  const closeTmdbModal = () => {
    showTmdbModal.value = false
  }

  const showToast = (message, type = 'info') => {
    toastMessage.value = message
    toastType.value = type
    setTimeout(() => {
      toastMessage.value = ''
    }, 3000)
  }

  return {
    isLoading,
    loadingText,
    showTmdbModal,
    toastMessage,
    toastType,
    gridColumns,
    activeTab,
    pureCoverMode,
    setLoading,
    openTmdbModal,
    closeTmdbModal,
    showToast
  }
})
