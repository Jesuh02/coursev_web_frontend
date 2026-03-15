import type { TopicPort } from '@/domain/ports'
import type { Topic } from '@/domain/models'
import { api } from './httpClient'

export const topicAdapter: TopicPort = {
  getTopicsByCourse: (courseId) => api.get<Topic[]>(`/topics/course/${courseId}`),
  getTopicById: (id) => api.get<Topic>(`/topics/${id}`),
  createTopic: (data) => api.post<Topic>('/topics', data),
  updateTopic: (id, data) => api.put<Topic>(`/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/topics/${id}`),
}
