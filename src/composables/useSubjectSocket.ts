import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'https://mcp-backenddeploy-production-4ed0.up.railway.app'

// Shared singleton socket connection reused across component instances
let socket: Socket | null = null
let refCount = 0

function getSocket(): Socket {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
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
  let s: Socket

  onMounted(() => {
    if (!courseId) return
    s = getSocket()
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
