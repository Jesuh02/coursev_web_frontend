<template>
  <button class="app-button" :class="[variant, { loading, block: block || full }]" :disabled="disabled || loading">
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  full?: boolean
}>()
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.app-button.block {
  width: 100%;
}

.app-button:active:not(:disabled) {
  transform: scale(0.97);
}

.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
  color: #fff;
}

.primary:hover:not(:disabled) {
  box-shadow: var(--shadow-glow-purple);
}

.secondary {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.outline {
  background: transparent;
  color: var(--purple-light);
  border: 1px solid var(--purple-light);
}

.ghost {
  background: transparent;
  color: var(--text-secondary);
}

.ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

.danger {
  background: var(--red-netflix);
  color: #fff;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
