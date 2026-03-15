<template>
  <div class="select-task">
    <TopBar title="Seleccionar Tarea" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar tarea..." />

    <div class="task-list">
      <button
        v-for="task in filtered"
        :key="task.id"
        class="task-option"
        @click="select(task)"
      >
        <div class="task-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
        </div>
        <div class="task-info">
          <p class="task-name">{{ task.title }}</p>
          <p class="task-diff">{{ task.description }}</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>

    <EmptyState v-if="!filtered.length" icon="clipboard" message="Sin tareas disponibles" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Task } from '@/domain/models'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const search = ref('')
const tasks = ref<Task[]>([])

const filtered = computed(() => {
  if (!search.value) return tasks.value
  const q = search.value.toLowerCase()
  return tasks.value.filter(t => t.title.toLowerCase().includes(q))
})

function select(_task: Task) {
  router.back()
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
  padding: 14px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.task-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.task-icon.easy { background: rgba(48,209,88,0.15); color: #30D158; }
.task-icon.medium { background: rgba(255,149,0,0.15); color: #FF9500; }
.task-icon.hard { background: rgba(255,69,58,0.15); color: #FF453A; }

.task-info { flex: 1; }
.task-name { font-size: 15px; color: #fff; }
.task-diff { font-size: 12px; color: #8E8E93; margin-top: 2px; text-transform: capitalize; }
</style>
