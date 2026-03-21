<template>
  <Teleport to="body">
  <!-- Backdrop oscuro — igual al BottomSheetDialog de Android -->
  <div class="comments-backdrop" @click.self="close">
    <div class="comments-sheet">
      <!-- Handle bar -->
      <div class="handle-bar" />

      <!-- Header -->
      <div class="sheet-header">
        <span class="sheet-title">
          Comentarios{{ totalCount > 0 ? ` (${totalCount})` : '' }}
        </span>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Divider -->
      <div class="divider" />

      <!-- Content area -->
      <div class="sheet-content" ref="contentRef">
        <!-- Skeleton -->
        <CommentSkeleton v-if="loading" :count="5" />

        <!-- Empty state -->
        <div v-else-if="!loading && topLevelComments.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p class="empty-title">No hay comentarios aún</p>
          <p class="empty-sub">¡Sé el primero en comentar!</p>
        </div>

        <!-- Comment list -->
        <template v-else>
          <CommentItem
            v-for="comment in topLevelComments"
            :key="comment.id"
            :comment="comment"
            :replies="getReplies(comment.id)"
            :highlighted-id="highlightedId"
            :ref="el => setCommentRef(comment.id, el)"
            @reply="startReply"
            @like="toggleCommentLike"
          />
        </template>
      </div>

      <!-- Divider above input -->
      <div class="divider" />

      <!-- Replying-to banner -->
      <transition name="slide-down">
        <div v-if="replyingTo" class="replying-banner">
          <span class="replying-text">Respondiendo a <strong>@{{ replyingTo.username ?? 'usuario' }}</strong></span>
          <button class="cancel-reply-btn" @click="cancelReply">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </transition>

      <!-- Input area -->
      <div class="input-area">
        <AppAvatar :size="36" :src="currentUserAvatar" :alt="currentUsername ?? 'U'" />

        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="inputText"
            class="comment-input"
            placeholder="Agrega un comentario..."
            rows="1"
            maxlength="500"
            @input="autoResize"
            @keydown.enter.exact.prevent="submitComment"
          />
        </div>

        <transition name="fade">
          <button
            v-if="inputText.trim()"
            class="send-btn"
            :disabled="sending"
            @click="submitComment"
          >
            <svg v-if="!sending" width="22" height="22" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            <div v-else class="spinner" />
          </button>
        </transition>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { commentAdapter, likeAdapter } from '@/infrastructure/api'
import { tokenStorage, resolveImageUrl } from '@/infrastructure/api/httpClient'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'
import CommentSkeleton from './components/CommentSkeleton.vue'
import CommentItem from './components/CommentItem.vue'

// ── Props / Emits ─────────────────────────────────────────────────────────
const props = defineProps<{
  videoId: number
  highlightCommentId?: number | null
}>()
const emit = defineEmits<{ close: [] }>()

function close() {
  emit('close')
}

// ── Stores ────────────────────────────────────────────────────────────────
const notifStore = useNotificationStore()
const authStore  = useAuthStore()

// ── Local comment type (includes API-joined user fields) ──────────────────
interface Comment {
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

// ── State ─────────────────────────────────────────────────────────────────
const loading    = ref(true)
const sending    = ref(false)
const comments   = ref<Comment[]>([])
const totalCount = ref(0)
const inputText  = ref('')
const replyingTo = ref<Comment | null>(null)
const highlightedId = ref<number | null>(props.highlightCommentId ?? null)

// DOM refs
const contentRef = ref<HTMLElement | null>(null)
const inputRef   = ref<HTMLTextAreaElement | null>(null)
const commentRefs = new Map<number, any>()

// ── Current user ──────────────────────────────────────────────────────────
const currentUserId = computed(() => tokenStorage.userId)
const currentUsername = computed(() => authStore.user?.username ?? null)
const currentUserAvatar = computed(() => {
  const url = authStore.user?.avatar ?? null
  return url ? resolveImageUrl(url) : null
})

// ── Computed ──────────────────────────────────────────────────────────────
const topLevelComments = computed(() =>
  comments.value.filter(c => !c.parent_id || c.parent_id === 0)
)

function getReplies(parentId: number): Comment[] {
  return comments.value.filter(c => c.parent_id === parentId)
}

// ── Load comments ─────────────────────────────────────────────────────────
async function loadComments() {
  loading.value = true
  try {
    const data = await commentAdapter.getCommentsByVideo(props.videoId)
    comments.value = (data as unknown as Comment[])
    totalCount.value = data.length
    loadLikes()
  } catch {
    comments.value = []
  } finally {
    loading.value = false
  }
}

async function loadLikes() {
  for (const c of comments.value) {
    try {
      c._likeCount = await likeAdapter.getLikeCount('comment', c.id)
      if (currentUserId.value) {
        c._liked = await likeAdapter.checkLike('comment', c.id)
      }
    } catch { /* silent */ }
  }
}

// ── Submit comment ────────────────────────────────────────────────────────
async function submitComment() {
  const text = inputText.value.trim()
  if (!text || sending.value) return
  sending.value = true
  try {
    const parentId = replyingTo.value?.id
    await commentAdapter.createComment(props.videoId, text, parentId)
    inputText.value = ''
    cancelReply()
    await notifStore.fetchUnreadCount()
    await loadComments()
    nextTick(() => {
      if (contentRef.value) contentRef.value.scrollTop = contentRef.value.scrollHeight
    })
  } catch { /* silent */ } finally {
    sending.value = false
  }
}

// ── Reply ─────────────────────────────────────────────────────────────────
function startReply(comment: Comment) {
  replyingTo.value = comment
  nextTick(() => inputRef.value?.focus())
}
function cancelReply() {
  replyingTo.value = null
}

// ── Like ──────────────────────────────────────────────────────────────────
async function toggleCommentLike(comment: Comment) {
  if (!currentUserId.value) return
  const prev = comment._liked
  comment._liked = !prev
  comment._likeCount = (comment._likeCount ?? 0) + (comment._liked ? 1 : -1)
  try {
    await likeAdapter.toggleLike('comment', comment.id)
  } catch {
    comment._liked = prev
    comment._likeCount = (comment._likeCount ?? 0) + (prev ? 1 : -1)
  }
}

// ── Auto-resize textarea ──────────────────────────────────────────────────
function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 80) + 'px'
}

// ── Comment refs for scroll/highlight ────────────────────────────────────
function setCommentRef(id: number, el: any) {
  if (el) commentRefs.set(id, el)
}
async function scrollToHighlighted(id: number) {
  await nextTick()
  // Direct hit: top-level comment
  let el = commentRefs.get(id)

  // If not found, id might be a reply — scroll to its parent top-level comment
  if (!el) {
    const reply = comments.value.find(c => c.id === id)
    if (reply?.parent_id) {
      el = commentRefs.get(reply.parent_id)
    }
  }

  const target = el?.$el ?? el
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ── Scroll lock on body ───────────────────────────────────────────────────
onMounted(async () => {
  document.body.style.overflow = 'hidden'
  await loadComments()
  if (props.highlightCommentId) {
    highlightedId.value = props.highlightCommentId
    nextTick(() => scrollToHighlighted(props.highlightCommentId!))
  }
})
onUnmounted(() => {
  document.body.style.overflow = ''
})

// Re-load when videoId changes (e.g. staying on same view)
watch(() => props.videoId, () => {
  comments.value = []
  loadComments()
})
</script>

<style scoped>
/* Backdrop */
.comments-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Bottom sheet panel */
.comments-sheet {
  width: 100%;
  max-width: 600px;
  background: #1a1a1a;
  border-radius: 20px 20px 0 0;
  min-height: 55vh;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* iOS safe-area */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  animation: sheet-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes sheet-up {
  from { transform: translateY(100%); opacity: 0.5; }
  to   { transform: translateY(0);    opacity: 1;   }
}

/* Handle bar */
.handle-bar {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #444;
  align-self: center;
  margin: 12px auto 14px;
  flex-shrink: 0;
}

/* Header */
.sheet-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 16px 14px;
  flex-shrink: 0;
}

.sheet-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-align: center;
}

.close-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover { background: rgba(255,255,255,0.08); }

/* Divider */
.divider {
  height: 0.5px;
  background: #333;
  flex-shrink: 0;
}

/* Content area (scrollable) */
.sheet-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  overscroll-behavior: contain;
}
.sheet-content::-webkit-scrollbar { display: none; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 8px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #888;
  margin: 0;
}
.empty-sub {
  font-size: 13px;
  color: #555;
  margin: 0;
}

/* Replying-to banner */
.replying-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #222;
  padding: 8px 16px;
  flex-shrink: 0;
}
.replying-text {
  font-size: 12px;
  color: #aaa;
}
.replying-text strong { color: #1d9bf0; }
.cancel-reply-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
}

/* Input area */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 16px 16px;
  background: #1a1a1a;
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
  background: #2c2c2e;
  border-radius: 20px;
  padding: 10px 14px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

.comment-input {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  resize: none;
  max-height: 80px;
  line-height: 1.4;
  font-family: inherit;
}

.comment-input::placeholder {
  color: #666;
}

.send-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.send-btn:disabled { opacity: 0.4; }

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #444;
  border-top-color: #1d9bf0;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,
.fade-leave-to    { opacity: 0; }
</style>
