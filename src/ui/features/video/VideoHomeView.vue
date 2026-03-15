<template>
  <div class="video-home">
    <VideoTopNav @search="searchQuery = $event" @toggle-search="showSearch = !showSearch" />

    <div v-if="showSearch" class="search-overlay">
      <SearchBar v-model="searchQuery" placeholder="Buscar videos..." />
      <div class="filter-chips">
        <button v-for="chip in filterChips" :key="chip" :class="['chip', { active: activeFilter === chip }]" @click="activeFilter = chip">
          {{ chip }}
        </button>
      </div>
    </div>

    <div v-if="videoStore.loading" class="skeleton-feed">
      <VideoSkeleton v-for="i in 3" :key="i" />
    </div>

    <div v-else class="video-feed" ref="feedRef">
      <VideoCard
        v-for="video in filteredVideos"
        :key="video.id"
        :video="video"
        @like="onLike(video.id)"
        @comment="onComment(video.id)"
        @share="onShare(video.id)"
        @profile="goToProfile(video.userId)"
      />
      <EmptyState v-if="!filteredVideos.length" title="No hay videos" description="Aún no hay contenido disponible" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoStore } from '@/stores/videoStore'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'
import VideoTopNav from './components/VideoTopNav.vue'
import VideoCard from './components/VideoCard.vue'
import VideoSkeleton from './components/VideoSkeleton.vue'

const router = useRouter()
const videoStore = useVideoStore()
const showSearch = ref(false)
const searchQuery = ref('')
const activeFilter = ref('Todos')
const filterChips = ['Todos', 'Título', 'Usuario', 'Categoría']

const filteredVideos = computed(() => {
  if (!searchQuery.value) return videoStore.videos
  const q = searchQuery.value.toLowerCase()
  return videoStore.videos.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.username?.toLowerCase().includes(q) ||
    v.description?.toLowerCase().includes(q)
  )
})

onMounted(() => videoStore.fetchPublicFeed())

function onLike(_id: number) {}
function onComment(_id: number) {}
function onShare(_id: number) {}
function goToProfile(userId: number | null) {
  if (userId) router.push(`/user/${userId}`)
}
</script>

<style scoped>
.video-home {
  flex: 1;
  overflow-y: auto;
  background: #000;
  position: relative;
  scroll-snap-type: y mandatory;
}

.search-overlay {
  position: sticky;
  top: 56px;
  z-index: 40;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-chips {
  display: flex;
  gap: 8px;
}

.chip {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.chip.active {
  background: var(--purple-light);
  color: #fff;
  border-color: var(--purple-light);
}

.skeleton-feed {
  display: flex;
  flex-direction: column;
}

.video-feed {
  display: flex;
  flex-direction: column;
}
</style>
