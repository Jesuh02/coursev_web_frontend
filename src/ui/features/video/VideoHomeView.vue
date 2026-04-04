<template>
  <div class="video-home-container">
    <!-- Ambilight mirror video – blurred copy of the active video, avoids CORS -->
    <video ref="ambilightVideo" class="ambilight-video" muted loop playsinline tabindex="-1" aria-hidden="true" />

    <!-- Top Navigation -->
    <VideoTopNav @toggle-search="showSearch = !showSearch" @go-login="logoutAndGoToLogin" />

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
    </div>

    <!-- Video Feed Wrapper (centered on desktop) -->
    <div class="video-feed-wrapper">
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
let _ambilightRaf = 0
let _lastAmbilightTs = 0

function _drawAmbilight(ts: number) {
  _ambilightRaf = requestAnimationFrame(_drawAmbilight)
  if (ts - _lastAmbilightTs < 66) return   // ~15 fps cap
  _lastAmbilightTs = ts

  const canvas = ambilightCanvas.value
  if (!canvas) return

  const card = cardRefs.value[activeIndex.value]
  const vid = (card as any)?.videoEl as HTMLVideoElement | null
  if (!vid || vid.readyState < 2) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (canvas.width !== 128 || canvas.height !== 228) {
    canvas.width = 128
    canvas.height = 228
  }

  try {
    ctx.drawImage(vid, 0, 0, 128, 228)
  } catch { /* CORS taint – silently skip */ }
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
  _ambilightRaf = requestAnimationFrame(_drawAmbilight)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  cancelAnimationFrame(_ambilightRaf)
})

watch(activeIndex, async (newIdx) => {
  await nextTick()
  requestAnimationFrame(() => {
    syncActiveVideoPauseState()
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

.video-home {
  height: 100dvh;
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

/* Desktop navigation arrows - hidden on mobile */
.desktop-nav-arrows {
  display: none;
}

/* Desktop layout: centered video with arrows */
@media (min-width: 768px) {
  .video-feed-wrapper {
    gap: 16px;
  }

  .video-home {
    max-width: 560px;
    height: calc(100dvh - 40px);
    border-radius: 16px;
    scroll-snap-type: none;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 80px;
    position: relative;
    z-index: 1;
  }

  /* Ambient glow behind the video feed */
  .video-feed-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(calc(-50% - 20px), -50%);
    width: 500px;
    height: calc(100dvh - 20px);
    z-index: 0;
    border-radius: 28px;
    background:
      radial-gradient(ellipse at 30% 20%, rgba(180, 160, 220, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(160, 180, 220, 0.07) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.05) 0%, rgba(200, 200, 220, 0.03) 40%, transparent 70%);
    filter: blur(40px);
    pointer-events: none;
  }

  .desktop-nav-arrows {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: absolute;
    right: calc(50% - 330px);
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  .nav-arrow {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, opacity 0.2s, transform 0.15s;
    backdrop-filter: blur(8px);
  }

  .nav-arrow:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
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
    right: calc(50% - 360px);
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
.ambilight-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: blur(90px) saturate(3) brightness(0.55);
  opacity: 0.7;
  z-index: 0;
  pointer-events: none;
  transform: scale(1.08);
}
</style>
