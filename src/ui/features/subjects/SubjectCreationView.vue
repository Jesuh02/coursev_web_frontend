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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

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
  }
})

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
</style>
