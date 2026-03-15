import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Progress } from '@/domain/models'
import { progressAdapter } from '@/infrastructure/api'

export const useProgressStore = defineStore('progress', () => {
  const myProgress = ref<Progress[]>([])
  const enrolledCourseIds = ref<number[]>([])
  const loading = ref(false)

  async function fetchMyProgress() {
    loading.value = true
    try { myProgress.value = await progressAdapter.getMyProgress() }
    finally { loading.value = false }
  }

  async function fetchEnrolledCourseIds() {
    try { enrolledCourseIds.value = await progressAdapter.getMyEnrolledCourseIds() }
    catch { /* silent */ }
  }

  async function isEnrolled(courseId: number) {
    return progressAdapter.isEnrolled(courseId)
  }

  async function getProgressByCourse(courseId: number) {
    return progressAdapter.getProgressByCourse(courseId)
  }

  async function upsertProgress(data: Record<string, unknown>) {
    return progressAdapter.upsertProgress(data)
  }

  return {
    myProgress, enrolledCourseIds, loading,
    fetchMyProgress, fetchEnrolledCourseIds,
    isEnrolled, getProgressByCourse, upsertProgress,
  }
})
