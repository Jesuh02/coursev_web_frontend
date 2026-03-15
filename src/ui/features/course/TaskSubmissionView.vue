<template>
  <div class="task-submission">
    <TopBar title="Entrega de Tarea" @back="$router.back()" />

    <div class="submission-content">
      <div class="status-card" :class="status">
        <div class="status-icon">
          <svg v-if="status === 'graded'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
          <svg v-else-if="status === 'pending'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <div>
          <p class="status-title">{{ statusLabel }}</p>
          <p v-if="grade" class="status-grade">Calificación: {{ grade }}/100</p>
        </div>
      </div>

      <div v-if="feedback" class="feedback-section">
        <h3 class="section-title">Retroalimentación</h3>
        <div class="feedback-card">
          <p>{{ feedback }}</p>
        </div>
      </div>

      <div class="submission-detail">
        <h3 class="section-title">Tu Entrega</h3>
        <div class="detail-card">
          <p class="detail-text">{{ submissionText || 'Sin respuesta enviada' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'

const status = ref<'not-submitted' | 'pending' | 'graded'>('not-submitted')
const grade = ref<number | null>(null)
const feedback = ref('')
const submissionText = ref('')

const statusLabel = computed(() => {
  if (status.value === 'graded') return 'Calificada'
  if (status.value === 'pending') return 'Pendiente de revisión'
  return 'No entregada'
})
</script>

<style scoped>
.task-submission { min-height: 100vh; background: var(--bg-primary); }
.submission-content { padding: 16px; display: flex; flex-direction: column; gap: 20px; }

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: #1C1C1E;
}

.status-card.graded { border-left: 4px solid #30D158; }
.status-card.pending { border-left: 4px solid #FF9500; }
.status-card.not-submitted { border-left: 4px solid #8E8E93; }

.status-icon { flex-shrink: 0; }
.status-title { font-size: 16px; font-weight: 600; color: #fff; }
.status-grade { font-size: 14px; color: #30D158; margin-top: 2px; }

.section-title { font-size: 14px; font-weight: 600; color: #8E8E93; margin-bottom: 8px; }

.feedback-card {
  padding: 14px;
  border-radius: 12px;
  background: rgba(48,209,88,0.08);
  color: #ccc;
  font-size: 14px;
  line-height: 1.5;
}

.detail-card {
  padding: 14px;
  border-radius: 12px;
  background: #1C1C1E;
}

.detail-text { font-size: 14px; color: #ccc; line-height: 1.5; }
</style>
