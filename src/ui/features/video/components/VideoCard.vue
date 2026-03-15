<template>
  <div class="video-card" :style="{ height: cardHeight }">
    <div class="video-bg">
      <div class="video-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      </div>
    </div>

    <div class="video-overlay">
      <div class="right-actions">
        <button class="action-btn" @click="$emit('profile')">
          <AppAvatar :size="40" :alt="video.username" />
          <span class="follow-badge">+</span>
        </button>
        <ActionButton icon="heart" @click="$emit('like')" />
        <ActionButton icon="comment" @click="$emit('comment')" />
        <ActionButton icon="share" @click="$emit('share')" />
        <ActionButton icon="sound" />
      </div>

      <div class="bottom-info">
        <p class="creator-name">@{{ video.username }}</p>
        <p class="video-desc">{{ video.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Video } from '@/domain/models'
import AppAvatar from '@/ui/shared/components/AppAvatar.vue'
import ActionButton from './ActionButton.vue'

defineProps<{ video: Video }>()
defineEmits<{ like: []; comment: []; share: []; profile: [] }>()

const cardHeight = computed(() => `${window.innerHeight - 64}px`)
</script>

<style scoped>
.video-card {
  position: relative;
  scroll-snap-align: start;
  background: #000;
  flex-shrink: 0;
}

.video-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0a0a1a, #1a0a2e);
}

.video-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
}

.right-actions {
  position: absolute;
  right: 12px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  pointer-events: auto;
}

.action-btn {
  position: relative;
}

.follow-badge {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--red-netflix);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.bottom-info {
  position: absolute;
  bottom: 16px;
  left: 12px;
  right: 72px;
  pointer-events: auto;
}

.creator-name {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
}

.video-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.hashtag {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
