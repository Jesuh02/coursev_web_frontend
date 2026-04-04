import type { ChatPort } from '@/domain/ports'
import type { ChatMessage } from '@/domain/models'
import { api, tokenStorage } from './httpClient'

/**
 * Maps a single backend row (camelCase from _mapToDomain) to the frontend ChatMessage model.
 * Preserves extra backend fields (hasCalification, submissionId, etc.) for views that need them.
 */
function fromBackendRow(row: Record<string, unknown>): ChatMessage {
  return {
    ...(row as Record<string, unknown>),
    id: String(row.id ?? ''),
    role: (row.isFromUser ?? row.is_from_user) ? 'user' as const : 'assistant' as const,
    content: (row.message ?? row.content ?? '') as string,
    createdAt: row.timestamp
      ? new Date(typeof row.timestamp === 'number' ? row.timestamp : Number(row.timestamp)).toISOString()
      : (row.createdAt ?? row.created_at ?? new Date().toISOString()) as string,
    sessionId: (row.sessionId ?? row.session_id ?? undefined) as string | undefined,
    excelUrl: (row.excelUrl ?? row.excel_url ?? null) as string | null,
  } as ChatMessage
}

/**
 * Maps frontend ChatMessage fields to the backend's expected payload.
 * Backend expects: message, isFromUser, sessionId, usuarioId, origin, etc.
 */
function toBackendPayload(message: Partial<ChatMessage> & { sessionId: string; origin?: string }) {
  const extra = message as Record<string, unknown>
  return {
    message: message.content ?? '',
    isFromUser: message.role === 'user',
    sessionId: message.sessionId,
    usuarioId: tokenStorage.userId || null,
    username: extra.username ?? tokenStorage.username ?? null,
    origin: message.origin ?? 'chatbot',
    hasCalification: extra.hasCalification ?? false,
    calificationValue: extra.calificationValue ?? null,
    calificationAdded: extra.calificationAdded ?? false,
    excelUrl: message.excelUrl ?? null,
    submissionId: extra.submissionId ?? null,
    timestamp: Date.now(),
    senderAvatar: extra.senderAvatar ?? null,
    attachedFileUrl: extra.attachedFileUrl ?? null,
    attachedFileName: extra.attachedFileName ?? null,
    attachedFileType: extra.attachedFileType ?? null,
    isError: extra.isError ?? false,
    isGraphResponse: extra.isGraphResponse ?? false,
  }
}

export const chatAdapter: ChatPort = {
  upsertMessage: (message) => api.post('/chat-messages/upsert', toBackendPayload(message)),
  getMessagesBySession: async (sessionId) => {
    const data = await api.get<Record<string, unknown>[]>(`/chat-messages/session/${sessionId}`)
    return (Array.isArray(data) ? data : []).map(fromBackendRow)
  },
  getMyMessages: async () => {
    const data = await api.get<Record<string, unknown>[]>('/chat-messages/my')
    return (Array.isArray(data) ? data : []).map(fromBackendRow)
  },
  getMyMessagesByOrigin: async (origin) => {
    const data = await api.get<Record<string, unknown>[]>(`/chat-messages/my/${origin}`)
    return (Array.isArray(data) ? data : []).map(fromBackendRow)
  },
  deleteMessage: (id) => api.delete(`/chat-messages/${id}`),
  deleteSession: (sessionId) => api.delete(`/chat-messages/session/${sessionId}`),
}
