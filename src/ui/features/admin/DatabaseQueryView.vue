<template>
  <div class="db-chat">
    <!-- ── Header ── -->
    <header class="db-header">
      <button class="hdr-icon" @click="$router.back()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
      </button>

      <div class="hdr-title-group">
        <span class="hdr-title">LLM Database</span>
        <span class="hdr-badge">DeepSeek-V3</span>
      </div>

      <button class="hdr-icon" @click="clearChat" title="Limpiar chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M22 2 12 12" /></svg>
      </button>
    </header>

    <!-- ── Messages ── -->
    <div ref="messagesContainer" class="db-messages">
      <!-- Welcome empty state -->
      <div v-if="!messages.length" class="welcome">
        <h2 class="welcome-heading">¿En qué puedo ayudarte?</h2>

        <div class="suggestions">
          <button class="suggestion-card" @click="insertAndSend('¿Cuál es el progreso general de los estudiantes por curso?')">
            <span class="sug-icon sug-icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span class="sug-text">Progreso de estudiantes</span>
          </button>

          <button class="suggestion-card" @click="insertAndSend('Genera un excel con el progreso de los estudiantes por curso')">
            <span class="sug-icon sug-icon--green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </span>
            <span class="sug-text">Excel de progreso</span>
          </button>

          <button class="suggestion-card" @click="insertAndSend('Muéstrame los últimos 10 usuarios registrados')">
            <span class="sug-icon sug-icon--purple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="sug-text">Últimos usuarios</span>
          </button>

          <button class="suggestion-card" @click="insertAndSend('¿Cuál es el rendimiento promedio de los docentes en todos los cursos?')">
            <span class="sug-icon sug-icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </span>
            <span class="sug-text">Rendimiento de docentes</span>
          </button>
        </div>
      </div>

      <!-- Messages list -->
      <template v-for="msg in messages" :key="msg.id">
        <div class="msg-row" :class="msg.role === 'user' ? 'msg-row--user' : 'msg-row--bot'">
          <!-- Bot avatar -->
          <div v-if="msg.role === 'assistant'" class="bot-avatar-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>

          <div class="bubble" :class="msg.role === 'user' ? 'bubble--user' : 'bubble--bot'">
            <div class="bubble-text" v-html="renderMarkdown(msg.content)" />

            <!-- Excel download -->
            <a v-if="msg.excelUrl" :href="msg.excelUrl" target="_blank" rel="noopener" class="excel-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Descargar Excel
            </a>
          </div>
        </div>

        <!-- Message actions for bot messages -->
        <div v-if="msg.role === 'assistant'" class="msg-actions">
          <button class="msg-action-btn" :class="{ 'msg-action-btn--active': copiedMsgId === msg.id }" @click="copyMessage(msg)" :title="copiedMsgId === msg.id ? 'Copiado' : 'Copiar'">
            <svg v-if="copiedMsgId !== msg.id" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="msg-action-btn" :class="{ 'msg-action-btn--liked': likedMsgId === msg.id }" @click="likeMessage(msg)" title="Me gusta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
          <button class="msg-action-btn" :class="{ 'msg-action-btn--disliked': dislikedMsgId === msg.id }" @click="dislikeMessage(msg)" title="No me gusta">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          </button>
          <button class="msg-action-btn" @click="shareMessage(msg)" title="Compartir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </template>

      <!-- Typing animation -->
      <div v-if="isTyping" class="msg-row msg-row--bot">
        <div class="bot-avatar-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <div class="bubble bubble--bot bubble--typing">
          <span class="dot" /><span class="dot" /><span class="dot" />
        </div>
      </div>
    </div>

    <!-- ── Input Bar ── -->
    <div class="input-bar">
      <div class="input-row">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="chat-input"
          placeholder="Preguntar al LLM Database"
          rows="1"
          @input="autoResize"
          @keydown.enter.exact="sendQuery"
        />

        <!-- Voice / Send toggle -->
        <button
          v-if="inputText.trim()"
          class="action-btn action-btn--send"
          :disabled="isTyping"
          @click="sendQuery"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
        <button
          v-else-if="isRecording"
          class="action-btn action-btn--recording"
          @click="stopRecording"
        >
          <div class="rec-pulse" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        </button>
        <button v-else class="action-btn action-btn--mic" @click="startRecording">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { chatAdapter, api, tokenStorage } from '@/infrastructure/api'

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
const inputRef = ref<HTMLTextAreaElement>()
const messages = ref<LocalMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const sessionId = ref(`db_query_${tokenStorage.userId ?? Date.now()}`)
const copiedMsgId = ref<string | null>(null)
const likedMsgId = ref<string | null>(null)
const dislikedMsgId = ref<string | null>(null)

let mediaRecorder: any = null
let recognition: any = null

// ── Lifecycle ──

onMounted(async () => {
  await loadHistory()
})

onUnmounted(() => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (recognition) {
    recognition.abort()
  }
})

// ── History ──

async function loadHistory() {
  try {
    const data = await chatAdapter.getMyMessagesByOrigin('db_query')
    if (Array.isArray(data) && data.length > 0) {
      messages.value = data.map((m) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content,
        excelUrl: m.excelUrl ?? null,
      }))
      scrollToBottom()
    }
  } catch {
    // ignore – user may have no history yet
  }
}

// ── Scroll ──

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

// ── Input helpers ──

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function insertAndSend(text: string) {
  inputText.value = text
  nextTick(() => sendQuery())
}

// ── Voice recording (Web Speech API) ──

function startRecording() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '⚠️ Tu navegador no soporta reconocimiento de voz. Intenta con Chrome.',
    })
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'es-ES'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript
    inputText.value = transcript
    isRecording.value = false
    nextTick(() => {
      autoResize()
      inputRef.value?.focus()
    })
  }

  recognition.onerror = () => {
    isRecording.value = false
  }

  recognition.onend = () => {
    isRecording.value = false
  }

  recognition.start()
  isRecording.value = true
}

function stopRecording() {
  if (recognition) {
    recognition.stop()
  }
  isRecording.value = false
}

// ── Markdown / Tables ──

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    // Table detection
    if (
      i + 1 < lines.length &&
      lines[i].includes('|') &&
      /^\s*\|?\s*[-:]+[-|:\s]*$/.test(lines[i + 1])
    ) {
      const headers = lines[i].split('|').map(c => c.trim()).filter(Boolean)
      let j = i + 2
      const rows: string[][] = []
      while (j < lines.length && lines[j].includes('|') && !/^\s*$/.test(lines[j])) {
        rows.push(lines[j].split('|').map(c => c.trim()).filter(Boolean))
        j++
      }
      let t = '<div class="tbl-wrap"><table class="md-tbl"><thead><tr>'
      for (const h of headers) t += `<th>${esc(h)}</th>`
      t += '</tr></thead><tbody>'
      for (const r of rows) {
        t += '<tr>'
        for (let k = 0; k < headers.length; k++) t += `<td>${esc(r[k] ?? '')}</td>`
        t += '</tr>'
      }
      t += '</tbody></table></div>'
      out.push(t)
      i = j
    } else {
      out.push(
        lines[i]
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-blk"><code>$2</code></pre>')
          .replace(/`([^`]+)`/g, '<code class="c-inline">$1</code>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/^(#{1,3})\s+(.+)$/, (_, _h, t) => `<strong>${t}</strong>`)
      )
      i++
    }
  }
  return out.join('<br/>')
}

function esc(s: string) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

// ── Save helper (non-blocking) ──

function persistMessage(content: string, isFromUser: boolean, excelUrl: string | null = null) {
  chatAdapter.upsertMessage({
    content,
    role: isFromUser ? 'user' : 'assistant',
    sessionId: sessionId.value,
    origin: 'db_query',
    excelUrl,
  } as any).catch(() => { /* silent – does not disrupt UX */ })
}

// ── Send ──

async function sendQuery() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text })
  inputText.value = ''
  nextTick(() => {
    if (inputRef.value) inputRef.value.style.height = 'auto'
  })
  scrollToBottom()

  // Persist user message immediately – independent of the LLM call
  persistMessage(text, true)

  isTyping.value = true
  try {
    const wantsExcel = /excel|exportar|descargar|csv/i.test(text)
    let excelUrl: string | null = null

    if (wantsExcel) {
      try {
        const d = await api.post<{ url: string; rows: number }>('/excel/generate-excel', { query: text, userId: tokenStorage.userId })
        excelUrl = d.url
      } catch { /* fallthrough */ }
    }

    const data = await api.postSlow<LLMApiResponse>('/llm/process', {
      prompt: text,
      sessionId: sessionId.value,
      userId: tokenStorage.userId,
      username: tokenStorage.username,
      forceMCPTools: true,
    })

    const reply = data.respuesta_texto || data.response || 'Sin respuesta del servidor'
    const finalExcelUrl = excelUrl || data.excelUrl || null

    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: reply, excelUrl: finalExcelUrl })

    // Persist assistant response – independent of next UI action
    persistMessage(reply, false, finalExcelUrl)
  } catch {
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: 'Error al procesar la consulta.' })
  }
  isTyping.value = false
  scrollToBottom()
}

// Clear only the local view – messages in DB are kept for persistence
function clearChat() {
  messages.value = []
}

// ── Message actions ──

function copyMessage(msg: LocalMessage) {
  navigator.clipboard.writeText(msg.content).then(() => {
    copiedMsgId.value = msg.id
    setTimeout(() => { copiedMsgId.value = null }, 2000)
  }).catch(() => {})
}

function likeMessage(msg: LocalMessage) {
  likedMsgId.value = likedMsgId.value === msg.id ? null : msg.id
  dislikedMsgId.value = null
}

function dislikeMessage(msg: LocalMessage) {
  dislikedMsgId.value = dislikedMsgId.value === msg.id ? null : msg.id
  likedMsgId.value = null
}

function shareMessage(msg: LocalMessage) {
  if (navigator.share) {
    navigator.share({ text: msg.content }).catch(() => {})
  } else {
    navigator.clipboard.writeText(msg.content).catch(() => {})
  }
}
</script>

<style scoped>
*,*::before,*::after { box-sizing: border-box; }

/* ── Root ── */
.db-chat {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #0D0D0D;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
  color: #E8E8E8;
}

/* ── Header ── */
.db-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #0D0D0D;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.hdr-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: rgba(255,255,255,0.6);
  transition: background 0.15s;
}
.hdr-icon:hover { background: rgba(255,255,255,0.08); }

.hdr-title-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hdr-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.hdr-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 10px;
  background: rgba(0,212,255,0.15);
  color: #00D4FF;
  letter-spacing: 0.3px;
}

/* ── Messages container ── */
.db-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.db-messages::-webkit-scrollbar { width: 4px; }
.db-messages::-webkit-scrollbar-track { background: transparent; }
.db-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

/* ── Welcome state ── */
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  gap: 32px;
}

.welcome-heading {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: -0.3px;
}

/* ── Suggestion cards ── */
.suggestions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 360px;
  width: 100%;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 50px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.18);
  cursor: pointer;
  transition: background 0.15s, border-color 0.2s, transform 0.1s;
  text-align: left;
}
.suggestion-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.3);
}
.suggestion-card:active { transform: scale(0.97); }

.sug-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sug-icon--blue   { background: rgba(0,140,255,0.15); color: #3B9EFF; }
.sug-icon--green  { background: rgba(52,199,89,0.15); color: #34C759; }
.sug-icon--purple { background: rgba(191,90,242,0.15); color: #BF5AF2; }
.sug-icon--amber  { background: rgba(255,179,64,0.15); color: #FFB340; }

.sug-text {
  font-size: 13px;
  font-weight: 500;
  color: #ccc;
  line-height: 1.3;
}

/* ── Message rows ── */
.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  animation: fadeUp .2s ease;
}
.msg-row--user { justify-content: flex-end; }
.msg-row--bot  { justify-content: flex-start; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.bot-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0,212,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Bubbles ── */
.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}

.bubble--user {
  max-width: min(72%, 480px);
  background: linear-gradient(135deg, #0084FF 0%, #0066CC 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.bubble--bot {
  max-width: 92%;
  background: #1C1C1E;
  color: #E8E8E8;
  border-bottom-left-radius: 4px;
}

.bubble-text :deep(strong) { color: #fff; }
.bubble-text :deep(em)     { color: #bbb; font-style: italic; }

/* Typing */
.bubble--typing {
  display: flex;
  gap: 5px;
  padding: 14px 18px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00D4FF;
  animation: blink 1.4s infinite ease-in-out both;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── Excel pill ── */
.excel-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 7px 14px;
  background: rgba(52,199,89,0.12);
  color: #34C759;
  border: 1px solid rgba(52,199,89,0.25);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
}
.excel-pill:hover { background: rgba(52,199,89,0.22); }

/* ── Markdown tables ── */
.bubble-text :deep(.tbl-wrap) {
  overflow-x: auto;
  margin: 10px 0;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
}

.bubble-text :deep(.md-tbl) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  white-space: nowrap;
}

.bubble-text :deep(.md-tbl th) {
  background: rgba(0,212,255,0.08);
  color: #00D4FF;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid rgba(0,212,255,0.15);
}

.bubble-text :deep(.md-tbl td) {
  padding: 7px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: #d0d0d0;
}

.bubble-text :deep(.md-tbl tbody tr:hover) {
  background: rgba(0,212,255,0.04);
}

.bubble-text :deep(.code-blk) {
  background: #111;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;
  overflow-x: auto;
  font-size: 12px;
  color: #e0e0e0;
}

.bubble-text :deep(.c-inline) {
  background: rgba(0,212,255,0.12);
  color: #00D4FF;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* user bubble table overrides */
.bubble--user :deep(.md-tbl th) {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.bubble--user :deep(.md-tbl td) { color: rgba(255,255,255,0.9); }

/* ── Input bar ── */
.input-bar {
  padding: 10px 16px 14px;
  background: #0D0D0D;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-row {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #1A1A1A;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 6px 6px 6px 16px;
  transition: border-color 0.2s;
}
.input-row:focus-within {
  border-color: rgba(0,212,255,0.35);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #E8E8E8;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  padding: 8px 0;
  line-height: 1.4;
}
.chat-input::placeholder { color: #666; }
.chat-input:focus { outline: none; }
.chat-input::-webkit-scrollbar { width: 0; }

/* ── Action buttons ── */
.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.1s, background 0.15s;
}
.action-btn:active { transform: scale(0.9); }

.action-btn--send {
  background: #fff;
  color: #0D0D0D;
}
.action-btn--send:disabled { opacity: 0.3; }

.action-btn--mic {
  background: transparent;
  color: rgba(255,255,255,0.5);
}
.action-btn--mic:hover { color: #fff; background: rgba(255,255,255,0.08); }

.action-btn--recording {
  background: #FF3B30;
  color: #fff;
  position: relative;
}

.rec-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(255,59,48,0.4);
  animation: pulse-ring 1.2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

/* ── Message action bar ── */
.msg-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0 6px 40px;
  animation: fadeUp .2s ease;
}

.msg-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: rgba(255,255,255,0.35);
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}
.msg-action-btn:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.75);
}
.msg-action-btn:active { transform: scale(0.88); }
.msg-action-btn--active { color: #00D4FF !important; }
.msg-action-btn--liked { color: #34C759 !important; }
.msg-action-btn--disliked { color: #FF453A !important; }
</style>
