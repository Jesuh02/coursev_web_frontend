<template>
  <div class="skeleton-grid">
    <div v-for="i in 6" :key="i" class="skeleton-card">
      <div class="skeleton-thumb skeleton-shimmer" />
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-shimmer" style="width: 80%" />
        <div class="skeleton-line skeleton-shimmer" style="width: 50%" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 0 16px;
}

.skeleton-card {
  border-radius: 24px;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.skeleton-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: rgba(255, 255, 255, 0.06);
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
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
