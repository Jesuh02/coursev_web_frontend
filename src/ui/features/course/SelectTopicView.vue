<template>
  <div class="st-root">
    <div class="particles" aria-hidden="true">
      <span v-for="n in 12" :key="n" class="particle" :style="particleStyle(n)" />
    </div>

    <TopBar title="Seleccionar Tema" @back="$router.back()" />

    <div class="st-body">
      <div class="st-header">
        <span class="st-emoji">📂</span>
        <h1 class="st-title">Elige un tema</h1>
        <p class="st-subtitle">Selecciona el tema de práctica</p>
      </div>

      <div class="search-wrap">
        <span class="search-icon">🔎</span>
        <input v-model="search" class="search-input" placeholder="Buscar tema..." type="search" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="items-list">
        <div v-for="n in 5" :key="n" class="sk-card" :style="{ animationDelay: `${n * 80}ms` }">
          <div class="sk-icon" />
          <div class="sk-lines"><div class="sk-line sk-long" /></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="error-state">
        <span class="error-emoji">⚠️</span>
        <p class="error-msg">{{ errorMsg }}</p>
        <button class="retry-btn" @click="loadTopics">Reintentar</button>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="items-list">
          <button
            v-for="(topic, i) in filtered"
            :key="topic.id"
            class="item-card"
            :style="{ animationDelay: `${i * 50}ms` }"
            @click="select(topic)"
          >
            <span class="item-icon">📁</span>
            <span class="item-name">{{ topic.title }}</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div v-else class="empty-state">
          <span class="empty-emoji">🔍</span>
          <p class="empty-msg">Sin temas disponibles</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Topic } from '@/domain/models'
import { topicAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'

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

function particleStyle(n: number) {
  const pos = [
    { top: '8%', left: '12%' }, { top: '15%', right: '10%' },
    { top: '28%', left: '5%' }, { top: '40%', right: '6%' },
    { top: '55%', left: '8%' }, { top: '65%', right: '12%' },
    { top: '72%', left: '18%' }, { top: '85%', right: '8%' },
    { top: '20%', left: '55%' }, { top: '48%', left: '75%' },
    { top: '78%', left: '60%' }, { top: '90%', left: '35%' },
  ]
  const p = pos[(n - 1) % pos.length]
  return { ...p, animationDelay: `${(n - 1) * 0.55}s`, animationDuration: `${3.5 + (n % 3)}s` }
}

async function loadTopics() {
  loading.value = true
  errorMsg.value = ''
  try {
    if (subjectId.value) {
      topics.value = await topicAdapter.getTopicsBySubject(subjectId.value)
    } else {
      const byCourse = await topicAdapter.getTopicsByCourse(courseId.value)
      if (byCourse.length > 0) {
        topics.value = byCourse
      } else {
        topics.value = await topicAdapter.getTopicsBySubject(courseId.value)
      }
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Error al cargar los temas'
  } finally {
    loading.value = false
  }
}

onMounted(loadTopics)

function select(topic: Topic) {
  if (isCreatingTask.value) {
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
.st-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 25% 0%, rgba(0, 212, 255, .12), transparent 55%),
    radial-gradient(ellipse at 85% 90%, rgba(98, 0, 238, .10), transparent 50%),
    #0A0A0F;
  overflow-x: hidden;
  position: relative;
}

.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(0, 212, 255, .5);
  animation: floatP 4s ease-in-out infinite;
}
.particle:nth-child(odd) { background: rgba(98, 0, 238, .4); width: 2px; height: 2px; }

.st-body { position: relative; z-index: 1; padding: 0 16px 48px; }

.st-header { text-align: center; padding: 28px 0 20px; }
.st-emoji { font-size: 52px; display: block; animation: bounce 2.4s ease-in-out infinite; }
.st-title { font-size: 22px; font-weight: 700; color: #F2F2F7; letter-spacing: -.02em; margin: 10px 0 6px; }
.st-subtitle { font-size: 13px; color: #8E8E93; }

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

.item-icon { font-size: 26px; flex-shrink: 0; }
.item-name { flex: 1; font-size: 15px; font-weight: 500; color: #F2F2F7; letter-spacing: -.015em; line-height: 1.3; }
.chevron { flex-shrink: 0; color: #48484A; transition: color .18s; }

.sk-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 18px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05);
  animation: shimmer 1.4s ease infinite;
}
.sk-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,.08); flex-shrink: 0; }
.sk-lines { flex: 1; }
.sk-line { height: 13px; border-radius: 6px; background: rgba(255,255,255,.08); }
.sk-long { width: 60%; }

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
