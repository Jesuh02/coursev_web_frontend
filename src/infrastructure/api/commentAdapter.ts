import type { CommentPort } from '@/domain/ports'
import type { VideoComment } from '@/domain/models'
import { api } from './httpClient'

export const commentAdapter: CommentPort = {
  getCommentsByVideo: (videoId, page = 1) =>
    api.get<VideoComment[]>(`/comments/video/${videoId}?page=${page}&pageSize=50`),

  getCommentCount: async (videoId) => {
    const res = await api.get<{ count: number }>(`/comments/video/${videoId}/count`)
    return res.count
  },

  createComment: (videoId, comment, parentId) => {
    const body: Record<string, unknown> = { videoId, content: comment }
    if (parentId) body.parentId = parentId
    return api.post<VideoComment>('/comments', body)
  },

  deleteComment: (id) => api.delete(`/comments/${id}`),
}
