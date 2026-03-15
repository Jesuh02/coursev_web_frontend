import type { AuthPort } from '@/domain/ports'
import { api } from './httpClient'
import type { AuthResponse } from '@/domain/models'

export const authAdapter: AuthPort = {
  login: (username, password) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  register: (username, password, email, personaId) =>
    api.post<AuthResponse>('/auth/register', { username, password, email, personaId }),

  loginWithGoogle: (email, displayName, avatarUrl, username) =>
    api.post<AuthResponse>('/auth/google', { email, displayName, avatarUrl, username }),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}
