<template>
  <button class="topic-item" @click="$emit('click')">
    <div class="topic-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
    </div>
    <div class="topic-info">
      <p class="topic-title">{{ topic.title }}</p>
      <p class="topic-meta">{{ topic.description }}</p>
    </div>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
  </button>
</template>

<script setup lang="ts">
import type { Topic } from '@/domain/models'
defineProps<{ topic: Topic }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.topic-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.topic-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0,212,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-info { flex: 1; min-width: 0; }
.topic-title { font-size: 15px; font-weight: 600; color: #fff; }
.topic-meta { font-size: 13px; color: #8E8E93; margin-top: 2px; }
</style>
