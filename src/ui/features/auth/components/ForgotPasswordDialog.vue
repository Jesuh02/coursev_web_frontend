<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-card">
      <h3>Recuperar contraseña</h3>
      <p>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
      <AppInput v-model="email" type="email" placeholder="correo@ejemplo.com" label="Correo electrónico" />
      <div class="dialog-actions">
        <AppButton variant="ghost" @click="$emit('close')">Cancelar</AppButton>
        <AppButton variant="primary" @click="submit">Enviar</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

defineEmits<{ close: [] }>()

const email = ref('')

function submit() {
  // TODO: connect to API
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.dialog-card {
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-card h3 {
  font-size: 18px;
  font-weight: 700;
}

.dialog-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
