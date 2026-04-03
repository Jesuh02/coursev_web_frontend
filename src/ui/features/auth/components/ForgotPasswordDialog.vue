<template>
  <div class="dialog-overlay" @click.self="handleClose">
    <div class="dialog-card">
      <!-- Step 1: Email -->
      <template v-if="step === 1">
        <h3>Recuperar contraseña</h3>
        <p>Ingresa tu correo electrónico y te enviaremos un código de 4 dígitos para restablecer tu contraseña.</p>
        <AppInput v-model="email" type="email" placeholder="correo@ejemplo.com" label="Correo electrónico" :error="errorMsg" />
        <div class="dialog-actions">
          <AppButton variant="ghost" @click="handleClose" :disabled="loading">Cancelar</AppButton>
          <AppButton variant="primary" @click="submitEmail" :disabled="loading || !email.trim()">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Enviar código</span>
          </AppButton>
        </div>
      </template>

      <!-- Step 2: Code verification -->
      <template v-else-if="step === 2">
        <h3>Ingresa el código</h3>
        <p>Hemos enviado un código de 4 dígitos a <strong>{{ email }}</strong>. Revisa tu bandeja de entrada.</p>
        <div class="code-inputs">
          <input
            v-for="(_, i) in codeDigits"
            :key="i"
            :ref="el => codeRefs[i] = el as HTMLInputElement"
            v-model="codeDigits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="code-box"
            :class="{ error: !!errorMsg }"
            @input="onDigitInput(i)"
            @keydown.backspace="onBackspace(i)"
            @paste.prevent="onPaste"
          />
        </div>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <div class="dialog-actions">
          <AppButton variant="ghost" @click="step = 1; errorMsg = ''" :disabled="loading">Atrás</AppButton>
          <AppButton variant="primary" @click="submitCode" :disabled="loading || codeValue.length < 4">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Verificar</span>
          </AppButton>
        </div>
        <button class="resend-link" @click="submitEmail" :disabled="loading">Reenviar código</button>
      </template>

      <!-- Step 3: New password -->
      <template v-else-if="step === 3">
        <h3>Nueva contraseña</h3>
        <p>Ingresa y confirma tu nueva contraseña.</p>
        <AppInput v-model="newPassword" :type="showNewPw ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" label="Nueva contraseña">
          <template #suffix>
            <button type="button" class="eye-btn" @click="showNewPw = !showNewPw" :aria-label="showNewPw ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="!showNewPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </template>
        </AppInput>
        <div class="password-hint">
          <div class="hint-item" :class="{ ok: pwChecks.length, fail: newPassword && !pwChecks.length }">
            <span class="hint-dot"></span> Al menos 6 caracteres
          </div>
          <div class="hint-item" :class="{ ok: pwChecks.number, fail: newPassword && !pwChecks.number }">
            <span class="hint-dot"></span> 1 número
          </div>
          <div class="hint-item" :class="{ ok: pwChecks.upper, fail: newPassword && !pwChecks.upper }">
            <span class="hint-dot"></span> 1 letra mayúscula
          </div>
          <div class="hint-item" :class="{ ok: pwChecks.lower, fail: newPassword && !pwChecks.lower }">
            <span class="hint-dot"></span> 1 letra minúscula
          </div>
          <div class="hint-item" :class="{ ok: pwChecks.symbol, fail: newPassword && !pwChecks.symbol }">
            <span class="hint-dot"></span> 1 símbolo (ej. !@#$%)
          </div>
        </div>
        <AppInput v-model="confirmPassword" :type="showConfirmPw ? 'text' : 'password'" placeholder="Repite la contraseña" label="Confirmar contraseña" :error="confirmError">
          <template #suffix>
            <button type="button" class="eye-btn" @click="showConfirmPw = !showConfirmPw" :aria-label="showConfirmPw ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="!showConfirmPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </template>
        </AppInput>
        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
        <div class="dialog-actions">
          <AppButton variant="ghost" @click="step = 2; errorMsg = ''" :disabled="loading">Atrás</AppButton>
          <AppButton variant="primary" @click="submitReset" :disabled="loading || !pwAllValid || !!confirmError">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Cambiar contraseña</span>
          </AppButton>
        </div>
      </template>

      <!-- Step 4: Success -->
      <template v-else-if="step === 4">
        <div class="success-icon">✓</div>
        <h3>¡Contraseña actualizada!</h3>
        <p>Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.</p>
        <div class="dialog-actions">
          <AppButton variant="primary" @click="handleClose">Entendido</AppButton>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'
import { authAdapter } from '@/infrastructure/api/authAdapter'

const emit = defineEmits<{ close: [] }>()

const step = ref(1)
const email = ref('')
const codeDigits = ref(['', '', '', ''])
const codeRefs = ref<HTMLInputElement[]>([])
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showNewPw = ref(false)
const showConfirmPw = ref(false)

const codeValue = computed(() => codeDigits.value.join(''))
const pwChecks = computed(() => ({
  length: newPassword.value.length >= 6,
  number: /[0-9]/.test(newPassword.value),
  upper: /[A-Z]/.test(newPassword.value),
  lower: /[a-z]/.test(newPassword.value),
  symbol: /[^A-Za-z0-9]/.test(newPassword.value),
}))
const pwAllValid = computed(() => Object.values(pwChecks.value).every(Boolean))
const confirmError = computed(() => {
  if (confirmPassword.value && confirmPassword.value !== newPassword.value) return 'Las contraseñas no coinciden'
  return ''
})
const passwordError = computed(() => {
  if (newPassword.value && newPassword.value.length < 6) return 'Mínimo 6 caracteres'
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) return 'Las contraseñas no coinciden'
  return ''
})

function handleClose() {
  if (step.value === 4 || step.value === 1) emit('close')
}

async function submitEmail() {
  if (!email.value.trim()) return
  errorMsg.value = ''
  loading.value = true
  try {
    await authAdapter.forgotPassword(email.value.trim())
    // Always move to step 2 regardless of whether the email exists (security)
    step.value = 2
    codeDigits.value = ['', '', '', '']
    nextTick(() => codeRefs.value[0]?.focus())
  } catch {
    errorMsg.value = 'Ocurrió un error al enviar el código. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

function onDigitInput(i: number) {
  // Allow only digits
  codeDigits.value[i] = codeDigits.value[i].replace(/\D/, '')
  if (codeDigits.value[i] && i < 3) {
    nextTick(() => codeRefs.value[i + 1]?.focus())
  }
}

function onBackspace(i: number) {
  if (!codeDigits.value[i] && i > 0) {
    nextTick(() => codeRefs.value[i - 1]?.focus())
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const digits = text.replace(/\D/g, '').slice(0, 4)
  digits.split('').forEach((d, i) => { codeDigits.value[i] = d })
  nextTick(() => codeRefs.value[Math.min(digits.length, 3)]?.focus())
}

async function submitCode() {
  if (codeValue.value.length < 4) return
  errorMsg.value = ''
  loading.value = true
  try {
    const result = await authAdapter.verifyResetCode(email.value.trim(), codeValue.value)
    if (result.valid) {
      step.value = 3
    } else {
      errorMsg.value = 'Código incorrecto o expirado. Verifica e intenta de nuevo.'
    }
  } catch {
    errorMsg.value = 'Ocurrió un error al verificar el código. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}

async function submitReset() {
  if (!pwAllValid.value || confirmError.value || !newPassword.value) return
  errorMsg.value = ''
  loading.value = true
  try {
    await authAdapter.resetPassword(email.value.trim(), codeValue.value, newPassword.value)
    step.value = 4
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message
    errorMsg.value = msg || 'Ocurrió un error al cambiar la contraseña. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
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
  padding: 28px 24px;
  max-width: 420px;
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

/* Password hint checklist */
.password-hint {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: -4px 0 4px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  transition: color 0.2s;
}

.hint-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
  transition: background 0.2s;
}

.hint-item.ok {
  color: #4ade80;
}
.hint-item.ok .hint-dot {
  background: #4ade80;
}
.hint-item.fail {
  color: #ef4444;
}
.hint-item.fail .hint-dot {
  background: #ef4444;
}

/* Code digit inputs */
.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 8px 0;
}

.code-box {
  width: 56px;
  height: 64px;
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  background: var(--bg-input, rgba(255,255,255,0.05));
  color: var(--text-primary, #fff);
  outline: none;
  transition: border-color 0.2s;
}

.code-box:focus {
  border-color: var(--color-primary, #8B5CF6);
}

.code-box.error {
  border-color: #ef4444;
}

.error-text {
  font-size: 13px;
  color: #ef4444;
  text-align: center;
  margin: 0;
}

.resend-link {
  background: none;
  border: none;
  color: var(--color-primary, #8B5CF6);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  margin-top: -4px;
}

.resend-link:disabled {
  opacity: 0.5;
  cursor: default;
}

.eye-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 0 2px;
}

.eye-btn:hover {
  color: var(--text-primary, #fff);
}

/* Success */
.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #22c55e22;
  color: #22c55e;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
