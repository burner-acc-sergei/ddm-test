import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewMode = 'list-item' | 'card'

export const useUserPreferencesStore = defineStore(
  'userPreferences',
  () => {
    // State
    const viewMode = ref<ViewMode>('card')
    const itemsPerPage = ref(12)

    // Available options
    const perPageOptions = <const>[6, 12, 24, 48]
    const viewModeOptions: ViewMode[] = ['list-item', 'card']

    // Actions
    function setViewMode(mode: ViewMode) {
      if (viewModeOptions.includes(mode)) {
        viewMode.value = mode
      }
    }

    function setItemsPerPage(count: number) {
      if (perPageOptions.includes(count as (typeof perPageOptions)[number])) {
        itemsPerPage.value = count
      }
    }

    // Reset to defaults
    function resetPreferences() {
      viewMode.value = 'card'
      itemsPerPage.value = 12
    }

    return {
      // State
      viewMode,
      itemsPerPage,
      perPageOptions,
      viewModeOptions,

      // Actions
      setViewMode,
      setItemsPerPage,
      resetPreferences,
    }
  },
  {
    persist: {
      key: 'readsgood-user-preferences',
      storage: localStorage,
    },
  },
)
