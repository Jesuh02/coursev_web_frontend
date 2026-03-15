<template>
  <div class="explore-header">
    <div class="search-bar">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        class="search-input"
        type="text"
        placeholder="Buscar cursos, instructores..."
        :value="search"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      />
      <button class="icon-btn" @click="$emit('open-filter')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
      </button>
      <button class="icon-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-light)" stroke-width="2" stroke-linecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
          <line x1="2" y1="22" x2="22" y2="2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ search: string }>()
defineEmits<{ 'update:search': [value: string]; 'open-filter': [] }>()
</script>

<style scoped>
.explore-header {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  padding: 10px 16px;
  transition: border-color 0.3s;
}

.search-bar:focus-within {
  border-color: var(--purple-light);
}

.search-icon { flex-shrink: 0; }

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 15px;
  outline: none;
  padding: 0;
}

.search-input::placeholder { color: #8E8E93; }

.icon-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-btn:active { background: rgba(255, 255, 255, 0.1); }
</style>
