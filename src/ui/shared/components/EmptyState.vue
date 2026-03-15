<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title || message }}</h3>
    <p v-if="description" class="empty-description">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  icon?: string
  message?: string
  description?: string
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  gap: 12px;
}

.empty-icon {
  margin-bottom: 8px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-description {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 280px;
  line-height: 1.5;
}
</style>
