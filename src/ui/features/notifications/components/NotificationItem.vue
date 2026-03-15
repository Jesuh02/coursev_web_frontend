<template>
  <div class="notification-item" :class="{ unread: !notification.is_read }">
    <div class="notif-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </div>
    <div class="notif-content">
      <p class="notif-category">Para ti</p>
      <p class="notif-message">{{ notification.message }}</p>
      <p class="notif-time">{{ timeAgo(notification.created_at) }}</p>
    </div>
    <div v-if="notification.thumbnail_url ?? notification.thumbnailUrl" class="notif-thumb">
      <img :src="(notification.thumbnail_url ?? notification.thumbnailUrl)!" alt="" />
    </div>
    <div v-if="!notification.is_read" class="unread-dot" />
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '@/domain/models'

defineProps<{ notification: Notification }>()

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days} días`
}
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #121212;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  position: relative;
}

.notification-item.unread {
  background: rgba(98, 0, 238, 0.05);
}

.notif-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(191, 90, 242, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-category {
  font-size: 12px;
  font-weight: 600;
  color: #BF5AF2;
  margin-bottom: 2px;
}

.notif-message {
  font-size: 14px;
  color: #ccc;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-time {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.notif-thumb {
  width: 72px;
  height: 90px;
  border-radius: 8px;
  background: #2A2A2A;
  overflow: hidden;
  flex-shrink: 0;
}

.notif-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #007AFF;
}
</style>
