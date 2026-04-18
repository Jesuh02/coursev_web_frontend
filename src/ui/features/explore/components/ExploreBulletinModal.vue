<template>
  <Teleport to="body">
    <Transition name="bulletin-fade">
      <div v-if="modelValue" class="bulletin-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="bulletin-modal" :class="{ 'bulletin-modal--expanded': isExpanded }">
          <!-- Header -->
          <div class="bulletin-header">
            <div class="bulletin-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h2 class="bulletin-title">Generar Boletín</h2>
            <button class="bulletin-expand-btn" @click="isExpanded = !isExpanded" :title="isExpanded ? 'Reducir' : 'Ampliar'">
              <svg v-if="!isExpanded" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
            </button>
            <button class="bulletin-close" @click="$emit('update:modelValue', false)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div class="bulletin-body">
            <!-- Platform-wide bulletin: all courses × all subjects × all students -->
            <template v-if="showPlatformBulletin">
              <button class="back-to-list" @click="showPlatformBulletin = false; platformBulletinData = []">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
                Volver a la lista
              </button>

              <div v-if="loadingPlatformBulletin" class="bulletin-loading">
                <div class="spinner-bulletin" />
                <p>Generando boletines de toda la plataforma…</p>
              </div>

              <template v-else>
                <div v-if="platformBulletinData.length" class="bulletin-export-bar bulletin-export-bar--top">
                  <button class="export-btn export-pdf" @click="exportPlatformBulletinPDF">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    PDF todos
                  </button>
                  <button class="export-btn export-excel" @click="exportPlatformBulletinExcel">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                    Excel todos
                  </button>
                  <button class="export-btn export-word" @click="exportPlatformBulletinWord">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    Word todos
                  </button>
                </div>

                <p v-if="!platformBulletinData.length" class="no-courses">No se encontraron datos para generar el boletín.</p>

                <div v-for="entry in platformBulletinData" :key="`${entry.courseTitle}-${entry.student.userId}`" class="bulletin-card bulletin-card--all">
                  <div class="boletin-header-top">
                    <div class="boletin-logo-placeholder">
                      <img v-if="institutionLogoUrl" :src="institutionLogoUrl" alt="Escudo" style="width:50px;height:auto" />
                      <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div class="boletin-institution">
                      <span class="boletin-inst-name">{{ getInstitutionDisplayName() }}</span>
                      <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                      <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                    </div>
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-info-grid">
                    <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ entry.courseCategory?.toLowerCase() === 'bachillerato' ? entry.courseCategory : entry.courseTitle }}</span></div>
                    <div v-if="entry.courseCategory?.toLowerCase() === 'bachillerato'" class="boletin-info-row"><span class="boletin-label">CICLO:</span><span class="boletin-value">{{ entry.courseTitle }}</span></div>
                    <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ entry.student.fullName || entry.student.username || '—' }}</span></div>
                    <div v-if="entry.student.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ entry.student.cedula }}</span></div>
                  </div>
                  <div class="boletin-divider" />
                  <template v-if="entry.periods.length">
                    <template v-for="(period, pIdx) in entry.periods" :key="period.periodName">
                      <div class="boletin-period-header">{{ period.periodName }}</div>
                      <table class="boletin-table">
                        <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                        <tbody>
                          <tr v-for="row in period.rows" :key="row.subjectId">
                            <td class="td-modulo">{{ row.subjectName }}</td>
                            <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ (row.notaDefinitiva ?? 0).toFixed(1) }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div class="boletin-promedio">
                        <span class="promedio-label">PROMEDIO {{ period.periodName.toUpperCase() }}</span>
                        <span class="promedio-value" :class="notaClass(computePromedio(period.rows))">{{ computePromedio(period.rows).toFixed(1) }}</span>
                      </div>
                      <div v-if="pIdx < entry.periods.length - 1" class="boletin-divider" style="margin:12px 0" />
                    </template>
                  </template>
                  <div v-else style="padding:24px;text-align:center;color:#8E8E93;font-size:14px">
                    📅 Sin periodos — no hay datos de notas disponibles.
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
                  <template v-if="isIncatInstitution()">
                    <div class="incat-sig-block" style="margin-top:16px">
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
                  </template>
                </div>
              </template>
            </template>

            <!-- Step 1: Course selection -->
            <template v-else-if="!selectedCourse">
              <p class="step-hint">Selecciona un curso para generar el boletín</p>
              <div v-if="loadingCourses" class="bulletin-loading">
                <div class="spinner-bulletin" />
                <p>Cargando cursos…</p>
              </div>
              <template v-else>
                <button class="view-all-btn view-all-btn--platform" @click="generatePlatformBulletin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Generar boletín de toda la plataforma
                </button>
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
            </template>

            <!-- Step 2: Delegate to BulletinModal-like flow -->
            <template v-else>
              <button class="back-to-list" @click="selectedCourse = null; selectedStudent = null; subjectsForCourse = []">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
                Seleccionar otro curso
              </button>
              <p class="step-course-name">{{ selectedCourse.title }}</p>

              <!-- Period selector bar -->
              <div v-if="availablePeriods.length >= 1" class="period-bar">
                <button
                  v-for="p in availablePeriods"
                  :key="String(p.periodNumber)"
                  class="period-chip"
                  :class="{ 'period-chip--selected': selectedPeriodNumber === p.periodNumber }"
                  @click="selectPeriodOption(p.periodNumber)"
                >
                  {{ p.name }}
                </button>
              </div>

              <div v-if="loadingSubjects" class="bulletin-loading">
                <div class="spinner-bulletin" />
                <p>Cargando materias…</p>
              </div>

              <!-- Student selector -->
              <template v-else-if="!selectedStudent && !showAllBulletins">
                <div v-if="loadingStudents" class="bulletin-loading">
                  <div class="spinner-bulletin" />
                  <p>Cargando estudiantes…</p>
                </div>
                <template v-else>
                  <button v-if="allStudents.length" class="view-all-btn" @click="selectAllStudents">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    Generar boletín de todos ({{ allStudents.length }})
                  </button>
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

              <template v-else-if="showAllBulletins">
                <button class="back-to-list" @click="showAllBulletins = false; allBulletinData = []">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
                  Volver a estudiantes
                </button>

                <div v-if="loadingAllBulletins" class="bulletin-loading">
                  <div class="spinner-bulletin" />
                  <p>Generando boletines de todos los estudiantes…</p>
                </div>

                <template v-else>
                  <!-- All-periods mode -->
                  <template v-if="selectedPeriodNumber === -999">
                    <div v-if="allPeriodsAllData.length" class="bulletin-export-bar bulletin-export-bar--top">
                      <button class="export-btn export-pdf" @click="exportAllPeriodsAllPDF">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        PDF todos
                      </button>
                      <button class="export-btn export-excel" @click="exportAllPeriodsAllExcel">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                        Excel todos
                      </button>
                      <button class="export-btn export-word" @click="exportAllPeriodsAllWord">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                        Word todos
                      </button>
                    </div>
                    <div v-for="entry in allPeriodsAllData" :key="entry.student.userId" class="bulletin-card bulletin-card--all">
                      <div class="boletin-header-top">
                        <div class="boletin-logo-placeholder">
                          <img v-if="institutionLogoUrl" :src="institutionLogoUrl" alt="Escudo" style="width:50px;height:auto" />
                          <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        </div>
                        <div class="boletin-institution">
                          <span class="boletin-inst-name">{{ getInstitutionDisplayName() }}</span>
                          <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                          <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                        </div>
                      </div>
                      <div class="boletin-divider" />
                      <div class="boletin-info-grid">
                        <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ selectedCourse?.category?.toLowerCase() === 'bachillerato' ? selectedCourse.category : (selectedCourse?.title || '—') }}</span></div>
                        <div v-if="selectedCourse?.category?.toLowerCase() === 'bachillerato'" class="boletin-info-row"><span class="boletin-label">CICLO:</span><span class="boletin-value">{{ selectedCourse?.title || '—' }}</span></div>
                        <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ entry.student.fullName || entry.student.username || '—' }}</span></div>
                        <div v-if="entry.student.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ entry.student.cedula }}</span></div>
                      </div>
                      <div class="boletin-divider" />
                      <template v-if="entry.periods.length">
                          <div class="boletin-period-header">{{ period.periodName }}</div>
                          <table class="boletin-table">
                            <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                            <tbody>
                              <tr v-for="row in period.rows" :key="row.subjectId">
                                <td class="td-modulo">{{ row.subjectName }}</td>
                                <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ (row.notaDefinitiva ?? 0).toFixed(1) }}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div class="boletin-promedio">
                            <span class="promedio-label">PROMEDIO {{ period.periodName.toUpperCase() }}</span>
                            <span class="promedio-value" :class="notaClass(computePromedio(period.rows))">{{ computePromedio(period.rows).toFixed(1) }}</span>
                          </div>
                          <div v-if="pIdx < entry.periods.length - 1" class="boletin-divider" style="margin:12px 0" />
                        </template>
                      </template>
                      <div v-else style="padding:24px;text-align:center;color:#8E8E93;font-size:14px">
                        📅 Sin periodos — no hay datos de notas disponibles.
                      </div>
                      <div class="boletin-divider" />
                      <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
                      <template v-if="isIncatInstitution()">
                        <div class="incat-sig-block" style="margin-top:16px">
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
                      </template>
                    </div>
                  </template>
                  <!-- Single period mode -->
                  <template v-else>
                  <div v-for="entry in allBulletinData" :key="entry.student.userId" class="bulletin-card bulletin-card--all">
                    <div class="boletin-header-top">
                      <div class="boletin-logo-placeholder">
                        <img v-if="institutionLogoUrl" :src="institutionLogoUrl" alt="Escudo" style="width:50px;height:auto" />
                        <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      </div>
                      <div class="boletin-institution">
                        <span class="boletin-inst-name">{{ getInstitutionDisplayName() }}</span>
                        <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                        <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                      </div>
                    </div>
                    <div class="boletin-divider" />
                    <div class="boletin-info-grid">
                      <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ selectedCourse?.category?.toLowerCase() === 'bachillerato' ? selectedCourse.category : (selectedCourse?.title || '—') }}</span></div>
                      <div v-if="selectedCourse?.category?.toLowerCase() === 'bachillerato'" class="boletin-info-row"><span class="boletin-label">CICLO:</span><span class="boletin-value">{{ selectedCourse?.title || '—' }}</span></div>
                      <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ entry.student.fullName || entry.student.username || '—' }}</span></div>
                      <div v-if="entry.student.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ entry.student.cedula }}</span></div>
                      <div class="boletin-info-row"><span class="boletin-label">PERIODO:</span><span class="boletin-value">{{ currentPeriod }}</span></div>
                    </div>
                    <div class="boletin-divider" />
                    <template v-if="entry.rows.length">
                    <table class="boletin-table">
                      <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                      <tbody>
                        <tr v-for="row in entry.rows" :key="row.subjectId">
                          <td class="td-modulo">{{ row.subjectName }}</td>
                          <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ (row.notaDefinitiva ?? 0).toFixed(1) }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="boletin-promedio">
                      <span class="promedio-label">PROMEDIO GENERAL</span>
                      <span class="promedio-value" :class="notaClass(computePromedio(entry.rows))">{{ computePromedio(entry.rows).toFixed(1) }}</span>
                    </div>
                    </template>
                    <div v-else style="padding:24px;text-align:center;color:#8E8E93;font-size:14px">
                      📅 Sin periodo activo — no hay datos de notas disponibles.
                    </div>
                    <div class="boletin-divider" />
                    <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
                    <template v-if="isIncatInstitution()">
                      <div class="incat-sig-block" style="margin-top:16px">
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
                    </template>
                  </div>

                  <div v-if="allBulletinData.length" class="bulletin-export-bar">
                    <button class="export-btn export-pdf" @click="exportAllBulletinsPDF">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      PDF de todos
                    </button>
                    <button class="export-btn export-excel" @click="exportAllBulletinsExcel">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                      Excel todos
                    </button>
                    <button class="export-btn export-word" @click="exportAllBulletinsWord">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                      Word todos
                    </button>
                  </div>
                  </template><!-- end single-period all-students -->
                </template><!-- end all-periods/single-period switch -->
              </template>

              <!-- Bulletin preview -->
              <template v-else>
                <button class="back-to-list" @click="selectedStudent = null; bulletinRows = []" style="margin-top:4px">
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
                      <img v-if="institutionLogoUrl" :src="institutionLogoUrl" alt="Escudo" style="width:50px;height:auto" />
                      <svg v-else width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6A1B9A" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div class="boletin-institution">
                      <span class="boletin-inst-name">{{ getInstitutionDisplayName() }}</span>
                      <span v-if="isIncatInstitution()" class="boletin-inst-subtitle" style="font-size:9px;line-height:1.3;color:#666;display:block">Licencia de funcionamiento Resolución No 439 del 26 /10/ 2010. Emanada de S. E. M<br/>Licencia de funcionamiento resolución Nº1952 del 17/12/2010. Emanada de S. E. D.<br/>Institución Educativa De Formación para el trabajo y el desarrollo humano<br/>NIT: 900391687-0</span>
                      <span v-else class="boletin-inst-subtitle">Plataforma Educativa</span>
                    </div>
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-info-grid">
                    <div class="boletin-info-row"><span class="boletin-label">PROGRAMA:</span><span class="boletin-value">{{ selectedCourse?.category?.toLowerCase() === 'bachillerato' ? selectedCourse.category : selectedCourse.title }}</span></div>
                    <div v-if="selectedCourse?.category?.toLowerCase() === 'bachillerato'" class="boletin-info-row"><span class="boletin-label">CICLO:</span><span class="boletin-value">{{ selectedCourse.title }}</span></div>
                    <div class="boletin-info-row"><span class="boletin-label">ESTUDIANTE:</span><span class="boletin-value">{{ selectedStudent?.fullName || selectedStudent?.username || '—' }}</span></div>
                    <div v-if="selectedStudent?.cedula" class="boletin-info-row"><span class="boletin-label">IDENTIFICACIÓN:</span><span class="boletin-value">{{ selectedStudent?.cedula }}</span></div>
                    <div class="boletin-info-row"><span class="boletin-label">PERIODO:</span><span class="boletin-value">{{ currentPeriod }}</span></div>
                  </div>
                  <div class="boletin-divider" />
                  <template v-if="selectedPeriodNumber === -999 && allPeriodsSingleStudent.length">
                    <template v-for="(period, pIdx) in allPeriodsSingleStudent" :key="period.periodName">
                      <div class="boletin-period-header">{{ period.periodName }}</div>
                      <table class="boletin-table">
                        <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                        <tbody>
                          <tr v-for="row in period.rows" :key="row.subjectId">
                            <td class="td-modulo">{{ row.subjectName }}</td>
                            <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ (row.notaDefinitiva ?? 0).toFixed(1) }}</td>
                          </tr>
                        </tbody>
                      </table>
                      <div class="boletin-promedio">
                        <span class="promedio-label">PROMEDIO {{ period.periodName.toUpperCase() }}</span>
                        <span class="promedio-value" :class="notaClass(computePromedio(period.rows))">{{ computePromedio(period.rows).toFixed(1) }}</span>
                      </div>
                      <div v-if="pIdx < allPeriodsSingleStudent.length - 1" class="boletin-divider" style="margin:12px 0" />
                    </template>
                  </template>
                  <template v-else-if="bulletinRows.length">
                  <table class="boletin-table">
                    <thead><tr><th class="th-modulo">MÓDULO</th><th class="th-nota">NOTA DEFINITIVA</th></tr></thead>
                    <tbody>
                      <tr v-for="row in bulletinRows" :key="row.subjectId">
                        <td class="td-modulo">{{ row.subjectName }}</td>
                        <td class="td-nota" :class="notaClass(row.notaDefinitiva)">{{ (row.notaDefinitiva ?? 0).toFixed(1) }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="boletin-promedio">
                    <span class="promedio-label">PROMEDIO GENERAL</span>
                    <span class="promedio-value" :class="notaClass(promedioGeneral)">{{ (promedioGeneral ?? 0).toFixed(1) }}</span>
                  </div>
                  </template>
                  <div v-else style="padding:24px;text-align:center;color:#8E8E93;font-size:14px">
                    📅 Sin periodo activo — no hay datos de notas disponibles.
                  </div>
                  <div class="boletin-divider" />
                  <div class="boletin-footer"><p class="boletin-generated">Generado el {{ generatedDate }}</p></div>
                  <!-- INCAT signature + footer -->
                  <template v-if="isIncatInstitution()">
                    <div class="incat-sig-block" style="margin-top:16px">
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
                  </template>
                </div>

                <div class="bulletin-export-bar">
                  <button class="export-btn export-pdf" @click="selectedPeriodNumber === -999 ? exportAllPeriodsSinglePDF() : exportBulletinPDF()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    PDF
                  </button>
                  <button class="export-btn export-excel" @click="selectedPeriodNumber === -999 ? exportAllPeriodsSingleExcel() : exportBulletinExcel()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                    Excel
                  </button>
                  <button class="export-btn export-word" @click="selectedPeriodNumber === -999 ? exportAllPeriodsSingleWord() : exportBulletinWord()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
                    Word
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
import { courseAdapter, subjectAdapter } from '@/infrastructure/api'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { GradeSheet, GradeSheetStudent } from '@/infrastructure/api/gradeAdapter'
import { periodAdapter } from '@/infrastructure/api/periodAdapter'
import type { GradePeriod } from '@/infrastructure/api/periodAdapter'
import { buildInstitutionHeaderHTML, getInstitutionLogoUrl, getInstitutionDisplayName, isIncatInstitution, institutionHeaderCSS, buildInstitutionSignatureAndFooterHTML, institutionSignatureAndFooterCSS, getInstitutionFooterLines } from '@/utils/institutionHeader'

const props = defineProps<{ modelValue: boolean; startPlatform?: boolean }>()
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
const loadingAllBulletins = ref(false)
const isExpanded = ref(false)
const allCourses = ref<Course[]>([])
const loadingCourses = ref(false)
const activePeriodName = ref<string | null>(null)
const subjectPeriodsMap = ref(new Map<number, GradePeriod[]>())
const selectedPeriodNumber = ref<number | null>(null)

interface BulletinRow { subjectId: number; subjectName: string; notaDefinitiva: number | null }
const bulletinRows = ref<BulletinRow[]>([])
interface AllBulletinEntry { student: GradeSheetStudent; rows: BulletinRow[] }
const allBulletinData = ref<AllBulletinEntry[]>([])
const showAllBulletins = ref(false)

// ── Platform-wide bulletin (all courses × all subjects × all students) ────
interface PlatformBulletinEntry {
  student: GradeSheetStudent
  courseTitle: string
  courseCategory?: string
  periods: { periodName: string; rows: BulletinRow[] }[]
}
const showPlatformBulletin = ref(false)
const loadingPlatformBulletin = ref(false)
const platformBulletinData = ref<PlatformBulletinEntry[]>([])

interface AllPeriodsEntry { periodName: string; rows: BulletinRow[] }
const allPeriodsSingleStudent = ref<AllPeriodsEntry[]>([])
interface AllPeriodsAllEntry { student: GradeSheetStudent; periods: AllPeriodsEntry[] }
const allPeriodsAllData = ref<AllPeriodsAllEntry[]>([])

const availablePeriods = computed(() => {
  const periodsByNumber = new Map<number, string>()
  for (const periods of subjectPeriodsMap.value.values()) {
    for (const p of periods) {
      if (p.snapshot !== null && !periodsByNumber.has(p.periodNumber)) {
        periodsByNumber.set(p.periodNumber, p.name)
      }
    }
  }
  const sorted = [...periodsByNumber.entries()].sort((a, b) => a[0] - b[0])
  const historicalEntries = sorted.map(([num, name]) => ({ periodNumber: num as number | null, name }))
  let entries: { periodNumber: number | null; name: string }[]
  if (activePeriodName.value) {
    entries = [
      { periodNumber: null as number | null, name: 'Periodo actual' },
      ...historicalEntries
    ]
  } else {
    entries = historicalEntries
  }
  if (entries.length >= 2) {
    entries.push({ periodNumber: -999, name: 'Todos los periodos' })
  }
  return entries
})

const filteredCourses = computed(() => {
  const courses = allCourses.value.length > 0 ? allCourses.value : courseStore.courses
  if (!courseSearch.value.trim()) return courses
  const q = courseSearch.value.toLowerCase()
  return courses.filter(c => (c.title || '').toLowerCase().includes(q))
})

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
  if (selectedPeriodNumber.value === -999) return 'Todos los periodos'
  if (selectedPeriodNumber.value === null) {
    if (activePeriodName.value) return activePeriodName.value
    const now = new Date()
    const semester = now.getMonth() < 6 ? 'I' : 'II'
    return `${semester} PERIODO ${now.getFullYear()}-${semester === 'I' ? 'A' : 'B'}`
  }
  for (const periods of subjectPeriodsMap.value.values()) {
    const found = periods.find(p => p.periodNumber === selectedPeriodNumber.value)
    if (found) return found.name
  }
  return `Periodo ${selectedPeriodNumber.value}`
})

const generatedDate = computed(() =>
  new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
)

const institutionLogoUrl = computed(() => getInstitutionLogoUrl())

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

watch(() => props.modelValue, async (open) => {
  if (open) {
    isExpanded.value = false
    selectedCourse.value = null
    selectedStudent.value = null
    courseSearch.value = ''
    studentSearch.value = ''
    bulletinRows.value = []
    allBulletinData.value = []
    showAllBulletins.value = false
    showPlatformBulletin.value = false
    platformBulletinData.value = []
    subjectsForCourse.value = []
    selectedPeriodNumber.value = null
    subjectPeriodsMap.value = new Map()
    // Cargar todos los cursos desde la API para no depender de la paginación del store
    if (allCourses.value.length === 0) {
      loadingCourses.value = true
      try {
        allCourses.value = await courseAdapter.getCourses(1, 300)
      } catch {
        allCourses.value = []
      } finally {
        loadingCourses.value = false
      }
    }
    if (props.startPlatform) {
      generatePlatformBulletin()
    }
  }
})

async function pickCourse(course: Course) {
  selectedCourse.value = course
  selectedStudent.value = null
  showAllBulletins.value = false
  bulletinRows.value = []
  allBulletinData.value = []
  selectedPeriodNumber.value = null
  subjectPeriodsMap.value = new Map()
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
    await loadAllPeriods()
    // Auto-select most recent period with data
    const periods = availablePeriods.value
    if (periods.length > 0) {
      selectedPeriodNumber.value = activePeriodName.value
        ? null
        : (p => p.length > 0 ? p[p.length - 1].periodNumber : null)(periods.filter(p => p.periodNumber !== -999))
    }
  } catch { subjectsForCourse.value = [] }
  finally { loadingSubjects.value = false }
}

async function loadAllPeriods() {
  activePeriodName.value = null
  subjectPeriodsMap.value = new Map()
  if (!selectedCourse.value) return
  try {
    const periods = await periodAdapter.listByCourse(selectedCourse.value.id) as GradePeriod[]
    const map = new Map<number, GradePeriod[]>()
    for (const p of periods) {
      if (!map.has(p.subjectId)) map.set(p.subjectId, [])
      map.get(p.subjectId)!.push(p)
      if (!activePeriodName.value && p.snapshot == null) {
        activePeriodName.value = p.name
      }
    }
    subjectPeriodsMap.value = map
  } catch { /* silent */ }
}

async function selectPeriodOption(periodNumber: number | null) {
  selectedPeriodNumber.value = periodNumber
  if (selectedStudent.value) {
    await selectStudent(selectedStudent.value)
  } else if (showAllBulletins.value) {
    await selectAllStudents()
  }
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

async function getGradeSheetsCache() {
  const cache = new Map<number, GradeSheet | null>()
  await Promise.allSettled(
    subjectsForCourse.value.map(subject =>
      gradeAdapter.getGradeSheet(subject.id).then(sheet => {
        cache.set(subject.id, sheet ?? null)
      }).catch(() => {
        cache.set(subject.id, null)
      })
    )
  )
  return cache
}

async function computeRowsForStudent(student: GradeSheetStudent, sheetsCache: Map<number, GradeSheet | null>) {
  const rows: BulletinRow[] = []

  for (const subject of subjectsForCourse.value) {
    let sheet: GradeSheet | null
    if (selectedPeriodNumber.value === null) {
      // Active period: use live grade sheets
      sheet = sheetsCache.get(subject.id) ?? null
      if (!sheet || sheet.hasActivePeriod === false) continue
    } else {
      // Closed period: use snapshot
      const periods = subjectPeriodsMap.value.get(subject.id) ?? []
      const period = periods.find(p => p.periodNumber === selectedPeriodNumber.value)
      sheet = period?.snapshot ?? null
      if (!sheet) continue
    }

    const totalTasks = sheet.tasks.length
    const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
    const taskSum = stTaskGrades.reduce((sum, tg) => sum + (tg.grade ?? 0), 0)
    const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null

    const activeCategories = new Set(sheet.manualGrades.map(mg => String(mg.gradeType).replace(/_\d+$/, '')))
    const stManualGrades = sheet.manualGrades.filter(mg => Number(mg.studentId) === student.userId)
    const byType: Record<string, number[]> = {}
    for (const mg of stManualGrades) {
      const base = String(mg.gradeType).replace(/_\d+$/, '')
      if (!byType[base]) byType[base] = []
      byType[base].push(Number(mg.grade))
    }

    const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    const participacionAvg = byType.participacion?.length ? avgArr(byType.participacion) : (activeCategories.has('participacion') ? 0 : null)
    const examenesAvg = byType.examenes?.length ? avgArr(byType.examenes) : (activeCategories.has('examenes') ? 0 : null)
    const comportamientoAvg = byType.comportamiento?.length ? avgArr(byType.comportamiento) : (activeCategories.has('comportamiento') ? 0 : null)
    const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((value): value is number => value !== null)
    const nota = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0

    rows.push({
      subjectId: subject.id,
      subjectName: subject.name,
      notaDefinitiva: Math.round(nota * 10) / 10,
    })
  }

  return rows
}

function computePromedio(rows: BulletinRow[]) {
  const grades = rows.filter(row => row.notaDefinitiva != null).map(row => row.notaDefinitiva as number)
  if (!grades.length) return 0
  return grades.reduce((a, b) => a + b, 0) / grades.length
}

function computeStudentNota(student: GradeSheetStudent, sheet: GradeSheet): number | null {
  const totalTasks = sheet.tasks.length
  const stTaskGrades = sheet.taskGrades.filter(tg => Number(tg.studentId) === student.userId)
  const taskSum = stTaskGrades.reduce((sum, tg) => sum + (tg.grade ?? 0), 0)
  const taskAvg = totalTasks > 0 ? taskSum / totalTasks : null
  const activeCategories = new Set(sheet.manualGrades.map((mg: any) => String(mg.gradeType).replace(/_\d+$/, '')))
  const stManualGrades = sheet.manualGrades.filter((mg: any) => Number(mg.studentId) === student.userId)
  const byType: Record<string, number[]> = {}
  for (const mg of stManualGrades) {
    const base = String(mg.gradeType).replace(/_\d+$/, '')
    if (!byType[base]) byType[base] = []
    byType[base].push(Number(mg.grade))
  }
  const avgArr = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
  const participacionAvg = byType.participacion?.length ? avgArr(byType.participacion) : (activeCategories.has('participacion') ? 0 : null)
  const examenesAvg = byType.examenes?.length ? avgArr(byType.examenes) : (activeCategories.has('examenes') ? 0 : null)
  const comportamientoAvg = byType.comportamiento?.length ? avgArr(byType.comportamiento) : (activeCategories.has('comportamiento') ? 0 : null)
  const vals = [taskAvg, participacionAvg, examenesAvg, comportamientoAvg].filter((v): v is number => v !== null)
  return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null
}

function computeAllPeriodRows(
  student: GradeSheetStudent,
  subjects: { id: number; name: string }[],
  sheetsCache: Map<number, GradeSheet | null>,
  periodsCache: Map<number, GradePeriod[]>,
): { periodName: string; rows: BulletinRow[] }[] {
  const result: { periodName: string; rows: BulletinRow[] }[] = []
  const allPeriodNumbers = new Map<number, string>()
  let hasActivePeriod = false
  let activePeriodLabel = ''
  for (const s of subjects) {
    const periods = periodsCache.get(s.id) ?? []
    for (const p of periods) {
      if (p.snapshot !== null && !allPeriodNumbers.has(p.periodNumber)) {
        allPeriodNumbers.set(p.periodNumber, p.name)
      } else if (p.snapshot === null) {
        hasActivePeriod = true
        if (!activePeriodLabel) activePeriodLabel = p.name
      }
    }
  }
  const sortedPeriods = [...allPeriodNumbers.entries()].sort((a, b) => a[0] - b[0])
  for (const [periodNum, periodName] of sortedPeriods) {
    const rows: BulletinRow[] = []
    for (const s of subjects) {
      const periods = periodsCache.get(s.id) ?? []
      const period = periods.find(p => p.periodNumber === periodNum)
      if (!period?.snapshot) continue
      const nota = computeStudentNota(student, period.snapshot)
      if (nota !== null) rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: nota })
    }
    if (rows.length > 0) result.push({ periodName, rows })
  }
  if (hasActivePeriod) {
    const rows: BulletinRow[] = []
    for (const s of subjects) {
      const sheet = sheetsCache.get(s.id)
      if (!sheet || sheet.hasActivePeriod === false) continue
      const nota = computeStudentNota(student, sheet)
      if (nota !== null) rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: nota })
    }
    if (rows.length > 0) result.push({ periodName: activePeriodLabel || 'Periodo actual', rows })
  }
  if (result.length === 0) {
    const rows: BulletinRow[] = []
    for (const s of subjects) {
      const sheet = sheetsCache.get(s.id)
      if (!sheet) continue
      const nota = computeStudentNota(student, sheet)
      if (nota !== null) rows.push({ subjectId: s.id, subjectName: s.name, notaDefinitiva: nota })
    }
    if (rows.length > 0) {
      const now = new Date()
      const sem = now.getMonth() < 6 ? 'I' : 'II'
      result.push({ periodName: `${sem} PERIODO ${now.getFullYear()}`, rows })
    }
  }
  return result
}

async function selectStudent(student: GradeSheetStudent) {
  selectedStudent.value = student
  showAllBulletins.value = false
  loadingBulletin.value = true
  bulletinRows.value = []
  allPeriodsSingleStudent.value = []
  try {
    const sheetsCache = await getGradeSheetsCache()
    if (selectedPeriodNumber.value === -999) {
      allPeriodsSingleStudent.value = computeAllPeriodRows(student, subjectsForCourse.value.map(s => ({ id: s.id, name: s.name })), sheetsCache, subjectPeriodsMap.value)
    } else {
      bulletinRows.value = await computeRowsForStudent(student, sheetsCache)
    }
  } catch { /* silent */ }
  finally { loadingBulletin.value = false }
}

async function selectAllStudents() {
  showAllBulletins.value = true
  selectedStudent.value = null
  loadingAllBulletins.value = true
  allBulletinData.value = []
  allPeriodsAllData.value = []
  try {
    const sheetsCache = await getGradeSheetsCache()
    if (selectedPeriodNumber.value === -999) {
      const subjectsMeta = subjectsForCourse.value.map(s => ({ id: s.id, name: s.name }))
      const entries: AllPeriodsAllEntry[] = []
      for (const student of allStudents.value) {
        const periods = computeAllPeriodRows(student, subjectsMeta, sheetsCache, subjectPeriodsMap.value)
        entries.push({ student, periods })
      }
      allPeriodsAllData.value = entries
    } else {
      const entries: AllBulletinEntry[] = []
      for (const student of allStudents.value) {
        const rows = await computeRowsForStudent(student, sheetsCache)
        entries.push({ student, rows })
      }
      allBulletinData.value = entries
    }
  } catch { /* silent */ }
  finally { loadingAllBulletins.value = false }
}

function escH(s: string) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

function isBach(cat?: string): boolean {
  return (cat || '').toLowerCase() === 'bachillerato'
}

function buildProgramaBlock(title: string, cat?: string): string {
  if (isBach(cat)) return `<span class="label">Programa:</span><span class="value">${escH(cat!)}</span>\n<span class="label">Ciclo:</span><span class="value">${escH(title)}</span>`
  return `<span class="label">Programa:</span><span class="value">${escH(title)}</span>`
}

function buildProgramaWordLine(title: string, cat?: string): string {
  if (isBach(cat)) return `<p><b>Programa:</b> ${escH(cat!)}</p><p><b>Ciclo:</b> ${escH(title)}</p>`
  return `<p><b>Programa:</b> ${escH(title)}</p>`
}

function buildProgramaXmlRows(title: string, cat?: string): string {
  if (isBach(cat)) return `<Row><Cell><Data ss:Type="String">Programa</Data></Cell><Cell><Data ss:Type="String">${escH(cat!)}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Ciclo</Data></Cell><Cell><Data ss:Type="String">${escH(title)}</Data></Cell></Row>`
  return `<Row><Cell><Data ss:Type="String">Programa</Data></Cell><Cell><Data ss:Type="String">${escH(title)}</Data></Cell></Row>`
}

function exportBulletinPDF() {
  const st = selectedStudent.value
  const name = escH(st?.fullName || st?.username || 'Estudiante')
  const prom = promedioGeneral.value
  let rows = ''
  for (const row of bulletinRows.value) {
    const nota = (row.notaDefinitiva ?? 0).toFixed(1)
    const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
    rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
  }
  const promColor = prom != null ? (prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C') : '#999'
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletín - ${name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#222;max-width:700px;margin:0 auto}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}.prom-value{font-size:20px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:20px}table{page-break-inside:avoid}}
${institutionHeaderCSS()}
${institutionSignatureAndFooterCSS()}
</style></head><body>
${buildInstitutionHeaderHTML('CourseV')}
<div class="info">${buildProgramaBlock(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<span class="label">Estudiante:</span><span class="value">${name}</span>${st?.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}<span class="label">Periodo:</span><span class="value">${escH(currentPeriod.value)}</span></div>
<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>${rows}</tbody></table>
<div class="promedio"><span class="prom-label">Promedio General</span><span class="prom-value" style="color:${promColor}">${(prom ?? 0).toFixed(1)}</span></div>
<div class="footer">Generado el ${generatedDate.value}</div>${buildInstitutionSignatureAndFooterHTML()}</body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportAllBulletinsPDF() {
  const pages: string[] = []

  for (const entry of allBulletinData.value) {
    const student = entry.student
    const name = escH(student.fullName || student.username || 'Estudiante')
    const prom = computePromedio(entry.rows)
    let rows = ''

    for (const row of entry.rows) {
      const nota = (row.notaDefinitiva ?? 0).toFixed(1)
      const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
      rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
    }

    const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
    pages.push(`
<div class="page">
${buildInstitutionHeaderHTML(getInstitutionDisplayName())}
<div class="info">${buildProgramaBlock(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<span class="label">Estudiante:</span><span class="value">${name}</span>${student.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(student.cedula)}</span>` : ''}<span class="label">Periodo:</span><span class="value">${escH(currentPeriod.value)}</span></div>
<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>${rows}</tbody></table>
<div class="promedio"><span class="prom-label">Promedio General</span><span class="prom-value" style="color:${promColor}">${prom.toFixed(1)}</span></div>
<div class="footer">Generado el ${generatedDate.value}</div>${buildInstitutionSignatureAndFooterHTML()}
</div>`)
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletines - ${escH(selectedCourse.value?.title || 'Curso')}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;color:#222;max-width:700px;margin:0 auto}.page{page-break-after:always;padding:20px 0 40px}.page:last-child{page-break-after:avoid}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}.prom-value{font-size:20px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:0}.page{padding:10px 0 20px}}
${institutionHeaderCSS()}
${institutionSignatureAndFooterCSS()}
</style></head><body>${pages.join('')}</body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportBulletinExcel() {
  const st = selectedStudent.value
  const studentName = st?.fullName || st?.username || 'Estudiante'
  const rows = bulletinRows.value.map(r =>
    `<Row><Cell><Data ss:Type="String">${escH(r.subjectName)}</Data></Cell><Cell><Data ss:Type="Number">${(r.notaDefinitiva ?? 0)}</Data></Cell></Row>`
  ).join('')
  const prom = promedioGeneral.value
  const courseName = escH(selectedCourse.value?.title || '—')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A1B9A" ss:Pattern="Solid"/></Style><Style ss:ID="b"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Boletín"><Table>${buildProgramaXmlRows(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<Row><Cell><Data ss:Type="String">Estudiante</Data></Cell><Cell><Data ss:Type="String">${escH(studentName)}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Periodo</Data></Cell><Cell><Data ss:Type="String">${escH(currentPeriod.value)}</Data></Cell></Row><Row/><Row><Cell ss:StyleID="h"><Data ss:Type="String">MÓDULO</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">NOTA DEFINITIVA</Data></Cell></Row>${rows}<Row><Cell ss:StyleID="b"><Data ss:Type="String">PROMEDIO GENERAL</Data></Cell><Cell ss:StyleID="b"><Data ss:Type="Number">${(prom ?? 0).toFixed(1)}</Data></Cell></Row></Table></Worksheet></Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boletin_${studentName.replace(/\s+/g, '_')}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

function exportBulletinWord() {
  const st = selectedStudent.value
  const studentName = st?.fullName || st?.username || 'Estudiante'
  const name = escH(studentName)
  const prom = promedioGeneral.value
  const promColor = prom != null ? (prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C') : '#999'
  let rows = ''
  for (const row of bulletinRows.value) {
    const nota = (row.notaDefinitiva ?? 0).toFixed(1)
    const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
    rows += `<tr><td style="font-weight:bold;text-transform:uppercase;padding:8px 12px;border-bottom:1px solid #eee">${escH(row.subjectName)}</td><td style="text-align:center;font-weight:800;color:${color};padding:8px 12px;border-bottom:1px solid #eee">${nota}</td></tr>`
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:40px;color:#222}table{width:100%;border-collapse:collapse;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px}td{padding:8px;border-bottom:1px solid #ddd}</style></head><body><h1 style="color:#6A1B9A">BOLETÍN DE NOTAS</h1>${buildProgramaWordLine(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<p><b>Estudiante:</b> ${name}</p>${st?.cedula ? `<p><b>Identificación:</b> ${escH(st.cedula)}</p>` : ''}<p><b>Periodo:</b> ${escH(currentPeriod.value)}</p><table><thead><tr><th style="text-align:left">MÓDULO</th><th>NOTA DEFINITIVA</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:16px"><b>PROMEDIO GENERAL: <span style="color:${promColor}">${(prom ?? 0).toFixed(1)}</span></b></p></body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boletin_${studentName.replace(/\s+/g, '_')}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

function exportAllBulletinsExcel() {
  const subjects = subjectsForCourse.value
  const subjectHeaders = subjects.map(s => `<Cell ss:StyleID="h"><Data ss:Type="String">${escH(s.name)}</Data></Cell>`).join('')
  const dataRows = allBulletinData.value.map(entry => {
    const name = escH(entry.student.fullName || entry.student.username || 'Estudiante')
    const prom = computePromedio(entry.rows)
    const cells = entry.rows.map(r => `<Cell><Data ss:Type="Number">${(r.notaDefinitiva ?? 0).toFixed(1)}</Data></Cell>`).join('')
    return `<Row><Cell><Data ss:Type="String">${name}</Data></Cell>${cells}<Cell ss:StyleID="b"><Data ss:Type="Number">${prom.toFixed(1)}</Data></Cell></Row>`
  }).join('')
  const courseName = escH(selectedCourse.value?.title || '—')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A1B9A" ss:Pattern="Solid"/></Style><Style ss:ID="b"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Boletines"><Table><Row><Cell><Data ss:Type="String">${isBach(selectedCourse.value?.category) ? 'Programa: ' + escH(selectedCourse.value!.category!) + '&#13;&#10;Ciclo: ' + escH(selectedCourse.value?.title || '—') : 'Programa: ' + escH(selectedCourse.value?.title || '—')}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Periodo: ${escH(currentPeriod.value)}</Data></Cell></Row><Row/><Row><Cell ss:StyleID="h"><Data ss:Type="String">ESTUDIANTE</Data></Cell>${subjectHeaders}<Cell ss:StyleID="h"><Data ss:Type="String">PROMEDIO</Data></Cell></Row>${dataRows}</Table></Worksheet></Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boletines_todos_${(selectedCourse.value?.title || 'curso').replace(/\s+/g, '_')}.xls`
  a.click()
  URL.revokeObjectURL(url)
}

function exportAllBulletinsWord() {
  const pages = allBulletinData.value.map(entry => {
    const st = entry.student
    const name = escH(st.fullName || st.username || 'Estudiante')
    const prom = computePromedio(entry.rows)
    const rows = entry.rows.map(row => {
      const nota = (row.notaDefinitiva ?? 0).toFixed(1)
      const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
      return `<tr><td style="font-weight:bold;text-transform:uppercase;padding:6px 12px;border-bottom:1px solid #eee">${escH(row.subjectName)}</td><td style="text-align:center;font-weight:800;color:${color};padding:6px 12px;border-bottom:1px solid #eee">${nota}</td></tr>`
    }).join('')
    const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
    return `<div style="page-break-after:always;padding:20px 0"><h2 style="color:#6A1B9A">BOLETÍN DE NOTAS</h2>${buildProgramaWordLine(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<p><b>Estudiante:</b> ${name}</p>${st.cedula ? `<p><b>Identificación:</b> ${escH(st.cedula)}</p>` : ''}<p><b>Periodo:</b> ${escH(currentPeriod.value)}</p><table style="width:100%;border-collapse:collapse;border:2px solid #333;margin-top:12px"><thead><tr><th style="background:#6A1B9A;color:#fff;padding:10px;text-align:left">MÓDULO</th><th style="background:#6A1B9A;color:#fff;padding:10px">NOTA DEFINITIVA</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:12px"><b>PROMEDIO GENERAL: <span style="color:${promColor}">${prom.toFixed(1)}</span></b></p></div>`
  }).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:40px;color:#222}</style></head><body>${pages}</body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `boletines_todos_${(selectedCourse.value?.title || 'curso').replace(/\s+/g, '_')}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

/* ── All-periods single student exports ─────────────────────────────── */
function buildAllPeriodsSingleHTML(forPrint: boolean) {
  const st = selectedStudent.value
  const name = escH(st?.fullName || st?.username || 'Estudiante')
  let body = ''
  for (const period of allPeriodsSingleStudent.value) {
    body += `<h3 style="color:#BF5AF2;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-top:16px;border-bottom:1px solid rgba(191,90,242,0.2);padding-bottom:4px">${escH(period.periodName)}</h3>`
    body += `<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>`
    for (const row of period.rows) {
      const nota = (row.notaDefinitiva ?? 0).toFixed(1)
      const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
      body += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
    }
    body += `</tbody></table>`
    const prom = computePromedio(period.rows)
    const pc = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
    body += `<div class="promedio"><span class="prom-label">Promedio ${escH(period.periodName)}</span><span class="prom-value" style="color:${pc}">${prom.toFixed(1)}</span></div>`
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletín Todos los Periodos - ${name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:40px;color:#222;max-width:700px;margin:0 auto}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:8px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:8px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.prom-value{font-size:18px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:20px}table{page-break-inside:avoid}}
${institutionHeaderCSS()}${institutionSignatureAndFooterCSS()}</style></head><body>
${buildInstitutionHeaderHTML(getInstitutionDisplayName())}
<div class="info">${buildProgramaBlock(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<span class="label">Estudiante:</span><span class="value">${name}</span>${st?.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}<span class="label">Periodo:</span><span class="value">Todos los periodos</span></div>
${body}
<div class="footer">Generado el ${generatedDate.value}</div>${buildInstitutionSignatureAndFooterHTML()}</body></html>`
}

function exportAllPeriodsSinglePDF() {
  const html = buildAllPeriodsSingleHTML(true)
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html); win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportAllPeriodsSingleExcel() {
  const st = selectedStudent.value
  const studentName = st?.fullName || st?.username || 'Estudiante'
  let sheets = ''
  for (const period of allPeriodsSingleStudent.value) {
    const rows = period.rows.map(r =>
      `<Row><Cell><Data ss:Type="String">${escH(r.subjectName)}</Data></Cell><Cell><Data ss:Type="Number">${(r.notaDefinitiva ?? 0)}</Data></Cell></Row>`
    ).join('')
    const prom = computePromedio(period.rows)
    sheets += `<Worksheet ss:Name="${escH(period.periodName).substring(0,31)}"><Table><Row><Cell><Data ss:Type="String">Programa</Data></Cell><Cell><Data ss:Type="String">${escH(selectedCourse.value?.title || '—')}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Estudiante</Data></Cell><Cell><Data ss:Type="String">${escH(studentName)}</Data></Cell></Row><Row><Cell><Data ss:Type="String">Periodo</Data></Cell><Cell><Data ss:Type="String">${escH(period.periodName)}</Data></Cell></Row><Row/><Row><Cell ss:StyleID="h"><Data ss:Type="String">MÓDULO</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">NOTA DEFINITIVA</Data></Cell></Row>${rows}<Row><Cell ss:StyleID="b"><Data ss:Type="String">PROMEDIO</Data></Cell><Cell ss:StyleID="b"><Data ss:Type="Number">${prom.toFixed(1)}</Data></Cell></Row></Table></Worksheet>`
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A1B9A" ss:Pattern="Solid"/></Style><Style ss:ID="b"><Font ss:Bold="1"/></Style></Styles>${sheets}</Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `boletin_todos_periodos_${studentName.replace(/\s+/g, '_')}.xls`; a.click()
  URL.revokeObjectURL(url)
}

function exportAllPeriodsSingleWord() {
  const html = buildAllPeriodsSingleHTML(false)
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const st = selectedStudent.value
  a.href = url; a.download = `boletin_todos_periodos_${(st?.fullName || st?.username || 'est').replace(/\s+/g, '_')}.doc`; a.click()
  URL.revokeObjectURL(url)
}

/* ── All-periods all students exports ──────────────────────────────── */
function buildAllPeriodsAllHTML() {
  let pages = ''
  for (const entry of allPeriodsAllData.value) {
    const st = entry.student
    const name = escH(st.fullName || st.username || 'Estudiante')
    let body = ''
    for (const period of entry.periods) {
      body += `<h3 style="color:#BF5AF2;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;margin-top:16px;border-bottom:1px solid rgba(191,90,242,0.2);padding-bottom:4px">${escH(period.periodName)}</h3>`
      body += `<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>`
      for (const row of period.rows) {
        const nota = (row.notaDefinitiva ?? 0).toFixed(1)
        const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
        body += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
      }
      body += `</tbody></table>`
      const prom = computePromedio(period.rows)
      const pc = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
      body += `<div class="promedio"><span class="prom-label">Promedio ${escH(period.periodName)}</span><span class="prom-value" style="color:${pc}">${prom.toFixed(1)}</span></div>`
    }
    pages += `<div class="page">${buildInstitutionHeaderHTML(getInstitutionDisplayName())}<div class="info">${buildProgramaBlock(selectedCourse.value?.title || '—', selectedCourse.value?.category)}<span class="label">Estudiante:</span><span class="value">${name}</span>${st.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}<span class="label">Periodo:</span><span class="value">Todos los periodos</span></div>${body}<div class="footer">Generado el ${generatedDate.value}</div>${buildInstitutionSignatureAndFooterHTML()}</div>`
  }
  return pages
}

function exportAllPeriodsAllPDF() {
  const pages = buildAllPeriodsAllHTML()
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletines Todos los Periodos</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;color:#222;max-width:700px;margin:0 auto}.page{page-break-after:always;padding:20px 0 40px}.page:last-child{page-break-after:avoid}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:8px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:8px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.prom-value{font-size:18px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:0}.page{padding:10px 0 20px}}
${institutionHeaderCSS()}${institutionSignatureAndFooterCSS()}</style></head><body>${pages}</body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html); win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportAllPeriodsAllExcel() {
  let sheets = ''
  for (const entry of allPeriodsAllData.value) {
    const st = entry.student
    const studentName = escH(st.fullName || st.username || 'Est')
    let allRows = ''
    for (const period of entry.periods) {
      allRows += `<Row><Cell ss:StyleID="b"><Data ss:Type="String">${escH(period.periodName)}</Data></Cell></Row>`
      allRows += period.rows.map(r =>
        `<Row><Cell><Data ss:Type="String">${escH(r.subjectName)}</Data></Cell><Cell><Data ss:Type="Number">${(r.notaDefinitiva ?? 0)}</Data></Cell></Row>`
      ).join('')
      const prom = computePromedio(period.rows)
      allRows += `<Row><Cell ss:StyleID="b"><Data ss:Type="String">PROMEDIO</Data></Cell><Cell ss:StyleID="b"><Data ss:Type="Number">${prom.toFixed(1)}</Data></Cell></Row><Row/>`
    }
    sheets += `<Worksheet ss:Name="${studentName.substring(0,31)}"><Table><Row><Cell ss:StyleID="h"><Data ss:Type="String">MÓDULO</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">NOTA</Data></Cell></Row>${allRows}</Table></Worksheet>`
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A1B9A" ss:Pattern="Solid"/></Style><Style ss:ID="b"><Font ss:Bold="1"/></Style></Styles>${sheets}</Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `boletines_todos_periodos_${(selectedCourse.value?.title || 'curso').replace(/\s+/g, '_')}.xls`; a.click()
  URL.revokeObjectURL(url)
}

function exportAllPeriodsAllWord() {
  const pages = buildAllPeriodsAllHTML()
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:40px;color:#222}.page{page-break-after:always}table{width:100%;border-collapse:collapse;border:2px solid #333;margin-top:8px}th{background:#6A1B9A;color:#fff;padding:10px}td{padding:8px;border-bottom:1px solid #ddd}</style></head><body>${pages}</body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `boletines_todos_periodos_${(selectedCourse.value?.title || 'curso').replace(/\s+/g, '_')}.doc`; a.click()
  URL.revokeObjectURL(url)
}

// ── Generate bulletin for ALL courses × ALL subjects × ALL students ─────
async function generatePlatformBulletin() {
  showPlatformBulletin.value = true
  loadingPlatformBulletin.value = true
  platformBulletinData.value = []
  try {
    const courses = allCourses.value.length > 0 ? allCourses.value : await courseAdapter.getCourses(1, 300)

    // Process ALL courses in parallel for instant generation
    const courseResults = await Promise.allSettled(
      courses.map(async (course) => {
        const rawSubjects: any[] = await subjectAdapter.getSubjectsByCourse(course.id).catch(() => [])
        const subjects = rawSubjects.map((s: any) => ({ id: Number(s.id), name: String(s.name) }))
        if (!subjects.length) return [] as PlatformBulletinEntry[]

        // Load grade sheets AND periods for every subject in parallel
        const [sheetsResults, periodsResults] = await Promise.all([
          Promise.allSettled(subjects.map(s => gradeAdapter.getGradeSheet(s.id))),
          Promise.allSettled(subjects.map(s => periodAdapter.listBySubject(s.id))),
        ])

        const sheetsCache = new Map<number, GradeSheet | null>()
        const periodsCache = new Map<number, GradePeriod[]>()
        const studentMap = new Map<number, GradeSheetStudent>()

        subjects.forEach((s, i) => {
          const sr = sheetsResults[i]
          const sheet = sr.status === 'fulfilled' ? (sr.value ?? null) : null
          sheetsCache.set(s.id, sheet)
          if (sheet) {
            for (const st of sheet.students) {
              if (!studentMap.has(st.userId)) studentMap.set(st.userId, st)
            }
          }
          const pr = periodsResults[i]
          const periods: GradePeriod[] = pr.status === 'fulfilled' ? (pr.value as GradePeriod[] ?? []) : []
          periodsCache.set(s.id, periods)
          for (const p of periods) {
            if (p.snapshot) {
              for (const st of p.snapshot.students) {
                if (!studentMap.has(st.userId)) studentMap.set(st.userId, st)
              }
            }
          }
        })

        const entries: PlatformBulletinEntry[] = []
        for (const student of studentMap.values()) {
          const periods = computeAllPeriodRows(student, subjects, sheetsCache, periodsCache)
          if (periods.length > 0) {
            entries.push({ student, courseTitle: course.title, courseCategory: course.category, periods })
          }
        }
        return entries
      })
    )

    const allEntries: PlatformBulletinEntry[] = []
    for (const result of courseResults) {
      if (result.status === 'fulfilled' && result.value) {
        allEntries.push(...result.value)
      }
    }
    platformBulletinData.value = allEntries
  } catch { /* silent */ }
  finally { loadingPlatformBulletin.value = false }
}

function exportPlatformBulletinPDF() {
  const pages: string[] = []
  for (const entry of platformBulletinData.value) {
    const st = entry.student
    const name = escH(st.fullName || st.username || 'Estudiante')
    let periodsHtml = ''
    for (const period of entry.periods) {
      const prom = computePromedio(period.rows)
      const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
      let rows = ''
      for (const row of period.rows) {
        const nota = (row.notaDefinitiva ?? 0).toFixed(1)
        const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
        rows += `<tr><td class="td-mod">${escH(row.subjectName)}</td><td class="td-nota" style="color:${color}">${nota}</td></tr>`
      }
      periodsHtml += `
<h3 style="color:#6A1B9A;margin:18px 0 6px;font-size:14px;text-transform:uppercase;border-bottom:1px solid #d4c5f0;padding-bottom:4px">${escH(period.periodName)}</h3>
<table><thead><tr><th style="text-align:left">Módulo</th><th>Nota Definitiva</th></tr></thead><tbody>${rows}</tbody></table>
<div class="promedio"><span class="prom-label">Promedio</span><span class="prom-value" style="color:${promColor}">${prom.toFixed(1)}</span></div>`
    }
    pages.push(`
<div class="page">
${buildInstitutionHeaderHTML(getInstitutionDisplayName())}
<div class="info">${buildProgramaBlock(entry.courseTitle, entry.courseCategory)}<span class="label">Estudiante:</span><span class="value">${name}</span>${st.cedula ? `<span class="label">Identificación:</span><span class="value">${escH(st.cedula)}</span>` : ''}</div>
${periodsHtml}
<div class="footer">Generado el ${generatedDate.value}</div>${buildInstitutionSignatureAndFooterHTML()}
</div>`)
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Boletín Plataforma</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:20px;color:#222;max-width:700px;margin:0 auto}.page{page-break-after:always;padding:20px 0 40px}.page:last-child{page-break-after:avoid}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #6A1B9A;padding-bottom:16px}.inst-name{font-size:20px;font-weight:700;color:#6A1B9A;display:block}.inst-sub{font-size:12px;color:#666;display:block;margin-top:2px}.info{margin:20px 0;display:grid;grid-template-columns:auto 1fr;gap:6px 16px}.label{font-weight:700;font-size:13px;text-transform:uppercase;color:#444}.value{font-size:13px;font-weight:600}table{width:100%;border-collapse:collapse;margin-top:20px;border:2px solid #333}th{background:#6A1B9A;color:#fff;padding:10px 16px;font-size:13px;text-transform:uppercase;letter-spacing:0.5px}td{padding:8px 16px;border-bottom:1px solid #ddd;font-size:13px}.td-mod{font-weight:600;text-transform:uppercase}.td-nota{text-align:center;font-weight:700;font-size:15px}.promedio{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;background:#f5f0ff;border-radius:8px;border:1px solid #d4c5f0}.prom-label{font-weight:700;font-size:14px;text-transform:uppercase;color:#444}.prom-value{font-size:20px;font-weight:800}.footer{margin-top:32px;text-align:center;font-size:11px;color:#888}@media print{body{padding:0}.page{padding:10px 0 20px}}
${institutionHeaderCSS()}
${institutionSignatureAndFooterCSS()}
</style></head><body>${pages.join('')}</body></html>`
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.print(); win.close() }
}

function exportPlatformBulletinExcel() {
  const dataRows = platformBulletinData.value.flatMap(entry => {
    const name = escH(entry.student.fullName || entry.student.username || 'Estudiante')
    return entry.periods.map(period => {
      const prom = computePromedio(period.rows)
      const cells = period.rows.map(r => `<Cell><Data ss:Type="Number">${(r.notaDefinitiva ?? 0).toFixed(1)}</Data></Cell>`).join('')
      return `<Row><Cell><Data ss:Type="String">${escH(entry.courseTitle)}</Data></Cell><Cell><Data ss:Type="String">${name}</Data></Cell><Cell><Data ss:Type="String">${escH(period.periodName)}</Data></Cell>${cells}<Cell ss:StyleID="b"><Data ss:Type="Number">${prom.toFixed(1)}</Data></Cell></Row>`
    })
  }).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#6A1B9A" ss:Pattern="Solid"/></Style><Style ss:ID="b"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="Boletín Plataforma"><Table><Row/><Row><Cell ss:StyleID="h"><Data ss:Type="String">CURSO</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">ESTUDIANTE</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">PERIODO</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">MATERIAS</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">PROMEDIO</Data></Cell></Row>${dataRows}</Table></Worksheet></Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'boletin_plataforma.xls'
  a.click()
  URL.revokeObjectURL(url)
}

function exportPlatformBulletinWord() {
  const pages = platformBulletinData.value.map(entry => {
    const st = entry.student
    const name = escH(st.fullName || st.username || 'Estudiante')
    let periodsHtml = ''
    for (const period of entry.periods) {
      const prom = computePromedio(period.rows)
      const promColor = prom >= 4 ? '#1A7F37' : prom >= 3 ? '#B45309' : '#B91C1C'
      const rows = period.rows.map(row => {
        const nota = (row.notaDefinitiva ?? 0).toFixed(1)
        const color = (row.notaDefinitiva ?? 0) >= 4 ? '#1A7F37' : (row.notaDefinitiva ?? 0) >= 3 ? '#B45309' : '#B91C1C'
        return `<tr><td style="font-weight:bold;text-transform:uppercase;padding:6px 12px;border-bottom:1px solid #eee">${escH(row.subjectName)}</td><td style="text-align:center;font-weight:800;color:${color};padding:6px 12px;border-bottom:1px solid #eee">${nota}</td></tr>`
      }).join('')
      periodsHtml += `<h3 style="color:#6A1B9A;margin:18px 0 6px;font-size:14px;text-transform:uppercase;border-bottom:1px solid #d4c5f0;padding-bottom:4px">${escH(period.periodName)}</h3><table style="width:100%;border-collapse:collapse;border:2px solid #333;margin-top:6px"><thead><tr><th style="background:#6A1B9A;color:#fff;padding:10px;text-align:left">MÓDULO</th><th style="background:#6A1B9A;color:#fff;padding:10px">NOTA DEFINITIVA</th></tr></thead><tbody>${rows}</tbody></table><p style="margin-top:8px"><b>PROMEDIO: <span style="color:${promColor}">${prom.toFixed(1)}</span></b></p>`
    }
    return `<div style="page-break-after:always;padding:20px 0"><h2 style="color:#6A1B9A">BOLETÍN DE NOTAS</h2>${buildProgramaWordLine(entry.courseTitle, entry.courseCategory)}<p><b>Estudiante:</b> ${name}</p>${st.cedula ? `<p><b>Identificación:</b> ${escH(st.cedula)}</p>` : ''}${periodsHtml}</div>`
  }).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:Arial,sans-serif;padding:40px;color:#222}</style></head><body>${pages}</body></html>`
  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'boletin_plataforma.doc'
  a.click()
  URL.revokeObjectURL(url)
}

  async function shareBulletin() {
  const st = selectedStudent.value
  const name = st?.fullName || st?.username || 'Estudiante'
  let text = `📋 BOLETÍN DE NOTAS\n${isBach(selectedCourse.value?.category) ? `📌 Programa: ${selectedCourse.value!.category!}\n📚 Ciclo: ${selectedCourse.value?.title || '—'}` : `📌 Programa: ${selectedCourse.value?.title || '—'}`}\n👤 Estudiante: ${name}\n📅 Periodo: ${currentPeriod.value}\n\n${'─'.repeat(32)}\nMÓDULO                    NOTA\n${'─'.repeat(32)}\n`
  for (const row of bulletinRows.value) {
    text += `${row.subjectName.padEnd(26)}${(row.notaDefinitiva ?? 0).toFixed(1)}\n`
  }
  text += `${'─'.repeat(32)}\nPROMEDIO GENERAL           ${(promedioGeneral.value ?? 0).toFixed(1)}\n`
  if (isIncatInstitution()) {
    const lines = getInstitutionFooterLines()
    text += '\n' + lines.join('\n') + '\n'
  }
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
.bulletin-modal { width: 100%; max-width: 560px; max-height: 88vh; background: #1C1C1E; border-radius: 24px; overflow: hidden; display: flex; flex-direction: column; will-change: transform, opacity; transition: max-width 0.45s cubic-bezier(0.32, 0.72, 0, 1), max-height 0.45s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.45s cubic-bezier(0.32, 0.72, 0, 1); }
.bulletin-modal--expanded { max-width: 95vw; max-height: 95vh; border-radius: 16px; }
.bulletin-fade-enter-active { transition: opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
.bulletin-fade-leave-active { transition: opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1), backdrop-filter 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.bulletin-fade-enter-from, .bulletin-fade-leave-to { opacity: 0; }
.bulletin-fade-enter-active .bulletin-modal { animation: bulletin-expand 0.55s cubic-bezier(0.32, 0.72, 0, 1) both; }
.bulletin-fade-leave-active .bulletin-modal { animation: bulletin-collapse 0.3s cubic-bezier(0.32, 0.72, 0, 1) both; }
@keyframes bulletin-expand {
  0% { opacity: 0; transform: scale(0.82) translateY(30px); border-radius: 32px; }
  50% { opacity: 1; }
  100% { opacity: 1; transform: scale(1) translateY(0); border-radius: 24px; }
}
@keyframes bulletin-collapse {
  0% { opacity: 1; transform: scale(1) translateY(0); }
  100% { opacity: 0; transform: scale(0.88) translateY(16px); }
}
.bulletin-header { display: flex; align-items: center; gap: 12px; padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.bulletin-header-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(48,209,88,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bulletin-title { flex: 1; font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.bulletin-expand-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; transition: background 0.15s, transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.bulletin-expand-btn:hover { background: rgba(255,255,255,0.12); }
.bulletin-expand-btn:active { transform: scale(0.9); }
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
.view-all-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; padding: 14px 16px; border-radius: 14px; background: rgba(48,209,88,0.12); border: 1px solid rgba(48,209,88,0.28); color: #30D158; font-size: 14px; font-weight: 700; }
.view-all-btn:hover { background: rgba(48,209,88,0.18); }
.view-all-btn--platform { background: rgba(10,132,255,0.12); border-color: rgba(10,132,255,0.28); color: #0A84FF; }
.view-all-btn--platform:hover { background: rgba(10,132,255,0.2); }
.bulletin-export-bar--top { margin-bottom: 12px; }

.back-to-list { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #0A84FF; margin-bottom: 12px; padding: 0; background: none; border: none; cursor: pointer; }
.back-to-list:hover { text-decoration: underline; }

/* Bulletin card */
.bulletin-card { background: #2C2C2E; border-radius: 16px; padding: 24px 20px; border: 1px solid rgba(255,255,255,0.08); }
.bulletin-card--all { margin-bottom: 14px; }
.boletin-header-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.boletin-logo-placeholder { width: 52px; height: 52px; border-radius: 12px; background: rgba(106,27,154,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.boletin-institution { display: flex; flex-direction: column; gap: 2px; }
.boletin-inst-name { font-size: 17px; font-weight: 800; color: #BF5AF2; letter-spacing: 0.3px; }
.boletin-inst-subtitle { font-size: 11px; color: #8E8E93; text-transform: uppercase; letter-spacing: 1px; }
.boletin-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 16px 0; }
.boletin-period-header { font-size: 13px; font-weight: 700; color: #BF5AF2; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 0 6px; border-bottom: 1px solid rgba(191,90,242,0.2); margin-bottom: 4px; }
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
.incat-sig-block { display: inline-block; min-width: 180px; margin-top: 16px; }
.incat-sig-line { border-top: 1px solid #8E8E93; margin-bottom: 4px; }
.incat-sig-name { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #fff; margin: 0; }
.incat-sig-title { font-size: 10px; color: #8E8E93; margin: 2px 0 0; }
.incat-footer-info { margin-top: 10px; border-top: 1px solid rgba(139,0,0,0.3); padding-top: 8px; text-align: center; }
.incat-footer-slogan { font-size: 10px; font-style: italic; color: #BF5AF2; margin: 0 0 3px; }
.incat-footer-addr, .incat-footer-city { font-size: 9px; font-weight: 700; color: #fff; margin: 2px 0; }
.incat-footer-email { font-size: 9px; color: #FF453A; margin: 2px 0; }

.bulletin-export-bar { display: flex; gap: 10px; padding: 16px 0 4px; }
.export-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 600; transition: background 0.15s, transform 0.1s; }
.export-btn:active { transform: scale(0.97); }
.export-pdf { background: rgba(255,69,58,0.12); color: #FF453A; }
.export-pdf:hover { background: rgba(255,69,58,0.2); }
.export-excel { background: rgba(48,209,88,0.12); color: #30D158; }
.export-excel:hover { background: rgba(48,209,88,0.2); }
.export-word { background: rgba(90,200,250,0.12); color: #5AC8FA; }
.export-word:hover { background: rgba(90,200,250,0.2); }
.export-share { background: rgba(10,132,255,0.12); color: #0A84FF; }
.export-share:hover { background: rgba(10,132,255,0.2); }

.period-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 0 12px;
}
.period-chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #8E8E93;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  white-space: nowrap;
  cursor: pointer;
}
.period-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.period-chip--selected {
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
  border-color: rgba(48, 209, 88, 0.4);
}
</style>
