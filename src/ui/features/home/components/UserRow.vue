<template>
  <div class="user-row" @click="$emit('click')">
    <div class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" :alt="user.username" />
      <span v-else class="avatar-letter">{{ user.username[0]?.toUpperCase() }}</span>
    </div>
    <div class="user-info">
      <p class="user-name">{{ user.username }}</p>
      <p class="user-email">{{ user.email }}</p>
    </div>
    <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/domain/models'

defineProps<{ user: User }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.15s;
}

.user-row:hover {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  margin: 0 -12px;
}

.user-avatar {
  position: relative;
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

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-size: 18px;
  font-weight: 600;
  color: #8E8E93;
}

.status-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #666;
  border: 2px solid var(--bg-primary);
}

.status-dot.online {
  background: #30D158;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.user-email {
  font-size: 13px;
  color: #8E8E93;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;
}
</style>
