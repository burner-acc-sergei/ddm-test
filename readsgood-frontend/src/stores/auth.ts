import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  authService,
  goodreadsService,
  type User,
  type RegisterRequest,
  ApiError
} from '@/services'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoggedIn = ref(authService.isAuthenticated())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const hasGoodreadsTokens = computed(() => user.value?.goodreadsConnected ?? false)
  const currentUsername = computed(() => user.value?.username ?? authService.getCurrentUsername())

  // Actions
  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      const success = await authService.login(username, password)
      if (success) {
        isLoggedIn.value = true
        await loadUserInfo()
        return true
      } else {
        error.value = 'Invalid username or password'
        return false
      }
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await authService.register(userData)
      return true
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    authService.logout()
    user.value = null
    isLoggedIn.value = false
    error.value = null
  }

  async function loadUserInfo(): Promise<void> {
    if (!isLoggedIn.value) return

    try {
      user.value = await authService.getCurrentUser()
    } catch {
      // If we can't load user info, user might not be properly authenticated
      await logout()
    }
  }

  async function initOAuth(): Promise<string | null> {
    isLoading.value = true
    error.value = null

    try {
      return await goodreadsService.initializeOAuth()
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Failed to initialize OAuth'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function completeOAuth(oauthToken: string, oauthVerifier: string): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await goodreadsService.completeOAuth(oauthToken, oauthVerifier)
      await loadUserInfo()
      return true
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'OAuth completion failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  // Initialize store
  async function init(): Promise<void> {
    isLoggedIn.value = authService.isAuthenticated()
    if (isLoggedIn.value) {
      await loadUserInfo()
    }
  }

  return {
    // State
    user,
    isLoggedIn,
    isLoading,
    error,

    // Computed
    hasGoodreadsTokens,
    currentUsername,

    // Actions
    login,
    register,
    logout,
    loadUserInfo,
    initOAuth,
    completeOAuth,
    clearError,
    init,
  }
})
