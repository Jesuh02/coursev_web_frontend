<template>
  <div class="course-topic">
    <TopBar :title="topic?.title ?? 'Tema'" @back="$router.back()" />

    <div v-if="topic" class="topic-content">
      <div class="topic-header">
        <h2 class="topic-title">{{ topic.title }}</h2>
        <p class="topic-desc">{{ topic.description }}</p>
      </div>

      <div class="content-list">
        <div v-for="(item, i) in contentItems" :key="i" class="content-item">
          <div class="item-icon" :class="item.type">
            <svg v-if="item.type === 'document'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
          <div class="item-info">
            <p class="item-title">{{ item.title }}</p>
            <p class="item-meta">{{ item.meta }}</p>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else icon="folder" message="Tema no encontrado" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Topic } from '@/domain/models'
import { topicAdapter, contentItemAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const route = useRoute()
const topic = ref<Topic | null>(null)
const contentItems = ref<{ type: string; title: string; meta: string }[]>([])

onMounted(async () => {
  const id = Number(route.params.topicId)
  try {
    topic.value = await topicAdapter.getTopicById(id)
    const items = await contentItemAdapter.getByTopic(id)
    contentItems.value = items.map(i => ({ type: i.contentType ?? 'doc', title: i.content, meta: '' }))
  } catch { /* empty */ }
})
</script>

<style scoped>
.course-topic {
  min-height: 100vh;
  background: var(--bg-primary);
}

.topic-content { padding: 16px; }

.topic-header { margin-bottom: 24px; }
.topic-title { font-size: 22px; font-weight: 700; color: #fff; }
.topic-desc { font-size: 14px; color: #8E8E93; margin-top: 4px; line-height: 1.5; }

.content-list { display: flex; flex-direction: column; gap: 4px; }

.content-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  transition: background 0.15s;
  cursor: pointer;
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

.item-info { flex: 1; }
.item-title { font-size: 15px; font-weight: 500; color: #fff; }
.item-meta { font-size: 12px; color: #8E8E93; margin-top: 2px; }
</style>
