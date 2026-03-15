<template>
  <header class="video-top-nav">
    <button class="nav-btn" @click="$emit('toggleSearch')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
    </button>

    <div class="center-pills">
      <button :class="['pill', { active: activeTab === 'live' }]" @click="activeTab = 'live'">
        <span class="pill-glow"></span>En Vivo
      </button>
      <button :class="['pill', { active: activeTab === 'courses' }]" @click="activeTab = 'courses'">
        <span class="pill-glow"></span>Cursos
      </button>
    </div>

    <div class="right-icons">
      <button class="nav-btn" @click="$router.push('/chatbot')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M9.5 18h5M12 14v4" /><circle cx="12" cy="22" r="0" /></svg>
      </button>
      <button class="nav-btn" @click="$router.push('/profile')">
        <AppAvatar :size="28" alt="U" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'

defineEmits<{ toggleSearch: []; search: [query: string] }>()

const activeTab = ref('courses')
</script>

<style scoped>
.video-top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 4px;
}

.center-pills {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3px;
}

.pill {
  position: relative;
  padding: 6px 20px;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s;
}

.pill.active {
  color: #fff;
  background: rgba(139, 92, 246, 0.3);
}

.pill-glow {
  display: none;
}

.pill.active .pill-glow {
  display: block;
  position: absolute;
  inset: -2px;
  border-radius: 20px;
  background: radial-gradient(ellipse, rgba(139, 92, 246, 0.4), transparent);
  z-index: -1;
}

.right-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
