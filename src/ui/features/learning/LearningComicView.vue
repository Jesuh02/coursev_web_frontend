<template>
  <div class="al-root">
    <TopBar :title="result?.title || 'Cómic'" @back="$router.back()" />

    <div class="al-shell">

      <!-- Generating -->
      <div v-if="status === 'loading'" class="gen-state">
        <div class="gen-spinner" ref="spinnerEl">
          <span /><span /><span /><span />
        </div>
        <p class="al-eyebrow" style="text-align:center;">Generando con IA</p>
        <h2 class="al-display" style="text-align:center; font-size: 28px;">Componiendo tu cómic…</h2>
        <p class="al-sub" style="text-align:center;">
          Estamos enviando los materiales del tema al modelo de imagen y texto.
          Esto puede tardar unos segundos.
        </p>
        <ul class="gen-steps" ref="stepsEl">
          <li v-for="s in generationSteps" :key="s">{{ s }}</li>
        </ul>
      </div>

      <!-- Error -->
      <div v-else-if="status === 'error'" class="al-empty">
        <h2 class="al-display" style="font-size: 24px;">No pudimos generar tu cómic</h2>
        <p>{{ errorMsg }}</p>
        <div style="display:flex; gap: 10px; justify-content:center; margin-top: 16px; flex-wrap:wrap;">
          <button class="al-cta al-cta--accent" @click="generate">Reintentar</button>
          <button class="al-cta al-cta--ghost" @click="$router.back()">Volver</button>
        </div>
      </div>

      <!-- Ready -->
      <template v-else-if="status === 'ready' && result">
        <header class="head" ref="headEl">
          <p class="al-eyebrow">Cómic generado</p>
          <h1 class="al-display">{{ result.title }}</h1>
          <p class="al-sub">{{ result.panels.length }} paneles construidos a partir del tema y la tarea.</p>
        </header>

        <div class="panels" ref="panelsEl">
          <article v-for="(p, i) in result.panels" :key="i" class="panel-card">
            <div class="panel-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="panel-image">
              <img v-if="p.imageUrl" :src="p.imageUrl" :alt="`Panel ${i + 1}`" />
              <div v-else class="panel-image-ph">🎨</div>
            </div>
            <div v-if="p.dialogue" class="panel-dialogue">"{{ p.dialogue }}"</div>
            <p class="panel-caption">{{ p.caption }}</p>
          </article>
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
import { learningAdapter, type ComicResult } from '@/infrastructure/api/learningAdapter'

const route = useRoute()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const result = ref<ComicResult | null>(null)
const errorMsg = ref('')

const spinnerEl = ref<HTMLElement | null>(null)
const stepsEl = ref<HTMLElement | null>(null)
const headEl = ref<HTMLElement | null>(null)
const panelsEl = ref<HTMLElement | null>(null)

const generationSteps = [
  'Leyendo documentos del tema…',
  'Construyendo el guion con el modelo de texto…',
  'Pintando los paneles con el modelo de imagen…',
  'Ensamblando la historia…',
]

async function generate() {
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
    errorMsg.value = e instanceof Error ? e.message : 'Ocurrió un error al generar el cómic.'
    status.value = 'error'
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
      opacity: [0, 1], translateY: [14, 0],
      delay: utils.stagger(80), duration: 550, ease: 'outCubic',
    })
  }
  if (panelsEl.value) {
    const cards = Array.from(panelsEl.value.children) as HTMLElement[]
    animate(cards, {
      opacity: [0, 1], translateY: [28, 0], scale: [0.96, 1],
      delay: utils.stagger(110), duration: 700, ease: 'outCubic',
    })
  }
}

onMounted(generate)
</script>

<style scoped>
@import '@/styles/apple-tokens.css';

.head { padding: 16px 0 20px; }

.gen-state {
  padding: 60px 16px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.gen-spinner {
  display: flex; gap: 10px;
  margin-bottom: 16px;
}
.gen-spinner span {
  width: 14px; height: 14px; border-radius: 50%;
  background: linear-gradient(135deg, var(--apple-accent-cyan), var(--apple-accent-purple));
}
.gen-steps {
  list-style: none; padding: 0; margin: 18px 0 0;
  display: flex; flex-direction: column; gap: 10px;
  text-align: left; max-width: 420px;
}
.gen-steps li {
  font-size: 14px;
  color: var(--apple-graphite);
  padding-left: 22px;
  position: relative;
}
.gen-steps li::before {
  content: '';
  position: absolute; left: 0; top: 6px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--apple-accent-purple);
}

.panels {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 720px) { .panels { grid-template-columns: 1fr 1fr; } }

.panel-card {
  position: relative;
  background: var(--apple-snow);
  border-radius: var(--apple-r-card);
  padding: 20px;
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}
.panel-num {
  position: absolute; top: 14px; right: 16px;
  font-family: var(--apple-font-display);
  font-size: 13px; font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--apple-accent-purple);
}
.panel-image {
  width: 100%; aspect-ratio: 4 / 3;
  background: var(--apple-cloud);
  border-radius: 18px;
  overflow: hidden;
  display: grid; place-items: center;
  margin-bottom: 14px;
}
.panel-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
.panel-image-ph { font-size: 48px; opacity: .5; }

.panel-dialogue {
  font-family: var(--apple-font-display);
  font-size: 17px; font-weight: 600;
  color: var(--apple-ink);
  margin-bottom: 8px;
  line-height: 1.35;
}
.panel-caption {
  font-size: 14px; line-height: 1.5;
  color: var(--apple-graphite);
  margin: 0;
}

.footer-actions {
  display: flex; gap: 12px; flex-wrap: wrap;
  justify-content: center;
  margin-top: 32px;
}
</style>
