<template>
  <main class="book-details">
    <section class="navigation">
      <RouterLink v-if="!isBookNotFound && authStore.isLoggedIn" :to="backToSearchLink" class="back-link">← Back to Search Results</RouterLink>
    </section>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading book details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <!-- Show NotFound component for 404 errors -->
      <NotFound
        v-if="isBookNotFound"
        type="book"
        custom-message="The book you're looking for doesn't exist or may have been removed. Please check the book ID and try again."
      />
      <!-- Show regular error for other errors -->
      <div v-else class="generic-error">
        <h2>Error Loading Book</h2>
        <p>{{ error }}</p>
        <button @click="loadBookDetails" class="retry-btn">Try Again</button>
      </div>
    </div>

    <!-- Book content -->
    <div v-else-if="book" class="book-layout">
      <div class="section-cover">
        <img :src="bookCoverUrl" :alt="`Cover of ${book.title}`" class="book-cover" />
      </div>

      <div class="section-info">
        <h1 class="title">{{ book.title }}</h1>
        <h2 class="author">by {{ bookService.formatBookAuthor(book) }}</h2>

        <div class="meta">
          <div class="meta-item" v-if="bookPublicationYear">
            <span>Published:</span>
            <span>{{ bookPublicationYear }}</span>
          </div>
          <div class="meta-item" v-if="book.isbn13">
            <span>ISBN-13:</span>
            <span>{{ book.isbn13 }}</span>
          </div>
          <div class="meta-item" v-if="book.num_pages">
            <span>Pages:</span>
            <span>{{ book.num_pages }}</span>
          </div>
          <div class="meta-item" v-if="book.publisher">
            <span>Publisher:</span>
            <span>{{ book.publisher }}</span>
          </div>
          <div class="meta-item" v-if="book.format">
            <span>Format:</span>
            <span>{{ book.format }}</span>
          </div>
          <div class="meta-item" v-if="bookIsEbook !== undefined">
            <span>Format:</span>
            <span>{{ bookIsEbook ? 'Ebook' : 'Print' }}</span>
          </div>
          <div class="meta-item" v-if="book.average_rating">
            <span>Rating:</span>
            <span>{{ bookRating }}</span>
          </div>
          <div class="meta-item" v-if="bookReviewsCount">
            <span>Reviews:</span>
            <span>{{ bookReviewsCount.toLocaleString() }}</span>
          </div>
        </div>

        <div v-if="book.description">
          <h3>Description</h3>
          <div class="description" v-dompurify-html="book.description" />
        </div>

        <div v-if="bookGenres?.length">
          <h3>Genres</h3>
          <div class="genre-tags">
            <span v-for="genre in bookGenres" :key="genre" class="tag">{{ genre }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { bookService, ApiError } from '@/services'
import type { BookDetails } from '@/services/types'
import { useSearchStore } from '@/stores/search'
import NotFound from '@/components/NotFound.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const searchStore = useSearchStore()
const authStore = useAuthStore()

// State
const book = ref<BookDetails | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const bookCoverUrl = computed(() => {
  if (!book.value) return 'https://placehold.co/300x450?text=No+Cover'
  return bookService.getBookCoverUrl(book.value, 'large')
})

const bookRating = computed(() => {
  if (!book.value) return ''
  return bookService.formatRating(book.value)
})

const bookPublicationYear = computed(() => {
  if (!book.value) return ''
  return book.value.publication_year || book.value.work?.original_publication_year
})

const bookIsEbook = computed(() => {
  if (!book.value?.is_ebook) return undefined
  return book.value.is_ebook.toLowerCase() === 'true'
})

const bookReviewsCount = computed(() => {
  if (!book.value?.text_reviews_count) return 0
  return parseInt(book.value.text_reviews_count, 10)
})

const bookGenres = computed(() => {
  // Note: popular_shelves data is lost with ignoreAttrs: true in the XML parser
  // Return empty array since this data is not available in the simplified format
  return []
})

// Computed back link that preserves search state
const backToSearchLink = computed(() => {
  if (searchStore.currentQuery) {
    return {
      name: 'search',
      query: {
        q: searchStore.currentQuery,
        page: searchStore.currentPage.toString()
      }
    }
  }
  return { name: 'search' }
})

// Check if the error is a 404 (book not found)
const isBookNotFound = computed(() => {
  return error.value && authStore.isLoggedIn
})

// Methods
async function loadBookDetails() {
  const bookId = route.params.id as string
  if (!bookId) {
    error.value = 'No book ID provided'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    book.value = await bookService.getBookDetails(bookId)
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) {
        error.value = 'Authentication required. Please log in.'
      } else if (err.status === 404) {
        error.value = 'Book not found. It may have been removed or the ID is invalid.'
      } else {
        error.value = err.message
      }
    } else {
      error.value = err instanceof Error ? err.message : 'Failed to load book details'
    }
    book.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBookDetails()
})

// Watch for authentication changes and refetch if user logs in
watch(() => authStore.isLoggedIn, (newValue, oldValue) => {
  // Only refetch if user just logged in (changed from false to true)
  // and there's currently an error (likely auth-related)
  if (newValue && !oldValue && error.value) {
    loadBookDetails()
  }
})
</script>

<style scoped lang="scss">
.book-details {
  padding: 2rem;
}

.navigation {
  margin: 1rem 0;
}

.back-link {
  display: inline-block;
  padding: 1rem 0;
  color: var(--color-accent-primary);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-accent-secondary);
  }
}

// Loading state
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-accent-primary);
    border-top: 4px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// Error state
.error-state {
  text-align: center;
  padding: 4rem 2rem;

  h2 {
    color: var(--color-text);
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .retry-btn {
    background: var(--color-accent-primary);
    color: var(--color-bg);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--color-accent-secondary);
      transform: translateY(-1px);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-accent-primary);
    }
  }
}

.book-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.section {
  &-cover {
    display: grid;
    place-items: center;
  }

  &-info {
    display: grid;
    gap: 24px;
  }
}

.book-cover {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.author {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0;
}

.meta {
  display: grid;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;

  span:first-child {
    font-weight: 600;
    color: var(--color-text);
    min-width: 80px;
  }

  span:last-child {
    color: var(--color-text-secondary);
  }
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;
}

.description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--color-accent-primary);
  color: var(--color-bg);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.api-note {
  background: var(--color-bg-card);
  border: 1px solid var(--color-accent-primary);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-top: 2rem;

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
}


.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.author {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--color-accent-primary);
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
}

.meta {
  display: grid;
  gap: 12px;

  &-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px;

    span:first-child {
      font-weight: 600;
      color: var(--color-text);
    }

    span:last-child {
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      grid-template-columns: 100px 1fr;
      gap: 12px;
    }
  }
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: var(--color-accent-secondary);
  color: var(--color-bg);
  padding: 6px 12px;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}
</style>
