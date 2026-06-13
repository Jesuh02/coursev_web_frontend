<template>
  <main class="course-ai-onboarding">
    <LottieAnimation
      class="onboarding-animation"
      path="/animations/coursev-ai-onboarding.json"
      preserve-aspect-ratio="xMidYMid meet"
      aria-label="Animacion de creacion de cursos con IA en CourseV"
      :speed="1"
    />
  </main>
</template>

<script setup lang="ts">
import LottieAnimation from '@/ui/shared/components/LottieAnimation.vue'
</script>

<style scoped>
.course-ai-onboarding {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #03050b;
}

.onboarding-animation {
  width: min(100vw, calc(100dvh * 16 / 9));
  height: min(100dvh, calc(100vw * 9 / 16));
  aspect-ratio: 16 / 9;
}

.onboarding-animation :deep(text) {
  font-family: "Segoe UI", Arial, sans-serif !important;
}
</style>
