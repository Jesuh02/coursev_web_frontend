import type { NotificationPort } from '@/domain/ports'
import type { Notification } from '@/domain/models'
import { api } from './httpClient'

export const notificationAdapter: NotificationPort = {
  getMyNotifications: async (page = 1, limit = 50) => {
    const data = await api.get<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications/my?page=${page}&pageSize=${limit}`
    )
    return data?.notifications ?? []
  },
  getUnreadCount: () => api.get<number>('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.put('/notifications/read-all', {}),
  sendNotification: (data) => api.post('/notifications/send', data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}
