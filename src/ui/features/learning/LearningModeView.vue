<template>
  <div class="al-root">
    <TopBar title="Tu modo de aprendizaje" @back="$router.back()" />

    <div class="al-shell">
      <header class="head" ref="headEl">
        <p class="al-eyebrow">Casi listo</p>
        <h1 class="al-display">¿Cómo prefieres aprender?</h1>
        <p class="al-sub">Elige el formato. Puedes volver y probar el otro cuando quieras.</p>
      </header>

      <div class="modes">
        <button class="mode-card mode-card--comic" ref="comicCardEl" @click="go('comic')">
          <div class="mode-icon-row">
            <div class="mode-icon" :style="{ background: '#EDE9FE', color: '#7C3AED' }">📖</div>
            <span class="mode-tag">Imágenes</span>
          </div>
          <h2 class="mode-title">Cómic ilustrado</h2>
          <p class="mode-body">
            Convertimos los documentos del tema en una secuencia de paneles
            ilustrados por IA, con diálogos y narración.
          </p>
          <span class="mode-cta">
            Crear cómic
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
          <div class="mode-deco mode-deco--comic" aria-hidden="true">
            <span class="panel p1" /><span class="panel p2" /><span class="panel p3" /><span class="panel p4" />
          </div>
        </button>

        <button class="mode-card mode-card--video" ref="videoCardEl" @click="go('video')">
          <div class="mode-icon-row">
            <div class="mode-icon" :style="{ background: '#E0F7FB', color: '#00838F' }">🎬</div>
            <span class="mode-tag">Video</span>
          </div>
          <h2 class="mode-title">Video corto narrado</h2>
          <p class="mode-body">
            Generamos un video con voz, transiciones y guion construido a partir
            del contenido subido al tema y la tarea.
          </p>
          <span class="mode-cta">
            Crear video
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
          <div class="mode-deco mode-deco--video" aria-hidden="true">
            <div class="play-orb" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()
const route = useRoute()

const headEl = ref<HTMLElement | null>(null)
const comicCardEl = ref<HTMLElement | null>(null)
const videoCardEl = ref<HTMLElement | null>(null)

function go(kind: 'comic' | 'video') {
  const c = route.params.courseId, t = route.params.topicId, k = route.params.taskId
  router.push(`/learning/course/${c}/topic/${t}/task/${k}/${kind}`)
}

onMounted(() => {
  if (headEl.value) {
    animate(Array.from(headEl.value.children) as HTMLElement[], {
      opacity: [0, 1], translateY: [16, 0],
      delay: utils.stagger(80), duration: 550, ease: 'outCubic',
    })
  }
  const cards = [comicCardEl.value, videoCardEl.value].filter(Boolean) as HTMLElement[]
  if (cards.length) {
    animate(cards, {
      opacity: [0, 1], translateY: [24, 0], scale: [0.97, 1],
      delay: utils.stagger(120, { start: 240 }),
      duration: 700, ease: 'outCubic',
    })
  }

  // Floating panel deco
  const panels = comicCardEl.value?.querySelectorAll<HTMLElement>('.panel')
  if (panels?.length) {
    animate(Array.from(panels), {
      translateY: [-4, 6, -4],
      duration: 3200,
      delay: utils.stagger(180),
      loop: true,
      ease: 'inOutSine',
    })
  }
  const orb = videoCardEl.value?.querySelector<HTMLElement>('.play-orb')
  if (orb) {
    animate(orb, {
      scale: [1, 1.08, 1],
      boxShadow: ['0 0 0 0 rgba(0,184,212,0.45)', '0 0 0 18px rgba(0,184,212,0)', '0 0 0 0 rgba(0,184,212,0)'],
      duration: 2400, loop: true, ease: 'inOutSine',
    })
  }
})
</script>

<style scoped>
@import '@/styles/apple-tokens.css';

.head { padding: 16px 0 24px; }

.modes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 720px) { .modes { grid-template-columns: 1fr 1fr; } }

.mode-card {
  position: relative;
  text-align: left;
  background: var(--apple-snow);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: var(--apple-r-card);
  padding: 28px;
  cursor: pointer;
  overflow: hidden;
  transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, border-color .25s;
}
.mode-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 48px rgba(29,29,31,0.10);
}
.mode-card--comic:hover { border-color: rgba(124,58,237,0.25); }
.mode-card--video:hover { border-color: rgba(0,184,212,0.25); }

.mode-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.mode-icon {
  width: 44px; height: 44px;
  border-radius: 14px;
  display: grid; place-items: center;
  font-size: 22px;
}
.mode-tag {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--apple-graphite);
}

.mode-title {
  font-family: var(--apple-font-display);
  font-size: 26px; font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--apple-ink);
  margin: 0 0 8px;
}
.mode-body {
  font-size: 15px; line-height: 1.5;
  color: var(--apple-graphite);
  margin: 0 0 22px;
  max-width: 380px;
}
.mode-cta {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 15px; font-weight: 600;
  color: var(--apple-accent-purple);
}
.mode-card--video .mode-cta { color: var(--apple-accent-cyan); }

.mode-deco {
  position: absolute;
  right: -10px; bottom: -10px;
  width: 160px; height: 160px;
  pointer-events: none;
  opacity: 0.85;
}
.mode-deco--comic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  padding: 16px;
}
.mode-deco--comic .panel {
  background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
  border-radius: 10px;
}
.mode-deco--comic .p2 { background: linear-gradient(135deg, #FFE0B2, #FFCC80); }
.mode-deco--comic .p3 { background: linear-gradient(135deg, #C8E6C9, #A5D6A7); }
.mode-deco--comic .p4 { background: linear-gradient(135deg, #FFC1D5, #FF8FAF); }

.mode-deco--video {
  display: grid; place-items: center;
}
.play-orb {
  width: 110px; height: 110px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #B2EBF2, #00B8D4 70%);
  position: relative;
}
.play-orb::after {
  content: '';
  position: absolute; top: 50%; left: 56%;
  width: 0; height: 0;
  transform: translate(-50%, -50%);
  border-left: 22px solid #fff;
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
}
</style>
