import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore(
  'theme',
  () => {
    // State
    const themePreference = ref<Theme>('system')
    const systemTheme = ref<'light' | 'dark'>('light')

    // Getters
    const currentTheme = computed(() => {
      if (themePreference.value === 'system') {
        return systemTheme.value
      }
      return themePreference.value
    })

    // Actions
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }

    const applyTheme = (theme: 'light' | 'dark') => {
      if (typeof document !== 'undefined') {
        const html = document.documentElement
        if (theme === 'dark') {
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
        }
      }
    }

    const setTheme = (theme: Theme) => {
      themePreference.value = theme
    }

    const toggleTheme = () => {
      const current = currentTheme.value
      setTheme(current === 'dark' ? 'light' : 'dark')
    }

    const initTheme = () => {
      systemTheme.value = getSystemTheme()
      applyTheme(currentTheme.value)

      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          systemTheme.value = e.matches ? 'dark' : 'light'
        }

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemThemeChange)
        } else {
          // Fallback for older browsers
          mediaQuery.addListener(handleSystemThemeChange)
        }

        return () => {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener('change', handleSystemThemeChange)
          } else {
            mediaQuery.removeListener(handleSystemThemeChange)
          }
        }
      }
    }

    // Watch for theme changes and apply them
    watch(
      currentTheme,
      (newTheme) => {
        applyTheme(newTheme)
      },
      { immediate: true },
    )

    return {
      themePreference,
      systemTheme,

      currentTheme,

      setTheme,
      toggleTheme,
      initTheme,
    }
  },
  {
    persist: {
      key: 'readsgood-theme',
      pick: ['themePreference'], // Only persist the user's preference, not system theme
    },
  },
)
