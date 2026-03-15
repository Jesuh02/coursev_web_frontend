<template>
  <div class="profile-view">
    <div class="profile-header">
      <button class="edit-btn" @click="$router.push('/profile/edit')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
      </button>

      <div class="avatar-container">
        <div class="avatar-glow" />
        <div class="avatar">
          <img v-if="user?.avatar" :src="user.avatar" alt="" />
          <span v-else class="avatar-letter">{{ user?.username?.[0]?.toUpperCase() ?? '?' }}</span>
        </div>
      </div>

      <h2 class="username">{{ user?.username ?? 'Usuario' }}</h2>
      <div class="status-row">
        <span class="subscribers">0 suscriptores</span>
      </div>
    </div>

    <div class="menu-section">
      <ProfileMenuCard>
        <ProfileMenuItem icon="book" label="Mis cursos" color="#007AFF" @click="$router.push('/explore')" />
        <ProfileMenuItem icon="bar-chart" label="Panel de creador" color="#FF9500" @click="$router.push('/admin')" />
      </ProfileMenuCard>

      <ProfileMenuCard>
        <ProfileMenuItem icon="star" label="Suscripciones" color="#5E5CE6" @click="$router.push('/subscriptions')" />
        <ProfileMenuItem icon="message-circle" label="WhatsApp" color="#30D158" />
      </ProfileMenuCard>

      <ProfileMenuCard>
        <ProfileMenuItem icon="log-out" label="Cerrar sesión" color="#FF453A" @click="logout" />
      </ProfileMenuCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ProfileMenuCard from './components/ProfileMenuCard.vue'
import ProfileMenuItem from './components/ProfileMenuItem.vue'

const router = useRouter()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(98,0,238,0.08) 0%, var(--bg-primary) 40%);
  padding-bottom: 80px;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 32px;
  position: relative;
}

.edit-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container {
  position: relative;
  margin-bottom: 16px;
}

.avatar-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(191,90,242,0.4) 0%, transparent 70%);
  animation: pulse-glow 3s infinite;
}

.avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: var(--bg-secondary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #BF5AF2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-size: 36px;
  font-weight: 700;
  color: #BF5AF2;
}

.username {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.online {
  background: #30D158;
}

.status-text,
.subscribers {
  font-size: 14px;
  color: #aaa;
}

.separator {
  color: #666;
}

.menu-section {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
