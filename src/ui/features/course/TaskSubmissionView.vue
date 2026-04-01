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

        <div v-if="filteredSubmissions.length === 0" class="empty-state card-enter" style="animation-delay: 0.2s">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          <p>{{ searchQuery ? 'No se encontraron entregas' : 'Sin entregas aún' }}</p>
        </div>

        <div
          v-for="(sub, idx) in filteredSubmissions"
          :key="sub.id"
          class="student-submission-card card-enter"
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
            <p class="feedback-label">Retroalimentación anterior:</p>
            <p class="feedback-text">{{ sub.feedback }}</p>
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
          <div v-if="task.dueDate || task.due_date" class="due-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{{ task.dueDate ?? task.due_date }}</span>
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
          <div class="feedback-card">
            <p>{{ submission.feedback }}</p>
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
          </div>
        </div>

        <div v-if="canSubmit" class="submit-section card-enter" style="animation-delay: 0.2s">
          <h3 class="section-title">Enviar Tarea</h3>
          <div class="file-upload" @click="openFilePicker">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Task, TaskSubmission } from '@/domain/models'
import { taskAdapter, submissionAdapter, topicAdapter, subjectAdapter, courseAdapter, collaboratorAdapter, buildProxyFileUrl } from '@/infrastructure/api'
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
const textAnswer = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isSubjectCreator = ref(false)
const searchQuery = ref('')
const chartAnimated = ref(false)
// Map studentId → persona full name (nombres + apellidos)
const personaNameMap = ref(new Map<number, string>())

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

const canSubmit = computed(() => status.value === 'not-submitted' && !isSubjectCreator.value)

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

function onFileSelect(e: Event) {
  selectedFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function openFilePicker() {
  fileInput.value?.click()
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

    const currentUserId = Number(authStore.user?.id ?? 0)
    let managerAccess = authStore.isAdmin

    if (!managerAccess) {
      const topicId = Number(t.topicId ?? t.topic_id ?? 0)
      if (currentUserId > 0 && topicId > 0) {
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

.existing-feedback { padding: 10px 12px; background: rgba(48,209,88,0.06); border-radius: 10px; }
.feedback-label { font-size: 11px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px; }
.feedback-text { font-size: 13px; color: #ccc; line-height: 1.4; }

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
.feedback-card { padding: 14px; border-radius: 12px; background: rgba(48,209,88,0.08); color: #ccc; font-size: 14px; line-height: 1.5; }

.submission-detail { display: flex; flex-direction: column; gap: 8px; }
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

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 50px 0; color: #8E8E93; font-size: 14px; }
</style>
