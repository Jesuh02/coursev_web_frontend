<template>
  <div class="course-topic">
    <TopBar :title="topic?.title ?? 'Tema'" @back="$router.back()" />

    <div v-if="loading" class="loading-center">
      <div class="spinner-lg" />
    </div>

    <div v-else-if="topic" class="topic-content">
      <div class="topic-header">
        <h2 class="topic-title">{{ topic.title }}</h2>
        <p v-if="topic.description" class="topic-desc">{{ topic.description }}</p>
      </div>

      <div v-if="contentItems.length" class="section">
        <h3 class="section-title">Archivos</h3>
        <div class="content-list">
          <a
            v-for="item in contentItems"
            :key="item.id"
            class="content-item"
            :href="getFileUrl(item)"
            target="_blank"
            rel="noopener"
          >
            <div class="item-icon" :class="getIconClass(item.contentType)">
              <svg v-if="item.contentType === 'video'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              <svg v-else-if="item.contentType === 'image'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div class="item-info">
              <p class="item-title">{{ item.fileName || item.content || 'Archivo' }}</p>
              <p class="item-meta">{{ item.contentType }}</p>
            </div>
            <svg class="download-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </a>
        </div>
      </div>

      <div v-if="tasks.length" class="section">
        <h3 class="section-title">Tareas</h3>
        <div class="content-list">
          <div v-for="task in tasks" :key="task.id" class="content-item" @click="$router.push(`/course/${$route.params.courseId}/task/${task.id}`)">
            <div class="item-icon task">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </div>
            <div class="item-info">
              <p class="item-title">{{ task.title }}</p>
              <p v-if="task.description" class="item-meta">{{ task.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <EmptyState v-if="!contentItems.length && !tasks.length" icon="folder" message="Sin contenido aún" />
    </div>

    <EmptyState v-else icon="folder" message="Tema no encontrado" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Topic, ContentItem, Task } from '@/domain/models'
import { topicAdapter, contentItemAdapter, taskAdapter, buildProxyFileUrl } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const route = useRoute()
const topic = ref<Topic | null>(null)
const contentItems = ref<ContentItem[]>([])
const tasks = ref<Task[]>([])
const loading = ref(true)

function getFileUrl(item: ContentItem): string {
  if (!item.fileUri) return '#'
  if (item.fileUri.startsWith('http')) return item.fileUri
  return buildProxyFileUrl(item.fileUri)
}

function getIconClass(type: string): string {
  if (type === 'video') return 'video'
  if (type === 'image') return 'image'
  return 'document'
}

onMounted(async () => {
  const id = Number(route.params.topicId)
  try {
    const [t, items, topicTasks] = await Promise.all([
      topicAdapter.getTopicById(id),
      contentItemAdapter.getByTopic(id),
      taskAdapter.getTasksByTopic(id).catch(() => []),
    ])
    topic.value = t
    contentItems.value = items
    tasks.value = topicTasks
  } catch { /* empty */ }
  loading.value = false
})
</script>

<style scoped>
.course-topic {
  min-height: 100vh;
  background: var(--bg-primary);
}

.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.topic-content { padding: 16px; }

.topic-header { margin-bottom: 24px; }
.topic-title { font-size: 22px; font-weight: 700; color: #fff; }
.topic-desc { font-size: 14px; color: #8E8E93; margin-top: 4px; line-height: 1.5; }

.section { margin-bottom: 24px; }
.section-title { font-size: 13px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }

.content-list { display: flex; flex-direction: column; gap: 4px; }

.content-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  transition: background 0.15s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.content-item:hover { background: rgba(255,255,255,0.04); }

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon.document { background: rgba(0,122,255,0.15); color: #007AFF; }
.item-icon.video { background: rgba(255,55,95,0.15); color: #FF375F; }
.item-icon.image { background: rgba(52,199,89,0.15); color: #34C759; }
.item-icon.task { background: rgba(191,90,242,0.15); color: #BF5AF2; }

.item-info { flex: 1; min-width: 0; }
.item-title { font-size: 15px; font-weight: 500; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-meta { font-size: 12px; color: #8E8E93; margin-top: 2px; }

.download-icon { flex-shrink: 0; }
</style>
