<template>
  <header class="video-top-nav">
    <!-- Search button (left) -->
    <button class="search-btn" @click="emit('toggle-search')">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </button>

    <!-- Center Pills Container (Live + Courses) -->
    <div class="center-pills-container">
      <div class="pill-wrapper">
        <!-- En Vivo (Live) with orange glow -->
        <div class="glow-effect orange-glow" />
        <button class="pill-btn live-btn" title="En Vivo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
          </svg>
        </button>
      </div>

      <div class="pill-wrapper">
        <!-- Cerrar sesión with purple glow -->
        <div class="glow-effect purple-glow" />
        <button class="pill-btn courses-btn" @click="emit('go-login')" title="Cerrar sesión">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Right side icons -->
    <div class="right-icons">
      <button class="avatar-btn" @click="emit('go-login')">
        <AppAvatar :size="36" :alt="'U'" />
      </button>
      
      <div class="menu-wrapper">
        <button class="menu-dots-btn" @click="showMenu = !showMenu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>

        <transition name="menu-fade">
          <div v-if="showMenu" class="dropdown-menu" @click.stop>
            <!-- LLM Refuerzo: visible para cualquier rol, incluso sin rol -->
            <button class="menu-item" @click="navigate('/evaluative-reinforcement')">
              <span class="menu-icon icon-purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.5 6-4 7.4V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.6C7.5 15 5 12.5 5 9a7 7 0 0 1 7-7z"/>
                  <path d="M9 21h6M10 17h4"/>
                </svg>
              </span>
              <span class="menu-label">LLM Refuerzo</span>
            </button>

            <!-- LLM Tareas: solo rol 2 (docente) y rol 3 (admin) -->
            <button v-if="isAdminOrDocente" class="menu-item" @click="navigate('/chatbot')">
              <span class="menu-icon icon-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <span class="menu-label">LLM Tareas</span>
            </button>

            <!-- LLM DB: solo rol 3 (admin) -->
            <button v-if="isAdmin" class="menu-item" @click="navigate('/admin/database')">
              <span class="menu-icon icon-cyan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </span>
              <span class="menu-label">LLM DB</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <!-- Menu backdrop overlay -->
  <div v-if="showMenu" class="menu-backdrop" @click="showMenu = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits<{ 'toggle-search': []; 'go-login': [] }>()

const router = useRouter()
const authStore = useAuthStore()
const showMenu = ref(false)

// Usar storeToRefs para garantizar reactividad con los computed del store
const { isAdmin, isAdminOrDocente } = storeToRefs(authStore)

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
  padding: 26px 12px 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  pointer-events: none;
}

.video-top-nav > * {
  pointer-events: auto;
}

.search-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: opacity 0.2s;
}

.search-btn:active {
  opacity: 0.6;
}

/* Center Pills Container with glowing buttons */
.center-pills-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(40, 40, 44, 0.6);
  backdrop-filter: blur(20px);
}

.pill-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glow effects */
.glow-effect {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  opacity: 0.6;
  pointer-events: none;
  filter: blur(8px);
}

.orange-glow {
  background: radial-gradient(circle, rgba(255, 149, 0, 0.8) 0%, transparent 70%);
}

.purple-glow {
  background: radial-gradient(circle, rgba(191, 90, 242, 0.8) 0%, transparent 70%);
}

/* Pill buttons */
.pill-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.2s;
  z-index: 1;
}

.pill-btn:active {
  transform: scale(0.9);
}

.live-btn {
  background: linear-gradient(180deg, #ff9f0a 0%, #ff7a00 100%);
  box-shadow: 0 2px 12px rgba(255, 149, 0, 0.3);
}

.courses-btn {
  background: linear-gradient(180deg, #bf5af2 0%, #a855f7 100%);
  box-shadow: 0 2px 12px rgba(191, 90, 242, 0.3);
}

/* Right side icons */
.right-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar-btn {
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.menu-dots-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-dots-btn:hover {
  background: rgba(167, 139, 250, 0.25);
  border-color: rgba(167, 139, 250, 0.5);
  transform: scale(1.08);
}

.menu-dots-btn:active {
  transform: scale(0.9);
}

.menu-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 200;
  /* Liquid Glass */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.22) 0%,
    rgba(180, 140, 255, 0.14) 35%,
    rgba(255, 190, 140, 0.10) 65%,
    rgba(255, 255, 255, 0.18) 100%
  );
  backdrop-filter: blur(48px) saturate(190%) brightness(1.12);
  -webkit-backdrop-filter: blur(48px) saturate(190%) brightness(1.12);
  border: 1.5px solid rgba(255, 255, 255, 0.48);
  border-bottom-color: rgba(255, 255, 255, 0.18);
  border-right-color: rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 10px 8px;
  min-width: 208px;
  overflow: hidden;
  box-shadow:
    0 2px 0 rgba(255, 255, 255, 0.28) inset,
    0 20px 60px rgba(0, 0, 0, 0.38),
    0 8px 28px rgba(120, 80, 255, 0.22),
    0 2px 8px rgba(255, 150, 80, 0.12);
}

/* Brillo de glass en la parte superior */
.dropdown-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1.5px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.92) 30%,
    rgba(255, 255, 255, 0.96) 50%,
    rgba(255, 255, 255, 0.92) 70%,
    transparent 100%
  );
  border-radius: 0 0 50% 50%;
  pointer-events: none;
}

/* Blob de color decorativo */
.dropdown-menu::after {
  content: '';
  position: absolute;
  top: -24px;
  right: -16px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.32) 0%, transparent 70%);
  pointer-events: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-align: left;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
  transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.menu-item:hover,
.menu-item:active {
  background: rgba(255, 255, 255, 0.14);
  transform: translateX(4px) scale(1.02);
}

/* Burbujas de icono */
.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}

.icon-purple {
  background: linear-gradient(145deg, #c084fc, #7c3aed);
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.icon-orange {
  background: linear-gradient(145deg, #fb923c, #c2410c);
  box-shadow: 0 4px 14px rgba(251, 146, 60, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.icon-cyan {
  background: linear-gradient(145deg, #22d3ee, #0e7490);
  box-shadow: 0 4px 14px rgba(34, 211, 238, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.menu-label {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.menu-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
}

.menu-fade-enter-active {
  transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.88);
}
</style>
