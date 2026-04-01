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

    <!-- subject_access_blocked / enrollment_revoked dialog -->
    <div v-if="blockAlert" class="block-alert-overlay" @click.self="blockAlert = null">
      <div class="block-alert-card">
        <h2 class="block-alert-title">{{ blockAlertTitle }}</h2>
        <p class="block-alert-msg">{{ blockAlert }}</p>
        <button class="block-alert-btn" @click="blockAlert = null">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import type { Notification } from '@/domain/models'
import NotificationItem from './components/NotificationItem.vue'
import NotificationSkeleton from './components/NotificationSkeleton.vue'

const notifStore = useNotificationStore()
const router = useRouter()
const blockAlert = ref<string | null>(null)
const blockAlertTitle = ref('Acceso restringido')

onMounted(() => {
  notifStore.fetchNotifications()
  notifStore.requestBrowserPermission()
})

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

    case 'new_video': {
      // If the video belongs to a course, navigate to subjects list; otherwise to video details
      const courseId = extractId(meta, 'course_id', 'courseId')
      if (courseId) {
        router.push({ name: 'subjectsList', params: { courseId } })
      } else if (relatedId) {
        router.push({ name: 'videoDetails', params: { id: relatedId } })
      }
      break
    }

    case 'new_task':
    case 'task_submission': {
      const taskId = extractId(meta, 'task_id', 'taskId') ?? relatedId
      const courseId = extractId(meta, 'course_id', 'courseId')
      if (taskId) {
        const query: Record<string, string> = {}
        if (courseId) query.courseId = String(courseId)
        if (notification.sender_username) query.fromUser = notification.sender_username
        router.push({ name: 'taskSubmission', params: { taskId }, query })
      }
      break
    }

    case 'task_graded':
      handleTaskGraded(notification, relatedId, meta)
      break

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
    case 'enrollment_approved':
    case 'course_invitation': {
      const courseId = extractId(meta, 'course_id', 'courseId') ?? relatedId
      if (courseId) router.push({ name: 'subjectsList', params: { courseId } })
      break
    }

    case 'enrollment_request': {
      const courseId = extractId(meta, 'course_id', 'courseId') ?? relatedId
      const courseName = String(meta.courseName ?? meta.course_name ?? '').trim()
      const query: Record<string, string> = {
        tab: 'enrollment',
        subtab: 'pre',
      }
      if (courseId) query.courseId = String(courseId)
      if (courseName) query.courseName = courseName
      if (notification.sender_username) query.username = notification.sender_username
      router.push({ name: 'adminDashboard', query })
      break
    }

    case 'subject_access_blocked': {
      const reason = (meta.reason as string) || notification.message || 'Sin motivo especificado'
      blockAlertTitle.value = 'Acceso a materia restringido'
      blockAlert.value = reason
      break
    }

    case 'enrollment_revoked': {
      const reason = (meta.reason as string) || notification.message || 'Sin motivo especificado'
      blockAlertTitle.value = 'Acceso al curso revocado'
      blockAlert.value = reason
      break
    }
  }
}

async function handleTaskGraded(
  notification: Notification,
  relatedId: number | null,
  meta: Record<string, unknown>,
) {
  // Try metadata first (most reliable)
  let taskId: number | null = extractId(meta, 'task_id', 'taskId')

  // related_id may be a submissionId — fetch submission to resolve task_id
  if (!taskId && relatedId) {
    try {
      const sub = await submissionAdapter.getSubmissionById(relatedId)
      taskId = sub?.task_id ?? null
    } catch {
      // If fetch fails, fall back to using relatedId directly as taskId
      taskId = relatedId
    }
  }

  taskId = taskId ?? relatedId
  if (taskId) router.push({ name: 'taskSubmission', params: { taskId } })
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

.block-alert-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.block-alert-card {
  background: var(--bg-secondary, #1c1c1e);
  border-radius: 16px;
  padding: 24px;
  max-width: 320px;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.block-alert-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.block-alert-msg {
  font-size: 14px;
  color: #aeaeb2;
  line-height: 1.5;
}

.block-alert-btn {
  align-self: flex-end;
  background: #0a84ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
