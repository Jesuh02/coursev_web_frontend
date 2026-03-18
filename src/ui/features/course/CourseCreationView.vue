<template>
  <div class="course-creation">
    <TopBar :title="isEdit ? 'Editar Curso' : 'Crear Curso'" @back="$router.back()" />

    <form class="creation-form" @submit.prevent="submitCourse">
      <div class="thumb-upload" @click="openFilePicker">
        <img v-if="form.thumbnailPreview" :src="form.thumbnailPreview" alt="" />
        <div v-else class="upload-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          <p>Subir miniatura</p>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileSelect" />
      </div>

      <AppInput v-model="form.title" label="Título del curso" />
      <AppInput v-model="form.description" label="Descripción" />

      <div class="price-section">
        <label class="toggle-row">
          <span class="toggle-label">Curso Premium</span>
          <input v-model="form.isPremium" type="checkbox" class="toggle" />
        </label>
        <AppInput
          v-if="form.isPremium"
          v-model="form.price"
          label="Precio"
          type="number"
        />
      </div>

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
        <label class="input-label">Colaboradores</label>
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
          placeholder="Buscar usuario..."
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
            <span>{{ u.username }}</span>
            <span class="collab-email">{{ u.email }}</span>
          </li>
        </ul>
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

      <AppButton type="submit" :loading="saving" full>{{ isEdit ? 'Guardar Cambios' : 'Crear Curso' }}</AppButton>
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

const isEdit = computed(() => !!route.params.id)

// Min datetime = now (can't set deadline in the past)
const minDeadline = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const form = reactive({
  title: '',
  description: '',
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
  const { courseAdapter } = await import('@/infrastructure/api')
  const course = await courseAdapter.getCourseById(Number(route.params.id))
  form.title = course.title
  form.description = course.description ?? ''
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
})

function openFilePicker() { fileInput.value?.click() }

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    form.thumbnailPreview = URL.createObjectURL(file)
  }
}

// ─── Collaborator logic ───────────────────────────────────
function onCollabSearch() {
  if (collabSearchTimer) clearTimeout(collabSearchTimer)
  const q = collabQuery.value.trim()
  if (!q) { collabResults.value = []; return }
  collabSearchTimer = setTimeout(async () => {
    const { userAdapter } = await import('@/infrastructure/api')
    const users = await userAdapter.searchUsers(q)
    collabResults.value = users.filter(u => u.username !== authStore.user?.username)
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

async function submitCourse() {
  saving.value = true
  try {
    const { courseAdapter } = await import('@/infrastructure/api')
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
        isFree: !form.isPremium,
        price: form.isPremium ? Number(form.price) : 0,
        category: 'general',
        isActive: effectiveIsActive.value,
        deadline: form.hasDeadline && form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      if (thumbnailUri) payload.thumbnailUri = thumbnailUri
      await courseAdapter.updateCourse(Number(route.params.id), payload)
      router.back()
    } else {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        isFree: !form.isPremium,
        price: form.isPremium ? Number(form.price) : 0,
        category: 'general',
        creatorUsername: authStore.user?.username ?? '',
        isActive: effectiveIsActive.value,
        deadline: form.hasDeadline && form.deadline ? new Date(form.deadline).toISOString() : null,
      }
      if (thumbnailUri) payload.thumbnailUri = thumbnailUri
      await courseAdapter.createCourse(payload)
      router.back()
    }
  } catch { /* empty */ }
  saving.value = false
}
</script>

<style scoped>
.course-creation {
  min-height: 100vh;
  background: var(--bg-primary);
}

.creation-form {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.thumb-upload {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  background: #1C1C1E;
  border: 2px dashed rgba(255,255,255,0.1);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Collaborator section */
.collaborator-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  transition: background 0.15s;
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
</style>
