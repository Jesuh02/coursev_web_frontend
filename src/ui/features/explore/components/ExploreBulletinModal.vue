<template>
  <Teleport to="body">
    <Transition name="bulletin-fade">
      <div v-if="modelValue" class="bulletin-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="bulletin-modal">
          <!-- Header -->
          <div class="bulletin-header">
            <div class="bulletin-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h2 class="bulletin-title">Generar Boletín</h2>
            <button class="bulletin-close" @click="$emit('update:modelValue', false)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div class="bulletin-body">
            <!-- Step 1: Course selection -->
            <template v-if="!selectedCourse">
              <p class="step-hint">Selecciona un curso para generar el boletín</p>
              <div class="course-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input v-model="courseSearch" type="text" placeholder="Buscar curso..." />
              </div>
              <ul v-if="filteredCourses.length" class="course-pick-list">
                <li v-for="c in filteredCourses" :key="c.id" class="course-pick-item" @click="pickCourse(c)">
                  <div class="course-pick-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <div class="course-pick-info">
                    <span class="course-pick-name">{{ c.title }}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
                </li>
              </ul>
              <p v-else class="no-courses">No se encontraron cursos</p>
            </template>

            <!-- Step 2: Delegate to BulletinModal-like flow -->
            <template v-else>
              <button class="back-to-list" @click="selectedCourse = null; selectedStudent = null; subjectsForCourse = []">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
                Seleccionar otro curso
              </button>
              <p class="step-course-name">{{ selectedCourse.title }}</p>

              <div v-if="loadingSubjects" class="bulletin-loading">
                <div class="spinner-bulletin" />
                <p>Cargando materias…</p>
              </div>

              <!-- Student selector -->
              <template v-else-if="!selectedStudent">
                <div v-if="loadingStudents" class="bulletin-loading">
                  <div class="spinner-bulletin" />
                  <p>Cargando estudiantes…</p>
                </div>
                <template v-else>
                  <div class="course-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input v-model="studentSearch" type="text" placeholder="Buscar estudiante..." />
                  </div>
                  <p class="step-hint">Selecciona un estudiante</p>
                  <ul v-if="filteredStudents.length" class="course-pick-list">
                    <li v-for="st in filteredStudents" :key="st.userId" class="course-pick-item" @click="selectStudent(st)">
                      <div class="student-avatar-placeholder">{{ (st.fullName || st.username || '?')[0].toUpperCase() }}</div>
                      <div class="course-pick-info">
                        <span class="course-pick-name">{{ st.fullName || st.username || `#${st.userId}` }}</span>
                        <span v-if="st.username" class="course-pick-sub">@{{ st.username }}</span>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </li>
                  </ul>
                  <p v-else class="no-courses">No se encontraron estudiantes</p>
                </template>
              </template>

              <!-- Bulletin preview -->
              <template v-else>
                <button class="back-to-list" @click="selectedStudent = null" style="margin-top:4px">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
                  Otro estudiante
                </button>

                <div v-if="loadingBulletin" class="bulletin-loading">
                  <div class="spinner-bulletin" />
                  <p>Generando boletín…</p>
                </div>

                <div v-else class="bulletin-card">
                  <div class="boletin-header-top">
                    <div class="boletin-logo-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div class="boletin-institution">
                      <span class="boletin-inst-name">CourseV</span>
                      <span class="boletin-inst-subtitle">Plataforma Educativa</span>
                    </div>
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-info-grid">
                    <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ selectedCourse.title }}</span></div>
                    <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ selectedStudent.fullName || selectedStudent.username || '—' }}</span></div>
                    <div v-if="selectedStudent.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ selectedStudent.cedula }}</span></div>
                    <div class="boletin-info-row"><span class="boletin-label">PERIODO:</span><span class="boletin-value">{{ currentPeriod }}</span></div>
                  </div>
                  <div class="boletin-divider" />
                  <table class="boletin-table">
                    <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                    <tbody>
                      <tr v-for="row in bulletinRows" :key="row.subjectId">
                        <td class="td-modulo">{{ row.subjectName }}</td>
                        <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ row.notaDefinitiva != null ? row.notaDefinitiva.toFixed(1) : '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="boletin-promedio">
                    <span class="promedio-label">PROMEDIO GENERAL</span>
                    <span class="promedio-value" :class="notaClass(promedioGeneral)">{{ promedioGeneral != null ? promedioGeneral.toFixed(1) : '—' }}</span>
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
                </div>

                <div class="bulletin-export-bar">
                  <button class="export-btn export-pdf" @click="exportBulletinPDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    PDF
                  </button>
                  <button class="export-btn export-share" @click="shareBulletin">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Compartir
                  </button>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Course, Subject } from '@/domain/models'
import { useCourseStore } from '@/stores/courseStore'
import { subjectAdapter } from '@/infrastructure/api'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet, GradeSheetStudent } from '@/infrastructure/api/gradeAdapter'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const courseStore = useCourseStore()
const courseSearch = ref('')
const studentSearch = ref('')
const selectedCourse = ref<Course | null>(null)
const selectedStudent = ref<GradeSheetStudent | null>(null)
const subjectsForCourse = ref<Subject[]>([])
const allStudents = ref<GradeSheetStudent[]>([])
const loadingSubjects = ref(false)
const loadingStudents = ref(false)
const loadingBulletin = ref(false)

interface BulletinRow { subjectId: number; subjectName: string; notaDefinitiva: number | null }
const bulletinRows = ref<BulletinRow[]>([])

const filteredCourses = computed(() => {
  const courses = courseStore.courses
  if (!courseSearch.value.trim()) return courses
  const q = courseSearch.value.toLowerCase()
  return courses.filter(c => (c.title || '').toLowerCase().includes(q))
})

const filteredStudents = computed(() => {
  if (!studentSearch.value.trim()) return allStudents.value
  const q = studentSearch.value.toLowerCase()
  return allStudents.value.filter(s =>
    (s.fullName || '').toLowerCase().includes(q) ||
    (s.username || '').toLowerCase().includes(q)
  )
})

const currentPeriod = computed(() => {
  const now = new Date()
  const semester = now.getMonth() < 6 ? 'I' : 'II'
  return `${semester} PERIODO ${now.getFullYear()}-${semester === 'I' ? 'A' : 'B'}`
})

const generatedDate = computed(() =>
  new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
)

const promedioGeneral = computed(() => {
  const grades = bulletinRows.value.filter(r => r.notaDefinitiva != null).map(r => r.notaDefinitiva!)
  if (!grades.length) return null
  return grades.reduce((a, b) => a + b, 0) / grades.length
})

function notaClass(grade: number | null): string {
  if (grade === null || isNaN(grade as number)) return ''
  if (grade >= 4) return 'nota-good'
  if (grade >= 3) return 'nota-ok'
  return 'nota-low'
}

watch(() => props.modelValue, (open) => {
  if (open) {
    selectedCourse.value = null
    selectedStudent.value = null
    courseSearch.value = ''
    studentSearch.value = ''
    bulletinRows.value = []
    subjectsForCourse.value = []
  }
})

async function pickCourse(course: Course) {
  selectedCourse.value = course
  loadingSubjects.value = true
  try {
    const raw: any[] = await subjectAdapter.getSubjectsByCourse(course.id)
    subjectsForCourse.value = raw.map((s: any) => ({
      ...s,
      id: s.id,
      courseId: s.courseId ?? s.course_id ?? 0,
      name: s.name,
      description: s.description ?? '',
    }))
    await loadStudents()
  } catch { subjectsForCourse.value = [] }
  finally { loadingSubjects.value = false }
}

async function loadStudents() {
  loadingStudents.value = true
  try {
    const studentMap = new Map<number, GradeSheetStudent>()
    await Promise.allSettled(
      subjectsForCourse.value.map(s =>
        gradeAdapter.getGradeSheet(s.id).then(sheet => {
          if (!sheet) return
          for (const st of sheet.students) {
            if (!studentMap.has(st.userId)) studentMap.set(st.userId, st)
          }
        }).catch(() => {})
      )
    )
    allStudents.value = Array.from(studentMap.values()).sort((a, b) =>
      (a.fullName || a.username || '').localeCompare(b.fullName || b.username || '')
    )
  } catch { /* silent */ }
  finally { loadingStudents.value = false }
}

async function selectStudent(student: GradeSheetStudent) {
  selectedStudent.value = student
  loadingBulletin.value = true
  bulletinRows.value = []
  try {
    const rows: BulletinRow[] = []
    await Promise.allSettled(
      subjectsForCourse.value.map(s =>
        gradeAdapter.getGradeSheet(s.id).then(sheet => {
          if (!sheet) { rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: null }); return }
          const totalTasks = sheet.tasks.length
          const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
          const taskSum = stTaskGrades.reduce((sum, tg) => sum + (tg.grade ?? 0), 0)
          const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null
          const stManualGrades = sheet.manualGrades.filter(mg => Number(mg.studentId) === student.userId)
          const byType: Record<string, number[]> = {}
          for (const mg of stManualGrades) {
            const base = String(mg.gradeType).replace(/_\d+$/, '')
            if (!byType[base]) byType[base] = []
            byType[base].push(Number(mg.grade))
          }
          const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
          const vals = [taskAvg, avgArr(byType['participacion'] ?? []), avgArr(byType['examenes'] ?? []), avgArr(byType['comportamiento'] ?? [])].filter((v): v is number => v !== null)
          const nota = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
          rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: nota !== null ? Math.round(nota * 10) / 10 : null })
        }).catch(() => { rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: null }) })
      )
    )
    const order = new Map(subjectsForCourse.value.map((s, i) => [s.id, i]))
    rows.sort((a, b) => (order.get(a.subjectId) ?? 0) - (order.get(b.subjectId) ?? 0))
    bulletinRows.value = rows
  } catch { /* silent */ }
  finally { loadingBulletin.value = false }
}

function escH(s: string) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

function exportBulletinPDF() {
  const st = selectedStudent.value
  const name = escH(st?.fullName || st?.username || 'Estudiante')
  const prom = promedioGeneral.value
  let rows = ''
  for (const row of bulletinRows.value) {
    const nota = row.notaDefinitiva != null ? row.notaDefinitiva.toFixed(1) : '—'
    const color = row.notaDefinitiva != null ? (row.notaDefinitiva >= 4 ? '#1A7F37' : row.notaDefinitiva >= 3 ? '#B45309' : '#B91C1C') : '#999'
    rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
  }
  const promColor = prom != null ? (prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C') : '#999'
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletín - ${name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#222;max-width:700px;margin:0 auto}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}.prom-value{font-size:20px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:20px}table{page-break-inside:avoid}}</style></head><body>
<div class="header"><span class="inst-name">CourseV</span><span class="inst-sub">Plataforma Educativa</span></div>
<div class="info"><span class="label">Programa:</span><span class="value">${escH(selectedCourse.value?.title || '—')}</span><span class="label">Estudiante:</span><span class="value">${name}</span>${st?.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}<span class="label">Periodo:</span><span class="value">${escH(currentPeriod.value)}</span></div>
<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>${rows}</tbody></table>
<div class="promedio"><span class="prom-label">Promedio General</span><span class="prom-value" style="color:${promColor}">${prom != null ? prom.toFixed(1) : '—'}</span></div>
<div class="footer">Generado el ${generatedDate.value}</div></body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

async function shareBulletin() {
  const st = selectedStudent.value
  const name = st?.fullName || st?.username || 'Estudiante'
  let text = `📋 BOLETÍN DE NOTAS\n📌 Programa: ${selectedCourse.value?.title || '—'}\n👤 Estudiante: ${name}\n📅 Periodo: ${currentPeriod.value}\n\n${'─'.repeat(32)}\nMÓDULO                    NOTA\n${'─'.repeat(32)}\n`
  for (const row of bulletinRows.value) {
    text += `${row.subjectName.padEnd(26)}${row.notaDefinitiva != null ? row.notaDefinitiva.toFixed(1) : '—'}\n`
  }
  text += `${'─'.repeat(32)}\nPROMEDIO GENERAL           ${promedioGeneral.value != null ? promedioGeneral.value.toFixed(1) : '—'}\n`
  if (navigator.share) {
    try { await navigator.share({ title: 'Boletín de Notas', text }) } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(text)
    alert('Boletín copiado al portapapeles')
  }
}
</script>

<style scoped>
.bulletin-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
.bulletin-modal { width: 100%; max-width: 560px; max-height: 88vh; background: #1C1C1E; border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; animation: bulletin-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes bulletin-slide-up { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
.bulletin-fade-enter-active { transition: opacity 0.2s; }
.bulletin-fade-leave-active { transition: opacity 0.15s; }
.bulletin-fade-enter-from, .bulletin-fade-leave-to { opacity: 0; }
.bulletin-header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bulletin-header-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(48,209,88,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bulletin-title { flex: 1; font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.bulletin-close { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; }
.bulletin-close:hover { background: rgba(255,255,255,0.12); }
.bulletin-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
.bulletin-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 20px; color: #8E8E93; font-size: 14px; }
.spinner-bulletin { width: 28px; height: 28px; border: 3px solid rgba(48,209,88,0.2); border-top-color: #30D158; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.step-hint { font-size: 12px; color: #8E8E93; margin-bottom: 12px; }
.step-course-name { font-size: 16px; font-weight: 700; color: #BF5AF2; margin-bottom: 12px; }

.course-search { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; }
.course-search input { flex: 1; background: transparent; border: none; color: #fff; font-size: 14px; outline: none; }
.course-search input::placeholder { color: #8E8E93; }

.course-pick-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.course-pick-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; cursor: pointer; transition: background 0.15s; }
.course-pick-item:hover { background: rgba(255,255,255,0.06); }
.course-pick-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(191,90,242,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.course-pick-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.course-pick-name { font-size: 14px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.course-pick-sub { font-size: 12px; color: #8E8E93; }
.no-courses { text-align: center; color: #636366; font-size: 14px; padding: 24px 0; }

.student-avatar-placeholder { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6A1B9A, #BF5AF2); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; flex-shrink: 0; }

.back-to-list { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #0A84FF; margin-bottom: 12px; padding: 0; background: none; border: none; cursor: pointer; }
.back-to-list:hover { text-decoration: underline; }

/* Bulletin card */
.bulletin-card { background: #2C2C2E; border-radius: 16px; padding: 24px 20px; border: 1px solid rgba(255,255,255,0.08); }
.boletin-header-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.boletin-logo-placeholder { width: 52px; height: 52px; border-radius: 12px; background: rgba(106,27,154,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.boletin-institution { display: flex; flex-direction: column; gap: 2px; }
.boletin-inst-name { font-size: 17px; font-weight: 800; color: #BF5AF2; letter-spacing: 0.3px; }
.boletin-inst-subtitle { font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; }
.boletin-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }
.boletin-info-grid { display: flex; flex-direction: column; gap: 8px; }
.boletin-info-row { display: flex; gap: 10px; align-items: baseline; }
.boletin-label { font-size: 11px; font-weight: 700; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; flex-shrink: 0; min-width: 110px; }
.boletin-value { font-size: 14px; font-weight: 600; color: #fff; }

.boletin-table { width: 100%; border-collapse: collapse; margin-top: 4px; border-radius: 8px; overflow: hidden; }
.boletin-table thead tr { background: rgba(106,27,154,0.3); }
.boletin-table th { padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #BF5AF2; }
.th-modulo { text-align: left; }
.th-nota { text-align: center; }
.boletin-table td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.td-modulo { font-size: 13px; font-weight: 600; color: #fff; text-transform: uppercase; }
.td-nota { text-align: center; font-size: 16px; font-weight: 800; color: #ccc; }
.boletin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
.boletin-table tbody tr:last-child td { border-bottom: none; }

.boletin-promedio { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: rgba(106,27,154,0.12); border-radius: 12px; margin-top: 16px; }
.promedio-label { font-size: 12px; font-weight: 700; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; }
.promedio-value { font-size: 22px; font-weight: 800; color: #fff; }
.nota-good { color: #30D158 !important; }
.nota-ok { color: #FF9F0A !important; }
.nota-low { color: #FF453A !important; }
.boletin-footer { text-align: center; }
.boletin-generated { font-size: 11px; color: #636366; }

.bulletin-export-bar { display: flex; gap: 10px; padding: 16px 0 4px; }
.export-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; transition: background 0.15s, transform 0.1s; }
.export-btn:active { transform: scale(0.97); }
.export-pdf { background: rgba(255,69,58,0.12); color: #FF453A; }
.export-pdf:hover { background: rgba(255,69,58,0.2); }
.export-share { background: rgba(10,132,255,0.12); color: #0A84FF; }
.export-share:hover { background: rgba(10,132,255,0.2); }
</style>
