<template>
  <div
    ref="container"
    class="lottie-animation"
    role="img"
    :aria-label="ariaLabel"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface AnimationItem {
  destroy(): void
  setSpeed(speed: number): void
  goToAndStop(value: number, isFrame?: boolean): void
  addEventListener(name: 'DOMLoaded', callback: () => void): void
}

interface LottieRuntime {
  loadAnimation(config: {
    container: HTMLElement
    renderer: 'svg'
    loop: boolean
    autoplay: boolean
    path: string
    rendererSettings: {
      preserveAspectRatio: string
      progressiveLoad: boolean
    }
  }): AnimationItem
}

declare global {
  interface Window {
    lottie?: LottieRuntime
  }
}

const props = withDefaults(defineProps<{
  path: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  ariaLabel?: string
  preserveAspectRatio?: string
}>(), {
  loop: true,
  autoplay: true,
  speed: 1,
  ariaLabel: 'Animacion',
  preserveAspectRatio: 'xMidYMid meet',
})

const container = ref<HTMLElement | null>(null)
let animation: AnimationItem | null = null
let runtimePromise: Promise<LottieRuntime> | null = null

function loadRuntime(): Promise<LottieRuntime> {
  if (window.lottie) return Promise.resolve(window.lottie)
  if (runtimePromise) return runtimePromise

  runtimePromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-lottie-runtime]')
    if (existing) {
      existing.addEventListener('load', () => window.lottie ? resolve(window.lottie) : reject(new Error('Lottie no inicializo')))
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Lottie')))
      return
    }

    const script = document.createElement('script')
    script.src = '/vendor/lottie_light.min.js'
    script.async = true
    script.defer = true
    script.dataset.lottieRuntime = 'true'
    script.onload = () => window.lottie ? resolve(window.lottie) : reject(new Error('Lottie no inicializo'))
    script.onerror = () => reject(new Error('No se pudo cargar Lottie'))
    document.head.appendChild(script)
  })

  return runtimePromise
}

async function load() {
  if (!container.value) return

  animation?.destroy()
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lottie = await loadRuntime()

  animation = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop && !prefersReducedMotion,
    autoplay: props.autoplay && !prefersReducedMotion,
    path: props.path,
    rendererSettings: {
      preserveAspectRatio: props.preserveAspectRatio,
      progressiveLoad: true,
    },
  })

  animation.setSpeed(props.speed)
  if (prefersReducedMotion) {
    animation.addEventListener('DOMLoaded', () => animation?.goToAndStop(170, true))
  }
}

onMounted(load)

watch(() => [props.path, props.loop, props.autoplay, props.speed, props.preserveAspectRatio], () => {
  void load()
})

onBeforeUnmount(() => {
  animation?.destroy()
  animation = null
})
</script>

<style scoped>
.lottie-animation {
  width: 100%;
  height: 100%;
  overflow: hidden;
  line-height: 0;
}

.lottie-animation :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
