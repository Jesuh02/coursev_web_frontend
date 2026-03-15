<template>
  <header class="top-bar">
    <button class="back-btn" @click="$emit('back')">
      <IconBack :size="24" />
    </button>
    <h1 class="top-bar-title">{{ title }}</h1>
    <div class="top-bar-actions">
      <slot name="right" />
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import IconBack from '@/ui/shared/icons/IconBack.vue'

defineProps<{ title: string }>()
defineEmits<{ back: [] }>()
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 50;
  min-height: 56px;
}

.back-btn {
  display: flex;
  padding: 4px;
  color: var(--text-primary);
}

.top-bar-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
