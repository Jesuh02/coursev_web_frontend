<template>
  <div class="task-submission">
    <TopBar :title="task?.title ?? 'Entrega de Tarea'" @back="$router.back()" />

    <div class="scroll-content">
      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <!-- VISTA PROFESOR / ADMIN -->
      <div v-else-if="isSubjectCreator" class="submission-content">
        <div v-if="task" class="task-header-card card-enter">
          <h2 class="task-name">{{ task.title }}</h2>
          <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          <div v-if="task.dueDate || task.due_date" class="due-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{{ task.dueDate ?? task.due_date }}</span>
          </div>
        </div>

        <template v-if="allSubmissions.length > 0">
        <div class="teacher-stats-row card-enter" style="animation-delay: 0.05s">
          <span class="stats-chip">{{ allSubmissions.length }} entregas</span>
          <span class="stats-chip graded">{{ gradedCount }} calificadas</span>
          <span class="stats-chip pending">{{ allSubmissions.length - gradedCount }} pendientes</span>
        </div>

        <!-- CHART SECTION -->
        <div class="chart-section card-enter" style="animation-delay: 0.1s">
          <h3 class="section-title">Progreso de la Tarea</h3>
          <div class="chart-body">
            <svg class="donut-svg" viewBox="0 0 120 120">
              <!-- Shadow filter -->
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <!-- Background ring -->
              <circle class="donut-track" cx="60" cy="60" r="45" />
              <!-- Pending arc (behind graded) -->
              <circle
                transform="rotate(-90 60 60)"
                class="donut-arc"
                cx="60" cy="60" r="45"
                stroke="#FF9500"
                :style="pendingArcStyle"
              />
              <!-- Graded arc -->
              <circle
                transform="rotate(-90 60 60)"
                class="donut-arc"
                cx="60" cy="60" r="45"
                stroke="#30D158"
                filter="url(#glow)"
                :style="gradedArcStyle"
              />
              <!-- Center -->
              <text class="donut-num" x="60" y="55" text-anchor="middle" dominant-baseline="middle">
                {{ allSubmissions.length }}
              </text>
              <text class="donut-label-text" x="60" y="70" text-anchor="middle" dominant-baseline="middle">
                entregas
              </text>
            </svg>

            <div class="chart-legend">
              <div class="legend-row">
                <span class="legend-dot" style="background:#30D158"></span>
                <div class="legend-info">
                  <span class="legend-val">{{ gradedCount }}</span>
                  <span class="legend-name">Calificadas</span>
                </div>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#FF9500"></span>
                <div class="legend-info">
                  <span class="legend-val">{{ allSubmissions.length - gradedCount }}</span>
                  <span class="legend-name">Pendientes</span>
                </div>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#636366"></span>
                <div class="legend-info">
                  <span class="legend-val">{{ allSubmissions.length }}</span>
                  <span class="legend-name">Total</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress bars -->
          <div class="progress-bars">
            <div class="pb-row">
              <div class="pb-meta">
                <span class="pb-label">Calificadas</span>
                <span class="pb-pct pb-graded">{{ gradedPercent }}%</span>
              </div>
              <div class="pb-track">
                <div class="pb-fill pb-fill-graded" :style="{ width: (chartAnimated ? gradedPercent : 0) + '%' }"></div>
              </div>
            </div>
            <div class="pb-row">
              <div class="pb-meta">
                <span class="pb-label">Entregadas</span>
                <span class="pb-pct pb-total">100%</span>
              </div>
              <div class="pb-track">
                <div class="pb-fill pb-fill-total" :style="{ width: chartAnimated ? '100%' : '0%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="search-bar card-enter" style="animation-delay: 0.15s">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input v-model="searchQuery" class="search-input" placeholder="Buscar por nombre, usuario o ID..." />
        </div>

        <div v-if="filteredSubmissions.length === 0 && searchQuery" class="empty-state card-enter" style="animation-delay: 0.2s">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          <p>No se encontraron entregas</p>
        </div>
        </template>

        <div v-if="allSubmissions.length === 0" class="empty-state card-enter" style="animation-delay: 0.1s">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p class="empty-title-msg">No hay entregas enviadas</p>
          <p class="empty-sub-msg">Aún ningún estudiante ha enviado esta tarea</p>
        </div>

        <div
          v-for="(sub, idx) in filteredSubmissions"
          :key="sub.id"
          :ref="el => { if (el) submissionCardRefs[sub.id] = el as HTMLElement }"
          class="student-submission-card card-enter"
          :class="{ highlighted: highlightedSubmissionId === sub.id }"
          :style="{ animationDelay: `${0.2 + idx * 0.05}s` }"
        >
          <div class="student-header">
            <div class="student-avatar">{{ (sub.studentUsername ?? 'E')[0].toUpperCase() }}</div>
            <div class="student-info">
              <p class="student-name">{{ sub.studentUsername ?? `Estudiante #${sub.student_id}` }}</p>
              <p v-if="personaNameMap.get(Number(sub.student_id ?? sub.studentId))" class="persona-name">
                {{ personaNameMap.get(Number(sub.student_id ?? sub.studentId)) }}
              </p>
              <p class="submission-date">{{ formatDate(sub.created_at) }}</p>
            </div>
            <span class="grade-badge" :class="sub.grade !== null && sub.grade !== undefined ? 'graded' : 'pending'">
              {{ sub.grade !== null && sub.grade !== undefined ? `${sub.grade}/10` : 'Sin calificar' }}
            </span>
          </div>

          <div v-if="sub.file_name" class="file-row-teacher">
            📎
            <a v-if="sub.file_uri" :href="getFileUrl(sub)" target="_blank" rel="noopener" class="file-link">
              {{ sub.file_name }}
            </a>
            <span v-else>{{ sub.file_name }}</span>
          </div>

          <div v-if="sub.feedback" class="existing-feedback">
            <div class="feedback-header-inline">
              <p class="feedback-label">Retroalimentación anterior</p>
              <button
                v-if="shouldShowFeedbackToggle(sub.feedback)"
                class="feedback-toggle-btn"
                @click="toggleFeedbackExpansion(`teacher-${sub.id}`)"
              >
                {{ isFeedbackExpanded(`teacher-${sub.id}`) ? 'Ver menos' : 'Ver completa' }}
              </button>
            </div>
            <div
              class="feedback-body"
              :class="{ 'feedback-body--collapsed': shouldShowFeedbackToggle(sub.feedback) && !isFeedbackExpanded(`teacher-${sub.id}`) }"
            >
              <p class="feedback-text">{{ sub.feedback }}</p>
            </div>
          </div>

          <div class="grade-form">
            <p class="form-label">Calificar</p>
            <div class="grade-row">
              <input
                v-model.number="gradingMap[sub.id].grade"
                type="number"
                min="0"
                max="10"
                step="0.1"
                class="grade-input"
                placeholder="Nota (0-10)"
              />
            </div>
            <textarea
              v-model="gradingMap[sub.id].feedback"
              class="feedback-input"
              placeholder="Retroalimentación (opcional)..."
              rows="3"
            />
            <button
              class="grade-btn"
              :disabled="gradingMap[sub.id].saving"
              @click="gradeSubmission(sub)"
            >
              {{ gradingMap[sub.id].saving ? 'Guardando...' : 'Guardar Calificación' }}
            </button>
            <p v-if="gradingMap[sub.id].saved" class="saved-msg">✓ Guardado</p>
          </div>
        </div>
      </div>

      <!-- VISTA ESTUDIANTE -->
      <div v-else class="submission-content">
        <div v-if="task" class="task-header-card card-enter">
          <h2 class="task-name">{{ task.title }}</h2>
          <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          <div v-if="task.dueDate || task.due_date" class="due-row" :class="{ 'due-overdue': isOverdue }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="isOverdue ? '#FF453A' : '#FF9500'" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{{ formatDueDate(task.dueDate ?? task.due_date) }}</span>
            <span v-if="isOverdue" class="overdue-chip">Vencida</span>
          </div>
        </div>

        <!-- Banner fuera de plazo -->
        <div v-if="isOverdue && status === 'not-submitted'" class="overdue-banner card-enter" style="animation-delay: 0.04s">
          <div class="overdue-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <p class="overdue-title">Plazo de entrega vencido</p>
            <p class="overdue-sub">Ya no es posible enviar esta tarea</p>
          </div>
        </div>

        <div class="status-card card-enter" :class="status" style="animation-delay: 0.05s">
          <div class="status-icon">
            <svg v-if="status === 'graded'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
            <svg v-else-if="status === 'pending'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <p class="status-title">{{ statusLabel }}</p>
            <p v-if="submission?.grade !== null && submission?.grade !== undefined" class="status-grade">Calificación: {{ submission.grade }}/10</p>
          </div>
        </div>

        <div v-if="submission?.feedback" class="feedback-section card-enter" style="animation-delay: 0.1s">
          <h3 class="section-title">Retroalimentación</h3>
          <div class="feedback-card" :class="{ expanded: isFeedbackExpanded('student-feedback') }">
            <div class="feedback-card-head">
              <div class="feedback-card-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Comentario del profesor
              </div>
              <button
                v-if="shouldShowFeedbackToggle(submission.feedback)"
                class="feedback-toggle-btn feedback-toggle-btn--card"
                @click="toggleFeedbackExpansion('student-feedback')"
              >
                {{ isFeedbackExpanded('student-feedback') ? 'Ver menos' : 'Expandir' }}
              </button>
            </div>
            <div
              class="feedback-body feedback-body--card"
              :class="{ 'feedback-body--collapsed': shouldShowFeedbackToggle(submission.feedback) && !isFeedbackExpanded('student-feedback') }"
            >
              <p class="feedback-card-text">{{ submission.feedback }}</p>
            </div>
          </div>
        </div>

        <div v-if="status !== 'not-submitted'" class="submission-detail card-enter" style="animation-delay: 0.15s">
          <h3 class="section-title">Tu Entrega</h3>
          <div class="detail-card">
            <p v-if="submission?.file_name" class="file-row">
              📎 <a v-if="submission.file_uri" :href="getFileUrl(submission)" target="_blank" rel="noopener">{{ submission.file_name }}</a>
              <span v-else>{{ submission.file_name }}</span>
            </p>
            <p v-else class="detail-text">Entrega enviada</p>
            <button v-if="canResubmit && !isEditingSubmission" class="resubmit-toggle-btn" @click="isEditingSubmission = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Cambiar archivo
            </button>
          </div>

          <!-- Formulario de re-envío -->
          <div v-if="canResubmit && isEditingSubmission" class="resubmit-section">
            <div class="attach-options-row">
              <div class="file-upload attach-option" @click="openResubmitFilePicker">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                <span class="file-upload-label">Archivo</span>
                <input ref="resubmitFileInput" type="file" hidden @change="onResubmitFileSelect" />
              </div>
              <div class="file-upload attach-option" @click="openResubmitImagePicker">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="file-upload-label">Imagen</span>
                <input ref="resubmitImageInput" type="file" accept="image/*" hidden @change="onResubmitFileSelect" />
              </div>
              <div class="file-upload attach-option" @click="openResubmitCamera">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span class="file-upload-label">Cámara</span>
                <input ref="resubmitCameraInput" type="file" accept="image/*" capture="environment" hidden @change="onResubmitFileSelect" />
              </div>
            </div>
            <div v-if="resubmitFile" class="selected-file-row">
              <span class="selected-file-name">📎 {{ resubmitFile.name }}</span>
              <button class="file-clear-btn" @click="resubmitFile = null">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-if="resubmitError" class="submit-error-msg">{{ resubmitError }}</div>
            <div class="resubmit-actions">
              <button class="resubmit-cancel-btn" :disabled="resubmitting" @click="cancelResubmit">Cancelar</button>
              <button class="submit-btn resubmit-btn" :disabled="resubmitting || !resubmitFile" @click="resubmitWork">
                <span v-if="resubmitting" class="btn-spinner" />
                <span>{{ resubmitting ? 'Actualizando...' : 'Actualizar Archivo' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="canSubmit" class="submit-section card-enter" style="animation-delay: 0.2s">
          <h3 class="section-title">Enviar Tarea</h3>
          <div class="attach-options-row">
            <div class="file-upload attach-option" @click="openFilePicker">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              <span class="file-upload-label">Archivo</span>
              <input ref="fileInput" type="file" hidden @change="onFileSelect" />
            </div>
            <div class="file-upload attach-option" @click="openImagePicker">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span class="file-upload-label">Imagen</span>
              <input ref="imageInput" type="file" accept="image/*" hidden @change="onFileSelect" />
            </div>
            <div class="file-upload attach-option" @click="openCameraCapture">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span class="file-upload-label">Cámara</span>
              <input ref="cameraInput" type="file" accept="image/*" capture="environment" hidden @change="onFileSelect" />
            </div>
          </div>
          <div v-if="selectedFile" class="selected-file-row">
            <span class="selected-file-name">📎 {{ selectedFile.name }}</span>
            <button class="file-clear-btn" @click="selectedFile = null">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <textarea v-model="textAnswer" class="text-input" placeholder="Respuesta escrita (opcional)..." rows="4" />
          <div v-if="submitError" class="submit-error-msg">{{ submitError }}</div>
          <button class="submit-btn" :disabled="submitting || (!selectedFile && !textAnswer.trim())" @click="submitWork">
            <span v-if="submitting" class="btn-spinner" />
            <span>{{ submitting ? 'Enviando...' : 'Enviar Tarea' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { Task, TaskSubmission } from '@/domain/models'
import { taskAdapter, submissionAdapter, topicAdapter, subjectAdapter, courseAdapter, collaboratorAdapter, buildProxyFileUrl, tokenStorage, uploadFileDirect } from '@/infrastructure/api'
import { api } from '@/infrastructure/api/httpClient'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const task = ref<Task | null>(null)
const submission = ref<TaskSubmission | null>(null)
const allSubmissions = ref<TaskSubmission[]>([])
const loading = ref(true)
const submitting = ref(false)
const submitError = ref('')
const textAnswer = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const isSubjectCreator = ref(false)
const searchQuery = ref('')
const chartAnimated = ref(false)
const highlightedSubmissionId = ref<number | null>(null)
const submissionCardRefs = reactive<Record<number, HTMLElement>>({})
// Map studentId → persona full name (nombres + apellidos)
const personaNameMap = ref(new Map<number, string>())
const expandedFeedbackMap = reactive<Record<string, boolean>>({})
const currentTimestamp = ref(Date.now())
let overdueTimer: ReturnType<typeof setInterval> | null = null

interface GradingState { grade: number | null; feedback: string; saving: boolean; saved: boolean }
const gradingMap = reactive<Record<number, GradingState>>({})

const gradedCount = computed(() =>
  allSubmissions.value.filter(s => s.grade !== null && s.grade !== undefined).length
)

const gradedPercent = computed(() =>
  allSubmissions.value.length ? Math.round((gradedCount.value / allSubmissions.value.length) * 100) : 0
)

const filteredSubmissions = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return allSubmissions.value
  return allSubmissions.value.filter(s => {
    const username = (s.studentUsername ?? '').toLowerCase()
    const studentId = String(s.student_id ?? s.studentId ?? '')
    const personaName = (personaNameMap.value.get(Number(s.student_id ?? s.studentId)) ?? '').toLowerCase()
    return username.includes(q) || studentId.includes(q) || personaName.includes(q)
  })
})

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

const isOverdue = computed(() => {
  const due = task.value?.dueDate ?? (task.value as any)?.due_date
  if (!due) return false
  return new Date(due as string).getTime() <= currentTimestamp.value
})

const canSubmit = computed(() => status.value === 'not-submitted' && !isSubjectCreator.value && !isOverdue.value)
const canResubmit = computed(() => status.value === 'pending' && !isSubjectCreator.value && !isOverdue.value)
const isEditingSubmission = ref(false)
const resubmitFile = ref<File | null>(null)
const resubmitFileInput = ref<HTMLInputElement | null>(null)
const resubmitImageInput = ref<HTMLInputElement | null>(null)
const resubmitCameraInput = ref<HTMLInputElement | null>(null)
const resubmitting = ref(false)
const resubmitError = ref('')

function formatDueDate(raw: string | null | undefined): string {
  if (!raw) return 'Sin fecha límite'
  try {
    return new Date(raw).toLocaleString('es', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return raw }
}

// Donut chart — circumference of circle r=45
const C = 2 * Math.PI * 45 // ≈ 282.74

const gradedArcStyle = computed(() => {
  const total = allSubmissions.value.length || 1
  const len = chartAnimated.value ? (gradedCount.value / total) * C : 0
  return {
    strokeDasharray: `${len} ${C}`,
    strokeDashoffset: '0',
    transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
  }
})

const pendingArcStyle = computed(() => {
  const total = allSubmissions.value.length || 1
  const gradedLen = chartAnimated.value ? (gradedCount.value / total) * C : 0
  const pendingLen = chartAnimated.value ? ((total - gradedCount.value) / total) * C : 0
  return {
    strokeDasharray: `${pendingLen} ${C}`,
    strokeDashoffset: `${-gradedLen}`,
    transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
  }
})

watch(loading, (isLoading) => {
  if (!isLoading && isSubjectCreator.value) {
    setTimeout(() => { chartAnimated.value = true }, 200)
  }
})

watch(isOverdue, (overdue) => {
  if (!overdue) return

  isEditingSubmission.value = false
  resubmitFile.value = null
  resubmitError.value = ''
})

type TopicLookup = {
  courseId?: number | null
  subjectId?: number | null
}

function getFileUrl(sub: TaskSubmission): string {
  if (!sub.file_uri || sub.file_uri.startsWith('file:///')) return '#'
  if (sub.file_uri.startsWith('http')) return sub.file_uri
  return buildProxyFileUrl(sub.file_uri)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function shouldShowFeedbackToggle(feedback: string | null | undefined): boolean {
  return (feedback?.trim().length ?? 0) > 180
}

function isFeedbackExpanded(key: string): boolean {
  return expandedFeedbackMap[key] === true
}

function toggleFeedbackExpansion(key: string) {
  expandedFeedbackMap[key] = !expandedFeedbackMap[key]
}

function onFileSelect(e: Event) {
  selectedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function openFilePicker() {
  fileInput.value?.click()
}

function openImagePicker() {
  imageInput.value?.click()
}

function openCameraCapture() {
  cameraInput.value?.click()
}

function openResubmitFilePicker() {
  resubmitFileInput.value?.click()
}

function openResubmitImagePicker() {
  resubmitImageInput.value?.click()
}

function openResubmitCamera() {
  resubmitCameraInput.value?.click()
}

function onResubmitFileSelect(e: Event) {
  resubmitFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function cancelResubmit() {
  isEditingSubmission.value = false
  resubmitFile.value = null
  resubmitError.value = ''
}

async function resubmitWork() {
  if (!task.value || !resubmitFile.value) return
  if (isOverdue.value) {
    resubmitError.value = 'No es posible actualizar la tarea. El plazo de entrega ha vencido.'
    return
  }
  resubmitting.value = true
  resubmitError.value = ''
  try {
    let fileKey: string | undefined
    try {
      const { key } = await uploadFileDirect(resubmitFile.value, 'submissions', () => {})
      fileKey = key
    } catch {
      resubmitError.value = 'Error de red al subir el archivo. Verifica tu conexión.'
      resubmitting.value = false
      return
    }
    const payload: Record<string, unknown> = { taskId: task.value.id }
    if (fileKey) payload.fileUri = fileKey
    payload.fileName = resubmitFile.value.name
    submission.value = await submissionAdapter.submitWork(payload)
    isEditingSubmission.value = false
    resubmitFile.value = null
  } catch {
    resubmitError.value = 'Error al actualizar la tarea. Intenta de nuevo.'
  }
  resubmitting.value = false
}

async function gradeSubmission(sub: TaskSubmission) {
  const state = gradingMap[sub.id]
  if (!state || state.saving) return
  state.saving = true
  state.saved = false
  try {
    const updated = await submissionAdapter.gradeSubmission(sub.id, state.grade ?? 0, state.feedback)
    const idx = allSubmissions.value.findIndex(s => s.id === sub.id)
    if (idx !== -1) allSubmissions.value[idx] = { ...allSubmissions.value[idx], ...updated }
    state.saved = true
    setTimeout(() => { state.saved = false }, 3000)
  } catch { /* silent */ }
  state.saving = false
}

async function submitWork() {
  if (!task.value) return
  if (isOverdue.value) {
    submitError.value = 'No es posible enviar la tarea. El plazo de entrega ha vencido.'
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    let fileKey: string | undefined
    if (selectedFile.value) {
      try {
        const { key } = await uploadFileDirect(
          selectedFile.value,
          'submissions',
          () => {},
        )
        fileKey = key
      } catch {
        submitError.value = 'Error de red al subir el archivo. Verifica tu conexión.'
        submitting.value = false
        return
      }
    }
    const payload: Record<string, unknown> = { taskId: task.value.id }
    if (textAnswer.value) payload.textContent = textAnswer.value
    if (fileKey) payload.fileUri = fileKey
    if (selectedFile.value) payload.fileName = selectedFile.value.name
    submitError.value = ''
    submission.value = await submissionAdapter.submitWork(payload)
  } catch {
    submitError.value = 'Error al enviar la tarea. Intenta de nuevo.'
  }
  submitting.value = false
}

onMounted(async () => {
  overdueTimer = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 1000)

  const taskId = Number(route.params.taskId)
  try {
    // Usar tokenStorage.userId como fallback cuando authStore.user aún no ha cargado
    // (ej: navegación desde notificación push que abre la app en página nueva)
    const currentUserId = Number(authStore.user?.id ?? tokenStorage.userId ?? 0)

    const [t, sub] = await Promise.all([
      taskAdapter.getTaskById(taskId),
      submissionAdapter.getSubmissionByUserAndTask(taskId, currentUserId || undefined).catch(() => null),
    ])
    task.value = t
    submission.value = sub

    let managerAccess = authStore.isAdmin
    if (!managerAccess && currentUserId > 0) {
      // Atajo: si la ruta trae courseId (ej: desde notificación), verificar colaborador directamente
      const queryCourseId = Number(route.query.courseId ?? 0)
      if (queryCourseId > 0) {
        try {
          const collab = await collaboratorAdapter.checkAccess(queryCourseId).catch(() => null)
          if (collab?.hasAccess) managerAccess = true
          // También verificar si es creador del curso
          if (!managerAccess) {
            const course = await courseAdapter.getCourseById(queryCourseId).catch(() => null)
            const courseCreatorId = Number(course?.creatorUserId ?? course?.creator_user_id ?? 0)
            if (courseCreatorId === currentUserId) managerAccess = true
          }
        } catch { /* silent */ }
      }

      if (!managerAccess) {
        const topicId = Number(t.topicId ?? t.topic_id ?? 0)

onUnmounted(() => {
  if (overdueTimer) clearInterval(overdueTimer)
})
        if (topicId > 0) {
          try {
            const topic = await topicAdapter.getTopicById(topicId)
            const topicLookup = topic as TopicLookup
            const subjectId = Number(topicLookup.subjectId ?? topicLookup.courseId ?? 0)
            if (subjectId > 0) {
              const subject = await subjectAdapter.getSubjectById(subjectId)
              const subjectCreatorId = Number(subject?.createdBy ?? 0)
              const courseId = Number(subject?.courseId ?? 0)
              const course = courseId > 0 ? await courseAdapter.getCourseById(courseId).catch(() => null) : null
              const courseCreatorId = Number(course?.creatorUserId ?? course?.creator_user_id ?? 0)
              managerAccess = subjectCreatorId === currentUserId || courseCreatorId === currentUserId
              // Verificar acceso de colaborador docente
              if (!managerAccess && courseId > 0) {
                const collab = await collaboratorAdapter.checkAccess(courseId).catch(() => null)
                if (collab?.hasAccess) managerAccess = true
              }
            }
          } catch {
            managerAccess = false
          }
        }
      }
    }

    isSubjectCreator.value = managerAccess

    if (managerAccess) {
      const subs = await submissionAdapter.getSubmissionsByTask(taskId).catch(() => [] as TaskSubmission[])
      allSubmissions.value = subs
      for (const s of subs) {
        gradingMap[s.id] = {
          grade: s.grade ?? null,
          feedback: s.feedback ?? '',
          saving: false,
          saved: false,
        }
      }
      // Enrich with persona names for name-based search
      const studentIds = [...new Set(subs.map(s => Number(s.student_id ?? s.studentId)).filter(n => n > 0))]
      if (studentIds.length > 0) {
        try {
          const res = await api.get<{ userId: number; fullName: string }[]>(
            `/personas/by-user-ids?userIds=${studentIds.join(',')}`
          )
          const map = new Map<number, string>()
          for (const item of res ?? []) {
            if (item.fullName) map.set(Number(item.userId), item.fullName)
          }
          personaNameMap.value = map
        } catch { /* persona enrichment is best-effort */ }
      }

      // Auto-scroll a la entrega del estudiante indicado por la notificación (fromUser query param)
      const fromUser = String(route.query.fromUser ?? '').trim().toLowerCase()
      if (fromUser) {
        const target = subs.find(s =>
          (s.studentUsername ?? '').toLowerCase() === fromUser
        )
        if (target) {
          highlightedSubmissionId.value = target.id
          await nextTick()
          const card = submissionCardRefs[target.id]
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Quitar el highlight después de 3 segundos
            setTimeout(() => { highlightedSubmissionId.value = null }, 3000)
          }
        }
      }
    }
  } catch { /* empty */ }
  loading.value = false
})
</script>

<style scoped>
/* ── Root scroll container ── */
.task-submission {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.scroll-content::-webkit-scrollbar { width: 4px; }
.scroll-content::-webkit-scrollbar-track { background: transparent; }
.scroll-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

/* ── Loading ── */
.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner {
  width: 28px; height: 28px;
  border: 3px solid rgba(191,90,242,0.2);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Entrance animation ── */
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-enter {
  opacity: 0;
  animation: slideInUp 0.4s ease-out forwards;
}

/* ── Content layout ── */
.submission-content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }

/* ── Task header ── */
.task-header-card { padding: 16px; background: #1C1C1E; border-radius: 16px; }
.task-name { font-size: 18px; font-weight: 700; color: #fff; }
.task-desc { font-size: 13px; color: #8E8E93; margin-top: 4px; line-height: 1.4; }
.due-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #FF9500; margin-top: 8px; }

/* ── Teacher stats chips ── */
.teacher-stats-row { display: flex; gap: 8px; flex-wrap: wrap; }
.stats-chip {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,0.06); color: #ccc; border: 1px solid rgba(255,255,255,0.08);
}
.stats-chip.graded { color: #30D158; background: rgba(48,209,88,0.1); border-color: rgba(48,209,88,0.25); }
.stats-chip.pending { color: #FF9500; background: rgba(255,149,0,0.1); border-color: rgba(255,149,0,0.25); }

/* ── Chart section ── */
.chart-section {
  background: #1C1C1E;
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(255,255,255,0.06);
}

.chart-body {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Donut SVG */
.donut-svg {
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.donut-track {
  fill: none;
  stroke: rgba(255,255,255,0.06);
  stroke-width: 14;
}

.donut-arc {
  fill: none;
  stroke-width: 14;
  stroke-linecap: round;
}

.donut-num {
  font-size: 22px;
  font-weight: 800;
  fill: #fff;
}

.donut-label-text {
  font-size: 10px;
  fill: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Legend */
.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.legend-val {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.legend-name {
  font-size: 11px;
  color: #8E8E93;
}

/* Progress bars */
.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pb-row { display: flex; flex-direction: column; gap: 5px; }

.pb-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pb-label { font-size: 12px; color: #8E8E93; }
.pb-pct { font-size: 12px; font-weight: 700; }
.pb-graded { color: #30D158; }
.pb-total { color: #00D4FF; }

.pb-track {
  height: 6px;
  background: rgba(255,255,255,0.07);
  border-radius: 6px;
  overflow: hidden;
}

.pb-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pb-fill-graded {
  background: linear-gradient(90deg, #1a8c42, #30D158);
  box-shadow: 0 0 8px rgba(48,209,88,0.4);
}

.pb-fill-total {
  background: linear-gradient(90deg, #0088a8, #00D4FF);
  box-shadow: 0 0 8px rgba(0,212,255,0.35);
}

/* ── Search bar ── */
.search-bar {
  display: flex; align-items: center; gap: 10px; padding: 12px 14px;
  background: #1C1C1E; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);
}
.search-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #fff; font-size: 14px;
}
.search-input::placeholder { color: #555; }

/* ── Student submission card ── */
.student-submission-card {
  background: #111428; border-radius: 16px; padding: 16px;
  border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 12px;
}
.student-header { display: flex; align-items: center; gap: 12px; }
.student-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; color: #fff;
}
.student-info { flex: 1; min-width: 0; }
.student-name { font-size: 14px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.persona-name { font-size: 11px; color: #BF5AF2; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.submission-date { font-size: 11px; color: #8E8E93; margin-top: 2px; }
.grade-badge {
  flex-shrink: 0; padding: 4px 10px; border-radius: 10px;
  font-size: 12px; font-weight: 700;
}
.grade-badge.graded { color: #30D158; background: rgba(48,209,88,0.12); }
.grade-badge.pending { color: #FF9500; background: rgba(255,149,0,0.12); }

.file-row-teacher { font-size: 13px; color: #ccc; }
.file-link { color: #00D4FF; text-decoration: none; }
.file-link:hover { text-decoration: underline; }

.existing-feedback {
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(48,209,88,0.09), rgba(48,209,88,0.04));
  border-radius: 14px;
  border: 1px solid rgba(48,209,88,0.14);
}
.feedback-header-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.feedback-label {
  font-size: 11px;
  font-weight: 700;
  color: #93a0ae;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}
.feedback-body {
  position: relative;
}
.feedback-body--collapsed {
  max-height: 74px;
  overflow: hidden;
}
.feedback-body--collapsed::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 28px;
  background: linear-gradient(180deg, rgba(17,20,40,0), rgba(17,20,40,0.9));
  pointer-events: none;
}
.feedback-text {
  font-size: 13px;
  color: #d7dde7;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}
.feedback-toggle-btn {
  border: none;
  background: rgba(255,255,255,0.06);
  color: #9adfff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.feedback-toggle-btn:hover {
  background: rgba(0,212,255,0.12);
  color: #c9f2ff;
}
.feedback-toggle-btn--card {
  background: rgba(255,255,255,0.08);
}

.grade-form { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); }
.form-label { font-size: 12px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.4px; }
.grade-row { display: flex; gap: 8px; align-items: center; }
.grade-input {
  width: 130px; padding: 10px 12px; border-radius: 10px;
  background: #0D0F1E; border: 1px solid rgba(255,255,255,0.08);
  color: #fff; font-size: 14px; outline: none;
}
.grade-input:focus { border-color: rgba(0,212,255,0.35); }
.feedback-input {
  width: 100%; padding: 10px 12px; border-radius: 10px;
  background: #0D0F1E; border: 1px solid rgba(255,255,255,0.08);
  color: #fff; font-size: 14px; resize: vertical; outline: none; font-family: inherit;
  box-sizing: border-box;
}
.feedback-input:focus { border-color: rgba(0,212,255,0.35); }
.grade-btn {
  padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, #00A8BE, #00D4FF);
  cursor: pointer; transition: opacity 0.15s; align-self: flex-start;
  border: none;
}
.grade-btn:disabled { opacity: 0.5; cursor: default; }
.saved-msg { font-size: 12px; color: #30D158; font-weight: 600; }

/* ── Student view ── */
.status-card { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 16px; background: #1C1C1E; }
.status-card.graded { border-left: 4px solid #30D158; }
.status-card.pending { border-left: 4px solid #FF9500; }
.status-card.not-submitted { border-left: 4px solid #8E8E93; }
.status-icon { flex-shrink: 0; }
.status-title { font-size: 16px; font-weight: 600; color: #fff; }
.status-grade { font-size: 14px; color: #30D158; margin-top: 2px; }

.section-title { font-size: 13px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }

.feedback-section { display: flex; flex-direction: column; gap: 8px; }
.feedback-card {
  padding: 16px;
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(48,209,88,0.13), transparent 36%),
    linear-gradient(180deg, rgba(48,209,88,0.1), rgba(255,255,255,0.03));
  border: 1px solid rgba(48,209,88,0.18);
  color: #ccc;
}
.feedback-card.expanded {
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
}
.feedback-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.feedback-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #dfffea;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(48,209,88,0.12);
}
.feedback-body--card.feedback-body--collapsed::after {
  background: linear-gradient(180deg, rgba(17,20,40,0), rgba(25,31,34,0.96));
}
.feedback-card-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #eef6f1;
  white-space: pre-line;
}

.submission-detail { display: flex; flex-direction: column; gap: 8px; }
.detail-card { padding: 14px; border-radius: 12px; background: #1C1C1E; }
.detail-text { font-size: 14px; color: #ccc; }
.file-row { font-size: 14px; color: #ccc; }
.file-row a { color: #00D4FF; text-decoration: none; }
.file-row a:hover { text-decoration: underline; }

.submit-section { display: flex; flex-direction: column; gap: 12px; }

.attach-options-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.file-upload {
  display: flex; align-items: center; gap: 10px; padding: 14px;
  border-radius: 12px; background: #1C1C1E; cursor: pointer;
  border: 1.5px dashed rgba(191,90,242,0.3); transition: background 0.15s;
  font-size: 14px; color: #8E8E93;
}
.file-upload:hover { background: rgba(191,90,242,0.05); }
.file-upload.attach-option {
  flex-direction: column; gap: 6px; padding: 12px 8px;
  justify-content: center; align-items: center; text-align: center;
  border-radius: 10px; font-size: 12px;
}
.file-upload-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

.selected-file-row {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  border-radius: 10px; background: rgba(191,90,242,0.08);
  border: 1px solid rgba(191,90,242,0.2); font-size: 13px; color: #ccc;
}
.selected-file-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.text-input {
  width: 100%; padding: 14px; border-radius: 12px; background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.06); color: #fff; font-size: 14px;
  resize: vertical; outline: none; font-family: inherit;
  box-sizing: border-box;
}
.text-input::placeholder { color: #555; }
.text-input:focus { border-color: rgba(191,90,242,0.3); }

.submit-btn {
  padding: 14px; border-radius: 14px; font-size: 15px; font-weight: 700;
  color: #fff; background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  cursor: pointer; transition: opacity 0.15s; border: none;
}
.submit-btn:hover { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: default; }

/* ── Overdue banner ── */
.due-overdue { color: #FF453A !important; }
.due-overdue svg { stroke: #FF453A !important; }
.overdue-chip {
  display: inline-block; padding: 1px 7px; border-radius: 6px;
  background: rgba(255,69,58,0.15); color: #FF453A;
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  margin-left: 4px;
}

.overdue-banner {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255,69,58,0.07);
  border: 1px solid rgba(255,69,58,0.22);
}
.overdue-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,69,58,0.12);
  display: flex; align-items: center; justify-content: center;
}
.overdue-title { font-size: 14px; font-weight: 700; color: #FF453A; margin: 0; }
.overdue-sub  { font-size: 12px; color: rgba(255,69,58,0.7); margin: 2px 0 0; }

/* ── Submit section improvements ── */
.file-upload-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.file-clear-btn {
  background: transparent; border: none; cursor: pointer; padding: 2px;
  display: flex; align-items: center; flex-shrink: 0;
}
.file-clear-btn:hover svg { stroke: #FF453A; }
.submit-error-msg { font-size: 13px; color: #FF453A; padding: 0 2px; }
.submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-spinner {
  width: 14px; height: 14px; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 50px 0; color: #8E8E93; font-size: 14px; }
.empty-title-msg { font-size: 16px; font-weight: 600; color: #ccc; margin: 0; }
.empty-sub-msg { font-size: 13px; color: #636366; margin: 0; }

/* ── Resubmit section ── */
.resubmit-toggle-btn {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
  padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600;
  color: #BF5AF2; background: rgba(191,90,242,0.1); border: 1px solid rgba(191,90,242,0.25);
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
}
.resubmit-toggle-btn:hover { background: rgba(191,90,242,0.18); border-color: rgba(191,90,242,0.4); }
.resubmit-section { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
.resubmit-actions { display: flex; gap: 10px; }
.resubmit-cancel-btn {
  flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600;
  color: #8E8E93; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer; transition: background 0.15s;
}
.resubmit-cancel-btn:hover { background: rgba(255,255,255,0.1); }
.resubmit-cancel-btn:disabled { opacity: 0.5; cursor: default; }
.resubmit-btn { flex: 2; }

/* ── Submission highlight (desde notificación) ── */
.student-submission-card.highlighted {
  border: 1.5px solid rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.12);
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
}

@media (max-width: 640px) {
  .feedback-header-inline,
  .feedback-card-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .feedback-toggle-btn {
    align-self: flex-start;
  }
}
</style>
