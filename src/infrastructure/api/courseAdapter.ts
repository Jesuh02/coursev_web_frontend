import type { CoursePort } from '@/domain/ports'
import type { Course, GuestEntry, PaginatedResponse } from '@/domain/models'
import { api } from './httpClient'
import { tokenStorage } from './httpClient'

export const courseAdapter: CoursePort = {
  getCourses: (page = 1, limit = 50) =>
    api.get<Course[]>(`/courses?page=${page}&pageSize=${limit}`),

  getCoursesPaginated: (page = 1, limit = 20, excludeUserId) => {
    const exclude = excludeUserId ? `&excludeUserId=${excludeUserId}` : ''
    return api.getRaw<PaginatedResponse<Course>>(`/courses?page=${page}&pageSize=${limit}${exclude}`)
  },

  getFreeCourses: () => api.get<Course[]>('/courses/free'),

  getPremiumCourses: (page = 1, limit = 50) =>
    api.get<Course[]>(`/courses/premium?page=${page}&pageSize=${limit}`),

  getPopularCourses: (page = 1, limit = 5) =>
    api.get<Course[]>(`/courses/popular?page=${page}&pageSize=${limit}`),

  searchCourses: (query, page = 1, limit = 20) =>
    api.getRaw<PaginatedResponse<Course>>(`/courses/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${limit}`),

  getCourseById: (id) => api.get<Course>(`/courses/${id}`),

  getCoursesByCreatorId: (userId) =>
    api.get<Course[]>(`/courses/creator-id/${userId}`),

  getManageableCourses: (userId) =>
    api.get<Course[]>(`/courses/manageable/${userId}`),

  getEnrolledCoursesPaginated: (userId, page = 1, limit = 50) => {
    const uid = userId || tokenStorage.userId
    return api.get<PaginatedResponse<Course>>(`/courses/enrolled?userId=${uid}&page=${page}&pageSize=${limit}`)
  },

  getPurchasedCourses: (userId) => {
    const uid = userId || tokenStorage.userId
    return api.get<Course[]>(`/courses/purchased?userId=${uid}`)
  },

  getCourseFilterCounts: (userId) => {
    const uid = userId || tokenStorage.userId
    const param = uid ? `?userId=${uid}` : ''
    return api.get<Record<string, number>>(`/courses/counts${param}`)
  },

  createCourse: (data) => api.post<Course>('/courses', data),
  updateCourse: (id, data) => api.put<Course>(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  inviteGuests: (courseId, userIds) =>
    api.post<{ invited: number; results: unknown[] }>(`/courses/${courseId}/guests`, { userIds }),
  getGuests: (courseId) =>
    api.get<GuestEntry[]>(`/courses/${courseId}/guests`),
  removeGuest: (courseId, userId) =>
    api.delete(`/courses/${courseId}/guests/${userId}`),
}
