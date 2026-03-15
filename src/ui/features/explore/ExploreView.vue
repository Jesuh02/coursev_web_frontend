<template>
  <div class="explore-view">
    <ExploreHeader
      v-model:search="searchQuery"
      :active-filter="activeFilter"
      @filter="activeFilter = $event as typeof activeFilter"
    />

    <ExploreSkeleton v-if="courseStore.loading" />

    <div v-else-if="filtered.length" class="course-grid">
      <CourseCard
        v-for="course in filtered"
        :key="course.id"
        :course="course"
        @click="$router.push(`/course/${course.id}`)"
      />
    </div>

    <EmptyState v-else icon="search" message="No se encontraron cursos" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '@/stores/courseStore'
import ExploreHeader from './components/ExploreHeader.vue'
import ExploreSkeleton from './components/ExploreSkeleton.vue'
import CourseCard from './components/CourseCard.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const FILTERS = ['Todos', 'Mis Cursos', 'Premium', 'Gratis', 'Inscritos'] as const
type Filter = typeof FILTERS[number]

const searchQuery = ref('')
const activeFilter = ref<Filter>('Todos')
const courseStore = useCourseStore()

const filtered = computed(() => {
  let result = courseStore.courses
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.title.toLowerCase().includes(q))
  }
  if (activeFilter.value === 'Premium') result = result.filter(c => c.price > 0)
  if (activeFilter.value === 'Gratis') result = result.filter(c => c.price === 0)
  return result
})

onMounted(() => courseStore.fetchCourses())
</script>

<style scoped>
.explore-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-top: 140px;
  padding-bottom: 80px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 0 16px;
}
</style>
