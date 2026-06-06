<template>
  <div class="plan-card" :class="{ 'plan-card--updated': showUpdated }">
    <!-- Accent bar -->
    <div class="plan-accent" />

    <!-- Header -->
    <div class="plan-header">
      <div class="plan-icon">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <div class="plan-header-text">
        <div class="plan-eyebrow-row">
          <span class="plan-eyebrow">Propuesta de curso</span>
          <span v-if="showUpdated" class="plan-updated-badge">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Actualizado
          </span>
        </div>
        <h3 class="plan-title">{{ plan.title }}</h3>
      </div>
    </div>

    <!-- Description -->
    <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

    <!-- Meta tags -->
    <div class="plan-tags">
      <span v-if="plan.category" class="plan-tag">{{ plan.category }}</span>
      <span v-if="plan.level" class="plan-tag plan-tag--level">{{ plan.level }}</span>
      <span v-if="plan.durationWeeks" class="plan-tag">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {{ plan.durationWeeks }} semanas
      </span>
    </div>

    <!-- Stats -->
    <div class="plan-stats">
      <div class="plan-stat">
        <span class="stat-n">{{ plan.subjects.length }}</span>
        <span class="stat-l">materias</span>
      </div>
      <div class="stat-sep" />
      <div class="plan-stat">
        <span class="stat-n">{{ topicCount }}</span>
        <span class="stat-l">temas</span>
      </div>
      <div class="stat-sep" />
      <div class="plan-stat">
        <span class="stat-n">{{ taskCount }}</span>
        <span class="stat-l">tareas</span>
      </div>
    </div>

    <!-- Tree -->
    <div class="plan-tree">
      <div v-for="(subject, si) in plan.subjects" :key="si" class="subject-block">
        <button class="subject-row" @click="toggle(si)">
          <span class="subject-num">{{ si + 1 }}</span>
          <span class="subject-label">{{ subject.name }}</span>
          <span v-if="subject.topics?.length" class="subject-topic-count">{{ subject.topics.length }} temas</span>
          <svg class="subject-chevron" :class="{ 'subject-chevron--open': expanded.has(si) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48484A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="expanded.has(si)" class="subject-body">
          <p v-if="subject.description" class="subject-desc">{{ subject.description }}</p>
          <div v-for="(topic, ti) in subject.topics" :key="ti" class="topic-item">
            <div class="topic-line">
              <span class="topic-idx">{{ ti + 1 }}</span>
              <span class="topic-name">{{ topic.title }}</span>
              <span v-if="topic.tasks?.length" class="topic-task-badge">{{ topic.tasks.length }}</span>
            </div>
            <div v-if="topic.tasks?.length" class="task-list">
              <div v-for="(task, ki) in topic.tasks" :key="ki" class="task-row">
                <span class="task-dot" />
                <span class="task-name">{{ task.title }}</span>
                <span v-if="task.dueWeek" class="task-week">S{{ task.dueWeek }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Done state -->
    <div v-if="createdId" class="plan-done">
      <div class="done-check">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="done-text">
        <p class="done-title">Curso creado</p>
        <p class="done-sub">Listo para comenzar</p>
      </div>
      <button class="done-btn" @click="$emit('view', createdId!)">Ver curso →</button>
    </div>

    <template v-else>
      <p v-if="error" class="plan-error">{{ error }}</p>
      <div class="plan-footer">
        <p class="plan-footer-note">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#48484A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Pide ajustes por chat
        </p>
        <button class="plan-confirm" :disabled="creating" @click="$emit('confirm')">
          <span v-if="creating" class="plan-spin" />
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ creating ? 'Creando…' : 'Confirmar y crear' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface PlanTask {
  title: string
  description?: string
  dueWeek?: number | null
}
export interface PlanTopic {
  title: string
  description?: string
  tasks: PlanTask[]
}
export interface PlanSubject {
  name: string
  description?: string
  topics: PlanTopic[]
}
export interface CoursePlan {
  title: string
  description?: string
  category?: string
  level?: string
  durationWeeks?: number
  subjects: PlanSubject[]
}

const props = defineProps<{
  plan: CoursePlan
  creating?: boolean
  createdId?: number | null
  error?: string
  version?: number
}>()

defineEmits<{ confirm: []; view: [id: number] }>()

const expanded = ref<Set<number>>(new Set([0]))
function toggle(i: number) {
  expanded.value.has(i) ? expanded.value.delete(i) : expanded.value.add(i)
  expanded.value = new Set(expanded.value)
}

const showUpdated = computed(() => (props.version ?? 0) > 1)

const topicCount = computed(() =>
  props.plan.subjects.reduce((n, s) => n + (s.topics?.length ?? 0), 0)
)
const taskCount = computed(() =>
  props.plan.subjects.reduce(
    (n, s) => n + (s.topics?.reduce((t, tp) => t + (tp.tasks?.length ?? 0), 0) ?? 0),
    0
  )
)
</script>

<style scoped>
.plan-card {
  align-self: stretch;
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  transition: border-color 0.3s ease;
}
.plan-card--updated {
  border-color: rgba(191, 90, 242, 0.35);
}

/* Top accent gradient bar */
.plan-accent {
  height: 2px;
  background: linear-gradient(90deg, #BF5AF2 0%, #6E40C9 60%, transparent 100%);
  flex-shrink: 0;
}

.plan-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 0;
}

.plan-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(191,90,242,0.25) 0%, rgba(110,64,201,0.15) 100%);
  border: 1px solid rgba(191, 90, 242, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #BF5AF2;
  flex-shrink: 0;
  margin-top: 1px;
}

.plan-header-text { flex: 1; min-width: 0; }

.plan-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.plan-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #48484A;
}

.plan-updated-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.12);
  border: 1px solid rgba(191, 90, 242, 0.2);
  padding: 2px 7px;
  border-radius: 100px;
  text-transform: none;
}

.plan-title {
  font-size: 17px;
  font-weight: 700;
  color: #F5F5F7;
  line-height: 1.25;
  letter-spacing: -0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plan-desc {
  font-size: 13px;
  color: #636366;
  line-height: 1.5;
  padding: 8px 16px 0;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 16px 0;
}

.plan-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #8E8E93;
  padding: 3px 9px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.plan-tag--level {
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.08);
  border-color: rgba(191, 90, 242, 0.15);
}

.plan-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  margin: 12px 16px 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 0;
}

.plan-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-n {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.6px;
  line-height: 1;
}

.stat-l {
  font-size: 10.5px;
  color: #48484A;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.stat-sep {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.plan-tree {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 16px 0;
}

.subject-block {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s;
}
.subject-block:hover { border-color: rgba(255, 255, 255, 0.09); }

.subject-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.subject-num {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.subject-label {
  flex: 1;
  font-size: 13.5px;
  font-weight: 600;
  color: #E5E5EA;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subject-topic-count {
  font-size: 11px;
  color: #48484A;
  flex-shrink: 0;
}

.subject-chevron { flex-shrink: 0; transition: transform 0.22s ease; }
.subject-chevron--open { transform: rotate(180deg); }

.subject-body {
  padding: 2px 12px 12px 44px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subject-desc {
  font-size: 12px;
  color: #48484A;
  line-height: 1.45;
}

.topic-item { display: flex; flex-direction: column; gap: 4px; }

.topic-line { display: flex; align-items: center; gap: 8px; }

.topic-idx {
  font-size: 10px;
  font-weight: 700;
  color: #3A3A3C;
  width: 14px;
  text-align: right;
  flex-shrink: 0;
}

.topic-name { flex: 1; font-size: 13px; color: #C7C7CC; font-weight: 500; }

.topic-task-badge {
  font-size: 10px;
  font-weight: 600;
  color: #636366;
  background: rgba(255, 255, 255, 0.05);
  padding: 1px 6px;
  border-radius: 100px;
  flex-shrink: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 22px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.task-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(48, 209, 88, 0.7);
  flex-shrink: 0;
}

.task-name { flex: 1; font-size: 11.5px; color: #636366; }

.task-week {
  font-size: 10px;
  color: #3A3A3C;
  background: rgba(255, 255, 255, 0.04);
  padding: 1px 5px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.05);
}

.plan-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 12px;
}

.plan-footer-note {
  flex: 1;
  font-size: 11px;
  color: #3A3A3C;
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1.4;
}

.plan-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 20px;
  border-radius: 100px;
  background: linear-gradient(135deg, #BF5AF2 0%, #9B44D1 100%);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.12s, box-shadow 0.15s;
  letter-spacing: -0.1px;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(191, 90, 242, 0.35);
}
.plan-confirm:hover:not(:disabled) { opacity: 0.9; box-shadow: 0 6px 20px rgba(191, 90, 242, 0.45); }
.plan-confirm:active:not(:disabled) { transform: scale(0.97); box-shadow: 0 2px 8px rgba(191, 90, 242, 0.3); }
.plan-confirm:disabled { opacity: 0.35; cursor: default; box-shadow: none; }

.plan-spin {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.plan-error {
  font-size: 12px;
  color: #FF453A;
  background: rgba(255, 69, 58, 0.07);
  padding: 8px 12px;
  margin: 0 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 69, 58, 0.12);
}

.plan-done {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 16px;
  border-top: 1px solid rgba(48, 209, 88, 0.1);
  background: rgba(48, 209, 88, 0.04);
}

.done-check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #30D158 0%, #25A244 100%);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(48, 209, 88, 0.3);
}

.done-text { flex: 1; }
.done-title { font-size: 14px; font-weight: 600; color: #30D158; }
.done-sub { font-size: 11.5px; color: #3A3A3C; margin-top: 1px; }

.done-btn {
  padding: 9px 18px;
  border-radius: 100px;
  background: rgba(48, 209, 88, 0.12);
  color: #30D158;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(48, 209, 88, 0.2);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.done-btn:hover { background: rgba(48, 209, 88, 0.2); }
</style>
