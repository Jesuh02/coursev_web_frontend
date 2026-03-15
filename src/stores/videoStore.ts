import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Video } from '@/domain/models'
import { videoAdapter } from '@/infrastructure/api'

export const useVideoStore = defineStore('videos', () => {
  const videos = ref<Video[]>([])
  const current = ref<Video | null>(null)
  const loading = ref(false)
  const page = ref(1)

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
    loading.value = true
    try {
      const data = await videoAdapter.getPublicVideos(pageNum)
      if (pageNum === 1) videos.value = data
      else videos.value.push(...data)
    } finally { loading.value = false }
  }

  async function fetchVideoById(id: number) {
    loading.value = true
    try { current.value = await videoAdapter.getVideoById(id) }
    finally { loading.value = false }
  }

  async function searchVideos(query: string) {
    loading.value = true
    try { videos.value = await videoAdapter.searchVideos(query) }
    finally { loading.value = false }
  }

  return {
    videos, current, loading, page,
    fetchFeed, fetchPublicFeed, fetchVideoById, searchVideos,
  }
})
