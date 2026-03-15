import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Course } from '@/domain/models'
import { courseAdapter, tokenStorage } from '@/infrastructure/api'

export const useCourseStore = defineStore('courses', () => {
  const courses = ref<Course[]>([])
  const current = ref<Course | null>(null)
  const loading = ref(false)
  const loadingMore = ref(false)
  const page = ref(1)
  const hasMore = ref(true)
  const filterCounts = ref<Record<string, number>>({})
  const activeFilter = ref('all')

  const freeCourses = computed(() => courses.value.filter(c => c.isFree))
  const premiumCourses = computed(() => courses.value.filter(c => c.is_premium))

  async function fetchCourses(pageNum = 1, limit = 20) {
    if (pageNum === 1) loading.value = true
    else loadingMore.value = true
    try {
      const res = await courseAdapter.getCoursesPaginated(pageNum, limit)
      if (pageNum === 1) courses.value = res.data
      else courses.value = [...courses.value, ...res.data]
      page.value = pageNum
      hasMore.value = res.pagination?.hasNext ?? false
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function fetchByFilter(filter: string) {
    activeFilter.value = filter
    loading.value = true
    page.value = 1
    hasMore.value = false
    try {
      const userId = tokenStorage.userId ?? undefined
      switch (filter) {
        case 'free':
          courses.value = await courseAdapter.getFreeCourses()
          break
        case 'premium':
          courses.value = await courseAdapter.getPremiumCourses()
          break
        case 'created':
          if (userId) courses.value = await courseAdapter.getCoursesByCreatorId(userId)
          break
        case 'others': {
          const all = await courseAdapter.getCourses(1, 200)
          courses.value = userId ? all.filter(c => c.creator_user_id !== userId && c.creatorUserId !== userId) : all
          break
        }
        case 'enrolled': {
          const res = await courseAdapter.getEnrolledCoursesPaginated(userId)
          courses.value = res.data ?? (res as unknown as Course[])
          break
        }
        case 'purchased':
          courses.value = await courseAdapter.getPurchasedCourses(userId)
          break
        default:
          await fetchCourses()
          return
      }
    } finally { loading.value = false }
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

  async function searchCourses(query: string, pageNum = 1, limit = 20) {
    if (pageNum === 1) loading.value = true
    else loadingMore.value = true
    try {
      const res = await courseAdapter.searchCourses(query, pageNum, limit)
      if (pageNum === 1) courses.value = res.data
      else courses.value = [...courses.value, ...res.data]
      page.value = pageNum
      hasMore.value = res.pagination?.hasNext ?? false
    } finally {
      loading.value = false
      loadingMore.value = false
    }
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
    courses, current, loading, loadingMore, page, hasMore, filterCounts, activeFilter,
    freeCourses, premiumCourses,
    fetchCourses, fetchByFilter, fetchCourseById, fetchFilterCounts,
    searchCourses, createCourse, updateCourse, deleteCourse,
  }
})
