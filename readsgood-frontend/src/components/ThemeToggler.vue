<template>
  <span class="theme-toggler" @click="themeStore.toggleTheme" :aria-label="toggleLabel"
    :class="themeStore.currentTheme">
    🌓
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const toggleLabel = computed(() =>
  `Switch to ${themeStore.currentTheme === 'light' ? 'dark' : 'light'} mode`
)
</script>

<style scoped>
.theme-toggler {
  display: inline-block;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--color-text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.25rem;
  border-radius: var(--border-radius-small);

  &:hover {
    transform: scale(1.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent-primary);
  }

  &.dark {
    transform: rotate(180deg);

    &:hover {
      transform: rotate(180deg) scale(1.1);
    }

    &:active {
      transform: rotate(180deg) scale(0.95);
    }
  }
}
</style>
