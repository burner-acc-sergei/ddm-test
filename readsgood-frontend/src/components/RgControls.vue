<template>
  <div class="rg-controls">
    <div class="view-mode-group">
      <span class="view-mode-label">View mode:</span>
      <div class="rg-toggle">
        <button
          :class="{ active: userPreferences.viewMode === 'list-item' }"
          @click="userPreferences.setViewMode('list-item')"
          aria-label="List view"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor" />
            <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor" />
            <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button
          :class="{ active: userPreferences.viewMode === 'card' }"
          @click="userPreferences.setViewMode('card')"
          aria-label="Card view"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />
            <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor" />
            <rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" />
            <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserPreferencesStore } from '@/stores/userPreferences'

const userPreferences = useUserPreferencesStore()
</script>

<style scoped lang="scss">
.rg-controls {
  display: flex;
  align-items: center;
  justify-content: center;


  @media (max-width: 512px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    align-items: stretch;
  }
}

.view-mode-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 48px;
}

.view-mode-label {
  font-weight: 500;
  color: var(--color-text);
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  white-space: nowrap;

  @media (min-width: 512px) {
    display: none;
  }
}

.rg-toggle {
  display: flex;
  border-radius: 8px;
  padding: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  button {
    padding: 0.75rem 1.25rem;
    border: none;
    background: transparent;
    color: var(--color-text);
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    height: 40px;
    min-width: 40px;

    &:hover:not(.active) {
      background: rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);
    }

    &.active {
      background: var(--color-accent-primary);
      color: var(--color-bg);
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 1px 2px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &:focus {
      outline: none;
      box-shadow:
        0 0 0 2px var(--color-accent-primary),
        0 2px 4px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(0);
    }

    svg {
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    &:hover svg {
      transform: scale(1.1);
    }
  }
}
</style>
