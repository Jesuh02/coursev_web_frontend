import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { Course } from '@/domain/models'

const SOCKET_URL = 'https://mcp-backenddeploy-production-4ed0.up.railway.app'

// Shared singleton — reused across component instances
let socket: Socket | null = null
let refCount = 0
let retryAfter = 0
const RETRY_COOLDOWN_MS = 5 * 60 * 1000

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

export interface CourseSocketHandlers {
  /** A new course was published — prepend it to the list */
  onCreated?: (course: Course) => void
  /** An existing course was updated — replace it in the list */
  onUpdated?: (course: Course) => void
  /** A course was deleted — remove it by id */
  onDeleted?: (data: { id: number }) => void
}

/**
 * Composable that listens for real-time course catalogue events via Socket.io.
 * When the backend emits `course:created`, `course:updated` or `course:deleted`,
 * all connected clients see the change immediately without a full refetch.
 *
 * @param handlers  Callbacks for each course event
 */
export function useCourseSocket(handlers: CourseSocketHandlers) {
  let s: Socket | null = null

  onMounted(() => {
    s = getSocket()
    if (!s) return
    refCount++

    s.emit('join:courses')

    if (handlers.onCreated) s.on('course:created', handlers.onCreated)
    if (handlers.onUpdated) s.on('course:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.on('course:deleted', handlers.onDeleted)
  })

  onUnmounted(() => {
    if (!s) return
    s.emit('leave:courses')
    if (handlers.onCreated) s.off('course:created', handlers.onCreated)
    if (handlers.onUpdated) s.off('course:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.off('course:deleted', handlers.onDeleted)
    refCount--
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
}
