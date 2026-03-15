<template>
  <div class="subscriptions-view">
    <TopBar title="Suscripciones" @back="$router.back()" />

    <div v-if="subscriptions.length" class="sub-list">
      <div v-for="sub in subscriptions" :key="sub.id" class="sub-card">
        <div class="sub-thumb">
          <img v-if="resolveImageUrl(sub.thumbnailUri ?? sub.thumbnail_uri)" :src="resolveImageUrl(sub.thumbnailUri ?? sub.thumbnail_uri)!" alt="" />
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </div>
        <div class="sub-info">
          <p class="sub-title">{{ sub.title }}</p>
          <p class="sub-desc">{{ sub.description }}</p>
        </div>
      </div>
    </div>

    <EmptyState v-else icon="star" message="No tienes suscripciones activas" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Course } from '@/domain/models'
import { resolveImageUrl } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const subscriptions = ref<Course[]>([])
</script>

<style scoped>
.subscriptions-view {
  min-height: 100vh;
  background: var(--bg-primary);
}

.sub-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #1C1C1E;
  border-radius: 16px;
}

.sub-thumb {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #242424;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.sub-thumb img { width: 100%; height: 100%; object-fit: cover; }

.sub-info { flex: 1; min-width: 0; }

.sub-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.sub-desc {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 2px;
}
</style>
