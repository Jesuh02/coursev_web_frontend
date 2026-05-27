<template>
  <div class="animals-scene" aria-hidden="true">
    <div class="scene-sky" />

    <!-- Sun with rotating rays -->
    <div class="sun-wrap" ref="sunEl">
      <div class="sun-rays" ref="raysEl">
        <span v-for="r in 8" :key="r" class="ray" :style="`--a:${r*45}deg`" />
      </div>
      <div class="sun-core" />
    </div>

    <div class="scene-cloud cloud-a" ref="cloudA" />
    <div class="scene-cloud cloud-b" ref="cloudB" />
    <div class="scene-cloud cloud-c" ref="cloudC" />

    <!-- Ground & Trees -->
    <div class="scene-hills" />
    <div class="scene-ground" />
    <div class="tree tree-l" /><div class="tree tree-r" />

    <!-- ── FOX (bouncy mascot) ── -->
    <svg class="animal fox" ref="foxEl" viewBox="0 0 148 125">
      <!-- tail group (waggle) -->
      <g ref="foxTailEl">
        <path d="M100 86 q32 -10 44 -36 q-8 34 -34 48 z" fill="#FF8A65" />
        <path d="M134 60 q12 -4 16 -16 q-4 18 -14 22 z" fill="rgba(255,255,255,0.55)" />
      </g>
      <!-- body -->
      <ellipse cx="68" cy="84" rx="48" ry="30" fill="#FF7043" />
      <ellipse cx="68" cy="92" rx="34" ry="20" fill="#FFE0B2" />
      <!-- neck -->
      <ellipse cx="38" cy="72" rx="14" ry="10" fill="#FF7043" />
      <!-- head -->
      <circle cx="36" cy="52" r="30" fill="#FF7043" />
      <!-- ear tufts -->
      <polygon points="10,28 20,8 30,34" fill="#FF7043" />
      <polygon points="48,28 62,8 46,34" fill="#FF7043" />
      <polygon points="14,26 20,14 28,32" fill="#FFB3A0" />
      <polygon points="46,26 54,14 44,32" fill="#FFB3A0" />
      <!-- snout -->
      <ellipse cx="32" cy="64" rx="18" ry="13" fill="#FFE0B2" />
      <ellipse cx="30" cy="59" rx="4" ry="3" fill="#1d1d1f" />
      <!-- smile -->
      <path d="M22 70 q10 10 22 0" stroke="#1d1d1f" stroke-width="2.4" fill="none" stroke-linecap="round" />
      <!-- cheek blush -->
      <circle cx="16" cy="66" r="9" fill="#FF5252" opacity="0.22" />
      <circle cx="50" cy="66" r="7" fill="#FF5252" opacity="0.22" />
      <!-- eye whites -->
      <circle cx="26" cy="45" r="8" fill="#fff" />
      <circle cx="46" cy="45" r="8" fill="#fff" />
      <!-- pupils -->
      <circle cx="28" cy="44" r="5" fill="#1d1d1f" />
      <circle cx="48" cy="44" r="5" fill="#1d1d1f" />
      <circle cx="30" cy="42" r="2" fill="#fff" />
      <circle cx="50" cy="42" r="2" fill="#fff" />
      <!-- blink lids (animated) -->
      <g ref="foxLidsEl" opacity="0">
        <ellipse cx="26" cy="45" rx="10" ry="8" fill="#FF7043" />
        <ellipse cx="46" cy="45" rx="10" ry="8" fill="#FF7043" />
      </g>
      <!-- legs -->
      <rect x="50" y="104" width="12" height="18" rx="5" fill="#FF7043" />
      <rect x="76" y="104" width="12" height="18" rx="5" fill="#FF7043" />
    </svg>

    <!-- ── OWL (purple, graduation cap) ── -->
    <svg class="animal owl" ref="owlEl" viewBox="0 0 115 132">
      <!-- graduation cap -->
      <rect x="18" y="19" width="79" height="8" rx="2" fill="#1d1d1f" />
      <rect x="34" y="9" width="47" height="14" rx="3" fill="#1d1d1f" />
      <line x1="91" y1="23" x2="100" y2="40" stroke="#FFB300" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="100" cy="42" r="4.5" fill="#FFB300" />
      <!-- body -->
      <ellipse cx="57" cy="80" rx="44" ry="52" fill="#7C3AED" />
      <ellipse cx="57" cy="93" rx="30" ry="37" fill="#EDE9FE" />
      <!-- ear tufts -->
      <polygon points="20,34 32,12 40,38" fill="#6D28D9" />
      <polygon points="94,34 82,12 74,38" fill="#6D28D9" />
      <!-- wings -->
      <ellipse ref="owlWingL" cx="17" cy="84" rx="13" ry="30" fill="#6D28D9" />
      <ellipse ref="owlWingR" cx="97" cy="84" rx="13" ry="30" fill="#6D28D9" />
      <!-- eye rings -->
      <circle cx="40" cy="62" r="17" fill="#fff" />
      <circle cx="74" cy="62" r="17" fill="#fff" />
      <!-- pupils -->
      <circle cx="40" cy="62" r="10" fill="#1d1d1f" />
      <circle cx="74" cy="62" r="10" fill="#1d1d1f" />
      <circle cx="44" cy="58" r="4" fill="#fff" />
      <circle cx="78" cy="58" r="4" fill="#fff" />
      <!-- blink lids -->
      <g ref="owlLidsEl" opacity="0">
        <ellipse cx="40" cy="62" rx="17" ry="11" fill="#7C3AED" />
        <ellipse cx="74" cy="62" rx="17" ry="11" fill="#7C3AED" />
      </g>
      <!-- beak -->
      <polygon points="51,74 63,74 57,87" fill="#FFB300" />
      <!-- feet -->
      <rect x="45" y="127" width="10" height="10" rx="3" fill="#FFB300" />
      <rect x="60" y="127" width="10" height="10" rx="3" fill="#FFB300" />
    </svg>

    <!-- ── RABBIT (white & pink, hoppy) ── -->
    <svg class="animal rabbit" ref="rabbitEl" viewBox="0 0 112 128">
      <!-- ears -->
      <ellipse ref="rabbitEarL" cx="38" cy="26" rx="10" ry="28" fill="#fff" />
      <ellipse ref="rabbitEarR" cx="74" cy="26" rx="10" ry="28" fill="#fff" />
      <ellipse cx="38" cy="26" rx="4.5" ry="20" fill="#FF6E97" />
      <ellipse cx="74" cy="26" rx="4.5" ry="20" fill="#FF6E97" />
      <!-- head -->
      <circle cx="56" cy="72" r="33" fill="#fff" />
      <!-- cheeks -->
      <circle cx="34" cy="82" r="11" fill="#FFC1D5" opacity="0.62" />
      <circle cx="78" cy="82" r="11" fill="#FFC1D5" opacity="0.62" />
      <!-- pupils -->
      <circle cx="44" cy="68" r="7" fill="#1d1d1f" />
      <circle cx="68" cy="68" r="7" fill="#1d1d1f" />
      <circle cx="47" cy="65" r="2.8" fill="#fff" />
      <circle cx="71" cy="65" r="2.8" fill="#fff" />
      <!-- blink lids -->
      <g ref="rabbitLidsEl" opacity="0">
        <ellipse cx="44" cy="68" rx="9" ry="7" fill="#fff" />
        <ellipse cx="68" cy="68" rx="9" ry="7" fill="#fff" />
      </g>
      <!-- nose & mouth -->
      <polygon points="52,82 60,82 56,87" fill="#FF6E97" />
      <path d="M49 88 q7 5 14 0" stroke="#1d1d1f" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <!-- body -->
      <ellipse cx="56" cy="112" rx="25" ry="18" fill="#fff" />
      <ellipse cx="56" cy="116" rx="15" ry="10" fill="#FFF0F5" />
      <!-- fluffy tail -->
      <circle cx="72" cy="108" r="8" fill="#FFD6E7" />
    </svg>

    <!-- ── TURTLE (teal, wise & slow) ── -->
    <svg class="animal turtle" ref="turtleEl" viewBox="0 0 148 94">
      <!-- ground shadow -->
      <ellipse cx="74" cy="91" rx="46" ry="5" fill="#000" opacity="0.07" />
      <!-- front/back legs -->
      <ellipse cx="38" cy="78" rx="12" ry="7" fill="#66BB6A" />
      <ellipse cx="108" cy="78" rx="12" ry="7" fill="#66BB6A" />
      <ellipse cx="36" cy="22" rx="10" ry="6" fill="#66BB6A" />
      <ellipse cx="110" cy="22" rx="10" ry="6" fill="#66BB6A" />
      <!-- shell base -->
      <ellipse cx="74" cy="52" rx="50" ry="32" fill="#00B8D4" />
      <!-- shell dome -->
      <ellipse cx="74" cy="46" rx="44" ry="26" fill="#26C6DA" />
      <!-- hex pattern -->
      <polygon points="66,38 72,30 84,30 90,38 84,46 72,46" fill="#0097A7" opacity="0.5" />
      <polygon points="48,46 54,38 66,38 72,46 66,54 54,54" fill="#0097A7" opacity="0.42" />
      <polygon points="80,48 86,40 98,40 104,48 98,56 86,56" fill="#0097A7" opacity="0.42" />
      <!-- head -->
      <circle cx="24" cy="52" r="16" fill="#66BB6A" />
      <circle cx="20" cy="46" r="4" fill="#A5D6A7" opacity="0.38" />
      <!-- eye -->
      <circle cx="20" cy="49" r="3.5" fill="#1d1d1f" />
      <circle cx="21.5" cy="47" r="1.3" fill="#fff" />
      <!-- smile -->
      <path d="M14 58 q10 5 20 0" stroke="#1d1d1f" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <!-- tail -->
      <path d="M118 54 q20 -5 26 -15 q-3 20 -16 20 z" fill="#66BB6A" />
    </svg>

    <!-- Sparkle particles -->
    <span v-for="n in 18" :key="n" class="sparkle" :ref="el => setSparkleRef(el, n - 1)" />
    <!-- Floating emoji icons -->
    <span v-for="(e, i) in floatEmojis" :key="'fe'+i" class="float-icon" :ref="el => setIconRef(el, i)" :style="e.pos">{{ e.g }}</span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { animate, createTimeline, utils } from 'animejs'

const sunEl = ref<HTMLElement | null>(null)
const raysEl = ref<HTMLElement | null>(null)
const cloudA = ref<HTMLElement | null>(null)
const cloudB = ref<HTMLElement | null>(null)
const cloudC = ref<HTMLElement | null>(null)

const foxEl = ref<SVGElement | null>(null)
const foxTailEl = ref<SVGGElement | null>(null)
const foxLidsEl = ref<SVGGElement | null>(null)

const owlEl = ref<SVGElement | null>(null)
const owlLidsEl = ref<SVGGElement | null>(null)
const owlWingL = ref<SVGElement | null>(null)
const owlWingR = ref<SVGElement | null>(null)
const rabbitEl = ref<SVGElement | null>(null)
const rabbitEarL = ref<SVGElement | null>(null)
const rabbitEarR = ref<SVGElement | null>(null)
const rabbitLidsEl = ref<SVGGElement | null>(null)
const turtleEl = ref<SVGElement | null>(null)

const sparkleRefs: HTMLElement[] = []
function setSparkleRef(el: any, i: number) { if (el) sparkleRefs[i] = el as HTMLElement }

const floatEmojis = [
  { g: '⭐', pos: 'top:12%;left:9%' },
  { g: '💡', pos: 'top:10%;right:18%' },
  { g: '📚', pos: 'top:22%;left:30%' },
  { g: '✨', pos: 'top:35%;right:9%' },
  { g: '🎨', pos: 'top:48%;left:20%' },
  { g: '🏆', pos: 'top:16%;right:40%' },
]
const iconRefs: HTMLElement[] = []
function setIconRef(el: any, i: number) { if (el) iconRefs[i] = el as HTMLElement }

const anims: ReturnType<typeof animate>[] = []
const blinkTimers: ReturnType<typeof setInterval>[] = []

function doBlink(el: any) {
  if (!el) return
  animate(el, { opacity: [0, 1, 1, 0], duration: 180, ease: 'linear' })
}

onMounted(() => {
  if (!foxEl.value) return

  // Sun pulse + rays spin
  if (sunEl.value) {
    anims.push(animate(sunEl.value, { scale: [1, 1.1, 1], duration: 4000, loop: true, ease: 'inOutSine' }))
  }
  if (raysEl.value) {
    anims.push(animate(raysEl.value, { rotate: [0, 360], duration: 16000, loop: true, ease: 'linear' } as any))
  }

  // Clouds drift
  anims.push(animate(cloudA.value!, { translateX: [-55, 55], duration: 9500, loop: true, ease: 'inOutSine', alternate: true } as any))
  anims.push(animate(cloudB.value!, { translateX: [44, -44], duration: 12000, loop: true, ease: 'inOutSine', alternate: true } as any))
  anims.push(animate(cloudC.value!, { translateX: [-36, 36], duration: 8200, loop: true, ease: 'inOutSine', alternate: true } as any))

  // Fox — spring bounce with slight overshoot
  anims.push(animate(foxEl.value, {
    translateY: [0, -20, -6, -14, -2, 0],
    duration: 2400, loop: true, ease: 'inOutSine',
  }))
  // Fox tail wag
  if (foxTailEl.value) {
    anims.push(animate(foxTailEl.value, {
      rotate: [-10, 12, -10], transformOrigin: '0% 80%',
      duration: 700, loop: true, ease: 'inOutSine', alternate: true,
    } as any))
  }
  blinkTimers.push(setInterval(() => doBlink(foxLidsEl.value), 3400 + Math.random() * 2000))

  // Owl — float + wing flap
  anims.push(animate(owlEl.value!, { translateY: [0, -13, 0], duration: 2700, loop: true, ease: 'inOutSine' }))
  if (owlWingL.value) {
    anims.push(animate(owlWingL.value, { rotate: [-8, 18, -8], transformOrigin: '90% 20%', duration: 850, loop: true, ease: 'inOutSine' } as any))
  }
  if (owlWingR.value) {
    anims.push(animate(owlWingR.value, { rotate: [8, -18, 8], transformOrigin: '10% 20%', duration: 850, loop: true, ease: 'inOutSine' } as any))
  }
  blinkTimers.push(setInterval(() => doBlink(owlLidsEl.value), 4200 + Math.random() * 1800))

  // Rabbit — squash & stretch hop
  const hop = createTimeline({ loop: true })
  if (rabbitEl.value) {
    hop
      .add(rabbitEl.value, { scaleY: [1, 0.88], scaleX: [1, 1.1], duration: 80, ease: 'outQuad' } as any)
      .add(rabbitEl.value, { translateY: [0, -30], scaleY: [0.88, 1.18], scaleX: [1.1, 0.86], duration: 340, ease: 'outQuad' } as any)
      .add(rabbitEl.value, { translateY: [-30, 0], scaleY: [1.18, 0.82], scaleX: [0.86, 1.14], duration: 280, ease: 'inQuad' } as any)
      .add(rabbitEl.value, { scaleY: [0.82, 1], scaleX: [1.14, 1], duration: 200, ease: 'outElastic' } as any)
      .add(rabbitEl.value, { translateY: 0, duration: 1100 })
  }
  if (rabbitEarL.value) {
    anims.push(animate(rabbitEarL.value, { rotate: [-5, 8, -5], transformOrigin: '50% 100%', duration: 1700, loop: true, ease: 'inOutSine' } as any))
  }
  if (rabbitEarR.value) {
    anims.push(animate(rabbitEarR.value, { rotate: [5, -8, 5], transformOrigin: '50% 100%', duration: 1700, loop: true, ease: 'inOutSine' } as any))
  }
  blinkTimers.push(setInterval(() => doBlink(rabbitLidsEl.value), 3700 + Math.random() * 2200))

  // Turtle — slow gentle waddle
  anims.push(animate(turtleEl.value!, {
    translateX: [-22, 22, -22], rotate: [-1.5, 1.5, -1.5],
    duration: 6200, loop: true, ease: 'inOutSine',
  }))

  // Sparkles twinkle
  if (sparkleRefs.length) {
    anims.push(animate(sparkleRefs, {
      opacity: [0, 1, 0], scale: [0.3, 1.4, 0.3],
      duration: 2000, delay: utils.stagger(130), loop: true, ease: 'inOutSine',
    }))
  }

  // Float emojis bob
  if (iconRefs.length) {
    anims.push(animate(iconRefs, {
      translateY: [0, -10, 0], scale: [1, 1.18, 1],
      duration: 2800, delay: utils.stagger(220), loop: true, ease: 'inOutSine',
    }))
  }
})

onBeforeUnmount(() => {
  anims.forEach(a => { try { (a as any)?.pause?.() } catch {} })
  blinkTimers.forEach(t => clearInterval(t))
})
</script>

<style scoped>
.animals-scene {
  position: relative;
  width: 100%;
  height: 330px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, #DCEEFB 0%, #EDE9FE 62%, #F0FBF1 100%);
  isolation: isolate;
}

/* Sky overlay */
.scene-sky {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 18% 0%, rgba(255,255,255,0.55), transparent 55%),
    radial-gradient(ellipse at 82% 0%, rgba(124,58,237,0.07), transparent 52%);
  pointer-events: none;
}

/* Sun */
.sun-wrap {
  position: absolute; top: 24px; right: 34px;
  width: 64px; height: 64px;
}
.sun-core {
  position: absolute; inset: 0; border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #FFE082, #FFB300);
  box-shadow: 0 0 38px rgba(255,179,0,0.50);
}
.sun-rays {
  position: absolute; inset: -16px;
  transform-origin: center center;
}
.ray {
  position: absolute; top: 50%; left: 50%;
  width: 2.5px; height: 18px;
  margin-top: -40px; margin-left: -1.25px;
  transform-origin: bottom center;
  transform: rotate(var(--a));
  background: rgba(255,179,0,0.60);
  border-radius: 2px;
}

/* Clouds */
.scene-cloud {
  position: absolute;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(29,29,31,0.07);
}
.cloud-a { top: 28px; left: 14%; width: 88px; height: 22px; }
.cloud-a::before, .cloud-a::after { content:''; position: absolute; background: #fff; border-radius: 50%; }
.cloud-a::before { width: 36px; height: 36px; top: -15px; left: 16px; }
.cloud-a::after  { width: 28px; height: 28px; top: -11px; left: 48px; }
.cloud-b { top: 66px; left: 48%; width: 66px; height: 17px; opacity: .85; }
.cloud-b::before { content:''; position: absolute; width: 28px; height: 28px; top: -12px; left: 14px; background: #fff; border-radius: 50%; }
.cloud-c { top: 48px; right: 17%; width: 52px; height: 14px; opacity: .8; }
.cloud-c::before { content:''; position: absolute; width: 22px; height: 22px; top: -9px; left: 12px; background: #fff; border-radius: 50%; }

/* Trees */
.tree { position: absolute; bottom: 62px; z-index: 2; }
.tree::before, .tree::after { content:''; display: block; }
.tree::before {
  width: 0; height: 0; margin: 0 auto;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 44px solid #66BB6A;
}
.tree::after {
  width: 10px; height: 16px; margin: 0 auto;
  background: #795548; border-radius: 2px;
}
.tree-l { left: 14%; }
.tree-r { right: 12%; }

/* Ground & Hills */
.scene-ground {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 68px;
  background: linear-gradient(180deg, #C8E6C9, #A5D6A7);
}
.scene-hills {
  position: absolute; left: -8%; right: -8%; bottom: 54px;
  height: 66px;
  background:
    radial-gradient(ellipse at 22% 100%, #A5D6A7 0 64px, transparent 65px),
    radial-gradient(ellipse at 62% 100%, #81C784 0 72px, transparent 73px),
    radial-gradient(ellipse at 92% 100%, #A5D6A7 0 52px, transparent 53px);
}

/* Animals */
.animal { position: absolute; }
.fox    { width: 130px; height: auto; bottom: 20px; left: 14px; }
.owl    { width: 96px;  height: auto; top: 68px; left: 37%; }
.rabbit { width: 90px;  height: auto; bottom: 26px; left: 46%; }
.turtle { width: 112px; height: auto; bottom: 12px; right: 16px; }

/* Sparkles */
.sparkle {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  background: #fff; opacity: 0;
  box-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(124,58,237,0.6);
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
.sparkle:nth-child(13) { top: 72%; left: 26%; }
.sparkle:nth-child(14) { top: 62%; left: 74%; }
.sparkle:nth-child(15) { top: 10%; left: 35%; }
.sparkle:nth-child(16) { top: 42%; left: 92%; }
.sparkle:nth-child(17) { top: 55%; left: 44%; }
.sparkle:nth-child(18) { top: 30%; left: 4%; }

/* Floating emoji */
.float-icon {
  position: absolute; font-size: 20px; opacity: 0.9;
  filter: drop-shadow(0 2px 6px rgba(124,58,237,0.20));
  pointer-events: none; user-select: none;
}

@media (max-width: 480px) {
  .animals-scene { height: 270px; }
  .fox    { width: 100px; left: 8px; }
  .owl    { width: 80px; top: 58px; left: 35%; }
  .rabbit { width: 78px; left: 46%; }
  .turtle { width: 90px; right: 10px; }
  .sun-wrap { width: 50px; height: 50px; top: 18px; right: 20px; }
  .float-icon { font-size: 16px; }
  .tree { display: none; }
}
</style>
