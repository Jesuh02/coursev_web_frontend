<template>
  <div class="creator-info">
    <div class="creator-avatar">
      <span class="avatar-letter">{{ course.title?.[0]?.toUpperCase() ?? 'C' }}</span>
    </div>
    <div class="creator-details">
      <p class="creator-name">Creador</p>
      <p class="creator-subs">0 suscriptores</p>
    </div>
    <button class="subscribe-btn">Suscribirse</button>
  </div>
</template>

<script setup lang="ts">
import type { Course } from '@/domain/models'
defineProps<{ course: Course }>()
</script>

<style scoped>
.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.04);
  border-radius: 16px;
}

.creator-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.creator-avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-letter { font-size: 18px; font-weight: 600; color: #8E8E93; }

.creator-details { flex: 1; }
.creator-name { font-size: 15px; font-weight: 600; color: #fff; }
.creator-subs { font-size: 12px; color: #8E8E93; }

.subscribe-btn {
  padding: 8px 20px;
  border-radius: 20px;
  background: var(--purple-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.15s;
}

.subscribe-btn:hover { opacity: 0.85; }
</style>
