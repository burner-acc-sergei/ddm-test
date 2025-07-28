<template>
  <rg-modal :show="show" max-width="400px" @close="closeModal">
    <template #header>
      <h2>{{ isLoginMode ? 'Login' : 'Register' }}</h2>
    </template>

    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :disabled="authStore.isLoading"
          autocomplete="username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          :disabled="authStore.isLoading"
          :autocomplete="isLoginMode ? 'current-password' : 'new-password'"
        />
      </div>

      <div v-if="!isLoginMode" class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          :disabled="authStore.isLoading"
          autocomplete="new-password"
        />
      </div>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <div v-if="localError" class="error-message">
        {{ localError }}
      </div>

      <button type="submit" class="submit-btn" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">
          {{ isLoginMode ? 'Logging in...' : 'Registering...' }}
        </span>
        <span v-else>
          {{ isLoginMode ? 'Login' : 'Register' }}
        </span>
      </button>
    </form>

    <template #footer>
      <button
        type="button"
        class="toggle-mode-btn"
        @click="toggleMode"
        :disabled="authStore.isLoading"
      >
        {{ isLoginMode ? 'Need an account? Register' : 'Already have an account? Login' }}
      </button>
    </template>
  </rg-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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
const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const localError = ref('')

// Methods
function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  clearForm()
}

function clearForm() {
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
  localError.value = ''
  authStore.clearError()
}

function closeModal() {
  clearForm()
  emit('close')
}

async function handleSubmit() {
  console.log('Submitting form:', {
    isLoginMode: isLoginMode.value,
    username: username.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  })
  localError.value = ''
  authStore.clearError()

  // Validation
  if (!username.value.trim() || !password.value.trim()) {
    localError.value = 'Username and password are required'
    return
  }

  if (!isLoginMode.value) {
    if (password.value !== confirmPassword.value) {
      localError.value = 'Passwords do not match'
      return
    }
    if (password.value.length < 2) {
      localError.value = 'Password must be at least 2 characters'
      return
    }
  }

  // Submit
  let success = false
  if (isLoginMode.value) {
    success = await authStore.login(username.value.trim(), password.value)
  } else {
    // Register first
    success = await authStore.register({
      username: username.value.trim(),
      password: password.value,
    })

    // If registration successful, automatically log in
    if (success) {
      success = await authStore.login(username.value.trim(), password.value)
    }
  }

  if (success) {
    closeModal()
  }
}

watch(isLoginMode, () => {
  localError.value = ''
  authStore.clearError()
})
</script>

<style scoped lang="scss">
.auth-form {
  padding: 0;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-text);
    font-size: 0.875rem;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-accent-primary);
    border-radius: var(--border-radius);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--color-accent-secondary);
      box-shadow: var(--input-focus-shadow);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.error-message {
  color: #dc2626;
  padding: 0.75rem var(--border-radius);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.submit-btn {
  margin-top: 1.75rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: var(--color-accent-primary);
  color: var(--color-bg);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--color-accent-secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.toggle-mode-btn {
  width: 100%;
  background: none;
  border: none;
  color: var(--color-accent-primary);
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  padding: 0.5rem;

  &:hover:not(:disabled) {
    color: var(--color-accent-secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
