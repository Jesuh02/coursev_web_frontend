import type { ChatPort } from '@/domain/ports'
import type { ChatMessage } from '@/domain/models'
import { api } from './httpClient'

export const chatAdapter: ChatPort = {
  upsertMessage: (message) => api.post('/chat-messages', message),
  getMessagesBySession: (sessionId) => api.get<ChatMessage[]>(`/chat-messages/session/${sessionId}`),
  getMyMessages: () => api.get<ChatMessage[]>('/chat-messages/my'),
  deleteMessage: (id) => api.delete(`/chat-messages/${id}`),
  deleteSession: (sessionId) => api.delete(`/chat-messages/session/${sessionId}`),
}
