<template>
  <div class="course-selection">
    <TopBar title="Seleccionar Curso" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar curso..." />

    <div class="course-list">
      <button
        v-for="course in filtered"
        :key="course.id"
        class="course-option"
        @click="select(course)"
      >
        <div class="course-thumb">
          <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)!" alt="" />
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /></svg>
        </div>
        <div class="course-info">
          <p class="course-name">{{ course.title }}</p>
          <p class="course-meta">{{ course.description }}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>

    <EmptyState v-if="!filtered.length" icon="book" message="No hay cursos disponibles" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Course } from '@/domain/models'
import { resolveImageUrl, courseAdapter } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const authStore = useAuthStore()
const search = ref('')
const courses = ref<Course[]>([])

const filtered = computed(() => {
  if (!search.value) return courses.value
  const q = search.value.toLowerCase()
  return courses.value.filter(c => c.title.toLowerCase().includes(q))
})

onMounted(async () => {
  try {
    const userId = authStore.user?.id

    if (authStore.isAdmin) {
      // Rol 3: todos los cursos existentes
      courses.value = await courseAdapter.getCourses()
    } else if (authStore.isDocente) {
      // Rol 2: cursos donde es colaborador/creador + cursos matriculados
      const [manageable, enrolledRes] = await Promise.all([
        courseAdapter.getManageableCourses(userId!),
        courseAdapter.getEnrolledCoursesPaginated(userId),
      ])
      const enrolled: Course[] = enrolledRes.data ?? (enrolledRes as unknown as Course[])
      const seen = new Set<number>()
      courses.value = [...manageable, ...enrolled].filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
    } else {
      // Rol 1: solo cursos en los que está matriculado
      const res = await courseAdapter.getEnrolledCoursesPaginated(userId)
      courses.value = res.data ?? (res as unknown as Course[])
    }
  } catch {
    // silently fail
  }
})

function select(course: Course) {
  router.push(`/subject-selection/${course.id}`)
}
</script>

<style scoped>
.course-selection { min-height: 100vh; background: var(--bg-primary); }
.course-list { padding: 0 16px; }

.course-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.course-thumb {
  width: 56px;
  height: 40px;
  border-radius: 8px;
  background: #242424;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-thumb img { width: 100%; height: 100%; object-fit: cover; }

.course-info { flex: 1; min-width: 0; }
.course-name { font-size: 15px; font-weight: 500; color: #fff; }
.course-meta { font-size: 12px; color: #8E8E93; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
