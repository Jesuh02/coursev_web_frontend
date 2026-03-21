<template>
  <div class="course-card" @click="$emit('click')">
    <div class="card-thumb">
      <img v-if="thumb" :src="thumb" :alt="course.title" />
      <div v-else class="thumb-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">{{ course.title }}</h3>
      <p class="card-desc">{{ course.description }}</p>
      <p class="card-creator">Por {{ creatorLabel }}</p>
      <div class="card-footer">
        <div class="footer-left">
          <span class="student-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ course.studentCount ?? 0 }} estudiante{{ (course.studentCount ?? 0) !== 1 ? 's' : '' }}
          </span>
          <span class="category-badge">{{ course.category ?? 'General' }}</span>
        </div>
        <div class="footer-right">
          <span v-if="course.price > 0" class="price-tag premium">Premium</span>
          <span v-else class="price-tag free">Gratis</span>
          <!-- Botón de opciones (3 puntos) para usuarios con rol 3 (admin) -->
          <button v-if="canModify" class="options-btn" @click.stop="$emit('options', course)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Course } from '@/domain/models'
import { resolveImageUrl } from '@/infrastructure/api'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ course: Course; creatorName?: string | null }>()
defineEmits<{ click: [], options: [course: Course] }>()

const authStore = useAuthStore()
const thumb = computed(() => resolveImageUrl(props.course.thumbnailUri ?? props.course.thumbnail_uri))
const canModify = computed(() => authStore.isAdmin)
const creatorLabel = computed(() => {
  const creatorName = props.creatorName ?? props.course.creatorUsername ?? props.course.creator_username
  if (typeof creatorName === 'string' && creatorName.trim()) {
    return `@${creatorName.trim()}`
  }

  const creatorId = Number(props.course.creatorUserId ?? props.course.creator_user_id ?? 0)
  return creatorId > 0 ? `Usuario #${creatorId}` : 'Creador desconocido'
})
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
  margin-bottom: 12px;
}

.card-creator {
  font-size: 12px;
  color: #c9c9ce;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.student-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8E8E93;
}

.student-count svg {
  color: #8E8E93;
}

.category-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(10, 132, 255, 0.15);
  color: #0A84FF;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-tag {
  font-size: 14px;
  font-weight: 700;
}

.price-tag.premium {
  color: #FFD700;
}

.price-tag.free {
  color: #30D158;
}

.options-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  transition: background 0.2s, color 0.2s;
}

.options-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
