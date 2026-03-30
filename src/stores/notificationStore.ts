import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/domain/models'
import { notificationAdapter } from '@/infrastructure/api'

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
    title: normalizeMojibake(notification.title),
    message: normalizeMojibake(notification.message) ?? '',
    sender_username: normalizeMojibake(notification.sender_username),
    metadata: normalizeMojibake(notification.metadata),
  }
}

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

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

  return { items, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead }
})
