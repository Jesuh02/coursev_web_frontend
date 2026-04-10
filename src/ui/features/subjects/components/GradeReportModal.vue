<template>
  <Teleport to="body">
    <Transition name="report-fade">
      <div v-if="modelValue" class="report-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="report-modal">
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

            <!-- Subject sections with table -->
            <div class="report-table">
              <div v-for="group in reportData" :key="group.subjectId" class="report-subject-group">
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

                <!-- Grade table -->
                <div v-if="group.rows.length" class="table-wrapper">
                  <table class="grade-table">
                    <thead>
                      <tr>
                        <th class="th-student">Estudiante</th>
                        <th>Tarea</th>
                        <th class="th-grade">Nota</th>
                        <th>Fecha de entrega</th>
                        <th>Docente que calificó</th>
                        <th>Retroalimentación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in group.rows" :key="i" class="grade-row">
                        <td class="cell-student">{{ row.studentName }}</td>
                        <td class="cell-task">{{ row.taskName }}</td>
                        <td class="cell-grade" :class="gradeClass(row.grade)">{{ row.grade ?? '—' }}</td>
                        <td class="cell-date">{{ formatDate(row.submissionDate) }}</td>
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
import { ref, computed, watch } from 'vue'
import type { Subject } from '@/domain/models'
import { taskAdapter, topicAdapter } from '@/infrastructure/api'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { userAdapter } from '@/infrastructure/api/userAdapter'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  modelValue: boolean
  courseId: number
  subjects: Subject[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const authStore = useAuthStore()

interface SubmissionRow {
  studentName: string
  taskName: string
  grade: number | null
  submissionDate: number | null
  feedback: string | null
  gradedByUsername: string | null
}

interface SubjectReport {
  subjectId: number
  subjectName: string
  teacherName: string
  rows: SubmissionRow[]
  average: number | null
}

const loading = ref(false)
const reportData = ref<SubjectReport[]>([])

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
    for (const sub of (submissions as any[])) {
      const taskId = sub.task_id ?? sub.taskId
      const task = taskMap.get(taskId)
      if (!task) continue
      const topicId = task.topicId ?? task.topic_id
      const subjectId = topicSubjectMap.get(topicId)
      if (!subjectId) continue

      if (!subjectRowsMap.has(subjectId)) subjectRowsMap.set(subjectId, [])
      subjectRowsMap.get(subjectId)!.push({
        studentName: sub.studentUsername ?? sub.student_username ?? `Estudiante #${sub.student_id ?? sub.studentId}`,
        taskName: sub.taskName ?? task.title ?? task.name ?? 'Sin título',
        grade: sub.grade ?? null,
        submissionDate: sub.submission_date ?? sub.submissionDate ?? null,
        feedback: sub.feedback ?? null,
        gradedByUsername: sub.gradedByUsername ?? null,
      })
    }

    // Build per-subject report
    reportData.value = props.subjects.map(subject => {
      const rows = subjectRowsMap.get(subject.id) ?? []
      const graded = rows.filter(r => r.grade !== null)
      const avg = graded.length ? graded.reduce((s, r) => s + r.grade!, 0) / graded.length : null

      const teacherName = subject.createdBy != null
        ? teacherMap.get(subject.createdBy) ?? `Docente #${subject.createdBy}`
        : '—'

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        teacherName,
        rows,
        average: avg != null ? parseFloat(avg.toFixed(1)) : null,
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

// ── Excel export (.xls – HTML-based, opens fully formatted in Microsoft Excel) ──
function exportExcel() {
  const now = new Date().toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
  let tableRows = ''
  for (const group of reportData.value) {
    const avg = group.average !== null ? group.average : '—'
    tableRows += `<tr style="background:#f3eafe"><td colspan="6" style="font-size:11pt;font-weight:700;color:#4a0e8f;padding:8px 12px;border-bottom:2px solid #c9a0f5;border-left:4px solid #8b5cf6">${escH(group.subjectName)}&nbsp;&nbsp;<span style="font-weight:400;color:#888;font-size:9pt">Docente: ${escH(group.teacherName)}</span>&nbsp;&nbsp;<span style="float:right;color:#4a0e8f">Promedio: ${avg}</span></td></tr>`
    if (!group.rows.length) {
      tableRows += `<tr><td colspan="6" style="color:#999;font-style:italic;padding:6px 12px 6px 24px">Sin entregas registradas</td></tr>`
    }
    for (let i = 0; i < group.rows.length; i++) {
      const row = group.rows[i]
      const bg = i % 2 === 0 ? '#ffffff' : '#f9f7fc'
      const grade = row.grade !== null ? row.grade : '—'
      const gradeColor = row.grade !== null
        ? (row.grade >= 4 ? '#1a7f37' : row.grade >= 3 ? '#b45309' : '#b91c1c')
        : '#999999'
      const fb = row.feedback ? escH(stripHtml(row.feedback)) : '—'
      tableRows += `<tr style="background:${bg}"><td style="white-space:nowrap">${escH(row.studentName)}</td><td>${escH(row.taskName)}</td><td style="text-align:center;font-weight:700;color:${gradeColor}">${grade}</td><td style="white-space:nowrap">${formatDate(row.submissionDate)}</td><td>${escH(row.gradedByUsername ?? '—')}</td><td style="color:#555">${fb}</td></tr>`
    }
  }

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Reporte de Notas</x:Name><x:WorksheetOptions><x:FitToPage/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>* { font-family: Calibri, Arial, sans-serif; font-size: 10pt; } table { border-collapse: collapse; width: 100%; } th { background: #3b1060; color: #fff; font-weight: 700; padding: 9px 12px; text-align: left; border: 1px solid #2a0a45; white-space: nowrap; } td { padding: 6px 12px; border: 1px solid #e0dde8; vertical-align: top; }</style></head><body><h2 style="font-family:Calibri,Arial;color:#3b1060;margin:0 0 6px">Reporte de Notas</h2><p style="font-size:9pt;color:#666;margin:0 0 16px">Generado el ${now}&nbsp;&nbsp;·&nbsp;&nbsp;${props.subjects.length} materias&nbsp;&nbsp;·&nbsp;&nbsp;${totalSubmissions.value} entregas&nbsp;&nbsp;·&nbsp;&nbsp;${gradedCount.value} calificadas&nbsp;&nbsp;·&nbsp;&nbsp;Promedio general: ${averageGrade.value}</p><table><colgroup><col style="width:140pt"><col style="width:190pt"><col style="width:55pt"><col style="width:110pt"><col style="width:130pt"><col style="width:260pt"></colgroup><thead><tr><th>Estudiante</th><th>Tarea</th><th style="text-align:center">Nota</th><th>Fecha de entrega</th><th>Docente que calificó</th><th>Retroalimentación</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte_notas_${Date.now()}.xls`
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
      text += `   • [${row.studentName}] ${row.taskName}: ${row.grade ?? 'Sin nota'}${row.gradedByUsername ? ` (Calificó: ${row.gradedByUsername})` : ''}\n`
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
      const g = row.grade !== null ? row.grade : '—'
      const color = row.grade !== null ? (row.grade >= 4 ? '#34C759' : row.grade >= 3 ? '#FF9500' : '#FF453A') : '#999'
      const fb = row.feedback ? truncate(stripHtml(row.feedback), 120) : '—'
      const grader = row.gradedByUsername ?? '—'
      rows += `<tr>
        <td>${row.studentName}</td>
        <td>${row.taskName}</td>
        <td style="color:${color};font-weight:600;text-align:center">${g}</td>
        <td>${formatDate(row.submissionDate)}</td>
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
<thead><tr><th>Estudiante</th><th>Tarea</th><th style="text-align:center">Nota</th><th>Fecha</th><th>Calificó</th><th colspan="2">Retroalimentación</th></tr></thead>
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

.no-tasks {
  padding: 10px 16px;
  font-size: 13px;
  color: #636366;
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
</style>
