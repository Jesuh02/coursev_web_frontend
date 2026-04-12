import { onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL_QA as string)

export interface ChatSocketMessage {
  id: number | string
  message?: string
  isFromUser?: boolean
  is_from_user?: boolean
  timestamp?: number | string
  createdAt?: string
  created_at?: string
  hasCalification?: boolean
  has_calification?: boolean
  calificationValue?: string | null
  calification_value?: string | null
  calificationAdded?: boolean
  calification_added?: boolean
  excelUrl?: string | null
  excel_url?: string | null
  origin?: string
  session_id?: string
}

// Shared singleton socket connection reused across component instances
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

/**
 * Composable that listens for real-time chat messages via Socket.io.
 * @param userId  Current user id (null = skip)
 * @param origin  Chat origin string, e.g. 'chatbot_llm' or 'db_query'
 * @param onMessage  Callback invoked when a new chat message arrives
 */
export function useChatSocket(
  userId: number | null,
  origin: string,
  onMessage: (msg: ChatSocketMessage) => void,
) {
  let s: Socket | null = null
  // Room must match backend format: chat:{userId}:{origin}
  const hasRoom = userId != null && userId > 0

  onMounted(() => {
    if (!hasRoom) return
    s = getSocket()
    if (!s) return
    refCount++

    // Backend expects an object { userId, origin } for join/leave
    s.emit('join:chat', { userId, origin })
    // Backend emits 'chat:new-message'
    s.on('chat:new-message', onMessage)
  })

  onUnmounted(() => {
    if (!hasRoom || !s) return
    s.emit('leave:chat', { userId, origin })
    s.off('chat:new-message', onMessage)
    refCount--
    if (refCount <= 0 && socket) {
      socket.disconnect()
      socket = null
      refCount = 0
    }
  })
}
