<template>
  <div class="database-query">
    <TopBar title="Consulta SQL" @back="$router.back()" />

    <div class="query-section">
      <textarea
        v-model="query"
        class="query-input"
        placeholder="SELECT * FROM users LIMIT 10;"
        rows="4"
      />
      <AppButton :loading="running" full @click="runQuery">Ejecutar</AppButton>
    </div>

    <div v-if="error" class="error-card">
      <p>{{ error }}</p>
    </div>

    <div v-if="results.length" class="results-section">
      <div class="results-header">
        <span>{{ results.length }} resultados</span>
      </div>
      <div class="results-table-wrapper">
        <table class="results-table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in results" :key="i">
              <td v-for="col in columns" :key="col">{{ row[col] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const query = ref('')
const running = ref(false)
const error = ref('')
const results = ref<Record<string, unknown>[]>([])

const columns = computed(() => {
  if (!results.value.length) return []
  return Object.keys(results.value[0])
})

async function runQuery() {
  if (!query.value.trim()) return
  running.value = true
  error.value = ''
  await new Promise(r => setTimeout(r, 800))
  running.value = false
}
</script>

<style scoped>
.database-query { min-height: 100vh; background: var(--bg-primary); }

.query-section { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

.query-input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.08);
  color: #00D4FF;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
}

.query-input::placeholder { color: #666; }
.query-input:focus { border-color: #00D4FF; outline: none; }

.error-card {
  margin: 0 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255,69,58,0.1);
  color: #FF453A;
  font-size: 13px;
}

.results-section { padding: 16px; }

.results-header {
  font-size: 13px;
  color: #8E8E93;
  margin-bottom: 8px;
}

.results-table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  background: #1C1C1E;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.results-table th {
  padding: 10px 12px;
  text-align: left;
  color: #00D4FF;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  white-space: nowrap;
}

.results-table td {
  padding: 8px 12px;
  color: #ccc;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  white-space: nowrap;
}

.results-table tr:hover td { background: rgba(255,255,255,0.02); }
</style>
