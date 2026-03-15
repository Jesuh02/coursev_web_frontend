<template>
  <div class="subject-creation">
    <TopBar title="Crear Materia" @back="$router.back()" />

    <form class="creation-form" @submit.prevent="create">
      <div class="thumb-upload" @click="(($refs.fileInput as HTMLInputElement)?.click())">
        <img v-if="thumbPreview" :src="thumbPreview" alt="" />
        <div v-else class="upload-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          <p>Imagen de la materia</p>
        </div>
        <input ref="fileInput" type="file" accept="image/*" hidden @change="onFile" />
      </div>

      <AppInput v-model="name" label="Nombre de la materia" />

      <AppButton type="submit" :loading="saving" full>Crear</AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const name = ref('')
const thumbPreview = ref('')
const saving = ref(false)

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) thumbPreview.value = URL.createObjectURL(file)
}

async function create() {
  saving.value = true
  try {
    const { subjectAdapter } = await import('@/infrastructure/api')
    await subjectAdapter.createSubject({ name: name.value, courseId: 0, description: '' })
  } catch { /* empty */ }
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
</style>
