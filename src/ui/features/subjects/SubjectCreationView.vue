<template>
  <div class="subject-creation">
    <TopBar :title="isEdit ? 'Editar Materia' : 'Crear Materia'" @back="$router.back()" />

    <form class="creation-form" @submit.prevent="save">
      <div class="thumb-upload" @click="openFilePicker">
        <img v-if="thumbPreview" :src="thumbPreview" alt="" @error="thumbPreview = ''" />
        <div v-else class="upload-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          <p>Imagen de la materia</p>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
      </div>

      <AppInput v-model="name" label="Nombre de la materia" />
      <AppInput v-model="description" label="Descripción" />
      <AppInput v-model="code" label="Código (opcional)" />

      <p v-if="saveError" class="save-error">{{ saveError }}</p>
      <AppButton type="submit" :loading="saving" full>{{ isEdit ? 'Guardar' : 'Crear' }}</AppButton>
    </form>

    <!-- Sección colaboradores: visible sólo en modo edición -->
    <section v-if="isEdit && subjectId" class="collaborators-section">
      <h3 class="collabs-title">Colaboradores de la materia</h3>
      <p class="collabs-subtitle">Docentes con permisos de dueño: pueden crear, editar y eliminar temas, tareas y calificar.</p>

      <!-- Buscador de usuarios -->
      <div class="search-row">
        <input
          v-model="userSearch"
          class="search-input"
          placeholder="Buscar docente por nombre o email…"
          @input="onSearchInput"
        />
      </div>

      <!-- Resultados de búsqueda -->
      <ul v-if="searchResults.length" class="search-results">
        <li
          v-for="u in searchResults"
          :key="u.id"
          class="search-result-item"
          @click="addCollaborator(u)"
        >
          <img v-if="u.avatar" :src="u.avatar" class="user-avatar" alt="" />
          <span v-else class="user-avatar-placeholder">{{ u.username?.[0]?.toUpperCase() }}</span>
          <div class="user-info">
            <span class="user-name">{{ u.username }}</span>
            <span class="user-email">{{ u.email }}</span>
          </div>
          <span class="add-icon">+</span>
        </li>
      </ul>
      <p v-else-if="userSearch.length > 1 && !searchLoading" class="no-results">Sin resultados</p>

      <!-- Lista de colaboradores actuales -->
      <div v-if="collabLoading" class="collabs-loading">Cargando colaboradores…</div>
      <ul v-else-if="collaborators.length" class="collab-list">
        <li v-for="c in collaborators" :key="c.id" class="collab-item">
          <img v-if="c.user?.avatar" :src="c.user.avatar" class="user-avatar" alt="" />
          <span v-else class="user-avatar-placeholder">{{ c.user?.username?.[0]?.toUpperCase() }}</span>
          <div class="user-info">
            <span class="user-name">{{ c.user?.username ?? `Usuario #${c.userId}` }}</span>
            <span class="user-email">{{ c.user?.email }}</span>
          </div>
          <button type="button" class="remove-btn" :disabled="removingId === c.userId" @click="removeCollaborator(c.userId)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </li>
      </ul>
      <p v-else class="no-collabs">Aún no hay colaboradores.</p>
      <p v-if="collabError" class="save-error">{{ collabError }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'
import type { SubjectCollaborator } from '@/infrastructure/api/subjectAdapter'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const description = ref('')
const code = ref('')
const thumbPreview = ref('')
const saving = ref(false)
const saveError = ref('')
const isEdit = ref(false)
const subjectId = ref(0)
const courseId = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Collaborators state
const collaborators = ref<SubjectCollaborator[]>([])
const collabLoading = ref(false)
const collabError = ref('')
const removingId = ref<number | null>(null)
const userSearch = ref('')
const searchResults = ref<{ id: number; username: string; email: string; avatar: string }[]>([])
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  courseId.value = Number(route.query.courseId) || 0
  if (!courseId.value) { router.back(); return }

  const currentUserId = Number(authStore.user?.id ?? 0)
  const { courseAdapter, collaboratorAdapter, subjectAdapter } = await import('@/infrastructure/api')

  let isCourseCreator = false

  if (!authStore.isAdminOrDocente) {
    router.back()
    return
  }

  try {
    const course = await courseAdapter.getCourseById(courseId.value)
    isCourseCreator = currentUserId > 0 && currentUserId === Number(course.creatorUserId)

    if (!isCourseCreator && !authStore.isAdmin) {
      const res = await collaboratorAdapter.checkAccess(courseId.value)
      if (!res.hasAccess) { router.back(); return }
    }
  } catch {
    router.back()
    return
  }

  subjectId.value = Number(route.query.subjectId) || 0
  if (subjectId.value) {
    isEdit.value = true
    try {
      const subject = await subjectAdapter.getSubjectById(subjectId.value)
      if (!authStore.isAdmin && !isCourseCreator && subject.createdBy != null && Number(subject.createdBy) !== currentUserId) {
        router.back()
        return
      }

      name.value = subject.name || ''
      description.value = subject.description || ''
      code.value = subject.code || ''
      thumbPreview.value = subject.thumbnailUrl || ''
    } catch {
      router.back()
      return
    }

    loadCollaborators()
  }
})

async function loadCollaborators() {
  if (!subjectId.value) return
  collabLoading.value = true
  collabError.value = ''
  try {
    const { subjectCollaboratorAdapter } = await import('@/infrastructure/api/subjectAdapter')
    collaborators.value = await subjectCollaboratorAdapter.getCollaborators(subjectId.value)
  } catch (err) {
    collabError.value = err instanceof Error ? err.message : 'Error al cargar colaboradores'
  } finally {
    collabLoading.value = false
  }
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  if (userSearch.value.length < 2) { searchResults.value = []; return }
  searchTimer = setTimeout(searchUsers, 350)
}

async function searchUsers() {
  if (userSearch.value.length < 2) return
  searchLoading.value = true
  try {
    const { userAdapter } = await import('@/infrastructure/api')
    const users = await userAdapter.searchUsers(userSearch.value)
    const existingIds = new Set(collaborators.value.map(c => c.userId))
    searchResults.value = users
      .filter(u => !existingIds.has(Number(u.id)))
      .map(u => ({ id: Number(u.id), username: u.username ?? '', email: u.email ?? '', avatar: u.avatar ?? '' }))
  } catch {
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

async function addCollaborator(user: { id: number; username: string; email: string; avatar: string }) {
  collabError.value = ''
  try {
    const { subjectCollaboratorAdapter } = await import('@/infrastructure/api/subjectAdapter')
    const collab = await subjectCollaboratorAdapter.addCollaborator(subjectId.value, user.id)
    collaborators.value.push(collab)
    searchResults.value = searchResults.value.filter(u => u.id !== user.id)
    userSearch.value = ''
    searchResults.value = []
  } catch (err) {
    collabError.value = err instanceof Error ? err.message : 'Error al añadir colaborador'
  }
}

async function removeCollaborator(userId: number) {
  collabError.value = ''
  removingId.value = userId
  try {
    const { subjectCollaboratorAdapter } = await import('@/infrastructure/api/subjectAdapter')
    await subjectCollaboratorAdapter.removeCollaborator(subjectId.value, userId)
    collaborators.value = collaborators.value.filter(c => c.userId !== userId)
  } catch (err) {
    collabError.value = err instanceof Error ? err.message : 'Error al eliminar colaborador'
  } finally {
    removingId.value = null
  }
}

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    thumbPreview.value = URL.createObjectURL(file)
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    const { subjectAdapter } = await import('@/infrastructure/api')

    // Upload thumbnail if a new file was selected
    let thumbnailUrl: string | undefined
    if (selectedFile.value) {
      const { api } = await import('@/infrastructure/api/httpClient')
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('prefix', 'thumbnails')
      const uploaded = await api.upload<{ publicUrl: string }>('/storage/upload', formData)
      thumbnailUrl = encodeURI(uploaded.publicUrl)
    }

    if (isEdit.value && subjectId.value) {
      const payload: Record<string, unknown> = {
        name: name.value,
        description: description.value,
        code: code.value || undefined,
      }
      if (thumbnailUrl) payload.thumbnailUrl = thumbnailUrl
      await subjectAdapter.updateSubject(subjectId.value, payload)
    } else {
      const payload: Record<string, unknown> = {
        name: name.value,
        description: description.value,
        code: code.value || undefined,
        courseId: courseId.value,
        createdBy: authStore.user?.id,
      }
      if (thumbnailUrl) payload.thumbnailUrl = thumbnailUrl
      await subjectAdapter.createSubject(payload as Parameters<typeof subjectAdapter.createSubject>[0])
    }
    // Navigate explicitly so SubjectsListView always remounts and reloads
    router.replace({ path: `/subjects/${courseId.value}` })
  } catch (err) {
    if (err instanceof Error) {
      const msg = err.message.toLowerCase()
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('uq_subjects')) {
        saveError.value = 'Ya existe una materia con ese nombre en este curso'
      } else {
        saveError.value = err.message
      }
    } else {
      saveError.value = 'Error al guardar la materia'
    }
  }
  saving.value = false
}
</script>

<style scoped>
.subject-creation { min-height: 100vh; background: var(--bg-primary); }

.creation-form { padding: 24px 16px; display: flex; flex-direction: column; gap: 16px; }

.thumb-upload {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  background: #1C1C1E;
  border: 2px dashed rgba(255,255,255,0.1);
  overflow: hidden;
  cursor: pointer;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-upload img { width: 100%; height: 100%; object-fit: cover; }

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #8E8E93;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.save-error {
  font-size: 13px;
  color: #FF453A;
  text-align: center;
}

/* ── Collaborators section ── */
.collaborators-section {
  padding: 0 16px 32px;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 8px;
}

.collabs-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 20px 0 4px;
}

.collabs-subtitle {
  font-size: 12px;
  color: #8E8E93;
  margin: 0 0 16px;
  line-height: 1.5;
}

.search-row { margin-bottom: 8px; }

.search-input {
  width: 100%;
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 10px 14px;
  color: var(--text-primary, #fff);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.search-input::placeholder { color: #636366; }

.search-results {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  background: #1C1C1E;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-result-item:hover { background: rgba(255,255,255,0.05); }

.no-results { font-size: 13px; color: #636366; text-align: center; margin: 4px 0 12px; }

.collab-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.collab-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #1C1C1E;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3A3A3C;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #8E8E93;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-icon {
  font-size: 20px;
  color: #30D158;
  font-weight: 700;
  flex-shrink: 0;
}

.remove-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #FF453A;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  flex-shrink: 0;
}

.remove-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.no-collabs { font-size: 13px; color: #636366; margin: 8px 0 0; }

.collabs-loading { font-size: 13px; color: #8E8E93; padding: 8px 0; }
</style>
