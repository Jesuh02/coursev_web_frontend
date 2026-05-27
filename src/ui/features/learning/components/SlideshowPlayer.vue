<template>
  <div class="ss-root" :style="{ aspectRatio: '16/9' }">
    <transition name="ss-fade" mode="out-in">
      <img
        :key="current"
        class="ss-img"
        :src="currentSlide.imageUrl || poster || ''"
        :alt="currentSlide.narration"
      />
    </transition>

    <!-- narration bar -->
    <div class="ss-caption">
      <p class="ss-text">{{ currentSlide.narration }}</p>
    </div>

    <!-- progress dots -->
    <div class="ss-dots" role="tablist" :aria-label="'Escena ' + (current + 1) + ' de ' + slides.length">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="ss-dot"
        :class="{ 'ss-dot--active': i === current }"
        role="tab"
        :aria-selected="i === current"
        :aria-label="'Escena ' + (i + 1)"
        @click="goTo(i)"
      />
    </div>

    <!-- thin progress bar -->
    <div class="ss-bar">
      <div class="ss-bar-fill" :style="{ width: progressPct + '%' }" />
    </div>

    <!-- play / pause -->
    <div class="ss-controls">
      <button class="ss-btn" @click="toggle" :aria-label="playing ? 'Pausar' : 'Reproducir'">
        <svg v-if="playing" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
      </button>
      <span class="ss-counter">{{ current + 1 }} / {{ slides.length }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { VideoSlide } from '@/infrastructure/api/learningAdapter'

const props = defineProps<{
  slides: VideoSlide[]
  poster?: string
}>()

const current = ref(0)
const playing = ref(true)
const elapsed = ref(0)

const currentSlide = computed(() => props.slides[current.value] ?? props.slides[0])
const slideDuration = computed(() => (currentSlide.value.duration || 8) * 1000) // ms
const progressPct = computed(() => Math.min(100, (elapsed.value / slideDuration.value) * 100))

let raf = 0
let last = 0

function tick(ts: number) {
  if (!playing.value) { last = ts; raf = requestAnimationFrame(tick); return }
  const delta = last ? ts - last : 0
  last = ts
  elapsed.value += delta
  if (elapsed.value >= slideDuration.value) {
    next()
  }
  raf = requestAnimationFrame(tick)
}

function next() {
  current.value = (current.value + 1) % props.slides.length
  elapsed.value = 0
}

function goTo(i: number) {
  current.value = i
  elapsed.value = 0
  playing.value = true
}

function toggle() {
  playing.value = !playing.value
}

onMounted(() => { raf = requestAnimationFrame(tick) })
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.ss-root {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: inherit;
  overflow: hidden;
  user-select: none;
}

.ss-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ss-caption {
  position: absolute;
  bottom: 40px;
  left: 0; right: 0;
  padding: 10px 16px;
  background: linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%);
}
.ss-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  max-width: 560px;
}

.ss-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.2);
}
.ss-bar-fill {
  height: 100%;
  background: var(--apple-ink, #0071e3);
  transition: width 0.1s linear;
}

.ss-dots {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 5px;
}
.ss-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  background: rgba(255,255,255,0.4);
  transition: background 0.2s, transform 0.2s;
}
.ss-dot--active {
  background: #fff;
  transform: scale(1.3);
}

.ss-controls {
  position: absolute;
  bottom: 8px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ss-btn {
  display: grid; place-items: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(4px);
}
.ss-btn:hover { background: rgba(255,255,255,0.28); }
.ss-counter {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

/* fade transition */
.ss-fade-enter-active,
.ss-fade-leave-active { transition: opacity 0.5s ease; }
.ss-fade-enter-from,
.ss-fade-leave-to { opacity: 0; }
</style>
