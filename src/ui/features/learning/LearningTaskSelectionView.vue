<template>
  <div class="al-root">
    <TopBar title="Elige una tarea" @back="$router.back()">
      <template #right>
        <button class="theme-btn" @click="toggleTheme" :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </template>
    </TopBar>

    <div class="al-shell">
      <!-- Step progress -->
      <div class="step-bar">
        <span class="step-dot step-dot--done">✓</span>
        <span class="step-line step-line--done" />
        <span class="step-dot step-dot--done">✓</span>
        <span class="step-line step-line--done" />
        <span class="step-dot step-dot--active">3</span>
      </div>

      <header class="head" ref="headEl">
        <p class="al-eyebrow">Paso 3 de 3</p>
        <h1 class="al-display">¿Qué tarea?</h1>
        <p class="al-sub">Selecciona la tarea cuyos materiales se transformarán en cómic o video.</p>
      </header>

      <div class="al-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" placeholder="Buscar tarea…" type="search" />
      </div>

      <div v-if="loading" class="al-list">
        <div v-for="n in 4" :key="n" class="al-skeleton" />
      </div>

      <div v-else-if="errorMsg" class="al-empty">
        <p>{{ errorMsg }}</p>
        <button class="al-cta al-cta--ghost" @click="load">Reintentar</button>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="al-list" ref="listEl">
          <button
            v-for="task in filtered"
            :key="task.id"
            class="al-row"
            @click="select(task)"
          >
            <div class="al-row__thumb">📄</div>
            <div class="al-row__body">
              <p class="al-row__title">{{ task.title }}</p>
              <p v-if="task.description" class="al-row__desc">{{ task.description }}</p>
            </div>
            <span class="al-row__chev">›</span>
          </button>
        </div>

        <div v-else class="al-empty">
          <p>Sin tareas en este tema.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import type { Task } from '@/domain/models'
import { taskAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const courseId = computed(() => Number(route.params.courseId))
const topicId = computed(() => Number(route.params.topicId))

const search = ref('')
const tasks = ref<Task[]>([])
const loading = ref(false)
const errorMsg = ref('')
const headEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  if (!search.value) return tasks.value
  const q = search.value.toLowerCase()
  return tasks.value.filter(t => t.title.toLowerCase().includes(q))
})

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    tasks.value = await taskAdapter.getTasksByTopic(topicId.value)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'No pudimos cargar las tareas'
  } finally {
    loading.value = false
  }
  await nextTick()
  if (listEl.value) {
    const rows = Array.from(listEl.value.children) as HTMLElement[]
    if (rows.length) animate(rows, { opacity: [0, 1], translateY: [14, 0], delay: utils.stagger(40), duration: 500, ease: 'outCubic' })
  }
}

onMounted(async () => {
  if (headEl.value) {
    animate(Array.from(headEl.value.children) as HTMLElement[], {
      opacity: [0, 1], translateY: [16, 0],
      delay: utils.stagger(80), duration: 550, ease: 'outCubic',
    })
  }
  await load()
})

function select(task: Task) {
  router.push(`/learning/course/${courseId.value}/topic/${topicId.value}/task/${task.id}/mode`)
}
</script>

<style scoped>
@import '@/styles/apple-tokens.css';
.head { padding: 16px 0 8px; }

.step-bar {
  display: flex; align-items: center;
  gap: 0; padding: 20px 0 4px;
}
.step-dot {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  font-family: var(--apple-font-display);
  font-size: 12px; font-weight: 700;
  letter-spacing: -0.01em;
  flex-shrink: 0;
  background: var(--apple-cloud); color: var(--apple-graphite);
  transition: background 0.25s ease, color 0.25s ease;
}
.step-dot--active {
  background: var(--apple-ink); color: var(--apple-snow);
}
.step-dot--done {
  background: var(--apple-snow); color: var(--apple-ink);
  box-shadow: inset 0 0 0 1px var(--apple-silver);
}
.step-line {
  flex: 1; height: 2px; border-radius: 2px;
  background: var(--apple-cloud); margin: 0 6px;
}
.step-line--done { background: var(--apple-silver); }
</style>
