<template>
  <div class="content-upload">
    <TopBar title="Subir Contenido" @back="$router.back()" />

    <form class="upload-form" @submit.prevent="submit">
      <div class="upload-area" @click="openFilePicker" @dragover.prevent @drop.prevent="onDrop">
        <div v-if="!file" class="upload-prompt">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <p class="upload-text">Arrastra o selecciona un archivo</p>
          <p class="upload-hint">Documentos, videos, imágenes</p>
        </div>
        <div v-else class="file-preview">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
          <p class="file-name">{{ file.name }}</p>
          <p class="file-size">{{ formatSize(file.size) }}</p>
        </div>
        <input ref="fileInput" type="file" hidden @change="onFileSelect" />
      </div>

      <AppInput v-model="title" label="Título" />
      <AppInput v-model="description" label="Descripción" />

      <div v-if="uploading" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <AppButton type="submit" :loading="uploading" full>Subir</AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppInput from '@/ui/shared/components/AppInput.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const fileInput = ref<HTMLInputElement>()
const file = ref<File | null>(null)
const title = ref('')
const description = ref('')
const uploading = ref(false)
const progress = ref(0)

function openFilePicker() { fileInput.value?.click() }

function onFileSelect(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function onDrop(e: DragEvent) {
  file.value = e.dataTransfer?.files?.[0] ?? null
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

async function submit() {
  if (!file.value) return
  uploading.value = true
  for (let i = 0; i <= 100; i += 10) {
    progress.value = i
    await new Promise(r => setTimeout(r, 200))
  }
  uploading.value = false
}
</script>

<style scoped>
.content-upload { min-height: 100vh; background: var(--bg-primary); }
.upload-form { padding: 24px 16px; display: flex; flex-direction: column; gap: 16px; }

.upload-area {
  width: 100%;
  padding: 40px 20px;
  border-radius: 16px;
  background: #1C1C1E;
  border: 2px dashed rgba(255,255,255,0.1);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s;
}

.upload-area:hover { border-color: var(--purple-primary); }

.upload-prompt { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.upload-text { font-size: 15px; color: #fff; font-weight: 500; }
.upload-hint { font-size: 13px; color: #8E8E93; }

.file-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.file-name { font-size: 14px; color: #fff; font-weight: 500; }
.file-size { font-size: 12px; color: #8E8E93; }

.progress-bar {
  height: 4px;
  border-radius: 2px;
  background: #333;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--purple-primary), #00D4FF);
  border-radius: 2px;
  transition: width 0.2s;
}
</style>
