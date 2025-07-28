<template>
  <footer>
    <nav>
      <button @click="handleNavigation" class="nav-link">
        {{ isAboutPage ? '← Go Back' : 'About' }}
      </button>
      <theme-toggler />
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import ThemeToggler from './ThemeToggler.vue'

const router = useRouter()
const route = useRoute()

const isAboutPage = computed(() => route.name === 'about')

function handleNavigation() {
  if (isAboutPage.value) {
    // On about page: go back in history, or go to home if no history
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push({ name: 'home' })
    }
  } else {
    // Not on about page: go to about
    router.push({ name: 'about' })
  }
}


</script>

<style scoped>
footer {
  text-align: center;
  padding: 1rem 0;
}

nav {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  background: none;
  border: none;
  color: var(--color-accent-primary);
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
  padding: 0;

  &:hover {
    color: var(--color-accent-secondary);
  }
}
</style>
