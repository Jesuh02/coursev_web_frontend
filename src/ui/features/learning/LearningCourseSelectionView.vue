<template>
  <div class="al-root">
    <TopBar title="Elige un curso" @back="$router.back()" />

    <div class="al-shell">
      <header class="head" ref="headEl">
        <p class="al-eyebrow">Paso 1 de 3</p>
        <h1 class="al-display">¿Sobre qué curso quieres aprender?</h1>
        <p class="al-sub">Selecciona el curso del que tomaremos los temas y materiales.</p>
      </header>

      <div class="al-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" placeholder="Buscar curso…" type="search" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="al-list">
        <div v-for="n in 5" :key="n" class="al-skeleton" />
      </div>

      <template v-else>
        <div v-if="filtered.length" class="al-list" ref="listEl">
          <button
            v-for="course in filtered"
            :key="course.id"
            class="al-row"
            @click="select(course)"
          >
            <div class="al-row__thumb">
              <img v-if="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)" :src="resolveImageUrl(course.thumbnailUri ?? course.thumbnail_uri)!" alt="" />
              <span v-else>📚</span>
            </div>
            <div class="al-row__body">
              <p class="al-row__title">{{ course.title }}</p>
              <p v-if="course.description" class="al-row__desc">{{ course.description }}</p>
            </div>
            <span class="al-row__chev">›</span>
          </button>
        </div>

        <div v-else class="al-empty">
          <p>No encontramos cursos disponibles.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { animate, utils } from 'animejs'
import type { Course } from '@/domain/models'
import { resolveImageUrl, courseAdapter } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const authStore = useAuthStore()

const search = ref('')
const courses = ref<Course[]>([])
const loading = ref(false)
const headEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  if (!search.value) return courses.value
  const q = search.value.toLowerCase()
  return courses.value.filter(c => c.title.toLowerCase().includes(q))
})

async function fetchAll(): Promise<Course[]> {
  const userId = authStore.user?.id
  const all: Course[] = []
  let page = 1
  while (true) {
    const res = authStore.isAdmin
      ? await courseAdapter.getCoursesPaginated(page, 100)
      : await courseAdapter.getEnrolledCoursesPaginated(userId, page, 100)
    const data: Course[] = Array.isArray(res) ? (res as unknown as Course[]) : (res.data ?? [])
    all.push(...data)
    const hasNext = !Array.isArray(res) && (res.pagination?.hasNext ?? false)
    if (!hasNext) break
    page++
  }
  return all
}

onMounted(async () => {
  if (headEl.value) {
    animate(Array.from(headEl.value.children) as HTMLElement[], {
      opacity: [0, 1], translateY: [16, 0],
      delay: utils.stagger(80), duration: 550, ease: 'outCubic',
    })
  }
  loading.value = true
  try { courses.value = await fetchAll() } catch { /* silent */ }
  finally { loading.value = false }

  await nextTick()
  if (listEl.value) {
    const rows = Array.from(listEl.value.children) as HTMLElement[]
    if (rows.length) {
      animate(rows, {
        opacity: [0, 1], translateY: [14, 0],
        delay: utils.stagger(40), duration: 500, ease: 'outCubic',
      })
    }
  }
})

function select(course: Course) {
  router.push(`/learning/course/${course.id}/topic-selection`)
}
</script>

<style scoped>
@import '@/styles/apple-tokens.css';
.head { padding: 16px 0 8px; }
</style>
