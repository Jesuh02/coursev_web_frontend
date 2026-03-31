<template>
  <div class="ss-root">
    <div class="particles" aria-hidden="true">
      <span v-for="n in 12" :key="n" class="particle" :style="particleStyle(n)" />
    </div>

    <TopBar title="Seleccionar Materia" @back="$router.back()" />

    <div class="ss-body">
      <div class="ss-header">
        <span class="ss-emoji">📖</span>
        <h1 class="ss-title">Elige una materia</h1>
        <p class="ss-subtitle">Selecciona la materia para practicar</p>
      </div>

      <div class="search-wrap">
        <span class="search-icon">🔎</span>
        <input v-model="search" class="search-input" placeholder="Buscar materia..." type="search" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="items-list">
        <div v-for="n in 5" :key="n" class="sk-card" :style="{ animationDelay: `${n * 80}ms` }">
          <div class="sk-icon" />
          <div class="sk-lines"><div class="sk-line sk-long" /></div>
        </div>
      </div>

      <template v-else>
        <div v-if="filtered.length" class="items-list">
          <button
            v-for="(subject, i) in filtered"
            :key="subject.id"
            class="item-card"
            :style="{ animationDelay: `${i * 50}ms` }"
            @click="select(subject)"
          >
            <span class="item-icon">📚</span>
            <span class="item-name">{{ subject.name }}</span>
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div v-else class="empty-state">
          <span class="empty-emoji">🔍</span>
          <p class="empty-msg">Sin materias disponibles</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Subject } from '@/domain/models'
import { subjectAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()
const courseId = computed(() => Number(route.params.courseId))
const isReinforcement = computed(() => route.query.mode === 'reinforcement')
const search = ref('')
const subjects = ref<Subject[]>([])
const loading = ref(false)

const filtered = computed(() => {
  if (!search.value) return subjects.value
  const q = search.value.toLowerCase()
  return subjects.value.filter(s => s.name.toLowerCase().includes(q))
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

onMounted(async () => {
  loading.value = true
  try {
    subjects.value = await subjectAdapter.getSubjectsByCourse(courseId.value)
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})

function select(subject: Subject) {
  const modeParam = isReinforcement.value ? '&mode=reinforcement' : ''
  router.push(`/course/${courseId.value}/select-topic?subjectId=${subject.id}${modeParam}`)
}
</script>

<style scoped>
.ss-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 25% 0%, rgba(191, 90, 242, .16), transparent 55%),
    radial-gradient(ellipse at 85% 90%, rgba(0, 212, 255, .08), transparent 50%),
    #0A0A0F;
  overflow-x: hidden;
  position: relative;
}

.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(191, 90, 242, .5);
  animation: floatP var(--dur, 4s) ease-in-out infinite;
  animation-delay: var(--del, 0s);
}
.particle:nth-child(odd) { background: rgba(0, 212, 255, .4); width: 2px; height: 2px; }

.ss-body { position: relative; z-index: 1; padding: 0 16px 48px; }

.ss-header { text-align: center; padding: 28px 0 20px; }
.ss-emoji { font-size: 52px; display: block; animation: bounce 2.4s ease-in-out infinite; }
.ss-title { font-size: 22px; font-weight: 700; color: #F2F2F7; letter-spacing: -.02em; margin: 10px 0 6px; }
.ss-subtitle { font-size: 13px; color: #8E8E93; }

.search-wrap {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.09);
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
  .item-card:hover { background: rgba(255,255,255,.08); border-color: rgba(191,90,242,.3); transform: translateX(3px); }
  .item-card:hover .chevron { color: #BF5AF2; }
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

.empty-state { text-align: center; padding: 60px 20px; }
.empty-emoji { font-size: 48px; display: block; margin-bottom: 12px; }
.empty-msg { font-size: 15px; color: #636366; }

@keyframes floatP { 0%, 100% { transform: translateY(0) scale(1); opacity: .4; } 50% { transform: translateY(-14px) scale(1.3); opacity: .9; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes shimmer { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
</style>

