<template>
  <div class="chat-bubble" :class="message.role">
    <div class="bubble-content">
      <p class="bubble-text">{{ message.content }}</p>
      <span class="bubble-time">{{ formatTime(message.createdAt) }}</span>
    </div>
    <button
      v-if="hasCalification && !calificationAdded"
      class="grade-btn"
      @click="$emit('add-grade')"
    >
      ✅ Agregar calificación ({{ formatGrade(calificationValue) }}/10)
    </button>
    <span v-if="calificationAdded" class="grade-added">✓ Calificación agregada</span>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/domain/models'

defineProps<{
  message: ChatMessage
  hasCalification?: boolean
  calificationValue?: number | null
  calificationAdded?: boolean
}>()

defineEmits<{ 'add-grade': [] }>()

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function formatGrade(val?: number | null) {
  if (val == null) return '?'
  return val % 1 === 0 ? String(val) : val.toFixed(1)
}
</script>

<style scoped>
.chat-bubble {
  display: flex;
  max-width: 80%;
}

.chat-bubble.user {
  align-self: flex-end;
}

.chat-bubble.assistant {
  align-self: flex-start;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 18px;
}

.user .bubble-content {
  background: var(--purple-primary);
  border-bottom-right-radius: 4px;
}

.assistant .bubble-content {
  background: #1C1C1E;
  border-bottom-left-radius: 4px;
}

.bubble-text {
  font-size: 14px;
  color: #fff;
  line-height: 1.4;
  white-space: pre-wrap;
}

.bubble-time {
  display: block;
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
  text-align: right;
}

.grade-btn {
  display: block;
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 20px;
  background: #10A37F;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: center;
}

.grade-btn:hover {
  background: #0e8f6f;
}

.grade-added {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #10A37F;
  font-weight: 600;
}
</style>
