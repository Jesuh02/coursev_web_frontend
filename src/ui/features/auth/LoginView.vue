<template>
  <div class="login-page">
    <div class="particles">
      <div v-for="i in 3" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <div class="login-wrapper">
    <div class="login-header">
      <div class="header-content">
        <h1 class="brand">CourseV <span class="brand-emoji">📋</span></h1>
      </div>
    </div>

    <div class="login-avatar">
      <div class="avatar-glow"></div>
      <div class="avatar-circle">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
      </div>
    </div>

    <div class="login-card animate-fade-in-up">
      <LoginForm @submit="handleLogin" :loading="loading" :error="error" @username-changed="currentUsername = $event">
        <template #google-button>
          <div class="google-signin-shell" :class="{ 'is-overlay-active': googleButtonEnabled && !loading }">
            <button type="button" class="google-signin-facade" :disabled="loading" @click="handleGoogle">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>
            <div ref="googleButtonHost" class="google-button-host" aria-hidden="true"></div>
          </div>
        </template>
      </LoginForm>

      <!-- Campo de cédula: aparece cuando dos usuarios comparten credenciales -->
      <div v-if="showCedula" class="cedula-section">
        <p class="cedula-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Ingresa tu número de cédula para identificar tu cuenta
        </p>
        <div class="cedula-field">
          <input
            v-model="cedula"
            type="text"
            inputmode="numeric"
            placeholder="Número de cédula"
            class="cedula-input"
            @keydown.enter="handleCedulaSubmit"
          />
        </div>
        <button
          class="btn-cedula"
          :disabled="loading || !cedula.trim()"
          @click="handleCedulaSubmit"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Confirmar identidad</span>
        </button>
      </div>

      <div class="login-footer">
        <button class="forgot-link" @click="showForgotPassword = true">¿Olvidaste tu contraseña?</button>

      </div>
    </div>

    <!-- Selección de institución: cuando la cédula coincide en ambas bases de datos -->
    <TenantSelectionDialog
      v-if="pendingMatches.length > 0"
      :matches="pendingMatches"
      @select="handleTenantSelect"
      @close="pendingMatches = []"
    />

    <ForgotPasswordDialog v-if="showForgotPassword" @close="showForgotPassword = false" />
    </div><!-- /login-wrapper -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { resolveLogin, resolveGoogleLogin, CedulaRequiredError, MultipleTenantError, GoogleAccountNotFoundError, InstitutionSuspendedError } from '@/infrastructure/api/tenantResolver'
import type { TenantLoginResult } from '@/infrastructure/api/tenantResolver'
import LoginForm from './components/LoginForm.vue'
import ForgotPasswordDialog from './components/ForgotPasswordDialog.vue'
import TenantSelectionDialog from './components/TenantSelectionDialog.vue'

declare global {
  interface GoogleCredentialResponse {
    credential: string
  }

  interface GoogleIdConfiguration {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    ux_mode?: 'popup' | 'redirect'
    itp_support?: boolean
    use_fedcm_for_prompt?: boolean
    use_fedcm_for_button?: boolean
    button_auto_select?: boolean
  }

  interface GoogleButtonConfiguration {
    type?: 'standard' | 'icon'
    theme?: 'outline' | 'filled_blue' | 'filled_black'
    size?: 'large' | 'medium' | 'small'
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
    shape?: 'rectangular' | 'pill' | 'circle' | 'square'
    logo_alignment?: 'left' | 'center'
    width?: string
    locale?: string
  }

  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: GoogleIdConfiguration): void
          renderButton(element: HTMLElement, config: GoogleButtonConfiguration): void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const showForgotPassword = ref(false)
const googleButtonHost = ref<HTMLElement | null>(null)
const googleButtonEnabled = ref(false)

// Estado para desambiguación por cédula y selección de institución
const showCedula = ref(false)
const cedula = ref('')
const pendingMatches = ref<TenantLoginResult[]>([])
const pendingUsername = ref('')
const pendingPassword = ref('')
const currentUsername = ref('')

// Datos de Google pendientes para re-autenticación tras selección de tenant
let pendingGoogleIdToken = ''
let pendingGoogleDisplayName = ''
let pendingGoogleAvatarUrl: string | undefined
let googleInitialized = false
let googleButtonWidth = 0

function getGoogleAccounts() {
  return window.google?.accounts.id
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return }
    const existing = document.getElementById('google-gis-script')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    const script = document.createElement('script')
    script.id = 'google-gis-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

function decodeJwtPayload(token: string): Record<string, string> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

async function initializeGoogle(): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    return
  }

  await loadGoogleScript()
  const accounts = getGoogleAccounts()

  if (!accounts) {
    throw new Error('Google Sign-In no pudo inicializarse.')
  }

  if (googleInitialized) {
    return
  }

  accounts.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
    ux_mode: 'popup',
    itp_support: true,
    use_fedcm_for_prompt: false,
    use_fedcm_for_button: false,
    button_auto_select: false,
  })

  googleInitialized = true
}

async function renderGoogleButton(force = false): Promise<void> {
  if (!GOOGLE_CLIENT_ID || !googleButtonHost.value) {
    googleButtonEnabled.value = false
    return
  }

  await initializeGoogle()
  const accounts = getGoogleAccounts()

  if (!accounts) {
    googleButtonEnabled.value = false
    return
  }

  const width = Math.min(Math.max(Math.round(googleButtonHost.value.clientWidth || 320), 240), 400)
  if (!force && googleButtonWidth === width && googleButtonHost.value.childElementCount > 0) {
    googleButtonEnabled.value = true
    return
  }

  googleButtonHost.value.innerHTML = ''
  accounts.renderButton(googleButtonHost.value, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: String(width),
    locale: 'es-419',
  })

  googleButtonWidth = width
  googleButtonEnabled.value = true
}

function handleResize() {
  void renderGoogleButton(true)
}

onMounted(async () => {
  // Si ya hay una sesión activa, redirigir sin mostrar el login (igual que LoginFragment.kt)
  if (authStore.isAuthenticated) {
    await authStore.fetchProfile()
    if (authStore.isAuthenticated) {
      router.replace('/video')
      return
    }
  }

  if (!GOOGLE_CLIENT_ID) return

  await nextTick()

  try {
    await renderGoogleButton(true)
    window.addEventListener('resize', handleResize)
  } catch (e) {
    googleButtonEnabled.value = false
    error.value = e instanceof Error ? e.message : 'Google Sign-In no está disponible en este momento.'
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

async function handleGoogleCredential(response: GoogleCredentialResponse) {
  loading.value = true
  error.value = ''
  try {
    const payload = decodeJwtPayload(response.credential)
    const email = payload.email || ''
    const displayName = payload.name || email.split('@')[0]
    const avatarUrl = payload.picture || undefined
    const result = await resolveGoogleLogin(response.credential, displayName, avatarUrl)
    await authStore.commitAuth(result, undefined, { idToken: response.credential, displayName, avatarUrl })
    router.push('/video')
  } catch (e) {
    if (e instanceof MultipleTenantError) {
      // Guardar datos de Google para re-autenticación tras selección de tenant
      pendingGoogleIdToken = response.credential
      const payload = decodeJwtPayload(response.credential)
      pendingGoogleDisplayName = payload.name || payload.email?.split('@')[0]
      pendingGoogleAvatarUrl = payload.picture || undefined
      pendingMatches.value = e.matches
    } else if (e instanceof GoogleAccountNotFoundError) {
      error.value = 'Usuario no encontrado'
    } else if (e instanceof InstitutionSuspendedError) {
      error.value = e.message
    } else {
      error.value = e instanceof Error ? e.message : 'Error con Google'
    }
  } finally {
    loading.value = false
  }
}

async function handleLogin(username: string, password: string) {
  loading.value = true
  error.value = ''
  // Guardar credenciales por si se necesita retry con cédula
  pendingUsername.value = username
  pendingPassword.value = password
  try {
    const result = await resolveLogin(username, password)
    await authStore.commitAuth(result, { username, password })
    router.push('/video')
  } catch (e) {
    if (e instanceof CedulaRequiredError) {
      showCedula.value = true
      error.value = 'Tu cédula es necesaria para identificar tu cuenta entre varias instituciones'
    } else if (e instanceof MultipleTenantError) {
      pendingMatches.value = e.matches
    } else if (e instanceof InstitutionSuspendedError) {
      error.value = e.message
    } else {
      error.value = e instanceof Error ? e.message : 'Credenciales incorrectas'
    }
  } finally {
    loading.value = false
  }
}

/** Se llama cuando el usuario ingresa su cédula después del campo de desambiguación */
async function handleCedulaSubmit() {
  if (!cedula.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const result = await resolveLogin(pendingUsername.value, pendingPassword.value, cedula.value.trim())
    await authStore.commitAuth(result, { username: pendingUsername.value, password: pendingPassword.value })
    router.push('/video')
  } catch (e) {
    if (e instanceof MultipleTenantError) {
      // La cédula coincide en múltiples instituciones → mostrar selección
      pendingMatches.value = e.matches
    } else {
      error.value = e instanceof Error ? e.message : 'Cédula no encontrada o inválida'
    }
  } finally {
    loading.value = false
  }
}

/** Se llama cuando el usuario selecciona una institución del diálogo */
async function handleTenantSelect(match: TenantLoginResult) {
  pendingMatches.value = []
  loading.value = true
  error.value = ''
  try {
    const hasCredentials = pendingUsername.value && pendingPassword.value
    const googleData = pendingGoogleIdToken
      ? { idToken: pendingGoogleIdToken, displayName: pendingGoogleDisplayName, avatarUrl: pendingGoogleAvatarUrl }
      : undefined
    await authStore.commitAuth(
      match,
      hasCredentials ? { username: pendingUsername.value, password: pendingPassword.value } : undefined,
      googleData,
    )
    // Limpiar datos pendientes de Google
    pendingGoogleIdToken = ''
    pendingGoogleDisplayName = ''
    pendingGoogleAvatarUrl = undefined
    router.push('/video')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  if (loading.value) {
    return
  }

  if (!GOOGLE_CLIENT_ID) {
    error.value = 'Google Sign-In no configurado. Configura VITE_GOOGLE_CLIENT_ID.'
    return
  }

  try {
    await renderGoogleButton(true)
  } catch {
    googleButtonEnabled.value = false
  }

  if (!googleButtonEnabled.value) {
    error.value = 'Google Sign-In fue bloqueado por el navegador o no está disponible. Habilita el acceso de terceros para este sitio e inténtalo de nuevo.'
  }
}

function particleStyle(i: number) {
  const positions = [
    { top: '10%', left: '15%', size: 60, delay: 0 },
    { top: '25%', right: '10%', size: 40, delay: 1 },
    { top: '5%', left: '60%', size: 30, delay: 2 },
  ]
  const p = positions[i - 1]
  return {
    ...p,
    width: `${p.size}px`,
    height: `${p.size}px`,
    animationDelay: `${p.delay}s`,
  }
}
</script>

<style scoped>
.login-page {
  flex: 1;
  min-height: 0;
  background: var(--bg-secondary);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  display: flex;
  justify-content: center;
}

.login-wrapper {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
  align-self: flex-start;
  padding-bottom: max(32px, env(safe-area-inset-bottom, 0px) + 16px);
}

/* ── Partículas flotantes ── */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.25), transparent 70%);
  animation: float 7s ease-in-out infinite;
}

/* ── Header morado sólido ── */
.login-header {
  position: relative;
  background: linear-gradient(160deg, #7C3AED 0%, #5B21B6 60%, #4C1D95 100%);
  border-radius: 0 0 36px 36px;
  padding: 56px 24px 60px;
  text-align: center;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(91, 33, 182, 0.5);
}

.login-header::before {
  content: '';
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  animation: float 8s ease-in-out infinite;
}

.login-header::after {
  content: '';
  position: absolute;
  bottom: -30px;
  right: -20px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  animation: float 10s ease-in-out infinite reverse;
}

.header-content {
  position: relative;
  z-index: 1;
}

.brand {
  font-size: 40px;
  font-weight: 800;
  font-style: italic;
  color: #fff;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 16px rgba(0,0,0,0.3);
  animation: fade-in-down 0.6s ease forwards;
}

.brand-emoji {
  font-style: normal;
  font-size: 34px;
}

/* ── Avatar superpuesto ── */
.login-avatar {
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 5;
  margin-top: -44px;
  margin-bottom: 12px;
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.45), transparent 70%);
  animation: pulse-glow 3s ease-in-out infinite;
}

.avatar-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #0f0f1a;
  border: 2.5px solid var(--purple-light);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.35);
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ── Card principal ── */
.login-card {
  margin: 0 16px 24px;
  background: var(--bg-card-hover);
  border-radius: var(--radius-xl);
  padding: 24px 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  animation: fade-in-up 0.55s ease forwards;
}

/* ── Footer: olvidé contraseña + registro ── */
.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}

.forgot-link {
  color: var(--purple-light);
  font-size: 13px;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.75;
}

.register-link {
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--purple-light);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: background 0.2s, transform 0.15s;
}

.register-link:hover {
  background: rgba(139, 92, 246, 0.1);
}

.register-link:active {
  transform: scale(0.98);
}

.register-link span {
  color: var(--purple-light);
  font-weight: 700;
}

/* ── Campo de cédula (desambiguación) ── */
.cedula-section {
  margin-top: 16px;
  padding: 16px;
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fade-in-up 0.3s ease forwards;
}

.cedula-hint {
  font-size: 13px;
  color: var(--text-secondary, #a0a0b0);
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.cedula-field {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 0.2s;
}

.cedula-field:focus-within {
  border-color: var(--purple-light);
}

.cedula-input {
  width: 100%;
  background: transparent;
  border: none;
  padding: 13px 14px;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}

.cedula-input::placeholder {
  color: var(--text-hint);
}

.btn-cedula {
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #7C3AED, #5B21B6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  transition: opacity 0.2s, transform 0.15s;
}

.btn-cedula:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cedula:not(:disabled):hover {
  opacity: 0.9;
}

.btn-cedula:not(:disabled):active {
  transform: scale(0.98);
}

.google-signin-shell {
  position: relative;
  width: 100%;
}

.google-signin-facade {
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
  transition: border-color 0.2s, opacity 0.2s;
}

.google-signin-facade:hover:not(:disabled) {
  border-color: var(--text-muted);
}

.google-signin-facade:disabled {
  opacity: 0.6;
}

.google-signin-shell.is-overlay-active .google-signin-facade {
  pointer-events: none;
}

.google-button-host {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: var(--radius-md);
  overflow: hidden;
  opacity: 0.01;
}

.google-signin-shell:not(.is-overlay-active) .google-button-host {
  pointer-events: none;
  opacity: 0;
}

.google-button-host :deep(div),
.google-button-host :deep(iframe) {
  width: 100% !important;
  height: 100% !important;
}

/* ── Responsive móvil ── */
@media (max-width: 480px) {
  .login-header {
    padding: 44px 20px 52px;
  }

  .brand {
    font-size: 34px;
  }

  .brand-emoji {
    font-size: 28px;
  }

  .avatar-circle {
    width: 80px;
    height: 80px;
  }

  .login-avatar {
    margin-top: -40px;
    margin-bottom: 10px;
  }

  .login-card {
    margin: 0 12px 16px;
    padding: 20px 16px;
  }

  .login-footer {
    gap: 12px;
    margin-top: 16px;
  }
}

/* ── Animaciones locales ── */
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
</style>
