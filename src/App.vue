<template>
  <div class="app-shell">
    <SideNavigation v-if="showNav" />
    <div :class="['app-content', { 'with-sidebar': showNav }]">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <keep-alive :include="['CourseDetailView']" :max="10">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
      <BottomNavigation v-if="showNav" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import SideNavigation from '@/components/SideNavigation.vue'
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
    notifStore.fetchUnreadCount()
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
    notifStore.fetchUnreadCount()
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
  background: var(--bg-primary);
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 0;
  transition: margin-left 0.2s ease;
}

.app-content.with-sidebar {
  margin-left: 100px;
}

/* Responsividad: En mobile, la sidebar se oculta */
@media (max-width: 768px) {
  .app-content {
    margin-left: 0;
  }
  
  .app-content.with-sidebar {
    margin-left: 0;
  }
}
</style>
