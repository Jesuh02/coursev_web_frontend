<template>
  <div class="search-bar" :class="{ focused }">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <button v-if="modelValue" class="clear-btn" @click="$emit('update:modelValue', '')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const focused = ref(false)
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 10px 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar.focused {
  border-color: var(--purple-light);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-bar svg {
  color: var(--text-hint);
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
}

.search-bar input::placeholder {
  color: var(--text-hint);
}

.clear-btn {
  display: flex;
  padding: 2px;
  color: var(--text-hint);
}

.clear-btn:hover {
  color: var(--text-primary);
}
</style>
