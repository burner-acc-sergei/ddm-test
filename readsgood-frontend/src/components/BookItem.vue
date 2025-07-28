<template>
  <router-link :to="{ name: 'book-details', params: { id: book.best_book?.id || book.id } }" class="book-item-link">
    <div :class="{ ['book-item']: true, [variant]: true }">
      <img :src="bookCoverUrl" :alt="`Cover for ${bookTitle}`" class="book-cover" />
      <div class="book-info">
        <div class="title">{{ bookTitle }}</div>
        <div class="book-meta">
          <div class="author">{{ bookAuthor }}</div>
          <div v-if="bookPublicationYear" class="year">{{ bookPublicationYear }}</div>
          <div v-if="book.average_rating" class="rating">{{ bookRating }}</div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Work } from '@/services/types'

const { book, variant } = defineProps<{
  book: Work
  variant: 'card' | 'list-item'
}>()

// Computed properties for Work data
const bookTitle = computed(() => book.best_book?.title || 'Unknown Title')
const bookAuthor = computed(() => book.best_book?.author?.name || 'Unknown Author')
const bookCoverUrl = computed(() => {
  const fallback = 'https://placehold.co/160x240?text=No+Cover'
  return book.best_book?.image_url || fallback
})
const bookRating = computed(() => {
  if (!book.average_rating) return ''
  const rating = Math.round(parseFloat(book.average_rating) * 10) / 10
  const ratingsCount = book.ratings_count ? parseInt(book.ratings_count, 10) : 0
  const ratingsText = ratingsCount ? ` (${ratingsCount.toLocaleString()} ratings)` : ''
  return `${rating}/5${ratingsText}`
})

const bookPublicationYear = computed(() => {
  return book.original_publication_year || ''
})
</script>

<style scoped lang="scss">
.book-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 2px 8px rgba(60, 64, 67, 0.15),
      0 1.5px 5px rgba(60, 64, 67, 0.08);
  }

  &:focus {
    outline: 2px solid var(--color-accent-primary);
    outline-offset: 2px;
  }
}

.book-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: var(--border-radius);
  background: var(--color-bg-card);
  border: 1px solid transparent;
  transition:
    background 0.3s ease,
    color 0.2s ease;

  &.card {
    flex-direction: column;
    align-items: flex-start;
    height: 100%; // Fill the parent grid cell

    .book-cover {
      width: 100%;
      height: 240px;
      object-fit: cover;
      border-radius: var(--border-radius-small);
      margin-bottom: 12px;
    }

    .book-info {
      flex: 1; // Take up remaining space
      width: 100%;
      display: flex;
      flex-direction: column;

      .title {
        flex: 1; // Stretch to fill available space
        font-weight: 600;
        font-size: 16px;
        color: var(--color-text);
        line-height: 1.3;
        margin-bottom: 8px;
      }

      .book-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: auto; // Push to bottom
      }
    }
  }

  &.list-item {
    .book-cover {
      width: 60px;
      height: 90px;
      object-fit: cover;
      border-radius: var(--border-radius-small);
      margin-right: 16px;
    }
  }

  .book-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .title {
      font-weight: 600;
      font-size: 16px;
      color: var(--color-text);
      line-height: 1.3;
    }

    .author {
      font-size: 14px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .year {
      font-size: 13px;
      color: var(--color-text-secondary);
      opacity: 0.8;
    }

    .rating {
      font-size: 13px;
      color: var(--color-accent-primary);
      font-weight: 500;
    }

    .description {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.4;
      margin-top: 4px;

      // Only show in list view
      .card & {
        display: none;
      }
    }
  }
}
</style>
