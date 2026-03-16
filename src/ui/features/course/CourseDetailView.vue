<template>
  <div class="course-detail">
    <div class="hero-section">
      <div class="hero-toolbar">
        <button class="toolbar-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button v-if="isOwner" class="toolbar-btn" @click="$router.push(`/course/${courseId}/edit`)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
      </div>
      <div class="hero-image">
        <img v-if="heroImage" :src="heroImage" alt="" />
        <div class="hero-gradient" />
        <div class="hero-accent" />
      </div>
    </div>

    <div class="course-body">
      <span v-if="course?.is_premium || course?.isPremium" class="featured-badge">★ Destacado</span>
      <h1 class="course-title">{{ displayTitle }}</h1>
      <p class="course-desc">{{ displayDescription }}</p>

      <div class="tags-row">
        <span class="tag purple">Temática: {{ course?.category ?? 'General' }}</span>
        <span class="tag">{{ course?.isFree ? 'Curso Gratuito' : 'Curso Premium' }}</span>
        <span v-if="subjectName" class="tag subject-tag">📚 {{ subjectName }}</span>
        <span v-if="isOwner" class="tag config" @click="$router.push(`/course/${courseId}/edit`)">Configurar</span>
      </div>

      <!-- Enrollment Banner (solo para estudiantes sin acceso) -->
      <div v-if="showEnrollmentBanner" class="enrollment-banner">
        <div v-if="enrollmentStatus === 'pendiente_aprobacion'" class="enrollment-pending">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF9500" /></svg>
          <div>
            <p class="enroll-title">Solicitud pendiente</p>
            <p class="enroll-desc">Tu solicitud de acceso está esperando aprobación del administrador.</p>
          </div>
        </div>
        <div v-else-if="enrollmentStatus === 'rechazado'" class="enrollment-rejected">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <div>
            <p class="enroll-title">Acceso rechazado</p>
            <p class="enroll-desc">Tu solicitud fue rechazada. Contacta al administrador para más información.</p>
          </div>
        </div>
        <div v-else class="enrollment-request">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <div>
            <p class="enroll-title">Acceso restringido</p>
            <p class="enroll-desc">Necesitas solicitar acceso a este curso para ver su contenido.</p>
          </div>
          <button class="enroll-btn" :disabled="requestingEnrollment" @click="requestEnrollment">
            {{ requestingEnrollment ? 'Enviando...' : 'Solicitar Acceso' }}
          </button>
        </div>
      </div>

      <template v-if="!showEnrollmentBanner || isOwner">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'docs' }" @click="activeTab = 'docs'">
          Temas <span class="tab-count">{{ topics.length }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">
          Tareas <span class="tab-count">{{ totalTaskCount }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <template v-else-if="activeTab === 'docs'">
        <h2 v-if="topics.length" class="section-heading">Contenido del Tema</h2>
        <div v-for="topic in topics" :key="topic.id" class="topic-block">
          <div class="topic-row" @click="toggleTopic(topic.id)">
            <div class="topic-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <span class="topic-name">{{ topic.title }}</span>
            <button v-if="isOwner" class="topic-action edit" @click.stop="router.push({ path: `/course/${courseId}/topic/${topic.id}`, query: { subjectId: String(subjectId ?? '') } })">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button v-if="isOwner" class="topic-action delete" @click.stop="deleteTopic(topic.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
            <svg class="chevron" :class="{ open: expandedTopics.has(topic.id) }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div v-if="expandedTopics.has(topic.id)" class="topic-expanded">
            <div v-if="!topicContent[topic.id]?.length" class="empty-inline">Sin archivos</div>
            <a
              v-for="item in topicContent[topic.id]"
              :key="item.id"
              class="content-row"
              :href="getFileUrl(item)"
              target="_blank"
              rel="noopener"
            >
              <div class="ci-icon" :class="item.contentType">
                <svg v-if="item.contentType === 'video'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              </div>
              <div class="ci-info">
                <p class="ci-name">{{ item.fileName || item.content }}</p>
                <p class="ci-type">{{ item.contentType === 'video' ? 'Video' : 'Documento' }}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
            </a>
            <div class="files-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              ARCHIVOS DEL TEMA
            </div>
          </div>
        </div>
        <div v-if="!topics.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          <p>Sin temas aún</p>
        </div>
      </template>

      <template v-else>
        <h2 v-if="topics.length" class="section-heading">Tareas</h2>
        <div v-for="topic in topics" :key="topic.id" class="topic-block">
          <div class="topic-row" @click="toggleTopicTasks(topic.id)">
            <div class="topic-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <span class="topic-name">{{ topic.title }}</span>
            <span class="task-count-badge">{{ topicTasks[topic.id]?.length ?? 0 }} tareas</span>
            <svg class="chevron" :class="{ open: expandedTaskTopics.has(topic.id) }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div v-if="expandedTaskTopics.has(topic.id)" class="topic-expanded">
            <div class="tasks-label">TAREAS DEL TEMA</div>
            <div v-if="!topicTasks[topic.id]?.length" class="empty-inline">Sin tareas</div>
            <div v-for="task in topicTasks[topic.id]" :key="task.id" class="task-card">
              <div class="task-row">
                <div class="task-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </div>
                <div class="task-info">
                  <p class="task-title">{{ task.title }}</p>
                  <span class="status-badge" :class="getSubmissionStatus(task.id)">{{ getSubmissionLabel(task.id) }}</span>
                </div>
              </div>
              <p v-if="task.description" class="task-description">{{ task.description }}</p>
              <div class="task-attachments">
                <span v-if="!taskContent[task.id]?.length" class="no-attachments">No hay archivos adjuntos</span>
                <a
                  v-for="ci in taskContent[task.id]"
                  :key="ci.id"
                  class="attachment-link"
                  :href="getFileUrl(ci)"
                  target="_blank"
                  rel="noopener"
                >📎 {{ ci.fileName || ci.content }}</a>
              </div>
              <button
                v-if="!isOwner"
                class="submissions-btn"
                @click="$router.push(`/task-submission/${task.id}`)"
              >Ver Entregas</button>
            </div>
          </div>
        </div>
        <div v-if="!topics.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          <p>Sin tareas aún</p>
        </div>
      </template>

      <div v-if="isOwner && !loading" class="bottom-actions">
        <button class="action-btn theme" @click="$router.push({ path: `/course/${courseId}/topic`, query: { subjectId: String(subjectId ?? '') } })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Nuevo Tema
        </button>
        <button class="action-btn task" @click="$router.push(`/course/${courseId}/select-topic`)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Nueva Tarea
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Course, Topic, Task, ContentItem } from '@/domain/models'
import { useCourseStore } from '@/stores/courseStore'
import {
  topicAdapter, taskAdapter, contentItemAdapter,
  submissionAdapter, resolveImageUrl, buildProxyFileUrl,
} from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import { progressAdapter } from '@/infrastructure/api/progressAdapter'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const courseId = computed(() => route.params.id as string)
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)
const subjectName = computed(() => route.query.subjectName as string | undefined)
const subjectDescription = computed(() => route.query.subjectDescription as string | undefined)
const subjectThumbnailUrl = computed(() => route.query.subjectThumbnailUrl as string | undefined)
const course = ref<Course | null>(null)
const topics = ref<Topic[]>([])
const activeTab = ref<'docs' | 'tasks'>('docs')
const loading = ref(true)

const displayTitle = computed(() => subjectName.value || course.value?.title || 'Cargando…')
const displayDescription = computed(() => subjectDescription.value || course.value?.description)
const heroImage = computed(() => {
  const subjectThumb = subjectThumbnailUrl.value ? resolveImageUrl(subjectThumbnailUrl.value) : null
  return subjectThumb || resolveImageUrl(course.value?.thumbnailUri ?? course.value?.thumbnail_uri)
})

const isOwner = computed(() => authStore.isAdmin)

// ── Enrollment flow ────────────────────────────────────────────────
const enrollmentStatus = ref<string | null>(null) // 'activo' | 'pendiente_aprobacion' | 'rechazado' | null
const requestingEnrollment = ref(false)

const isStudent = computed(() => {
  const roles = authStore.user?.roles
  if (!roles?.length) return true
  return !roles.some((r: any) => r.id === 2 || r.id === 3)
})

// Show the banner when the user is a student and not yet approved
const showEnrollmentBanner = computed(() => {
  if (!isStudent.value) return false
  return enrollmentStatus.value !== 'activo'
})

const requestEnrollment = async () => {
  requestingEnrollment.value = true
  try {
    await progressAdapter.requestEnrollment(Number(courseId.value))
    enrollmentStatus.value = 'pendiente_aprobacion'
  } catch (e) {
    console.error('Error requesting enrollment:', e)
  } finally {
    requestingEnrollment.value = false
  }
}

const checkEnrollmentStatus = async (cid: number) => {
  if (!isStudent.value) return
  try {
    const data: any = await progressAdapter.getEnrollmentStatus(cid)
    enrollmentStatus.value = data?.enrollmentStatus ?? data?.enrollment_status ?? null
  } catch {
    enrollmentStatus.value = null
  }
}

const expandedTopics = reactive(new Set<number>())
const expandedTaskTopics = reactive(new Set<number>())
const topicContent = ref<Record<number, ContentItem[]>>({})
const topicTasks = ref<Record<number, Task[]>>({})
const taskContent = ref<Record<number, ContentItem[]>>({})
const submissionMap = ref<Record<number, string>>({})

const totalTaskCount = computed(() =>
  Object.values(topicTasks.value).reduce((sum, arr) => sum + arr.length, 0)
)

function getFileUrl(item: ContentItem): string {
  if (!item.fileUri) return '#'
  if (item.fileUri.startsWith('http')) return item.fileUri
  return buildProxyFileUrl(item.fileUri)
}

function getSubmissionStatus(taskId: number): string {
  return submissionMap.value[taskId] ?? 'not-submitted'
}

function getSubmissionLabel(taskId: number): string {
  const s = submissionMap.value[taskId]
  if (s === 'graded') return 'Calificada'
  if (s === 'pending') return 'Pendiente'
  return 'Pendiente'
}

async function toggleTopic(topicId: number) {
  if (expandedTopics.has(topicId)) {
    expandedTopics.delete(topicId)
    return
  }
  expandedTopics.add(topicId)
  if (!topicContent.value[topicId]) {
    try {
      topicContent.value[topicId] = await contentItemAdapter.getByTopic(topicId)
    } catch { topicContent.value[topicId] = [] }
  }
}

async function toggleTopicTasks(topicId: number) {
  if (expandedTaskTopics.has(topicId)) {
    expandedTaskTopics.delete(topicId)
    return
  }
  expandedTaskTopics.add(topicId)
  const tasks = topicTasks.value[topicId] ?? []
  for (const task of tasks) {
    if (taskContent.value[task.id] === undefined) {
      try { taskContent.value[task.id] = await contentItemAdapter.getByTask(task.id) }
      catch { taskContent.value[task.id] = [] }
    }
  }
}

async function deleteTopic(topicId: number) {
  try {
    await topicAdapter.deleteTopic(topicId)
    topics.value = topics.value.filter(t => t.id !== topicId)
  } catch { /* silent */ }
}

async function loadSubmissionStatuses(tasks: Task[]) {
  if (isOwner.value) return
  const userId = authStore.user?.id
  if (!userId) return
  for (const task of tasks) {
    try {
      const sub = await submissionAdapter.getSubmissionByUserAndTask(task.id, userId)
      if (sub?.grade !== null && sub?.grade !== undefined) submissionMap.value[task.id] = 'graded'
      else if (sub) submissionMap.value[task.id] = 'pending'
    } catch { /* no submission */ }
  }
}

onMounted(async () => {
  const id = Number(courseId.value)
  await courseStore.fetchCourseById(id)
  course.value = courseStore.current
  await checkEnrollmentStatus(id)
  if (course.value) {
    try {
      topics.value = subjectId.value
        ? await topicAdapter.getTopicsBySubject(subjectId.value)
        : await topicAdapter.getTopicsByCourse(id)
    } catch { /* empty */ }
    const allTasks: Task[] = []
    for (const topic of topics.value) {
      try {
        const tasks = await taskAdapter.getTasksByTopic(topic.id)
        topicTasks.value[topic.id] = tasks
        allTasks.push(...tasks)
      } catch { topicTasks.value[topic.id] = [] }
    }
    loadSubmissionStatuses(allTasks)
  }
  loading.value = false
})
</script>

<style scoped>
.course-detail { min-height: 100vh; background: #080C1A; padding-bottom: 100px; overflow-y: auto; height: 100vh; }

.hero-section { position: relative; height: 240px; }
.hero-toolbar { position: absolute; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; padding: 12px 16px; }
.toolbar-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.45); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.hero-image { position: relative; width: 100%; height: 100%; background: #1a1a2e; }
.hero-image img { width: 100%; height: 100%; object-fit: cover; }
.hero-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(transparent, #080C1A); }
.hero-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00D4FF, #9C27B0); }

.course-body { padding: 0 16px; margin-top: -20px; position: relative; }

.featured-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 10px; background: rgba(255,215,0,0.12); color: #FFD700; font-size: 12px; font-weight: 600; margin-bottom: 8px; }

.course-title { font-size: 26px; font-weight: 800; color: #fff; margin-bottom: 6px; }
.course-desc { font-size: 14px; color: #8E8E93; line-height: 1.5; margin-bottom: 14px; }

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.tag { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; color: #ccc; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }
.tag.purple { color: #BF5AF2; border-color: rgba(191,90,242,0.3); background: rgba(191,90,242,0.1); }
.tag.subject-tag { color: #00D4FF; border-color: rgba(0,212,255,0.3); background: rgba(0,212,255,0.1); }
.tag.config { cursor: pointer; border-color: rgba(255,255,255,0.15); }
.tag.config:hover { background: rgba(255,255,255,0.1); }

.tabs { display: flex; gap: 12px; margin-bottom: 20px; }
.tab-btn {
  flex: 1; padding: 12px; text-align: center; font-size: 15px; font-weight: 700;
  border-radius: 28px; color: #8E8E93; background: transparent;
  border: 2px solid rgba(255,255,255,0.08); transition: all 0.25s;
}
.tab-btn.active { color: #000; background: linear-gradient(135deg, #00D4FF, #00E5C5); border-color: transparent; }
.tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px;
  background: rgba(0,0,0,0.2); font-size: 12px; font-weight: 700; margin-left: 6px;
}
.tab-btn:not(.active) .tab-count { background: rgba(255,255,255,0.08); }

.loading-center { display: flex; justify-content: center; padding: 50px 0; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.section-heading { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 14px; }

.topic-block { background: #111428; border-radius: 16px; margin-bottom: 10px; overflow: hidden; }
.topic-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; transition: background 0.15s; }
.topic-row:hover { background: rgba(255,255,255,0.03); }
.topic-icon { width: 36px; height: 36px; border-radius: 50%; background: rgba(191,90,242,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.topic-name { flex: 1; font-size: 15px; font-weight: 600; color: #fff; }
.topic-action { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background 0.15s; }
.topic-action:hover { background: rgba(255,255,255,0.08); }
.chevron { transition: transform 0.25s; flex-shrink: 0; }
.chevron.open { transform: rotate(180deg); }

.task-count-badge { font-size: 12px; font-weight: 600; color: #00D4FF; white-space: nowrap; }

.topic-expanded { padding: 0 16px 14px; }

.empty-inline { font-size: 13px; color: #666; padding: 8px 0; }

.content-row {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-radius: 10px; background: rgba(255,255,255,0.03); margin-bottom: 6px;
  text-decoration: none; color: inherit; transition: background 0.15s;
}
.content-row:hover { background: rgba(255,255,255,0.06); }
.ci-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ci-icon.document, .ci-icon.pdf, .ci-icon.text { background: rgba(106,27,154,0.2); color: #BF5AF2; }
.ci-icon.video { background: rgba(255,55,95,0.15); color: #FF375F; }
.ci-info { flex: 1; min-width: 0; }
.ci-name { font-size: 13px; font-weight: 500; color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ci-type { font-size: 11px; color: #BF5AF2; margin-top: 1px; }

.files-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: #BF5AF2; letter-spacing: 0.5px; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); }

.tasks-label { font-size: 11px; font-weight: 700; color: #FF375F; letter-spacing: 0.5px; margin-bottom: 10px; }

.task-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; margin-bottom: 8px; }
.task-row { display: flex; align-items: center; gap: 10px; }
.task-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(0,212,255,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.task-info { flex: 1; }
.task-title { font-size: 14px; font-weight: 600; color: #fff; }
.status-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 8px; margin-top: 4px; }
.status-badge.pending, .status-badge.not-submitted { color: #FF9500; background: rgba(255,149,0,0.12); }
.status-badge.graded { color: #30D158; background: rgba(48,209,88,0.12); }
.task-description { font-size: 13px; color: #8E8E93; margin-top: 8px; line-height: 1.4; }
.task-attachments { margin-top: 8px; }
.no-attachments { font-size: 12px; color: #555; }
.attachment-link { display: block; font-size: 12px; color: #00D4FF; text-decoration: none; margin-top: 4px; }
.attachment-link:hover { text-decoration: underline; }

.submissions-btn {
  display: block; width: 100%; margin-top: 12px; padding: 10px;
  text-align: center; font-size: 14px; font-weight: 600; color: #00D4FF;
  border: 1.5px solid rgba(0,212,255,0.3); border-radius: 12px;
  background: transparent; transition: all 0.2s; cursor: pointer;
}
.submissions-btn:hover { background: rgba(0,212,255,0.08); }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 50px 0; color: #8E8E93; font-size: 14px; }

.bottom-actions { display: flex; gap: 12px; margin-top: 24px; }
.action-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; border-radius: 16px; font-size: 14px; font-weight: 700;
  color: #fff; cursor: pointer; transition: transform 0.15s;
}
.action-btn:hover { transform: scale(1.02); }
.action-btn.theme { background: linear-gradient(135deg, #6A1B9A, #BF5AF2); }
.action-btn.task { background: transparent; border: 2px solid #00D4FF; color: #00D4FF; }

/* Enrollment banner */
.enrollment-banner {
  margin: 0 0 20px;
  border-radius: 16px;
  overflow: hidden;
}

.enrollment-request,
.enrollment-pending,
.enrollment-rejected {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
}

.enrollment-request  { background: rgba(108, 99, 255, 0.1); border: 1px solid rgba(108,99,255,0.3); }
.enrollment-pending  { background: rgba(255,149,0,0.1); border: 1px solid rgba(255,149,0,0.3); }
.enrollment-rejected { background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.3); }

.enrollment-request  svg { flex-shrink: 0; }
.enrollment-pending  svg { flex-shrink: 0; }
.enrollment-rejected svg { flex-shrink: 0; }

.enroll-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.enroll-desc  { font-size: 13px; color: #8E8E93; line-height: 1.4; }

.enroll-btn {
  margin-left: auto;
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6C63FF, #8B7FFF);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  transition: opacity 0.2s;
}
.enroll-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
