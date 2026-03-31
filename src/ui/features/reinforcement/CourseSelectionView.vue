<template>
  <div class="course-selection">
    <TopBar title="Seleccionar Curso" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar curso..." />

    <div v-if="loading" class="loading-center">
      <div class="spinner" />
    </div>

    <template v-else>
      <div class="course-list">
        <button
          v-for="(course, i) in filtered"
          :key="course.id"
          class="course-option"
          :style="{ animationDelay: `${i * 55}ms` }"
          @click="select(course)"
        >
          <div class="course-thumb">
            <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)!" alt="" />
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4" ry="4" /></svg>
          </div>
          <div class="course-info">
            <p class="course-name">{{ course.title }}</p>
            <p class="course-meta">{{ course.description }}</p>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <EmptyState v-if="!filtered.length" icon="book" message="No hay cursos disponibles" />
    </template>
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
const loading = ref(false)

const filtered = computed(() => {
  if (!search.value) return courses.value
  const q = search.value.toLowerCase()
  return courses.value.filter(c => c.title.toLowerCase().includes(q))
})

onMounted(async () => {
  loading.value = true
  try {
    const userId = authStore.user?.id

    if (authStore.isAdmin) {
      courses.value = await courseAdapter.getCourses()
    } else if (authStore.isDocente) {
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
      const res = await courseAdapter.getEnrolledCoursesPaginated(userId)
      courses.value = res.data ?? (res as unknown as Course[])
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})

function select(course: Course) {
  router.push(`/subject-selection/${course.id}`)
}
</script>

<style scoped>
.course-selection { min-height: 100vh; background: var(--bg-primary); }

/* ── Search section spacing ── */
.course-list { padding: 8px 16px 32px; }

/* ── Card ── */
.course-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 12px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.22s ease, transform 0.22s ease;
  animation: slideUp 0.35s ease both;
}

.course-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 72px;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.05);
}

.course-option:last-child::after { display: none; }

.course-option:active {
  transform: scale(0.98);
  background: rgba(255,255,255,0.05);
}

@media (hover: hover) {
  .course-option:hover {
    background: rgba(255,255,255,0.05);
  }
  .course-option:hover .chevron {
    transform: translateX(4px);
    stroke: #00D4FF;
  }
}

.chevron { flex-shrink: 0; transition: transform 0.22s ease, stroke 0.22s ease; }

/* ── Thumbnail ── */
.course-thumb {
  width: 58px;
  height: 42px;
  border-radius: 10px;
  background: #1c1c1e;
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.course-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ── Text ── */
.course-info { flex: 1; min-width: 0; }

.course-name {
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-meta {
  font-size: 12px;
  color: #636366;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Loading ── */
.loading-center {
  display: flex;
  justify-content: center;
  padding: 72px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2.5px solid rgba(0,212,255,0.18);
  border-top-color: #00D4FF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

