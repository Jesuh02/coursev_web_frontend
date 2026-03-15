import type { TopicPort } from '@/domain/ports'
import type { Topic } from '@/domain/models'
import { api } from './httpClient'

interface RawTopic {
  id: number
  name: string
  description: string
  order_index: number
  materia_id: number
  subject_id: number
  created_at: string | null
  updated_at: string | null
}

function mapTopic(raw: RawTopic): Topic {
  return {
    id: raw.id,
    title: raw.name,
    description: raw.description ?? '',
    courseId: raw.subject_id ?? raw.materia_id,
    orderIndex: raw.order_index ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export const topicAdapter: TopicPort = {
  getTopicsByCourse: async (courseId) => {
    const raw = await api.get<RawTopic[]>(`/topics/course/${courseId}`)
    return raw.map(mapTopic)
  },
  getTopicsBySubject: async (subjectId) => {
    const raw = await api.get<RawTopic[]>(`/topics/subject/${subjectId}`)
    return raw.map(mapTopic)
  },
  getTopicById: async (id) => {
    const raw = await api.get<RawTopic>(`/topics/${id}`)
    return mapTopic(raw)
  },
  createTopic: (data) => api.post<Topic>('/topics', data),
  updateTopic: (id, data) => api.put<Topic>(`/topics/${id}`, data),
  deleteTopic: (id) => api.delete(`/topics/${id}`),
}
