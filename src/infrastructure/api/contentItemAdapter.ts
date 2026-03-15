import type { ContentItemPort } from '@/domain/ports'
import type { ContentItem } from '@/domain/models'
import { api } from './httpClient'

export const contentItemAdapter: ContentItemPort = {
  getByTopic: (topicId) => api.get<ContentItem[]>(`/content-items/topic/${topicId}`),
  getByTask: (taskId) => api.get<ContentItem[]>(`/content-items/task/${taskId}`),
  getByCourse: (courseId) => api.get<ContentItem[]>(`/content-items/course/${courseId}`),
  getById: (id) => api.get<ContentItem>(`/content-items/${id}`),
  create: (data) => api.post<ContentItem>('/content-items', data),
  update: (id, data) => api.put<ContentItem>(`/content-items/${id}`, data),
  delete: (id) => api.delete(`/content-items/${id}`),
}
