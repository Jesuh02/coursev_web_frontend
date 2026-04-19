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
            :current-user-id="currentUserId"
            :ref="el => setCommentRef(comment.id, el)"
            @reply="startReply"
            @like="toggleCommentLike"
            @edit="startEdit"
            @delete="confirmDelete"
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

      <!-- Editing banner -->
      <transition name="slide-down">
        <div v-if="editingComment" class="replying-banner editing-banner">
          <span class="replying-text">Editando comentario</span>
          <button class="cancel-reply-btn" @click="cancelEdit">
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

    <!-- Delete confirmation modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="delete-modal-backdrop" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="delete-modal-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
          <p class="delete-modal-title">Eliminar comentario</p>
          <p class="delete-modal-sub">Esta acción no se puede deshacer.</p>
          <div class="delete-modal-actions">
            <button class="delete-modal-cancel" @click="showDeleteModal = false">Cancelar</button>
            <button class="delete-modal-confirm" :disabled="deleting" @click="executeDelete">
              <span v-if="!deleting">Eliminar</span>
              <div v-else class="spinner spinner--sm" />
            </button>
          </div>
        </div>
      </div>
    </transition>
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
const deleting   = ref(false)
const comments   = ref<Comment[]>([])
const totalCount = ref(0)
const inputText  = ref('')
const replyingTo = ref<Comment | null>(null)
const editingComment = ref<Comment | null>(null)
const highlightedId = ref<number | null>(props.highlightCommentId ?? null)

// Delete modal state
const showDeleteModal   = ref(false)
const commentToDelete   = ref<Comment | null>(null)

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

// ── Submit comment (create or edit) ───────────────────────────────────────
async function submitComment() {
  const text = inputText.value.trim()
  if (!text || sending.value) return
  sending.value = true
  try {
    if (editingComment.value) {
      // Edit mode
      await commentAdapter.updateComment(editingComment.value.id, text)
      cancelEdit()
    } else {
      // Create mode
      const parentId = replyingTo.value?.id
      await commentAdapter.createComment(props.videoId, text, parentId)
      cancelReply()
    }
    inputText.value = ''
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
  cancelEdit()
  replyingTo.value = comment
  nextTick(() => inputRef.value?.focus())
}
function cancelReply() {
  replyingTo.value = null
}

// ── Edit ──────────────────────────────────────────────────────────────────
function startEdit(comment: Comment) {
  cancelReply()
  editingComment.value = comment
  inputText.value = comment.comment
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 80) + 'px'
    }
  })
}
function cancelEdit() {
  editingComment.value = null
  inputText.value = ''
}

// ── Delete ────────────────────────────────────────────────────────────────
function confirmDelete(comment: Comment) {
  commentToDelete.value = comment
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!commentToDelete.value) return
  deleting.value = true
  try {
    await commentAdapter.deleteComment(commentToDelete.value.id)
    showDeleteModal.value = false
    commentToDelete.value = null
    await loadComments()
  } catch { /* silent */ } finally {
    deleting.value = false
  }
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

.editing-banner {
  background: #2a2215;
}
.editing-banner .replying-text { color: #e0a800; }

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

/* ── Delete modal ─────────────────────────────────────────────────────────── */
.delete-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(4px);
}

.delete-modal {
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 28px 24px 22px;
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.delete-modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.delete-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-align: center;
}

.delete-modal-sub {
  font-size: 13px;
  color: #777;
  margin: 0 0 8px;
  text-align: center;
}

.delete-modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
  margin-top: 4px;
}

.delete-modal-cancel {
  flex: 1;
  padding: 11px 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #ccc;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.delete-modal-cancel:hover { background: rgba(255, 255, 255, 0.1); }

.delete-modal-confirm {
  flex: 1;
  padding: 11px 0;
  border-radius: 12px;
  border: none;
  background: #ff4757;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}
.delete-modal-confirm:disabled { opacity: 0.5; cursor: default; }
.delete-modal-confirm:not(:disabled):hover { opacity: 0.88; }

.spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.modal-fade-enter-active { transition: opacity 0.18s ease; }
.modal-fade-leave-active { transition: opacity 0.15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
