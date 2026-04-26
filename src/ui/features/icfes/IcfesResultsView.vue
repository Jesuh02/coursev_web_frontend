<template>
  <div class="res-root">
    <div class="particles" aria-hidden="true">
      <span v-for="p in particles" :key="p.id" class="particle" :style="p.style" />
    </div>

    <!-- Empty / fallback -->
    <div v-if="!result" class="screen">
      <span class="big-emoji">🤔</span>
      <h2>No hay resultados para mostrar</h2>
      <button class="btn-primary" @click="$router.replace({ name: 'icfesHome' })">Ir al inicio ICFES</button>
    </div>

    <template v-else>
      <!-- Confetti only if passed -->
      <div v-if="result.grade >= 7" class="confetti" aria-hidden="true">
        <span
          v-for="c in confetti"
          :key="c.id"
          class="confetti-piece"
          :style="c.style"
        />
      </div>

      <TopBar :title="areaInfo?.name ?? 'Resultados'" @back="goHome" />

      <div class="res-body">
        <!-- Hero grade -->
        <section class="grade-hero" :class="gradeClass">
          <div class="grade-ring" :style="ringStyle">
            <div class="grade-inner">
              <span class="grade-num">{{ result.grade.toFixed(1) }}</span>
              <span class="grade-denom">/ 10</span>
            </div>
          </div>
          <h1 class="grade-title">{{ gradeTitle }}</h1>
          <p class="grade-sub">{{ gradeMessage }}</p>
        </section>

        <!-- Stats -->
        <section class="stats">
          <div class="stat stat-ok">
            <span class="stat-ic">✅</span>
            <span class="stat-val">{{ result.correct }}</span>
            <span class="stat-lbl">Correctas</span>
          </div>
          <div class="stat stat-err">
            <span class="stat-ic">❌</span>
            <span class="stat-val">{{ result.incorrect }}</span>
            <span class="stat-lbl">Erradas</span>
          </div>
          <div class="stat stat-skip">
            <span class="stat-ic">⭕</span>
            <span class="stat-val">{{ result.unanswered }}</span>
            <span class="stat-lbl">En blanco</span>
          </div>
          <div class="stat stat-time">
            <span class="stat-ic">⏱</span>
            <span class="stat-val">{{ formatDuration(result.durationSeconds) }}</span>
            <span class="stat-lbl">Tiempo</span>
          </div>
        </section>

        <!-- Breakdown -->
        <section class="block">
          <h2 class="block-title">Desempeño por subtema</h2>
          <div class="break-list">
            <div
              v-for="(b, i) in result.breakdown"
              :key="b.subtopic"
              class="break-item"
              :class="`st-${b.status}`"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <div class="bi-head">
                <span class="bi-name">{{ b.subtopic }}</span>
                <span class="bi-score">{{ b.correct }}/{{ b.total }}</span>
              </div>
              <div class="bi-bar">
                <div
                  class="bi-bar-fill"
                  :style="{ width: `${Math.round(b.accuracy * 100)}%` }"
                />
              </div>
              <div class="bi-foot">
                <span class="bi-chip" :class="`c-${b.status}`">
                  {{ statusLabel(b.status) }}
                </span>
                <span class="bi-pct">{{ Math.round(b.accuracy * 100) }}% acierto</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Recomendaciones -->
        <section v-if="result.recommendations.length" class="block">
          <h2 class="block-title">💡 Recomendaciones</h2>
          <ul class="recs">
            <li v-for="(r, i) in result.recommendations" :key="i">{{ r }}</li>
          </ul>
        </section>

        <!-- Revisión de respuestas -->
        <section v-if="result.questions && result.questions.length" class="block">
          <h2 class="block-title">📝 Revisión de respuestas</h2>
          <div class="review-list">
            <article
              v-for="(q, i) in result.questions"
              :key="q.questionId"
              class="rev-item"
              :class="{
                'rev-ok': q.isCorrect,
                'rev-err': !q.isCorrect && q.selected,
                'rev-skip': !q.selected,
              }"
            >
              <header class="rev-head">
                <span class="rev-num">#{{ i + 1 }}</span>
                <span class="rev-status">
                  <template v-if="q.isCorrect">✅ Correcta</template>
                  <template v-else-if="q.selected">❌ Incorrecta</template>
                  <template v-else>⭕ En blanco</template>
                </span>
                <span class="rev-sub">{{ q.subtopic }}</span>
              </header>
              <p class="rev-stem">{{ q.stem }}</p>
              <ul class="rev-opts">
                <li
                  v-for="opt in q.options"
                  :key="opt.id"
                  class="rev-opt"
                  :class="{
                    'opt-correct': opt.isCorrect,
                    'opt-selected-wrong': q.selected === opt.id && !opt.isCorrect,
                  }"
                >
                  <span class="rev-opt-bullet">{{ opt.id }}</span>
                  <span class="rev-opt-text">{{ opt.text }}</span>
                  <span v-if="opt.isCorrect" class="rev-tag tag-ok">Respuesta correcta</span>
                  <span v-else-if="q.selected === opt.id" class="rev-tag tag-err">Tu respuesta</span>
                </li>
              </ul>
              <div v-if="q.explanation" class="rev-expl">
                <span class="rev-expl-label">💡 Explicación</span>
                <p>{{ q.explanation }}</p>
              </div>
            </article>
          </div>
        </section>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-secondary" @click="goHome">Volver al inicio</button>
          <button class="btn-primary" @click="retry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Nueva sesión
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { findArea, type IcfesSubtopicBreakdown } from '@/infrastructure/api/icfesAdapter'
import { lastIcfesResult } from './icfesState'

const router = useRouter()
const result = computed(() => lastIcfesResult.value)
const areaInfo = computed(() => result.value ? findArea(result.value.area) : null)

const gradeClass = computed(() => {
  if (!result.value) return ''
  if (result.value.grade >= 8) return 'g-excellent'
  if (result.value.grade >= 6) return 'g-good'
  if (result.value.grade >= 4) return 'g-regular'
  return 'g-low'
})

const gradeTitle = computed(() => {
  if (!result.value) return ''
  const g = result.value.grade
  if (g >= 9) return '¡Nivel excelente! 🏆'
  if (g >= 7) return '¡Muy bien hecho! 🎉'
  if (g >= 5) return 'Buen intento 💪'
  return 'Sigue practicando 📚'
})
const gradeMessage = computed(() => {
  if (!result.value) return ''
  const pct = Math.round((result.value.correct / result.value.total) * 100)
  return `Acertaste el ${pct}% de las preguntas`
})

const ringStyle = computed(() => {
  if (!result.value) return {}
  const pct = (result.value.grade / 10) * 100
  const color = result.value.grade >= 6 ? '#30D158' : '#FFD60A'
  return {
    background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,.08) 0)`,
  }
})

function statusLabel(s: IcfesSubtopicBreakdown['status']) {
  return s === 'strength' ? 'Dominado' : s === 'risk' ? 'En riesgo' : 'Falencia'
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function goHome() { router.replace({ name: 'icfesHome' }) }
function retry() {
  if (!result.value) { goHome(); return }
  router.replace({ name: 'icfesExam', params: { area: result.value.area } })
}

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${(Math.random() * 6).toFixed(1)}s`,
    animationDuration: `${(4 + Math.random() * 5).toFixed(1)}s`,
    width: `${Math.round(4 + Math.random() * 6)}px`,
    height: `${Math.round(4 + Math.random() * 6)}px`,
    opacity: `${(0.12 + Math.random() * 0.25).toFixed(2)}`,
  },
}))

const confetti = Array.from({ length: 50 }, (_, i) => {
  const colors = ['#8B5CF6', '#00D4FF', '#30D158', '#FFD60A', '#EC4899']
  return {
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${-10 - Math.random() * 40}%`,
      background: colors[i % colors.length],
      animationDelay: `${(Math.random() * 3).toFixed(1)}s`,
      animationDuration: `${(2.5 + Math.random() * 2.5).toFixed(1)}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
    },
  }
})
</script>

<style scoped>
.res-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(98,0,238,.25) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(0,212,255,.12) 0%, transparent 55%),
    #0A0A0F;
  color: #fff;
  position: relative;
  overflow-x: hidden;
}
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: #8B5CF6;
  animation: floatP linear infinite;
}

.screen {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; padding: 24px; text-align: center;
}
.big-emoji { font-size: 60px; }

.res-body {
  position: relative; z-index: 1;
  max-width: 560px; margin: 0 auto;
  padding: 10px 16px 90px;
  display: flex; flex-direction: column; gap: 20px;
}

/* Grade hero */
.grade-hero {
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 12px 0;
  animation: popIn .5s cubic-bezier(.34,1.56,.64,1);
}
.grade-ring {
  width: 160px; height: 160px;
  border-radius: 50%;
  display: grid; place-items: center;
  position: relative;
  filter: drop-shadow(0 10px 30px rgba(48,209,88,.25));
}
.grade-hero.g-low .grade-ring,
.grade-hero.g-regular .grade-ring {
  filter: drop-shadow(0 10px 30px rgba(255,214,10,.2));
}
.grade-inner {
  width: 85%; height: 85%;
  border-radius: 50%;
  background: #15151D;
  display: grid; place-items: center;
  flex-direction: column;
}
.grade-num {
  display: block;
  font-size: 52px; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg, #fff, #C084FC);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
}
.grade-denom {
  display: block; text-align: center;
  font-size: 13px; font-weight: 700; color: #6B7280; margin-top: 2px;
}
.grade-title {
  font-size: 22px; font-weight: 900; margin: 0;
}
.grade-sub {
  font-size: 13px; color: #9CA3AF; margin: 0;
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.stat {
  display: flex; flex-direction: column; align-items: center;
  gap: 2px;
  padding: 12px 6px;
  border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
}
.stat-ic  { font-size: 18px; }
.stat-val { font-size: 18px; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; }
.stat-lbl { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: .4px; font-weight: 700; }
.stat-ok .stat-val   { color: #30D158; }
.stat-err .stat-val  { color: #FF453A; }
.stat-skip .stat-val { color: #FFD60A; }
.stat-time .stat-val { color: #00D4FF; font-size: 15px; }

/* Blocks */
.block {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 18px;
  padding: 16px;
  backdrop-filter: blur(8px);
}
.block-title {
  font-size: 14px; font-weight: 800; margin: 0 0 12px;
  color: #fff;
}

/* Breakdown */
.break-list { display: flex; flex-direction: column; gap: 10px; }
.break-item {
  padding: 12px 14px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
}
.bi-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 6px;
}
.bi-name  { font-size: 13px; font-weight: 700; color: #fff; }
.bi-score { font-size: 12px; color: #9CA3AF; font-variant-numeric: tabular-nums; }

.bi-bar {
  height: 6px; border-radius: 999px;
  background: rgba(255,255,255,.06);
  overflow: hidden;
  margin-bottom: 8px;
}
.bi-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .6s cubic-bezier(.34,1.2,.64,1);
}
.st-strength .bi-bar-fill { background: linear-gradient(90deg,#30D158,#10B981); }
.st-risk     .bi-bar-fill { background: linear-gradient(90deg,#FFD60A,#F59E0B); }
.st-gap      .bi-bar-fill { background: linear-gradient(90deg,#FF453A,#DC2626); }

.bi-foot {
  display: flex; justify-content: space-between; align-items: center;
}
.bi-chip {
  font-size: 10px; font-weight: 800; letter-spacing: .3px;
  padding: 3px 9px; border-radius: 999px;
  text-transform: uppercase;
}
.c-strength { background: rgba(48,209,88,.15);  color: #30D158; border: 1px solid rgba(48,209,88,.25); }
.c-risk     { background: rgba(255,214,10,.12); color: #FFD60A; border: 1px solid rgba(255,214,10,.25); }
.c-gap      { background: rgba(255,69,58,.12);  color: #FF453A; border: 1px solid rgba(255,69,58,.25); }
.bi-pct     { font-size: 11px; color: #9CA3AF; }

/* Recs */
.recs {
  list-style: none;
  margin: 0; padding: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.recs li {
  font-size: 13px; line-height: 1.5; color: #E5E7EB;
  padding: 10px 12px 10px 32px;
  background: rgba(139,92,246,.06);
  border: 1px solid rgba(139,92,246,.15);
  border-radius: 12px;
  position: relative;
}
.recs li::before {
  content: '✦';
  position: absolute;
  left: 12px; top: 10px;
  color: #C084FC;
}

/* Review */
.review-list { display: flex; flex-direction: column; gap: 14px; }
.rev-item {
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.07);
  border-left: 4px solid rgba(255,255,255,.18);
  border-radius: 14px;
  padding: 14px 14px 12px;
}
.rev-item.rev-ok   { border-left-color: #30D158; }
.rev-item.rev-err  { border-left-color: #FF453A; }
.rev-item.rev-skip { border-left-color: #FFD60A; }
.rev-head {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 8px;
}
.rev-num    { font-size: 12px; font-weight: 900; color: #9CA3AF; }
.rev-status { font-size: 12px; font-weight: 800; }
.rev-ok    .rev-status { color: #30D158; }
.rev-err   .rev-status { color: #FF453A; }
.rev-skip  .rev-status { color: #FFD60A; }
.rev-sub {
  margin-left: auto;
  font-size: 11px; font-weight: 700; color: #C084FC;
  background: rgba(192,132,252,.1);
  border: 1px solid rgba(192,132,252,.25);
  padding: 3px 8px; border-radius: 999px;
}
.rev-stem {
  margin: 0 0 10px;
  font-size: 13.5px; line-height: 1.5; color: #E5E7EB;
}
.rev-opts {
  list-style: none; margin: 0 0 10px; padding: 0;
  display: flex; flex-direction: column; gap: 6px;
}
.rev-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px;
  font-size: 12.5px; color: #D1D5DB;
}
.rev-opt.opt-correct {
  background: rgba(48,209,88,.1);
  border-color: rgba(48,209,88,.4);
  color: #fff;
}
.rev-opt.opt-selected-wrong {
  background: rgba(255,69,58,.08);
  border-color: rgba(255,69,58,.4);
}
.rev-opt-bullet {
  width: 24px; height: 24px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 8px;
  background: rgba(255,255,255,.06);
  font-weight: 900; font-size: 12px;
}
.opt-correct .rev-opt-bullet {
  background: linear-gradient(135deg,#30D158,#10B981); color: #fff;
}
.opt-selected-wrong .rev-opt-bullet {
  background: rgba(255,69,58,.25); color: #FF6B60;
}
.rev-opt-text { flex: 1; line-height: 1.4; }
.rev-tag {
  font-size: 10px; font-weight: 800; letter-spacing: .3px;
  padding: 3px 8px; border-radius: 999px;
  white-space: nowrap;
}
.tag-ok  { background: rgba(48,209,88,.18);  color: #30D158; }
.tag-err { background: rgba(255,69,58,.18);  color: #FF6B60; }
.rev-expl {
  margin-top: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(139,92,246,.1), rgba(0,212,255,.06));
  border: 1px solid rgba(139,92,246,.25);
  border-radius: 10px;
}
.rev-expl-label {
  display: block;
  font-size: 11px; font-weight: 800; letter-spacing: .4px;
  color: #C084FC; margin-bottom: 4px;
}
.rev-expl p {
  margin: 0;
  font-size: 12.5px; line-height: 1.55; color: #E5E7EB;
}

/* Actions */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.btn-primary, .btn-secondary {
  padding: 14px; font-size: 14px; font-weight: 800;
  border-radius: 14px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .18s, box-shadow .22s;
}
.btn-primary {
  background: linear-gradient(135deg,#8B5CF6,#6366F1);
  color: #fff; border: none;
  box-shadow: 0 8px 22px rgba(139,92,246,.35);
}
.btn-primary:hover   { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(139,92,246,.5); }
.btn-primary:active  { transform: scale(.97); }
.btn-secondary {
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1); color: #fff;
}
.btn-secondary:hover  { background: rgba(255,255,255,.12); }
.btn-secondary:active { transform: scale(.97); }

/* Confetti */
.confetti {
  position: fixed; inset: 0; pointer-events: none; z-index: 5;
  overflow: hidden;
}
.confetti-piece {
  position: absolute;
  width: 8px; height: 14px;
  border-radius: 2px;
  animation: confettiFall linear forwards;
}

/* Keyframes */
@keyframes floatP {
  0%   { transform: translateY(0) rotate(0); }
  50%  { transform: translateY(-28px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(.8); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
@keyframes confettiFall {
  0%   { transform: translateY(-20vh) rotate(0); opacity: 1; }
  100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
}
</style>
