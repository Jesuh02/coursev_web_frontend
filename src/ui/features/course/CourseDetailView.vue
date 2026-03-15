<template>
  <div class="course-detail">
    <div class="hero-section">
      <div class="hero-toolbar">
        <button class="toolbar-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button v-if="isOwner" class="toolbar-btn" @click="$router.push(`/course/${courseId}/edit`)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </button>
      </div>

      <div class="hero-image">
        <img v-if="course?.thumbnailUri ?? course?.thumbnail_uri" :src="(course?.thumbnailUri ?? course?.thumbnail_uri)!" alt="" />
        <div class="hero-gradient" />
        <div class="hero-accent" />
      </div>
    </div>

    <div class="course-body">
      <div class="title-section">
        <h1 class="course-title">{{ course?.title ?? 'Cargando…' }}</h1>
        <p class="course-desc">{{ course?.description }}</p>
      </div>

      <CreatorInfo v-if="course" :course="course" />

      <div class="tabs-section">
        <div class="tabs">
          <button
            class="tab" :class="{ active: activeTab === 'docs' }"
            @click="activeTab = 'docs'"
          >Documentos <span class="tab-badge">{{ topics.length }}</span></button>
          <button
            class="tab" :class="{ active: activeTab === 'tasks' }"
            @click="activeTab = 'tasks'"
          >Tareas <span class="tab-badge">{{ taskCount }}</span></button>
        </div>

        <div v-if="activeTab === 'docs'" class="topics-list">
          <TopicItem
            v-for="topic in topics"
            :key="topic.id"
            :topic="topic"
            @click="$router.push(`/course/${courseId}/topic/${topic.id}`)"
          />
          <EmptyState v-if="!topics.length" icon="folder" message="Sin temas aún" />
        </div>

        <div v-else class="tasks-list">
          <EmptyState icon="clipboard" message="Sin tareas aún" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Course, Topic } from '@/domain/models'
import { useCourseStore } from '@/stores/courseStore'
import { topicAdapter, taskAdapter } from '@/infrastructure/api'
import { useAuthStore } from '@/stores/authStore'
import CreatorInfo from './components/CreatorInfo.vue'
import TopicItem from './components/TopicItem.vue'
import EmptyState from '@/ui/shared/components/EmptyState.vue'

const route = useRoute()
const authStore = useAuthStore()
const courseStore = useCourseStore()
const courseId = computed(() => route.params.courseId as string)
const course = ref<Course | null>(null)
const topics = ref<Topic[]>([])
const activeTab = ref<'docs' | 'tasks'>('docs')
const isOwner = ref(false)
const taskCount = ref(0)

onMounted(async () => {
  const id = Number(courseId.value)
  await courseStore.fetchCourseById(id)
  course.value = courseStore.current
  if (course.value) {
    isOwner.value = course.value.creatorUserId === authStore.user?.id || course.value.creator_user_id === authStore.user?.id
    try { topics.value = await topicAdapter.getTopicsByCourse(id) } catch { /* empty */ }
    try {
      const tasks = await taskAdapter.getTasksByCourse(id)
      taskCount.value = tasks.length
    } catch { /* empty */ }
  }
})
</script>

<style scoped>
.course-detail {
  min-height: 100vh;
  background: #080C1A;
}

.hero-section {
  position: relative;
  height: 260px;
}

.hero-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a2e;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(transparent, #080C1A);
}

.hero-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #00D4FF, #9C27B0);
}

.course-body {
  padding: 0 16px 40px;
  margin-top: -24px;
  position: relative;
}

.title-section {
  margin-bottom: 20px;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255,215,0,0.15);
  color: #FFD700;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.course-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.course-desc {
  font-size: 15px;
  color: #8E8E93;
  line-height: 1.5;
}

.tabs-section {
  margin-top: 24px;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 16px;
}

.tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #8E8E93;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab.active {
  color: #00D4FF;
  border-bottom-color: #00D4FF;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255,255,255,0.1);
  font-size: 11px;
  margin-left: 6px;
}
</style>
