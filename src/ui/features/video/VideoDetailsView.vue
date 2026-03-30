<template>
  <div class="page">

    <!-- ============================================================ -->
    <!-- UPLOAD MODE (sin id → ruta /video/upload)                   -->
    <!-- ============================================================ -->
    <template v-if="isUploadMode">

      <!-- Barra superior flotante con blur -->
      <div class="top-bar">
        <button class="top-icon-btn" @click="$router.back()" aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <span class="top-title">Agregar detalles</span>
        <button class="top-next-btn" :disabled="uploading || !videoFile" @click="submit">
          Siguiente
        </button>
      </div>

      <!-- Contenido con scroll -->
      <div class="scroll-content">

        <!-- Vista previa del video -->
        <div class="preview-card" @click="openVideoPicker">
          <video v-if="videoObjectUrl" :src="videoObjectUrl" class="video-element" muted loop autoplay playsinline />
          <div v-else class="preview-placeholder">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="ph-title">Seleccionar video</p>
            <p class="ph-hint">MP4 · MOV · AVI</p>
          </div>
          <span v-if="videoFile" class="video-badge">VISTA PREVIA DEL VIDEO</span>
          <input ref="videoInput" type="file" accept="video/*" hidden @change="onVideoSelect" />
        </div>

        <!-- Miniatura -->
        <p class="sec-label">Miniatura del curso</p>
        <div class="thumb-card" @click="openThumbnailPicker">
          <img v-if="thumbnailObjectUrl" :src="thumbnailObjectUrl" class="thumb-img" alt="Miniatura" />
          <div v-else class="thumb-placeholder">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#52525b" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="thumb-ph-title">Seleccionar miniatura</p>
            <p class="thumb-ph-sub">Sube una imagen representativa</p>
          </div>
          <input ref="thumbInput" type="file" accept="image/*" hidden @change="onThumbSelect" />
        </div>
        <span v-if="thumbnailFile" class="thumb-selected-badge">✓ Miniatura seleccionada</span>

        <!-- Título -->
        <p class="sec-label">Título</p>
        <input
          v-model="title"
          class="text-input"
          placeholder="Crea un título llamativo..."
          maxlength="100"
        />
        <p class="char-counter">{{ title.length }}/100</p>

        <!-- Descripción -->
        <p class="sec-label">Descripción</p>
        <textarea
          v-model="description"
          class="text-area"
          placeholder="Describe tu video y añade hashtags..."
        />

        <hr class="divider" />

        <!-- Fila visibilidad -->
        <div class="settings-row">
          <div class="settings-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div class="settings-text">
            <p class="settings-title">Visibilidad</p>
            <p class="settings-sub">Audiencia del video</p>
          </div>
          <p class="settings-value">Todos</p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <!-- Tipo de curso -->
        <p class="sec-label-gray">Tipo de curso</p>
        <div class="type-row">
          <div class="type-card" :class="{ 'type-card--on': !isPaid }" @click="isPaid = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="!isPaid ? '#3b82f6' : '#71717a'" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p class="type-lbl" :class="{ 'type-lbl--on': !isPaid }">Gratis</p>
          </div>
          <div class="type-card" :class="{ 'type-card--on': isPaid }" @click="isPaid = true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" :stroke="isPaid ? '#3b82f6' : '#71717a'" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <p class="type-lbl" :class="{ 'type-lbl--on': isPaid }">De pago</p>
          </div>
        </div>

        <div style="height:32px" />
      </div>

      <!-- Overlay de carga -->
      <Transition name="fade">
        <div v-if="uploading" class="upload-overlay">
          <div class="upload-box">
            <div class="spinner" />
            <p class="upload-box-title">Procesando Video</p>
            <p class="upload-box-status">{{ uploadStatus }}</p>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${uploadProgress}%` }" />
            </div>
            <p class="upload-box-pct">{{ uploadProgress }}%</p>
          </div>
        </div>
      </Transition>

      <!-- Toast de error -->
      <Transition name="fade">
        <div v-if="errorMsg" class="error-toast">{{ errorMsg }}</div>
      </Transition>
    </template>

    <!-- ============================================================ -->
    <!-- VIEW MODE (ruta /video/:id con id numérico)                 -->
    <!-- ============================================================ -->
    <template v-else>

      <!-- Botón atrás flotante -->
      <button class="back-fab" @click="$router.back()" aria-label="Volver">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <!-- Reproductor -->
      <div class="vp-wrap">
        <video
          v-if="video?.video_uri_string"
          :src="resolveVideoUrl(video.video_uri_string)"
          class="vp-video"
          controls
          playsinline
        />
        <div v-else class="vp-skeleton">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>

      <div class="view-body">
        <h1 class="view-title">{{ video?.title ?? 'Cargando...' }}</h1>
        <div class="view-meta">
          <span>{{ videoCreatedAt }}</span>
        </div>

        <div class="actions-row">
          <button class="action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            <span>Me gusta</span>
          </button>
          <button class="action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            <span>Compartir</span>
          </button>
          <button class="action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span>Guardar</span>
          </button>
        </div>

        <div class="creator-row">
          <div class="creator-av">
            <span class="av-letter">{{ (video?.username ?? 'C')[0].toUpperCase() }}</span>
          </div>
          <div class="creator-info">
            <p class="creator-name">{{ video?.username ?? 'Creador' }}</p>
            <p class="creator-subs">0 suscriptores</p>
          </div>
          <button class="sub-btn">Suscribirse</button>
        </div>

        <div class="desc-section">
          <p class="desc-text">{{ video?.description ?? 'Sin descripción' }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Video } from '@/domain/models'
import { videoAdapter } from '@/infrastructure/api'
import { uploadFileDirect } from '@/infrastructure/api/storageAdapter'
import { buildProxyFileUrl } from '@/infrastructure/api/httpClient'
import { useAuthStore } from '@/stores/authStore'

// ── Props (pasados por el router con props: true) ──────────────────
const props = defineProps<{ id?: string }>()
const router = useRouter()
const authStore = useAuthStore()

// ── Modo ──────────────────────────────────────────────────────────
const isUploadMode = computed(() => !props.id || isNaN(Number(props.id)))

// ── Estado Upload ─────────────────────────────────────────────────
const videoFile    = ref<File | null>(null)
const videoObjectUrl     = ref('')
const thumbnailFile      = ref<File | null>(null)
const thumbnailObjectUrl = ref('')
const title         = ref('')
const description   = ref('')
const isPaid        = ref(false)
const uploading     = ref(false)
const uploadProgress = ref(0)
const uploadStatus   = ref('Preparando...')
const errorMsg       = ref('')

const videoInput = ref<HTMLInputElement>()
const thumbInput = ref<HTMLInputElement>()

function openVideoPicker()     { videoInput.value?.click() }
function openThumbnailPicker() { thumbInput.value?.click() }

function onVideoSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (videoObjectUrl.value) URL.revokeObjectURL(videoObjectUrl.value)
  videoFile.value    = f
  videoObjectUrl.value = URL.createObjectURL(f)
}

function onThumbSelect(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (thumbnailObjectUrl.value) URL.revokeObjectURL(thumbnailObjectUrl.value)
  thumbnailFile.value      = f
  thumbnailObjectUrl.value = URL.createObjectURL(f)
}

async function submit() {
  if (!videoFile.value || !title.value.trim()) return

  if (!authStore.user?.username) {
    await authStore.fetchProfile()
  }
  const username = authStore.user?.username?.trim()
  if (!username) {
    errorMsg.value = 'No se pudo obtener el usuario. Inicia sesión nuevamente.'
    setTimeout(() => { errorMsg.value = '' }, 4000)
    return
  }

  uploading.value     = true
  uploadProgress.value = 0
  uploadStatus.value   = 'Subiendo video...'
  errorMsg.value       = ''

  try {
    // 1. Subida directa a R2 (XHR, sin pasar por el backend → más rápido)
    const { key: videoKey } = await uploadFileDirect(
      videoFile.value,
      'videos',
      (pct) => {
        uploadProgress.value = Math.round(pct * 0.75)
        uploadStatus.value   = `Subiendo video... ${uploadProgress.value}%`
      },
    )

    // 2. Subida de miniatura (opcional)
    let thumbnailUrl = ''
    if (thumbnailFile.value) {
      uploadStatus.value = 'Subiendo miniatura...'
      const { key: thumbKey } = await uploadFileDirect(
        thumbnailFile.value,
        'courses',
        (pct) => { uploadProgress.value = 75 + Math.round(pct * 0.15) },
      )
      thumbnailUrl = buildProxyFileUrl(thumbKey)
    }

    uploadProgress.value = 90
    uploadStatus.value   = 'Guardando información...'

    // 3. Crear registro en base de datos
    await videoAdapter.createVideo({
      title:            title.value.trim(),
      description:      description.value.trim(),
      videoUri:         buildProxyFileUrl(videoKey),
      thumbnailUri:     thumbnailUrl,
      username,
    } as unknown as Omit<Video, 'id'>)

    uploadProgress.value = 100
    uploadStatus.value   = '¡Video subido exitosamente!'

    await new Promise(r => setTimeout(r, 900))
    router.push('/video')

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al subir. Intenta de nuevo.'
    uploadStatus.value = msg
    errorMsg.value     = msg
    setTimeout(() => { errorMsg.value = '' }, 4000)
  } finally {
    uploading.value = false
  }
}

onUnmounted(() => {
  if (videoObjectUrl.value)     URL.revokeObjectURL(videoObjectUrl.value)
  if (thumbnailObjectUrl.value) URL.revokeObjectURL(thumbnailObjectUrl.value)
})

// ── Estado View ───────────────────────────────────────────────────
const video = ref<Video | null>(null)

const videoCreatedAt = computed(() =>
  timeAgo((video.value as Record<string, unknown> & Video)?.['created_at'] as string ?? ''),
)

function timeAgo(date: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Hoy'
  if (days < 7) return `hace ${days} días`
  return `hace ${Math.floor(days / 7)} semanas`
}

function resolveVideoUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return buildProxyFileUrl(url)
}

onMounted(async () => {
  if (!isUploadMode.value) {
    const numId = Number(props.id)
    try { video.value = await videoAdapter.getVideoById(numId) } catch { /* silencioso */ }
  }
})
</script>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────── */
.page {
  position: relative;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #09090b;
  color: #fff;
  font-family: inherit;
}

/* ── Barra superior (upload) ─────────────────────────────────── */
.top-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(9, 9, 11, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.top-icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.top-icon-btn:active { background: rgba(255,255,255,0.15); }

.top-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
}

.top-next-btn {
  font-size: 15px;
  font-weight: 700;
  color: #3b82f6;
  padding: 6px 14px;
  border-radius: 20px;
  transition: opacity 0.2s;
}
.top-next-btn:disabled { opacity: 0.35; }

/* ── Contenido scrollable ────────────────────────────────────── */
.scroll-content {
  padding: 82px 16px 32px;
  display: flex;
  flex-direction: column;
}

/* ── Tarjeta preview de video ────────────────────────────────── */
.preview-card {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  background: #18181b;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  margin-bottom: 24px;
  border: 1.5px dashed rgba(255,255,255,0.09);
  transition: border-color 0.2s;
}
.preview-card:hover { border-color: #3b82f6; }

.video-element { width: 100%; height: 100%; object-fit: cover; }

.preview-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px;
}
.ph-title { font-size: 14px; font-weight: 600; color: #fff; }
.ph-hint  { font-size: 12px; color: #52525b; }

.video-badge {
  position: absolute;
  bottom: 8px; left: 50%;
  transform: translateX(-50%);
  font-size: 9px; font-weight: 700;
  color: rgba(255,255,255,0.8);
  letter-spacing: 1px;
  text-shadow: 0 1px 4px #000;
}

/* ── Etiquetas de sección ────────────────────────────────────── */
.sec-label {
  font-size: 14px; font-weight: 700; color: #fff;
  margin: 0 0 8px;
}
.sec-label-gray {
  font-size: 14px; color: #71717a;
  margin: 0 0 12px;
}

/* ── Tarjeta miniatura ───────────────────────────────────────── */
.thumb-card {
  width: 100%; height: 160px;
  border-radius: 12px;
  background: #18181b;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 8px;
  border: 1.5px dashed rgba(255,255,255,0.07);
  transition: border-color 0.2s;
}
.thumb-card:hover { border-color: #3b82f6; }

.thumb-img { width: 100%; height: 100%; object-fit: cover; }

.thumb-placeholder {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 9px;
}
.thumb-ph-title { font-size: 13px; font-weight: 600; color: #a1a1aa; }
.thumb-ph-sub   { font-size: 12px; color: #52525b; }

.thumb-selected-badge {
  display: block;
  font-size: 13px; color: #22c55e;
  margin-bottom: 24px;
}

/* ── Inputs ────────────────────────────────────────────────── */
.text-input {
  width: 100%; box-sizing: border-box;
  background: #18181b;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px; color: #fff;
  margin-bottom: 4px;
  transition: border-color 0.2s;
}
.text-input::placeholder { color: #52525b; }
.text-input:focus { outline: none; border-color: #3b82f6; }

.char-counter {
  font-size: 12px; color: #71717a;
  text-align: right;
  margin-bottom: 20px;
}

.text-area {
  width: 100%; box-sizing: border-box;
  background: #18181b;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px; color: #fff;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 24px;
  transition: border-color 0.2s;
}
.text-area::placeholder { color: #52525b; }
.text-area:focus { outline: none; border-color: #3b82f6; }

/* ── Divisor ────────────────────────────────────────────────── */
.divider {
  border: none;
  border-top: 1px solid #27272a;
  margin: 0 0 24px;
}

/* ── Fila configuración ─────────────────────────────────────── */
.settings-row {
  display: flex; align-items: center;
  gap: 14px; margin-bottom: 24px;
}
.settings-icon-wrap {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.settings-text { flex: 1; }
.settings-title { font-size: 15px; font-weight: 500; color: #fff; }
.settings-sub   { font-size: 12px; color: #71717a; }
.settings-value { font-size: 14px; color: #71717a; }

/* ── Tipo de curso ─────────────────────────────────────────── */
.type-row {
  display: flex; gap: 12px;
  margin-bottom: 24px;
}
.type-card {
  flex: 1;
  background: #18181b;
  border: 1.5px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 18px 16px;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  cursor: pointer;
  transition: all 0.18s;
}
.type-card--on {
  background: rgba(59,130,246,0.08);
  border-color: #3b82f6;
}
.type-lbl      { font-size: 13px; font-weight: 600; color: #71717a; }
.type-lbl--on  { color: #3b82f6; }

/* ── Overlay de carga ──────────────────────────────────────── */
.upload-overlay {
  position: fixed; inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center;
}
.upload-box {
  background: #18181b;
  border-radius: 20px;
  padding: 32px 28px;
  width: 280px;
  display: flex; flex-direction: column;
  align-items: center; gap: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}
.spinner {
  width: 48px; height: 48px;
  border: 3px solid rgba(255,255,255,0.07);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.upload-box-title  { font-size: 16px; font-weight: 700; color: #fff; }
.upload-box-status { font-size: 13px; color: #71717a; text-align: center; }
.upload-box-pct    { font-size: 13px; color: #71717a; }

.progress-track {
  width: 100%; height: 4px;
  background: #27272a;
  border-radius: 2px; overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
  transition: width 0.25s ease;
}

/* ── Toast de error ────────────────────────────────────────── */
.error-toast {
  position: fixed;
  bottom: 32px; left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: #ef4444;
  color: #fff;
  font-size: 13px; font-weight: 600;
  padding: 12px 20px;
  border-radius: 12px;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}

/* ── Transición fade ──────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

/* ══════════════════════════════════════════════════════════════ */
/* VIEW MODE                                                      */
/* ══════════════════════════════════════════════════════════════ */
.back-fab {
  position: fixed;
  top: 16px; left: 16px;
  z-index: 50;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
}

.vp-wrap {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}
.vp-video  { width: 100%; height: 100%; object-fit: contain; display: block; }
.vp-skeleton {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}

.view-body { padding: 16px; }

.view-title {
  font-size: 18px; font-weight: 700; color: #fff;
  line-height: 1.3; margin: 0 0 6px;
}
.view-meta { font-size: 13px; color: #71717a; margin-bottom: 12px; }

.actions-row {
  display: flex; justify-content: space-around;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px;
}
.action-btn {
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  color: #fff; font-size: 12px;
}

.creator-row {
  display: flex; align-items: center;
  gap: 12px; padding: 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.creator-av {
  width: 40px; height: 40px; border-radius: 50%;
  background: #27272a;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.av-letter      { font-size: 16px; font-weight: 600; color: #71717a; }
.creator-info   { flex: 1; }
.creator-name   { font-size: 15px; font-weight: 600; color: #fff; }
.creator-subs   { font-size: 12px; color: #71717a; }

.sub-btn {
  padding: 8px 20px;
  border-radius: 20px;
  background: #3b82f6;
  color: #fff;
  font-size: 13px; font-weight: 600;
}

.desc-section { padding: 16px 0; }
.desc-text    { font-size: 14px; color: #ccc; line-height: 1.55; }
</style>
