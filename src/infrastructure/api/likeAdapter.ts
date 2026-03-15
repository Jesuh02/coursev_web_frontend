import type { LikePort } from '@/domain/ports'
import type { LikeResult } from '@/domain/models'
import { api } from './httpClient'

export const likeAdapter: LikePort = {
  toggleLike: (entityType, entityId) =>
    api.post<LikeResult>('/likes/toggle', { entityType, entityId }),
  checkLike: (entityType, entityId) =>
    api.get<boolean>(`/likes/check/${entityType}/${entityId}`),
  getLikeCount: async (entityType, entityId) => {
    const res = await api.get<{ count: number }>(`/likes/count/${entityType}/${entityId}`)
    return res.count
  },
}
