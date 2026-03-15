<template>
  <div class="home-view">
    <div class="home-header">
      <div class="header-gradient" />
      <div class="header-content">
        <div class="welcome-row">
          <div>
            <h1 class="welcome-title">Usuarios</h1>
            <p class="welcome-sub">Bienvenido de vuelta</p>
          </div>
          <div class="admin-avatar">
            <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Admin" />
            <span v-else class="avatar-fallback">{{ initials }}</span>
          </div>
        </div>

        <SearchBar v-model="searchQuery" placeholder="Buscar usuarios..." />

        <div class="stats-row">
          <StatCard label="Total Usuarios" :value="totalUsers" accent="#BF5AF2" />
        </div>
      </div>
    </div>

    <div class="users-section">
      <HomeSkeleton v-if="loading" />
      <template v-else-if="filteredUsers.length">
        <UserRow
          v-for="user in filteredUsers"
          :key="user.id"
          :user="user"
          @click="$router.push(`/user/${user.id}`)"
        />
      </template>
      <EmptyState v-else icon="users" message="No se encontraron usuarios" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/domain/models'
import { userAdapter } from '@/infrastructure/api'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'
import StatCard from './components/StatCard.vue'
import UserRow from './components/UserRow.vue'
import HomeSkeleton from './components/HomeSkeleton.vue'

const authStore = useAuthStore()
const searchQuery = ref('')
const loading = ref(true)
const users = ref<User[]>([])

const initials = computed(() => {
  const name = authStore.user?.username ?? ''
  return name.slice(0, 2).toUpperCase()
})

const totalUsers = computed(() => users.value.length)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => u.username.toLowerCase().includes(q))
})

onMounted(async () => {
  try {
    users.value = await userAdapter.searchUsers('')
  } catch { /* empty */ }
  loading.value = false
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 80px;
}

.home-header {
  position: relative;
  padding: 0 0 24px;
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(98, 0, 238, 0.15) 0%, transparent 100%);
  pointer-events: none;
}

.header-content {
  position: relative;
  padding: 16px;
}

.welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 34px;
  font-weight: 700;
  color: #fff;
}

.welcome-sub {
  font-size: 17px;
  color: #8E8E93;
}

.admin-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #BF5AF2;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
}

.admin-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 16px;
  font-weight: 600;
  color: #BF5AF2;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.users-section {
  padding: 0 16px;
}
</style>
