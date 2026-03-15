<template>
  <div class="explore-header">
    <div class="header-blur">
      <div class="header-content">
        <h1 class="header-title">Explorar</h1>
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            class="search-input"
            type="text"
            placeholder="Buscar cursos..."
            :value="search"
            @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="filter-chips">
          <button
            v-for="f in filters"
            :key="f"
            class="chip"
            :class="{ active: f === activeFilter }"
            @click="$emit('filter', f)"
          >{{ f }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string
  activeFilter: string
}>()

defineEmits<{
  'update:search': [value: string]
  filter: [value: string]
}>()

const filters = ['Todos', 'Mis Cursos', 'Premium', 'Gratis', 'Inscritos']
</script>

<style scoped>
.explore-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.header-blur {
  backdrop-filter: blur(20px);
  background: rgba(10, 10, 20, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-content {
  padding: 16px 16px 12px;
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.search-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #fff;
  font-size: 15px;
}

.search-input::placeholder {
  color: #8E8E93;
}

.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  color: #8E8E93;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.chip.active {
  background: var(--purple-primary);
  color: #fff;
}
</style>
