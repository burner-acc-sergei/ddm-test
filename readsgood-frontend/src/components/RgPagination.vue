<template>
  <nav class="pagination-container" aria-label="Pagination Navigation">
    <button class="pagination-btn pagination-btn--prev" @click="$emit('prev')" :disabled="currentPage === 1"
      aria-label="Go to previous page">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>

    <div class="pagination-info">
      <span class="page-indicator">
        Page <strong>{{ currentPage }}</strong> of <strong>{{ totalPages }}</strong>
      </span>
    </div>

    <button class="pagination-btn pagination-btn--next" @click="$emit('next')" :disabled="currentPage === totalPages"
      aria-label="Go to next page">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">

defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  prev: []
  next: []
}>()
</script>

<style scoped lang="scss">
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1.5rem 2rem;

  transition: background 0.3s ease;

  @media (max-width: 480px) {
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: var(--color-accent-primary);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.25),
      0 2px 4px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);

    &::before {
      opacity: 1;
    }

    svg {
      transform: scale(1.1);
    }
  }

  &:focus {
    box-shadow:
      0 0 0 3px rgba(var(--color-accent-primary-rgb, 74, 144, 226), 0.3),
      0 4px 8px rgba(0, 0, 0, 0.25);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 1px 1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    color: var(--color-text-disabled, #9e9e9e);
    cursor: not-allowed;
    box-shadow: none;
    transform: none;

    &::before {
      display: none;
    }

    svg {
      opacity: 0.5;
    }
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    gap: 0.375rem;

    svg {
      width: 16px;
      height: 16px;
    }
  }
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  text-align: center;

  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    order: -1;
    width: 100%;
    justify-content: center;
    min-width: unset;
  }
}

.page-indicator {
  font-size: 0.95rem;
  color: var(--color-text);
  letter-spacing: 0.025em;
  line-height: 1.4;

  strong {
    font-weight: 600;
    color: var(--color-accent-primary);
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
}
</style>
