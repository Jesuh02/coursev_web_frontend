<template>
  <div class="cs-root">
    <div class="cs-bg" aria-hidden="true" />
    <TopBar title="Seleccionar Curso" @back="$router.back()" />

    <div class="cs-body">

      <!-- Header -->
      <div class="cs-header">
        <span class="cs-emoji">🎓</span>
        <div>
          <h2 class="cs-title">¿En qué curso?</h2>
          <p class="cs-sub">Elige el curso para tu sesión de refuerzo</p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" class="search-input" placeholder="Buscar curso…" type="search" />
        <Transition name="fade-x">
          <button v-if="search" class="search-clear" @click="search = ''">✕</button>
        </Transition>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="list">
        <div v-for="n in 5" :key="n" class="sk-card" :style="{ animationDelay: `${n * 60}ms` }">
          <div class="sk-thumb" />
          <div class="sk-body">
            <div class="sk-line sk-t" />
            <div class="sk-line sk-s" />
          </div>
          <div class="sk-chev" />
        </div>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="list-meta">
          <span class="list-count">{{ filtered.length }} {{ filtered.length === 1 ? 'curso' : 'cursos' }}</span>
        </div>

        <div v-if="filtered.length" class="list">
          <button
            v-for="(course, i) in filtered"
            :key="course.id"
            class="course-card"
            :style="{ animationDelay: `${i * 55}ms` }"
            @click="select(course)"
          >
            <div class="course-thumb">
              <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)!" alt="" />
              <div v-else class="thumb-ph">📚</div>
            </div>
            <div class="course-info">
              <p class="course-name">{{ course.title }}</p>
              <p v-if="course.description" class="course-desc">{{ course.description }}</p>
            </div>
            <span class="chev">›</span>
          </button>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">Sin cursos disponibles</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Course } from '@/domain/models'
import { resolveImageUrl, courseAdapter } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const search = ref('')
const courses = ref<Course[]>([])
const loading = ref(false)
const isReinforcement = computed(() => route.query.mode === 'reinforcement')

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
  const modeQuery = isReinforcement.value ? '?mode=reinforcement' : ''
  router.push(`/subject-selection/${course.id}${modeQuery}`)
}
</script>

<style scoped>
.cs-root {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: radial-gradient(ellipse at 25% 0%, rgba(98,0,238,.16) 0%, transparent 55%),
              radial-gradient(ellipse at 85% 90%, rgba(0,212,255,.08) 0%, transparent 50%),
              #0A0A0F;
  position: relative;
}

.cs-bg {
  position: fixed; inset: 0; pointer-events: none;
  background: inherit; z-index: 0;
}

/* Body */
.cs-body {
  position: relative; z-index: 1;
  padding: 12px 16px 80px;
  max-width: 480px; margin: 0 auto;
}

/* Header */
.cs-header {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0 16px;
}
.cs-emoji { font-size: 42px; line-height: 1; flex-shrink: 0; }
.cs-title { font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 2px; }
.cs-sub   { font-size: 12px; color: #666; margin: 0; }

/* Search */
.search-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px;
  padding: 0 14px;
  margin-bottom: 12px;
  transition: border-color .2s;
}
.search-wrap:focus-within { border-color: rgba(139,92,246,.5); }
.search-icon { flex-shrink: 0; }
.search-input {
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 14px; color: #fff; padding: 13px 0;
  font-family: inherit;
}
.search-input::placeholder { color: #555; }
.search-clear {
  font-size: 13px; color: #555; cursor: pointer;
  flex-shrink: 0; transition: color .15s;
}
.search-clear:hover { color: #aaa; }

/* List meta */
.list-meta { padding: 2px 2px 8px; }
.list-count { font-size: 11px; font-weight: 700; color: #444; text-transform: uppercase; letter-spacing: .7px; }

/* List */
.list { display: flex; flex-direction: column; gap: 8px; }

/* Course card */
.course-card {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 12px 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
  transition: all .22s cubic-bezier(.34,1.2,.64,1);
  animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both;
}
.course-card:hover {
  background: rgba(255,255,255,.08);
  border-color: rgba(139,92,246,.3);
  transform: translateX(3px);
}
.course-card:active { transform: scale(.97); }

/* Thumb */
.course-thumb {
  width: 52px; height: 40px; border-radius: 11px;
  overflow: hidden; flex-shrink: 0;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.07);
}
.course-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-ph {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
}

/* Info */
.course-info { flex: 1; min-width: 0; }
.course-name {
  font-size: 14px; font-weight: 600; color: #F2F2F7;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin: 0 0 2px;
}
.course-desc {
  font-size: 12px; color: #555;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin: 0;
}

.chev { font-size: 22px; color: #444; flex-shrink: 0; line-height: 1; transition: color .15s, transform .15s; }
.course-card:hover .chev { color: #8B5CF6; transform: translateX(3px); }

/* Skeleton cards */
.sk-card {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 18px;
  animation: shimmer 1.5s ease infinite;
}
.sk-thumb { width: 52px; height: 40px; border-radius: 11px; background: #222; flex-shrink: 0; }
.sk-body  { flex: 1; }
.sk-line  { border-radius: 6px; background: #1e1e1e; }
.sk-t     { height: 13px; width: 60%; margin-bottom: 8px; }
.sk-s     { height: 10px; width: 38%; }
.sk-chev  { width: 16px; height: 16px; border-radius: 50%; background: #1e1e1e; flex-shrink: 0; }

/* Empty */
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 60px 0; text-align: center;
}
.empty-icon { font-size: 48px; opacity: .4; }
.empty-text { font-size: 14px; color: #555; margin: 0; font-weight: 600; }

/* Transitions */
.fade-x-enter-active { animation: fadeIn .2s ease both; }
.fade-x-leave-active { animation: fadeIn .15s ease reverse both; }

@keyframes shimmer { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
</style>

