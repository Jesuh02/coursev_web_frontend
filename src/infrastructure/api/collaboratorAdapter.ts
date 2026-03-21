import { api } from './httpClient'

interface CollaboratorEntry {
  id: number
  courseId: number
  userId: number
  createdAt: string
  user: { id: number; username: string; email: string; avatar: string } | null
}

export const collaboratorAdapter = {
  checkAccess: (courseId: number) =>
    api.get<{ hasAccess: boolean }>(`/collaborators/check/${courseId}`),
  getByCourse: (courseId: number) =>
    api.get<CollaboratorEntry[]>(`/collaborators/course/${courseId}`),
  sync: (courseId: number, userIds: number[]) =>
    api.put<CollaboratorEntry[]>(`/collaborators/course/${courseId}/sync`, { userIds }),
}
