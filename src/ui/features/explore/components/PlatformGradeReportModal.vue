<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="modelValue" class="report-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="report-modal">
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

            <!-- Search -->
            <div class="report-search-row">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                v-model="searchQuery"
                class="report-search"
                placeholder="Buscar por estudiante, tarea o curso..."
              />
              <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Table -->
            <div class="report-table-wrapper">
              <p class="platform-caption">Aquí tienes el registro completo de las notas de todos los cursos:</p>
              <table class="report-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Materia</th>
                    <th>Tarea</th>
                    <th class="col-nota">Nota</th>
                    <th class="col-date">Fecha de entrega</th>
                    <th>Calificó</th>
                    <th>Retroalimentación</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="group in filteredData" :key="group.courseName">
                    <tr class="course-header-row">
                      <td colspan="7">{{ group.courseName }}</td>
                    </tr>
                    <template v-if="group.rows.length">
                      <tr v-for="row in group.rows" :key="row.id">
                        <td class="col-student">{{ row.studentUsername || '—' }}</td>
                        <td class="col-subject">{{ row.subjectName || '—' }}</td>
                        <td class="col-task">{{ row.taskName || '—' }}</td>
                        <td class="col-nota" :class="gradeClass(row.grade)">{{ row.grade != null ? row.grade : 'Sin nota' }}</td>
                        <td class="col-date">{{ formatDate(row.submission_date) }}</td>
                        <td class="col-grader">{{ row.gradedByUsername || '—' }}</td>
                        <td class="col-feedback">{{ row.feedback || '' }}</td>
                      </tr>
                    </template>
                    <tr v-else class="no-data-row">
                      <td colspan="7">Sin entregas registradas</td>
                    </tr>
                  </template>
                  <tr v-if="filteredData.length === 0">
                    <td colspan="7" class="no-results">No se encontraron resultados para "{{ searchQuery }}"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Export bar -->
            <div class="report-export-bar">
              <button class="export-btn export-pdf" @click="exportPDF">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                PDF
              </button>
              <button class="export-btn export-excel" @click="exportExcel">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                Excel
              </button>
              <button class="export-btn export-word" @click="exportWord">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
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
import { ref, computed, watch } from 'vue'
import { api, courseAdapter } from '@/infrastructure/api'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

interface ReportRow {
  id: number
  studentUsername?: string | null
  taskName?: string | null
  grade: number | null
  submission_date: number | null
  feedback: string | null
  subjectName?: string | null
  gradedByUsername?: string | null
}

interface CourseGroup {
  courseId: number
  courseName: string
  rows: ReportRow[]
}

const loading = ref(false)
const errorMsg = ref('')
const reportData = ref<CourseGroup[]>([])
const loadedCourses = ref(0)
const totalCourses = ref(0)
const searchQuery = ref('')

const courseCount = computed(() => reportData.value.length)
const totalSubmissions = computed(() => reportData.value.reduce((s, g) => s + g.rows.length, 0))
const gradedCount = computed(() => reportData.value.reduce((s, g) => s + g.rows.filter(r => r.grade != null).length, 0))

const averageGrade = computed(() => {
  const graded = reportData.value.flatMap(g => g.rows).filter(r => r.grade != null)
  if (!graded.length) return '—'
  return (graded.reduce((s, r) => s + r.grade!, 0) / graded.length).toFixed(1)
})

const averageClass = computed(() => gradeClass(parseFloat(averageGrade.value) || null))

const filteredData = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return reportData.value
  return reportData.value
    .map(group => ({
      ...group,
      rows: group.rows.filter(r =>
        (r.studentUsername ?? '').toLowerCase().includes(q) ||
        (r.taskName ?? '').toLowerCase().includes(q) ||
        (r.subjectName ?? '').toLowerCase().includes(q) ||
        (r.gradedByUsername ?? '').toLowerCase().includes(q) ||
        group.courseName.toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.rows.length > 0 || group_matches(group_name(g), q))
})

function group_name(g: CourseGroup) { return g.courseName }
function group_matches(name: string, q: string) { return name.toLowerCase().includes(q) }

function gradeClass(grade: number | null): string {
  if (grade == null || isNaN(grade)) return ''
  if (grade >= 4) return 'grade-good'
  if (grade >= 3) return 'grade-ok'
  return 'grade-low'
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
        const subs = await api.get<any[]>(`/submissions/course/${course.id}?page=1&pageSize=300`)
        loadedCourses.value++
        return {
          courseId: course.id,
          courseName: (course as any).title ?? (course as any).name ?? `Curso ${course.id}`,
          rows: (subs ?? []) as ReportRow[],
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

// ── PDF export (print) ──────────────────────────────────────────────────
function exportPDF() {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(buildPrintableHTML('pdf'))
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

// ── Excel / CSV export ──────────────────────────────────────────────────
function exportExcel() {
  const BOM = '\uFEFF'
  let csv = BOM + 'Curso,Materia,Estudiante,Tarea,Nota,Fecha de entrega,Calificó,Retroalimentación\n'
  for (const group of reportData.value) {
    for (const row of group.rows) {
      csv += `"${esc(group.courseName)}","${esc(row.subjectName ?? '')}","${esc(row.studentUsername ?? '')}","${esc(row.taskName ?? '')}","${row.grade ?? ''}","${formatDate(row.submission_date)}","${esc(row.gradedByUsername ?? '')}","${esc(row.feedback ?? '')}"\n`
    }
  }
  downloadBlob(csv, `reporte_plataforma_${Date.now()}.csv`, 'text/csv;charset=utf-8;')
}

// ── Word export (.doc as HTML) ──────────────────────────────────────────
function exportWord() {
  const html = buildPrintableHTML('word')
  downloadBlob(html, `reporte_plataforma_${Date.now()}.doc`, 'application/msword')
}

function esc(s: string) { return String(s).replace(/"/g, '""') }

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
    rows += `<tr class="course-header"><td colspan="7">${group.courseName}</td></tr>`
    if (!group.rows.length) {
      rows += `<tr><td colspan="7" style="color:#999;font-style:italic;padding-left:20px">Sin entregas registradas</td></tr>`
    }
    for (const row of group.rows) {
      const g = row.grade != null ? row.grade : '—'
      const color = row.grade != null ? (row.grade >= 4 ? '#34C759' : row.grade >= 3 ? '#FF9500' : '#FF453A') : '#999'
      rows += `<tr>
        <td>${esc_html(row.studentUsername ?? '—')}</td>
        <td>${esc_html(row.subjectName ?? '—')}</td>
        <td>${esc_html(row.taskName ?? '—')}</td>
        <td style="color:${color};font-weight:600;text-align:center">${g}</td>
        <td style="color:#555;font-size:12px;white-space:nowrap">${formatDate(row.submission_date)}</td>
        <td>${esc_html(row.gradedByUsername ?? '—')}</td>
        <td style="max-width:240px;word-break:break-word;color:#444">${esc_html(row.feedback ?? '—')}</td>
      </tr>`
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
th{text-align:left;font-size:11px;color:#555;text-transform:uppercase;padding:8px 10px;border-bottom:2px solid #ddd;background:#fafafa;letter-spacing:.4px}
td{padding:7px 10px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.course-header td{font-weight:700;font-size:13px;background:#f2e8ff;color:#6A1B9A;padding:10px 10px 8px;border-bottom:1px solid #d9baf5}
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
  <thead><tr><th>Estudiante</th><th>Materia</th><th>Tarea</th><th style="text-align:center">Nota</th><th>Fecha de entrega</th><th>Calificó</th><th>Retroalimentación</th></tr></thead>
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
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.7);
}

/* ── Header ── */
.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.report-header-icon {
  width: 40px;
  height: 40px;
  background: rgba(191, 90, 242, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-header-info { flex: 1; min-width: 0; }
.report-title { font-size: 16px; font-weight: 700; color: #fff; }
.report-subtitle { font-size: 12px; color: #8E8E93; margin-top: 2px; }

.report-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.report-close:hover { background: rgba(255, 255, 255, 0.14); }

/* ── Loading / Error ── */
.report-loading, .report-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 10px;
  flex: 1;
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
  width: 34px;
  height: 34px;
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
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.035);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}
.summary-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.summary-value { font-size: 20px; font-weight: 700; color: #fff; }
.summary-label { font-size: 10px; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; }
.summary-divider { width: 1px; height: 26px; background: rgba(255, 255, 255, 0.08); }

.grade-good { color: #34C759 !important; font-weight: 700; }
.grade-ok   { color: #FF9500 !important; font-weight: 700; }
.grade-low  { color: #FF453A !important; font-weight: 700; }

/* ── Search ── */
.report-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 8px;
  flex-shrink: 0;
}
.report-search {
  flex: 1;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  outline: none;
}
.report-search::placeholder { color: #636366; }
.report-search:focus { border-color: rgba(191, 90, 242, 0.45); }
.search-clear {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

/* ── Table ── */
.report-table-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0 0 4px;
  min-height: 0;
}

.platform-caption {
  font-size: 13px;
  color: #8E8E93;
  padding: 8px 16px 4px;
  font-style: italic;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table thead th {
  position: sticky;
  top: 0;
  background: #2C2C2E;
  color: #8E8E93;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  padding: 9px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1;
  white-space: nowrap;
}

.report-table tbody td {
  padding: 7px 14px;
  color: #E5E5EA;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: top;
}

.course-header-row td {
  background: rgba(106, 27, 154, 0.18);
  color: #BF5AF2;
  font-weight: 700;
  font-size: 13px;
  padding: 9px 14px;
  border-top: 1px solid rgba(191, 90, 242, 0.15);
  border-bottom: 1px solid rgba(191, 90, 242, 0.2);
}

.no-data-row td { color: #636366; font-style: italic; padding-left: 28px; }

.col-nota { text-align: center; width: 72px; }
.col-date { color: #8E8E93; font-size: 12px; white-space: nowrap; width: 150px; }
.col-feedback { max-width: 240px; word-break: break-word; color: #AEAEB2; }
.col-student { font-weight: 500; }
.col-task { color: #DCDCDC; }

.no-results {
  text-align: center;
  padding: 40px;
  color: #636366;
  font-style: italic;
}

/* ── Export bar ── */
.report-export-bar {
  display: flex;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.15s;
}
.export-btn:hover { opacity: 0.85; }
.export-pdf   { background: rgba(255, 105, 97, 0.15); color: #FF6961; }
.export-excel { background: rgba(52, 199, 89, 0.15);  color: #34C759; }
.export-word  { background: rgba(10, 132, 255, 0.15);  color: #0A84FF; }

/* ── Transitions ── */
.report-fade-enter-active, .report-fade-leave-active { transition: opacity 0.2s; }
.report-fade-enter-from, .report-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .report-modal { max-height: 98vh; border-radius: 16px 16px 0 0; position: fixed; bottom: 0; left: 0; right: 0; }
  .report-overlay { align-items: flex-end; padding: 0; }
  .col-feedback { display: none; }
  .col-date { display: none; }
}
</style>
