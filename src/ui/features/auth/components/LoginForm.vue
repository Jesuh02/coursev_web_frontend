<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <div class="field-group">
      <label class="field-label">Usuario</label>
      <div class="field">
        <div class="field-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <input v-model="username" type="text" placeholder="Ingrese su usuario" required @input="onUsernameInput" />
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">Contraseña</label>
      <div class="field">
        <div class="field-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Ingrese su contraseña" required />
        <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="showPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle v-if="showPassword" cx="12" cy="12" r="3" />
            <path v-else d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line v-if="!showPassword" x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <button type="submit" class="btn-login" :disabled="loading">
      <span v-if="loading" class="spinner"></span>
      <span v-else>Ingresar</span>
    </button>

    <div class="separator">
      <span>o</span>
    </div>

    <slot name="google-button">
      <button type="button" class="btn-google" @click="$emit('google')">
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continuar con Google
      </button>
    </slot>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ loading?: boolean; error?: string }>()
const emit = defineEmits<{ submit: [username: string, password: string]; google: []; 'username-changed': [username: string] }>()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

function onUsernameInput(e: Event) {
  emit('username-changed', (e.target as HTMLInputElement).value)
}

function onSubmit() {
  emit('submit', username.value, password.value)
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  padding-left: 2px;
}

.field {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.2s;
}

.field:focus-within {
  border-color: var(--purple-light);
}

.field-icon {
  display: flex;
  padding: 0 12px;
  color: var(--text-hint);
}

.field input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 12px 14px 0;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
}

.field input::placeholder {
  color: var(--text-hint);
}

.toggle-pw {
  display: flex;
  padding: 0 12px;
  color: var(--text-hint);
}

.error-msg {
  color: var(--red-netflix);
  font-size: 13px;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  transition: box-shadow 0.2s, transform 0.15s;
}

.btn-login:hover:not(:disabled) {
  box-shadow: var(--shadow-glow-purple);
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.6;
}

.separator {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-hint);
  font-size: 13px;
}

.separator::before, .separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
  transition: border-color 0.2s;
}

.btn-google:hover {
  border-color: var(--text-muted);
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
