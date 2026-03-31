<template>
  <div class="subject-selection">
    <TopBar title="Seleccionar Materia" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar materia..." />

    <div v-if="loading" class="loading-center">
      <div class="spinner" />
    </div>

    <template v-else>
      <div class="subject-list">
        <button
          v-for="(subject, i) in filtered"
          :key="subject.id"
          class="subject-option"
          :style="{ animationDelay: `${i * 55}ms` }"
          @click="select(subject)"
        >
          <div class="subject-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <span class="subject-name">{{ subject.name }}</span>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <EmptyState v-if="!filtered.length" icon="book" message="Sin materias disponibles" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Subject } from '@/domain/models'
import { subjectAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const route = useRoute()
const courseId = computed(() => Number(route.params.courseId))
const search = ref('')
const subjects = ref<Subject[]>([])
const loading = ref(false)

const filtered = computed(() => {
  if (!search.value) return subjects.value
  const q = search.value.toLowerCase()
  return subjects.value.filter(s => s.name.toLowerCase().includes(q))
})

onMounted(async () => {
  loading.value = true
  try {
    subjects.value = await subjectAdapter.getSubjectsByCourse(courseId.value)
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})

function select(subject: Subject) {
  router.push(`/course/${courseId.value}/select-topic?subjectId=${subject.id}`)
}
</script>

<style scoped>
.subject-selection { min-height: 100vh; background: var(--bg-primary); }
.subject-list { padding: 8px 16px 32px; }

.subject-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 12px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.22s ease, transform 0.22s ease;
  animation: slideUp 0.35s ease both;
}

.subject-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 66px;
  right: 0;
  height: 1px;
  background: rgba(255,255,255,0.05);
}

.subject-option:last-child::after { display: none; }

.subject-option:active {
  transform: scale(0.98);
  background: rgba(255,255,255,0.05);
}

@media (hover: hover) {
  .subject-option:hover { background: rgba(255,255,255,0.05); }
  .subject-option:hover .chevron { transform: translateX(4px); stroke: #BF5AF2; }
}

.chevron { flex-shrink: 0; transition: transform 0.22s ease, stroke 0.22s ease; }

.subject-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: rgba(191,90,242,0.1);
  border: 1px solid rgba(191,90,242,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subject-name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.01em;
}

/* ── Loading ── */
.loading-center {
  display: flex;
  justify-content: center;
  padding: 72px 0;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 2.5px solid rgba(191,90,242,0.18);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

