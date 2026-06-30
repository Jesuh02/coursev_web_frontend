<template>
  <section class="vp-root">
    <video
      v-if="!hasError"
      ref="videoEl"
      class="vp-video"
      :src="src"
      :aria-label="name"
      controls
      playsinline
      preload="metadata"
      @loadedmetadata="loaded = true"
      @error="hasError = true"
      @enterpictureinpicture="syncPictureInPictureState"
      @leavepictureinpicture="syncPictureInPictureState"
    />

    <div v-if="loaded && !hasError && pipSupported" class="vp-actions">
      <button
        class="vp-icon-btn"
        :class="{ active: pipActive }"
        type="button"
        :title="pipActive ? 'Cerrar segundo plano' : 'Ver en segundo plano'"
        :aria-label="pipActive ? 'Cerrar segundo plano' : 'Ver en segundo plano'"
        @click="togglePictureInPicture"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="14" rx="2" ry="2" />
          <path d="M13 14h6v5h-6z" />
        </svg>
      </button>
    </div>

    <div v-if="!loaded && !hasError" class="vp-loading">
      <span class="vp-spinner" />
      <p>Cargando video...</p>
    </div>

    <div v-if="hasError" class="vp-error">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="1" />
      </svg>
      <p>No se pudo reproducir este video en el navegador.</p>
      <button class="vp-primary-btn" type="button" @click="$emit('download')">Descargar archivo</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  name: string
}>()

defineEmits<{
  download: []
}>()

const loaded = ref(false)
const hasError = ref(false)
const pipActive = ref(false)
const videoEl = ref<HTMLVideoElement | null>(null)

const pipSupported = computed(() =>
  typeof document !== 'undefined' && 'pictureInPictureEnabled' in document
)

async function togglePictureInPicture() {
  const video = videoEl.value
  if (!video || !pipSupported.value) return

  try {
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture()
      return
    }

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    }

    if (video.paused) {
      await video.play().catch(() => undefined)
    }
    await video.requestPictureInPicture()
  } catch {
    pipActive.value = false
  }
}

function syncPictureInPictureState() {
  pipActive.value = document.pictureInPictureElement === videoEl.value
}

watch(() => props.src, () => {
  loaded.value = false
  hasError.value = false
  pipActive.value = false
})

onBeforeUnmount(() => {
  if (document.pictureInPictureElement === videoEl.value) {
    document.exitPictureInPicture().catch(() => undefined)
  }
})
</script>

<style scoped>
.vp-root {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000;
}

.vp-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.vp-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
}

.vp-icon-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(15, 17, 23, 0.72);
  color: #f5f5f7;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.vp-icon-btn:hover,
.vp-icon-btn.active {
  border-color: rgba(0, 212, 255, 0.5);
  background: rgba(0, 212, 255, 0.18);
}

.vp-loading,
.vp-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  text-align: center;
}

.vp-loading {
  color: #d1d1d6;
  pointer-events: none;
}

.vp-error {
  color: #ffb4ad;
  background: #07090d;
}

.vp-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.16);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: vp-spin 0.8s linear infinite;
}

.vp-primary-btn {
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: #00d4ff;
  color: #071018;
  font-weight: 700;
  cursor: pointer;
}

@keyframes vp-spin {
  to { transform: rotate(360deg); }
}
</style>
