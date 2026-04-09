<template>
  <div
    class="subject-card"
    :class="{ 'subject-blocked': isBlocked, 'subject-card--drag': isDragMode }"
    @click="$emit('click')"
    @contextmenu.prevent="canModify && !isDragMode ? $emit('options', subject) : undefined"
  >
    <div class="card-thumb">
      <img v-if="thumb" :src="thumb" :alt="subject.name" />
      <div v-else class="thumb-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <div v-if="isBlocked" class="blocked-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <div v-if="isDragMode" class="drag-handle-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
          <circle cx="9" cy="5" r="1.8"/>
          <circle cx="15" cy="5" r="1.8"/>
          <circle cx="9" cy="12" r="1.8"/>
          <circle cx="15" cy="12" r="1.8"/>
          <circle cx="9" cy="19" r="1.8"/>
          <circle cx="15" cy="19" r="1.8"/>
        </svg>
      </div>
    </div>

    <div class="card-body">
      <div class="card-title-row">
        <h3 class="card-title">{{ subject.name }}</h3>
        <button v-if="canModify" class="options-btn" @click.stop="$emit('options', subject)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      <p v-if="subject.description" class="card-desc">{{ subject.description }}</p>

      <div class="card-footer">
        <div class="footer-left">
          <div class="progress-bar-mini">
            <div class="progress-fill" :style="{ width: stats.progress + '%' }" />
          </div>
          <span class="stat-progress">{{ stats.progress }}%</span>
        </div>
        <span class="task-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          {{ stats.taskCount }} tarea{{ stats.taskCount !== 1 ? 's' : '' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Subject } from '@/domain/models'
import { resolveImageUrl } from '@/infrastructure/api'

interface SubjectStats {
  taskCount: number
  progress: number
}

const props = defineProps<{
  subject: Subject
  stats: SubjectStats
  isBlocked?: boolean
  canModify?: boolean
  isDragMode?: boolean
}>()

defineEmits<{
  click: []
  options: [subject: Subject]
}>()

const thumb = computed(() => resolveImageUrl(props.subject.thumbnailUrl))
</script>

<style scoped>
.subject-card {
  border-radius: 24px;
  background: #242424;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.subject-card--drag {
  cursor: grab;
  user-select: none;
}
.subject-card--drag:hover {
  transform: none;
  box-shadow: none;
}

.subject-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.subject-blocked {
  opacity: 0.5;
}

.subject-blocked:hover {
  transform: none;
  box-shadow: none;
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
  background: linear-gradient(135deg, #1a1a2e, #2a1a3e);
}

.blocked-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #FF453A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-body {
  padding: 14px 16px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.card-desc {
  font-size: 13px;
  color: #8E8E93;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.progress-bar-mini {
  flex: 1;
  max-width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #BF5AF2, #00D4FF);
  transition: width 0.3s;
}

.stat-progress {
  font-size: 12px;
  font-weight: 600;
  color: #BF5AF2;
}

.task-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.12);
  padding: 4px 10px;
  border-radius: 10px;
  flex-shrink: 0;
}

.options-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #8E8E93;
  flex-shrink: 0;
  transition: background 0.15s;
}

.options-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>
