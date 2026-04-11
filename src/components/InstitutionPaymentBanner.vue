<template>
  <Teleport to="body">
    <transition name="notice-fade">
      <div v-if="showBanner && !dismissed" class="payment-notice">
        <span class="payment-notice-dot"></span>
        <span class="payment-notice-text">
          Pago vencido{{ dueDate ? ` · ${formattedDueDate}` : '' }}
        </span>
        <button class="payment-notice-pay" @click.stop="handlePay">Pagar</button>
        <button class="payment-notice-close" @click.stop="dismiss" aria-label="Cerrar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { institucionAdapter } from '@/infrastructure/api/institucionAdapter'

const authStore = useAuthStore()
const paymentOverdue = ref(false)
const dueDate = ref<string | null>(null)
const institutionId = ref<number | null>(null)
const dismissed = ref(false)
const loading = ref(false)

const isAdmin = computed(() => {
  const roles = authStore.user?.roles ?? []
  return roles.some((r: any) => Number(r.id) === 3)
})

const isSuperAdmin = computed(() => {
  const roles = authStore.user?.roles ?? []
  return roles.some((r: any) => Number(r.id) === 4)
})

const showBanner = computed(() =>
  isAdmin.value && !isSuperAdmin.value && paymentOverdue.value && !dismissed.value
)

const formattedDueDate = computed(() => {
  if (!dueDate.value) return ''
  const d = new Date(dueDate.value)
  return isNaN(d.getTime())
    ? dueDate.value
    : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
})

async function checkBillingStatus() {
  if (!authStore.isAuthenticated || !isAdmin.value || isSuperAdmin.value) return
  try {
    const status = await institucionAdapter.getMyBillingStatus()
    paymentOverdue.value = Boolean(status.paymentOverdue)
    dueDate.value = status.paymentDueDate ?? null
    // Store institution id from user persona
    institutionId.value = authStore.user?.personaId ? (authStore.user as any).persona?.institucion_id ?? null : null
  } catch {
    paymentOverdue.value = false
  }
}

function dismiss() {
  dismissed.value = true
}

async function handlePay() {
  if (loading.value) return
  const instId = institutionId.value
  if (!instId) {
    // Fallback: try to get id from the billing status
    window.open('https://coursev.com/contacto', '_blank')
    return
  }
  loading.value = true
  try {
    const result = await institucionAdapter.initiateBillingPayment(instId, 100000) // default amount
    window.open(result.checkoutUrl, '_blank')
  } catch {
    // Fallback
    window.open('https://coursev.com/contacto', '_blank')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user?.id) checkBillingStatus()
})

watch(() => authStore.user?.id, (newId) => {
  if (newId) {
    dismissed.value = false
    checkBillingStatus()
  } else {
    paymentOverdue.value = false
  }
})
</script>

<style scoped>
.payment-notice {
  position: fixed;
  bottom: 80px;
  right: 16px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px 7px 12px;
  background: rgba(28, 28, 30, 0.9);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  pointer-events: auto;
  max-width: 280px;
}

@media (min-width: 769px) {
  .payment-notice {
    bottom: 24px;
  }
}

.payment-notice-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #FF3B30;
  animation: notice-pulse 2.5s ease-in-out infinite;
}

@keyframes notice-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.payment-notice-text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #FF3B30;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.payment-notice-pay {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #FF3B30;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.25);
  border-radius: 10px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.payment-notice-pay:hover {
  background: rgba(255, 59, 48, 0.18);
}

.payment-notice-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  padding: 0;
  transition: color 0.15s;
}

.payment-notice-close:hover {
  color: rgba(255, 255, 255, 0.65);
}

.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
