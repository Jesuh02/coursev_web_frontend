<template>
  <div class="ev-root">
    <!-- Ambient particles -->
    <div class="particles" aria-hidden="true">
      <span v-for="p in particles" :key="p.id" class="particle" :style="p.style" />
    </div>

    <TopBar title="Refuerzo con IA" @back="$router.back()" />

    <div class="ev-body">

      <!-- Hero -->
      <div class="hero">
        <div class="hero-mascot">🧠</div>
        <div class="hero-mascot-shadow" />
        <h1 class="hero-title">Centro de Refuerzo</h1>
        <p class="hero-sub">Practica con IA · Aprende más rápido</p>
      </div>

      <!-- Metric cards -->
      <div class="metrics-grid">
        <div v-for="(m, i) in metrics" :key="m.label" class="metric-card" :style="{ animationDelay: `${i * 80}ms` }">
          <div class="metric-icon">{{ m.icon }}</div>
          <span class="metric-value" :class="m.color">{{ m.value }}</span>
          <span class="metric-label">{{ m.label }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button class="cta-btn" @click="$router.push('/course-selection?mode=reinforcement')">
        <span class="cta-glow" />
        <span class="cta-icon">🚀</span>
        <span class="cta-text">Nueva Sesión</span>
        <svg class="cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <!-- History -->
      <div class="history-section">
        <div class="section-header">
          <span class="section-title">📋 Historial</span>
        </div>
        <div class="empty-history">
          <div class="empty-icon">🏆</div>
          <p class="empty-text">Completa tu primera sesión</p>
          <p class="empty-sub">Tu progreso aparecerá aquí</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/ui/shared/components/TopBar.vue'

const metrics = [
  { label: 'Sesiones',  value: '0',   icon: '📚', color: 'c-purple' },
  { label: 'Promedio',  value: '0%',  icon: '🎯', color: 'c-cyan'   },
  { label: 'Correctas', value: '0',   icon: '✅', color: 'c-green'  },
  { label: 'Mejora',    value: '+0%', icon: '📈', color: 'c-gold'   },
]

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  style: {
    left:              `${Math.random() * 100}%`,
    top:               `${Math.random() * 100}%`,
    animationDelay:    `${(Math.random() * 6).toFixed(1)}s`,
    animationDuration: `${(3 + Math.random() * 5).toFixed(1)}s`,
    width:             `${Math.round(4 + Math.random() * 7)}px`,
    height:            `${Math.round(4 + Math.random() * 7)}px`,
    opacity:           `${(0.12 + Math.random() * 0.3).toFixed(2)}`,
  },
}))
</script>

<style scoped>
.ev-root {
  min-height: 100vh;
  background: radial-gradient(ellipse at 30% 0%, rgba(98,0,238,.18) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(0,212,255,.10) 0%, transparent 55%),
              #0A0A0F;
  position: relative;
  overflow-x: hidden;
}

/* Particles */
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: #8B5CF6;
  animation: floatP linear infinite;
}

/* Body */
.ev-body {
  position: relative;
  z-index: 1;
  padding: 16px 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 480px;
  margin: 0 auto;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 0 4px;
}
.hero-mascot {
  font-size: 68px;
  line-height: 1;
  filter: drop-shadow(0 0 22px rgba(139,92,246,.6));
  animation: bounce 2.6s ease-in-out infinite;
}
.hero-mascot-shadow {
  width: 44px; height: 10px;
  border-radius: 50%;
  background: rgba(139,92,246,.3);
  filter: blur(4px);
  animation: shadowP 2.6s ease-in-out infinite;
  margin-top: 2px;
}
.hero-title {
  font-size: 26px; font-weight: 900; color: #fff;
  letter-spacing: -.5px; text-align: center; margin: 0;
}
.hero-sub {
  font-size: 13px; color: #8E8E93; text-align: center; margin: 0; letter-spacing: .2px;
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.metric-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 20px;
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  animation: cardIn .4s cubic-bezier(.34,1.2,.64,1) both;
  backdrop-filter: blur(8px);
}
.metric-icon { font-size: 24px; line-height: 1; }
.metric-value { font-size: 26px; font-weight: 900; line-height: 1.1; }
.metric-label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }

.c-purple { color: #8B5CF6; }
.c-cyan   { color: #00D4FF; }
.c-green  { color: #30D158; }
.c-gold   { color: #FFD700; }

/* CTA */
.cta-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, #6200EE, #8B5CF6);
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s;
}
.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(98,0,238,.45);
}
.cta-btn:active { transform: scale(.97); }
.cta-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  pointer-events: none;
}
.cta-icon { font-size: 22px; }
.cta-text { flex: 1; text-align: left; }
.cta-arrow { flex-shrink: 0; opacity: .7; }

/* History */
.history-section {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 22px;
  padding: 20px;
  backdrop-filter: blur(8px);
}
.section-header { margin-bottom: 16px; }
.section-title { font-size: 15px; font-weight: 700; color: #fff; }

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0 6px;
  text-align: center;
}
.empty-icon { font-size: 40px; opacity: .5; animation: pulse 2.4s ease-in-out infinite; }
.empty-text { font-size: 14px; font-weight: 600; color: #555; margin: 0; }
.empty-sub  { font-size: 12px; color: #444; margin: 0; }

/* Keyframes */
@keyframes floatP {
  0%   { transform: translateY(0) rotate(0); }
  50%  { transform: translateY(-28px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  45%, 55%  { transform: translateY(-13px) scale(1.05); }
}
@keyframes shadowP {
  0%, 100% { transform: scale(1);    opacity: .5; }
  50%       { transform: scale(.65); opacity: .2; }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px) scale(.95); }
  to   { opacity: 1; transform: none; }
}
@keyframes pulse {
  0%, 100% { opacity: .5; }
  50%       { opacity: .8; }
}
</style>
