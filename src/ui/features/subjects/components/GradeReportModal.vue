<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="modelValue" class="report-overlay" :class="{ 'report-overlay--fs': isFullscreen }" @click.self="!isFullscreen && $emit('update:modelValue', false)">
        <div class="report-modal" :class="{ 'report-modal--fs': isFullscreen }">
          <!-- Header -->
          <div class="report-header">
            <div class="report-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h2 class="report-title">Reporte de Notas</h2>
            <button class="report-action-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
              <svg v-if="!isFullscreen" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
            </button>
            <button class="report-close" @click="$emit('update:modelValue', false)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="report-loading">
            <div class="spinner-report" />
            <p>Generando reporte...</p>
          </div>

          <!-- Content -->
          <div v-else class="report-body">
            <!-- Summary card -->
            <div class="summary-card">
              <div class="summary-stat">
                <span class="summary-value">{{ subjects.length }}</span>
                <span class="summary-label">Materias</span>
              </div>
              <div class="summary-divider" />
              <div class="summary-stat">
                <span class="summary-value">{{ totalSubmissions }}</span>
                <span class="summary-label">Entregas</span>
              </div>
              <div class="summary-divider" />
              <div class="summary-stat">
                <span class="summary-value">{{ gradedCount }}</span>
                <span class="summary-label">Calificadas</span>
              </div>
              <div class="summary-divider" />
              <div class="summary-stat">
                <span class="summary-value" :class="averageClass">{{ averageGrade }}</span>
                <span class="summary-label">Promedio</span>
              </div>
            </div>

            <!-- Filter: materias -->
            <div v-if="reportData.length > 1" class="filter-bar">
              <button class="filter-pill" :class="{ 'filter-pill--active': !selectedSubjectId }" @click="selectedSubjectId = null">
                Todas
              </button>
              <button
                v-for="group in reportData"
                :key="group.subjectId"
                class="filter-pill"
                :class="{ 'filter-pill--active': selectedSubjectId === group.subjectId }"
                @click="selectedSubjectId = group.subjectId"
              >
                {{ group.subjectName }}
              </button>
            </div>

            <!-- Subject sections with table -->
            <div class="report-table">
              <div v-for="group in filteredReportData" :key="group.subjectId" class="report-subject-group">
                <!-- Subject header with teacher name and average -->
                <div class="subject-row-header">
                  <div class="subject-info">
                    <span class="subject-name">{{ group.subjectName }}</span>
                    <span class="subject-teacher">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {{ group.teacherName }}
                    </span>
                  </div>
                  <span class="subject-avg" :class="gradeClass(group.average)">{{ group.average ?? '—' }}</span>
                </div>

                <!-- Breakdown: 4 promedios por estudiante -->
                <div v-if="group.gradeSummaries.length" class="breakdown-section">
                  <div class="breakdown-label">Promedios por categoría</div>
                  <div class="table-wrapper">
                    <table class="grade-table">
                      <thead>
                        <tr>
                          <th class="th-student">Estudiante</th>
                          <th class="th-grade">Tareas</th>
                          <th class="th-grade">Participación</th>
                          <th class="th-grade">Examen</th>
                          <th class="th-grade">Comportamiento</th>
                          <th class="th-ponderada">Nota Ponderada</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in group.gradeSummaries" :key="row.studentId" class="grade-row">
                          <td class="cell-student">{{ row.studentName }}</td>
                          <td class="cell-grade" :class="gradeClass(row.taskAvg)">{{ row.taskAvg != null ? row.taskAvg.toFixed(1) : '—' }}</td>
                          <td class="cell-grade" :class="gradeClass(row.participacionAvg)">{{ row.participacionAvg != null ? row.participacionAvg.toFixed(1) : '—' }}</td>
                          <td class="cell-grade" :class="gradeClass(row.examenesAvg)">{{ row.examenesAvg != null ? row.examenesAvg.toFixed(1) : '—' }}</td>
                          <td class="cell-grade" :class="gradeClass(row.comportamientoAvg)">{{ row.comportamientoAvg != null ? row.comportamientoAvg.toFixed(1) : '—' }}</td>
                          <td class="cell-ponderada" :class="gradeClass(row.notaPonderada)"><strong>{{ row.notaPonderada != null ? row.notaPonderada.toFixed(1) : '—' }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Grade table -->
                <div v-if="group.rows.length" class="table-wrapper">
                  <table class="grade-table">
                    <thead>
                      <tr>
                        <th class="th-student">Estudiante</th>
                        <th>Nombre Completo</th>
                        <th>Cédula</th>
                        <th>Tarea</th>
                        <th class="th-grade">Nota</th>
                        <th class="th-ponderada">Cal. Ponderada</th>
                        <th>Fecha de entrega</th>
                        <th>Docente que calificó</th>
                        <th>Retroalimentación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in group.rows" :key="i" class="grade-row" :class="{ 'row-not-submitted': row.notSubmitted }">
                        <td class="cell-student">{{ row.studentName }}</td>
                        <td class="cell-fullname">{{ row.studentFullName ?? '—' }}</td>
                        <td class="cell-cedula">{{ row.studentCedula ?? '—' }}</td>
                        <td class="cell-task">{{ row.taskName }}<span v-if="row.notSubmitted" class="badge-no-entrega">No entregado</span></td>
                        <td class="cell-grade" :class="row.notSubmitted ? 'grade-low' : gradeClass(row.grade)">{{ row.notSubmitted ? '0' : (row.grade ?? '—') }}</td>
                        <td class="cell-ponderada" :class="gradeClass(group.studentAverages[row.studentName] ?? null)">{{ group.studentAverages[row.studentName] != null ? group.studentAverages[row.studentName]!.toFixed(1) : '—' }}</td>
                        <td class="cell-date">{{ row.notSubmitted ? '—' : formatDate(row.submissionDate) }}</td>
                        <td class="cell-grader">{{ row.gradedByUsername ?? '—' }}</td>
                        <td class="cell-feedback">
                          <span v-if="row.feedback" :title="stripHtml(row.feedback)">{{ truncate(stripHtml(row.feedback), 80) }}</span>
                          <span v-else class="no-feedback">—</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="no-tasks">Sin entregas</div>
              </div>
            </div>
          </div>

          <!-- Export bar -->
          <div v-if="!loading" class="report-export-bar">
            <button class="export-btn export-pdf" @click="exportPDF">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              PDF
            </button>
            <button class="export-btn export-excel" @click="exportExcel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>
              Excel
            </button>
            <button class="export-btn export-share" @click="shareReport">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              Compartir
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type ExcelJS from 'exceljs'
import type { Subject } from '@/domain/models'
import { taskAdapter, topicAdapter } from '@/infrastructure/api'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { userAdapter } from '@/infrastructure/api/userAdapter'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet } from '@/infrastructure/api/gradeAdapter'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  modelValue: boolean
  courseId: number
  courseName?: string
  subjects: Subject[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const authStore = useAuthStore()

interface SubmissionRow {
  studentName: string
  studentFullName: string | null
  studentCedula: string | null
  taskName: string
  grade: number | null
  submissionDate: number | null
  feedback: string | null
  gradedByUsername: string | null
  notSubmitted?: boolean
}

interface GradeSummaryRow {
  studentName: string
  studentId: number
  taskAvg: number | null
  participacionAvg: number | null
  examenesAvg: number | null
  comportamientoAvg: number | null
  notaPonderada: number | null
}

interface SubjectReport {
  subjectId: number
  subjectName: string
  teacherName: string
  rows: SubmissionRow[]
  average: number | null
  studentAverages: Record<string, number>  // calificacion_ponderada por estudiante
  gradeSummaries: GradeSummaryRow[]
}

const loading = ref(false)
const reportData = ref<SubjectReport[]>([])
const isFullscreen = ref(false)
const selectedSubjectId = ref<number | null>(null)

const filteredReportData = computed(() =>
  selectedSubjectId.value != null
    ? reportData.value.filter(g => g.subjectId === selectedSubjectId.value)
    : reportData.value
)

function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }

onUnmounted(() => { isFullscreen.value = false })
watch(() => props.modelValue, (v) => {
  if (!v) {
    isFullscreen.value = false
    selectedSubjectId.value = null
  }
})

const totalSubmissions = computed(() => reportData.value.reduce((sum, g) => sum + g.rows.length, 0))
const gradedCount = computed(() => reportData.value.reduce((sum, g) => sum + g.rows.filter(r => r.grade !== null).length, 0))
const averageGrade = computed(() => {
  const graded = reportData.value.flatMap(g => g.rows).filter(r => r.grade !== null)
  if (!graded.length) return '—'
  const avg = graded.reduce((s, r) => s + r.grade!, 0) / graded.length
  return avg.toFixed(1)
})
const averageClass = computed(() => gradeClass(parseFloat(averageGrade.value) || null))

function gradeClass(grade: number | null): string {
  if (grade === null || isNaN(grade as number)) return ''
  if ((grade as number) >= 4) return 'grade-good'
  if ((grade as number) >= 3) return 'grade-ok'
  return 'grade-low'
}

function formatDate(ts: number | null): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}
function computeSubjectGradeSummaries(sheet: GradeSheet, taskNames: string[]): GradeSummaryRow[] {
  const totalTasks = taskNames.length
  const fmt = (v: number | null): number | null => v !== null ? Math.round(v * 10) / 10 : null
  const avgArr = (arr: number[]): number | null => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  return sheet.students.map(student => {
    const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
    const taskSum = stTaskGrades.reduce((s, tg) => s + (tg.grade ?? 0), 0)
    const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null
    const stManualGrades = sheet.manualGrades.filter(mg => Number(mg.studentId) === student.userId)
    const byType: Record<string, number[]> = {}
    for (const mg of stManualGrades) {
      const base = String(mg.gradeType).replace(/_\d+$/, '')
      if (!byType[base]) byType[base] = []
      byType[base].push(Number(mg.grade))
    }
    const participacionAvg = avgArr(byType['participacion'] ?? [])
    const examenesAvg = avgArr(byType['examenes'] ?? [])
    const comportamientoAvg = avgArr(byType['comportamiento'] ?? [])
    const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
    const notaPonderada = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    return {
      studentName: student.username ?? `#${student.userId}`,
      studentId: student.userId,
      taskAvg: fmt(taskAvg),
      participacionAvg: fmt(participacionAvg),
      examenesAvg: fmt(examenesAvg),
      comportamientoAvg: fmt(comportamientoAvg),
      notaPonderada: fmt(notaPonderada),
    }
  })
}
watch(() => props.modelValue, async (open) => {
  if (open && props.courseId) await fetchReport()
})

async function fetchReport() {
  loading.value = true
  try {
    // Collect teacher IDs from subjects
    const teacherIds = [...new Set(props.subjects.map(s => s.createdBy).filter((id): id is number => id != null))]

    const [topics, tasks, submissions, teachers] = await Promise.all([
      topicAdapter.getTopicsByCourse(props.courseId).catch(() => []),
      taskAdapter.getTasksByCourse(props.courseId).catch(() => []),
      // Admins and docentes use the by-course endpoint (returns all students)
      (authStore.isAdmin || authStore.isDocente)
        ? submissionAdapter.getSubmissionByCourse(props.courseId).catch(() => [])
        : submissionAdapter.getMySubmissions(1, 500).catch(() => []),
      teacherIds.length
        ? userAdapter.getUsersByIds(teacherIds).catch(() => [])
        : Promise.resolve([]),
    ])

    // task id → task
    const taskMap = new Map<number, any>()
    for (const t of (tasks as any[])) taskMap.set(t.id, t)

    // topic id → subject id
    const topicSubjectMap = new Map<number, number>()
    for (const t of (topics as any[])) {
      const sid = t.subjectId ?? t.subject_id ?? t.courseId ?? t.course_id
      if (sid) topicSubjectMap.set(t.id, sid)
    }

    // teacher user id → username
    const teacherMap = new Map<number, string>()
    for (const u of (teachers as any[])) {
      const username = u.username ?? u.usuario ?? `#${u.id}`
      teacherMap.set(Number(u.id), username)
    }

    // Group submission rows by subject
    const subjectRowsMap = new Map<number, SubmissionRow[]>()
    // Map subjectId → taskName → Set of submitted studentNames
    const submittedBySubjectTask = new Map<number, Map<string, Set<string>>>()
    // Map subjectId → list of task names
    const subjectTaskNames = new Map<number, string[]>()
    // All known students (submitted at least one task)
    const knownStudents = new Set<string>()
    // Map studentUsername → { fullName, cedula }
    const studentPersonaMap = new Map<string, { fullName: string | null, cedula: string | null }>()

    for (const sub of (submissions as any[])) {
      const taskId = sub.task_id ?? sub.taskId
      const task = taskMap.get(taskId)
      if (!task) continue
      const topicId = task.topicId ?? task.topic_id
      const subjectId = topicSubjectMap.get(topicId)
      if (!subjectId) continue

      const studentName = sub.studentUsername ?? sub.student_username ?? `Estudiante #${sub.student_id ?? sub.studentId}`
      const taskName = sub.taskName ?? task.title ?? task.name ?? 'Sin título'
      knownStudents.add(studentName)

      // Track persona data for this student
      if (!studentPersonaMap.has(studentName)) {
        studentPersonaMap.set(studentName, {
          fullName: sub.studentFullName ?? null,
          cedula: sub.studentCedula ?? null,
        })
      }

      if (!subjectRowsMap.has(subjectId)) subjectRowsMap.set(subjectId, [])
      subjectRowsMap.get(subjectId)!.push({
        studentName,
        studentFullName: sub.studentFullName ?? null,
        studentCedula: sub.studentCedula ?? null,
        taskName,
        grade: sub.grade ?? null,
        submissionDate: sub.submission_date ?? sub.submissionDate ?? null,
        feedback: sub.feedback ?? null,
        gradedByUsername: sub.gradedByUsername ?? null,
      })

      // Track submitted (subjectId, taskName, studentName)
      if (!submittedBySubjectTask.has(subjectId)) submittedBySubjectTask.set(subjectId, new Map())
      const taskMap2 = submittedBySubjectTask.get(subjectId)!
      if (!taskMap2.has(taskName)) taskMap2.set(taskName, new Set())
      taskMap2.get(taskName)!.add(studentName)
    }

    // Build the task-name list per subject (for detecting non-submissions)
    for (const [taskId, task] of taskMap) {
      const topicId = task.topicId ?? task.topic_id
      const subjectId = topicSubjectMap.get(topicId)
      if (!subjectId) continue
      const taskName = task.title ?? task.name ?? 'Sin título'
      if (!subjectTaskNames.has(subjectId)) subjectTaskNames.set(subjectId, [])
      const existing = subjectTaskNames.get(subjectId)!
      if (!existing.includes(taskName)) existing.push(taskName)
    }

    // Add 0-grade rows for known students who haven't submitted each task
    for (const [subjectId, taskNames] of subjectTaskNames) {
      if (!knownStudents.size || !taskNames.length) continue
      const rows = subjectRowsMap.get(subjectId) ?? []
      const taskSubmissions = submittedBySubjectTask.get(subjectId) ?? new Map()
      for (const taskName of taskNames) {
        const submitters = taskSubmissions.get(taskName) ?? new Set()
        for (const studentName of knownStudents) {
          if (!submitters.has(studentName)) {
            const persona = studentPersonaMap.get(studentName) ?? { fullName: null, cedula: null }
            rows.push({ studentName, studentFullName: persona.fullName, studentCedula: persona.cedula, taskName, grade: 0, submissionDate: null, feedback: null, gradedByUsername: null, notSubmitted: true })
          }
        }
      }
      if (!subjectRowsMap.has(subjectId)) subjectRowsMap.set(subjectId, rows)
    }

    // Fetch grade sheets for all subjects in parallel (manual grades for category breakdown)
    const gradeSheetMap = new Map<number, GradeSheet>()
    await Promise.allSettled(
      props.subjects.map(s =>
        gradeAdapter.getGradeSheet(s.id)
          .then(sheet => { if (sheet) gradeSheetMap.set(s.id, sheet) })
          .catch(() => {})
      )
    )

    // Build per-subject report
    reportData.value = props.subjects.map(subject => {
      const rows = subjectRowsMap.get(subject.id) ?? []

      // calificacion_ponderada por estudiante: suma de notas (null=0) / total tareas del subject
      const totalTasks = (subjectTaskNames.get(subject.id) ?? []).length || 1
      const studentGradeSum = new Map<string, number>()
      for (const row of rows) {
        const prev = studentGradeSum.get(row.studentName) ?? 0
        studentGradeSum.set(row.studentName, prev + (row.grade ?? 0))
      }
      const studentAverages: Record<string, number> = {}
      for (const [name, sum] of studentGradeSum) {
        studentAverages[name] = parseFloat((sum / totalTasks).toFixed(1))
      }

      const graded = rows.filter(r => r.grade !== null && !r.notSubmitted)
      const avg = graded.length ? graded.reduce((s, r) => s + r.grade!, 0) / graded.length : null

      const teacherName = subject.createdBy != null
        ? teacherMap.get(subject.createdBy) ?? `Docente #${subject.createdBy}`
        : '—'

      const sheet = gradeSheetMap.get(subject.id)
      const gradeSummaries = sheet
        ? computeSubjectGradeSummaries(sheet, subjectTaskNames.get(subject.id) ?? [])
        : []

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        teacherName,
        rows,
        average: avg != null ? parseFloat(avg.toFixed(1)) : null,
        studentAverages,
        gradeSummaries,
      }
    })
  } catch { /* silent */ }
  finally { loading.value = false }
}

// ── PDF export (print-based) ──
function exportPDF() {
  const html = buildPrintableHTML()
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

// ── Excel export (OOXML .xlsx – formato nativo de Excel, sin advertencias) ──
async function exportExcel() {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'CourseV'
  wb.created = new Date()
  const ws = wb.addWorksheet('Reporte de Notas')

  ws.columns = [
    { width: 26 }, // Curso
    { width: 24 }, // Estudiante
    { width: 28 }, // Nombre Completo
    { width: 16 }, // Cédula
    { width: 34 }, // Tarea
    { width: 10 }, // Nota
    { width: 14 }, // Cal. Ponderada
    { width: 20 }, // Fecha de entrega
    { width: 22 }, // Docente que calificó
    { width: 38 }, // Retroalimentación
  ]

  const hdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B1060' } }
  const grpHdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3EAFE' } }
  const row0Fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
  const row1Fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F7FC' } }
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    left: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    bottom: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    right: { style: 'thin', color: { argb: 'FFE0DDE8' } },
  }

  function gradeFont(grade: number | null, notSubmitted?: boolean): Partial<ExcelJS.Font> {
    if (notSubmitted || (grade !== null && grade < 3)) return { bold: true, color: { argb: 'FFB91C1C' }, name: 'Calibri' }
    if (grade !== null && grade >= 4) return { bold: true, color: { argb: 'FF1A7F37' }, name: 'Calibri' }
    if (grade !== null) return { bold: true, color: { argb: 'FFB45309' }, name: 'Calibri' }
    return { color: { argb: 'FF999999' }, name: 'Calibri' }
  }

  // Header row
  const hdrRow = ws.addRow(['Curso', 'Estudiante', 'Nombre Completo', 'Cédula', 'Tarea', 'Nota', 'Cal. Ponderada', 'Fecha de entrega', 'Docente que calificó', 'Retroalimentación'])
  hdrRow.eachCell((cell: ExcelJS.Cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' }
    cell.fill = hdrFill
    cell.border = thinBorder
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
  hdrRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }
  hdrRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
  hdrRow.height = 18

  for (const group of reportData.value) {
    const avg = group.average !== null ? group.average : '—'
    const grpRow = ws.addRow([`${group.subjectName} — Docente: ${group.teacherName} — Promedio: ${avg}`])
    ws.mergeCells(grpRow.number, 1, grpRow.number, 10)
    grpRow.getCell(1).font = { bold: true, color: { argb: 'FF4A0E8F' }, size: 11, name: 'Calibri' }
    grpRow.getCell(1).fill = grpHdrFill
    grpRow.getCell(1).border = thinBorder
    grpRow.height = 20

    if (!group.rows.length) {
      const emptyRow = ws.addRow(['Sin entregas registradas'])
      ws.mergeCells(emptyRow.number, 1, emptyRow.number, 10)
      emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
      continue
    }

    group.rows.forEach((row, i) => {
      const grade = row.notSubmitted ? 0 : (row.grade ?? null)
      const ponderadaNum = group.studentAverages[row.studentName] ?? null
      const ponderada = ponderadaNum !== null ? Number(ponderadaNum.toFixed(1)) : '—'
      const taskLabel = row.notSubmitted ? `${row.taskName} (No entregado)` : row.taskName
      const fb = row.feedback ? stripHtml(row.feedback) : '—'

      const dataRow = ws.addRow([
        props.courseName ?? `Curso ${props.courseId}`,
        row.studentName,
        row.studentFullName ?? '—',
        row.studentCedula ?? '—',
        taskLabel,
        grade !== null ? Number(typeof grade === 'number' ? grade.toFixed(1) : grade) : '—',
        ponderada,
        row.notSubmitted ? '—' : formatDate(row.submissionDate),
        row.gradedByUsername ?? '—',
        fb,
      ])
      const rowFill = i % 2 === 0 ? row0Fill : row1Fill
      dataRow.eachCell((cell: ExcelJS.Cell) => {
        cell.fill = rowFill
        cell.border = thinBorder
        cell.font = { name: 'Calibri' }
        cell.alignment = { vertical: 'middle', wrapText: true }
      })
      dataRow.getCell(6).font = gradeFont(typeof grade === 'number' ? grade : null, row.notSubmitted)
      dataRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' }
      if (ponderadaNum !== null) {
        dataRow.getCell(7).font = gradeFont(ponderadaNum)
      } else {
        dataRow.getCell(7).font = { color: { argb: 'FF999999' }, name: 'Calibri' }
      }
      dataRow.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
      dataRow.height = 16
    })
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_notas_${Date.now()}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function escH(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Share (Web Share API + fallback) ──
async function shareReport() {
  const text = buildShareText()

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Reporte de Notas', text })
    } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(text)
    alert('Reporte copiado al portapapeles')
  }
}

function esc(s: string) { return s.replace(/"/g, '""') }

function buildShareText(): string {
  let text = '📊 REPORTE DE NOTAS\n\n'
  for (const group of reportData.value) {
    text += `📘 ${group.subjectName} — Docente: ${group.teacherName} (Promedio: ${group.average ?? '—'})\n`
    for (const row of group.rows) {
      const gradeStr = row.notSubmitted ? '0 (No entregado)' : (row.grade ?? 'Sin nota')
      const ponderada = group.studentAverages[row.studentName] != null ? ` [Cal. Ponderada: ${group.studentAverages[row.studentName]!.toFixed(1)}]` : ''
      text += `   • [${row.studentName}] ${row.taskName}: ${gradeStr}${ponderada}${row.gradedByUsername ? ` (Calificó: ${row.gradedByUsername})` : ''}\n`
    }
    text += '\n'
  }
  text += `📈 Promedio general: ${averageGrade.value}\n`
  text += `📋 Total entregas: ${totalSubmissions.value} | Calificadas: ${gradedCount.value}`
  return text
}

function buildPrintableHTML(): string {
  let rows = ''
  for (const group of reportData.value) {
    rows += `<tr class="subject-header"><td colspan="6">${group.subjectName}<span class="teacher-tag"> — Docente: ${group.teacherName}</span></td><td style="text-align:center;color:#6A1B9A;font-weight:700">${group.average ?? '—'}</td></tr>`
    if (!group.rows.length) {
      rows += `<tr><td colspan="7" style="color:#999;padding-left:20px">Sin entregas</td></tr>`
    }
    for (const row of group.rows) {
      const g = row.notSubmitted ? '0' : (row.grade !== null ? row.grade : '—')
      const color = (row.notSubmitted || (row.grade !== null && row.grade < 3)) ? '#FF453A' : row.grade !== null ? (row.grade >= 4 ? '#34C759' : '#FF9500') : '#999'
      const fb = row.feedback ? truncate(stripHtml(row.feedback), 120) : '—'
      const grader = row.gradedByUsername ?? '—'
      const ponderada = group.studentAverages[row.studentName] != null ? group.studentAverages[row.studentName]!.toFixed(1) : '—'
      const ponderadaColor = group.studentAverages[row.studentName] != null
        ? (group.studentAverages[row.studentName]! >= 4 ? '#34C759' : group.studentAverages[row.studentName]! >= 3 ? '#FF9500' : '#FF453A')
        : '#999'
      rows += `<tr>
        <td>${row.studentName}${row.notSubmitted ? ' <small style="color:#FF453A">(No entregado)</small>' : ''}</td>
        <td>${row.taskName}</td>
        <td style="color:${color};font-weight:600;text-align:center">${g}</td>
        <td style="color:${ponderadaColor};font-weight:600;text-align:center">${ponderada}</td>
        <td>${row.notSubmitted ? '—' : formatDate(row.submissionDate)}</td>
        <td>${grader}</td>
        <td colspan="2" class="feedback-col">${fb}</td>
      </tr>`
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Reporte de Notas</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;color:#222}
h1{font-size:22px;margin-bottom:4px}
.subtitle{font-size:13px;color:#666;margin-bottom:24px}
.summary{display:flex;gap:24px;margin-bottom:24px;padding:16px;background:#f5f5f5;border-radius:12px}
.summary div{text-align:center}
.summary .val{font-size:20px;font-weight:700;display:block}
.summary .lbl{font-size:11px;color:#666;text-transform:uppercase}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:11px;color:#666;text-transform:uppercase;padding:8px 10px;border-bottom:2px solid #eee;background:#f9f9f9}
td{padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:12px;vertical-align:top}
.subject-header td{font-weight:700;font-size:13px;background:#f0e6ff;padding-top:12px;color:#3d0e6e}
.teacher-tag{font-weight:400;font-size:12px;color:#666}
.feedback-col{font-size:11px;color:#555;max-width:300px;word-break:break-word}
@media print{body{padding:20px}}
</style></head><body>
<h1>📊 Reporte de Notas</h1>
<p class="subtitle">Generado el ${new Date().toLocaleDateString('es')}</p>
<div class="summary">
<div><span class="val">${props.subjects.length}</span><span class="lbl">Materias</span></div>
<div><span class="val">${totalSubmissions.value}</span><span class="lbl">Entregas</span></div>
<div><span class="val">${gradedCount.value}</span><span class="lbl">Calificadas</span></div>
<div><span class="val">${averageGrade.value}</span><span class="lbl">Promedio</span></div>
</div>
<table>
<thead><tr><th>Estudiante</th><th>Tarea</th><th style="text-align:center">Nota</th><th style="text-align:center">Cal. Ponderada</th><th>Fecha</th><th>Calificó</th><th colspan="2">Retroalimentación</th></tr></thead>
<tbody>${rows}</tbody>
</table></body></html>`
}
</script>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.report-modal {
  width: 100%;
  max-width: 820px;
  max-height: 85vh;
  background: #1C1C1E;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: report-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes report-slide-up {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.report-fade-enter-active { transition: opacity 0.2s; }
.report-fade-leave-active { transition: opacity 0.15s; }
.report-fade-enter-from, .report-fade-leave-to { opacity: 0; }

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.report-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(191, 90, 242, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.report-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.report-close:hover { background: rgba(255, 255, 255, 0.12); }

.report-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  margin-right: 4px;
  flex-shrink: 0;
}
.report-action-btn:hover { background: rgba(255, 255, 255, 0.12); }

.report-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #8E8E93;
  font-size: 14px;
}

.spinner-report {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(191, 90, 242, 0.2);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.report-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px 8px;
  margin-bottom: 20px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary-value {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

.summary-label {
  font-size: 11px;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

.report-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.report-subject-group {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.subject-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 10px 12px;
  background: rgba(191, 90, 242, 0.10);
  gap: 8px;
  border-left: 3px solid #BF5AF2;
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.subject-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.1px;
}

.subject-teacher {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #BF5AF2;
  opacity: 0.8;
}

.subject-avg {
  font-size: 15px;
  font-weight: 800;
  color: #8E8E93;
  flex-shrink: 0;
}

/* ── Grade table ── */
.table-wrapper {
  overflow-x: auto;
}

.grade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.grade-table thead tr {
  background: rgba(255, 255, 255, 0.04);
}

.grade-table th {
  padding: 9px 10px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8E8E93;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
}
.th-student { min-width: 90px; }
.th-grade { text-align: center; }

.grade-table td {
  padding: 8px 10px;
  color: #ccc;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: top;
}

.grade-row:last-child td { border-bottom: none; }
.grade-row:hover { background: rgba(255, 255, 255, 0.02); }

/* Estudiante: identificador primario de cada fila — blanco+negrita */
.cell-student {
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  min-width: 80px;
}
/* Tarea: secundario — gris medio para no competir con el nombre del estudiante */
.cell-task {
  min-width: 100px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #C7C7CC;
  font-size: 11.5px;
}
.cell-grade {
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  min-width: 44px;
}
.cell-date {
  white-space: nowrap;
  font-size: 11px;
  color: #636366;
  min-width: 80px;
}
.cell-grader {
  font-size: 11.5px;
  color: #9E9EA3;
  white-space: nowrap;
}
.cell-feedback {
  color: #8E8E93;
  font-size: 11px;
  min-width: 100px;
  max-width: 220px;
  line-height: 1.4;
}
.no-feedback { color: #3a3a3c; }

.th-ponderada { min-width: 80px; text-align: center; }
.cell-ponderada { font-weight: 700; text-align: center; white-space: nowrap; min-width: 80px; }
.badge-no-entrega { display: inline-block; margin-left: 5px; font-size: 10px; background: rgba(255,69,58,0.15); color: #FF453A; border-radius: 4px; padding: 1px 5px; }
.row-not-submitted { opacity: 0.75; }

.no-tasks {
  padding: 10px 16px;
  font-size: 13px;
  color: #636366;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 0 14px;
}

.filter-pill {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  color: #8E8E93;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
  cursor: pointer;
}
.filter-pill:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
.filter-pill--active {
  background: rgba(191, 90, 242, 0.2);
  color: #BF5AF2;
  border-color: rgba(191, 90, 242, 0.45);
}

.breakdown-section {
  border-top: 1px solid rgba(191, 90, 242, 0.18);
  background: rgba(191, 90, 242, 0.04);
}
.breakdown-label {
  padding: 6px 14px 2px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #BF5AF2;
  opacity: 0.85;
}

.grade-good { color: #34C759 !important; }
.grade-ok { color: #FF9500 !important; }
.grade-low { color: #FF453A !important; }

.report-export-bar {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  transition: transform 0.15s, opacity 0.15s;
}
.export-btn:active { transform: scale(0.96); }

.export-pdf {
  background: rgba(255, 69, 58, 0.12);
  color: #FF6961;
}

.export-excel {
  background: rgba(52, 199, 89, 0.12);
  color: #34C759;
}

.export-share {
  background: rgba(0, 122, 255, 0.12);
  color: #0A84FF;
}

@keyframes spin { to { transform: rotate(360deg); } }

.report-overlay--fs { padding: 0; }
.report-modal--fs {
  max-width: 100% !important;
  max-height: 100vh !important;
  height: 100vh;
  border-radius: 0;
}
</style>
