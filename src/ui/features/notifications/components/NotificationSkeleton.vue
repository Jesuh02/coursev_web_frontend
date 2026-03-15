<template>
  <div class="notification-skeleton">
    <div v-for="i in 5" :key="i" class="row">
      <div class="circle skeleton-shimmer" />
      <div class="lines">
        <div class="line skeleton-shimmer" style="width:30%" />
        <div class="line skeleton-shimmer" style="width:80%" />
        <div class="line skeleton-shimmer" style="width:20%" />
      </div>
      <div class="thumb skeleton-shimmer" />
    </div>
  </div>
</template>

<style scoped>
.notification-skeleton { display: flex; flex-direction: column; }
.row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; }
.circle { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.06); flex-shrink: 0; }
.lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.line { height: 12px; border-radius: 6px; background: rgba(255,255,255,0.06); }
.thumb { width: 72px; height: 90px; border-radius: 8px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
.skeleton-shimmer { animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { opacity:0.3 } 50% { opacity:0.6 } 100% { opacity:0.3 } }
</style>
