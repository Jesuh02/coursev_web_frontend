<template>
  <Teleport to="body">
    <Transition name="consolidado-fade">
      <div v-if="modelValue" class="consolidado-overlay" :class="{ 'consolidado-overlay--fs': isFullscreen }" @click.self="!isFullscreen && $emit('update:modelValue', false)">
        <div class="consolidado-modal" :class="{ 'consolidado-modal--fs': isFullscreen }">
          <!-- Header -->
          <div class="consolidado-header">
            <div class="consolidado-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <div class="consolidado-header-info">
              <h2 class="consolidado-title">Consolidado de Notas</h2>
              <p class="consolidado-subtitle">Vista cruzada: estudiantes × materias</p>
            </div>
            <button class="consolidado-action-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
              <Transition name="fs-icon" mode="out-in">
                <svg v-if="!isFullscreen" key="expand" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                <svg v-else key="collapse" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2" stroke-linecap="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
              </Transition>
            </button>
            <button class="consolidado-close" @click="$emit('update:modelValue', false)" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="consolidado-loading">
            <div class="spinner-consolidado" />
            <p class="loading-text">Construyendo consolidado...</p>
            <p v-if="totalCourses > 0" class="loading-progress">{{ loadedCourses }} / {{ totalCourses }} cursos</p>
          </div>

          <!-- Error -->
          <div v-else-if="errorMsg" class="consolidado-error">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{{ errorMsg }}</p>
            <button class="retry-btn" @click="fetchConsolidado">Reintentar</button>
          </div>

          <!-- Content -->
          <template v-else>
            <div class="consolidado-body">
              <!-- Course selector -->
              <div class="filters-row">
                <div class="filter-group filter-group--wide">
                  <label class="filter-label">Programa (Curso)</label>
                  <div class="course-search-wrapper">
                    <input
                      v-model="courseSearchText"
                      type="text"
                      class="course-search-input"
                      :placeholder="selectedCourseId ? courseMap.get(selectedCourseId)?.title ?? 'Todos los cursos' : 'Todos los cursos'"
                      autocomplete="off"
                      @focus="showCourseDropdown = true"
                      @input="showCourseDropdown = true"
                      @blur="hideCourseDropdownDelayed"
                    />
                    <svg v-if="!selectedCourseId" class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <button v-else class="search-clear-btn" @mousedown.prevent="clearCourseSearch">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div v-if="showCourseDropdown" class="course-dropdown">
                      <div class="course-option" :class="{ active: !selectedCourseId }" @mousedown.prevent="selectCourse(null)">Todos los cursos</div>
                      <div v-for="c in filteredCourseOptions" :key="c.id" class="course-option" :class="{ active: selectedCourseId === c.id }" @mousedown.prevent="selectCourse(c)">
                        {{ c.title }}
                      </div>
                      <div v-if="!filteredCourseOptions.length && courseSearchText.trim()" class="course-option-empty">Sin resultados</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Student search -->
              <div class="student-search-row">
                <div class="student-search-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="studentSearch" type="text" class="student-search-input" placeholder="Buscar estudiante..." />
                </div>
                <span class="student-count">{{ totalStudentCount }} estudiantes</span>
              </div>

              <!-- Consolidado tables (agrupadas por curso) -->
              <template v-if="courseGroups.length">
                <div v-for="group in courseGroups" :key="group.courseId" class="course-section">
                  <div v-if="!selectedCourseId" class="course-section-header">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:.6;flex-shrink:0"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    <span class="course-section-name">{{ group.courseName }}</span>
                    <span class="course-section-count">{{ group.rows.length }} est.</span>
                  </div>
                  <div class="table-scroll-wrapper">
                    <table class="consolidado-table">
                      <thead>
                        <tr>
                          <th class="th-num">N°</th>
                          <th class="th-student">Nombres y Apellidos</th>
                          <th v-for="subj in group.subjects" :key="subj" class="th-subject">
                            <span class="th-subject-text">{{ subj }}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, idx) in group.rows" :key="row.key" class="consolidado-row">
                          <td class="cell-num">{{ idx + 1 }}</td>
                          <td class="cell-student">{{ row.name }}</td>
                          <td v-for="subj in group.subjects" :key="subj" class="cell-grade" :class="gradeClass(row.grades[subj])">
                            {{ row.grades[subj] != null ? row.grades[subj]!.toFixed(1) : '—' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
              <div v-else class="consolidado-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                <p>No hay datos disponibles</p>
              </div>
            </div>

            <!-- Export bar -->
            <div class="consolidado-export-bar">
              <button class="export-btn export-pdf" @click="exportPDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </button>
              <button class="export-btn export-excel" @click="exportExcel">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                Excel
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
import type ExcelJS from 'exceljs'
import { courseAdapter } from '@/infrastructure/api'
import { subjectAdapter } from '@/infrastructure/api/subjectAdapter'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet } from '@/infrastructure/api/gradeAdapter'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'
import { buildInstitutionHeaderHTML, institutionHeaderCSS, isIncatInstitution } from '@/utils/institutionHeader'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

// ── State ──
const loading = ref(false)
const errorMsg = ref('')
const totalCourses = ref(0)
const loadedCourses = ref(0)
const isFullscreen = ref(false)
const studentSearch = ref('')

// Course filter
const courseSearchText = ref('')
const showCourseDropdown = ref(false)
const selectedCourseId = ref<number | null>(null)

interface CourseInfo { id: number; title: string }
const courseMap = ref(new Map<number, CourseInfo>())

interface ConsolidadoEntry {
  key: string
  name: string
  courseId: number
  grades: Record<string, number | null>
}

const consolidadoData = ref<ConsolidadoEntry[]>([])

// ── Computed ──
const filteredCourseOptions = computed(() => {
  const courses = Array.from(courseMap.value.values())
  const q = courseSearchText.value.trim().toLowerCase()
  return q ? courses.filter(c => c.title.toLowerCase().includes(q)) : courses
})

interface CourseGroup {
  courseId: number
  courseName: string
  subjects: string[]
  rows: ConsolidadoEntry[]
}

const courseGroups = computed((): CourseGroup[] => {
  const courseIds = selectedCourseId.value
    ? [selectedCourseId.value]
    : Array.from(courseMap.value.keys())
  const q = studentSearch.value.trim().toLowerCase()
  return courseIds.flatMap(cid => {
    const info = courseMap.value.get(cid)
    if (!info) return []
    const allEntries = consolidadoData.value.filter(e => e.courseId === cid)
    const rows = (q ? allEntries.filter(e => e.name.toLowerCase().includes(q)) : allEntries)
      .slice().sort((a, b) => a.name.localeCompare(b.name))
    if (!rows.length) return []
    const subjSet = new Set<string>()
    for (const e of allEntries) for (const s of Object.keys(e.grades)) subjSet.add(s)
    return [{ courseId: cid, courseName: info.title, subjects: Array.from(subjSet).sort(), rows }]
  })
})

const totalStudentCount = computed(() => courseGroups.value.reduce((s, g) => s + g.rows.length, 0))

// ── Helpers ──
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }
onUnmounted(() => { isFullscreen.value = false })

function selectCourse(c: CourseInfo | null) {
  selectedCourseId.value = c?.id ?? null
  courseSearchText.value = c?.title ?? ''
  showCourseDropdown.value = false
}

function clearCourseSearch() {
  selectedCourseId.value = null
  courseSearchText.value = ''
  showCourseDropdown.value = false
}

function hideCourseDropdownDelayed() {
  setTimeout(() => { showCourseDropdown.value = false }, 150)
}

function gradeClass(grade: number | null | undefined): string {
  if (grade == null || isNaN(grade)) return ''
  if (grade >= 4) return 'grade-good'
  if (grade >= 3) return 'grade-ok'
  return 'grade-low'
}

watch(() => props.modelValue, (v) => {
  if (!v) {
    isFullscreen.value = false
    selectedCourseId.value = null
    courseSearchText.value = ''
    showCourseDropdown.value = false
    studentSearch.value = ''
  }
  if (v && !consolidadoData.value.length && !loading.value) fetchConsolidado()
})

// ── notaPonderada: same formula as PlatformGradeReportModal / GradeReportModal ──
function computeNotaPonderada(sheet: GradeSheet): Map<number, number> {
  const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const totalTasks = sheet.tasks.length
  const activeCategories = new Set(sheet.manualGrades.map(mg => String(mg.gradeType).replace(/_\d+$/, '')))
  const result = new Map<number, number>()
  for (const student of sheet.students) {
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
    const participacionAvg = byType['participacion']?.length ? avgArr(byType['participacion']) : (activeCategories.has('participacion') ? 0 : null)
    const examenesAvg = byType['examenes']?.length ? avgArr(byType['examenes']) : (activeCategories.has('examenes') ? 0 : null)
    const comportamientoAvg = byType['comportamiento']?.length ? avgArr(byType['comportamiento']) : (activeCategories.has('comportamiento') ? 0 : null)
    const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
    const nota = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    result.set(student.userId, Math.round(nota * 10) / 10)
  }
  return result
}

// ── Fetch ──
async function fetchConsolidado() {
  loading.value = true
  errorMsg.value = ''
  loadedCourses.value = 0
  consolidadoData.value = []
  courseMap.value.clear()

  try {
    const courses = await courseAdapter.getCourses(1, 300)
    totalCourses.value = courses.length

    // key = `${courseId}::${userId}` → { name, courseId, grades }
    const studentMap = new Map<string, ConsolidadoEntry>()

    await Promise.allSettled(
      courses.map(async (course) => {
        const title = (course as any).title ?? (course as any).name ?? `Curso ${course.id}`
        courseMap.value.set(course.id, { id: course.id, title })

        const subjects = await subjectAdapter.getSubjectsByCourse(course.id).catch(() => [] as any[])
        loadedCourses.value++

        for (const subj of subjects) {
          const subjectName = (subj as any).name as string
          const subjectId = (subj as any).id as number

          // Get periods for this subject
          const periods = await periodAdapter.listBySubject(subjectId).catch(() => [] as GradePeriod[])
          const closedPeriods = periods.filter(p => p.snapshot !== null)

          // Get active sheet
          let activeSheet: GradeSheet | null = null
          try { activeSheet = await gradeAdapter.getGradeSheet(subjectId) } catch { /* empty */ }

          // Compute final grade per student: average of all period notaPonderada values
          // periodGrades: userId → number[]
          const periodGrades = new Map<number, number[]>()
          // Also collect student info from all sources
          const studentInfo = new Map<number, { fullName: string | null; userId: number }>()

          for (const period of closedPeriods) {
            if (!period.snapshot) continue
            const notaMap = computeNotaPonderada(period.snapshot)
            for (const st of period.snapshot.students) {
              studentInfo.set(st.userId, { fullName: st.fullName ?? null, userId: st.userId })
              const nota = notaMap.get(st.userId)
              if (nota != null) {
                if (!periodGrades.has(st.userId)) periodGrades.set(st.userId, [])
                periodGrades.get(st.userId)!.push(nota)
              }
            }
          }

          // Active period counts only if it has real grade data (manual or task grades).
          // Without this check, an empty active sheet (after closing a period clears grades)
          // contributes a 0 for every student, skewing the final average incorrectly.
          const activeSheetHasGrades = activeSheet &&
            (activeSheet.manualGrades.length > 0 ||
              activeSheet.taskGrades.some(tg => tg.grade != null && tg.grade > 0))
          if (activeSheet && activeSheetHasGrades) {
            const activeNotaMap = computeNotaPonderada(activeSheet)
            for (const st of activeSheet.students) {
              studentInfo.set(st.userId, { fullName: st.fullName ?? null, userId: st.userId })
              const nota = activeNotaMap.get(st.userId)
              if (nota != null) {
                if (!periodGrades.has(st.userId)) periodGrades.set(st.userId, [])
                periodGrades.get(st.userId)!.push(nota)
              }
            }
          } else if (activeSheet) {
            // Still register students so they appear in the consolidado even with no active grades
            for (const st of activeSheet.students) {
              studentInfo.set(st.userId, { fullName: st.fullName ?? null, userId: st.userId })
            }
          }

          // Assign final grade for each student in this subject
          for (const [userId, grades] of periodGrades) {
            const finalGrade = grades.reduce((a, b) => a + b, 0) / grades.length
            const info = studentInfo.get(userId)
            const key = `${course.id}::${userId}`
            if (!studentMap.has(key)) {
              studentMap.set(key, {
                key,
                name: info?.fullName?.trim() || `Usuario #${userId}`,
                courseId: course.id,
                grades: {},
              })
            }
            studentMap.get(key)!.grades[subjectName] = Math.round(finalGrade * 10) / 10
          }
        }
      })
    )

    consolidadoData.value = Array.from(studentMap.values())
  } catch (e: any) {
    errorMsg.value = 'Error al generar el consolidado: ' + (e?.message ?? String(e))
  } finally {
    loading.value = false
  }
}

// ── Export PDF (print-based) ──
function exportPDF() {
  const groups = courseGroups.value
  let tables = ''
  for (const group of groups) {
    const thCells = group.subjects.map(s => `<th>${esc(s)}</th>`).join('')
    const bodyRows = group.rows.map((r, i) => {
      const cells = group.subjects.map(s => {
        const v = r.grades[s]
        return `<td class="td-g ${gradeClass(v)}">${v != null ? v.toFixed(1) : '—'}</td>`
      }).join('')
      return `<tr><td class="td-n">${i + 1}</td><td class="td-st">${esc(r.name)}</td>${cells}</tr>`
    }).join('')
    tables += `<div class="course-block"><h2 class="course-heading">${esc(group.courseName)}</h2><table><thead><tr><th>N°</th><th>Nombres y Apellidos</th>${thCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Consolidado de Notas</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:30px;color:#222;font-size:11px}
h1{font-size:18px;margin-bottom:4px}
.sub{font-size:12px;color:#666;margin-bottom:24px}
.course-block{margin-bottom:32px}
.course-heading{font-size:12px;font-weight:700;text-transform:uppercase;color:#3d0e6e;border-bottom:2px solid #3d0e6e;padding-bottom:4px;margin-bottom:8px}
table{width:100%;border-collapse:collapse}
th{background:#f5f0ff;text-align:center;font-size:9px;padding:6px 4px;border:1px solid #ddd;text-transform:uppercase;color:#555}
td{padding:5px 4px;border:1px solid #eee;text-align:center;font-size:10px}
.td-st{text-align:left;font-size:11px;white-space:nowrap}
.td-n{width:30px;color:#999}
.grade-good{color:#2d7a3a}
.grade-ok{color:#b8860b}
.grade-low{color:#c0392b}
${institutionHeaderCSS()}
@media print{body{padding:15px}th{font-size:8px}td{font-size:9px}.course-block{page-break-inside:avoid}}
</style></head><body>
${isIncatInstitution() ? buildInstitutionHeaderHTML() : ''}
<h1>CONSOLIDADO DE NOTAS</h1>
<p class="sub">Generado: ${new Date().toLocaleDateString('es')}</p>
${tables}
</body></html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.onafterprint = () => w.close()
  setTimeout(() => w.print(), 400)
}

// ── Export Excel ──
async function exportExcel() {
  const ExcelJSModule = await import('exceljs') as any
  const ExcelJSLib: typeof ExcelJS = ExcelJSModule.default ?? ExcelJSModule
  const wb = new ExcelJSLib.Workbook()

  for (const group of courseGroups.value) {
    const sheetName = group.courseName.slice(0, 31).replace(/[\\/*?\[\]:]/g, '')
    const ws = wb.addWorksheet(sheetName)
    const cols = group.subjects

    // Title row
    ws.mergeCells(1, 1, 1, cols.length + 2)
    const titleCell = ws.getCell(1, 1)
    titleCell.value = `CONSOLIDADO DE NOTAS — ${group.courseName}`
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF3D0E6E' } }
    titleCell.alignment = { horizontal: 'center' }

    // Header row
    const headerRow = ws.getRow(3)
    headerRow.getCell(1).value = 'N°'
    headerRow.getCell(2).value = 'Nombres y Apellidos'
    cols.forEach((s, i) => { headerRow.getCell(i + 3).value = s })
    headerRow.eachCell(cell => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B21A8' } }
      cell.alignment = { horizontal: 'center', wrapText: true }
      cell.border = { bottom: { style: 'thin' } }
    })

    // Data rows
    group.rows.forEach((r, idx) => {
      const row = ws.getRow(idx + 4)
      row.getCell(1).value = idx + 1
      row.getCell(2).value = r.name
      cols.forEach((s, i) => {
        const v = r.grades[s]
        row.getCell(i + 3).value = v ?? ''
      })
    })

    // Column widths
    ws.getColumn(1).width = 5
    ws.getColumn(2).width = 30
    cols.forEach((_, i) => { ws.getColumn(i + 3).width = 12 })
  }

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `consolidado_notas_${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
</script>

<style scoped>
/* ── Overlay & Modal ── */
.consolidado-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: padding 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.consolidado-modal {
  width: 100%;
  max-width: 960px;
  max-height: 92vh;
  background: #1C1C1E;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  animation: consolidado-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  transition: max-width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              border-radius 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: max-width, max-height, border-radius;
}
@keyframes consolidado-slide-up {
  from { opacity: 0; transform: translateY(40px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Header ── */
.consolidado-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.consolidado-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(191, 90, 242, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.consolidado-header-info { flex: 1; min-width: 0; }
.consolidado-title { font-size: 17px; font-weight: 700; color: #fff; margin: 0; }
.consolidado-subtitle { font-size: 12px; color: #8E8E93; margin: 2px 0 0; }
.consolidado-action-btn,
.consolidado-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}
.consolidado-action-btn:hover,
.consolidado-close:hover { background: rgba(255, 255, 255, 0.1); }

/* ── Loading / Error ── */
.consolidado-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
}
.spinner-consolidado {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(191, 90, 242, 0.15);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 13px; color: #8E8E93; }
.loading-progress { font-size: 12px; color: #636366; }
.consolidado-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #8E8E93;
  font-size: 13px;
  text-align: center;
}
.retry-btn {
  padding: 8px 20px;
  border-radius: 10px;
  background: rgba(191, 90, 242, 0.12);
  color: #BF5AF2;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.15s;
}
.retry-btn:hover { opacity: 0.85; }

/* ── Body ── */
.consolidado-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* ── Filters ── */
.filters-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.filter-group { flex: 1; }
.filter-group--wide { flex: 2; }
.filter-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.course-search-wrapper {
  position: relative;
}
.course-search-input {
  width: 100%;
  padding: 10px 34px 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 13px;
  transition: border-color 0.15s;
}
.course-search-input:focus {
  outline: none;
  border-color: rgba(191, 90, 242, 0.5);
}
.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.search-clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8E8E93;
  transition: color 0.15s;
}
.search-clear-btn:hover { color: #fff; }
.course-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #2C2C2E;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 10;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.course-option {
  padding: 10px 14px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: background 0.12s;
}
.course-option:hover { background: rgba(255, 255, 255, 0.06); }
.course-option.active { color: #BF5AF2; font-weight: 600; }
.course-option-empty {
  padding: 10px 14px;
  font-size: 12px;
  color: #636366;
  font-style: italic;
}

/* ── Student search ── */
.student-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.student-search-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.15s;
}
.student-search-wrapper:focus-within {
  border-color: rgba(191, 90, 242, 0.4);
}
.student-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  outline: none;
}
.student-count {
  font-size: 12px;
  color: #636366;
  white-space: nowrap;
}

/* ── Table ── */
.table-scroll-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.consolidado-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 600px;
}
.consolidado-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.consolidado-table th {
  padding: 10px 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.08);
  border-bottom: 2px solid rgba(191, 90, 242, 0.2);
  text-align: center;
  white-space: nowrap;
}
.th-num { width: 36px; }
.th-student {
  text-align: left;
  min-width: 180px;
  position: sticky;
  left: 0;
  z-index: 3;
  background: rgba(28, 28, 30, 0.98);
}
.th-subject { min-width: 80px; }
.th-subject-text {
  display: block;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.consolidado-row {
  transition: background 0.12s;
}
.consolidado-row:hover {
  background: rgba(255, 255, 255, 0.03);
}
.consolidado-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.015);
}
.cell-num {
  text-align: center;
  color: #636366;
  font-size: 11px;
  padding: 8px 4px;
}
.cell-student {
  text-align: left;
  padding: 8px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
}
.consolidado-row:nth-child(even) .cell-student {
  background: rgba(28, 28, 30, 0.98);
}
.consolidado-row:hover .cell-student {
  background: rgba(44, 44, 46, 0.98);
}
.cell-grade {
  text-align: center;
  padding: 8px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

/* Grade colors */
.grade-good { color: #34C759 !important; }
.grade-ok   { color: #FFD60A !important; }
.grade-low  { color: #FF453A !important; }

/* ── Empty state ── */
.consolidado-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #636366;
  font-size: 14px;
}

/* ── Course sections (todos los cursos) ── */
.course-section { margin-bottom: 24px; }
.course-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(191, 90, 242, 0.2);
  color: #BF5AF2;
}
.course-section-name {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.course-section-count {
  font-size: 11px;
  color: #8E8E93;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 8px;
}

/* ── Export bar ── */
.consolidado-export-bar {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
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

/* ── Fullscreen mode ── */
.consolidado-overlay--fs {
  padding: 0;
  align-items: flex-start;
}
.consolidado-modal--fs {
  max-width: 100%;
  max-height: 100dvh;
  height: 100dvh;
  border-radius: 0;
  padding-top: env(safe-area-inset-top, 0px);
}
.consolidado-modal--fs .consolidado-header {
  padding-top: max(18px, calc(env(safe-area-inset-top, 0px) + 10px));
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .consolidado-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .consolidado-overlay--fs {
    align-items: flex-start;
  }
  .consolidado-modal {
    max-width: 100%;
    max-height: 92dvh;
    border-radius: 20px 20px 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    animation: consolidado-slide-up-mobile 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes consolidado-slide-up-mobile {
    from { opacity: 0; transform: translateY(100%); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .consolidado-modal--fs {
    border-radius: 0;
    max-height: 100dvh;
    height: 100dvh;
  }
  .consolidado-header {
    padding: 16px 16px 12px;
    padding-top: max(16px, calc(env(safe-area-inset-top, 0px) + 12px));
  }
  .consolidado-title { font-size: 15px; }
  .consolidado-subtitle { font-size: 11px; }
  .consolidado-header-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
  }
  .consolidado-action-btn,
  .consolidado-close {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    /* Área táctil mínima recomendada */
    min-width: 38px;
    min-height: 38px;
  }
  .consolidado-body {
    padding: 12px 14px;
  }
  .consolidado-export-bar {
    padding: 12px 14px;
    padding-bottom: max(12px, calc(env(safe-area-inset-bottom, 0px) + 8px));
  }
  .student-search-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .student-count {
    font-size: 11px;
  }
}

/* ── Transitions ── */
.consolidado-fade-enter-active { transition: opacity 0.25s ease; }
.consolidado-fade-leave-active { transition: opacity 0.2s ease; }
.consolidado-fade-enter-from,
.consolidado-fade-leave-to { opacity: 0; }

.row-fade-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.row-fade-leave-active { transition: opacity 0.15s ease; }
.row-fade-enter-from { opacity: 0; transform: translateY(8px); }
.row-fade-leave-to { opacity: 0; }
.row-fade-move { transition: transform 0.3s ease; }

/* ── Fullscreen icon swap ── */
.fs-icon-enter-active,
.fs-icon-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fs-icon-enter-from { opacity: 0; transform: rotate(45deg) scale(0.6); }
.fs-icon-leave-to  { opacity: 0; transform: rotate(-45deg) scale(0.6); }

/* ── Fullscreen ── */
.consolidado-overlay--fs { padding: 0; }
.consolidado-modal--fs {
  max-width: 100vw !important;
  max-height: 100vh !important;
  height: 100vh;
  border-radius: 0;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

@media (max-width: 600px) {
  .consolidado-modal {
    max-height: 98vh;
    border-radius: 16px 16px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .consolidado-overlay { align-items: flex-end; padding: 0; }
  .th-subject-text { max-width: 60px; font-size: 8px; }
}
</style>
