<template>
  <div class="explore-header">
    <Transition name="header-fade">
      <div v-if="!collapsed" class="header-copy">
        <h1>Explorar Cursos</h1>
        <p>Descubre contenido nuevo y sigue aprendiendo cada dia.</p>
      </div>
    </Transition>

    <div class="search-bar" :class="{ collapsed }">
      <div class="liquid-overlay" aria-hidden="true"></div>
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <div v-if="activeFilterName" class="active-filter-chip" @click="$emit('clear-filter')">
        <span>{{ activeFilterName }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>

      <input
        class="search-input"
        type="text"
        placeholder="Buscar cursos, instructores..."
        :value="search"
        @input="onSearchInput"
      />

      <button class="icon-btn eye-btn" @click="$emit('toggle-collapse')" aria-label="Mostrar u ocultar resumen">
        <svg v-if="collapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
          <line x1="2" y1="22" x2="22" y2="2" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>

    <!-- Filtros estilo YouTube (visibles según rol) -->
    <div class="filter-chips-row">
      <button
        v-for="f in visibleFilters"
        :key="f.key"
        class="filter-chip"
        :class="{ active: activeFilter === f.key }"
        @click="$emit('quick-filter', f.key)"
      >{{ f.label }}</button>

      <button
        v-for="category in categoryOptions"
        :key="category.key"
        class="filter-chip filter-chip--category"
        :class="{ active: activeCategory === category.key }"
        @click="$emit('select-category', category.key)"
      >{{ category.label }}</button>
    </div>

    <Transition name="header-fade">
      <div v-if="!collapsed" class="stats-row">
        <button class="stat-card" @click="$emit('quick-filter', 'all')">
          <strong>{{ totalCourses }}</strong>
          <span>Cursos</span>
        </button>
        <button class="stat-card is-accent" @click="$emit('quick-filter', 'popular')">
          <strong>{{ popularCourses }}</strong>
          <span>Populares</span>
        </button>
        <button class="stat-card is-mint" @click="$emit('quick-filter', 'new')">
          <strong>{{ newCourses }}</strong>
          <span>Nuevos</span>
        </button>
      </div>
    </Transition>

    <div v-if="!collapsed" class="section-label">Todos los cursos</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{
  'update:search': [value: string]
  'clear-filter': []
  'toggle-collapse': []
  'quick-filter': [key: string]
  'select-category': [key: string]
}>()

const props = defineProps<{
  search: string
  collapsed: boolean
  activeFilterName: string | null
  activeFilter: string
  activeCategory: string
  categoryOptions: Array<{ key: string; label: string }>
  userRole: number
  totalCourses: number
  popularCourses: number
  newCourses: number
}>()

const BASE_FILTERS = [
  { key: 'all', label: 'Todos los cursos' },
  { key: 'enrolled', label: 'Mis inscripciones' },
]

const ADMIN_FILTERS = [
  { key: 'created', label: 'Mis Cursos' },
  { key: 'others', label: 'Cursos de otros' },
]

const visibleFilters = computed(() =>
  props.userRole === 3 ? [...BASE_FILTERS, ...ADMIN_FILTERS] : BASE_FILTERS,
)

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement | null
  emit('update:search', target?.value ?? '')
}
</script>

<style scoped>
.explore-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 10px 16px 8px;
  background:
    radial-gradient(120% 140% at 12% 8%, rgba(92, 163, 255, 0.18), transparent 42%),
    radial-gradient(110% 130% at 90% 18%, rgba(188, 138, 255, 0.17), transparent 45%),
    rgba(9, 12, 18, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-copy {
  margin-bottom: 10px;
  width: 100%;
  max-width: 680px;
}

.header-copy h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.1;
  font-weight: 800;
  color: #f8fbff;
  letter-spacing: 0.01em;
}

.header-copy p {
  margin: 5px 0 0;
  font-size: 13px;
  color: #8e95a9;
}

.search-bar {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 680px;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 28px;
  padding: 4px 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(255, 255, 255, 0.05),
    0 10px 28px rgba(7, 10, 18, 0.35);
  transition: border-color 0.28s ease, box-shadow 0.28s ease;
}

.search-bar:focus-within {
  border-color: rgba(177, 139, 255, 0.75);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 14px 34px rgba(38, 56, 108, 0.34),
    0 0 0 1px rgba(171, 134, 255, 0.38);
}

.search-bar.collapsed {
  border-color: rgba(162, 120, 255, 0.34);
}

.liquid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.16) 4%, rgba(255, 255, 255, 0.02) 36%, rgba(255, 255, 255, 0.12) 67%, rgba(255, 255, 255, 0.04) 100%),
    radial-gradient(110px 42px at 22% 14%, rgba(255, 255, 255, 0.17), transparent 75%);
}

.search-icon {
  flex-shrink: 0;
  color: #b790ff;
  z-index: 1;
}

.active-filter-chip {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 140px;
  padding: 6px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #f7f2ff;
  background: linear-gradient(135deg, rgba(144, 95, 255, 0.92), rgba(95, 160, 255, 0.86));
  box-shadow: 0 8px 18px rgba(83, 62, 132, 0.3);
  cursor: pointer;
}

.active-filter-chip span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  color: #f9fbff;
  font-size: 15px;
  font-weight: 500;
  outline: none;
  padding: 0;
  z-index: 1;
}

.search-input::placeholder { color: #9ca3b8; }

.icon-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #cfd7ea;
  z-index: 1;
  transition: background 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.icon-btn:active { transform: scale(0.96); }

.eye-btn {
  color: #b790ff;
}

.stats-row {
  margin-top: 10px;
  width: 100%;
  max-width: 680px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.stat-card {
  text-align: left;
  border-radius: 14px;
  padding: 10px 11px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
}

.stat-card strong {
  display: block;
  font-size: 18px;
  line-height: 1;
  color: #f9fbff;
  font-weight: 800;
}

.stat-card span {
  margin-top: 3px;
  display: block;
  font-size: 11px;
  color: #97a1b7;
}

.stat-card.is-accent {
  border-color: rgba(183, 144, 255, 0.42);
  background: rgba(160, 120, 255, 0.1);
}

.stat-card.is-mint {
  border-color: rgba(126, 236, 215, 0.34);
  background: rgba(68, 208, 175, 0.1);
}

.section-label {
  margin-top: 12px;
  width: 100%;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8b95ae;
}

.filter-chips-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 2px;
}

.filter-chips-row::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #c8d0e6;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
}

.filter-chip.active {
  background: #fff;
  border-color: #fff;
  color: #0a0a0a;
  font-weight: 700;
}

.filter-chip--category.active {
  background: linear-gradient(135deg, rgba(89, 141, 255, 0.24), rgba(191, 90, 242, 0.24));
  border-color: rgba(191, 90, 242, 0.45);
  color: #fff;
}

.header-fade-enter-active,
.header-fade-leave-active {
  transition: all 0.28s ease;
}

.header-fade-enter-from,
.header-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 720px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
