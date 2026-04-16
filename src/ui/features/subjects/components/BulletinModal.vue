<template>
  <Teleport to="body">
    <Transition name="bulletin-fade">
      <div v-if="modelValue" class="bulletin-overlay" :class="{ 'bulletin-overlay--fs': isFullscreen }" @click.self="!isFullscreen && $emit('update:modelValue', false)">
        <div class="bulletin-modal" :class="{ 'bulletin-modal--fs': isFullscreen }">
          <!-- Header -->
          <div class="bulletin-header">
            <div class="bulletin-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h2 class="bulletin-title">Generar Boletín</h2>
            <button class="bulletin-expand-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
              <svg v-if="!isFullscreen" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>
            </button>
            <button class="bulletin-close" @click="$emit('update:modelValue', false)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <!-- Student selector -->
          <div v-if="!selectedStudent && !showAllBulletins" class="bulletin-body">
            <div v-if="loadingStudents" class="bulletin-loading">
              <div class="spinner-bulletin" />
              <p>Cargando estudiantes…</p>
            </div>
            <template v-else>
              <button v-if="allStudents.length" class="view-all-btn" @click="selectAllStudents">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Ver boletín de todos ({{ allStudents.length }})
              </button>
              <div class="student-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input v-model="studentSearch" type="text" placeholder="Buscar estudiante..." />
              </div>
              <p class="student-hint">Selecciona un estudiante para generar su boletín</p>
              <ul v-if="filteredStudents.length" class="student-list">
                <li v-for="st in filteredStudents" :key="st.userId" class="student-item" @click="selectStudent(st)">
                  <div class="student-avatar-placeholder">{{ (st.fullName || st.username || '?')[0].toUpperCase() }}</div>
                  <div class="student-info">
                    <span class="student-name">{{ st.fullName || st.username || `Estudiante #${st.userId}` }}</span>
                    <span v-if="st.username" class="student-username">@{{ st.username }}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
                </li>
              </ul>
              <p v-else class="no-students">No se encontraron estudiantes</p>
            </template>
          </div>

          <!-- All students bulletin -->
          <div v-else-if="showAllBulletins" class="bulletin-body">
            <button class="back-to-list" @click="showAllBulletins = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
              Volver a la lista
            </button>

            <div v-if="loadingAllBulletins" class="bulletin-loading">
              <div class="spinner-bulletin" />
              <p>Generando boletines de todos los estudiantes…</p>
            </div>

            <template v-else>
              <div v-for="entry in allBulletinData" :key="entry.student.userId" class="bulletin-card bulletin-card--all">
                <div class="boletin-header-top">
                  <div class="boletin-logo-placeholder">
                    <img v-if="getInstitutionLogoUrl()" :src="getInstitutionLogoUrl()!" alt="Escudo" style="width:50px;height:auto" />
                    <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <div class="boletin-institution">
                    <span class="boletin-inst-name">{{ institutionName || 'CourseV' }}</span>
                    <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                    <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                  </div>
                </div>
                <div class="boletin-divider" />
                <div class="boletin-info-grid">
                  <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ courseName || '—' }}</span></div>
                  <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ entry.student.fullName || entry.student.username || '—' }}</span></div>
                  <div v-if="entry.student.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ entry.student.cedula }}</span></div>
                  <div class="boletin-info-row"><span class="boletin-label">PERIODO:</span><span class="boletin-value">{{ currentPeriod }}</span></div>
                </div>
                <div class="boletin-divider" />
                <table class="boletin-table">
                  <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                  <tbody>
                    <tr v-for="row in entry.rows" :key="row.subjectId">
                      <td class="td-modulo">{{ row.subjectName }}</td>
                      <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ row.notaDefinitiva.toFixed(1) }}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="boletin-promedio">
                  <span class="promedio-label">PROMEDIO GENERAL</span>
                  <span class="promedio-value" :class="notaClass(computePromedio(entry.rows))">{{ computePromedio(entry.rows).toFixed(1) }}</span>
                </div>
                <div class="boletin-divider" />
                <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
              </div>
            </template>

            <div v-if="!loadingAllBulletins && allBulletinData.length" class="bulletin-export-bar">
              <button class="export-btn export-pdf" @click="exportAllBulletinsPDF">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                PDF todos
              </button>
            </div>
          </div>

          <!-- Bulletin preview -->
          <div v-else class="bulletin-body">
            <button class="back-to-list" @click="selectedStudent = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
              Seleccionar otro estudiante
            </button>

            <div v-if="loadingBulletin" class="bulletin-loading">
              <div class="spinner-bulletin" />
              <p>Generando boletín…</p>
            </div>

            <div v-else ref="bulletinContent" class="bulletin-card">
              <!-- School header -->
              <div class="boletin-header-top">
                <div class="boletin-logo-placeholder">
                  <img v-if="getInstitutionLogoUrl()" :src="getInstitutionLogoUrl()!" alt="Escudo" style="width:50px;height:auto" />
                  <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <div class="boletin-institution">
                  <span class="boletin-inst-name">{{ institutionName || 'CourseV' }}</span>
                  <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                  <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                </div>
              </div>

              <div class="boletin-divider" />

              <!-- Student info -->
              <div class="boletin-info-grid">
                <div class="boletin-info-row">
                  <span class="boletin-label">PROGRAMA:</span>
                  <span class="boletin-value">{{ courseName || '—' }}</span>
                </div>
                <div class="boletin-info-row">
                  <span class="boletin-label">ESTUDIANTE:</span>
                  <span class="boletin-value">{{ selectedStudent?.fullName || selectedStudent?.username || '—' }}</span>
                </div>
                <div v-if="selectedStudent?.cedula" class="boletin-info-row">
                  <span class="boletin-label">IDENTIFICACIÓN:</span>
                  <span class="boletin-value">{{ selectedStudent?.cedula }}</span>
                </div>
                <div class="boletin-info-row">
                  <span class="boletin-label">PERIODO:</span>
                  <span class="boletin-value">{{ currentPeriod }}</span>
                </div>
              </div>

              <div class="boletin-divider" />

              <!-- Grades table -->
              <table class="boletin-table">
                <thead>
                  <tr>
                    <th class="th-modulo">MÓDULO</th>
                    <th class="th-nota">NOTA DEFINITIVA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in bulletinRows" :key="row.subjectId">
                    <td class="td-modulo">{{ row.subjectName }}</td>
                    <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ row.notaDefinitiva.toFixed(1) }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Average -->
              <div class="boletin-promedio">
                <span class="promedio-label">PROMEDIO GENERAL</span>
                <span class="promedio-value" :class="notaClass(promedioGeneral)">{{ promedioGeneral.toFixed(1) }}</span>
              </div>

              <div class="boletin-divider" />

              <!-- Footer -->
              <div class="boletin-footer">
                <p class="boletin-generated">Generado el {{ generatedDate }}</p>
              </div>
            </div>

            <!-- Export buttons -->
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
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet, GradeSheetStudent } from '@/infrastructure/api/gradeAdapter'
import { buildInstitutionHeaderHTML, getInstitutionDisplayName, getInstitutionLogoUrl, isIncatInstitution, institutionHeaderCSS } from '@/utils/institutionHeader'

interface BulletinSubject {
  id: number
  name: string
}

const props = defineProps<{
  modelValue: boolean
  courseId: number
  courseName?: string
  subjects: BulletinSubject[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isFullscreen = ref(false)
const institutionName = ref(getInstitutionDisplayName())
const loadingStudents = ref(false)
const loadingBulletin = ref(false)
const studentSearch = ref('')
const selectedStudent = ref<GradeSheetStudent | null>(null)

interface BulletinRow {
  subjectId: number
  subjectName: string
  notaDefinitiva: number
}

const allStudents = ref<GradeSheetStudent[]>([])
const bulletinRows = ref<BulletinRow[]>([])
const bulletinContent = ref<HTMLElement>()
const showAllBulletins = ref(false)
const loadingAllBulletins = ref(false)

interface AllBulletinEntry {
  student: GradeSheetStudent
  rows: BulletinRow[]
}
const allBulletinData = ref<AllBulletinEntry[]>([])

const filteredStudents = computed(() => {
  if (!studentSearch.value.trim()) return allStudents.value
  const q = studentSearch.value.toLowerCase()
  return allStudents.value.filter(s =>
    (s.fullName || '').toLowerCase().includes(q) ||
    (s.username || '').toLowerCase().includes(q) ||
    (s.cedula || '').toLowerCase().includes(q)
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
  const grades = bulletinRows.value.map(r => r.notaDefinitiva)
  if (!grades.length) return 0
  return grades.reduce((a, b) => a + b, 0) / grades.length
})

function computePromedio(rows: BulletinRow[]): number {
  if (!rows.length) return 0
  return rows.reduce((a, r) => a + r.notaDefinitiva, 0) / rows.length
}

function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }

function notaClass(grade: number | null): string {
  if (grade === null || isNaN(grade)) return ''
  if (grade >= 4) return 'nota-good'
  if (grade >= 3) return 'nota-ok'
  return 'nota-low'
}

watch(() => props.modelValue, async (open) => {
  if (open) {
    selectedStudent.value = null
    studentSearch.value = ''
    bulletinRows.value = []
    showAllBulletins.value = false
    allBulletinData.value = []
    await loadStudents()
  }
})

async function loadStudents() {
  if (!props.courseId || !props.subjects.length) return
  loadingStudents.value = true
  try {
    const studentMap = new Map<number, GradeSheetStudent>()
    await Promise.allSettled(
      props.subjects.map(s =>
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
      props.subjects.map(s =>
        gradeAdapter.getGradeSheet(s.id).then(sheet => {
          if (!sheet) {
            rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: 0 })
            return
          }
          const totalTasks = sheet.tasks.length
          const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
          const taskSum = stTaskGrades.reduce((sum, tg) => sum + (tg.grade ?? 0), 0)
          const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null

          const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
          // Detect which manual grade categories are active (used for any student in the subject)
          const activeCategories = new Set(sheet.manualGrades.map((mg: any) => String(mg.gradeType).replace(/_\d+$/, '')))
          const stManualGrades = sheet.manualGrades.filter((mg: any) => Number(mg.studentId) === student.userId)
          const byType: Record<string, number[]> = {}
          for (const mg of stManualGrades) {
            const base = String(mg.gradeType).replace(/_\d+$/, '')
            if (!byType[base]) byType[base] = []
            byType[base].push(Number(mg.grade))
          }
          // Treat empty slots as 0 when the category is active (used by any student in the subject)
          const participacionAvg = byType['participacion']?.length ? avgArr(byType['participacion']) : (activeCategories.has('participacion') ? 0 : null)
          const examenesAvg = byType['examenes']?.length ? avgArr(byType['examenes']) : (activeCategories.has('examenes') ? 0 : null)
          const comportamientoAvg = byType['comportamiento']?.length ? avgArr(byType['comportamiento']) : (activeCategories.has('comportamiento') ? 0 : null)

          const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
          const notaDefinitiva = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0

          rows.push({
            subjectId: s.id,
            subjectName: s.name,
            notaDefinitiva: Math.round(notaDefinitiva * 10) / 10,
          })
        }).catch(() => {
          rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: 0 })
        })
      )
    )
    // Sort by subject order
    const subjectOrder = new Map(props.subjects.map((s, i) => [s.id, i]))
    rows.sort((a, b) => (subjectOrder.get(a.subjectId) ?? 0) - (subjectOrder.get(b.subjectId) ?? 0))
    bulletinRows.value = rows
  } catch { /* silent */ }
  finally { loadingBulletin.value = false }
}

// ── Grade computation helper for a single student across all subjects ──
async function computeRowsForStudent(student: GradeSheetStudent, sheetsCache: Map<number, GradeSheet | null>): Promise<BulletinRow[]> {
  const rows: BulletinRow[] = []
  for (const s of props.subjects) {
    const sheet = sheetsCache.get(s.id) ?? null
    if (!sheet) {
      rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: 0 })
      continue
    }
    const totalTasks = sheet.tasks.length
    const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
    const taskSum = stTaskGrades.reduce((sum, tg) => sum + (tg.grade ?? 0), 0)
    const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null

    const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    const activeCategories = new Set(sheet.manualGrades.map((mg: any) => String(mg.gradeType).replace(/_\d+$/, '')))
    const stManualGrades = sheet.manualGrades.filter((mg: any) => Number(mg.studentId) === student.userId)
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
    const notaDefinitiva = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0

    rows.push({
      subjectId: s.id,
      subjectName: s.name,
      notaDefinitiva: Math.round(notaDefinitiva * 10) / 10,
    })
  }
  return rows
}

// ── Select all students: generate bulletins for everyone ──
async function selectAllStudents() {
  showAllBulletins.value = true
  loadingAllBulletins.value = true
  allBulletinData.value = []
  try {
    // Fetch all grade sheets once
    const sheetsCache = new Map<number, GradeSheet | null>()
    await Promise.allSettled(
      props.subjects.map(s =>
        gradeAdapter.getGradeSheet(s.id).then(sheet => {
          sheetsCache.set(s.id, sheet ?? null)
        }).catch(() => {
          sheetsCache.set(s.id, null)
        })
      )
    )

    const entries: AllBulletinEntry[] = []
    for (const student of allStudents.value) {
      const rows = await computeRowsForStudent(student, sheetsCache)
      entries.push({ student, rows })
    }
    allBulletinData.value = entries
  } catch { /* silent */ }
  finally { loadingAllBulletins.value = false }
}

function exportAllBulletinsPDF() {
  const pages: string[] = []
  for (const entry of allBulletinData.value) {
    const st = entry.student
    const name = escH(st.fullName || st.username || 'Estudiante')
    const prom = computePromedio(entry.rows)
    let rows = ''
    for (const row of entry.rows) {
      const nota = row.notaDefinitiva.toFixed(1)
      const color = row.notaDefinitiva >= 4 ? '#1A7F37' : row.notaDefinitiva >= 3 ? '#B45309' : '#B91C1C'
      rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
    }
    const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
    pages.push(`
<div class="page">
${buildInstitutionHeaderHTML(institutionName.value || 'CourseV')}
<div class="info">
<span class="label">Programa:</span><span class="value">${escH(props.courseName || '—')}</span>
<span class="label">Estudiante:</span><span class="value">${name}</span>
${st.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}
<span class="label">Periodo:</span><span class="value">${escH(currentPeriod.value)}</span>
</div>
<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>${rows}</tbody></table>
<div class="promedio"><span class="prom-label">Promedio General</span><span class="prom-value" style="color:${promColor}">${prom.toFixed(1)}</span></div>
<div class="footer">Generado el ${generatedDate.value}</div>
</div>`)
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletines - Todos</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;color:#222;max-width:700px;margin:0 auto}
.page{page-break-after:always;padding:20px 0 40px}
.page:last-child{page-break-after:avoid}
.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}
.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}
.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}
.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}
.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}
.value{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}
th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}
.td-mod{font-weight:600;text-transform:uppercase}
.td-nota{text-align:center;font-weight:700;font-size:15px}
.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}
.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}
.prom-value{font-size:20px;font-weight:800}
.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}
@media print{body{padding:0}.page{padding:10px 0 20px}}
</style></head><body>${pages.join('')}</body></html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportBulletinPDF() {
  const html = buildBulletinPrintHTML()
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

async function shareBulletin() {
  const text = buildShareText()
  if (navigator.share) {
    try { await navigator.share({ title: 'Boletín de Notas', text }) } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(text)
    alert('Boletín copiado al portapapeles')
  }
}

function buildShareText(): string {
  const st = selectedStudent.value
  const name = st?.fullName || st?.username || 'Estudiante'
  let text = `📋 BOLETÍN DE NOTAS\n`
  text += `📌 Programa: ${props.courseName || '—'}\n`
  text += `👤 Estudiante: ${name}\n`
  text += `📅 Periodo: ${currentPeriod.value}\n\n`
  text += `${'─'.repeat(32)}\n`
  text += `MÓDULO                    NOTA\n`
  text += `${'─'.repeat(32)}\n`
  for (const row of bulletinRows.value) {
    const nota = row.notaDefinitiva.toFixed(1)
    text += `${row.subjectName.padEnd(26)}${nota}\n`
  }
  text += `${'─'.repeat(32)}\n`
  const prom = promedioGeneral.value
  text += `PROMEDIO GENERAL           ${prom.toFixed(1)}\n`
  return text
}

function escH(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildBulletinPrintHTML(): string {
  const st = selectedStudent.value
  const name = escH(st?.fullName || st?.username || 'Estudiante')
  const prom = promedioGeneral.value

  let rows = ''
  for (const row of bulletinRows.value) {
    const nota = row.notaDefinitiva.toFixed(1)
    const color = row.notaDefinitiva >= 4 ? '#1A7F37' : row.notaDefinitiva >= 3 ? '#B45309' : '#B91C1C'
    rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
  }

  const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletín - ${name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#222;max-width:700px;margin:0 auto}
.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}
.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}
.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}
.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}
.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}
.value{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}
th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}
td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}
.td-mod{font-weight:600;text-transform:uppercase}
.td-nota{text-align:center;font-weight:700;font-size:15px}
.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}
.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}
.prom-value{font-size:20px;font-weight:800}
.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}
@media print{body{padding:20px}table{page-break-inside:avoid}}
${institutionHeaderCSS()}
</style></head><body>
${buildInstitutionHeaderHTML(institutionName.value || 'CourseV')}
<div class="info">
<span class="label">Programa:</span><span class="value">${escH(props.courseName || '—')}</span>
<span class="label">Estudiante:</span><span class="value">${name}</span>
${st?.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}
<span class="label">Periodo:</span><span class="value">${escH(currentPeriod.value)}</span>
</div>
<table>
<thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="promedio">
<span class="prom-label">Promedio General</span>
<span class="prom-value" style="color:${promColor}">${prom.toFixed(1)}</span>
</div>
<div class="footer">Generado el ${generatedDate.value}</div>
</body></html>`
}
</script>

<style scoped>
.bulletin-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  transition: padding 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bulletin-overlay--fs {
  padding: 0;
}

.bulletin-modal {
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  background: #1C1C1E;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: bulletin-slide-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: max-width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              max-height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-radius 0.35s ease,
              height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bulletin-modal--fs {
  max-width: 100% !important;
  max-height: 100vh !important;
  height: 100vh;
  border-radius: 0;
}

@keyframes bulletin-slide-up {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.bulletin-fade-enter-active { transition: opacity 0.2s; }
.bulletin-fade-leave-active { transition: opacity 0.15s; }
.bulletin-fade-enter-from, .bulletin-fade-leave-to { opacity: 0; }

.bulletin-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.bulletin-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(48, 209, 88, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bulletin-title {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.bulletin-expand-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}
.bulletin-expand-btn:hover { background: rgba(48, 209, 88, 0.15); transform: scale(1.1); }
.bulletin-expand-btn:active { transform: scale(0.92); }

.bulletin-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.bulletin-close:hover { background: rgba(255, 255, 255, 0.12); }

.bulletin-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.bulletin-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #8E8E93;
  font-size: 14px;
}

.spinner-bulletin {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(48, 209, 88, 0.2);
  border-top-color: #30D158;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Student selector */
.student-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.student-search input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
}
.student-search input::placeholder { color: #8E8E93; }

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(48, 209, 88, 0.15), rgba(48, 209, 88, 0.08));
  border: 1px solid rgba(48, 209, 88, 0.3);
  color: #30D158;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s, transform 0.15s;
}
.view-all-btn:hover {
  background: linear-gradient(135deg, rgba(48, 209, 88, 0.25), rgba(48, 209, 88, 0.15));
  transform: scale(1.01);
}
.view-all-btn:active { transform: scale(0.98); }

.bulletin-card--all {
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.student-hint {
  font-size: 12px;
  color: #8E8E93;
  margin-bottom: 12px;
}

.student-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.student-item:hover { background: rgba(255, 255, 255, 0.06); }

.student-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-username {
  font-size: 12px;
  color: #8E8E93;
}

.no-students {
  text-align: center;
  color: #636366;
  font-size: 14px;
  padding: 24px 0;
}

/* Back button */
.back-to-list {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #0A84FF;
  margin-bottom: 16px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
}
.back-to-list:hover { text-decoration: underline; }

/* Bulletin card */
.bulletin-card {
  background: #2C2C2E;
  border-radius: 16px;
  padding: 24px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.boletin-header-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.boletin-logo-placeholder {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(106, 27, 154, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.boletin-institution {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.boletin-inst-name {
  font-size: 17px;
  font-weight: 800;
  color: #BF5AF2;
  letter-spacing: 0.3px;
}

.boletin-inst-subtitle {
  font-size: 11px;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.boletin-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0;
}

.boletin-info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.boletin-info-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.boletin-label {
  font-size: 11px;
  font-weight: 700;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 110px;
}

.boletin-value {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

/* Grades table */
.boletin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 4px;
  border-radius: 8px;
  overflow: hidden;
}

.boletin-table thead tr {
  background: rgba(106, 27, 154, 0.3);
}

.boletin-table th {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #BF5AF2;
}

.th-modulo { text-align: left; }
.th-nota { text-align: center; }

.boletin-table td {
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.td-modulo {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.td-nota {
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #ccc;
}

.boletin-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.boletin-table tbody tr:last-child td { border-bottom: none; }

/* Promedio */
.boletin-promedio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(106, 27, 154, 0.12);
  border-radius: 12px;
  margin-top: 16px;
}

.promedio-label {
  font-size: 12px;
  font-weight: 700;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promedio-value {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}

/* Grade colors */
.nota-good { color: #30D158 !important; }
.nota-ok { color: #FF9F0A !important; }
.nota-low { color: #FF453A !important; }

/* Footer */
.boletin-footer {
  text-align: center;
}

.boletin-generated {
  font-size: 11px;
  color: #636366;
}

/* Export bar */
.bulletin-export-bar {
  display: flex;
  gap: 10px;
  padding: 16px 0 4px;
}

.export-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s, transform 0.1s;
}
.export-btn:active { transform: scale(0.97); }

.export-pdf {
  background: rgba(255, 69, 58, 0.12);
  color: #FF453A;
}
.export-pdf:hover { background: rgba(255, 69, 58, 0.2); }

.export-share {
  background: rgba(10, 132, 255, 0.12);
  color: #0A84FF;
}
.export-share:hover { background: rgba(10, 132, 255, 0.2); }
</style>
