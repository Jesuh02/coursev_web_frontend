<template>
  <div class="al-root">
    <TopBar title="Elige una tarea" @back="$router.back()" />

    <div class="al-shell">
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

const router = useRouter()
const route = useRoute()

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
</style>
