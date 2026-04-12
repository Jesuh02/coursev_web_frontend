import type { ProgressPort } from '@/domain/ports'
import type { Progress, Certificate } from '@/domain/models'
import { api } from './httpClient'

export type EnrollmentStatusResponse = {
  enrolled?: boolean
  status?: string | null
  enrollmentStatus?: string | null
  enrollment_status?: string | null
}

export function extractEnrollmentStatus(data?: EnrollmentStatusResponse | null): string | null {
  const status = [data?.enrollmentStatus, data?.enrollment_status, data?.status]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  return status?.trim().toLowerCase() ?? null
}

export const progressAdapter: ProgressPort = {
  // ── Progreso del estudiante ──
  getMyProgress: () => api.get<Progress[]>('/progress/my'),
  getProgressByCourse: (courseId) => api.get<Progress>(`/progress/course/${courseId}`),
  getAllProgressByCourse: (courseId) => api.get<Progress[]>(`/progress/course/${courseId}/all`),
  getMyEnrolledCourseIds: () => api.get<number[]>('/progress/my/enrolled-course-ids'),
  isEnrolled: (courseId) => api.get<boolean>(`/progress/course/${courseId}/enrolled`),
  getEnrolledCount: (courseId) => api.get<number>(`/progress/course/${courseId}/enrolled-count`),
  upsertProgress: (data) => api.post<Progress>('/progress/upsert', data),
  getLeaderboard: (courseId, limit = 10) => api.get<Progress[]>(`/progress/leaderboard/${courseId}?limit=${limit}`),
  recalculateProgress: (courseId) => api.post(`/progress/course/${courseId}/recalculate`, null),

  // ── Progreso por materia ──
  getSubjectProgress: (courseId) => api.get<Progress[]>(`/progress/course/${courseId}/subjects`),
  getBySubject: (subjectId) => api.get<Progress>(`/progress/subject/${subjectId}`),

  // ── Certificados ──
  issueCertificate: (courseId, userId) => {
    const body = userId ? { userId } : {}
    return api.post<Progress>(`/progress/course/${courseId}/certificate`, body)
  },
  getMyCertificates: () => api.get<Certificate[]>('/progress/my/certificates'),
  updateCertificateUrl: (courseId, url, userId) => {
    const body: Record<string, unknown> = { certificateUrl: url }
    if (userId) body.userId = userId
    return api.put<Progress>(`/progress/course/${courseId}/certificate-url`, body)
  },

  // ── Certificados del creador ──
  getCreatorCertificates: () => api.get<Progress[]>('/progress/creator/certificates'),
  bulkIssueCertificatesForCreator: () => api.post<{ issued: number }>('/progress/creator/certificates/bulk-issue', {}),

  // ── Certificados admin (rol 3) ──
  getAllCertificates: () => api.get<Progress[]>('/progress/admin/certificates'),
  bulkIssueCertificatesAll: () => api.post<{ issued: number }>('/progress/admin/certificates/bulk-issue', {}),

  // ── Progreso por materia (admin/teacher) ──
  getAllSubjectProgress: () => api.get<Record<string, unknown>[]>('/progress/admin/subject-progress'),

  // ── Analytics del creador ──
  getTopStudents: (limit = 5) => api.get<Record<string, unknown>[]>(`/progress/top-students?limit=${limit}`),
  getCreatorEnrollmentAnalytics: (options) => {
    const weeklyDays = (options?.weeklyDays as number) || 7
    const monthlyMonths = (options?.monthlyMonths as number) || 6
    return api.get<Record<string, unknown>>(`/progress/creator/enrollment-analytics?weeklyDays=${weeklyDays}&monthlyMonths=${monthlyMonths}`)
  },

  // ── Matrícula (enrollment) ──
  requestEnrollment: (courseId, requestedRole?: 'student' | 'docente') =>
    api.post<Progress>(`/progress/course/${courseId}/request-enrollment`, { requestedRole: requestedRole || 'student' }),
  getEnrollmentStatus: (courseId) => api.get<Record<string, unknown>>(`/progress/course/${courseId}/enrollment-status`),
  getPendingEnrollments: (courseId?) => {
    const q = courseId ? `?courseId=${courseId}` : ''
    return api.get<Record<string, unknown>[]>(`/progress/admin/pending-enrollments${q}`)
  },
  approveEnrollment: (userId, courseId) =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/approve`, {}),
  rejectEnrollment: (userId, courseId) =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/reject`, {}),
  getApprovedEnrollments: () =>
    api.get<Record<string, unknown>[]>('/progress/admin/approved-enrollments'),
  revokeEnrollment: (userId: number, courseId: number, reason?: string) =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/revoke`, { reason: reason || '' }),
  restoreEnrollment: (userId: number, courseId: number) =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/restore`, {}),

  // ── Enrollment status toggle (activar / inactivar) ──
  setCourseEnrollmentStatus: (userId: number, courseId: number, status: 'activo' | 'inactivo') =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/enrollment-status`, { status }),
  setSubjectEnrollmentStatus: (userId: number, courseId: number, subjectId: number, status: 'activo' | 'inactivo') =>
    api.post<Record<string, unknown>>(`/progress/admin/enrollments/${userId}/${courseId}/subject/${subjectId}/enrollment-status`, { status }),

  // ── Subject access blocks ──
  blockSubjectAccess: (userId: number, courseId: number, subjectId: number, reason: string) =>
    api.post<Record<string, unknown>>('/progress/admin/subject-access-block', { userId, courseId, subjectId, reason }),
  unblockSubjectAccess: (userId: number, subjectId: number, courseId?: number) => {
    const query = courseId ? `?courseId=${courseId}` : ''
    return api.delete<Record<string, unknown>>(`/progress/admin/subject-access-block/${userId}/${subjectId}${query}`)
  },
  checkSubjectAccessBlock: (subjectId: number) =>
    api.get<Record<string, unknown>>(`/progress/subject/${subjectId}/access-block`),
  getMySubjectAccessBlocks: (courseId: number) =>
    api.get<Record<string, unknown>[]>(`/progress/course/${courseId}/subject-access-blocks`),
  getAllSubjectAccessBlocks: () =>
    api.get<Record<string, unknown>[]>('/progress/admin/subject-access-blocks'),
}
