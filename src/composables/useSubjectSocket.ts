import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL_QA as string) || 'https://mcp-backenddeploy-production-4ed0.up.railway.app'

// Shared singleton socket connection reused across component instances
let socket: Socket | null = null
let refCount = 0
// After all reconnection attempts fail, stop trying until this timestamp
let retryAfter = 0
const RETRY_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

function getSocket(): Socket | null {
  if (Date.now() < retryAfter) return null
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 8000,
    })
    socket.on('reconnect_failed', () => {
      retryAfter = Date.now() + RETRY_COOLDOWN_MS
      socket?.disconnect()
      socket = null
    })
  }
  return socket
}

export interface SubjectSocketHandlers {
  onCreated?: (subject: any) => void
  onUpdated?: (subject: any) => void
  onDeleted?: (data: { id: number; courseId: number }) => void
}

export function useSubjectSocket(courseId: number, handlers: SubjectSocketHandlers) {
  let s: Socket | null = null

  onMounted(() => {
    if (!courseId) return
    s = getSocket()
    if (!s) return
    refCount++

    s.emit('join:course', courseId)

    if (handlers.onCreated) s.on('subject:created', handlers.onCreated)
    if (handlers.onUpdated) s.on('subject:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.on('subject:deleted', handlers.onDeleted)
  })

  onUnmounted(() => {
    if (!courseId || !s) return
    s.emit('leave:course', courseId)
    if (handlers.onCreated) s.off('subject:created', handlers.onCreated)
    if (handlers.onUpdated) s.off('subject:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.off('subject:deleted', handlers.onDeleted)
    refCount--
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
}
