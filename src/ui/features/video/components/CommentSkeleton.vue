<template>
  <div class="comment-skeleton">
    <div v-for="i in count" :key="i" class="skeleton-item">
      <div class="skel-avatar" />
      <div class="skel-body">
        <div class="skel-row">
          <div class="skel-name" />
          <div class="skel-time" />
        </div>
        <div class="skel-line full" />
        <div class="skel-line partial" />
        <div class="skel-reply" />
      </div>
      <div class="skel-like" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 5 })
</script>

<style scoped>
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.comment-skeleton { padding: 0 16px; }

.skeleton-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 12px 0;
  gap: 12px;
}

.skel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}

.skel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skel-name {
  width: 80px;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}

.skel-time {
  width: 40px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}

.skel-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}
.skel-line.full    { width: 100%; }
.skel-line.partial { width: 65%; }

.skel-reply {
  width: 56px;
  height: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}

.skel-like {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
}
</style>
