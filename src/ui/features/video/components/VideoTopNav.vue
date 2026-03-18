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
      <button class="nav-btn" @click="showMenu = !showMenu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'

defineEmits<{ toggleSearch: []; goLogin: [] }>()
const showMenu = ref(false)
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
</style>
