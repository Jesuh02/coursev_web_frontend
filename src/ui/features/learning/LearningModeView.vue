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
        <button class="mode-card" ref="comicCardEl" @click="go('comic')">
          <div class="mode-icon-row">
            <div class="mode-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7v14H4z"/><path d="M13 5h7v14h-7z"/><path d="M4 12h7M13 12h7"/></svg>
            </div>
            <span class="mode-tag">Imágenes</span>
          </div>
          <h2 class="mode-title">Cómic ilustrado</h2>
          <p class="mode-body">
            Convertimos los documentos del tema en una secuencia de paneles
            ilustrados por IA, con diálogos y narración.
          </p>
          <span class="mode-cta">
            Crear cómic
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
          <div class="mode-deco mode-deco--comic" aria-hidden="true">
            <span class="panel p1" /><span class="panel p2" /><span class="panel p3" /><span class="panel p4" />
          </div>
        </button>

        <button class="mode-card" ref="videoCardEl" @click="go('video')">
          <div class="mode-icon-row">
            <div class="mode-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="15" height="14" rx="2"/><path d="M18 9l4-2v10l-4-2z"/></svg>
            </div>
            <span class="mode-tag">Video</span>
          </div>
          <h2 class="mode-title">Video corto narrado</h2>
          <p class="mode-body">
            Generamos un video con voz, transiciones y guion construido a partir
            del contenido subido al tema y la tarea.
          </p>
          <span class="mode-cta">
            Crear video
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6" /></svg>
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

  // Subtle floating decoration
  const panels = comicCardEl.value?.querySelectorAll<HTMLElement>('.panel')
  if (panels?.length) {
    animate(Array.from(panels), {
      translateY: [-2, 3, -2],
      duration: 3600,
      delay: utils.stagger(200),
      loop: true,
      ease: 'inOutSine',
    })
  }
  const orb = videoCardEl.value?.querySelector<HTMLElement>('.play-orb')
  if (orb) {
    animate(orb, {
      scale: [1, 1.04, 1],
      duration: 2800, loop: true, ease: 'inOutSine',
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
  gap: 14px;
}
@media (min-width: 720px) { .modes { grid-template-columns: 1fr 1fr; } }

.mode-card {
  position: relative;
  text-align: left;
  background: #ffffff;
  border: none;
  border-radius: 28px;
  padding: 28px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition: transform .25s cubic-bezier(.22,1,.36,1),
              box-shadow .25s cubic-bezier(.22,1,.36,1);
}
.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(29,29,31,0.08);
}

.mode-icon-row { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.mode-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: grid; place-items: center;
  background: #f5f5f7;
  color: #1d1d1f;
}
.mode-tag {
  font-family: 'SF Pro Text', system-ui, sans-serif;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #707070;
}

.mode-title {
  font-family: 'SF Pro Display', system-ui, sans-serif;
  font-size: 24px; font-weight: 600;
  letter-spacing: -0.009em;
  color: #1d1d1f;
  margin: 0 0 8px;
}
.mode-body {
  font-size: 15px; line-height: 1.5;
  letter-spacing: -0.012em;
  color: #707070;
  margin: 0 0 22px;
  max-width: 380px;
}
.mode-cta {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 15px; font-weight: 600;
  letter-spacing: -0.014em;
  color: #0066cc;
  transition: gap .2s ease;
}
.mode-card:hover .mode-cta { gap: 10px; }

/* ---- Decorative background art (kept very subtle) ---- */
.mode-deco {
  position: absolute;
  right: -16px; bottom: -16px;
  width: 140px; height: 140px;
  pointer-events: none;
  opacity: 0.55;
}
.mode-deco--comic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  padding: 16px;
}
.mode-deco--comic .panel {
  background: #f5f5f7;
  border-radius: 8px;
}
.mode-deco--comic .p2 { background: #efeff2; }
.mode-deco--comic .p3 { background: #ebebef; }
.mode-deco--comic .p4 { background: #e7e7eb; }

.mode-deco--video {
  display: grid; place-items: center;
}
.play-orb {
  width: 96px; height: 96px; border-radius: 50%;
  background: #f5f5f7;
  position: relative;
}
.play-orb::after {
  content: '';
  position: absolute; top: 50%; left: 56%;
  width: 0; height: 0;
  transform: translate(-50%, -50%);
  border-left: 18px solid #d6d6d6;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
}
</style>
