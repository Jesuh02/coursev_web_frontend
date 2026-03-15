<template>
  <div class="stat-card">
    <div class="accent-bar" :style="{ background: accent }" />
    <p class="stat-value">{{ value }}</p>
    <p class="stat-label">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: number
  accent: string
}>()
</script>

<style scoped>
.stat-card {
  position: relative;
  padding: 16px;
  border-radius: 16px;
  background: #1C1C1E;
  overflow: hidden;
}

.accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 0 2px 2px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 2px;
}
</style>
