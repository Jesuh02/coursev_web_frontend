<template>
  <div class="subject-selection">
    <TopBar title="Seleccionar Materia" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar materia..." />

    <!-- Skeleton -->
    <div v-if="loading" class="list-wrap">
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="sk-icon" />
        <div class="sk-line sk-title" />
      </div>
    </div>

    <template v-else>
      <div v-if="filtered.length" class="list-header">
        <span class="list-count">{{ filtered.length }} {{ filtered.length === 1 ? 'materia' : 'materias' }}</span>
      </div>

      <div class="list-wrap">
        <button
          v-for="(subject, i) in filtered"
          :key="subject.id"
          class="subject-option"
          :style="{ animationDelay: `${i * 50}ms` }"
          @click="select(subject)"
        >
          <div class="subject-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
          <span class="subject-name">{{ subject.name }}</span>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#484848" stroke-width="2.5"><polyline points="9 18 15 12 9 6" /></svg>
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

.list-header { padding: 4px 20px 0; }

.list-count {
  font-size: 11px;
  font-weight: 600;
  color: #48484A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.list-wrap { padding: 4px 12px 40px; }

.subject-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 8px;
  border-radius: 14px;
  text-align: left;
  position: relative;
  transition: background 0.18s ease, transform 0.18s ease;
  animation: fadeSlide 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.subject-option::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 62px;
  right: 8px;
  height: 1px;
  background: rgba(255,255,255,0.04);
}

.subject-option:last-child::after { display: none; }

.subject-option:active {
  transform: scale(0.975);
  background: rgba(255,255,255,0.04);
}

@media (hover: hover) {
  .subject-option:hover { background: rgba(255,255,255,0.04); }
  .subject-option:hover .chevron { transform: translateX(3px); stroke: #BF5AF2; }
}

.chevron {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.18s ease;
}

.subject-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(191,90,242,0.08);
  border: 1px solid rgba(191,90,242,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subject-name {
  flex: 1;
  font-size: 14.5px;
  font-weight: 500;
  color: #F2F2F7;
  letter-spacing: -0.015em;
  line-height: 1.3;
}

/* ── Skeleton ── */
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 8px;
}

.sk-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #1c1c1e;
  flex-shrink: 0;
  animation: shimmer 1.4s ease infinite;
}

.sk-line {
  border-radius: 6px;
  background: #1c1c1e;
  animation: shimmer 1.4s ease infinite;
}

.sk-title { height: 13px; width: 55%; }

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>

