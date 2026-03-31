<template>
  <div class="video-home-container">
    <!-- Top Navigation -->
    <VideoTopNav @toggle-search="showSearch = !showSearch" @go-login="logoutAndGoToLogin" />

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
    </div>

    <button
      v-if="showPictureInPictureButton"
      class="pip-btn"
      :class="{ 'pip-btn--active': pipActive }"
      :title="pipActive ? 'Cerrar pantalla emergente' : 'Abrir pantalla emergente'"
      :aria-label="pipActive ? 'Cerrar pantalla emergente' : 'Abrir pantalla emergente'"
      @click="togglePictureInPicture"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="14" rx="2" ry="2" />
        <path d="M13 14h6v5h-6z" />
      </svg>
    </button>

    <!-- Video Feed -->
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
          :video="video"
          :active="idx === activeIndex"
          @playback-state-change="onPlaybackStateChange(idx, $event)"
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

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()
const notifStore = useNotificationStore()
const feedRef = ref<HTMLElement | null>(null)
const showSearch = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const pipActive = ref(false)
const activeVideoPaused = ref(false)

const pipSupported = computed(() =>
  typeof document !== 'undefined' && 'pictureInPictureEnabled' in document
)

const activeVideo = computed(() => filteredVideos.value[activeIndex.value] ?? null)

const showPictureInPictureButton = computed(() =>
  pipSupported.value && activeVideoPaused.value
)

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

function getActiveVideoElement(): HTMLVideoElement | null {
  const cards = feedRef.value?.querySelectorAll<HTMLElement>('.video-card')
  const activeCard = cards?.[activeIndex.value]
  return activeCard?.querySelector('video') ?? null
}

function syncActiveVideoPauseState() {
  const videoEl = getActiveVideoElement()
  activeVideoPaused.value = videoEl ? videoEl.paused : false
}

function syncPiPState() {
  pipActive.value = Boolean(document.pictureInPictureElement)
}

function onPlaybackStateChange(index: number, payload: { paused: boolean }) {
  if (index !== activeIndex.value) return
  activeVideoPaused.value = payload.paused
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
  syncPiPState()
  document.addEventListener('enterpictureinpicture', syncPiPState)
  document.addEventListener('leavepictureinpicture', syncPiPState)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('enterpictureinpicture', syncPiPState)
  document.removeEventListener('leavepictureinpicture', syncPiPState)
})

watch(activeIndex, async () => {
  await nextTick()
  requestAnimationFrame(() => {
    syncActiveVideoPauseState()
    syncPiPState()
  })
})

function onScroll() {
  if (!feedRef.value) return
  const cardH = feedRef.value.clientHeight
  activeIndex.value = Math.round(feedRef.value.scrollTop / cardH)
}

async function togglePictureInPicture() {
  if (!pipSupported.value) return

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
      syncPiPState()
      return
    }

    const videoEl = getActiveVideoElement()
    if (!videoEl || typeof videoEl.requestPictureInPicture !== 'function') return

    if (videoEl.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onLoadedData = () => {
          videoEl.removeEventListener('loadeddata', onLoadedData)
          resolve()
        }
        videoEl.addEventListener('loadeddata', onLoadedData, { once: true })
      })
    }

    try {
      await videoEl.play()
    } catch {
      // Ignore autoplay restrictions here; PiP may still succeed.
    }

    await videoEl.requestPictureInPicture()
    syncPiPState()
  } catch {
    syncPiPState()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const dir = e.key === 'ArrowDown' ? 1 : -1
    const next = Math.max(0, Math.min(activeIndex.value + dir, filteredVideos.value.length - 1))
    if (next !== activeIndex.value) {
      activeIndex.value = next
      const cards = feedRef.value?.querySelectorAll('.video-card')
      cards?.[next]?.scrollIntoView({ behavior: 'smooth' })
    }
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
  router.replace('/login')
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

.pip-btn {
  position: fixed;
  top: 144px;
  right: 16px;
  z-index: 65;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(12, 12, 16, 0.78);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.pip-btn:hover {
  transform: translateY(-1px);
  background: rgba(20, 20, 28, 0.9);
}

.pip-btn:active {
  transform: scale(0.96);
}

.pip-btn--active {
  color: #7dd3fc;
  border-color: rgba(125, 211, 252, 0.45);
  background: rgba(8, 47, 73, 0.88);
}

.skeleton-feed {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (max-width: 480px) {
  .pip-btn {
    top: 80px;
  }
}
</style>
