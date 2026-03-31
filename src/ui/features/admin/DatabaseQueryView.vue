<template>
  <div class="database-query">
    <div class="chat-header">
      <button class="header-btn" @click="$router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div class="bot-info">
        <div class="bot-avatar">
          <span class="status-dot" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <div>
          <p class="bot-name">LLM Database</p>
          <p class="bot-model">DeepSeek-V3</p>
        </div>
      </div>
      <button class="header-btn" @click="clearChat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
      </button>
    </div>

    <div class="chat-divider" />

    <div ref="messagesContainer" class="messages-container">
      <div v-if="!messages.length" class="welcome-state">
        <div class="welcome-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="1.5">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <h3 class="welcome-title">LLM Database Assistant</h3>
        <p class="welcome-desc">Consulta la base de datos con lenguaje natural o SQL directo</p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-bubble"
        :class="msg.role === 'user' ? 'user-msg' : 'assistant-msg'"
      >
        <div class="msg-content" v-html="formatMessage(msg.content)" />
      </div>

      <div v-if="isTyping" class="typing-indicator">
        <span /><span /><span />
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="inputText"
        class="message-input"
        placeholder="Escribe una consulta..."
        @keydown.enter="sendQuery"
      />
      <button class="send-btn" :disabled="!inputText.trim() || isTyping" @click="sendQuery">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { chatAdapter } from '@/infrastructure/api'
import { api } from '@/infrastructure/api/httpClient'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface LLMApiResponse {
  respuesta_texto?: string
  response?: string
}

const messagesContainer = ref<HTMLElement>()
const messages = ref<LocalMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const sessionId = ref(`db_query_${Date.now()}`)

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

function formatMessage(text: string): string {
  return text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

async function sendQuery() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  isTyping.value = true
  try {
    await chatAdapter.upsertMessage({ content: text, role: 'user', sessionId: sessionId.value, origin: 'db_query' })

    const data = await api.post<LLMApiResponse>('/llm/process', {
      prompt: text,
      sessionId: sessionId.value,
      forceMCPTools: true,
    })

    const reply = data.respuesta_texto || data.response || 'Sin respuesta del servidor'
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: reply })

    await chatAdapter.upsertMessage({ content: reply, role: 'assistant', sessionId: sessionId.value, origin: 'db_query' })
  } catch {
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Error al procesar la consulta.' })
  }
  isTyping.value = false
  scrollToBottom()
}

function clearChat() {
  messages.value = []
  sessionId.value = `db_query_${Date.now()}`
}
</script>

<style scoped>
.database-query {
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

.bot-avatar { position: relative; }

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00D4FF;
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

.welcome-icon { margin-bottom: 16px; }
.welcome-title { font-size: 20px; font-weight: 600; color: #fff; }
.welcome-desc { font-size: 14px; color: #8E8E93; margin-top: 6px; max-width: 280px; }

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.user-msg {
  align-self: flex-end;
  background: #00D4FF;
  color: #000;
  border-bottom-right-radius: 4px;
}

.assistant-msg {
  align-self: flex-start;
  background: #1C1C1E;
  color: #E8E8E8;
  border-bottom-left-radius: 4px;
}

.msg-content :deep(pre.code-block) {
  background: #0A0A0A;
  border: 1px solid rgba(0,212,255,0.2);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-size: 12px;
}

.msg-content :deep(code.inline-code) {
  background: rgba(0,212,255,0.15);
  color: #00D4FF;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 13px;
}

.msg-content :deep(strong) { color: #fff; }

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
  background: #00D4FF;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #0D0D0D;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  background: #1C1C1E;
  border: none;
  color: #00D4FF;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.message-input::placeholder { color: #666; }
.message-input:focus { outline: none; }

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #00D4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  transition: opacity 0.2s;
}

.send-btn:disabled { opacity: 0.4; }
</style>
