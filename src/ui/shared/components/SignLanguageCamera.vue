<template>
  <div class="sl-overlay" @click.self="close">
    <div class="sl-modal">
      <!-- Header -->
      <header class="sl-header">
        <div class="sl-title-group">
          <span class="sl-dot" />
          <span class="sl-title">Lengua de Señas Colombiana</span>
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
        Detecta el <strong>alfabeto</strong> manteniendo la seña quieta ~1 s y
        también <strong>palabras y frases dinámicas</strong> (hola, gracias,
        ¿cómo estás?, buenos días) cuando hay movimiento. Reconoce <strong>ambas
        manos</strong> y la <strong>intención</strong> del gesto (pregunta,
        exclamación, negación). Al pulsar "Usar texto", la IA limpia tildes y
        puntuación en español.
      </p>
      <p v-if="composeError" class="sl-error-inline">{{ composeError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { api, HttpError } from '@/infrastructure/api'

interface Detection {
  label: string
  confidence: number
}

interface FrameResponse {
  detection: Detection | null
  alternatives?: Detection[]
  draft: string
  eventCount: number
  pushed: boolean
  model: string
}

interface ClipRecognition {
  text: string
  kind: 'word' | 'phrase' | 'letter' | 'unknown'
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

interface ClipResponse {
  recognition: ClipRecognition | null
  pushed: boolean
  draft: string
  eventCount: number
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
const isRecognizingClip = ref(false)

// ── Pipeline híbrida (alfabeto estático + VLM dinámico) ──
//
// El backend expone dos pipelines complementarias:
//   • /sign-language/session/:id/frame  → clasificador ONNX local (A-Z) para
//     señas ESTÁTICAS (deletreo).
//   • /sign-language/session/:id/clip   → VLM (Qwen2.5-VL / Gemini-Flash) que
//     interpreta un CLIP de frames y reconoce palabras/frases ("hola", "¿cómo
//     estás?", "gracias"), AMBAS manos y la INTENCIÓN del movimiento.
//
// El frontend decide a cuál llamar usando un detector de movimiento sencillo
// (frame-difference sobre una versión muy reducida del video):
//   • Si la mano está quieta ≥ ~700 ms → /frame (deletreo).
//   • Si detecta movimiento sostenido y luego se detiene (o llena el buffer)
//     → /clip con los últimos ~6 frames (palabra/frase + intención).
//
// La sesión vive en el servidor: el draft acumulado (letras + palabras
// intercaladas) se devuelve en cada respuesta y reemplaza `composedText`.
let simulationMode = false
const SAMPLE_INTERVAL_MS = 180   // captura un frame cada 180 ms (~5.5 fps)
const STILL_HOLD_MS = 1200       // quietud sostenida antes de probar deletreo (más estricto)
const MOTION_THRESHOLD = 4        // diff medio (0-255) para considerar "movimiento" (era 9, demasiado alto)
const CLIP_MIN_FRAMES = 3         // basta con 3 frames si hay movimiento claro
const CLIP_MAX_FRAMES = 8
const CLIP_MAX_DURATION_MS = 1800
const CLIP_COOLDOWN_MS = 800      // espera tras un /clip antes de mandar otro
const SAME_LETTER_COOLDOWN_MS = 1200
const FRAME_COOLDOWN_MS = 600     // espera entre llamadas /frame
const MOTION_MEMORY_MS = 2500     // ventana en la que un /clip todavía 'gana' sobre /frame

const sessionId = `sl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
let stream: MediaStream | null = null
let sampleTimer: ReturnType<typeof setInterval> | null = null
let frameBuffer: string[] = []          // base64 (sin prefijo) en orden cronológico
let frameStartedAt = 0                  // timestamp del primer frame en motion
let prevGrayscale: Uint8ClampedArray | null = null
let consecutiveMotion = 0               // muestras seguidas con movimiento
let consecutiveStill = 0                // muestras seguidas sin movimiento
let recentMotionSamples = 0             // muestras con movimiento desde el último envío
let lastMotionAt = 0                    // timestamp del último frame con movimiento
let lastFrameSentAt = 0
let lastClipSentAt = 0
let lastConfirmedLetter: string | null = null
let lastConfirmedLetterAt = 0
const diffCanvas = document.createElement('canvas')
diffCanvas.width = 64
diffCanvas.height = 48

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
  sampleTimer = setInterval(tick, SAMPLE_INTERVAL_MS)
}

function captureJpegBase64(quality = 0.7): string | null {
  const v = videoEl.value
  const c = canvasEl.value
  if (!v || !c || v.readyState < 2) return null
  c.width = v.videoWidth
  c.height = v.videoHeight
  const ctx = c.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(v, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', quality).split(',')[1]
}

/**
 * Devuelve la diferencia media (0-255) entre el frame actual y el anterior,
 * usando una copia muy reducida en escala de grises. Sirve como detector de
 * movimiento barato para decidir entre /frame (estático) y /clip (dinámico).
 */
function computeMotion(): number {
  const v = videoEl.value
  if (!v || v.readyState < 2) return 0
  const ctx = diffCanvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return 0
  ctx.drawImage(v, 0, 0, diffCanvas.width, diffCanvas.height)
  const { data } = ctx.getImageData(0, 0, diffCanvas.width, diffCanvas.height)
  const gray = new Uint8ClampedArray(diffCanvas.width * diffCanvas.height)
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0
  }
  let diff = 0
  if (prevGrayscale && prevGrayscale.length === gray.length) {
    for (let k = 0; k < gray.length; k++) diff += Math.abs(gray[k] - prevGrayscale[k])
    diff /= gray.length
  }
  prevGrayscale = gray
  return diff
}

async function tick() {
  if (!isStreaming.value) return
  // Si CUALQUIERA de las dos pipelines está en vuelo, no disparamos nada
  // (antes era `&&`, lo que dejaba que /frame se siguiera ejecutando
  // mientras el VLM tardaba 5-10 s y por eso "solo aparecían letras").
  if (isInferring.value || isRecognizingClip.value) {
    // Aun así seguimos llenando el buffer para no perder el clip en curso.
    const j = captureJpegBase64(0.65)
    if (j) {
      frameBuffer.push(j)
      if (frameBuffer.length > CLIP_MAX_FRAMES + 2) frameBuffer.shift()
    }
    return
  }

  const motion = computeMotion()
  const moving = motion > MOTION_THRESHOLD
  const now = Date.now()

  // Buffer rodante de frames recientes (siempre, para tener material si el
  // usuario empieza a moverse de repente).
  const jpeg = captureJpegBase64(0.65)
  if (jpeg) {
    if (frameBuffer.length === 0) frameStartedAt = now
    frameBuffer.push(jpeg)
    if (frameBuffer.length > CLIP_MAX_FRAMES + 2) frameBuffer.shift()
  }

  if (moving) {
    consecutiveMotion++
    consecutiveStill = 0
    recentMotionSamples++
    lastMotionAt = now
  } else {
    consecutiveStill++
    consecutiveMotion = 0
  }

  // — Caso A: el clip está listo (hubo movimiento y ahora se detuvo, o se
  //   alcanzó el largo/duración máxima). Mandamos al VLM.
  const clipReady =
    frameBuffer.length >= CLIP_MIN_FRAMES &&
    recentMotionSamples >= 1 &&
    (
      consecutiveStill >= 2 ||
      frameBuffer.length >= CLIP_MAX_FRAMES ||
      (now - frameStartedAt) >= CLIP_MAX_DURATION_MS
    )

  if (clipReady && now - lastClipSentAt > CLIP_COOLDOWN_MS) {
    const framesToSend = frameBuffer.slice(-CLIP_MAX_FRAMES)
    frameBuffer = []
    recentMotionSamples = 0
    lastClipSentAt = now
    void sendClipToVLM(framesToSend)
    return
  }

  // — Caso B: mano quieta el tiempo suficiente → mandamos UN frame al
  //   clasificador de alfabeto. Solo si NO hubo movimiento reciente (de lo
  //   contrario podríamos cortar una seña dinámica en curso y empujar una
  //   vocal espuria al draft).
  const noRecentMotion = now - lastMotionAt > MOTION_MEMORY_MS
  const stillEnough =
    !moving &&
    noRecentMotion &&
    consecutiveStill * SAMPLE_INTERVAL_MS >= STILL_HOLD_MS &&
    now - lastFrameSentAt > FRAME_COOLDOWN_MS &&
    now - lastClipSentAt > CLIP_COOLDOWN_MS

  if (stillEnough && jpeg) {
    lastFrameSentAt = now
    void sendFrameToAlphabet(jpeg)
  }
}

async function sendFrameToAlphabet(base64: string) {
  if (simulationMode) {
    const sim = simulateDetection()
    if (sim) applyLetter(sim)
    return
  }
  isInferring.value = true
  try {
    const data = await api.post<FrameResponse>(
      `/sign-language/session/${encodeURIComponent(sessionId)}/frame`,
      { imageBase64: base64, minConfidence: 0.5 },
    )
    if (data?.detection) {
      currentDetection.value = data.detection
      setTimeout(() => { if (currentDetection.value === data.detection) currentDetection.value = null }, 600)
    }
    if (typeof data?.draft === 'string') composedText.value = data.draft
  } catch (err) {
    if (err instanceof HttpError && err.errorCode === 'HF_NOT_CONFIGURED') {
      console.warn('[SignLanguage] Backend sin HF_API_TOKEN → modo simulación')
      simulationMode = true
    } else {
      console.warn('[SignLanguage] /frame falló:', err)
    }
  } finally {
    isInferring.value = false
  }
}

async function sendClipToVLM(frames: string[]) {
  if (simulationMode || !frames.length) return
  isRecognizingClip.value = true
  try {
    const data = await api.post<ClipResponse>(
      `/sign-language/session/${encodeURIComponent(sessionId)}/clip`,
      { frames, minConfidence: 0.4 },
    )
    if (data?.recognition) {
      lastRecognition.value = data.recognition
      // Si fue una letra (deletreo), mostrarla como detección visual.
      if (data.recognition.kind === 'letter' && data.recognition.text) {
        currentDetection.value = {
          label: data.recognition.text.toUpperCase(),
          confidence: data.recognition.confidence,
        }
        setTimeout(() => { currentDetection.value = null }, 700)
      }
    }
    if (typeof data?.draft === 'string') composedText.value = data.draft
  } catch (err) {
    if (err instanceof HttpError && (err.errorCode === 'VLM_NOT_CONFIGURED' || err.statusCode === 503)) {
      // VLM no disponible: el sistema sigue funcionando con solo el alfabeto.
      console.warn('[SignLanguage] VLM no disponible, manteniendo solo deletreo.')
    } else {
      console.warn('[SignLanguage] /clip falló:', err)
    }
  } finally {
    isRecognizingClip.value = false
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
  lastRecognition.value = null
  frameBuffer = []
  recentMotionSamples = 0
  consecutiveMotion = 0
  consecutiveStill = 0
  lastMotionAt = 0
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
      { useLLM: true },
    )
    return data?.text || fallback
  } catch (err) {
    console.warn('[SignLanguage] finalize falló, usando /compose como respaldo:', err)
    try {
      const data = await api.post<ComposeResponse>('/sign-language/compose', {
        rawSequence: fallback,
        useLLM: true,
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
