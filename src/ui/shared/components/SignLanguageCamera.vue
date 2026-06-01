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
        <button class="sl-btn sl-btn--ghost" @click="close">Cancelar</button>
        <button
          class="sl-btn sl-btn--primary"
          :disabled="!composedText.trim()"
          @click="confirm"
        >
          Usar texto
        </button>
      </div>

      <!-- Hint -->
      <p class="sl-hint">
        Mantén una seña ~1.5s para fijar la letra. Para demos sin API: el modo simulación añadirá letras de prueba.
      </p>
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

interface InferResponse {
  detection: Detection | null
  model: string
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

// ── Backend proxy a HuggingFace (el token vive en el servidor) ──
// Endpoint: POST /api/v1/sign-language/infer  { imageBase64 }
// Si el backend devuelve HF_NOT_CONFIGURED se activa modo simulación.
let simulationMode = false

// Detección estable: la letra se "fija" cuando se mantiene N ciclos
const STABILITY_THRESHOLD = 3
const CONFIDENCE_THRESHOLD = 0.55
const INFER_INTERVAL_MS = 700

let stream: MediaStream | null = null
let inferTimer: ReturnType<typeof setInterval> | null = null
let lastLabel: string | null = null
let stableCount = 0

// ── Lifecycle ──
onMounted(async () => {
  await startCamera()
})

onUnmounted(() => {
  stopCamera()
})

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
  if (inferTimer) {
    clearInterval(inferTimer)
    inferTimer = null
  }
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  isStreaming.value = false
}

// ── Inferencia ──
function startInferenceLoop() {
  inferTimer = setInterval(runInference, INFER_INTERVAL_MS)
}

async function runInference() {
  if (isInferring.value || !videoEl.value || !canvasEl.value) return
  if (videoEl.value.readyState < 2) return

  isInferring.value = true
  try {
    const detection = simulationMode
      ? simulateDetection()
      : await inferWithBackend()

    if (detection && detection.confidence >= CONFIDENCE_THRESHOLD) {
      currentDetection.value = detection
      handleStableDetection(detection)
    }
  } catch (err) {
    console.warn('[SignLanguage] Falló inferencia:', err)
  } finally {
    isInferring.value = false
  }
}

function handleStableDetection(d: Detection) {
  if (d.label === lastLabel) {
    stableCount++
  } else {
    lastLabel = d.label
    stableCount = 1
  }
  if (stableCount === STABILITY_THRESHOLD) {
    // Letra confirmada: agregar al texto
    composedText.value += d.label
    // Pequeño "cooldown": reiniciar para que no se repita
    stableCount = 0
    lastLabel = null
    // Feedback visual breve
    setTimeout(() => { currentDetection.value = null }, 350)
  }
}

async function inferWithBackend(): Promise<Detection | null> {
  const v = videoEl.value!
  const c = canvasEl.value!
  c.width = v.videoWidth
  c.height = v.videoHeight
  const ctx = c.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(v, 0, 0, c.width, c.height)
  const dataUrl = c.toDataURL('image/jpeg', 0.7)
  const base64 = dataUrl.split(',')[1]

  try {
    const data = await api.post<InferResponse>('/sign-language/infer', { imageBase64: base64 })
    return data?.detection ?? null
  } catch (err) {
    // If the backend isn't configured, fall back to simulation so the demo still works.
    if (err instanceof HttpError && err.errorCode === 'HF_NOT_CONFIGURED') {
      console.warn('[SignLanguage] Backend sin HF_API_TOKEN → modo simulación')
      simulationMode = true
      return simulateDetection()
    }
    throw err
  }
}

// ── Simulación (cuando no hay API key) ──
const SIM_ALPHABET = 'HOLA MUNDO'
let simIndex = 0
function simulateDetection(): Detection | null {
  // Solo emite cada ~2 ciclos para simular detección estable
  if (Math.random() < 0.4) return null
  const ch = SIM_ALPHABET[simIndex % SIM_ALPHABET.length]
  simIndex++
  return { label: ch, confidence: 0.85 }
}

// ── Acciones de composición ──
function addSpace() { composedText.value += ' ' }
function backspace() { composedText.value = composedText.value.slice(0, -1) }
function clearText() { composedText.value = '' }

function confirm() {
  const text = composedText.value.trim()
  if (!text) return
  emit('confirm', text)
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
