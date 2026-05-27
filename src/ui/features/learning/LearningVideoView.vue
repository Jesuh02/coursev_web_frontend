<template>
  <div class="al-root">
    <TopBar :title="result?.title || 'Video IA'" @back="$router.back()">
      <template #right>
        <button class="theme-btn" @click="toggleTheme" :aria-label="isDark ? 'Modo claro' : 'Modo oscuro'">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
      </template>
    </TopBar>

    <div v-if="status === 'loading'" class="gen-state gen-center">
      <div class="orb-stage">
        <div class="orb" ref="orbEl" />
        <div class="ring" ref="ring1El" />
        <div class="ring ring--2" ref="ring2El" />
      </div>
      <p class="al-eyebrow" style="text-align:center;">Render con IA</p>
      <h2 class="al-display" style="text-align:center; font-size: 28px;">Componiendo tu video…</h2>
      <p class="al-sub" style="text-align:center;">
        Estamos generando guion, voz y secuencia visual a partir del contenido del curso.
      </p>
      <ul class="gen-steps" ref="stepsEl">
        <li>Extrayendo materiales del tema y la tarea…</li>
        <li>Construyendo guion y voz con el modelo de texto…</li>
        <li>Generando escenas con el modelo de video…</li>
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
        <div v-else class="vv-no-video">
          <p class="al-sub">No se pudo reproducir el video en el navegador.</p>
          <a v-if="result?.videoUrl" :href="result.videoUrl" target="_blank" rel="noopener noreferrer" class="al-cta al-cta--accent" style="margin-top:14px; display:inline-block;">Abrir video ↗</a>
        </div>
      </div>
      <div class="vv-info">
        <header class="head" ref="headEl">
          <p class="al-eyebrow">Video generado</p>
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

const orbEl = ref<HTMLElement | null>(null)
const ring1El = ref<HTMLElement | null>(null)
const ring2El = ref<HTMLElement | null>(null)
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
  if (orbEl.value) {
    animate(orbEl.value, {
      scale: [1, 1.08, 1],
      duration: 2200, loop: true, ease: 'inOutSine',
    })
  }
  if (ring1El.value) {
    animate(ring1El.value, {
      scale: [0.9, 1.4],
      opacity: [0.7, 0],
      duration: 1800, loop: true, ease: 'outQuad',
    })
  }
  if (ring2El.value) {
    animate(ring2El.value, {
      scale: [0.9, 1.6],
      opacity: [0.5, 0],
      duration: 1800, delay: 700, loop: true, ease: 'outQuad',
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
.orb-stage {
  position: relative;
  width: 160px; height: 160px;
  display: grid; place-items: center;
  margin-bottom: 18px;
}
.orb {
  position: absolute;
  width: 88px; height: 88px; border-radius: 50%;
  background: var(--apple-ink);
}
.ring {
  position: absolute;
  width: 88px; height: 88px; border-radius: 50%;
  border: 1px solid var(--apple-ring-a);
}
.ring--2 { border-color: var(--apple-ring-b); }

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
  background: #000;
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
  align-items: center;
  justify-content: center;
  background: #111;
  color: var(--apple-graphite);
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
