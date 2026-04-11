import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { institucionAdapter } from '@/infrastructure/api/institucionAdapter'

export const useBillingStore = defineStore('billing', () => {
  const billingDueDate = ref<string | null>(null)
  const paymentOverdue = ref(false)
  const dismissed = ref(false)
  const checked = ref(false)

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

  async function checkBillingStatus() {
    if (!authStore.isAuthenticated || !isRole3Only.value) return
    try {
      const status = await institucionAdapter.getMyBillingStatus()
      paymentOverdue.value = Boolean(status.paymentOverdue)
      billingDueDate.value = status.paymentDueDate ?? null
      checked.value = true
    } catch {
      paymentOverdue.value = false
    }
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
  }

  return {
    billingDueDate,
    paymentOverdue,
    dismissed,
    checked,
    isRole3Only,
    shouldShowWarning,
    formattedDueDate,
    checkBillingStatus,
    dismiss,
    $reset,
  }
})
