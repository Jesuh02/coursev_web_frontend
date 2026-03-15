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
</style>
