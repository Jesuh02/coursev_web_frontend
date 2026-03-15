<template>
  <div class="difficulty-selection">
    <TopBar title="Seleccionar Dificultad" @back="$router.back()" />

    <div class="difficulty-grid">
      <button
        v-for="d in difficulties"
        :key="d.value"
        class="difficulty-card"
        :class="d.value"
        @click="select(d.value)"
      >
        <div class="diff-icon">{{ d.emoji }}</div>
        <h3 class="diff-title">{{ d.label }}</h3>
        <p class="diff-desc">{{ d.description }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'

const router = useRouter()

const difficulties = [
  { value: 'easy', label: 'Fácil', emoji: '🟢', description: 'Preguntas básicas de comprensión' },
  { value: 'medium', label: 'Intermedio', emoji: '🟡', description: 'Aplicación de conceptos' },
  { value: 'hard', label: 'Difícil', emoji: '🔴', description: 'Análisis y pensamiento crítico' }
]

function select(_difficulty: string) {
  router.back()
}
</script>

<style scoped>
.difficulty-selection { min-height: 100vh; background: var(--bg-primary); }

.difficulty-grid {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.difficulty-card {
  padding: 20px;
  border-radius: 16px;
  background: #1C1C1E;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s;
  border-left: 4px solid transparent;
}

.difficulty-card:hover { transform: scale(1.02); }
.difficulty-card.easy { border-left-color: #30D158; }
.difficulty-card.medium { border-left-color: #FF9500; }
.difficulty-card.hard { border-left-color: #FF453A; }

.diff-icon { font-size: 28px; margin-bottom: 8px; }
.diff-title { font-size: 18px; font-weight: 600; color: #fff; }
.diff-desc { font-size: 13px; color: #8E8E93; margin-top: 4px; }
</style>
