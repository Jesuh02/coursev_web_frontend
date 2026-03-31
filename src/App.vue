<template>
  <div class="app-shell">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <keep-alive :include="['CourseDetailView']" :max="10">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
    <BottomNavigation v-if="showNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import BottomNavigation from '@/components/BottomNavigation.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const showNav = computed(() => !route.meta.hideNav)

onMounted(async () => {
  await authStore.fetchProfile()
  // Connect notification socket & request browser permission once user is known
  const userId = Number(authStore.user?.id ?? 0)
  if (userId > 0) {
    notifStore.connectSocket(userId)
    notifStore.requestBrowserPermission()
  }

  // Handle notification clicks from the service worker → navigate inside the app
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data.url) {
        router.push(event.data.url)
      }
    })
  }
})

// Re-connect if user changes (login/logout)
watch(() => authStore.user?.id, (newId) => {
  const userId = Number(newId ?? 0)
  if (userId > 0) {
    notifStore.connectSocket(userId)
    notifStore.requestBrowserPermission()
  } else {
    notifStore.disconnectSocket()
  }
})
</script>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}
</style>
