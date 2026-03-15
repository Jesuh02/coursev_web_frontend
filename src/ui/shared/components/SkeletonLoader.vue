<template>
  <div class="skeleton-box" :style="{ width, height, borderRadius }"></div>
</template>

<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  borderRadius?: string
}>()
</script>

<style scoped>
.skeleton-box {
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
