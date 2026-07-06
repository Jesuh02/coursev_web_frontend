import type { ContentItemPort } from '@/domain/ports'
import type { ContentItem } from '@/domain/models'
import { api } from './httpClient'

interface RawContentItem {
  id: number
  task_id: number
  topic_id: number | null
  content_type: string
  content: string
  title?: string
  body?: string
  file_uri?: string | null
  fileUri?: string | null
  file_url?: string | null
  fileUrl?: string | null
  file_name?: string | null
  fileName?: string | null
  order_index: number
  created_at: string | null
}

function pickFileUri(...values: Array<string | null | undefined>): string | null {
  const candidates = values.map(value => value?.trim()).filter((value): value is string => Boolean(value))
  if (candidates.length === 0) return null
  return candidates.find(value => /\.r2\.(cloudflarestorage\.com|dev)/i.test(value))
    ?? candidates.find(value => /^https?:\/\//i.test(value))
    ?? candidates[0]
}

function mapContentItem(raw: RawContentItem): ContentItem {
  return {
    id: raw.id,
    taskId: raw.task_id,
    topicId: raw.topic_id,
    contentType: raw.content_type ?? 'document',
    content: raw.title || raw.content || '',
    fileUri: pickFileUri(raw.fileUri, raw.file_uri, raw.fileUrl, raw.file_url, raw.body),
    fileName: raw.fileName ?? raw.file_name ?? null,
    orderIndex: raw.order_index ?? 0,
    createdAt: raw.created_at,
  }
}

export const contentItemAdapter: ContentItemPort = {
  getByTopic: async (topicId) => {
    const raw = await api.get<RawContentItem[]>(`/content-items/topic/${topicId}`)
    return raw.map(mapContentItem)
  },
  getByTask: async (taskId) => {
    const raw = await api.get<RawContentItem[]>(`/content-items/task/${taskId}`)
    return raw.map(mapContentItem)
  },
  getByCourse: async (courseId) => {
    const raw = await api.get<RawContentItem[]>(`/content-items/course/${courseId}`)
    return raw.map(mapContentItem)
  },
  getById: async (id) => {
    const raw = await api.get<RawContentItem>(`/content-items/${id}`)
    return mapContentItem(raw)
  },
  create: (data) => api.post<ContentItem>('/content-items', data),
  update: (id, data) => api.put<ContentItem>(`/content-items/${id}`, data),
  delete: (id) => api.delete(`/content-items/${id}`),
}
