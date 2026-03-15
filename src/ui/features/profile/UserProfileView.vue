<template>
  <div class="user-profile">
    <TopBar title="Perfil de Usuario" @back="$router.back()" />

    <div class="profile-header">
      <div class="avatar">
        <img v-if="user?.avatar" :src="user.avatar" alt="" />
        <span v-else class="avatar-letter">{{ user?.username?.[0]?.toUpperCase() ?? '?' }}</span>
      </div>
      <h2 class="username">{{ user?.username ?? 'Usuario' }}</h2>
      <p class="user-email">{{ user?.email ?? '' }}</p>
    </div>

    <div class="info-cards">
      <div class="info-card">
        <p class="info-label">Rol</p>
        <p class="info-value">{{ user?.roles?.[0]?.nombre ?? 'student' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { User } from '@/domain/models'
import { userAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'

const route = useRoute()
const user = ref<User | null>(null)

onMounted(async () => {
  const id = Number(route.params.userId)
  try { user.value = await userAdapter.getUserById(id) } catch { /* empty */ }
})
</script>

<style scoped>
.user-profile {
  min-height: 100vh;
  background: var(--bg-primary);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #BF5AF2;
  margin-bottom: 12px;
}

.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-letter { font-size: 28px; font-weight: 700; color: #BF5AF2; }

.username {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.user-email {
  font-size: 14px;
  color: #8E8E93;
  margin-top: 2px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-dot.online { background: #30D158; }

.status-text {
  font-size: 13px;
  color: #aaa;
}

.info-cards {
  padding: 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-card {
  padding: 16px;
  background: #1C1C1E;
  border-radius: 16px;
}

.info-label {
  font-size: 12px;
  color: #8E8E93;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}
</style>
