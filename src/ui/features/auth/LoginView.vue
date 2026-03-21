<template>
  <div class="login-page">
    <div class="particles">
      <div v-for="i in 3" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

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
      <LoginForm @submit="handleLogin" @google="handleGoogle" :loading="loading" :error="error" />
      <div class="login-footer">
        <button class="forgot-link" @click="showForgotPassword = true">¿Olvidaste tu contraseña?</button>
        <button class="register-link" @click="$router.push('/register')">
          ¿No tienes una cuenta? <span>Regístrate</span>
        </button>
      </div>
    </div>

    <ForgotPasswordDialog v-if="showForgotPassword" @close="showForgotPassword = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from './components/LoginForm.vue'
import ForgotPasswordDialog from './components/ForgotPasswordDialog.vue'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: Record<string, unknown>): void
          prompt(callback?: (notification: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => void): void
          renderButton(element: HTMLElement, config: Record<string, unknown>): void
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

onMounted(async () => {
  if (!GOOGLE_CLIENT_ID) return
  await loadGoogleScript()
  window.google?.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: false,
  })
})

async function handleGoogleCredential(response: { credential: string }) {
  loading.value = true
  error.value = ''
  try {
    const payload = decodeJwtPayload(response.credential)
    const email = payload.email
    const displayName = payload.name || email.split('@')[0]
    const avatarUrl = payload.picture || undefined
    await authStore.loginWithGoogle(email, displayName, avatarUrl)
    router.push('/video')
  } catch {
    error.value = authStore.error || 'Error con Google'
  } finally {
    loading.value = false
  }
}

async function handleLogin(username: string, password: string) {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username, password)
    router.push('/video')
  } catch {
    error.value = 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    error.value = 'Google Sign-In no configurado. Configura VITE_GOOGLE_CLIENT_ID.'
    return
  }
  await loadGoogleScript()
  window.google?.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      error.value = 'No se pudo mostrar el diálogo de Google. Intenta de nuevo.'
    }
  })
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
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow-y: auto;
  position: relative;
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
