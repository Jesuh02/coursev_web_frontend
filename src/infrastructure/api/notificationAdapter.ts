import type { NotificationPort } from '@/domain/ports'
import type { Notification } from '@/domain/models'
import { api } from './httpClient'

export const notificationAdapter: NotificationPort = {
  getMyNotifications: (page = 1, limit = 50) =>
    api.get<Notification[]>(`/notifications?page=${page}&pageSize=${limit}`),
  getUnreadCount: () => api.get<number>('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, null),
  markAllAsRead: () => api.put('/notifications/read-all', null),
  sendNotification: (data) => api.post('/notifications/send', data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}
