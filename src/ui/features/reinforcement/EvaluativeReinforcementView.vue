<template>
  <div class="evaluative-view">
    <TopBar title="Refuerzo Evaluativo" @back="$router.back()" />

    <div class="eval-content">
      <div class="eval-header">
        <h2 class="eval-title">Evaluación de Rendimiento</h2>
        <p class="eval-desc">Análisis de tu progreso en sesiones de refuerzo</p>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <p class="metric-value">0</p>
          <p class="metric-label">Sesiones</p>
        </div>
        <div class="metric-card">
          <p class="metric-value">0%</p>
          <p class="metric-label">Promedio</p>
        </div>
        <div class="metric-card">
          <p class="metric-value">0</p>
          <p class="metric-label">Correctas</p>
        </div>
        <div class="metric-card">
          <p class="metric-value accent">+0%</p>
          <p class="metric-label">Mejora</p>
        </div>
      </div>

      <div class="start-session-section">
        <button class="start-session-btn" @click="$router.push('/course-selection?mode=reinforcement')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.5 6-4 7.4V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.6C7.5 15 5 12.5 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6M10 17h4"/></svg>
          Iniciar Sesión de Refuerzo
        </button>
      </div>

      <div class="history-section">
        <h3 class="section-title">Historial</h3>
        <EmptyState icon="bar-chart" message="Sin sesiones completadas aún" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/ui/shared/components/TopBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'
</script>

<style scoped>
.evaluative-view { min-height: 100vh; background: var(--bg-primary); }
.eval-content { padding: 16px; }

.eval-header { margin-bottom: 24px; }
.eval-title { font-size: 22px; font-weight: 700; color: #fff; }
.eval-desc { font-size: 14px; color: #8E8E93; margin-top: 4px; }

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 16px;
  background: #1C1C1E;
  border-radius: 16px;
  text-align: center;
}

.metric-value { font-size: 24px; font-weight: 700; color: #fff; }
.metric-value.accent { color: #30D158; }
.metric-label { font-size: 12px; color: #8E8E93; margin-top: 4px; }

.section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 12px; }

.start-session-section { margin-bottom: 24px; }

.start-session-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

.start-session-btn:hover { transform: scale(1.02); }
.start-session-btn:active { opacity: 0.8; transform: scale(0.98); }
</style>
