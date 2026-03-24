<template>
  <div class="course-task">
    <!-- ── Edit / Create mode (admin / docente) ── -->
    <template v-if="isEditorMode">
      <div class="bar">
        <button class="bar-back" @click="$router.back()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="bar-title">{{ isCreateMode ? 'Nueva Tarea' : 'Editar Tarea' }}</span>
        <button class="bar-save" :disabled="saving || !formTitle.trim()" @click="handleSave">
          <span v-if="saving" class="spinner-sm" />
          <span v-else>Guardar</span>
        </button>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner-lg" /></div>

      <div v-else class="scroll-content">
        <p class="field-label">Nombre de la Tarea</p>
        <input v-model="formTitle" class="field-input" placeholder="Título de la tarea" maxlength="200" />

        <p class="field-label mt-16">Descripción</p>
        <textarea v-model="formDescription" class="field-input field-textarea" placeholder="Describe la tarea" rows="4" />

        <p class="field-label mt-16">Fecha límite (opcional)</p>
        <input v-model="formDueDate" type="date" class="field-input" />

        <p class="field-label mt-16">Archivo adjunto (opcional)</p>
        <div class="file-upload-editor" @click="formFileInputRef?.click()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          <span>{{ formFile ? formFile.name : 'Seleccionar archivo' }}</span>
          <button v-if="formFile" class="file-clear" @click.stop="formFile = null">✕</button>
          <input ref="formFileInputRef" type="file" hidden @change="onFormFileSelected" />
        </div>

        <p v-if="errorMsg" class="error-msg mt-16">{{ errorMsg }}</p>
        <div style="height: 32px" />
      </div>
    </template>

    <!-- ── Student submission mode ── -->
    <template v-else>
      <TopBar :title="task?.title ?? 'Tarea'" @back="$router.back()" />

      <div v-if="task" class="task-content">
        <div class="task-header">
          <h2 class="task-title">{{ task.title }}</h2>
          <p class="task-desc">{{ task.description }}</p>
          <div class="task-meta-row">
            <span class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {{ task.dueDate ?? task.due_date ?? 'Sin fecha límite' }}
            </span>
          </div>
        </div>

        <div class="submission-section">
          <!-- Status banner -->
          <div v-if="existingSubmission" class="submission-status" :class="existingSubmission.grade !== null ? 'status-graded' : 'status-pending'">
            <div class="status-icon">
              <svg v-if="existingSubmission.grade !== null" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="status-body">
              <p class="status-title" v-if="existingSubmission.grade !== null">Calificada: {{ existingSubmission.grade }} / 10</p>
              <p class="status-title" v-else>Enviada — Pendiente de revisión</p>
              <p v-if="existingSubmission.feedback" class="status-feedback">{{ existingSubmission.feedback }}</p>
            </div>
          </div>

          <h3 class="section-title">{{ existingSubmission ? 'Actualizar entrega' : 'Tu Entrega' }}</h3>
          <textarea
            v-model="submission"
            class="submission-input"
            placeholder="Escribe tu respuesta aquí..."
            rows="6"
          />
          <div class="file-upload" @click="fileInputRef?.click()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            <span>{{ selectedFile ? selectedFile.name : 'Adjuntar archivo' }}</span>
            <input ref="fileInputRef" type="file" hidden @change="onFileSelected" />
          </div>
          <div v-if="uploading && selectedFile" class="upload-progress">
            <div class="progress-bar" :style="{ width: uploadProgress + '%' }" />
            <span class="progress-label">Subiendo... {{ uploadProgress }}%</span>
          </div>
          <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <AppButton full :disabled="uploading" @click="submitTask">{{ uploading ? 'Enviando...' : existingSubmission ? 'Actualizar Tarea' : 'Enviar Tarea' }}</AppButton>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Task, TaskSubmission } from '@/domain/models'
import { taskAdapter, submissionAdapter, uploadFileDirect } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const taskId = computed(() => {
  const raw = route.params.taskId
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
})

const isCreateMode = computed(() => taskId.value === null)
const canEdit = computed(() => authStore.isAdmin || authStore.isDocente)
// Edit mode: user is admin/docente AND (no taskId = create, OR edit=true query)
const isEditorMode = computed(() => canEdit.value && (isCreateMode.value || route.query.edit === 'true'))

// ── Editor form state ──
const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const formTitle = ref('')
const formDescription = ref('')
const formDueDate = ref('')
const formFile = ref<File | null>(null)
const formFileInputRef = ref<HTMLInputElement | null>(null)

function onFormFileSelected(e: Event) {
  formFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function handleSave() {
  if (!formTitle.value.trim()) return
  saving.value = true
  errorMsg.value = ''
  try {
    const topicId = route.query.topicId ? Number(route.query.topicId) : undefined
    let formFileKey: string | undefined
    if (formFile.value) {
      const { key } = await uploadFileDirect(formFile.value, 'tasks', () => {})
      formFileKey = key
    }
    if (isCreateMode.value) {
      await taskAdapter.createTask({
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        topicId,
        dueDate: formDueDate.value || null,
        ...(formFileKey ? { fileKey: formFileKey } : {}),
      } as Partial<Task>)
      const courseId = route.params.courseId as string
      const subjectId = route.query.subjectId as string | undefined
      router.push({
        path: `/course/${courseId}`,
        query: subjectId ? { subjectId } : undefined,
      })
    } else {
      await taskAdapter.updateTask(taskId.value!, {
        title: formTitle.value.trim(),
        description: formDescription.value.trim(),
        dueDate: formDueDate.value || null,
        ...(formFileKey ? { fileKey: formFileKey } : {}),
      } as Partial<Task>)
      router.back()
    }
  } catch {
    errorMsg.value = 'Error al guardar la tarea. Intenta de nuevo.'
  } finally {
    saving.value = false
  }
}

// ── Student submission state ──
const task = ref<Task | null>(null)
const existingSubmission = ref<TaskSubmission | null>(null)
const submission = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const submitError = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

function onFileSelected(e: Event) {
  selectedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function submitTask() {
  if (!task.value) return
  uploading.value = true
  submitError.value = ''
  uploadProgress.value = 0
  try {
    let fileKey: string | undefined
    if (selectedFile.value) {
      const { key } = await uploadFileDirect(
        selectedFile.value,
        'submissions',
        (pct) => { uploadProgress.value = pct },
      )
      fileKey = key
    }
    const result = await submissionAdapter.submitWork({
      task_id: task.value.id,
      text: submission.value,
      ...(fileKey ? { file_key: fileKey } : {}),
    })
    existingSubmission.value = result
    submission.value = ''
    selectedFile.value = null
    uploadProgress.value = 0
  } catch {
    submitError.value = 'Error al enviar la tarea. Intenta de nuevo.'
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  if (isEditorMode.value && !isCreateMode.value) {
    loading.value = true
    try {
      const t = await taskAdapter.getTaskById(taskId.value!)
      formTitle.value = t.title ?? ''
      formDescription.value = t.description ?? ''
      formDueDate.value = t.dueDate ?? t.due_date ?? ''
    } catch { /* empty */ }
    loading.value = false
    return
  }
  if (!isEditorMode.value && taskId.value) {
    try { task.value = await taskAdapter.getTaskById(taskId.value) } catch { /* empty */ }
    try { existingSubmission.value = await submissionAdapter.getSubmissionByUserAndTask(taskId.value) } catch { /* empty */ }
  }
})
</script>

<style scoped>
.course-task { min-height: 100vh; background: #000; display: flex; flex-direction: column; }

/* ── Editor mode bar ── */
.bar {
  display: flex; align-items: center; padding: 12px 16px; gap: 8px;
  background: #000; position: sticky; top: 0; z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.bar-back {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; flex-shrink: 0; border-radius: 8px;
}
.bar-back:active { background: rgba(255,255,255,0.08); }
.bar-title { flex: 1; text-align: center; font-size: 17px; font-weight: 700; color: #fff; }
.bar-save {
  background: transparent; border: none; font-size: 16px; font-weight: 600;
  color: #BF5AF2; cursor: pointer; padding: 6px 4px; flex-shrink: 0;
  display: flex; align-items: center; min-width: 56px; justify-content: flex-end;
}
.bar-save:disabled { opacity: 0.4; cursor: not-allowed; }

.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
.spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(191,90,242,0.3); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.scroll-content { padding: 16px; flex: 1; }
.mt-16 { margin-top: 16px; }

.field-label { font-size: 15px; font-weight: 500; color: #fff; margin-bottom: 8px; }
.field-input {
  width: 100%; background: #1A1A1A; border: none; border-radius: 8px;
  padding: 12px; font-size: 15px; color: #fff; outline: none;
  box-sizing: border-box; font-family: inherit;
}
.field-input::placeholder { color: #666; }
.field-input:focus { background: #222; }
.field-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
.error-msg { font-size: 13px; color: #FF453A; }

.file-upload-editor {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  border-radius: 8px; background: #1A1A1A; cursor: pointer; color: #8E8E93;
  font-size: 14px; font-family: inherit;
}
.file-upload-editor:hover { background: #222; }
.file-upload-editor span { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-clear {
  background: transparent; border: none; color: #666; cursor: pointer;
  font-size: 14px; padding: 0 2px; flex-shrink: 0; line-height: 1;
}
.file-clear:hover { color: #FF453A; }

/* ── Student mode ── */
.task-content { padding: 16px; }
.task-header { margin-bottom: 24px; }
.task-title { font-size: 22px; font-weight: 700; color: #fff; }
.task-desc { font-size: 14px; color: #8E8E93; margin-top: 6px; line-height: 1.5; }
.task-meta-row { display: flex; gap: 8px; margin-top: 12px; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px;
  border-radius: 12px; background: rgba(255,255,255,0.08); color: #8E8E93;
  font-size: 12px; font-weight: 500;
}
.section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 12px; }
.submission-section { display: flex; flex-direction: column; gap: 12px; }
.submission-input {
  width: 100%; padding: 14px; border-radius: 12px; background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.08); color: #fff; font-size: 14px; resize: vertical;
}
.submission-input::placeholder { color: #8E8E93; }
.submission-input:focus { border-color: var(--purple-primary); outline: none; }
.file-upload {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  border-radius: 12px; background: #1C1C1E; cursor: pointer; color: #8E8E93; font-size: 14px;
}
.file-upload:hover { background: #242424; }
.upload-progress {
  position: relative; height: 4px; background: rgba(255,255,255,0.08);
  border-radius: 2px; overflow: hidden;
}
.progress-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--purple-primary, #BF5AF2); border-radius: 2px; transition: width 0.2s ease;
}
.progress-label { display: block; font-size: 12px; color: #8E8E93; margin-top: 4px; }
.submit-error { font-size: 13px; color: #FF453A; }

/* ── Submission status banner ── */
.submission-status {
  display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px;
  border-radius: 12px; margin-bottom: 4px;
}
.status-pending {
  background: rgba(255, 159, 10, 0.12);
  border: 1px solid rgba(255, 159, 10, 0.35);
  color: #FF9F0A;
}
.status-graded {
  background: rgba(48, 209, 88, 0.12);
  border: 1px solid rgba(48, 209, 88, 0.35);
  color: #30D158;
}
.status-icon { flex-shrink: 0; margin-top: 1px; }
.status-body { display: flex; flex-direction: column; gap: 4px; }
.status-title { font-size: 15px; font-weight: 600; margin: 0; }
.status-feedback { font-size: 13px; opacity: 0.85; margin: 0; line-height: 1.4; color: #fff; }
</style>
