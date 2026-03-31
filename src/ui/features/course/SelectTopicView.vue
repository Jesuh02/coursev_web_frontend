<template>
  <div class="select-topic">
    <TopBar title="Seleccionar Tema" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar tema..." />

    <!-- Skeleton -->
    <div v-if="loading" class="list-wrap">
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="sk-icon" />
        <div class="sk-line sk-title" />
      </div>
    </div>

    <div v-else-if="errorMsg" class="error-state">
      <div class="error-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF453A" /></svg>
      </div>
      <p class="error-msg">{{ errorMsg }}</p>
      <button class="retry-btn" @click="loadTopics">Reintentar</button>
    </div>

    <template v-else>
      <div v-if="filtered.length" class="list-header">
        <span class="list-count">{{ filtered.length }} {{ filtered.length === 1 ? 'tema' : 'temas' }}</span>
      </div>

      <div class="list-wrap">
        <button
          v-for="(topic, i) in filtered"
          :key="topic.id"
          class="topic-option"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="select(topic)"
        >
          <div class="topic-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
          </div>
          <span class="topic-name">{{ topic.title }}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#484848" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
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
const isReinforcement = computed(() => route.query.mode === 'reinforcement')

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
    const query: Record<string, string> = {}
    if (subjectId.value) query.subjectId = String(subjectId.value)
    if (isReinforcement.value) query.mode = 'reinforcement'
    router.push({
      path: `/course/${courseId.value}/topic/${topic.id}/select-task`,
      query: Object.keys(query).length ? query : undefined,
    })
  }
}
</script>

<style scoped>
.select-topic { min-height: 100vh; background: var(--bg-primary); }

.list-header { padding: 4px 20px 0; }

.list-count {
  font-size: 11px;
  font-weight: 600;
  color: #48484A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.list-wrap { padding: 4px 12px 40px; }

.topic-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 8px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.18s ease, transform 0.18s ease;
  animation: fadeSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.topic-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 62px;
  right: 8px;
  height: 1px;
  background: rgba(255,255,255,0.04);
}

.topic-option:last-child::after { display: none; }

.topic-option:active {
  transform: scale(0.975);
  background: rgba(255,255,255,0.04);
}

@media (hover: hover) {
  .topic-option:hover { background: rgba(255,255,255,0.04); }
  .topic-option:hover .chevron { transform: translateX(3px); stroke: #00D4FF; }
}

.chevron {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.18s ease;
}

.topic-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(0,212,255,0.07);
  border: 1px solid rgba(0,212,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-name {
  flex: 1;
  font-size: 14.5px;
  font-weight: 500;
  color: #F2F2F7;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

/* ── Error ── */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 32px;
  text-align: center;
}

.error-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255,69,58,0.1);
  border: 1px solid rgba(255,69,58,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.error-msg {
  font-size: 13.5px;
  color: #8E8E93;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 6px;
  padding: 9px 22px;
  border-radius: 22px;
  background: rgba(0,212,255,0.1);
  border: 1px solid rgba(0,212,255,0.18);
  color: #00D4FF;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  transition: background 0.18s ease;
}

.retry-btn:active { background: rgba(0,212,255,0.18); }

/* ── Skeleton ── */
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 8px;
}

.sk-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #1c1c1e;
  flex-shrink: 0;
  animation: shimmer 1.4s ease infinite;
}

.sk-line {
  border-radius: 6px;
  background: #1c1c1e;
  animation: shimmer 1.4s ease infinite;
}

.sk-title { height: 13px; width: 58%; }

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
