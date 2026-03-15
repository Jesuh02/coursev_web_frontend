import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Course } from '@/domain/models'
import { courseAdapter } from '@/infrastructure/api'

export const useCourseStore = defineStore('courses', () => {
  const courses = ref<Course[]>([])
  const current = ref<Course | null>(null)
  const loading = ref(false)
  const filterCounts = ref<Record<string, number>>({})

  const freeCourses = computed(() => courses.value.filter(c => c.isFree))
  const premiumCourses = computed(() => courses.value.filter(c => c.is_premium))

  async function fetchCourses(page = 1, limit = 50) {
    loading.value = true
    try { courses.value = await courseAdapter.getCourses(page, limit) }
    finally { loading.value = false }
  }

  async function fetchCourseById(id: number) {
    loading.value = true
    try { current.value = await courseAdapter.getCourseById(id) }
    finally { loading.value = false }
  }

  async function fetchFilterCounts(userId?: number) {
    try { filterCounts.value = await courseAdapter.getCourseFilterCounts(userId) }
    catch { /* silent */ }
  }

  async function searchCourses(query: string) {
    loading.value = true
    try { courses.value = await courseAdapter.searchCourses(query) }
    finally { loading.value = false }
  }

  async function createCourse(data: Record<string, unknown>) {
    const created = await courseAdapter.createCourse(data)
    courses.value.unshift(created)
    return created
  }

  async function updateCourse(id: number, data: Record<string, unknown>) {
    const updated = await courseAdapter.updateCourse(id, data)
    const idx = courses.value.findIndex(c => c.id === id)
    if (idx >= 0) courses.value[idx] = updated
    if (current.value?.id === id) current.value = updated
    return updated
  }

  async function deleteCourse(id: number) {
    await courseAdapter.deleteCourse(id)
    courses.value = courses.value.filter(c => c.id !== id)
  }

  return {
    courses, current, loading, filterCounts,
    freeCourses, premiumCourses,
    fetchCourses, fetchCourseById, fetchFilterCounts,
    searchCourses, createCourse, updateCourse, deleteCourse,
  }
})
