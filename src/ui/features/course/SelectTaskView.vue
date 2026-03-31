<template>
  <div class="select-task">
    <TopBar title="Seleccionar Tarea" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar tarea..." />

    <div v-if="loading" class="loading-center">
      <div class="spinner" />
    </div>

    <div v-else-if="errorMsg" class="error-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r="1" fill="#FF453A" /></svg>
      <p>{{ errorMsg }}</p>
      <button class="retry-btn" @click="loadTasks">Reintentar</button>
    </div>

    <template v-else>
      <div class="task-list">
        <button
          v-for="(task, i) in filtered"
          :key="task.id"
          class="task-option"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="select(task)"
        >
          <div class="task-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <div class="task-info">
            <p class="task-name">{{ task.title }}</p>
            <p class="task-diff">{{ task.description }}</p>
          </div>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <EmptyState v-if="!filtered.length" icon="clipboard" message="Sin tareas disponibles" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Task } from '@/domain/models'
import { taskAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const route = useRoute()

const courseId = computed(() => Number(route.params.courseId))
const topicId = computed(() => Number(route.params.topicId))
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)
const isReinforcement = computed(() => route.query.mode === 'reinforcement')

const search = ref('')
const tasks = ref<Task[]>([])
const loading = ref(false)
const errorMsg = ref('')

const filtered = computed(() => {
  if (!search.value) return tasks.value
  const q = search.value.toLowerCase()
  return tasks.value.filter(t => t.title.toLowerCase().includes(q))
})

async function loadTasks() {
  loading.value = true
  errorMsg.value = ''
  try {
    tasks.value = await taskAdapter.getTasksByTopic(topicId.value)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al cargar las tareas'
  } finally {
    loading.value = false
  }
}

onMounted(loadTasks)

function select(task: Task) {
  if (isReinforcement.value) {
    router.push({
      path: `/course/${courseId.value}/topic/${topicId.value}/difficulty`,
      query: {
        taskId: String(task.id),
        ...(subjectId.value ? { subjectId: String(subjectId.value) } : {}),
        mode: 'reinforcement',
      },
    })
  } else {
    router.push({
      path: `/task-submission/${task.id}`,
      query: {
        courseId: String(courseId.value),
        topicId: String(topicId.value),
        ...(subjectId.value ? { subjectId: String(subjectId.value) } : {}),
      },
    })
  }
}
</script>

<style scoped>
.select-task { min-height: 100vh; background: var(--bg-primary); }
.task-list { padding: 0 16px; }

.task-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  transition: background 0.2s ease, transform 0.2s ease;
  animation: slideUp 0.3s ease both;
}

.task-option:active { transform: scale(0.98); background: rgba(255,255,255,0.04); }

@media (hover: hover) {
  .task-option:hover { background: rgba(255,255,255,0.04); }
  .task-option:hover .chevron { transform: translateX(4px); stroke: #00D4FF; }
}

.chevron { transition: transform 0.2s ease, stroke 0.2s ease; }

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0,212,255,0.1);
  color: #00D4FF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-info { flex: 1; min-width: 0; }
.task-name { font-size: 15px; color: #fff; font-weight: 500; }
.task-diff { font-size: 12px; color: #8E8E93; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }

.loading-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0,212,255,0.2);
  border-top-color: #00D4FF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

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

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
