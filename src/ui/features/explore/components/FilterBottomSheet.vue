<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="close" />
    </Transition>
    <Transition name="sheet">
      <div v-if="modelValue" class="sheet" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div class="drag-handle" />
        <h2 class="sheet-title">Filtrar Cursos</h2>
        <div class="filter-list">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-option"
            :class="{ active: f.key === active }"
            @click="select(f.key)"
          >
            <span class="filter-icon">{{ f.icon }}</span>
            <span class="filter-label" :class="{ highlight: f.key === active }">{{ f.label }}</span>
            <Transition name="check">
              <svg v-if="f.key === active" class="check" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" stroke="var(--purple-light)" stroke-width="2" />
                <path d="M8 12l2.5 2.5L16 9.5" stroke="var(--purple-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Transition>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ modelValue: boolean; active: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean]; select: [key: string] }>()

const filters = [
  { key: 'all',       icon: '📚', label: 'Todos los cursos' },
  { key: 'enrolled',  icon: '🎓', label: 'Mis inscripciones' },
  { key: 'purchased', icon: '🛒', label: 'Cursos comprados' },
  { key: 'created',   icon: '✏️', label: 'Mis cursos (Creados)' },
  { key: 'others',    icon: '⭐', label: 'Cursos de otros' },
  { key: 'premium',   icon: '💰', label: 'Cursos premium' },
  { key: 'free',      icon: '🆓', label: 'Cursos gratuitos' },
]

const touchStartY = ref(0)

function select(key: string) {
  emit('select', key)
  close()
}

function close() { emit('update:modelValue', false) }

function onTouchStart(e: TouchEvent) { touchStartY.value = e.touches[0].clientY }
function onTouchMove(e: TouchEvent) {
  if (e.touches[0].clientY - touchStartY.value > 60) close()
}
function onTouchEnd() {}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  background: #1c1c1e;
  border-radius: 24px 24px 0 0;
  padding: 12px 20px 32px;
  max-height: 85vh;
  overflow-y: auto;
}

.drag-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 auto 20px;
}

.sheet-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.25s, border-color 0.25s, transform 0.15s;
}

.filter-option:active { transform: scale(0.98); }

.filter-option.active {
  border-color: var(--purple-light);
  background: rgba(139, 92, 246, 0.08);
}

.filter-icon { font-size: 24px; flex-shrink: 0; }

.filter-label {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  text-align: left;
}

.filter-label.highlight { color: var(--purple-light); }

.check { flex-shrink: 0; }

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }

.sheet-enter-active { transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
.sheet-leave-active { transition: transform 0.25s cubic-bezier(0.55, 0, 1, 0.45); }
.sheet-enter-from,
.sheet-leave-to { transform: translateY(100%); }

.check-enter-active { transition: opacity 0.2s, transform 0.2s; }
.check-enter-from { opacity: 0; transform: scale(0.5); }
</style>
