import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bookService, type SearchResponse, ApiError } from '@/services'
import type { Work } from '@/services/types'

export const useSearchStore = defineStore('search', () => {
  // State
  const books = ref<Work[]>([])
  const totalResults = ref(0)
  const currentQuery = ref('')
  const currentPage = ref(1)
  const totalPages = ref(0)
  const hasNextPage = ref(false)
  const hasPreviousPage = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasSearched = ref(false)

  // Computed
  const hasResults = computed(() => books.value.length > 0)
  const isEmpty = computed(() => hasSearched.value && books.value.length === 0)
  const canGoToNextPage = computed(() => hasNextPage.value && !isLoading.value)
  const canGoToPreviousPage = computed(() => hasPreviousPage.value && !isLoading.value)

  // Actions
  async function searchBooks(query: string, page: number = 1): Promise<boolean> {
    if (!query.trim()) {
      error.value = 'Search query cannot be empty'
      return false
    }

    isLoading.value = true
    error.value = null

    // Only update query if it's different (for pagination on same query)
    if (query.trim() !== currentQuery.value) {
      currentQuery.value = query.trim()
      currentPage.value = 1 // Reset to first page for new query
    } else {
      currentPage.value = page
    }

    try {
      const response: SearchResponse = await bookService.searchBooks(currentQuery.value, currentPage.value)
      books.value = response.books || []
      totalResults.value = response.totalResults || 0
      totalPages.value = response.totalPages || 0
      hasNextPage.value = response.hasNextPage || false
      hasPreviousPage.value = response.hasPreviousPage || false
      currentPage.value = response.currentPage || page
      hasSearched.value = true
      return true
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          error.value = 'Authentication required. Please log in.'
        } else if (err.status === 404) {
          error.value = 'Goodreads tokens not found. Please configure your Goodreads integration.'
        } else {
          error.value = err.message
        }
      } else {
        error.value = err instanceof Error ? err.message : 'Search failed'
      }
      books.value = []
      totalResults.value = 0
      totalPages.value = 0
      hasNextPage.value = false
      hasPreviousPage.value = false
      currentPage.value = 1
      hasSearched.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function goToNextPage(): Promise<boolean> {
    if (!canGoToNextPage.value || !currentQuery.value) {
      return false
    }
    return await searchBooks(currentQuery.value, currentPage.value + 1)
  }

  async function goToPreviousPage(): Promise<boolean> {
    if (!canGoToPreviousPage.value || !currentQuery.value) {
      return false
    }
    return await searchBooks(currentQuery.value, currentPage.value - 1)
  }

  async function goToPage(page: number): Promise<boolean> {
    if (!currentQuery.value || page < 1 || page > totalPages.value || page === currentPage.value) {
      return false
    }
    return await searchBooks(currentQuery.value, page)
  }

  function clearSearch(): void {
    books.value = []
    totalResults.value = 0
    totalPages.value = 0
    hasNextPage.value = false
    hasPreviousPage.value = false
    currentPage.value = 1
    currentQuery.value = ''
    error.value = null
    hasSearched.value = false
  }

  function clearError(): void {
    error.value = null
  }

  return {
    // State
    books,
    totalResults,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    currentQuery,
    isLoading,
    error,
    hasSearched,

    // Computed
    hasResults,
    isEmpty,
    canGoToNextPage,
    canGoToPreviousPage,

    // Actions
    searchBooks,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    clearSearch,
    clearError,
  }
})
