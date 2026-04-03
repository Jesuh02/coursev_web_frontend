<template>
  <div class="course-topic">
    <!-- Header: back + title + save -->
    <div class="bar">
      <button class="bar-back" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <span class="bar-title">{{ isCreateMode ? 'Nuevo Tema' : 'Editar Tema' }}</span>
      <button class="bar-save" :disabled="saving || !formTitle.trim()" @click="handleSave">
        <span v-if="saving" class="spinner-sm" />
        <span v-else-if="uploadProgress !== null">{{ uploadProgress }}%</span>
        <span v-else>Guardar</span>
      </button>
    </div>

    <div v-if="loading" class="loading-center">
      <div class="spinner-lg" />
    </div>

    <div v-else class="scroll-content">
      <!-- Nombre del Tema -->
      <p class="field-label">Nombre del Tema</p>
      <input
        v-model="formTitle"
        class="field-input"
        placeholder="Ingresa el nombre del tema"
        maxlength="120"
      />

      <!-- Descripción -->
      <p class="field-label mt-16">Descripción</p>
      <textarea
        v-model="formDescription"
        class="field-input field-textarea"
        placeholder="Describe de qué trata este tema"
        rows="4"
      />

      <!-- ── Contenido del Tema ── -->
      <p class="section-heading mt-24">Contenido del Tema</p>

      <!-- Existing content items -->
      <div
        v-for="item in contentItems"
        :key="item.id"
        class="list-row"
      >
        <div class="row-icon" :class="getIconClass(item.contentType)">
          <svg v-if="item.contentType === 'video'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-else-if="item.contentType === 'image'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="row-info">
          <p class="row-title">{{ item.fileName || item.content || 'Archivo' }}</p>
          <p class="row-meta">{{ item.contentType }}</p>
        </div>
        <a :href="getFileUrl(item)" target="_blank" rel="noopener" class="row-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>
      </div>

      <!-- Pending files (not yet uploaded) -->
      <div
        v-for="(pf, i) in pendingFiles"
        :key="'pf-' + i"
        class="list-row pending-row"
      >
        <div class="row-icon" :class="pf.type">
          <svg v-if="pf.type === 'video'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="row-info">
          <p class="row-title">{{ pf.file.name }}</p>
          <p class="row-meta pending-label">{{ pf.type === 'video' ? 'Video · Pendiente' : 'Documento · Pendiente' }}</p>
        </div>
        <button class="row-action remove-btn" @click="removePending(i)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Add content buttons -->
      <div class="content-buttons-grid">
        <button class="add-row" @click="videoInputRef?.click()">
          <div class="add-icon video-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <span class="add-label">Agregar Video</span>
        </button>
        <input ref="videoInputRef" type="file" accept="video/*" class="hidden-input" @change="onVideoSelected" />

        <button class="add-row" @click="docInputRef?.click()">
          <div class="add-icon doc-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <span class="add-label">Agregar Documento</span>
        </button>
        <input ref="docInputRef" type="file" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx" class="hidden-input" @change="onDocSelected" />
      </div>

      <!-- ── Tareas del Tema ── -->
      <p class="section-heading mt-24">Tareas del Tema</p>

      <!-- Existing tasks -->
      <div
        v-for="task in tasks"
        :key="task.id"
        class="list-row clickable"
        @click="$router.push(`/course/${$route.params.courseId}/task/${task.id}`)"
      >
        <div class="row-icon task-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div class="row-info">
          <p class="row-title">{{ task.title }}</p>
          <p v-if="task.description" class="row-meta">{{ task.description }}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <!-- Create task button -->
      <button class="add-row mt-16" @click="navigateToCreateTask">
        <div class="add-icon task-add-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span class="add-label">Crear Tarea</span>
      </button>

      <p v-if="errorMsg" class="error-msg mt-16">{{ errorMsg }}</p>

      <!-- bottom spacer -->
      <div style="height: 32px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Topic, ContentItem, Task } from '@/domain/models'
import { topicAdapter, contentItemAdapter, taskAdapter, uploadFileDirect, buildProxyFileUrl } from '@/infrastructure/api'

const route = useRoute()
const router = useRouter()

const topic = ref<Topic | null>(null)
const contentItems = ref<ContentItem[]>([])
const tasks = ref<Task[]>([])
const loading = ref(true)

const formTitle = ref('')
const formDescription = ref('')
const saving = ref(false)
const errorMsg = ref('')
const uploadProgress = ref<number | null>(null)

interface PendingFile { file: File; type: 'video' | 'document' }
const pendingFiles = ref<PendingFile[]>([])

const videoInputRef = ref<HTMLInputElement | null>(null)
const docInputRef = ref<HTMLInputElement | null>(null)

const topicId = computed(() => {
  const raw = route.params.topicId
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const isCreateMode = computed(() => topicId.value === null)
const courseId = computed(() => route.params.courseId as string)
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)

function onVideoSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) pendingFiles.value.push({ file, type: 'video' })
  ;(e.target as HTMLInputElement).value = ''
}

function onDocSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) pendingFiles.value.push({ file, type: 'document' })
  ;(e.target as HTMLInputElement).value = ''
}

function removePending(index: number) {
  pendingFiles.value.splice(index, 1)
}

function navigateToCreateTask() {
  const id = topicId.value
  router.push({
    path: `/course/${courseId.value}/task`,
    query: { topicId: id ? String(id) : undefined, subjectId: subjectId.value ? String(subjectId.value) : undefined },
  })
}

async function uploadPendingFiles(resolvedTopicId: number) {
  const total = pendingFiles.value.length
  if (total === 0) return
  uploadProgress.value = 0
  let completed = 0

  // Subir todos en paralelo directamente a R2 (sin pasar por el servidor)
  await Promise.all(
    pendingFiles.value.map(async (pf) => {
      try {
        const prefix = pf.type === 'video' ? 'videos' : 'content'
        const { publicUrl } = await uploadFileDirect(
          pf.file,
          prefix,
          (pct) => {
            // Progreso promedio de todos los archivos
            uploadProgress.value = Math.round((completed * 100 + pct) / total)
          },
        )
        await contentItemAdapter.create({
          topicId: resolvedTopicId,
          contentType: pf.type,
          content: pf.file.name,
          fileUri: publicUrl,
          fileName: pf.file.name,
          orderIndex: 0,
        } as Partial<ContentItem>)
        completed++
        uploadProgress.value = Math.round((completed / total) * 100)
      } catch { /* skip failed file */ }
    }),
  )

  uploadProgress.value = null
}

async function handleSave() {
  if (!formTitle.value.trim()) return
  saving.value = true
  errorMsg.value = ''
  try {
    if (isCreateMode.value) {
      const payload: Record<string, unknown> = {
        name: formTitle.value.trim(),
        description: formDescription.value.trim(),
        subjectId: subjectId.value && subjectId.value > 0 ? subjectId.value : Number(courseId.value),
      }
      const created = await topicAdapter.createTopic(payload as Partial<Topic>)
      if (pendingFiles.value.length && created?.id) {
        await uploadPendingFiles(created.id)
      }
    } else {
      const id = topicId.value!
      await topicAdapter.updateTopic(id, {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
      } as Partial<Topic>)
      if (pendingFiles.value.length) {
        await uploadPendingFiles(id)
        contentItems.value = await contentItemAdapter.getByTopic(id)
      }
      pendingFiles.value = []
    }
    router.back()
  } catch {
    errorMsg.value = 'Error al guardar el tema. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

function getFileUrl(item: ContentItem): string {
  if (!item.fileUri) return '#'
  if (item.fileUri.startsWith('http')) return item.fileUri
  return buildProxyFileUrl(item.fileUri)
}

function getIconClass(type: string): string {
  if (type === 'video') return 'video'
  if (type === 'image') return 'image'
  return 'document'
}

onMounted(async () => {
  if (isCreateMode.value) {
    loading.value = false
    return
  }
  const id = topicId.value!
  try {
    const [t, items, topicTasks] = await Promise.all([
      topicAdapter.getTopicById(id),
      contentItemAdapter.getByTopic(id),
      taskAdapter.getTasksByTopic(id).catch(() => []),
    ])
    topic.value = t
    formTitle.value = t.title ?? ''
    formDescription.value = t.description ?? ''
    contentItems.value = items
    tasks.value = topicTasks
  } catch { /* empty */ }
  loading.value = false
})
</script>

<style scoped>
/* ── Base ── */
.course-topic {
  min-height: 100vh;
  background: #0A0E27;
  display: flex;
  flex-direction: column;
}

/* ── Header bar ── */
.bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
  background: #0A0E27;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.bar-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 8px;
}
.bar-back:active { background: rgba(255,255,255,0.08); }

.bar-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #fff;
}

.bar-save {
  background: transparent;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #06B6D4;
  cursor: pointer;
  padding: 6px 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 56px;
  justify-content: flex-end;
}
.bar-save:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Loading ── */
.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(6,182,212,0.2); border-top-color: #06B6D4; border-radius: 50%; animation: spin 0.7s linear infinite; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(6,182,212,0.3); border-top-color: #06B6D4; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Scroll content ── */
.scroll-content {
  padding: 16px;
  flex: 1;
}

/* ── Spacing helpers ── */
.mt-16 { margin-top: 16px; }
.mt-24 { margin-top: 24px; }

/* ── Form labels ── */
.field-label {
  font-size: 15px;
  font-weight: 500;
  color: #4FD4FF;
  margin-bottom: 8px;
}

/* ── Section container ── */
.section-container {
  background: #0F172A;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(6,182,212,0.1);
}

.section-heading {
  font-size: 15px;
  font-weight: 700;
  color: #70E8FB;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Inputs ── */
.field-input {
  width: 100%;
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(6,182,212,0.2);
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  color: #fff;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s;
}
.field-input::placeholder { color: #666; }
.field-input:focus { 
  background: rgba(15,23,42,0.95);
  border-color: rgba(6,182,212,0.4);
  box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
}
.field-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }

/* ── List rows (content items & tasks) ── */
.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(6,182,212,0.08);
  border-radius: 10px;
  margin-bottom: 8px;
}

.list-row.clickable { cursor: pointer; }
.list-row.clickable:active { background: #222; }

.pending-row { opacity: 0.85; border: 1px dashed rgba(6,182,212,0.3); }

.row-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-icon.video { background: rgba(255,55,95,0.15); color: #FF375F; }
.row-icon.document { background: rgba(0,122,255,0.15); color: #007AFF; }
.row-icon.image { background: rgba(52,199,89,0.15); color: #34C759; }
.task-icon { background: rgba(6,182,212,0.15); color: #06B6D4; }

.row-info { flex: 1; min-width: 0; }
.row-title { font-size: 14px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-meta { font-size: 12px; color: #8E8E93; margin-top: 2px; }
.pending-label { color: #06B6D4; }

.row-action { flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
a.row-action { text-decoration: none; }

.remove-btn { background: transparent; border: none; cursor: pointer; padding: 4px; }

/* ── Add content buttons ── */
.content-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.add-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px 12px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}
.add-row:active { opacity: 0.85; transform: scale(0.98); }

.add-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.video-icon { background: #FFE5ED; color: #E91E63; }
.doc-icon { background: #E3F2FD; color: #2196F3; }
.task-add-icon { background: #E0F7F4; color: #00BCD4; }

.add-label { font-size: 14px; color: #fff; font-weight: 500; }

/* ── Hidden file input ── */
.hidden-input { display: none; }

/* ── Error ── */
.error-msg { font-size: 13px; color: #FF453A; }
</style>
