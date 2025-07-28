<template>
  <header
    :class="{
      [headerClass]: true,
      header: true,
    }"
  >
    <!-- Auth section - absolutely positioned top-right -->
    <div v-show="!isAboutPage" class="auth-section">
      <!-- Server Status -->

      <div v-if="authStore.isLoggedIn" class="auth-text">
        <span class="status-server">
          <span
            :class="[
              'status-indicator',
              {
                online: isServerOnline === true,
                offline: isServerOnline === false,
                unknown: isServerOnline === null,
              },
            ]"
            :title="serverStatusTitle"
          >
            {{ serverStatusText }}
          </span>
        </span>
        | Logged in as {{ authStore.currentUsername }}
        <span v-if="!authStore.hasGoodreadsTokens" class="status-goodreads">
          |
          <button @click="showGoodreadsModal = true" class="connect-goodreads-link">
            Connect to Goodreads
          </button>
        </span>
        <span v-else class="status-goodreads"> | 📚 Connected </span>
        (<a href="#" @click.prevent="handleLogout" class="logout-link">logout</a>)
      </div>
      <div v-else class="auth-text">
        <a href="#" @click.prevent="showAuthModal = true" class="login-link">Log in</a>
      </div>
    </div>

    <div class="wrapper">
      <router-link :to="{ name: 'home' }">
        <h1 class="logo">readsgood.</h1>
      </router-link>
    </div>

    <!-- Auth Modal -->
    <auth-modal :show="showAuthModal" @close="showAuthModal = false" />

    <!-- Goodreads Modal -->
    <goodreads-modal :show="showGoodreadsModal" @close="showGoodreadsModal = false" />
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useServerStatus } from '@/composables/useServerStatus'
import AuthModal from '@/components/AuthModal.vue'
import GoodreadsModal from '@/components/GoodreadsModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const { isServerOnline, lastChecked } = useServerStatus()

// Modal visibility
const showAuthModal = ref(false)
const showGoodreadsModal = ref(false)

const headerClass = computed(
  () =>
    route.name === 'home'
      ? 'tall' // tall on Home
      : 'short', // small on other pages
)

const isAboutPage = computed(() => route.name === 'about')

const serverStatusText = computed(() => {
  if (isServerOnline.value === null) return '⚪ Server'
  return isServerOnline.value ? '🟢 Server' : '🔴 Server'
})

const serverStatusTitle = computed(() => {
  if (isServerOnline.value === null) {
    return 'Server status: Checking...'
  }
  const status = isServerOnline.value ? 'Online' : 'Offline'
  const time = lastChecked.value?.toLocaleTimeString() || 'Never'
  return `Server status: ${status} (Last checked: ${time})`
})

async function handleLogout() {
  await authStore.logout()
}

// Initialize auth state
onMounted(async () => {
  await authStore.init()
})
</script>

<style scoped>
.header {
  padding: 0 1rem;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: end;
  min-height: 4rem;
  transition:
    height 0.25s ease,
    padding 0.3s ease,
    background 0.3s;
  position: relative;
}

.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
}

.logo {
  display: block;
  margin: 2rem;
  line-height: 1;
}

.auth-section {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  opacity: 0.6;
}

.auth-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary);

  .login-link,
  .logout-link {
    color: var(--color-accent-primary);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-accent-secondary);
      text-decoration: underline;
    }
  }

  .status-goodreads {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
  }

  .connect-goodreads-link {
    background: none;
    border: none;
    color: var(--color-accent-primary);
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-accent-secondary);
    }
  }
}
.tall {
  height: 36vh;
}

.short {
  height: 10rem;
}

@media (max-width: 768px) {
  .auth-section {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.25rem;
  }

  .server-status .status-indicator {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }

  .auth-text {
    font-size: 0.75rem;
  }

  .logo {
    margin: 1rem;
  }
}
</style>
