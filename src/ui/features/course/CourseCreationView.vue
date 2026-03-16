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

const route = useRoute()
const router = useRouter()
const fileInput = ref<HTMLInputElement>()
const saving = ref(false)
const authStore = useAuthStore()
const selectedFile = ref<File | null>(null)

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
})

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
</style>
