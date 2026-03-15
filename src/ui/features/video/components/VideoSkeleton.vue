<template>
  <div class="skeleton-feed">
    <div v-for="i in 3" :key="i" class="skeleton-card">
      <div class="skeleton-bg skeleton-shimmer" />
      <div class="skeleton-actions">
        <div v-for="j in 4" :key="j" class="skeleton-circle skeleton-shimmer" />
      </div>
      <div class="skeleton-info">
        <div class="skeleton-line skeleton-shimmer" style="width: 40%" />
        <div class="skeleton-line skeleton-shimmer" style="width: 70%" />
        <div class="skeleton-line skeleton-shimmer" style="width: 50%" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-feed {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skeleton-card {
  position: relative;
  height: 100vh;
  background: var(--bg-secondary);
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
