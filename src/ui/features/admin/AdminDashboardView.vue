<template>
  <div class="admin-dashboard">
    <TopBar title="Panel de Administración" @back="$router.back()" />

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
          <component :is="stat.iconComponent" />
        </div>
        <p class="stat-value">{{ stat.value }}</p>
        <p class="stat-label">{{ stat.label }}</p>
      </div>
    </div>

    <div class="quick-actions">
      <h3 class="section-title">Acciones Rápidas</h3>
      <div class="action-grid">
        <button class="action-card" @click="$router.push('/admin/database')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
          <span>Base de Datos</span>
        </button>
        <button class="action-card" @click="$router.push('/subjects')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          <span>Materias</span>
        </button>
        <button class="action-card" @click="$router.push('/course/create')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          <span>Crear Curso</span>
        </button>
        <button class="action-card" @click="$router.push('/content/upload')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span>Subir Contenido</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'

const stats = ref([
  { label: 'Usuarios', value: 0, color: '#BF5AF2', iconComponent: 'span' },
  { label: 'Cursos', value: 0, color: '#00D4FF', iconComponent: 'span' },
  { label: 'Tareas', value: 0, color: '#FF9500', iconComponent: 'span' },
  { label: 'Activos Hoy', value: 0, color: '#30D158', iconComponent: 'span' }
])
</script>

<style scoped>
.admin-dashboard { min-height: 100vh; background: var(--bg-primary); }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
}

.stat-card {
  padding: 16px;
  background: #1C1C1E;
  border-radius: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-value { font-size: 24px; font-weight: 700; color: #fff; }
.stat-label { font-size: 13px; color: #8E8E93; margin-top: 2px; }

.quick-actions { padding: 0 16px; }
.section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 12px; }

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #1C1C1E;
  border-radius: 16px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: transform 0.15s;
}

.action-card:hover { transform: scale(1.02); }
</style>
