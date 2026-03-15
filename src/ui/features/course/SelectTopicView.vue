<template>
  <div class="select-topic">
    <TopBar title="Seleccionar Tema" @back="$router.back()" />

    <SearchBar v-model="search" placeholder="Buscar tema..." />

    <div class="topic-list">
      <button
        v-for="topic in filtered"
        :key="topic.id"
        class="topic-option"
        @click="select(topic)"
      >
        <div class="topic-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
        </div>
        <span class="topic-name">{{ topic.title }}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>

    <EmptyState v-if="!filtered.length" icon="folder" message="Sin temas disponibles" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Topic } from '@/domain/models'
import TopBar from '@/ui/shared/components/TopBar.vue'
import SearchBar from '@/ui/shared/components/SearchBar.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const router = useRouter()
const search = ref('')
const topics = ref<Topic[]>([])

const filtered = computed(() => {
  if (!search.value) return topics.value
  const q = search.value.toLowerCase()
  return topics.value.filter(t => t.title.toLowerCase().includes(q))
})

function select(topic: Topic) {
  router.back()
}
</script>

<style scoped>
.select-topic { min-height: 100vh; background: var(--bg-primary); }
.topic-list { padding: 0 16px; }

.topic-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.topic-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0,212,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-name { flex: 1; font-size: 15px; color: #fff; }
</style>
