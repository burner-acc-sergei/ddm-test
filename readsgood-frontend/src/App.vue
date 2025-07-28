<template>
  <div class="outer">
    <rg-header />
    <router-view class="view" />
    <rg-footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import RgHeader from './components/RgHeader.vue'
import RgFooter from './components/RgFooter.vue'
import { RouterView } from 'vue-router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

// Initialize stores
const themeStore = useThemeStore()
const authStore = useAuthStore()

let cleanup: (() => void) | undefined

onMounted(async () => {
  // Initialize theme
  cleanup = themeStore.initTheme()

  // Initialize auth
  await authStore.init()
})

onUnmounted(() => {
  cleanup?.()
})

</script>

<style lang="scss">
.view {
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
}
</style>
