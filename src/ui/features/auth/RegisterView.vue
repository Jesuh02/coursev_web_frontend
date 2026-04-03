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
        <AppInput v-model="form.email" type="email" label="Correo electrónico" placeholder="correo@ejemplo.com" :error="fieldErrors.email" />
        <div class="institucion-selector">
          <label class="select-label">Institución(es)</label>
          <button type="button" class="institucion-trigger" :class="{ error: !!fieldErrors.institucion }" @click="showInstitucionDialog = true">
            <span v-if="selectedInstituciones.length === 0" class="placeholder-text">Seleccionar institución(es)...</span>
            <span v-else-if="selectedInstituciones.length === 1">{{ selectedInstituciones[0].nombre }}</span>
            <span v-else>{{ selectedInstituciones.length }} instituciones seleccionadas</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <span v-if="fieldErrors.institucion" class="select-error">{{ fieldErrors.institucion }}</span>

          <!-- Multi-select dialog -->
          <Teleport to="body">
            <div v-if="showInstitucionDialog" class="dialog-overlay" @click.self="showInstitucionDialog = false">
              <div class="dialog-card">
                <h3 class="dialog-title">Seleccionar institución(es)</h3>
                <p class="dialog-sub">Selecciona una o más instituciones donde quieres crear tu cuenta</p>
                <input v-model="institucionSearch" type="text" class="dialog-search" placeholder="Buscar institución..." />
                <div class="dialog-list">
                  <label v-for="inst in filteredInstituciones" :key="instKey(inst)" class="dialog-option" :class="{ selected: isInstSelected(inst) }">
                    <input type="checkbox" :checked="isInstSelected(inst)" @change="toggleInstitucion(inst)" />
                    <div class="option-info">
                      <span class="inst-name">{{ inst.nombre }}</span>
                      <span v-if="inst.tenantId" class="inst-tenant">{{ tenantLabel(inst.tenantId) }}</span>
                    </div>
                  </label>
                  <p v-if="filteredInstituciones.length === 0" class="dialog-empty">No se encontraron instituciones</p>
                </div>
                <div class="dialog-actions">
                  <button type="button" class="dialog-btn cancel" @click="showInstitucionDialog = false">Cancelar</button>
                  <button type="button" class="dialog-btn accept" @click="showInstitucionDialog = false">Aceptar ({{ selectedInstituciones.length }})</button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
        <div class="row">
          <AppInput v-model="form.telefono" type="tel" label="Teléfono" placeholder="+57" :error="fieldErrors.telefono" />
          <AppInput v-model="form.fecha_nacimiento" type="date" label="Fecha de nacimiento" :error="fieldErrors.fecha_nacimiento" />
        </div>
      </section>

      <section class="form-section">
        <h3 class="section-title">Credenciales</h3>
        <AppInput v-model="form.username" label="Usuario" placeholder="Nombre de usuario" :error="fieldErrors.username" />
        <AppInput v-model="form.password" type="password" label="Contraseña" placeholder="Contraseña segura" :error="fieldErrors.password" />
        <AppInput v-model="confirmPassword" type="password" label="Confirmar contraseña" placeholder="Repite la contraseña" :error="passwordError" />
      </section>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { HttpError, institucionAdapter, tokenStorage } from '@/infrastructure/api'
import type { Institucion, AuthResponse } from '@/domain/models'
import { TENANTS, setSelectedTenant } from '@/config/tenants'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const avatarPreview = ref<string | null>(null)
const confirmPassword = ref('')
const submitError = ref('')
const fieldErrors = ref<Record<string, string>>({})

const instituciones = ref<Institucion[]>([])
const selectedInstituciones = ref<Institucion[]>([])
const showInstitucionDialog = ref(false)
const institucionSearch = ref('')

const filteredInstituciones = computed(() => {
  const q = institucionSearch.value.toLowerCase()
  if (!q) return instituciones.value
  return instituciones.value.filter(i => i.nombre.toLowerCase().includes(q))
})

function instKey(inst: Institucion) {
  return `${inst.tenantId ?? '_'}:${inst.id}`
}

function isInstSelected(inst: Institucion) {
  const key = instKey(inst)
  return selectedInstituciones.value.some(s => instKey(s) === key)
}

function toggleInstitucion(inst: Institucion) {
  const key = instKey(inst)
  const idx = selectedInstituciones.value.findIndex(s => instKey(s) === key)
  if (idx >= 0) {
    selectedInstituciones.value.splice(idx, 1)
  } else {
    selectedInstituciones.value.push(inst)
  }
}

function tenantLabel(tenantId: string): string {
  const t = TENANTS.find(t => t.id === tenantId)
  return t ? t.name : tenantId
}

onMounted(async () => {
  try {
    instituciones.value = await institucionAdapter.getAllCrossTenant()
  } catch {
    try {
      instituciones.value = await institucionAdapter.getAll()
    } catch { /* silent */ }
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
  if (selectedInstituciones.value.length === 0) errors.institucion = 'Selecciona al menos una institución'
  if (!form.value.telefono.trim()) errors.telefono = 'Campo requerido'
  if (!form.value.fecha_nacimiento) errors.fecha_nacimiento = 'Campo requerido'
  if (!form.value.username.trim()) errors.username = 'Campo requerido'
  if (form.value.username.trim().length < 4) errors.username = 'Mínimo 4 caracteres'
  if (!form.value.password) errors.password = 'Campo requerido'
  else if (form.value.password.length < 6) errors.password = 'Mínimo 6 caracteres'

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
    // Group selected institutions by server URL (like RegisterFragment.kt cross-tenant approach)
    const serverGroups = new Map<string, { tenantId: string; serverUrl: string; instIds: number[] }>()

    for (const inst of selectedInstituciones.value) {
      if (!inst.tenantId) continue
      const tenant = TENANTS.find(t => t.id === inst.tenantId)
      if (!tenant) continue
      const url = tenant.serverUrl.replace(/\/+$/, '')
      const existing = serverGroups.get(url)
      if (existing) {
        if (!existing.instIds.includes(inst.id)) existing.instIds.push(inst.id)
      } else {
        serverGroups.set(url, { tenantId: tenant.id, serverUrl: url, instIds: [inst.id] })
      }
    }

    if (serverGroups.size === 0) {
      submitError.value = 'No se pudo determinar la institución. Intenta de nuevo.'
      return
    }

    const servers = [...serverGroups.values()]
    const personaData = {
      nombres: form.value.nombres.trim(),
      apellidos: form.value.apellidos.trim(),
      cedula: form.value.cedula.trim(),
      genero: form.value.genero,
      telefono: form.value.telefono.trim(),
      fecha_nacimiento: form.value.fecha_nacimiento,
    }

    // Build the registration payload for each server
    const registerPayload = (group: typeof servers[0]) => ({
      username: form.value.username.trim(),
      password: form.value.password,
      email: form.value.email.trim(),
      persona: { ...personaData, institucion_id: group.instIds[0] },
      tenantIds: [group.tenantId],
    })

    // Register on ALL servers in parallel (like RegisterFragment.kt → getInstitucionesCrossTenant)
    const results = await Promise.allSettled(
      servers.map(async (group) => {
        const res = await fetch(`${group.serverUrl}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload(group)),
        })
        const json = await res.json()
        if (!res.ok || json.success === false) {
          throw new Error(json.error?.message || `Error ${res.status}`)
        }
        return { data: json.data as AuthResponse, tenantId: group.tenantId, serverUrl: group.serverUrl }
      }),
    )

    // Find the first successful response to use for authentication
    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<{ data: AuthResponse; tenantId: string; serverUrl: string }> =>
        r.status === 'fulfilled',
    )

    if (fulfilled.length === 0) {
      const firstError = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
      throw new Error(firstError?.reason?.message || 'No se pudo completar el registro')
    }

    // Use the first successful server's response for auth session
    const primary = fulfilled[0].value
    setSelectedTenant(primary.tenantId)
    tokenStorage.token = primary.data.accessToken
    tokenStorage.refreshToken = primary.data.refreshToken
    tokenStorage.userId = primary.data.user.id

    router.push('/video')
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'No se pudo completar el registro'
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

/* Institution selector */
.institucion-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.institucion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 0 16px;
  font-size: 15px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.institucion-trigger:hover {
  border-color: var(--purple-light);
}

.institucion-trigger.error {
  border-color: var(--red-netflix);
}

.placeholder-text {
  color: var(--text-muted);
}

/* Multi-select dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.dialog-card {
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.dialog-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin: -8px 0 0;
}

.dialog-search {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.dialog-search:focus {
  border-color: var(--purple-light);
}

.dialog-list {
  overflow-y: auto;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dialog-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s;
}

.dialog-option:hover {
  background: var(--bg-surface);
}

.dialog-option.selected {
  background: rgba(139, 92, 246, 0.12);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.dialog-option input[type="checkbox"] {
  accent-color: var(--purple-light);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.option-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.inst-name {
  font-size: 14px;
  color: var(--text-primary);
}

.inst-tenant {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  padding: 20px 0;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.dialog-btn {
  padding: 8px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.dialog-btn.cancel {
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.dialog-btn.accept {
  background: var(--purple-primary);
  color: #fff;
}

.dialog-btn.accept:hover {
  opacity: 0.9;
}
</style>
