<template>
  <div class="register-page">
    <div class="particles">
      <div v-for="i in 3" :key="i" class="particle" :style="{ animationDelay: `${i * 0.8}s` }"></div>
    </div>

    <div class="register-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-accent)" stroke-width="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
        <h1>Crear Cuenta</h1>
        <p>Únete a la plataforma educativa</p>
      </div>
    </div>

    <form class="register-card animate-fade-in-up" @submit.prevent="handleRegister">
      <div class="avatar-upload">
        <div class="avatar-glow-ring"></div>
        <div class="avatar-preview">
          <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" />
          <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <label class="avatar-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
          <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        </label>
      </div>

      <section class="form-section">
        <h3 class="section-title">Información Personal</h3>
        <div class="row">
          <AppInput v-model="form.nombres" label="Nombres" placeholder="Tus nombres" :error="fieldErrors.nombres" />
          <AppInput v-model="form.apellidos" label="Apellidos" placeholder="Tus apellidos" :error="fieldErrors.apellidos" />
        </div>
        <div class="row">
          <AppInput v-model="form.cedula" label="Cédula" placeholder="Número de cédula" :error="fieldErrors.cedula" />
          <div class="select-field" :class="{ error: !!fieldErrors.genero }">
            <label class="select-label">Género</label>
            <select v-model="form.genero">
              <option value="">Selecciona una opción</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decirlo">Prefiero no decirlo</option>
            </select>
            <span v-if="fieldErrors.genero" class="select-error">{{ fieldErrors.genero }}</span>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Información de Contacto</h3>
        <AppInput v-model="form.email" type="email" label="Correo electrónico" placeholder="correo@ejemplo.com" :error="fieldErrors.email" :disabled="isGoogleSignIn" />
        <div class="autocomplete-wrapper">
          <AppInput v-model="institucionQuery" label="Institución" placeholder="Buscar institución..." :error="fieldErrors.institucion" @update:modelValue="onInstitucionInput" @focus="showInstitucionList = true" @blur="onInstitucionBlur" />
          <ul v-if="showInstitucionList && filteredInstituciones.length" class="autocomplete-list">
            <li v-for="inst in filteredInstituciones" :key="inst.id" @mousedown.prevent="selectInstitucion(inst)">
              <span class="inst-name">{{ inst.nombre }}</span>
              <span v-if="inst.ciudad" class="inst-city">{{ inst.ciudad }}</span>
            </li>
          </ul>
        </div>
        <div class="row">
          <AppInput v-model="form.telefono" type="tel" label="Teléfono" placeholder="+57" :error="fieldErrors.telefono" />
          <AppInput v-model="form.fecha_nacimiento" type="date" label="Fecha de nacimiento" :error="fieldErrors.fecha_nacimiento" />
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Credenciales</h3>
        <p v-if="isGoogleSignIn" class="google-prefill-note">Tu correo de Google fue precargado. Completa el resto de tu perfil para continuar.</p>
        <AppInput v-model="form.username" label="Usuario" placeholder="Nombre de usuario" :error="fieldErrors.username" />
        <AppInput v-model="form.password" :type="showPassword ? 'text' : 'password'" label="Contraseña" placeholder="Contraseña segura" :error="fieldErrors.password">
          <template #suffix>
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </template>
        </AppInput>
        <div class="password-hint">
          <div class="hint-item" :class="{ ok: passwordChecks.length, fail: form.password && !passwordChecks.length }">
            <span class="hint-dot"></span> Al menos 6 caracteres
          </div>
          <div class="hint-item" :class="{ ok: passwordChecks.number, fail: form.password && !passwordChecks.number }">
            <span class="hint-dot"></span> 1 número
          </div>
          <div class="hint-item" :class="{ ok: passwordChecks.upper, fail: form.password && !passwordChecks.upper }">
            <span class="hint-dot"></span> 1 letra mayúscula
          </div>
          <div class="hint-item" :class="{ ok: passwordChecks.lower, fail: form.password && !passwordChecks.lower }">
            <span class="hint-dot"></span> 1 letra minúscula
          </div>
          <div class="hint-item" :class="{ ok: passwordChecks.symbol, fail: form.password && !passwordChecks.symbol }">
            <span class="hint-dot"></span> 1 símbolo (ej. !@#$%)
          </div>
        </div>
        <AppInput v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" label="Confirmar contraseña" placeholder="Repite la contraseña" :error="passwordError">
          <template #suffix>
            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="!showConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </template>
        </AppInput>
      </section>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

      <AppButton variant="primary" block :loading="loading" @click="handleRegister">
        {{ isGoogleSignIn ? 'Completar registro' : 'Crear Cuenta' }}
      </AppButton>

      <p class="login-link">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { HttpError, institucionAdapter } from '@/infrastructure/api'
import type { Institucion } from '@/domain/models'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const avatarPreview = ref<string | null>(null)
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const submitError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const instituciones = ref<Institucion[]>([])
const institucionQuery = ref('')
const showInstitucionList = ref(false)
const selectedInstitucionId = ref<number | null>(null)
const isGoogleSignIn = computed(() => route.query.isGoogleSignIn === '1')

function getSingleQueryValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}

const filteredInstituciones = computed(() => {
  const q = institucionQuery.value.toLowerCase()
  if (!q) return instituciones.value
  return instituciones.value.filter(i => i.nombre.toLowerCase().includes(q))
})

function onInstitucionInput() {
  selectedInstitucionId.value = null
  showInstitucionList.value = true
}

function onInstitucionBlur() {
  setTimeout(() => { showInstitucionList.value = false }, 150)
}

function selectInstitucion(inst: Institucion) {
  institucionQuery.value = inst.nombre
  selectedInstitucionId.value = inst.id
  showInstitucionList.value = false
}

onMounted(async () => {
  try {
    instituciones.value = await institucionAdapter.getAll()
  } catch { /* silent */ }

  const googleEmail = getSingleQueryValue(route.query.googleEmail).trim()
  if (!googleEmail) return

  form.value.email = googleEmail
  form.value.nombres = getSingleQueryValue(route.query.googleNombres).trim()
  form.value.apellidos = getSingleQueryValue(route.query.googleApellidos).trim()

  const googleAvatar = getSingleQueryValue(route.query.googleAvatar).trim()
  if (googleAvatar) {
    avatarPreview.value = googleAvatar
  }
})

const form = ref({
  nombres: '',
  apellidos: '',
  cedula: '',
  genero: '',
  email: '',
  institucion: '',
  telefono: '',
  fecha_nacimiento: '',
  username: '',
  password: '',
})

const passwordChecks = computed(() => ({
  length: form.value.password.length >= 6,
  number: /[0-9]/.test(form.value.password),
  upper: /[A-Z]/.test(form.value.password),
  lower: /[a-z]/.test(form.value.password),
  symbol: /[^A-Za-z0-9]/.test(form.value.password),
}))

const passwordError = computed(() => {
  if (confirmPassword.value && confirmPassword.value !== form.value.password) return 'Las contraseñas no coinciden'
  return ''
})

function validateForm() {
  const errors: Record<string, string> = {}

  if (!form.value.nombres.trim()) errors.nombres = 'Campo requerido'
  if (!form.value.apellidos.trim()) errors.apellidos = 'Campo requerido'
  if (!/^\d{6,20}$/.test(form.value.cedula.trim())) errors.cedula = 'Ingresa una cédula válida'
  if (!form.value.genero) errors.genero = 'Selecciona un género'
  if (!form.value.email.trim()) errors.email = 'Campo requerido'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email.trim())) errors.email = 'Correo inválido'
  if (!selectedInstitucionId.value) errors.institucion = 'Selecciona una institución'
  if (!form.value.telefono.trim()) errors.telefono = 'Campo requerido'
  if (!form.value.fecha_nacimiento) errors.fecha_nacimiento = 'Campo requerido'
  if (!form.value.username.trim()) errors.username = 'Campo requerido'
  if (form.value.username.trim().length < 4) errors.username = 'Mínimo 4 caracteres'
  if (!form.value.password) errors.password = 'Campo requerido'
  else if (!passwordChecks.value.length) errors.password = 'Mínimo 6 caracteres'
  else if (!passwordChecks.value.number) errors.password = 'Debe incluir al menos 1 número'
  else if (!passwordChecks.value.upper) errors.password = 'Debe incluir al menos 1 mayúscula'
  else if (!passwordChecks.value.lower) errors.password = 'Debe incluir al menos 1 minúscula'
  else if (!passwordChecks.value.symbol) errors.password = 'Debe incluir al menos 1 símbolo'

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function handleRegister() {
  submitError.value = ''
  if (!validateForm() || passwordError.value) return
  loading.value = true
  try {
    await authStore.register(
      form.value.username.trim(),
      form.value.password,
      form.value.email.trim(),
      undefined,
      {
        nombres: form.value.nombres.trim(),
        apellidos: form.value.apellidos.trim(),
        cedula: form.value.cedula.trim(),
        genero: form.value.genero,
        telefono: form.value.telefono.trim(),
        fecha_nacimiento: form.value.fecha_nacimiento,
        institucion_id: selectedInstitucionId.value,
      },
    )
    router.push('/video')
  } catch (error) {
    submitError.value = error instanceof HttpError ? error.message : 'No se pudo completar el registro'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow-y: auto;
  padding-bottom: 40px;
  position: relative;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.particle:nth-child(1) { top: 5%; left: 10%; }
.particle:nth-child(2) { top: 15%; right: 15%; width: 35px; height: 35px; }
.particle:nth-child(3) { top: 3%; left: 55%; width: 25px; height: 25px; }

.register-header {
  position: relative;
  text-align: center;
  padding: 40px 24px 20px;
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(106, 27, 154, 0.35) 0%, transparent 100%);
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-content h1 {
  font-size: 28px;
  font-weight: 800;
  margin-top: 8px;
  background: linear-gradient(135deg, var(--purple-light), var(--cyan-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content p {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.google-prefill-note {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.register-card {
  margin: 0 16px;
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 8px;
}

.avatar-glow-ring {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
  animation: pulse-glow 3s infinite;
}

.avatar-preview {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--purple-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-btn {
  position: absolute;
  bottom: 0;
  right: calc(50% - 58px);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--purple-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  z-index: 2;
  border: 2px solid var(--bg-card-hover);
}

.hidden {
  display: none;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.select-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.select-field select {
  min-height: 46px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 0 16px;
  font-size: 15px;
  outline: none;
}

.select-field.error select {
  border-color: var(--red-netflix);
}

.select-error,
.submit-error {
  font-size: 12px;
  color: var(--red-netflix);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: var(--text-muted);
}

.login-link a {
  color: var(--purple-light);
  font-weight: 600;
}

.autocomplete-wrapper {
  position: relative;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-top: 4px;
  padding: 0;
  list-style: none;
  z-index: 10;
}

.autocomplete-list li {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s;
}

.autocomplete-list li:hover {
  background: var(--bg-surface);
}

.inst-name {
  font-size: 14px;
  color: var(--text-primary);
}

.inst-city {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Password hint box ── */
.password-hint {
  background: rgba(139, 92, 246, 0.07);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  transition: color 0.2s;
}

.hint-item .hint-dot {
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
  color: var(--red-netflix);
}
.hint-item.fail .hint-dot {
  background: var(--red-netflix);
}

.eye-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  height: 100%;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--purple-light);
}
</style>
