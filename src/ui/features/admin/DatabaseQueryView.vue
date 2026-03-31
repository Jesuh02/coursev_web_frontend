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
        <div class="quick-chips">
          <button class="chip" @click="insertSuggestion('Muéstrame los últimos 10 usuarios registrados')">👥 Últimos usuarios</button>
          <button class="chip" @click="insertSuggestion('¿Cuántos cursos hay en total?')">📚 Total cursos</button>
          <button class="chip" @click="insertSuggestion('Genera un excel con todos los estudiantes y sus notas')">📊 Excel de notas</button>
        </div>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-row"
        :class="msg.role === 'user' ? 'row-user' : 'row-assistant'"
      >
        <div class="message-bubble" :class="msg.role === 'user' ? 'user-msg' : 'assistant-msg'">
          <div class="msg-content" v-html="renderMarkdown(msg.content)" />
          <a
            v-if="msg.excelUrl"
            :href="msg.excelUrl"
            target="_blank"
            rel="noopener"
            class="excel-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Descargar Excel
          </a>
        </div>
      </div>

      <div v-if="isTyping" class="typing-indicator">
        <span /><span /><span />
      </div>
    </div>

    <div class="input-area">
      <input
        ref="inputRef"
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
import { ref, nextTick, onMounted } from 'vue'
import { chatAdapter } from '@/infrastructure/api'
import { api, tokenStorage } from '@/infrastructure/api/httpClient'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  excelUrl?: string | null
}

interface LLMApiResponse {
  respuesta_texto?: string
  response?: string
  excelUrl?: string | null
}

const messagesContainer = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const messages = ref<LocalMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const sessionId = ref(`db_query_${tokenStorage.userId ?? Date.now()}`)

onMounted(async () => {
  try {
    let data: any[]
    try {
      data = await api.get<any[]>('/chat-messages/my/db_query')
    } catch {
      data = await api.get<any[]>(`/chat-messages/session/${sessionId.value}`)
    }
    if (Array.isArray(data) && data.length > 0) {
      messages.value = data.map((m: any) => ({
        id: String(m.id ?? crypto.randomUUID()),
        role: (m.isFromUser ?? m.is_from_user) ? 'user' : 'assistant',
        content: m.message ?? '',
        excelUrl: m.excelUrl ?? m.excel_url ?? null,
      }))
      scrollToBottom()
    }
  } catch {
    // ignore
  }
})

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

function insertSuggestion(text: string) {
  inputText.value = text
  nextTick(() => inputRef.value?.focus())
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const processedLines: string[] = []
  let i = 0

  while (i < lines.length) {
    if (
      i + 1 < lines.length &&
      lines[i].includes('|') &&
      /^\s*\|?\s*[-:]+[-|:\s]*$/.test(lines[i + 1])
    ) {
      const headerCells = lines[i].split('|').map(c => c.trim()).filter(c => c.length > 0)
      let j = i + 2
      const bodyRows: string[][] = []
      while (j < lines.length && lines[j].includes('|') && !/^\s*$/.test(lines[j])) {
        const cells = lines[j].split('|').map(c => c.trim()).filter(c => c.length > 0)
        if (cells.length > 0) bodyRows.push(cells)
        j++
      }
      let table = '<div class="table-wrapper"><table class="md-table">'
      table += '<thead><tr>'
      for (const h of headerCells) {
        table += `<th>${h.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</th>`
      }
      table += '</tr></thead><tbody>'
      for (const row of bodyRows) {
        table += '<tr>'
        for (let k = 0; k < headerCells.length; k++) {
          const cell = (row[k] ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          table += `<td>${cell}</td>`
        }
        table += '</tr>'
      }
      table += '</tbody></table></div>'
      processedLines.push(table)
      i = j
    } else {
      const line = lines[i]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^(#{1,3})\s+(.+)$/, (_, _h, t) => `<strong>${t}</strong>`)
      processedLines.push(line)
      i++
    }
  }

  return processedLines.join('<br />')
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

    // Detect if user wants an Excel export
    const wantsExcel = /excel|exportar|descargar|csv/i.test(text)

    let excelUrl: string | null = null

    if (wantsExcel) {
      try {
        const excelData = await api.post<{ url: string; rows: number }>('/excel/generate-excel', {
          query: text,
          userId: tokenStorage.userId,
        })
        excelUrl = excelData.url
      } catch {
        // Fall through to normal LLM query
      }
    }

    const data = await api.postSlow<LLMApiResponse>('/llm/process', {
      prompt: text,
      sessionId: sessionId.value,
      userId: tokenStorage.userId,
      forceMCPTools: true,
    })

    const reply = data.respuesta_texto || data.response || 'Sin respuesta del servidor'
    const finalExcelUrl = excelUrl || data.excelUrl || null

    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: reply,
      excelUrl: finalExcelUrl,
    })

    await chatAdapter.upsertMessage({
      content: reply,
      role: 'assistant',
      sessionId: sessionId.value,
      origin: 'db_query',
    })
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

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.chip {
  padding: 8px 14px;
  border-radius: 20px;
  background: #1C1C1E;
  border: 1px solid rgba(0,212,255,0.2);
  color: #e8e8e8;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.chip:hover {
  background: #2C2C2E;
  border-color: #00D4FF;
}

.message-row {
  display: flex;
}
.row-user { justify-content: flex-end; }
.row-assistant { justify-content: flex-start; }

.message-bubble {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.user-msg {
  background: #00D4FF;
  color: #000;
  border-bottom-right-radius: 4px;
}

.assistant-msg {
  background: #1C1C1E;
  color: #E8E8E8;
  border-bottom-left-radius: 4px;
}

.excel-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(0,212,255,0.15);
  color: #00D4FF;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.excel-link:hover {
  background: rgba(0,212,255,0.25);
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

/* ─── Markdown table styles ─── */
.msg-content :deep(.table-wrapper) {
  overflow-x: auto;
  margin: 8px 0;
  border-radius: 8px;
  border: 1px solid rgba(0,212,255,0.2);
}

.msg-content :deep(.md-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  white-space: nowrap;
}

.msg-content :deep(.md-table th) {
  background: rgba(0,212,255,0.12);
  color: #00D4FF;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,212,255,0.2);
}

.msg-content :deep(.md-table td) {
  padding: 6px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  color: #E8E8E8;
}

.msg-content :deep(.md-table tbody tr:hover) {
  background: rgba(0,212,255,0.05);
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
</style>
