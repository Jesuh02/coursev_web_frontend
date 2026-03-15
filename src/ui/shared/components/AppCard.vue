<template>
  <div class="app-card" :class="{ clickable: !!$attrs.onClick }">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.app-card.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s;
}

.app-card.clickable:hover {
  border-color: var(--purple-light);
  transform: translateY(-2px);
}
</style>
