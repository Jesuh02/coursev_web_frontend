<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.route"
      :class="['nav-item', { active: isActive(item.route) }]"
      @click="navigate(item.route)"
    >
      <span class="nav-icon-wrapper">
        <component :is="item.icon" :size="24" />
        <span v-if="item.badge && item.badge > 0" class="badge">{{ item.badge }}</span>
      </span>
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'
import IconHome from '@/ui/shared/icons/IconHome.vue'
import IconExplore from '@/ui/shared/icons/IconExplore.vue'
import IconActivity from '@/ui/shared/icons/IconActivity.vue'
import IconProfile from '@/ui/shared/icons/IconProfile.vue'

const router = useRouter()
const route = useRoute()
const notificationStore = useNotificationStore()

const navItems = computed(() => [
  { route: '/video', label: 'Inicio', icon: IconHome, badge: 0 },
  { route: '/explore', label: 'Explorar', icon: IconExplore, badge: 0 },
  { route: '/notifications', label: 'Actividad', icon: IconActivity, badge: notificationStore.unreadCount },
  { route: '/profile', label: 'Perfil', icon: IconProfile, badge: 0 },
])

function isActive(path: string) {
  return route.path === path
}

function navigate(path: string) {
  router.push(path)
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  background: #000;
  border-top: 1px solid var(--border-color);
  padding: 6px 0 env(safe-area-inset-bottom, 8px);
  flex-shrink: 0;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  transition: transform 0.15s ease;
}

.nav-item:active {
  transform: scale(0.9);
}

.nav-item.active .nav-label {
  color: #fff;
}

.nav-item.active :deep(svg) {
  color: #fff;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 20px;
  border-radius: 16px;
  transition: background 0.2s;
}

.nav-item.active .nav-icon-wrapper {
  background: rgba(139, 92, 246, 0.15);
}

.badge {
  position: absolute;
  top: -2px;
  right: 12px;
  min-width: 18px;
  height: 18px;
  background: var(--red-netflix);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.nav-label {
  font-size: 11px;
  color: var(--text-muted);
  transition: color 0.2s;
}

:deep(svg) {
  color: var(--text-muted);
  transition: color 0.2s;
}
</style>
