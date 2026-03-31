<template>
  <div class="video-card" @click="onCardClick">
    <!-- Video player -->
    <video
      ref="videoEl"
      class="video-player"
      :src="videoUrl ?? undefined"
      :poster="thumbUrl ?? undefined"
      loop
      playsinline
      preload="auto"
      @loadeddata="loaded = true"
      @error="onVideoError"
    />

    <!-- Video placeholder (thumbnail or loading) -->
    <div v-if="!loaded && !videoError" class="video-placeholder">
      <img v-if="thumbUrl" :src="thumbUrl" class="poster-img" alt="" />
      <div v-else class="poster-fallback">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    </div>

    <!-- Video error state -->
    <div v-if="videoError" class="video-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span>No se pudo cargar el video</span>
      <button class="retry-btn" @click.stop="retryLoad">Reintentar</button>
    </div>

    <!-- Pause indicator (temporary overlay) -->
    <transition name="fade">
      <div v-if="showPauseIcon" class="pause-indicator">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
    </transition>

    <!-- Right side action buttons -->
    <div class="right-actions">
      <!-- Profile button with subscribe badge -->
      <button class="action-btn profile-btn" @click.stop="$emit('profile')">
        <div class="profile-avatar-container">
          <AppAvatar :size="48" :alt="displayUsername" :src="null" />
          <div v-if="!subscribed" class="subscribe-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <line x1="12" y1="5" x2="12" y2="19" stroke-width="2.5"/>
              <line x1="5" y1="12" x2="19" y2="12" stroke-width="2.5"/>
            </svg>
          </div>
        </div>
      </button>

      <!-- Like button -->
      <button :class="['action-btn', { liked }]" @click.stop="handleLike">
        <svg width="32" height="32" viewBox="0 0 24 24" :fill="liked ? '#ff2d55' : 'none'" :stroke="liked ? '#ff2d55' : '#fff'" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span class="action-count">{{ formatCount(likeCount) }}</span>
      </button>

      <!-- Comment button -->
      <button class="action-btn" @click.stop="$emit('comment')">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="action-count">{{ formatCount(commentCount) }}</span>
      </button>

      <!-- Share button -->
      <button class="action-btn" @click.stop="$emit('share')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span class="action-label">Compartir</span>
      </button>

      <!-- Mute/Unmute button -->
      <button class="action-btn" @click.stop="muted = !muted">
        <svg v-if="!muted" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>
    </div>

    <!-- Bottom info section -->
    <div class="bottom-info">
      <div class="creator-row">
        <span class="creator-name">@{{ displayUsername }}</span>
        <span v-if="subscribed" class="follow-label">• Suscrito</span>
        <span v-if="isPremium" class="premium-badge">✦ PRO</span>
      </div>
      <p v-if="displayDescription" class="video-desc">{{ displayDescription }}</p>
      <div class="audio-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span class="audio-text">Original Audio - {{ displayUsername }}</span>
      </div>
    </div>

    <!-- Optional controls overlay -->
    <transition name="fade">
      <div v-if="showControls" class="controls-overlay" @click.stop>
        <button class="control-btn" @click="togglePause" :title="paused ? 'Reproducir' : 'Pausar'">
          <svg v-if="paused" width="24" height="24" viewBox="0 0 24 24" fill="#fff">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="#fff">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
        <button class="control-btn" @click="enterFullscreen" title="Pantalla completa">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Video } from '@/domain/models'
import { likeAdapter, commentAdapter, subscriptionAdapter } from '@/infrastructure/api'
import { tokenStorage, resolveImageUrl, buildProxyFileUrl, extractR2Key } from '@/infrastructure/api/httpClient'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'

const props = defineProps<{ video: Video; active: boolean }>()
defineEmits<{ like: []; comment: []; share: []; profile: [] }>()

const videoEl = ref<HTMLVideoElement | null>(null)
const loaded = ref(false)
const paused = ref(true)
const muted = ref(false)
const videoError = ref(false)
const showPauseIcon = ref(false)
const showControls = ref(false)
const liked = ref(false)
const likeCount = ref(0)
const commentCount = ref(0)
const subscribed = ref(false)

const videoUrl = ref<string | null>(null)
const thumbUrl = ref<string | null>(null)

const displayUsername = computed(() => {
  const raw = props.video.username?.trim()
  return raw && raw.length > 0 ? raw : 'coursev'
})

const displayTitle = computed(() => {
  const raw = props.video.title?.trim()
  return raw && raw.length > 0 ? raw : ''
})

const displayDescription = computed(() => {
  const raw = props.video.description?.trim()
  return raw && raw.length > 0 ? raw : ''
})

const isPremium = computed(() => props.video.isPaid || subscribed.value)

const pipSupported = computed(() =>
  typeof document !== 'undefined' && 'pictureInPictureEnabled' in document
)

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

function resolveVideoUrl(v: Video): string | null {
  const raw = v.video_uri_string || v.videoUriString
  if (!raw || raw.startsWith('file:///')) return null
  // URL pre-firmada → usar directamente (acceso directo a R2, sin proxy)
  if (raw.includes('X-Amz-Signature')) return raw
  const r2Key = extractR2Key(raw)
  if (r2Key) return buildProxyFileUrl(r2Key)
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return buildProxyFileUrl(raw)
}

function onVideoError() {
  videoError.value = true
}

function retryLoad() {
  videoError.value = false
  loaded.value = false
  videoUrl.value = resolveVideoUrl(props.video)
}

onMounted(() => {
  videoUrl.value = resolveVideoUrl(props.video)
  thumbUrl.value = resolveImageUrl(props.video.thumbnail_uri || props.video.thumbnailUri)
  loadCounts()
  if (props.active) tryPlay()
})

function tryPlay() {
  if (!videoEl.value) {
    requestAnimationFrame(() => tryPlay())
    return
  }
  videoEl.value.muted = muted.value
  videoEl.value.play().then(() => { paused.value = false }).catch(() => {})
}

async function loadCounts() {
  try {
    const [lc, cc] = await Promise.allSettled([
      likeAdapter.getLikeCount('video', props.video.id),
      commentAdapter.getCommentCount(props.video.id),
    ])
    if (lc.status === 'fulfilled') likeCount.value = lc.value
    if (cc.status === 'fulfilled') commentCount.value = cc.value
  } catch { /* silent */ }

  if (tokenStorage.isAuthenticated) {
    try {
      liked.value = await likeAdapter.checkLike('video', props.video.id)
    } catch { /* silent */ }
    if (props.video.userId) {
      try {
        subscribed.value = await subscriptionAdapter.checkSubscription(props.video.userId)
      } catch { /* silent */ }
    }
  }
}

watch(() => props.active, (isActive) => {
  if (!videoEl.value) return
  if (isActive) {
    videoEl.value.muted = muted.value
    videoEl.value.play().then(() => { paused.value = false }).catch(() => {})
    showPauseIcon.value = false
  } else {
    videoEl.value.pause()
    paused.value = true
    showControls.value = false
  }
})

watch(muted, (m) => {
  if (videoEl.value) videoEl.value.muted = m
})

let pauseTimeout: ReturnType<typeof setTimeout> | undefined
let controlsTimeout: ReturnType<typeof setTimeout> | undefined

function onCardClick() {
  if (!videoEl.value) return
  showControls.value = !showControls.value
  if (showControls.value) resetControlsTimer()
}

function resetControlsTimer() {
  clearTimeout(controlsTimeout)
  controlsTimeout = setTimeout(() => { showControls.value = false }, 4000)
}

function togglePause() {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    videoEl.value.play().catch(() => {})
    paused.value = false
    showPauseIcon.value = false
  } else {
    videoEl.value.pause()
    paused.value = true
    showPauseIcon.value = true
    clearTimeout(pauseTimeout)
    pauseTimeout = setTimeout(() => { showPauseIcon.value = false }, 1500)
  }
}

async function enterFullscreen() {
  if (!videoEl.value) return
  try {
    if (videoEl.value.requestFullscreen) {
      await videoEl.value.requestFullscreen()
    } else if ((videoEl.value as any).webkitEnterFullscreen) {
      (videoEl.value as any).webkitEnterFullscreen()
    }
  } catch { /* silent */ }
}

async function enterPiP() {
  if (!videoEl.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoEl.value.requestPictureInPicture()
    }
  } catch { /* silent */ }
}

async function handleLike() {
  if (!tokenStorage.isAuthenticated) return
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  try {
    const result = await likeAdapter.toggleLike('video', props.video.id)
    liked.value = result.liked
    likeCount.value = result.count
  } catch {
    liked.value = !liked.value
    likeCount.value += liked.value ? 1 : -1
  }
}

onBeforeUnmount(() => {
  clearTimeout(pauseTimeout)
  clearTimeout(controlsTimeout)
  if (videoEl.value && !document.pictureInPictureElement) {
    videoEl.value.pause()
    videoEl.value.removeAttribute('src')
    videoEl.value.load()
  }
})
</script>

<style scoped>
.video-card {
  position: relative;
  height: calc(100dvh - 56px);
  scroll-snap-align: start;
  background: #000;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.video-player {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.video-player:fullscreen {
  object-fit: contain;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a1a, #1a0a2e);
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #0a0a1a, #1a0a2e);
  z-index: 5;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.retry-btn {
  margin-top: 4px;
  padding: 8px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.pause-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
  z-index: 5;
  pointer-events: none;
}

.controls-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 16px;
  z-index: 15;
  padding: 14px 24px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.control-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: background 0.2s, transform 0.15s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.control-btn:active {
  transform: scale(0.9);
}

.overlay-gradient-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
  z-index: 3;
  pointer-events: none;
}

.overlay-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent);
  z-index: 3;
  pointer-events: none;
}

.right-actions {
  position: absolute;
  right: 8px;
  bottom: calc(160px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
  pointer-events: auto;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
  transition: transform 0.15s;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}

.action-btn:active {
  transform: scale(0.85);
}

.action-btn.liked svg {
  filter: drop-shadow(0 0 8px rgba(255, 45, 85, 0.6));
}

.profile-btn {
  margin-bottom: 4px;
  position: relative;
}

.profile-avatar-shell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-btn :deep(.avatar) {
  border: 1.5px solid #9c27b0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.subscribe-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ff4aa2 0%, #ff2d55 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
}

.action-count {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.action-label {
  font-size: 10px;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.bottom-info {
  position: absolute;
  left: 16px;
  right: 80px;
  bottom: calc(140px + env(safe-area-inset-bottom, 0px));
  z-index: 10;
  pointer-events: none;
}

.creator-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.creator-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  min-height: 18px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.35);
  color: #ffd700;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.follow-label {
  font-size: 14px;
  color: #aaa;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.video-desc {
  font-size: 14px;
  color: #fff;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.video-topic {
  margin: 0 0 12px;
  font-size: 14px;
  color: #64b5f6;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.audio-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.26);
  padding: 6px 12px;
  border-radius: 20px;
  width: fit-content;
  max-width: min(100%, 240px);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.audio-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .right-actions {
    bottom: calc(148px + env(safe-area-inset-bottom, 0px));
  }

  .bottom-info {
    right: 76px;
    bottom: calc(132px + env(safe-area-inset-bottom, 0px));
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
