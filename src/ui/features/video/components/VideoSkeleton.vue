<template>
  <div class="skeleton-card">
    <div class="skeleton-bg skeleton-shimmer" />
    <div class="skeleton-actions">
      <div v-for="j in 4" :key="j" class="skeleton-circle skeleton-shimmer" />
    </div>
    <div class="skeleton-info">
      <div class="skeleton-line skeleton-shimmer" style="width: 40%" />
      <div class="skeleton-line skeleton-shimmer" style="width: 70%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  position: relative;
  height: calc(100dvh - 56px);
  background: #0a0a1a;
  scroll-snap-align: start;
}

.skeleton-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-tertiary);
  border-radius: 0;
}

.skeleton-actions {
  position: absolute;
  right: 12px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-info {
  position: absolute;
  bottom: 80px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.1);
  min-width: 100px;
}

.skeleton-shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.3; }
  50% { opacity: 0.6; }
  100% { opacity: 0.3; }
}
</style>
