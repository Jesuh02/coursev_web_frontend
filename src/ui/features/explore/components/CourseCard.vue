<template>
  <div class="course-card" @click="$emit('click')">
    <div class="card-thumb">
      <img v-if="course.thumbnailUri ?? course.thumbnail_uri" :src="(course.thumbnailUri ?? course.thumbnail_uri)!" :alt="course.title" />
      <div v-else class="thumb-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
      </div>
      <span v-if="course.price > 0" class="badge premium">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFD700"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        Premium
      </span>
      <span v-else class="badge free">Gratis</span>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ course.title }}</h3>
      <p class="card-desc">{{ course.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Course } from '@/domain/models'

defineProps<{ course: Course }>()
defineEmits<{ click: [] }>()
</script>

<style scoped>
.course-card {
  border-radius: 24px;
  background: #242424;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.card-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #1a1a1a;
  overflow: hidden;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.badge.premium {
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
}

.badge.free {
  background: rgba(48, 209, 88, 0.2);
  color: #30D158;
}

.card-body {
  padding: 14px 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  font-size: 13px;
  color: #8E8E93;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
