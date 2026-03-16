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
  bulkIssueCertificatesForCreator: () => api.post<{ issued: number }>('/progress/creator/certificates/bulk-issue', {}),
  recalculateProgress: (courseId) => api.post(`/progress/course/${courseId}/recalculate`, null),

  // Enrollment request flow
  requestEnrollment: (courseId: number) => api.post<Progress>(`/progress/course/${courseId}/request-enrollment`, {}),
  getEnrollmentStatus: (courseId: number) => api.get<{ enrolled: boolean; status: string | null }>(`/progress/course/${courseId}/enrollment-status`),

  // Admin: Matrícula management
  getPendingEnrollments: (courseId?: number) => {
    const q = courseId ? `?courseId=${courseId}` : ''
    return api.get<Progress[]>(`/progress/admin/pending-enrollments${q}`)
  },
  approveEnrollment: (userId: number, courseId: number) =>
    api.post<Progress>(`/progress/admin/enrollments/${userId}/${courseId}/approve`, {}),
  rejectEnrollment: (userId: number, courseId: number) =>
    api.post<Progress>(`/progress/admin/enrollments/${userId}/${courseId}/reject`, {}),
}
