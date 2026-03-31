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
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import BottomNavigation from '@/components/BottomNavigation.vue'

const route = useRoute()
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
