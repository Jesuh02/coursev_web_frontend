<template>
  <div class="video-home-container">
    <!-- Ambilight mirror video – blurred copy of the active video, avoids CORS -->
    <video ref="ambilightVideo" class="ambilight-video" muted loop playsinline tabindex="-1" aria-hidden="true" />

    <!-- Top Navigation -->
    <VideoTopNav @toggle-search="showSearch = !showSearch" />

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
    </div>

    <!-- Video Feed Wrapper (centered on desktop) -->
    <div class="video-feed-wrapper">
      <div class="video-feed-stage">
        <!-- Animated aurora lights around the video feed -->
        <div class="aurora-lights" aria-hidden="true">
          <span class="aurora aurora-1"></span>
          <span class="aurora aurora-2"></span>
          <span class="aurora aurora-3"></span>
          <span class="aurora aurora-4"></span>
        </div>

        <div class="video-stage-glow video-stage-glow-left" aria-hidden="true"></div>
        <div class="video-stage-glow video-stage-glow-right" aria-hidden="true"></div>

        <div class="video-feed-shell">
          <div class="video-home" ref="feedRef" @scroll="onScroll">
            <!-- Skeleton Loading -->
            <div v-if="videoStore.loading && !videoStore.videos.length" class="skeleton-feed">
              <VideoSkeleton v-for="i in 2" :key="i" />
            </div>

            <!-- Video Cards -->
            <template v-else>
              <VideoCard
                v-for="(video, idx) in filteredVideos"
                :key="video.id"
                :ref="(el) => setCardRef(el, idx)"
                :video="video"
                :active="idx === activeIndex"
                :preload-hint="getPreloadHint(idx)"
                @playback-state-change="onPlaybackStateChange(idx, $event)"
                @controls-visibility-change="onControlsVisibilityChange(idx, $event)"
                @like="onLike(video)"
                @comment="openComments(video.id)"
                @share="onShare(video)"
                @profile="goToProfile(video.userId)"
              />
              <EmptyState 
                v-if="!filteredVideos.length" 
                title="No hay videos" 
                description="Aún no hay contenido disponible" 
              />
            </template>
          </div>
        </div>

        <!-- Desktop Navigation Arrows -->
        <div class="desktop-nav-arrows">
          <button
            class="nav-arrow nav-arrow-up"
            :disabled="activeIndex <= 0"
            @click="navigateVideo(-1)"
            aria-label="Video anterior"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            class="nav-arrow nav-arrow-down"
            :disabled="activeIndex >= filteredVideos.length - 1"
            @click="navigateVideo(1)"
            aria-label="Siguiente video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Comments Overlay -->
    <VideoCommentsOverlay
      v-if="activeCommentVideoId !== null"
      :video-id="activeCommentVideoId"
      :highlight-comment-id="pendingHighlightId"
      @close="closeComments"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/videoStore'
import { useVideoSocket } from '@/composables/useVideoSocket'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { likeAdapter } from '@/infrastructure/api'
import type { Video } from '@/domain/models'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'
import VideoTopNav from './components/VideoTopNav.vue'
import VideoCard from './components/VideoCard.vue'
import VideoSkeleton from './components/VideoSkeleton.vue'
import VideoCommentsOverlay from './VideoCommentsView.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

type VideoCardInstance = InstanceType<typeof VideoCard>

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()
const notifStore = useNotificationStore()

// Real-time video feed updates via Socket.io
useVideoSocket({
  onCreated: (video) => videoStore.prependVideo(video),
  onUpdated: (video) => videoStore.replaceVideo(video),
  onDeleted: ({ id })  => videoStore.removeVideo(id),
})

const feedRef = ref<HTMLElement | null>(null)
const ambilightVideo = ref<HTMLVideoElement | null>(null)
const showSearch = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const activeVideoPaused = ref(false)
const activeVideoControlsVisible = ref(false)
const cardRefs = ref<(VideoCardInstance | null)[]>([])

// ── Ambilight ────────────────────────────────────────────────────────────────
function updateAmbilight() {
  const mirror = ambilightVideo.value
  if (!mirror) return
  const card = cardRefs.value[activeIndex.value]
  const vid = (card as any)?.videoEl as HTMLVideoElement | null
  if (!vid?.src) { mirror.src = ''; return }
  if (mirror.src !== vid.src) {
    mirror.src = vid.src
    mirror.currentTime = vid.currentTime
  }
  mirror.playbackRate = vid.playbackRate || 1
  if (Math.abs(mirror.currentTime - vid.currentTime) > 0.35) {
    mirror.currentTime = vid.currentTime
  }
  if (vid.paused) {
    mirror.pause()
    return
  }
  mirror.play().catch(() => {})
}
// ─────────────────────────────────────────────────────────────────────────────

function setCardRef(el: unknown, idx: number) {
  cardRefs.value[idx] = (el as VideoCardInstance | null)
}

/** Controls how aggressively the browser buffers each card based on distance. */
function getPreloadHint(idx: number): 'auto' | 'metadata' | 'none' {
  const dist = Math.abs(idx - activeIndex.value)
  if (dist === 0) return 'auto'
  if (dist <= 2) return 'metadata'
  return 'none'
}

// Comments overlay state
const activeCommentVideoId = ref<number | null>(null)
const pendingHighlightId   = ref<number | null>(null)

function openComments(videoId: number, highlightId?: number | null) {
  pendingHighlightId.value   = highlightId ?? null
  activeCommentVideoId.value = videoId
}
function closeComments() {
  activeCommentVideoId.value = null
  pendingHighlightId.value   = null
}

function syncActiveVideoPauseState() {
  const cards = feedRef.value?.querySelectorAll<HTMLElement>('.video-card')
  const activeCard = cards?.[activeIndex.value]
  const videoEl = activeCard?.querySelector('video') ?? null
  activeVideoPaused.value = videoEl ? videoEl.paused : false
}

function onPlaybackStateChange(index: number, payload: { paused: boolean }) {
  if (index !== activeIndex.value) return
  activeVideoPaused.value = payload.paused
  updateAmbilight()
}

function onControlsVisibilityChange(index: number, payload: { visible: boolean }) {
  if (index !== activeIndex.value) return
  activeVideoControlsVisible.value = payload.visible
}

function stripFeedThumbnail(video: Video): Video {
  return {
    ...video,
    thumbnail_uri: null,
    thumbnailUri: null,
  }
}

const filteredVideos = computed(() => {
  if (!searchQuery.value) return videoStore.videos.map(stripFeedThumbnail)
  const q = searchQuery.value.toLowerCase()
  return videoStore.videos.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.username?.toLowerCase().includes(q) ||
    v.description?.toLowerCase().includes(q)
  ).map(stripFeedThumbnail)
})

async function focusVideoById(videoId: number) {
  await videoStore.ensureVideoInFeed(videoId)
  const targetIndex = filteredVideos.value.findIndex(video => video.id === videoId)
  if (targetIndex < 0) return

  activeIndex.value = targetIndex
  await nextTick()

  requestAnimationFrame(() => {
    const cards = feedRef.value?.querySelectorAll<HTMLElement>('.video-card')
    cards?.[targetIndex]?.scrollIntoView({ behavior: 'auto', block: 'start' })
  })
}

async function initializeFeed() {
  await videoStore.fetchPublicFeed()

  const selectedVideoId = Number(route.query.videoId)
  if (selectedVideoId > 0) {
    await focusVideoById(selectedVideoId)
    await router.replace({
      name: 'videoHome',
      query: {
        ...route.query,
        videoId: undefined,
      },
    })
  }

  window.addEventListener('keydown', onKeydown)

  // Handle notification navigation: ?openComments=videoId&commentId=123&notifId=456
  const openComments = Number(route.query.openComments)
  if (openComments > 0) {
    const highlightId = Number(route.query.commentId) || null
    const notifId = Number(route.query.notifId) || null
    openComments && openComments > 0 && (activeCommentVideoId.value = openComments)
    pendingHighlightId.value = highlightId
    if (notifId) notifStore.markRead(notifId)
    // Clean query params from URL without re-navigating
    router.replace({ name: 'videoHome' })
  }
}

onMounted(() => {
  initializeFeed()
  updateAmbilight()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

watch(activeIndex, async (newIdx) => {
  await nextTick()
  requestAnimationFrame(() => {
    syncActiveVideoPauseState()
    updateAmbilight()
  })
  // Proactively prebuffer the next 2 videos so playback starts instantly.
  // The preloadHint prop already switches to 'metadata' reactively;
  // calling startPreload() upgrades them to 'auto' and kicks off download.
  for (const offset of [1, 2]) {
    cardRefs.value[newIdx + offset]?.startPreload()
  }
})

function onScroll() {
  if (!feedRef.value) return
  const cardH = feedRef.value.clientHeight
  activeIndex.value = Math.round(feedRef.value.scrollTop / cardH)
}

function navigateVideo(dir: number) {
  const next = Math.max(0, Math.min(activeIndex.value + dir, filteredVideos.value.length - 1))
  if (next !== activeIndex.value) {
    activeIndex.value = next
    const cards = feedRef.value?.querySelectorAll('.video-card')
    cards?.[next]?.scrollIntoView({ behavior: 'smooth' })
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    navigateVideo(e.key === 'ArrowDown' ? 1 : -1)
  }
}

async function onLike(video: Video) {
  try {
    await likeAdapter.toggleLike('video', video.id)
  } catch { /* silent */ }
}

function onShare(video: Video) {
  if (navigator.share) {
    navigator.share({ title: video.title, url: `${location.origin}/video/${video.id}` }).catch(() => {})
  } else {
    navigator.clipboard.writeText(`${location.origin}/video/${video.id}`).catch(() => {})
  }
}

function goToProfile(userId: number | null) {
  if (userId) router.push(`/user/${userId}`)
}

function logoutAndGoToLogin() {
  authStore.logout()
}
</script>

<style scoped>
.video-home-container {
  position: relative;
  height: 100dvh;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.video-feed-wrapper {
  position: relative;
  height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.video-feed-stage {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-feed-shell {
  position: relative;
  width: calc(100% - 20px);
  height: calc(100dvh - 96px);
  max-height: calc(100dvh - 96px);
  margin: 10px;
  z-index: 1;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

/* Animated lights moving around the video stage (mimics the reference video) */
.aurora-lights {
  position: absolute;
  inset: -30%;
  z-index: 0;
  pointer-events: none;
  filter: blur(60px) saturate(1.6);
  opacity: 0.75;
  overflow: hidden;
}

.aurora {
  position: absolute;
  width: 55%;
  height: 55%;
  border-radius: 50%;
  mix-blend-mode: screen;
  will-change: transform;
}

.aurora-1 {
  background: radial-gradient(circle, #ff2d95 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation: aurora-move-1 14s linear infinite;
}
.aurora-2 {
  background: radial-gradient(circle, #1d9bf0 0%, transparent 70%);
  top: 40%;
  right: -15%;
  animation: aurora-move-2 18s linear infinite;
}
.aurora-3 {
  background: radial-gradient(circle, #9b5cff 0%, transparent 70%);
  bottom: -15%;
  left: 20%;
  animation: aurora-move-3 20s linear infinite;
}
.aurora-4 {
  background: radial-gradient(circle, #00e0c6 0%, transparent 70%);
  top: 20%;
  left: 35%;
  animation: aurora-move-4 16s linear infinite;
}

@keyframes aurora-move-1 {
  0%   { transform: translate(0, 0)         scale(1); }
  25%  { transform: translate(60%, 30%)     scale(1.2); }
  50%  { transform: translate(80%, 80%)     scale(0.9); }
  75%  { transform: translate(20%, 60%)     scale(1.1); }
  100% { transform: translate(0, 0)         scale(1); }
}
@keyframes aurora-move-2 {
  0%   { transform: translate(0, 0)         scale(1.1); }
  25%  { transform: translate(-40%, 40%)    scale(0.9); }
  50%  { transform: translate(-80%, -20%)   scale(1.3); }
  75%  { transform: translate(-30%, -50%)   scale(1); }
  100% { transform: translate(0, 0)         scale(1.1); }
}
@keyframes aurora-move-3 {
  0%   { transform: translate(0, 0)         scale(1); }
  33%  { transform: translate(50%, -60%)    scale(1.15); }
  66%  { transform: translate(-30%, -30%)   scale(0.95); }
  100% { transform: translate(0, 0)         scale(1); }
}
@keyframes aurora-move-4 {
  0%   { transform: translate(0, 0)         scale(1); }
  25%  { transform: translate(-50%, 40%)    scale(1.2); }
  50%  { transform: translate(30%, 70%)     scale(0.85); }
  75%  { transform: translate(60%, -30%)    scale(1.15); }
  100% { transform: translate(0, 0)         scale(1); }
}

.video-stage-glow {
  display: none;
}

.video-home {
  height: 100%;
  width: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: #000;
}

.video-home::-webkit-scrollbar {
  display: none;
}

/* Override each video card height to match the (smaller) scroll shell */
.video-home :deep(.video-card) {
  height: 100%;
}

/* Desktop navigation arrows - hidden on mobile */
.desktop-nav-arrows {
  display: none;
}

/* Desktop layout: centered video with arrows */
@media (min-width: 768px) {
  .video-feed-wrapper {
    padding: 20px 0;
  }

  .video-feed-stage {
    width: min(100vw - 64px, 760px);
  }

  .video-feed-shell {
    width: 560px;
    height: calc(100dvh - 40px);
    border-radius: 20px;
    background: #000;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 60px rgba(0, 0, 0, 0.7);
    overflow: hidden;
  }

  .video-stage-glow {
    display: none;
  }

  .video-home {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    scroll-snap-type: none;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 88px;
    position: relative;
    z-index: 1;
    background: transparent;
  }

  .desktop-nav-arrows {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: absolute;
    left: calc(50% + 286px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  .nav-arrow {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(14, 21, 31, 0.7);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, opacity 0.2s, transform 0.15s;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  }

  .nav-arrow:hover:not(:disabled) {
    background: rgba(26, 38, 55, 0.88);
    transform: scale(1.05);
  }

  .nav-arrow:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-arrow:disabled {
    opacity: 0.3;
    cursor: default;
  }
}

/* Larger desktops: reposition arrows further out */
@media (min-width: 1200px) {
  .desktop-nav-arrows {
    left: calc(50% + 300px);
  }
}

.search-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  z-index: 60;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.skeleton-feed {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Ambilight ──────────────────────────────────────────────────────────────── */
.ambilight-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(80px) saturate(2.5) brightness(0.45);
  opacity: 0.7;
  z-index: 0;
  pointer-events: none;
  transform: scale(1.15);
}

@media (min-width: 768px) {
  .ambilight-video {
    top: 50%;
    left: 50%;
    inset: auto;
    width: 620px;
    height: calc(100dvh - 40px);
    transform: translate(calc(-50% - 20px), -50%) scale(1.18);
    border-radius: 30px;
    opacity: 0.55;
    filter: blur(90px) saturate(2.8) brightness(0.4);
  }
}
</style>
