import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userId = computed(() => user.value?.id || '')

  const initAuth = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      error.value = 'Supabase 未配置'
      return { success: false, error: 'Supabase 未配置' }
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        error.value = authError.message
        return { success: false, error: authError.message }
      }

      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      error.value = 'Supabase 未配置'
      return { success: false, error: 'Supabase 未配置' }
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        error.value = authError.message
        return { success: false, error: authError.message }
      }

      user.value = data.user
      return { success: true, data }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase 未配置' }
    }

    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) {
        error.value = authError.message
        return { success: false, error: authError.message }
      }

      user.value = null
      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      error.value = 'Supabase 未配置'
      return { success: false, error: 'Supabase 未配置' }
    }

    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email)

      if (authError) {
        error.value = authError.message
        return { success: false, error: authError.message }
      }

      return { success: true }
    } catch (e) {
      error.value = e.message
      return { success: false, error: e.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isLoggedIn,
    userEmail,
    userId,
    initAuth,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
})
