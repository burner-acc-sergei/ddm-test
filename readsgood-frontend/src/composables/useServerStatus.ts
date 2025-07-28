import { ref, onMounted, onUnmounted } from 'vue'
import { serverService } from '@/services'

export function useServerStatus() {
  const isServerOnline = ref<boolean | null>(null) // null = unknown, true = online, false = offline
  const lastChecked = ref<Date | null>(null)
  let intervalId: number | null = null

  const checkServerStatus = async () => {
    try {
      const status = await serverService.checkStatus()
      isServerOnline.value = status
      lastChecked.value = new Date()
    } catch {
      isServerOnline.value = false
      lastChecked.value = new Date()
    }
  }

  const startPeriodicCheck = (intervalMs = 30000) => { // Default: 30 seconds
    // Check immediately
    checkServerStatus()

    // Then check periodically
    intervalId = window.setInterval(checkServerStatus, intervalMs)
  }

  const stopPeriodicCheck = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    startPeriodicCheck()
  })

  onUnmounted(() => {
    stopPeriodicCheck()
  })

  return {
    isServerOnline,
    lastChecked,
    checkServerStatus,
    startPeriodicCheck,
    stopPeriodicCheck
  }
}
