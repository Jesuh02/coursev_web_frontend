<template>
  <div class="home-skeleton">
    <div v-for="i in 6" :key="i" class="row-skeleton">
      <div class="circle skeleton-shimmer" />
      <div class="lines">
        <div class="line skeleton-shimmer" style="width:60%" />
        <div class="line skeleton-shimmer" style="width:40%" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
}

.circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.line {
  height: 12px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
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
