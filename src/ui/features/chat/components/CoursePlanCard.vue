<template>
  <div class="plan-card">
    <div class="plan-header">
      <div class="plan-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      </div>
      <div>
        <p class="plan-eyebrow">Propuesta de curso</p>
        <h3 class="plan-title">{{ plan.title }}</h3>
      </div>
    </div>

    <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

    <div class="plan-tags">
      <span v-if="plan.category" class="plan-tag">{{ plan.category }}</span>
      <span v-if="plan.level" class="plan-tag">{{ plan.level }}</span>
      <span v-if="plan.durationWeeks" class="plan-tag">{{ plan.durationWeeks }} sem</span>
    </div>

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

    <div class="plan-tree">
      <div v-for="(subject, si) in plan.subjects" :key="si" class="subject-block">
        <button class="subject-row" @click="toggle(si)">
          <span class="subject-num">{{ si + 1 }}</span>
          <span class="subject-label">{{ subject.name }}</span>
          <svg class="subject-chevron" :class="{ 'subject-chevron--open': expanded.has(si) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48484A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="expanded.has(si)" class="subject-body">
          <p v-if="subject.description" class="subject-desc">{{ subject.description }}</p>
          <div v-for="(topic, ti) in subject.topics" :key="ti" class="topic-item">
            <div class="topic-line">
              <span class="topic-idx">{{ ti + 1 }}</span>
              <span class="topic-name">{{ topic.title }}</span>
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

    <div v-if="createdId" class="plan-done">
      <div class="done-check">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <p class="done-title">Curso creado</p>
        <p class="done-sub">Listo para comenzar</p>
      </div>
      <button class="done-btn" @click="$emit('view', createdId!)">Abrir →</button>
    </div>

    <template v-else>
      <p v-if="error" class="plan-error">{{ error }}</p>
      <div class="plan-footer">
        <p class="plan-footer-note">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#48484A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Escribe para ajustar el plan
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
}>()

defineEmits<{ confirm: []; view: [id: number] }>()

const expanded = ref<Set<number>>(new Set([0]))
function toggle(i: number) {
  expanded.value.has(i) ? expanded.value.delete(i) : expanded.value.add(i)
  expanded.value = new Set(expanded.value)
}

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
  background: #1C1C1E;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.plan-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(191, 90, 242, 0.15);
  border: 1px solid rgba(191, 90, 242, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #BF5AF2;
  flex-shrink: 0;
}

.plan-eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #636366;
  margin-bottom: 2px;
}

.plan-title {
  font-size: 17px;
  font-weight: 700;
  color: #F5F5F7;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.plan-desc {
  font-size: 13px;
  color: #8E8E93;
  line-height: 1.5;
}

.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-tag {
  font-size: 11.5px;
  font-weight: 500;
  color: #AEAEB2;
  padding: 3px 9px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.plan-stats {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  padding: 10px 0;
}

.plan-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-n {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.stat-l {
  font-size: 10.5px;
  color: #636366;
  font-weight: 500;
}

.stat-sep {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.plan-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-block {
  border-radius: 13px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

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
  width: 20px;
  height: 20px;
  border-radius: 6px;
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
  font-size: 14px;
  font-weight: 600;
  color: #E5E5EA;
}

.subject-chevron { flex-shrink: 0; transition: transform 0.22s ease; }
.subject-chevron--open { transform: rotate(180deg); }

.subject-body {
  padding: 2px 12px 12px 42px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.subject-desc {
  font-size: 12px;
  color: #636366;
  line-height: 1.45;
}

.topic-item { display: flex; flex-direction: column; gap: 5px; }

.topic-line { display: flex; align-items: center; gap: 8px; }

.topic-idx {
  font-size: 11px;
  font-weight: 700;
  color: #48484A;
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}

.topic-name { font-size: 13.5px; color: #C7C7CC; font-weight: 500; }

.task-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 24px;
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
  background: #30D158;
  flex-shrink: 0;
}

.task-name { flex: 1; font-size: 12px; color: #8E8E93; }

.task-week {
  font-size: 11px;
  color: #48484A;
  background: rgba(255, 255, 255, 0.04);
  padding: 1px 6px;
  border-radius: 100px;
}

.plan-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 2px;
}

.plan-footer-note {
  flex: 1;
  font-size: 11.5px;
  color: #48484A;
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1.4;
}

.plan-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 100px;
  background: #BF5AF2;
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.15s, transform 0.12s;
  letter-spacing: -0.1px;
  font-family: inherit;
}
.plan-confirm:hover:not(:disabled) { opacity: 0.88; }
.plan-confirm:active:not(:disabled) { transform: scale(0.97); }
.plan-confirm:disabled { opacity: 0.4; cursor: default; }

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
  font-size: 12.5px;
  color: #FF453A;
  background: rgba(255, 69, 58, 0.08);
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 69, 58, 0.15);
}

.plan-done {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(48, 209, 88, 0.08);
  border: 1px solid rgba(48, 209, 88, 0.15);
  border-radius: 14px;
}

.done-check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #30D158;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.done-title { font-size: 14px; font-weight: 600; color: #30D158; }
.done-sub { font-size: 12px; color: #636366; margin-top: 1px; }

.done-btn {
  margin-left: auto;
  padding: 8px 16px;
  border-radius: 100px;
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
}
.done-btn:hover { background: rgba(48, 209, 88, 0.22); }
</style>
