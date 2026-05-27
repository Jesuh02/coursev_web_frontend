<template>
  <div class="al-root learning-home">
    <TopBar title="Aprendizaje" @back="$router.back()" />

    <div class="al-shell">
      <!-- Hero -->
      <section class="hero" ref="heroEl">
        <p class="al-eyebrow">Aprendizaje · IA</p>
        <h1 class="al-display hero-title">
          Aprende con cómics<br />
          y videos hechos por IA.
        </h1>
        <p class="al-sub hero-sub">
          Convertimos los temas y tareas de tu curso en historias visuales,
          a tu ritmo, con la estética de un producto premium.
        </p>

        <div class="hero-actions" ref="ctaEl">
          <button class="al-cta al-cta--accent" @click="start">
            <span>Comenzar</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button class="al-cta al-cta--ghost" @click="$router.push('/video')">Más tarde</button>
        </div>
      </section>

      <!-- Animated mascots -->
      <section class="scene-wrap" ref="sceneEl">
        <AnimalsScene />
      </section>

      <!-- Feature trio -->
      <section class="features">
        <div v-for="(f, i) in features" :key="f.title" class="feature al-card" :ref="el => setFeatureRef(el, i)">
          <div class="feature__icon" :style="{ background: f.bg, color: f.fg }">
            <span v-html="f.icon" />
          </div>
          <h3 class="feature__title">{{ f.title }}</h3>
          <p class="feature__body">{{ f.body }}</p>
        </div>
      </section>

      <!-- How it works -->
      <section class="steps">
        <h2 class="al-display steps__title">Tres pasos. Cero fricción.</h2>
        <ol class="steps__list">
          <li v-for="(s, i) in steps" :key="s.title" :ref="el => setStepRef(el, i)">
            <span class="step__num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h4>{{ s.title }}</h4>
              <p>{{ s.body }}</p>
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
import AnimalsScene from './components/AnimalsScene.vue'

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
  const heroChildren = heroEl.value ? Array.from(heroEl.value.querySelectorAll<HTMLElement>('.al-eyebrow, .hero-title, .hero-sub, .hero-actions')) : []
  if (heroChildren.length) {
    animate(heroChildren, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      delay: utils.stagger(110),
      ease: 'outCubic',
    })
  }
  if (sceneEl.value) {
    animate(sceneEl.value, { opacity: [0, 1], scale: [0.96, 1], duration: 900, delay: 250, ease: 'outCubic' })
  }
  if (featureRefs.length) {
    animate(featureRefs, {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 600,
      delay: utils.stagger(90, { start: 500 }),
      ease: 'outCubic',
    })
  }
  if (stepRefs.length) {
    animate(stepRefs, {
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 600,
      delay: utils.stagger(110, { start: 800 }),
      ease: 'outCubic',
    })
  }

  // Subtle CTA pulse
  if (ctaEl.value) {
    const primary = ctaEl.value.querySelector<HTMLElement>('.al-cta--accent')
    if (primary) {
      animate(primary, {
        boxShadow: [
          '0 0 0 0 rgba(124, 58, 237, 0.0)',
          '0 0 0 14px rgba(124, 58, 237, 0.0)',
          '0 0 0 0 rgba(124, 58, 237, 0.0)',
        ],
        translateY: [0, -2, 0],
        duration: 2400,
        loop: true,
        ease: 'inOutSine',
      })
    }
  }
})
</script>

<style scoped>
@import '@/styles/apple-tokens.css';

.learning-home { padding-top: 0; }

.hero {
  padding: 28px 4px 8px;
}
.hero-title { max-width: 520px; }
.hero-sub { max-width: 520px; margin-top: 8px; }
.hero-actions { display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; }

.scene-wrap { margin: 28px 0 36px; }

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 40px;
}
.feature { padding: 22px; }
.feature__icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: grid; place-items: center;
  font-size: 22px;
  margin-bottom: 14px;
}
.feature__title {
  font-family: var(--apple-font-display);
  font-size: 20px; font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
  color: var(--apple-ink);
}
.feature__body {
  font-size: 14px; line-height: 1.5;
  color: var(--apple-graphite); margin: 0;
}

.steps__title {
  font-size: 32px;
  margin-bottom: 18px;
}
.steps__list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 14px;
}
.steps__list li {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 18px 20px;
  background: var(--apple-snow);
  border-radius: 22px;
  border: 1px solid rgba(0,0,0,0.04);
}
.step__num {
  font-family: var(--apple-font-display);
  font-size: 14px; font-weight: 700;
  color: var(--apple-accent-purple);
  letter-spacing: 0.08em;
  min-width: 28px; padding-top: 2px;
}
.steps__list h4 {
  margin: 0 0 4px;
  font-family: var(--apple-font-display);
  font-size: 17px; font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--apple-ink);
}
.steps__list p {
  margin: 0;
  font-size: 14px; color: var(--apple-graphite); line-height: 1.5;
}

@media (max-width: 480px) {
  .al-display { font-size: 34px; }
  .steps__title { font-size: 26px; }
}
</style>
