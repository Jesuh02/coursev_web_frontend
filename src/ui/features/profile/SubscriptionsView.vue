<template>
  <div class="sv-root">
    <!-- Top bar -->
    <div class="sv-topbar">
      <template v-if="isSearchActive">
        <button class="sv-icon-btn" @click="isSearchActive = false; searchQuery = ''" aria-label="Cerrar búsqueda">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <input
          v-model="searchQuery"
          class="sv-search-inline"
          placeholder="Buscar..."
          autofocus
          autocomplete="off"
        />
        <button v-if="searchQuery" class="sv-icon-btn" @click="searchQuery = ''" aria-label="Limpiar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </template>
      <template v-else>
        <button class="sv-icon-btn" @click="$router.back()" aria-label="Volver">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="sv-title">Todas las suscripciones</span>
        <button class="sv-icon-btn" @click="isSearchActive = true" aria-label="Buscar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </button>
      </template>
    </div>

    <!-- Sort label -->
    <div class="sv-sort-row">
      <span class="sv-sort-chip">Más relevantes</span>
    </div>

    <!-- List -->
    <div class="sv-content">
      <div v-if="loading" class="sv-center">
        <div class="sv-spinner" />
      </div>

      <template v-else-if="filtered.length > 0">
        <div
          v-for="user in filtered"
          :key="user.id"
          class="sv-item"
          @click="$router.push(`/user/${user.id}`)"
        >
          <AppAvatar :src="user.avatar" :alt="user.username" :size="48" />
          <div class="sv-item-info">
            <span class="sv-item-name">{{ user.username }}</span>
            <span class="sv-item-handle">@{{ user.username }}</span>
          </div>
        </div>
      </template>

      <div v-else class="sv-center sv-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p>{{ errorMessage ?? (searchQuery ? 'Sin resultados' : 'No tienes suscripciones aún') }}</p>
      </div>
    </div>

    <!-- Spacer for bottom nav -->
    <div style="height: 80px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { User } from '@/domain/models'
import { subscriptionAdapter } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'

const authStore = useAuthStore()
const subscriptions = ref<User[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const isSearchActive = ref(false)
const searchQuery = ref('')

const filtered = computed(() => {
  const list = subscriptions.value ?? []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(u => u.username.toLowerCase().includes(q))
})

onMounted(async () => {
  loading.value = true

  if (!authStore.isAuthenticated) {
    errorMessage.value = 'Debes iniciar sesión para ver tus suscripciones'
    loading.value = false
    return
  }

  try {
    const data = await subscriptionAdapter.getMySubscribedCreators()
    subscriptions.value = data ?? []
  } catch {
    errorMessage.value = 'Error al cargar suscripciones'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.sv-root {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Top bar */
.sv-topbar {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 4px 0 4px;
  background: #000;
  gap: 4px;
}

.sv-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  padding-left: 4px;
}

.sv-icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.15s;
  flex-shrink: 0;
}

.sv-icon-btn:hover { background: rgba(255,255,255,0.08); }

.sv-search-inline {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 16px;
}

.sv-search-inline::placeholder { color: #808080; }

/* Sort chip */
.sv-sort-row {
  padding: 4px 16px 8px;
}

.sv-sort-chip {
  display: inline-block;
  background: #222;
  color: #fff;
  font-size: 14px;
  padding: 5px 12px;
  border-radius: 8px;
}

/* Content */
.sv-content {
  padding: 0;
}

.sv-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 12px;
}

.sv-empty {
  color: #888;
  font-size: 15px;
}

.sv-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #A259FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* List item */
.sv-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.sv-item:hover { background: rgba(255,255,255,0.04); }
.sv-item:active { background: rgba(255,255,255,0.08); }

.sv-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.sv-item-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sv-item-handle {
  font-size: 14px;
  color: #8E8E93;
}
</style>
