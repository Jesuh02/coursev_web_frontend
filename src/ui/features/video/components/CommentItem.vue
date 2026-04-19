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
          <div v-if="currentUserId && comment.usuario_id === currentUserId" class="more-menu-wrap">
            <button class="more-btn" @click.stop="toggleMenu(comment.id)" aria-label="Opciones">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#666"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
            <transition name="menu-pop">
              <div v-if="openMenuId === comment.id" class="action-menu" @click.stop>
                <button class="action-menu-item" @click="handleEdit(comment)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d9bf0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button class="action-menu-item action-menu-item--danger" @click="handleDelete(comment)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Eliminar
                </button>
              </div>
            </transition>
          </div>
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
                  <div v-if="currentUserId && reply.usuario_id === currentUserId" class="more-menu-wrap">
                    <button class="more-btn" @click.stop="toggleMenu(reply.id)" aria-label="Opciones">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#666"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                    </button>
                    <transition name="menu-pop">
                      <div v-if="openMenuId === reply.id" class="action-menu" @click.stop>
                        <button class="action-menu-item" @click="handleEdit(reply)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d9bf0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                        <button class="action-menu-item action-menu-item--danger" @click="handleDelete(reply)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Eliminar
                        </button>
                      </div>
                    </transition>
                  </div>
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

const emit = defineEmits<{
  reply: [c: CommentWithMeta]
  like: [c: CommentWithMeta]
  edit: [c: CommentWithMeta]
  delete: [c: CommentWithMeta]
}>()

const repliesExpanded = ref(false)
const openMenuId = ref<number | null>(null)

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function handleEdit(comment: CommentWithMeta) {
  openMenuId.value = null
  emit('edit', comment)
}

function handleDelete(comment: CommentWithMeta) {
  openMenuId.value = null
  emit('delete', comment)
}

// Close menu when clicking outside
function onDocClick() {
  openMenuId.value = null
}
import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

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
  align-items: center;
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

/* ── More (⋯) menu ── */
.more-menu-wrap {
  position: relative;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  opacity: 0.55;
  transition: opacity 0.15s, background 0.15s;
}
.more-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.06);
}

.action-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: #232323;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  min-width: 130px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.action-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 11px 14px;
  background: none;
  border: none;
  color: #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.action-menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
}
.action-menu-item + .action-menu-item {
  border-top: 0.5px solid rgba(255, 255, 255, 0.06);
}
.action-menu-item--danger {
  color: #ff4757;
}
.action-menu-item--danger svg { stroke: #ff4757; }

/* menu-pop transition */
.menu-pop-enter-active { transition: opacity 0.13s ease, transform 0.13s ease; }
.menu-pop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.menu-pop-enter-from, .menu-pop-leave-to { opacity: 0; transform: scale(0.92) translateY(4px); }

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
