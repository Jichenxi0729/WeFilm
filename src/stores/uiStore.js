import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const GRID_COLUMNS_KEY = 'movie-record-grid-columns'
const ACTIVE_TAB_KEY = 'movie-record-active-tab'
const PURE_COVER_KEY = 'movie-record-pure-cover'
const CHART_SETTINGS_KEY = 'movie-record-chart-settings'
const VIEW_MODE_KEY = 'movie-record-view-mode'

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

  const loadViewMode = () => {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    return stored || 'poster' // 'poster' = 2:3竖版, 'still' = 4:3横版
  }

  const viewMode = ref(loadViewMode())

  const defaultChartSettings = {
    showTypePie: true,
    showRatingDist: true,
    showMonthlyLine: true,
    showGenreBar: true,
    chartOrder: ['typePie', 'ratingDist', 'monthlyLine', 'genreBar']
  }

  const loadChartSettings = () => {
    const stored = localStorage.getItem(CHART_SETTINGS_KEY)
    if (stored) {
      try {
        return { ...defaultChartSettings, ...JSON.parse(stored) }
      } catch (e) {
        return defaultChartSettings
      }
    }
    return defaultChartSettings
  }

  const chartSettings = ref(loadChartSettings())

  watch(gridColumns, (newValue) => {
    localStorage.setItem(GRID_COLUMNS_KEY, newValue.toString())
  })

  watch(activeTab, (newValue) => {
    localStorage.setItem(ACTIVE_TAB_KEY, newValue)
  })

  watch(pureCoverMode, (newValue) => {
    localStorage.setItem(PURE_COVER_KEY, newValue.toString())
  })

  watch(viewMode, (newValue) => {
    localStorage.setItem(VIEW_MODE_KEY, newValue)
  })

  watch(chartSettings, (newValue) => {
    localStorage.setItem(CHART_SETTINGS_KEY, JSON.stringify(newValue))
  }, { deep: true })

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

  const toggleChartVisibility = (chartKey) => {
    if (chartKey in chartSettings.value) {
      chartSettings.value[chartKey] = !chartSettings.value[chartKey]
    }
  }

  const updateChartOrder = (newOrder) => {
    chartSettings.value.chartOrder = newOrder
  }

  const resetChartSettings = () => {
    chartSettings.value = { ...defaultChartSettings }
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
    viewMode,
    chartSettings,
    setLoading,
    openTmdbModal,
    closeTmdbModal,
    showToast,
    toggleChartVisibility,
    updateChartOrder,
    resetChartSettings
  }
})
