<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-icon">{{ icon }}</div>
      <h1 class="error-title">{{ title }}</h1>
      <p class="error-message">{{ message }}</p>

      <div class="error-actions">
        <a href="#" @click.prevent="goBack">← go back</a>
        <span>or</span>
        <router-link :to="{ name: 'home' }" class="action-btn secondary"> go Home </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  type?: 'page' | 'book'
  customTitle?: string
  customMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'page',
})

const router = useRouter()

// Dynamic content based on type
const icon = props.type === 'book' ? '📚' : '🔍'
const title = props.customTitle || (props.type === 'book' ? 'Book Not Found' : 'Page Not Found')
const message =
  props.customMessage ||
  (props.type === 'book'
    ? "The book you're looking for doesn't exist or may have been removed."
    : "The page you're looking for doesn't exist or may have been moved.")

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 1rem 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
}

.error-message {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0 0 2rem 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
