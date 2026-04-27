<template>
  <div class="grade-overlay" :class="{ expanded: isExpanded }" @click.self="$emit('close')">
    <div class="grade-panel" :class="{ expanded: isExpanded }">
      <div class="panel-header">
        <div class="header-left">
          <button class="expand-btn" @click="isExpanded = !isExpanded" :title="isExpanded ? 'Colapsar' : 'Expandir'">
            <svg v-if="!isExpanded" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2.5">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2.5">
              <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <h2 class="panel-title">📊 Planilla de Calificaciones</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Search filter -->
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Buscar estudiante..."
          type="text"
        />
      </div>

      <!-- Scrollable body -->
      <div class="panel-body">

      <!-- Loading state -->
      <div v-if="loading" class="loading-center"><div class="spinner" /></div>

      <!-- Between periods / no period state -->
      <div v-else-if="betweenPeriods" class="between-periods-state">
        <div class="between-periods-icon">📅</div>
        <h3 class="between-periods-title">{{ hasClosedPeriods ? 'Periodo cerrado' : 'Iniciar periodo' }}</h3>
        <p class="between-periods-desc">{{ hasClosedPeriods ? 'El periodo anterior fue cerrado exitosamente.' : 'Para comenzar a registrar notas, inicia el periodo.' }}</p>
        <div class="start-period-form">
          <div class="start-period-row">
            <input
              v-model="newPeriodName"
              class="period-name-input"
              :placeholder="`Periodo ${nextPeriodNumber}`"
              maxlength="50"
            />
            <button
              class="btn-start-period"
              :disabled="startingPeriod"
              @click="executeStartPeriod"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ startingPeriod ? 'Iniciando…' : 'Iniciar periodo' }}
            </button>
          </div>
          <p v-if="startPeriodError" class="start-period-error">⚠️ {{ startPeriodError }}</p>
        </div>
      </div>

      <!-- Grade sheet table -->
      <div v-else class="sheet-wrapper">
        <div v-if="!filteredStudents.length" class="empty-msg">No se encontraron estudiantes</div>
        <div v-else class="sheet-scroll">
          <table class="grade-sheet">
            <thead>
              <tr>
                <th class="col-student sticky-col">Estudiante</th>
                <template v-for="group in gradeColumnGroups" :key="group.baseType">
                  <th
                    v-for="col in group.columns"
                    :key="col.key"
                    class="col-manual"
                    :title="col.fullLabel"
                  >
                    {{ col.shortLabel }}
                  </th>
                  <th class="col-slot-actions">
                    <div class="slot-action-btns">
                      <button
                        class="add-slot-btn"
                        @click="addSlot(group.baseType)"
                        :title="'Agregar columna de ' + group.label"
                      >+</button>
                      <button
                        v-if="group.columns.length > 1"
                        class="remove-slot-btn"
                        @click="confirmRemoveSlot(group.baseType, group.label)"
                        :title="'Eliminar última columna de ' + group.label"
                      >&minus;</button>
                    </div>
                  </th>
                </template>
                <th
                  v-for="task in tasks"
                  :key="task.id"
                  class="col-task"
                  :title="task.title"
                >
                  📋 {{ truncate(task.title, 12) }}
                </th>
                <th class="col-avg">Prom.</th>
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
                <template v-for="group in gradeColumnGroups" :key="group.baseType">
                  <td v-for="col in group.columns" :key="col.key" class="col-manual">
                    <input
                      :value="getManualGrade(student.userId, col.key)"
                      class="cell-input"
                      type="number" min="0" max="10" step="0.5"
                      placeholder="0"
                      @change="onManualGradeChange(student.userId, col.key, $event)"
                    />
                  </td>
                  <td class="col-slot-actions-spacer"></td>
                </template>
                <td v-for="task in tasks" :key="task.id" class="col-task">
                  <input
                    :value="getEditedTaskGrade(student.userId, task.id)"
                    class="cell-input"
                    type="number" min="0" max="10" step="0.5"
                    placeholder="0"
                    @change="onTaskGradeChange(student.userId, task.id, $event)"
                  />
                </td>
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
          <select v-model="bulkColumnKey" class="bulk-select">
            <template v-for="group in gradeColumnGroups" :key="group.baseType">
              <option v-for="col in group.columns" :key="col.key" :value="col.key">
                {{ col.fullLabel }}
              </option>
            </template>
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
      <div v-if="!loading && (dirtyEntries.length + dirtyTaskEntries.length) > 0" class="panel-footer">
        <span class="dirty-count">{{ dirtyEntries.length + dirtyTaskEntries.length }} cambio(s) sin guardar</span>
        <button class="save-btn" :disabled="saving" @click="saveAllGrades">
          {{ saving ? 'Guardando...' : 'Guardar Notas' }}
        </button>
      </div>

      <!-- ═══ Periodos Section ═══ -->
      <div v-if="!loading" class="periods-section" style="flex-shrink:0">
        <div class="periods-header" @click="showPeriodsSection = !showPeriodsSection">
          <div class="periods-header-left">
            <svg :class="{ rotated: showPeriodsSection }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <h3 class="periods-title">📅 Periodos</h3>
            <span v-if="periods.length" class="periods-badge">{{ periods.length }}</span>
          </div>
        </div>

        <div v-if="showPeriodsSection" class="periods-body">
          <!-- Close current period -->
          <div v-if="!betweenPeriods" class="close-period-bar">
            <p class="period-hint">Guardar las notas actuales como un periodo y empezar de cero.</p>
            <div class="close-period-row">
              <input
                v-model="newPeriodName"
                class="period-name-input"
                :placeholder="activePeriod ? activePeriod.name : `Periodo ${nextPeriodNumber}`"
                maxlength="50"
              />
              <button class="btn-close-period" :disabled="closing" @click="onClosePeriod">
                {{ closing ? 'Cerrando…' : 'Cerrar Periodo' }}
              </button>
            </div>
          </div>

          <!-- Loading periods -->
          <div v-if="periodsLoading" class="loading-center"><div class="spinner" /></div>

          <!-- No periods -->
          <div v-else-if="!periods.length" class="empty-msg">No hay periodos registrados aún.</div>

          <!-- Period list -->
          <div v-else class="period-list">
            <div v-for="p in periods" :key="p.id" class="period-item">
              <div class="period-card" :class="{ active: expandedPeriodId === p.id }" @click="togglePeriod(p)">
                <div class="period-card-left">
                  <svg :class="{ rotated: expandedPeriodId === p.id }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                  <div class="period-card-info">
                    <span class="period-name">{{ p.name }}</span>
                    <span v-if="p.snapshot === null" class="period-active-badge">🟢 En curso</span>
                    <span v-else class="period-date">{{ formatDate(p.closedAt) }}</span>
                    <span v-if="p.startsAt || p.endsAt" class="period-date-range">
                      {{ p.startsAt ? formatDate(p.startsAt) : '—' }} → {{ p.endsAt ? formatDate(p.endsAt) : '—' }}
                    </span>
                  </div>
                </div>
                <div class="period-card-stats">
                  <span class="stat-pill">{{ p.snapshot?.students?.length ?? 0 }} est.</span>
                  <span class="stat-pill">{{ p.snapshot?.tasks?.length ?? 0 }} tareas</span>
                </div>
              </div>

              <!-- Expanded period detail -->
              <div v-if="expandedPeriodId === p.id" class="period-detail">
                <div v-if="!periodSnapshotStudents(p).length" class="empty-msg">Sin datos en este periodo.</div>
                <div v-else class="sheet-scroll period-sheet-scroll">
                  <table class="grade-sheet">
                    <thead>
                      <tr>
                        <th class="col-student sticky-col">Estudiante</th>
                        <th v-for="col in periodManualCols(p)" :key="col" class="col-manual">{{ formatGradeTypeLabel(col) }}</th>
                        <th v-for="task in periodSnapshotTasks(p)" :key="task.id" class="col-task" :title="task.title">📋 {{ truncate(task.title, 12) }}</th>
                        <th class="col-avg">Prom.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="student in periodSnapshotStudents(p)" :key="student.userId">
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
                        <td v-for="col in periodManualCols(p)" :key="col" class="col-manual">
                          <template v-if="p.snapshot === null">
                            <span class="cell-readonly" :class="periodTaskGradeClass(getPeriodManualGrade(p.id, student.userId, col) !== '' ? Number(getPeriodManualGrade(p.id, student.userId, col)) : 0)">
                              {{ getPeriodManualGrade(p.id, student.userId, col) !== '' ? getPeriodManualGrade(p.id, student.userId, col) : 0 }}
                            </span>
                          </template>
                          <template v-else>
                            <input
                              type="number" min="0" max="10" step="0.5"
                              class="cell-input"
                              placeholder="0"
                              :value="getPeriodManualGrade(p.id, student.userId, col)"
                              @change="setPeriodManualGrade(p.id, student.userId, col, $event)"
                            />
                          </template>
                        </td>
                        <td v-for="task in periodSnapshotTasks(p)" :key="task.id" class="col-task">
                          <span class="cell-readonly" :class="periodTaskGradeClass(getPeriodTaskGrade(p, student.userId, task.id))">
                            {{ getPeriodTaskGrade(p, student.userId, task.id) ?? '—' }}
                          </span>
                        </td>
                        <td class="col-avg">
                          <span class="cell-avg" :class="periodAvgClass(computePeriodAvg(p, student.userId))">
                            {{ computePeriodAvg(p, student.userId) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Save period changes -->
                <div v-if="p.snapshot === null" class="period-live-note">
                  ✏️ Las notas se editan desde la planilla principal
                </div>
                <div v-else-if="periodDirtyKeys.has(p.id)" class="period-save-bar">
                  <button class="btn-save-period" :disabled="periodSaving" @click="savePeriodChanges(p)">
                    {{ periodSaving ? 'Guardando…' : 'Guardar cambios del periodo' }}
                  </button>
                </div>

                <!-- Delete period -->
                <div class="period-delete-bar">
                  <button class="btn-delete-period" @click="confirmDeletePeriod(p)">🗑️ Eliminar periodo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div><!-- /panel-body -->

      <!-- Liquidglass confirm modal -->
      <Teleport to="body">
        <Transition name="glass-fade">
          <div v-if="removeConfirm.show" class="glass-overlay" @click.self="removeConfirm.show = false">
            <div class="glass-dialog">
              <div class="glass-icon">🗑️</div>
              <h3 class="glass-title">¿Estás seguro de eliminar la columna de notas?</h3>
              <p class="glass-desc">Se eliminará la última columna de <strong>{{ removeConfirm.label }}</strong>. Las notas ingresadas en esa columna se perderán si no fueron guardadas.</p>
              <div class="glass-actions">
                <button class="glass-btn cancel" @click="removeConfirm.show = false">Cancelar</button>
                <button class="glass-btn confirm" @click="executeRemoveSlot">Eliminar</button>
              </div>
            </div>
          </div>
        </Transition>
        <!-- Delete period confirm -->
        <Transition name="glass-fade">
          <div v-if="deletePeriodConfirm.show" class="glass-overlay" @click.self="deletePeriodConfirm.show = false">
            <div class="glass-dialog">
              <div class="glass-icon">📅</div>
              <h3 class="glass-title">¿Eliminar este periodo?</h3>
              <p class="glass-desc">Se eliminará permanentemente el periodo <strong>{{ deletePeriodConfirm.name }}</strong> y todas sus notas guardadas.</p>
              <div class="glass-actions">
                <button class="glass-btn cancel" @click="deletePeriodConfirm.show = false">Cancelar</button>
                <button class="glass-btn confirm" @click="executeDeletePeriod">Eliminar</button>
              </div>
            </div>
          </div>
        </Transition>
        <!-- Close period confirm -->
        <Transition name="glass-fade">
          <div v-if="closePeriodConfirm" class="glass-overlay" @click.self="closePeriodConfirm = false">
            <div class="glass-dialog">
              <div class="glass-icon">📸</div>
              <h3 class="glass-title">¿Cerrar el periodo actual?</h3>
              <p class="glass-desc">Se guardará una copia de las notas actuales y la planilla se vaciará para el nuevo periodo.</p>
              <div class="glass-actions">
                <button class="glass-btn cancel" @click="closePeriodConfirm = false">Cancelar</button>
                <button class="glass-btn confirm" @click="executeClosePeriod" style="background: rgba(191,90,242,0.25); color: #BF5AF2; border-color: rgba(191,90,242,0.3);">Cerrar Periodo</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'
import type { ManualGrade, GradeSheetTaskGrade, GradeSheetTask, GradeSheetStudent } from '@/infrastructure/api/gradeAdapter'

interface GradeColumn {
  key: string        // e.g. "comportamiento", "comportamiento_2"
  baseType: string   // e.g. "comportamiento"
  slot: number       // 1, 2, 3...
  shortLabel: string // "🤝 C.1"
  fullLabel: string  // "Comportamiento 1"
}

interface GradeColumnGroup {
  baseType: string
  label: string
  emoji: string
  columns: GradeColumn[]
}

const BASE_TYPE_META = [
  { baseType: 'comportamiento', label: 'Comportamiento', emoji: '🤝', short: 'Com' },
  { baseType: 'participacion', label: 'Participación', emoji: '🙋', short: 'Par' },
  { baseType: 'examenes', label: 'Exámenes', emoji: '📝', short: 'Exa' },
] as const

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
const isExpanded = ref(false)
const bulkGrade = ref<number | null>(null)
const bulkColumnKey = ref<string>('comportamiento')

// Remove slot confirmation
const removeConfirm = reactive({ show: false, baseType: '', label: '' })

// Data from backend
const sheetStudents = ref<GradeSheetStudent[]>([])
const tasks = ref<GradeSheetTask[]>([])
const manualGradesData = ref<ManualGrade[]>([])
const taskGrades = ref<GradeSheetTaskGrade[]>([])

// Editable manual grades: key = `${userId}-${gradeType}`, value = grade
const editedManualGrades = ref<Record<string, number | null>>({})
const originalManualGrades = ref<Record<string, number | null>>({})

// Editable task grades: key = `${userId}-${taskId}`, value = grade
const editedTaskGrades = ref<Record<string, number | null>>({})
const originalTaskGrades = ref<Record<string, number | null>>({})

// Slots per type: tracks how many columns each base type has
const slotsPerType = reactive<Record<string, number>>({
  comportamiento: 1,
  participacion: 1,
  examenes: 1,
})

// --- Slot helpers ---

function parseGradeType(gradeType: string): { baseType: string; slot: number } {
  const match = gradeType.match(/^(comportamiento|participacion|examenes)(?:_(\d+))?$/)
  if (!match) return { baseType: gradeType, slot: 1 }
  return { baseType: match[1], slot: match[2] ? Number(match[2]) : 1 }
}

function gradeTypeForSlot(baseType: string, slot: number): string {
  return slot === 1 ? baseType : `${baseType}_${slot}`
}

function discoverSlots() {
  for (const mg of manualGradesData.value) {
    const { baseType, slot } = parseGradeType(mg.gradeType)
    if (baseType in slotsPerType && slot > slotsPerType[baseType]) {
      slotsPerType[baseType] = slot
    }
  }
}

function addSlot(baseType: string) {
  slotsPerType[baseType] = (slotsPerType[baseType] || 1) + 1
}

function confirmRemoveSlot(baseType: string, label: string) {
  removeConfirm.baseType = baseType
  removeConfirm.label = label
  removeConfirm.show = true
}

function executeRemoveSlot() {
  const baseType = removeConfirm.baseType
  const count = slotsPerType[baseType] || 1
  if (count <= 1) { removeConfirm.show = false; return }

  const removedKey = gradeTypeForSlot(baseType, count)
  // Clear edited grades for the removed column
  for (const s of allStudents.value) {
    const key = gradeKey(s.userId, removedKey)
    delete editedManualGrades.value[key]
    delete originalManualGrades.value[key]
  }

  slotsPerType[baseType] = count - 1
  removeConfirm.show = false
}

// --- Grade column groups (dynamic) ---

const gradeColumnGroups = computed<GradeColumnGroup[]>(() => {
  return BASE_TYPE_META.map(meta => {
    const count = slotsPerType[meta.baseType] || 1
    const columns: GradeColumn[] = []
    for (let slot = 1; slot <= count; slot++) {
      columns.push({
        key: gradeTypeForSlot(meta.baseType, slot),
        baseType: meta.baseType,
        slot,
        shortLabel: count > 1 ? `${meta.emoji} ${meta.short}${slot}` : `${meta.emoji} ${meta.short}`,
        fullLabel: count > 1 ? `${meta.label} ${slot}` : meta.label,
      })
    }
    return { baseType: meta.baseType, label: meta.label, emoji: meta.emoji, columns }
  })
})

// --- All grade column keys (flat list) ---

const allGradeColumnKeys = computed(() => {
  return gradeColumnGroups.value.flatMap(g => g.columns.map(c => c.key))
})

// --- Students ---

const allStudents = computed(() => {
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

// --- Dirty tracking ---

const dirtyEntries = computed(() => {
  return Object.entries(editedManualGrades.value).filter(([key, val]) => {
    return val !== originalManualGrades.value[key]
  })
})

const dirtyTaskEntries = computed(() => {
  return Object.entries(editedTaskGrades.value).filter(([key, val]) => {
    return val !== originalTaskGrades.value[key]
  })
})

// --- Grade helpers ---

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
  return taskGrades.value.find(tg => Number(tg.studentId) === userId && Number(tg.taskId) === taskId)
}

function getEditedTaskGrade(userId: number, taskId: number): number | string {
  const key = gradeKey(userId, String(taskId))
  const val = editedTaskGrades.value[key]
  return val !== null && val !== undefined ? val : ''
}

function onTaskGradeChange(userId: number, taskId: number, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value)
  const key = gradeKey(userId, String(taskId))
  if (Number.isNaN(val) || (event.target as HTMLInputElement).value === '') {
    editedTaskGrades.value[key] = null
  } else {
    editedTaskGrades.value[key] = Math.min(10, Math.max(0, val))
  }
}

function computeAverage(userId: number): string {
  const avgArr = (arr: number[]): number | null => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null

  // Group manual grades by base type (comportamiento, participacion, examenes)
  // Treat null/undefined grades as 0
  const byType: Record<string, number[]> = {}
  for (const group of gradeColumnGroups.value) {
    for (const col of group.columns) {
      const key = gradeKey(userId, col.key)
      const val = editedManualGrades.value[key]
      const grade = (val !== null && val !== undefined) ? val : 0
      if (!byType[group.baseType]) byType[group.baseType] = []
      byType[group.baseType].push(grade)
    }
  }

  // Task grades — treat null/undefined as 0
  const taskValues: number[] = []
  for (const task of tasks.value) {
    const key = gradeKey(userId, String(task.id))
    const edited = editedTaskGrades.value[key]
    taskValues.push((edited !== null && edited !== undefined) ? edited : 0)
  }

  const comportamientoAvg = avgArr(byType['comportamiento'] ?? [])
  const participacionAvg = avgArr(byType['participacion'] ?? [])
  const examenesAvg = avgArr(byType['examenes'] ?? [])
  const tareasAvg = avgArr(taskValues)

  const categoryAvgs = [comportamientoAvg, participacionAvg, examenesAvg, tareasAvg].filter((v): v is number => v !== null)
  if (categoryAvgs.length === 0) return '0.0'
  const avg = categoryAvgs.reduce((a, b) => a + b, 0) / categoryAvgs.length
  return avg.toFixed(1)
}

function avgClass(userId: number): string {
  const avg = computeAverage(userId)
  if (avg === '0.0') return ''
  return parseFloat(avg) >= 6 ? 'pass' : 'fail'
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

// --- Bulk action ---

function applyBulkGrade() {
  if (bulkGrade.value === null || bulkGrade.value === undefined) return
  const clamped = Math.min(10, Math.max(0, bulkGrade.value))
  for (const s of allStudents.value) {
    editedManualGrades.value[gradeKey(s.userId, bulkColumnKey.value)] = clamped
  }
}

// ═══ Period state & logic ═══

const showPeriodsSection = ref(false)
const periods = ref<GradePeriod[]>([])
const periodsLoading = ref(false)
const closing = ref(false)
const periodSaving = ref(false)
const newPeriodName = ref('')
const expandedPeriodId = ref<number | null>(null)
const closePeriodConfirm = ref(false)
const deletePeriodConfirm = reactive({ show: false, id: 0, name: '' })
const betweenPeriods = ref(false)
const hasClosedPeriods = ref(false)
const activePeriodStartedAt = ref<string | null>(null)
const periodStartDate = ref('')
const periodEndDate = ref('')
const startingPeriod = ref(false)
const startPeriodError = ref<string | null>(null)

// Editable period manual grades: key = `${periodId}-${studentId}-${gradeType}`, value = grade
const editedPeriodGrades = ref<Record<string, number | null>>({})
const originalPeriodGrades = ref<Record<string, number | null>>({})
// Track which periods have dirty changes
const periodDirtyKeys = computed(() => {
  const dirty = new Set<number>()
  for (const [key, val] of Object.entries(editedPeriodGrades.value)) {
    if (val !== originalPeriodGrades.value[key]) {
      const periodId = parseInt(key.split('-')[0])
      dirty.add(periodId)
    }
  }
  return dirty
})

// The active period is the one without a snapshot (started but not yet closed)
const activePeriod = computed(() => periods.value.find(p => p.snapshot === null) ?? null)

// nextPeriodNumber only counts closed periods to avoid doubling the active one
const nextPeriodNumber = computed(() => {
  const closed = periods.value.filter(p => p.snapshot !== null)
  if (!closed.length) return 1
  return Math.max(...closed.map(p => p.periodNumber)) + 1
})

async function loadPeriods() {
  periodsLoading.value = true
  try {
    periods.value = await periodAdapter.listBySubject(props.subjectId)
    // Si hay un periodo activo (snapshot === null), salir del estado "between periods"
    const hasActive = periods.value.some(p => p.snapshot === null)
    if (hasActive) {
      betweenPeriods.value = false
      const active = periods.value.find(p => p.snapshot === null)
      activePeriodStartedAt.value = active?.startsAt ?? null
    }
    hasClosedPeriods.value = periods.value.some(p => p.snapshot !== null)
  } catch { periods.value = [] }
  periodsLoading.value = false
}

function onClosePeriod() {
  closePeriodConfirm.value = true
}

async function executeClosePeriod() {
  if (closing.value) return // guard: prevent double-execution from rapid clicks
  closePeriodConfirm.value = false
  closing.value = true
  try {
    await periodAdapter.closePeriod({
      courseId: props.courseId,
      subjectId: props.subjectId,
      name: newPeriodName.value || undefined,
      startsAt: activePeriodStartedAt.value || undefined,
      endsAt: new Date().toISOString(),
    })
    newPeriodName.value = ''
    activePeriodStartedAt.value = null

    // Reload periods
    await loadPeriods()

    // Reload current sheet (should be empty now)
    const sheet = await gradeAdapter.getGradeSheet(props.subjectId)
    sheetStudents.value = sheet.students || []
    tasks.value = sheet.tasks || []
    manualGradesData.value = sheet.manualGrades || []
    taskGrades.value = sheet.taskGrades || []

    // Reset editable data
    editedManualGrades.value = {}
    originalManualGrades.value = {}
    editedTaskGrades.value = {}
    originalTaskGrades.value = {}

    // Re-discover slots
    slotsPerType.comportamiento = 1
    slotsPerType.participacion = 1
    slotsPerType.examenes = 1
    discoverSlots()

    // Re-populate
    for (const mg of manualGradesData.value) {
      const key = gradeKey(mg.studentId, mg.gradeType)
      editedManualGrades.value[key] = mg.grade
      originalManualGrades.value[key] = mg.grade
    }
    for (const tg of taskGrades.value) {
      if (tg.grade !== null && tg.grade !== undefined) {
        const key = gradeKey(tg.studentId, String(tg.taskId))
        editedTaskGrades.value[key] = tg.grade
        originalTaskGrades.value[key] = tg.grade
      }
    }

    emit('saved')
    betweenPeriods.value = true
  } catch (err: any) {
    console.error('[GradePanel] Error closing period:', err)
  }
  closing.value = false
}

async function executeStartPeriod() {
  if (!props.courseId || !props.subjectId || isNaN(props.courseId) || isNaN(props.subjectId)) {
    console.error('[GradePanel] Invalid courseId or subjectId:', { courseId: props.courseId, subjectId: props.subjectId })
    return
  }
  startingPeriod.value = true
  startPeriodError.value = null
  const now = new Date().toISOString()
  try {
    await periodAdapter.startPeriod({
      courseId: Number(props.courseId),
      subjectId: Number(props.subjectId),
      name: newPeriodName.value || undefined,
      startsAt: now,
    })
    newPeriodName.value = ''
    periodStartDate.value = ''
    periodEndDate.value = ''
    activePeriodStartedAt.value = now
    betweenPeriods.value = false

    // Reload periods
    await loadPeriods()
    emit('saved')
  } catch (err: any) {
    console.error('[GradePanel] Error starting period:', err)
    startPeriodError.value = err?.message || 'Error al iniciar el periodo. Intenta de nuevo.'
  }
  startingPeriod.value = false
}

function togglePeriod(p: GradePeriod) {
  if (expandedPeriodId.value === p.id) {
    expandedPeriodId.value = null
    return
  }
  expandedPeriodId.value = p.id

  // Populate editable period grades from snapshot
  const snapshot = p.snapshot
  if (!snapshot) return
  for (const mg of (snapshot.manualGrades ?? [])) {
    const key = `${p.id}-${mg.studentId}-${mg.gradeType}`
    editedPeriodGrades.value[key] = mg.grade
    originalPeriodGrades.value[key] = mg.grade
  }
}

function periodSnapshotStudents(p: GradePeriod) {
  if (p.snapshot === null) return allStudents.value
  return p.snapshot.students ?? []
}

function periodSnapshotTasks(p: GradePeriod) {
  if (p.snapshot === null) return tasks.value
  return p.snapshot.tasks ?? []
}

function periodManualCols(p: GradePeriod): string[] {
  if (p.snapshot === null) return allGradeColumnKeys.value
  const grades = p.snapshot.manualGrades ?? []
  const typesFromData = new Set<string>()
  for (const g of grades) typesFromData.add(g.gradeType)
  // Always include the 3 base columns in display order, plus any extra slots from the snapshot
  const result: string[] = []
  for (const meta of BASE_TYPE_META) {
    result.push(meta.baseType)
    let slot = 2
    while (typesFromData.has(`${meta.baseType}_${slot}`)) {
      result.push(`${meta.baseType}_${slot}`)
      slot++
    }
  }
  return result
}

function periodGradeKey(periodId: number, studentId: number, gradeType: string) {
  return `${periodId}-${studentId}-${gradeType}`
}

function getPeriodManualGrade(periodId: number, studentId: number, gradeType: string): number | string {
  const period = periods.value.find(p => p.id === periodId)
  if (period?.snapshot === null) return getManualGrade(studentId, gradeType)
  const key = periodGradeKey(periodId, studentId, gradeType)
  const val = editedPeriodGrades.value[key]
  return val !== null && val !== undefined ? val : ''
}

function setPeriodManualGrade(periodId: number, studentId: number, gradeType: string, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value)
  const key = periodGradeKey(periodId, studentId, gradeType)
  if (Number.isNaN(val) || (event.target as HTMLInputElement).value === '') {
    editedPeriodGrades.value[key] = null
  } else {
    editedPeriodGrades.value[key] = Math.min(10, Math.max(0, val))
  }
}

function getPeriodTaskGrade(p: GradePeriod, studentId: number, taskId: number): number | null {
  if (p.snapshot === null) {
    const val = editedTaskGrades.value[gradeKey(studentId, String(taskId))]
    return val !== null && val !== undefined ? val : null
  }
  const tg = p.snapshot.taskGrades ?? []
  const g = tg.find((t: any) => Number(t.studentId) === studentId && Number(t.taskId) === taskId)
  return g?.grade ?? null
}

function computePeriodAvg(p: GradePeriod, studentId: number): string {
  if (p.snapshot === null) return computeAverage(studentId)
  const manualCols = periodManualCols(p)
  const manualVals: number[] = []
  for (const col of manualCols) {
    const key = periodGradeKey(p.id, studentId, col)
    const val = editedPeriodGrades.value[key]
    manualVals.push(val !== null && val !== undefined ? val : 0)
  }
  const taskVals: number[] = []
  for (const task of periodSnapshotTasks(p)) {
    const g = getPeriodTaskGrade(p, studentId, task.id)
    taskVals.push(g !== null ? g : 0)
  }
  const all = [...manualVals, ...taskVals]
  if (!all.length) return '0.0'
  return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
}

function periodAvgClass(avg: string): string {
  if (avg === '0.0') return ''
  return parseFloat(avg) >= 6 ? 'pass' : 'fail'
}

function periodTaskGradeClass(grade: number | null): string {
  if (grade === null) return 'no-submission'
  return grade >= 6 ? 'pass' : 'fail'
}

async function savePeriodChanges(p: GradePeriod) {
  periodSaving.value = true
  try {
    // Rebuild the manualGrades array from edited state
    const manualGrades: any[] = []
    for (const col of periodManualCols(p)) {
      for (const student of periodSnapshotStudents(p)) {
        const key = periodGradeKey(p.id, student.userId, col)
        const val = editedPeriodGrades.value[key]
        if (val !== null && val !== undefined) {
          manualGrades.push({ studentId: student.userId, gradeType: col, grade: val })
        }
      }
    }
    const updated = await periodAdapter.updateGrades(p.id, { manualGrades })

    // Update local state
    const idx = periods.value.findIndex(pp => pp.id === p.id)
    if (idx >= 0) periods.value[idx] = updated

    // Reset originals
    for (const [key, val] of Object.entries(editedPeriodGrades.value)) {
      if (key.startsWith(`${p.id}-`)) {
        originalPeriodGrades.value[key] = val
      }
    }
  } catch (err: any) {
    console.error('[GradePanel] Error saving period changes:', err)
  }
  periodSaving.value = false
}

function confirmDeletePeriod(p: GradePeriod) {
  deletePeriodConfirm.id = p.id
  deletePeriodConfirm.name = p.name
  deletePeriodConfirm.show = true
}

async function executeDeletePeriod() {
  const id = deletePeriodConfirm.id
  deletePeriodConfirm.show = false
  try {
    await periodAdapter.deletePeriod(id)
    periods.value = periods.value.filter(p => p.id !== id)
    if (expandedPeriodId.value === id) expandedPeriodId.value = null
    // Clean up edited period grades
    for (const key of Object.keys(editedPeriodGrades.value)) {
      if (key.startsWith(`${id}-`)) {
        delete editedPeriodGrades.value[key]
        delete originalPeriodGrades.value[key]
      }
    }
  } catch (err: any) {
    console.error('[GradePanel] Error deleting period:', err)
  }
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatGradeTypeLabel(t: string): string {
  const map: Record<string, string> = { comportamiento: '🤝 Com', participacion: '🙋 Par', examenes: '📝 Exa' }
  const match = t.match(/^(comportamiento|participacion|examenes)(?:_(\d+))?$/)
  if (!match) return t
  const base = match[1]
  const slot = match[2] ? ` ${match[2]}` : ''
  return (map[base] ?? t) + slot
}

// --- Save ---

async function saveAllGrades() {
  saving.value = true
  try {
    // ── Manual grades: agrupar por tipo y enviar en paralelo ──
    const byType: Record<string, { studentId: number; grade: number }[]> = {}
    for (const [key, val] of dirtyEntries.value) {
      if (val === null || val === undefined) continue
      const parts = key.split('-')
      const userIdStr = parts[0]
      const type = parts.slice(1).join('-')
      if (!byType[type]) byType[type] = []
      byType[type].push({ studentId: Number(userIdStr), grade: val })
    }

    await Promise.all(
      Object.entries(byType).map(([type, entries]) =>
        gradeAdapter.bulkSetGrades({
          courseId: props.courseId,
          subjectId: props.subjectId,
          gradeType: type,
          entries,
        })
      )
    )

    for (const [key, val] of Object.entries(editedManualGrades.value)) {
      originalManualGrades.value[key] = val
    }

    // ── Task grades: guardar todas en paralelo ──
    await Promise.all(
      dirtyTaskEntries.value
        .filter(([, newGrade]) => newGrade !== null && newGrade !== undefined)
        .map(async ([key, newGrade]) => {
          const parts = key.split('-')
          const studentId = Number(parts[0])
          const taskId = Number(parts.slice(1).join('-'))
          const tg = getTaskGrade(studentId, taskId)
          if (tg?.submissionId) {
            await gradeAdapter.gradeSubmission(tg.submissionId, newGrade as number)
            originalTaskGrades.value[key] = newGrade
            return
          }
          // Si no existe entrega, crear una en nombre del estudiante
          try {
            const created = await submissionAdapter.submitWorkForStudent({ taskId, studentId })
            if (created && (created as any).id) {
              await gradeAdapter.gradeSubmission((created as any).id, newGrade as number)
              originalTaskGrades.value[key] = newGrade
            }
          } catch (err) {
            console.error('[GradePanel] Error creating submission for student', studentId, 'task', taskId, err)
          }
        })
    )

    emit('saved')
  } catch (err) {
    console.error('[GradePanel] Error saving:', err)
  }
  saving.value = false
}

// --- Init ---

onMounted(async () => {
  loading.value = true
  try {
    const sheet = await gradeAdapter.getGradeSheet(props.subjectId)
    sheetStudents.value = sheet.students || []
    tasks.value = sheet.tasks || []
    manualGradesData.value = sheet.manualGrades || []
    taskGrades.value = sheet.taskGrades || []

    // Detect "no active period" state: require period to be started before showing grade sheet
    const hasClosed = (sheet.closedPeriodsCount ?? 0) > 0
    hasClosedPeriods.value = hasClosed
    // Use hasActivePeriod from backend when available; fall back to heuristic for older backends
    if (sheet.hasActivePeriod != null) {
      betweenPeriods.value = !sheet.hasActivePeriod
    } else {
      const hasCurrentGrades = manualGradesData.value.length > 0
      const hasCurrentTasks = tasks.value.length > 0
      if (!hasCurrentGrades && !hasCurrentTasks) {
        betweenPeriods.value = true
      }
    }

    // Discover existing multi-slot columns from data
    discoverSlots()

    // Populate editable manual grades
    for (const mg of manualGradesData.value) {
      const key = gradeKey(mg.studentId, mg.gradeType)
      editedManualGrades.value[key] = mg.grade
      originalManualGrades.value[key] = mg.grade
    }

    // Populate editable task grades
    for (const tg of taskGrades.value) {
      if (tg.grade !== null && tg.grade !== undefined) {
        const key = gradeKey(tg.studentId, String(tg.taskId))
        editedTaskGrades.value[key] = tg.grade
        originalTaskGrades.value[key] = tg.grade
      }
    }
  } catch (err) {
    console.error('[GradePanel] Error loading sheet:', err)
  }
  loading.value = false

  // Load periods in parallel
  loadPeriods()
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
  transition: padding 0.25s ease;
}

.grade-overlay.expanded {
  padding: 0;
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
  transition: all 0.25s ease;
}

.grade-panel.expanded {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-btn {
  background: rgba(191, 90, 242, 0.1);
  border: 1px solid rgba(191, 90, 242, 0.25);
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.expand-btn:hover {
  background: rgba(191, 90, 242, 0.2);
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

/* ── Between periods state ── */
.between-periods-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
  text-align: center;
  gap: 10px;
}

.between-periods-icon { font-size: 36px; }

.between-periods-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.between-periods-desc {
  font-size: 14px;
  color: #8E8E93;
  max-width: 340px;
  line-height: 1.5;
  margin: 0;
}

.btn-start-period {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-start-period:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 16px rgba(191, 90, 242, 0.3);
}

.btn-start-period:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.start-period-error {
  margin-top: 8px;
  font-size: 12px;
  color: #FF453A;
  text-align: center;
}

.start-period-form {
  width: 100%;
  max-width: 380px;
}

.start-period-row {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.start-period-row .period-name-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.06);
  color: #fff;
  font-size: 14px;
  outline: none;
}

.start-period-row .btn-start-period {
  white-space: nowrap;
  flex-shrink: 0;
}

.period-date-range {
  font-size: 10px;
  color: #BF5AF2;
  opacity: 0.8;
}

.period-active-badge {
  font-size: 11px;
  color: #30d158;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.period-live-note {
  padding: 8px 12px;
  font-size: 12px;
  color: #8E8E93;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.06);
}

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

/* ── Scrollable panel body ── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ── Sheet table ── */
.sheet-wrapper {
  flex-shrink: 0;
}

.sheet-scroll {
  overflow: auto;
  max-height: 42vh;
}

.grade-panel.expanded .sheet-scroll {
  max-height: 55vh;
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

.col-manual { min-width: 72px; }
.col-task { min-width: 90px; }
.col-avg { min-width: 72px; }

/* Add-slot / remove-slot column */
.col-slot-actions {
  min-width: 38px;
  max-width: 38px;
  padding: 4px 2px !important;
}

.col-slot-actions-spacer {
  min-width: 38px;
  max-width: 38px;
  padding: 0 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.slot-action-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.add-slot-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px dashed rgba(191, 90, 242, 0.4);
  background: rgba(191, 90, 242, 0.08);
  color: #BF5AF2;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.add-slot-btn:hover {
  background: rgba(191, 90, 242, 0.2);
  border-color: #BF5AF2;
}

.remove-slot-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px dashed rgba(255, 55, 95, 0.4);
  background: rgba(255, 55, 95, 0.08);
  color: #FF375F;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.remove-slot-btn:hover {
  background: rgba(255, 55, 95, 0.2);
  border-color: #FF375F;
}

/* ── Liquidglass confirm dialog ── */
.glass-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.glass-dialog {
  background: rgba(30, 30, 50, 0.55);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  padding: 32px 28px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: glass-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes glass-pop {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.glass-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.glass-title {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
  line-height: 1.3;
}

.glass-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  margin: 0 0 22px;
}

.glass-desc strong {
  color: #fff;
}

.glass-actions {
  display: flex;
  gap: 10px;
}

.glass-btn {
  flex: 1;
  padding: 11px 16px;
  border-radius: 14px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.glass-btn.cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.glass-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.16);
}

.glass-btn.confirm {
  background: rgba(255, 55, 95, 0.25);
  color: #FF375F;
  border: 1px solid rgba(255, 55, 95, 0.3);
}

.glass-btn.confirm:hover {
  background: rgba(255, 55, 95, 0.4);
}

.glass-fade-enter-active, .glass-fade-leave-active {
  transition: opacity 0.2s ease;
}

.glass-fade-enter-from, .glass-fade-leave-to {
  opacity: 0;
}

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
  -moz-appearance: textfield;
  appearance: textfield;
}

.cell-input::-webkit-inner-spin-button,
.cell-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
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

/* ── Desktop: respect left navigation rail ── */
@media (min-width: 769px) {
  .grade-overlay.expanded {
    left: 100px;
  }

  .grade-panel.expanded {
    width: calc(100vw - 100px);
    max-width: calc(100vw - 100px);
  }

  .glass-overlay {
    left: 100px;
  }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .grade-overlay {
    padding: 0;
  }

  .grade-panel {
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: none;
  }

  .grade-panel .sheet-scroll {
    max-height: calc(100vh - 280px);
  }

  .panel-header {
    padding: 14px 14px 10px;
  }

  .panel-title {
    font-size: 15px;
  }

  .search-bar {
    margin: 0 14px 10px;
    padding: 8px 12px;
  }

  .sticky-col {
    min-width: 130px;
  }

  .cell-name {
    font-size: 12px;
    max-width: 100px;
  }

  .cell-username {
    display: none;
  }

  .student-avatar-sm {
    width: 24px;
    height: 24px;
  }

  .cell-input {
    width: 48px;
    padding: 8px 2px;
    font-size: 13px;
  }

  .col-manual {
    min-width: 56px;
  }

  .bulk-section {
    gap: 6px;
  }

  .bulk-label {
    width: 100%;
    font-size: 12px;
  }

  .bulk-select, .bulk-input {
    font-size: 12px;
    padding: 6px 8px;
  }

  .panel-footer {
    padding: 10px 14px 14px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .save-btn {
    width: 100%;
    text-align: center;
  }
}

/* ═══ Periods Section ═══ */
.periods-section {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.periods-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.periods-header:hover {
  background: rgba(191, 90, 242, 0.04);
}

.periods-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.periods-header-left svg {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.periods-header-left svg.rotated {
  transform: rotate(90deg);
}

.periods-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.periods-badge {
  background: rgba(191, 90, 242, 0.2);
  color: #BF5AF2;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.periods-body {
  padding: 0 20px 16px;
}

.close-period-bar {
  padding: 12px 16px;
  background: rgba(191, 90, 242, 0.04);
  border: 1px solid rgba(191, 90, 242, 0.12);
  border-radius: 14px;
  margin-bottom: 14px;
}

.period-hint {
  font-size: 13px;
  color: #8E8E93;
  margin: 0 0 10px;
}

.close-period-row {
  display: flex;
  gap: 10px;
}

.period-name-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 14px;
  outline: none;
}

.period-name-input:focus {
  border-color: #BF5AF2;
}

.btn-close-period {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.btn-close-period:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.period-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.period-item {
  border-radius: 12px;
  overflow: hidden;
}

.period-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.period-card:hover {
  background: rgba(255, 255, 255, 0.07);
}

.period-card.active {
  background: rgba(191, 90, 242, 0.1);
  border: 1px solid rgba(191, 90, 242, 0.2);
}

.period-card-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.period-card-left svg {
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.period-card-left svg.rotated {
  transform: rotate(90deg);
}

.period-card-info {
  display: flex;
  flex-direction: column;
}

.period-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.period-date {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
}

.period-card-stats {
  display: flex;
  gap: 8px;
}

.stat-pill {
  font-size: 11px;
  color: #8E8E93;
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 8px;
  border-radius: 8px;
}

.period-detail {
  padding: 8px 4px 12px;
}

.period-sheet-scroll {
  max-height: 300px;
}

.period-save-bar {
  display: flex;
  justify-content: flex-end;
  padding: 10px 4px 4px;
}

.btn-save-period {
  padding: 8px 22px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #BF5AF2, #9B6BFF);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  transition: opacity 0.2s;
}

.btn-save-period:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.period-delete-bar {
  display: flex;
  justify-content: flex-start;
  padding: 6px 4px 0;
}

.btn-delete-period {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 55, 95, 0.2);
  background: rgba(255, 55, 95, 0.06);
  color: #FF375F;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete-period:hover {
  background: rgba(255, 55, 95, 0.15);
}

@media (max-width: 768px) {
  .periods-body {
    padding: 0 14px 14px;
  }

  .close-period-row {
    flex-direction: column;
  }

  .period-card-stats {
    display: none;
  }

  .period-sheet-scroll {
    max-height: 250px;
  }
}
</style>
