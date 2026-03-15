import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Subscription, User } from '@/domain/models'
import { subscriptionAdapter } from '@/infrastructure/api'

export const useSubscriptionStore = defineStore('subscriptions', () => {
  const subscriptions = ref<Subscription[]>([])
  const creators = ref<User[]>([])
  const loading = ref(false)

  async function fetchMySubscriptions() {
    loading.value = true
    try { subscriptions.value = await subscriptionAdapter.getMySubscriptions() }
    finally { loading.value = false }
  }

  async function fetchSubscribedCreators() {
    loading.value = true
    try { creators.value = await subscriptionAdapter.getMySubscribedCreators() }
    finally { loading.value = false }
  }

  async function subscribe(creatorId: number) {
    const sub = await subscriptionAdapter.subscribe(creatorId)
    subscriptions.value.push(sub)
    return sub
  }

  async function unsubscribe(creatorId: number) {
    await subscriptionAdapter.unsubscribe(creatorId)
    subscriptions.value = subscriptions.value.filter(s => s.creator_id !== creatorId)
  }

  async function checkSubscription(creatorId: number) {
    return subscriptionAdapter.checkSubscription(creatorId)
  }

  async function getSubscriberCount(creatorId: number) {
    return subscriptionAdapter.getSubscriberCount(creatorId)
  }

  return {
    subscriptions, creators, loading,
    fetchMySubscriptions, fetchSubscribedCreators,
    subscribe, unsubscribe, checkSubscription, getSubscriberCount,
  }
})
