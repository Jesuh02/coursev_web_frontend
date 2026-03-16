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

    <!-- Mensaje de acceso denegado para rol 1 -->
    <Transition name="fade">
      <div v-if="accessDeniedMessage" class="access-denied-toast">
        {{ accessDeniedText }}
      </div>
    </Transition>

    <!-- Bottom sheet de solicitar acceso -->
    <Teleport to="body">
      <div v-if="enrollmentCourse" class="bottom-sheet-overlay" @click="enrollmentCourse = null">
        <div class="bottom-sheet" @click.stop>
          <h3 class="sheet-title">{{ enrollmentCourse.title }}</h3>
          <p style="padding: 0 24px 16px; color: #8E8E93; font-size: 14px;">Para acceder a este curso necesitas la aprobación de un administrador.</p>
          <button class="sheet-option edit" :disabled="requestingEnrollment" @click="requestCourseEnrollment">
            {{ requestingEnrollment ? 'Enviando...' : 'Solicitar Acceso' }}
          </button>
          <button class="sheet-option cancel" @click="enrollmentCourse = null">Cancelar</button>
        </div>
      </div>
    </Teleport>

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
import { courseAdapter } from '@/infrastructure/api'
import { progressAdapter } from '@/infrastructure/api/progressAdapter'
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

const isRole1Only = computed(() =>
  authStore.hasRole(1) && !authStore.hasRole(2) && !authStore.hasRole(3)
)

const accessDeniedMessage = ref(false)
const accessDeniedText = ref('No tienes acceso a este curso.')
const enrollmentCourse = ref<Course | null>(null)
const requestingEnrollment = ref(false)

async function navigateToCourse(course: Course) {
  // Role 2/3 can always access
  if (!isRole1Only.value) {
    router.push(`/subjects/${course.id}`)
    return
  }

  // Role 1: check enrollment status
  try {
    const data: any = await progressAdapter.getEnrollmentStatus(course.id)
    const status = data?.enrollmentStatus ?? data?.enrollment_status ?? null

    if (status === 'activo') {
      router.push(`/subjects/${course.id}`)
    } else if (status === 'pendiente_aprobacion') {
      accessDeniedText.value = 'Tu solicitud de acceso está pendiente de aprobación.'
      accessDeniedMessage.value = true
      setTimeout(() => { accessDeniedMessage.value = false }, 3000)
    } else if (status === 'rechazado') {
      accessDeniedText.value = 'Tu solicitud fue rechazada. Contacta al administrador.'
      accessDeniedMessage.value = true
      setTimeout(() => { accessDeniedMessage.value = false }, 3000)
    } else {
      // No enrollment yet — show dialog to request
      enrollmentCourse.value = course
    }
  } catch {
    enrollmentCourse.value = course
  }
}

async function requestCourseEnrollment() {
  if (!enrollmentCourse.value) return
  requestingEnrollment.value = true
  try {
    await progressAdapter.requestEnrollment(enrollmentCourse.value.id)
    enrollmentCourse.value = null
    accessDeniedText.value = 'Solicitud enviada. Un administrador debe aprobar tu acceso.'
    accessDeniedMessage.value = true
    setTimeout(() => { accessDeniedMessage.value = false }, 3000)
  } catch {
    accessDeniedText.value = 'Error al solicitar acceso. Intenta de nuevo.'
    accessDeniedMessage.value = true
    setTimeout(() => { accessDeniedMessage.value = false }, 3000)
  } finally {
    requestingEnrollment.value = false
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
  try {
    await courseAdapter.deleteCourse(optionsCourse.value.id)
    showDeleteConfirm.value = false
    optionsCourse.value = null
    courseStore.fetchCourses()
  } catch { /* silent */ }
}

function loadMore() {
  if (courseStore.loading || courseStore.loadingMore || !courseStore.hasMore) return
  const nextPage = courseStore.page + 1
  if (searchQuery.value.trim()) {
    courseStore.searchCourses(searchQuery.value.trim(), nextPage)
  } else if (activeFilter.value === 'all') {
    courseStore.fetchCourses(nextPage)
  }
}

watch(searchQuery, (q) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (q.trim()) courseStore.searchCourses(q.trim())
    else courseStore.fetchCourses()
  }, 400)
})

watch(activeFilter, (filter) => {
  searchQuery.value = ''
  courseStore.fetchByFilter(filter)
})

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
