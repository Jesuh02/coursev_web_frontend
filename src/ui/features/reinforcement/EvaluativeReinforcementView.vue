<template>
  <div class="ev-root">
    <!-- Ambient particles -->
    <div class="particles" aria-hidden="true">
      <span v-for="p in particles" :key="p.id" class="particle" :style="p.style" />
    </div>

    <TopBar title="Refuerzo con IA" @back="$router.back()" />

    <div class="ev-body">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-mascot">🧠</div>
        <div class="hero-mascot-shadow" />
        <h1 class="hero-title">Centro de Refuerzo</h1>
        <p class="hero-sub">Practica con IA · Aprende más rápido</p>
      </div>

      <!-- Metric cards -->
      <div class="metrics-grid">
        <div v-for="(m, i) in metrics" :key="m.label" class="metric-card" :style="{ animationDelay: `${i * 80}ms` }">
          <div class="metric-icon">{{ m.icon }}</div>
          <span class="metric-value" :class="m.color">{{ m.value }}</span>
          <span class="metric-label">{{ m.label }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button class="cta-btn" @click="$router.push('/course-selection?mode=reinforcement')">
        <span class="cta-glow" />
        <span class="cta-icon">🚀</span>
        <span class="cta-text">Nueva Sesión</span>
        <svg class="cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <!-- History -->
      <div class="history-section">
        <div class="section-header">
          <span class="section-title">📋 Historial</span>
          <span v-if="results.length" class="section-badge">{{ results.length }}</span>
        </div>

        <!-- Skeleton -->
        <div v-if="loading" class="sk-list">
          <div v-for="n in 3" :key="n" class="sk-item" :style="{ animationDelay: `${n * 80}ms` }" />
        </div>

        <!-- Results -->
        <div v-else-if="results.length" class="results-list">
          <div
            v-for="(r, i) in results"
            :key="r.id"
            class="result-card"
            :style="{ animationDelay: `${i * 50}ms` }"
          >
            <div class="rc-top">
              <span class="rc-course">{{ r.courses?.title || 'Curso' }}</span>
              <span class="rc-date">{{ formatDate(r.created_at) }}</span>
            </div>

            <div v-if="r.topics?.name || r.tasks?.title" class="rc-tags">
              <span v-if="r.topics?.name" class="rc-tag">📚 {{ r.topics?.name }}</span>
              <span v-if="r.tasks?.title" class="rc-tag">📝 {{ r.tasks?.title }}</span>
            </div>

            <div class="rc-bottom">
              <span class="diff-chip" :class="diffClass(r.difficulty)">{{ diffLabel(r.difficulty) }}</span>
              <div class="rc-score">
                <span class="score-correct">✅ {{ r.correct_answers }}/{{ r.total_questions }}</span>
                <span class="score-grade" :class="r.grade >= 6 ? 'grade-pass' : 'grade-fail'">
                  {{ r.grade.toFixed(1) }}/10
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="empty-history">
          <div class="empty-icon">🏆</div>
          <p class="empty-text">Completa tu primera sesión</p>
          <p class="empty-sub">Tu progreso aparecerá aquí</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { reinforcementAdapter } from '@/infrastructure/api'

interface ReinforcementResult {
  id: number
  total_questions: number
  correct_answers: number
  incorrect_answers: number
  grade: number
  difficulty: string
  duration_seconds: number
  created_at: string
  courses?: { title?: string; thumbnail_uri?: string | null } | null
  topics?: { name?: string; subjects?: { name?: string } | null } | null
  tasks?: { title?: string } | null
}

const results = ref<ReinforcementResult[]>([])
const loading = ref(false)

const totalSessions = computed(() => results.value.length)
const totalCorrect  = computed(() => results.value.reduce((s, r) => s + (r.correct_answers ?? 0), 0))
const totalAnswered = computed(() => results.value.reduce((s, r) => s + (r.total_questions ?? 0), 0))

const avgGrade = computed(() => {
  if (!results.value.length) return '0.0'
  const sum = results.value.reduce((s, r) => s + (r.grade ?? 0), 0)
  return (sum / results.value.length).toFixed(1)
})

const accuracy = computed(() => {
  if (!totalAnswered.value) return '0%'
  return Math.round((totalCorrect.value / totalAnswered.value) * 100) + '%'
})

const metrics = computed(() => [
  { label: 'Sesiones',  value: String(totalSessions.value),   icon: '📚', color: 'c-purple' },
  { label: 'Promedio',  value: `${avgGrade.value}/10`,         icon: '🎯', color: 'c-cyan'   },
  { label: 'Correctas', value: String(totalCorrect.value),     icon: '✅', color: 'c-green'  },
  { label: 'Precisión', value: accuracy.value,                 icon: '📈', color: 'c-gold'   },
])

const DIFF_LABEL: Record<string, string> = {
  EASY: 'Fácil', MEDIUM: 'Medio', INTERMEDIATE: 'Medio', HARD: 'Difícil', FREE: 'Libre',
}
const DIFF_CLASS: Record<string, string> = {
  EASY: 'diff-easy', MEDIUM: 'diff-med', INTERMEDIATE: 'diff-med', HARD: 'diff-hard', FREE: 'diff-free',
}

function diffLabel(d: string) { return DIFF_LABEL[String(d).toUpperCase()] ?? d }
function diffClass(d: string) { return DIFF_CLASS[String(d).toUpperCase()] ?? 'diff-hard' }

function formatDate(value: string): string {
  if (!value) return ''
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value.slice(0, 10)
  const diff = Date.now() - parsed
  if (diff < 60_000)        return 'Ahora'
  if (diff < 3_600_000)     return `hace ${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000)    return `hace ${Math.floor(diff / 3_600_000)}h`
  if (diff < 604_800_000)   return `hace ${Math.floor(diff / 86_400_000)}d`
  return new Date(parsed).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

onMounted(async () => {
  loading.value = true
  try {
    const data = await reinforcementAdapter.getMyResults()
    results.value = Array.isArray(data) ? (data as unknown as ReinforcementResult[]) : []
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
})

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  style: {
    left:              `${Math.random() * 100}%`,
    top:               `${Math.random() * 100}%`,
    animationDelay:    `${(Math.random() * 6).toFixed(1)}s`,
    animationDuration: `${(3 + Math.random() * 5).toFixed(1)}s`,
    width:             `${Math.round(4 + Math.random() * 7)}px`,
    height:            `${Math.round(4 + Math.random() * 7)}px`,
    opacity:           `${(0.12 + Math.random() * 0.3).toFixed(2)}`,
  },
}))
</script>

<style scoped>
.ev-root {
  min-height: 100vh;
  background: radial-gradient(ellipse at 30% 0%, rgba(98,0,238,.18) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(0,212,255,.10) 0%, transparent 55%),
              #0A0A0F;
  position: relative;
  overflow-x: hidden;
}

/* Particles */
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: #8B5CF6;
  animation: floatP linear infinite;
}

/* Body */
.ev-body {
  position: relative;
  z-index: 1;
  padding: 16px 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 4px;
}
.hero-mascot {
  font-size: 68px;
  line-height: 1;
  filter: drop-shadow(0 0 22px rgba(139,92,246,.6));
  animation: bounce 2.6s ease-in-out infinite;
}
.hero-mascot-shadow {
  width: 44px; height: 10px;
  border-radius: 50%;
  background: rgba(139,92,246,.3);
  filter: blur(4px);
  animation: shadowP 2.6s ease-in-out infinite;
  margin-top: 2px;
}
.hero-title {
  font-size: 26px; font-weight: 900; color: #fff;
  letter-spacing: -.5px; text-align: center; margin: 0;
}
.hero-sub {
  font-size: 13px; color: #8E8E93; text-align: center; margin: 0; letter-spacing: .2px;
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.metric-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
  backdrop-filter: blur(8px);
}
.metric-icon { font-size: 24px; line-height: 1; }
.metric-value { font-size: 26px; font-weight: 900; line-height: 1.1; }
.metric-label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }

.c-purple { color: #8B5CF6; }
.c-cyan   { color: #00D4FF; }
.c-green  { color: #30D158; }
.c-gold   { color: #FFD700; }

/* CTA */
.cta-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, #6200EE, #8B5CF6);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s;
}
.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(98,0,238,.45);
}
.cta-btn:active { transform: scale(.97); }
.cta-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  pointer-events: none;
}
.cta-icon { font-size: 22px; }
.cta-text { flex: 1; text-align: left; }
.cta-arrow { flex-shrink: 0; opacity: .7; }

/* History */
.history-section {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 22px;
  padding: 20px;
  backdrop-filter: blur(8px);
}
.section-header { margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.section-title { font-size: 15px; font-weight: 700; color: #fff; }
.section-badge {
  font-size: 11px; font-weight: 700; color: #8B5CF6;
  background: rgba(139,92,246,.15); border: 1px solid rgba(139,92,246,.3);
  padding: 1px 7px; border-radius: 20px;
}

/* Skeleton */
.sk-list { display: flex; flex-direction: column; gap: 10px; }
.sk-item {
  height: 82px; border-radius: 16px;
  background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Result cards */
.results-list { display: flex; flex-direction: column; gap: 10px; }
.result-card {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
}
.rc-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.rc-course { font-size: 14px; font-weight: 700; color: #fff; flex: 1; line-height: 1.3; }
.rc-date   { font-size: 11px; color: #555; white-space: nowrap; padding-top: 1px; }

.rc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.rc-tag  {
  font-size: 11px; color: #888;
  background: rgba(255,255,255,.05);
  border-radius: 8px; padding: 2px 8px;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.rc-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.diff-chip {
  font-size: 11px; font-weight: 700; border-radius: 8px;
  padding: 3px 10px; letter-spacing: .3px;
}
.diff-easy { background: rgba(48,209,88,.15);  color: #30D158; border: 1px solid rgba(48,209,88,.25); }
.diff-med  { background: rgba(255,214,10,.12); color: #FFD60A; border: 1px solid rgba(255,214,10,.25); }
.diff-hard { background: rgba(255,69,58,.12);  color: #FF453A; border: 1px solid rgba(255,69,58,.25); }
.diff-free { background: rgba(0,212,255,.12);  color: #00D4FF; border: 1px solid rgba(0,212,255,.25); }

.rc-score  { display: flex; align-items: center; gap: 10px; }
.score-correct { font-size: 12px; color: #555; }
.score-grade   { font-size: 16px; font-weight: 900; }
.grade-pass    { color: #30D158; }
.grade-fail    { color: #FF453A; }

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0 6px;
  text-align: center;
}
.empty-icon { font-size: 40px; opacity: .5; animation: pulse 2.4s ease-in-out infinite; }
.empty-text { font-size: 14px; font-weight: 600; color: #555; margin: 0; }
.empty-sub  { font-size: 12px; color: #444; margin: 0; }

/* Keyframes */
@keyframes floatP {
  0%   { transform: translateY(0) rotate(0); }
  50%  { transform: translateY(-28px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  45%, 55%  { transform: translateY(-13px) scale(1.05); }
}
@keyframes shadowP {
  0%, 100% { transform: scale(1);    opacity: .5; }
  50%       { transform: scale(.65); opacity: .2; }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px) scale(.95); }
  to   { opacity: 1; transform: none; }
}
@keyframes pulse {
  0%, 100% { opacity: .5; }
  50%       { opacity: .8; }
}
</style>
