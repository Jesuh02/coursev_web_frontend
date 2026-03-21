<template>
  <button class="menu-item" @click="$emit('click')">
    <div class="icon-circle" :style="{ background: `${color}20`, color }">
      <svg v-if="icon === 'book'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
      <svg v-else-if="icon === 'bar-chart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
      <svg v-else-if="icon === 'star'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      <svg v-else-if="icon === 'message-circle'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
      <svg v-else-if="icon === 'log-out'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    </div>
    <div class="menu-label-area">
      <div class="menu-label-row">
        <span class="menu-label">{{ label }}</span>
        <span v-if="badge" class="menu-badge" :style="{ color: badgeColor ?? '#AAAAAA' }">{{ badge }}</span>
      </div>
      <span v-if="subtitle" class="menu-subtitle">{{ subtitle }}</span>
    </div>
    <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  color: string
  badge?: string
  badgeColor?: string
  subtitle?: string
}>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  transition: background 0.15s;
}

.menu-item:not(:last-child) {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.menu-item:hover {
  background: rgba(255,255,255,0.04);
}

.icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: #fff;
}

.menu-label-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.menu-subtitle {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;
}
</style>
