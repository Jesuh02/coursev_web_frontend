<template>
  <div class="period-overlay" @click.self="$emit('close')">
    <div class="period-panel">
      <div class="panel-header">
        <h2 class="panel-title">📅 Periodos de Calificación</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <template v-else>
        <!-- Botón cerrar periodo actual -->
        <div v-if="canClose" class="close-period-section">
          <p class="period-hint">Guardar las calificaciones actuales como un periodo y empezar de cero.</p>
          <div class="close-period-row">
            <input
              v-model="newPeriodName"
              class="period-name-input"
              :placeholder="`Periodo ${nextPeriodNumber}`"
              maxlength="50"
            />
            <button class="btn-close-period" :disabled="closing" @click="onClosePeriod">
              {{ closing ? 'Guardando…' : 'Cerrar Periodo' }}
            </button>
          </div>
        </div>

        <!-- Lista de periodos -->
        <div v-if="!periods.length" class="empty-msg">No hay periodos registrados aún.</div>
        <div v-else class="period-list">
          <div
            v-for="p in periods"
            :key="p.id"
            class="period-card"
            :class="{ active: selectedPeriod?.id === p.id }"
            @click="selectPeriod(p)"
          >
            <div class="period-card-info">
              <span class="period-name">{{ p.name }}</span>
              <span class="period-date">{{ formatDate(p.closedAt) }}</span>
            </div>
            <div class="period-card-stats">
              <span class="stat">{{ p.snapshot?.students?.length ?? 0 }} estudiantes</span>
              <span class="stat">{{ p.snapshot?.tasks?.length ?? 0 }} tareas</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <!-- Detalle de periodo seleccionado -->
        <div v-if="selectedPeriod" class="period-detail">
          <div class="detail-header">
            <button class="back-link" @click="selectedPeriod = null">&larr; Volver a periodos</button>
            <h3>{{ selectedPeriod.name }}</h3>
          </div>

          <!-- Tabla de notas del snapshot -->
          <div class="sheet-scroll">
            <table class="grade-sheet" v-if="snapshotStudents.length">
              <thead>
                <tr>
                  <th class="col-student sticky-col">Estudiante</th>
                  <th v-for="col in snapshotManualCols" :key="col" class="col-manual">{{ formatGradeType(col) }}</th>
                  <th v-for="task in snapshotTasks" :key="task.id" class="col-task" :title="task.title">📋 {{ truncate(task.title, 12) }}</th>
                  <th class="col-avg">Prom.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in snapshotStudents" :key="student.userId">
                  <td class="col-student sticky-col">
                    <span class="cell-name">{{ student.fullName || student.username || '—' }}</span>
                  </td>
                  <td v-for="col in snapshotManualCols" :key="col" class="col-manual">
                    <input
                      v-if="canClose"
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      class="grade-input"
                      :value="getManualGrade(student.userId, col)"
                      @change="setManualGrade(student.userId, col, Number(($event.target as HTMLInputElement).value))"
                    />
                    <span v-else>{{ getManualGrade(student.userId, col) ?? '—' }}</span>
                  </td>
                  <td v-for="task in snapshotTasks" :key="task.id" class="col-task">
                    {{ getTaskGrade(student.userId, task.id) ?? '—' }}
                  </td>
                  <td class="col-avg" :class="avgClass(studentAvg(student.userId))">
                    {{ studentAvg(student.userId).toFixed(1) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-msg">Sin datos en este periodo.</div>
          </div>

          <!-- Guardar cambios del snapshot -->
          <div v-if="canClose && snapshotDirty" class="save-bar">
            <button class="btn-save" :disabled="saving" @click="saveSnapshotChanges">
              {{ saving ? 'Guardando…' : 'Guardar cambios del periodo' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'

const props = defineProps<{
  courseId: number
  subjectId: number
  canClose: boolean // true for admin/docente
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'periodClosed'): void }>()

const loading = ref(true)
const closing = ref(false)
const saving = ref(false)
const periods = ref<GradePeriod[]>([])
const selectedPeriod = ref<GradePeriod | null>(null)
const newPeriodName = ref('')
const snapshotDirty = ref(false)

// Editable copy of manual grades within selected snapshot
const editedManualGrades = ref<any[]>([])

const nextPeriodNumber = computed(() => {
  if (!periods.value.length) return 1
  return Math.max(...periods.value.map(p => p.periodNumber)) + 1
})

const snapshotStudents = computed(() => selectedPeriod.value?.snapshot?.students ?? [])
const snapshotTasks = computed(() => selectedPeriod.value?.snapshot?.tasks ?? [])
const snapshotManualCols = computed(() => {
  const grades = editedManualGrades.value.length ? editedManualGrades.value : (selectedPeriod.value?.snapshot?.manualGrades ?? [])
  const types = new Set<string>()
  for (const g of grades) types.add(g.gradeType)
  return Array.from(types).sort()
})

onMounted(async () => {
  await loadPeriods()
})

async function loadPeriods() {
  loading.value = true
  try {
    periods.value = await periodAdapter.listBySubject(props.subjectId)
  } catch { periods.value = [] }
  loading.value = false
}

async function onClosePeriod() {
  closing.value = true
  try {
    await periodAdapter.closePeriod({
      courseId: props.courseId,
      subjectId: props.subjectId,
      name: newPeriodName.value || undefined,
    })
    newPeriodName.value = ''
    await loadPeriods()
    emit('periodClosed')
  } catch (err: any) {
    alert(err?.message || 'Error al cerrar periodo')
  }
  closing.value = false
}

function selectPeriod(p: GradePeriod) {
  selectedPeriod.value = p
  editedManualGrades.value = JSON.parse(JSON.stringify(p.snapshot?.manualGrades ?? []))
  snapshotDirty.value = false
}

function getManualGrade(studentId: number, gradeType: string): number | null {
  const g = editedManualGrades.value.find((m: any) => m.studentId === studentId && m.gradeType === gradeType)
  return g?.grade ?? null
}

function setManualGrade(studentId: number, gradeType: string, value: number) {
  const clamped = Math.max(0, Math.min(10, value))
  const idx = editedManualGrades.value.findIndex((m: any) => m.studentId === studentId && m.gradeType === gradeType)
  if (idx >= 0) {
    editedManualGrades.value[idx].grade = clamped
  } else {
    editedManualGrades.value.push({ studentId, gradeType, grade: clamped })
  }
  snapshotDirty.value = true
}

function getTaskGrade(studentId: number, taskId: number): number | null {
  const tg = selectedPeriod.value?.snapshot?.taskGrades ?? []
  const g = tg.find((t: any) => t.studentId === studentId && t.taskId === taskId)
  return g?.grade ?? null
}

function studentAvg(studentId: number): number {
  const manuals = editedManualGrades.value.filter((m: any) => m.studentId === studentId && m.grade != null)
  const tasks = (selectedPeriod.value?.snapshot?.taskGrades ?? []).filter((t: any) => t.studentId === studentId && t.grade != null)
  const all = [...manuals.map((m: any) => m.grade), ...tasks.map((t: any) => t.grade)]
  if (!all.length) return 0
  return all.reduce((a: number, b: number) => a + b, 0) / all.length
}

async function saveSnapshotChanges() {
  if (!selectedPeriod.value) return
  saving.value = true
  try {
    const updated = await periodAdapter.updateGrades(selectedPeriod.value.id, {
      manualGrades: editedManualGrades.value,
    })
    selectedPeriod.value = updated
    snapshotDirty.value = false
  } catch (err: any) {
    alert(err?.message || 'Error al guardar cambios')
  }
  saving.value = false
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatGradeType(t: string) {
  const map: Record<string, string> = { comportamiento: 'Comp.', participacion: 'Part.', examenes: 'Exam.' }
  const base = t.replace(/_\d+$/, '')
  return map[base] ?? t
}

function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + '…' : s }

function avgClass(avg: number) {
  if (avg >= 8) return 'avg-high'
  if (avg >= 6) return 'avg-mid'
  return 'avg-low'
}
</script>

<style scoped>
.period-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
}
.period-panel {
  width: 95vw; max-width: 800px; max-height: 85vh; background: #1C1C1E;
  border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
}
.panel-title { font-size: 18px; font-weight: 700; color: #fff; }
.close-btn { background: none; border: none; cursor: pointer; padding: 4px; }
.loading-center { display: flex; justify-content: center; padding: 40px; }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.close-period-section {
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.period-hint { font-size: 13px; color: #8E8E93; margin-bottom: 10px; }
.close-period-row { display: flex; gap: 10px; }
.period-name-input {
  flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06); color: #fff; font-size: 14px; outline: none;
}
.period-name-input:focus { border-color: #BF5AF2; }
.btn-close-period {
  padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2); color: #fff; font-weight: 600; font-size: 14px;
  white-space: nowrap; transition: opacity 0.2s;
}
.btn-close-period:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-msg { padding: 32px; text-align: center; color: #8E8E93; font-size: 14px; }

.period-list { overflow-y: auto; flex: 1; padding: 8px 12px; }
.period-card {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 12px; cursor: pointer;
  background: rgba(255,255,255,0.04); margin-bottom: 6px; transition: background 0.15s;
}
.period-card:hover { background: rgba(255,255,255,0.08); }
.period-card.active { background: rgba(191,90,242,0.15); border: 1px solid rgba(191,90,242,0.3); }
.period-card-info { flex: 1; }
.period-name { display: block; font-size: 15px; font-weight: 600; color: #fff; }
.period-date { display: block; font-size: 12px; color: #8E8E93; margin-top: 2px; }
.period-card-stats { display: flex; gap: 12px; }
.stat { font-size: 12px; color: #8E8E93; }

.period-detail { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 12px; }
.detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.back-link { background: none; border: none; color: #BF5AF2; font-size: 14px; cursor: pointer; }
.detail-header h3 { font-size: 16px; font-weight: 600; color: #fff; }

.sheet-scroll { flex: 1; overflow: auto; }
.grade-sheet { width: 100%; border-collapse: collapse; font-size: 13px; }
.grade-sheet th, .grade-sheet td {
  padding: 8px 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); color: #ccc; white-space: nowrap;
}
.grade-sheet th { color: #8E8E93; font-weight: 600; position: sticky; top: 0; background: #1C1C1E; z-index: 2; }
.col-student { text-align: left; min-width: 140px; }
.sticky-col { position: sticky; left: 0; background: #1C1C1E; z-index: 3; }
.col-manual { min-width: 70px; }
.col-task { min-width: 90px; }
.col-avg { min-width: 60px; font-weight: 700; }
.avg-high { color: #30D158; }
.avg-mid { color: #FFD60A; }
.avg-low { color: #FF453A; }
.grade-input {
  width: 56px; padding: 4px 6px; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; background: rgba(255,255,255,0.06); color: #fff; font-size: 13px;
  text-align: center; outline: none;
}
.grade-input:focus { border-color: #BF5AF2; }

.save-bar { padding: 12px; border-top: 1px solid rgba(255,255,255,0.08); text-align: right; }
.btn-save {
  padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #30D158, #34C759); color: #fff; font-weight: 600; font-size: 14px;
}
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.cell-name { font-size: 13px; color: #fff; }
</style>
