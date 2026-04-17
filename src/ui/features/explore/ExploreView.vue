<template>
  <div class="explore-view">
    <ExploreHeader
      v-model:search="searchQuery"
      :collapsed="isHeaderCollapsed"
      :active-filter-name="activeFilterLabel"
      :active-filter="activeFilter"
      :user-role="userRole"
      :total-courses="totalCoursesStat"
      :popular-courses="popularCoursesStat"
      :new-courses="newCoursesStat"
      @clear-filter="clearFilter"
      @toggle-collapse="isHeaderCollapsed = !isHeaderCollapsed"
      @quick-filter="applyQuickFilter"
    />

    <ExploreSkeleton v-if="showInitialSkeleton" />

    <div v-else-if="courseStore.courses.length" class="course-grid">
      <TransitionGroup name="card">
        <CourseCard
          v-for="course in courseStore.courses"
          :key="course.id"
          :course="course"
          :creator-name="getCourseCreatorName(course)"
          :teacher-count="teacherCounts[course.id]"
          @click="navigateToCourse(course)"
          @options="canManageCourses ? openCourseOptions($event) : undefined"
          @info="openInfoDialog($event)"
        />
      </TransitionGroup>
    </div>

    <EmptyState v-else icon="search" message="No se encontraron cursos" />

    <div v-if="isInteractiveLoading" class="loading-more">
      <div class="spinner" />
    </div>

    <div ref="sentinel" class="sentinel" />

    <!-- Mensaje de acceso denegado para usuarios que requieren aprobacion -->
    <Transition name="fade">
      <div v-if="accessDeniedMessage" class="access-denied-toast">
        {{ accessDeniedText }}
      </div>
    </Transition>

    <FilterBottomSheet
      v-model="showFilter"
      :active="activeFilter"
      @select="activeFilter = $event"
    />

    <!-- Bottom sheet de opciones del curso -->
    <Teleport to="body">
      <div v-if="optionsCourse" class="bottom-sheet-overlay" @click="optionsCourse = null">
        <div class="bottom-sheet" @click.stop>
          <h3 class="sheet-title">{{ optionsCourse.title }}</h3>
          <button class="sheet-option edit" @click="editCourse">Editar curso</button>
          <button class="sheet-option delete" @click="confirmDeleteCourse">Eliminar curso</button>
          <button class="sheet-option cancel" @click="optionsCourse = null">Cancelar</button>
        </div>
      </div>
    </Teleport>

    <!-- Diálogo de confirmación de eliminación -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="bottom-sheet-overlay" @click="showDeleteConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <h3>Eliminar curso</h3>
          <p>¿Estás seguro de eliminar "{{ optionsCourse?.title }}"? Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button class="cancel-btn" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="delete-btn" @click="deleteCourse">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Diálogo de participantes del curso -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="infoVisible" class="info-overlay" @click="infoVisible = false">
          <div class="info-dialog" @click.stop>
            <div class="info-dialog-header">
              <span class="info-dialog-title">{{ infoCourse?.title }}</span>
              <button class="info-close-btn" @click="infoVisible = false" aria-label="Cerrar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div v-if="infoLoading" class="info-loading">
              <div class="info-spinner" />
            </div>
            <div v-else class="info-dialog-body">
              <div class="info-section">
                <div class="info-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  <span class="info-section-label">Docentes</span>
                  <span class="info-section-count">{{ infoTeachers.length }}</span>
                </div>
                <p v-if="!infoTeachers.length" class="info-empty">Sin docentes asignados</p>
                <ul v-else class="info-list">
                  <li v-for="t in infoTeachers" :key="t.id" class="info-item">
                    <span class="info-item-main">{{ t.name }}</span>
                    <span v-if="t.username" class="info-item-sub">@{{ t.username }}</span>
                  </li>
                </ul>
              </div>
              <div class="info-divider" />
              <div class="info-section">
                <div class="info-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span class="info-section-label">Estudiantes</span>
                  <span class="info-section-count">{{ infoStudents.length }}</span>
                </div>
                <p v-if="!infoStudents.length" class="info-empty">Sin estudiantes registrados</p>
                <ul v-else class="info-list">
                  <li v-for="s in infoStudents" :key="s.userId" class="info-item">
                    <span class="info-item-main">{{ s.name }}</span>
                    <span v-if="s.username" class="info-item-sub">@{{ s.username }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ⋮ Menú reporte/boletín plataforma (solo rol 3) -->
    <Teleport to="body">
      <div v-if="userRole === 3" class="platform-more-menu">
        <Transition name="fade">
          <div v-if="showMoreMenu" class="platform-more-dropdown" @click.stop>
            <button class="platform-more-option" @click="showMoreMenu = false; showPlatformReport = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Reporte de notas
            </button>
            <button class="platform-more-option" @click="showMoreMenu = false; showBulletin = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Generar boletín
            </button>

          </div>
        </Transition>
        <button
          class="platform-more-btn"
          :class="{ 'platform-more-btn--open': showMoreMenu }"
          title="Opciones de reportes"
          @click.stop="showMoreMenu = !showMoreMenu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
    </Teleport>

    <!-- Modales plataforma -->
    <PlatformGradeReportModal v-model="showPlatformReport" />
    <ExploreBulletinModal v-model="showBulletin" />


    <!-- Role selection dialog for docente users -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="roleDialogVisible" class="role-dialog-overlay" @click.self="roleDialogVisible = false">
          <div class="role-dialog">
            <h3 class="role-dialog-title">¿Cómo deseas ingresar?</h3>
            <p class="role-dialog-desc">Selecciona el rol con el que deseas solicitar acceso a este curso.</p>
            <div class="role-dialog-options">
              <button class="role-option role-option--student" @click="onRoleDialogSelect('student')">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20"/></svg>
                <span class="role-option-label">Estudiante</span>
                <span class="role-option-desc">Acceder al contenido como estudiante</span>
              </button>
              <button class="role-option role-option--docente" @click="onRoleDialogSelect('docente')">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                <span class="role-option-label">Docente</span>
                <span class="role-option-desc">Crear materias y gestionar contenido</span>
              </button>
            </div>
            <button class="role-dialog-cancel" @click="roleDialogVisible = false">Cancelar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCourseStore } from '@/stores/courseStore'
import { collaboratorAdapter, courseAdapter, userAdapter } from '@/infrastructure/api'
import { subjectCollaboratorAdapter } from '@/infrastructure/api/subjectAdapter'
import { subjectAdapter } from '@/infrastructure/api'
import { extractEnrollmentStatus, progressAdapter } from '@/infrastructure/api/progressAdapter'
import type { Course } from '@/domain/models'
import { useAuthStore } from '@/stores/authStore'
import { useCourseSocket } from '@/composables/useCourseSocket'
import ExploreHeader from './components/ExploreHeader.vue'
import ExploreSkeleton from './components/ExploreSkeleton.vue'
import CourseCard from './components/CourseCard.vue'
import FilterBottomSheet from './components/FilterBottomSheet.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'
import PlatformGradeReportModal from './components/PlatformGradeReportModal.vue'
import ExploreBulletinModal from './components/ExploreBulletinModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const searchQuery = ref('')
const activeFilter = ref('all')
const showFilter = ref(false)
const courseStore = useCourseStore()
const sentinel = ref<HTMLElement>()
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let suppressEmptySearchRefresh = false

const optionsCourse = ref<Course | null>(null)
const showDeleteConfirm = ref(false)
const isHeaderCollapsed = ref(true)
const showPlatformReport = ref(false)
const showBulletin = ref(false)

const showMoreMenu = ref(false)
const searchPending = ref(false)
const filterPending = ref(false)

// ── Teacher counts (collaborators per course) ─────────────────────────────
const teacherCounts = ref<Record<number, number>>({})

// ── Info dialog ───────────────────────────────────────────────────────────
const infoVisible = ref(false)
const infoCourse = ref<Course | null>(null)
const infoLoading = ref(false)
const infoTeachers = ref<{ id: number; name: string; username: string | null }[]>([])
const infoStudents = ref<{ userId: number; name: string; username: string | null }[]>([])

const canManageCourses = computed(() => authStore.isAdmin)
const userRole = computed(() => {
  const roles = authStore.user?.roles ?? []
  if (roles.some(r => r.id === 4)) return 3
  if (roles.some(r => r.id === 3)) return 3
  if (roles.some(r => r.id === 2)) return 2
  return 1
})
const activeFilterLabel = computed(() => {
  const labels: Record<string, string> = {
    all: '',
    enrolled: 'Mis inscripciones',
    created: 'Mis Cursos',
    others: 'Cursos de otros',
    popular: 'Mas populares',
    new: 'Nuevos',
  }
  return labels[activeFilter.value] || null
})

const showInitialSkeleton = computed(() =>
  courseStore.loading && courseStore.courses.length === 0 && !searchQuery.value.trim(),
)

const isInteractiveLoading = computed(() =>
  searchPending.value || filterPending.value || courseStore.loadingMore,
)

const totalCoursesStat = computed(() => {
  const counts = courseStore.filterCounts || {}
  return Number(counts.all ?? counts.total ?? courseStore.courses.length ?? 0)
})

const popularCoursesStat = computed(() => {
  const counts = courseStore.filterCounts || {}
  if (Number.isFinite(Number(counts.popular))) return Number(counts.popular)
  return courseStore.courses.filter((course) => Number(course.studentCount ?? 0) > 0).length
})

const newCoursesStat = computed(() => {
  const counts = courseStore.filterCounts || {}
  if (Number.isFinite(Number(counts.new))) return Number(counts.new)
  const recentThreshold = Date.now() - 1000 * 60 * 60 * 24 * 30
  return courseStore.courses.filter((course) => {
    const rawDate = (course as any).createdAt ?? (course as any).created_at ?? (course as any).timestamp
    const parsed = rawDate ? new Date(rawDate).getTime() : NaN
    return Number.isFinite(parsed) && parsed >= recentThreshold
  }).length
})

const requiresEnrollmentApproval = computed(() => !authStore.hasRole(3) && !authStore.hasRole(4))

const accessDeniedMessage = ref(false)
const accessDeniedText = ref('No tienes acceso a este curso.')
const requestingEnrollment = ref(false)
const creatorUsernames = ref<Record<number, string>>({})
let searchRequestId = 0

// ── Role selection dialog for docente users ──
const isDocenteUser = computed(() => authStore.hasRole(2))
const roleDialogVisible = ref(false)
const roleDialogCourse = ref<Course | null>(null)
const roleDialogRetry = ref(false)

function showRoleDialog(course: Course, isRetry = false) {
  roleDialogCourse.value = course
  roleDialogRetry.value = isRetry
  roleDialogVisible.value = true
}

async function onRoleDialogSelect(role: 'student' | 'docente') {
  roleDialogVisible.value = false
  const course = roleDialogCourse.value
  if (!course) return
  await requestEnrollmentOnAccessAttempt(course, roleDialogRetry.value, role)
}

function mergeUniqueCourses(...courseLists: Course[][]) {
  const merged = new Map<number, Course>()

  for (const courseList of courseLists) {
    for (const course of courseList) {
      merged.set(course.id, course)
    }
  }

  return Array.from(merged.values())
}

function isNumericQuery(query: string) {
  return /^\d+$/.test(query.trim())
}

async function searchCoursesByCreatorIdentity(query: string) {
  const users = await userAdapter.searchUsers(query)
  const creatorIds = Array.from(new Set(
    users
      .map((user) => Number(user.id))
      .filter((id) => id > 0),
  ))

  if (!creatorIds.length) return []

  const creatorCourseResults = await Promise.allSettled(
    creatorIds.map((creatorId) => courseAdapter.getCoursesByCreatorId(creatorId)),
  )

  return mergeUniqueCourses(
    ...creatorCourseResults.map((result) => result.status === 'fulfilled' ? result.value : []),
  )
}

async function runCourseSearch(query: string, pageNum = 1, limit = 20) {
  const trimmedQuery = query.trim()
  const requestId = ++searchRequestId

  if (!trimmedQuery) {
    searchPending.value = false
    courseStore.loadingMore = false
    return
  }

  if (pageNum === 1) searchPending.value = true
  else courseStore.loadingMore = true

  try {
    const directResult = await courseAdapter.searchCourses(trimmedQuery, pageNum, limit)
    let creatorMatches: Course[] = []

    if (pageNum === 1 && (isNumericQuery(trimmedQuery) || !directResult.data.length)) {
      try {
        creatorMatches = await searchCoursesByCreatorIdentity(trimmedQuery)
      } catch {
        creatorMatches = []
      }
    }

    if (requestId !== searchRequestId) return

    const mergedPage = mergeUniqueCourses(directResult.data, creatorMatches)

    if (pageNum === 1) {
      courseStore.courses = mergedPage
    } else {
      courseStore.courses = mergeUniqueCourses(courseStore.courses, mergedPage)
    }

    courseStore.page = pageNum
    courseStore.hasMore = creatorMatches.length === 0 && (directResult.pagination?.hasNext ?? false)
  } finally {
    if (requestId === searchRequestId) {
      searchPending.value = false
      courseStore.loadingMore = false
    }
  }
}

async function refreshCurrentFilter(filter = activeFilter.value) {
  const requestId = ++searchRequestId

  if (filter === 'all') {
    searchPending.value = false
    filterPending.value = false
    await courseStore.fetchCourses(1, 20, requestId)
    return
  }

  filterPending.value = true

  try {
    if (filter === 'popular' || filter === 'new') {
      await courseStore.fetchByFilter('all', requestId)
      if (requestId !== searchRequestId) return

      const baseCourses = [...courseStore.courses]
      if (filter === 'popular') {
        courseStore.courses = baseCourses
          .sort((a, b) => Number(b.studentCount ?? 0) - Number(a.studentCount ?? 0))
          .slice(0, 12)
      } else {
        courseStore.courses = baseCourses
          .sort((a, b) => {
            const aDate = new Date((a as any).createdAt ?? (a as any).created_at ?? (a as any).timestamp ?? 0).getTime()
            const bDate = new Date((b as any).createdAt ?? (b as any).created_at ?? (b as any).timestamp ?? 0).getTime()
            return bDate - aDate
          })
          .slice(0, 12)
      }
      courseStore.page = 1
      courseStore.hasMore = false
      return
    }

    await courseStore.fetchByFilter(filter, requestId)
  } finally {
    if (requestId === searchRequestId) filterPending.value = false
  }
}

function getCourseCreatorName(course: Course) {
  const embeddedName = course.creatorUsername ?? course.creator_username
  if (typeof embeddedName === 'string' && embeddedName.trim()) {
    return embeddedName.trim()
  }

  const creatorId = Number(course.creatorUserId ?? course.creator_user_id ?? 0)
  if (creatorId <= 0) return null

  return creatorUsernames.value[creatorId] ?? null
}

async function resolveMissingCreatorUsernames(courses: Course[]) {
  const missingCreatorIds = Array.from(new Set(
    courses
      .filter((course) => {
        const creatorId = Number(course.creatorUserId ?? course.creator_user_id ?? 0)
        return creatorId > 0 && !getCourseCreatorName(course)
      })
      .map((course) => Number(course.creatorUserId ?? course.creator_user_id ?? 0)),
  ))

  if (!missingCreatorIds.length) return

  try {
    const users = await userAdapter.getUsersByIds(missingCreatorIds)
    if (!users.length) return

    creatorUsernames.value = {
      ...creatorUsernames.value,
      ...Object.fromEntries(
        users
          .filter((user) => Number(user.id) > 0 && user.username)
          .map((user) => [Number(user.id), user.username]),
      ),
    }
  } catch {
    /* silent */
  }
}

function showAccessMessage(message: string) {
  accessDeniedText.value = message
  accessDeniedMessage.value = true
  setTimeout(() => { accessDeniedMessage.value = false }, 3000)
}

async function requestEnrollmentOnAccessAttempt(course: Course, isRetry = false, requestedRole: 'student' | 'docente' = 'student') {
  if (requestingEnrollment.value) return

  requestingEnrollment.value = true
  try {
    await progressAdapter.requestEnrollment(course.id, requestedRole)
    const roleSuffix = requestedRole === 'docente' ? ' como docente' : ''
    showAccessMessage(
      isRetry
        ? `Se envio una nueva solicitud${roleSuffix}. Un administrador debe aprobar tu acceso al curso.`
        : `Solicitud enviada${roleSuffix}. Un administrador debe aprobar tu acceso al curso.`,
    )
  } catch (err: any) {
    const msg = err?.message || ''
    if (msg.toLowerCase().includes('desactivado') || msg.toLowerCase().includes('inactivo')) {
      showAccessMessage('Tu acceso a este curso fue desactivado por el administrador.')
    } else {
      showAccessMessage('Error al solicitar acceso. Intenta de nuevo.')
    }
  } finally {
    requestingEnrollment.value = false
  }
}

async function hasCollaboratorAccess(courseId: number) {
  try {
    const access = await collaboratorAdapter.checkAccess(courseId)
    return Boolean(access?.hasAccess)
  } catch {
    return false
  }
}

async function navigateToCourse(course: Course) {
  // Solo administracion (rol 3) puede omitir la validacion de matricula y acceder a cursos desactivados.
  if (!requiresEnrollmentApproval.value) {
    router.push(`/subjects/${course.id}`)
    return
  }

  // Colaboradores tienen acceso directo sin importar estado del curso ni matricula.
  if (await hasCollaboratorAccess(course.id)) {
    router.push(`/subjects/${course.id}`)
    return
  }

  // Usuarios sin rol 3 ni acceso de colaborador no pueden acceder a cursos desactivados.
  const isInactive = course.isActive === false || course.is_active === false
  if (isInactive) {
    showAccessMessage('Este curso está desactivado y no está disponible.')
    return
  }

  // Usuarios no admin deben validar su estado de matricula antes de entrar.
  try {
    const data: any = await progressAdapter.getEnrollmentStatus(course.id)
    const status = extractEnrollmentStatus(data)

    if (status === 'approved') {
      router.push(`/subjects/${course.id}`)
    } else if (status === 'inactivo') {
      showAccessMessage('Tu acceso a este curso fue desactivado por el administrador.')
    } else if (status === 'pending') {
      showAccessMessage('Tu solicitud de acceso está pendiente de aprobación.')
    } else if (status === 'revoked') {
      showAccessMessage('Tu acceso a este curso fue revocado por el administrador.')
    } else {
      // null/rejected/unknown: verificar si el usuario está matriculado (invitado)
      // antes de solicitar matrícula nueva.
      try {
        const enrolledData: any = await progressAdapter.isEnrolled(course.id)
        if (enrolledData === true || enrolledData?.isEnrolled === true) {
          router.push(`/subjects/${course.id}`)
          return
        }
      } catch { /* fallthrough */ }
      // Show role dialog for docente users, otherwise request directly
      if (isDocenteUser.value) {
        showRoleDialog(course, status === 'rejected')
      } else {
        await requestEnrollmentOnAccessAttempt(course, status === 'rejected')
      }
    }
  } catch {
    // Si getEnrollmentStatus falla, verificar isEnrolled como fallback
    try {
      const enrolledData: any = await progressAdapter.isEnrolled(course.id)
      if (enrolledData === true || enrolledData?.isEnrolled === true) {
        router.push(`/subjects/${course.id}`)
        return
      }
    } catch { /* fallthrough */ }
    if (isDocenteUser.value) {
      showRoleDialog(course)
    } else {
      await requestEnrollmentOnAccessAttempt(course)
    }
  }
}

function openCourseOptions(course: Course) {
  if (!canManageCourses.value) return
  optionsCourse.value = course
}

function editCourse() {
  if (!optionsCourse.value) return
  router.push(`/course/${optionsCourse.value.id}/edit`)
  optionsCourse.value = null
}

function confirmDeleteCourse() {
  showDeleteConfirm.value = true
}

async function deleteCourse() {
  if (!optionsCourse.value) return
  const deletedId = optionsCourse.value.id
  try {
    await courseAdapter.deleteCourse(deletedId)
    courseStore.courses = courseStore.courses.filter(c => c.id !== deletedId)
    showDeleteConfirm.value = false
    optionsCourse.value = null
  } catch { /* silent */ }
}

function loadMore() {
  if (courseStore.loading || courseStore.loadingMore || !courseStore.hasMore) return
  const nextPage = courseStore.page + 1
  if (searchQuery.value.trim()) {
    void runCourseSearch(searchQuery.value.trim(), nextPage)
  } else if (activeFilter.value === 'all') {
    courseStore.fetchCourses(nextPage)
  }
}

function clearFilter() {
  if (activeFilter.value !== 'all') {
    activeFilter.value = 'all'
    return
  }

  searchQuery.value = ''
  searchPending.value = false
  filterPending.value = false
  void refreshCurrentFilter('all')
}

function applyQuickFilter(filterKey: string) {
  activeFilter.value = filterKey
}

watch(searchQuery, (q) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const trimmedQuery = q.trim()
    if (trimmedQuery) void runCourseSearch(trimmedQuery)
    else if (suppressEmptySearchRefresh) suppressEmptySearchRefresh = false
    else void refreshCurrentFilter(activeFilter.value)
  }, 400)
})

watch(activeFilter, (filter) => {
  suppressEmptySearchRefresh = Boolean(searchQuery.value)
  if (searchQuery.value) searchQuery.value = ''
  void refreshCurrentFilter(filter)
})

/**
 * Resuelve en paralelo el conteo de docentes y el conteo de estudiantes para cada curso,
 * usando la misma fuente que el diálogo de info (getGuests + collaborators) para
 * garantizar que ambos números sean siempre consistentes: los colaboradores se muestran
 * en la sección de docentes y quedan excluidos del conteo de estudiantes.
 */
async function resolveParticipantCounts(courses: Course[]) {
  const missing = courses.filter(c =>
    c.studentCount === undefined || teacherCounts.value[c.id] === undefined,
  )
  if (!missing.length) return

  const results = await Promise.allSettled(
    missing.map(c => Promise.all([
      collaboratorAdapter.getByCourse(c.id),
      courseAdapter.getGuests(c.id),
      // Fetch subject collaborators to include them as teachers
      subjectAdapter.getSubjectsByCourse(c.id).then(async (subjects) => {
        const allSubjectCollabIds = new Set<number>()
        await Promise.allSettled(
          subjects.map(async (s) => {
            const collabs = await subjectCollaboratorAdapter.getCollaborators(s.id)
            collabs.forEach(sc => allSubjectCollabIds.add(sc.userId))
          }),
        )
        return allSubjectCollabIds
      }).catch(() => new Set<number>()),
    ])),
  )

  results.forEach((result, index) => {
    const course = missing[index]
    if (result.status === 'fulfilled') {
      const [collaborators, guests, subjectCollabIds] = result.value
      const courseCollabIds = new Set(collaborators.map(c => c.userId))
      // Merge course + subject collaborators for teacher count
      const allTeacherIds = new Set([...courseCollabIds, ...subjectCollabIds])
      teacherCounts.value[course.id] = allTeacherIds.size
      course.studentCount = guests.filter(g => !allTeacherIds.has(g.userId)).length
    } else {
      teacherCounts.value[course.id] = teacherCounts.value[course.id] ?? 0
    }
  })
}

async function openInfoDialog(course: Course) {
  infoCourse.value = course
  infoVisible.value = true
  infoLoading.value = true
  infoTeachers.value = []
  infoStudents.value = []
  try {
    const [collabsRes, guestsRes, subjectsRes] = await Promise.allSettled([
      collaboratorAdapter.getByCourse(course.id),
      courseAdapter.getGuests(course.id),
      subjectAdapter.getSubjectsByCourse(course.id),
    ])
    const collaborators = collabsRes.status === 'fulfilled' ? collabsRes.value : []
    const guests = guestsRes.status === 'fulfilled' ? guestsRes.value : []
    const subjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value : []

    // Fetch subject collaborators in parallel
    let subjectCollabUsers: Array<{ userId: number; username: string | null }> = []
    if (subjects.length) {
      const scResults = await Promise.allSettled(
        subjects.map(s => subjectCollaboratorAdapter.getCollaborators(s.id)),
      )
      for (const scRes of scResults) {
        if (scRes.status === 'fulfilled') {
          for (const sc of scRes.value) {
            subjectCollabUsers.push({ userId: sc.userId, username: sc.user?.username ?? null })
          }
        }
      }
    }

    const allTeacherUserIds = new Set([
      ...collaborators.map(c => Number(c.userId)).filter(id => id > 0),
      ...subjectCollabUsers.map(sc => sc.userId).filter(id => id > 0),
    ])
    const participantIds = Array.from(new Set([
      ...allTeacherUserIds,
      ...guests.map(g => Number(g.userId)).filter(id => id > 0),
    ]))

    let usersById = new Map<number, any>()
    if (participantIds.length) {
      try {
        const users = await userAdapter.getUsersByIds(participantIds)
        usersById = new Map(users.map(user => [Number(user.id), user]))
      } catch {
        usersById = new Map()
      }
    }

    const resolveParticipantName = (userId: number, username?: string | null) => {
      const user = usersById.get(userId)
      const nombres = user?.persona?.nombres?.trim?.() ?? ''
      const apellidos = user?.persona?.apellidos?.trim?.() ?? ''
      const fullName = [nombres, apellidos].filter(Boolean).join(' ').trim()
      return {
        name: fullName || username || `Usuario #${userId}`,
        username: username && username !== fullName ? username : null,
      }
    }

    // Build teachers list: course collaborators + subject collaborators (deduped)
    const teacherMap = new Map<number, { id: number; name: string; username: string | null }>()
    for (const c of collaborators) {
      if (!c.user) continue
      const resolved = resolveParticipantName(c.userId, c.user.username)
      teacherMap.set(c.userId, { id: c.userId, name: resolved.name, username: resolved.username })
    }
    for (const sc of subjectCollabUsers) {
      if (teacherMap.has(sc.userId)) continue
      const resolved = resolveParticipantName(sc.userId, sc.username)
      teacherMap.set(sc.userId, { id: sc.userId, name: resolved.name, username: resolved.username })
    }
    infoTeachers.value = Array.from(teacherMap.values())

    if (guestsRes.status === 'fulfilled') {
      infoStudents.value = guests
        .filter(g => !allTeacherUserIds.has(g.userId))
        .map((g) => {
          const resolved = resolveParticipantName(g.userId, g.username)
          return { userId: g.userId, name: resolved.name, username: resolved.username }
        })
    }
  } finally {
    infoLoading.value = false
  }
}

watch(
  () => courseStore.courses,
  (courses) => {
    void resolveMissingCreatorUsernames(courses)
    void resolveParticipantCounts(courses)
  },
  { immediate: true },
)

// Real-time course updates via WebSocket — updates the catalogue without full refetch
useCourseSocket({
  onCreated(course) {
    if (!courseStore.courses.find(c => c.id === course.id)) {
      courseStore.courses = [course, ...courseStore.courses]
    }
  },
  onUpdated(course) {
    const idx = courseStore.courses.findIndex(c => c.id === course.id)
    if (idx !== -1) courseStore.courses[idx] = course
  },
  onDeleted({ id }) {
    courseStore.courses = courseStore.courses.filter(c => c.id !== id)
  },
})

function closeMoreMenu() { showMoreMenu.value = false }

onMounted(() => {
  document.addEventListener('click', closeMoreMenu)
  // Show access denied message from redirect (e.g., revoked enrollment)
  const denied = route.query.accessDenied
  if (denied && typeof denied === 'string') {
    showAccessMessage(denied)
    router.replace({ query: {} })
  }

  courseStore.fetchCourses()
  courseStore.fetchFilterCounts(authStore.user?.id)
  observer = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadMore() },
    { rootMargin: '200px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('click', closeMoreMenu)
})
</script>

<style scoped>
.explore-view {
  flex: 1;
  min-height: 0;
  background:
    radial-gradient(130% 120% at 10% 0%, rgba(88, 142, 255, 0.12), transparent 48%),
    radial-gradient(120% 120% at 92% 4%, rgba(178, 126, 255, 0.12), transparent 46%),
    var(--bg-primary);
  padding-bottom: 80px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 16px;
}

@media (max-width: 900px) {
  .course-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .course-grid { grid-template-columns: 1fr; }
}

.card-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.card-move { transition: transform 0.3s ease; }

.loading-more {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--purple-light);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.sentinel { height: 1px; }

.bottom-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 16px; }
.bottom-sheet { width: 100%; max-width: 480px; background: #1C1C1E; border-radius: 20px; padding: 24px 0; }
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

.access-denied-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #FF453A;
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  z-index: 200;
  text-align: center;
  max-width: 90%;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Info dialog */
.info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.info-dialog {
  background: rgba(28, 28, 30, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.info-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.info-dialog-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 260px;
}

.info-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  flex-shrink: 0;
  transition: background 0.15s;
}

.info-close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.info-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.info-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-top-color: var(--purple-light, #BF5AF2);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.info-dialog-body {
  padding: 0 0 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.info-section {
  padding: 14px 20px 10px;
}

.info-section-header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}

.info-section-header svg {
  color: #8E8E93;
  flex-shrink: 0;
}

.info-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8E8E93;
}

.info-section-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.07);
  color: #8E8E93;
  padding: 2px 8px;
  border-radius: 10px;
}

.info-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 20px;
}

.info-empty {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
  margin: 0;
}

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item-main {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.info-item-sub {
  font-size: 12px;
  color: #8E8E93;
}

/* ── Menú ⋮ reportes plataforma ── */
.platform-more-menu {
  position: fixed;
  bottom: 88px;
  right: 20px;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.platform-more-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  color: #fff;
  box-shadow: 0 4px 18px rgba(191, 90, 242, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.platform-more-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(191, 90, 242, 0.55);
}
.platform-more-btn:active { transform: scale(0.95); }
.platform-more-btn--open { background: linear-gradient(135deg, #BF5AF2, #6A1B9A); }

.platform-more-dropdown {
  position: absolute;
  bottom: 56px;
  right: 0;
  min-width: 210px;
  background: #2C2C2E;
  border-radius: 14px;
  padding: 6px 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.platform-more-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  text-align: left;
  transition: background 0.15s;
}
.platform-more-option:hover { background: rgba(255, 255, 255, 0.06); }
.platform-more-option svg { flex-shrink: 0; color: #BF5AF2; }

@media (max-width: 560px) {
  .platform-more-menu { bottom: 80px; right: 14px; }
}

/* ── Role selection dialog ── */
.role-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}
.role-dialog {
  background: rgba(28, 28, 30, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  padding: 28px 24px 20px;
  text-align: center;
}
.role-dialog-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 6px; }
.role-dialog-desc { font-size: 14px; color: #8E8E93; margin: 0 0 20px; line-height: 1.4; }
.role-dialog-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  transition: background 0.2s, border-color 0.2s;
  cursor: pointer;
}
.role-option:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.15); }
.role-option--student:hover { border-color: #0A84FF; }
.role-option--docente:hover { border-color: #BF5AF2; }
.role-option--student svg { color: #0A84FF; }
.role-option--docente svg { color: #BF5AF2; }
.role-option-label { font-size: 16px; font-weight: 600; color: #fff; }
.role-option-desc { font-size: 12px; color: #8E8E93; }
.role-dialog-cancel {
  font-size: 15px;
  color: #8E8E93;
  padding: 10px 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  width: 100%;
  transition: background 0.15s;
}
.role-dialog-cancel:hover { background: rgba(255, 255, 255, 0.1); }
</style>
