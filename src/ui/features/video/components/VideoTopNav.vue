<template>
  <header class="video-top-nav">
    <button class="nav-btn" @click="$emit('toggleSearch')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    </button>

    <div class="center-pills">
      <button class="pill cam-pill" @click="$router.push('/upload')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
      </button>
      <button class="pill person-pill" @click="$emit('goLogin')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
      </button>
    </div>

    <div class="right-icons">
      <button class="nav-btn" @click="$router.push('/profile')">
        <AppAvatar :size="30" :alt="'U'" />
      </button>
      <div class="menu-wrapper">
        <button class="nav-btn" @click="showMenu = !showMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
        </button>

        <transition name="menu-fade">
          <div v-if="showMenu" class="dropdown-menu" @click.stop>
            <!-- LLM de refuerzo: cualquier rol, incluso sin rol -->
            <button class="menu-item" @click="navigate('/chatbot')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <span>LLM Refuerzo</span>
            </button>

            <!-- LLM de tareas: solo rol 2 y 3 -->
            <button v-if="authStore.isAdminOrDocente" class="menu-item" @click="navigate('/admin')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span>LLM Tareas</span>
            </button>

            <!-- LLM db: solo rol 3 -->
            <button v-if="authStore.isAdmin" class="menu-item" @click="navigate('/admin/database')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              <span>LLM DB</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <!-- Overlay para cerrar el menú al tocar fuera -->
  <div v-if="showMenu" class="menu-backdrop" @click="showMenu = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'
import { useAuthStore } from '@/stores/authStore'

defineEmits<{ toggleSearch: []; goLogin: [] }>()

const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)

function navigate(path: string) {
  showMenu.value = false
  router.push(path)
}
</script>

<style scoped>
.video-top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  pointer-events: none;
}

.video-top-nav > * {
  pointer-events: auto;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 4px;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
}

.center-pills {
  display: flex;
  gap: 8px;
}

.pill {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.pill:active {
  transform: scale(0.9);
}

.cam-pill {
  background: #FF9500;
}

.person-pill {
  background: #AF52DE;
}

.right-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  background: rgba(28, 28, 30, 0.96);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 6px;
  min-width: 168px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  transition: background 0.15s;
}

.menu-item:hover,
.menu-item:active {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item svg {
  flex-shrink: 0;
  opacity: 0.85;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 199;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
