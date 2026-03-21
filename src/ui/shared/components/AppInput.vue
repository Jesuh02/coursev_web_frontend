<template>
  <div class="input-field" :class="{ focused, error: !!error }">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-wrapper">
      <span v-if="$slots.prefix" class="input-prefix"><slot name="prefix" /></span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true; $emit('focus')"
        @blur="focused = false; $emit('blur')"
      />
      <span v-if="$slots.suffix" class="input-suffix"><slot name="suffix" /></span>
    </div>
    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  type?: string
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string]; focus: []; blur: [] }>()

const focused = ref(false)
</script>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: border-color 0.2s;
  overflow: hidden;
}

.focused .input-wrapper {
  border-color: var(--purple-light);
}

.error .input-wrapper {
  border-color: var(--red-netflix);
}

.input-wrapper input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--text-hint);
}

.input-prefix, .input-suffix {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--text-hint);
}

.input-error {
  font-size: 12px;
  color: var(--red-netflix);
}
</style>
