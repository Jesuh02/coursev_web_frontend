import type { SubjectPort } from '@/domain/ports'
import type { Subject } from '@/domain/models'
import { api } from './httpClient'

export interface SubjectCollaborator {
  id: number
  subjectId: number
  userId: number
  createdAt: string
  user: { id: number; username: string; email: string; avatar: string } | null
}

export const subjectAdapter: SubjectPort = {
  getSubjectsByCourse: (courseId) => api.get<Subject[]>(`/subjects/course/${courseId}`),
  getSubjectById: (id) => api.get<Subject>(`/subjects/${id}`),
  createSubject: (data) => api.post<Subject>('/subjects', data),
  updateSubject: (id, data) => api.put<Subject>(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
}

export const subjectCollaboratorAdapter = {
  getCollaborators: (subjectId: number) =>
    api.get<SubjectCollaborator[]>(`/subjects/${subjectId}/collaborators`),
  addCollaborator: (subjectId: number, userId: number) =>
    api.post<SubjectCollaborator>(`/subjects/${subjectId}/collaborators`, { userId }),
  removeCollaborator: (subjectId: number, userId: number) =>
    api.delete(`/subjects/${subjectId}/collaborators/${userId}`),
  syncCollaborators: (subjectId: number, userIds: number[]) =>
    api.put<SubjectCollaborator[]>(`/subjects/${subjectId}/collaborators/sync`, { userIds }),
}
