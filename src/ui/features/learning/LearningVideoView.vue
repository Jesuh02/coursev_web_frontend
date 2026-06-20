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
      <p class="al-eyebrow" style="text-align:center;">Render con IA</p>
      <h2 class="al-display" style="text-align:center; font-size: 28px;">Componiendo tu video…</h2>
      <p class="al-sub" style="text-align:center;">
        Estamos convirtiendo el contenido del curso en escenas con analogias de la vida real.
      </p>
      <ul class="gen-steps" ref="stepsEl">
        <li>Extrayendo materiales del tema y la tarea…</li>
        <li>Construyendo guion y voz con el modelo de texto…</li>
        <li>Buscando metaforas cotidianas para explicar el concepto…</li>
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
            <p class="slide-narration">{{ result.slides[slideIndex].narration }}</p>
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

      <!-- Credits banner — shown below the player/slideshow when 402 was the cause -->
      <div v-if="result.insufficientCredits" class="credits-banner">
        <div class="credits-banner__content">
          <span class="credits-banner__icon">⚡</span>
          <div>
            <strong>Créditos de OpenRouter agotados</strong>
            <p>El modelo de video (Kling v3 Pro) requiere créditos en tu cuenta de OpenRouter. Se generó una presentación de imágenes como alternativa.</p>
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
          <p v-if="result.durationSeconds" class="al-sub">{{ formatDuration(result.durationSeconds) }} · IA · OpenRouter · Kling v3 Pro</p>
        </header>
        <div class="footer-actions">
          <button class="al-cta al-cta--accent" @click="generate">Regenerar</button>
          <button class="al-cta al-cta--ghost" @click="$router.push('/video')">Terminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { learningAdapter, type VideoLearningResult } from '@/infrastructure/api/learningAdapter'
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

function formatDuration(s: number) {
  const m = Math.floor(s / 60), r = Math.round(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
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
    const data = await learningAdapter.generateVideo({
      courseId: Number(route.params.courseId),
      topicId: Number(route.params.topicId),
      taskId: Number(route.params.taskId),
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
  const maxAttempts = 100 // ~8.3 min at 5 s intervals — covers Kling v3 Pro generation time
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
.slide-narration {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #f5f5f7;
  padding: 12px 14px;
  background: rgba(8, 9, 11, 0.74);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  margin: 0;
  max-height: 92px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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
  .player-wrap {
    max-width: 1080px;
    margin: 16px auto 0;
    border-radius: var(--apple-r-card);
    box-shadow: 0 8px 32px rgba(29,29,31,0.12);
  }
  .vv-info {
    max-width: 1080px;
  }
}
</style>
