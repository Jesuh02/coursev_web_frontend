<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="modelValue" class="report-overlay" :class="{ 'report-overlay--fs': isFullscreen }" @click.self="!isFullscreen && $emit('update:modelValue', false)">
        <div class="report-modal" :class="{ 'report-modal--fs': isFullscreen }">
          <!-- Header -->
          <div class="report-header">
            <div class="report-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div class="report-header-info">
              <h2 class="report-title">Reporte de Notas</h2>
              <p class="report-subtitle">Registro completo de todos los cursos de la plataforma</p>
            </div>
            <button class="report-action-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
              <svg v-if="!isFullscreen" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
            </button>
            <button class="report-close" @click="$emit('update:modelValue', false)" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="report-loading">
            <div class="spinner-report" />
            <p class="loading-text">Cargando reportes de la plataforma...</p>
            <p v-if="totalCourses > 0" class="loading-progress">{{ loadedCourses }} / {{ totalCourses }} cursos</p>
          </div>

          <!-- Error -->
          <div v-else-if="errorMsg" class="report-error">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{{ errorMsg }}</p>
            <button class="retry-btn" @click="fetchReport">Reintentar</button>
          </div>

          <!-- Content -->
          <template v-else>
            <!-- Summary card -->
            <div class="summary-card">
              <div class="summary-stat">
                <span class="summary-value">{{ courseCount }}</span>
                <span class="summary-label">Cursos</span>
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

            <!-- Body: same layout as GradeReportModal -->
            <div class="report-body">
              <div class="report-table">
                <template v-for="group in filteredData" :key="group.courseId">
                  <!-- Course section header -->
                  <div class="report-course-group">
                    <div class="course-row-header">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:.75;flex-shrink:0"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      <span class="course-name">{{ group.courseName }}</span>
                    </div>

                    <!-- Subject groups within this course -->
                    <div v-for="subGroup in getSubjectGroups(group)" :key="subGroup.subjectName" class="report-subject-group">
                      <div class="subject-row-header">
                        <div class="subject-info">
                          <span class="subject-name">{{ subGroup.subjectName }}</span>
                        </div>
                        <span class="subject-avg" :class="gradeClass(subGroup.average)">{{ subGroup.average != null ? subGroup.average.toFixed(1) : '—' }}</span>
                      </div>

                      <div v-if="subGroup.rows.length" class="table-wrapper">
                        <table class="grade-table">
                          <thead>
                            <tr>
                              <th class="th-student">Estudiante</th>
                              <th>Tarea</th>
                              <th class="th-grade">Nota</th>
                              <th class="th-ponderada">Cal. Ponderada</th>
                              <th>Fecha de entrega</th>
                              <th>Docente que calificó</th>
                              <th>Retroalimentación</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="row in subGroup.rows" :key="row.id" class="grade-row" :class="{ 'row-not-submitted': row.notSubmitted }">
                              <td class="cell-student">{{ row.studentUsername || '—' }}</td>
                              <td class="cell-task">{{ row.taskName || '—' }}<span v-if="row.notSubmitted" class="badge-no-entrega">No entregado</span></td>
                              <td class="cell-grade" :class="row.notSubmitted ? 'grade-low' : (row.grade == null ? '' : gradeClass(row.grade))">{{ row.notSubmitted ? '0' : (row.grade ?? '—') }}</td>
                              <td class="cell-ponderada" :class="gradeClass(subGroup.studentAverages[row.studentUsername ?? ''] ?? null)">{{ subGroup.studentAverages[row.studentUsername ?? ''] != null ? Number(subGroup.studentAverages[row.studentUsername ?? '']).toFixed(1) : '—' }}</td>
                              <td class="cell-date">{{ row.notSubmitted ? '—' : formatDate(row.submission_date) }}</td>
                              <td class="cell-grader">{{ row.gradedByUsername || '—' }}</td>
                              <td class="cell-feedback">
                                <span v-if="row.feedback" :title="row.feedback">{{ truncate(row.feedback, 80) }}</span>
                                <span v-else class="no-feedback">—</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div v-else class="no-tasks">Sin entregas</div>
                    </div>

                    <div v-if="!group.rows.length" class="no-tasks">Sin entregas registradas</div>
                  </div>
                </template>
                <div v-if="filteredData.length === 0" class="no-tasks" style="padding:40px;text-align:center">Sin datos disponibles</div>
              </div>
            </div>

            <!-- Export bar -->
            <div class="report-export-bar">
              <button class="export-btn export-pdf" @click="exportPDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </button>
              <button class="export-btn export-excel" @click="exportExcel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                Excel
              </button>
              <button class="export-btn export-word" @click="exportWord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                Word
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { api, courseAdapter } from '@/infrastructure/api'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isFullscreen = ref(false)
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }
onUnmounted(() => { isFullscreen.value = false })
watch(() => props.modelValue, (v) => { if (!v) isFullscreen.value = false })

interface ReportRow {
  id: number
  studentUsername?: string | null
  taskName?: string | null
  grade: number | null
  submission_date: number | null
  feedback: string | null
  subjectName?: string | null
  gradedByUsername?: string | null
  notSubmitted?: boolean
}

interface CourseGroup {
  courseId: number
  courseName: string
  rows: ReportRow[]
  progressByUsername: Record<string, number>
}

const loading = ref(false)
const errorMsg = ref('')
const reportData = ref<CourseGroup[]>([])
const loadedCourses = ref(0)
const totalCourses = ref(0)

const courseCount = computed(() => reportData.value.length)
const totalSubmissions = computed(() => reportData.value.reduce((s, g) => s + g.rows.length, 0))
const gradedCount = computed(() => reportData.value.reduce((s, g) => s + g.rows.filter(r => r.grade != null).length, 0))

const averageGrade = computed(() => {
  const graded = reportData.value.flatMap(g => g.rows).filter(r => r.grade != null)
  if (!graded.length) return '—'
  return (graded.reduce((s, r) => s + r.grade!, 0) / graded.length).toFixed(1)
})

const averageClass = computed(() => gradeClass(parseFloat(averageGrade.value) || null))

const filteredData = computed(() => reportData.value)

function gradeClass(grade: number | null): string {
  if (grade == null || isNaN(grade)) return ''
  if (grade >= 4) return 'grade-good'
  if (grade >= 3) return 'grade-ok'
  return 'grade-low'
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function formatDate(ts: number | string | null | undefined): string {
  if (ts == null) return '—'
  const n = typeof ts === 'string' ? parseInt(ts, 10) : ts
  if (!Number.isFinite(n) || n <= 0) return '—'
  return new Date(n).toLocaleString('es', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

watch(() => props.modelValue, (open) => {
  if (open && reportData.value.length === 0 && !loading.value) fetchReport()
})

async function fetchReport() {
  loading.value = true
  errorMsg.value = ''
  loadedCourses.value = 0
  reportData.value = []
  try {
    const courses = await courseAdapter.getCourses(1, 300)
    totalCourses.value = courses.length

    const results = await Promise.allSettled(
      courses.map(async (course) => {
        const [subsRaw, progressRaw] = await Promise.all([
          api.get<any[]>(`/submissions/course/${course.id}?page=1&pageSize=500`).catch(() => [] as any[]),
          api.get<any[]>(`/progress/course/${course.id}/all`).catch(() => [] as any[]),
        ])
        loadedCourses.value++

        // Build username → averageGrade map from progreso_curso table
        // Also collect ALL enrolled students (even those with averageGrade = null)
        const progressByUsername: Record<string, number> = {}
        const enrolledStudents: string[] = []
        for (const p of (progressRaw ?? [])) {
          const username = p.username ?? null
          const avg = p.averageGrade ?? null
          if (username) {
            enrolledStudents.push(username)
            if (avg != null) progressByUsername[username] = Number(avg)
          }
        }

        const subs: ReportRow[] = (subsRaw ?? []) as ReportRow[]
        const rows = addNotSubmittedRows(subs, enrolledStudents)

        return {
          courseId: course.id,
          courseName: (course as any).title ?? (course as any).name ?? `Curso ${course.id}`,
          rows,
          progressByUsername,
        } as CourseGroup
      })
    )

    reportData.value = results
      .filter((r): r is PromiseFulfilledResult<CourseGroup> => r.status === 'fulfilled')
      .map(r => r.value)

  } catch (e: any) {
    errorMsg.value = 'Error al cargar los reportes: ' + (e?.message ?? String(e))
  } finally {
    loading.value = false
  }
}

// Add grade=0 rows for ALL enrolled students who haven't submitted specific tasks.
// enrolledStudents: all students registered in the course (from progreso_curso table)
function addNotSubmittedRows(subs: ReportRow[], enrolledStudents: string[] = []): ReportRow[] {
  const subjectTaskStudents = new Map<string, Map<string, Set<string>>>()
  // Seed with all enrolled students so even non-submitters appear in the report
  const knownStudents = new Set<string>(enrolledStudents)

  for (const sub of subs) {
    const subjectName = sub.subjectName ?? '—'
    const taskName = sub.taskName ?? '—'
    const student = sub.studentUsername ?? null
    if (!student) continue
    knownStudents.add(student)
    if (!subjectTaskStudents.has(subjectName)) subjectTaskStudents.set(subjectName, new Map())
    const taskMap = subjectTaskStudents.get(subjectName)!
    if (!taskMap.has(taskName)) taskMap.set(taskName, new Set())
    taskMap.get(taskName)!.add(student)
  }

  if (!knownStudents.size || !subjectTaskStudents.size) return subs

  const extra: ReportRow[] = []
  for (const [subjectName, taskMap] of subjectTaskStudents) {
    for (const [taskName, submitters] of taskMap) {
      for (const student of knownStudents) {
        if (!submitters.has(student)) {
          extra.push({
            id: 0,
            studentUsername: student,
            taskName,
            grade: 0,
            submission_date: null,
            feedback: null,
            subjectName,
            gradedByUsername: null,
            notSubmitted: true,
          })
        }
      }
    }
  }
  return [...subs, ...extra]
}

// ── PDF export (print) ──────────────────────────────────────────────────
function exportPDF() {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(buildPrintableHTML('pdf'))
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

// ── Excel export (OOXML .xlsx – formato nativo de Excel, sin advertencias) ──
async function exportExcel() {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'CourseV'
  wb.created = new Date()
  const ws = wb.addWorksheet('Reporte Plataforma')

  // Column widths (in characters)
  ws.columns = [
    { width: 22 }, // Estudiante
    { width: 22 }, // Materia
    { width: 32 }, // Tarea
    { width: 10 }, // Nota
    { width: 14 }, // Cal. Ponderada
    { width: 20 }, // Fecha de entrega
    { width: 22 }, // Docente que calificó
    { width: 36 }, // Retroalimentación
  ]

  // Styles helpers
  const hdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B1060' } }
  const courseHdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3EAFE' } }
  const subjHdrFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAF5FF' } }
  const row0Fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
  const row1Fill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F7FC' } }
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    left: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    bottom: { style: 'thin', color: { argb: 'FFE0DDE8' } },
    right: { style: 'thin', color: { argb: 'FFE0DDE8' } },
  }

  function applyHdr(row: ExcelJS.Row) {
    row.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' }
      cell.fill = hdrFill
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle', wrapText: true }
    })
    row.height = 18
  }

  function gradeFont(grade: number | null, notSubmitted?: boolean): Partial<ExcelJS.Font> {
    if (notSubmitted || (grade !== null && grade < 3)) return { bold: true, color: { argb: 'FFB91C1C' }, name: 'Calibri' }
    if (grade !== null && grade >= 4) return { bold: true, color: { argb: 'FF1A7F37' }, name: 'Calibri' }
    if (grade !== null) return { bold: true, color: { argb: 'FFB45309' }, name: 'Calibri' }
    return { color: { argb: 'FF999999' }, name: 'Calibri' }
  }

  // Header row
  const hdrRow = ws.addRow(['Estudiante', 'Materia', 'Tarea', 'Nota', 'Cal. Ponderada', 'Fecha de entrega', 'Docente que calificó', 'Retroalimentación'])
  applyHdr(hdrRow)
  hdrRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
  hdrRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }

  for (const group of reportData.value) {
    // Course header row (merged)
    const courseRow = ws.addRow([group.courseName])
    ws.mergeCells(courseRow.number, 1, courseRow.number, 8)
    const courseCell = courseRow.getCell(1)
    courseCell.font = { bold: true, color: { argb: 'FF4A0E8F' }, size: 11, name: 'Calibri' }
    courseCell.fill = courseHdrFill
    courseCell.border = thinBorder
    courseRow.height = 20

    if (!group.rows.length) {
      const emptyRow = ws.addRow(['Sin entregas registradas'])
      ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
      emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
      continue
    }

    for (const subGroup of getSubjectGroups(group)) {
      // Subject sub-header row (merged)
      const subjRow = ws.addRow([`Materia: ${subGroup.subjectName}`])
      ws.mergeCells(subjRow.number, 1, subjRow.number, 8)
      const subjCell = subjRow.getCell(1)
      subjCell.font = { bold: true, color: { argb: 'FF7B3FA6' }, size: 9, name: 'Calibri' }
      subjCell.fill = subjHdrFill
      subjCell.border = thinBorder
      subjRow.height = 16

      subGroup.rows.forEach((row, i) => {
        const grade = row.notSubmitted ? 0 : (row.grade ?? null)
        const ponderadaNum = subGroup.studentAverages[row.studentUsername ?? ''] ?? null
        const ponderada = ponderadaNum !== null ? Number(ponderadaNum.toFixed(1)) : '—'
        const taskLabel = row.notSubmitted ? `${row.taskName ?? '—'} (No entregado)` : (row.taskName ?? '—')
        const dateStr = row.notSubmitted ? '—' : formatDate(row.submission_date)

        const dataRow = ws.addRow([
          row.studentUsername ?? '—',
          subGroup.subjectName,
          taskLabel,
          grade !== null ? Number(typeof grade === 'number' ? grade.toFixed(1) : grade) : '—',
          ponderada,
          dateStr,
          row.gradedByUsername ?? '—',
          row.feedback ?? '—',
        ])

        const rowFill = i % 2 === 0 ? row0Fill : row1Fill
        dataRow.eachCell(cell => {
          cell.fill = rowFill
          cell.border = thinBorder
          cell.font = { name: 'Calibri' }
          cell.alignment = { vertical: 'middle', wrapText: true }
        })
        // Grade cell styling
        dataRow.getCell(4).font = gradeFont(typeof grade === 'number' ? grade : null, row.notSubmitted)
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' }
        // Ponderada cell
        if (ponderadaNum !== null) {
          dataRow.getCell(5).font = gradeFont(ponderadaNum)
        } else {
          dataRow.getCell(5).font = { color: { argb: 'FF999999' }, name: 'Calibri' }
        }
        dataRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }
        dataRow.height = 16
      })
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_plataforma_${Date.now()}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Word export (.doc as HTML) ──────────────────────────────────────────
function exportWord() {
  const html = buildPrintableHTML('word')
  downloadBlob(html, `reporte_plataforma_${Date.now()}.doc`, 'application/msword')
}

function esc(s: string) { return String(s).replace(/"/g, '""') }

// ── Subject sub-grouping ──────────────────────────────────────────────────
// studentAverages uses averageGrade from progreso_curso table (course-level weighted grade)
function getSubjectGroups(group: CourseGroup): { subjectName: string; rows: ReportRow[]; studentAverages: Record<string, number>; average: number | null }[] {
  const map = new Map<string, ReportRow[]>()
  for (const row of group.rows) {
    const key = row.subjectName ?? '—'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  return Array.from(map.entries()).map(([subjectName, rows]) => {
    // Cal. Ponderada: from progreso_curso table (course-level averageGrade per student)
    const studentAverages: Record<string, number> = {}
    for (const row of rows) {
      const student = row.studentUsername ?? ''
      if (student && !(student in studentAverages) && group.progressByUsername[student] != null) {
        studentAverages[student] = group.progressByUsername[student]
      }
    }
    const graded = rows.filter(r => r.grade != null && !r.notSubmitted)
    const average = graded.length ? parseFloat((graded.reduce((s, r) => s + r.grade!, 0) / graded.length).toFixed(1)) : null
    return { subjectName, rows, studentAverages, average }
  })
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function buildPrintableHTML(mode: 'pdf' | 'word' = 'pdf'): string {
  const date = new Date().toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  let rows = ''
  for (const group of reportData.value) {
    rows += `<tr class="course-header"><td colspan="7">${esc_html(group.courseName)}</td></tr>`
    if (!group.rows.length) {
      rows += `<tr><td colspan="7" style="color:#999;font-style:italic;padding-left:20px">Sin entregas registradas</td></tr>`
    } else {
      for (const subGroup of getSubjectGroups(group)) {
        rows += `<tr class="subject-header"><td colspan="7"><span class="stag">Materia</span> ${esc_html(String(subGroup.subjectName))}</td></tr>`
        for (const row of subGroup.rows) {
          const g = row.notSubmitted ? '0' : (row.grade != null ? row.grade : '—')
          const color = (row.notSubmitted || (row.grade != null && row.grade < 3)) ? '#FF453A' : row.grade != null ? (row.grade >= 4 ? '#34C759' : '#FF9500') : '#999'
          const noEntregaTag = row.notSubmitted ? ' <span style="font-size:9px;background:#ff453a22;color:#ff453a;padding:1px 4px;border-radius:3px">No entregado</span>' : ''
          const ponderada = subGroup.studentAverages[row.studentUsername ?? ''] != null ? subGroup.studentAverages[row.studentUsername ?? '']!.toFixed(1) : '—'
          const ponderadaColor = subGroup.studentAverages[row.studentUsername ?? ''] != null ? (subGroup.studentAverages[row.studentUsername ?? '']! >= 4 ? '#34C759' : subGroup.studentAverages[row.studentUsername ?? '']! >= 3 ? '#FF9500' : '#FF453A') : '#999'
          rows += `<tr>
        <td><strong>${esc_html(row.studentUsername ?? '—')}</strong></td>
        <td style="color:#555">${esc_html(row.taskName ?? '—')}${noEntregaTag}</td>
        <td style="color:${color};font-weight:600;text-align:center">${g}</td>
        <td style="color:${ponderadaColor};font-weight:600;text-align:center">${ponderada}</td>
        <td style="color:#555;font-size:12px;white-space:nowrap">${row.notSubmitted ? '—' : formatDate(row.submission_date)}</td>
        <td>${esc_html(row.gradedByUsername ?? '—')}</td>
        <td style="max-width:240px;word-break:break-word;color:#444">${esc_html(row.feedback ?? '—')}</td>
      </tr>`
        }
      }
    }
  }

  const wordNS = mode === 'word'
    ? ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"'
    : ''

  return `<!DOCTYPE html><html${wordNS}><head><meta charset="utf-8"/><title>Reporte de Notas — Plataforma</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px;color:#222;font-size:13px}
h1{font-size:20px;margin-bottom:4px;color:#1A1A1A}
.subtitle{font-size:12px;color:#666;margin-bottom:20px}
.summary{display:flex;gap:20px;margin-bottom:20px;padding:14px;background:#f8f5ff;border-radius:10px;border:1px solid #e0d0f5}
.summary div{text-align:center;flex:1}
.summary .val{font-size:18px;font-weight:700;color:#6A1B9A;display:block}
.summary .lbl{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.5px}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10px;color:#555;text-transform:uppercase;padding:8px 10px;border-bottom:2px solid #ddd;background:#fafafa;letter-spacing:.4px}
td{padding:7px 10px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.course-header td{font-weight:700;font-size:13px;background:#f2e8ff;color:#6A1B9A;padding:10px 10px 8px;border-bottom:1px solid #d9baf5}
.subject-header td{font-size:11.5px;background:#f9f5ff;color:#7B3FA6;padding:7px 10px 7px 22px;border-bottom:1px solid #e8daf5;border-left:3px solid #9B59D9}
.stag{display:inline-block;font-size:9px;font-weight:700;text-transform:uppercase;background:#e8d5f5;color:#6A1B9A;padding:1px 5px;border-radius:3px;margin-right:7px;vertical-align:middle}
@media print{body{padding:20px}@page{margin:15mm}}
</style></head><body>
<h1>📊 Reporte de Notas — Plataforma</h1>
<p class="subtitle">Generado el ${date}</p>
<div class="summary">
  <div><span class="val">${courseCount.value}</span><span class="lbl">Cursos</span></div>
  <div><span class="val">${totalSubmissions.value}</span><span class="lbl">Entregas</span></div>
  <div><span class="val">${gradedCount.value}</span><span class="lbl">Calificadas</span></div>
  <div><span class="val">${averageGrade.value}</span><span class="lbl">Promedio</span></div>
</div>
<table>
  <thead><tr><th>Estudiante</th><th>Tarea</th><th style="text-align:center">Nota</th><th style="text-align:center">Cal. Ponderada</th><th>Fecha de entrega</th><th>Docente que calificó</th><th>Retroalimentación</th></tr></thead>
  <tbody>${rows}</tbody>
</table></body></html>`
}

function esc_html(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
</script>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.report-modal {
  width: 100%;
  max-width: 940px;
  max-height: 92vh;
  background: #1C1C1E;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.7);
  animation: report-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes report-slide-up {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.report-fade-enter-active { transition: opacity 0.2s; }
.report-fade-leave-active { transition: opacity 0.15s; }
.report-fade-enter-from, .report-fade-leave-to { opacity: 0; }

/* ── Header ── */
.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
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

.report-header-info { flex: 1; min-width: 0; }
.report-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.report-subtitle { font-size: 12px; color: #8E8E93; margin-top: 2px; }

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

/* ── Loading / Error ── */
.report-loading, .report-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  flex: 1;
  color: #8E8E93;
  font-size: 14px;
}
.loading-text { color: #8E8E93; font-size: 14px; }
.loading-progress { color: #636366; font-size: 12px; }

.report-error p { color: #FF453A; font-size: 14px; text-align: center; }
.retry-btn {
  margin-top: 8px;
  padding: 8px 20px;
  border-radius: 8px;
  background: rgba(191, 90, 242, 0.18);
  color: #BF5AF2;
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
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Summary card ── */
.summary-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px 8px;
  margin: 16px 20px 0;
  flex-shrink: 0;
}
.summary-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.summary-value { font-size: 22px; font-weight: 800; color: #fff; }
.summary-label { font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; }
.summary-divider { width: 1px; height: 32px; background: rgba(255, 255, 255, 0.08); }

/* ── Body ── */
.report-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.report-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Course section */
.report-course-group {
  margin-bottom: 16px;
}

.course-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(191, 90, 242, 0.14);
  border-left: 4px solid #BF5AF2;
  border-radius: 8px 8px 0 0;
  margin-bottom: 4px;
}

.course-name {
  font-size: 14px;
  font-weight: 700;
  color: #BF5AF2;
}

/* Subject groups (same as GradeReportModal) */
.report-subject-group {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  margin-bottom: 8px;
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

.subject-avg {
  font-size: 15px;
  font-weight: 800;
  color: #8E8E93;
  flex-shrink: 0;
}

/* ── Grade table (identical to GradeReportModal) ── */
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
.th-ponderada { min-width: 80px; text-align: center; }

.grade-table td {
  padding: 8px 10px;
  color: #ccc;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: top;
}

.grade-row:last-child td { border-bottom: none; }
.grade-row:hover { background: rgba(255, 255, 255, 0.02); }

.cell-student { font-weight: 700; color: #fff; white-space: nowrap; min-width: 80px; }
.cell-task { min-width: 100px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #C7C7CC; font-size: 11.5px; }
.cell-grade { font-weight: 700; text-align: center; white-space: nowrap; min-width: 44px; }
.cell-ponderada { font-weight: 700; text-align: center; white-space: nowrap; min-width: 80px; }
.cell-date { white-space: nowrap; font-size: 11px; color: #636366; min-width: 80px; }
.cell-grader { font-size: 11.5px; color: #9E9EA3; white-space: nowrap; }
.cell-feedback { color: #8E8E93; font-size: 11px; min-width: 100px; max-width: 220px; line-height: 1.4; }
.no-feedback { color: #3a3a3c; }

.badge-no-entrega { display: inline-block; margin-left: 5px; font-size: 10px; background: rgba(255,69,58,0.15); color: #FF453A; border-radius: 4px; padding: 1px 5px; }
.row-not-submitted { opacity: 0.75; }

.no-tasks {
  padding: 10px 16px;
  font-size: 13px;
  color: #636366;
}

.grade-good { color: #34C759 !important; font-weight: 700; }
.grade-ok   { color: #FF9500 !important; font-weight: 700; }
.grade-low  { color: #FF453A !important; font-weight: 700; }

/* ── Export bar ── */
.report-export-bar {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
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
.export-pdf   { background: rgba(255, 69, 58, 0.12); color: #FF6961; }
.export-excel { background: rgba(52, 199, 89, 0.12); color: #34C759; }
.export-word  { background: rgba(10, 132, 255, 0.12); color: #0A84FF; }

/* ── Fullscreen ── */
.report-overlay--fs { padding: 0; }
.report-modal--fs {
  max-width: 100% !important;
  max-height: 100vh !important;
  height: 100vh;
  border-radius: 0;
}

@media (max-width: 600px) {
  .report-modal { max-height: 98vh; border-radius: 16px 16px 0 0; position: fixed; bottom: 0; left: 0; right: 0; }
  .report-overlay { align-items: flex-end; padding: 0; }
  .cell-feedback { display: none; }
  .cell-date { display: none; }
}
</style>
