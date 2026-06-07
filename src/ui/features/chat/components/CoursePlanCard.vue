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
        <span class="stat-n">{{ subjectList.length }}</span>
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
      <div v-for="(subject, si) in subjectList" :key="si" class="subject-block">
        <button class="subject-row" @click="toggle(si)">
          <span class="subject-num">{{ si + 1 }}</span>
          <span class="subject-label">{{ subject.name }}</span>
          <span v-if="subject.topics?.length" class="subject-topic-count">{{ subject.topics.length }} temas</span>
          <svg class="subject-chevron" :class="{ 'subject-chevron--open': expanded.has(si) }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="expanded.has(si)" class="subject-body">
          <p v-if="subject.description" class="subject-desc">{{ subject.description }}</p>
          <div v-for="(topic, ti) in subject.topics" :key="ti" class="topic-item">
            <div class="topic-line">
              <span class="topic-idx">{{ ti + 1 }}</span>
              <span class="topic-name">{{ topic.title }}</span>
              <span v-if="topic.tasks?.length" class="topic-task-badge">{{ topic.tasks.length }}</span>
            </div>            <p v-if="topic.contentDescription" class="topic-content-desc">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0071e3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              {{ topic.contentDescription }}
            </p>            <div v-if="topic.tasks?.length" class="task-list">
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
        <button class="plan-reject" :disabled="creating" @click="$emit('reject')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          Rechazar
        </button>
        <p class="plan-footer-note">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
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
  contentDescription?: string
}
export interface PlanTopic {
  title: string
  description?: string
  contentDescription?: string
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

defineEmits<{ confirm: []; reject: []; view: [id: number] }>()

const expanded = ref<Set<number>>(new Set([0]))
function toggle(i: number) {
  expanded.value.has(i) ? expanded.value.delete(i) : expanded.value.add(i)
  expanded.value = new Set(expanded.value)
}

const showUpdated = computed(() => (props.version ?? 0) > 1)

// Defensive: never assume `subjects` is an array. A malformed plan must still render the
// card frame (title + buttons) instead of throwing during render, which would make the
// whole component disappear while sibling UI (the "Plan listo" banner) survives.
const subjectList = computed(() =>
  Array.isArray(props.plan?.subjects)
    ? props.plan.subjects.filter((s): s is PlanSubject => !!s && typeof s === 'object')
    : []
)

const topicCount = computed(() =>
  subjectList.value.reduce((n, s) => n + (s.topics?.length ?? 0), 0)
)
const taskCount = computed(() =>
  subjectList.value.reduce(
    (n, s) => n + (s.topics?.reduce((t, tp) => t + (tp.tasks?.length ?? 0), 0) ?? 0),
    0
  )
)
</script>

<style scoped>
/* ─── Apple Design System tokens ─────────────────────────────────────────── */
/* --color-ink: #1d1d1f  --color-snow: #ffffff  --color-cloud: #f5f5f7       */
/* --color-graphite: #707070  --color-silver: #d6d6d6  --color-steel: #474747 */
/* --color-signal-blue: #0071e3  --color-glaucus-blue: #0066cc               */

.plan-card {
  align-self: stretch;
  /* The card is a direct child of the chat's flex-column scroll container.
     flex-shrink:0 prevents the flex algorithm from compressing the tall card. */
  flex-shrink: 0;
  width: 100%;
  background: #ffffff;
  border: 1px solid #d6d6d6;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: 'SF Pro Text', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.plan-card--updated {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
}

/* ─── Top accent bar — Signal Blue ───────────────────────────────────────── */
.plan-accent {
  height: 3px;
  background: #0071e3;
  flex-shrink: 0;
}

/* ─── Header ──────────────────────────────────────────────────────────────── */
.plan-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 20px 0;
}

.plan-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0071e3;
  flex-shrink: 0;
  margin-top: 2px;
}

.plan-header-text { flex: 1; min-width: 0; }

.plan-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.plan-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #707070;
}

.plan-updated-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  border: 1px solid rgba(0, 113, 227, 0.2);
  padding: 2px 8px;
  border-radius: 980px;
  text-transform: none;
}

.plan-title {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 21px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.14;
  letter-spacing: -0.015em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Description ─────────────────────────────────────────────────────────── */
.plan-desc {
  font-size: 14px;
  color: #707070;
  line-height: 1.47;
  letter-spacing: -0.19px;
  padding: 8px 20px 0;
}

/* ─── Tags ────────────────────────────────────────────────────────────────── */
.plan-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 20px 0;
}

.plan-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #1d1d1f;
  padding: 4px 12px;
  border-radius: 980px;
  background: #f5f5f7;
  border: 1px solid #d6d6d6;
  letter-spacing: -0.1px;
}
.plan-tag--level {
  color: #0071e3;
  background: rgba(0, 113, 227, 0.06);
  border-color: rgba(0, 113, 227, 0.2);
}

/* ─── Stats ───────────────────────────────────────────────────────────────── */
.plan-stats {
  display: flex;
  align-items: center;
  background: #f5f5f7;
  border-radius: 18px;
  margin: 14px 20px 0;
  border: 1px solid #d6d6d6;
  padding: 14px 0;
}

.plan-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-n {
  font-family: 'SF Pro Display', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.009em;
  line-height: 1;
}

.stat-l {
  font-size: 11px;
  color: #707070;
  font-weight: 400;
  letter-spacing: -0.1px;
}

.stat-sep {
  width: 1px;
  height: 28px;
  background: #d6d6d6;
  flex-shrink: 0;
}

/* ─── Subject tree ────────────────────────────────────────────────────────── */
.plan-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px 0;
}

.subject-block {
  border-radius: 14px;
  border: 1px solid #d6d6d6;
  overflow: hidden;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.subject-block:hover {
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.07);
}

.subject-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.subject-row:hover { background: rgba(0, 0, 0, 0.02); }

.subject-num {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
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
  color: #1d1d1f;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.19px;
}

.subject-topic-count {
  font-size: 12px;
  color: #707070;
  flex-shrink: 0;
}

.subject-chevron {
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.subject-chevron--open { transform: rotate(180deg); }

.subject-body {
  padding: 4px 14px 14px 48px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f5f5f7;
}

.subject-desc {
  font-size: 13px;
  color: #707070;
  line-height: 1.45;
}

.topic-item { display: flex; flex-direction: column; gap: 5px; }

.topic-line { display: flex; align-items: center; gap: 8px; }

.topic-idx {
  font-size: 11px;
  font-weight: 600;
  color: #d6d6d6;
  width: 16px;
  text-align: right;
  flex-shrink: 0;
}

.topic-name {
  flex: 1;
  font-size: 13px;
  color: #474747;
  font-weight: 500;
  letter-spacing: -0.1px;
}

.topic-content-desc {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 12px;
  color: #0066cc;
  line-height: 1.45;
  padding: 5px 10px;
  background: rgba(0, 102, 204, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 102, 204, 0.12);
  margin-top: 2px;
}
.topic-content-desc svg { flex-shrink: 0; margin-top: 1px; }

.topic-task-badge {
  font-size: 11px;
  font-weight: 600;
  color: #707070;
  background: #f5f5f7;
  padding: 1px 7px;
  border-radius: 980px;
  border: 1px solid #d6d6d6;
  flex-shrink: 0;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 24px;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #0071e3;
  opacity: 0.5;
  flex-shrink: 0;
}

.task-name { flex: 1; font-size: 12px; color: #707070; }

.task-week {
  font-size: 11px;
  color: #707070;
  background: #f5f5f7;
  padding: 1px 6px;
  border-radius: 980px;
  border: 1px solid #d6d6d6;
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
.plan-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px 20px;
  border-top: 1px solid #f5f5f7;
  margin-top: 14px;
}

.plan-footer-note {
  flex: 1;
  font-size: 12px;
  color: #707070;
  display: flex;
  align-items: center;
  gap: 5px;
  line-height: 1.4;
}

/* Ghost (secondary) button — light surface variant */
.plan-reject {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 980px;
  background: #f5f5f7;
  color: #1d1d1f;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #d6d6d6;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.plan-reject:hover:not(:disabled) {
  background: #e8e8ed;
  border-color: #aeaeb2;
}
.plan-reject:active:not(:disabled) {
  background: #dcdce0;
  transform: scale(0.98);
}
.plan-reject:disabled { opacity: 0.35; cursor: default; }

/* Primary CTA button — Signal Blue pill */
.plan-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 980px;
  background: #0071e3;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: background 0.2s ease, transform 0.12s ease;
}
.plan-confirm:hover:not(:disabled) { background: #0077ed; }
.plan-confirm:active:not(:disabled) {
  background: #006edb;
  transform: scale(0.97);
}
.plan-confirm:disabled { opacity: 0.35; cursor: default; }

.plan-spin {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Error ───────────────────────────────────────────────────────────────── */
.plan-error {
  font-size: 13px;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
  padding: 10px 14px;
  margin: 0 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 59, 48, 0.15);
}

/* ─── Done state ──────────────────────────────────────────────────────────── */
.plan-done {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px 20px;
  border-top: 1px solid rgba(52, 199, 89, 0.15);
  background: rgba(52, 199, 89, 0.04);
  margin-top: 14px;
}

.done-check {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #34c759;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.done-text { flex: 1; }
.done-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.19px;
}
.done-sub {
  font-size: 12px;
  color: #707070;
  margin-top: 1px;
}

.done-btn {
  padding: 9px 18px;
  border-radius: 980px;
  background: #0071e3;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  transition: background 0.2s ease;
}
.done-btn:hover { background: #0077ed; }
</style>
