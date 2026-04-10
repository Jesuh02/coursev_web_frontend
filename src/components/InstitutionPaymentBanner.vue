<template>
  <Teleport to="body">
    <transition name="banner-slide">
      <div v-if="showBanner" class="payment-banner" @click.self="collapsed = !collapsed">
        <div class="banner-glass">
          <div class="banner-content">
            <div class="banner-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div class="banner-text">
              <span class="banner-title">Pago vencido</span>
              <span v-if="!collapsed" class="banner-desc">
                La suscripción de tu institución ha vencido{{ dueDate ? ` el ${formattedDueDate}` : '' }}.
              </span>
            </div>
            <button class="banner-pay-btn" @click.stop="handlePay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Pagar
            </button>
            <button class="banner-close" @click.stop="dismiss" title="Cerrar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
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
const collapsed = ref(true)
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
.payment-banner {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: calc(100% - 32px);
  max-width: 480px;
  pointer-events: auto;
}

@media (min-width: 769px) {
  .payment-banner {
    left: calc(50% + 50px);
    bottom: 24px;
  }
}

.banner-glass {
  background: rgba(255, 40, 40, 0.75);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 100, 100, 0.35);
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow:
    0 8px 32px rgba(255, 40, 40, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.banner-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.banner-desc {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.35;
}

.banner-pay-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #D32F2F;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.banner-pay-btn:hover {
  transform: scale(1.04);
  background: #fff;
}

.banner-pay-btn:active {
  transform: scale(0.97);
}

.banner-close {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.banner-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Transition */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
