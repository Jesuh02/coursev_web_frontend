<template>
  <div class="course-selection">
    <TopBar title="Seleccionar Curso" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar curso..." />

    <!-- Skeleton -->
    <div v-if="loading" class="list-wrap">
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="sk-thumb" />
        <div class="sk-body">
          <div class="sk-line sk-title" />
          <div class="sk-line sk-sub" />
        </div>
      </div>
    </div>

    <template v-else>
      <div v-if="filtered.length" class="list-header">
        <span class="list-count">{{ filtered.length }} {{ filtered.length === 1 ? 'curso' : 'cursos' }}</span>
      </div>

      <div class="list-wrap">
        <button
          v-for="(course, i) in filtered"
          :key="course.id"
          class="course-option"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="select(course)"
        >
          <div class="course-thumb">
            <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)!" alt="" />
            <div v-else class="thumb-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4" /></svg>
            </div>
          </div>
          <div class="course-info">
            <p class="course-name">{{ course.title }}</p>
            <p class="course-meta">{{ course.description }}</p>
          </div>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#484848" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
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

async function fetchAllCourses(): Promise<Course[]> {
  const all: Course[] = []
  let page = 1
  while (true) {
    const res = await courseAdapter.getCoursesPaginated(page, 100)
    all.push(...(res.data ?? []))
    if (!res.pagination?.hasNext) break
    page++
  }
  return all
}

async function fetchAllEnrolled(userId?: number): Promise<Course[]> {
  const all: Course[] = []
  let page = 1
  while (true) {
    const res = await courseAdapter.getEnrolledCoursesPaginated(userId, page, 100)
    const data: Course[] = Array.isArray(res) ? (res as unknown as Course[]) : (res.data ?? [])
    all.push(...data)
    const hasNext = !Array.isArray(res) && (res.pagination?.hasNext ?? false)
    if (!hasNext) break
    page++
  }
  return all
}

onMounted(async () => {
  loading.value = true
  try {
    const userId = authStore.user?.id

    if (authStore.isAdmin) {
      courses.value = await fetchAllCourses()
    } else if (authStore.isDocente) {
      const [manageable, enrolled] = await Promise.all([
        courseAdapter.getManageableCourses(userId!),
        fetchAllEnrolled(userId),
      ])
      const seen = new Set<number>()
      courses.value = [...manageable, ...enrolled].filter(c => {
        if (seen.has(c.id)) return false
        seen.add(c.id)
        return true
      })
    } else {
      courses.value = await fetchAllEnrolled(userId)
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

/* ── List header ── */
.list-header {
  padding: 4px 20px 0;
}

.list-count {
  font-size: 11px;
  font-weight: 600;
  color: #48484A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── Wrapper ── */
.list-wrap { padding: 4px 12px 40px; }

/* ── Course card ── */
.course-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 11px 8px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.18s ease, transform 0.18s ease;
  animation: fadeSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.course-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 74px;
  right: 8px;
  height: 1px;
  background: rgba(255,255,255,0.04);
}

.course-option:last-child::after { display: none; }

.course-option:active {
  transform: scale(0.975);
  background: rgba(255,255,255,0.04);
}

@media (hover: hover) {
  .course-option:hover { background: rgba(255,255,255,0.04); }
  .course-option:hover .chevron { transform: translateX(3px); stroke: #00D4FF; }
}

.chevron {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.18s ease;
}

/* ── Thumbnail ── */
.course-thumb {
  width: 54px;
  height: 40px;
  border-radius: 9px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: #1c1c1e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Text ── */
.course-info { flex: 1; min-width: 0; }

.course-name {
  font-size: 14.5px;
  font-weight: 500;
  color: #F2F2F7;
  letter-spacing: -0.015em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.course-meta {
  font-size: 12px;
  color: #48484A;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

/* ── Skeleton ── */
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 8px;
}

.sk-thumb {
  width: 54px;
  height: 40px;
  border-radius: 9px;
  background: #1c1c1e;
  flex-shrink: 0;
  animation: shimmer 1.4s ease infinite;
}

.sk-body { flex: 1; }

.sk-line {
  border-radius: 6px;
  background: #1c1c1e;
  animation: shimmer 1.4s ease infinite;
}

.sk-title { height: 13px; width: 62%; margin-bottom: 8px; }
.sk-sub   { height: 11px; width: 40%; }

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

