<template>
  <Teleport to="body">
    <div class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog-card">
        <div class="dialog-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="1.5">
            <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-4h6v4" />
          </svg>
          <h2 class="dialog-title">Selecciona tu institución</h2>
        </div>
        <p class="dialog-desc">Tu cuenta existe en más de una institución. Elige a cuál deseas ingresar:</p>

        <div class="tenant-list">
          <button
            v-for="match in matches"
            :key="match.tenant.id"
            class="tenant-option"
            @click="$emit('select', match)"
          >
            <div class="tenant-info">
              <span class="tenant-name">{{ match.tenant.name }}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { TenantLoginResult } from '@/infrastructure/api/tenantResolver'

defineProps<{ matches: TenantLoginResult[] }>()
defineEmits<{ select: [match: TenantLoginResult]; close: [] }>()
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  animation: fade-in 0.2s ease;
}

.dialog-card {
  width: 90%;
  max-width: 400px;
  background: var(--bg-card-hover, #1a1a2e);
  border-radius: 20px;
  padding: 28px 24px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  animation: slide-up 0.25s ease;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #fff);
}

.dialog-desc {
  font-size: 14px;
  color: var(--text-secondary, #a0a0b0);
  margin-bottom: 20px;
  line-height: 1.5;
}

.tenant-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.tenant-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-input, rgba(255,255,255,0.05));
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  color: var(--text-primary, #fff);
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  text-align: left;
}

.tenant-option:hover {
  background: rgba(139, 92, 246, 0.15);
  border-color: var(--purple-light, #8B5CF6);
}

.tenant-option:active {
  transform: scale(0.98);
}

.tenant-name {
  font-size: 15px;
  font-weight: 600;
}

.btn-cancel {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-secondary, #a0a0b0);
  font-size: 14px;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: rgba(255,255,255,0.05);
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
