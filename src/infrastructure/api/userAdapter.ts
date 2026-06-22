import type { UserPort } from '@/domain/ports'
import type { User } from '@/domain/models'
import { api } from './httpClient'

export const userAdapter: UserPort = {
  getMyProfile: () => api.get<User>('/users/me'),
  updateMyProfile: (updates) => api.put<User>('/users/me', updates),
  searchUsers: (query) => api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`),
  getUserById: (id) => api.get<User>(`/users/${id}`),
  getUserByUsername: (username) => api.get<User>(`/users/by-username/${username}`),
  getUsersByIds: (ids) => api.get<User[]>(`/users/by-ids?ids=${ids.join(',')}`),
  registerFCMToken: (token) => api.post('/users/fcm-token', { fcmToken: token }),
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await api.upload<{ url?: string; avatarUrl?: string }>('/users/me/avatar', formData)
    return res.avatarUrl || res.url || ''
  },

  // Admin: user activation management
  listAllUsers: (limit = 100, offset = 0) =>
    api.get<User[]>(`/users/admin/list?limit=${limit}&offset=${offset}`),
  deactivateUser: (userId: number) => api.post(`/users/${userId}/deactivate`, {}),
  activateUser: (userId: number) => api.post(`/users/${userId}/activate`, {}),
  processExpiredCourseUsers: (expiredCourseIds: number[]) =>
    api.post('/users/admin/process-expired-courses', { expiredCourseIds }),
  assignRole: (userId: number, roleId: number) =>
    api.post(`/users/${userId}/role`, { roleId }),
}
