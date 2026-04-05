<template>
  <div class="course-creation">
    <TopBar :title="isEdit ? 'Editar Curso' : 'Crear Curso'" @back="$router.back()" />

    <form class="creation-form" @submit.prevent="submitCourse">
      <div class="form-content">
        <div class="thumb-upload" @click="openFilePicker">
          <img v-if="form.thumbnailPreview" :src="form.thumbnailPreview" alt="" @error="form.thumbnailPreview = ''" />
          <div v-else class="upload-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <p>Subir miniatura</p>
          </div>
          <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileSelect" />
        </div>

        <AppInput v-model="form.title" label="Título del curso" />
        <AppInput v-model="form.description" label="Descripción" />
        <div class="category-select-wrapper">
          <label class="input-label">Categoría</label>
          <select v-model="form.category" class="category-select">
            <option value="" disabled>Selecciona una categoría</option>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Informática">Informática</option>
            <option value="Ciencias naturales">Ciencias naturales</option>
            <option value="Ciencias Sociales">Ciencias Sociales</option>
          </select>
        </div>

        <!-- Curso Premium: oculto del UI, lógica conservada para uso futuro -->

        <!-- Fecha límite del curso -->
        <div class="deadline-section">
          <label class="toggle-row">
            <span class="toggle-label">Establecer fecha límite</span>
            <input v-model="form.hasDeadline" type="checkbox" class="toggle" />
          </label>
          <div v-if="form.hasDeadline" class="deadline-picker">
            <label class="input-label">Fecha límite del curso</label>
            <input
              v-model="form.deadline"
              type="datetime-local"
              class="date-input"
              :min="minDeadline"
            />
            <p class="deadline-hint">Pasada esta fecha, los colaboradores (rol 2) serán desactivados automáticamente.</p>
          </div>
        </div>

        <div class="price-section">
          <label class="toggle-row">
            <span class="toggle-label">Curso activo</span>
            <input v-model="form.isActive" type="checkbox" class="toggle" />
          </label>
          <p class="deadline-hint">
            {{ deadlineForcesInactive
              ? 'La fecha limite ya vencio; el backend guardara este curso como inactivo.'
              : form.isActive
                ? 'Mientras este activo, los roles 1 y 2 pueden solicitar matricula.'
                : 'Mientras este inactivo, los roles 1 y 2 no podran acceder ni solicitar matricula.' }}
          </p>
        </div>

        <!-- Colaboradores -->
        <div class="collaborator-section">
          <label class="input-label">Colaboradores (Docentes)</label>
          <div v-if="selectedCollaborators.length" class="collab-chips">
            <span v-for="c in selectedCollaborators" :key="c.id" class="collab-chip">
              {{ c.username }}
              <button type="button" class="chip-remove" @click="removeCollaborator(c.id)">&times;</button>
            </span>
          </div>
          <input
            v-model="collabQuery"
            type="text"
            class="collab-search-input"
            placeholder="Buscar por username o cédula..."
            @input="onCollabSearch"
          />
          <ul v-if="collabResults.length" class="collab-results">
            <li
              v-for="u in collabResults"
              :key="u.id"
              class="collab-result-item"
              :class="{ selected: selectedCollaborators.some(c => c.id === u.id) }"
              @click="handleCollaboratorSelect(u)"
            >
              <div class="collab-result-text">
                <span>{{ collabDisplayName(u) }}</span>
                <span class="collab-email">{{ collabMetaLine(u) }}</span>
              </div>
            </li>
          </ul>
        </div>
        <!-- Invitados -->
        <div class="collaborator-section">
          <label class="input-label">Invitados (Estudiantes)</label>
          <div v-if="selectedGuests.length" class="collab-chips">
            <span v-for="g in selectedGuests" :key="g.id" class="collab-chip guest-chip">
              {{ g.username }}
              <button type="button" class="chip-remove" @click="removeGuest(g.id)">&times;</button>
            </span>
          </div>
          <input
            v-model="guestQuery"
            type="text"
            class="collab-search-input"
            placeholder="Buscar usuario para invitar..."
            @input="onGuestSearch"
          />
          <ul v-if="guestResults.length" class="collab-results">
            <li
              v-for="u in guestResults"
              :key="u.id"
              class="collab-result-item"
              :class="{ selected: selectedGuests.some(g => g.id === u.id) }"
              @click="handleGuestSelect(u)"
            >
              <div class="collab-result-text">
                <span>{{ collabDisplayName(u) }}</span>
                <span class="collab-email">{{ collabMetaLine(u) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Modal confirmar rol docente -->
      <Teleport to="body">
        <div v-if="roleDialog.visible" class="modal-overlay" @click.self="roleDialog.visible = false">
          <div class="liquid-glass-dialog">
            <h3 class="dialog-title">Asignar rol de docente</h3>
            <p class="dialog-message">
              El usuario "{{ roleDialog.user?.username }}" no tiene el rol de docente.
              ¿Deseas asignarle el rol de docente para agregarlo como colaborador?
            </p>
            <div class="dialog-buttons">
              <button type="button" class="dialog-btn cancel" @click="roleDialog.visible = false">Cancelar</button>
              <button type="button" class="dialog-btn accept" @click="confirmPromoteToDocente">Aceptar</button>
            </div>
          </div>
        </div>
      </Teleport>

      <div class="form-footer">
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
        <AppButton type="submit" :loading="saving" full>{{ isEdit ? 'Guardar Cambios' : 'Crear Curso' }}</AppButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/domain/models'

const route = useRoute()
const router = useRouter()
const fileInput = ref<HTMLInputElement>()
const saving = ref(false)
const authStore = useAuthStore()
const selectedFile = ref<File | null>(null)

// Collaborator state
const collabQuery = ref('')
const collabResults = ref<User[]>([])
const selectedCollaborators = ref<User[]>([])
let collabSearchTimer: ReturnType<typeof setTimeout> | null = null
const roleDialog = reactive<{ visible: boolean; user: User | null }>({ visible: false, user: null })

// Guest state
const guestQuery = ref('')
const guestResults = ref<User[]>([])
const selectedGuests = ref<User[]>([])
const originalGuestIds = ref<Set<number>>(new Set())
let guestSearchTimer: ReturnType<typeof setTimeout> | null = null

const isEdit = computed(() => !!route.params.id)
const saveError = ref('')

// Min datetime = now (can't set deadline in the past)
const minDeadline = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const form = reactive({
  title: '',
  description: '',
  category: '',
  isPremium: false,
  price: '',
  thumbnailPreview: '',
  hasDeadline: false,
  deadline: '',
  isActive: true,
})

const deadlineForcesInactive = computed(() => {
  if (!form.hasDeadline || !form.deadline) return false
  const deadline = new Date(form.deadline)
  return !Number.isNaN(deadline.getTime()) && deadline.getTime() <= Date.now()
})

const effectiveIsActive = computed(() => form.isActive && !deadlineForcesInactive.value)

onMounted(async () => {
  if (!authStore.user) await authStore.fetchProfile()

  if (!isEdit.value) return
  const { courseAdapter, collaboratorAdapter } = await import('@/infrastructure/api')
  const course = await courseAdapter.getCourseById(Number(route.params.id))
  form.title = course.title
  form.description = course.description ?? ''
  form.category = course.category ?? 'general'
  form.isPremium = course.is_premium ?? course.isPremium
  form.price = course.price ? String(course.price) : ''
  form.thumbnailPreview = course.thumbnail_uri ?? course.thumbnailUri ?? ''
  form.isActive = course.isActive ?? course.is_active ?? true
  if (course.deadline) {
    form.hasDeadline = true
    const d = new Date(course.deadline)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    form.deadline = d.toISOString().slice(0, 16)
  }

  // Pre-load existing collaborators
  try {
    const collabs = await collaboratorAdapter.getByCourse(Number(route.params.id))
    selectedCollaborators.value = collabs
      .filter(c => c.user)
      .map(c => ({ id: c.user!.id, username: c.user!.username, email: c.user!.email } as User))
  } catch { /* ignore */ }

  // Pre-load existing guests (exclude anyone already loaded as collaborator)
  try {
    const { courseAdapter: ca } = await import('@/infrastructure/api')
    const guests = await ca.getGuests(Number(route.params.id))
    const collabIds = new Set(selectedCollaborators.value.map(c => c.id))
    selectedGuests.value = guests
      .filter(g => !collabIds.has(g.userId))
      .map(g => ({
        id: g.userId,
        username: g.username ?? `user_${g.userId}`,
        email: '',
        avatar: g.avatar,
        personaId: null,
        persona: null,
        roles: [],
        isActive: true,
        emailVerified: true,
        createdAt: null,
        updatedAt: null,
      } as User))
    originalGuestIds.value = new Set(selectedGuests.value.map(g => g.id))
  } catch { /* ignore */ }
})

function openFilePicker() { fileInput.value?.click() }

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    form.thumbnailPreview = URL.createObjectURL(file)
  }
}

function normalizeSearchText(value: string | number | null | undefined) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeSearchDigits(value: string | number | null | undefined) {
  return String(value ?? '').replace(/\D/g, '')
}

function getCollaboratorDocument(user: User) {
  // Priorizar cedula, luego identificacion_original y finalmente identificacion.
  const cedula = user.persona?.cedula?.toString().trim()
  const identificacionOriginal = user.persona?.identificacion_original?.toString().trim()
  const identificacion = user.persona?.identificacion?.toString().trim()
  const doc = (cedula && cedula !== '0')
    ? cedula
    : (identificacionOriginal && identificacionOriginal !== '0')
      ? identificacionOriginal
      : (identificacion && identificacion !== '0')
        ? identificacion
        : ''
  return doc
}

function matchesCollaboratorQuery(user: User, query: string) {
  if (!query.trim()) return false
  const normalizedQuery = normalizeSearchText(query)
  const digitsQuery = normalizeSearchDigits(query)
  const fullName = `${user.persona?.nombres ?? ''} ${user.persona?.apellidos ?? ''}`.trim()
  const documentId = getCollaboratorDocument(user)

  // Búsqueda por texto (username, email, nombres, apellidos)
  const textMatches = [user.username, user.email, fullName].some(value =>
    normalizeSearchText(value).includes(normalizedQuery)
  )

  // Búsqueda por cédula (solo si el query contiene dígitos)
  const documentMatches = digitsQuery.length > 0 && normalizeSearchDigits(documentId).includes(digitsQuery)

  return textMatches || documentMatches
}

function formatCollaboratorMeta(user: User) {
  const documentId = getCollaboratorDocument(user)
  if (documentId && user.email) return `${user.email} · Cédula ${documentId}`
  if (documentId) return `Cédula ${documentId}`
  return user.email || 'Sin correo'
}

function collabDisplayName(user: User) {
  const nombres = user.persona?.nombres?.trim()
  const apellidos = user.persona?.apellidos?.trim()
  if (nombres) return apellidos ? `${nombres} ${apellidos}` : nombres
  return user.username
}

function collabMetaLine(user: User) {
  const doc = getCollaboratorDocument(user)
  const parts = [`@${user.username}`]
  if (doc) parts.push(`Cédula ${doc}`)
  else if (user.email) parts.push(user.email)
  return parts.join(' · ')
}

// ─── Collaborator logic ───────────────────────────────────
function onCollabSearch() {
  if (collabSearchTimer) clearTimeout(collabSearchTimer)
  const q = collabQuery.value.trim()
  if (!q) { collabResults.value = []; return }
  collabSearchTimer = setTimeout(async () => {
    const { userAdapter } = await import('@/infrastructure/api')
    try {
      const users = await userAdapter.searchUsers(q)
      console.log('[CollaboratorFilter] Backend returned:', users.length, 'users for query:', q)
      const filtered = users.filter(u => u.username !== authStore.user?.username)
      console.log('[CollaboratorFilter] After self-exclusion:', filtered.length, 'users')
      collabResults.value = filtered
    } catch (err) {
      console.error('[CollaboratorFilter] Search error:', err)
      collabResults.value = []
    }
  }, 300)
}

function handleCollaboratorSelect(user: User) {
  if (selectedCollaborators.value.some(c => c.id === user.id)) {
    removeCollaborator(user.id)
    return
  }
  // Accept users with role 2 (docente) OR role 3 (creador)
  const canBeCollaborator = user.roles?.some(r => r.id === 2 || r.id === 3)
  if (canBeCollaborator) {
    addCollaborator(user)
  } else {
    roleDialog.user = user
    roleDialog.visible = true
  }
}

function addCollaborator(user: User) {
  if (!selectedCollaborators.value.some(c => c.id === user.id)) {
    selectedCollaborators.value.push(user)
  }
}

function removeCollaborator(userId: number) {
  selectedCollaborators.value = selectedCollaborators.value.filter(c => c.id !== userId)
}

async function confirmPromoteToDocente() {
  const user = roleDialog.user
  if (!user) return
  roleDialog.visible = false
  try {
    const { userAdapter } = await import('@/infrastructure/api')
    await userAdapter.assignRole(user.id, 2)
    addCollaborator(user)
  } catch {
    /* silently fail */
  }
}

// ─── Guest logic ──────────────────────────────────────────
function onGuestSearch() {
  if (guestSearchTimer) clearTimeout(guestSearchTimer)
  const q = guestQuery.value.trim()
  if (!q) { guestResults.value = []; return }
  guestSearchTimer = setTimeout(async () => {
    const { userAdapter } = await import('@/infrastructure/api')
    try {
      const users = await userAdapter.searchUsers(q)
      guestResults.value = users.filter(u => u.username !== authStore.user?.username)
    } catch {
      guestResults.value = []
    }
  }, 300)
}

function handleGuestSelect(user: User) {
  if (selectedGuests.value.some(g => g.id === user.id)) {
    removeGuest(user.id)
    return
  }
  // Don't add if already a collaborator
  if (selectedCollaborators.value.some(c => c.id === user.id)) {
    guestQuery.value = ''
    guestResults.value = []
    return
  }
  selectedGuests.value.push(user)
  guestQuery.value = ''
  guestResults.value = []
}

function removeGuest(userId: number) {
  selectedGuests.value = selectedGuests.value.filter(g => g.id !== userId)
}

async function submitCourse() {
  saving.value = true
  saveError.value = ''
  try {
    const { courseAdapter, collaboratorAdapter } = await import('@/infrastructure/api')
    const { api } = await import('@/infrastructure/api/httpClient')

    // Upload thumbnail if a new file was selected
    let thumbnailUri: string | undefined
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('prefix', 'thumbnails')
      const uploaded = await api.upload<{ publicUrl: string }>('/storage/upload', formData)
      thumbnailUri = encodeURI(uploaded.publicUrl)
    } else if (form.thumbnailPreview && !form.thumbnailPreview.startsWith('blob:')) {
      thumbnailUri = encodeURI(form.thumbnailPreview)
    }

    if (isEdit.value) {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        category: form.category,
        isFree: !form.isPremium,
        price: form.isPremium ? Number(form.price) : 0,
        isActive: effectiveIsActive.value,
        deadline: form.hasDeadline && form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      if (thumbnailUri) payload.thumbnailUri = thumbnailUri
      const courseId = Number(route.params.id)
      await courseAdapter.updateCourse(courseId, payload)
      await collaboratorAdapter.sync(courseId, selectedCollaborators.value.map(c => c.id))
      // Sync guests: remove those that were deleted, invite those that are new
      const currentGuestIds = new Set(selectedGuests.value.map(g => g.id))
      const toRemove = [...originalGuestIds.value].filter(id => !currentGuestIds.has(id))
      const toInvite = selectedGuests.value.map(g => g.id).filter(id => !originalGuestIds.value.has(id))
      await Promise.all(toRemove.map(userId => courseAdapter.removeGuest(courseId, userId)))
      if (toInvite.length > 0) {
        await courseAdapter.inviteGuests(courseId, toInvite)
      }
      router.back()
    } else {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        category: form.category,
        creatorUsername: authStore.user?.username ?? '',
        isFree: !form.isPremium,
        price: form.isPremium ? Number(form.price) : 0,
        isActive: effectiveIsActive.value,
        deadline: form.hasDeadline && form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      if (thumbnailUri) payload.thumbnailUri = thumbnailUri
      const created = await courseAdapter.createCourse(payload) as unknown as { id?: number } & Record<string, unknown>
      if (created?.id) {
        if (selectedCollaborators.value.length > 0) {
          await collaboratorAdapter.sync(created.id, selectedCollaborators.value.map(c => c.id))
        }
        if (selectedGuests.value.length > 0) {
          await courseAdapter.inviteGuests(created.id, selectedGuests.value.map(g => g.id))
        }
      }
      router.back()
    }
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Error al guardar el curso. Intenta de nuevo.'
  }
  saving.value = false
}
</script>

<style scoped>
/* Override TopBar sticky behavior for this view */
.course-creation :deep(.top-bar) {
  position: relative;
  top: auto;
}

.course-creation {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  position: relative;
}

.creation-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.form-content {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.form-footer {
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.save-error {
  font-size: 13px;
  color: #FF453A;
  margin-bottom: 10px;
  text-align: center;
}

.thumb-upload {
  width: 100%;
  height: 140px;
  border-radius: 16px;
  background: #1C1C1E;
  border: 2px dashed rgba(255,255,255,0.1);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumb-upload img { width: 100%; height: 100%; object-fit: cover; }

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #8E8E93;
  font-size: 14px;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #1C1C1E;
  border-radius: 12px;
}

.toggle-label { font-size: 15px; color: #fff; }

.toggle {
  width: 44px;
  height: 24px;
  appearance: none;
  border-radius: 12px;
  background: #333;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.toggle:checked { background: var(--purple-primary); }

.toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
}

.toggle:checked::before { transform: translateX(20px); }

.deadline-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.deadline-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

.date-input {
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 12px 14px;
  color: #fff;
  font-size: 15px;
  width: 100%;
  appearance: none;
  color-scheme: dark;
}

.date-input:focus { outline: none; border-color: var(--purple-primary, #BF5AF2); }

.deadline-hint {
  font-size: 12px;
  color: #8E8E93;
  line-height: 1.4;
}

.category-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-select {
  background: var(--bg-input, #1C1C1E);
  border: 1px solid var(--border-color, rgba(255,255,255,0.12));
  border-radius: var(--radius-md, 12px);
  padding: 12px 16px;
  color: var(--text-primary, #fff);
  font-size: 15px;
  width: 100%;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.category-select:focus {
  outline: none;
  border-color: var(--purple-primary, #BF5AF2);
}

.category-select option {
  background: #1C1C1E;
  color: #fff;
}

/* Collaborator section */
.collaborator-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.collab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collab-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1C1C1E;
  color: #fff;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 16px;
}

.chip-remove {
  background: none;
  border: none;
  color: #8E8E93;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.collab-search-input {
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 12px 14px;
  color: #fff;
  font-size: 15px;
  width: 100%;
}

.collab-search-input:focus { outline: none; border-color: var(--purple-primary, #BF5AF2); }

.collab-results {
  list-style: none;
  margin: 0;
  padding: 0;
  background: #1C1C1E;
  border-radius: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.collab-result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  transition: background 0.15s;
}

.collab-result-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.collab-result-item:hover { background: rgba(255,255,255,0.06); }
.collab-result-item.selected { opacity: 0.5; }
.collab-email { color: #8E8E93; font-size: 12px; }

/* Liquid glass dialog  */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.liquid-glass-dialog {
  background: rgba(28,28,30,0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 24px;
  max-width: 360px;
  width: 90%;
  text-align: center;
}

.dialog-title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
}

.dialog-message {
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 24px;
}

.dialog-buttons {
  display: flex;
  gap: 8px;
}

.dialog-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
}

.dialog-btn.cancel { color: #fff; }
.dialog-btn.accept { color: #FF6B6B; }

/* Guest chips — teal accent to distinguish from collaborator chips */
.guest-chip {
  background: rgba(0, 180, 160, 0.15);
  border: 1px solid rgba(0, 180, 160, 0.35);
}
</style>
