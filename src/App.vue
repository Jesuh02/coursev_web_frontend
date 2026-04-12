<template>
  <div class="app-shell">
    <!-- Indicador pull-to-refresh -->
    <div
      class="ptr-indicator"
      :class="{ visible: isPulling || isRefreshing }"
      :style="{ transform: `translateX(-50%) translateY(${pullDistance - 48}px)` }"
    >
      <svg
        class="ptr-spinner"
        :class="{ spinning: isRefreshing || pullDistance >= THRESHOLD }"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          :stroke-dasharray="`${(pullDistance / THRESHOLD) * 63} 63`"
          :style="{ transition: isRefreshing ? 'none' : 'stroke-dasharray 0.05s' }"
        />
      </svg>
    </div>

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
    <InstitutionPaymentBanner />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import SideNavigation from '@/components/SideNavigation.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import InstitutionPaymentBanner from '@/components/InstitutionPaymentBanner.vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const { pullDistance, isPulling, isRefreshing, THRESHOLD } = usePullToRefresh()

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
    notifStore.fetchUnreadCount()
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
    notifStore.fetchUnreadCount()
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

/* Pull-to-refresh */
.ptr-indicator {
  position: fixed;
  top: 0;
  left: 50%;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary, #1e1e2e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.ptr-indicator.visible {
  opacity: 1;
}

.ptr-spinner {
  width: 22px;
  height: 22px;
  color: var(--color-primary, #7c3aed);
  transform-origin: center;
}

.ptr-spinner.spinning {
  animation: ptr-spin 0.7s linear infinite;
}

@keyframes ptr-spin {
  to { transform: rotate(360deg); }
}
</style>
