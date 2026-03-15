import type { VideoPort } from '@/domain/ports'
import type { Video } from '@/domain/models'
import { api } from './httpClient'

export const videoAdapter: VideoPort = {
  getVideos: (page = 1, limit = 50) =>
    api.get<Video[]>(`/videos?page=${page}&pageSize=${limit}`),

  getPublicVideos: (page = 1, limit = 50) =>
    api.publicGet<Video[]>(`/public/videos?page=${page}&pageSize=${limit}`),

  getStreamingFeed: (page = 1, limit = 20) =>
    api.get<Video[]>(`/streaming/feed?page=${page}&pageSize=${limit}`),

  searchVideos: (query) =>
    api.get<Video[]>(`/videos/search?q=${encodeURIComponent(query)}`),

  getVideoById: (id) => api.get<Video>(`/videos/${id}`),

  getVideosByCourse: (courseId) =>
    api.get<Video[]>(`/videos/course/${courseId}`),

  getVideosByCreator: (username) =>
    api.get<Video[]>(`/videos/creator/${username}`),

  createVideo: (video) => api.post<Video>('/videos', video),
  updateVideo: (id, updates) => api.put<Video>(`/videos/${id}`, updates),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  uploadVideoWithFiles: (formData) => api.upload<Video>('/videos/upload', formData),
}
