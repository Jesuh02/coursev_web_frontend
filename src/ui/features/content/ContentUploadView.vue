<template>
  <div class="create-screen">
    <button class="close-btn" @click="$router.back()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <div class="header">
      <h1 class="title">Crear</h1>
      <p class="subtitle">Selecciona el tipo de contenido</p>
    </div>

    <div class="options">
      <button class="option-row" @click="router.push('/video/upload')">
        <div class="option-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="15" height="16" rx="2" />
            <path d="M17 8l5 4-5 4V8z" />
          </svg>
        </div>
        <div class="option-text">
          <span class="option-title">Video</span>
          <span class="option-subtitle">Sube un video desde tu galería</span>
        </div>
        <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <button class="option-row" @click="router.push('/course/create')">
        <div class="option-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div class="option-text">
          <span class="option-title">Material educativo</span>
          <span class="option-subtitle">Crear cursos y materias</span>
        </div>
        <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.create-screen {
  min-height: 100vh;
  background: #000;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
}

.close-btn {
  align-self: flex-start;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1C1C1E;
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 24px;
}

.header {
  margin-bottom: 28px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.subtitle {
  font-size: 14px;
  color: #8E8E93;
  margin: 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #1C1C1E;
  border: none;
  border-radius: 14px;
  padding: 16px 14px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}

.option-row:active {
  background: #2C2C2E;
}

.option-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--purple-primary, #7C3AED);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.option-subtitle {
  font-size: 13px;
  color: #8E8E93;
}

.chevron {
  flex-shrink: 0;
}
</style>
