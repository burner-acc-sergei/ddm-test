<template>
  <rg-modal :show="show" @close="closeModal">
    <template #header>
      <h2>{{ authStore.hasGoodreadsTokens ? 'Goodreads Connected' : 'Connect Goodreads' }}</h2>
    </template>

    <div v-if="!authStore.hasGoodreadsTokens" class="goodreads-info">
      <div class="info-icon">📚</div>
      <p v-if="!authStore.hasGoodreadsTokens">
        Connect your Goodreads account to import your reading lists.
      </p>
      <p v-else>Your Goodreads account is already connected and ready to use!</p>
    </div>

    <!-- OAuth Flow -->
    <div v-if="!authStore.hasGoodreadsTokens" class="oauth-section">
      <button
        @click="startOAuth"
        :disabled="authStore.isLoading || oauthInProgress"
        class="oauth-btn"
      >
        <span v-if="authStore.isLoading">🔄 Getting authorization link...</span>
        <span v-else-if="oauthInProgress">⏳ Complete authorization in popup...</span>
        <span v-else>Connect with Goodreads</span>
      </button>

      <div v-if="oauthInProgress" class="oauth-info">
        <p>📋 A popup window has opened for Goodreads authorization.</p>
        <p>Please complete the authorization and the popup will close automatically.</p>
      </div>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <div v-if="localError" class="error-message">
        {{ localError }}
      </div>
    </div>

    <!-- Success State -->
    <div v-if="authStore.hasGoodreadsTokens" class="success-section">
      <div class="success-icon">✅</div>
      <h3>Account Connected!</h3>
      <p>Your Goodreads account is connected and working perfectly.</p>
    </div>

    <template #footer v-if="authStore.hasGoodreadsTokens">
      <button @click="closeModal" class="continue-btn">Continue Reading</button>
    </template>
  </rg-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import RgModal from './RgModal.vue'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()

// Form state
const localError = ref('')
const oauthInProgress = ref(false)

// Methods
function closeModal() {
  clearForm()
  emit('close')
}

function clearForm() {
  localError.value = ''
  authStore.clearError()
}

async function startOAuth() {
  oauthInProgress.value = true
  localError.value = ''

  try {
    const authorizeUrl = await authStore.initOAuth()
    if (authorizeUrl) {
      // Open OAuth in popup window
      const popup = window.open(
        authorizeUrl,
        'goodreads-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes',
      )

      if (popup) {
        // Monitor popup for completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            oauthInProgress.value = false
            // Check if tokens were successfully obtained
            setTimeout(async () => {
              await authStore.loadUserInfo()
              if (authStore.hasGoodreadsTokens) {
                // Success! Auto-close the modal after a brief delay
                // setTimeout(() => {
                //   closeModal()
                // }, 1500)
              } else {
                localError.value = 'OAuth was cancelled or failed. Please try again.'
              }
            }, 1000)
          }
        }, 1000)

        // Listen for message from popup (if backend supports postMessage)
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === 'GOODREADS_OAUTH_SUCCESS') {
            popup.close()
            window.removeEventListener('message', handleMessage)
            oauthInProgress.value = false
            authStore.loadUserInfo()
            // Auto-close after successful connection
            // setTimeout(() => {
            //   closeModal()
            // }, 30000)
          } else if (event.data.type === 'GOODREADS_OAUTH_ERROR') {
            popup.close()
            window.removeEventListener('message', handleMessage)
            oauthInProgress.value = false
            localError.value = event.data.message || 'OAuth failed'
          }
        }

        window.addEventListener('message', handleMessage)

        // Cleanup after 10 minutes
        setTimeout(() => {
          if (!popup.closed) {
            popup.close()
          }
          oauthInProgress.value = false
          window.removeEventListener('message', handleMessage)
        }, 600000)
      } else {
        oauthInProgress.value = false
        localError.value = 'Please allow popups for OAuth to work'
      }
    } else {
      oauthInProgress.value = false
      localError.value = 'Failed to get authorization URL'
    }
  } catch {
    oauthInProgress.value = false
    localError.value = 'Failed to start OAuth flow'
  }
}
</script>

<style scoped lang="scss">
.goodreads-info,
.oauth-section,
.success-section {
  text-align: center;
}

.goodreads-info {
  margin-bottom: 2rem;

  .info-icon,
  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  p {
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.oauth-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  margin-bottom: 1rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.continue-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  background: var(--color-accent-primary);
  color: var(--color-bg);

  &:hover {
    background: var(--color-accent-secondary);
  }
}

.oauth-info {
  background: var(--color-bg);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin: 1rem 0;

  p {
    margin: 0.5rem 0;
    color: var(--color-text-secondary);
    font-size: 0.875rem;

    &:first-child {
      margin-top: 0;
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.success {
  &-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  &-section {
    h3 {
      color: var(--color-text);
      margin: 0 0 0.5rem;
    }

    p {
      color: var(--color-text-secondary);
      margin: 0;
    }
  }
}
</style>
