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
          <AppInput v-model="form.nombres" label="Nombres" placeholder="Tus nombres" />
          <AppInput v-model="form.apellidos" label="Apellidos" placeholder="Tus apellidos" />
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Información de Contacto</h3>
        <AppInput v-model="form.email" type="email" label="Correo electrónico" placeholder="correo@ejemplo.com" />
        <AppInput v-model="form.institucion" label="Institución" placeholder="Tu institución educativa" />
        <div class="row">
          <AppInput v-model="form.telefono" type="tel" label="Teléfono" placeholder="+57" />
          <AppInput v-model="form.fecha_nacimiento" type="date" label="Fecha de nacimiento" />
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Credenciales</h3>
        <AppInput v-model="form.username" label="Usuario" placeholder="Nombre de usuario" />
        <AppInput v-model="form.password" type="password" label="Contraseña" placeholder="Contraseña segura" />
        <AppInput v-model="confirmPassword" type="password" label="Confirmar contraseña" placeholder="Repite la contraseña" :error="passwordError" />
      </section>

      <AppButton variant="primary" block :loading="loading" @click="handleRegister">
        Crear Cuenta
      </AppButton>

      <p class="login-link">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const avatarPreview = ref<string | null>(null)
const confirmPassword = ref('')

const form = ref({
  nombres: '',
  apellidos: '',
  email: '',
  institucion: '',
  telefono: '',
  fecha_nacimiento: '',
  username: '',
  password: '',
})

const passwordError = computed(() => {
  if (confirmPassword.value && confirmPassword.value !== form.value.password) return 'Las contraseñas no coinciden'
  return ''
})

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function handleRegister() {
  if (passwordError.value) return
  loading.value = true
  try {
    await authStore.register(form.value.username, form.value.password, form.value.email)
    router.push('/video')
  } catch {
    // error already set in store
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
</style>
