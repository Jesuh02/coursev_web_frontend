<template>
  <div class="al-root">
    <TopBar title="Video IA" @back="$router.back()">
      <template #right>
        <button class="theme-btn" @click="toggleTheme" :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </template>
    </TopBar>

    <div v-if="status === 'loading'" class="gen-state gen-center">
      <div class="render-frame" ref="renderFrameEl" aria-hidden="true">
        <span class="render-frame__cell render-frame__cell--wide" />
        <span class="render-frame__cell" />
        <span class="render-frame__cell" />
        <span class="render-frame__cell render-frame__cell--tall" />
      </div>
      <p class="al-eyebrow" style="text-align:center;">Contenido IA</p>
      <h2 class="al-display" style="text-align:center; font-size: 28px;">Preparando tu video…</h2>
      <p class="al-sub" style="text-align:center;">
        Estamos convirtiendo el contenido del curso en escenas con analogias y contenido tecnico visible.
      </p>
      <ul class="gen-steps" ref="stepsEl">
        <li>Buscando video guardado en R2…</li>
        <li>Extrayendo materiales del tema y la tarea…</li>
        <li>Construyendo guion y voz con el modelo de texto…</li>
        <li>Buscando metaforas cotidianas para explicar el concepto…</li>
        <li>Integrando codigo, formulas, endpoints o diagramas cuando aplica…</li>
        <li>Generando escenas visuales coherentes…</li>
        <li>Ensamblando la pieza final…</li>
      </ul>
    </div>

    <div v-else-if="status === 'error'" class="al-empty gen-center">
      <h2 class="al-display" style="font-size: 24px;">No pudimos generar tu video</h2>
      <p>{{ errorMsg }}</p>
      <div style="display:flex; gap: 10px; justify-content:center; margin-top: 16px; flex-wrap:wrap;">
        <button class="al-cta al-cta--accent" @click="generate">Reintentar</button>
        <button class="al-cta al-cta--ghost" @click="$router.back()">Volver</button>
      </div>
    </div>

    <div v-else-if="status === 'ready' && result" class="vv-ready">
      <div class="media-stage">
      <div class="player-wrap" ref="playerEl">
        <video
          v-if="result.videoUrl && !videoError"
          class="player"
          :src="result.videoUrl"
          :poster="result.posterUrl"
          controls
          playsinline
          @error="videoError = true"
        />
        <!-- Narrated slideshow fallback (when video model returned 402 / unavailable) -->
        <div v-else-if="result.slides && result.slides.length" class="vv-slideshow">
          <div class="slide" v-if="result.slides[slideIndex]">
            <img
              v-if="result.slides[slideIndex].imageUrl"
              :src="result.slides[slideIndex].imageUrl"
              class="slide-img"
              :alt="result.slides[slideIndex].narration || 'Escena generada'"
            />
            <div v-else class="slide-placeholder" />
          </div>
          <div class="slide-nav">
            <button class="slide-btn" :disabled="slideIndex === 0" aria-label="Escena anterior" @click="slideIndex--">‹</button>
            <span class="slide-counter">{{ slideIndex + 1 }} / {{ result.slides.length }}</span>
            <button class="slide-btn" :disabled="slideIndex === result.slides.length - 1" aria-label="Escena siguiente" @click="slideIndex++">›</button>
          </div>
        </div>
        <div v-else class="vv-no-video">
          <p class="al-sub">No se pudo reproducir el video en el navegador.</p>
          <a v-if="result?.videoUrl" :href="result.videoUrl" target="_blank" rel="noopener noreferrer" class="al-cta al-cta--accent" style="margin-top:14px; display:inline-block;">Abrir video ↗</a>
        </div>
      </div>

      <aside v-if="sidePanelVisible" class="media-side" aria-label="Explicacion de la escena">
        <section v-if="evaluationPrep" class="side-section side-section--prep">
          <p class="side-label">Preparacion para refuerzo</p>
          <div class="eval-prep__header">
            <strong>{{ evaluationPrep.targetCount }} preguntas {{ evaluationPrep.difficulty }}</strong>
            <span v-if="evaluationPrep.domain">{{ evaluationPrep.domain }}</span>
          </div>
          <div class="eval-prep__chips">
            <span v-for="item in evaluationQuestionTypes" :key="item.type">{{ item.label }}</span>
          </div>
          <ul class="eval-prep__focus">
            <li v-for="item in evaluationFocusAreas" :key="item">{{ item }}</li>
          </ul>
        </section>
        <template v-if="currentSlideNote">
          <section class="side-section">
            <p class="side-label">Situacion</p>
            <p class="side-copy">{{ currentSlideNote.narration }}</p>
          </section>
          <section v-if="currentSlideNote.technicalDetail" class="side-section">
            <p class="side-label">Codigo / contenido del tema</p>
            <pre class="side-technical">{{ currentSlideNote.technicalDetail }}</pre>
          </section>
        </template>
        <template v-else>
          <section v-if="result.summary" class="side-section">
            <p class="side-label">Situacion</p>
            <p class="side-copy">{{ result.summary }}</p>
          </section>
          <section v-if="technicalHighlights.length" class="side-section">
            <p class="side-label">Codigo / contenido del tema</p>
            <div class="side-stack">
              <pre v-for="item in technicalHighlights" :key="item" class="side-technical">{{ item }}</pre>
            </div>
          </section>
          <section v-if="visibleSceneNotes.length" class="side-section">
            <p class="side-label">Escenas</p>
            <ol class="scene-note-list">
              <li v-for="(scene, index) in visibleSceneNotes" :key="`${index}-${scene.narration}`">
                <span>{{ scene.narration }}</span>
                <pre v-if="scene.technicalDetail" class="side-technical side-technical--compact">{{ scene.technicalDetail }}</pre>
              </li>
            </ol>
          </section>
        </template>
      </aside>
      </div>

      <!-- Credits banner — shown below the player/slideshow when 402 was the cause -->
      <div v-if="result.insufficientCredits" class="credits-banner">
        <div class="credits-banner__content">
          <span class="credits-banner__icon">⚡</span>
          <div>
            <strong>Créditos de OpenRouter agotados</strong>
            <p>El modelo de video (Seedance 2.0) requiere créditos en tu cuenta de OpenRouter. Se generó una presentación de imágenes como alternativa.</p>
          </div>
          <a
            href="https://openrouter.ai/credits"
            target="_blank"
            rel="noopener noreferrer"
            class="al-cta al-cta--accent credits-banner__btn"
          >Comprar créditos ↗</a>
        </div>
      </div>

      <div class="vv-info">
        <header class="head" ref="headEl">
          <p class="al-eyebrow">{{ result.slides && !result.videoUrl ? 'Presentación generada' : 'Video generado' }}</p>
          <h1 class="al-display">{{ result.title }}</h1>
          <p v-if="result.durationSeconds" class="al-sub">{{ formatDuration(result.durationSeconds) }} · IA · OpenRouter · Seedance 2.0</p>
        </header>
        <div class="footer-actions">
          <button class="al-cta al-cta--accent" @click="generate">Recargar</button>
          <button class="al-cta al-cta--ghost" @click="$router.push('/video')">Terminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { learningAdapter, type LearningEvaluationPrep, type VideoLearningResult } from '@/infrastructure/api/learningAdapter'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const result = ref<VideoLearningResult | null>(null)
const errorMsg = ref('')
const isGenerating = ref(false)
const videoError = ref(false)
const slideIndex = ref(0)

const renderFrameEl = ref<HTMLElement | null>(null)
const stepsEl = ref<HTMLElement | null>(null)
const headEl = ref<HTMLElement | null>(null)
const playerEl = ref<HTMLElement | null>(null)

const technicalHighlights = computed(() => {
  const items = [
    ...(result.value?.technicalHighlights ?? []),
    ...((result.value?.slides ?? []).map((slide) => slide.technicalDetail).filter(Boolean) as string[]),
  ]
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 4)
})

const currentSlideNote = computed(() => {
  const slide = result.value?.slides?.[slideIndex.value]
  if (!slide) return null
  return {
    narration: slide.narration,
    technicalDetail: slide.technicalDetail,
  }
})

const visibleSceneNotes = computed(() => (result.value?.sceneNotes ?? []).slice(0, 3))

const fallbackQuestionTypes = [
  { type: 'fill_in_blank', label: 'Completar espacios' },
  { type: 'ordering', label: 'Ordenar flujos' },
  { type: 'multiple_choice', label: 'Decisiones profesionales' },
]

const evaluationPrep = computed<LearningEvaluationPrep>(() => result.value?.evaluationPrep ?? {
  difficulty: learningDifficulty(),
  targetCount: learningTargetCount(),
  questionTypes: fallbackQuestionTypes,
  focusAreas: [
    'Conceptos que se completan',
    'Secuencias que se ordenan',
    'Consecuencias que se justifican',
  ],
})

const evaluationQuestionTypes = computed(() => evaluationPrep.value.questionTypes.slice(0, 3))
const evaluationFocusAreas = computed(() => evaluationPrep.value.focusAreas.slice(0, 5))

const sidePanelVisible = computed(() => Boolean(
  evaluationPrep.value ||
  currentSlideNote.value?.narration ||
  currentSlideNote.value?.technicalDetail ||
  result.value?.summary ||
  technicalHighlights.value.length ||
  visibleSceneNotes.value.length,
))

function formatDuration(s: number) {
  const m = Math.floor(s / 60), r = Math.round(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
}

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

async function generate() {
  if (isGenerating.value) return
  isGenerating.value = true
  status.value = 'loading'
  errorMsg.value = ''
  result.value = null
  videoError.value = false
  slideIndex.value = 0
  await nextTick()
  startLoading()
  try {
    const data = await learningAdapter.getOrCreateVideo({
      courseId: Number(route.params.courseId),
      topicId: Number(route.params.topicId),
      taskId: Number(route.params.taskId),
      difficulty: learningDifficulty(),
      targetCount: learningTargetCount(),
    })
    if (data.status === 'processing' && data.jobId) {
      await pollUntilReady(data.jobId)
    } else {
      result.value = data
      status.value = 'ready'
      await nextTick()
      runReady()
    }
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Ocurrió un error al generar el video.'
    status.value = 'error'
  } finally {
    isGenerating.value = false
  }
}

async function pollUntilReady(jobId: string) {
  const maxAttempts = 100 // ~8.3 min at 5 s intervals; covers Seedance 2.0 generation time
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 5_000))
    const job = await learningAdapter.pollVideoStatus(jobId)
    if (job.status === 'completed') {
      result.value = job
      status.value = 'ready'
      await nextTick()
      runReady()
      return
    }
    if (job.status === 'error') {
      throw new Error(job.error || 'Error generando el video.')
    }
    // still 'processing' — keep polling
  }
  throw new Error('Tiempo de espera agotado esperando el video.')
}

function startLoading() {
  if (renderFrameEl.value) {
    animate(Array.from(renderFrameEl.value.children) as HTMLElement[], {
      opacity: [0.38, 1, 0.38],
      scale: [0.98, 1.02, 0.98],
      delay: utils.stagger(120),
      duration: 1600, loop: true, ease: 'inOutSine',
    })
  }
  if (stepsEl.value) {
    animate(Array.from(stepsEl.value.children) as HTMLElement[], {
      opacity: [0, 1],
      translateX: [-12, 0],
      delay: utils.stagger(220, { start: 200 }),
      duration: 500, ease: 'outCubic',
    })
  }
}

function runReady() {
  if (headEl.value) {
    animate(Array.from(headEl.value.children) as HTMLElement[], {
      opacity: [0, 1], translateY: [14, 0],
      delay: utils.stagger(80), duration: 550, ease: 'outCubic',
    })
  }
  if (playerEl.value) {
    animate(playerEl.value, {
      opacity: [0, 1], translateY: [22, 0], scale: [0.97, 1],
      duration: 700, delay: 200, ease: 'outCubic',
    })
  }
}

onMounted(generate)
</script>

<style scoped>
.al-root {
  display: flex;
  flex-direction: column;
}

.gen-center {
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding: 24px 20px 48px;
}

.head { padding: 12px 0 8px; }

.vv-ready {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.vv-info {
  padding: 12px 16px 32px;
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.gen-state {
  padding: 56px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.render-frame {
  width: min(280px, 76vw);
  aspect-ratio: 16 / 9;
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  padding: 10px;
  margin-bottom: 18px;
  border-radius: 24px;
  background: var(--apple-snow);
  border: 1px solid var(--apple-border);
  box-shadow: 0 18px 45px rgba(29, 29, 31, 0.10);
}
.render-frame__cell {
  min-width: 0;
  min-height: 0;
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(0, 113, 227, 0.18), rgba(0, 184, 212, 0.12)),
    var(--apple-cloud);
}
.render-frame__cell--wide {
  grid-row: span 2;
}
.render-frame__cell--tall {
  grid-column: span 2;
}

.gen-steps {
  list-style: none; padding: 0; margin: 18px 0 0;
  display: flex; flex-direction: column; gap: 10px;
  text-align: left; max-width: 460px;
}
.gen-steps li {
  font-size: 14px; color: var(--apple-graphite);
  padding-left: 22px; position: relative;
}
.gen-steps li::before {
  content: '';
  position: absolute; left: 0; top: 7px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--apple-silver);
}

.media-stage {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  background: #050507;
}

.player-wrap {
  width: 100%;
  overflow: hidden;
  background: #050507;
  flex-shrink: 0;
}
.player {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  background: #000;
}

.vv-no-video {
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #111;
  color: var(--apple-graphite);
  padding: 24px;
  text-align: center;
}

.vv-slideshow {
  aspect-ratio: 16 / 9;
  background: #050507;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.slide {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.slide-img {
  width: 100%;
  flex: 1;
  min-height: 0;
  object-fit: contain;
  background: #000;
}
.slide-placeholder {
  flex: 1;
  background: #111;
}
.slide-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 48px;
  padding: 8px;
  background: #111114;
}
.slide-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  opacity: 0.8;
  padding: 0 8px;
  line-height: 1;
}
.slide-btn:disabled { opacity: 0.25; cursor: default; }
.slide-counter {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  min-width: 48px;
  text-align: center;
  font-weight: 600;
}

.media-side {
  min-width: 0;
  max-height: 44vh;
  overflow: auto;
  padding: 16px;
  background: var(--apple-snow);
  color: var(--apple-ink);
  border-top: 1px solid var(--apple-border);
}
.side-section {
  margin: 0 0 16px;
  padding: 12px 14px;
  background: rgba(0, 113, 227, 0.04);
  border-radius: 12px;
  border-left: 3px solid var(--apple-signal-blue);
}
.side-section:last-child {
  margin-bottom: 0;
}
.side-section--prep {
  background: rgba(0, 113, 227, 0.07);
}
.side-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px;
  color: var(--apple-signal-blue);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.side-label::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
}
.side-copy {
  margin: 0;
  color: var(--apple-ink);
  font-size: 14px;
  line-height: 1.7;
}
.eval-prep__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.eval-prep__header strong {
  color: var(--apple-ink);
  font-size: 14px;
  line-height: 1.3;
}
.eval-prep__header span {
  flex: 0 0 auto;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--apple-signal-blue);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.eval-prep__chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.eval-prep__chips span {
  padding: 6px 9px;
  border-radius: 999px;
  color: #0b5cab;
  background: rgba(0, 113, 227, 0.1);
  border: 1px solid rgba(0, 113, 227, 0.18);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}
.eval-prep__focus {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
  color: var(--apple-graphite);
  font-size: 12.5px;
  line-height: 1.45;
}
.side-stack {
  display: grid;
  gap: 8px;
}
.side-technical {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(145deg, #0d1224 0%, #0a0f1a 100%);
  color: #e8ecf4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 12.5px;
  line-height: 1.55;
  border: 1px solid rgba(0, 150, 255, 0.2);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 20px rgba(0, 0, 0, 0.15);
}
.side-technical--compact {
  margin-top: 8px;
  font-size: 11px;
  padding: 10px 12px;
}
.scene-note-list {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
  color: var(--apple-graphite);
  font-size: 13px;
  line-height: 1.5;
}

.credits-banner {
  background: #1c1400;
  border-bottom: 1px solid #7c5a00;
  padding: 12px 16px;
}
.credits-banner__content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
  flex-wrap: wrap;
}
.credits-banner__icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1.4;
}
.credits-banner__content > div {
  flex: 1;
  min-width: 180px;
}
.credits-banner__content strong {
  display: block;
  font-size: 14px;
  color: #f5c518;
  margin-bottom: 2px;
}
.credits-banner__content p {
  font-size: 12px;
  color: #c9a830;
  margin: 0;
  line-height: 1.45;
}
.credits-banner__btn {
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
  font-size: 13px;
  padding: 7px 14px;
}

.footer-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

@media (min-width: 600px) {
  .vv-info {
    padding: 16px 24px 40px;
  }
}

@media (min-width: 860px) {
  .media-stage {
    grid-template-columns: minmax(0, 2.3fr) minmax(300px, 0.85fr);
    align-items: stretch;
    overflow: hidden;
    width: min(1180px, calc(100% - 32px));
    margin: 16px auto 0;
    border-radius: var(--apple-r-card);
    box-shadow: 0 8px 32px rgba(29,29,31,0.12);
  }
  .media-side {
    max-height: none;
    border-top: none;
    border-left: 1px solid var(--apple-border);
  }
  .vv-info {
    max-width: 1180px;
  }
}
</style>
