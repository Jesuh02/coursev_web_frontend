import type { SubjectPort } from '@/domain/ports'
import type { Subject } from '@/domain/models'
import { api } from './httpClient'

export const subjectAdapter: SubjectPort = {
  getSubjectsByCourse: (courseId) => api.get<Subject[]>(`/subjects/course/${courseId}`),
  getSubjectById: (id) => api.get<Subject>(`/subjects/${id}`),
  createSubject: (data) => api.post<Subject>('/subjects', data),
  updateSubject: (id, data) => api.put<Subject>(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
}
