<template>
  <div class="animals-scene" aria-hidden="true">
    <!-- Sky gradient backdrop -->
    <div class="scene-sky" />
    <div class="scene-sun" ref="sunEl" />
    <div class="scene-cloud cloud-a" ref="cloudA" />
    <div class="scene-cloud cloud-b" ref="cloudB" />
    <div class="scene-cloud cloud-c" ref="cloudC" />

    <!-- Ground -->
    <div class="scene-ground" />
    <div class="scene-hills" />

    <!-- Cartoon animals (inline SVG so we can animate them) -->
    <svg class="animal fox" ref="foxEl" viewBox="0 0 120 100">
      <!-- tail -->
      <path d="M85 70 q22 -6 30 -22 q-4 22 -22 30 z" fill="#FF8A65" />
      <path d="M105 50 q8 -2 12 -10 q-2 12 -10 16 z" fill="#fff" />
      <!-- body -->
      <ellipse cx="55" cy="68" rx="38" ry="22" fill="#FF7043" />
      <!-- belly -->
      <ellipse cx="55" cy="74" rx="26" ry="13" fill="#FFE0B2" />
      <!-- head -->
      <circle cx="32" cy="48" r="22" fill="#FF7043" />
      <!-- ears -->
      <polygon points="14,32 22,18 28,36" fill="#FF7043" />
      <polygon points="44,32 52,18 38,36" fill="#FF7043" />
      <polygon points="18,30 22,22 26,34" fill="#FFE0B2" />
      <polygon points="42,30 46,22 40,34" fill="#FFE0B2" />
      <!-- snout -->
      <ellipse cx="28" cy="56" rx="14" ry="10" fill="#FFE0B2" />
      <circle cx="22" cy="56" r="2.5" fill="#1d1d1f" />
      <!-- eyes (blink-able) -->
      <g class="eyes">
        <circle cx="28" cy="44" r="2.6" fill="#1d1d1f" />
        <circle cx="40" cy="44" r="2.6" fill="#1d1d1f" />
      </g>
      <!-- legs -->
      <rect x="35" y="82" width="8" height="14" rx="3" fill="#FF7043" />
      <rect x="60" y="82" width="8" height="14" rx="3" fill="#FF7043" />
    </svg>

    <svg class="animal owl" ref="owlEl" viewBox="0 0 100 110">
      <!-- body -->
      <ellipse cx="50" cy="60" rx="36" ry="42" fill="#7C3AED" />
      <ellipse cx="50" cy="68" rx="24" ry="30" fill="#EDE9FE" />
      <!-- ears -->
      <polygon points="18,22 30,8 34,28" fill="#7C3AED" />
      <polygon points="82,22 70,8 66,28" fill="#7C3AED" />
      <!-- eyes -->
      <circle cx="36" cy="46" r="12" fill="#fff" />
      <circle cx="64" cy="46" r="12" fill="#fff" />
      <g class="eyes">
        <circle cx="36" cy="46" r="6" fill="#1d1d1f" />
        <circle cx="64" cy="46" r="6" fill="#1d1d1f" />
        <circle cx="38" cy="44" r="2" fill="#fff" />
        <circle cx="66" cy="44" r="2" fill="#fff" />
      </g>
      <!-- beak -->
      <polygon points="46,58 54,58 50,68" fill="#FFB300" />
      <!-- wings -->
      <ellipse class="wing wing-l" ref="owlWingL" cx="18" cy="62" rx="10" ry="22" fill="#6D28D9" />
      <ellipse class="wing wing-r" ref="owlWingR" cx="82" cy="62" rx="10" ry="22" fill="#6D28D9" />
      <!-- feet -->
      <rect x="40" y="98" width="6" height="10" rx="2" fill="#FFB300" />
      <rect x="54" y="98" width="6" height="10" rx="2" fill="#FFB300" />
    </svg>

    <svg class="animal rabbit" ref="rabbitEl" viewBox="0 0 100 110">
      <!-- ears -->
      <ellipse class="ear ear-l" ref="rabbitEarL" cx="38" cy="22" rx="8" ry="22" fill="#fff" />
      <ellipse class="ear ear-r" ref="rabbitEarR" cx="62" cy="22" rx="8" ry="22" fill="#fff" />
      <ellipse cx="38" cy="22" rx="3.5" ry="14" fill="#FF6E97" />
      <ellipse cx="62" cy="22" rx="3.5" ry="14" fill="#FF6E97" />
      <!-- head -->
      <circle cx="50" cy="56" r="26" fill="#fff" />
      <!-- cheek blush -->
      <circle cx="34" cy="64" r="5" fill="#FFC1D5" opacity="0.85" />
      <circle cx="66" cy="64" r="5" fill="#FFC1D5" opacity="0.85" />
      <!-- eyes -->
      <g class="eyes">
        <circle cx="42" cy="54" r="3" fill="#1d1d1f" />
        <circle cx="58" cy="54" r="3" fill="#1d1d1f" />
      </g>
      <!-- nose -->
      <polygon points="48,62 52,62 50,66" fill="#FF6E97" />
      <!-- body -->
      <ellipse cx="50" cy="92" rx="20" ry="14" fill="#fff" />
    </svg>

    <svg class="animal turtle" ref="turtleEl" viewBox="0 0 130 80">
      <!-- shell -->
      <ellipse cx="68" cy="44" rx="42" ry="26" fill="#00B8D4" />
      <ellipse cx="68" cy="40" rx="36" ry="20" fill="#26C6DA" />
      <!-- shell pattern -->
      <circle cx="56" cy="36" r="6" fill="#00838F" opacity="0.6" />
      <circle cx="74" cy="40" r="7" fill="#00838F" opacity="0.6" />
      <circle cx="86" cy="32" r="5" fill="#00838F" opacity="0.6" />
      <!-- head -->
      <circle cx="22" cy="46" r="12" fill="#66BB6A" />
      <circle cx="18" cy="44" r="2" fill="#1d1d1f" />
      <!-- legs -->
      <ellipse cx="38" cy="68" rx="8" ry="5" fill="#66BB6A" />
      <ellipse cx="96" cy="68" rx="8" ry="5" fill="#66BB6A" />
      <!-- tail -->
      <polygon points="108,46 120,42 116,52" fill="#66BB6A" />
    </svg>

    <!-- Sparkle particles -->
    <span v-for="n in 14" :key="n" class="sparkle" :ref="el => setSparkleRef(el, n - 1)" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { animate, createTimeline, utils } from 'animejs'

const sunEl = ref<HTMLElement | null>(null)
const cloudA = ref<HTMLElement | null>(null)
const cloudB = ref<HTMLElement | null>(null)
const cloudC = ref<HTMLElement | null>(null)
const foxEl = ref<SVGElement | null>(null)
const owlEl = ref<SVGElement | null>(null)
const owlWingL = ref<SVGElement | null>(null)
const owlWingR = ref<SVGElement | null>(null)
const rabbitEl = ref<SVGElement | null>(null)
const rabbitEarL = ref<SVGElement | null>(null)
const rabbitEarR = ref<SVGElement | null>(null)
const turtleEl = ref<SVGElement | null>(null)

const sparkleRefs: HTMLElement[] = []
function setSparkleRef(el: any, i: number) {
  if (el) sparkleRefs[i] = el as HTMLElement
}

const animations: ReturnType<typeof animate>[] = []

onMounted(() => {
  if (!foxEl.value) return

  // Sun — slow pulse
  animations.push(animate(sunEl.value!, {
    scale: [1, 1.08, 1],
    opacity: [0.9, 1, 0.9],
    duration: 4200,
    loop: true,
    ease: 'inOutSine',
  }))

  // Clouds — drift across
  animations.push(animate(cloudA.value!, { translateX: [-50, 50], duration: 9000, loop: true, ease: 'inOutSine', alternate: true }))
  animations.push(animate(cloudB.value!, { translateX: [40, -40], duration: 11000, loop: true, ease: 'inOutSine', alternate: true }))
  animations.push(animate(cloudC.value!, { translateX: [-30, 30], duration: 8000, loop: true, ease: 'inOutSine', alternate: true }))

  // Fox — happy bounce + tail-like rotation
  animations.push(animate(foxEl.value, {
    translateY: [0, -14, 0],
    rotate: [-2, 2, -2],
    duration: 2200,
    loop: true,
    ease: 'inOutQuad',
  }))

  // Owl — gentle hover, wing flap
  animations.push(animate(owlEl.value!, {
    translateY: [0, -10, 0],
    duration: 2600,
    loop: true,
    ease: 'inOutSine',
  }))
  if (owlWingL.value) animations.push(animate(owlWingL.value, { rotate: [-6, 14, -6], transformOrigin: '100% 50%', duration: 900, loop: true, ease: 'inOutSine' } as any))
  if (owlWingR.value) animations.push(animate(owlWingR.value, { rotate: [6, -14, 6], transformOrigin: '0% 50%', duration: 900, loop: true, ease: 'inOutSine' } as any))

  // Rabbit — hop
  const hop = createTimeline({ loop: true })
  hop.add(rabbitEl.value!, { translateY: [0, -22], duration: 380, ease: 'outQuad' })
     .add(rabbitEl.value!, { translateY: [-22, 0], duration: 360, ease: 'inQuad' })
     .add(rabbitEl.value!, { translateY: 0, duration: 1100 })
  if (rabbitEarL.value) animations.push(animate(rabbitEarL.value, { rotate: [-4, 6, -4], transformOrigin: '50% 100%', duration: 1800, loop: true, ease: 'inOutSine' } as any))
  if (rabbitEarR.value) animations.push(animate(rabbitEarR.value, { rotate: [4, -6, 4], transformOrigin: '50% 100%', duration: 1800, loop: true, ease: 'inOutSine' } as any))

  // Turtle — slow waddle across
  animations.push(animate(turtleEl.value!, {
    translateX: [-20, 20, -20],
    rotate: [-1, 1, -1],
    duration: 6000,
    loop: true,
    ease: 'inOutSine',
  }))

  // Sparkles — staggered twinkle
  if (sparkleRefs.length) {
    animations.push(animate(sparkleRefs, {
      opacity: [0, 1, 0],
      scale: [0.4, 1.2, 0.4],
      duration: 1800,
      delay: utils.stagger(140),
      loop: true,
      ease: 'inOutSine',
    }))
  }
})

onBeforeUnmount(() => {
  animations.forEach(a => { try { (a as any)?.pause?.() } catch {} })
})
</script>

<style scoped>
.animals-scene {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, #E0F7FB 0%, #EDE9FE 60%, #F5F5F7 100%);
  isolation: isolate;
}

.scene-sky {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.7), transparent 55%),
    radial-gradient(ellipse at 80% 0%, rgba(124,58,237,0.08), transparent 50%);
  pointer-events: none;
}
.scene-sun {
  position: absolute; top: 28px; right: 36px;
  width: 64px; height: 64px; border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFE082, #FFB300);
  box-shadow: 0 0 40px rgba(255,179,0,0.45);
}

.scene-cloud {
  position: absolute;
  background: #fff;
  border-radius: 999px;
  filter: blur(0.4px);
  box-shadow: 0 6px 20px rgba(29,29,31,0.06);
}
.cloud-a { top: 30px; left: 14%; width: 86px; height: 22px; }
.cloud-a::before, .cloud-a::after { content:''; position: absolute; background: #fff; border-radius: 50%; }
.cloud-a::before { width: 36px; height: 36px; top: -16px; left: 16px; }
.cloud-a::after { width: 28px; height: 28px; top: -12px; left: 46px; }

.cloud-b { top: 70px; left: 48%; width: 64px; height: 16px; opacity: .85; }
.cloud-b::before { content:''; position: absolute; width: 28px; height: 28px; top: -12px; left: 12px; background: #fff; border-radius: 50%; }

.cloud-c { top: 50px; right: 18%; width: 50px; height: 14px; opacity: .8; }
.cloud-c::before { content:''; position: absolute; width: 22px; height: 22px; top: -10px; left: 10px; background: #fff; border-radius: 50%; }

.scene-ground {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 70px;
  background: linear-gradient(180deg, #C8E6C9, #A5D6A7);
}
.scene-hills {
  position: absolute; left: -10%; right: -10%; bottom: 56px;
  height: 64px;
  background:
    radial-gradient(ellipse at 25% 100%, #A5D6A7 0 60px, transparent 61px),
    radial-gradient(ellipse at 65% 100%, #81C784 0 70px, transparent 71px),
    radial-gradient(ellipse at 90% 100%, #A5D6A7 0 50px, transparent 51px);
}

.animal { position: absolute; }
.fox    { width: 130px; height: auto; bottom: 22px; left: 16px; }
.owl    { width: 96px;  height: auto; top: 70px; left: 38%; }
.rabbit { width: 92px;  height: auto; bottom: 30px; left: 44%; }
.turtle { width: 110px; height: auto; bottom: 14px; right: 18px; }

.sparkle {
  position: absolute;
  width: 6px; height: 6px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(124,58,237,0.6);
  opacity: 0;
}
.sparkle:nth-child(1)  { top: 18%; left: 12%; }
.sparkle:nth-child(2)  { top: 26%; left: 28%; }
.sparkle:nth-child(3)  { top: 14%; left: 44%; }
.sparkle:nth-child(4)  { top: 32%; left: 58%; }
.sparkle:nth-child(5)  { top: 18%; left: 72%; }
.sparkle:nth-child(6)  { top: 24%; left: 88%; }
.sparkle:nth-child(7)  { top: 48%; left: 18%; }
.sparkle:nth-child(8)  { top: 46%; left: 36%; }
.sparkle:nth-child(9)  { top: 52%; left: 64%; }
.sparkle:nth-child(10) { top: 56%; left: 82%; }
.sparkle:nth-child(11) { top: 38%; left: 8%; }
.sparkle:nth-child(12) { top: 64%; left: 50%; }
.sparkle:nth-child(13) { top: 70%; left: 26%; }
.sparkle:nth-child(14) { top: 60%; left: 72%; }

@media (max-width: 480px) {
  .animals-scene { height: 260px; }
  .fox    { width: 100px; left: 8px; }
  .owl    { width: 78px; top: 56px; left: 36%; }
  .rabbit { width: 76px; left: 46%; }
  .turtle { width: 88px; right: 10px; }
  .scene-sun { width: 50px; height: 50px; top: 20px; right: 22px; }
}
</style>
