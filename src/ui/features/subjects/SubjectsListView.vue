<template>
  <div class="subjects-list">
    <TopBar title="Materias" @back="$router.back()">
      <template #right>
        <button class="add-btn" @click="$router.push('/subjects/create')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </template>
    </TopBar>

    <SearchBar v-model="search" placeholder="Buscar materia..." />

    <div v-if="filtered.length" class="subject-grid">
      <div
        v-for="subject in filtered"
        :key="subject.id"
        class="subject-card"
      >
        <div class="subject-thumb">
          <img v-if="subject.thumbnailUrl" :src="subject.thumbnailUrl" alt="" />
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
        </div>
        <h3 class="subject-name">{{ subject.name }}</h3>
        <p class="subject-courses">{{ subject.courseCount ?? 0 }} cursos</p>
      </div>
    </div>

    <EmptyState v-else icon="book" message="Sin materias creadas" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

interface SubjectItem {
  id: string
  name: string
  thumbnailUrl?: string
  courseCount?: number
}

const search = ref('')
const subjects = ref<SubjectItem[]>([])

const filtered = computed(() => {
  if (!search.value) return subjects.value
  const q = search.value.toLowerCase()
  return subjects.value.filter(s => s.name.toLowerCase().includes(q))
})
</script>

<style scoped>
.subjects-list { min-height: 100vh; background: var(--bg-primary); padding-bottom: 40px; }

.add-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  padding: 16px;
}

.subject-card {
  padding: 20px;
  background: #1C1C1E;
  border-radius: 16px;
  text-align: center;
}

.subject-thumb {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(191,90,242,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  overflow: hidden;
}

.subject-thumb img { width: 100%; height: 100%; object-fit: cover; }
.subject-name { font-size: 15px; font-weight: 600; color: #fff; }
.subject-courses { font-size: 12px; color: #8E8E93; margin-top: 4px; }
</style>
