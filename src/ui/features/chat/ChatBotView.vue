<template>
  <div class="chatbot-view">
    <div class="chat-header">
      <button class="header-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div class="bot-info">
        <div class="bot-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10A37F" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <span class="status-dot" />
        </div>
        <div>
          <p class="bot-name">Asistente IA</p>
          <p class="bot-model">DeepSeek-V3.2-Speciale</p>
        </div>
      </div>
      <button class="header-btn" @click="clearChat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
    </div>

    <div class="chat-divider" />

    <div ref="messagesContainer" class="messages-container">
      <div v-if="!messages.length" class="welcome-state">
        <div class="welcome-icon">🤖</div>
        <h3 class="welcome-title">Hola, soy tu asistente IA</h3>
        <p class="welcome-desc">Puedo ayudarte con tus cursos, tareas y preguntas académicas</p>
      </div>

      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <div v-if="isTyping" class="typing-indicator">
        <span /><span /><span />
      </div>
    </div>

    <button
      v-if="showScrollBtn"
      class="scroll-btn"
      @click="scrollToBottom"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="6 9 12 15 18 9" /></svg>
    </button>

    <div class="input-area">
      <button class="mic-btn" @click="toggleVoice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isRecording ? '#FF453A' : '#8E8E93'" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
      </button>
      <input
        v-model="inputText"
        class="message-input"
        placeholder="Escribe un mensaje..."
        @keydown.enter="sendMessage"
      />
      <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { ChatMessage } from '@/domain/models'
import { chatAdapter } from '@/infrastructure/api'
import ChatBubble from './components/ChatBubble.vue'

const messagesContainer = ref<HTMLElement>()
const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const showScrollBtn = ref(false)
const sessionId = ref(crypto.randomUUID())

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  const userMsg: ChatMessage = {
    id: crypto.randomUUID(),
    content: text,
    role: 'user',
    createdAt: new Date().toISOString(),
    sessionId: sessionId.value,
  }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  isTyping.value = true
  try {
    await chatAdapter.upsertMessage({
      content: text,
      role: 'user',
      sessionId: sessionId.value,
    })
    const history = await chatAdapter.getMessagesBySession(sessionId.value)
    const last = history[history.length - 1]
    if (last && last.role === 'assistant') {
      messages.value.push({
        id: last.id ?? crypto.randomUUID(),
        content: last.content,
        role: 'assistant',
        createdAt: last.createdAt ?? new Date().toISOString(),
        sessionId: sessionId.value,
      })
    }
  } catch {
    messages.value.push({
      id: crypto.randomUUID(),
      content: 'Error al enviar el mensaje.',
      role: 'assistant',
      createdAt: new Date().toISOString(),
    })
  }
  isTyping.value = false
  scrollToBottom()
}

function clearChat() {
  messages.value = []
  sessionId.value = crypto.randomUUID()
}

function toggleVoice() {
  isRecording.value = !isRecording.value
}
</script>

<style scoped>
.chatbot-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #0D0D0D;
  flex-shrink: 0;
}

.header-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-avatar {
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10A37F;
  border: 2px solid #0D0D0D;
}

.bot-name { font-size: 15px; font-weight: 600; color: #E8E8E8; }
.bot-model { font-size: 11px; color: #666; }

.chat-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 40px;
}

.welcome-icon { font-size: 48px; margin-bottom: 16px; }
.welcome-title { font-size: 20px; font-weight: 600; color: #fff; }
.welcome-desc { font-size: 14px; color: #8E8E93; margin-top: 6px; max-width: 280px; }

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #1C1C1E;
  border-radius: 18px;
  align-self: flex-start;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.scroll-btn {
  position: absolute;
  bottom: 80px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #0D0D0D;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.mic-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  background: #1C1C1E;
  border: none;
  color: #fff;
  font-size: 15px;
}

.message-input::placeholder { color: #666; }

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--purple-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  transition: opacity 0.15s;
}

.send-btn:disabled { opacity: 0.4; }
</style>
