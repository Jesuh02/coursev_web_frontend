<template>
  <div class="lh-root">
    <TopBar title="Aprendizaje" @back="$router.back()" />

    <div class="lh-shell">
      <!-- Hero -->
      <section class="lh-hero" ref="heroEl">
        <p class="lh-eyebrow">Aprendizaje · IA</p>
        <h1 class="lh-display">
          Aprende con cómics<br />
          y videos hechos por IA.
        </h1>
        <p class="lh-sub">
          Convertimos los temas y tareas de tu curso en historias visuales,
          a tu ritmo, con la estética de un producto premium.
        </p>

        <div class="lh-actions" ref="ctaEl">
          <button class="lh-btn lh-btn--primary" @click="start">
            <span>Comenzar</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button class="lh-btn lh-btn--ghost" @click="$router.push('/video')">Más tarde</button>
        </div>
      </section>

      <!-- Hero video -->
      <section class="lh-scene" ref="sceneEl">
        <video
          class="lh-video"
          src="https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/Ni%C3%B1o_corriendo_hacia_templo_cono%E2%80%A6_202605271506.mp4"
          autoplay
          loop
          muted
          playsinline
        />
      </section>

      <!-- Feature trio -->
      <section class="lh-features">
        <div
          v-for="(f, i) in features"
          :key="f.title"
          class="lh-feature"
          :ref="el => setFeatureRef(el, i)"
        >
          <div class="lh-feature__icon" :style="{ background: f.bg, color: f.fg }">
            <span v-html="f.icon" />
          </div>
          <h3 class="lh-feature__title">{{ f.title }}</h3>
          <p class="lh-feature__body">{{ f.body }}</p>
        </div>
      </section>

      <!-- How it works -->
      <section class="lh-steps">
        <h2 class="lh-section-heading">Tres pasos. Cero fricción.</h2>
        <ol class="lh-steps__list">
          <li
            v-for="(s, i) in steps"
            :key="s.title"
            class="lh-step"
            :ref="el => setStepRef(el, i)"
          >
            <span class="lh-step__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="lh-step__content">
              <h4 class="lh-step__title">{{ s.title }}</h4>
              <p class="lh-step__body">{{ s.body }}</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { animate, utils } from 'animejs'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()

const heroEl = ref<HTMLElement | null>(null)
const ctaEl = ref<HTMLElement | null>(null)
const sceneEl = ref<HTMLElement | null>(null)
const featureRefs: HTMLElement[] = []
const stepRefs: HTMLElement[] = []

function setFeatureRef(el: any, i: number) { if (el) featureRefs[i] = el }
function setStepRef(el: any, i: number) { if (el) stepRefs[i] = el }

const features = [
  {
    title: 'Cómic',
    body: 'Convierte el tema en una historia ilustrada por IA, panel a panel.',
    icon: '📖',
    bg: '#EDE9FE', fg: '#7C3AED',
  },
  {
    title: 'Video',
    body: 'Genera un video corto narrado a partir del contenido del curso.',
    icon: '🎬',
    bg: '#E0F7FB', fg: '#00838F',
  },
  {
    title: 'Profesional',
    body: 'Modelos de imagen y texto de primera línea vía OpenRouter.',
    icon: '✨',
    bg: '#FFF3E0', fg: '#E65100',
  },
]

const steps = [
  { title: 'Elige curso, tema y tarea', body: 'Selecciona el contenido a partir del cual se construirá tu historia.' },
  { title: 'Escoge el formato', body: 'Cómic ilustrado o video corto narrado, según prefieras aprender.' },
  { title: 'Disfruta', body: 'La IA usa los documentos del tema para componer la pieza final.' },
]

function start() {
  router.push('/learning/course-selection')
}

onMounted(() => {
  // Hero entrance — staggered
  const heroChildren = heroEl.value
    ? Array.from(heroEl.value.querySelectorAll<HTMLElement>('.lh-eyebrow, .lh-display, .lh-sub, .lh-actions'))
    : []
  if (heroChildren.length) {
    animate(heroChildren, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: utils.stagger(100),
      ease: 'outCubic',
    })
  }
  if (sceneEl.value) {
    animate(sceneEl.value, { opacity: [0, 1], scale: [0.97, 1], duration: 900, delay: 200, ease: 'outCubic' })
  }
  if (featureRefs.length) {
    animate(featureRefs, {
      opacity: [0, 1],
      translateY: [18, 0],
      duration: 600,
      delay: utils.stagger(80, { start: 450 }),
      ease: 'outCubic',
    })
  }
  if (stepRefs.length) {
    animate(stepRefs, {
      opacity: [0, 1],
      translateX: [-16, 0],
      duration: 550,
      delay: utils.stagger(100, { start: 750 }),
      ease: 'outCubic',
    })
  }

  // Subtle CTA float
  if (ctaEl.value) {
    const primary = ctaEl.value.querySelector<HTMLElement>('.lh-btn--primary')
    if (primary) {
      animate(primary, {
        translateY: [0, -3, 0],
        duration: 3200,
        loop: true,
        ease: 'inOutSine',
      })
    }
  }
})
</script>

<style scoped>
/* ─────────────────────────────────────────────
   Apple (España) · LearningHomeView
   Signal Blue = #0071e3  ·  Ink = #1d1d1f
   Snow = #fff  ·  Cloud = #f5f5f7
   Graphite = #707070  ·  Silver = #d6d6d6
───────────────────────────────────────────── */

/* ── Root & shell ── */
.lh-root {
  min-height: 100dvh;
  background: #fbfbfd;
  color: #1d1d1f;
  font-family: 'SF Pro Text', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

.lh-shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 20px 22px 100px;
}

/* ── Typography helpers ── */
.lh-eyebrow {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #707070;
  margin: 0 0 12px;
}

.lh-display {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.06;
  letter-spacing: -0.003em;
  color: #1d1d1f;
  margin: 0 0 14px;
}

.lh-sub {
  font-size: 17px;
  line-height: 1.47;
  letter-spacing: -0.016em;
  color: #707070;
  margin: 0;
  max-width: 460px;
}

.lh-section-heading {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.014em;
  color: #1d1d1f;
  margin: 0 0 20px;
}

/* ── Hero ── */
.lh-hero {
  padding: 32px 0 8px;
}

.lh-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
  flex-wrap: wrap;
}

/* ── Buttons ── */
.lh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'SF Pro Text', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.016em;
  border: none;
  cursor: pointer;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.lh-btn:hover  { opacity: 0.82; }
.lh-btn:active { transform: scale(0.97); }

.lh-btn--primary {
  background: #0071e3;
  color: #ffffff;
  padding: 12px 22px;
  border-radius: 980px;
}

.lh-btn--ghost {
  background: transparent;
  color: #0066cc;
  padding: 12px 2px;
  border-radius: 10px;
}

/* ── Scene / video ── */
.lh-scene {
  margin: 32px 0 44px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(29, 29, 31, 0.12);
}
.lh-video {
  width: 100%;
  display: block;
  border-radius: 24px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* ── Feature cards ── */
.lh-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 12px;
  margin-bottom: 52px;
}

.lh-feature {
  background: #ffffff;
  border-radius: 28px;
  padding: 22px 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.lh-feature:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(29, 29, 31, 0.09), 0 0 0 1px rgba(0, 0, 0, 0.03);
}

.lh-feature__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  margin-bottom: 16px;
}

.lh-feature__title {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.016em;
  color: #1d1d1f;
  margin: 0 0 6px;
}

.lh-feature__body {
  font-size: 13px;
  line-height: 1.52;
  letter-spacing: -0.006em;
  color: #707070;
  margin: 0;
}

/* ── Steps ── */
.lh-steps {
  margin-bottom: 40px;
}

.lh-steps__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lh-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px;
  background: #f5f5f7;
  border-radius: 22px;
}

.lh-step__num {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #0071e3;
  min-width: 26px;
  padding-top: 2px;
  flex-shrink: 0;
}

.lh-step__title {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.016em;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.lh-step__body {
  font-size: 13px;
  line-height: 1.52;
  letter-spacing: -0.006em;
  color: #707070;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .lh-display         { font-size: 34px; }
  .lh-section-heading { font-size: 24px; }
  .lh-sub             { font-size: 15px; }
  .lh-features        { grid-template-columns: 1fr 1fr; }
  .lh-btn             { font-size: 16px; }
}
</style>
