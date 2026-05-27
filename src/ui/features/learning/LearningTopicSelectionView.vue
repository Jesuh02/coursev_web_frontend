<template>
  <div class="al-root">
    <TopBar title="Elige un tema" @back="$router.back()" />

    <div class="al-shell">
      <header class="head" ref="headEl">
        <p class="al-eyebrow">Paso 2 de 3</p>
        <h1 class="al-display">¿Qué tema?</h1>
        <p class="al-sub">Usaremos los documentos y materiales de este tema para componer tu historia.</p>
      </header>

      <div class="al-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" placeholder="Buscar tema…" type="search" />
      </div>

      <div v-if="loading" class="al-list">
        <div v-for="n in 5" :key="n" class="al-skeleton" />
      </div>

      <div v-else-if="errorMsg" class="al-empty">
        <p>{{ errorMsg }}</p>
        <button class="al-cta al-cta--ghost" @click="load">Reintentar</button>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="al-list" ref="listEl">
          <button
            v-for="topic in filtered"
            :key="topic.id"
            class="al-row"
            @click="select(topic)"
          >
            <div class="al-row__thumb">📁</div>
            <div class="al-row__body">
              <p class="al-row__title">{{ topic.title }}</p>
              <p v-if="topic.description" class="al-row__desc">{{ topic.description }}</p>
            </div>
            <span class="al-row__chev">›</span>
          </button>
        </div>

        <div v-else class="al-empty">
          <p>Sin temas disponibles para este curso.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import type { Topic } from '@/domain/models'
import { topicAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()

const courseId = computed(() => Number(route.params.courseId))
const search = ref('')
const topics = ref<Topic[]>([])
const loading = ref(false)
const errorMsg = ref('')
const headEl = ref<HTMLElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

const filtered = computed(() => {
  if (!search.value) return topics.value
  const q = search.value.toLowerCase()
  return topics.value.filter(t => t.title.toLowerCase().includes(q))
})

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const byCourse = await topicAdapter.getTopicsByCourse(courseId.value)
    topics.value = byCourse.length > 0
      ? byCourse
      : await topicAdapter.getTopicsBySubject(courseId.value)
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'No pudimos cargar los temas'
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

function select(topic: Topic) {
  router.push(`/learning/course/${courseId.value}/topic/${topic.id}/task-selection`)
}
</script>

<style scoped>
@import '@/styles/apple-tokens.css';
.head { padding: 16px 0 8px; }
</style>
