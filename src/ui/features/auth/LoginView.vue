<template>
  <div class="login-page">
    <div class="particles">
      <div v-for="i in 3" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <div class="login-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
        </div>
        <h1 class="brand">CourseV</h1>
        <p class="tagline">Plataforma educativa</p>
      </div>
    </div>

    <div class="login-avatar">
      <div class="avatar-glow"></div>
      <div class="avatar-circle">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
      </div>
    </div>

    <div class="login-card animate-fade-in-up">
      <LoginForm @submit="handleLogin" @google="handleGoogle" :loading="loading" :error="error" />
      <div class="login-footer">
        <button class="forgot-link" @click="showForgotPassword = true">¿Olvidaste tu contraseña?</button>
        <button class="register-link" @click="$router.push('/register')">
          ¿No tienes cuenta? <span>Regístrate</span>
        </button>
      </div>
    </div>

    <ForgotPasswordDialog v-if="showForgotPassword" @close="showForgotPassword = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from './components/LoginForm.vue'
import ForgotPasswordDialog from './components/ForgotPasswordDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const showForgotPassword = ref(false)

async function handleLogin(username: string, password: string) {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username, password)
    router.push('/video')
  } catch {
    error.value = authStore.error || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  error.value = ''
  try {
    await authStore.loginWithGoogle('user@gmail.com')
    router.push('/video')
  } catch {
    error.value = authStore.error || 'Error con Google'
  } finally {
    loading.value = false
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
  min-height: 100vh;
  background: var(--bg-secondary);
  overflow-y: auto;
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
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.login-header {
  position: relative;
  padding: 48px 24px 24px;
  text-align: center;
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(106, 27, 154, 0.4) 0%, transparent 100%);
}

.header-content {
  position: relative;
  z-index: 1;
}

.logo-icon {
  display: inline-flex;
  color: var(--cyan-accent);
  margin-bottom: 8px;
}

.brand {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--purple-light), var(--cyan-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.login-avatar {
  display: flex;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}

.avatar-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%);
  animation: pulse-glow 3s infinite;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--purple-light);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.login-card {
  margin: 0 16px;
  background: var(--bg-card-hover);
  border-radius: var(--radius-xl);
  padding: 24px;
  border: 1px solid var(--border-color);
}

.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.forgot-link {
  color: var(--purple-light);
  font-size: 13px;
}

.register-link {
  color: var(--text-muted);
  font-size: 14px;
}

.register-link span {
  color: var(--purple-light);
  font-weight: 600;
}
</style>
