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

        <!-- Text (or edit mode) -->
        <template v-if="editingId === comment.id">
          <textarea
            v-model="editText"
            class="edit-input"
            rows="2"
            maxlength="500"
            @keydown.esc="cancelEdit"
          />
          <div class="edit-actions">
            <button class="edit-btn cancel" @click="cancelEdit">Cancelar</button>
            <button class="edit-btn save" :disabled="!editText.trim() || savingEdit" @click="saveEdit(comment)">Guardar</button>
          </div>
        </template>
        <p v-else class="comment-text">
          {{ comment.comment }}
          <span v-if="isEdited(comment)" class="edited-tag">(editado)</span>
        </p>

        <!-- Actions row -->
        <div v-if="editingId !== comment.id" class="comment-actions">
          <button class="reply-btn" @click="$emit('reply', comment)">Responder</button>
          <template v-if="isOwner(comment)">
            <button class="reply-btn" @click="startEdit(comment)">Editar</button>
            <button class="reply-btn danger" @click="confirmDelete(comment)">Eliminar</button>
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
                <template v-if="editingId === reply.id">
                  <textarea
                    v-model="editText"
                    class="edit-input"
                    rows="2"
                    maxlength="500"
                    @keydown.esc="cancelEdit"
                  />
                  <div class="edit-actions">
                    <button class="edit-btn cancel" @click="cancelEdit">Cancelar</button>
                    <button class="edit-btn save" :disabled="!editText.trim() || savingEdit" @click="saveEdit(reply)">Guardar</button>
                  </div>
                </template>
                <p v-else class="comment-text">
                  {{ reply.comment }}
                  <span v-if="isEdited(reply)" class="edited-tag">(editado)</span>
                </p>
                <div v-if="editingId !== reply.id" class="comment-actions">
                  <button class="reply-btn" @click="$emit('reply', reply)">Responder</button>
                  <template v-if="isOwner(reply)">
                    <button class="reply-btn" @click="startEdit(reply)">Editar</button>
                    <button class="reply-btn danger" @click="confirmDelete(reply)">Eliminar</button>
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

const emit = defineEmits<{
  reply: [c: CommentWithMeta]
  like: [c: CommentWithMeta]
  edit: [payload: { id: number; content: string }]
  delete: [c: CommentWithMeta]
}>()

const repliesExpanded = ref(false)
const editingId = ref<number | null>(null)
const editText = ref('')
const savingEdit = ref(false)

function isOwner(c: CommentWithMeta): boolean {
  const uid = props.currentUserId
  if (!uid) return false
  const ownerId = (c as any).usuario_id ?? (c as any).userId
  return Number(ownerId) === Number(uid)
}

function isEdited(c: CommentWithMeta): boolean {
  const anyC = c as any
  return Boolean(anyC.updatedAt || anyC.updated_at)
}

function startEdit(c: CommentWithMeta) {
  editingId.value = c.id
  editText.value = c.comment
}

function cancelEdit() {
  editingId.value = null
  editText.value = ''
}

async function saveEdit(c: CommentWithMeta) {
  const content = editText.value.trim()
  if (!content) return
  savingEdit.value = true
  try {
    emit('edit', { id: c.id, content })
  } finally {
    savingEdit.value = false
    cancelEdit()
  }
}

function confirmDelete(c: CommentWithMeta) {
  if (window.confirm('¿Eliminar este comentario?')) {
    emit('delete', c)
  }
}

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
.reply-btn.danger { color: #ff5a5a; }
.reply-btn.danger:hover { color: #ff8080; }

.edited-tag {
  font-size: 11px;
  color: #666;
  margin-left: 4px;
}

.edit-input {
  width: 100%;
  background: #111;
  color: #e0e0e0;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  margin: 4px 0 6px;
}
.edit-input:focus { border-color: #1d9bf0; }

.edit-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.edit-btn {
  background: none;
  border: 1px solid #333;
  color: #ccc;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 14px;
  cursor: pointer;
}
.edit-btn.save {
  background: #1d9bf0;
  border-color: #1d9bf0;
  color: #fff;
}
.edit-btn.save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.edit-btn.cancel:hover { background: rgba(255,255,255,0.06); }

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
