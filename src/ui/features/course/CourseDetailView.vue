<template>
  <div class="course-detail">
    <div class="hero-section">
      <div class="hero-toolbar">
        <button class="toolbar-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button v-if="canEditCourseSettings" class="toolbar-btn" @click="$router.push(`/course/${courseId}/edit`)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
      </div>
      <div class="hero-image">
        <img v-if="heroImage" :src="heroImage" alt="" />
        <div class="hero-gradient" />
        <div class="hero-accent" />
      </div>
      <div class="hero-info">
        <span v-if="course?.is_premium || course?.isPremium" class="featured-badge">&#9733; Destacado</span>
        <h1 class="course-title">{{ displayTitle }}</h1>
      </div>
    </div>

    <div class="course-body">
      <p class="course-desc">{{ displayDescription }}</p>

      <div class="tags-row">
        <span class="tag purple">Temática: {{ course?.category ?? 'General' }}</span>
        <span class="tag">{{ course?.isFree ? 'Curso Gratuito' : 'Curso Premium' }}</span>
        <span v-if="subjectName" class="tag subject-tag">📚 {{ subjectName }}</span>
        <span v-if="canEditCourseSettings" class="tag config" @click="$router.push(`/course/${courseId}/edit`)">Configurar</span>
      </div>

      <!-- Role switcher for admin (role 3) -->
      <div v-if="canSwitchRole" class="role-switcher">
        <label class="role-switcher-label">Vista actual:</label>
        <select v-model="viewAsRole" class="role-switcher-select">
          <option :value="3">Administrador (Rol 3)</option>
          <option :value="1">Estudiante (Rol 1)</option>
        </select>
      </div>

      <!-- Pending submissions alert (admin/docente only) -->
      <div v-if="hasSubjectContentAccess && totalPendingCount > 0" class="pending-alert-card">
        <div class="pending-alert-header">
          <div class="pending-alert-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div class="pending-alert-text">
            <p class="pending-alert-title">{{ totalPendingCount }} entrega{{ totalPendingCount !== 1 ? 's' : '' }} por revisar</p>
            <p class="pending-alert-sub">{{ Object.values(pendingByTopic).filter(c => c > 0).length }} tema{{ Object.values(pendingByTopic).filter(c => c > 0).length !== 1 ? 's' : '' }} con pendientes</p>
          </div>
          <button class="pending-alert-btn" @click="activeTab = 'tasks'">Ver tareas</button>
        </div>
        <div class="pending-topic-list">
          <template v-for="topic in topics" :key="topic.id">
            <div v-if="(pendingByTopic[topic.id] ?? 0) > 0" class="pending-topic-row">
              <div class="pending-topic-dot" />
              <span class="pending-topic-name">{{ topic.title }}</span>
              <span class="pending-topic-count">{{ pendingByTopic[topic.id] }} sin revisar</span>
            </div>
          </template>
        </div>
      </div>

      <div v-if="showStudentProgressCard" class="progress-card">
        <div class="progress-card-header">
          <div>
            <p class="progress-eyebrow">{{ subjectId ? 'Tu progreso en la materia' : 'Tu progreso en el curso' }}</p>
            <h2 class="progress-title-card">Avance actual</h2>
          </div>
          <div class="progress-header-side">
            <div v-if="progressLoading" class="progress-spinner" aria-label="Actualizando progreso" />
            <span class="progress-percent">{{ displayedProgressPercentText }}</span>
          </div>
        </div>

        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${displayedProgressPercentage}%` }" />
        </div>

        <div class="progress-meta-row">
          <span>{{ displayedTaskSummary }}</span>
          <span>Nota: {{ displayedAverageGrade }}</span>
        </div>

        <div class="progress-footer-row">
          <span class="progress-status" :class="progressStatusClass">{{ displayedStatus }}</span>
          <span v-if="progressLoading" class="progress-loading-text">Actualizando progreso...</span>
        </div>
      </div>

      <!-- Enrollment Banner (visible cuando la matricula aprobada es requerida) -->
      <div v-if="showEnrollmentBanner" class="enrollment-banner">
        <div v-if="enrollmentStatus === 'pending'" class="enrollment-pending">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF9500" /></svg>
          <div>
            <p class="enroll-title">Solicitud pendiente</p>
            <p class="enroll-desc">Tu solicitud de acceso está esperando aprobación del administrador.</p>
          </div>
        </div>
        <div v-else-if="enrollmentStatus === 'rejected'" class="enrollment-rejected">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <div>
            <p class="enroll-title">Acceso rechazado</p>
            <p class="enroll-desc">Tu solicitud fue rechazada. Contacta al administrador para más información.</p>
          </div>
        </div>
        <div v-else-if="enrollmentStatus === 'inactivo'" class="enrollment-rejected">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <div>
            <p class="enroll-title">Acceso desactivado</p>
            <p class="enroll-desc">Tu acceso a este curso fue desactivado por el administrador.</p>
          </div>
        </div>
        <div v-else-if="enrollmentStatus === 'revoked'" class="enrollment-rejected">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          <div>
            <p class="enroll-title">Acceso revocado</p>
            <p class="enroll-desc">Tu acceso a este curso fue revocado por el administrador.</p>
          </div>
        </div>
        <div v-else class="enrollment-request">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <div>
            <p class="enroll-title">Acceso restringido</p>
            <p class="enroll-desc">Necesitas una matricula aprobada para ver el contenido de este curso.</p>
          </div>
          <button class="enroll-btn" :disabled="requestingEnrollment" @click="requestEnrollment">
            {{ requestingEnrollment ? 'Enviando...' : 'Solicitar Acceso' }}
          </button>
        </div>
      </div>

      <template v-if="!showEnrollmentBanner || hasSubjectContentAccess">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'docs' }" @click="activeTab = 'docs'">
          Temas <span class="tab-count">{{ topics.length }}</span>
        </button>
        <button class="tab-btn tab-btn--tasks" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">
          Tareas <span class="tab-count">{{ totalTaskCount }}</span>
          <span v-if="hasSubjectContentAccess && totalPendingCount > 0" class="tab-pending-badge">{{ totalPendingCount }}</span>
        </button>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <template v-else-if="activeTab === 'docs'">
        <h2 v-if="topics.length" class="section-heading">Contenido del Tema</h2>
        <div v-for="topic in topics" :key="topic.id" class="topic-block">
          <div class="topic-row">
            <div class="topic-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <div class="topic-info">
              <span class="topic-name">{{ topic.title }}</span>
              <p v-if="topic.description" class="topic-subtitle" :class="{ 'topic-subtitle--expanded': expandedTopicDescriptions.has(topic.id) }" @click.stop="toggleTopicDescription(topic.id)">{{ topic.description }}</p>
            </div>
            <button v-if="hasSubjectContentAccess" class="topic-action edit" @click.stop="router.push({ path: `/course/${courseId}/topic/${topic.id}`, query: { subjectId: String(subjectId ?? '') } })">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button v-if="hasSubjectContentAccess" class="topic-action delete" @click.stop="deleteTopic(topic.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
            <svg class="chevron open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div class="topic-expanded">
            <div v-if="!topicContent[topic.id]?.length" class="empty-inline">Sin archivos</div>
            <button
              v-for="item in topicContent[topic.id]"
              :key="item.id"
              class="content-row"
              type="button"
              @click="downloadContentItem(item)"
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
            </button>
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
        <!-- Pending tasks summary bar (admin/docente only) -->
        <div v-if="hasSubjectContentAccess && totalPendingCount > 0" class="tasks-pending-bar">
          <div class="tasks-pending-bar-left">
            <span class="tasks-pending-bar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="tasks-pending-bar-text">
              <strong>{{ totalPendingCount }}</strong> entrega{{ totalPendingCount !== 1 ? 's' : '' }} pendiente{{ totalPendingCount !== 1 ? 's' : '' }} de revisión
            </span>
          </div>
          <span class="tasks-pending-bar-topics">{{ Object.values(pendingByTopic).filter(c => c > 0).length }} tema{{ Object.values(pendingByTopic).filter(c => c > 0).length !== 1 ? 's' : '' }}</span>
        </div>
        <h2 v-if="topicsWithTasks.length" class="section-heading" :style="hasSubjectContentAccess && totalPendingCount > 0 ? 'margin-top:12px' : ''">Tareas</h2>
        <div v-for="topic in topicsWithTasks" :key="topic.id" class="topic-block">
          <div class="topic-row">
            <div class="topic-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <div class="topic-info">
              <span class="topic-name">{{ topic.title }}</span>
              <p v-if="topic.description" class="topic-subtitle" :class="{ 'topic-subtitle--expanded': expandedTopicDescriptions.has(topic.id) }" @click.stop="toggleTopicDescription(topic.id)">{{ topic.description }}</p>
            </div>
            <span class="task-count-badge">{{ topicTasks[topic.id]?.length ?? 0 }} tareas</span>
            <span v-if="hasSubjectContentAccess && (pendingByTopic[topic.id] ?? 0) > 0" class="topic-pending-pill">⏳ {{ pendingByTopic[topic.id] }} sin revisar</span>
            <svg class="chevron open" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
          <div class="topic-expanded">
            <div class="tasks-label">TAREAS DEL TEMA</div>
            <div v-if="!topicTasks[topic.id]?.length" class="empty-inline">Sin tareas</div>
            <div v-for="task in topicTasks[topic.id]" :key="task.id" class="task-card">
              <div class="task-row">
                <div class="task-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </div>
                <div class="task-info">
                  <p class="task-title">{{ task.title }}</p>
                  <span v-if="!hasSubjectContentAccess || isViewingAsStudent" class="status-badge" :class="getSubmissionStatus(task.id)">{{ getSubmissionLabel(task.id) }}</span>
                  <span v-if="hasSubjectContentAccess && !isViewingAsStudent && (pendingMap[task.id] ?? 0) > 0" class="task-pending-inline">⏳ {{ pendingMap[task.id] }} pendiente{{ pendingMap[task.id] !== 1 ? 's' : '' }}</span>
                </div>
                <div v-if="hasSubjectContentAccess" class="task-mgmt-btns">
                  <button
                    class="task-mgmt-btn edit"
                    @click.stop="$router.push({ path: `/course/${courseId}/task/${task.id}`, query: { edit: 'true', topicId: String(topic.id), subjectId: subjectId ? String(subjectId) : undefined } })"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    class="task-mgmt-btn delete"
                    @click.stop="deleteTaskItem(task.id, topic.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              </div>
              <p v-if="task.description" class="task-description" :class="{ 'task-description--expanded': expandedTaskDescriptions.has(task.id) }" @click.stop="toggleTaskDescription(task.id)">{{ task.description }}</p>
              <div class="task-attachments">
                <span v-if="!taskContent[task.id]?.length" class="no-attachments">No hay archivos adjuntos</span>
                <button
                  v-for="ci in taskContent[task.id]"
                  :key="ci.id"
                  class="attachment-link"
                  type="button"
                  @click="downloadContentItem(ci)"
                >📎 {{ ci.fileName || ci.content }}</button>
              </div>
              <button
                class="submissions-btn"
                @click="$router.push({ path: `/task-submission/${task.id}`, query: { courseId: String(courseId), ...(canSwitchRole ? { viewAsRole: String(viewAsRole) } : {}) } })"
              >{{ isViewingAsStudent ? 'Realizar Entrega' : (hasSubjectContentAccess || authStore.isDocente) ? 'Ver Entregas de Estudiantes' : 'Realizar Entrega' }}<span v-if="hasSubjectContentAccess && (pendingMap[task.id] ?? 0) > 0" class="submissions-btn-badge">{{ pendingMap[task.id] }}</span></button>
            </div>
          </div>
        </div>
        <div v-if="!topicsWithTasks.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          <p>Sin tareas aún</p>
        </div>
      </template>

      <div v-if="hasSubjectContentAccess && !loading" class="bottom-actions">
        <button class="action-btn theme" @click="$router.push({ path: `/course/${courseId}/topic`, query: { subjectId: String(subjectId ?? '') } })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Nuevo Tema
        </button>
        <button class="action-btn task" @click="$router.push({ path: `/course/${courseId}/select-topic`, query: { subjectId: String(subjectId ?? ''), isCreatingTask: 'true' } })">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          Nueva Tarea
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Course, Topic, Task, ContentItem, Progress } from '@/domain/models'
import { useCourseStore } from '@/stores/courseStore'
import {
  topicAdapter, taskAdapter, contentItemAdapter,
  submissionAdapter, resolveImageUrl, buildProxyFileUrl, collaboratorAdapter, subjectAdapter,
  tokenStorage,
} from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import { extractEnrollmentStatus, progressAdapter } from '@/infrastructure/api/progressAdapter'
import { useNotificationStore } from '@/stores/notificationStore'

defineOptions({ name: 'CourseDetailView' })

interface CourseProgressResponse extends Progress {
  subjectProgress?: Progress[]
  gradedTasks?: Array<Record<string, unknown>>
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()
const notifStore = useNotificationStore()

const courseId = computed(() => route.params.id as string)
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)
const subjectName = computed(() => route.query.subjectName as string | undefined)
const subjectDescription = computed(() => route.query.subjectDescription as string | undefined)
const subjectThumbnailUrl = computed(() => route.query.subjectThumbnailUrl as string | undefined)
const course = ref<Course | null>(null)
const topics = ref<Topic[]>([])
const activeTab = ref<'docs' | 'tasks'>('docs')
const loading = ref(true)
const progressLoading = ref(false)
const progressLoaded = ref(false)
const studentProgress = ref<CourseProgressResponse | null>(null)

// Fetched subject data — ensures title is always available even without query params
const fetchedSubject = ref<{ name?: string; description?: string; thumbnailUrl?: string } | null>(null)

const displayTitle = computed(() => subjectName.value || fetchedSubject.value?.name || course.value?.title || 'Cargando…')
const displayDescription = computed(() => subjectDescription.value || fetchedSubject.value?.description || course.value?.description)
const heroImage = computed(() => {
  const subjectThumb = (subjectThumbnailUrl.value || fetchedSubject.value?.thumbnailUrl)
    ? resolveImageUrl(subjectThumbnailUrl.value || fetchedSubject.value?.thumbnailUrl)
    : null
  return subjectThumb || resolveImageUrl(course.value?.thumbnailUri ?? course.value?.thumbnail_uri)
})

const collaboratorAccess = ref(false)
const isSubjectCreator = ref(false)
const isCourseCreator = computed(() => {
  const currentUserId = Number(authStore.user?.id ?? 0)
  const creatorId = Number(course.value?.creatorUserId ?? course.value?.creator_user_id ?? 0)
  return currentUserId > 0 && creatorId === currentUserId
})

// ── Role switcher for admin (role 3) ────────────────────────────────
// viewAsRole: 3 = admin/creator view, 1 = student view
const viewAsRole = ref<number>(authStore.isAdmin ? 3 : 1)
const canSwitchRole = computed(() => authStore.isAdmin)
const viewAsRoleLabel = computed(() => viewAsRole.value === 3 ? 'Administrador' : 'Estudiante')
const isViewingAsStudent = computed(() => canSwitchRole.value && viewAsRole.value === 1)

const canEditCourseSettings = computed(() => authStore.isAdmin || isCourseCreator.value)
// When viewing as student, keep CRUD access (role 3 always has it)
const hasSubjectContentAccess = computed(() =>
  canEditCourseSettings.value || collaboratorAccess.value
)

// ── Enrollment flow ────────────────────────────────────────────────
const enrollmentStatus = ref<string | null>(null) // 'approved' | 'pending' | 'rejected' | null
const requestingEnrollment = ref(false)
const isGuestOrEnrolled = ref(false) // true when user is an invited guest or already enrolled

const requiresEnrollmentApproval = computed(() => {
  if (authStore.isAdmin) return false
  // Colaboradores y creadores del curso tienen acceso directo
  if (hasSubjectContentAccess.value) return false
  // Invitados (guests) y usuarios ya matriculados no necesitan aprobación
  if (isGuestOrEnrolled.value) return false
  return true
})

// Muestra el banner cuando la persona no es admin y aun no tiene matricula aprobada.
// No se muestra durante la carga inicial para evitar que invitados (ya aprobados) vean el banner brevemente.
const showEnrollmentBanner = computed(() => {
  if (loading.value) return false
  if (!requiresEnrollmentApproval.value || hasSubjectContentAccess.value) return false
  return enrollmentStatus.value !== 'approved'
})

const showStudentProgressCard = computed(() => {
  // Admin viewing as student: show progress card
  if (isViewingAsStudent.value) {
    return progressLoading.value || progressLoaded.value || Boolean(studentProgress.value)
  }
  return !canEditCourseSettings.value &&
    !hasSubjectContentAccess.value &&
    !showEnrollmentBanner.value &&
    (progressLoading.value || progressLoaded.value || Boolean(studentProgress.value))
})

const requestEnrollment = async () => {
  requestingEnrollment.value = true
  try {
    await progressAdapter.requestEnrollment(Number(courseId.value))
    enrollmentStatus.value = 'pending'
  } catch (e) {
    console.error('Error requesting enrollment:', e)
  } finally {
    requestingEnrollment.value = false
  }
}

const checkEnrollmentStatus = async (cid: number) => {
  if (!requiresEnrollmentApproval.value || hasSubjectContentAccess.value) return
  try {
    const data: any = await progressAdapter.getEnrollmentStatus(cid)
    enrollmentStatus.value = extractEnrollmentStatus(data)
  } catch {
    enrollmentStatus.value = null
  }
}

const expandedTopics = reactive(new Set<number>())
const expandedTaskTopics = reactive(new Set<number>())
const expandedTopicDescriptions = reactive(new Set<number>())
const expandedTaskDescriptions = reactive(new Set<number>())
const topicContent = ref<Record<number, ContentItem[]>>({})
const topicTasks = ref<Record<number, Task[]>>({})
const taskContent = ref<Record<number, ContentItem[]>>({})
const submissionMap = ref<Record<number, string>>({})
const pendingMap = ref<Record<number, number>>({}) // taskId → ungraded count (admin/docente only)

const totalPendingCount = computed(() =>
  Object.values(pendingMap.value).reduce((a, b) => a + b, 0)
)

const pendingByTopic = computed(() => {
  const map: Record<number, number> = {}
  for (const [topicId, tasks] of Object.entries(topicTasks.value)) {
    map[Number(topicId)] = tasks.reduce((sum, t) => sum + (pendingMap.value[t.id] ?? 0), 0)
  }
  return map
})

const totalTaskCount = computed(() =>
  Object.values(topicTasks.value).reduce((sum, arr) => sum + arr.length, 0)
)

const topicsWithTasks = computed(() =>
  topics.value.filter(t => (topicTasks.value[t.id]?.length ?? 0) > 0)
)

const selectedProgress = computed<Progress | null>(() => {
  const progress = studentProgress.value
  if (!progress) return null

  if (subjectId.value && Array.isArray(progress.subjectProgress)) {
    const subjectMatch = progress.subjectProgress.find(
      (entry) => Number(entry.subjectId ?? 0) === Number(subjectId.value),
    )
    if (subjectMatch) return subjectMatch
  }

  return progress
})

const displayedProgressPercentage = computed(() => {
  const raw = Number(selectedProgress.value?.progressPercentage ?? 0)
  if (!Number.isFinite(raw)) return 0
  return Math.max(0, Math.min(100, Math.round(raw)))
})

const displayedProgressPercentText = computed(() => {
  if (!selectedProgress.value && progressLoading.value) return '--'
  return `${displayedProgressPercentage.value}%`
})

const displayedAverageGrade = computed(() => {
  if (!selectedProgress.value && progressLoading.value) return '--'
  const grade = Number(selectedProgress.value?.averageGrade ?? 0)
  return `${grade.toFixed(1)}/10`
})

const displayedTaskSummary = computed(() => {
  if (!selectedProgress.value && progressLoading.value) return 'Cargando tareas...'
  const completed = Number(selectedProgress.value?.completedTasks ?? 0)
  const total = Number(selectedProgress.value?.totalTasks ?? 0)
  return `${completed}/${total} tareas`
})

const displayedStatus = computed(() => {
  if (!selectedProgress.value && progressLoading.value) return 'Actualizando'
  return selectedProgress.value?.status || 'Perdido'
})

const progressStatusClass = computed(() =>
  String(selectedProgress.value?.status || '')
    .trim()
    .toLowerCase() === 'ganado'
    ? 'won'
    : 'lost',
)

function getProgressCacheKey(cid: number): string | null {
  const userId = Number(authStore.user?.id ?? 0)
  if (userId <= 0 || cid <= 0) return null
  return `course-detail-progress:${userId}:${cid}`
}

function readCachedProgress(cid: number): CourseProgressResponse | null {
  const cacheKey = getProgressCacheKey(cid)
  if (!cacheKey) return null

  try {
    const raw = localStorage.getItem(cacheKey)
    return raw ? JSON.parse(raw) as CourseProgressResponse : null
  } catch {
    return null
  }
}

function writeCachedProgress(cid: number, progress: CourseProgressResponse) {
  const cacheKey = getProgressCacheKey(cid)
  if (!cacheKey) return

  try {
    localStorage.setItem(cacheKey, JSON.stringify(progress))
  } catch {
    // Ignore storage quota and private mode errors.
  }
}

async function loadStudentProgress(cid: number) {
  const userId = Number(authStore.user?.id ?? 0)
  if (userId <= 0) return
  // Allow loading when admin views as student (role switcher)
  if (!isViewingAsStudent.value && (authStore.isAdmin || canEditCourseSettings.value || hasSubjectContentAccess.value)) return

  const cached = readCachedProgress(cid)
  if (cached) {
    studentProgress.value = cached
    progressLoaded.value = true
  }

  progressLoading.value = true
  try {
    const data = await progressAdapter.getProgressByCourse(cid) as CourseProgressResponse
    if (data) {
      studentProgress.value = data
      progressLoaded.value = true
      writeCachedProgress(cid, data)
    }
  } catch (e) {
    console.error('Error loading student progress:', e)
  } finally {
    progressLoading.value = false
  }
}

function getFileUrl(item: ContentItem): string {
  const uri = item.fileUri || item.content || ''
  if (!uri) return '#'
  if (uri.startsWith('http')) return uri
  return buildProxyFileUrl(uri)
}

function getDownloadFileName(item: ContentItem): string {
  const candidate = (item.fileName || item.content || '').trim()
  return candidate || `archivo-${item.id}`
}

async function downloadContentItem(item: ContentItem) {
  const fileUrl = getFileUrl(item)
  if (fileUrl === '#') return

  const downloadName = getDownloadFileName(item)
  const token = tokenStorage.token

  try {
    const response = await fetch(fileUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = downloadName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    const fallbackLink = document.createElement('a')
    fallbackLink.href = fileUrl
    fallbackLink.target = '_blank'
    fallbackLink.rel = 'noopener'
    document.body.appendChild(fallbackLink)
    fallbackLink.click()
    fallbackLink.remove()
  }
}

function getSubmissionStatus(taskId: number): string {
  return submissionMap.value[taskId] ?? 'not-submitted'
}

function getSubmissionLabel(taskId: number): string {
  const s = submissionMap.value[taskId]
  if (s === 'graded') return 'Calificada'
  if (s === 'pending') return 'Enviada · Pendiente'
  return 'Sin entregar'
}

async function toggleTopic(topicId: number) {
  expandedTopics.add(topicId)
  if (!topicContent.value[topicId]) {
    try {
      topicContent.value[topicId] = await contentItemAdapter.getByTopic(topicId)
    } catch { topicContent.value[topicId] = [] }
  }
}

async function toggleTopicTasks(topicId: number) {
  expandedTaskTopics.add(topicId)
  const tasks = topicTasks.value[topicId] ?? []
  for (const task of tasks) {
    if (taskContent.value[task.id] === undefined) {
      try { taskContent.value[task.id] = await contentItemAdapter.getByTask(task.id) }
      catch { taskContent.value[task.id] = [] }
    }
  }
}

function toggleTopicDescription(topicId: number) {
  if (expandedTopicDescriptions.has(topicId)) expandedTopicDescriptions.delete(topicId)
  else expandedTopicDescriptions.add(topicId)
}

function toggleTaskDescription(taskId: number) {
  if (expandedTaskDescriptions.has(taskId)) expandedTaskDescriptions.delete(taskId)
  else expandedTaskDescriptions.add(taskId)
}

async function deleteTopic(topicId: number) {
  try {
    await topicAdapter.deleteTopic(topicId)
    topics.value = topics.value.filter(t => t.id !== topicId)
    // Limpiar estado relacionado con el tema eliminado
    expandedTopics.delete(topicId)
    delete topicContent.value[topicId]
    delete topicTasks.value[topicId]
  } catch { /* silent */ }
}

async function deleteTaskItem(taskId: number, topicId: number) {
  try {
    await taskAdapter.deleteTask(taskId)
    topicTasks.value = {
      ...topicTasks.value,
      [topicId]: (topicTasks.value[topicId] ?? []).filter(t => t.id !== taskId),
    }
    // Limpiar estado relacionado con la tarea eliminada
    delete taskContent.value[taskId]
    delete submissionMap.value[taskId]
    delete pendingMap.value[taskId]
  } catch { /* silent */ }
}

async function loadTopicsAndTasks(id: number, clearCache = false) {
  // Si clearCache es true, limpiar estados expandidos y contenido cacheado
  if (clearCache) {
    expandedTopics.clear()
    expandedTaskTopics.clear()
    topicContent.value = {}
    taskContent.value = {}
  }

  try {
    topics.value = subjectId.value
      ? await topicAdapter.getTopicsBySubject(subjectId.value)
      : await topicAdapter.getTopicsByCourse(id)
  } catch { /* empty */ }

  for (const topic of topics.value) {
    expandedTopics.add(topic.id)
    expandedTaskTopics.add(topic.id)
  }

  await Promise.all(
    topics.value.map(async (topic) => {
      try {
        topicContent.value[topic.id] = await contentItemAdapter.getByTopic(topic.id)
      } catch {
        topicContent.value[topic.id] = []
      }
    }),
  )

  const taskEntries = await Promise.all(
    topics.value.map(async (topic) => {
      try {
        const tasks = await taskAdapter.getTasksByTopic(topic.id)
        return [topic.id, tasks] as const
      } catch {
        return [topic.id, [] as Task[]] as const
      }
    }),
  )

  const nextTaskMap: Record<number, Task[]> = {}
  const allTasks: Task[] = []
  for (const [topicId, tasks] of taskEntries) {
    nextTaskMap[topicId] = tasks
    allTasks.push(...tasks)
  }
  topicTasks.value = nextTaskMap

  for (const tasks of Object.values(nextTaskMap)) {
    for (const task of tasks) {
      if (taskContent.value[task.id] === undefined) {
        try { taskContent.value[task.id] = await contentItemAdapter.getByTask(task.id) }
        catch { taskContent.value[task.id] = [] }
      }
    }
  }

  for (const topic of topics.value) {
    await toggleTopic(topic.id)
  }

  for (const topic of topicsWithTasks.value) {
    await toggleTopicTasks(topic.id)
  }

  await loadSubmissionStatuses(allTasks)
  if (hasSubjectContentAccess.value) await loadPendingSubmissions(id)
}

async function loadSubmissionStatuses(tasks: Task[]) {
  // Allow loading when admin views as student
  if (hasSubjectContentAccess.value && !isViewingAsStudent.value) return
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

async function loadPendingSubmissions(courseIdNum: number) {
  if (!hasSubjectContentAccess.value) return
  try {
    const subs = await submissionAdapter.getSubmissionByCourse(courseIdNum, true)
    const counts: Record<number, number> = {}
    for (const sub of subs) {
      counts[sub.task_id] = (counts[sub.task_id] ?? 0) + 1
    }
    pendingMap.value = counts
  } catch { /* silent */ }
}

onActivated(async () => {
  const courseIdNum = Number(courseId.value)
  if (!courseIdNum) return

  // Re-verificar bloqueo de materia al reactivar (keep-alive omite onMounted)
  if (!authStore.hasRole(3) && subjectId.value) {
    try {
      const blockData: any = await progressAdapter.checkSubjectAccessBlock(subjectId.value)
      if (blockData?.blocked === true) {
        const reason = blockData?.reason || 'Sin motivo especificado'
        alert(`Has sido bloqueado debido a: ${reason}`)
        router.back()
        return
      }
    } catch { /* silent */ }
  }
  
  // Detectar si regresamos de crear/editar tema o tarea
  const fromState = history.state?.from
  if (fromState === 'taskCreation') {
    activeTab.value = 'tasks'
  } else if (fromState === 'topicCreation' || fromState === 'topicEdit') {
    activeTab.value = 'docs'
  }
  
  // Recargar datos desde el servidor, limpiando la caché de contenido expandido
  await loadTopicsAndTasks(courseIdNum, true)
})

onMounted(async () => {
  const id = Number(courseId.value)
  try {
    await courseStore.fetchCourseById(id)
  } catch (e: any) {
    const msg: string = e?.message ?? ''
    console.warn('CourseDetailView: no se pudo cargar el curso:', msg)
    router.back()
    return
  }
  course.value = courseStore.current

  // Always fetch subject data when subjectId is present to guarantee the title
  if (subjectId.value) {
    try {
      const subject = await subjectAdapter.getSubjectById(subjectId.value)
      if (subject) {
        fetchedSubject.value = {
          name: (subject as any).name ?? (subject as any).title,
          description: (subject as any).description,
          thumbnailUrl: (subject as any).thumbnailUrl ?? (subject as any).thumbnail_url,
        }
      }
    } catch { /* silent — query params will be used as fallback */ }
  }

  // Guard: if user is not admin and a subjectId is specified, check if subject is blocked
  if (!authStore.hasRole(3) && subjectId.value) {
    try {
      const blockData: any = await progressAdapter.checkSubjectAccessBlock(subjectId.value)
      if (blockData?.blocked === true) {
        const reason = blockData?.reason || 'Sin motivo especificado'
        // Store reason to show in UI before navigating back
        alert(`Has sido bloqueado debido a: ${reason}`)
        router.back()
        return
      }
    } catch { /* silent — if check fails, allow access */ }
  }

  if (authStore.hasRole(2) && !authStore.hasRole(3)) {
    try {
      const access = await collaboratorAdapter.checkAccess(id)
      collaboratorAccess.value = Boolean(access?.hasAccess)
    } catch {
      collaboratorAccess.value = false
    }
  }

  const progressPromise = loadStudentProgress(id)

  // Check if user is an invited guest or already enrolled (bypasses enrollment approval)
  try {
    const enrolledData: any = await progressAdapter.isEnrolled(id)
    if (enrolledData === true || enrolledData?.isEnrolled === true) {
      isGuestOrEnrolled.value = true
    }
  } catch { /* silent */ }

  await checkEnrollmentStatus(id)

  // Guard: block inactivo/revoked users regardless of role (except admin/collaborator)
  if (enrollmentStatus.value === 'inactivo' || enrollmentStatus.value === 'revoked') {
    await progressPromise.catch(() => {})
    const msg = enrollmentStatus.value === 'inactivo'
      ? 'Tu acceso a este curso fue desactivado por el administrador.'
      : 'Tu acceso a este curso fue revocado por el administrador.'
    router.replace({ path: '/explore', query: { accessDenied: msg } })
    return
  }

  // Guard: if user requires enrollment and it's not approved, redirect back
  if (requiresEnrollmentApproval.value && enrollmentStatus.value !== 'approved') {
    await progressPromise.catch(() => {})
    router.back()
    return
  }

  if (course.value) {
    await loadTopicsAndTasks(id)
  }
  await progressPromise
  loading.value = false
})

// ── Real-time: if admin blocks this subject, kick user out immediately ──
function handleAccessBlockedInDetail(data: { subjectId: number; courseId: number; reason: string }) {
  if (!subjectId.value || data.subjectId !== subjectId.value) return
  router.back()
}

notifStore.onSocketEvent('subject:access-blocked', handleAccessBlockedInDetail)

onUnmounted(() => {
  notifStore.offSocketEvent('subject:access-blocked', handleAccessBlockedInDetail)
})

// Re-verificar acceso de colaborador cuando authStore.user carga después del montaje
// (ocurre al navegar desde notificación push que abre la app en página nueva)
watch(() => authStore.user?.id, async (newId) => {
  if (!newId) return
  const id = Number(courseId.value)
  if (!id) return
  // Solo aplica a docentes (rol 2) que no son admin (rol 3)
  if (!authStore.hasRole(2) || authStore.hasRole(3)) return
  try {
    const access = await collaboratorAdapter.checkAccess(id)
    const hasAccess = Boolean(access?.hasAccess)
    if (hasAccess && !collaboratorAccess.value) {
      collaboratorAccess.value = true
      // Recargar datos en modo docente para obtener entregas pendientes
      await loadTopicsAndTasks(id)
    }
  } catch { /* silent */ }
})

// When admin switches to student view, load student progress and submission statuses
watch(viewAsRole, async (newRole) => {
  if (newRole === 1 && authStore.isAdmin) {
    const cid = Number(courseId.value)
    if (cid > 0) {
      if (!studentProgress.value && !progressLoading.value) {
        await loadStudentProgress(cid)
      }
      // Load submission statuses so task badges show for student view
      const allTasks = Object.values(topicTasks.value).flat()
      if (allTasks.length > 0) {
        await loadSubmissionStatuses(allTasks)
      }
    }
  }
})
</script>

<style scoped>
.course-detail { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #080C1A; padding-bottom: 100px; overflow-y: auto; }

@media (min-width: 769px) {
  .course-detail { left: 100px; }
}

.hero-section { position: relative; height: 280px; }
.hero-toolbar { position: absolute; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; padding: 12px 16px; }
.toolbar-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(0,0,0,0.45); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; }
.hero-image { position: relative; width: 100%; height: 100%; background: #1a1a2e; }
.hero-image img { width: 100%; height: 100%; object-fit: cover; }
.hero-gradient { position: absolute; bottom: 0; left: 0; right: 0; height: 75%; background: linear-gradient(transparent, #080C1A); }
.hero-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00D4FF, #9C27B0); }
.hero-info { position: absolute; bottom: 18px; left: 16px; right: 16px; z-index: 5; }

.course-body { padding: 0 16px; margin-top: 16px; position: relative; }

.featured-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 10px; background: rgba(255,215,0,0.15); color: #FFD700; font-size: 12px; font-weight: 600; margin-bottom: 6px; }

.course-title { font-size: 28px; font-weight: 800; color: #fff; margin: 0; line-height: 1.15; text-shadow: 0 2px 12px rgba(0,0,0,0.6); }
.course-desc { font-size: 14px; color: #8E8E93; line-height: 1.5; margin-bottom: 14px; }

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.tag { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; color: #ccc; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); }
.tag.purple { color: #BF5AF2; border-color: rgba(191,90,242,0.3); background: rgba(191,90,242,0.1); }
.tag.subject-tag { color: #00D4FF; border-color: rgba(0,212,255,0.3); background: rgba(0,212,255,0.1); }
.tag.config { cursor: pointer; border-color: rgba(255,255,255,0.15); }
.tag.config:hover { background: rgba(255,255,255,0.1); }

/* ── Role switcher ─────────────────────────────────────── */
.role-switcher {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 18px; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(191,90,242,0.08));
  border: 1px solid rgba(0,212,255,0.2);
}
.role-switcher-label { font-size: 13px; font-weight: 600; color: #8E8E93; white-space: nowrap; }
.role-switcher-select {
  flex: 1; padding: 8px 12px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  color: #fff; font-size: 13px; font-weight: 600;
  cursor: pointer; outline: none; appearance: auto;
}
.role-switcher-select:focus { border-color: rgba(0,212,255,0.4); }
.role-switcher-select option { background: #1C1C1E; color: #fff; }

.progress-card {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(17,20,40,0.96), rgba(12,15,28,0.92));
  border: 1px solid rgba(0,212,255,0.16);
  box-shadow: 0 18px 40px rgba(0,0,0,0.22);
}

.progress-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.progress-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00D4FF;
  margin-bottom: 4px;
}

.progress-title-card {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.progress-header-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-spinner {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(0,212,255,0.2);
  border-top-color: #00D4FF;
  animation: spin 0.8s linear infinite;
}

.progress-percent {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
}

.progress-track {
  margin-top: 16px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #00D4FF, #00E5C5);
  transition: width 0.25s ease;
}

.progress-meta-row,
.progress-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  font-size: 13px;
  color: #A7AEC7;
}

.progress-status {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.progress-status.won {
  color: #30D158;
  background: rgba(48,209,88,0.12);
}

.progress-status.lost {
  color: #FF9500;
  background: rgba(255,149,0,0.12);
}

.progress-loading-text {
  color: #00D4FF;
}

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
.topic-info { flex: 1; min-width: 0; }
.topic-name { font-size: 15px; font-weight: 600; color: #fff; }
.topic-subtitle { font-size: 12px; color: #8E8E93; margin-top: 3px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; cursor: pointer; }
.topic-subtitle--expanded { -webkit-line-clamp: unset; overflow: visible; display: block; }
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
  width: 100%; border: none; text-decoration: none; color: inherit; transition: background 0.15s;
  cursor: pointer; text-align: left;
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

/* ── Task card v2 (matches Android item_course_task_detail) ── */
.task-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 14px; margin-bottom: 8px; }
.task-row { display: flex; align-items: center; gap: 10px; }
.task-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(0,212,255,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.task-info { flex: 1; }
.task-title { font-size: 14px; font-weight: 600; color: #fff; }
.status-badge { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 8px; margin-top: 4px; }
.status-badge.pending, .status-badge.not-submitted { color: #FF9500; background: rgba(255,149,0,0.12); }
.status-badge.graded { color: #30D158; background: rgba(48,209,88,0.12); }
.task-description { font-size: 13px; color: #8E8E93; margin-top: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; cursor: pointer; }
.task-description--expanded { -webkit-line-clamp: unset; overflow: visible; display: block; }
.task-attachments { margin-top: 8px; }
.no-attachments { font-size: 12px; color: #555; }
.attachment-link {
  display: block; margin-top: 4px; padding: 0; border: none; background: transparent;
  font-size: 12px; color: #00D4FF; text-decoration: none; cursor: pointer;
}
.attachment-link:hover { text-decoration: underline; }

.submissions-btn {
  display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 12px; padding: 10px;
  text-align: center; font-size: 14px; font-weight: 600; color: #00D4FF;
  border: 1.5px solid rgba(0,212,255,0.3); border-radius: 12px;
  background: transparent; transition: all 0.2s; cursor: pointer;
}
.submissions-btn:hover { background: rgba(0,212,255,0.08); }

.submissions-btn-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px;
  background: rgba(245,158,11,0.25); color: #F59E0B;
  font-size: 11px; font-weight: 700; margin-left: 8px;
}

/* ── Pending alert card (admin/docente) ───────────────────── */
.pending-alert-card {
  margin-bottom: 20px; padding: 16px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(245,158,11,0.10), rgba(234,88,12,0.06));
  border: 1px solid rgba(245,158,11,0.22);
}
.pending-alert-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.pending-alert-icon {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: rgba(245,158,11,0.15); display: flex; align-items: center; justify-content: center;
}
.pending-alert-text { flex: 1; }
.pending-alert-title { font-size: 15px; font-weight: 700; color: #F59E0B; margin-bottom: 2px; }
.pending-alert-sub { font-size: 12px; color: #8E8E93; }
.pending-alert-btn {
  padding: 6px 14px; border-radius: 10px; flex-shrink: 0;
  background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.28);
  color: #F59E0B; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.pending-alert-btn:hover { background: rgba(245,158,11,0.22); }
.pending-topic-list { display: flex; flex-direction: column; gap: 5px; }
.pending-topic-row {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  border-radius: 10px; background: rgba(255,255,255,0.03);
}
.pending-topic-dot { width: 7px; height: 7px; border-radius: 50%; background: #F59E0B; flex-shrink: 0; }
.pending-topic-name { font-size: 13px; color: #ccc; flex: 1; }
.pending-topic-count { font-size: 12px; font-weight: 600; color: #F59E0B; }

/* ── Tareas tab pending badge ─────────────────────────── */
.tab-btn--tasks { position: relative; }
.tab-pending-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px;
  background: #F59E0B; color: #000;
  font-size: 11px; font-weight: 800; margin-left: 6px;
  box-shadow: 0 0 0 2px rgba(245,158,11,0.25);
  animation: pulse-badge 2s ease-in-out infinite;
}
.tab-btn.active .tab-pending-badge { background: rgba(0,0,0,0.3); color: #fff; box-shadow: none; animation: none; }
@keyframes pulse-badge {
  0%, 100% { box-shadow: 0 0 0 2px rgba(245,158,11,0.25); }
  50% { box-shadow: 0 0 0 5px rgba(245,158,11,0.0); }
}

/* ── Tasks panel pending summary bar ─────────────────── */
.tasks-pending-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 14px; border-radius: 12px; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,88,12,0.07));
  border: 1px solid rgba(245,158,11,0.22);
}
.tasks-pending-bar-left { display: flex; align-items: center; gap: 9px; }
.tasks-pending-bar-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(245,158,11,0.15); flex-shrink: 0; }
.tasks-pending-bar-text { font-size: 13px; color: #ccc; }
.tasks-pending-bar-text strong { color: #F59E0B; font-weight: 700; }
.tasks-pending-bar-topics { font-size: 12px; font-weight: 600; color: #F59E0B; background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.22); padding: 3px 9px; border-radius: 8px; white-space: nowrap; flex-shrink: 0; }

/* per-topic pending pill in tasks tab */
.topic-pending-pill {
  padding: 3px 9px; border-radius: 9px; font-size: 11px; font-weight: 600;
  background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.28);
  color: #F59E0B; white-space: nowrap;
}

/* per-task pending inline label */
.task-pending-inline {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600; color: #F59E0B;
  background: rgba(245,158,11,0.10); border: 1px solid rgba(245,158,11,0.22);
  padding: 2px 8px; border-radius: 7px; margin-top: 4px;
}

.task-mgmt-btns { display: flex; gap: 6px; margin-left: auto; flex-shrink: 0; }
.task-mgmt-btn {
  width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  background: transparent; border: none; cursor: pointer; transition: background 0.15s;
}
.task-mgmt-btn.edit { color: #00D4FF; }
.task-mgmt-btn.edit:hover { background: rgba(0,212,255,0.12); }
.task-mgmt-btn.delete { color: #FF453A; }
.task-mgmt-btn.delete:hover { background: rgba(255,69,58,0.12); }

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
