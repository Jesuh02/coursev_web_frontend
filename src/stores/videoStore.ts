import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Video } from '@/domain/models'
import { videoAdapter } from '@/infrastructure/api'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export const useVideoStore = defineStore('videos', () => {
  const videos = ref<Video[]>([])
  const current = ref<Video | null>(null)
  const loading = ref(false)
  const page = ref(1)
  const lastFetched = ref(0)
  let publicFeedPromise: Promise<void> | null = null

  async function fetchFeed(pageNum = 1) {
    loading.value = true
    try {
      const data = await videoAdapter.getStreamingFeed(pageNum)
      if (pageNum === 1) videos.value = data
      else videos.value.push(...data)
      page.value = pageNum
    } finally { loading.value = false }
  }

  async function fetchPublicFeed(pageNum = 1) {
    const hasCache = videos.value.length > 0 && pageNum === 1
    const isFresh = Date.now() - lastFetched.value < CACHE_TTL

    // Si hay datos frescos, no hacer nada
    if (hasCache && isFresh) return

    // Si ya hay una petición en vuelo para pageNum=1, reusar la misma promise
    if (pageNum === 1 && publicFeedPromise) return publicFeedPromise

    // Solo mostrar skeleton si no hay datos previos
    if (!hasCache) loading.value = true

    const run = async () => {
      try {
        const data = await videoAdapter.getPublicVideos(pageNum)
        if (pageNum === 1) videos.value = data
        else videos.value.push(...data)
        lastFetched.value = Date.now()
      } finally {
        loading.value = false
        if (pageNum === 1) publicFeedPromise = null
      }
    }

    if (pageNum === 1) {
      publicFeedPromise = run()
      return publicFeedPromise
    }
    return run()
  }

  async function fetchVideoById(id: number) {
    loading.value = true
    try { current.value = await videoAdapter.getVideoById(id) }
    finally { loading.value = false }
  }

  async function ensureVideoInFeed(id: number) {
    const existing = videos.value.find(video => video.id === id)
    if (existing) return existing

    const fetched = await videoAdapter.getVideoById(id)
    current.value = fetched
    videos.value = [fetched, ...videos.value.filter(video => video.id !== id)]
    return fetched
  }

  async function searchVideos(query: string) {
    loading.value = true
    try { videos.value = await videoAdapter.searchVideos(query) }
    finally { loading.value = false }
  }

  return {
    videos, current, loading, page, lastFetched,
    fetchFeed, fetchPublicFeed, fetchVideoById, ensureVideoInFeed, searchVideos,
  }
})
