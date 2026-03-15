import type { SubscriptionPort } from '@/domain/ports'
import type { User, Subscription } from '@/domain/models'
import { api } from './httpClient'

export const subscriptionAdapter: SubscriptionPort = {
  getMySubscriptions: () => api.get<Subscription[]>('/subscriptions/my'),
  getMySubscribedCreators: () => api.get<User[]>('/subscriptions/my/creators'),
  getMySubscribers: () => api.get<Subscription[]>('/subscriptions/subscribers'),
  checkSubscription: (creatorId) => api.get<boolean>(`/subscriptions/check/${creatorId}`),
  getSubscriberCount: (creatorId) => api.get<number>(`/subscriptions/count/${creatorId}`),
  subscribe: (creatorId) => api.post<Subscription>(`/subscriptions/${creatorId}`, null),
  unsubscribe: (creatorId) => api.delete(`/subscriptions/${creatorId}`),
}
