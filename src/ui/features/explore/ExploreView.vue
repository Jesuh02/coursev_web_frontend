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
          @click="$router.push(`/subjects/${course.id}`)"
        />
      </TransitionGroup>
    </div>

    <EmptyState v-else icon="search" message="No se encontraron cursos" />

    <div v-if="courseStore.loadingMore" class="loading-more">
      <div class="spinner" />
    </div>

    <div ref="sentinel" class="sentinel" />

    <FilterBottomSheet
      v-model="showFilter"
      :active="activeFilter"
      @select="activeFilter = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useCourseStore } from '@/stores/courseStore'
import ExploreHeader from './components/ExploreHeader.vue'
import ExploreSkeleton from './components/ExploreSkeleton.vue'
import CourseCard from './components/CourseCard.vue'
import FilterBottomSheet from './components/FilterBottomSheet.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const searchQuery = ref('')
const activeFilter = ref('all')
const showFilter = ref(false)
const courseStore = useCourseStore()
const sentinel = ref<HTMLElement>()
let observer: IntersectionObserver | null = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null

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
</style>
