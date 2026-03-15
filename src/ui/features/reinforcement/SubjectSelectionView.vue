<template>
  <div class="subject-selection">
    <TopBar title="Seleccionar Materia" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar materia..." />

    <div class="subject-list">
      <button
        v-for="subject in filtered"
        :key="subject.id"
        class="subject-option"
        @click="select(subject)"
      >
        <div class="subject-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        </div>
        <span class="subject-name">{{ subject.name }}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>

    <EmptyState v-if="!filtered.length" icon="book" message="Sin materias disponibles" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Subject } from '@/domain/models'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const search = ref('')
const subjects = ref<Subject[]>([])

const filtered = computed(() => {
  if (!search.value) return subjects.value
  const q = search.value.toLowerCase()
  return subjects.value.filter(s => s.name.toLowerCase().includes(q))
})

function select(subject: Subject) {
  router.push(`/reinforcement/subject/${subject.id}`)
}
</script>

<style scoped>
.subject-selection { min-height: 100vh; background: var(--bg-primary); }
.subject-list { padding: 0 16px; }

.subject-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.subject-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(191,90,242,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subject-name { flex: 1; font-size: 15px; color: #fff; }
</style>
