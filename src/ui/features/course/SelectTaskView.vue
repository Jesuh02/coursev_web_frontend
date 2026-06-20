<template>
  <div class="sktask-root">
    <div class="particles" aria-hidden="true">
      <span v-for="n in 10" :key="n" class="particle" :style="particleStyle(n)" />
    </div>

    <TopBar title="Seleccionar Tarea" @back="$router.back()" />

    <div class="sktask-body">
      <div class="sktask-header">
        <span class="sktask-emoji">📋</span>
        <h1 class="sktask-title">Elige una tarea</h1>
        <p class="sktask-subtitle">Selecciona la tarea a practicar</p>
      </div>

      <div class="search-wrap">
        <span class="search-icon">🔎</span>
        <input v-model="search" class="search-input" placeholder="Buscar tarea..." type="search" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="items-list">
        <div v-for="n in 4" :key="n" class="sk-card" :style="{ animationDelay: `${n * 80}ms` }">
          <div class="sk-icon-box" />
          <div class="sk-lines">
            <div class="sk-line sk-long" />
            <div class="sk-line sk-short" style="margin-top:8px;" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="error-state">
        <span class="error-emoji">⚠️</span>
        <p class="error-msg">{{ errorMsg }}</p>
        <button class="retry-btn" @click="loadTasks">Reintentar</button>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="items-list">
          <button
            v-for="(task, i) in filtered"
            :key="task.id"
            class="item-card"
            :style="{ animationDelay: `${i * 55}ms` }"
            @click="select(task)"
          >
            <span class="item-icon">📄</span>
            <div class="task-info">
              <p class="task-name">{{ task.title }}</p>
              <p v-if="task.description" class="task-desc">{{ task.description }}</p>
            </div>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div v-else class="empty-state">
          <span class="empty-emoji">📭</span>
          <p class="empty-msg">Sin tareas disponibles</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Task } from '@/domain/models'
import { taskAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()

const courseId = computed(() => Number(route.params.courseId))
const topicId = computed(() => Number(route.params.topicId))
const subjectId = computed(() => route.query.subjectId ? Number(route.query.subjectId) : null)
const isReinforcement = computed(() => route.query.mode === 'reinforcement')
const topicName = computed(() => (route.query.topicName as string) || '')

const search = ref('')
const tasks = ref<Task[]>([])
const loading = ref(false)
const errorMsg = ref('')

const filtered = computed(() => {
  if (!search.value) return tasks.value
  const q = search.value.toLowerCase()
  return tasks.value.filter(t => t.title.toLowerCase().includes(q))
})

function particleStyle(n: number) {
  const pos = [
    { top: '10%', left: '8%' }, { top: '18%', right: '9%' },
    { top: '35%', left: '4%' }, { top: '50%', right: '7%' },
    { top: '62%', left: '10%' }, { top: '75%', right: '11%' },
    { top: '80%', left: '20%' }, { top: '88%', right: '15%' },
    { top: '22%', left: '60%' }, { top: '55%', left: '80%' },
  ]
  const p = pos[(n - 1) % pos.length]
  return { ...p, animationDelay: `${(n - 1) * 0.6}s`, animationDuration: `${3.5 + (n % 3)}s` }
}

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
      path: `/reinforcement/${courseId.value}`,
      query: {
        topicId: String(topicId.value),
        taskId: String(task.id),
        topicName: topicName.value,
        taskName: task.title,
        ...(subjectId.value ? { subjectId: String(subjectId.value) } : {}),
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
.sktask-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 30% 0%, rgba(0, 212, 255, .10), transparent 55%),
    radial-gradient(ellipse at 80% 85%, rgba(98, 0, 238, .12), transparent 50%),
    #0A0A0F;
  overflow-x: hidden;
  position: relative;
}

.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(0, 212, 255, .45);
  animation: floatP 4s ease-in-out infinite;
}
.particle:nth-child(even) { background: rgba(98, 0, 238, .4); width: 2px; height: 2px; }

.sktask-body { position: relative; z-index: 1; padding: 0 16px 48px; }

.sktask-header { text-align: center; padding: 28px 0 20px; }
.sktask-emoji { font-size: 52px; display: block; animation: bounce 2.4s ease-in-out infinite; }
.sktask-title { font-size: 22px; font-weight: 700; color: #F2F2F7; letter-spacing: -.02em; margin: 10px 0 6px; }
.sktask-subtitle { font-size: 13px; color: #8E8E93; }

.search-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
  border-radius: 16px; padding: 12px 16px; margin-bottom: 16px;
}
.search-icon { font-size: 16px; flex-shrink: 0; }
.search-input { flex: 1; background: transparent; border: none; outline: none; color: #F2F2F7; font-size: 15px; }
.search-input::placeholder { color: #636366; }

.items-list { display: flex; flex-direction: column; gap: 10px; }

.item-card {
  display: flex; align-items: center; gap: 14px; width: 100%;
  padding: 14px 16px; border-radius: 18px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
  text-align: left;
  transition: background .18s, border-color .18s, transform .18s;
  animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both;
}
.item-card:active { transform: scale(0.97); }
@media (hover: hover) {
  .item-card:hover { background: rgba(255,255,255,.08); border-color: rgba(0,212,255,.3); transform: translateX(3px); }
  .item-card:hover .chevron { color: #00D4FF; }
}

.item-icon { font-size: 28px; flex-shrink: 0; }
.task-info { flex: 1; min-width: 0; }
.task-name { font-size: 15px; font-weight: 500; color: #F2F2F7; letter-spacing: -.015em; line-height: 1.3; }
.task-desc { font-size: 12px; color: #636366; margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chevron { flex-shrink: 0; color: #48484A; transition: color .18s; }

.sk-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 18px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05);
  animation: shimmer 1.4s ease infinite;
}
.sk-icon-box { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,.08); flex-shrink: 0; }
.sk-lines { flex: 1; }
.sk-line { height: 12px; border-radius: 6px; background: rgba(255,255,255,.08); }
.sk-long { width: 65%; }
.sk-short { width: 40%; }

.error-state { text-align: center; padding: 60px 20px; }
.error-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
.error-msg { font-size: 14px; color: #8E8E93; margin-bottom: 16px; line-height: 1.5; }
.retry-btn {
  padding: 10px 28px; border-radius: 22px;
  background: rgba(0,212,255,.1); border: 1px solid rgba(0,212,255,.18);
  color: #00D4FF; font-size: 14px; font-weight: 600; transition: background .18s;
}
.retry-btn:active { background: rgba(0,212,255,.2); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
.empty-msg { font-size: 15px; color: #636366; }

@keyframes floatP { 0%, 100% { transform: translateY(0) scale(1); opacity: .4; } 50% { transform: translateY(-14px) scale(1.3); opacity: .9; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes shimmer { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
</style>
