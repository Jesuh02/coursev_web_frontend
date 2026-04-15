<template>
  <div class="grade-overlay" @click.self="$emit('close')">
    <div class="grade-panel">
      <div class="panel-header">
        <h2 class="panel-title">📊 Planilla de Calificaciones</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Search filter -->
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Buscar estudiante..."
          type="text"
        />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <!-- Grade sheet table -->
      <div v-else class="sheet-wrapper">
        <div v-if="!filteredStudents.length" class="empty-msg">No se encontraron estudiantes</div>
        <div v-else class="sheet-scroll">
          <table class="grade-sheet">
            <thead>
              <tr>
                <th class="col-student sticky-col">Estudiante</th>
                <th class="col-manual" title="Comportamiento">🤝 Comp.</th>
                <th class="col-manual" title="Participación">🙋 Part.</th>
                <th class="col-manual" title="Exámenes">📝 Exam.</th>
                <th
                  v-for="task in tasks"
                  :key="task.id"
                  class="col-task"
                  :title="task.title"
                >
                  📋 {{ truncate(task.title, 12) }}
                </th>
                <th class="col-avg">Promedio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredStudents" :key="student.userId">
                <td class="col-student sticky-col">
                  <div class="student-cell">
                    <div class="student-avatar-sm">
                      <img v-if="student.avatar" :src="student.avatar" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
                      <span v-else class="avatar-initials-sm">{{ (student.username ?? 'E').charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="student-cell-info">
                      <span class="cell-name">{{ student.fullName || student.username || '—' }}</span>
                      <span class="cell-username">@{{ student.username }}</span>
                    </div>
                  </div>
                </td>
                <!-- Comportamiento -->
                <td class="col-manual">
                  <input
                    :value="getManualGrade(student.userId, 'comportamiento')"
                    class="cell-input"
                    type="number" min="0" max="10" step="0.5"
                    placeholder="—"
                    @change="onManualGradeChange(student.userId, 'comportamiento', $event)"
                  />
                </td>
                <!-- Participación -->
                <td class="col-manual">
                  <input
                    :value="getManualGrade(student.userId, 'participacion')"
                    class="cell-input"
                    type="number" min="0" max="10" step="0.5"
                    placeholder="—"
                    @change="onManualGradeChange(student.userId, 'participacion', $event)"
                  />
                </td>
                <!-- Exámenes -->
                <td class="col-manual">
                  <input
                    :value="getManualGrade(student.userId, 'examenes')"
                    class="cell-input"
                    type="number" min="0" max="10" step="0.5"
                    placeholder="—"
                    @change="onManualGradeChange(student.userId, 'examenes', $event)"
                  />
                </td>
                <!-- Task grades (read-only from submissions) -->
                <td v-for="task in tasks" :key="task.id" class="col-task">
                  <span class="cell-readonly" :class="taskGradeClass(student.userId, task.id)">
                    {{ formatTaskGrade(student.userId, task.id) }}
                  </span>
                </td>
                <!-- Average -->
                <td class="col-avg">
                  <span class="cell-avg" :class="avgClass(student.userId)">
                    {{ computeAverage(student.userId) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bulk action bar -->
      <div v-if="!loading && filteredStudents.length" class="bulk-bar">
        <div class="bulk-section">
          <label class="bulk-label">Asignar nota masiva:</label>
          <select v-model="bulkType" class="bulk-select">
            <option value="comportamiento">🤝 Comportamiento</option>
            <option value="participacion">🙋 Participación</option>
            <option value="examenes">📝 Exámenes</option>
          </select>
          <input
            v-model.number="bulkGrade"
            class="bulk-input"
            type="number" min="0" max="10" step="0.5"
            placeholder="Nota"
          />
          <button class="bulk-btn apply" :disabled="bulkGrade === null || bulkGrade === undefined" @click="applyBulkGrade">
            Aplicar a todos
          </button>
        </div>
      </div>

      <!-- Save -->
      <div v-if="!loading && dirtyEntries.length > 0" class="panel-footer">
        <span class="dirty-count">{{ dirtyEntries.length }} cambio(s) sin guardar</span>
        <button class="save-btn" :disabled="saving" @click="saveAllGrades">
          {{ saving ? 'Guardando...' : 'Guardar Notas' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { ManualGrade, GradeSheetTaskGrade, GradeSheetTask, GradeSheetStudent } from '@/infrastructure/api/gradeAdapter'

const props = defineProps<{
  courseId: number
  subjectId: number
  students: { userId: number; username: string; fullName: string | null; cedula: string | null; avatar: string | null }[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const searchQuery = ref('')
const loading = ref(true)
const saving = ref(false)
const bulkGrade = ref<number | null>(null)
const bulkType = ref<string>('comportamiento')

// Data from backend
const sheetStudents = ref<GradeSheetStudent[]>([])
const tasks = ref<GradeSheetTask[]>([])
const manualGradesData = ref<ManualGrade[]>([])
const taskGrades = ref<GradeSheetTaskGrade[]>([])

// Editable manual grades: key = `${userId}-${gradeType}`, value = grade
const editedManualGrades = ref<Record<string, number | null>>({})
// Track original values to detect dirty entries
const originalManualGrades = ref<Record<string, number | null>>({})

const allStudents = computed(() => {
  // Merge students from props with those from sheet response
  const map = new Map<number, GradeSheetStudent>()
  for (const s of props.students) {
    map.set(s.userId, { userId: s.userId, username: s.username, fullName: s.fullName, cedula: s.cedula, avatar: s.avatar })
  }
  for (const s of sheetStudents.value) {
    if (!map.has(s.userId)) {
      map.set(s.userId, s)
    } else {
      const existing = map.get(s.userId)!
      if (!existing.fullName && s.fullName) existing.fullName = s.fullName
      if (!existing.cedula && s.cedula) existing.cedula = s.cedula
    }
  }
  return [...map.values()]
})

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return allStudents.value
  const q = searchQuery.value.toLowerCase().trim()
  return allStudents.value.filter(s => {
    const name = (s.fullName || '').toLowerCase()
    const uname = (s.username || '').toLowerCase()
    const cedula = (s.cedula || '').toLowerCase()
    return name.includes(q) || uname.includes(q) || cedula.includes(q)
  })
})

const dirtyEntries = computed(() => {
  return Object.entries(editedManualGrades.value).filter(([key, val]) => {
    return val !== originalManualGrades.value[key]
  })
})

function gradeKey(userId: number, type: string) {
  return `${userId}-${type}`
}

function getManualGrade(userId: number, type: string): number | string {
  const key = gradeKey(userId, type)
  const val = editedManualGrades.value[key]
  return val !== null && val !== undefined ? val : ''
}

function onManualGradeChange(userId: number, type: string, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value)
  const key = gradeKey(userId, type)
  if (Number.isNaN(val) || (event.target as HTMLInputElement).value === '') {
    editedManualGrades.value[key] = null
  } else {
    editedManualGrades.value[key] = Math.min(10, Math.max(0, val))
  }
}

function getTaskGrade(userId: number, taskId: number): GradeSheetTaskGrade | undefined {
  return taskGrades.value.find(tg => tg.studentId === userId && tg.taskId === taskId)
}

function formatTaskGrade(userId: number, taskId: number): string {
  const tg = getTaskGrade(userId, taskId)
  if (!tg) return '—'
  if (tg.grade === null || tg.grade === undefined) return 'Pendiente'
  return String(tg.grade)
}

function taskGradeClass(userId: number, taskId: number): string {
  const tg = getTaskGrade(userId, taskId)
  if (!tg) return 'no-submission'
  if (tg.grade === null || tg.grade === undefined) return 'pending'
  return tg.grade >= 6 ? 'pass' : 'fail'
}

function computeAverage(userId: number): string {
  const values: number[] = []
  for (const type of ['comportamiento', 'participacion', 'examenes'] as const) {
    const key = gradeKey(userId, type)
    const val = editedManualGrades.value[key]
    if (val !== null && val !== undefined) values.push(val)
  }
  for (const task of tasks.value) {
    const tg = getTaskGrade(userId, task.id)
    if (tg?.grade !== null && tg?.grade !== undefined) values.push(tg!.grade!)
  }
  if (values.length === 0) return '—'
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return avg.toFixed(1)
}

function avgClass(userId: number): string {
  const avg = computeAverage(userId)
  if (avg === '—') return ''
  return parseFloat(avg) >= 6 ? 'pass' : 'fail'
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function applyBulkGrade() {
  if (bulkGrade.value === null || bulkGrade.value === undefined) return
  const clamped = Math.min(10, Math.max(0, bulkGrade.value))
  for (const s of allStudents.value) {
    editedManualGrades.value[gradeKey(s.userId, bulkType.value)] = clamped
  }
}

async function saveAllGrades() {
  saving.value = true
  try {
    // Group dirty entries by type
    const byType: Record<string, { studentId: number; grade: number }[]> = {}
    for (const [key, val] of dirtyEntries.value) {
      if (val === null || val === undefined) continue
      const parts = key.split('-')
      const userIdStr = parts[0]
      const type = parts.slice(1).join('-')
      if (!byType[type]) byType[type] = []
      byType[type].push({ studentId: Number(userIdStr), grade: val })
    }

    for (const [type, entries] of Object.entries(byType)) {
      await gradeAdapter.bulkSetGrades({
        courseId: props.courseId,
        subjectId: props.subjectId,
        gradeType: type,
        entries,
      })
    }

    // Update originals
    for (const [key, val] of Object.entries(editedManualGrades.value)) {
      originalManualGrades.value[key] = val
    }

    emit('saved')
  } catch (err) {
    console.error('[GradePanel] Error saving:', err)
  }
  saving.value = false
}

onMounted(async () => {
  loading.value = true
  try {
    const sheet = await gradeAdapter.getGradeSheet(props.subjectId)
    sheetStudents.value = sheet.students || []
    tasks.value = sheet.tasks || []
    manualGradesData.value = sheet.manualGrades || []
    taskGrades.value = sheet.taskGrades || []

    // Populate editable manual grades
    for (const mg of manualGradesData.value) {
      const key = gradeKey(mg.studentId, mg.gradeType)
      editedManualGrades.value[key] = mg.grade
      originalManualGrades.value[key] = mg.grade
    }
  } catch (err) {
    console.error('[GradePanel] Error loading sheet:', err)
  }
  loading.value = false
})
</script>

<style scoped>
.grade-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.grade-panel {
  background: #111528;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  width: 95vw;
  max-width: 1100px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  flex-shrink: 0;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 20px 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder { color: #8E8E93; }

.loading-center {
  display: flex;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-msg {
  text-align: center;
  color: #8E8E93;
  padding: 40px 0;
  font-size: 14px;
}

/* ── Sheet table ── */
.sheet-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.sheet-scroll {
  overflow: auto;
  max-height: calc(90vh - 260px);
}

.grade-sheet {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.grade-sheet thead {
  position: sticky;
  top: 0;
  z-index: 3;
}

.grade-sheet th {
  background: #1A1E35;
  color: #BF5AF2;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 10px;
  border-bottom: 2px solid rgba(191, 90, 242, 0.3);
  white-space: nowrap;
  text-align: center;
}

.grade-sheet td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  text-align: center;
  vertical-align: middle;
}

.grade-sheet tbody tr:hover td {
  background: rgba(191, 90, 242, 0.05);
}

/* Sticky first column */
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 2;
  background: #111528 !important;
  min-width: 180px;
  text-align: left !important;
}

.grade-sheet thead .sticky-col {
  z-index: 4;
  background: #1A1E35 !important;
}

.col-manual { min-width: 80px; }
.col-task { min-width: 90px; }
.col-avg { min-width: 80px; }

/* Student cell */
.student-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.student-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(191, 90, 242, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-avatar-sm img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials-sm {
  color: #BF5AF2;
  font-size: 12px;
  font-weight: 700;
}

.student-cell-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-username {
  font-size: 11px;
  color: #8E8E93;
}

/* Grade inputs */
.cell-input {
  width: 56px;
  padding: 6px 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

.cell-input:focus {
  border-color: #BF5AF2;
  background: rgba(191, 90, 242, 0.08);
}

/* Read-only task cells */
.cell-readonly {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}

.cell-readonly.pass { color: #30D158; background: rgba(48, 209, 88, 0.1); }
.cell-readonly.fail { color: #FF375F; background: rgba(255, 55, 95, 0.1); }
.cell-readonly.pending { color: #FF9500; background: rgba(255, 149, 0, 0.1); }
.cell-readonly.no-submission { color: #555; }

/* Average */
.cell-avg {
  font-size: 14px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
}

.cell-avg.pass { color: #30D158; background: rgba(48, 209, 88, 0.12); }
.cell-avg.fail { color: #FF375F; background: rgba(255, 55, 95, 0.12); }

/* ── Bulk bar ── */
.bulk-bar {
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.bulk-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-label {
  font-size: 13px;
  color: #8E8E93;
  font-weight: 600;
}

.bulk-select {
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.bulk-select option { background: #1C1C1E; color: #fff; }

.bulk-input {
  width: 60px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.bulk-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn.apply {
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
}

.bulk-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Footer ── */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.dirty-count {
  font-size: 13px;
  color: #FF9500;
  font-weight: 600;
}

.save-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, #BF5AF2, #9B6BFF);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .grade-panel {
    width: 100vw;
    max-width: 100vw;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
  .sheet-scroll {
    max-height: calc(95vh - 280px);
  }
}
</style>
