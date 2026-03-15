<template>
  <div class="chat-bubble" :class="message.role">
    <div class="bubble-content">
      <p class="bubble-text">{{ message.content }}</p>
      <span class="bubble-time">{{ formatTime(message.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/domain/models'

defineProps<{ message: ChatMessage }>()

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
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
</style>
