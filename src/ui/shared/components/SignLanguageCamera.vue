<template>
  <div class="sl-overlay" @click.self="close">
    <div class="sl-modal">
      <!-- Header -->
      <header class="sl-header">
        <div class="sl-title-group">
          <span class="sl-dot" />
          <span class="sl-title">Lengua de Señas Colombiana (LSC)</span>
        </div>
        <button class="sl-close" @click="close" title="Cerrar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </header>

      <!-- Camera viewport -->
      <div class="sl-viewport">
        <video ref="videoEl" class="sl-video" :class="{ 'sl-video--mirror': facingMode === 'user' }" autoplay playsinline muted />
        <canvas ref="canvasEl" class="sl-canvas-hidden" />

        <!-- Status badges -->
        <div class="sl-status">
          <span class="sl-status-badge" :class="{ 'sl-status-badge--live': isStreaming }">
            {{ isStreaming ? '● EN VIVO' : 'CÁMARA' }}
          </span>
          <span v-if="isInferring" class="sl-status-badge sl-status-badge--inferring">
            Detectando…
          </span>
          <span v-if="captureStatusLabel" class="sl-status-badge sl-status-badge--capture">
            {{ captureStatusLabel }}
          </span>
        </div>

        <!-- Flip camera button -->
        <button class="sl-flip-btn" @click="flipCamera" title="Cambiar cámara" :disabled="isFlipping">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 7h-3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
            <path d="M18 3l2 2-2 2"/>
            <path d="M6 3L4 5l2 2"/>
          </svg>
        </button>

        <!-- Detected letter overlay -->
        <transition name="sl-pop">
          <div v-if="currentDetection" class="sl-detection">
            <div class="sl-letter">{{ currentDetection.label }}</div>
            <div class="sl-confidence">
              {{ Math.round(currentDetection.confidence * 100) }}%
            </div>
          </div>
        </transition>

        <!-- Loading / error -->
        <div v-if="errorMsg" class="sl-error">
          {{ errorMsg }}
        </div>
      </div>

      <!-- Composed text -->
      <div class="sl-composer">
        <label class="sl-composer-label">Texto detectado</label>
        <div class="sl-composer-box">
          <span class="sl-composed-text">{{ composedText || 'Haz una seña frente a la cámara…' }}</span>
          <span v-if="composedText" class="sl-cursor">|</span>
        </div>
        <transition name="sl-pop">
          <div v-if="lastRecognition && lastRecognition.kind !== 'unknown'" class="sl-meta">
            <span v-if="HAND_LABEL[lastRecognition.handedness]" class="sl-chip sl-chip--hand">
              {{ HAND_LABEL[lastRecognition.handedness] }}
            </span>
            <span v-if="INTENT_LABEL[lastRecognition.nonManual.intent]" class="sl-chip sl-chip--intent">
              {{ INTENT_LABEL[lastRecognition.nonManual.intent] }}
            </span>
            <span v-if="lastRecognition.motion.trajectory" class="sl-chip sl-chip--motion">
              {{ lastRecognition.motion.trajectory }}
            </span>
            <span class="sl-chip sl-chip--conf">
              {{ Math.round(lastRecognition.confidence * 100) }}%
            </span>
          </div>
        </transition>
        <p v-if="serviceNotice" class="sl-service-notice">{{ serviceNotice }}</p>
      </div>

      <!-- Controls -->
      <div class="sl-controls">
        <button class="sl-ctrl" @click="addSpace" title="Espacio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9v6h16V9"/></svg>
          <span>Espacio</span>
        </button>
        <button class="sl-ctrl" @click="backspace" :disabled="!composedText" title="Borrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
          <span>Borrar</span>
        </button>
        <button class="sl-ctrl" @click="clearText" :disabled="!composedText" title="Limpiar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Footer actions -->
      <div class="sl-footer">
        <button class="sl-btn sl-btn--ghost" @click="close" :disabled="isComposing">Cancelar</button>
        <button
          class="sl-btn sl-btn--primary"
          :disabled="!composedText.trim() || isComposing"
          @click="confirm"
        >
          {{ isComposing ? 'Componiendo…' : 'Usar texto' }}
        </button>
      </div>

      <!-- Hint -->
      <p class="sl-hint">
        Detecta <strong>letras, vocales y números</strong> del alfabeto dactilológico
        colombiano manteniendo la seña quieta ~1 segundo. También reconoce
        <strong>palabras, frases y oraciones en español</strong> cuando hay movimiento.
        Identifica <strong>ambas manos</strong> y la <strong>intención</strong> del
        gesto (pregunta, exclamación, negación, saludo).
      </p>
      <p v-if="composeError" class="sl-error-inline">{{ composeError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { api, HttpError } from '@/infrastructure/api'

interface Detection {
  label: string
  confidence: number
}

interface ClipRecognition {
  text: string
  kind: 'word' | 'phrase' | 'letter' | 'number' | 'sentence' | 'unknown'
  confidence: number
  alternatives: string[]
  handedness: 'left' | 'right' | 'both' | 'none'
  motion: {
    trajectory: string
    direction: string | null
    repeated: boolean
    contact: 'none' | 'hand-hand' | 'hand-face' | 'hand-body'
  }
  nonManual: {
    facial: string | null
    intent: 'statement' | 'question' | 'exclamation' | 'negation' | 'affirmation' | 'unknown'
  }
  reasoning: string
  model: string
}

type AutoRecognition = Partial<ClipRecognition> & {
  source?: string
  text?: string
  kind?: ClipRecognition['kind']
  confidence?: number
}

type QueuedAutoFrame = {
  base64: string
  revision: number
  capturedAtMs: number
  seq: number
}

interface AutoFrameResponse {
  event: AutoRecognition | null
  pushed: boolean
  motion: number
  state: 'idle' | 'moving' | 'settling' | 'still'
  draft: string
  eventCount: number
  capture?: {
    mode?: 'idle' | 'moving' | 'settling' | 'still' | 'sentence' | 'processing'
    stillMs?: number
    motionMs?: number
    motionPeak?: number
    motion?: number
    inflight?: boolean
    queue?: number
  }
  warning?: {
    code?: string
    message?: string
  } | null
}

interface ComposeResponse {
  text: string
  source: 'llm' | 'local'
  raw: string
  draft?: string
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', text: string): void
}>()

// ── Refs ──
const videoEl = ref<HTMLVideoElement>()
const canvasEl = ref<HTMLCanvasElement>()
const isStreaming = ref(false)
const isInferring = ref(false)
const isFlipping = ref(false)
const errorMsg = ref<string | null>(null)
const currentDetection = ref<Detection | null>(null)
const composedText = ref('')
const facingMode = ref<'user' | 'environment'>('user')
const lastRecognition = ref<ClipRecognition | null>(null)
const captureMode = ref<NonNullable<AutoFrameResponse['capture']>['mode']>('idle')
const captureStillMs = ref(0)
const serviceNotice = ref<string | null>(null)

// El frontend solo transmite frames. El backend mantiene la máquina de estados:
// mano quieta 1 s => letra/vocal/número; movimiento => palabra/frase/oración.
let simulationMode = false
const SAMPLE_INTERVAL_MS = 100
const STILL_HOLD_MS = 1000
// Dejamos varias solicitudes en vuelo para que el backend siga recibiendo
// frames de tracking aunque una inferencia ONNX/VLM tarde mas.
const AUTO_FRAME_MAX_IN_FLIGHT = 4
const AUTO_FRAME_MAX_QUEUE = 12
const AUTO_FRAME_JPEG_QUALITY = 0.58
const AUTO_FRAME_MAX_DIMENSION = 512
const AUTO_FRAME_MIN_LETTER_CONFIDENCE = 0.55
const AUTO_FRAME_MIN_PHRASE_CONFIDENCE = 0.6
const SAME_LETTER_COOLDOWN_MS = 900
const SIGN_LANGUAGE_PROFILE = 'lsc'

const sessionId = `sl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
let stream: MediaStream | null = null
let sampleTimer: ReturnType<typeof setInterval> | null = null
let autoFrameInFlight = 0
let autoFrameQueue: QueuedAutoFrame[] = []
let lastServerEventCount = -1
let streamRevision = 0
let frameSeq = 0
let lastAppliedStatusSeq = 0
let lastConfirmedLetter: string | null = null
let lastConfirmedLetterAt = 0
let lastSimulationAt = 0

const captureStatusLabel = computed(() => {
  if (!isStreaming.value) return ''
  if (captureMode.value === 'processing') return 'Procesando'
  if (captureMode.value === 'sentence') return 'Oracion'
  if (captureMode.value === 'moving') return 'Movimiento'
  if (captureMode.value === 'settling') return 'Pausa'
  if (captureMode.value === 'still') {
    const pct = Math.min(100, Math.round((captureStillMs.value / STILL_HOLD_MS) * 100))
    return pct >= 100 ? 'Quieto 1 s' : `Quieto ${pct}%`
  }
  return ''
})

// ── Lifecycle ──
onMounted(async () => {
  await startCamera()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stopCamera()
  // limpiar sesión en el servidor (best-effort)
  if (!simulationMode) {
    api.delete(`/sign-language/session/${encodeURIComponent(sessionId)}`).catch(() => { /* ignore */ })
  }
})

function onVisibilityChange() {
  if (document.hidden) {
    if (sampleTimer) { clearInterval(sampleTimer); sampleTimer = null }
  } else if (isStreaming.value && !sampleTimer) {
    startInferenceLoop()
  }
}

async function flipCamera() {
  if (isFlipping.value) return
  isFlipping.value = true
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  stopCamera()
  await startCamera()
  isFlipping.value = false
}

async function startCamera() {
  try {
    streamRevision++
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode.value, width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play()
      isStreaming.value = true
      startInferenceLoop()
    }
  } catch (err) {
    console.error('[SignLanguage] Error al acceder a la cámara:', err)
    errorMsg.value = 'No se pudo acceder a la cámara. Revisa los permisos.'
  }
}

function stopCamera() {
  streamRevision++
  autoFrameInFlight = 0
  autoFrameQueue = []
  lastAppliedStatusSeq = 0
  isInferring.value = false
  captureMode.value = 'idle'
  captureStillMs.value = 0
  if (sampleTimer) {
    clearInterval(sampleTimer)
    sampleTimer = null
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  isStreaming.value = false
}

// ── Bucle de captura + decisión ──
function startInferenceLoop() {
  if (sampleTimer) clearInterval(sampleTimer)
  sampleTimer = setInterval(tick, SAMPLE_INTERVAL_MS)
}

function captureJpegBase64(quality = 0.7): string | null {
  const v = videoEl.value
  const c = canvasEl.value
  if (!v || !c || v.readyState < 2) return null
  const sourceWidth = v.videoWidth
  const sourceHeight = v.videoHeight
  if (!sourceWidth || !sourceHeight) return null
  const scale = Math.min(1, AUTO_FRAME_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight))
  c.width = Math.max(1, Math.round(sourceWidth * scale))
  c.height = Math.max(1, Math.round(sourceHeight * scale))
  const ctx = c.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(v, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality).split(',')[1]
}

async function tick() {
  if (!isStreaming.value) return

  const now = Date.now()
  if (simulationMode) {
    if (now - lastSimulationAt > STILL_HOLD_MS) {
      lastSimulationAt = now
      const sim = simulateDetection()
      if (sim) applyLetter(sim)
    }
    return
  }

  const capturedAtMs = Date.now()
  const jpeg = captureJpegBase64(AUTO_FRAME_JPEG_QUALITY)
  if (jpeg) enqueueAutoFrame({
    base64: jpeg,
    revision: streamRevision,
    capturedAtMs,
    seq: ++frameSeq,
  })
}

function enqueueAutoFrame(frame: QueuedAutoFrame) {
  autoFrameQueue.push(frame)
  while (autoFrameQueue.length > AUTO_FRAME_MAX_QUEUE) autoFrameQueue.shift()
  dispatchAutoFrames()
}

function dispatchAutoFrames() {
  while (autoFrameInFlight < AUTO_FRAME_MAX_IN_FLIGHT && autoFrameQueue.length > 0) {
    const frame = autoFrameQueue.shift()
    if (frame) void sendAutoFrame(frame)
  }
}

async function sendAutoFrame(frame: QueuedAutoFrame) {
  autoFrameInFlight++
  isInferring.value = true
  try {
    const data = await api.post<AutoFrameResponse>(
      `/sign-language/session/${encodeURIComponent(sessionId)}/auto-frame`,
      {
        imageBase64: frame.base64,
        minLetterConfidence: AUTO_FRAME_MIN_LETTER_CONFIDENCE,
        minPhraseConfidence: AUTO_FRAME_MIN_PHRASE_CONFIDENCE,
        stillDurationMs: STILL_HOLD_MS,
        allowVlmLetterFallback: true,
        language: SIGN_LANGUAGE_PROFILE,
        capturedAtMs: frame.capturedAtMs,
        frameSeq: frame.seq,
        _t: Date.now(),
      },
    )
    if (frame.revision === streamRevision) applyAutoFrameResponse(data, frame.seq)
  } catch (err) {
    if (frame.revision !== streamRevision) return
    if (err instanceof HttpError && err.errorCode === 'HF_NOT_CONFIGURED') {
      errorMsg.value = 'El modelo local de letras no esta configurado en el backend.'
    } else if (err instanceof HttpError && err.errorCode === 'VLM_NOT_CONFIGURED') {
      serviceNotice.value = 'Para palabras, oraciones y números LSC configura OPENROUTER_API_KEY en el backend.'
    } else if (err instanceof HttpError && err.errorCode === 'SIGN_LANGUAGE_DISABLED') {
      errorMsg.value = 'El reconocimiento de lengua de señas esta deshabilitado.'
    } else {
      console.warn('[SignLanguage] /auto-frame fallo:', err)
    }
  } finally {
    if (frame.revision === streamRevision) autoFrameInFlight = Math.max(0, autoFrameInFlight - 1)
    isInferring.value = autoFrameInFlight > 0 || autoFrameQueue.length > 0
    if (frame.revision === streamRevision) dispatchAutoFrames()
  }
}

function applyAutoFrameResponse(data: AutoFrameResponse | null, seq: number) {
  if (!data) return
  if (seq >= lastAppliedStatusSeq) {
    captureMode.value = data.capture?.mode || data.state
    captureStillMs.value = Math.max(0, Number(data.capture?.stillMs) || 0)
    lastAppliedStatusSeq = seq
  }
  if (data.warning?.code === 'VLM_NOT_CONFIGURED') {
    serviceNotice.value = 'Para palabras, oraciones y números LSC configura OPENROUTER_API_KEY en el backend.'
  } else if (data.event) {
    serviceNotice.value = null
  }
  if (typeof data.draft === 'string' && data.eventCount >= lastServerEventCount) {
    composedText.value = data.draft
    lastServerEventCount = data.eventCount
  }
  if (!data.event) return

  const recognition = normalizeAutoRecognition(data.event)
  if (!recognition.text || recognition.kind === 'unknown') return

  lastRecognition.value = recognition
  if (recognition.kind === 'letter' || recognition.kind === 'number') {
    const detection = {
      label: recognition.text.toLocaleUpperCase('es'),
      confidence: recognition.confidence,
    }
    currentDetection.value = detection
    setTimeout(() => {
      if (currentDetection.value === detection) currentDetection.value = null
    }, 700)
  }
}

function normalizeAutoRecognition(event: AutoRecognition): ClipRecognition {
  return {
    text: String(event.text || ''),
    kind: event.kind || 'unknown',
    confidence: Number(event.confidence) || 0,
    alternatives: Array.isArray(event.alternatives)
      ? event.alternatives.filter((x): x is string => typeof x === 'string')
      : [],
    handedness: event.handedness || 'none',
    motion: {
      trajectory: event.motion?.trajectory || '',
      direction: event.motion?.direction ?? null,
      repeated: Boolean(event.motion?.repeated),
      contact: event.motion?.contact || 'none',
    },
    nonManual: {
      facial: event.nonManual?.facial || null,
      intent: event.nonManual?.intent || 'unknown',
    },
    reasoning: event.reasoning || '',
    model: event.model || '',
  }
}

function applyLetter(d: Detection) {
  currentDetection.value = d
  const now = Date.now()
  const sameLetterTooSoon =
    d.label === lastConfirmedLetter && now - lastConfirmedLetterAt < SAME_LETTER_COOLDOWN_MS
  if (!sameLetterTooSoon) {
    composedText.value += d.label
    lastConfirmedLetter = d.label
    lastConfirmedLetterAt = now
    setTimeout(() => { currentDetection.value = null }, 350)
  }
}

// ── Simulación (cuando no hay API key) ──
const SIM_ALPHABET = 'HOLA MUNDO'
let simIndex = 0
function simulateDetection(): Detection | null {
  if (Math.random() < 0.4) return null
  const ch = SIM_ALPHABET[simIndex % SIM_ALPHABET.length]
  simIndex++
  return { label: ch, confidence: 0.85 }
}

// ── Etiquetas legibles para handedness / intent ──
const HAND_LABEL: Record<ClipRecognition['handedness'], string> = {
  left: 'Mano izquierda',
  right: 'Mano derecha',
  both: 'Ambas manos',
  none: '',
}
const INTENT_LABEL: Record<ClipRecognition['nonManual']['intent'], string> = {
  statement: 'Afirmación',
  question: 'Pregunta',
  exclamation: 'Exclamación',
  negation: 'Negación',
  affirmation: 'Sí',
  unknown: '',
}

// ── Acciones de composición ──
function addSpace() { composedText.value += ' ' }
function backspace() { composedText.value = composedText.value.slice(0, -1) }
function clearText() {
  composedText.value = ''
  composedPhrase.value = null
  composeError.value = null
  serviceNotice.value = null
  lastRecognition.value = null
  captureMode.value = 'idle'
  captureStillMs.value = 0
  streamRevision++
  lastServerEventCount = -1
  lastAppliedStatusSeq = 0
  autoFrameInFlight = 0
  autoFrameQueue = []
  isInferring.value = false
  lastConfirmedLetter = null
  // reiniciar sesión en el servidor también
  if (!simulationMode) {
    api.delete(`/sign-language/session/${encodeURIComponent(sessionId)}`).catch(() => { /* ignore */ })
  }
}

const composedPhrase = ref<string | null>(null)
const isComposing = ref(false)
const composeError = ref<string | null>(null)

/**
 * Cierra la sesión en el servidor: éste pasa el draft completo (letras +
 * palabras detectadas por el VLM) por el LLM para puntuación / tildes /
 * mayúsculas y devuelve la frase final en español natural.
 */
async function finalizeSessionRemote(): Promise<string> {
  const fallback = composedText.value.trim()
  if (!fallback) return ''
  isComposing.value = true
  composeError.value = null
  try {
    const data = await api.post<ComposeResponse>(
      `/sign-language/session/${encodeURIComponent(sessionId)}/finalize`,
      { useLLM: true, language: SIGN_LANGUAGE_PROFILE },
    )
    return data?.text || fallback
  } catch (err) {
    console.warn('[SignLanguage] finalize falló, usando /compose como respaldo:', err)
    try {
      const data = await api.post<ComposeResponse>('/sign-language/compose', {
        rawSequence: fallback,
        useLLM: true,
        language: SIGN_LANGUAGE_PROFILE,
      })
      return data?.text || fallback
    } catch (err2) {
      console.warn('[SignLanguage] compose también falló:', err2)
      composeError.value = 'No se pudo afinar la frase, se usará el texto crudo.'
      return fallback
    }
  } finally {
    isComposing.value = false
  }
}

async function confirm() {
  const text = composedText.value.trim()
  if (!text || isComposing.value) return

  if (simulationMode) {
    emit('confirm', text)
    close()
    return
  }

  const phrase = await finalizeSessionRemote()
  composedPhrase.value = phrase
  emit('confirm', phrase)
  close()
}

function close() {
  stopCamera()
  emit('close')
}
</script>

<style scoped>
*,*::before,*::after { box-sizing: border-box; }

.sl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: sl-fade .15s ease;
}

@keyframes sl-fade { from { opacity: 0; } to { opacity: 1; } }

.sl-modal {
  width: 100%;
  max-width: 460px;
  background: #141414;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #E8E8E8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  animation: sl-up .2s ease;
}

@keyframes sl-up {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.sl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sl-title-group { display: flex; align-items: center; gap: 8px; }
.sl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00D4FF;
  box-shadow: 0 0 8px #00D4FF;
}
.sl-title { font-size: 15px; font-weight: 600; }
.sl-close {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.6);
  background: transparent; border: none; cursor: pointer;
}
.sl-close:hover { background: rgba(255,255,255,0.08); color: #fff; }

/* Viewport */
.sl-viewport {
  position: relative;
  background: #000;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}
.sl-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.sl-video--mirror {
  transform: scaleX(-1); /* espejo solo para cámara frontal */
}
.sl-canvas-hidden { display: none; }

.sl-status {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.sl-flip-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.2s;
  backdrop-filter: blur(4px);
}
.sl-flip-btn:hover:not(:disabled) { background: rgba(0,0,0,0.75); }
.sl-flip-btn:active:not(:disabled) { transform: rotate(180deg); }
.sl-flip-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.sl-status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(0,0,0,0.55);
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.3px;
}
.sl-status-badge--live { color: #FF3B30; }
.sl-status-badge--inferring { background: rgba(0,212,255,0.25); color: #00D4FF; }
.sl-status-badge--capture { background: rgba(255,212,121,0.18); color: #FFD479; }

.sl-detection {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0,212,255,0.95);
  color: #001218;
  padding: 10px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px rgba(0,212,255,0.35);
}
.sl-letter { font-size: 28px; font-weight: 800; line-height: 1; }
.sl-confidence { font-size: 11px; font-weight: 600; opacity: 0.75; }

.sl-pop-enter-active, .sl-pop-leave-active { transition: all .15s ease; }
.sl-pop-enter-from, .sl-pop-leave-to { opacity: 0; transform: scale(0.85); }

.sl-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0,0,0,0.7);
  color: #FF453A;
  font-size: 13px;
  text-align: center;
}

.sl-error-inline {
  margin: 0 18px 12px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 69, 58, 0.12);
  color: #FF453A;
  font-size: 11px;
  text-align: center;
}

/* Composer */
.sl-composer {
  padding: 14px 18px 4px;
}
.sl-composer-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.sl-composer-box {
  margin-top: 6px;
  min-height: 44px;
  padding: 10px 12px;
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  font-size: 16px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  word-break: break-word;
}
.sl-composed-text { color: #fff; }
.sl-composed-text:empty { color: #666; }
.sl-cursor {
  color: #00D4FF;
  animation: sl-blink 1s infinite;
  margin-left: 1px;
}
@keyframes sl-blink { 50% { opacity: 0; } }

.sl-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.sl-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.3px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.08);
}
.sl-chip--hand { color: #FFD479; border-color: rgba(255,212,121,0.25); }
.sl-chip--intent { color: #7BD0FF; border-color: rgba(123,208,255,0.25); }
.sl-chip--motion { color: #B8FF7B; border-color: rgba(184,255,123,0.25); }
.sl-chip--conf { color: rgba(255,255,255,0.6); }

.sl-service-notice {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 212, 121, 0.1);
  border: 1px solid rgba(255, 212, 121, 0.18);
  color: #FFD479;
  font-size: 11px;
  line-height: 1.35;
}

/* Controls */
.sl-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 18px;
}
.sl-ctrl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  color: rgba(255,255,255,0.75);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.sl-ctrl:hover:not(:disabled) { background: #242425; color: #fff; }
.sl-ctrl:disabled { opacity: 0.35; cursor: not-allowed; }

/* Footer */
.sl-footer {
  display: flex;
  gap: 10px;
  padding: 12px 18px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.sl-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s, transform 0.1s;
}
.sl-btn:active:not(:disabled) { transform: scale(0.97); }
.sl-btn--ghost {
  background: transparent;
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.12);
}
.sl-btn--primary {
  background: #00D4FF;
  color: #001218;
}
.sl-btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

.sl-hint {
  margin: 0;
  padding: 0 18px 14px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  text-align: center;
  line-height: 1.4;
}
</style>
