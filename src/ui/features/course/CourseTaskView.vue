<template>
  <div class="course-task">
    <TopBar :title="task?.title ?? 'Tarea'" @back="$router.back()" />

    <div v-if="task" class="task-content">
      <div class="task-header">
        <h2 class="task-title">{{ task.title }}</h2>
        <p class="task-desc">{{ task.description }}</p>
        <div class="task-meta-row">
          <span class="meta-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            {{ task.dueDate ?? task.due_date ?? 'Sin fecha límite' }}
          </span>
        </div>
      </div>

      <div class="submission-section">
        <h3 class="section-title">Tu Entrega</h3>
        <textarea
          v-model="submission"
          class="submission-input"
          placeholder="Escribe tu respuesta aquí..."
          rows="6"
        />
        <div class="file-upload" @click="(($refs.fileInput as HTMLInputElement)?.click())">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          <span>Adjuntar archivo</span>
          <input ref="fileInput" type="file" hidden />
        </div>
        <AppButton full @click="submitTask">Enviar Tarea</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Task } from '@/domain/models'
import { taskAdapter, submissionAdapter } from '@/infrastructure/api'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

const route = useRoute()
const task = ref<Task | null>(null)
const submission = ref('')

async function submitTask() {
  if (!task.value) return
  try { await submissionAdapter.submitWork({ task_id: task.value.id, text: submission.value }) } catch { /* empty */ }
}

onMounted(async () => {
  const id = Number(route.params.taskId)
  try { task.value = await taskAdapter.getTaskById(id) } catch { /* empty */ }
})
</script>

<style scoped>
.course-task { min-height: 100vh; background: var(--bg-primary); }
.task-content { padding: 16px; }

.task-header { margin-bottom: 24px; }
.task-title { font-size: 22px; font-weight: 700; color: #fff; }
.task-desc { font-size: 14px; color: #8E8E93; margin-top: 6px; line-height: 1.5; }

.task-meta-row { display: flex; gap: 8px; margin-top: 12px; }

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  color: #8E8E93;
  font-size: 12px;
  font-weight: 500;
}

.meta-chip.easy { background: rgba(48,209,88,0.15); color: #30D158; }
.meta-chip.medium { background: rgba(255,149,0,0.15); color: #FF9500; }
.meta-chip.hard { background: rgba(255,69,58,0.15); color: #FF453A; }

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.submission-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submission-input {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #1C1C1E;
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  font-size: 14px;
  resize: vertical;
}

.submission-input::placeholder { color: #8E8E93; }
.submission-input:focus { border-color: var(--purple-primary); outline: none; }

.file-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #1C1C1E;
  cursor: pointer;
  color: #8E8E93;
  font-size: 14px;
}

.file-upload:hover { background: #242424; }
</style>
