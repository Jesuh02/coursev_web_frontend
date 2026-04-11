import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { institucionAdapter } from '@/infrastructure/api/institucionAdapter'

export const useBillingStore = defineStore('billing', () => {
  const billingDueDate = ref<string | null>(null)
  const paymentOverdue = ref(false)
  const dismissed = ref(false)
  const checked = ref(false)
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setTimeout> | null = null

  const authStore = useAuthStore()

  const isRole3Only = computed(() => {
    const roles = authStore.user?.roles ?? []
    return roles.some((r: any) => Number(r.id) === 3) && !roles.some((r: any) => Number(r.id) === 4)
  })

  const shouldShowWarning = computed(() => {
    if (!isRole3Only.value) return false
    if (!paymentOverdue.value) return false
    return true
  })

  const formattedDueDate = computed(() => {
    if (!billingDueDate.value) return ''
    const d = new Date(billingDueDate.value)
    return isNaN(d.getTime())
      ? billingDueDate.value
      : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  })

  /** Schedule a local countdown if due date is in the near future (< 30 min) */
  function scheduleLocalCountdown() {
    if (countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null }
    if (!billingDueDate.value || paymentOverdue.value) return
    const dueMs = new Date(billingDueDate.value).getTime()
    if (isNaN(dueMs)) return
    const diff = dueMs - Date.now()
    if (diff <= 0) {
      // Already past due
      paymentOverdue.value = true
      return
    }
    // If due within 30 minutes, set a precise local timer
    if (diff <= 30 * 60_000) {
      countdownTimer = setTimeout(() => {
        paymentOverdue.value = true
        // Also re-check from server to confirm
        checkBillingStatus()
      }, diff)
    }
  }

  async function checkBillingStatus() {
    if (!authStore.isAuthenticated || !isRole3Only.value) return
    try {
      const status = await institucionAdapter.getMyBillingStatus()
      paymentOverdue.value = Boolean(status.paymentOverdue)
      billingDueDate.value = status.paymentDueDate ?? null
      checked.value = true
      // If not overdue yet, schedule local countdown for precise timing
      if (!paymentOverdue.value && billingDueDate.value) {
        scheduleLocalCountdown()
      }
    } catch {
      paymentOverdue.value = false
    }
  }

  /** Start periodic polling every 30 seconds to detect billing changes */
  function startPolling() {
    stopPolling()
    if (!isRole3Only.value) return
    pollTimer = setInterval(() => {
      checkBillingStatus()
    }, 30_000)
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    if (countdownTimer) { clearTimeout(countdownTimer); countdownTimer = null }
  }

  function dismiss() {
    dismissed.value = true
    // Auto re-show after 5 minutes
    setTimeout(() => { dismissed.value = false }, 5 * 60 * 1000)
  }

  function $reset() {
    billingDueDate.value = null
    paymentOverdue.value = false
    dismissed.value = false
    checked.value = false
    stopPolling()
  }

  // Auto-start/stop polling when role changes
  watch(isRole3Only, (is3) => {
    if (is3) {
      checkBillingStatus()
      startPolling()
    } else {
      stopPolling()
    }
  }, { immediate: false })

  return {
    billingDueDate,
    paymentOverdue,
    dismissed,
    checked,
    isRole3Only,
    shouldShowWarning,
    formattedDueDate,
    checkBillingStatus,
    startPolling,
    stopPolling,
    dismiss,
    $reset,
  }
})
