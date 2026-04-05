import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import type { Notification } from '@/domain/models'
import { notificationAdapter } from '@/infrastructure/api'

const SOCKET_URL = 'https://mcp-backenddeploy-production-4ed0.up.railway.app'
const MOJIBAKE_PATTERN = /(?:Ã.|Â.|â.|ð.|Ð.|Ñ.)/

function normalizeMojibake(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return value ?? null
  if (!MOJIBAKE_PATTERN.test(value)) return value

  try {
    const bytes = Uint8Array.from(value, char => char.charCodeAt(0) & 0xff)
    const decoded = new TextDecoder('utf-8').decode(bytes)
    return decoded.includes('\uFFFD') ? value : decoded
  } catch {
    return value
  }
}

function normalizeNotification(notification: Notification): Notification {
  return {
    ...notification,
    title: normalizeMojibake(notification.title) ?? '',
    message: normalizeMojibake(notification.message) ?? '',
    sender_username: normalizeMojibake(notification.sender_username),
    metadata: normalizeMojibake(notification.metadata),
  }
}

/** Show a browser push notification via ServiceWorker (works in background). */
async function showBrowserNotification(title: string, body: string, icon?: string, notifData?: Partial<Notification>) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    icon: icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    tag: notifData?.id ? `notif-${notifData.id}` : 'coursev-notification',
    data: notifData,
  }

  // Prefer SW showNotification – renders even when tab is in background
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch { /* fall through */ }
  }

  try {
    new Notification(title, options)
  } catch { /* Silently ignore – unsupported on some browsers */ }
}

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  // ── Socket.io ──────────────────────────────────────────────────
  let socket: Socket | null = null
  let connectedUserId: number | null = null

  function connectSocket(userId: number) {
    if (connectedUserId === userId && socket?.connected) return
    disconnectSocket()
    connectedUserId = userId
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
    })
    socket.on('connect', () => {
      socket!.emit('join:user', userId)
    })
    // Hydrate badge count as soon as the server acknowledges the room join
    socket.on('notification:unread_count', (count: number) => {
      unreadCount.value = typeof count === 'number' ? count : 0
    })
    socket.on('notification:new', (raw: Notification) => {
      const notif = normalizeNotification(raw)
      // Prepend only if not already in list
      if (!items.value.find(n => n.id === notif.id)) {
        items.value = [notif, ...items.value]
        unreadCount.value = items.value.filter(i => !i.is_read).length
      }
      // Browser push notification
      void showBrowserNotification(
        notif.title ?? 'Nueva notificación',
        notif.message ?? '',
        notif.thumbnail_url ?? notif.thumbnailUrl ?? undefined,
        notif,
      )
    })
  }

  function disconnectSocket() {
    if (socket) {
      if (connectedUserId != null) socket.emit('leave:user', connectedUserId)
      socket.disconnect()
      socket = null
      connectedUserId = null
    }
  }

  /** Request browser notification permission (call once on user interaction or app start). */
  async function requestBrowserPermission() {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  async function fetchNotifications(page = 1) {
    loading.value = true
    try {
      items.value = (await notificationAdapter.getMyNotifications(page)).map(normalizeNotification)
      unreadCount.value = items.value.filter(i => !i.is_read).length
    } catch { /* silent */ }
    finally { loading.value = false }
  }

  async function fetchUnreadCount() {
    try { unreadCount.value = await notificationAdapter.getUnreadCount() }
    catch { /* silent */ }
  }

  async function markRead(id: number) {
    try {
      await notificationAdapter.markAsRead(id)
    } catch { /* CORS / network errors are non-critical */ }
    const item = items.value.find(i => i.id === id)
    if (item) {
      item.is_read = true
      unreadCount.value = items.value.filter(i => !i.is_read).length
    }
  }

  async function markAllRead() {
    await notificationAdapter.markAllAsRead()
    items.value.forEach(i => i.is_read = true)
    unreadCount.value = 0
  }

  /** Register a custom event listener on the shared user socket. */
  function onSocketEvent(event: string, handler: (...args: any[]) => void) {
    socket?.on(event, handler)
  }

  /** Remove a custom event listener from the shared user socket. */
  function offSocketEvent(event: string, handler: (...args: any[]) => void) {
    socket?.off(event, handler)
  }

  return {
    items, unreadCount, loading,
    fetchNotifications, fetchUnreadCount, markRead, markAllRead,
    connectSocket, disconnectSocket, requestBrowserPermission,
    onSocketEvent, offSocketEvent,
  }
})
