<template>
  <main class="search-results wrapper">
    <header class="page-header">
      <search-form :initial-query="searchStore.currentQuery" />

      <div class="search-info">
        <div class="search-text">
          <h1 v-if="searchStore.currentQuery" class="page-title">
            Search results for "{{ searchStore.currentQuery }}"
          </h1>
          <p v-if="searchStore.hasResults" class="results-count">
            {{ searchStore.totalResults }} {{ searchStore.totalResults === 1 ? 'result' : 'results' }} found
          </p>
        </div>
        <rg-controls />
      </div>
    </header>

    <section class="results-container">
      <!-- Loading state -->
      <div v-if="searchStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Searching books...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="searchStore.error" class="error-state">
        <h3>Search Error</h3>
        <p>{{ searchStore.error }}</p>
        <button @click="searchStore.clearError" class="retry-btn">
          Clear Error
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="searchStore.isEmpty" class="empty-state">
        <h3>No results found</h3>
        <p>Try searching with different keywords or check your spelling.</p>
      </div>

      <!-- Results -->
      <div v-else-if="searchStore.hasResults" :class="['results-grid', userPreferences.viewMode]">
        <book-item
          v-for="book in searchStore.books"
          :key="book.id"
          :book="book"
          :variant="userPreferences.viewMode"
        />
      </div>

      <!-- Initial state -->
      <div v-else class="initial-state">
        <h3>Ready to search</h3>
        <p>Enter a search term above to find books.</p>
      </div>
    </section>

    <footer v-if="searchStore.hasResults" class="pagination-footer">
      <rg-pagination
        v-show="searchStore.totalPages > 1"
        :current-page="searchStore.currentPage"
        :total-pages="searchStore.totalPages"
        @prev="goToPreviousPage"
        @next="goToNextPage"
      />
    </footer>
  </main>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookItem from '@/components/BookItem.vue'
import RgPagination from '@/components/RgPagination.vue'
import RgControls from '@/components/RgControls.vue'
import SearchForm from '@/components/SearchForm.vue'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { useSearchStore } from '@/stores/search'

const route = useRoute()
const router = useRouter()
const userPreferences = useUserPreferencesStore()
const searchStore = useSearchStore()

// Handle initial search from URL
onMounted(() => {
  const query = route.query.q as string
  const page = parseInt(route.query.page as string) || 1

  if (query) {
    searchStore.searchBooks(query, page)
  }
})

// Watch for route changes
watch(() => [route.query.q, route.query.page], ([newQuery, newPage]) => {
  if (newQuery && typeof newQuery === 'string') {
    const page = parseInt(newPage as string) || 1
    searchStore.searchBooks(newQuery, page)
  }
})

// Update pagination methods to update URL
async function goToNextPage() {
  if (searchStore.canGoToNextPage) {
    await router.push({
      name: 'search',
      query: {
        q: searchStore.currentQuery,
        page: (searchStore.currentPage + 1).toString()
      }
    })
  }
}

async function goToPreviousPage() {
  if (searchStore.canGoToPreviousPage) {
    await router.push({
      name: 'search',
      query: {
        q: searchStore.currentQuery,
        page: (searchStore.currentPage - 1).toString()
      }
    })
  }
}
</script>

<style scoped lang="scss">
.search-results {
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 2rem;
  width: 100%;
  flex: 1;
  min-height: 0; // Allow grid to shrink if needed

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
}

.page-header {
  margin-bottom: 2rem;

  .page-title {
    color: var(--color-text);
    margin: 0 0 1.5rem 0;

    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
  }
}

.results {
  &-container {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-bottom: 3rem;
    min-height: 0;
  }

  &-grid {
    display: grid;
    gap: 1.5rem;
    flex: 1;

    &.list-item {
      grid-template-columns: 1fr;
      align-content: start;
    }

    &.card {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      grid-auto-rows: 1fr; // Makes all rows the same height
      align-content: start;

      @media (max-width: 640px) {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
    }
  }
}

.pagination-footer {
  padding-top: 2rem;
  margin-top: auto;
}

.page-header {
  margin-bottom: 2rem;

  .search-info {
    margin: 1.5rem 0 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .search-text {
      flex: 1;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 0.5rem 0;

      @media (max-width: 768px) {
        font-size: 1.25rem;
      }
    }

    .results-count {
      color: var(--color-text-secondary);
      margin: 0;
      font-size: 0.9rem;
    }
  }
}

.loading-state,
.error-state,
.empty-state,
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1rem;
  flex: 1;

  h3 {
    font-size: 1.25rem;
    color: var(--color-text);
    margin: 0 0 0.5rem 0;
  }

  p {
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
    max-width: 400px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-accent-primary);
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-accent-primary);
  color: var(--color-bg);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-accent-secondary);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent-primary);
  }
}

.error-state {
  .retry-btn {
    background: #dc2626;

    &:hover {
      background: #b91c1c;
    }

    .dark & {
      background: #ef4444;

      &:hover {
        background: #dc2626;
      }
    }
  }
}
</style>
