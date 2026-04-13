<template>
  <div class="login-page">
    <!-- ═══ PANEL IZQUIERDO: Branding + Features (solo desktop) ═══ -->
    <div class="hero-panel">
      <!-- Spline 3D Background -->
      <div ref="splineContainer" class="spline-bg"></div>
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="hero-logo">
          <div class="hero-logo-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 7h6M9 11h4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="hero-brand">CourseV</h1>
        </div>

        <h2 class="hero-title">Plataforma Educativa<br/>con Inteligencia Artificial</h2>
        <p class="hero-subtitle">Transformando la educación con tecnología inteligente, evaluación adaptativa y procesos eficientes.</p>

        <!-- Feature cards -->
        <div class="hero-features">
          <div v-for="(feat, idx) in features" :key="idx" class="feature-card" :style="{ animationDelay: `${0.3 + idx * 0.1}s` }">
            <div class="feature-icon" v-html="feat.icon"></div>
            <div class="feature-info">
              <h3 class="feature-title">{{ feat.title }}</h3>
              <p class="feature-desc">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer del hero -->
      <div class="hero-footer">
        <p class="hero-footer-text">&copy; 2026 CourseV. Todos los derechos reservados.</p>
        <div class="hero-footer-links">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
        </div>
      </div>
    </div>

    <!-- ═══ PANEL DERECHO: Formulario de login ═══ -->
    <div class="form-panel">
      <!-- Partículas móviles (solo se ven en móvil) -->
      <div class="particles mobile-only">
        <div v-for="i in 3" :key="i" class="particle" :style="particleStyle(i)"></div>
      </div>

      <!-- Orbes animados de fondo (desktop) -->
      <div class="form-bg-orbs desktop-only">
        <div class="form-orb form-orb--1"></div>
        <div class="form-orb form-orb--2"></div>
        <div class="form-orb form-orb--3"></div>
      </div>

      <div class="login-wrapper">
        <!-- Header móvil (oculto en desktop) -->
        <div class="login-header mobile-only">
          <div class="header-content">
            <h1 class="brand">CourseV <span class="brand-emoji">📋</span></h1>
          </div>
        </div>

        <div class="login-avatar mobile-only">
          <div class="avatar-glow"></div>
          <div class="avatar-circle">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
        </div>

        <!-- Título desktop dentro del formulario -->
        <div class="desktop-form-header desktop-only">
          <h2 class="desktop-form-title">Bienvenido</h2>
          <p class="desktop-form-subtitle">Inicia sesión en tu cuenta de <strong class="brand-word">CourseV</strong></p>
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
            <span class="forgot-text">¿Olvidaste tu contraseña? <button class="forgot-link" @click="showForgotPassword = true">Recupérala aquí</button></span>
          </div>

          <!-- Sección de pago: institución suspendida por mensualidad vencida -->
          <div v-if="showPaymentSection" class="payment-suspended-section">
            <div class="payment-suspended-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="payment-suspended-msg">Tu institución ha sido suspendida. Contacta al administrador.</p>
            <p v-if="suspendedInstitutionName" class="payment-suspended-inst">{{ suspendedInstitutionName }}</p>
            <template v-if="suspendedUserIsAdmin">
              <p v-if="suspendedMonthlyPrice > 0" class="payment-suspended-price">
                ${{ suspendedMonthlyPrice.toLocaleString('es-CO') }} COP
              </p>
              <button
                class="btn-pay-institution"
                :disabled="paymentLoading"
                @click="handleInstitutionPayment"
              >
                <svg v-if="!paymentLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span v-if="paymentLoading" class="spinner"></span>
                <span v-else>Pagar ahora</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Footer desktop -->
        <div class="desktop-footer desktop-only">
          <p class="desktop-footer-text">Al iniciar sesión, aceptas nuestros <a href="#">Términos de Servicio</a> y <a href="#">Política de Privacidad</a></p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { resolveLogin, resolveGoogleLogin, CedulaRequiredError, MultipleTenantError, GoogleAccountNotFoundError, InstitutionSuspendedError, parseInstitutionSuspendedMeta } from '@/infrastructure/api/tenantResolver'
import type { TenantLoginResult } from '@/infrastructure/api/tenantResolver'
import { institucionAdapter } from '@/infrastructure/api/institucionAdapter'
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
const splineContainer = ref<HTMLDivElement | null>(null)

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

// Estado de pago por institución suspendida
const showPaymentSection = ref(false)
const suspendedInstitutionId = ref<number | null>(null)
const suspendedInstitutionName = ref('')
const suspendedMonthlyPrice = ref(0)
const suspendedServerUrl = ref('')
const paymentLoading = ref(false)
const suspendedUserIsAdmin = ref(false)

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
  // Cargar Spline 3D viewer en el hero panel
  loadSplineViewer()

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
    const suspended = detectSuspendedError(e)
    if (e instanceof MultipleTenantError) {
      // Guardar datos de Google para re-autenticación tras selección de tenant
      pendingGoogleIdToken = response.credential
      const payload = decodeJwtPayload(response.credential)
      pendingGoogleDisplayName = payload.name || payload.email?.split('@')[0]
      pendingGoogleAvatarUrl = payload.picture || undefined
      pendingMatches.value = e.matches
    } else if (e instanceof GoogleAccountNotFoundError) {
      error.value = 'Usuario no encontrado'
    } else if (suspended) {
      showSuspendedPayment(suspended)
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
  showPaymentSection.value = false
  // Guardar credenciales por si se necesita retry con cédula
  pendingUsername.value = username
  pendingPassword.value = password
  try {
    const result = await resolveLogin(username, password)
    await authStore.commitAuth(result, { username, password })
    router.push('/video')
  } catch (e) {
    const suspended = detectSuspendedError(e)
    if (e instanceof CedulaRequiredError) {
      showCedula.value = true
      error.value = 'Tu cédula es necesaria para identificar tu cuenta entre varias instituciones'
    } else if (e instanceof MultipleTenantError) {
      pendingMatches.value = e.matches
    } else if (suspended) {
      showSuspendedPayment(suspended)
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
    const suspended = detectSuspendedError(e)
    if (e instanceof MultipleTenantError) {
      // La cédula coincide en múltiples instituciones → mostrar selección
      pendingMatches.value = e.matches
    } else if (suspended) {
      showSuspendedPayment(suspended)
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
    const suspended = detectSuspendedError(e)
    if (suspended) {
      showSuspendedPayment(suspended)
    } else {
      error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
    }
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

function showSuspendedPayment(e: InstitutionSuspendedError) {
  error.value = ''
  showPaymentSection.value = true
  suspendedInstitutionId.value = e.institutionId
  suspendedInstitutionName.value = e.institutionName || 'tu institución'
  suspendedMonthlyPrice.value = e.monthlyPrice
  suspendedServerUrl.value = e.serverUrl || ''
  suspendedUserIsAdmin.value = Array.isArray(e.roles) && e.roles.includes(3)
}

/**
 * Detects institution suspension errors from any error type (InstitutionSuspendedError,
 * HttpError from commitAuth, or plain Error with INSTITUTION_SUSPENDED pattern).
 * Returns an InstitutionSuspendedError if detected, null otherwise.
 */
function detectSuspendedError(e: unknown): InstitutionSuspendedError | null {
  if (e instanceof InstitutionSuspendedError) return e
  const msg = e instanceof Error ? e.message : ''
  if (/suspendida|suspended|INSTITUTION_SUSPENDED/i.test(msg)) {
    const meta = parseInstitutionSuspendedMeta(msg)
    return new InstitutionSuspendedError(
      'Tu institución ha sido suspendida. Contacta al administrador.',
      { ...meta, roles: meta?.roles },
    )
  }
  return null
}

async function handleInstitutionPayment() {
  if (!suspendedInstitutionId.value || !suspendedServerUrl.value) {
    error.value = 'No se pudo identificar la institución para el pago.'
    return
  }
  paymentLoading.value = true
  error.value = ''
  try {
    const result = await institucionAdapter.publicBillingPayment(
      suspendedInstitutionId.value,
      suspendedServerUrl.value,
    )
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
    } else {
      error.value = 'No se generó la URL de pago. Intenta de nuevo.'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al iniciar el pago'
  } finally {
    paymentLoading.value = false
  }
}

// Features del panel hero (desktop)
const features = [
  {
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
    title: 'Asistente IA',
    desc: 'Evaluaciones inteligentes adaptadas al nivel de cada estudiante.',
  },
  {
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l1.09 3.26L16 4.24l-1.64 2.86L17.5 8.5l-3.26 1.09L15.76 12l-2.86-1.64L11.5 13.5l-1.09-3.26L8 11.76l1.64-2.86L6.5 7.5l3.26-1.09L8.24 4z"/><path d="M19 13l.62 1.85 1.85.62-1.85.62L19 18l-.62-1.85L16.53 15.53l1.85-.62z"/></svg>',
    title: 'Calificación Automática',
    desc: 'Evaluación precisa e instantánea de tareas y exámenes.',
  },
  {
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    title: 'Refuerzo Adaptativo',
    desc: 'Contenido personalizado desde el material de cada docente.',
  },
]

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

function loadSplineViewer() {
  if (!splineContainer.value) return
  if (!document.getElementById('spline-viewer-script')) {
    const script = document.createElement('script')
    script.id = 'spline-viewer-script'
    script.type = 'module'
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.82/build/spline-viewer.js'
    document.head.appendChild(script)
  }
  const viewer = document.createElement('spline-viewer')
  viewer.setAttribute('url', 'https://prod.spline.design/LYtfWvYoz53XLa0D/scene.splinecode')
  splineContainer.value.appendChild(viewer)
  hideSplineWatermark(viewer)
}

function hideSplineWatermark(viewer: HTMLElement) {
  function inject() {
    const shadow = viewer.shadowRoot
    if (!shadow || shadow.querySelector('[data-hide-logo]')) return
    const style = document.createElement('style')
    style.setAttribute('data-hide-logo', '')
    style.textContent = '#logo { display: none !important; }'
    shadow.appendChild(style)
  }
  inject()
  const observer = new MutationObserver(() => inject())
  observer.observe(viewer, { childList: true, subtree: true })
  setTimeout(() => observer.disconnect(), 10000)
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   LAYOUT PRINCIPAL — Split desktop / stack mobile
   ═══════════════════════════════════════════════════════ */
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

/* ── Utilidades de visibilidad ── */
.mobile-only { display: block; }
.desktop-only { display: none; }

/* ═══════════════════════════════════════════════════════
   PANEL HERO (solo desktop)
   ═══════════════════════════════════════════════════════ */
.hero-panel {
  display: none;
}

/* ═══════════════════════════════════════════════════════
   PANEL DEL FORMULARIO
   ═══════════════════════════════════════════════════════ */
.form-panel {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}

.login-wrapper {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;
  align-self: flex-start;
  padding-bottom: max(32px, env(safe-area-inset-bottom, 0px) + 16px);
}

/* ── Partículas flotantes (móvil) ── */
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

/* ── Header móvil ── */
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

/* ── Avatar móvil ── */
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

/* ── Desktop form header ── */
.desktop-form-header {
  text-align: center;
  padding: 40px 24px 8px;
  animation: fade-in-down 0.5s ease forwards;
}

.desktop-form-title {
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #C4B5FD 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 12px;
  letter-spacing: -0.3px;
}

.desktop-form-subtitle {
  font-size: 14px;
  color: var(--text-secondary, #9CA3AF);
  margin: 0 auto;
  line-height: 1.7;
  max-width: 340px;
}

.desktop-form-subtitle .brand-word {
  color: var(--purple-light, #8B5CF6);
  text-decoration: underline;
  text-decoration-color: rgba(139, 92, 246, 0.4);
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
  font-weight: 600;
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

/* ── Footer: olvidé contraseña ── */
.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
}

.forgot-text {
  font-size: 13px;
  color: var(--text-secondary, #9CA3AF);
}

.forgot-link {
  color: var(--purple-light);
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.forgot-link:hover {
  opacity: 0.75;
}

/* ── Desktop footer ── */
.desktop-footer {
  text-align: center;
  padding: 8px 24px 24px;
}

.desktop-footer-text {
  font-size: 12px;
  color: var(--text-muted, #888);
  margin: 0;
}

.desktop-footer-text a {
  color: var(--purple-light, #8B5CF6);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* ── Campo de cédula ── */
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

/* ── Google Sign-In ── */
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

/* ── Pago institución suspendida ── */
.payment-suspended-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03));
  border: 1px solid rgba(245,158,11,0.2);
  animation: fade-in-up 0.4s ease forwards;
}

.payment-suspended-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(245,158,11,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-suspended-msg {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.payment-suspended-inst {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.payment-suspended-price {
  font-size: 22px;
  font-weight: 700;
  color: #7C3AED;
  margin: 4px 0 0;
}

.btn-pay-institution {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 260px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7C3AED, #5B21B6);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
  box-shadow: 0 4px 14px rgba(124,58,237,0.3);
}

.btn-pay-institution:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124,58,237,0.4);
}

.btn-pay-institution:active:not(:disabled) {
  transform: translateY(0);
}

.btn-pay-institution:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE MÓVIL
   ═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   DESKTOP LAYOUT (>= 900px) — Split view
   ═══════════════════════════════════════════════════════ */
@media (min-width: 900px) {
  .mobile-only { display: none !important; }
  .desktop-only { display: block !important; }

  .login-page {
    flex-direction: row;
    overflow: hidden;
    height: 100vh;
  }

  /* ── Hero Panel ── */
  .hero-panel {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex: 1;
    position: relative;
    background: #050510;
    padding: 18px 48px 50px;
    overflow: hidden;
    min-height: 0;
  }

  .spline-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }

  .spline-bg :deep(spline-viewer) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .spline-bg :deep(spline-viewer #logo) {
    display: none !important;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(5, 5, 16, 0.25) 0%,
      rgba(5, 5, 16, 0.05) 35%,
      rgba(5, 5, 16, 0.15) 65%,
      rgba(5, 5, 16, 0.5) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  /* Hero contenido */
  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 580px;
    flex: 1;
  }

  .hero-logo {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 40px;
    animation: fade-in-down 0.6s ease forwards;
  }

  .hero-logo-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .hero-brand {
    font-size: 32px;
    font-weight: 800;
    font-style: italic;
    color: #fff;
    letter-spacing: -0.5px;
    margin: 0;
    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
  }

  .hero-title {
    font-size: 42px;
    font-weight: 800;
    color: #fff;
    line-height: 1.12;
    margin: 0 0 20px;
    letter-spacing: -0.5px;
    animation: fade-in-up 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
    text-shadow: 0 2px 32px rgba(0, 0, 0, 0.4);
  }

  .hero-subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.7;
    margin: 0 0 40px;
    max-width: 460px;
    animation: fade-in-up 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
  }

  /* Feature cards */
  .hero-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(20px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    animation: feature-enter 0.5s ease both;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.12);
  }

  .feature-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: rgba(139, 92, 246, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C4B5FD;
    transition: background 0.3s;
  }

  .feature-card:hover .feature-icon {
    background: rgba(139, 92, 246, 0.22);
  }

  .feature-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 2px;
  }

  .feature-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    margin: 0;
    line-height: 1.45;
  }

  /* Footer del hero */
  .hero-footer {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    margin-top: auto;
  }

  .hero-footer-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
    margin: 0;
  }

  .hero-footer-links {
    display: flex;
    gap: 20px;
  }

  .hero-footer-links a {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.35);
    text-decoration: none;
    transition: color 0.2s;
  }

  .hero-footer-links a:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  /* ── Form Panel ── */
  .form-panel {
    width: 480px;
    min-width: 420px;
    max-width: 520px;
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    background: var(--bg-secondary);
    position: relative;
    border-left: none;
  }

  .form-panel::before {
    content: '';
    position: absolute;
    top: 28%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
    filter: blur(50px);
    animation: orb-pulse 8s ease-in-out infinite;
  }

  /* Orbes animados de fondo */
  .form-bg-orbs {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .form-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.5;
  }

  .form-orb--1 {
    width: 200px;
    height: 200px;
    background: rgba(139, 92, 246, 0.06);
    top: 10%;
    right: -40px;
    animation: orb-float-1 14s ease-in-out infinite;
  }

  .form-orb--2 {
    width: 160px;
    height: 160px;
    background: rgba(99, 102, 241, 0.04);
    bottom: 20%;
    left: -30px;
    animation: orb-float-2 18s ease-in-out infinite;
  }

  .form-orb--3 {
    width: 120px;
    height: 120px;
    background: rgba(168, 85, 247, 0.05);
    top: 55%;
    right: 30%;
    animation: orb-float-3 12s ease-in-out infinite;
  }

  .login-wrapper {
    max-width: 400px;
    width: 100%;
    padding-top: 60px;
    padding-bottom: 32px;
    animation: form-panel-enter 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both;
    position: relative;
    z-index: 1;
  }

  .login-card {
    margin: 0 0 16px;
    background: var(--bg-card-hover);
    border-radius: 20px;
    padding: 32px 28px;
    border: 1px solid rgba(139, 92, 246, 0.1);
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.15),
      0 0 64px rgba(139, 92, 246, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(8px);
  }

  .desktop-form-header {
    animation: fade-in-down 0.6s 0.2s ease both;
  }

  .desktop-footer {
    animation: fade-in-up 0.5s 0.6s ease both;
  }
}

/* ═══════════════════════════════════════════════════════
   DESKTOP EXTRA GRANDE (>= 1200px)
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1200px) {
  .hero-panel {
    padding: 72px 64px;
  }

  .hero-title {
    font-size: 50px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .form-panel {
    width: 520px;
    max-width: 560px;
  }

  .login-wrapper {
    padding-top: 80px;
  }
}

/* ═══════════════════════════════════════════════════════
   ANIMACIONES
   ═══════════════════════════════════════════════════════ */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
}

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

@keyframes feature-enter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes form-panel-enter {
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes orb-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-20px, 30px) scale(1.1); }
  66% { transform: translate(15px, -20px) scale(0.95); }
}

@keyframes orb-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  40% { transform: translate(25px, -15px) scale(1.05); }
  70% { transform: translate(-10px, 20px) scale(0.9); }
}

@keyframes orb-float-3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.5; }
  50% { transform: translate(-15px, -25px); opacity: 0.8; }
}

@keyframes orb-pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
</style>
