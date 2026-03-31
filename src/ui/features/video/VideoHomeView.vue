<template>
  <div class="video-home" ref="feedRef" @scroll="onScroll">
    <VideoTopNav @toggle-search="showSearch = !showSearch" @go-login="logoutAndGoToLogin" />

    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
    </div>

    <div v-if="videoStore.loading && !videoStore.videos.length" class="skeleton-feed">
      <VideoSkeleton v-for="i in 2" :key="i" />
    </div>

    <template v-else>
      <VideoCard
        v-for="(video, idx) in filteredVideos"
        :key="video.id"
        :video="video"
        :active="idx === activeIndex"
        @like="onLike(video)"
        @comment="openComments(video.id)"
        @share="onShare(video)"
        @profile="goToProfile(video.userId)"
      />
      <EmptyState v-if="!filteredVideos.length" title="No hay videos" description="Aún no hay contenido disponible" />
    </template>

    <!-- Comments overlay (igual al BottomSheetDialog de Android) -->
    <VideoCommentsOverlay
      v-if="activeCommentVideoId !== null"
      :video-id="activeCommentVideoId"
      :highlight-comment-id="pendingHighlightId"
      @close="closeComments"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
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

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const videoStore = useVideoStore()
const notifStore = useNotificationStore()
const feedRef = ref<HTMLElement | null>(null)
const showSearch = ref(false)
const searchQuery = ref('')
const activeIndex = ref(0)

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

onUnmounted(() => window.removeEventListener('keydown', onKeydown))

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
  router.replace('/login')
}
</script>

<style scoped>
.video-home {
  flex: 1;
  height: 100dvh;
  overflow-y: scroll;
  background: #000;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.video-home::-webkit-scrollbar {
  display: none;
}

.search-overlay {
  position: fixed;
  top: 78px;
  left: 0;
  right: 0;
  z-index: 60;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
}

.skeleton-feed {
  display: flex;
  flex-direction: column;
}
</style>
