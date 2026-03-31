<template>
  <div class="video-home-container">
    <!-- Top Navigation -->
    <VideoTopNav @toggle-search="showSearch = !showSearch" @go-login="logoutAndGoToLogin" />

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
    </div>

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

type VideoCardInstance = InstanceType<typeof VideoCard>

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()
const notifStore = useNotificationStore()
const feedRef = ref<HTMLElement | null>(null)
const showSearch = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)
const activeVideoPaused = ref(false)
const activeVideoControlsVisible = ref(false)
const cardRefs = ref<(VideoCardInstance | null)[]>([])

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
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
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

.skeleton-feed {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
