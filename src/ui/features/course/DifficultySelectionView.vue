<template>
  <div class="diff-root">
    <div class="particles" aria-hidden="true">
      <span v-for="n in 10" :key="n" class="particle" :style="particleStyle(n)" />
    </div>

    <TopBar title="Seleccionar Dificultad" @back="$router.back()" />

    <div class="diff-body">
      <div class="diff-header">
        <span class="diff-emoji">⚡</span>
        <h1 class="diff-title">Elige la dificultad</h1>
        <p class="diff-subtitle">¿Qué tan desafiante quieres practicar?</p>
      </div>

      <div class="cards-grid">
        <button
          v-for="(d, i) in difficulties"
          :key="d.value"
          class="diff-card"
          :class="`diff-${d.value}`"
          :style="{ animationDelay: `${i * 100}ms` }"
          @click="select(d.value)"
        >
          <div class="card-glow" />
          <span class="card-emoji">{{ d.emoji }}</span>
          <div class="card-text">
            <h3 class="card-title">{{ d.label }}</h3>
            <p class="card-desc">{{ d.description }}</p>
          </div>
          <svg class="card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()

const courseId = computed(() => Number(route.params.courseId))
const topicId = computed(() => Number(route.params.topicId))
const taskId = computed(() => route.query.taskId ? Number(route.query.taskId) : null)
const isReinforcement = computed(() => route.query.mode === 'reinforcement')

const difficulties = [
  { value: 'easy',   label: 'Fácil',       emoji: '🟢', description: 'Preguntas básicas de comprensión' },
  { value: 'medium', label: 'Intermedio',   emoji: '🟡', description: 'Aplicación de conceptos' },
  { value: 'hard',   label: 'Difícil',      emoji: '🔴', description: 'Análisis y pensamiento crítico' },
]

function particleStyle(n: number) {
  const pos = [
    { top: '10%', left: '8%' }, { top: '18%', right: '9%' },
    { top: '35%', left: '4%' }, { top: '50%', right: '7%' },
    { top: '62%', left: '10%' }, { top: '75%', right: '11%' },
    { top: '80%', left: '20%' }, { top: '88%', right: '15%' },
    { top: '22%', left: '60%' }, { top: '55%', left: '80%' },
  ]
  const p = pos[(n - 1) % pos.length]
  return { ...p, animationDelay: `${(n - 1) * 0.6}s`, animationDuration: `${3 + (n % 3)}s` }
}

function select(difficulty: string) {
  if (isReinforcement.value) {
    router.push({
      path: `/reinforcement/${courseId.value}`,
      query: {
        topicId: String(topicId.value),
        ...(taskId.value ? { taskId: String(taskId.value) } : {}),
        difficulty,
      },
    })
  } else {
    router.back()
  }
}
</script>

<style scoped>
.diff-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(98, 0, 238, .18), transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(0, 212, 255, .10), transparent 50%),
    #0A0A0F;
  overflow-x: hidden;
  position: relative;
}

.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(98, 0, 238, .5);
  animation: floatP 4s ease-in-out infinite;
}
.particle:nth-child(even) { background: rgba(0, 212, 255, .4); width: 2px; height: 2px; }

.diff-body { position: relative; z-index: 1; padding: 0 16px 48px; }

.diff-header { text-align: center; padding: 28px 0 28px; }
.diff-emoji { font-size: 52px; display: block; animation: bounce 2.4s ease-in-out infinite; }
.diff-title { font-size: 22px; font-weight: 700; color: #F2F2F7; letter-spacing: -.02em; margin: 10px 0 6px; }
.diff-subtitle { font-size: 13px; color: #8E8E93; }

/* ── Cards ── */
.cards-grid { display: flex; flex-direction: column; gap: 14px; }

.diff-card {
  position: relative;
  display: flex; align-items: center; gap: 16px;
  width: 100%; padding: 20px 18px;
  border-radius: 22px;
  overflow: hidden;
  text-align: left;
  transition: transform .20s cubic-bezier(.22,1,.36,1), box-shadow .20s;
  animation: cardIn .45s cubic-bezier(.22,1,.36,1) both;
}
.diff-card:active { transform: scale(0.97); }

/* Easy — green */
.diff-easy {
  background: rgba(48, 209, 88, .08);
  border: 1.5px solid rgba(48, 209, 88, .22);
}
.diff-easy .card-glow { background: radial-gradient(circle at 0% 50%, rgba(48,209,88,.25), transparent 65%); }
.diff-easy .card-arrow { color: #30D158; }
@media (hover: hover) {
  .diff-easy:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(48,209,88,.18); border-color: rgba(48,209,88,.45); }
}

/* Medium — orange */
.diff-medium {
  background: rgba(255, 149, 0, .08);
  border: 1.5px solid rgba(255, 149, 0, .22);
}
.diff-medium .card-glow { background: radial-gradient(circle at 0% 50%, rgba(255,149,0,.25), transparent 65%); }
.diff-medium .card-arrow { color: #FF9500; }
@media (hover: hover) {
  .diff-medium:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(255,149,0,.18); border-color: rgba(255,149,0,.45); }
}

/* Hard — red */
.diff-hard {
  background: rgba(255, 69, 58, .08);
  border: 1.5px solid rgba(255, 69, 58, .22);
}
.diff-hard .card-glow { background: radial-gradient(circle at 0% 50%, rgba(255,69,58,.25), transparent 65%); }
.diff-hard .card-arrow { color: #FF453A; }
@media (hover: hover) {
  .diff-hard:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(255,69,58,.18); border-color: rgba(255,69,58,.45); }
}

.card-glow {
  position: absolute; inset: 0;
  pointer-events: none;
  border-radius: inherit;
}

.card-emoji { font-size: 36px; flex-shrink: 0; }

.card-text { flex: 1; }
.card-title { font-size: 18px; font-weight: 700; color: #F2F2F7; letter-spacing: -.02em; margin-bottom: 4px; }
.card-desc { font-size: 13px; color: #8E8E93; line-height: 1.4; }

.card-arrow { flex-shrink: 0; opacity: .7; }

@keyframes floatP { 0%, 100% { transform: translateY(0) scale(1); opacity: .4; } 50% { transform: translateY(-14px) scale(1.3); opacity: .9; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes cardIn { from { opacity: 0; transform: translateY(20px) scale(.97); } to { opacity: 1; transform: none; } }
</style>
