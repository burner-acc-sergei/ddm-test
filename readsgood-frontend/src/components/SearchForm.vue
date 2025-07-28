<template>
  <form @submit.prevent="onSearch" class="search-form">
    <input
      type="search"
      v-model="query"
      :placeholder="isSearchDisabled ? 'Please connect to Goodreads to search...' : 'Search books...'"
      aria-label="Search books"
      :disabled="searchStore.isLoading || isSearchDisabled"
    />
    <button
      type="submit"
      :disabled="searchStore.isLoading || !query.trim() || isSearchDisabled"
      :title="isSearchDisabled ? 'Connect to Goodreads to search' : ''"
    >
      <span v-if="searchStore.isLoading">Searching...</span>
      <span v-else>Search</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'
import { useAuthStore } from '@/stores/auth'

interface Props {
  initialQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: ''
})

const router = useRouter()
const searchStore = useSearchStore()
const authStore = useAuthStore()
const query = ref('')

// Initialize query with prop value
onMounted(() => {
  query.value = props.initialQuery
})

// Watch for changes to initialQuery prop
watch(() => props.initialQuery, (newQuery) => {
  query.value = newQuery || ''
})

// Disable search if user is not logged in or not connected to Goodreads
const isSearchDisabled = computed(() =>
  !authStore.isLoggedIn || !authStore.hasGoodreadsTokens
)

async function onSearch() {
  if (!query.value.trim()) return

  // Navigate to search results page with query and page as search params
  await router.push({
    name: 'search',
    query: {
      q: query.value.trim(),
      page: '1'
    }
  })
}
</script>

<style lang="scss" scoped>
.search-form {
  display: flex;
  gap: 0.75rem;
  margin: 2rem auto;
  width: 100%;

  @media (max-width: 768px) {
    margin: 1rem auto;
    gap: 0.5rem;
    flex-direction: column;
  }

  @media (max-width: 480px) {
    margin: 1rem 0;
  }

  input {
    flex: 1;
    padding: 1em 1.5em;
    font-size: 1.25rem;
    border: 1px solid var(--color-accent-primary);
    border-radius: var(--border-radius);
    background: var(--color-bg-card);
    color: var(--color-text);
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    min-width: 0; // Prevents flex item from overflowing

    @media (max-width: 768px) {
      font-size: 1.1rem;
      padding: 0.875em 1.25em;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
      padding: 0.75em 1em;
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent-secondary);
      box-shadow: var(--input-focus-shadow);
    }
  }

  button {
    padding: 1em 2em;
    font-size: 1.25rem;
    border-radius: var(--border-radius);
    background: var(--color-accent-primary);
    color: var(--color-bg);
    border: none;
    transition: background 0.3s, transform 0.2s;
    cursor: pointer;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 1.1rem;
      padding: 0.875em 1.5em;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
      padding: 0.75em 1.25em;
    }

    &:hover {
      background: var(--color-accent-secondary);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--color-accent-primary);
    }
  }
}
</style>
