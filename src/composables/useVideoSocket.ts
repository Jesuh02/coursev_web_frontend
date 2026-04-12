import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { Video } from '@/domain/models'

const SOCKET_URL = (import.meta.env.VITE_API_URL_QA as string)

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

export interface VideoSocketHandlers {
  onCreated?: (video: Video) => void
  onUpdated?: (video: Video) => void
  onDeleted?: (data: { id: number }) => void
}

export function useVideoSocket(handlers: VideoSocketHandlers) {
  let s: Socket | null = null

  onMounted(() => {
    s = getSocket()
    if (!s) return
    refCount++

    s.emit('join:videos')

    if (handlers.onCreated) s.on('video:created', handlers.onCreated)
    if (handlers.onUpdated) s.on('video:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.on('video:deleted', handlers.onDeleted)
  })

  onUnmounted(() => {
    if (!s) return
    s.emit('leave:videos')
    if (handlers.onCreated) s.off('video:created', handlers.onCreated)
    if (handlers.onUpdated) s.off('video:updated', handlers.onUpdated)
    if (handlers.onDeleted) s.off('video:deleted', handlers.onDeleted)
    refCount--
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
}
