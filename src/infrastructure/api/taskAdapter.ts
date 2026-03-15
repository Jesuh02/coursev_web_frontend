import type { TaskPort } from '@/domain/ports'
import type { Task } from '@/domain/models'
import { api } from './httpClient'

export const taskAdapter: TaskPort = {
  getTasksByTopic: (topicId) => api.get<Task[]>(`/tasks/topic/${topicId}`),
  getTasksByCourse: (courseId) => api.get<Task[]>(`/tasks/course/${courseId}`),
  getTaskById: (id) => api.get<Task>(`/tasks/${id}`),
  createTask: (data) => api.post<Task>('/tasks', data),
  updateTask: (id, data) => api.put<Task>(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
}
