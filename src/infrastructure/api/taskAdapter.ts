import type { TaskPort } from '@/domain/ports'
import type { Task } from '@/domain/models'
import { api } from './httpClient'

function mapTask(raw: any): Task {
  return {
    ...raw,
    id: raw.id,
    title: raw.title,
    description: raw.description ?? '',
    topicId: raw.topicId ?? raw.topic_id,
    topic_id: raw.topic_id ?? raw.topicId,
    dueDate: raw.dueDate ?? raw.due_date ?? null,
    due_date: raw.due_date ?? raw.dueDate ?? null,
    timeLimitMinutes: raw.timeLimitMinutes ?? raw.time_limit_minutes ?? null,
    periodId: raw.periodId ?? raw.period_id ?? null,
    period_id: raw.period_id ?? raw.periodId ?? null,
    orderIndex: raw.orderIndex ?? raw.order_index ?? 0,
    order_index: raw.order_index ?? raw.orderIndex ?? 0,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    created_at: raw.created_at ?? raw.createdAt ?? null,
  }
}

export const taskAdapter: TaskPort = {
  getTasksByTopic: async (topicId) => {
    const raw = await api.get<any[]>(`/tasks/topic/${topicId}`)
    return raw.map(mapTask)
  },
  getTasksByCourse: async (courseId) => {
    const raw = await api.get<any[]>(`/tasks/course/${courseId}`)
    return raw.map(mapTask)
  },
  getTaskById: async (id) => {
    const raw = await api.get<any>(`/tasks/${id}`)
    return mapTask(raw)
  },
  createTask: async (data) => {
    const raw = await api.post<any>('/tasks', data)
    return mapTask(raw)
  },
  updateTask: async (id, data) => {
    const raw = await api.put<any>(`/tasks/${id}`, data)
    return mapTask(raw)
  },
  reorderTasks: async (items) => {
    const raw = await api.put<any[]>('/tasks/reorder', { items })
    return raw.map(mapTask)
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`),
}
