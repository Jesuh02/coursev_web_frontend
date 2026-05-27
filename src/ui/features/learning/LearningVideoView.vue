<template>
  <div class="al-root">
    <TopBar :title="result?.title || 'Video IA'" @back="$router.back()" />

    <div class="al-shell">

      <div v-if="status === 'loading'" class="gen-state">
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

      <div v-else-if="status === 'error'" class="al-empty">
        <h2 class="al-display" style="font-size: 24px;">No pudimos generar tu video</h2>
        <p>{{ errorMsg }}</p>
        <div style="display:flex; gap: 10px; justify-content:center; margin-top: 16px; flex-wrap:wrap;">
          <button class="al-cta al-cta--accent" @click="generate">Reintentar</button>
          <button class="al-cta al-cta--ghost" @click="$router.back()">Volver</button>
        </div>
      </div>

      <template v-else-if="status === 'ready' && result">
        <header class="head" ref="headEl">
          <p class="al-eyebrow">Video generado</p>
          <h1 class="al-display">{{ result.title }}</h1>
          <p v-if="result.durationSeconds" class="al-sub">{{ formatDuration(result.durationSeconds) }} · IA · OpenRouter</p>
        </header>

        <div class="player-wrap" ref="playerEl">
          <video
            class="player"
            :src="result.videoUrl"
            :poster="result.posterUrl"
            controls
            playsinline
          />
        </div>

        <div class="footer-actions">
          <button class="al-cta al-cta--accent" @click="generate">Regenerar</button>
          <button class="al-cta al-cta--ghost" @click="$router.push('/video')">Terminar</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { learningAdapter, type VideoLearningResult } from '@/infrastructure/api/learningAdapter'

const route = useRoute()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const result = ref<VideoLearningResult | null>(null)
const errorMsg = ref('')
const isGenerating = ref(false)

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
  await nextTick()
  startLoading()
  try {
    const data = await learningAdapter.generateVideo({
      courseId: Number(route.params.courseId),
      topicId: Number(route.params.topicId),
      taskId: Number(route.params.taskId),
    })
    result.value = data
    status.value = 'ready'
    await nextTick()
    runReady()
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Ocurrió un error al generar el video.'
    status.value = 'error'
  } finally {
    isGenerating.value = false
  }
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
@import '@/styles/apple-tokens.css';

.head { padding: 16px 0 20px; }

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
  background: #1d1d1f;
}
.ring {
  position: absolute;
  width: 88px; height: 88px; border-radius: 50%;
  border: 1px solid rgba(29,29,31,0.20);
}
.ring--2 { border-color: rgba(29,29,31,0.12); }

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
  background: #d6d6d6;
}

.player-wrap {
  border-radius: var(--apple-r-card);
  overflow: hidden;
  background: #000;
  box-shadow: 0 12px 32px rgba(29,29,31,0.10);
}
.player {
  width: 100%;
  display: block;
  aspect-ratio: 16 / 9;
  background: #000;
}

.footer-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center;
  margin-top: 32px;
}
</style>
