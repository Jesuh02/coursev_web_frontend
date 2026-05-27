<template>
  <div class="comic-root">
    <TopBar :title="result?.title || 'Comic'" @back="$router.back()">
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
      <p class="al-eyebrow" style="text-align:center;">Generando con IA</p>
      <h2 class="gen-title">Componiendo tu comic...</h2>
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
                :alt="`Panel ${currentIdx + 1}`"
              />
              <div v-else class="slide-ph">
                <span class="slide-ph-icon">&#x1F3A8;</span>
                <p class="slide-ph-label">Imagen no disponible</p>
              </div>
            </div>
            <div class="slide-text">
              <blockquote v-if="currentPanel.dialogue" class="slide-dialogue">
                "{{ currentPanel.dialogue }}"
              </blockquote>
              <p class="slide-caption">{{ currentPanel.caption }}</p>
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
        <button class="al-cta al-cta--ghost" @click="generate">Regenerar</button>
        <button
          v-if="currentIdx < result.panels.length - 1"
          class="al-cta al-cta--accent"
          @click="next"
        >Siguiente ›</button>
        <button
          v-else
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
import { learningAdapter, type ComicResult } from '@/infrastructure/api/learningAdapter'
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
  'Leyendo documentos del tema...',
  'Construyendo el guion con el modelo de texto...',
  'Pintando los paneles con el modelo de imagen...',
  'Ensamblando la historia...',
]

const currentPanel = computed(() =>
  result.value?.panels[currentIdx.value] ?? { imageUrl: '', caption: '', dialogue: undefined }
)

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
    const data = await learningAdapter.generateComic({
      courseId: Number(route.params.courseId),
      topicId: Number(route.params.topicId),
      taskId: Number(route.params.taskId),
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
@import '@/styles/apple-tokens.css';

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
  padding: 8px 20px 6px;
  background: var(--apple-snow);
  border-bottom: 1px solid var(--apple-border);
}
.comic-counter {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--apple-accent-purple);
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

.slide-viewport {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
  cursor: grab;
  background: #000;
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
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #0a0a0a;
}
.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
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
  padding: 14px 20px 10px;
  background: var(--apple-snow);
  max-height: 38%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.slide-dialogue {
  font-family: var(--apple-font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--apple-ink);
  margin: 0 0 8px;
  padding-left: 12px;
  border-left: 3px solid var(--apple-accent-purple);
  line-height: 1.4;
}
.slide-caption {
  font-size: 14px;
  line-height: 1.6;
  color: var(--apple-graphite);
  margin: 0;
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
  padding: 10px 16px;
  background: var(--apple-snow);
  border-top: 1px solid var(--apple-border);
}
.nav-arrow {
  width: 46px;
  height: 46px;
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
  width: 22px;
  height: 22px;
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
  background: var(--apple-accent-purple);
  transform: scale(1.5);
}

.footer-actions {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  padding: 10px 20px 18px;
  justify-content: center;
  background: var(--apple-snow);
}

@media (min-width: 600px) {
  .comic-header { padding: 10px 32px 8px; }
  .comic-title-text { font-size: 18px; }
  .slide-text { padding: 18px 32px 14px; }
  .nav-bar { padding: 12px 32px; }
  .footer-actions { padding: 12px 32px 24px; }
}

@media (min-width: 860px) {
  .slide-card { flex-direction: row; }
  .slide-image { flex: 3; }
  .slide-text {
    flex: 1;
    max-height: 100%;
    border-left: 1px solid rgba(0, 0, 0, 0.07);
    border-top: none;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: var(--apple-snow);
  }
  .slide-dialogue { font-size: 17px; }
  .slide-caption { font-size: 15px; }
}
</style>