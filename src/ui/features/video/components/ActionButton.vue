<template>
  <button class="action-button" @click="$emit('click')">
    <svg v-if="icon === 'heart'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
    <svg v-else-if="icon === 'comment'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    <svg v-else-if="icon === 'share'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
    <svg v-else-if="icon === 'sound'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
    <span v-if="count !== undefined" class="action-count">{{ formatCount(count) }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: 'heart' | 'comment' | 'share' | 'sound'
  count?: number
}>()

defineEmits<{ click: [] }>()

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
</script>

<style scoped>
.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff;
}

.action-button:active {
  transform: scale(0.9);
}

.action-count {
  font-size: 11px;
  font-weight: 600;
}
</style>
