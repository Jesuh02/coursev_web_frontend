<template>
  <div class="explore-view">
    <ExploreHeader
      v-model:search="searchQuery"
      @open-filter="showFilter = true"
    />

    <ExploreSkeleton v-if="courseStore.loading" />

    <div v-else-if="courseStore.courses.length" class="course-grid">
      <TransitionGroup name="card">
        <CourseCard
          v-for="course in courseStore.courses"
          :key="course.id"
          :course="course"
          :creator-name="getCourseCreatorName(course)"
          @click="navigateToCourse(course)"
          @options="canManageCourses ? openCourseOptions($event) : undefined"
        />
      </TransitionGroup>
    </div>

    <EmptyState v-else icon="search" message="No se encontraron cursos" />

    <div v-if="courseStore.loadingMore" class="loading-more">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courseStore'
import { collaboratorAdapter, courseAdapter, userAdapter } from '@/infrastructure/api'
import { extractEnrollmentStatus, progressAdapter } from '@/infrastructure/api/progressAdapter'
import type { Course } from '@/domain/models'
import { useAuthStore } from '@/stores/authStore'
import ExploreHeader from './components/ExploreHeader.vue'
import ExploreSkeleton from './components/ExploreSkeleton.vue'
import CourseCard from './components/CourseCard.vue'
import FilterBottomSheet from './components/FilterBottomSheet.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')
const activeFilter = ref('all')
const showFilter = ref(false)
const courseStore = useCourseStore()
const sentinel = ref<HTMLElement>()
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const optionsCourse = ref<Course | null>(null)
const showDeleteConfirm = ref(false)

const canManageCourses = computed(() => authStore.isAdmin)

const requiresEnrollmentApproval = computed(() => !authStore.hasRole(3))

const accessDeniedMessage = ref(false)
const accessDeniedText = ref('No tienes acceso a este curso.')
const requestingEnrollment = ref(false)
const creatorUsernames = ref<Record<number, string>>({})
let searchRequestId = 0

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
    courseStore.loading = false
    courseStore.loadingMore = false
    return
  }

  if (pageNum === 1) courseStore.loading = true
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
      courseStore.loading = false
      courseStore.loadingMore = false
    }
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

async function requestEnrollmentOnAccessAttempt(course: Course, isRetry = false) {
  if (requestingEnrollment.value) return

  requestingEnrollment.value = true
  try {
    await progressAdapter.requestEnrollment(course.id)
    showAccessMessage(
      isRetry
        ? 'Se envio una nueva solicitud. Un administrador debe aprobar tu acceso al curso.'
        : 'Solicitud enviada. Un administrador debe aprobar tu acceso al curso.',
    )
  } catch {
    showAccessMessage('Error al solicitar acceso. Intenta de nuevo.')
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

  // Usuarios sin rol 3 no pueden acceder a cursos desactivados.
  const isInactive = course.isActive === false || course.is_active === false
  if (isInactive) {
    showAccessMessage('Este curso está desactivado y no está disponible.')
    return
  }

  if (await hasCollaboratorAccess(course.id)) {
    router.push(`/subjects/${course.id}`)
    return
  }

  // Usuarios no admin deben validar su estado de matricula antes de entrar.
  try {
    const data: any = await progressAdapter.getEnrollmentStatus(course.id)
    const status = extractEnrollmentStatus(data)

    if (status === 'approved') {
      router.push(`/subjects/${course.id}`)
    } else if (status === 'pending') {
      showAccessMessage('Tu solicitud de acceso está pendiente de aprobación.')
    } else {
      await requestEnrollmentOnAccessAttempt(course, status === 'rejected')
    }
  } catch {
    await requestEnrollmentOnAccessAttempt(course)
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

watch(searchQuery, (q) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const trimmedQuery = q.trim()
    searchRequestId += 1
    if (trimmedQuery) void runCourseSearch(trimmedQuery)
    else courseStore.fetchCourses()
  }, 400)
})

watch(activeFilter, (filter) => {
  searchQuery.value = ''
  searchRequestId += 1
  courseStore.fetchByFilter(filter)
})

async function resolveStudentCounts(courses: Course[]) {
  const missing = courses.filter(c => c.studentCount === undefined)
  if (!missing.length) return

  const results = await Promise.allSettled(
    missing.map(course => progressAdapter.getEnrolledCount(course.id)),
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const data = result.value as any
      missing[index].studentCount = typeof data === 'number' ? data : (data?.count ?? 0)
    }
  })
}

watch(
  () => courseStore.courses,
  (courses) => {
    void resolveMissingCreatorUsernames(courses)
    void resolveStudentCounts(courses)
  },
  { immediate: true },
)

onMounted(() => {
  courseStore.fetchCourses()
  observer = new IntersectionObserver(
    (entries) => { if (entries[0]?.isIntersecting) loadMore() },
    { rootMargin: '200px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.explore-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
  overflow-y: auto;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
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
</style>
