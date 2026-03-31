<template>
  <div class="select-topic">
    <TopBar title="Seleccionar Tema" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar tema..." />

    <div v-if="loading" class="loading-center">
      <div class="spinner" />
    </div>

    <div v-else-if="errorMsg" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF453A" /></svg>
      <p>{{ errorMsg }}</p>
      <button class="retry-btn" @click="loadTopics">Reintentar</button>
    </div>

    <template v-else>
      <div class="topic-list">
        <button
          v-for="(topic, i) in filtered"
          :key="topic.id"
          class="topic-option"
          :style="{ animationDelay: `${i * 55}ms` }"
          @click="select(topic)"
        >
          <div class="topic-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          </div>
          <span class="topic-name">{{ topic.title }}</span>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <EmptyState v-if="!filtered.length" icon="folder" message="Sin temas disponibles" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Topic } from '@/domain/models'
import { topicAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const route = useRoute()

const courseId = computed(() => Number(route.params.courseId))
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)
const isCreatingTask = computed(() => route.query.isCreatingTask === 'true')

const search = ref('')
const topics = ref<Topic[]>([])
const loading = ref(false)
const errorMsg = ref('')

const filtered = computed(() => {
  if (!search.value) return topics.value
  const q = search.value.toLowerCase()
  return topics.value.filter(t => t.title.toLowerCase().includes(q))
})

async function loadTopics() {
  loading.value = true
  errorMsg.value = ''
  try {
    if (subjectId.value) {
      topics.value = await topicAdapter.getTopicsBySubject(subjectId.value)
    } else {
      // Fetch by course; if empty, fall back to treating courseId as a subjectId
      // (handles cases where topics are stored directly under course ID)
      const byCourse = await topicAdapter.getTopicsByCourse(courseId.value)
      if (byCourse.length > 0) {
        topics.value = byCourse
      } else {
        topics.value = await topicAdapter.getTopicsBySubject(courseId.value)
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error al cargar los temas'
    errorMsg.value = msg
  } finally {
    loading.value = false
  }
}

onMounted(loadTopics)

function select(topic: Topic) {
  if (isCreatingTask.value) {
    // Admin/docente: go directly to task creation form for the selected topic
    router.push({
      path: `/course/${courseId.value}/task`,
      query: {
        topicId: String(topic.id),
        ...(subjectId.value ? { subjectId: String(subjectId.value) } : {}),
      },
    })
  } else {
    router.push({
      path: `/course/${courseId.value}/topic/${topic.id}/select-task`,
      query: subjectId.value ? { subjectId: String(subjectId.value) } : undefined,
    })
  }
}
</script>

<style scoped>
.select-topic { min-height: 100vh; background: var(--bg-primary); }
.topic-list { padding: 8px 16px 32px; }

.topic-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 12px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.22s ease, transform 0.22s ease;
  animation: slideUp 0.35s ease both;
}

.topic-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 66px;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.05);
}

.topic-option:last-child::after { display: none; }

.topic-option:active {
  transform: scale(0.98);
  background: rgba(255,255,255,0.05);
}

@media (hover: hover) {
  .topic-option:hover { background: rgba(255,255,255,0.05); }
  .topic-option:hover .chevron { transform: translateX(4px); stroke: #00D4FF; }
}

.chevron { flex-shrink: 0; transition: transform 0.22s ease, stroke 0.22s ease; }

.topic-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: rgba(0,212,255,0.08);
  border: 1px solid rgba(0,212,255,0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.01em;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 72px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2.5px solid rgba(0,212,255,0.18);
  border-top-color: #00D4FF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 32px;
  text-align: center;
  color: #FF453A;
  font-size: 14px;
}

.retry-btn {
  margin-top: 4px;
  padding: 10px 24px;
  border-radius: 12px;
  background: rgba(0,212,255,0.12);
  color: #00D4FF;
  font-size: 15px;
  font-weight: 600;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
