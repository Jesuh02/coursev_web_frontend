<template>
  <div class="exam-root">
    <!-- ░░ Loader ░░ -->
    <Transition name="fade">
      <div v-if="phase === 'loading'" key="loading" class="screen loader">
        <div class="ai-spinner">
          <span class="ring r1" />
          <span class="ring r2" />
          <span class="ring r3" />
          <span class="ring-core">{{ area?.icon }}</span>
        </div>
        <h2 class="loader-title">Preparando tu simulacro…</h2>
        <p class="loader-sub">Seleccionando 20 preguntas de <b>{{ area?.name }}</b></p>
        <div class="loader-dots">
          <span /><span /><span />
        </div>
      </div>
    </Transition>

    <!-- ░░ Error ░░ -->
    <div v-if="phase === 'error'" class="screen error">
      <span class="err-ic">⚠️</span>
      <h2>No se pudo cargar el simulacro</h2>
      <button class="btn-ghost" @click="loadSession">Reintentar</button>
      <button class="btn-ghost" @click="goHome">Volver</button>
    </div>

    <!-- ░░ Running ░░ -->
    <template v-if="phase === 'running' && session">
      <!-- Top bar con progreso -->
      <header class="exam-head">
        <button class="icon-btn" @click="onAttemptExit" aria-label="Salir">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        <div class="eh-center">
          <div class="eh-top">
            <span class="eh-area" :style="{ color: area?.gradient[1] }">{{ area?.short }}</span>
            <span class="eh-count">{{ currentIndex + 1 }} / {{ session.questions.length }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct + '%' }" />
          </div>
        </div>

        <div class="timer" :class="{ urgent: secondsLeft <= 30 }">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>
          {{ mmss }}
        </div>
      </header>

      <!-- Cuerpo -->
      <main class="exam-body">
        <Transition :name="slideDir" mode="out-in">
          <div :key="current.id" class="q-card">
            <!-- Meta -->
            <div class="q-meta">
              <span class="q-chip">{{ current.subtopic }}</span>
              <span class="q-diff" :class="diffClass(current.difficulty)">
                {{ '●'.repeat(current.difficulty) }}<span class="dim">{{ '●'.repeat(5 - current.difficulty) }}</span>
              </span>
            </div>

            <!-- Enunciado -->
            <p class="q-stem">{{ current.stem }}</p>

            <!-- Imagen del enunciado -->
            <img
              v-for="img in stemImages(current)"
              :key="img.id"
              :src="img.url"
              :alt="img.alt || 'Figura de la pregunta'"
              class="q-stem-img"
              loading="eager"
            />

            <!-- Opciones -->
            <div class="options">
              <button
                v-for="opt in current.options"
                :key="opt.id"
                class="option"
                :class="{
                  selected: selected === opt.id,
                  'is-correct': revealed && current.correct === opt.id,
                  'is-wrong': revealed && selected === opt.id && current.correct !== opt.id,
                  'is-locked': revealed && selected !== opt.id && current.correct !== opt.id,
                }"
                :disabled="revealed"
                @click="selectOption(opt.id)"
              >
                <span class="opt-bullet">{{ opt.id }}</span>
                <span class="opt-text">{{ opt.text }}</span>
                <img
                  v-if="optionImage(current, opt.id)"
                  :src="getOptImgUrl(current, opt.id)"
                  :alt="getOptImgAlt(current, opt.id)"
                  class="opt-img"
                />
                <span class="opt-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
              </button>
            </div>

            <!-- Feedback inmediato -->
            <Transition name="fb">
              <div
                v-if="revealed"
                class="feedback"
                :class="isAnswerCorrect ? 'fb-ok' : 'fb-err'"
              >
                <div class="fb-head">
                  <span class="fb-ic">{{ isAnswerCorrect ? '✅' : '❌' }}</span>
                  <span class="fb-title">
                    {{ isAnswerCorrect ? '¡Respuesta correcta!' : 'Respuesta incorrecta' }}
                  </span>
                  <span v-if="!isAnswerCorrect && current.correct" class="fb-pill">
                    Correcta: <b>{{ current.correct }}</b>
                  </span>
                </div>
                <p v-if="current.explanation" class="fb-text">{{ current.explanation }}</p>
                <p v-else class="fb-text fb-muted">
                  No hay explicación disponible para esta pregunta.
                </p>
              </div>
            </Transition>
          </div>
        </Transition>
      </main>

      <!-- Footer nav -->
      <footer class="exam-foot">
        <div class="dots">
          <span
            v-for="(q, i) in session.questions"
            :key="q.id"
            class="dot"
            :class="{
              active: i === currentIndex,
              done: answers[i]?.selected != null,
            }"
          />
        </div>

        <div class="foot-actions">
          <button class="nav-btn" :disabled="currentIndex === 0" @click="prev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Anterior
          </button>

          <button
            v-if="currentIndex < session.questions.length - 1"
            class="nav-btn primary"
            :disabled="!selected"
            @click="next"
          >
            Siguiente
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button
            v-else
            class="nav-btn finish"
            :disabled="submitting"
            @click="finish"
          >
            <span v-if="!submitting">Finalizar</span>
            <span v-else class="dot-loader"><span/><span/><span/></span>
          </button>
        </div>
      </footer>
    </template>

    <!-- Exit confirm -->
    <Transition name="fade">
      <div v-if="showExit" class="modal-overlay" @click.self="showExit = false">
        <div class="modal">
          <h3>¿Salir del simulacro?</h3>
          <p>Perderás tu avance actual.</p>
          <div class="modal-actions">
            <button class="btn-ghost" @click="showExit = false">Continuar</button>
            <button class="btn-danger" @click="exitNow">Salir</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  icfesAdapter,
  findArea,
  type IcfesAnswer,
  type IcfesArea,
  type IcfesQuestion,
  type IcfesSession,
} from '@/infrastructure/api/icfesAdapter'
import { lastIcfesResult } from './icfesState'

const route = useRoute()
const router = useRouter()

const areaCode = (route.params.area as string)?.toUpperCase() as IcfesArea
const area = computed(() => findArea(areaCode))

const phase = ref<'loading' | 'running' | 'error'>('loading')
const session = ref<IcfesSession | null>(null)
const answers = ref<IcfesAnswer[]>([])
const revealedFlags = ref<boolean[]>([])
const currentIndex = ref(0)
const slideDir = ref<'slide-l' | 'slide-r'>('slide-l')
const showExit = ref(false)
const submitting = ref(false)

const current = computed<IcfesQuestion>(() => session.value!.questions[currentIndex.value])
const selected = computed(() => answers.value[currentIndex.value]?.selected ?? null)
const revealed = computed(() => !!revealedFlags.value[currentIndex.value])
const isAnswerCorrect = computed(() =>
  !!selected.value && !!current.value?.correct && selected.value === current.value.correct,
)
const progressPct = computed(() => {
  if (!session.value) return 0
  return ((currentIndex.value + (selected.value ? 1 : 0)) / session.value.questions.length) * 100
})

// Timer
const secondsLeft = ref(0)
let timerId: number | null = null
const mmss = computed(() => {
  const s = Math.max(0, secondsLeft.value)
  const m = Math.floor(s / 60)
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
})

// Per-question timing
let qStart = Date.now()

function stemImages(q: IcfesQuestion) {
  return (q.images || []).filter(i => i.position === 'stem')
}
function optionImage(q: IcfesQuestion, id: 'A'|'B'|'C'|'D') {
  return (q.images || []).find(i => i.position === `option_${id.toLowerCase()}`)
}
function getOptImgUrl(q: IcfesQuestion, id: 'A'|'B'|'C'|'D'): string {
  return optionImage(q, id)?.url ?? ''
}
function getOptImgAlt(q: IcfesQuestion, id: 'A'|'B'|'C'|'D'): string {
  return optionImage(q, id)?.alt ?? `Opción ${id}`
}

function selectOption(id: 'A'|'B'|'C'|'D') {
  // Una vez revelada, no permitir cambiar
  if (revealedFlags.value[currentIndex.value]) return
  const now = Date.now()
  const row = answers.value[currentIndex.value] ?? { questionId: current.value.id, selected: null, timeMs: 0 }
  row.selected = id
  row.timeMs += now - qStart
  qStart = now
  answers.value[currentIndex.value] = row
  revealedFlags.value[currentIndex.value] = true
}

function next() {
  if (!selected.value) return
  slideDir.value = 'slide-l'
  if (currentIndex.value < session.value!.questions.length - 1) {
    currentIndex.value++
    qStart = Date.now()
  }
}
function prev() {
  if (currentIndex.value === 0) return
  slideDir.value = 'slide-r'
  currentIndex.value--
  qStart = Date.now()
}

function diffClass(d: number) {
  if (d <= 2) return 'd-easy'
  if (d === 3) return 'd-med'
  return 'd-hard'
}

async function loadSession() {
  phase.value = 'loading'
  try {
    const s = await icfesAdapter.startSession(areaCode)
    session.value = s
    answers.value = s.questions.map(q => ({ questionId: q.id, selected: null, timeMs: 0 }))
    revealedFlags.value = s.questions.map(() => false)
    secondsLeft.value = s.durationSeconds
    phase.value = 'running'
    qStart = Date.now()
    startTimer()
  } catch {
    phase.value = 'error'
  }
}

function startTimer() {
  if (timerId != null) window.clearInterval(timerId)
  timerId = window.setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      secondsLeft.value = 0
      finish()
    }
  }, 1000)
}

async function finish() {
  if (!session.value || submitting.value) return
  submitting.value = true
  if (timerId != null) window.clearInterval(timerId)
  // Guardar el tiempo restante en la última pregunta
  const row = answers.value[currentIndex.value]
  if (row) row.timeMs += Date.now() - qStart
  try {
    const result = await icfesAdapter.submitSession(session.value, answers.value)
    lastIcfesResult.value = result
    router.replace({ name: 'icfesResults' })
  } catch {
    submitting.value = false
    phase.value = 'error'
  }
}

function onAttemptExit() { showExit.value = true }
function goHome() {
  if (timerId != null) window.clearInterval(timerId)
  router.replace({ name: 'icfesHome' })
}
function exitNow() {
  showExit.value = false
  goHome()
}

onMounted(loadSession)
onBeforeUnmount(() => { if (timerId != null) window.clearInterval(timerId) })
</script>

<style scoped>
.exam-root {
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(98,0,238,.22) 0%, transparent 60%),
    #0A0A0F;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Loader */
.screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
  text-align: center;
}
.loader-title { margin: 8px 0 0; font-size: 20px; font-weight: 800; }
.loader-sub   { margin: 0; font-size: 13px; color: #9CA3AF; }
.loader-dots { display: flex; gap: 6px; margin-top: 8px; }
.loader-dots span {
  width: 8px; height: 8px; border-radius: 50%;
  background: #8B5CF6; animation: bounceDot 1.1s ease-in-out infinite;
}
.loader-dots span:nth-child(2) { animation-delay: .15s; }
.loader-dots span:nth-child(3) { animation-delay: .3s; }

.ai-spinner {
  position: relative;
  width: 100px; height: 100px;
  display: grid; place-items: center;
}
.ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #8B5CF6;
  animation: spin 1.4s linear infinite;
}
.ring.r2 { inset: 10px; border-top-color: #00D4FF; animation-duration: 1.8s; animation-direction: reverse; }
.ring.r3 { inset: 20px; border-top-color: #EC4899; animation-duration: 2.2s; }
.ring-core { font-size: 28px; z-index: 1; filter: drop-shadow(0 0 10px rgba(139,92,246,.6)); }

/* Error */
.err-ic { font-size: 48px; }
.btn-ghost {
  padding: 10px 18px; font-size: 14px; font-weight: 700; color: #fff;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 12px; cursor: pointer;
}
.btn-ghost:hover { background: rgba(255,255,255,.12); }
.btn-danger {
  padding: 10px 18px; font-size: 14px; font-weight: 800; color: #fff;
  background: linear-gradient(135deg,#EF4444,#DC2626); border: none;
  border-radius: 12px; cursor: pointer;
}

/* Head */
.exam-head {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  background: rgba(10,10,15,.75);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255,255,255,.06);
}
.icon-btn {
  width: 36px; height: 36px; border-radius: 10px;
  display: grid; place-items: center;
  background: rgba(255,255,255,.06); color: #fff;
  border: 1px solid rgba(255,255,255,.06);
  cursor: pointer; transition: background .2s;
}
.icon-btn:hover { background: rgba(255,255,255,.12); }
.eh-center { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.eh-top { display: flex; justify-content: space-between; font-size: 12px; }
.eh-area  { font-weight: 800; letter-spacing: .3px; }
.eh-count { color: #9CA3AF; font-variant-numeric: tabular-nums; }
.progress-track {
  height: 4px; border-radius: 999px;
  background: rgba(255,255,255,.08);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B5CF6, #00D4FF);
  transition: width .4s cubic-bezier(.34,1.2,.64,1);
  box-shadow: 0 0 10px rgba(139,92,246,.5);
}
.timer {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px;
  font-size: 13px; font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 999px;
  transition: all .3s;
}
.timer.urgent {
  color: #FF453A;
  background: rgba(255,69,58,.14);
  border-color: rgba(255,69,58,.35);
  animation: pulseRed 1s ease-in-out infinite;
}

/* Body */
.exam-body {
  flex: 1;
  padding: 18px 16px 32px;
  max-width: 620px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.q-card {
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  padding: 18px 16px 16px;
  backdrop-filter: blur(10px);
}
.q-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px; gap: 10px;
}
.q-chip {
  font-size: 11px; font-weight: 700;
  color: #C084FC; letter-spacing: .3px;
  background: rgba(192,132,252,.12);
  border: 1px solid rgba(192,132,252,.25);
  padding: 4px 10px; border-radius: 999px;
}
.q-diff  { font-size: 12px; letter-spacing: 2px; font-weight: 900; }
.q-diff.d-easy { color: #30D158; }
.q-diff.d-med  { color: #FFD60A; }
.q-diff.d-hard { color: #FF453A; }
.q-diff .dim   { color: rgba(255,255,255,.15); }

.q-stem {
  font-size: 16px; line-height: 1.55; color: #fff;
  margin: 4px 0 14px; font-weight: 500;
}
.q-stem-img {
  display: block; max-width: 100%; height: auto;
  margin: 0 0 14px; border-radius: 12px;
  border: 1px solid rgba(255,255,255,.08);
}

/* Options */
.options { display: flex; flex-direction: column; gap: 10px; }
.option {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  text-align: left;
  padding: 14px 16px;
  background: rgba(255,255,255,.04);
  border: 1.5px solid rgba(255,255,255,.08);
  border-radius: 14px;
  color: #E5E7EB;
  cursor: pointer;
  overflow: hidden;
  transition: transform .15s, background .2s, border-color .2s;
}
.option:hover {
  background: rgba(255,255,255,.07);
  border-color: rgba(139,92,246,.35);
}
.option:active { transform: scale(.99); }
.option.selected {
  background: linear-gradient(135deg, rgba(139,92,246,.18), rgba(0,212,255,.1));
  border-color: #8B5CF6;
  color: #fff;
  box-shadow: 0 0 0 3px rgba(139,92,246,.12);
}
.option:disabled { cursor: default; }
.option.is-correct {
  background: linear-gradient(135deg, rgba(48,209,88,.22), rgba(16,185,129,.12));
  border-color: #30D158;
  color: #fff;
  box-shadow: 0 0 0 3px rgba(48,209,88,.18);
}
.option.is-correct .opt-bullet {
  background: linear-gradient(135deg,#30D158,#10B981);
  color: #fff;
  box-shadow: 0 4px 14px rgba(48,209,88,.5);
}
.option.is-correct .opt-check { opacity: 1; transform: scale(1); }
.option.is-wrong {
  background: linear-gradient(135deg, rgba(255,69,58,.22), rgba(220,38,38,.12));
  border-color: #FF453A;
  color: #fff;
  box-shadow: 0 0 0 3px rgba(255,69,58,.18);
}
.option.is-wrong .opt-bullet {
  background: linear-gradient(135deg,#FF453A,#DC2626);
  color: #fff;
}
.option.is-wrong .opt-check {
  opacity: 1;
  transform: scale(1);
  background: linear-gradient(135deg,#FF453A,#DC2626);
}
.option.is-locked { opacity: .55; }
.opt-bullet {
  width: 32px; height: 32px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 10px;
  background: rgba(255,255,255,.06);
  font-weight: 900; font-size: 14px;
  transition: all .2s;
}
.option.selected .opt-bullet {
  background: linear-gradient(135deg,#8B5CF6,#00D4FF);
  color: #fff;
  box-shadow: 0 4px 14px rgba(139,92,246,.5);
}
.opt-text { flex: 1; font-size: 14px; line-height: 1.45; }
.opt-img  { max-width: 72px; height: auto; border-radius: 8px; }
.opt-check {
  flex-shrink: 0;
  width: 22px; height: 22px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg,#30D158,#10B981);
  opacity: 0;
  transform: scale(.5);
  transition: all .25s cubic-bezier(.34,1.56,.64,1);
}
.option.selected .opt-check { opacity: 1; transform: scale(1); }

/* Feedback inmediato */
.feedback {
  margin-top: 14px;
  padding: 14px 14px 12px;
  border-radius: 14px;
  border: 1.5px solid;
}
.feedback.fb-ok {
  background: linear-gradient(135deg, rgba(48,209,88,.14), rgba(16,185,129,.06));
  border-color: rgba(48,209,88,.4);
}
.feedback.fb-err {
  background: linear-gradient(135deg, rgba(255,69,58,.14), rgba(220,38,38,.06));
  border-color: rgba(255,69,58,.4);
}
.fb-head {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 6px;
}
.fb-ic { font-size: 18px; }
.fb-title {
  font-size: 14px; font-weight: 800;
}
.fb-ok  .fb-title { color: #30D158; }
.fb-err .fb-title { color: #FF6B60; }
.fb-pill {
  margin-left: auto;
  font-size: 11px; font-weight: 700; letter-spacing: .3px;
  color: #30D158;
  background: rgba(48,209,88,.14);
  border: 1px solid rgba(48,209,88,.3);
  padding: 4px 10px; border-radius: 999px;
}
.fb-pill b { font-weight: 900; margin-left: 2px; }
.fb-text {
  margin: 0;
  font-size: 13px; line-height: 1.55; color: #E5E7EB;
}
.fb-text.fb-muted { color: #9CA3AF; font-style: italic; }

.fb-enter-from { opacity: 0; transform: translateY(-6px); }
.fb-leave-to   { opacity: 0; transform: translateY(-6px); }
.fb-enter-active, .fb-leave-active {
  transition: opacity .22s ease, transform .22s ease;
}

/* Footer */
.exam-foot {
  position: sticky; bottom: 0; z-index: 10;
  display: flex; flex-direction: column; gap: 10px;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  background: rgba(10,10,15,.85);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255,255,255,.06);
}
.foot-actions {
  display: flex; align-items: center; gap: 10px;
}
.foot-actions .nav-btn:first-child { margin-right: auto; }
.foot-actions .nav-btn.primary,
.foot-actions .nav-btn.finish { margin-left: auto; }
.nav-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 11px 16px; font-size: 13px; font-weight: 800;
  border-radius: 12px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.08);
  color: #fff; cursor: pointer;
  transition: transform .15s, opacity .2s, background .2s;
}
.nav-btn:disabled { opacity: .35; cursor: not-allowed; }
.nav-btn:not(:disabled):hover { background: rgba(255,255,255,.12); }
.nav-btn:not(:disabled):active { transform: scale(.97); }
.nav-btn.primary {
  background: linear-gradient(135deg,#8B5CF6,#6366F1);
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(139,92,246,.35);
}
.nav-btn.finish {
  background: linear-gradient(135deg,#30D158,#10B981);
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(16,185,129,.4);
  min-width: 118px; justify-content: center;
}

.dots {
  display: flex; flex-wrap: nowrap; justify-content: center;
  gap: 5px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 2px 0;
}
.dots::-webkit-scrollbar { display: none; }
.dot  {
  flex: 0 0 auto;
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,.14);
  transition: all .2s;
}
.dot.done   { background: #8B5CF6; }
.dot.active { background: #00D4FF; transform: scale(1.6); box-shadow: 0 0 8px #00D4FF; }

.dot-loader { display: inline-flex; gap: 4px; }
.dot-loader span {
  width: 6px; height: 6px; border-radius: 50%;
  background: #fff; animation: bounceDot 1s ease-in-out infinite;
}
.dot-loader span:nth-child(2) { animation-delay: .12s; }
.dot-loader span:nth-child(3) { animation-delay: .24s; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px);
  display: grid; place-items: center;
  padding: 24px;
}
.modal {
  background: #15151D;
  border: 1px solid rgba(255,255,255,.1);
  border-radius: 18px;
  padding: 20px;
  max-width: 360px; width: 100%;
  color: #fff;
  animation: popIn .25s cubic-bezier(.34,1.56,.64,1);
}
.modal h3 { margin: 0 0 4px; font-size: 17px; font-weight: 800; }
.modal p  { margin: 0 0 16px; font-size: 13px; color: #9CA3AF; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* Transitions */
.slide-l-enter-from { opacity: 0; transform: translateX(30px); }
.slide-l-leave-to   { opacity: 0; transform: translateX(-30px); }
.slide-r-enter-from { opacity: 0; transform: translateX(-30px); }
.slide-r-leave-to   { opacity: 0; transform: translateX(30px); }
.slide-l-enter-active, .slide-l-leave-active,
.slide-r-enter-active, .slide-r-leave-active { transition: all .3s cubic-bezier(.34,1.2,.64,1); }

.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }

/* Keyframes */
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes bounceDot {
  0%, 80%, 100% { transform: scale(.6); opacity: .5; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes pulseRed {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(.92); }
  to   { opacity: 1; transform: scale(1); }
}

/* Responsive */
@media (max-width: 480px) {
  .exam-head { padding: 8px 10px; gap: 8px; }
  .icon-btn { width: 34px; height: 34px; }
  .timer { padding: 6px 10px; font-size: 12px; }
  .exam-body { padding: 14px 12px 24px; }
  .q-card { padding: 14px 12px 12px; border-radius: 16px; }
  .q-stem { font-size: 15px; }
  .option { padding: 12px 12px; }
  .opt-text { font-size: 13.5px; }
  .opt-bullet { width: 28px; height: 28px; font-size: 13px; }
  .nav-btn { padding: 10px 12px; font-size: 12.5px; }
  .nav-btn.finish { min-width: 100px; }
  .dot { width: 6px; height: 6px; }
}
@media (min-width: 680px) {
  .q-stem { font-size: 17px; }
  .opt-text { font-size: 15px; }
  .nav-btn { padding: 12px 20px; font-size: 14px; }
}
</style>
