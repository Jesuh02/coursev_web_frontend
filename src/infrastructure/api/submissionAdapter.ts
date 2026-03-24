import type { SubmissionPort } from '@/domain/ports'
import type { TaskSubmission } from '@/domain/models'
import { api } from './httpClient'

export const submissionAdapter: SubmissionPort = {
  getMySubmissions: (page = 1, limit = 100) =>
    api.get<TaskSubmission[]>(`/submissions/my?page=${page}&pageSize=${limit}`),

  getSubmissionsByTask: (taskId) =>
    api.get<TaskSubmission[]>(`/submissions/task/${taskId}`),

  getSubmissionByCourse: (courseId, ungradedOnly = false) => {
    const param = ungradedOnly ? '&ungradedOnly=true' : ''
    return api.get<TaskSubmission[]>(`/submissions/course/${courseId}?page=1&pageSize=50${param}`)
  },

  getSubmissionByUserAndTask: (taskId, studentId) => {
    const query = studentId ? `?studentId=${studentId}` : ''
    return api.get<TaskSubmission | null>(`/submissions/task/${taskId}/student${query}`)
  },

  getSubmissionById: (id) =>
    api.get<TaskSubmission>(`/submissions/${id}`),

  submitWork: (data) => api.post<TaskSubmission>('/submissions', data),

  gradeSubmission: (id, grade, feedback) =>
    api.put<TaskSubmission>(`/submissions/${id}/grade`, { grade, feedback }),

  uploadSubmissionFile: (formData, folder) => {
    formData.append('folder', folder)
    return api.upload<{ key: string; url: string }>('/submissions/upload', formData)
  },
}
