import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const GRID_COLUMNS_KEY = 'movie-record-grid-columns'

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

  watch(gridColumns, (newValue) => {
    localStorage.setItem(GRID_COLUMNS_KEY, newValue.toString())
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
    setLoading,
    openTmdbModal,
    closeTmdbModal,
    showToast
  }
})
