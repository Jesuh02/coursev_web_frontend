<template>
  <div class="payment-form">
    <TopBar title="Pago" @back="$router.back()" />

    <div class="payment-content">
      <div class="course-summary">
        <div class="summary-thumb">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </div>
        <div class="summary-info">
          <p class="summary-title">Curso Premium</p>
          <p class="summary-price">$0.00</p>
        </div>
      </div>

      <form class="card-form" @submit.prevent="processPayment">
        <AppInput v-model="form.cardNumber" label="Número de tarjeta" placeholder="1234 5678 9012 3456" />
        <div class="form-row">
          <AppInput v-model="form.expiry" label="Vencimiento" placeholder="MM/YY" />
          <AppInput v-model="form.cvv" label="CVV" placeholder="123" type="password" />
        </div>
        <AppInput v-model="form.name" label="Nombre en la tarjeta" />

        <div class="security-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span>Pago seguro y encriptado</span>
        </div>

        <AppButton type="submit" :loading="processing" full>Pagar</AppButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const processing = ref(false)
const form = reactive({
  cardNumber: '',
  expiry: '',
  cvv: '',
  name: ''
})

async function processPayment() {
  processing.value = true
  await new Promise(r => setTimeout(r, 2000))
  processing.value = false
}
</script>

<style scoped>
.payment-form { min-height: 100vh; background: var(--bg-primary); }
.payment-content { padding: 16px; display: flex; flex-direction: column; gap: 20px; }

.course-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #1C1C1E;
  border-radius: 16px;
}

.summary-thumb {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255,215,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-title { font-size: 16px; font-weight: 600; color: #fff; }
.summary-price { font-size: 20px; font-weight: 700; color: #FFD700; margin-top: 2px; }

.card-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.security-note {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  color: #30D158;
  font-size: 12px;
}
</style>
