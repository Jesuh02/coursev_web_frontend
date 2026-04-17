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
            <!-- INCAT Institution Header -->
            <div v-if="isIncatInstitution()" class="inst-header-inline">
              <div class="inst-header-logo">
                <img :src="getInstitutionLogoUrl()!" alt="Escudo INCAT" crossorigin="anonymous" />
              </div>
              <div class="inst-header-text">
                <div class="inst-header-name">POLITECNICO INSTITUCIONAL DEL CARIBE &quot;INCAT&quot;</div>
                <div class="inst-header-line">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M</div>
                <div class="inst-header-line">Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.</div>
                <div class="inst-header-line inst-header-bold">Institución Educativa De Formación para el trabajo y el desarrollo humano</div>
                <div class="inst-header-nit">NIT: 900391687-0</div>
              </div>
            </div>

            <!-- Summary card -->
            <!-- Body: same layout as GradeReportModal -->
            <div class="report-body">
              <!-- Filters: curso y materia -->
              <div class="filters-row">
                <div class="filter-group">
                  <label class="filter-label">Curso</label>
                  <div class="course-search-wrapper">
                    <input
                      v-model="courseSearchText"
                      type="text"
                      class="course-search-input"
                      :placeholder="selectedCourseId ? availableCourses.find(c => c.id === selectedCourseId)?.name ?? 'Todos los cursos' : 'Todos los cursos'"
                      autocomplete="off"
                      @focus="showCourseDropdown = true; if (!courseSearchText) populateCourseDropdown()"
                      @input="showCourseDropdown = true"
                      @blur="hideCourseDropdownDelayed"
                    />
                    <svg v-if="!selectedCourseId" class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <button v-else class="search-clear-btn" @mousedown.prevent="clearCourseSearch">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div v-if="showCourseDropdown" class="course-dropdown">
                      <div
                        class="course-option"
                        :class="{ active: selectedCourseId === null }"
                        @mousedown.prevent="selectCourseFromSearch(null)"
                      >Todos los cursos</div>
                      <div
                        v-for="c in filteredCoursesForSearch"
                        :key="c.id"
                        class="course-option"
                        :class="{ active: selectedCourseId === c.id }"
                        @mousedown.prevent="selectCourseFromSearch(c)"
                      >{{ c.name }}</div>
                      <div v-if="filteredCoursesForSearch.length === 0 && courseSearchText.trim()" class="course-option-empty">
                        Sin resultados
                      </div>
                    </div>
                  </div>
                </div>
                <div class="filter-group">
                  <label class="filter-label">Materia</label>
                  <select class="filter-select" :value="selectedSubjectName ?? ''" @change="onSubjectFilterChange($event)">
                    <option value="">Todas las materias</option>
                    <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>

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
                        <span class="subject-avg" :class="gradeClass(subGroup.average)">{{ (subGroup.average ?? 0).toFixed(1) }}</span>
                      </div>

                      <!-- Periodos cerrados: todos, del más antiguo al más reciente -->
                      <template v-for="p in (periodsBySubject[subGroup.subjectId ?? 0] ?? []).filter(p => p.snapshot !== null).sort((a, b) => new Date(a.closedAt || 0).getTime() - new Date(b.closedAt || 0).getTime())" :key="p.id">
                        <div class="breakdown-section">
                          <div class="breakdown-label period-label">📅 {{ p.name }}</div>
                          <div v-if="computePeriodSummaries(p.snapshot).length" class="table-wrapper">
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
                                <tr v-for="row in computePeriodSummaries(p.snapshot)" :key="row.studentUsername" class="grade-row">
                                  <td class="cell-student">{{ displayStudentName(row.studentFullName) }}</td>
                                  <td class="cell-grade" :class="gradeClass(row.comportamientoAvg)">{{ (row.comportamientoAvg ?? 0).toFixed(1) }}</td>
                                  <td class="cell-grade" :class="gradeClass(row.taskAvg)">{{ (row.taskAvg ?? 0).toFixed(1) }}</td>
                                  <td class="cell-grade" :class="gradeClass(row.examenesAvg)">{{ (row.examenesAvg ?? 0).toFixed(1) }}</td>
                                  <td class="cell-grade" :class="gradeClass(row.participacionAvg)">{{ (row.participacionAvg ?? 0).toFixed(1) }}</td>
                                  <td class="cell-ponderada" :class="gradeClass(row.notaPonderada)"><strong>{{ (row.notaPonderada ?? 0).toFixed(1) }}</strong></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div v-else class="no-tasks">Sin datos en este periodo</div>
                        </div>
                      </template>

                      <!-- Periodo activo (datos en vivo) -->
                      <div v-if="subGroup.hasActivePeriod && subGroup.gradeSummaries.length" class="breakdown-section">
                        <div class="breakdown-label period-label">
                          🟢 {{ (periodsBySubject[subGroup.subjectId ?? 0] ?? []).find(p => !p.snapshot)?.name ?? 'Periodo activo' }}
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
                              <tr v-for="row in subGroup.gradeSummaries" :key="row.studentUsername" class="grade-row">
                                <td class="cell-student">{{ displayStudentName(row.studentFullName) }}</td>
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
                      <div v-else-if="subGroup.hasActivePeriod && !subGroup.gradeSummaries.length" class="no-tasks">Sin entregas</div>
                      <div v-else-if="!subGroup.hasActivePeriod && !(periodsBySubject[subGroup.subjectId ?? 0] ?? []).some(p => p.snapshot !== null)" class="no-active-period-msg">
                        📅 Sin periodo activo — los datos de notas solo se muestran cuando hay un periodo iniciado.
                      </div>

                      <!-- Periodos -->
                      <div v-if="subGroup.subjectId != null" class="periods-section">
                        <div class="periods-header" @click="togglePeriodsSection(subGroup.subjectId)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" :style="{ transform: expandedSections.has(`periods-${subGroup.subjectId}`) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"><polyline points="9 18 15 12 9 6"/></svg>
                          <span class="periods-title">Periodos</span>
                          <span v-if="(periodsBySubject[subGroup.subjectId] ?? []).length" class="periods-badge">{{ (periodsBySubject[subGroup.subjectId] ?? []).length }}</span>
                          <button class="close-period-btn" @click.stop="handleClosePeriod(group.courseId, subGroup.subjectId, subGroup.subjectName)" :disabled="closingPeriod">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                            Cerrar Periodo
                          </button>
                        </div>
                        <div v-if="expandedSections.has(`periods-${subGroup.subjectId}`)" class="periods-list">
                          <div v-if="!(periodsBySubject[subGroup.subjectId] ?? []).length" class="no-periods">No hay periodos creados</div>
                          <div v-for="period in (periodsBySubject[subGroup.subjectId] ?? [])" :key="period.id" class="period-item">
                            <div class="period-item-header" @click="togglePeriodExpand(period.id)">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :style="{ transform: expandedPeriods.has(period.id) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"><polyline points="9 18 15 12 9 6"/></svg>
                              <span class="period-name">{{ period.name }}</span>
                              <span class="period-date">{{ formatPeriodDate(period.closedAt) }}</span>
                              <button v-if="editingPeriodId !== period.id" class="period-edit-btn" @click.stop="startEditingPeriod(period)">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Editar
                              </button>
                              <button v-else class="period-cancel-btn" @click.stop="cancelEditingPeriod()">Cancelar</button>
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
                                      <tr v-for="row in computePeriodSummaries(period.snapshot)" :key="row.studentUsername" class="grade-row">
                                        <td class="cell-student">{{ displayStudentName(row.studentFullName) }}</td>
                                        <template v-if="editingPeriodId === period.id">
                                          <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentUsername, 'comportamiento')" @input="updatePeriodEdit(row.studentUsername, 'comportamiento', $event)" /></td>
                                          <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentUsername, 'tareas')" @input="updatePeriodEdit(row.studentUsername, 'tareas', $event)" /></td>
                                          <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentUsername, 'examenes')" @input="updatePeriodEdit(row.studentUsername, 'examenes', $event)" /></td>
                                          <td class="cell-grade"><input type="number" class="period-grade-input" min="0" max="10" step="0.1" :value="getPeriodEditValue(row.studentUsername, 'participacion')" @input="updatePeriodEdit(row.studentUsername, 'participacion', $event)" /></td>
                                          <td class="cell-ponderada" :class="gradeClass(computeEditedNotaPonderada(row.studentUsername))"><strong>{{ computeEditedNotaPonderada(row.studentUsername).toFixed(1) }}</strong></td>
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

                    <div v-if="!group.rows.length" class="no-tasks">Sin entregas registradas</div>
                  </div>
                </template>
                <div v-if="filteredData.length === 0" class="no-tasks" style="padding:40px;text-align:center">Sin datos disponibles</div>
              </div>

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
import type ExcelJS from 'exceljs'
import { api, courseAdapter } from '@/infrastructure/api'
import { subjectAdapter } from '@/infrastructure/api/subjectAdapter'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet } from '@/infrastructure/api/gradeAdapter'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'
import { buildInstitutionHeaderHTML, institutionHeaderCSS, isIncatInstitution, getInstitutionLogoUrl, buildInstitutionSignatureAndFooterHTML, institutionSignatureAndFooterCSS, getInstitutionFooterLines } from '@/utils/institutionHeader'

const props = defineProps<{ modelValue: boolean }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isFullscreen = ref(false)
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value }
onUnmounted(() => { isFullscreen.value = false })
watch(() => props.modelValue, (v) => {
  if (!v) {
    isFullscreen.value = false
    selectedCourseId.value = null
    selectedSubjectName.value = null
    courseSearchText.value = ''
    showCourseDropdown.value = false
    periodsBySubject.value = {}
    expandedSections.value = new Set()
    expandedPeriods.value = new Set()
  }
})

interface ReportRow {
  id: number
  studentUsername?: string | null
  studentFullName?: string | null
  studentCedula?: string | null
  taskName?: string | null
  grade: number | null
  submission_date: number | null
  feedback: string | null
  subjectName?: string | null
  gradedByUsername?: string | null
  notSubmitted?: boolean
}

interface GradeSummaryRow {
  studentUsername: string
  studentFullName?: string | null
  taskAvg: number | null
  participacionAvg: number | null
  examenesAvg: number | null
  comportamientoAvg: number | null
  notaPonderada: number | null
}

interface CourseGroup {
  courseId: number
  courseName: string
  rows: ReportRow[]
  progressByUsername: Record<string, number>
  gradeSummariesBySubject: Record<string, GradeSummaryRow[]>
  subjectIdsByName: Record<string, number>
}

const loading = ref(false)
const errorMsg = ref('')
const reportData = ref<CourseGroup[]>([])
const loadedCourses = ref(0)
const totalCourses = ref(0)

// ── Periods ──
const periodsBySubject = ref<Record<number, GradePeriod[]>>({})
const hasActivePeriodBySubjectId = ref<Record<number, boolean>>({})
const expandedSections = ref(new Set<string>())
const expandedPeriods = ref(new Set<number>())
const closingPeriod = ref(false)
const editingPeriodId = ref<number | null>(null)
const periodEditData = ref<Record<string, Record<string, number>>>({})
const savingPeriodGrades = ref(false)

// ── Filters ──
const selectedCourseId = ref<number | null>(null)
const selectedSubjectName = ref<string | null>(null)
const courseSearchText = ref('')
const showCourseDropdown = ref(false)

const filteredCoursesForSearch = computed(() => {
  const q = courseSearchText.value.trim().toLowerCase()
  if (!q) return availableCourses.value
  return availableCourses.value.filter(c => c.name.toLowerCase().includes(q))
})

function populateCourseDropdown() {
  showCourseDropdown.value = true
}

function selectCourseFromSearch(course: { id: number; name: string } | null) {
  selectedCourseId.value = course?.id ?? null
  courseSearchText.value = course?.name ?? ''
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

const availableCourses = computed(() =>
  reportData.value.map(g => ({ id: g.courseId, name: g.courseName }))
)

const availableSubjects = computed(() => {
  const courses = selectedCourseId.value
    ? reportData.value.filter(g => g.courseId === selectedCourseId.value)
    : reportData.value
  const subjects = new Set<string>()
  for (const c of courses) {
    for (const row of c.rows) {
      if (row.subjectName) subjects.add(row.subjectName)
    }
    for (const name of Object.keys(c.gradeSummariesBySubject)) {
      subjects.add(name)
    }
  }
  return Array.from(subjects).sort()
})

watch(selectedCourseId, () => { selectedSubjectName.value = null })

const courseCount = computed(() => reportData.value.length)
const totalSubmissions = computed(() => reportData.value.reduce((s, g) => s + g.rows.length, 0))
const gradedCount = computed(() => reportData.value.reduce((s, g) => s + g.rows.filter(r => r.grade != null).length, 0))

const averageGrade = computed(() => {
  const graded = reportData.value.flatMap(g => g.rows).filter(r => r.grade != null)
  if (!graded.length) return '0.0'
  return (graded.reduce((s, r) => s + r.grade!, 0) / graded.length).toFixed(1)
})

const averageClass = computed(() => gradeClass(parseFloat(averageGrade.value) || null))

const filteredData = computed(() => {
  let data = reportData.value
  if (selectedCourseId.value) {
    data = data.filter(g => g.courseId === selectedCourseId.value)
  }
  if (selectedSubjectName.value) {
    const subjectFilter = selectedSubjectName.value
    data = data.map(g => {
      const filteredSummaries: Record<string, any[]> = {}
      if (g.gradeSummariesBySubject?.[subjectFilter]) {
        filteredSummaries[subjectFilter] = g.gradeSummariesBySubject[subjectFilter]
      }
      const filteredSubjectIdsByName: Record<string, number> = {}
      if (g.subjectIdsByName?.[subjectFilter] != null) {
        filteredSubjectIdsByName[subjectFilter] = g.subjectIdsByName[subjectFilter]
      }
      return {
        ...g,
        rows: g.rows.filter(r => r.subjectName === subjectFilter),
        gradeSummariesBySubject: filteredSummaries,
        subjectIdsByName: filteredSubjectIdsByName,
      }
    }).filter(g =>
      g.rows.length > 0 ||
      Object.keys(g.gradeSummariesBySubject).length > 0 ||
      Object.keys(g.subjectIdsByName).length > 0,
    )
  }
  return data
})

function gradeClass(grade: number | null): string {
  if (grade == null || isNaN(grade)) return ''
  if (grade >= 4) return 'grade-good'
  if (grade >= 3) return 'grade-ok'
  return 'grade-low'
}

function onSubjectFilterChange(event: Event) {
  const val = (event.target as HTMLSelectElement).value
  selectedSubjectName.value = val || null
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
        const [subsRaw, progressRaw, subjectsRaw] = await Promise.all([
          api.get<any[]>(`/submissions/course/${course.id}?page=1&pageSize=500`).catch(() => [] as any[]),
          api.get<any[]>(`/progress/course/${course.id}/all`).catch(() => [] as any[]),
          subjectAdapter.getSubjectsByCourse(course.id).catch(() => [] as any[]),
        ])
        loadedCourses.value++

        // Build username → averageGrade map from progreso_curso table
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

        // Build subjectIdsByName mapping
        const subjectIdsByName: Record<string, number> = {}
        for (const s of (subjectsRaw ?? [])) {
          subjectIdsByName[(s as any).name as string] = (s as any).id as number
        }

        // Fetch grade sheets AND periods per subject in parallel
        const gradeSummariesBySubject: Record<string, GradeSummaryRow[]> = {}
        const subjectIds = Object.values(subjectIdsByName)
        const [sheetResults, allPeriodsResults] = await Promise.all([
          Promise.allSettled(
            (subjectsRaw ?? []).map(async (s: any) => {
              const sheet = await gradeAdapter.getGradeSheet(s.id)
              return { subjectName: s.name as string, subjectId: s.id as number, sheet }
            })
          ),
          subjectIds.length
            ? Promise.allSettled(subjectIds.map(sid => periodAdapter.listBySubject(sid)))
            : Promise.resolve([] as PromiseSettledResult<GradePeriod[]>[]),
        ])
        for (const r of sheetResults) {
          if (r.status === 'fulfilled' && r.value.sheet) {
            const active = r.value.sheet.hasActivePeriod ?? true
            hasActivePeriodBySubjectId.value[r.value.subjectId] = active
            gradeSummariesBySubject[r.value.subjectName] = active
              ? computeGradeSummaries(r.value.sheet)
              : []
          }
        }

        // Assign periods
        for (let i = 0; i < subjectIds.length; i++) {
          const result = (allPeriodsResults as PromiseSettledResult<GradePeriod[]>[])[i]
          if (result?.status === 'fulfilled') {
            periodsBySubject.value[subjectIds[i]] = result.value as GradePeriod[]
          }
        }

        return {
          courseId: course.id,
          courseName: (course as any).title ?? (course as any).name ?? `Curso ${course.id}`,
          rows,
          progressByUsername,
          gradeSummariesBySubject,
          subjectIdsByName,
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
  // Track persona data per username
  const studentPersonaMap = new Map<string, { fullName: string | null, cedula: string | null }>()

  for (const sub of subs) {
    const subjectName = sub.subjectName ?? '—'
    const taskName = sub.taskName ?? '—'
    const student = sub.studentUsername ?? null
    if (!student) continue
    knownStudents.add(student)
    if (!studentPersonaMap.has(student)) {
      studentPersonaMap.set(student, {
        fullName: sub.studentFullName ?? null,
        cedula: sub.studentCedula ?? null,
      })
    }
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
          const persona = studentPersonaMap.get(student) ?? { fullName: null, cedula: null }
          extra.push({
            id: 0,
            studentUsername: student,
            studentFullName: persona.fullName,
            studentCedula: persona.cedula,
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

// ── Grade category summary (same logic as GradeReportModal) ──
function computeGradeSummaries(sheet: GradeSheet): GradeSummaryRow[] {
  const fmt = (v: number | null): number | null => v !== null ? Math.round(v * 10) / 10 : null
  const avgArr = (arr: number[]): number | null => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const totalTasks = sheet.tasks.length
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
    const participacionAvg = byType['participacion']?.length ? avgArr(byType['participacion']) : (activeCategories.has('participacion') ? 0 : null)
    const examenesAvg = byType['examenes']?.length ? avgArr(byType['examenes']) : (activeCategories.has('examenes') ? 0 : null)
    const comportamientoAvg = byType['comportamiento']?.length ? avgArr(byType['comportamiento']) : (activeCategories.has('comportamiento') ? 0 : null)
    const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
    const notaPonderada = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
    return {
      studentUsername: student.username ?? `#${student.userId}`,
      studentFullName: normalizePersonName(student.fullName),
      taskAvg: fmt(taskAvg),
      participacionAvg: fmt(participacionAvg),
      examenesAvg: fmt(examenesAvg),
      comportamientoAvg: fmt(comportamientoAvg),
      notaPonderada: fmt(notaPonderada),
    }
  })
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
    { width: 26 }, // Curso
    { width: 22 }, // Materia
    { width: 26 }, // Estudiante
    { width: 14 }, // Comportamiento
    { width: 12 }, // Tareas
    { width: 12 }, // Examen
    { width: 14 }, // Participación
    { width: 12 }, // Nota Final
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
    row.eachCell((cell: ExcelJS.Cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Calibri' }
      cell.fill = hdrFill
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle', wrapText: true }
    })
    row.height = 18
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
  const hdrRow = ws.addRow(['Curso', 'Materia', 'Estudiante', 'Comportamiento', 'Tareas', 'Examen', 'Participación', 'Nota Final'])
  applyHdr(hdrRow)
  for (let c = 4; c <= 8; c++) hdrRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' }

  for (const group of filteredData.value) {
    // Course header row (merged)
    const courseRow = ws.addRow([group.courseName])
    ws.mergeCells(courseRow.number, 1, courseRow.number, 8)
    const courseCell = courseRow.getCell(1)
    courseCell.font = { bold: true, color: { argb: 'FF4A0E8F' }, size: 11, name: 'Calibri' }
    courseCell.fill = courseHdrFill
    courseCell.border = thinBorder
    courseRow.height = 20

    const subjectGroups = getSubjectGroups(group)
    const hasSummaries = subjectGroups.some(sg => sg.hasActivePeriod && sg.gradeSummaries.length > 0)
    const hasClosedPeriods = subjectGroups.some(sg =>
      sg.subjectId != null && (periodsBySubject.value[sg.subjectId] ?? []).some(p => p.snapshot !== null)
    )
    if (!hasSummaries && !hasClosedPeriods && !subjectGroups.some(sg => !sg.hasActivePeriod)) {
      const emptyRow = ws.addRow(['Sin datos disponibles'])
      ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
      emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
      continue
    }

    const addSummaryRows = (summaries: GradeSummaryRow[], courseName: string, subjectName: string) => {
      summaries.forEach((row, i) => {
        const dataRow = ws.addRow([
          courseName,
          subjectName,
          row.studentFullName || row.studentUsername,
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

    for (const subGroup of subjectGroups) {
      const allSubjPeriods = subGroup.subjectId != null ? (periodsBySubject.value[subGroup.subjectId] ?? []) : []
      const closedSubjPeriods = allSubjPeriods
        .filter(p => p.snapshot !== null)
        .sort((a, b) => new Date(a.closedAt || 0).getTime() - new Date(b.closedAt || 0).getTime())
      const activeSubjPeriod = allSubjPeriods.find(p => !p.snapshot) ?? null

      // Subject sub-header row (merged)
      const subjRow = ws.addRow([`Materia: ${subGroup.subjectName}`])
      ws.mergeCells(subjRow.number, 1, subjRow.number, 8)
      const subjCell = subjRow.getCell(1)
      subjCell.font = { bold: true, color: { argb: 'FF7B3FA6' }, size: 9, name: 'Calibri' }
      subjCell.fill = subjHdrFill
      subjCell.border = thinBorder
      subjRow.height = 16

      if (!closedSubjPeriods.length && !activeSubjPeriod) {
        // No periods at all — fallback
        if (!subGroup.hasActivePeriod) {
          const noperiodRow = ws.addRow(['⚠️ Sin periodo activo — inicia un periodo para registrar notas'])
          ws.mergeCells(noperiodRow.number, 1, noperiodRow.number, 8)
          noperiodRow.getCell(1).font = { italic: true, color: { argb: 'FFB45309' }, name: 'Calibri' }
        } else if (subGroup.gradeSummaries.length) {
          addSummaryRows(subGroup.gradeSummaries, group.courseName, subGroup.subjectName)
        } else {
          const emptyRow = ws.addRow(['Sin entregas'])
          ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
          emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
        }
      } else {
        for (const period of closedSubjPeriods) {
          const summaries = computePeriodSummaries(period.snapshot)
          const closedPeriodLabelFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0E6FF' } }
          const closedLabelRow = ws.addRow([`📅 ${period.name}`])
          ws.mergeCells(closedLabelRow.number, 1, closedLabelRow.number, 8)
          closedLabelRow.getCell(1).font = { bold: true, color: { argb: 'FF4A0E8F' }, size: 10, name: 'Calibri' }
          closedLabelRow.getCell(1).fill = closedPeriodLabelFill
          closedLabelRow.getCell(1).border = thinBorder
          closedLabelRow.height = 16
          if (summaries.length) {
            addSummaryRows(summaries, group.courseName, subGroup.subjectName)
          } else {
            const emptyRow = ws.addRow(['Sin datos'])
            ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
            emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
          }
        }
        if (activeSubjPeriod) {
          const activePeriodLabelFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }
          const activeLabelRow = ws.addRow([`🟢 ${activeSubjPeriod.name} (Activo)`])
          ws.mergeCells(activeLabelRow.number, 1, activeLabelRow.number, 8)
          activeLabelRow.getCell(1).font = { bold: true, color: { argb: 'FF1A7F37' }, size: 10, name: 'Calibri' }
          activeLabelRow.getCell(1).fill = activePeriodLabelFill
          activeLabelRow.getCell(1).border = thinBorder
          activeLabelRow.height = 16
          if (subGroup.gradeSummaries.length) {
            addSummaryRows(subGroup.gradeSummaries, group.courseName, subGroup.subjectName)
          } else {
            const emptyRow = ws.addRow(['Sin entregas'])
            ws.mergeCells(emptyRow.number, 1, emptyRow.number, 8)
            emptyRow.getCell(1).font = { italic: true, color: { argb: 'FF999999' }, name: 'Calibri' }
          }
        }
      }
    }
  }

  // Footer rows: signature + institution footer
  const footerLines = getInstitutionFooterLines()
  if (footerLines.length) {
    ws.addRow([])
    const sigRow = ws.addRow([footerLines[1]])
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

// ── Period helpers ────────────────────────────────────────────────────────
function togglePeriodsSection(subjectId: number) {
  const key = `periods-${subjectId}`
  const next = new Set(expandedSections.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedSections.value = next
}

function togglePeriodExpand(periodId: number) {
  const next = new Set(expandedPeriods.value)
  if (next.has(periodId)) next.delete(periodId)
  else next.add(periodId)
  expandedPeriods.value = next
}

async function handleClosePeriod(courseId: number, subjectId: number, subjectName: string) {
  const existingCount = (periodsBySubject.value[subjectId] ?? []).length
  const defaultName = `Periodo ${existingCount + 1}`
  const name = prompt(`Nombre del periodo para "${subjectName}":`, defaultName)
  if (!name) return

  closingPeriod.value = true
  try {
    await periodAdapter.closePeriod({ courseId, subjectId, name })
    // Reload periods
    const periods = await periodAdapter.listBySubject(subjectId)
    periodsBySubject.value = { ...periodsBySubject.value, [subjectId]: periods as GradePeriod[] }
    // Expand the section
    expandedSections.value = new Set([...expandedSections.value, `periods-${subjectId}`])
    // Refresh grade sheet (now empty after period close)
    await refreshSubjectGradeSheet(courseId, subjectId, subjectName)
  } catch (e: any) {
    alert('Error al cerrar periodo: ' + (e?.message ?? String(e)))
  } finally {
    closingPeriod.value = false
  }
}

async function refreshSubjectGradeSheet(courseId: number, subjectId: number, subjectName: string) {
  try {
    const sheet = await gradeAdapter.getGradeSheet(subjectId)
    const summaries = computeGradeSummaries(sheet)
    const group = reportData.value.find(g => g.courseId === courseId)
    if (group) {
      group.gradeSummariesBySubject[subjectName] = summaries
      reportData.value = [...reportData.value]
    }
  } catch { /* ignore */ }
}

function computePeriodSummaries(snapshot: GradeSheet | null): GradeSummaryRow[] {
  if (!snapshot) return []
  return computeGradeSummaries(snapshot)
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
    data[row.studentUsername] = {
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

function getPeriodEditValue(studentUsername: string, field: string): number {
  return periodEditData.value[studentUsername]?.[field] ?? 0
}

function updatePeriodEdit(studentUsername: string, field: string, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value) || 0
  const clamped = Math.min(10, Math.max(0, val))
  if (!periodEditData.value[studentUsername]) {
    periodEditData.value[studentUsername] = { comportamiento: 0, tareas: 0, examenes: 0, participacion: 0 }
  }
  periodEditData.value[studentUsername][field] = clamped
}

function computeEditedNotaPonderada(studentUsername: string): number {
  const data = periodEditData.value[studentUsername]
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
    for (const [studentUsername, grades] of Object.entries(periodEditData.value)) {
      const student = snapshot.students.find((s: any) => (s.username ?? `#${s.userId}`) === studentUsername)
      if (!student) continue
      const sid = student.userId
      for (const [field, value] of Object.entries(grades)) {
        if (field === 'tareas') continue
        newManualGrades.push({ studentId: sid, gradeType: field, grade: Math.round(value * 10) / 10 })
      }
    }
    let newTaskGrades = JSON.parse(JSON.stringify(snapshot.taskGrades || []))
    for (const [studentUsername, grades] of Object.entries(periodEditData.value)) {
      const student = snapshot.students.find((s: any) => (s.username ?? `#${s.userId}`) === studentUsername)
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

// ── Subject sub-grouping ──────────────────────────────────────────────────
function getSubjectGroups(group: CourseGroup): { subjectName: string; subjectId: number | null; rows: ReportRow[]; studentAverages: Record<string, number>; average: number | null; gradeSummaries: GradeSummaryRow[]; hasActivePeriod: boolean }[] {
  const map = new Map<string, ReportRow[]>()
  for (const row of group.rows) {
    const key = row.subjectName ?? '—'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }
  // Also include subjects that have grade summaries but no submissions
  for (const subjectName of Object.keys(group.gradeSummariesBySubject)) {
    if (!map.has(subjectName)) map.set(subjectName, [])
  }
  // Also include subjects that only have period data
  if (group.subjectIdsByName) {
    for (const subjectName of Object.keys(group.subjectIdsByName)) {
      if (!map.has(subjectName)) map.set(subjectName, [])
    }
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
    const gradeSummaries = group.gradeSummariesBySubject[subjectName] ?? []
    const subjectId = group.subjectIdsByName?.[subjectName] ?? null
    const hasActivePeriod = subjectId != null ? (hasActivePeriodBySubjectId.value[subjectId] ?? true) : true
    return { subjectName, subjectId, rows, studentAverages, average, gradeSummaries, hasActivePeriod }
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
  for (const group of filteredData.value) {
    rows += `<tr class="course-header"><td colspan="8">${esc_html(group.courseName)}</td></tr>`
    const subjectGroups = getSubjectGroups(group)
    const fmt = (v: number | null) => v != null ? v.toFixed(1) : '0.0'
    const renderSummaryRows = (summaries: GradeSummaryRow[], courseName: string, subjectName: string) => {
      let r = ''
      for (const row of summaries) {
        const notaColor = (row.notaPonderada ?? 0) >= 4 ? '#34C759' : (row.notaPonderada ?? 0) >= 3 ? '#FF9500' : '#FF453A'
        r += `<tr>
        <td>${esc_html(courseName)}</td>
        <td>${esc_html(subjectName)}</td>
        <td><strong>${esc_html(row.studentFullName || row.studentUsername)}</strong></td>
        <td style="text-align:center">${fmt(row.comportamientoAvg)}</td>
        <td style="text-align:center">${fmt(row.taskAvg)}</td>
        <td style="text-align:center">${fmt(row.examenesAvg)}</td>
        <td style="text-align:center">${fmt(row.participacionAvg)}</td>
        <td style="color:${notaColor};font-weight:700;text-align:center">${fmt(row.notaPonderada)}</td>
      </tr>`
      }
      return r
    }
    const hasSummaries = subjectGroups.some(sg => sg.hasActivePeriod && sg.gradeSummaries.length > 0)
    const hasAnyClosedPeriods = subjectGroups.some(sg =>
      sg.subjectId != null && (periodsBySubject.value[sg.subjectId] ?? []).some(p => p.snapshot !== null)
    )
    if (!hasSummaries && !hasAnyClosedPeriods && !subjectGroups.some(sg => !sg.hasActivePeriod)) {
      rows += `<tr><td colspan="8" style="color:#999;font-style:italic;padding-left:20px">Sin datos disponibles</td></tr>`
    } else {
      for (const subGroup of subjectGroups) {
        rows += `<tr class="subject-header"><td colspan="8"><span class="stag">Materia</span> ${esc_html(subGroup.subjectName)}</td></tr>`
        const allSubjPeriodsP = subGroup.subjectId != null ? (periodsBySubject.value[subGroup.subjectId] ?? []) : []
        const closedSubjPeriodsP = allSubjPeriodsP
          .filter(p => p.snapshot !== null)
          .sort((a, b) => new Date(a.closedAt || 0).getTime() - new Date(b.closedAt || 0).getTime())
        const activeSubjPeriodP = allSubjPeriodsP.find(p => !p.snapshot) ?? null
        if (!closedSubjPeriodsP.length && !activeSubjPeriodP) {
          if (!subGroup.hasActivePeriod) {
            rows += `<tr><td colspan="8" style="color:#FF9500;padding-left:20px">⚠️ Sin periodo activo</td></tr>`
          } else if (subGroup.gradeSummaries.length) {
            rows += renderSummaryRows(subGroup.gradeSummaries, group.courseName, subGroup.subjectName)
          } else {
            rows += `<tr><td colspan="8" style="color:#999;padding-left:20px">Sin entregas</td></tr>`
          }
        } else {
          for (const period of closedSubjPeriodsP) {
            rows += `<tr><td colspan="8" style="background:#f0e6ff;padding:6px 10px;font-size:11px;color:#6A1B9A;font-weight:600;border-top:1px solid #d4c5f0">📅 ${esc_html(period.name)}</td></tr>`
            const summaries = computePeriodSummaries(period.snapshot)
            rows += summaries.length
              ? renderSummaryRows(summaries, group.courseName, subGroup.subjectName)
              : `<tr><td colspan="8" style="color:#999;padding-left:28px;font-size:11px">Sin datos</td></tr>`
          }
          if (activeSubjPeriodP) {
            rows += `<tr><td colspan="8" style="background:#e8f5e9;padding:6px 10px;font-size:11px;color:#1A7F37;font-weight:600;border-top:1px solid #c8e6c9">🟢 ${esc_html(activeSubjPeriodP.name)} (Activo)</td></tr>`
            rows += subGroup.gradeSummaries.length
              ? renderSummaryRows(subGroup.gradeSummaries, group.courseName, subGroup.subjectName)
              : `<tr><td colspan="8" style="color:#999;padding-left:28px;font-size:11px">Sin entregas</td></tr>`
          }
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
${institutionHeaderCSS()}
${institutionSignatureAndFooterCSS()}
@media print{body{padding:20px}@page{margin:15mm}}
</style></head><body>
${buildInstitutionHeaderHTML()}
<h1>📊 Reporte de Notas — Plataforma</h1>
<p class="subtitle">Generado el ${date}</p>
<div class="summary">
  <div><span class="val">${filteredData.value.length}</span><span class="lbl">Cursos</span></div>
</div>
<table>
  <thead><tr><th>Curso</th><th>Materia</th><th>Estudiante</th><th style="text-align:center">Comportamiento</th><th style="text-align:center">Tareas</th><th style="text-align:center">Examen</th><th style="text-align:center">Participación</th><th style="text-align:center">Nota Final</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
${buildInstitutionSignatureAndFooterHTML()}</body></html>`
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
  will-change: transform, opacity;
}

.report-fade-enter-active { transition: opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
.report-fade-leave-active { transition: opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.report-fade-enter-from, .report-fade-leave-to { opacity: 0; }
.report-fade-enter-active .report-modal { animation: report-expand 0.55s cubic-bezier(0.32, 0.72, 0, 1) both; }
.report-fade-leave-active .report-modal { animation: report-collapse 0.3s cubic-bezier(0.32, 0.72, 0, 1) both; }
@keyframes report-expand {
  0% { opacity: 0; transform: scale(0.82) translateY(30px); border-radius: 32px; }
  50% { opacity: 1; }
  100% { opacity: 1; transform: scale(1) translateY(0); border-radius: 24px; }
}
@keyframes report-collapse {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(0.88) translateY(16px); }
}

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

.grade-good { color: #34C759 !important; font-weight: 700; }
.grade-ok   { color: #FF9500 !important; font-weight: 700; }
.grade-low  { color: #FF453A !important; font-weight: 700; }

/* ── Filters ── */
.filters-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
}

.filter-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8E8E93;
}

.filter-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  padding: 8px 12px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
  width: 100%;
}
.filter-select:hover, .filter-select:focus { border-color: rgba(191, 90, 242, 0.5); }
.filter-select option { background: #2C2C2E; color: #fff; }

/* ── Course search combobox ── */
.course-search-wrapper {
  position: relative;
}

.course-search-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 13px;
  padding: 8px 32px 8px 12px;
  outline: none;
  cursor: text;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.course-search-input:hover,
.course-search-input:focus { border-color: rgba(191, 90, 242, 0.5); }
.course-search-input::placeholder { color: #636366; }

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
  color: #8E8E93;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.15s, color 0.15s;
}
.search-clear-btn:hover { background: rgba(255, 255, 255, 0.16); color: #fff; }

.course-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #2C2C2E;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.course-option {
  padding: 9px 13px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: background 0.12s;
}
.course-option:hover { background: rgba(255, 255, 255, 0.07); }
.course-option.active { color: #BF5AF2; background: rgba(191, 90, 242, 0.1); }

.course-option-empty {
  padding: 9px 13px;
  font-size: 13px;
  color: #636366;
  font-style: italic;
}

/* ── Grade breakdown section ── */
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
  padding: 0 16px 12px;
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

/* ── Periods section ── */
.periods-section { border-top: 1px solid rgba(255, 255, 255, 0.06); }

.periods-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
  color: #8E8E93;
}
.periods-header:hover { background: rgba(255, 255, 255, 0.03); }

.periods-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.periods-badge {
  font-size: 11px;
  font-weight: 700;
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.15);
  padding: 2px 8px;
  border-radius: 10px;
}

.close-period-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(10, 132, 255, 0.12);
  color: #0A84FF;
  font-size: 11px;
  font-weight: 600;
  transition: opacity 0.15s;
}
.close-period-btn:hover { opacity: 0.85; }
.close-period-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.periods-list { padding: 0 14px 10px; }

.no-periods {
  font-size: 12px;
  color: #636366;
  padding: 8px 0;
  font-style: italic;
}

.period-item {
  margin-bottom: 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.period-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.period-item-header:hover { background: rgba(255, 255, 255, 0.04); }

.period-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  flex: 1;
}

.period-date {
  font-size: 11px;
  color: #636366;
}

.period-snapshot {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.period-edit-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(52, 199, 89, 0.12);
  color: #34C759;
  font-size: 11px;
  font-weight: 600;
  transition: opacity 0.15s;
  margin-left: auto;
}
.period-edit-btn:hover { opacity: 0.8; }

.period-cancel-btn {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(142, 142, 147, 0.15);
  color: #8E8E93;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
}

.period-grade-input {
  width: 56px;
  padding: 4px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(191, 90, 242, 0.3);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color 0.15s;
}
.period-grade-input:focus { border-color: #BF5AF2; }
.period-grade-input::-webkit-inner-spin-button { display: none; }

.period-save-bar {
  display: flex;
  justify-content: flex-end;
  padding: 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.period-save-btn {
  padding: 8px 20px;
  border-radius: 10px;
  background: rgba(52, 199, 89, 0.18);
  color: #34C759;
  font-size: 13px;
  font-weight: 700;
  transition: opacity 0.15s;
}
.period-save-btn:hover { opacity: 0.85; }
.period-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
