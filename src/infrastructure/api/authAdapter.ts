import type { AuthPort } from '@/domain/ports'
import { api } from './httpClient'
import type { AuthResponse } from '@/domain/models'

export const authAdapter: AuthPort = {
  login: (username, password) =>
    api.post<AuthResponse>('/auth/login', { username, password }),

  register: (username, password, email, personaId, personaData, tenantIds) =>
    api.post<AuthResponse>('/auth/register', { username, password, email, personaId, persona: personaData, ...(tenantIds?.length ? { tenantIds } : {}) }),


  loginWithGoogle: (idToken, displayName, avatarUrl, username) =>
    api.post<AuthResponse>('/auth/google', { idToken, displayName, avatarUrl, username }),

  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email) =>
    api.post<{ sent: boolean }>('/auth/forgot-password', { email }),

  verifyResetCode: (email, code) =>
    api.post<{ valid: boolean }>('/auth/verify-reset-code', { email, code }),

  resetPassword: (email, code, newPassword) =>
    api.post<{ message: string }>('/auth/reset-password', { email, code, newPassword }),

  logout: () =>
    api.post<void>('/auth/logout', {}).catch(() => { /* ignore errors on logout */ }) as Promise<void>,
}
