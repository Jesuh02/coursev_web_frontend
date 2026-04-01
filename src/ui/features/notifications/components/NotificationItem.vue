<template>
  <div class="notification-item" :class="{ unread: !notification.is_read }">
    <div class="notif-icon" :class="iconClass">
      <!-- Collaborator Added -->
      <svg v-if="notification.type === 'collaborator_added'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
      </svg>
      <!-- Enrollment Request -->
      <svg v-else-if="notification.type === 'enrollment_request'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      <!-- Enrollment Approved -->
      <svg v-else-if="notification.type === 'enrollment_approved'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <!-- Enrollment Revoked -->
      <svg v-else-if="notification.type === 'enrollment_revoked'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <!-- Subject Access Blocked -->
      <svg v-else-if="notification.type === 'subject_access_blocked'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <!-- Default heart icon -->
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </div>
    <div class="notif-content">
      <p class="notif-title" v-if="notification.title">{{ notification.title }}</p>
      <p class="notif-message">{{ notification.message }}</p>
      <p class="notif-time">{{ timeAgo(notification.created_at) }}</p>
    </div>
    <div v-if="thumbnailSrc" class="notif-thumb">
      <img :src="thumbnailSrc" alt="" />
    </div>
    <div v-if="!notification.is_read" class="unread-dot" />
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '@/domain/models'
import { computed } from 'vue'
import { resolveImageUrl } from '@/infrastructure/api'

const props = defineProps<{ notification: Notification }>()

const thumbnailSrc = computed(() =>
  resolveImageUrl(props.notification.thumbnail_url || props.notification.thumbnailUrl)
)

const iconClass = computed(() => {
  switch (props.notification.type) {
    case 'collaborator_added': return 'icon-collaborator'
    case 'enrollment_request': return 'icon-enrollment'
    case 'enrollment_approved': return 'icon-approved'
    case 'enrollment_revoked': return 'icon-revoked'
    case 'subject_access_blocked': return 'icon-blocked'
    default: return 'icon-default'
  }
})

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
  cursor: pointer;
  transition: background 0.15s;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notification-item:active {
  background: rgba(255, 255, 255, 0.06);
}

.notification-item.unread {
  background: rgba(98, 0, 238, 0.05);
}

.notification-item.unread:hover {
  background: rgba(98, 0, 238, 0.09);
}

.notif-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon.icon-default {
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
}

.notif-icon.icon-collaborator {
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
}

.notif-icon.icon-enrollment {
  background: rgba(14, 165, 233, 0.15);
  color: #0EA5E9;
}

.notif-icon.icon-approved {
  background: rgba(34, 197, 94, 0.15);
  color: #22C55E;
}

.notif-icon.icon-revoked {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
}

.notif-icon.icon-blocked {
  background: rgba(255, 149, 0, 0.15);
  color: #FF9500;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
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
