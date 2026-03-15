import type { ProgressPort } from '@/domain/ports'
import type { Progress } from '@/domain/models'
import { api } from './httpClient'

export const progressAdapter: ProgressPort = {
  getMyProgress: () => api.get<Progress[]>('/progress/my'),
  getProgressByCourse: (courseId) => api.get<Progress>(`/progress/course/${courseId}`),
  getAllProgressByCourse: (courseId) => api.get<Progress[]>(`/progress/course/${courseId}/all`),
  getMyEnrolledCourseIds: () => api.get<number[]>('/progress/my/enrolled-course-ids'),
  isEnrolled: (courseId) => api.get<boolean>(`/progress/course/${courseId}/enrolled`),
  upsertProgress: (data) => api.post<Progress>('/progress/upsert', data),
  getLeaderboard: (courseId, limit = 10) => api.get<Progress[]>(`/progress/leaderboard/${courseId}?limit=${limit}`),
  issueCertificate: (courseId, userId) => {
    const body = userId ? { userId } : {}
    return api.post<Progress>(`/progress/course/${courseId}/certificate`, body)
  },
  getMyCertificates: () => api.get('/progress/my/certificates'),
  recalculateProgress: (courseId) => api.post(`/progress/course/${courseId}/recalculate`, null),
}
