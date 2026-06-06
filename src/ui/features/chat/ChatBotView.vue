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
        <template v-if="isCourseMode">
          <div class="cw-hero">
            <div class="cw-hero-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h3 class="cw-title">Crea tu curso con IA</h3>
            <p class="cw-desc">Describe la temática, nivel y duración. La IA genera el plan completo. O comparte tu propia estructura y la ajustamos juntos.</p>
          </div>
          <div class="cw-chips">
            <button v-for="q in courseQuickPrompts" :key="q" class="cw-chip" @click="sendQuickPrompt(q)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              {{ q }}
            </button>
          </div>
          <p class="cw-or">o describe libremente lo que necesitas</p>
        </template>
        <template v-else>
          <div class="welcome-avatar">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 1 0 5 5A5 5 0 0 0 12 2zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1"/></svg>
          </div>
          <h3 class="welcome-title">Asistente IA</h3>
          <p class="welcome-desc">Hazme preguntas sobre tus cursos, tareas y materias, o pídeme que cree un curso completo.</p>
          <button class="cw-hint-btn" @click="sendQuickPrompt('Créame un curso de Programación Web, nivel básico, 8 semanas')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Crear un curso con IA
          </button>
        </template>
      </div>

      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :has-calification="msg.hasCalification"
        :calification-value="msg.calificationValue"
        :calification-added="msg.calificationAdded"
        @add-grade="addGrade(msg)"
      />

      <CoursePlanCard
        v-if="coursePlan"
        :plan="coursePlan"
        :creating="isCreatingCourse"
        :created-id="createdCourseId"
        :error="courseCreateError"
        :version="planVersion"
        @confirm="createCourseFromPlan"
        @reject="rejectCoursePlan"
        @view="viewCreatedCourse"
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

    <div v-if="isCourseMode" class="course-mode-banner">
      <div class="cm-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <span class="cm-text">
        <span v-if="coursePlan">Plan listo · ajusta por chat o confirma para crear</span>
        <span v-else>Modo curso · describe la temática o pega tu planificación</span>
      </span>
      <button class="cm-close" @click="toggleCourseMode" title="Salir del modo curso">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="input-area">
      <button class="sl-btn" :class="{ 'sl-btn--active': isCourseMode }" @click="toggleCourseMode" title="Crear curso con IA">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isCourseMode ? '#BF5AF2' : '#8E8E93'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </button>
      <button class="sl-btn" :class="{ 'sl-btn--active': isSignLangMode }" @click="openSignLang" title="Lenguaje de señas">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isSignLangMode ? '#BF5AF2' : '#8E8E93'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
      </button>
      <button class="mic-btn" @click="toggleVoice">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="isRecording ? '#FF453A' : '#8E8E93'" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
      </button>
      <input
        v-model="inputText"
        class="message-input"
        :placeholder="isCourseMode ? 'Ej: Crea un curso de Álgebra Lineal...' : 'Escribe un mensaje...'"
        @keydown.enter="sendMessage"
      />
      <button class="send-btn" :disabled="!inputText.trim()" @click="sendMessage">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
      </button>
    </div>

    <!-- Sign Language Modal -->
    <div v-if="isSignLangMode" class="sl-overlay" @click.self="closeSignLang">
      <div class="sl-modal">
        <div class="sl-modal-header">
          <div class="sl-modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
            Lenguaje de Señas
          </div>
          <button class="sl-close-btn" @click="closeSignLang">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <video ref="slVideo" class="sl-video" autoplay muted playsinline />
        <div class="sl-result-row">
          <div v-if="slDetected" class="sl-letter-badge">{{ slDetected }}</div>
          <div v-if="slDetected" class="sl-conf-label">{{ slConfidence }}% confianza</div>
          <div v-else class="sl-hint">Muestra una seña y presiona Capturar</div>
        </div>
        <div class="sl-accumulated">
          <span v-if="slAccumulated" class="sl-accumulated-text">{{ slAccumulated }}</span>
          <span v-else class="sl-accumulated-empty">Sin texto aún</span>
        </div>
        <div class="sl-controls">
          <button class="sl-ctrl-btn sl-ctrl-capture" :disabled="slCapturing" @click="slCaptureLetter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M6.343 17.657A8 8 0 1 1 17.657 6.343"/></svg>
            {{ slCapturing ? 'Detectando...' : 'Capturar' }}
          </button>
          <button class="sl-ctrl-btn" @click="slAddSpace">Espacio</button>
          <button class="sl-ctrl-btn" @click="slDeleteLast">&#x232B;</button>
          <button class="sl-ctrl-btn sl-ctrl-insert" :disabled="!slAccumulated.trim()" @click="slInsert">Insertar al chat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { chatAdapter, submissionAdapter, courseAdapter, subjectAdapter, topicAdapter, taskAdapter, tokenStorage } from '@/infrastructure/api'
import type { Topic, Task } from '@/domain/models'
import { api } from '@/infrastructure/api/httpClient'
import ChatBubble from './components/ChatBubble.vue'
import CoursePlanCard, { type CoursePlan } from './components/CoursePlanCard.vue'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  sessionId?: string
  hasCalification?: boolean
  calificationValue?: number | null
  calificationAdded?: boolean
}

interface LLMApiResponse {
  respuesta_texto?: string
  response?: string
  esCalificacion?: boolean
  nota?: number | null
}

const route = useRoute()
const router = useRouter()
const submissionId = computed(() =>
  route.query.submissionId ? Number(route.query.submissionId) : null
)
const courseId = computed(() =>
  route.query.courseId ? Number(route.query.courseId) : null
)

const messagesContainer = ref<HTMLElement>()
const messages = ref<LocalMessage[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const showScrollBtn = ref(false)
const isGrading = ref(false)
const sessionId = ref(crypto.randomUUID())

const courseQuickPrompts = [
  'Álgebra Lineal para ingeniería, nivel intermedio, 8 semanas',
  'Python básico para principiantes, 6 semanas',
  'Historia del Arte, nivel básico, 4 semanas',
  'Inglés B1-B2, enfoque en conversación, 12 semanas',
]

function sendQuickPrompt(text: string) {
  inputText.value = text
  sendMessage()
}

function scrollToBottom() {
  nextTick(() => {
    messagesContainer.value?.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
  })
}

/** Detects if the message is a course creation request (without explicit course mode). */
function detectCourseIntent(text: string): boolean {
  const n = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return [
    // Imperative: "créame un curso de X", "crea un curso sobre X"
    /\b(crea(me)?|cr[eé]ame|haz(me)?|dis[eé][nñ]a(me)?|planifica(me)?|genera(me)?|elabora(me)?|prepara(me)?|construye(me)?|desarrolla(me)?|arma(me)?|monta(me)?)\b.{0,50}\bcurso\b/,
    // Desire: "quiero/necesito/quisiera un curso de X"
    /\b(quiero|necesito|deseo|quisiera|podrias|puedes|me\s+gustar[ií]a)\b.{0,40}\b(un\s+)?curso\b/,
    // Noun first: "curso de X" / "un curso sobre X"
    /\b(un\s+)?curso\s+(de|sobre|para|acerca\s+de)\b/,
    // Syllable variant: "cúrsame", "cursame"
    /\bcurs[aá](me)?\b/,
  ].some(p => p.test(n))
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  const userMsg: LocalMessage = {
    id: crypto.randomUUID(),
    content: text,
    role: 'user',
    createdAt: new Date().toISOString(),
    sessionId: sessionId.value,
  }
  messages.value.push(userMsg)
  inputText.value = ''
  scrollToBottom()

  // Auto-detect course creation intent even when course mode is off
  if (!isCourseMode.value && detectCourseIntent(text)) {
    isCourseMode.value = true
  }

  if (isCourseMode.value) {
    await requestCoursePlan(text)
    return
  }

  isTyping.value = true
  try {
    await chatAdapter.upsertMessage({ content: text, role: 'user', sessionId: sessionId.value })

    const data = await api.post<LLMApiResponse>('/llm/process', {
      prompt: text,
      ...(submissionId.value != null && { submissionId: submissionId.value }),
      ...(courseId.value != null && { courseId: courseId.value }),
      sessionId: sessionId.value,
      // Acorta el timeout del modelo primario (Qwen) a 10s y delega en DeepSeek
      // como fallback rapido si Qwen demora demasiado en responder.
      fastMode: true,
    })

    const assistantMsg: LocalMessage = {
      id: crypto.randomUUID(),
      content: data.respuesta_texto || data.response || 'Sin respuesta',
      role: 'assistant',
      createdAt: new Date().toISOString(),
      sessionId: sessionId.value,
      hasCalification: data.esCalificacion === true,
      calificationValue: data.nota ?? null,
      calificationAdded: false,
    }
    messages.value.push(assistantMsg)

    await chatAdapter.upsertMessage({ content: assistantMsg.content, role: 'assistant', sessionId: sessionId.value })
  } catch {
    messages.value.push({
      id: crypto.randomUUID(),
      content: 'Error al procesar el mensaje.',
      role: 'assistant',
      createdAt: new Date().toISOString(),
    })
  }
  isTyping.value = false
  scrollToBottom()
}

async function addGrade(msg: LocalMessage) {
  if (submissionId.value == null || msg.calificationValue == null || isGrading.value) return
  isGrading.value = true
  try {
    await submissionAdapter.gradeSubmission(submissionId.value, msg.calificationValue, msg.content)
    msg.calificationAdded = true
  } finally {
    isGrading.value = false
  }
}

function clearChat() {
  messages.value = []
  sessionId.value = crypto.randomUUID()
  coursePlan.value = null
  planVersion.value = 0
  isCourseMode.value = false
  createdCourseId.value = null
  courseCreateError.value = ''
}

function toggleVoice() {
  isRecording.value = !isRecording.value
}

// ── Crear curso con IA ────────────────────────────────────────────
const isCourseMode = ref(false)
const coursePlan = ref<CoursePlan | null>(null)
const planVersion = ref(0)
const isCreatingCourse = ref(false)
const createdCourseId = ref<number | null>(null)
const courseCreateError = ref('')

function toggleCourseMode() {
  isCourseMode.value = !isCourseMode.value
}

/** Extrae el primer objeto JSON válido de una respuesta de texto del modelo. */
function extractPlan(raw: string): CoursePlan | null {
  if (!raw) return null
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
  try {
    const obj = JSON.parse(candidate)
    if (obj && typeof obj.title === 'string' && Array.isArray(obj.subjects)) {
      return {
        title: obj.title,
        description: obj.description ?? '',
        category: obj.category ?? '',
        level: obj.level ?? '',
        durationWeeks: typeof obj.durationWeeks === 'number' ? obj.durationWeeks : undefined,
        subjects: (obj.subjects ?? []).map((s: Record<string, unknown>) => ({
          name: String(s.name ?? ''),
          description: String(s.description ?? ''),
          topics: (Array.isArray(s.topics) ? s.topics : []).map((t: Record<string, unknown>) => ({
            title: String(t.title ?? t.name ?? ''),
            description: String(t.description ?? ''),
            tasks: (Array.isArray(t.tasks) ? t.tasks : []).map((k: Record<string, unknown>) => ({
              title: String(k.title ?? ''),
              description: String(k.description ?? ''),
              dueWeek: typeof k.dueWeek === 'number' ? k.dueWeek : null,
            })),
          })),
        })),
      }
    }
  } catch { /* no es JSON válido */ }
  return null
}

async function requestCoursePlan(text: string) {
  isTyping.value = true
  createdCourseId.value = null
  courseCreateError.value = ''
  const isUpdate = !!coursePlan.value
  try {
    const prompt = buildPlannerPrompt(text)
    const data = await api.post<LLMApiResponse>('/llm/process', {
      prompt,
      sessionId: sessionId.value,
      courseMode: true,
      fastMode: true,
    })
    const rawAnswer = data.respuesta_texto || data.response || ''
    const parsed = extractPlan(rawAnswer)
    if (parsed) {
      coursePlan.value = parsed
      planVersion.value += 1
      const msg = isUpdate
        ? 'Plan actualizado con tus cambios. Sigue ajustando o confirma para crear el curso.'
        : 'Aquí está tu plan de curso. Puedes pedirme cualquier ajuste por chat, o confirmarlo para crearlo de inmediato.'
      messages.value.push({
        id: crypto.randomUUID(),
        content: msg,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        sessionId: sessionId.value,
      })
    } else {
      messages.value.push({
        id: crypto.randomUUID(),
        content: rawAnswer || 'No pude generar el plan. Intenta describir el curso con más detalle.',
        role: 'assistant',
        createdAt: new Date().toISOString(),
        sessionId: sessionId.value,
      })
    }
  } catch {
    messages.value.push({
      id: crypto.randomUUID(),
      content: 'Error al generar el plan del curso.',
      role: 'assistant',
      createdAt: new Date().toISOString(),
    })
  }
  isTyping.value = false
  scrollToBottom()
}

function buildPlannerPrompt(userText: string): string {
  const current = coursePlan.value
    ? `\n\nPLAN ACTUAL (modifícalo según la petición, conserva lo que no se mencione):\n${JSON.stringify(coursePlan.value)}`
    : ''
  return `Petición: "${userText}"${current}`
}

/** Convierte un número de semana relativo en una fecha ISO de entrega. */
function weekToIso(week?: number | null): string | null {
  if (!week || week < 1) return null
  const d = new Date()
  d.setDate(d.getDate() + week * 7)
  return d.toISOString()
}

interface TopicForContent {
  id: number
  title: string
  description?: string
  subjectName: string
}

function rejectCoursePlan() {
  coursePlan.value = null
  createdCourseId.value = null
  courseCreateError.value = ''
  isCourseMode.value = false
  messages.value.push({
    id: Date.now(),
    role: 'assistant',
    content: 'Plan cancelado. Puedes pedirme otro curso cuando quieras. 😊',
    ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
}

async function createCourseFromPlan() {
  if (!coursePlan.value || isCreatingCourse.value) return
  isCreatingCourse.value = true
  courseCreateError.value = ''
  try {
    const plan = coursePlan.value
    const course = await courseAdapter.createCourse({
      title: plan.title,
      description: plan.description ?? '',
      category: plan.category || 'General',
      creatorUsername: tokenStorage.username ?? '',
      isFree: true,
      price: 0,
      isActive: true,
      deadline: null,
    }) as unknown as { id?: number }
    const courseId = course?.id
    if (!courseId) throw new Error('No se pudo crear el curso')

    const topicsForContent: TopicForContent[] = []

    for (const subject of plan.subjects) {
      const createdSubject = await subjectAdapter.createSubject({
        name: subject.name,
        description: subject.description ?? '',
        courseId,
        createdBy: tokenStorage.userId || null,
      }) as unknown as { id?: number }
      const subjectId = createdSubject?.id
      if (!subjectId) continue

      for (const topic of subject.topics) {
        const createdTopic = await topicAdapter.createTopic({
          name: topic.title,
          description: topic.description ?? '',
          subjectId,
        } as unknown as Partial<Topic>) as unknown as { id?: number }
        const topicId = createdTopic?.id
        if (!topicId) continue

        topicsForContent.push({
          id: topicId,
          title: topic.title,
          description: topic.description ?? '',
          subjectName: subject.name,
        })

        for (const task of topic.tasks ?? []) {
          await taskAdapter.createTask({
            title: task.title,
            description: task.description ?? '',
            topicId,
            dueDate: weekToIso(task.dueWeek),
          } as Partial<Task>)
        }
      }
    }
    createdCourseId.value = courseId

    // Generate educational Word documents for each topic in the background (non-blocking)
    if (topicsForContent.length > 0) {
      generateCourseDocuments(courseId, plan.title, topicsForContent)
    }
  } catch (e) {
    courseCreateError.value = e instanceof Error ? e.message : 'Error al crear el curso'
  } finally {
    isCreatingCourse.value = false
  }
}

async function generateCourseDocuments(courseId: number, courseTitle: string, topics: TopicForContent[]) {
  try {
    await api.post('/llm/generate-course-content', { courseId, courseTitle, topics })
  } catch {
    // Non-blocking: course is already created; content generation failure is not fatal
    console.warn('[ChatBot] Content generation failed — course structure is intact')
  }
}

function viewCreatedCourse(id: number) {
  router.push({ path: `/subjects/${id}` })
}

// ── Lenguaje de Señas ─────────────────────────────────────────────
const isSignLangMode = ref(false)
const slVideo = ref<HTMLVideoElement | null>(null)
const slDetected = ref('')
const slConfidence = ref(0)
const slAccumulated = ref('')
const slCapturing = ref(false)
let slStream: MediaStream | null = null

async function openSignLang() {
  isSignLangMode.value = true
  slDetected.value = ''
  slAccumulated.value = ''
  slConfidence.value = 0
  await nextTick()
  try {
    slStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    if (slVideo.value) slVideo.value.srcObject = slStream
  } catch {
    isSignLangMode.value = false
  }
}

function closeSignLang() {
  isSignLangMode.value = false
  slStream?.getTracks().forEach(t => t.stop())
  slStream = null
}

async function slCaptureLetter() {
  const video = slVideo.value
  if (!video || slCapturing.value) return
  slCapturing.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 240
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const b64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
    const res = await api.post<{ success: boolean; data?: { detection: { label: string; confidence: number } | null } }>('/sign-language/infer', { imageBase64: b64 })
    if (res?.data?.detection) {
      slDetected.value = res.data.detection.label
      slConfidence.value = Math.round(res.data.detection.confidence * 100)
      slAccumulated.value += res.data.detection.label
    }
  } catch { /* silent */ }
  slCapturing.value = false
}

function slAddSpace() { slAccumulated.value += ' ' }
function slDeleteLast() { slAccumulated.value = slAccumulated.value.slice(0, -1) }

function slInsert() {
  if (!slAccumulated.value.trim()) return
  const sep = inputText.value && !inputText.value.endsWith(' ') ? ' ' : ''
  inputText.value += sep + slAccumulated.value.trim()
  closeSignLang()
}

onUnmounted(() => {
  closeSignLang()
})
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
  padding: 32px 24px;
}

.welcome-avatar {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 21px;
  font-weight: 700;
  color: #F5F5F7;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
}

.welcome-desc {
  font-size: 14px;
  color: #636366;
  margin-top: 6px;
  max-width: 280px;
  line-height: 1.55;
}

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

/* ── Course mode banner ── */
.course-mode-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: rgba(191, 90, 242, 0.07);
  border-top: 1px solid rgba(191, 90, 242, 0.14);
  flex-shrink: 0;
}

.cm-icon {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cm-text {
  flex: 1;
  font-size: 11.5px;
  color: #C7A0E8;
  line-height: 1.3;
  letter-spacing: 0.1px;
}

.cm-close {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E6AB2;
  background: rgba(191, 90, 242, 0.1);
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.cm-close:hover { background: rgba(191, 90, 242, 0.2); color: #BF5AF2; }

/* ── Sign Language ── */
.sl-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background 0.15s;
}
.sl-btn:hover { background: rgba(191,90,242,0.12); }
.sl-btn--active { background: rgba(191,90,242,0.18); }

.sl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.sl-modal {
  background: #1C1C1E;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sl-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sl-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.sl-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sl-video {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 16px;
  background: #000;
  object-fit: cover;
  transform: scaleX(-1);
}

.sl-result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
}

.sl-letter-badge {
  font-size: 28px;
  font-weight: 900;
  color: #BF5AF2;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(191,90,242,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sl-conf-label { font-size: 13px; color: #8E8E93; }
.sl-hint { font-size: 13px; color: #636366; font-style: italic; }

.sl-accumulated {
  min-height: 40px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.07);
}

.sl-accumulated-text { font-size: 18px; color: #fff; font-weight: 600; letter-spacing: 3px; }
.sl-accumulated-empty { font-size: 14px; color: #555; }

.sl-controls { display: flex; gap: 8px; flex-wrap: wrap; }

.sl-ctrl-btn {
  flex: 1;
  min-width: 70px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.07);
  color: #ccc;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s;
}
.sl-ctrl-btn:hover:not(:disabled) { background: rgba(255,255,255,0.13); }
.sl-ctrl-btn:disabled { opacity: 0.4; cursor: default; }

.sl-ctrl-capture {
  background: rgba(191,90,242,0.15);
  color: #BF5AF2;
  border: 1px solid rgba(191,90,242,0.3);
}
.sl-ctrl-capture:hover:not(:disabled) { background: rgba(191,90,242,0.25); }

.sl-ctrl-insert {
  background: rgba(48,209,88,0.12);
  color: #30D158;
  border: 1px solid rgba(48,209,88,0.25);
}
.sl-ctrl-insert:hover:not(:disabled) { background: rgba(48,209,88,0.2); }

/* ── Course welcome ── */
.cw-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.cw-hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(191,90,242,0.2) 0%, rgba(110,64,201,0.12) 100%);
  border: 1px solid rgba(191, 90, 242, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #BF5AF2;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(191, 90, 242, 0.15);
}

.cw-title {
  font-size: 22px;
  font-weight: 700;
  color: #F5F5F7;
  letter-spacing: -0.5px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  margin-bottom: 8px;
}

.cw-desc {
  font-size: 14px;
  color: #636366;
  max-width: 300px;
  line-height: 1.55;
  text-align: center;
}

.cw-chips {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
  max-width: 320px;
}

.cw-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  color: #AEAEB2;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  line-height: 1.4;
}
.cw-chip svg { color: #48484A; flex-shrink: 0; transition: color 0.15s; }
.cw-chip:hover {
  background: rgba(191, 90, 242, 0.07);
  border-color: rgba(191, 90, 242, 0.16);
  color: #E5E5EA;
}
.cw-chip:hover svg { color: #BF5AF2; }

.cw-or {
  font-size: 12px;
  color: #3A3A3C;
  margin-top: 12px;
  text-align: center;
}

.cw-hint-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 22px;
  padding: 12px 20px;
  border-radius: 100px;
  background: rgba(191, 90, 242, 0.08);
  border: 1px solid rgba(191, 90, 242, 0.16);
  color: #BF5AF2;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  letter-spacing: -0.1px;
}
.cw-hint-btn:hover {
  background: rgba(191, 90, 242, 0.13);
  border-color: rgba(191, 90, 242, 0.25);
  box-shadow: 0 4px 14px rgba(191, 90, 242, 0.18);
}
</style>
