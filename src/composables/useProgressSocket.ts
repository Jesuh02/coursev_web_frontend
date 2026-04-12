import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL_QA as string) || 'https://mcp-backenddeploy-production-4ed0.up.railway.app'

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

export interface ProgressUpdatePayload {
  userId: number
  videoId: number
  courseId: number
  secondsWatched: number
  completed: boolean
}

export interface ProgressSocketHandlers {
  /** Fired when another device updates progress for this user */
  onProgressUpdated?: (data: ProgressUpdatePayload) => void
  /** Fired when a video is marked as completed */
  onVideoCompleted?: (data: ProgressUpdatePayload) => void
}

/**
 * Composable that listens for real-time progress sync events via Socket.io.
 * Useful for keeping progress in sync across multiple devices or
 * letting teachers see student progress live.
 *
 * @param userId  Current user id (null = skip, no socket created)
 * @param handlers  Callbacks for each progress event
 */
export function useProgressSocket(
  userId: number | null,
  handlers: ProgressSocketHandlers,
) {
  let s: Socket | null = null
  const room = userId ? `progress:${userId}` : null

  onMounted(() => {
    if (!room) return
    s = getSocket()
    if (!s) return
    refCount++

    s.emit('join:progress', userId)

    if (handlers.onProgressUpdated) s.on('progress:updated', handlers.onProgressUpdated)
    if (handlers.onVideoCompleted) s.on('progress:completed', handlers.onVideoCompleted)
  })

  onUnmounted(() => {
    if (!room || !s) return
    s.emit('leave:progress', userId)
    if (handlers.onProgressUpdated) s.off('progress:updated', handlers.onProgressUpdated)
    if (handlers.onVideoCompleted) s.off('progress:completed', handlers.onVideoCompleted)
    refCount--
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
}
