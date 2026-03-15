import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/domain/models'
import { notificationAdapter } from '@/infrastructure/api'

export const useNotificationStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications(page = 1) {
    loading.value = true
    try {
      items.value = await notificationAdapter.getMyNotifications(page)
      unreadCount.value = items.value.filter(i => !i.is_read).length
    } catch { /* silent */ }
    finally { loading.value = false }
  }

  async function fetchUnreadCount() {
    try { unreadCount.value = await notificationAdapter.getUnreadCount() }
    catch { /* silent */ }
  }

  async function markRead(id: number) {
    await notificationAdapter.markAsRead(id)
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
