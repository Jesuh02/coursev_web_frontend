<template>
  <div class="subjects-list">
    <div class="header-section">
      <div class="header-top-row">
        <button class="back-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 class="header-title">Mis Materias</h1>
        <button v-if="canCreate" class="add-btn" @click="navigateToCreate">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <div v-if="!canCreate" class="add-btn-placeholder" />
      </div>
      <p v-if="allSubjects.length" class="header-subtitle">• {{ allSubjects.length }} materia{{ allSubjects.length !== 1 ? 's' : '' }}</p>
    </div>

    <div class="search-bar-container">
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" type="text" placeholder="Buscar materia..." />
      </div>
    </div>

    <div v-if="courseExpired && !authStore.isAdmin" class="expired-banner">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF453A" /></svg>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-if="loadingSubjects" class="loading-center">
      <div class="spinner-lg" />
    </div>

    <div v-else-if="filtered.length" class="subjects-grid">
      <SubjectCard
        v-for="subject in filtered"
        :key="subject.id"
        :subject="subject"
        :stats="getStats(subject.id)"
        :is-blocked="!!subjectBlocks[subject.id]"
        :can-modify="canModifySubject(subject)"
        @click="navigateToDetail(subject)"
        @options="openOptions"
      />
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
      <p class="empty-text">{{ errorMessage || 'Sin materias creadas' }}</p>
      <button v-if="canCreate" class="empty-add-btn" @click="navigateToCreate">Crear materia</button>
    </div>

    <button v-if="canCreate && filtered.length" class="fab" @click="navigateToCreate">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    </button>

    <Teleport to="body">
      <div v-if="optionsSubject" class="bottom-sheet-overlay" @click="optionsSubject = null">
        <div class="bottom-sheet" @click.stop>
          <h3 class="sheet-title">{{ optionsSubject.name }}</h3>
          <button class="sheet-option edit" @click="editSubject">Editar materia</button>
          <button class="sheet-option delete" @click="confirmDeleteSubject">Eliminar materia</button>
          <button class="sheet-option cancel" @click="optionsSubject = null">Cancelar</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="bottom-sheet-overlay" @click="showDeleteConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <h3>Eliminar materia</h3>
          <p>¿Estás seguro de eliminar "{{ optionsSubject?.name }}"? Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button class="cancel-btn" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="delete-btn" @click="deleteSubj">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="blockAlert.show" class="bottom-sheet-overlay" @click="blockAlert.show = false">
        <div class="confirm-dialog block-alert-dialog" @click.stop>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
          <h3>Acceso bloqueado</h3>
          <p class="block-reason-text">Has sido bloqueado debido a: {{ blockAlert.reason }}</p>
          <div class="confirm-actions">
            <button class="cancel-btn" @click="blockAlert.show = false">Entendido</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Subject } from '@/domain/models'
import { subjectAdapter, taskAdapter, topicAdapter, courseAdapter } from '@/infrastructure/api'
import { extractEnrollmentStatus, progressAdapter } from '@/infrastructure/api/progressAdapter'
import { collaboratorAdapter } from '@/infrastructure/api/collaboratorAdapter'
import { useSubjectSocket } from '@/composables/useSubjectSocket'
import SubjectCard from './components/SubjectCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const courseId = computed(() => Number(route.params.courseId) || 0)
const allSubjects = ref<Subject[]>([])
const search = ref('')
const loadingSubjects = ref(true)
const errorMessage = ref('')
const hasAccess = ref(false)
const canCreate = ref(false)
const isCollaboratorOnly = ref(false)
const hasCollaboratorAccess = ref(false)
const optionsSubject = ref<Subject | null>(null)
const showDeleteConfirm = ref(false)
const courseExpired = ref(false)
const subjectBlocks = ref<Record<number, string>>({})
const blockAlert = ref<{ show: boolean; reason: string }>({ show: false, reason: '' })
const enrollmentApproved = ref(false)

interface SubjectStats { taskCount: number; progress: number }
const statsMap = ref<Record<number, SubjectStats>>({})

const filtered = computed(() => {
  let list = allSubjects.value
  if (!search.value) return list
  const q = search.value.toLowerCase()
  return list.filter(s =>
    s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
  )
})

function getStats(subjectId: number): SubjectStats {
  return statsMap.value[subjectId] || { taskCount: 0, progress: 0 }
}

function canModifySubject(subject: Subject): boolean {
  if (authStore.isAdmin) return true
  if (authStore.isDocente && subject.createdBy && authStore.user) {
    return Number(subject.createdBy) === Number(authStore.user.id)
  }
  return false
}

const requiresEnrollmentApproval = computed(() =>
  !authStore.isAdmin && !hasCollaboratorAccess.value
)

onMounted(async () => {
  // Ensure user profile is loaded before access checks that depend on user id
  if (!authStore.user) await authStore.fetchProfile()

  await checkAccess()

  if (requiresEnrollmentApproval.value) {
    try {
      const data: any = await progressAdapter.getEnrollmentStatus(courseId.value)
      const status = extractEnrollmentStatus(data)
      if (status === 'revoked') {
        router.replace({ path: '/explore', query: { accessDenied: 'Tu acceso a este curso fue revocado por el administrador.' } })
        return
      }
      if (status !== 'approved') {
        router.replace({ path: '/explore', query: { accessDenied: 'No tienes acceso a este curso.' } })
        return
      }
      enrollmentApproved.value = true
    } catch {
      router.replace({ path: '/explore', query: { accessDenied: 'No se pudo verificar tu acceso a este curso.' } })
      return
    }
  } else {
    enrollmentApproved.value = true
  }
  await loadSubjects()
  await checkCourseDeadline()
  await loadSubjectBlocks()
})

// ── Real-time subject access block / unblock via socket ──
function handleAccessBlocked(data: { subjectId: number; courseId: number; reason: string }) {
  if (data.courseId !== courseId.value) return
  subjectBlocks.value = { ...subjectBlocks.value, [data.subjectId]: data.reason || 'Sin motivo especificado' }
  const subject = allSubjects.value.find(s => s.id === data.subjectId)
  blockAlert.value = {
    show: true,
    reason: `Tu acceso a la materia "${subject?.name || 'materia'}" fue revocado. Motivo: ${data.reason || 'Sin motivo especificado'}`,
  }
}

function handleAccessUnblocked(data: { subjectId: number; courseId: number | null }) {
  if (data.courseId && data.courseId !== courseId.value) return
  const updated = { ...subjectBlocks.value }
  delete updated[data.subjectId]
  subjectBlocks.value = updated
}

notifStore.onSocketEvent('subject:access-blocked', handleAccessBlocked)
notifStore.onSocketEvent('subject:access-unblocked', handleAccessUnblocked)

onUnmounted(() => {
  notifStore.offSocketEvent('subject:access-blocked', handleAccessBlocked)
  notifStore.offSocketEvent('subject:access-unblocked', handleAccessUnblocked)
})

async function checkCourseDeadline() {
  if (authStore.isAdmin) return // rol 3 siempre puede entrar
  if (!courseId.value) return
  try {
    const course = await courseAdapter.getCourseById(courseId.value)
    const isInactive = course?.isActive === false || course?.is_active === false
    const isExpired = Boolean(course?.deadline) && new Date(course.deadline as string).getTime() < Date.now()
    if (isInactive || isExpired) {
      courseExpired.value = true
      errorMessage.value = isExpired
        ? 'Este curso ha finalizado. Ya no puedes acceder a su contenido.'
        : 'Este curso esta inactivo. Ya no puedes acceder a su contenido.'
    }
  } catch {
    courseExpired.value = true
    errorMessage.value = 'No fue posible validar el acceso al curso.'
  }
}

async function checkAccess() {
  hasCollaboratorAccess.value = false
  hasAccess.value = authStore.isAdmin
  if (authStore.isDocente && !authStore.isAdmin) {
    try {
      // Check if the user is the course creator first — creators see all subjects
      const course = await courseAdapter.getCourseById(courseId.value)
      const currentUserId = Number(authStore.user?.id ?? 0)
      // API may return either camelCase or snake_case field
      const creatorId = Number(course.creatorUserId ?? (course as any).creator_user_id ?? 0)
      const isCourseCreator = currentUserId > 0 && currentUserId === creatorId

      if (isCourseCreator) {
        hasCollaboratorAccess.value = true
        hasAccess.value = true
        canCreate.value = true
        // isCollaboratorOnly stays false — creator must see ALL subjects
        return
      }

      const res = await collaboratorAdapter.checkAccess(courseId.value)
      if (res?.hasAccess) {
        hasCollaboratorAccess.value = true
        hasAccess.value = true
        canCreate.value = true
        // Only restrict to own subjects when we KNOW the user is not the creator.
        // If creatorId could not be determined (0), default to full access to avoid
        // incorrectly hiding subjects from the actual course owner.
        if (creatorId > 0) {
          isCollaboratorOnly.value = true
        }
      }
    } catch { /* silent */ }
  }
  if (authStore.isAdmin) canCreate.value = true
}

function normalizeSubject(s: any): Subject {
  return {
    ...s,
    id: s.id,
    courseId: s.courseId ?? s.course_id ?? 0,
    name: s.name,
    description: s.description ?? '',
    code: s.code ?? null,
    thumbnailUrl: s.thumbnailUrl ?? s.thumbnail_url ?? null,
    orderIndex: s.orderIndex ?? s.order_index ?? 0,
    isActive: s.isActive ?? s.is_active ?? true,
    createdAt: s.createdAt ?? s.created_at ?? null,
    createdBy: s.createdBy ?? s.created_by ?? null,
    blocked: s.blocked ?? false,
    blockReason: s.blockReason ?? s.block_reason ?? null,
  }
}

async function loadSubjects() {
  if (!courseId.value) { loadingSubjects.value = false; return }
  loadingSubjects.value = true
  errorMessage.value = ''
  try {
    const raw: any[] = await subjectAdapter.getSubjectsByCourse(courseId.value)
    allSubjects.value = raw.map(normalizeSubject)
    loadSubjectStats()
  } catch {
    errorMessage.value = 'Error al cargar materias'
  } finally {
    loadingSubjects.value = false
  }
}

async function loadSubjectStats() {
  if (!courseId.value || !allSubjects.value.length) return
  try {
    const [topics, tasks] = await Promise.all([
      topicAdapter.getTopicsByCourse(courseId.value).catch(() => []),
      taskAdapter.getTasksByCourse(courseId.value).catch(() => []),
    ])

    const newStats: Record<number, SubjectStats> = {}
    for (const subject of allSubjects.value) {
      const subjectTopicIds = new Set(
        topics.filter((t: { courseId: number }) => t.courseId === subject.id).map((t: { id: number }) => t.id)
      )
      const subjectTasks = tasks.filter((t: { topicId: number }) => subjectTopicIds.has(t.topicId))
      const taskCount = subjectTasks.length
      newStats[subject.id] = { taskCount, progress: 0 }
    }
    statsMap.value = newStats
  } catch { /* silent */ }
}

async function loadSubjectBlocks() {
  if (authStore.isAdmin || !courseId.value) return
  // Use block info already annotated by backend on each subject
  const map: Record<number, string> = {}
  for (const s of allSubjects.value) {
    if ((s as any).blocked) {
      map[s.id] = (s as any).blockReason || 'Sin motivo especificado'
    }
  }
  if (Object.keys(map).length) {
    subjectBlocks.value = map
    return
  }
  // Fallback: fetch blocks separately
  try {
    const blocks: any[] = await progressAdapter.getMySubjectAccessBlocks(courseId.value)
    for (const b of blocks) {
      map[b.subject_id] = b.reason || 'Sin motivo especificado'
    }
    subjectBlocks.value = map
  } catch { /* silent */ }
}

function navigateToCreate() {
  router.push({ path: '/subjects/create', query: { courseId: String(courseId.value) } })
}

function navigateToDetail(subject: Subject) {
  // Check if subject is blocked for this user
  if (subjectBlocks.value[subject.id]) {
    blockAlert.value = { show: true, reason: subjectBlocks.value[subject.id] }
    return
  }
  // Prevent access when course is expired/inactive for non-admin users
  if (courseExpired.value && !authStore.isAdmin) {
    return
  }
  // Prevent navigation if enrollment is not approved
  if (!enrollmentApproved.value) {
    blockAlert.value = { show: true, reason: 'No tienes acceso a esta materia. Tu matrícula no ha sido aprobada.' }
    return
  }
  router.push({
    path: `/course/${courseId.value}`,
    query: {
      subjectId: String(subject.id),
      subjectName: subject.name,
      subjectDescription: subject.description || '',
      subjectThumbnailUrl: subject.thumbnailUrl || '',
    }
  })
}

function openOptions(subject: Subject) {
  optionsSubject.value = subject
}

function editSubject() {
  if (!optionsSubject.value) return
  const s = optionsSubject.value
  router.push({
    path: '/subjects/create',
    query: {
      courseId: String(courseId.value),
      subjectId: String(s.id),
      subjectName: s.name,
      subjectDescription: s.description || '',
      subjectCode: s.code || '',
      subjectThumbnailUrl: s.thumbnailUrl || '',
    }
  })
  optionsSubject.value = null
}

function confirmDeleteSubject() {
  showDeleteConfirm.value = true
}

async function deleteSubj() {
  if (!optionsSubject.value) return
  try {
    await subjectAdapter.deleteSubject(optionsSubject.value.id)
    showDeleteConfirm.value = false
    optionsSubject.value = null
    await loadSubjects()
  } catch { /* silent */ }
}

onActivated(async () => {
  // Re-verify enrollment on reactivation (e.g. enrollment revoked while away)
  if (requiresEnrollmentApproval.value) {
    try {
      const data: any = await progressAdapter.getEnrollmentStatus(courseId.value)
      const status = extractEnrollmentStatus(data)
      if (status !== 'approved') {
        enrollmentApproved.value = false
        router.replace({ path: '/explore', query: { accessDenied: 'No tienes acceso a este curso.' } })
        return
      }
    } catch { /* silent */ }
  }
  await loadSubjects()
  await loadSubjectBlocks()
})

useSubjectSocket(courseId.value, {
  onCreated(raw) {
    const subject = normalizeSubject(raw)
    if ((subject.courseId || (raw as any).course_id) !== courseId.value) return
    if (!allSubjects.value.find(s => s.id === subject.id)) {
      allSubjects.value = [...allSubjects.value, subject]
      loadSubjectStats()
    }
  },
  onUpdated(raw) {
    const subject = normalizeSubject(raw)
    const idx = allSubjects.value.findIndex(s => s.id === subject.id)
    if (idx !== -1) {
      const updated = [...allSubjects.value]
      updated[idx] = subject
      allSubjects.value = updated
    }
  },
  onDeleted({ id }) {
    allSubjects.value = allSubjects.value.filter(s => s.id !== id)
  },
})
</script>

<style scoped>
.subjects-list { height: 100%; overflow-y: auto; background: var(--bg-primary); padding-bottom: 80px; }

.expired-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px 16px;
  padding: 14px 16px;
  background: rgba(255,69,58,0.1);
  border: 1px solid rgba(255,69,58,0.3);
  border-radius: 12px;
  color: #FF453A;
  font-size: 13px;
  line-height: 1.4;
}
.expired-banner svg { flex-shrink: 0; }

.header-section { padding: 16px; }
.header-top-row { display: flex; align-items: center; gap: 12px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
.header-title { flex: 1; font-size: 22px; font-weight: 700; color: #fff; }
.add-btn { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6A1B9A, #BF5AF2); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.add-btn:hover { transform: scale(1.1); }
.add-btn-placeholder { width: 40px; }
.header-subtitle { font-size: 13px; color: #8E8E93; margin-top: 4px; padding-left: 52px; }

.search-bar-container { padding: 0 16px 8px; }
.search-field { display: flex; align-items: center; gap: 10px; background: #1C1C1E; border-radius: 12px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06); }
.search-field input { flex: 1; background: transparent; border: none; color: #fff; font-size: 15px; outline: none; }
.search-field input::placeholder { color: #8E8E93; }

.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 16px;
}

@media (max-width: 900px) {
  .subjects-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .subjects-grid { grid-template-columns: 1fr; }
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 40px; text-align: center; }
.empty-text { font-size: 15px; color: #8E8E93; }
.empty-add-btn { padding: 10px 24px; border-radius: 12px; background: linear-gradient(135deg, #6A1B9A, #BF5AF2); color: #fff; font-size: 15px; font-weight: 600; }

.fab {
  position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px;
  border-radius: 50%; background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(191,90,242,0.4);
  transition: transform 0.2s;
  z-index: 10;
}
.fab:hover { transform: scale(1.1); }

.bottom-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.bottom-sheet { width: 100%; max-width: 480px; background: #1C1C1E; border-radius: 20px 20px 0 0; padding: 24px 0; }
.sheet-title { font-size: 18px; font-weight: 600; color: #fff; padding: 0 24px 16px; }
.sheet-option { display: block; width: 100%; text-align: left; padding: 14px 24px; font-size: 16px; transition: background 0.15s; }
.sheet-option:hover { background: rgba(255,255,255,0.05); }
.sheet-option.edit { color: #0A84FF; }
.sheet-option.delete { color: #FF453A; }
.sheet-option.cancel { color: #8E8E93; text-align: center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }

.confirm-dialog { background: #1C1C1E; border-radius: 16px; padding: 24px; margin: auto 16px; max-width: 400px; width: 100%; }
.confirm-dialog h3 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.confirm-dialog p { font-size: 14px; color: #8E8E93; line-height: 1.5; margin-bottom: 20px; }
.confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
.cancel-btn { padding: 10px 20px; border-radius: 10px; background: rgba(255,255,255,0.08); color: #fff; font-size: 15px; }
.delete-btn { padding: 10px 20px; border-radius: 10px; background: #FF453A; color: #fff; font-size: 15px; font-weight: 600; }



.block-alert-dialog { text-align: center; }
.block-alert-dialog svg { margin: 0 auto 12px; }
.block-alert-dialog h3 { color: #FF453A; }
.block-reason-text { font-size: 15px; color: #ccc; margin-bottom: 20px; }
.block-alert-dialog .confirm-actions { justify-content: center; }
</style>
