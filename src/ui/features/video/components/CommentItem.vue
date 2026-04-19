<template>
  <div class="comment-item" :class="{ highlighted: highlightedId === comment.id }">
    <!-- Avatar + body -->
    <div class="comment-main">
      <AppAvatar
        class="comment-avatar"
        :size="36"
        :src="comment.senderAvatarUrl ?? comment.avatar ?? null"
        :alt="comment.username ?? 'U'"
      />

      <div class="comment-body">
        <!-- Username + time -->
        <div class="comment-meta-row">
          <span class="comment-username">{{ comment.username ?? 'Usuario' }}</span>
          <span class="comment-time">{{ timeAgo(comment.created_at) }}</span>
        </div>

        <!-- Text -->
        <p class="comment-text">{{ comment.comment }}</p>

        <!-- Actions row -->
        <div class="comment-actions">
          <button class="reply-btn" @click="$emit('reply', comment)">Responder</button>
          <template v-if="currentUserId && comment.usuario_id === currentUserId">
            <button class="edit-btn" @click="$emit('edit', comment)">Editar</button>
            <button class="delete-btn" @click="$emit('delete', comment)">Eliminar</button>
          </template>
        </div>

        <!-- Replies -->
        <div v-if="replies.length" class="replies-section">
          <button class="toggle-replies-btn" @click="repliesExpanded = !repliesExpanded">
            <span class="dash-line" />
            <span>{{ repliesExpanded ? 'Ocultar respuestas' : `Ver ${replies.length} respuesta${replies.length > 1 ? 's' : ''}` }}</span>
          </button>

          <div v-if="repliesExpanded" class="replies-list">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="reply-item"
              :class="{ highlighted: highlightedId === reply.id }"
            >
              <AppAvatar :size="28" :src="reply.senderAvatarUrl ?? null" :alt="reply.username ?? 'U'" />
              <div class="reply-body">
                <div class="comment-meta-row">
                  <span class="comment-username">{{ reply.username ?? 'Usuario' }}</span>
                  <span class="comment-time">{{ timeAgo(reply.created_at) }}</span>
                </div>
                <p class="comment-text">{{ reply.comment }}</p>
                <div class="comment-actions">
                  <button class="reply-btn" @click="$emit('reply', reply)">Responder</button>
                  <template v-if="currentUserId && reply.usuario_id === currentUserId">
                    <button class="edit-btn" @click="$emit('edit', reply)">Editar</button>
                    <button class="delete-btn" @click="$emit('delete', reply)">Eliminar</button>
                  </template>
                </div>
              </div>
              <!-- Like reply -->
              <div class="like-section">
                <button
                  class="like-btn"
                  :class="{ liked: reply._liked }"
                  @click="$emit('like', reply)"
                >
                  <svg v-if="reply._liked" width="16" height="16" viewBox="0 0 24 24" fill="#ff2d55"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span v-if="(reply._likeCount ?? 0) > 0" class="like-count">{{ reply._likeCount }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Like (top-level comment) -->
      <div class="like-section">
        <button
          class="like-btn"
          :class="{ liked: comment._liked }"
          @click="$emit('like', comment)"
        >
          <svg v-if="comment._liked" width="18" height="18" viewBox="0 0 24 24" fill="#ff2d55"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span v-if="(comment._likeCount ?? 0) > 0" class="like-count">{{ comment._likeCount }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'

// Local comment type — mirrors VideoComment + joined user fields from API
export interface CommentWithMeta {
  id: number
  video_id: number
  usuario_id: number
  comment: string
  created_at: string | null
  parent_id: number | null
  // Joined from API
  username?: string | null
  avatar?: string | null
  senderAvatarUrl?: string | null
  // Client state
  _liked?: boolean
  _likeCount?: number
}

const props = defineProps<{
  comment: CommentWithMeta
  replies: CommentWithMeta[]
  highlightedId?: number | null
  currentUserId?: number | null
}>()

defineEmits<{
  reply: [c: CommentWithMeta]
  like: [c: CommentWithMeta]
  edit: [c: CommentWithMeta]
  delete: [c: CommentWithMeta]
}>()

const repliesExpanded = ref(false)

// Auto-expand replies if the highlighted comment is a reply inside this comment
watch(
  () => props.highlightedId,
  (id) => {
    if (id && props.replies.some(r => r.id === id)) {
      repliesExpanded.value = true
    }
  },
  { immediate: true }
)

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'ahora'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return `${Math.floor(d / 7)}sem`
}
</script>

<style scoped>
.comment-item {
  padding: 12px 16px;
  border-bottom: 0.5px solid #2a2a2a;
  transition: background 0.3s;
}

.comment-item.highlighted {
  animation: highlight-pulse 2.8s ease-out forwards;
  border-radius: 8px;
}

.comment-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.comment-avatar { flex-shrink: 0; }

.comment-body { flex: 1; min-width: 0; }

.comment-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-username {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.comment-time {
  font-size: 11px;
  color: #666;
}

.comment-text {
  font-size: 14px;
  color: #e0e0e0;
  line-height: 1.4;
  margin: 0 0 6px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.reply-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.reply-btn:hover { color: #bbb; }

.edit-btn {
  background: none;
  border: none;
  color: #1d9bf0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.edit-btn:hover { color: #4db5f9; }

.delete-btn {
  background: none;
  border: none;
  color: #ff4757;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.delete-btn:hover { color: #ff6b7a; }

/* Replies section */
.replies-section { margin-top: 8px; }

.toggle-replies-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #1d9bf0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}

.dash-line {
  display: inline-block;
  width: 22px;
  height: 1px;
  background: #1d9bf0;
}

.replies-list { margin-top: 6px; }

.reply-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 0;
  transition: background 0.3s;
  border-radius: 8px;
}

.reply-item.highlighted {
  animation: highlight-pulse 2.8s ease-out forwards;
}

@keyframes highlight-pulse {
  0%   { background: transparent; }
  12%  { background: rgba(255, 214, 0, 0.22); }
  28%  { background: rgba(255, 214, 0, 0.06); }
  44%  { background: rgba(255, 214, 0, 0.18); }
  60%  { background: rgba(255, 214, 0, 0.04); }
  100% { background: transparent; }
}

.reply-body { flex: 1; min-width: 0; }

/* Like button */
.like-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
}

.like-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: transform 0.15s;
}
.like-btn:active { transform: scale(1.3); }

.like-count {
  font-size: 10px;
  color: #666;
}
</style>
