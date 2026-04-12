<template>
  <Teleport to="body">
    <!-- Floating red notice bar (non-invasive) -->
    <transition name="notice-fade">
      <div v-if="showBanner && !billingStore.dismissed" class="payment-notice">
        <span class="payment-notice-dot"></span>
        <span class="payment-notice-text">
          Pago vencido{{ billingStore.formattedDueDate ? ` · ${billingStore.formattedDueDate}` : '' }}
        </span>
        <button v-if="canPay" class="payment-notice-pay" :disabled="loading" @click.stop="handlePay">
          <span v-if="loading" class="pay-spinner"></span>
          <span v-else>Pagar</span>
        </button>
        <button class="payment-notice-close" @click.stop="billingStore.dismiss()" aria-label="Cerrar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <!-- Top red stripe banner (always visible when overdue, cannot be dismissed) -->
    <transition name="stripe-slide">
      <div v-if="showBanner" class="payment-stripe">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>
          Servicio pendiente de pago{{ billingStore.institutionName ? ` — ${billingStore.institutionName}` : '' }}{{ billingStore.formattedDueDate ? ` — Vence: ${billingStore.formattedDueDate}` : '' }}
        </span>
        <template v-if="canPay">
          <span v-if="displayPrice" class="stripe-price">{{ displayPrice }}</span>
          <button class="stripe-pay-btn" :disabled="loading" @click.stop="handlePay">
            <span v-if="loading" class="pay-spinner pay-spinner-sm"></span>
            <span v-else>Pagar ahora</span>
          </button>
        </template>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useBillingStore } from '@/stores/billingStore'
import { institucionAdapter } from '@/infrastructure/api/institucionAdapter'
import { ref } from 'vue'

const authStore = useAuthStore()
const billingStore = useBillingStore()
const loading = ref(false)

const showBanner = computed(() => billingStore.shouldShowWarning)

// Solo usuarios con rol 3 (admin de institución) pueden ver/usar el botón de pagar
const canPay = computed(() => {
  const roles = authStore.user?.roles ?? []
  return roles.some((r: any) => Number(r.id) === 3)
})

const displayPrice = computed(() => {
  const price = billingStore.monthlyPrice
  if (!price || price <= 0) return ''
  return `$${price.toLocaleString('es-CO')} COP`
})

async function handlePay() {
  if (loading.value) return
  const instId = billingStore.institutionId
  if (!instId) {
    window.open('https://coursev.com/contacto', '_blank')
    return
  }
  loading.value = true
  try {
    // amount=0 → el backend usa el monthly_price de la institución
    const result = await institucionAdapter.initiateBillingPayment(instId, 0)
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    } else {
      window.open('https://coursev.com/contacto', '_blank')
    }
  } catch {
    window.open('https://coursev.com/contacto', '_blank')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.user?.id) {
    billingStore.checkBillingStatus()
    billingStore.startPolling()
  }
})

onUnmounted(() => {
  billingStore.stopPolling()
})

watch(() => authStore.user?.id, (newId) => {
  if (newId) {
    billingStore.$reset()
    billingStore.checkBillingStatus()
    billingStore.startPolling()
  } else {
    billingStore.$reset()
  }
})
</script>

<style scoped>
/* ─── Top stripe banner (always visible, non-dismissible) ─── */
.payment-stripe {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 59, 48, 0.12);
  border-bottom: 1px solid rgba(255, 59, 48, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 12px;
  font-weight: 500;
  color: #FF3B30;
  letter-spacing: -0.01em;
}

.stripe-slide-enter-active,
.stripe-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.stripe-slide-enter-from,
.stripe-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* ─── Floating notice (dismissible) ─── */
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

.payment-notice-pay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* ─── Stripe pay button & price ─── */
.stripe-price {
  font-weight: 700;
  font-size: 12px;
  color: #FF3B30;
  white-space: nowrap;
}

.stripe-pay-btn {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #FF3B30;
  border: none;
  border-radius: 10px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stripe-pay-btn:hover:not(:disabled) {
  background: #e0342b;
}

.stripe-pay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── Spinner ─── */
.pay-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: pay-spin 0.6s linear infinite;
}

.pay-spinner-sm {
  width: 10px;
  height: 10px;
  border-width: 1.5px;
}

@keyframes pay-spin {
  to { transform: rotate(360deg); }
}
</style>
