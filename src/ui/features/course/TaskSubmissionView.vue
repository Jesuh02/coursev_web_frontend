<template>
  <div class="task-submission">
    <TopBar :title="task?.title ?? 'Entrega de Tarea'" @back="$router.back()" />

    <div v-if="loading" class="loading-center"><div class="spinner" /></div>

    <div v-else class="submission-content">
      <div v-if="task" class="task-header-card">
        <h2 class="task-name">{{ task.title }}</h2>
        <p v-if="task.description" class="task-desc">{{ task.description }}</p>
        <div v-if="task.dueDate || task.due_date" class="due-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <span>{{ task.dueDate ?? task.due_date }}</span>
        </div>
      </div>

      <div class="status-card" :class="status">
        <div class="status-icon">
          <svg v-if="status === 'graded'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
          <svg v-else-if="status === 'pending'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <div>
          <p class="status-title">{{ statusLabel }}</p>
          <p v-if="submission?.grade !== null && submission?.grade !== undefined" class="status-grade">Calificación: {{ submission.grade }}/100</p>
        </div>
      </div>

      <div v-if="submission?.feedback" class="feedback-section">
        <h3 class="section-title">Retroalimentación</h3>
        <div class="feedback-card">
          <p>{{ submission.feedback }}</p>
        </div>
      </div>

      <div v-if="status !== 'not-submitted'" class="submission-detail">
        <h3 class="section-title">Tu Entrega</h3>
        <div class="detail-card">
          <p v-if="submission?.file_name" class="file-row">
            📎 <a v-if="submission.file_uri" :href="getFileUrl(submission)" target="_blank" rel="noopener">{{ submission.file_name }}</a>
            <span v-else>{{ submission.file_name }}</span>
          </p>
          <p v-else class="detail-text">Entrega enviada</p>
        </div>
      </div>

      <div v-if="status === 'not-submitted'" class="submit-section">
        <h3 class="section-title">Enviar Tarea</h3>
        <div class="file-upload" @click="($refs.fileInput as HTMLInputElement)?.click()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          <span>{{ selectedFile?.name ?? 'Adjuntar archivo' }}</span>
          <input ref="fileInput" type="file" hidden @change="onFileSelect" />
        </div>
        <textarea v-model="textAnswer" class="text-input" placeholder="Respuesta escrita (opcional)..." rows="4" />
        <button class="submit-btn" :disabled="submitting" @click="submitWork">
          {{ submitting ? 'Enviando...' : 'Enviar Tarea' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Task, TaskSubmission } from '@/domain/models'
import { taskAdapter, submissionAdapter, buildProxyFileUrl } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const task = ref<Task | null>(null)
const submission = ref<TaskSubmission | null>(null)
const loading = ref(true)
const submitting = ref(false)
const textAnswer = ref('')
const selectedFile = ref<File | null>(null)

const status = computed<'not-submitted' | 'pending' | 'graded'>(() => {
  if (!submission.value) return 'not-submitted'
  if (submission.value.grade !== null && submission.value.grade !== undefined) return 'graded'
  return 'pending'
})

const statusLabel = computed(() => {
  if (status.value === 'graded') return 'Calificada'
  if (status.value === 'pending') return 'Pendiente de revisión'
  return 'No entregada'
})

function getFileUrl(sub: TaskSubmission): string {
  if (!sub.file_uri || sub.file_uri.startsWith('file:///')) return '#'
  if (sub.file_uri.startsWith('http')) return sub.file_uri
  return buildProxyFileUrl(sub.file_uri)
}

function onFileSelect(e: Event) {
  selectedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function submitWork() {
  if (!task.value) return
  submitting.value = true
  try {
    let fileKey: string | undefined
    if (selectedFile.value) {
      const fd = new FormData()
      fd.append('file', selectedFile.value)
      const res = await submissionAdapter.uploadSubmissionFile(fd, `submissions/${task.value.id}`)
      fileKey = res.key
    }
    const payload: Record<string, unknown> = { taskId: task.value.id }
    if (textAnswer.value) payload.textContent = textAnswer.value
    if (fileKey) payload.fileUri = fileKey
    if (selectedFile.value) payload.fileName = selectedFile.value.name
    submission.value = await submissionAdapter.submitWork(payload)
  } catch { /* empty */ }
  submitting.value = false
}

onMounted(async () => {
  const taskId = Number(route.params.taskId)
  try {
    const [t, sub] = await Promise.all([
      taskAdapter.getTaskById(taskId),
      submissionAdapter.getSubmissionByUserAndTask(taskId, authStore.user?.id).catch(() => null),
    ])
    task.value = t
    submission.value = sub
  } catch { /* empty */ }
  loading.value = false
})
</script>

<style scoped>
.task-submission { min-height: 100vh; background: var(--bg-primary); }

.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.submission-content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

.task-header-card { padding: 16px; background: #1C1C1E; border-radius: 16px; }
.task-name { font-size: 18px; font-weight: 700; color: #fff; }
.task-desc { font-size: 13px; color: #8E8E93; margin-top: 4px; line-height: 1.4; }
.due-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #FF9500; margin-top: 8px; }

.status-card { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; background: #1C1C1E; }
.status-card.graded { border-left: 4px solid #30D158; }
.status-card.pending { border-left: 4px solid #FF9500; }
.status-card.not-submitted { border-left: 4px solid #8E8E93; }
.status-icon { flex-shrink: 0; }
.status-title { font-size: 16px; font-weight: 600; color: #fff; }
.status-grade { font-size: 14px; color: #30D158; margin-top: 2px; }

.section-title { font-size: 13px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }

.feedback-card { padding: 14px; border-radius: 12px; background: rgba(48,209,88,0.08); color: #ccc; font-size: 14px; line-height: 1.5; }

.detail-card { padding: 14px; border-radius: 12px; background: #1C1C1E; }
.detail-text { font-size: 14px; color: #ccc; }
.file-row { font-size: 14px; color: #ccc; }
.file-row a { color: #00D4FF; text-decoration: none; }
.file-row a:hover { text-decoration: underline; }

.submit-section { display: flex; flex-direction: column; gap: 12px; }

.file-upload {
  display: flex; align-items: center; gap: 10px; padding: 14px;
  border-radius: 12px; background: #1C1C1E; cursor: pointer;
  border: 1.5px dashed rgba(191,90,242,0.3); transition: background 0.15s;
  font-size: 14px; color: #8E8E93;
}
.file-upload:hover { background: rgba(191,90,242,0.05); }

.text-input {
  width: 100%; padding: 14px; border-radius: 12px; background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;
  resize: vertical; outline: none; font-family: inherit;
}
.text-input::placeholder { color: #555; }
.text-input:focus { border-color: rgba(191,90,242,0.3); }

.submit-btn {
  padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  cursor: pointer; transition: opacity 0.15s;
}
.submit-btn:hover { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: default; }
</style>
