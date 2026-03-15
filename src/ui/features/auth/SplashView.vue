<template>
  <div class="splash">
    <div class="splash-glow"></div>
    <div class="splash-content">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cyan-accent)" stroke-width="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
      <h1 class="splash-brand">CourseV</h1>
      <div class="splash-loader">
        <div class="loader-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => router.replace('/login'), 2000)
})
</script>

<style scoped>
.splash {
  height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.splash-glow {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(106, 27, 154, 0.4), transparent 70%);
  animation: pulse-glow 2s infinite;
}

.splash-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.splash-brand {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--purple-light), var(--cyan-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.splash-loader {
  width: 120px;
  height: 3px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.loader-bar {
  width: 40%;
  height: 100%;
  background: var(--gold-accent);
  border-radius: 2px;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}
</style>
