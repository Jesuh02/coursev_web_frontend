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
            <!-- INCAT Institution Header -->
            <div v-if="isIncatInstitution()" class="inst-header-inline">
              <div class="inst-header-logo">
                <img src="https://pub-9f393625246c4018b5613be60b01bda1.r2.dev/incat.jpg" alt="Escudo INCAT" crossorigin="anonymous" />
              </div>
              <div class="inst-header-text">
                <div class="inst-header-name">POLITECNICO INSTITUCIONAL DEL CARIBE &quot;INCAT&quot;</div>
                <div class="inst-header-line">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M</div>
                <div class="inst-header-line">Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.</div>
                <div class="inst-header-line inst-header-bold">Institución Educativa De Formación para el trabajo y el desarrollo humano</div>
                <div class="inst-header-nit">NIT: 900391687-0</div>
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
            <!-- Signature & footer (INCAT only) -->
            <div v-if="isIncatInstitution()" class="incat-signature-footer">
              <div class="incat-sig-block">
                <div class="incat-sig-line"></div>
                <p class="incat-sig-name">AQUILES AMAYA IGUARAN</p>
                <p class="incat-sig-title">RECTOR</p>
              </div>
              <div class="incat-footer-info">
                <p class="incat-footer-slogan"><em>Politécnico &quot;INCAT&quot;, forjando líderes para triunfar!</em></p>
                <p class="incat-footer-addr">SEDE PRINCIPAL CALLE 11ª # 11-85 &nbsp; TEL. 3106357993-3156824740</p>
                <p class="incat-footer-email">E-mail: politecnicoincat@gmail.com</p>
                <p class="incat-footer-city">RIOHACHA- LA GUAJIRA</p>
              </div>
            </div>

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
                  <span class="subject-avg" :class="gradeClass(group.average)">{{ (group.average ?? 0).toFixed(1) }}</span>
                </div>

                <!-- Promedios por estudiante (solo si hay periodo activo) -->
                <div v-if="group.hasActivePeriod && group.gradeSummaries.length" class="breakdown-section">
                  <div class="breakdown-label period-label">
                    📅 {{ (periodsBySubject[group.subjectId] ?? []).find(p => !p.snapshot)?.name ?? 'Periodo activo' }}
                  </div>
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
                          <th class="th-grader">Docente</th>
                          <th class="th-date">Fecha Cal.</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in group.gradeSummaries" :key="row.studentId" class="grade-row">
                          <td class="cell-student">{{ row.studentName }}</td>
                          <td class="cell-grade" :class="gradeClass(row.taskAvg)">{{ (row.taskAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.participacionAvg)">{{ (row.participacionAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.examenesAvg)">{{ (row.examenesAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.comportamientoAvg)">{{ (row.comportamientoAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-ponderada" :class="gradeClass(row.notaPonderada)"><strong>{{ (row.notaPonderada ?? 0).toFixed(1) }}</strong></td>
                          <td class="cell-grader">{{ row.gradedBy ?? '—' }}</td>
                          <td class="cell-date">{{ formatGradedAt(row.gradedAt) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <!-- Sin periodo activo pero con periodos cerrados: mostrar último periodo -->
                <div v-else-if="!group.hasActivePeriod && getLatestClosedPeriod(group.subjectId)" class="breakdown-section">
                  <div class="breakdown-label period-label">
                    📅 {{ getLatestClosedPeriod(group.subjectId)!.name }} (último periodo cerrado)
                  </div>
                  <div class="table-wrapper">
                    <table class="grade-table">
                      <thead>
                        <tr>
                          <th class="th-student">Estudiante</th>
                          <th class="th-grade">Comportamiento</th>
                          <th class="th-grade">Tareas</th>
                          <th class="th-grade">Examen</th>
                          <th class="th-grade">Participación</th>
                          <th class="th-ponderada">Nota Final</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="row in computePeriodSummaries(getLatestClosedPeriod(group.subjectId)!.snapshot)" :key="row.studentId" class="grade-row">
                          <td class="cell-student">{{ row.studentName }}</td>
                          <td class="cell-grade" :class="gradeClass(row.comportamientoAvg)">{{ (row.comportamientoAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.taskAvg)">{{ (row.taskAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.examenesAvg)">{{ (row.examenesAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-grade" :class="gradeClass(row.participacionAvg)">{{ (row.participacionAvg ?? 0).toFixed(1) }}</td>
                          <td class="cell-ponderada" :class="gradeClass(row.notaPonderada)"><strong>{{ (row.notaPonderada ?? 0).toFixed(1) }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else-if="!group.hasActivePeriod" class="no-active-period-msg">
                  📅 No hay periodos registrados — inicia un periodo para ver las notas.
                </div>
                <div v-else class="no-tasks">Sin entregas</div>

                <!-- Periodos -->
                <div class="periods-section">
                  <div class="periods-header" @click="togglePeriodsSection(group.subjectId)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: expandedPeriodSections.has(`periods-${group.subjectId}`) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"><polyline points="9 18 15 12 9 6"/></svg>
                    <span class="periods-title">Periodos</span>
                    <span v-if="(periodsBySubject[group.subjectId] ?? []).length" class="periods-badge">{{ (periodsBySubject[group.subjectId] ?? []).length }}</span>
                    <button class="close-period-btn" @click.stop="handleClosePeriod(group.subjectId, group.subjectName)" :disabled="closingPeriod">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      Cerrar Periodo
                    </button>
                  </div>
                  <div v-if="expandedPeriodSections.has(`periods-${group.subjectId}`)" class="periods-list">
                    <div v-if="!(periodsBySubject[group.subjectId] ?? []).length" class="no-periods">No hay periodos creados</div>
                    <div v-for="period in (periodsBySubject[group.subjectId] ?? [])" :key="period.id" class="period-item">
                      <div class="period-item-header" @click="togglePeriodExpand(period.id)">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="{ transform: expandedPeriods.has(period.id) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"><polyline points="9 18 15 12 9 6"/></svg>
                        <span class="period-name">{{ period.name }}</span>
                        <span class="period-date">{{ formatPeriodDate(period.closedAt) }}</span>
                        <span v-if="period.startsAt || period.endsAt" class="period-date-range">
                          {{ period.startsAt ? formatPeriodDate(period.startsAt) : '—' }} → {{ period.endsAt ? formatPeriodDate(period.endsAt) : '—' }}
                        </span>
                        <button v-if="editingPeriodId !== period.id" class="period-edit-btn" @click.stop="startEditingPeriod(period)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                        <button v-else class="period-cancel-btn" @click.stop="cancelEditingPeriod()">Cancelar</button>
                        <button class="period-delete-btn" @click.stop="confirmDeletePeriod(period)" :disabled="deletingPeriod">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                      <div v-if="expandedPeriods.has(period.id)" class="period-snapshot">
                        <div v-if="computePeriodSummaries(period.snapshot).length" class="breakdown-section">
                          <div class="breakdown-label">Notas del periodo</div>
                          <div class="table-wrapper">
                            <table class="grade-table">
                              <thead>
                                <tr>
                                  <th class="th-student">Estudiante</th>
                                  <th class="th-grade">Comportamiento</th>
                                  <th class="th-grade">Tareas</th>
                                  <th class="th-grade">Examen</th>
                                  <th class="th-grade">Participación</th>
                                  <th class="th-ponderada">Nota Final</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="row in computePeriodSummaries(period.snapshot)" :key="row.studentId" class="grade-row">
                                  <td class="cell-student">{{ row.studentName }}</td>
                                  <template v-if="editingPeriodId === period.id">
                                    <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentName, 'comportamiento')" @input="updatePeriodEdit(row.studentName, 'comportamiento', $event)" /></td>
                                    <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentName, 'tareas')" @input="updatePeriodEdit(row.studentName, 'tareas', $event)" /></td>
                                    <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentName, 'examenes')" @input="updatePeriodEdit(row.studentName, 'examenes', $event)" /></td>
                                    <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentName, 'participacion')" @input="updatePeriodEdit(row.studentName, 'participacion', $event)" /></td>
                                    <td class="cell-ponderada" :class="gradeClass(computeEditedNotaPonderada(row.studentName))"><strong>{{ computeEditedNotaPonderada(row.studentName).toFixed(1) }}</strong></td>
                                  </template>
                                  <template v-else>
                                    <td class="cell-grade" :class="gradeClass(row.comportamientoAvg)">{{ (row.comportamientoAvg ?? 0).toFixed(1) }}</td>
                                    <td class="cell-grade" :class="gradeClass(row.taskAvg)">{{ (row.taskAvg ?? 0).toFixed(1) }}</td>
                                    <td class="cell-grade" :class="gradeClass(row.examenesAvg)">{{ (row.examenesAvg ?? 0).toFixed(1) }}</td>
                                    <td class="cell-grade" :class="gradeClass(row.participacionAvg)">{{ (row.participacionAvg ?? 0).toFixed(1) }}</td>
                                    <td class="cell-ponderada" :class="gradeClass(row.notaPonderada)"><strong>{{ (row.notaPonderada ?? 0).toFixed(1) }}</strong></td>
                                  </template>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div v-if="editingPeriodId === period.id" class="period-save-bar">
                            <button class="period-save-btn" @click.stop="savePeriodGrades(period)" :disabled="savingPeriodGrades">
                              {{ savingPeriodGrades ? 'Guardando...' : 'Guardar cambios' }}
                            </button>
                          </div>
                        </div>
                        <div v-else class="no-tasks">Sin notas en este periodo</div>
                      </div>
                    </div>
                  </div>
                </div>
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
    <!-- Delete period confirmation -->
    <Transition name="report-fade">
      <div v-if="deletePeriodConfirm.show" class="report-overlay" style="z-index:1010" @click.self="deletePeriodConfirm.show = false">
        <div class="delete-period-dialog">
          <div style="font-size:32px;text-align:center">📅</div>
          <h3 style="color:#fff;font-size:16px;font-weight:700;margin:8px 0 4px;text-align:center">¿Eliminar este periodo?</h3>
          <p style="color:#8E8E93;font-size:13px;text-align:center;line-height:1.5;margin:0 0 16px">Se eliminará permanentemente el periodo <strong style="color:#FF453A">{{ deletePeriodConfirm.name }}</strong> y todas sus notas guardadas.</p>
          <div style="display:flex;gap:10px;justify-content:center">
            <button class="period-cancel-btn" @click="deletePeriodConfirm.show = false" style="padding:8px 18px">Cancelar</button>
            <button class="period-delete-btn" @click="executeDeletePeriod" style="padding:8px 18px;font-size:13px;background:rgba(255,69,58,0.15);color:#FF453A;border:1px solid rgba(255,69,58,0.3);border-radius:10px">Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, reactive } from 'vue'
import type ExcelJS from 'exceljs'
import type { Subject } from '@/domain/models'
import { taskAdapter, topicAdapter } from '@/infrastructure/api'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { userAdapter } from '@/infrastructure/api/userAdapter'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet } from '@/infrastructure/api/gradeAdapter'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'
import { useAuthStore } from '@/stores/authStore'
import { buildInstitutionHeaderHTML, institutionHeaderCSS, isIncatInstitution, buildInstitutionSignatureAndFooterHTML, institutionSignatureAndFooterCSS, getInstitutionFooterLines } from '@/utils/institutionHeader'

const props = defineProps<{
  modelValue: boolean
  courseId: number
  courseName?: string
  subjects: Subject[]
}>()

defineEmits<{ 'update:modelValue': [value: boolean] }>()

const authStore = useAuthStore()

interface SubmissionRow {
  studentKey: string
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
  gradedBy: string | null
  gradedAt: string | null
}

interface SubjectReport {
  subjectId: number
  subjectName: string
  teacherName: string
  rows: SubmissionRow[]
  average: number | null
  studentAverages: Record<string, number>  // calificacion_ponderada por estudiante
  gradeSummaries: GradeSummaryRow[]
  hasActivePeriod: boolean
}

const loading = ref(false)
const reportData = ref<SubjectReport[]>([])
const isFullscreen = ref(false)
const selectedSubjectId = ref<number | null>(null)

// ── Periods ──
const periodsBySubject = ref<Record<number, GradePeriod[]>>({})
const expandedPeriodSections = ref(new Set<string>())
const expandedPeriods = ref(new Set<number>())
const closingPeriod = ref(false)
const editingPeriodId = ref<number | null>(null)
const periodEditData = ref<Record<string, Record<string, number>>>({})
const savingPeriodGrades = ref(false)
const deletingPeriod = ref(false)
const deletePeriodConfirm = reactive({ show: false, id: 0, name: '', subjectId: 0 })

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
    periodsBySubject.value = {}
    expandedPeriodSections.value = new Set()
    expandedPeriods.value = new Set()
    editingPeriodId.value = null
    periodEditData.value = {}
  }
})

const totalSubmissions = computed(() => reportData.value.reduce((sum, g) => sum + g.rows.length, 0))
const gradedCount = computed(() => reportData.value.reduce((sum, g) => sum + g.rows.filter(r => r.grade !== null).length, 0))
const averageGrade = computed(() => {
  const graded = reportData.value.flatMap(g => g.rows).filter(r => r.grade !== null)
  if (!graded.length) return '0.0'
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

function normalizePersonName(name: string | null | undefined): string | null {
  const normalized = name?.trim()
  return normalized ? normalized : null
}

function displayStudentName(name: string | null | undefined): string {
  return normalizePersonName(name) ?? 'Sin nombre registrado'
}

function resolveSubmissionStudentKey(sub: any): string {
  const username = sub.studentUsername ?? sub.student_username
  if (typeof username === 'string' && username.trim()) return `username:${username.trim()}`

  const studentId = sub.student_id ?? sub.studentId
  if (studentId != null && studentId !== '') return `id:${studentId}`

  const fullName = normalizePersonName(sub.studentFullName)
  if (fullName) return `name:${fullName.toLowerCase()}`

  return `unknown:${sub.id ?? sub.task_id ?? sub.taskId ?? Math.random().toString(36).slice(2)}`
}

function computeSubjectGradeSummaries(sheet: GradeSheet, taskNames: string[], teacherName: string): GradeSummaryRow[] {
  const totalTasks = taskNames.length
  const fmt = (v: number | null): number | null => v !== null ? Math.round(v * 10) / 10 : null
  const avgArr = (arr: number[]): number | null => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  // Detect which manual grade categories are active (used for at least one student in this subject)
  const activeCategories = new Set(sheet.manualGrades.map(mg => String(mg.gradeType).replace(/_\d+$/, '')))
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
    // Treat empty slots as 0 when the category is active (used by any student in the subject)
    const participacionAvg = byType['participacion']?.length ? avgArr(byType['participacion']) : (activeCategories.has('participacion') ? 0 : null)
    const examenesAvg = byType['examenes']?.length ? avgArr(byType['examenes']) : (activeCategories.has('examenes') ? 0 : null)
    const comportamientoAvg = byType['comportamiento']?.length ? avgArr(byType['comportamiento']) : (activeCategories.has('comportamiento') ? 0 : null)
    const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
    const notaPonderada = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    const latestGradedAt = stTaskGrades.map(tg => tg.gradedAt).filter((d): d is string => d != null).sort().at(-1) ?? null
    return {
      studentName: displayStudentName(student.fullName),
      studentId: student.userId,
      taskAvg: fmt(taskAvg),
      participacionAvg: fmt(participacionAvg),
      examenesAvg: fmt(examenesAvg),
      comportamientoAvg: fmt(comportamientoAvg),
      notaPonderada: fmt(notaPonderada),
      gradedBy: teacherName,
      gradedAt: latestGradedAt,
    }
  })
}

function formatGradedAt(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
    // Map subjectId → taskName → Set of submitted student keys
    const submittedBySubjectTask = new Map<number, Map<string, Set<string>>>()
    // Map subjectId → list of task names
    const subjectTaskNames = new Map<number, string[]>()
    // All known students keyed by a stable identifier
    const knownStudents = new Set<string>()
    const studentPersonaMap = new Map<string, { fullName: string | null, cedula: string | null }>()

    for (const sub of (submissions as any[])) {
      const taskId = sub.task_id ?? sub.taskId
      const task = taskMap.get(taskId)
      if (!task) continue
      const topicId = task.topicId ?? task.topic_id
      const subjectId = topicSubjectMap.get(topicId)
      if (!subjectId) continue

      const studentKey = resolveSubmissionStudentKey(sub)
      const studentName = displayStudentName(sub.studentFullName)
      const taskName = sub.taskName ?? task.title ?? task.name ?? 'Sin título'
      knownStudents.add(studentKey)

      // Track persona data for this student
      if (!studentPersonaMap.has(studentKey)) {
        studentPersonaMap.set(studentKey, {
          fullName: normalizePersonName(sub.studentFullName),
          cedula: sub.studentCedula ?? null,
        })
      }

      if (!subjectRowsMap.has(subjectId)) subjectRowsMap.set(subjectId, [])
      subjectRowsMap.get(subjectId)!.push({
        studentKey,
        studentName,
        studentFullName: normalizePersonName(sub.studentFullName),
        studentCedula: sub.studentCedula ?? null,
        taskName,
        grade: sub.grade ?? null,
        submissionDate: sub.submission_date ?? sub.submissionDate ?? null,
        feedback: sub.feedback ?? null,
        gradedByUsername: sub.gradedByUsername ?? null,
      })

      // Track submitted (subjectId, taskName, studentKey)
      if (!submittedBySubjectTask.has(subjectId)) submittedBySubjectTask.set(subjectId, new Map())
      const taskMap2 = submittedBySubjectTask.get(subjectId)!
      if (!taskMap2.has(taskName)) taskMap2.set(taskName, new Set())
      taskMap2.get(taskName)!.add(studentKey)
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
        for (const studentKey of knownStudents) {
          if (!submitters.has(studentKey)) {
            const persona = studentPersonaMap.get(studentKey) ?? { fullName: null, cedula: null }
            rows.push({
              studentKey,
              studentName: displayStudentName(persona.fullName),
              studentFullName: persona.fullName,
              studentCedula: persona.cedula,
              taskName,
              grade: 0,
              submissionDate: null,
              feedback: null,
              gradedByUsername: null,
              notSubmitted: true,
            })
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
        const prev = studentGradeSum.get(row.studentKey) ?? 0
        studentGradeSum.set(row.studentKey, prev + (row.grade ?? 0))
      }
      const studentAverages: Record<string, number> = {}
      for (const [studentKey, sum] of studentGradeSum) {
        studentAverages[studentKey] = parseFloat((sum / totalTasks).toFixed(1))
      }

      const graded = rows.filter(r => r.grade !== null && !r.notSubmitted)
      const avg = graded.length ? graded.reduce((s, r) => s + r.grade!, 0) / graded.length : null

      const teacherName = subject.createdBy != null
        ? teacherMap.get(subject.createdBy) ?? `Docente #${subject.createdBy}`
        : '—'

      const sheet = gradeSheetMap.get(subject.id)
      const gradeSummaries = sheet
        ? computeSubjectGradeSummaries(sheet, subjectTaskNames.get(subject.id) ?? [], teacherName)
        : []

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        teacherName,
        rows,
        average: avg != null ? parseFloat(avg.toFixed(1)) : 0,
        studentAverages,
        gradeSummaries,
        hasActivePeriod: sheet?.hasActivePeriod ?? true,
      }
    })

    // Load periods for each subject
    const subjectIds = props.subjects.map(s => s.id)
    if (subjectIds.length) {
      const periodsResults = await Promise.allSettled(
        subjectIds.map(sid => periodAdapter.listBySubject(sid))
      )
      for (let i = 0; i < subjectIds.length; i++) {
        const result = periodsResults[i]
        if (result.status === 'fulfilled') {
          periodsBySubject.value[subjectIds[i]] = result.value as GradePeriod[]
        }
      }
    }
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
    { width: 26 }, // Materia
    { width: 22 }, // Docente
    { width: 26 }, // Estudiante
    { width: 14 }, // Comportamiento
    { width: 12 }, // Tareas
    { width: 12 }, // Examen
    { width: 14 }, // Participación
    { width: 14 }, // Nota Ponderada
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

  function gradeFont(grade: number | null): Partial<ExcelJS.Font> {
    if (grade !== null && grade < 3) return { bold: true, color: { argb: 'FFB91C1C' }, name: 'Calibri' }
    if (grade !== null && grade >= 4) return { bold: true, color: { argb: 'FF1A7F37' }, name: 'Calibri' }
    if (grade !== null) return { bold: true, color: { argb: 'FFB45309' }, name: 'Calibri' }
    return { color: { argb: 'FF999999' }, name: 'Calibri' }
  }

  // INCAT institution header rows
  if (isIncatInstitution()) {
    const incatTitle = ws.addRow(['POLITECNICO INSTITUCIONAL DEL CARIBE "INCAT"'])
    ws.mergeCells(incatTitle.number, 1, incatTitle.number, 8)
    incatTitle.getCell(1).font = { bold: true, color: { argb: 'FF8B0000' }, size: 14, name: 'Calibri' }
    incatTitle.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    incatTitle.height = 22
    const lic1 = ws.addRow(['Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M'])
    ws.mergeCells(lic1.number, 1, lic1.number, 8)
    lic1.getCell(1).font = { size: 9, name: 'Calibri', color: { argb: 'FF333333' } }
    lic1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    const lic2 = ws.addRow(['Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.'])
    ws.mergeCells(lic2.number, 1, lic2.number, 8)
    lic2.getCell(1).font = { size: 9, name: 'Calibri', color: { argb: 'FF333333' } }
    lic2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    const instDesc = ws.addRow(['Institución Educativa De Formación para el trabajo y el desarrollo humano'])
    ws.mergeCells(instDesc.number, 1, instDesc.number, 8)
    instDesc.getCell(1).font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF333333' } }
    instDesc.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    const nit = ws.addRow(['NIT: 900391687-0'])
    ws.mergeCells(nit.number, 1, nit.number, 8)
    nit.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: 'FF8B0000' } }
    nit.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    ws.addRow([]) // blank separator row
  }

  // Header row
  const hdrRow = ws.addRow(['Materia', 'Docente', 'Estudiante', 'Comportamiento', 'Tareas', 'Examen', 'Participación', 'Nota Ponderada'])
  hdrRow.eachCell((cell: ExcelJS.Cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' }
    cell.fill = hdrFill
    cell.border = thinBorder
    cell.alignment = { vertical: 'middle', wrapText: true }
  })
  for (let c = 4; c <= 8; c++) hdrRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' }
  hdrRow.height = 18

  for (const group of filteredReportData.value) {
    const avg = group.average !== null ? group.average : 0
    const activePeriod = (periodsBySubject.value[group.subjectId] ?? []).find(p => !p.snapshot)
    const periodLabel = activePeriod ? ` — ${activePeriod.name}` : (group.hasActivePeriod ? '' : ' — Sin periodo activo')
    const grpRow = ws.addRow([`${group.subjectName}${periodLabel} — Docente: ${group.teacherName} — Promedio: ${avg}`])
    ws.mergeCells(grpRow.number, 1, grpRow.number, 8)
    grpRow.getCell(1).font = { bold: true, color: { argb: 'FF4A0E8F' }, size: 11, name: 'Calibri' }
    grpRow.getCell(1).fill = grpHdrFill
    grpRow.getCell(1).border = thinBorder
    grpRow.height = 20

    if (!group.hasActivePeriod) {
      const noperiodRow = ws.addRow(['⚠️ Sin periodo activo — inicia un periodo para registrar notas'])
      ws.mergeCells(noperiodRow.number, 1, noperiodRow.number, 8)
      noperiodRow.getCell(1).font = { italic: true, color: { argb: 'FFB45309' }, name: 'Calibri' }
      continue
    }

    if (!group.gradeSummaries.length) {
      const emptyRow = ws.addRow(['Sin datos disponibles'])
      ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
      emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
      continue
    }

    group.gradeSummaries.forEach((row, i) => {
      const dataRow = ws.addRow([
        group.subjectName,
        group.teacherName,
        row.studentName,
        row.comportamientoAvg ?? 0,
        row.taskAvg ?? 0,
        row.examenesAvg ?? 0,
        row.participacionAvg ?? 0,
        row.notaPonderada ?? 0,
      ])
      const rowFill = i % 2 === 0 ? row0Fill : row1Fill
      dataRow.eachCell((cell: ExcelJS.Cell) => {
        cell.fill = rowFill
        cell.border = thinBorder
        cell.font = { name: 'Calibri' }
        cell.alignment = { vertical: 'middle', wrapText: true }
      })
      for (let c = 4; c <= 8; c++) {
        const val = dataRow.getCell(c).value
        const grade = typeof val === 'number' ? val : null
        dataRow.getCell(c).font = gradeFont(grade)
        dataRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' }
      }
      dataRow.height = 16
    })
  }

  // Footer rows: signature + institution footer
  const footerLines = getInstitutionFooterLines()
  if (footerLines.length) {
    ws.addRow([]) // blank separator
    const sigRow = ws.addRow([footerLines[1]]) // 'AQUILES AMAYA IGUARAN — RECTOR'
    ws.mergeCells(sigRow.number, 1, sigRow.number, 8)
    sigRow.getCell(1).font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF222222' } }
    sigRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }
    ws.addRow([])
    for (const line of footerLines.slice(3)) {
      const fRow = ws.addRow([line])
      ws.mergeCells(fRow.number, 1, fRow.number, 8)
      const isSlogan = line.includes('forjando')
      const isEmail = line.includes('@')
      fRow.getCell(1).font = {
        italic: isSlogan,
        bold: !isSlogan,
        color: { argb: (isSlogan || isEmail) ? 'FF8B0000' : 'FF222222' },
        size: 9,
        name: 'Calibri',
      }
      fRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
    }
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

// ── Period helpers ────────────────────────────────────────────────────────
function togglePeriodsSection(subjectId: number) {
  const key = `periods-${subjectId}`
  const next = new Set(expandedPeriodSections.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedPeriodSections.value = next
}

function getLatestClosedPeriod(subjectId: number): GradePeriod | null {
  const periods = periodsBySubject.value[subjectId] ?? []
  const closed = periods.filter(p => p.snapshot != null)
  if (!closed.length) return null
  return closed.sort((a, b) => new Date(b.closedAt ?? 0).getTime() - new Date(a.closedAt ?? 0).getTime())[0]
}

function togglePeriodExpand(periodId: number) {
  const next = new Set(expandedPeriods.value)
  if (next.has(periodId)) next.delete(periodId)
  else next.add(periodId)
  expandedPeriods.value = next
}

async function handleClosePeriod(subjectId: number, subjectName: string) {
  const existingCount = (periodsBySubject.value[subjectId] ?? []).length
  const defaultName = `Periodo ${existingCount + 1}`
  const name = prompt(`Nombre del periodo para "${subjectName}":`, defaultName)
  if (!name) return

  closingPeriod.value = true
  try {
    await periodAdapter.closePeriod({ courseId: props.courseId, subjectId, name })
    const periods = await periodAdapter.listBySubject(subjectId)
    periodsBySubject.value = { ...periodsBySubject.value, [subjectId]: periods as GradePeriod[] }
    expandedPeriodSections.value = new Set([...expandedPeriodSections.value, `periods-${subjectId}`])
    // Refresh the grade sheet for this subject (now empty after close)
    try {
      const sheet = await gradeAdapter.getGradeSheet(subjectId)
      const group = reportData.value.find(g => g.subjectId === subjectId)
      if (group && sheet) {
        const taskNames = sheet.tasks.map((t: any) => t.title ?? t.name ?? '')
        group.gradeSummaries = computeSubjectGradeSummaries(sheet, taskNames, group.teacherName)
        reportData.value = [...reportData.value]
      }
    } catch { /* ignore */ }
  } catch (e: any) {
    alert('Error al cerrar periodo: ' + (e?.message ?? String(e)))
  } finally {
    closingPeriod.value = false
  }
}

function computePeriodSummaries(snapshot: GradeSheet | null): GradeSummaryRow[] {
  if (!snapshot) return []
  const totalTasks = snapshot.tasks?.length ?? 0
  const fmt = (v: number | null): number | null => v !== null ? Math.round(v * 10) / 10 : null
  const avgArr = (arr: number[]): number | null => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const activeCategories = new Set((snapshot.manualGrades ?? []).map((mg: any) => String(mg.gradeType).replace(/_\d+$/, '')))
  return (snapshot.students ?? []).map((student: any) => {
    const stTaskGrades = (snapshot.taskGrades ?? []).filter((tg: any) => Number(tg.studentId) === student.userId)
    const taskSum = stTaskGrades.reduce((s: number, tg: any) => s + (tg.grade ?? 0), 0)
    const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null
    const stManualGrades = (snapshot.manualGrades ?? []).filter((mg: any) => Number(mg.studentId) === student.userId)
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
    const notaPonderada = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return {
      studentName: displayStudentName(student.fullName),
      studentId: student.userId,
      taskAvg: fmt(taskAvg),
      participacionAvg: fmt(participacionAvg),
      examenesAvg: fmt(examenesAvg),
      comportamientoAvg: fmt(comportamientoAvg),
      notaPonderada: fmt(notaPonderada),
      gradedBy: null,
      gradedAt: null,
    }
  })
}

function formatPeriodDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' })
}

function startEditingPeriod(period: GradePeriod) {
  editingPeriodId.value = period.id
  const summaries = computePeriodSummaries(period.snapshot)
  const data: Record<string, Record<string, number>> = {}
  for (const row of summaries) {
    data[row.studentName] = {
      comportamiento: row.comportamientoAvg ?? 0,
      tareas: row.taskAvg ?? 0,
      examenes: row.examenesAvg ?? 0,
      participacion: row.participacionAvg ?? 0,
    }
  }
  periodEditData.value = data
  if (!expandedPeriods.value.has(period.id)) {
    expandedPeriods.value = new Set([...expandedPeriods.value, period.id])
  }
}

function cancelEditingPeriod() {
  editingPeriodId.value = null
  periodEditData.value = {}
}

function getPeriodEditValue(studentName: string, field: string): number {
  return periodEditData.value[studentName]?.[field] ?? 0
}

function updatePeriodEdit(studentName: string, field: string, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value) || 0
  const clamped = Math.min(10, Math.max(0, val))
  if (!periodEditData.value[studentName]) {
    periodEditData.value[studentName] = { comportamiento: 0, tareas: 0, examenes: 0, participacion: 0 }
  }
  periodEditData.value[studentName][field] = clamped
}

function computeEditedNotaPonderada(studentName: string): number {
  const data = periodEditData.value[studentName]
  if (!data) return 0
  const vals = [data.comportamiento, data.tareas, data.examenes, data.participacion].filter(v => v != null)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

async function savePeriodGrades(period: GradePeriod) {
  savingPeriodGrades.value = true
  try {
    const snapshot = period.snapshot
    if (!snapshot) return
    const newManualGrades: any[] = []
    for (const [studentName, grades] of Object.entries(periodEditData.value)) {
      const student = (snapshot.students ?? []).find((s: any) => displayStudentName(s.fullName) === studentName)
      if (!student) continue
      const sid = student.userId
      for (const [field, value] of Object.entries(grades)) {
        if (field === 'tareas') continue
        newManualGrades.push({ studentId: sid, gradeType: field, grade: Math.round(value * 10) / 10 })
      }
    }
    let newTaskGrades = JSON.parse(JSON.stringify(snapshot.taskGrades || []))
    for (const [studentName, grades] of Object.entries(periodEditData.value)) {
      const student = (snapshot.students ?? []).find((s: any) => displayStudentName(s.fullName) === studentName)
      if (!student) continue
      const sid = student.userId
      const editedTaskAvg = grades.tareas ?? 0
      const studentTasks = newTaskGrades.filter((tg: any) => Number(tg.studentId) === sid)
      if (studentTasks.length > 0) {
        for (const tg of studentTasks) { tg.grade = Math.round(editedTaskAvg * 10) / 10 }
      } else if (editedTaskAvg > 0) {
        newTaskGrades.push({ taskId: 0, studentId: sid, grade: Math.round(editedTaskAvg * 10) / 10, feedback: null, submissionId: null, submittedAt: null, gradedAt: null })
      }
    }
    await periodAdapter.updateGrades(period.id, { manualGrades: newManualGrades, taskGrades: newTaskGrades })
    const subjectId = period.subjectId
    const periods = await periodAdapter.listBySubject(subjectId)
    periodsBySubject.value = { ...periodsBySubject.value, [subjectId]: periods as GradePeriod[] }
    editingPeriodId.value = null
    periodEditData.value = {}
  } catch (e: any) {
    alert('Error al guardar: ' + (e?.message ?? String(e)))
  } finally {
    savingPeriodGrades.value = false
  }
}

function confirmDeletePeriod(period: GradePeriod) {
  deletePeriodConfirm.id = period.id
  deletePeriodConfirm.name = period.name
  deletePeriodConfirm.subjectId = period.subjectId
  deletePeriodConfirm.show = true
}

async function executeDeletePeriod() {
  const { id, subjectId } = deletePeriodConfirm
  deletePeriodConfirm.show = false
  deletingPeriod.value = true
  try {
    await periodAdapter.deletePeriod(id)
    const subjectPeriods = (periodsBySubject.value[subjectId] ?? []).filter(p => p.id !== id)
    periodsBySubject.value = { ...periodsBySubject.value, [subjectId]: subjectPeriods }
    if (expandedPeriods.value.has(id)) {
      const next = new Set(expandedPeriods.value)
      next.delete(id)
      expandedPeriods.value = next
    }
  } catch (e: any) {
    alert('Error al eliminar periodo: ' + (e?.message ?? String(e)))
  } finally {
    deletingPeriod.value = false
  }
}

function buildShareText(): string {
  let text = '📊 REPORTE DE NOTAS\n\n'
  const fmt = (v: number | null) => v != null ? v.toFixed(1) : '0.0'
  for (const group of filteredReportData.value) {
    const activePeriod = (periodsBySubject.value[group.subjectId] ?? []).find(p => !p.snapshot)
    const periodLabel = activePeriod ? ` [${activePeriod.name}]` : ' [Sin periodo activo]'
    text += `📘 ${group.subjectName}${periodLabel} — Docente: ${group.teacherName} (Promedio: ${group.average ?? '0.0'})\n`
    if (!group.hasActivePeriod) {
      text += `   ⚠️ Sin periodo activo\n`
    } else {
      for (const row of group.gradeSummaries) {
        text += `   • ${row.studentName}: Comp. ${fmt(row.comportamientoAvg)} | Tareas ${fmt(row.taskAvg)} | Examen ${fmt(row.examenesAvg)} | Partic. ${fmt(row.participacionAvg)} | Nota ${fmt(row.notaPonderada)}\n`
      }
    }
    text += '\n'
  }
  const exportSubmissions = filteredReportData.value.reduce((sum, g) => sum + g.rows.length, 0)
  const exportGraded = filteredReportData.value.reduce((sum, g) => sum + g.rows.filter(r => r.grade !== null).length, 0)
  text += ` Total entregas: ${exportSubmissions} | Calificadas: ${exportGraded}`
  if (isIncatInstitution()) {
    const lines = getInstitutionFooterLines()
    text += '\n\n' + lines.join('\n') + '\n'
  }
  return text
}

function buildPrintableHTML(): string {
  let rows = ''
  const fmt = (v: number | null) => v != null ? v.toFixed(1) : '0.0'
  for (const group of filteredReportData.value) {
    const activePeriod = (periodsBySubject.value[group.subjectId] ?? []).find(p => !p.snapshot)
    const periodLabel = activePeriod ? ` — ${activePeriod.name}` : ''
    rows += `<tr class="subject-header"><td colspan="6">${group.subjectName}${periodLabel}<span class="teacher-tag"> — Docente: ${group.teacherName}</span></td><td style="text-align:center;color:#6A1B9A;font-weight:700">${group.average ?? '0.0'}</td></tr>`
    if (!group.hasActivePeriod) {
      rows += `<tr><td colspan="7" style="color:#FF9500;padding-left:20px">⚠️ Sin periodo activo</td></tr>`
    } else if (!group.gradeSummaries.length) {
      rows += `<tr><td colspan="7" style="color:#999;padding-left:20px">Sin entregas</td></tr>`
    } else {
      for (const row of group.gradeSummaries) {
        const notaColor = (row.notaPonderada ?? 0) >= 4 ? '#34C759' : (row.notaPonderada ?? 0) >= 3 ? '#FF9500' : '#FF453A'
        rows += `<tr>
        <td>${escH(group.subjectName)}</td>
        <td>${row.studentName}</td>
        <td style="text-align:center">${fmt(row.comportamientoAvg)}</td>
        <td style="text-align:center">${fmt(row.taskAvg)}</td>
        <td style="text-align:center">${fmt(row.examenesAvg)}</td>
        <td style="text-align:center">${fmt(row.participacionAvg)}</td>
        <td style="color:${notaColor};font-weight:700;text-align:center">${fmt(row.notaPonderada)}</td>
      </tr>`
      }
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
${institutionHeaderCSS()}
${institutionSignatureAndFooterCSS()}
@media print{body{padding:20px}}
</style></head><body>
${buildInstitutionHeaderHTML()}
<h1>📊 Reporte de Notas</h1>
<p class="subtitle">Generado el ${new Date().toLocaleDateString('es')}</p>
<div class="summary">
<div><span class="val">${filteredReportData.value.length}</span><span class="lbl">Materias</span></div>
<div><span class="val">${filteredReportData.value.reduce((sum, g) => sum + g.rows.length, 0)}</span><span class="lbl">Entregas</span></div>
<div><span class="val">${filteredReportData.value.reduce((sum, g) => sum + g.rows.filter(r => r.grade !== null).length, 0)}</span><span class="lbl">Calificadas</span></div>
</div>
<table>
<thead><tr><th>Materia</th><th>Estudiante</th><th style="text-align:center">Comportamiento</th><th style="text-align:center">Tareas</th><th style="text-align:center">Examen</th><th style="text-align:center">Participación</th><th style="text-align:center">Nota Ponderada</th></tr></thead>
<tbody>${rows}</tbody>
</table>
${buildInstitutionSignatureAndFooterHTML()}</body></html>`
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

.no-active-period-msg {
  padding: 10px 16px;
  font-size: 13px;
  color: #FF9500;
  background: rgba(255, 149, 0, 0.08);
  border-radius: 8px;
  margin: 6px 0;
}

.period-label {
  font-size: 12px;
  font-weight: 600;
  color: #BF5AF2;
  padding: 4px 0 6px;
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

/* ── INCAT Institution Header (in-app) ── */
.inst-header-inline {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  margin: 0 0 12px;
  background: rgba(139, 0, 0, 0.06);
  border-radius: 10px;
  border-bottom: 2px solid #8B0000;
}
.inst-header-logo {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inst-header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.inst-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}
.inst-header-name {
  font-size: 13px;
  font-weight: 800;
  color: #8B0000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.inst-header-line {
  font-size: 9px;
  color: #8E8E93;
  line-height: 1.3;
}
.inst-header-bold {
  font-weight: 600;
  color: #777;
}
.inst-header-nit {
  font-size: 10px;
  font-weight: 700;
  color: #8B0000;
  margin-top: 2px;
}

/* ── INCAT in-app signature + footer ── */
.incat-signature-footer {
  padding: 0 16px 4px;
  border-top: 1px solid rgba(139, 0, 0, 0.2);
  margin-top: 12px;
}
.incat-sig-block {
  margin-top: 16px;
  display: inline-block;
  min-width: 180px;
}
.incat-sig-line {
  border-top: 1px solid #8E8E93;
  margin-bottom: 4px;
}
.incat-sig-name {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  margin: 0;
}
.incat-sig-title {
  font-size: 10px;
  color: #8E8E93;
  margin: 2px 0 0;
}
.incat-footer-info {
  margin-top: 12px;
  border-top: 1px solid rgba(139, 0, 0, 0.3);
  padding-top: 8px;
  text-align: center;
}
.incat-footer-slogan {
  font-size: 11px;
  font-style: italic;
  color: #BF5AF2;
  margin: 0 0 3px;
}
.incat-footer-addr,
.incat-footer-city {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  margin: 2px 0;
}
.incat-footer-email {
  font-size: 10px;
  color: #FF453A;
  margin: 2px 0;
}

/* ── Periods ── */
.periods-section {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 12px 4px;
}
.periods-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 0;
  color: #8E8E93;
}
.periods-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #BF5AF2;
}
.periods-badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(191, 90, 242, 0.2);
  color: #BF5AF2;
  padding: 1px 7px;
  border-radius: 10px;
}
.close-period-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #34C759;
  background: rgba(52, 199, 89, 0.12);
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.15s;
}
.close-period-btn:hover { background: rgba(52, 199, 89, 0.22); }
.close-period-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.periods-list {
  padding: 4px 0 8px 16px;
}
.no-periods {
  font-size: 12px;
  color: #636366;
  padding: 6px 0;
}
.period-item {
  margin-bottom: 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}
.period-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: #ccc;
}
.period-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.period-date {
  font-size: 11px;
  color: #636366;
}
.period-date-range {
  font-size: 10px;
  color: #BF5AF2;
  opacity: 0.8;
}
.period-edit-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #34C759;
  background: rgba(52, 199, 89, 0.12);
  padding: 3px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.period-edit-btn:hover { background: rgba(52, 199, 89, 0.22); }
.period-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  font-size: 11px;
  color: #FF453A;
  background: rgba(255, 69, 58, 0.1);
  border-radius: 6px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.period-delete-btn:hover { background: rgba(255, 69, 58, 0.22); }
.delete-period-dialog {
  background: #1C1C1E;
  border-radius: 16px;
  padding: 24px;
  margin: auto;
  max-width: 380px;
  width: 90%;
  border: 1px solid rgba(255,255,255,0.08);
}
.period-cancel-btn {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #8E8E93;
  background: rgba(142, 142, 147, 0.12);
  padding: 3px 8px;
  border-radius: 6px;
}
.period-snapshot {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.period-grade-input {
  width: 56px;
  padding: 3px 4px;
  border-radius: 6px;
  border: 1px solid rgba(191, 90, 242, 0.3);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  outline: none;
}
.period-grade-input:focus {
  border-color: #BF5AF2;
  background: rgba(191, 90, 242, 0.1);
}
.period-save-bar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
}
.period-save-btn {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #34C759;
  background: rgba(52, 199, 89, 0.15);
  transition: background 0.15s;
}
.period-save-btn:hover { background: rgba(52, 199, 89, 0.25); }
.period-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
