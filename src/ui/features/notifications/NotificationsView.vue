<template>
  <div class="notifications-view">
    <div class="notifications-header">
      <h1 class="header-title">Notificaciones</h1>
    </div>

    <NotificationSkeleton v-if="notifStore.loading" />

    <div v-else-if="notifStore.items.length" class="notification-list">
      <NotificationItem
        v-for="n in notifStore.items"
        :key="n.id"
        :notification="n"
      />
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">👍</div>
      <p class="empty-title">¡Hurra! Ya estás al día</p>
      <p class="empty-desc">No tienes notificaciones nuevas</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import NotificationItem from './components/NotificationItem.vue'
import NotificationSkeleton from './components/NotificationSkeleton.vue'

const notifStore = useNotificationStore()

onMounted(() => notifStore.fetchNotifications())
</script>

<style scoped>
.notifications-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.notifications-header {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 14px;
  color: #8E8E93;
}
</style>
