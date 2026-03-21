<template>
  <div class="notifications-view">
    <div class="notifications-header">
      <h1 class="header-title">Notificaciones</h1>
    </div>

    <NotificationSkeleton v-if="notifStore.loading" />

    <div v-else-if="notifStore.items.length" class="notification-list">
      <NotificationItem
        v-for="n in notifStore.items"
        :key="n.id"
        :notification="n"
        @click="handleClick(n)"
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">👍</div>
      <p class="empty-title">¡Hurra! Ya estás al día</p>
      <p class="empty-desc">No tienes notificaciones nuevas</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import type { Notification } from '@/domain/models'
import NotificationItem from './components/NotificationItem.vue'
import NotificationSkeleton from './components/NotificationSkeleton.vue'

const notifStore = useNotificationStore()
const router = useRouter()

onMounted(() => notifStore.fetchNotifications())

function parseMetadata(raw: string | null): Record<string, unknown> {
  if (!raw) return {}
  try {
    let str = raw.trim()
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }
    return str.startsWith('{') ? JSON.parse(str) : {}
  } catch {
    return {}
  }
}

function extractId(meta: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = Number(meta[k])
    if (Number.isFinite(v) && v > 0) return v
  }
  return null
}

function handleClick(notification: Notification) {
  if (!notification.is_read) notifStore.markRead(notification.id)

  const relatedId = notification.related_id
  const meta = parseMetadata(notification.metadata)

  switch (notification.type) {
    case 'new_course':
      if (relatedId) router.push({ name: 'courseDetail', params: { id: relatedId } })
      break

    case 'new_video':
      if (relatedId) router.push({ name: 'videoDetails', params: { id: relatedId } })
      break

    case 'new_task':
    case 'task_submission':
    case 'task_graded': {
      const taskId = extractId(meta, 'task_id', 'taskId') ?? relatedId
      if (taskId) router.push({ name: 'taskSubmission', params: { taskId } })
      break
    }

    case 'video_like': {
      const videoId = extractId(meta, 'video_id', 'videoId') ?? relatedId
      if (videoId) router.push({ name: 'videoDetails', params: { id: videoId } })
      break
    }

    case 'comment':
    case 'like':
    case 'video_comment':
    case 'comment_reply':
    case 'comment_like': {
      const videoId = extractId(meta, 'video_id', 'videoId') ?? relatedId
      const commentId = extractId(meta, 'comment_id', 'commentId', 'parentCommentId')
      if (videoId) {
        const query: Record<string, string> = { openComments: String(videoId) }
        if (commentId) query.commentId = String(commentId)
        query.notifId = String(notification.id)
        router.push({ name: 'videoHome', query })
      }
      break
    }

    case 'chat_response':
      router.push({ name: 'chatbot' })
      break

    case 'collaborator_added':
    case 'enrollment_approved': {
      const courseId = extractId(meta, 'course_id', 'courseId') ?? relatedId
      if (courseId) router.push({ name: 'courseDetail', params: { id: courseId } })
      break
    }

    case 'enrollment_request':
      router.push({ name: 'adminDashboard' })
      break
  }
}
</script>

<style scoped>
.notifications-view {
  height: 100vh;
  overflow-y: auto;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.notifications-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 14px;
  color: #8E8E93;
}
</style>
