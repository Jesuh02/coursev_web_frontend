import type { ChatPort } from '@/domain/ports'
import type { ChatMessage } from '@/domain/models'
import { api, tokenStorage } from './httpClient'

/**
 * Maps frontend ChatMessage fields to the backend's expected payload.
 * Backend expects: message, isFromUser, sessionId, usuarioId, origin, etc.
 */
function toBackendPayload(message: Partial<ChatMessage> & { sessionId: string; origin?: string }) {
  return {
    message: message.content ?? '',
    isFromUser: message.role === 'user',
    sessionId: message.sessionId,
    usuarioId: tokenStorage.userId || null,
    origin: message.origin ?? 'chatbot',
    hasCalification: (message as Record<string, unknown>).hasCalification ?? false,
    calificationValue: (message as Record<string, unknown>).calificationValue ?? null,
    calificationAdded: (message as Record<string, unknown>).calificationAdded ?? false,
    timestamp: Date.now(),
  }
}

export const chatAdapter: ChatPort = {
  upsertMessage: (message) => api.post('/chat-messages/upsert', toBackendPayload(message)),
  getMessagesBySession: (sessionId) => api.get<ChatMessage[]>(`/chat-messages/session/${sessionId}`),
  getMyMessages: () => api.get<ChatMessage[]>('/chat-messages/my'),
  deleteMessage: (id) => api.delete(`/chat-messages/${id}`),
  deleteSession: (sessionId) => api.delete(`/chat-messages/session/${sessionId}`),
}
