<template>
  <div class="comic-root">
    <TopBar title="Comic IA" @back="$router.back()">
      <template #right>
        <button class="theme-btn" @click="toggleTheme" :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </template>
    </TopBar>

    <!-- LOADING -->
    <div v-if="status === 'loading'" class="gen-state">
      <div class="gen-spinner" ref="spinnerEl">
        <span /><span /><span /><span />
      </div>
      <p class="al-eyebrow" style="text-align:center;">Contenido IA</p>
      <h2 class="gen-title">Preparando tu comic...</h2>
      <p class="al-sub" style="text-align:center; max-width:360px;">
        Estamos enviando los materiales del tema al modelo de imagen y texto.
        Esto puede tardar unos segundos.
      </p>
      <ul class="gen-steps" ref="stepsEl">
        <li v-for="s in generationSteps" :key="s">{{ s }}</li>
      </ul>
    </div>

    <!-- ERROR -->
    <div v-else-if="status === 'error'" class="error-state">
      <div class="error-icon">X</div>
      <h2 class="gen-title" style="font-size:22px;">No pudimos generar tu comic</h2>
      <p class="al-sub" style="text-align:center; max-width:340px;">{{ errorMsg }}</p>
      <div class="error-actions">
        <button class="al-cta al-cta--accent" @click="generate">Reintentar</button>
        <button class="al-cta al-cta--ghost" @click="$router.back()">Volver</button>
      </div>
    </div>

    <!-- CAROUSEL -->
    <div v-else-if="status === 'ready' && result" class="carousel-wrap">

      <div class="comic-header" ref="headEl">
        <span class="comic-counter">{{ currentIdx + 1 }} / {{ result.panels.length }}</span>
        <h1 class="comic-title-text">{{ result.title }}</h1>
      </div>

      <section v-if="evaluationPrep" class="prep-strip" aria-label="Preparacion para refuerzo">
        <div class="prep-strip__summary">
          <span class="prep-strip__eyebrow">Preparacion para refuerzo</span>
          <strong>{{ evaluationPrep.targetCount }} preguntas {{ evaluationPrep.difficulty }}</strong>
        </div>
        <div class="prep-strip__chips">
          <span v-for="item in evaluationQuestionTypes" :key="item.type">{{ item.label }}</span>
        </div>
        <div class="prep-strip__focus">
          <span v-for="item in evaluationFocusAreas" :key="item">{{ item }}</span>
        </div>
      </section>

      <div
        class="slide-viewport"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
      >
        <transition :name="transName">
          <div class="slide-card" :key="currentIdx">
            <div class="slide-image">
              <img
                v-if="currentPanel.imageUrl"
                :src="currentPanel.imageUrl"
                :alt="currentPanel.caption || `Panel ${currentIdx + 1}`"
              />
              <div v-else class="slide-ph">
                <span class="slide-ph-icon">&#x1F3A8;</span>
                <p class="slide-ph-label">Imagen no disponible</p>
              </div>
            </div>
            <div class="slide-text">
              <section class="slide-section">
                <span class="slide-section__label">Situacion en la historia</span>
                <p class="slide-caption">{{ currentPanel.caption }}</p>
              </section>
              <div v-if="currentPanel.dialogue" class="slide-dialogue" aria-label="Dialogo del panel">
                <p>{{ currentPanel.dialogue }}</p>
              </div>
              <div v-if="currentPanel.technicalDetail" class="slide-technical">
                <div class="slide-technical__header">
                  <span class="slide-technical__dot"></span>
                  <span class="slide-technical__dot"></span>
                  <span class="slide-technical__dot"></span>
                  <span class="slide-technical__label">{{ detectCodeLanguage(currentPanel.technicalDetail) }}</span>
                </div>
                <pre class="slide-technical__code"><code>{{ currentPanel.technicalDetail }}</code></pre>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <nav class="nav-bar" aria-label="Navegacion de paneles">
        <button
          class="nav-arrow"
          :disabled="currentIdx === 0"
          aria-label="Panel anterior"
          @click="prev"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div class="dots-row" role="tablist">
          <button
            v-for="(_, i) in result.panels"
            :key="i"
            class="dot"
            :class="{ active: i === currentIdx }"
            role="tab"
            :aria-label="`Panel ${i + 1}`"
            :aria-selected="i === currentIdx"
            @click="goTo(i)"
          />
        </div>

        <button
          class="nav-arrow"
          :disabled="currentIdx === result.panels.length - 1"
          aria-label="Panel siguiente"
          @click="next"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </nav>

      <div class="footer-actions">
        <button class="al-cta al-cta--ghost" @click="generate">Recargar</button>
        <button
          v-if="currentIdx === result.panels.length - 1"
          class="al-cta al-cta--accent"
          @click="$router.push('/video')"
        >Terminar</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { learningAdapter, type ComicResult, type LearningEvaluationPrep } from '@/infrastructure/api/learningAdapter'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const result = ref<ComicResult | null>(null)
const errorMsg = ref('')
const isGenerating = ref(false)

const currentIdx = ref(0)
const transName = ref('slide-left')

const spinnerEl = ref<HTMLElement | null>(null)
const stepsEl = ref<HTMLElement | null>(null)
const headEl = ref<HTMLElement | null>(null)

let touchStartX = 0
let mouseStartX = 0

const generationSteps = [
  'Buscando comic guardado en R2...',
  'Leyendo documentos del tema...',
  'Alineando el contenido con la evaluacion de refuerzo...',
  'Construyendo el guion con el modelo de texto...',
  'Traduciendo conceptos a alegorias de la vida real...',
  'Integrando codigo, diagramas o datos del tema cuando aplica...',
  'Pintando escenas con objetos, acciones y contenido tecnico...',
  'Ensamblando la historia...',
]

const currentPanel = computed(() =>
  result.value?.panels[currentIdx.value] ?? { imageUrl: '', caption: '', dialogue: undefined, technicalDetail: undefined }
)

const fallbackQuestionTypes: LearningEvaluationPrep['questionTypes'] = [
  { type: 'fill_in_blank', label: 'Completar espacios' },
  { type: 'ordering', label: 'Ordenar flujos' },
  { type: 'multiple_choice', label: 'Decisiones profesionales' },
]

const evaluationPrep = computed<LearningEvaluationPrep>(() => result.value?.evaluationPrep ?? {
  difficulty: learningDifficulty(),
  targetCount: learningTargetCount(),
  domain: '',
  questionTypes: fallbackQuestionTypes,
  focusAreas: [
    'Conceptos que se completan',
    'Secuencias que se ordenan',
    'Consecuencias que se justifican',
  ],
})

const evaluationQuestionTypes = computed(() => evaluationPrep.value.questionTypes.slice(0, 3))
const evaluationFocusAreas = computed(() => evaluationPrep.value.focusAreas.slice(0, 4))

function queryStringValue(value: unknown): string {
  return Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')
}

function learningDifficulty(): string {
  const value = queryStringValue(route.query.difficulty).toUpperCase()
  return ['EASY', 'INTERMEDIATE', 'HARD'].includes(value) ? value : 'HARD'
}

function learningTargetCount(): number {
  const n = Number(queryStringValue(route.query.targetCount))
  return Number.isFinite(n) && n > 0 ? Math.max(10, Math.trunc(n)) : 10
}

function detectCodeLanguage(code: string | undefined): string {
  if (!code) return 'Codigo'
  const c = code.toLowerCase()
  if (/\b(def |import |print\(|class .+:|if __name__|\.py\b|python)/.test(c)) return 'Python'
  if (/\b(function |const |let |var |=>|\.js\b|console\.log|async |await )/.test(c)) return 'JavaScript'
  if (/\b(interface |type |: string|: number|: boolean|\.ts\b)/.test(c)) return 'TypeScript'
  if (/\b(select |from |where |insert |update |delete |join |create table)/.test(c)) return 'SQL'
  if (/\b(get |post |put |delete |patch |https?:\/\/|endpoint|api\/)/.test(c)) return 'API / HTTP'
  if (/[{}\[\]":,]+/.test(c) && /{[\s\S]*}/.test(code)) return 'JSON'
  if (/\b(<!doctype|<html|<div|<span|<p>|<\/|class=")/.test(c)) return 'HTML'
  if (/\b(\.[\w-]+\s*{|#[\w-]+\s*{|@media|color:|background:|margin:|padding:)/.test(c)) return 'CSS'
  if (/\b(docker|npm |yarn |pip |git |curl |wget |chmod |mkdir |cd |ls )/.test(c)) return 'Terminal'
  if (/\b(public |private |void |int |string |class |static |new )/.test(c)) return 'Java / C#'
  if (/[+\-*/=<>]+|^[\d\s+\-*/()=]+$|[∑∏∫√]|sin|cos|log/.test(c)) return 'Formula'
  return 'Codigo del tema'
}

function prev() {
  if (!result.value || currentIdx.value === 0) return
  transName.value = 'slide-right'
  currentIdx.value--
}

function next() {
  if (!result.value || currentIdx.value >= result.value.panels.length - 1) return
  transName.value = 'slide-left'
  currentIdx.value++
}

function goTo(i: number) {
  if (i === currentIdx.value) return
  transName.value = i > currentIdx.value ? 'slide-left' : 'slide-right'
  currentIdx.value = i
}

function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0].clientX }
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 44) dx < 0 ? next() : prev()
}

function onMouseDown(e: MouseEvent) { mouseStartX = e.clientX }
function onMouseUp(e: MouseEvent) {
  const dx = e.clientX - mouseStartX
  if (Math.abs(dx) > 44) dx < 0 ? next() : prev()
}

async function generate() {
  if (isGenerating.value) return
  isGenerating.value = true
  currentIdx.value = 0
  status.value = 'loading'
  errorMsg.value = ''
  result.value = null
  await nextTick()
  startLoadingAnimations()
  try {
    const data = await learningAdapter.getOrCreateComic({
      courseId: Number(route.params.courseId),
      topicId: Number(route.params.topicId),
      taskId: Number(route.params.taskId),
      difficulty: learningDifficulty(),
      targetCount: learningTargetCount(),
    })
    result.value = data
    status.value = 'ready'
    await nextTick()
    runReadyAnimations()
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Ocurrio un error al generar el comic.'
    status.value = 'error'
  } finally {
    isGenerating.value = false
  }
}

function startLoadingAnimations() {
  if (spinnerEl.value) {
    const dots = Array.from(spinnerEl.value.children) as HTMLElement[]
    animate(dots, {
      translateY: [0, -10, 0],
      opacity: [0.4, 1, 0.4],
      delay: utils.stagger(120),
      duration: 1100, loop: true, ease: 'inOutSine',
    })
  }
  if (stepsEl.value) {
    const items = Array.from(stepsEl.value.children) as HTMLElement[]
    animate(items, {
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: utils.stagger(220, { start: 200 }),
      duration: 500, ease: 'outCubic',
    })
  }
}

function runReadyAnimations() {
  if (headEl.value) {
    animate(Array.from(headEl.value.children) as HTMLElement[], {
      opacity: [0, 1], translateY: [10, 0],
      delay: utils.stagger(60), duration: 420, ease: 'outCubic',
    })
  }
}

onMounted(generate)
</script>

<style scoped>
.comic-root {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: var(--apple-mist);
  color: var(--apple-ink);
  font-family: var(--apple-font-text);
  overflow: hidden;
  /* Bridge apple tokens into global token space so TopBar adapts */
  --bg-primary: var(--apple-snow);
  --text-primary: var(--apple-ink);
}

.gen-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 24px;
  overflow-y: auto;
}
.gen-spinner {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.gen-spinner span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--apple-accent-cyan), var(--apple-accent-purple));
}
.gen-title {
  font-family: var(--apple-font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--apple-ink);
  margin: 4px 0;
  text-align: center;
  letter-spacing: -0.02em;
}
.gen-steps {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  width: 100%;
  max-width: 380px;
}
.gen-steps li {
  font-size: 14px;
  color: var(--apple-graphite);
  padding-left: 22px;
  position: relative;
  line-height: 1.45;
}
.gen-steps li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--apple-accent-purple);
}

.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
}
.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
  font-size: 26px;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.error-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}

.carousel-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.comic-header {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px 8px;
  background: color-mix(in srgb, var(--apple-snow) 94%, transparent);
  border-bottom: 1px solid var(--apple-border);
}
.comic-counter {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apple-signal-blue);
  flex-shrink: 0;
}
.comic-title-text {
  flex: 1;
  font-family: var(--apple-font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--apple-ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prep-strip {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(150px, 0.9fr) 1fr;
  gap: 8px 12px;
  padding: 10px 16px;
  background: var(--apple-cloud);
  border-bottom: 1px solid var(--apple-border);
}
.prep-strip__summary {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.prep-strip__eyebrow {
  color: var(--apple-signal-blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.prep-strip__summary strong {
  color: var(--apple-ink);
  font-size: 13px;
  line-height: 1.25;
}
.prep-strip__chips,
.prep-strip__focus {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.prep-strip__chips::-webkit-scrollbar,
.prep-strip__focus::-webkit-scrollbar {
  display: none;
}
.prep-strip__chips span,
.prep-strip__focus span {
  flex: 0 0 auto;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1.2;
}
.prep-strip__chips span {
  padding: 6px 9px;
  color: #0b5cab;
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.18);
  font-weight: 700;
}
.prep-strip__focus {
  grid-column: 2;
}
.prep-strip__focus span {
  padding: 5px 8px;
  color: var(--apple-graphite);
  background: var(--apple-snow);
  border: 1px solid var(--apple-border);
  font-weight: 600;
}

.slide-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  cursor: grab;
  background: #08090b;
  user-select: none;
}
.slide-viewport:active { cursor: grabbing; }

.slide-card {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}
.slide-image {
  flex: 1;
  min-height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: clamp(16px, 4vw, 24px);
  background: #08090b;
}
.slide-image img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  min-width: 80%;
  min-height: 80%;
  object-fit: contain;
  display: block;
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}
.slide-ph {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.slide-ph-icon { font-size: 56px; opacity: 0.35; }
.slide-ph-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}
.slide-text {
  flex-shrink: 0;
  padding: 14px 16px 12px;
  background: var(--apple-snow);
  max-height: 35%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-top: 1px solid var(--apple-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.slide-dialogue {
  position: relative;
  align-self: flex-start;
  max-width: min(100%, 520px);
  font-family: var(--apple-font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--apple-ink);
  margin: 0 0 8px 10px;
  padding: 12px 15px;
  border-radius: 16px 16px 16px 5px;
  background: #fffdf8;
  border: 2px solid rgba(24, 24, 27, 0.18);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  line-height: 1.4;
}
.slide-dialogue::before {
  content: '';
  position: absolute;
  left: -10px;
  bottom: 9px;
  width: 18px;
  height: 18px;
  background: #fffdf8;
  border-left: 2px solid rgba(24, 24, 27, 0.18);
  border-bottom: 2px solid rgba(24, 24, 27, 0.18);
  transform: rotate(45deg);
}
.slide-dialogue p {
  position: relative;
  margin: 0;
}
.slide-section {
  margin: 0;
  padding: 12px 14px;
  background: rgba(0, 113, 227, 0.04);
  border-radius: 12px;
  border-left: 3px solid var(--apple-signal-blue);
}
.slide-section__label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apple-signal-blue);
}
.slide-section__label::before {
  content: '📖';
  font-size: 12px;
}
.slide-caption {
  font-size: 14px;
  line-height: 1.7;
  color: var(--apple-ink);
  margin: 0;
}
.slide-technical {
  margin: 0;
  padding: 0;
  border-radius: 12px;
  background: #1e1e2e;
  color: #cdd6f4;
  border: 1px solid rgba(137, 180, 250, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.slide-technical__header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #181825;
  border-bottom: 1px solid rgba(137, 180, 250, 0.1);
}
.slide-technical__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff5f57;
}
.slide-technical__dot:nth-child(2) {
  background: #febc2e;
}
.slide-technical__dot:nth-child(3) {
  background: #28c840;
}
.slide-technical__label {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #89b4fa;
  text-transform: uppercase;
}
.slide-technical__code {
  flex: 1;
  margin: 0;
  padding: 14px 16px;
  overflow: auto;
  background: transparent;
}
.slide-technical__code code {
  display: block;
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.6;
  color: #cdd6f4;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 2;
}
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.36s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.26s ease;
}
.slide-left-enter-from  { transform: translateX(100%); opacity: 0.6; }
.slide-left-leave-to    { transform: translateX(-100%); opacity: 0.6; }
.slide-right-enter-from { transform: translateX(-100%); opacity: 0.6; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0.6; }

.nav-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--apple-snow);
  border-top: 1px solid var(--apple-border);
}
.nav-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--apple-cloud);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.12s, opacity 0.18s;
}
.nav-arrow svg {
  width: 20px;
  height: 20px;
  color: var(--apple-ink);
}
.nav-arrow:not(:disabled):hover { background: rgba(0, 0, 0, 0.1); }
.nav-arrow:not(:disabled):active { transform: scale(0.88); }
.nav-arrow:disabled { opacity: 0.22; cursor: not-allowed; }

.dots-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--apple-silver);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.2s;
}
.dot.active {
  background: var(--apple-signal-blue);
  transform: scale(1.5);
}

.footer-actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  min-height: 56px;
  padding: 7px 16px 12px;
  justify-content: center;
  align-items: center;
  background: var(--apple-snow);
}

@media (min-width: 600px) {
  .comic-header { padding: 6px 28px 5px; }
  .comic-title-text { font-size: 18px; }
  .prep-strip { padding: 10px 28px; }
  .slide-text { padding: 12px 28px 10px; }
  .nav-bar { padding: 8px 28px; }
  .footer-actions { padding: 8px 28px 16px; }
}

@media (max-width: 599px) {
  .prep-strip {
    grid-template-columns: 1fr;
    gap: 7px;
  }
  .prep-strip__focus {
    grid-column: 1;
  }
}

@media (min-width: 860px) {
  .slide-card { flex-direction: row; }
  .slide-image {
    flex: 1;
    max-width: 55%;
    padding: 24px;
  }
  .slide-image img {
    border-radius: 28px;
  }
  .slide-text {
    flex: 1;
    min-width: 45%;
    max-height: 100%;
    border-left: 1px solid rgba(0, 0, 0, 0.07);
    border-top: none;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
    background: var(--apple-snow);
    overflow-y: auto;
  }
  .slide-dialogue { font-size: 17px; }
  .slide-caption { font-size: 15px; line-height: 1.7; }
  .slide-technical {
    flex: 1;
    min-height: 140px;
    max-height: none;
  }
  .slide-technical__code {
    padding: 16px 18px;
  }
  .slide-technical__code code {
    font-size: 13px;
    line-height: 1.6;
  }
}

@media (min-width: 1200px) {
  .slide-image {
    max-width: 55%;
    padding: 28px;
  }
  .slide-image img {
    border-radius: 32px;
    box-shadow:
      0 24px 80px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  .slide-text {
    min-width: 50%;
    padding: 36px 32px;
    gap: 20px;
  }
  .slide-section {
    padding: 16px 18px;
  }
  .slide-caption {
    font-size: 16px;
  }
  .slide-technical {
    min-height: 160px;
  }
  .slide-technical__code {
    padding: 18px 20px;
  }
  .slide-technical__code code {
    font-size: 14px;
    line-height: 1.65;
  }
}
</style>
