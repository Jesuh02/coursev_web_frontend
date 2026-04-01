<template>
  <div class="admin-dashboard">
    <TopBar title="Panel de Administración" @back="$router.back()" />

    <!-- Tabs -->
    <div class="tabs-container">
      <button 
        v-for="tab in visibleTabs" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="tab-content analytics-scroll">
      <!-- Loading -->
      <div v-if="analyticsLoading" class="a-loading">
        <div class="spinner-lg"></div>
        <p>Cargando métricas...</p>
      </div>
      <template v-else>
        <!-- Stats Cards -->
        <div class="a-stats-grid">
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-cyan">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ creatorMetrics.enrolledUsersCount }}</span>
              <span class="a-stat-upper">USUARIOS</span>
              <span class="a-stat-sub">Inscritos en mis cursos</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ creatorMetrics.totalCourses }}</span>
              <span class="a-stat-upper">CURSOS</span>
              <span class="a-stat-sub">Mis cursos</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ creatorMetrics.certifiedUsersCount }}</span>
              <span class="a-stat-upper">CERTIFICADOS</span>
              <span class="a-stat-sub">Emitidos</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16l5-5 4 4 7-7"/><path d="M20 10V4h-6"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ creatorMetrics.completionRate }}%</span>
              <span class="a-stat-upper">PROGRESO</span>
              <span class="a-stat-sub">Tasa completado</span>
            </div>
          </div>
        </div>

        <!-- Rendimiento Global -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Rendimiento Global</h3>
            <span class="a-tag a-tag-purple">Mis cursos</span>
          </div>
          <div class="a-gauges-row">
            <div class="a-gauge-item">
              <div class="a-gauge-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.06)" stroke-width="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#30D158" stroke-width="6" fill="none"
                    stroke-linecap="round" :stroke-dasharray="gaugeDash(creatorMetrics.completionRate)"
                    transform="rotate(-90 40 40)" class="a-gauge-arc" />
                </svg>
                <span class="a-gauge-val">{{ creatorMetrics.completionRate }}%</span>
              </div>
              <span class="a-gauge-lbl">Completados</span>
            </div>
            <div class="a-gauge-item">
              <div class="a-gauge-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.06)" stroke-width="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#00D4FF" stroke-width="6" fill="none"
                    stroke-linecap="round" :stroke-dasharray="gaugeDash(creatorMetrics.approvalRate)"
                    transform="rotate(-90 40 40)" class="a-gauge-arc" />
                </svg>
                <span class="a-gauge-val">{{ creatorMetrics.approvalRate }}%</span>
              </div>
              <span class="a-gauge-lbl">Aprobados</span>
            </div>
            <div class="a-gauge-item">
              <div class="a-gauge-ring">
                <svg viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.06)" stroke-width="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#BF5AF2" stroke-width="6" fill="none"
                    stroke-linecap="round" :stroke-dasharray="gaugeDash(creatorMetrics.satisfactionRate)"
                    transform="rotate(-90 40 40)" class="a-gauge-arc" />
                </svg>
                <span class="a-gauge-val">{{ creatorMetrics.satisfactionRate }}%</span>
              </div>
              <span class="a-gauge-lbl">Satisfacción</span>
            </div>
          </div>
        </div>

        <!-- Actividad Semanal -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Actividad Semanal</h3>
            <span class="a-tag a-tag-cyan">Últimos 7 días</span>
          </div>
          <div class="a-area-chart-wrap">
            <svg :viewBox="`0 0 ${weeklyAreaWidth} 110`" preserveAspectRatio="none" class="a-area-svg a-area-svg-tall">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#9B8FFF" stop-opacity="0.45" />
                  <stop offset="60%" stop-color="#6B5FFF" stop-opacity="0.12" />
                  <stop offset="100%" stop-color="#5A4FE0" stop-opacity="0" />
                </linearGradient>
                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <clipPath id="weeklyReveal">
                  <rect x="0" y="0" :width="weeklyAreaWidth" height="110" class="a-clip-reveal" />
                </clipPath>
              </defs>
              <!-- Horizontal grid lines -->
              <line x1="0" :x2="weeklyAreaWidth" y1="20" y2="20" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
              <line x1="0" :x2="weeklyAreaWidth" y1="42" y2="42" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
              <line x1="0" :x2="weeklyAreaWidth" y1="64" y2="64" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
              <line x1="0" :x2="weeklyAreaWidth" y1="86" y2="86" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
              <!-- Max value label -->
              <text v-if="weeklyMax > 0" x="3" y="15" fill="#636366" font-size="7" font-family="system-ui">{{ weeklyMax }}</text>
              <text x="3" y="91" fill="#636366" font-size="7" font-family="system-ui">0</text>
              <!-- Area fill -->
              <path :d="weeklySmoothedAreaPath" fill="url(#areaFill)" class="a-chart-fill" clip-path="url(#weeklyReveal)" />
              <!-- Glow line (blurred duplicate) -->
              <path :d="weeklySmoothedLinePath" fill="none" stroke="#9B8FFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.22" clip-path="url(#weeklyReveal)" />
              <!-- Main animated line -->
              <path :d="weeklySmoothedLinePath" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="a-chart-line" clip-path="url(#weeklyReveal)" />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#7B6FEF" />
                  <stop offset="100%" stop-color="#C4BAFF" />
                </linearGradient>
              </defs>
              <!-- Dots with pulse ring -->
              <g v-for="(pt, i) in weeklyPoints" :key="i" clip-path="url(#weeklyReveal)">
                <circle :cx="pt.x" :cy="pt.y" r="7" fill="#9B8FFF" opacity="0.15" class="a-dot-pulse" :style="`animation-delay:${i*0.08+0.5}s`" />
                <circle :cx="pt.x" :cy="pt.y" r="3.5" fill="#C4BAFF" stroke="#1a1a2e" stroke-width="2" class="a-dot-main" :style="`animation-delay:${i*0.08+0.5}s`" />
              </g>
            </svg>
          </div>
          <div class="a-chart-labels">
            <span v-for="label in weeklyLabels" :key="label">{{ label }}</span>
          </div>
        </div>

        <!-- Progreso Mensual -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Progreso Mensual</h3>
            <span class="a-tag a-tag-green">6 meses</span>
          </div>
          <div class="a-grouped-bars">
            <div v-for="(m, i) in monthlyBars" :key="i" class="a-bar-group">
              <div class="a-bars-col">
                <div class="a-bar a-bar-completed" :style="{ height: m.completedH + '%' }"></div>
                <div class="a-bar a-bar-active" :style="{ height: m.activeH + '%' }"></div>
              </div>
              <span class="a-bar-lbl">{{ m.label }}</span>
            </div>
          </div>
          <div class="a-legend-row">
            <span class="a-legend"><span class="a-dot a-dot-completed"></span>Completados</span>
            <span class="a-legend"><span class="a-dot a-dot-active"></span>Activos</span>
          </div>
        </div>

        <!-- Top 5 Creadores -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Top 5 Creadores</h3>
            <span class="a-tag a-tag-gold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M3.5 18h17a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/></svg>
              Ranking
            </span>
          </div>
          <div v-if="topCreators.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="a-rank-list">
            <div v-for="(c, i) in topCreators" :key="c.userId" class="a-rank-row">
              <span class="a-rank-badge" :class="['a-rank-' + (i + 1)]">{{ i + 1 }}</span>
              <img :src="resolveAvatar(c.avatar)" class="a-avatar" alt="" @error="onAvatarError" />
              <div class="a-rank-info">
                <span class="a-rank-name">{{ c.username }}</span>
                <span class="a-rank-meta">{{ c.coursesCount }} cursos · {{ c.studentsCount }} estudiantes</span>
              </div>
              <div class="a-rank-rating">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD60A" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span>{{ c.rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cursos Populares -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Cursos Populares</h3>
            <span class="a-tag a-tag-cyan">Top 5</span>
          </div>
          <div v-if="aPopularCourses.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="a-rank-list">
            <div v-for="course in aPopularCourses" :key="course.id" class="a-rank-row a-clickable" @click="goToCourse(course.id)">
              <img :src="resolveThumbnail(course.thumbnail)" class="a-course-thumb" alt="" />
              <div class="a-rank-info">
                <span class="a-rank-name">{{ course.title }}</span>
                <span class="a-rank-meta">{{ course.enrolledCount }} inscritos</span>
              </div>
              <div class="a-rank-rating">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD60A" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span>{{ course.rating.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estudiantes Destacados -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Estudiantes Destacados</h3>
            <span class="a-tag a-tag-purple">Top 5</span>
          </div>
          <div v-if="topStudents.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="a-rank-list">
            <div v-for="(s, i) in topStudents" :key="s.userId" class="a-rank-row">
              <span class="a-rank-badge" :class="['a-rank-' + (i + 1)]">{{ i + 1 }}</span>
              <img :src="resolveAvatar(s.avatar)" class="a-avatar" alt="" @error="onAvatarError" />
              <div class="a-rank-info">
                <span class="a-rank-name">{{ s.username }}</span>
                <span class="a-rank-meta">{{ s.approvedCourses }} cursos aprobados</span>
              </div>
              <span class="a-grade-pill">{{ s.averageGrade.toFixed(2) }}</span>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Moderación Tab -->
    <div v-if="activeTab === 'moderation'" class="tab-content moderation-tab">
      <div class="moderation-summary-grid">
        <div class="moderation-stat-card">
          <div class="moderation-stat-icon is-cyan">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6" /><path d="M9 16h4" />
            </svg>
          </div>
          <span class="moderation-stat-value">{{ pendingTasks.length }}</span>
          <span class="moderation-stat-label">Tareas Hoy</span>
        </div>

        <div class="moderation-stat-card">
          <div class="moderation-stat-icon is-gold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 3 2.8 5.67 6.25.91-4.52 4.4 1.07 6.22L12 17.27 6.4 20.2l1.08-6.22-4.53-4.4 6.26-.91L12 3Z" />
            </svg>
          </div>
          <span class="moderation-stat-value">{{ moderationAverage }}</span>
          <span class="moderation-stat-label">Promedio</span>
        </div>

        <div class="moderation-stat-card">
          <div class="moderation-stat-icon is-mint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <span class="moderation-stat-value">{{ moderationEstimatedTime }}</span>
          <span class="moderation-stat-label">Tiempo Est.</span>
        </div>

        <div class="moderation-stat-card">
          <div class="moderation-stat-icon is-rose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 16l5-5 4 4 7-7" />
              <path d="M20 10V4h-6" />
            </svg>
          </div>
          <span class="moderation-stat-value">{{ moderationWeeklyActivity }}</span>
          <span class="moderation-stat-label">Esta Semana</span>
        </div>
      </div>

      <div class="moderation-stack">
        <div
          v-if="canViewFullModeration"
          class="section-card moderation-card"
          :class="{ 'is-open': expandedSections.submissions }"
        >
          <div class="section-header moderation-header" @click="toggleSection('submissions')">
            <div class="header-left">
              <div class="section-icon moderation-icon submissions-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <h4>Tareas por Calificar</h4>
                <p>Entregas de estudiantes</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-mint">{{ pendingSubmissions.length }} pendientes</span>
              <span class="chevron" :class="{ expanded: expandedSections.submissions }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.submissions" class="section-content">
            <div v-if="loadingSubmissions" class="loading-center"><div class="spinner-lg"></div></div>
            <div v-else-if="pendingSubmissions.length === 0" class="empty-state">
              <span class="emoji">✅</span>
              <p>No hay submissions pendientes por calificar</p>
            </div>
            <div v-else class="items-list">
              <div
                v-for="sub in pendingSubmissions"
                :key="sub.id"
                class="item-card submission-card"
                @click="goToSubmission(sub)"
              >
                <img :src="sub.studentAvatar || '/default-avatar.png'" class="user-avatar-sm" alt="" @error="onAvatarError" />
                <div class="item-info">
                  <h5>{{ sub.taskName }}</h5>
                  <p class="course-name">{{ sub.courseName }} · {{ sub.studentName }}</p>
                  <span class="time-ago">{{ sub.timeAgo }}</span>
                </div>
                <span class="arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="canViewFullModeration"
          class="section-card moderation-card"
          :class="{ 'is-open': expandedSections.students }"
        >
          <div class="section-header moderation-header" @click="toggleSection('students')">
            <div class="header-left">
              <div class="section-icon moderation-icon students-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4>Progreso Estudiantes</h4>
                <p>Inscritos en tus cursos</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-amber">{{ studentProgressList.length }} estudiantes</span>
              <span class="chevron" :class="{ expanded: expandedSections.students }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.students" class="section-content">
            <div v-if="loadingStudentProgress" class="loading-center"><div class="spinner-lg"></div></div>
            <template v-else>
              <div v-if="studentProgressList.length === 0" class="empty-state">
                <span class="emoji">📊</span>
                <p>No hay datos de progreso disponibles</p>
              </div>
              <template v-else>
                <!-- Filtros -->
                <div class="sp-filters">
                  <div class="sp-filter-wrap">
                    <svg class="sp-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                    <input
                      v-model="spStudentSubjectFilter"
                      class="sp-filter-input"
                      placeholder="Filtrar por título de materia..."
                    />
                  </div>
                  <div class="sp-filter-wrap">
                    <svg class="sp-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <input
                      v-model="spStudentUserFilter"
                      class="sp-filter-input"
                      placeholder="Buscar estudiante por usuario, nombre o cédula..."
                    />
                  </div>
                </div>

                <!-- Contador de resultados -->
                <div class="sp-results-bar">
                  <span class="sp-count">{{ studentProgressFiltered.length }} resultado{{ studentProgressFiltered.length !== 1 ? 's' : '' }}</span>
                  <button v-if="spStudentSubjectFilter || spStudentUserFilter" class="sp-clear-btn" @click="spStudentSubjectFilter=''; spStudentUserFilter=''">Limpiar filtros</button>
                </div>

                <div v-if="studentProgressFiltered.length === 0" class="empty-state">
                  <span class="emoji">🔍</span>
                  <p>Sin resultados para los filtros aplicados</p>
                </div>
                <div v-else class="items-list">
                  <div
                    v-for="sp in studentProgressFiltered"
                    :key="`${sp.courseId}-${sp.subjectId}-${sp.studentId}`"
                    class="item-card"
                  >
                    <img :src="sp.avatar || '/default-avatar.png'" class="user-avatar-sm" alt="" @error="onAvatarError" />
                    <div class="item-info">
                      <h5>{{ sp.username }}<span v-if="sp.nombres" class="sp-fullname"> · {{ sp.nombres }} {{ sp.apellidos }}</span></h5>
                      <p class="course-name">{{ sp.courseName }}<span v-if="sp.subjectName"> · <span class="sp-subject-pill-inline">{{ sp.subjectName }}</span></span></p>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: sp.progress + '%' }"></div>
                      </div>
                      <span class="progress-text">{{ sp.progress }}% · Nota: {{ sp.grade }}<span v-if="sp.identificacion" class="sp-id-inline"> · {{ sp.identificacion }}</span></span>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
        <div
          v-if="canViewFullModeration"
          class="section-card moderation-card"
          :class="{ 'is-open': expandedSections.subjectProgress }"
        >
          <div class="section-header moderation-header" @click="toggleSection('subjectProgress')">
            <div class="header-left">
              <div class="section-icon moderation-icon" style="background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <path d="M9 9h6M9 12h6M9 15h4"/>
                </svg>
              </div>
              <div>
                <h4>Progreso por Materia</h4>
                <p>Detalle por materia de todos los estudiantes</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-indigo">{{ allSubjectProgress.length }} registros</span>
              <span class="chevron" :class="{ expanded: expandedSections.subjectProgress }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.subjectProgress" class="section-content">
            <div v-if="loadingSubjectProgress" class="loading-center"><div class="spinner-lg"></div></div>
            <template v-else>
              <!-- Filtros -->
              <div class="sp-filters">
                <div class="sp-filter-wrap">
                  <svg class="sp-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input
                    v-model="spSubjectFilter"
                    class="sp-filter-input"
                    placeholder="Buscar materia..."
                    @input="spPage = 1"
                  />
                </div>
                <div class="sp-filter-wrap">
                  <svg class="sp-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input
                    v-model="spUserFilter"
                    class="sp-filter-input"
                    placeholder="Usuario, nombre o cédula..."
                    @input="spPage = 1"
                  />
                </div>
                <div class="sp-filter-wrap">
                  <svg class="sp-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <input
                    v-model="spCourseFilter"
                    class="sp-filter-input"
                    placeholder="Buscar curso..."
                    @input="spPage = 1"
                  />
                </div>
              </div>

              <!-- Contador de resultados -->
              <div class="sp-results-bar">
                <span class="sp-count">{{ spFiltered.length }} resultado{{ spFiltered.length !== 1 ? 's' : '' }}</span>
                <button v-if="spSubjectFilter || spUserFilter || spCourseFilter" class="sp-clear-btn" @click="spSubjectFilter=''; spUserFilter=''; spCourseFilter=''; spPage=1">Limpiar filtros</button>
              </div>

              <div v-if="spFiltered.length === 0" class="empty-state">
                <span class="emoji">{{ allSubjectProgress.length === 0 ? '📚' : '🔍' }}</span>
                <p>{{ allSubjectProgress.length === 0 ? 'Sin progreso por materia registrado' : 'Sin resultados para los filtros' }}</p>
              </div>

              <!-- Tabla de progreso -->
              <div v-else class="sp-table-wrap">
                <table class="sp-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Identificación</th>
                      <th>Curso</th>
                      <th>Materia</th>
                      <th>Tareas</th>
                      <th>Nota</th>
                      <th>Progreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in spPaged"
                      :key="`${row.userId}-${row.subjectId}`"
                      class="sp-row"
                    >
                      <td class="sp-student-cell">
                        <img :src="row.avatar || '/default-avatar.png'" class="sp-avatar" alt="" @error="onAvatarError" />
                        <div class="sp-student-info">
                          <span class="sp-username">{{ row.username }}</span>
                          <span v-if="row.nombres" class="sp-fullname">{{ row.nombres }} {{ row.apellidos }}</span>
                        </div>
                      </td>
                      <td class="sp-id-cell">
                        <span v-if="row.identificacion" class="sp-id-badge">{{ row.identificacion }}</span>
                        <span v-else class="sp-na">—</span>
                      </td>
                      <td class="sp-course-cell">{{ row.courseName }}</td>
                      <td class="sp-subject-cell">
                        <span class="sp-subject-pill">{{ row.subjectName }}</span>
                      </td>
                      <td class="sp-tasks-cell">
                        <span class="sp-tasks">{{ row.completedTasks }}/{{ row.totalTasks }}</span>
                      </td>
                      <td class="sp-grade-cell">
                        <span class="sp-grade-badge" :class="spGradeClass(row.averageGrade)">
                          {{ row.averageGrade !== null ? Number(row.averageGrade).toFixed(1) : '—' }}
                        </span>
                      </td>
                      <td class="sp-progress-cell">
                        <div class="sp-progress-wrap">
                          <div class="sp-progress-bar">
                            <div class="sp-progress-fill" :style="{ width: row.progressPercentage + '%' }" :class="spProgressClass(row.progressPercentage)"></div>
                          </div>
                          <span class="sp-pct">{{ Math.round(row.progressPercentage) }}%</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Paginación -->
                <div v-if="spTotalPages > 1" class="sp-pagination">
                  <button class="sp-page-btn" :disabled="spPage <= 1" @click="spPage--">‹</button>
                  <span class="sp-page-info">{{ spPage }} / {{ spTotalPages }}</span>
                  <button class="sp-page-btn" :disabled="spPage >= spTotalPages" @click="spPage++">›</button>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="section-card moderation-card" :class="{ 'is-open': expandedSections.courses }">
          <div class="section-header moderation-header" @click="toggleSection('courses')">
            <div class="header-left">
              <div class="section-icon moderation-icon courses-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h4>Cursos por Terminar</h4>
                <p>Pendiente de completar</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-amber">{{ coursesToFinish.length }} cursos</span>
              <span class="chevron" :class="{ expanded: expandedSections.courses }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.courses" class="section-content">
            <div v-if="coursesToFinish.length === 0" class="empty-state">
              <span class="emoji">🎉</span>
              <p>¡Todos tus cursos están al día!</p>
            </div>
            <div v-else class="items-list">
              <div
                v-for="course in coursesToFinish"
                :key="course.id"
                class="item-card"
                @click="goToCourse(course.id)"
              >
                <img :src="resolveThumbnail(course.thumbnail)" class="course-finish-thumb" alt="" @error="onCourseThumbError" />
                <div class="item-info">
                  <h5>{{ course.title }}</h5>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ course.progress }}% completado</span>
                </div>
                <span class="arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card moderation-card" :class="{ 'is-open': expandedSections.tasks }">
          <div class="section-header moderation-header" @click="toggleSection('tasks')">
            <div class="header-left">
              <div class="section-icon moderation-icon tasks-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M9 12h6" /><path d="M9 16h6" />
                </svg>
              </div>
              <div>
                <h4>Tareas Pendientes</h4>
                <p>Tareas que faltan por enviar</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-gold">{{ pendingTasks.length }}</span>
              <span class="chevron" :class="{ expanded: expandedSections.tasks }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.tasks" class="section-content">
            <div class="pending-filters">
              <input
                v-model="pendingTaskCourseFilter"
                type="text"
                class="filter-input"
                placeholder="Filtrar curso..."
              />
              <input
                v-model="pendingTaskSubjectFilter"
                type="text"
                class="filter-input"
                placeholder="Filtrar materia..."
              />
            </div>
            <div v-if="filteredPendingTasks.length === 0" class="empty-state">
              <span class="emoji">{{ pendingTasks.length === 0 ? '✅' : '🔍' }}</span>
              <p>{{ pendingTasks.length === 0 ? '¡No tienes tareas pendientes!' : 'Sin resultados para este filtro' }}</p>
            </div>
            <div v-else class="items-list">
              <div
                v-for="task in filteredPendingTasks"
                :key="task.id"
                class="item-card"
                @click="goToTask(task)"
              >
                <div class="task-icon" :style="{ background: getTaskIconBg(task.type) }">
                  <component :is="getTaskIcon(task.type)" />
                </div>
                <div class="item-info">
                  <h5>{{ task.title }}</h5>
                  <div class="task-meta">
                    <span class="course-name">{{ task.courseName }}</span>
                    <span v-if="task.subjectName" class="meta-separator">·</span>
                    <span v-if="task.subjectName" class="subject-name">{{ task.subjectName }}</span>
                  </div>
                </div>
                <span class="task-type-badge">{{ task.type }}</span>
                <span class="arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="canViewFullModeration"
          class="section-card moderation-card"
          :class="{ 'is-open': expandedSections.reinforcement }"
        >
          <div class="section-header moderation-header" @click="toggleSection('reinforcement')">
            <div class="header-left">
              <div class="section-icon moderation-icon reinforcement-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div>
                <h4>Refuerzo de Estudiantes</h4>
                <p>Historial de quizzes de refuerzo</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-gold">{{ reinforcementResults.length }}</span>
              <span class="chevron" :class="{ expanded: expandedSections.reinforcement }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.reinforcement" class="section-content">
            <div v-if="loadingReinforcement" class="loading-center"><div class="spinner-lg"></div></div>
            <div v-else-if="reinforcementResults.length === 0" class="empty-state">
              <span class="emoji">🧠</span>
              <p>No hay resultados de refuerzo</p>
            </div>
            <div v-else class="reinforcement-content">
              <div class="reinforcement-summary-grid">
                <div class="reinforcement-summary-pill">
                  <span class="summary-label">Practican</span>
                  <strong class="summary-value">{{ reinforcementUniqueUsers }}</strong>
                </div>
                <div class="reinforcement-summary-pill">
                  <span class="summary-label">Materias activas</span>
                  <strong class="summary-value">{{ reinforcementUniqueSubjects }}</strong>
                </div>
                <div class="reinforcement-summary-pill">
                  <span class="summary-label">Nota promedio</span>
                  <strong class="summary-value">{{ reinforcementAverageGrade }}</strong>
                </div>
              </div>

              <div class="reinforcement-filters">
                <input
                  v-model="reinforcementUserFilter"
                  type="text"
                  class="filter-input"
                  placeholder="Filtrar por usuario"
                >
                <input
                  v-model="reinforcementSubjectFilter"
                  type="text"
                  class="filter-input"
                  placeholder="Filtrar por materia"
                >
              </div>

              <div v-if="filteredReinforcementResults.length" class="items-list reinforcement-list">
                <div
                  v-for="(rr, idx) in filteredReinforcementResults"
                  :key="idx"
                  class="item-card reinforcement-card"
                  :style="{ animationDelay: `${Math.min(idx * 40, 360)}ms` }"
                >
                  <img
                    class="user-avatar-sm"
                    :src="resolveAvatar(rr.avatarUrl || '')"
                    :alt="rr.username"
                    @error="onAvatarError"
                  >
                  <div class="item-info">
                    <h5>{{ rr.username }}</h5>
                    <p class="course-name">{{ rr.courseName }}</p>
                    <p class="reinforcement-route">{{ rr.subjectName || 'Sin materia' }} · {{ rr.topicName || 'Sin tema' }} · {{ rr.taskName || 'Sin tarea' }}</p>
                    <div class="reinforcement-stats">
                      <span class="stat-pill">{{ rr.correctAnswers }}/{{ rr.totalQuestions }} correctas</span>
                      <span class="stat-pill" :class="rr.grade >= 3 ? 'pill-active' : 'pill-inactive'">Nota {{ rr.grade.toFixed(1) }}</span>
                      <span class="stat-pill">{{ rr.scorePercent }}%</span>
                      <span class="stat-pill" :class="`difficulty-${rr.difficulty.toLowerCase()}`">{{ rr.difficultyLabel }}</span>
                      <span class="stat-pill time-pill">{{ formatReinforcementDate(rr.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <span class="emoji">🔍</span>
                <p>Sin coincidencias con los filtros aplicados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Roles Tab -->
    <div v-if="activeTab === 'roles'" class="tab-content roles-tab">
      <!-- Tarjeta del usuario en sesión activa -->
      <div class="roles-self-card">
        <div class="roles-self-header">
          <div class="roles-avatar-wrap">
            <img :src="authStore.user?.avatar || '/default-avatar.png'" class="roles-avatar" alt="" @error="onAvatarError" />
            <span class="roles-status-dot dot-active"></span>
          </div>
          <div class="roles-user-info">
            <span class="roles-username">{{ authStore.user?.username ?? 'Mi cuenta' }}</span>
            <span class="roles-current-label">Sesión activa</span>
          </div>
        </div>

        <div v-if="userRoles.length" class="roles-self-chips">
          <span
            v-for="role in userRoles"
            :key="role.id"
            class="role-chip role-chip-active"
            :class="['role-chip-' + role.id]"
          >
            <span class="role-chip-dot" :class="'role-dot-' + role.id"></span>
            <span>{{ role.label }}</span>
          </span>
        </div>
        <div v-else class="roles-self-empty">Sin roles asignados</div>
      </div>
    </div>

    <!-- Activación Tab -->
    <div v-if="activeTab === 'activation' && canViewActivation" class="tab-content">
      <div class="activation-section">
        <!-- Header Card -->
        <div class="activation-header-card">
          <div class="activation-header-top">
            <div>
              <h3 class="activation-title">Gestión de Acceso</h3>
              <p class="activation-subtitle">Activa o desactiva el acceso de usuarios a la plataforma</p>
            </div>
            <button class="reload-btn" title="Recargar" @click="loadUsers" :class="{ spinning: loadingUsers }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
          </div>

          <!-- Stats pills -->
          <div class="activation-stats">
            <div class="activation-stat-pill active-pill">
              <span class="stat-number">{{ activeUsersCount }}</span>
              <span class="stat-desc">Activos</span>
            </div>
            <div class="activation-stat-pill inactive-pill">
              <span class="stat-number">{{ inactiveUsersCount }}</span>
              <span class="stat-desc">Inactivos</span>
            </div>
            <div class="activation-stat-pill total-pill">
              <span class="stat-number">{{ filteredUsers.length }}</span>
              <span class="stat-desc">Total</span>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="activation-search-bar">
          <svg class="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="userSearch" placeholder="Buscar por usuario, nombre o cédula..." class="activation-search-input" />
        </div>

        <!-- Process expired (discreto) -->
        <button class="expire-action-btn" @click="processExpiredCourses" :disabled="processingExpired">
          <span class="expire-icon">⏱</span>
          {{ processingExpired ? 'Procesando...' : 'Procesar cursos expirados' }}
        </button>

        <!-- Loading -->
        <div v-if="loadingUsers" class="activation-loading">
          <div class="spinner-lg"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredUsers.length === 0" class="activation-empty">
          <span class="activation-empty-icon">{{ users.length === 0 ? '👥' : '🔍' }}</span>
          <p>{{ users.length === 0 ? 'No hay usuarios disponibles' : 'Sin resultados para esta búsqueda' }}</p>
        </div>

        <!-- User list -->
        <TransitionGroup v-else name="user-card" tag="div" class="activation-user-list">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="activation-user-card"
            :class="{ 'is-inactive': !user.isActive }"
          >
            <div class="activation-avatar-wrapper" :class="{ 'avatar-active': user.isActive }">
              <img :src="user.avatar || '/default-avatar.png'" class="activation-avatar" alt="" @error="onAvatarError" />
            </div>
            <div class="activation-user-info">
              <span class="activation-user-name">{{ user.username }}</span>
              <div class="activation-user-status-row">
                <span class="activation-status-dot" :class="user.isActive ? 'dot-active' : 'dot-inactive'"></span>
                <span class="activation-status-label">{{ user.isActive ? 'Activo' : 'Inactivo' }}</span>
              </div>
              <!-- Role chips -->
              <div class="activation-role-chips">
                <button
                  v-for="role in availableRoles"
                  :key="role.id"
                  class="role-chip"
                  :class="{
                    'role-chip-active': userHasRole(user, role.id),
                    ['role-chip-' + role.id]: true
                  }"
                  @click.stop="toggleRole(user, role.id)"
                  :disabled="assigningRole[user.id + '-' + role.id] || !canManageRoles"
                >
                  <span class="role-chip-dot" :class="'role-dot-' + role.id"></span>
                  <span>{{ role.label }}</span>
                </button>
              </div>
            </div>
            <button
              class="activation-toggle-btn"
              :class="user.isActive ? 'toggle-deactivate' : 'toggle-activate'"
              :disabled="!canManageRoles"
              @click="toggleUserActivation(user, !user.isActive)"
            >
              {{ user.isActive ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Matrícula Tab (solo rol 3) -->
    <div v-if="activeTab === 'enrollment'" class="tab-content enroll-tab">

      <!-- ── Pill sub-tabs ── -->
      <div class="enroll-pill-tabs">
        <button
          class="enroll-pill-tab"
          :class="{ active: enrollmentSubTab === 'pre' }"
          @click="enrollmentSubTab = 'pre'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Prematrícula
        </button>
        <button
          class="enroll-pill-tab"
          :class="{ active: enrollmentSubTab === 'matricula' }"
          @click="enrollmentSubTab = 'matricula'; loadApprovedEnrollmentsIfNeeded()"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Matrícula
        </button>
      </div>

      <!-- ══════════════ PRE-MATRÍCULA ══════════════ -->
      <div v-if="enrollmentSubTab === 'pre'" class="enroll-section">

        <!-- Hero header -->
        <div class="enroll-hero">
          <div class="enroll-hero-glow"></div>
          <div class="enroll-hero-top">
            <div class="enroll-hero-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div class="enroll-hero-text">
              <h3 class="enroll-hero-title">Solicitudes de Matrícula</h3>
              <p class="enroll-hero-sub">Gestiona solicitudes de acceso a cursos pendientes.</p>
            </div>
            <button class="enroll-reload-btn" title="Recargar" @click="loadEnrollments" :class="{ spinning: loadingEnrollments }">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
          </div>
          <div class="enroll-kpi-row">
            <div class="enroll-kpi is-amber">
              <span class="enroll-kpi-num">{{ filteredEnrollments.length }}</span>
              <span class="enroll-kpi-lbl">Pendientes</span>
            </div>
            <div class="enroll-kpi is-green">
              <span class="enroll-kpi-num">{{ enrollmentApprovedCount }}</span>
              <span class="enroll-kpi-lbl">Aprobadas</span>
            </div>
            <div class="enroll-kpi is-red">
              <span class="enroll-kpi-num">{{ enrollmentRejectedCount }}</span>
              <span class="enroll-kpi-lbl">Rechazadas</span>
            </div>
          </div>
          <div class="enroll-filter-bar">
            <div class="enroll-filter-field">
              <svg class="enroll-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="enrollmentUserFilter" class="enroll-filter-input" placeholder="Usuario, nombre o cédula..." />
            </div>
            <div class="enroll-filter-field">
              <svg class="enroll-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <input v-model="enrollmentCourseFilter" class="enroll-filter-input" placeholder="Filtrar por curso..." />
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingEnrollments" class="enroll-skeletons">
          <div class="enroll-skeleton-card" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.08}s` }">
            <div class="sk-avatar"></div>
            <div class="sk-body">
              <div class="sk-line w-60"></div>
              <div class="sk-line w-40"></div>
              <div class="sk-line w-80 mt-8"></div>
            </div>
          </div>
        </div>

        <!-- Empty: no requests -->
        <div v-else-if="pendingEnrollments.length === 0" class="enroll-empty">
          <div class="enroll-empty-ring is-green">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <span class="enroll-empty-title">Todo al día</span>
          <span class="enroll-empty-desc">No hay solicitudes pendientes en este momento</span>
        </div>

        <!-- Empty: no filter match -->
        <div v-else-if="filteredEnrollments.length === 0" class="enroll-empty">
          <div class="enroll-empty-ring is-gray">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <span class="enroll-empty-title">Sin resultados</span>
          <span class="enroll-empty-desc">Prueba con otros términos de búsqueda</span>
        </div>

        <!-- Cards list -->
        <TransitionGroup v-else tag="div" name="enroll-card" class="enroll-list">
          <div
            v-for="(req, idx) in filteredEnrollments"
            :key="`${req.userId}-${req.courseId}`"
            class="enroll-card"
            :style="{ animationDelay: `${idx * 0.055}s` }"
          >
            <div class="enroll-card-accent"></div>
            <div class="enroll-card-body">
              <div class="enroll-user-row">
                <img :src="req.avatar || '/default-avatar.png'" class="enroll-avatar" alt="" @error="onAvatarError" />
                <div class="enroll-user-info">
                  <span class="enroll-user-name">{{ req.displayName }}</span>
                  <span class="enroll-user-handle">{{ req.usernameLabel }}</span>
                </div>
                <span class="enroll-time-badge" v-if="req.requestedAt">{{ formatTimeAgoEnroll(req.requestedAt) }}</span>
              </div>
              <div class="enroll-course-block">
                <span class="enroll-course-eyebrow">Curso solicitado</span>
                <span class="enroll-course-name">{{ req.courseName || `Curso #${req.courseId}` }}</span>
              </div>
              <div v-if="req.roleChips.length" class="enroll-roles-row">
                <span
                  v-for="role in req.roleChips"
                  :key="`${req.userId}-${req.courseId}-${role.key}`"
                  class="enroll-role-chip"
                  :class="`tone-${role.tone}`"
                >{{ role.label }}</span>
              </div>
            </div>
            <div class="enroll-actions-col">
              <button class="enroll-btn-approve" @click="approveEnrollmentReq(req)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Aprobar
              </button>
              <button class="enroll-btn-reject" @click="rejectEnrollmentReq(req)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Rechazar
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- ══════════════ MATRÍCULA (usuarios matriculados) ══════════════ -->
      <div v-if="enrollmentSubTab === 'matricula'" class="enroll-section">

        <!-- Hero header -->
        <div class="enroll-hero">
          <div class="enroll-hero-glow enroll-hero-glow--blue"></div>
          <div class="enroll-hero-top">
            <div class="enroll-hero-icon-wrap enroll-hero-icon-wrap--blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="enroll-hero-text">
              <h3 class="enroll-hero-title">Usuarios Matriculados</h3>
              <p class="enroll-hero-sub">Gestiona el acceso a cursos y materias.</p>
            </div>
            <button class="enroll-reload-btn" title="Recargar" @click="loadApprovedEnrollments" :class="{ spinning: loadingApproved }">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
          </div>
          <div class="enroll-kpi-row">
            <div class="enroll-kpi is-blue">
              <span class="enroll-kpi-num">{{ approvedEnrollments.length }}</span>
              <span class="enroll-kpi-lbl">Matriculados</span>
            </div>
            <div class="enroll-kpi is-indigo">
              <span class="enroll-kpi-num">{{ approvedCoursesCount }}</span>
              <span class="enroll-kpi-lbl">Cursos activos</span>
            </div>
          </div>
          <div class="enroll-filter-bar">
            <div class="enroll-filter-field">
              <svg class="enroll-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="approvedUserFilter" class="enroll-filter-input" placeholder="Usuario o cédula..." />
            </div>
            <div class="enroll-filter-field">
              <svg class="enroll-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <input v-model="approvedCourseFilter" class="enroll-filter-input" placeholder="Filtrar curso..." />
            </div>
            <div class="enroll-filter-field">
              <svg class="enroll-filter-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              <input v-model="approvedSubjectFilter" class="enroll-filter-input" placeholder="Filtrar materia..." />
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingApproved" class="enroll-skeletons">
          <div class="enroll-skeleton-card" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.08}s` }">
            <div class="sk-avatar"></div>
            <div class="sk-body">
              <div class="sk-line w-60"></div>
              <div class="sk-line w-40"></div>
            </div>
          </div>
        </div>

        <!-- Empty: no enrollments -->
        <div v-else-if="approvedEnrollments.length === 0" class="enroll-empty">
          <div class="enroll-empty-ring is-gray">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <span class="enroll-empty-title">Sin matrículas</span>
          <span class="enroll-empty-desc">No hay usuarios matriculados actualmente</span>
        </div>

        <!-- Grouped by course -->
        <div v-else class="enroll-course-groups">
          <div v-if="filteredApprovedGrouped.length === 0" class="enroll-empty">
            <div class="enroll-empty-ring is-gray">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#636366" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <span class="enroll-empty-title">Sin resultados</span>
            <span class="enroll-empty-desc">No se encontraron matrículas con ese filtro</span>
          </div>

          <div
            v-for="(group, gIdx) in filteredApprovedGrouped"
            :key="group.courseId"
            class="enroll-course-group"
            :style="{ animationDelay: `${gIdx * 0.07}s` }"
          >
            <div class="enroll-course-group-header">
              <div class="enroll-course-group-row">
                <div class="enroll-course-group-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <span class="enroll-course-group-name">{{ group.courseName }}</span>
                <span class="enroll-course-group-badge">{{ group.users.length }} usuario{{ group.users.length !== 1 ? 's' : '' }}</span>
              </div>
              <div v-if="group.subjects.length" class="enroll-course-group-subjects">
                <span v-for="subj in group.subjects" :key="subj.id" class="enroll-subj-tag">{{ subj.name }}</span>
              </div>
            </div>

            <div class="enroll-user-rows">
              <div
                v-for="user in group.users"
                :key="`${user.userId}-${group.courseId}`"
                class="enroll-enrolled-row"
                :class="{ 'has-blocked-subjects': hasAnyBlockedSubject(user.userId, group.courseId, group.subjects) }"
              >
                <div class="enroll-enrolled-left">
                  <img :src="user.avatar || '/default-avatar.png'" class="enroll-avatar enroll-avatar--sm" alt="" @error="onAvatarError" />
                  <div class="enroll-user-info">
                    <span class="enroll-user-name">{{ user.fullName || user.username || `Usuario #${user.userId}` }}</span>
                    <span class="enroll-user-handle">@{{ user.username }}</span>
                  </div>
                </div>
                <div class="enroll-enrolled-right">
                  <div v-if="group.subjects.length" class="enroll-block-chips">
                    <button
                      v-for="subj in group.subjects"
                      :key="subj.id"
                      class="enroll-block-chip"
                      :class="{
                        'is-blocking': blockSubjectDialog.processing && blockSubjectDialog.userId === user.userId && blockSubjectDialog.selectedSubjectId === subj.id,
                        'is-blocked': isSubjectBlocked(user.userId, group.courseId, subj.id)
                      }"
                      @click="isSubjectBlocked(user.userId, group.courseId, subj.id) ? openUnblockSubjectDialog(user.userId, group.courseId, subj.id, user.fullName || user.username || 'Usuario', subj.name) : openBlockSubjectDialog(user.userId, group.courseId, user.fullName || user.username || 'Usuario', group.subjects, subj.id)"
                      :title="isSubjectBlocked(user.userId, group.courseId, subj.id) ? `Restaurar acceso a ${subj.name}` : `Quitar acceso a ${subj.name}`"
                    >
                      <!-- Lock icon when blocked -->
                      <svg v-if="isSubjectBlocked(user.userId, group.courseId, subj.id)" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span :class="{ 'subj-blocked-text': isSubjectBlocked(user.userId, group.courseId, subj.id) }">{{ subj.name }}</span>
                      <!-- X icon when active, checkmark when blocked -->
                      <svg v-if="!isSubjectBlocked(user.userId, group.courseId, subj.id)" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      <span v-else class="enroll-blocked-badge">bloqueada</span>
                    </button>
                  </div>
                  <button
                    class="enroll-revoke-btn"
                    :disabled="revokingKeys[`${user.userId}-${group.courseId}`]"
                    @click="openRevokeDialog(user.userId, group.courseId, user.fullName || user.username || 'Usuario', group.courseName)"
                    title="Quitar acceso al curso"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    {{ revokingKeys[`${user.userId}-${group.courseId}`] ? 'Quitando...' : 'Quitar curso' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════ REVOCADOS (usuarios con acceso quitado) ══════════════ -->
      <div v-if="enrollmentSubTab === 'matricula' && revokedEnrollments.length > 0" class="enroll-section" style="margin-top: 24px;">
        <div class="enroll-hero">
          <div class="enroll-hero-glow enroll-hero-glow--red"></div>
          <div class="enroll-hero-top">
            <div class="enroll-hero-icon-wrap enroll-hero-icon-wrap--red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div class="enroll-hero-text">
              <h3 class="enroll-hero-title">Accesos Revocados</h3>
              <p class="enroll-hero-sub">Usuarios a los que se les quitó el acceso. Puedes restaurarlo.</p>
            </div>
          </div>
          <div class="enroll-kpi-row">
            <div class="enroll-kpi is-red">
              <span class="enroll-kpi-num">{{ revokedEnrollments.length }}</span>
              <span class="enroll-kpi-lbl">Revocados</span>
            </div>
          </div>
        </div>

        <div class="enroll-user-rows" style="padding: 0 16px;">
          <div
            v-for="item in revokedEnrollments"
            :key="`revoked-${item.userId}-${item.courseId}`"
            class="enroll-enrolled-row has-blocked-subjects"
          >
            <div class="enroll-enrolled-left">
              <img :src="item.avatar || '/default-avatar.png'" class="enroll-avatar enroll-avatar--sm" alt="" @error="onAvatarError" />
              <div class="enroll-user-info">
                <span class="enroll-user-name">{{ item.fullName || item.username || `Usuario #${item.userId}` }}</span>
                <span class="enroll-user-handle">@{{ item.username }} · {{ item.courseName || `Curso #${item.courseId}` }}</span>
                <span v-if="item.revokeReason" class="enroll-revoke-reason">Motivo: {{ item.revokeReason }}</span>
              </div>
            </div>
            <div class="enroll-enrolled-right">
              <button
                class="enroll-restore-btn"
                :disabled="restoringKeys[`${item.userId}-${item.courseId}`]"
                @click="confirmRestoreEnrollment(item.userId, item.courseId)"
                title="Restaurar acceso al curso"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                {{ restoringKeys[`${item.userId}-${item.courseId}`] ? 'Restaurando...' : 'Restaurar acceso' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Dialog: Revocar curso ── -->
      <Teleport to="body">
        <Transition name="dialog-fade">
          <div v-if="revokeDialog.visible" class="enroll-dialog-overlay" @click="revokeDialog.visible = false">
            <div class="enroll-dialog" @click.stop>
              <div class="enroll-dialog-icon-wrap is-red">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h3 class="enroll-dialog-title">Quitar acceso al curso</h3>
              <p class="enroll-dialog-desc">¿Por qué desea quitar el acceso de <strong>{{ revokeDialog.userName }}</strong> al curso <strong>{{ revokeDialog.courseName }}</strong>?</p>
              <textarea v-model="revokeDialog.reason" class="enroll-dialog-textarea" placeholder="Escriba la razón (obligatorio)..." rows="3" />
              <div class="enroll-dialog-actions">
                <button class="enroll-dialog-cancel" @click="revokeDialog.visible = false">Cancelar</button>
                <button
                  class="enroll-dialog-confirm is-red"
                  :disabled="!revokeDialog.reason.trim() || revokeDialog.processing"
                  @click="confirmRevokeEnrollment"
                >{{ revokeDialog.processing ? 'Quitando...' : 'Quitar acceso' }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Dialog: Bloquear materia ── -->
      <Teleport to="body">
        <Transition name="dialog-fade">
          <div v-if="blockSubjectDialog.visible" class="enroll-dialog-overlay" @click="blockSubjectDialog.visible = false">
            <div class="enroll-dialog" @click.stop>
              <div class="enroll-dialog-icon-wrap is-amber">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
              </div>
              <h3 class="enroll-dialog-title">Quitar acceso a materia</h3>
              <p class="enroll-dialog-desc">Se bloqueará el acceso de <strong>{{ blockSubjectDialog.userName }}</strong> a la materia seleccionada.</p>
              <div class="enroll-dialog-section-label">Materia</div>
              <div class="enroll-dialog-chip-grid">
                <button
                  v-for="subj in blockSubjectDialog.subjects"
                  :key="subj.id"
                  class="enroll-dialog-chip"
                  :class="{ selected: blockSubjectDialog.selectedSubjectId === subj.id }"
                  @click="blockSubjectDialog.selectedSubjectId = subj.id"
                >
                  <svg v-if="blockSubjectDialog.selectedSubjectId === subj.id" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ subj.name }}
                </button>
              </div>
              <div class="enroll-dialog-section-label">Razón del bloqueo</div>
              <textarea v-model="blockSubjectDialog.reason" class="enroll-dialog-textarea" placeholder="Ej: No cumplió con los requisitos previos..." rows="3" />
              <div class="enroll-dialog-actions">
                <button class="enroll-dialog-cancel" @click="blockSubjectDialog.visible = false">Cancelar</button>
                <button
                  class="enroll-dialog-confirm is-amber"
                  :disabled="!blockSubjectDialog.selectedSubjectId || !blockSubjectDialog.reason.trim() || blockSubjectDialog.processing"
                  @click="confirmBlockSubjectAccess"
                >{{ blockSubjectDialog.processing ? 'Bloqueando...' : 'Quitar acceso' }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Dialog: Restaurar acceso a materia ── -->
      <Teleport to="body">
        <Transition name="dialog-fade">
          <div v-if="unblockSubjectDialog.visible" class="enroll-dialog-overlay" @click="unblockSubjectDialog.visible = false">
            <div class="enroll-dialog" @click.stop>
              <div class="enroll-dialog-icon-wrap is-green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
              </div>
              <h3 class="enroll-dialog-title">Restaurar acceso a materia</h3>
              <p class="enroll-dialog-desc">¿Desea restaurar el acceso de <strong>{{ unblockSubjectDialog.userName }}</strong> a la materia <strong>{{ unblockSubjectDialog.subjectName }}</strong>?</p>
              <div class="enroll-dialog-actions">
                <button class="enroll-dialog-cancel" @click="unblockSubjectDialog.visible = false">Cancelar</button>
                <button
                  class="enroll-dialog-confirm is-green"
                  :disabled="unblockSubjectDialog.processing"
                  @click="confirmUnblockSubjectAccess"
                >{{ unblockSubjectDialog.processing ? 'Restaurando...' : 'Restaurar acceso' }}</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Certificados Tab -->
    <div v-if="activeTab === 'certificates' && canViewCertificates" class="tab-content">
      <div v-if="loadingCertificates" class="empty-state">
        <p style="color:#8E8E93">Cargando certificados...</p>
      </div>
      <div v-else class="certificates-admin-section">
        <div class="section-card certificates-header-card">
          <div class="certificates-header-top">
            <div>
              <h4 class="section-title">Emisión de certificados</h4>
              <p class="certificates-header-description">Se habilitan cuando el progreso del curso está en estado Ganado.</p>
            </div>
            <button
              class="expire-btn certificates-bulk-btn"
              :disabled="issuingAllCertificates || pendingCertificatesCount === 0"
              @click="issueAllCertificates"
            >
              {{ issuingAllCertificates ? 'Emitiendo...' : `Emitir pendientes (${pendingCertificatesCount})` }}
            </button>
          </div>
          <div class="certificates-stats-row">
            <div class="certificates-stat-pill certificates-stat-total">
              <span class="stat-number">{{ certificates.length }}</span>
              <span class="stat-desc">Candidatos</span>
            </div>
            <div class="certificates-stat-pill certificates-stat-pending">
              <span class="stat-number">{{ pendingCertificatesCount }}</span>
              <span class="stat-desc">Pendientes</span>
            </div>
            <div class="certificates-stat-pill certificates-stat-issued">
              <span class="stat-number">{{ issuedCertificatesCount }}</span>
              <span class="stat-desc">Emitidos</span>
            </div>
          </div>
        </div>

        <div v-if="certificates.length === 0" class="section-card">
          <div class="empty-state">
            <span class="emoji">🎓</span>
            <p>No hay estudiantes con progreso Ganado para emitir certificados</p>
          </div>
        </div>
        <div v-else class="items-list">
          <div
            v-for="cert in certificates"
            :key="`${cert.userId}-${cert.courseId}`"
            class="cert-card cert-admin-card"
          >
            <div class="cert-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>
            </div>
            <div class="cert-info">
              <h5>{{ cert.courseName || `Curso ${cert.courseId}` }}</h5>
              <p class="cert-date">{{ cert.username ? `Estudiante: ${cert.username}` : `Usuario #${cert.userId}` }}</p>
              <p class="cert-date">Progreso: {{ cert.completedTasks }}/{{ cert.totalTasks }} · {{ cert.progressPercentage }}%</p>
              <p v-if="cert.averageGrade !== null" class="cert-date">Promedio: {{ cert.averageGrade }}</p>
              <p class="cert-date">{{ cert.certificateIssuedAt ? `Emitido: ${formatDate(cert.certificateIssuedAt)}` : 'Pendiente de emisión' }}</p>
              <a
                v-if="getCertificateAccessUrl(cert)"
                :href="getCertificateAccessUrl(cert) || undefined"
                target="_blank"
                class="cert-link"
              >Abrir certificado ↗</a>
            </div>
            <div class="cert-admin-actions">
              <button
                class="toggle-btn activate-btn"
                :disabled="Boolean(cert.certificateIssuedAt) || isIssuingCertificate(cert)"
                @click="issueCertificateForStudent(cert)"
              >
                {{ cert.certificateIssuedAt ? '✓ Emitido' : isIssuingCertificate(cert) ? 'Emitiendo...' : 'Emitir' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { useRouter, useRoute } from 'vue-router'
import { progressAdapter } from '@/infrastructure/api/progressAdapter'
import { userAdapter } from '@/infrastructure/api/userAdapter'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { reinforcementAdapter } from '@/infrastructure/api/reinforcementAdapter'
import { buildProxyFileUrl } from '@/infrastructure/api'
import { courseAdapter } from '@/infrastructure/api/courseAdapter'
import { subjectAdapter } from '@/infrastructure/api/subjectAdapter'
import { taskAdapter } from '@/infrastructure/api/taskAdapter'
import { topicAdapter } from '@/infrastructure/api/topicAdapter'
import { subscriptionAdapter } from '@/infrastructure/api/subscriptionAdapter'
import { api, HttpError, tokenStorage } from '@/infrastructure/api/httpClient'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'

type EnrollmentTone = 'student' | 'teacher' | 'admin' | 'neutral'

interface EnrollmentRoleChip {
  key: string
  label: string
  tone: EnrollmentTone
}

interface PendingEnrollmentItem {
  userId: number
  courseId: number
  username: string | null
  displayName: string
  usernameLabel: string
  courseName: string | null
  requestedAt: string | number | null
  status: string | null
  avatar: string | null
  roleChips: EnrollmentRoleChip[]
  identificacion: string | null
}

interface AdminCertificateItem {
  userId: number
  username: string | null
  avatar: string | null
  courseId: number
  courseName: string | null
  courseThumbnail: string | null
  certificateUrl: string | null
  certificateIssuedAt: string | null
  verificationCode: string | null
  status: 'Ganado'
  averageGrade: number | null
  completedTasks: number
  totalTasks: number
  progressPercentage: number
}

const CERTIFICATE_WEB_BASE_URL = 'https://v0-eo-jesuh02s-projects.vercel.app'

function buildFallbackCertificateUrl(cert: AdminCertificateItem): string | null {
  if (!cert.certificateIssuedAt) return null

  const issuedDate = new Date(cert.certificateIssuedAt)
  const safeDate = Number.isNaN(issuedDate.getTime()) ? new Date() : issuedDate
  const date = `${String(safeDate.getUTCDate()).padStart(2, '0')}/${String(safeDate.getUTCMonth() + 1).padStart(2, '0')}/${safeDate.getUTCFullYear()}`

  const params = new URLSearchParams({
    studentName: (cert.username || `Usuario ${cert.userId}`).trim(),
    courseName: (cert.courseName || `Curso ${cert.courseId}`).trim(),
    grade: (Number.isFinite(Number(cert.averageGrade)) ? Number(cert.averageGrade) : 0).toFixed(1),
    tasksCompleted: String(cert.completedTasks || 0),
    totalTasks: String(cert.totalTasks || 0),
    progress: String(Math.round(cert.progressPercentage || 0)),
    instructorName: 'CourseV',
    instructorUsername: 'coursev',
    userId: String(cert.userId),
    courseId: String(cert.courseId),
    certId: (cert.verificationCode || `CERT-${cert.courseId}-${cert.userId}`).trim(),
    date,
  })

  return `${CERTIFICATE_WEB_BASE_URL}?${params.toString()}`
}

function getCertificateAccessUrl(cert: AdminCertificateItem): string | null {
  return cert.certificateUrl || buildFallbackCertificateUrl(cert)
}

function resolveCertificateUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null

  const trimmed = rawUrl.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const normalizedKey = trimmed
    .replace(/^\/+api\/+v1\/+public\/+files\/+?/i, '')
    .replace(/^\/+public\/+files\/+?/i, '')
    .replace(/^\/+/, '')

  return normalizedKey ? buildProxyFileUrl(normalizedKey) : null
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const roleIds = computed(() => {
  const ids = (authStore.user?.roles ?? [])
    .map((role: any) => Number(role?.id))
    .filter((roleId: number) => Number.isInteger(roleId) && roleId > 0)

  return [...new Set(ids)]
})

const hasAdminRole = computed(() => {
  const roles = authStore.user?.roles ?? []
  return authStore.isAdmin || roles.some((role: any) => {
    const roleId = Number(role?.id)
    const roleName = String(role?.nombre || '').toLowerCase()
    return roleId === 3 || roleName === 'admin'
  })
})

const hasTeacherRole = computed(() => roleIds.value.includes(2))
const isRole1Only = computed(() =>
  roleIds.value.length === 1 &&
  roleIds.value[0] === 1 &&
  !hasAdminRole.value
)

const canViewFullModeration = computed(() => hasAdminRole.value || hasTeacherRole.value)
const canViewCertificates = computed(() => hasAdminRole.value)
const canViewActivation = computed(() => hasAdminRole.value)
const canManageRoles = computed(() => hasAdminRole.value)
const shouldUseCompactTabs = computed(() => isRole1Only.value)

const activeTab = ref('analytics')

// Certificados
const certificates = ref<AdminCertificateItem[]>([])
const loadingCertificates = ref(false)
const issuingAllCertificates = ref(false)
const issuingCertificateKeys = ref<Record<string, boolean>>({})
const issuedCertificatesCount = computed(() => certificates.value.filter((cert) => Boolean(cert.certificateIssuedAt)).length)
const pendingCertificatesCount = computed(() => certificates.value.filter((cert) => !cert.certificateIssuedAt).length)

const certificateKey = (cert: Pick<AdminCertificateItem, 'userId' | 'courseId'>) => `${cert.userId}-${cert.courseId}`
const isIssuingCertificate = (cert: Pick<AdminCertificateItem, 'userId' | 'courseId'>) => Boolean(issuingCertificateKeys.value[certificateKey(cert)])

const normalizeCertificate = (item: Record<string, any>): AdminCertificateItem => ({
  userId: Number(item.userId ?? item.user_id ?? 0) || 0,
  username: typeof item.username === 'string' && item.username.trim().length > 0 ? item.username.trim() : null,
  avatar: typeof item.avatar === 'string' && item.avatar.trim().length > 0 ? item.avatar.trim() : null,
  courseId: Number(item.courseId ?? item.course_id ?? 0) || 0,
  courseName: typeof item.courseName === 'string' && item.courseName.trim().length > 0 ? item.courseName.trim() : null,
  courseThumbnail: typeof item.courseThumbnail === 'string' && item.courseThumbnail.trim().length > 0 ? item.courseThumbnail.trim() : null,
  certificateUrl: resolveCertificateUrl(typeof item.certificateUrl === 'string' ? item.certificateUrl : null),
  certificateIssuedAt: typeof item.certificateIssuedAt === 'string' && item.certificateIssuedAt.trim().length > 0 ? item.certificateIssuedAt : null,
  verificationCode: typeof item.verificationCode === 'string' && item.verificationCode.trim().length > 0 ? item.verificationCode.trim() : null,
  status: 'Ganado',
  averageGrade: Number.isFinite(Number(item.averageGrade)) ? Number(item.averageGrade) : null,
  completedTasks: Number(item.completedTasks ?? item.completed_tasks ?? 0) || 0,
  totalTasks: Number(item.totalTasks ?? item.total_tasks ?? 0) || 0,
  progressPercentage: Number(item.progressPercentage ?? item.progress_percentage ?? 0) || 0,
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Fecha no disponible'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

const loadCertificates = async () => {
  loadingCertificates.value = true
  try {
    const data = await progressAdapter.getAllCertificates()
    certificates.value = (Array.isArray(data) ? data : [])
      .map((item) => normalizeCertificate(item as Record<string, any>))
      .filter((cert) => cert.userId > 0 && cert.courseId > 0 && cert.status === 'Ganado')
      .sort((left, right) => {
        if (Boolean(left.certificateIssuedAt) !== Boolean(right.certificateIssuedAt)) {
          return left.certificateIssuedAt ? 1 : -1
        }
        return (left.courseName || '').localeCompare(right.courseName || '', 'es')
      })
  } catch (error) {
    console.error('Error loading certificates:', error)
    certificates.value = []
  } finally {
    loadingCertificates.value = false
  }
}

const issueCertificateForStudent = async (cert: AdminCertificateItem) => {
  const key = certificateKey(cert)
  if (issuingCertificateKeys.value[key] || cert.certificateIssuedAt) return

  issuingCertificateKeys.value = {
    ...issuingCertificateKeys.value,
    [key]: true,
  }

  try {
    await progressAdapter.issueCertificate(cert.courseId, cert.userId)
    await loadCertificates()
  } catch (error) {
    console.error('Error issuing certificate:', error)
  } finally {
    const { [key]: _removed, ...rest } = issuingCertificateKeys.value
    issuingCertificateKeys.value = rest
  }
}

const issueAllCertificates = async () => {
  if (issuingAllCertificates.value || pendingCertificatesCount.value === 0) return

  issuingAllCertificates.value = true
  try {
    await progressAdapter.bulkIssueCertificatesAll()
    await loadCertificates()
  } catch (error) {
    console.error('Error issuing all certificates:', error)
  } finally {
    issuingAllCertificates.value = false
  }
}

const allTabs = [
  { id: 'analytics', label: 'Analytics', adminOnly: false },
  { id: 'moderation', label: 'Moderación', adminOnly: false },
  { id: 'roles', label: 'Roles', adminOnly: false },
  { id: 'certificates', label: 'Certificados', adminOnly: true },
  { id: 'activation', label: 'Activación', adminOnly: true },
  { id: 'enrollment', label: 'Matrícula', adminOnly: true }
]

const visibleTabs = computed(() => {
  if (shouldUseCompactTabs.value) {
    return allTabs.filter((tab) => tab.id === 'moderation' || tab.id === 'roles')
  }

  return allTabs.filter((tab) => !tab.adminOnly || hasAdminRole.value)
})

watch(visibleTabs, (tabs) => {
  if (!tabs.some((tab) => tab.id === activeTab.value)) {
    activeTab.value = tabs[0]?.id ?? 'analytics'
  }
}, { immediate: true })

watch(activeTab, (tab) => {
  if (tab === 'activation' && users.value.length === 0 && !loadingUsers.value) {
    loadUsers()
  }

  if (tab === 'enrollment') {
    if (enrollmentSubTab.value === 'matricula') {
      loadApprovedEnrollmentsIfNeeded()
    } else if (pendingEnrollments.value.length === 0 && !loadingEnrollments.value) {
      loadEnrollments()
    }
  }
})

// ─── User activation state ───────────────────────────────────────────────
const users = ref<any[]>([])
const loadingUsers = ref(false)
const userSearch = ref('')
const processingExpired = ref(false)
const usersLoadWarning = ref('')

const ROLE_META: Record<number, { label: string; tone: EnrollmentTone }> = {
  1: { label: 'Estudiante', tone: 'student' },
  2: { label: 'Docente', tone: 'teacher' },
  3: { label: 'Admin', tone: 'admin' },
}

const getUserPersona = (user: any) => user?.persona ?? user?.personas ?? null

const normalizeSearchText = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const normalizeSearchDigits = (value: unknown) => String(value ?? '').replace(/\D+/g, '')

const matchesFlexibleUserSearch = (query: string, ...candidates: unknown[]) => {
  if (!query.trim()) return true

  const normalizedQuery = normalizeSearchText(query)
  const digitsQuery = normalizeSearchDigits(query)

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeSearchText(candidate)
    if (normalizedQuery && normalizedCandidate.includes(normalizedQuery)) return true
    return Boolean(digitsQuery) && normalizeSearchDigits(candidate).includes(digitsQuery)
  })
}

const normalizeActivationUser = (user: any) => {
  const persona = getUserPersona(user)
  return {
    ...user,
    persona,
    personas: persona,
    personaId: user?.personaId ?? user?.persona_id ?? persona?.id ?? null,
    isActive: user?.isActive ?? user?.is_active ?? true,
  }
}

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter((u: any) => {
    const persona = getUserPersona(u)
    return matchesFlexibleUserSearch(
      q,
      u.username,
      persona?.identificacion,
      persona?.cedula,
      persona?.nombres,
      persona?.apellidos,
    )
  })
})

const activeUsersCount = computed(() => filteredUsers.value.filter((u: any) => u.isActive).length)
const inactiveUsersCount = computed(() => filteredUsers.value.filter((u: any) => !u.isActive).length)

const formatRoles = (roles: any[]) => {
  if (!roles?.length) return 'Sin rol'
  const names: Record<number, string> = { 1: 'Estudiante', 2: 'Docente', 3: 'Admin' }
  return roles.map((r: any) => names[r.id] || `Rol ${r.id}`).join(', ')
}

const availableRoles = [
  { id: 1, label: 'Usuario' },
  { id: 2, label: 'Docente' },
  { id: 3, label: 'Admin' }
]

const userRoles = computed(() => {
  const userRoleIds = new Set(
    (authStore.user?.roles ?? []).map((r: any) => Number(r?.id)).filter(Number.isInteger)
  )
  return availableRoles.filter(role => userRoleIds.has(role.id))
})

const rolesVisibleUsers = computed(() =>
  filteredUsers.value.filter((u: any) => getUserPersona(u) !== null)
)

const usersWithRole = (roleId: number) =>
  users.value.filter((u: any) => getUserPersona(u) !== null && userHasRole(u, roleId)).length

const assigningRole = ref<Record<string, boolean>>({})

const userHasRole = (user: any, roleId: number): boolean => {
  if (!user.roles?.length) return false
  return user.roles.some((r: any) => Number(r.id) === roleId)
}

const toggleRole = async (user: any, roleId: number) => {
  if (!canManageRoles.value) return
  const key = `${user.id}-${roleId}`
  if (assigningRole.value[key]) return
  assigningRole.value[key] = true
  try {
    await userAdapter.assignRole(user.id, roleId)
    // Actualizar roles del usuario en la lista local
    if (!user.roles) user.roles = []
    const existingIndex = user.roles.findIndex((r: any) => Number(r.id) === roleId)
    if (existingIndex >= 0) {
      // El backend hace upsert, así que si ya lo tiene se reafirma
    } else {
      const roleName = availableRoles.find(r => r.id === roleId)?.label || `Rol ${roleId}`
      user.roles.push({ id: roleId, nombre: roleName })
    }
  } catch (e) {
    console.error('Error assigning role:', e)
  } finally {
    assigningRole.value[key] = false
  }
}

const extractNumericId = (...values: unknown[]): number | null => {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isInteger(parsed) && parsed > 0) return parsed
  }
  return null
}

const mergeUsersById = (items: any[]) => {
  const byId = new Map<number, any>()
  for (const item of items) {
    const id = extractNumericId(item?.id, item?.userId, item?.user_id)
    if (!id) continue
    byId.set(id, normalizeActivationUser(item))
  }
  return [...byId.values()]
}

const loadUsersFromManageableCourses = async (): Promise<any[]> => {
  const currentUserId = extractNumericId(authStore.user?.id, tokenStorage.userId)
  if (!currentUserId) return []

  const idSet = new Set<number>([currentUserId])
  const courses = await courseAdapter.getManageableCourses(currentUserId).catch(() => [])

  await Promise.allSettled((Array.isArray(courses) ? courses : []).map(async (course: any) => {
    const courseId = extractNumericId(course?.id)
    if (!courseId) return

    const [progressRows, submissionRows] = await Promise.all([
      progressAdapter.getAllProgressByCourse(courseId).catch(() => []),
      submissionAdapter.getSubmissionByCourse(courseId).catch(() => []),
    ])

    if (Array.isArray(progressRows)) {
      for (const row of progressRows) {
        const id = extractNumericId((row as any)?.userId, (row as any)?.user_id, (row as any)?.studentId, (row as any)?.usuario_id)
        if (id) idSet.add(id)
      }
    }

    if (Array.isArray(submissionRows)) {
      for (const row of submissionRows) {
        const id = extractNumericId((row as any)?.studentId, (row as any)?.student_id, (row as any)?.userId, (row as any)?.user_id)
        if (id) idSet.add(id)
      }
    }
  }))

  const ids = [...idSet]
  if (ids.length === 0) return []

  const usersByIds = await userAdapter.getUsersByIds(ids).catch(() => [])
  const me = await userAdapter.getMyProfile().catch(() => null)
  return mergeUsersById([...(Array.isArray(usersByIds) ? usersByIds : []), ...(me ? [me] : [])])
}

const loadUsers = async () => {
  loadingUsers.value = true
  usersLoadWarning.value = ''
  try {
    const data = await userAdapter.listAllUsers()
    users.value = Array.isArray(data) ? data.map((user: any) => normalizeActivationUser(user)) : []
  } catch (e) {
    const statusCode = (e as any)?.statusCode ?? (e as any)?.status
    if (statusCode === 403) {
      // Sin permisos de admin: mostrar solo el usuario actual (igual que Android para no-admin)
      try {
        const me = await userAdapter.getMyProfile()
        users.value = me ? [normalizeActivationUser(me)] : []
      } catch {
        users.value = []
      }
    } else {
      console.error('Error loading users:', e)
    }
  } finally {
    loadingUsers.value = false
  }
}

const toggleUserActivation = async (user: any, activate: boolean) => {
  if (!canManageRoles.value) return
  try {
    if (activate) {
      await userAdapter.activateUser(user.id)
    } else {
      await userAdapter.deactivateUser(user.id)
    }
    user.isActive = activate
  } catch (e) {
    console.error('Error toggling user:', e)
  }
}

const processExpiredCourses = async () => {
  if (!canManageRoles.value) return
  processingExpired.value = true
  try {
    await userAdapter.processExpiredCourseUsers([])
    await loadUsers()
  } catch (e) {
    console.error('Error processing expired courses:', e)
  } finally {
    processingExpired.value = false
  }
}

// ─── Enrollment state ────────────────────────────────────────────────────
const pendingEnrollments = ref<PendingEnrollmentItem[]>([])
const loadingEnrollments = ref(false)
const enrollmentApprovedCount = ref(0)
const enrollmentRejectedCount = ref(0)
const enrollmentUserFilter = ref('')
const enrollmentCourseFilter = ref('')

const filteredEnrollments = computed(() => {
  const uq = enrollmentUserFilter.value.toLowerCase()
  const cq = enrollmentCourseFilter.value.toLowerCase()
  return pendingEnrollments.value.filter(r => {
    const matchUser = matchesFlexibleUserSearch(uq, r.displayName, r.username, r.identificacion)
    const matchCourse = !cq
      || (r.courseName ?? '').toLowerCase().includes(cq)
      || String(r.courseId ?? '').includes(cq)
    return matchUser && matchCourse
  })
})

const formatTimeAgoEnroll = (timestamp: string | number) => {
  const parsedTime = new Date(timestamp).getTime()
  if (Number.isNaN(parsedTime)) return 'Fecha no disponible'
  const diff = Date.now() - parsedTime
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

const toNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const toNonEmptyString = (...values: unknown[]): string | null => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return null
}

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const roleLabelFromName = (value: string | null): string | null => {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  if (normalized.includes('admin')) return 'Admin'
  if (normalized.includes('docente') || normalized.includes('teacher') || normalized.includes('profesor')) return 'Docente'
  if (normalized.includes('estudiante') || normalized.includes('student') || normalized.includes('usuario')) return 'Estudiante'
  return toTitleCase(normalized)
}

const toneFromRoleLabel = (label: string): EnrollmentTone => {
  if (label === 'Admin') return 'admin'
  if (label === 'Docente') return 'teacher'
  if (label === 'Estudiante') return 'student'
  return 'neutral'
}

const extractRoleEntries = (value: unknown): Array<{ id: number | null; label: string | null }> => {
  if (Array.isArray(value)) {
    return value.flatMap(entry => extractRoleEntries(entry))
  }

  if (value && typeof value === 'object') {
    const raw = value as Record<string, unknown>
    if (Array.isArray(raw.roles) || Array.isArray(raw.roleIds) || Array.isArray(raw.role_ids)) {
      return [
        ...extractRoleEntries(raw.roles),
        ...extractRoleEntries(raw.roleIds),
        ...extractRoleEntries(raw.role_ids),
      ]
    }

    const roleId = toNumberOrNull(raw.id ?? raw.roleId ?? raw.role_id ?? raw.rolId ?? raw.rol_id)
    const roleLabel = roleLabelFromName(toNonEmptyString(raw.nombre, raw.name, raw.label, raw.rol))
    if (roleId || roleLabel) return [{ id: roleId, label: roleLabel }]
    return []
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const roleId = toNumberOrNull(value)
    if (roleId) return [{ id: roleId, label: null }]
    const roleLabel = roleLabelFromName(String(value))
    return roleLabel ? [{ id: null, label: roleLabel }] : []
  }

  return []
}

const normalizeEnrollmentRoleChips = (...sources: unknown[]): EnrollmentRoleChip[] => {
  const unique = new Map<string, EnrollmentRoleChip>()

  for (const source of sources) {
    for (const entry of extractRoleEntries(source)) {
      const meta = entry.id ? ROLE_META[entry.id] : undefined
      const label = meta?.label ?? entry.label
      if (!label) continue
      const tone = meta?.tone ?? toneFromRoleLabel(label)
      const key = entry.id ? `id:${entry.id}` : `label:${label.toLowerCase()}`
      if (!unique.has(key)) {
        unique.set(key, { key, label, tone })
      }
    }
  }

  return [...unique.values()]
}

const buildEnrollmentDisplayName = (item: Record<string, any>, profile?: Record<string, any> | null) => {
  const persona = profile?.persona as Record<string, any> | undefined
  const fullName = toNonEmptyString(
    item.fullName,
    [item.nombres, item.apellidos].filter(Boolean).join(' ').trim(),
    profile?.fullName,
    [profile?.nombres, profile?.apellidos].filter(Boolean).join(' ').trim(),
    [persona?.nombres, persona?.apellidos].filter(Boolean).join(' ').trim(),
  )
  const username = toNonEmptyString(item.username, item.usuario, profile?.username)
  const displayName = fullName ?? username ?? `Usuario #${item.userId}`
  return {
    displayName,
    username,
    usernameLabel: username ? `@${username}` : `ID ${item.userId}`,
  }
}

const loadEnrollments = async () => {
  loadingEnrollments.value = true
  try {
    const data = await progressAdapter.getPendingEnrollments()
    const rows = Array.isArray(data)
      ? data.map((item: any) => ({
        ...item,
        userId: toNumberOrNull(item.userId ?? item.user_id),
        courseId: toNumberOrNull(item.courseId ?? item.course_id ?? item.curso_id),
        courseName: toNonEmptyString(item.courseName, item.course_name),
        requestedAt: item.requestedAt ?? item.requested_at ?? null,
        status: toNonEmptyString(item.enrollmentStatus, item.enrollment_status, item.status),
        avatar: toNonEmptyString(item.avatar),
      })).filter((item: any) => item.userId && item.courseId)
      : []

    const missingProfileUserIds = [...new Set(
      rows
        .filter((item: any) => {
          const hasRoles = normalizeEnrollmentRoleChips(item.roles, item.roleIds, item.role_ids).length > 0
          const hasIdentity = Boolean(
            toNonEmptyString(
              item.fullName,
              [item.nombres, item.apellidos].filter(Boolean).join(' ').trim(),
              item.username,
              item.usuario,
              item.avatar,
            )
          )
          const hasDocument = Boolean(toNonEmptyString(item.identificacion_original, item.identificacion, item.cedula))
          return !hasRoles || !hasIdentity || !hasDocument
        })
        .map((item: any) => item.userId)
    )]

    const profileMap = new Map<number, any>()
    await Promise.all(missingProfileUserIds.map(async (userId) => {
      try {
        const profile = await userAdapter.getUserById(userId)
        profileMap.set(userId, profile)
      } catch {
        profileMap.set(userId, null)
      }
    }))

    pendingEnrollments.value = rows.map((item: any) => {
      const profile = profileMap.get(item.userId) ?? null
      const roleChips = normalizeEnrollmentRoleChips(
        item.roles,
        item.roleIds,
        item.role_ids,
        profile?.roles,
        profile?.roleIds,
        profile?.role_ids,
      )
      const identity = buildEnrollmentDisplayName(item, profile)

      return {
        userId: item.userId,
        courseId: item.courseId,
        username: identity.username,
        displayName: identity.displayName,
        usernameLabel: identity.usernameLabel,
        courseName: item.courseName,
        requestedAt: item.requestedAt,
        status: item.status,
        avatar: item.avatar ?? profile?.avatar ?? null,
        roleChips,
        identificacion: toNonEmptyString(
          item.identificacion_original,
          item.identificacion,
          item.cedula,
          profile?.persona?.identificacion,
          profile?.persona?.cedula,
        ),
      }
    })
  } catch (e) {
    console.error('Error loading enrollments:', e)
    pendingEnrollments.value = []
  } finally {
    loadingEnrollments.value = false
  }
}

const approveEnrollmentReq = async (req: PendingEnrollmentItem) => {
  try {
    await progressAdapter.approveEnrollment(req.userId, req.courseId)
    pendingEnrollments.value = pendingEnrollments.value.filter(
      r => !(r.userId === req.userId && r.courseId === req.courseId)
    )
    enrollmentApprovedCount.value++
    notifStore.fetchUnreadCount()
  } catch (e) {
    console.error('Error approving enrollment:', e)
  }
}

const rejectEnrollmentReq = async (req: PendingEnrollmentItem) => {
  try {
    await progressAdapter.rejectEnrollment(req.userId, req.courseId)
    pendingEnrollments.value = pendingEnrollments.value.filter(
      r => !(r.userId === req.userId && r.courseId === req.courseId)
    )
    enrollmentRejectedCount.value++
  } catch (e) {
    console.error('Error rejecting enrollment:', e)
  }
}

// ─── Matrícula (approved enrollments) state ──────────────────────────────
const enrollmentSubTab = ref<'pre' | 'matricula'>('pre')

interface ApprovedEnrollmentItem {
  userId: number
  courseId: number
  username: string | null
  fullName: string | null
  avatar: string | null
  identificacion: string | null
  courseName: string | null
  subjects: { id: number; name: string }[]
  status: string
  revokeReason: string | null
}

const approvedEnrollments = ref<ApprovedEnrollmentItem[]>([])
const loadingApproved = ref(false)
const approvedUserFilter = ref('')
const approvedCourseFilter = ref('')
const approvedSubjectFilter = ref('')
const revokingKeys = ref<Record<string, boolean>>({})
const restoringKeys = ref<Record<string, boolean>>({})
const blockedSubjectKeys = ref<Set<string>>(new Set())
let approvedLoaded = false

const applyAdminQueryNavigation = async () => {
  const tab = String(route.query.tab ?? '').trim()
  const subtab = String(route.query.subtab ?? '').trim()
  const queryCourseId = String(route.query.courseId ?? '').trim()
  const queryCourseName = String(route.query.courseName ?? '').trim()
  const queryUsername = String(route.query.username ?? '').trim()

  if (tab === 'enrollment' && hasAdminRole.value) {
    activeTab.value = 'enrollment'
  }

  if (activeTab.value !== 'enrollment') return

  if (subtab === 'matricula') {
    enrollmentSubTab.value = 'matricula'
    await loadApprovedEnrollmentsIfNeeded()
    if (queryCourseName) {
      approvedCourseFilter.value = queryCourseName
    } else if (queryCourseId) {
      approvedCourseFilter.value = queryCourseId
    }
    return
  }

  if (subtab === 'pre' || !subtab) {
    enrollmentSubTab.value = 'pre'
    if (queryCourseName) {
      enrollmentCourseFilter.value = queryCourseName
    } else if (queryCourseId) {
      enrollmentCourseFilter.value = queryCourseId
    }
    if (queryUsername) {
      enrollmentUserFilter.value = queryUsername
    }
  }
}

const isSubjectBlocked = (userId: number, courseId: number, subjectId: number): boolean =>
  blockedSubjectKeys.value.has(`${userId}-${courseId}-${subjectId}`)

const hasAnyBlockedSubject = (userId: number, courseId: number, subjects: { id: number; name: string }[]): boolean =>
  subjects.some(s => blockedSubjectKeys.value.has(`${userId}-${courseId}-${s.id}`))

const approvedCoursesCount = computed(() => {
  const ids = new Set(approvedEnrollments.value.filter(e => e.status !== 'revoked').map(e => e.courseId))
  return ids.size
})

const revokedEnrollments = computed(() => approvedEnrollments.value.filter(e => e.status === 'revoked'))
const activeEnrollments = computed(() => approvedEnrollments.value.filter(e => e.status !== 'revoked'))

interface ApprovedGrouped {
  courseId: number
  courseName: string
  subjects: { id: number; name: string }[]
  users: ApprovedEnrollmentItem[]
}

const filteredApprovedGrouped = computed<ApprovedGrouped[]>(() => {
  const uq = approvedUserFilter.value.toLowerCase()
  const cq = approvedCourseFilter.value.toLowerCase()
  const sq = approvedSubjectFilter.value.toLowerCase()

  const filtered = activeEnrollments.value.filter(e => {
    const matchUser = matchesFlexibleUserSearch(uq, e.fullName, e.username, e.identificacion)
    const matchCourse = !cq
      || (e.courseName ?? '').toLowerCase().includes(cq)
      || String(e.courseId).includes(cq)
    const matchSubject = !sq || e.subjects.some(s => s.name.toLowerCase().includes(sq))
    return matchUser && matchCourse && matchSubject
  })

  const grouped = new Map<number, ApprovedGrouped>()
  for (const e of filtered) {
    if (!grouped.has(e.courseId)) {
      grouped.set(e.courseId, {
        courseId: e.courseId,
        courseName: e.courseName || `Curso #${e.courseId}`,
        subjects: e.subjects,
        users: [],
      })
    }
    grouped.get(e.courseId)!.users.push(e)
  }
  return Array.from(grouped.values())
})

const loadApprovedEnrollments = async () => {
  loadingApproved.value = true
  try {
    const data = await progressAdapter.getApprovedEnrollments()
    const rawRows = Array.isArray(data) ? data : []

    // Pre-populate blocked subject keys from backend data (persisted blocks)
    const newBlockedKeys = new Set<string>()
    for (const item of rawRows) {
      const uid = Number(item.userId ?? item.user_id) || 0
      const cid = Number(item.courseId ?? item.course_id) || 0
      const blocked: number[] = Array.isArray(item.blockedSubjectIds) ? item.blockedSubjectIds : []
      for (const sid of blocked) {
        newBlockedKeys.add(`${uid}-${cid}-${sid}`)
      }
    }
    blockedSubjectKeys.value = newBlockedKeys

    const rows = rawRows.map((item: any) => ({
      userId: Number(item.userId ?? item.user_id) || 0,
      courseId: Number(item.courseId ?? item.course_id) || 0,
      username: toNonEmptyString(item.username, item.usuario),
      fullName: toNonEmptyString(item.fullName),
      avatar: toNonEmptyString(item.avatar),
      identificacion: toNonEmptyString(item.identificacion_original, item.identificacion, item.cedula),
      courseName: toNonEmptyString(item.courseName, item.course_name),
      subjects: Array.isArray(item.subjects) ? item.subjects : [],
      status: String(item.status ?? item.enrollmentStatus ?? item.enrollment_status ?? 'approved'),
      revokeReason: toNonEmptyString(item.revokeReason, item.revoke_reason) ?? null,
    })).filter((item: any) => item.userId && item.courseId)

    const missingProfileUserIds = [...new Set(
      rows
        .filter((item: any) => !item.identificacion || !item.fullName)
        .map((item: any) => item.userId)
    )]

    const profileMap = new Map<number, any>()
    await Promise.all(missingProfileUserIds.map(async (userId) => {
      try {
        const profile = await userAdapter.getUserById(userId)
        profileMap.set(userId, profile)
      } catch {
        profileMap.set(userId, null)
      }
    }))

    approvedEnrollments.value = rows.map((item: any) => {
      const profile = profileMap.get(item.userId) ?? null
      const persona = profile?.persona ?? profile?.personas ?? null
      const fullName = item.fullName ?? toNonEmptyString(
        [persona?.nombres, persona?.apellidos].filter(Boolean).join(' ').trim(),
      )

      return {
        userId: item.userId,
        courseId: item.courseId,
        username: item.username ?? toNonEmptyString(profile?.username),
        fullName,
        avatar: item.avatar ?? toNonEmptyString(profile?.avatar),
        identificacion: item.identificacion ?? toNonEmptyString(persona?.identificacion, persona?.cedula),
        courseName: item.courseName,
        subjects: item.subjects,
        status: item.status,
        revokeReason: item.revokeReason,
      }
    })
  } catch (e) {
    console.error('Error loading approved enrollments:', e)
    approvedEnrollments.value = []
  } finally {
    loadingApproved.value = false
  }
}

const loadApprovedEnrollmentsIfNeeded = async () => {
  if (!approvedLoaded) {
    approvedLoaded = true
    await loadApprovedEnrollments()
  }
}

const revokeDialog = ref({
  visible: false,
  userId: 0,
  courseId: 0,
  userName: '',
  courseName: '',
  reason: '',
  processing: false,
})

const blockSubjectDialog = ref({
  visible: false,
  userId: 0,
  courseId: 0,
  userName: '',
  subjects: [] as { id: number; name: string }[],
  selectedSubjectId: 0,
  reason: '',
  processing: false,
})

const openRevokeDialog = (userId: number, courseId: number, userName: string, courseName: string) => {
  revokeDialog.value = { visible: true, userId, courseId, userName, courseName, reason: '', processing: false }
}

const openBlockSubjectDialog = (userId: number, courseId: number, userName: string, subjects: { id: number; name: string }[], preSelectedId: number = 0) => {
  blockSubjectDialog.value = { visible: true, userId, courseId, userName, subjects, selectedSubjectId: preSelectedId, reason: '', processing: false }
}

const confirmRevokeEnrollment = async () => {
  if (revokeDialog.value.processing) return
  const { userId, courseId, reason } = revokeDialog.value
  if (!reason.trim()) return
  revokeDialog.value.processing = true
  const key = `${userId}-${courseId}`
  revokingKeys.value[key] = true
  try {
    await progressAdapter.revokeEnrollment(userId, courseId, reason.trim())
    // Optimistic local update: remove user from approved enrollments immediately
    approvedEnrollments.value = approvedEnrollments.value.filter(
      e => !(e.userId === userId && e.courseId === courseId)
    )
    revokeDialog.value.visible = false
    // Reload from backend to ensure consistency with persisted state
    approvedLoaded = false
    await loadApprovedEnrollments()
  } catch (e) {
    console.error('Error revoking enrollment:', e)
    notifStore.show('Error al revocar matrícula', 'error')
  } finally {
    delete revokingKeys.value[key]
    revokeDialog.value.processing = false
  }
}

const confirmBlockSubjectAccess = async () => {
  if (blockSubjectDialog.value.processing) return
  const { userId, courseId, selectedSubjectId, reason } = blockSubjectDialog.value
  if (!selectedSubjectId || !reason.trim()) return
  blockSubjectDialog.value.processing = true
  try {
    await progressAdapter.blockSubjectAccess(userId, courseId, selectedSubjectId, reason.trim())
    // Optimistic local update: mark the subject as blocked immediately
    const optimisticKey = `${userId}-${courseId}-${selectedSubjectId}`
    const newSet = new Set(blockedSubjectKeys.value)
    newSet.add(optimisticKey)
    blockedSubjectKeys.value = newSet
    blockSubjectDialog.value.visible = false
    // Reload from backend to ensure consistency
    approvedLoaded = false
    await loadApprovedEnrollments()
    // Merge optimistic key back in case server data hasn't replicated yet
    if (!blockedSubjectKeys.value.has(optimisticKey)) {
      const merged = new Set(blockedSubjectKeys.value)
      merged.add(optimisticKey)
      blockedSubjectKeys.value = merged
    }
  } catch (e) {
    console.error('Error blocking subject access:', e)
    notifStore.show('Error al bloquear acceso a la materia', 'error')
  } finally {
    blockSubjectDialog.value.processing = false
  }
}

const unblockSubjectDialog = ref({
  visible: false,
  userId: 0,
  courseId: 0,
  subjectId: 0,
  userName: '',
  subjectName: '',
  processing: false,
})

const openUnblockSubjectDialog = (userId: number, courseId: number, subjectId: number, userName: string, subjectName: string) => {
  unblockSubjectDialog.value = { visible: true, userId, courseId, subjectId, userName, subjectName, processing: false }
}

const confirmUnblockSubjectAccess = async () => {
  if (unblockSubjectDialog.value.processing) return
  const { userId, courseId, subjectId } = unblockSubjectDialog.value
  unblockSubjectDialog.value.processing = true
  try {
    await progressAdapter.unblockSubjectAccess(userId, subjectId)
    // Optimistic local update: remove the subject from blocked keys immediately
    const optimisticKey = `${userId}-${courseId}-${subjectId}`
    const newSet = new Set(blockedSubjectKeys.value)
    newSet.delete(optimisticKey)
    blockedSubjectKeys.value = newSet
    unblockSubjectDialog.value.visible = false
    // Reload from backend to ensure consistency
    approvedLoaded = false
    await loadApprovedEnrollments()
    // Ensure optimistic removal persists even if server data still shows it
    if (blockedSubjectKeys.value.has(optimisticKey)) {
      const merged = new Set(blockedSubjectKeys.value)
      merged.delete(optimisticKey)
      blockedSubjectKeys.value = merged
    }
  } catch (e) {
    console.error('Error unblocking subject access:', e)
    notifStore.show('Error al restaurar acceso a la materia', 'error')
  } finally {
    unblockSubjectDialog.value.processing = false
  }
}

const revokeUserEnrollment = async (userId: number, courseId: number) => {
  const key = `${userId}-${courseId}`
  revokingKeys.value[key] = true
  try {
    await progressAdapter.revokeEnrollment(userId, courseId)
    approvedLoaded = false
    await loadApprovedEnrollments()
  } catch (e) {
    console.error('Error revoking enrollment:', e)
  } finally {
    delete revokingKeys.value[key]
  }
}

const confirmRestoreEnrollment = async (userId: number, courseId: number) => {
  const key = `${userId}-${courseId}`
  restoringKeys.value[key] = true
  try {
    await progressAdapter.restoreEnrollment(userId, courseId)
    approvedLoaded = false
    await loadApprovedEnrollments()
  } catch (e) {
    console.error('Error restoring enrollment:', e)
  } finally {
    delete restoringKeys.value[key]
  }
}

// ─── Moderation: Submissions pendientes (rol 3) ─────────────────────────
interface PendingSubmission {
  id: number
  taskName: string
  courseName: string
  studentName: string
  studentAvatar: string
  timeAgo: string
  submissionDate: number | null
  taskId: number
  courseId: number
}

const pendingSubmissions = ref<PendingSubmission[]>([])
const loadingSubmissions = ref(false)

let _manageableCoursesCache: { userId: number; courses: any[]; ts: number } | null = null
// Evita duplicar la misma petición de red cuando varios loads arrancan al mismo tiempo
const _manageableCoursesInflight = new Map<number, Promise<any[]>>()
const loadManageableCourses = async (userId: number) => {
  if (_manageableCoursesCache && _manageableCoursesCache.userId === userId && Date.now() - _manageableCoursesCache.ts < 60000) {
    return _manageableCoursesCache.courses
  }
  const inflight = _manageableCoursesInflight.get(userId)
  if (inflight) return inflight
  const promise = courseAdapter.getManageableCourses(userId)
    .then(courses => {
      const result = Array.isArray(courses) ? courses : []
      _manageableCoursesCache = { userId, courses: result, ts: Date.now() }
      _manageableCoursesInflight.delete(userId)
      return result
    })
    .catch(e => {
      _manageableCoursesInflight.delete(userId)
      throw e
    })
  _manageableCoursesInflight.set(userId, promise)
  return promise
}

const formatTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp
  if (diff < 3600000) return `hace ${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return `hace ${Math.floor(diff / 86400000)}d`
  return `hace ${Math.floor(diff / 604800000)}sem`
}

const loadPendingSubmissions = async () => {
  loadingSubmissions.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const courses = await loadManageableCourses(userId)

    // Fetch all courses in parallel, silently skip any that return 403
    const settled = await Promise.allSettled(
      courses.map(async (course: any) => {
        const subs = await submissionAdapter.getSubmissionByCourse(course.id, true)
        return { course, subs }
      })
    )
    const courseResults = settled
      .filter((r): r is PromiseFulfilledResult<{ course: any; subs: any }> => r.status === 'fulfilled')
      .map(r => r.value)

    const allUngraded: PendingSubmission[] = []
    for (const { course, subs } of courseResults) {
      if (!Array.isArray(subs)) continue
      const grouped = new Map<string, any>()
      for (const s of subs) {
        const key = `${s.studentId}_${s.taskId}`
        if (!grouped.has(key) || s.submissionDate > grouped.get(key).submissionDate) {
          grouped.set(key, s)
        }
      }
      for (const s of grouped.values()) {
        if (s.grade != null) continue
        if (s.studentId === userId) continue
        allUngraded.push({
          id: s.id,
          taskName: s.taskName || `Tarea #${s.taskId}`,
          courseName: course.title || `Curso #${course.id}`,
          studentName: s.studentUsername || `Estudiante #${s.studentId}`,
          studentAvatar: s.studentAvatar || '',
          timeAgo: formatTimeAgo(s.submissionDate || 0),
          submissionDate: Number(s.submissionDate || 0) || null,
          taskId: s.taskId,
          courseId: course.id
        })
      }
    }
    pendingSubmissions.value = allUngraded.slice(0, 20)
  } catch (e) {
    console.error('Error loading pending submissions:', e)
  } finally {
    loadingSubmissions.value = false
  }
}

const goToSubmission = (sub: PendingSubmission) => {
  router.push(`/task-submission/${sub.taskId}`)
}

// ─── Moderation: Progreso de estudiantes (rol 3) ────────────────────────
interface StudentProgressItem {
  studentId: number
  courseId: number
  subjectId: number | null
  username: string
  avatar: string
  nombres: string | null
  apellidos: string | null
  identificacion: string | null
  courseName: string
  subjectName: string
  progress: number
  grade: string
}

const studentProgressList = ref<StudentProgressItem[]>([])
const loadingStudentProgress = ref(false)
const spStudentSubjectFilter = ref('')
const spStudentUserFilter = ref('')

const studentProgressFiltered = computed(() => {
  const sq = normalizeStr(spStudentSubjectFilter.value)
  const uq = normalizeStr(spStudentUserFilter.value)
  return studentProgressList.value.filter(item => {
    if (sq && !normalizeStr(item.subjectName).includes(sq)) return false
    if (uq) {
      const match = normalizeStr(item.username).includes(uq)
        || normalizeStr(item.nombres).includes(uq)
        || normalizeStr(item.apellidos).includes(uq)
        || normalizeStr(item.identificacion).includes(uq)
        || normalizeStr(`${item.nombres} ${item.apellidos}`).includes(uq)
        || String(item.studentId).includes(uq)
      if (!match) return false
    }
    return true
  })
})

const loadStudentProgressData = async () => {
  loadingStudentProgress.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const courses = await loadManageableCourses(userId)

    // Fetch all course progress + subjects in parallel, silently skip any that return 403
    const [settledProgress, settledSubjects] = await Promise.all([
      Promise.allSettled(
        courses.map(async (course: any) => {
          const progressData = await progressAdapter.getAllProgressByCourse(course.id)
          return { course, progressData }
        })
      ),
      Promise.allSettled(
        courses.map(async (course: any) => {
          const subjects = await subjectAdapter.getSubjectsByCourse(course.id)
          return { courseId: course.id, subjects }
        })
      ),
    ])

    const courseResults = settledProgress
      .filter((r): r is PromiseFulfilledResult<{ course: any; progressData: any }> => r.status === 'fulfilled')
      .map(r => r.value)

    const subjectsByCourse = new Map<number, any[]>()
    settledSubjects
      .filter((r): r is PromiseFulfilledResult<{ courseId: number; subjects: any[] }> => r.status === 'fulfilled')
      .forEach(r => subjectsByCourse.set(r.value.courseId, Array.isArray(r.value.subjects) ? r.value.subjects : []))

    // Collect all unique student IDs to fetch profiles
    const allStudentIds = new Set<number>()
    for (const { progressData } of courseResults) {
      if (!Array.isArray(progressData)) continue
      for (const p of progressData) {
        const sid = (p as any).userId || (p as any).usuario_id
        if (sid && sid !== userId) allStudentIds.add(Number(sid))
      }
    }
    let usersMap = new Map<number, any>()
    if (allStudentIds.size > 0) {
      try {
        const profiles = await userAdapter.getUsersByIds([...allStudentIds])
        if (Array.isArray(profiles)) {
          profiles.forEach((u: any) => {
            const uid = u.id || u.userId
            if (uid) usersMap.set(Number(uid), u)
          })
        }
      } catch (_) { /* silently ignore profile fetch errors */ }
    }

    const items: StudentProgressItem[] = []
    for (const { course, progressData } of courseResults) {
      if (!Array.isArray(progressData)) continue
      const subjects = subjectsByCourse.get(course.id) ?? []
      for (const p of progressData) {
        const sid = Number((p as any).userId || (p as any).usuario_id || 0)
        if (sid === userId) continue
        const tt = p.totalTasks || (p as any).tareas_totales || 0
        const tc = p.completedTasks || (p as any).tareas_completadas || 0
        const pct = tt > 0 ? Math.round((tc / tt) * 100) : (p as any).progressPercentage || (p as any).porcentaje_progreso || 0
        const grade = p.averageGrade || (p as any).promedio || (p as any).calificacion_ponderada || 0
        const subjectId = (p as any).subjectId || (p as any).materia_id || null
        const subject = subjectId ? subjects.find((s: any) => s.id === subjectId) : null
        const subjectName = subject?.name || subject?.nombre || (subjectId ? `Materia #${subjectId}` : 'Sin materia')
        const profile = usersMap.get(sid)
        const persona = profile?.persona || profile?.personas || null
        items.push({
          studentId: sid,
          courseId: course.id,
          subjectId: subjectId ? Number(subjectId) : null,
          username: (p as any).username || (p as any).usuario || profile?.usuario || `Estudiante #${sid}`,
          avatar: (p as any).avatar || profile?.avatar || '',
          nombres: persona?.nombres || null,
          apellidos: persona?.apellidos || null,
          identificacion: persona?.identificacion ? String(persona.identificacion) : (persona?.cedula ? String(persona.cedula) : null),
          courseName: course.title || `Curso #${course.id}`,
          subjectName,
          progress: Math.round(pct),
          grade: typeof grade === 'number' ? grade.toFixed(1) : String(grade)
        })
      }
    }
    studentProgressList.value = items
  } catch (e) {
    console.error('Error loading student progress:', e)
  } finally {
    loadingStudentProgress.value = false
  }
}

// ─── Moderation: Resultados de refuerzo (rol 3) ─────────────────────────
interface ReinforcementResult {
  username: string
  avatarUrl: string
  courseName: string
  subjectName: string
  topicName: string
  taskName: string
  totalQuestions: number
  correctAnswers: number
  grade: number
  difficulty: string
  difficultyLabel: string
  createdAt: string
  scorePercent: number
}

const reinforcementResults = ref<ReinforcementResult[]>([])
const loadingReinforcement = ref(false)
const reinforcementUserFilter = ref('')
const reinforcementSubjectFilter = ref('')

const parseSafeNumber = (value: unknown): number => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

const difficultyLabel = (value: unknown): string => {
  const normalized = String(value ?? '').trim().toUpperCase()
  if (normalized === 'EASY') return 'Facil'
  if (normalized === 'MEDIUM') return 'Medio'
  if (normalized === 'HARD') return 'Dificil'
  return 'Normal'
}

const normalizeReinforcementItem = (raw: Record<string, any>, fallbackCourseName = ''): ReinforcementResult => {
  const totalQuestions = parseSafeNumber(raw.totalQuestions ?? raw.total_questions)
  const correctAnswers = parseSafeNumber(raw.correctAnswers ?? raw.correct_answers)
  const grade = parseSafeNumber(raw.grade ?? raw.calificacion)
  const difficulty = String(raw.difficulty ?? raw.dificultad ?? 'HARD').toUpperCase()

  const username = String(
    raw.username
      ?? raw.usuario
      ?? raw.usuarios?.username
      ?? raw.users?.username
      ?? 'Estudiante'
  )

  const courseName = String(
    raw.courseName
      ?? raw.courses?.title
      ?? fallbackCourseName
      ?? ''
  )

  const subjectName = String(
    raw.subjectName
      ?? raw.materia
      ?? raw.topics?.subjects?.name
      ?? ''
  )

  const topicName = String(raw.topicName ?? raw.tema ?? raw.topics?.name ?? '')
  const taskName = String(raw.taskName ?? raw.tarea ?? raw.tasks?.title ?? '')
  const createdAt = String(raw.createdAt ?? raw.created_at ?? '')
  const avatarUrl = String(raw.avatarUrl ?? raw.avatar ?? raw.usuarios?.avatar ?? raw.users?.avatar ?? '')
  const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return {
    username,
    avatarUrl,
    courseName,
    subjectName,
    topicName,
    taskName,
    totalQuestions,
    correctAnswers,
    grade,
    difficulty,
    difficultyLabel: difficultyLabel(difficulty),
    createdAt,
    scorePercent,
  }
}

const filteredReinforcementResults = computed(() => {
  const userQuery = normalizeSearchText(reinforcementUserFilter.value)
  const subjectQuery = normalizeSearchText(reinforcementSubjectFilter.value)

  return reinforcementResults.value.filter((item) => {
    const byUser = !userQuery || matchesFlexibleUserSearch(userQuery, item.username)
    const bySubject = !subjectQuery || normalizeSearchText(item.subjectName).includes(subjectQuery)
    return byUser && bySubject
  })
})

const reinforcementUniqueUsers = computed(() => new Set(reinforcementResults.value.map((item) => item.username)).size)
const reinforcementUniqueSubjects = computed(() => new Set(reinforcementResults.value.map((item) => item.subjectName).filter(Boolean)).size)
const reinforcementAverageGrade = computed(() => {
  if (!reinforcementResults.value.length) return '0.0'
  const sum = reinforcementResults.value.reduce((acc, item) => acc + item.grade, 0)
  return (sum / reinforcementResults.value.length).toFixed(1)
})

const formatReinforcementDate = (value: string): string => {
  if (!value) return 'Sin fecha'
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value.slice(0, 10)
  const diff = Date.now() - parsed
  if (diff < 60_000) return 'Ahora'
  if (diff < 3_600_000) return `hace ${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000) return `hace ${Math.floor(diff / 3_600_000)}h`
  if (diff < 604_800_000) return `hace ${Math.floor(diff / 86_400_000)}d`
  return new Date(parsed).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const loadReinforcementData = async () => {
  loadingReinforcement.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) return

    if (hasAdminRole.value) {
      const all = await api.get<Record<string, any>[]>('/reinforcement-results/all')
      reinforcementResults.value = (Array.isArray(all) ? all : [])
        .map((item) => normalizeReinforcementItem(item))
        .sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''))
      return
    }

    const courses = await loadManageableCourses(userId)

    // Para rol docente, carga por cursos gestionables.
    const settled = await Promise.allSettled(
      courses.map(async (course: any) => {
        const results = await reinforcementAdapter.getResultsByCourse(course.id)
        return { course, results }
      })
    )

    const items: ReinforcementResult[] = []
    for (const result of settled) {
      if (result.status !== 'fulfilled') continue
      const courseName = result.value.course?.title || ''
      const results = result.value.results
      if (!Array.isArray(results)) continue
      for (const raw of results) {
        items.push(normalizeReinforcementItem(raw as Record<string, any>, courseName))
      }
    }

    reinforcementResults.value = items.sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''))
  } catch (e) {
    console.error('Error loading reinforcement results:', e)
  } finally {
    loadingReinforcement.value = false
  }
}

const expandedSections = ref({
  courses: true,
  tasks: true,
  submissions: false,
  students: false,
  reinforcement: false,
  subjectProgress: false,
})

// ─── Progreso por Materia (admin) ────────────────────────────────────────
interface SubjectProgressItem {
  userId: number
  username: string
  avatar: string | null
  nombres: string | null
  apellidos: string | null
  identificacion: string | null
  courseId: number
  courseName: string
  subjectId: number | null
  subjectName: string
  completedTasks: number
  totalTasks: number
  averageGrade: number | null
  progressPercentage: number
  lastActivityAt: string | null
}

const allSubjectProgress = ref<SubjectProgressItem[]>([])
const loadingSubjectProgress = ref(false)
const spSubjectFilter = ref('')
const spUserFilter = ref('')
const spCourseFilter = ref('')
const spPage = ref(1)
const SP_PAGE_SIZE = 25

const normalizeStr = (v: unknown) =>
  String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const spFiltered = computed(() => {
  const sq = normalizeStr(spSubjectFilter.value)
  const uq = normalizeStr(spUserFilter.value)
  const cq = normalizeStr(spCourseFilter.value)
  return allSubjectProgress.value.filter(row => {
    if (sq && !normalizeStr(row.subjectName).includes(sq)) return false
    if (cq && !normalizeStr(row.courseName).includes(cq)) return false
    if (uq) {
      const matchUser = normalizeStr(row.username).includes(uq)
        || normalizeStr(row.nombres).includes(uq)
        || normalizeStr(row.apellidos).includes(uq)
        || normalizeStr(row.identificacion).includes(uq)
        || normalizeStr(`${row.nombres} ${row.apellidos}`).includes(uq)
      if (!matchUser) return false
    }
    return true
  })
})

const spTotalPages = computed(() => Math.max(1, Math.ceil(spFiltered.value.length / SP_PAGE_SIZE)))
const spPaged = computed(() => {
  const start = (spPage.value - 1) * SP_PAGE_SIZE
  return spFiltered.value.slice(start, start + SP_PAGE_SIZE)
})

const spGradeClass = (grade: number | null) => {
  if (grade === null) return 'sp-grade-na'
  if (grade >= 3.5) return 'sp-grade-good'
  if (grade >= 2.5) return 'sp-grade-mid'
  return 'sp-grade-low'
}

const spProgressClass = (pct: number) => {
  if (pct >= 80) return 'sp-fill-good'
  if (pct >= 40) return 'sp-fill-mid'
  return 'sp-fill-low'
}

const loadSubjectProgress = async () => {
  if (loadingSubjectProgress.value) return
  loadingSubjectProgress.value = true
  try {
    const data = await progressAdapter.getAllSubjectProgress()
    allSubjectProgress.value = (Array.isArray(data) ? data : []).map((item: any) => ({
      userId: Number(item.userId ?? item.user_id ?? 0),
      username: item.username || `Usuario ${item.userId}`,
      avatar: item.avatar || null,
      nombres: item.nombres || null,
      apellidos: item.apellidos || null,
      identificacion: item.identificacion ? String(item.identificacion) : null,
      courseId: Number(item.courseId ?? item.course_id ?? 0),
      courseName: item.courseName || item.course_name || '',
      subjectId: item.subjectId ? Number(item.subjectId) : null,
      subjectName: item.subjectName || item.subject_name || '',
      completedTasks: Number(item.completedTasks ?? 0),
      totalTasks: Number(item.totalTasks ?? 0),
      averageGrade: item.averageGrade !== null && item.averageGrade !== undefined ? Number(item.averageGrade) : null,
      progressPercentage: Number(item.progressPercentage ?? 0),
      lastActivityAt: item.lastActivityAt || null,
    }))
  } catch (e) {
    console.error('Error loading subject progress:', e)
  } finally {
    loadingSubjectProgress.value = false
  }
}

// ═══════ Analytics Data ═══════
interface CreatorMetricsData {
  enrolledUsersCount: number
  totalCourses: number
  certifiedUsersCount: number
  completionRate: number
  approvalRate: number
  satisfactionRate: number
}
interface TopCreatorData {
  userId: number
  username: string
  avatar: string
  coursesCount: number
  studentsCount: number
  rating: number
}
interface PopularCourseData {
  id: number
  title: string
  thumbnail: string
  enrolledCount: number
  rating: number
}
interface TopStudentData {
  userId: number
  username: string
  avatar: string
  approvedCourses: number
  averageGrade: number
}

const analyticsLoading = ref(true)
const creatorMetrics = ref<CreatorMetricsData>({
  enrolledUsersCount: 0, totalCourses: 0, certifiedUsersCount: 0,
  completionRate: 0, approvalRate: 0, satisfactionRate: 0
})
const weeklyChartRaw = ref<{ labels: string[], values: number[] }>({ labels: [], values: [] })
const monthlyChartRaw = ref<{ labels: string[], values: number[] }>({ labels: [], values: [] })
const topCreators = ref<TopCreatorData[]>([])
const aPopularCourses = ref<PopularCourseData[]>([])
const topStudents = ref<TopStudentData[]>([])

const WEEKLY_LABELS_FALLBACK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHLY_LABELS_FALLBACK = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
const CIRCUMFERENCE = 2 * Math.PI * 34

const gaugeDash = (pct: number) => {
  const fill = (Math.min(100, Math.max(0, pct)) / 100) * CIRCUMFERENCE
  return `${fill} ${CIRCUMFERENCE - fill}`
}

const weeklyLabels = computed(() =>
  weeklyChartRaw.value.labels.length > 0 ? weeklyChartRaw.value.labels : WEEKLY_LABELS_FALLBACK
)
const weeklyValues = computed(() => {
  const vals = weeklyChartRaw.value.values
  return vals.length > 0 ? vals : new Array(7).fill(0)
})
const weeklyAreaWidth = computed(() => Math.max(weeklyValues.value.length * 40, 280))
const weeklyMax = computed(() => Math.max(...weeklyValues.value, 0))
const weeklyPoints = computed(() => {
  const vals = weeklyValues.value
  const max = Math.max(...vals, 1)
  const w = weeklyAreaWidth.value
  const step = vals.length > 1 ? (w - 20) / (vals.length - 1) : w / 2
  return vals.map((v, i) => ({ x: 10 + i * step, y: 90 - (v / max) * 75 }))
})
const weeklySmoothedLinePath = computed(() => {
  const pts = weeklyPoints.value
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i].x - pts[i - 1].x) * 0.4
    d += ` C${pts[i - 1].x + cpx},${pts[i - 1].y} ${pts[i].x - cpx},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  return d
})
const weeklySmoothedAreaPath = computed(() => {
  const pts = weeklyPoints.value
  if (pts.length === 0) return ''
  return `${weeklySmoothedLinePath.value} L${pts[pts.length - 1].x},100 L${pts[0].x},100 Z`
})
const weeklyLinePath = computed(() => weeklyPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '))
const weeklyAreaPath = computed(() => {
  const pts = weeklyPoints.value
  if (pts.length === 0) return ''
  return `${weeklyLinePath.value} L${pts[pts.length - 1].x},95 L${pts[0].x},95 Z`
})

const monthlyBars = computed(() => {
  const labels = monthlyChartRaw.value.labels.length > 0 ? monthlyChartRaw.value.labels : MONTHLY_LABELS_FALLBACK
  const vals = monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : new Array(6).fill(0)
  const max = Math.max(...vals, 1)
  return labels.map((label, i) => ({
    label,
    completedH: Math.max(4, Math.round((vals[i] ?? 0) / max * 85)),
    activeH: Math.max(4, Math.round(((vals[i] ?? 0) * 0.6) / max * 85))
  }))
})

const resolveAvatar = (url: string) => {
  if (!url) return '/default-avatar.png'
  // Google OAuth avatar CDN rate-limits aggressively — use fallback directly
  if (url.includes('googleusercontent.com') || url.includes('lh3.google')) return '/default-avatar.png'
  if (url.includes('r2.cloudflarestorage.com') || url.includes('r2.dev')) {
    try { const { pathname } = new URL(url); return buildProxyFileUrl?.(pathname.slice(1)) || url } catch { return url }
  }
  if (url.startsWith('http')) return url
  return buildProxyFileUrl?.(url) || url
}
const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.onerror = null
  img.src = '/default-avatar.png'
}
const onCourseThumbError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.onerror = null
  img.src = '/default-course.png'
}
const resolveThumbnail = (url: string) => {
  if (!url) return '/default-course.png'
  if (url.startsWith('http')) return url
  return buildProxyFileUrl?.(url) || url
}

const loadAnalyticsData = async () => {
  analyticsLoading.value = true
  try {
    // Todos los fetches en paralelo: métricas, analytics de inscripción, top items
    await Promise.allSettled([
      // 1. Creator metrics
      api.get<any>('/courses/my/creator-metrics').then(raw => {
        if (raw) {
          creatorMetrics.value = {
            enrolledUsersCount: Number(raw.enrolledUsersCount ?? raw.enrolled_users_count ?? 0),
            totalCourses: Number(raw.totalCourses ?? raw.total_courses ?? 0),
            certifiedUsersCount: Number(raw.certifiedUsersCount ?? raw.certified_users_count ?? 0),
            completionRate: Number(raw.completionRate ?? raw.completion_rate ?? 0),
            approvalRate: Number(raw.approvalRate ?? raw.approval_rate ?? 0),
            satisfactionRate: Number(raw.satisfactionRate ?? raw.satisfaction_rate ?? 0),
          }
        }
      }).catch(() => {}),
      // 2. Enrollment analytics (weekly + monthly)
      (progressAdapter.getCreatorEnrollmentAnalytics({ weeklyDays: 7, monthlyMonths: 6 }) as Promise<any>).then(raw => {
        if (raw?.weekly) weeklyChartRaw.value = { labels: raw.weekly.labels || [], values: raw.weekly.values || [] }
        if (raw?.monthly) monthlyChartRaw.value = { labels: raw.monthly.labels || [], values: raw.monthly.values || [] }
      }).catch(() => {}),
      // 3. Top creators, popular courses, top students
      loadTopCreatorsData(),
      loadPopularCoursesData(),
      loadTopStudentsData(),
    ])
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    analyticsLoading.value = false
  }
}

const loadTopCreatorsData = async () => {
  try {
    const allCourses = await courseAdapter.getCourses()
    const creatorMap = new Map<number, any[]>()
    allCourses.forEach((c: any) => {
      const cid = Number(c.creatorUserId ?? c.creator_user_id ?? 0)
      if (cid > 0) {
        if (!creatorMap.has(cid)) creatorMap.set(cid, [])
        creatorMap.get(cid)!.push(c)
      }
    })
    const sorted = [...creatorMap.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)

    const results = await Promise.all(
      sorted.map(async ([userId, courses]) => {
        try {
          const [user, subCount] = await Promise.all([
            userAdapter.getUserById(userId),
            subscriptionAdapter.getSubscriberCount(userId).catch(() => 0)
          ])
          return {
            userId,
            username: (user as any)?.username || `Usuario ${userId}`,
            avatar: (user as any)?.avatar || '',
            coursesCount: courses.length,
            studentsCount: typeof subCount === 'number' ? subCount : 0,
            rating: 4.5
          } as TopCreatorData
        } catch { return null }
      })
    )
    topCreators.value = results.filter(Boolean) as TopCreatorData[]
  } catch { /* silent */ }
}

const loadPopularCoursesData = async () => {
  try {
    const courses = await courseAdapter.getPopularCourses(1, 5)
    const withEnrolled = await Promise.all(
      (courses || []).slice(0, 5).map(async (c: any) => {
        const count = await progressAdapter.getEnrolledCount(c.id).catch(() => 0)
        return {
          id: c.id,
          title: c.title || c.nombre || `Curso ${c.id}`,
          thumbnail: c.thumbnail || c.thumbnailUrl || '',
          enrolledCount: typeof count === 'number' ? count : 0,
          rating: 4.5
        } as PopularCourseData
      })
    )
    aPopularCourses.value = withEnrolled.sort((a, b) => b.enrolledCount - a.enrolledCount)
  } catch { /* silent */ }
}

const loadTopStudentsData = async () => {
  try {
    const raw = await progressAdapter.getTopStudents(5)
    topStudents.value = (raw || []).map((s: any) => ({
      userId: Number(s.user_id ?? s.userId ?? 0),
      username: s.username || `Usuario ${s.user_id ?? s.userId}`,
      avatar: s.avatar || '',
      approvedCourses: Number(s.approved_courses ?? s.approvedCourses ?? 0),
      averageGrade: Number(s.average_grade ?? s.averageGrade ?? 0)
    }))
  } catch { /* silent */ }
}

const stats = ref([
  { label: 'Tareas Pendientes', value: 0, color: '#FF9500', iconComponent: 'span' },
  { label: 'Cursos Activos', value: 0, color: '#00D4FF', iconComponent: 'span' },
  { label: 'Promedio', value: 0, color: '#30D158', iconComponent: 'span' },
  { label: 'Completadas', value: 0, color: '#BF5AF2', iconComponent: 'span' }
])

interface CourseToFinish {
  id: number
  title: string
  progress: number
  thumbnail: string
}

interface PendingTask {
  id: number
  title: string
  courseName: string
  courseId: number
  subjectName: string
  type: string
}

const coursesToFinish = ref<CourseToFinish[]>([])
const pendingTasks = ref<PendingTask[]>([])
const pendingTaskCourseFilter = ref('')
const pendingTaskSubjectFilter = ref('')

const filteredPendingTasks = computed(() => {
  const cq = pendingTaskCourseFilter.value.toLowerCase()
  const sq = pendingTaskSubjectFilter.value.toLowerCase()
  return pendingTasks.value.filter(t => {
    const matchCourse = !cq || t.courseName.toLowerCase().includes(cq)
    const matchSubject = !sq || t.subjectName.toLowerCase().includes(sq)
    return matchCourse && matchSubject
  })
})

const parseModerationTimestamp = (value: unknown): number | null => {
  const numericValue = Number(value)
  if (Number.isFinite(numericValue) && numericValue > 0) return numericValue
  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Date.parse(value)
    return Number.isNaN(parsedValue) ? null : parsedValue
  }
  return null
}

const moderationAverage = computed(() => Number(stats.value[2]?.value ?? 0).toFixed(1))

const moderationEstimatedTime = computed(() => `${(pendingTasks.value.length * 0.5).toFixed(1)}h`)

const moderationWeeklyActivity = computed(() => {
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  return pendingSubmissions.value.filter((submission) => {
    const timestamp = parseModerationTimestamp(submission.submissionDate)
    return timestamp !== null && timestamp >= weekAgo
  }).length
})

const toggleSection = (section: 'courses' | 'tasks' | 'submissions' | 'students' | 'reinforcement' | 'subjectProgress') => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const goToCourse = (courseId: number) => {
  router.push(`/course/${courseId}`)
}

const goToTask = (task: PendingTask) => {
  router.push(`/course/${task.courseId}/task/${task.id}`)
}

const getTaskIconBg = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'quiz': return '#BF5AF220'
    case 'document': return '#00D4FF20'
    default: return '#FF950020'
  }
}

const getTaskIcon = (_type: string) => {
  return 'span'
}

const loadData = async () => {
  try {
    // Cargar progreso del usuario y submissions en paralelo
    const [myProgress, mySubmissionsRaw] = await Promise.all([
      progressAdapter.getMyProgress(),
      submissionAdapter.getMySubmissions(1, 500).catch(() => null),
    ])
    if (myProgress && Array.isArray(myProgress)) {
      
      // Calcular estadísticas
      let totalPendingTasks = 0
      let totalCompleted = 0
      let totalGrades = 0
      let gradeCount = 0

      myProgress.forEach((p: any) => {
        const pending = (p.totalTasks || p.tareas_totales || 0) - (p.completedTasks || p.tareas_completadas || 0)
        totalPendingTasks += pending > 0 ? pending : 0
        totalCompleted += p.completedTasks || p.tareas_completadas || 0
        if (p.averageGrade || p.promedio) {
          totalGrades += p.averageGrade || p.promedio
          gradeCount++
        }
      })

      stats.value[1].value = myProgress.length
      stats.value[2].value = gradeCount > 0 ? Math.round((totalGrades / gradeCount) * 10) / 10 : 0
      stats.value[3].value = totalCompleted

      // Cursos por terminar (menos del 90%)
      const progressToFinish = myProgress.filter((p: any) => {
          const tt = p.totalTasks || p.tareas_totales || 0
          const tc = p.completedTasks || p.tareas_completadas || 0
          const progress = tt > 0 
            ? (tc / tt) * 100 
            : p.progressPercentage || p.porcentaje_progreso || 0
          return progress < 90
        })
      coursesToFinish.value = (await Promise.all(progressToFinish.map(async (p: any) => {
          const tt = p.totalTasks || p.tareas_totales || 0
          const tc = p.completedTasks || p.tareas_completadas || 0
          const courseId = p.courseId || p.curso_id
          const courseData = await courseAdapter.getCourseById(courseId).catch(() => null)
          return {
            id: courseId,
            title: (courseData as any)?.title || (courseData as any)?.nombre || p.courseName || p.curso_nombre || `Curso ${courseId}`,
            thumbnail: (courseData as any)?.thumbnail || (courseData as any)?.thumbnailUrl || p.courseThumbnail || p.thumbnail || p.course_thumbnail || '',
            progress: Math.round(tt > 0
              ? (tc / tt) * 100
              : p.progressPercentage || p.porcentaje_progreso || 0)
          }
        }))).filter((c: any) => c.id)

      // Cargar tareas pendientes con información de materia
      const pendingTaskCount = await loadPendingTasksWithSubjects(myProgress, mySubmissionsRaw)
      stats.value[0].value = pendingTaskCount || totalPendingTasks
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const loadPendingTasksWithSubjects = async (myProgress: any[], prefetchedSubmissions?: any) => {
  try {
    const enrolledCourseIds = myProgress
      .map((p: any) => p.courseId || p.curso_id)
      .filter((id: number) => id > 0)

    if (enrolledCourseIds.length === 0) {
      pendingTasks.value = []
      return 0
    }

    const mySubmissions = prefetchedSubmissions ?? await submissionAdapter.getMySubmissions(1, 500)
    const submittedTaskIds = new Set(
      (Array.isArray(mySubmissions) ? mySubmissions : (mySubmissions as any)?.data ?? [])
        .map((s: any) => s.taskId || s.task_id)
        .filter((id: unknown) => Number(id) > 0)
    )

    const allPending: PendingTask[] = []

    await Promise.allSettled(enrolledCourseIds.map(async (courseId: number) => {
      try {
        const [tasks, subjects, topics, courseData] = await Promise.all([
          taskAdapter.getTasksByCourse(courseId),
          subjectAdapter.getSubjectsByCourse(courseId),
          topicAdapter.getTopicsByCourse(courseId),
          courseAdapter.getCourseById(courseId).catch(() => null)
        ])

      const progressEntry = myProgress.find((p: any) => (p.courseId || p.curso_id) === courseId)
      const courseName =
        (courseData as any)?.title ||
        (courseData as any)?.nombre ||
        progressEntry?.courseName ||
        progressEntry?.curso_nombre ||
        progressEntry?.course_name ||
        progressEntry?.courseTitle ||
        `Curso ${courseId}`

      const subjectMap = new Map<number, string>((subjects || []).map((s: any) => [s.id, s.name]))
      // topicAdapter maps materia_id into courseId field
      const topicSubjectMap = new Map<number, number>((topics || []).map((t: any) => [t.id, t.courseId]))

      for (const task of (tasks || [])) {
        const taskId = task.id
        if (submittedTaskIds.has(taskId)) continue

        const topicId = task.topicId || task.topic_id
        const subjectId = topicSubjectMap.get(topicId)
        const subjectName = subjectId ? (subjectMap.get(subjectId) || '') : ''

        allPending.push({
          id: taskId,
          title: task.title || 'Tarea sin nombre',
          courseName,
          courseId,
          subjectName,
          type: subjectName || 'Tarea'
        })
      }
      } catch { /* skip inaccessible courses silently */ }
    }))

    pendingTasks.value = [...new Map(allPending.map((task) => [task.id, task])).values()]
    return pendingTasks.value.length
  } catch (e) {
    console.error('Error loading pending tasks with subjects:', e)
    pendingTasks.value = []
    return 0
  }
}

onMounted(() => {
  // Launch all independent loads in parallel
  const promises: Promise<any>[] = [loadData(), loadAnalyticsData()]
  if (canViewActivation.value) promises.push(loadUsers())
  if (canViewCertificates.value) promises.push(loadCertificates())
  if (hasAdminRole.value) promises.push(loadEnrollments())
  if (canViewFullModeration.value) {
    promises.push(loadPendingSubmissions())
    promises.push(loadStudentProgressData())
    promises.push(loadReinforcementData())
    promises.push(loadSubjectProgress())
  }
  Promise.allSettled(promises)
  applyAdminQueryNavigation()
})

watch(() => route.query, () => {
  applyAdminQueryNavigation()
})
</script>

<style scoped>
.admin-dashboard {
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 100px;
  width: 100%;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.tabs-container {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-primary);
  backdrop-filter: blur(12px);
}
.tabs-container::-webkit-scrollbar { display: none; }

.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
  color: #8E8E93;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s, transform 0.15s;
  letter-spacing: 0.01em;
}
.tab-btn:hover { background: rgba(255,255,255,0.1); color: #ccc; transform: translateY(-1px); }

.tab-btn.active {
  background: linear-gradient(135deg, #6C63FF, #9B8BFF);
  color: #fff;
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.35);
}

.moderation-tab {
  padding-top: 8px;
}

.moderation-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.moderation-stat-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 6px;
  border-radius: 20px;
  background: rgba(30, 24, 62, 0.85);
  border: 1px solid rgba(139, 127, 255, 0.14);
  box-shadow: none;
  animation: fadeInUp 0.4s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.moderation-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(5, 6, 18, 0.25); }

.moderation-stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(126, 106, 255, 0.18);
  color: #b9abff;
}

.moderation-stat-icon.is-cyan { color: #64B5F6; background: rgba(100, 181, 246, 0.14); }
.moderation-stat-icon.is-gold { color: #FFD700; background: rgba(255, 215, 0, 0.14); }
.moderation-stat-icon.is-mint { color: #4ADE80; background: rgba(74, 222, 128, 0.14); }
.moderation-stat-icon.is-rose { color: #FF4081; background: rgba(255, 64, 129, 0.14); }

.moderation-stat-value {
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 3px 10px rgba(0,0,0,0.25);
}

.moderation-stat-label {
  color: #B8B3FF;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
}

.moderation-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ═══════ Analytics Scroll Container ═══════ */
.analytics-scroll {
  -webkit-overflow-scrolling: touch;
  padding-bottom: 32px;
}

/* ═══════ Analytics Stats Grid ═══════ */
.a-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.a-stat-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(30, 28, 54, 0.98), rgba(20, 18, 40, 0.98));
  border: 1px solid rgba(130, 112, 255, 0.16);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(5, 5, 18, 0.3);
  animation: fadeInUp 0.4s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.a-stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(5, 5, 18, 0.45); }
.a-stats-grid .a-stat-card:nth-child(1) { animation-delay: 0.05s; }
.a-stats-grid .a-stat-card:nth-child(2) { animation-delay: 0.10s; }
.a-stats-grid .a-stat-card:nth-child(3) { animation-delay: 0.15s; }
.a-stats-grid .a-stat-card:nth-child(4) { animation-delay: 0.20s; }
.a-stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.a-icon-cyan   { background: rgba(0, 212, 255, 0.14); color: #00D4FF; }
.a-icon-purple { background: rgba(191, 90, 242, 0.14); color: #BF5AF2; }
.a-icon-gold   { background: rgba(255, 214, 10, 0.14); color: #FFD60A; }
.a-icon-green  { background: rgba(48, 209, 88, 0.14); color: #30D158; }
.a-stat-body { display: flex; flex-direction: column; min-width: 0; }
.a-stat-value { font-size: 26px; font-weight: 800; color: #fff; line-height: 1.1; letter-spacing: 0.02em; }
.a-stat-upper { font-size: 10px; font-weight: 700; color: #8E8E93; letter-spacing: 0.1em; margin-top: 2px; }
.a-stat-sub { font-size: 11px; color: #636366; margin-top: 1px; }

/* ═══════ Analytics Cards ═══════ */
.a-card {
  background: linear-gradient(180deg, rgba(28, 26, 52, 0.98), rgba(18, 16, 38, 0.98));
  border: 1px solid rgba(130, 112, 255, 0.14);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 10px 28px rgba(5, 5, 18, 0.22);
  animation: fadeInUp 0.4s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
}
.a-card:hover { transform: translateY(-1px); box-shadow: 0 14px 36px rgba(5, 5, 18, 0.35); }
.a-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.a-card-header h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
.a-tag {
  font-size: 10px; font-weight: 600;
  padding: 3px 10px; border-radius: 10px;
  display: inline-flex; align-items: center; gap: 4px;
  white-space: nowrap;
}
.a-tag-purple { color: #BF5AF2; background: rgba(191, 90, 242, 0.12); border: 1px solid rgba(191, 90, 242, 0.22); }
.a-tag-cyan   { color: #00D4FF; background: rgba(0, 212, 255, 0.12); border: 1px solid rgba(0, 212, 255, 0.22); }
.a-tag-green  { color: #30D158; background: rgba(48, 209, 88, 0.12); border: 1px solid rgba(48, 209, 88, 0.22); }
.a-tag-gold   { color: #FFD60A; background: rgba(255, 214, 10, 0.10); border: 1px solid rgba(255, 214, 10, 0.22); }

/* ═══════ Gauges ═══════ */
.a-gauges-row { display: flex; justify-content: space-around; gap: 8px; }
.a-gauge-item { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.a-gauge-ring { position: relative; width: 72px; height: 72px; }
.a-gauge-ring svg { width: 100%; height: 100%; }
.a-gauge-arc { transition: stroke-dasharray 0.8s cubic-bezier(.22,.68,0,1.2); }
.a-gauge-val {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #fff;
}
.a-gauge-lbl { font-size: 11px; color: #8E8E93; font-weight: 500; text-align: center; }

/* ═══════ Area Chart ═══════ */
.a-area-chart-wrap { overflow: hidden; margin: 0 -4px; }
.a-area-svg { display: block; width: 100%; height: 100px; }
.a-area-svg-tall { height: 114px; }
.a-chart-labels { display: flex; justify-content: space-between; padding: 6px 6px 0; }
.a-chart-labels span { font-size: 10px; color: #636366; font-weight: 500; }

/* Chart animations */
@keyframes clipReveal {
  from { width: 0; }
  to   { width: 100%; }
}

/* Chart animations */
@keyframes clipReveal {
  from { width: 0; }
  to   { width: 100%; }
}
.a-clip-reveal { animation: clipReveal 1.1s cubic-bezier(.4,0,.2,1) 0.3s both; }

@keyframes chartFillIn { from { opacity: 0; } to { opacity: 1; } }
.a-chart-fill { animation: chartFillIn 0.9s ease 0.4s both; }

@keyframes dotPop { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
.a-dot-main { animation: dotPop 0.35s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes pulseDot { 0%,100% { r: 7; opacity: 0.15; } 50% { r: 11; opacity: 0; } }
.a-dot-pulse { animation: pulseDot 2s ease-in-out infinite; }
.a-chart-line { animation: chartFillIn 0.6s ease 0.35s both; }

/* ═══════ Cursos por Terminar thumbnail ═══════ */
.course-finish-thumb {
  width: 52px; height: 38px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}

/* ═══════ Roles Tab ═══════ */
.roles-tab { padding: 0 16px 80px; }

.roles-self-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 20px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) both;
}
.roles-self-header {
  display: flex;
  align-items: center;
  gap: 14px;
}
.roles-self-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.roles-self-empty {
  font-size: 13px;
  color: #636366;
}

.roles-summary-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-bottom: 20px;
}
.roles-summary-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 16px 8px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.03);
  animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) both;
}
.roles-summary-card.role-card-1 { border-color: rgba(0,212,255,0.18); }
.roles-summary-card.role-card-2 { border-color: rgba(191,90,242,0.18); }
.roles-summary-card.role-card-3 { border-color: rgba(255,159,10,0.18); }
.roles-summary-count { font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }
.roles-summary-label { font-size: 11px; color: #8E8E93; font-weight: 500; }
.roles-header-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.roles-header-title { font-size: 15px; font-weight: 600; color: #fff; }
.roles-warning {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 149, 0, 0.12);
  border: 1px solid rgba(255, 149, 0, 0.26);
  color: #ffb866;
  font-size: 12px;
}
.roles-user-list { display: flex; flex-direction: column; gap: 10px; }
.roles-user-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) both;
}
.roles-avatar-wrap { position: relative; flex-shrink: 0; }
.roles-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.roles-status-dot {
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid #1a1a2e;
}
.roles-user-info { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
.roles-username { font-size: 14px; font-weight: 600; color: #fff; }
.roles-current-label { font-size: 11px; color: #8E8E93; margin-top: 2px; }

/* ═══════ Grouped Bars ═══════ */
.a-grouped-bars {
  display: flex; justify-content: space-around; align-items: flex-end;
  height: 100px; gap: 4px; margin-bottom: 8px;
}
.a-bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; }
.a-bars-col { display: flex; gap: 3px; align-items: flex-end; height: 85px; }
.a-bar {
  width: 14px; border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(.22,.68,0,1.2); min-height: 4px;
}
.a-bar-completed { background: linear-gradient(0deg, #30D158, #4AE575); }
.a-bar-active    { background: linear-gradient(0deg, #00D4FF, #40E0FF); }
.a-bar-lbl { font-size: 10px; color: #636366; font-weight: 500; }
.a-legend-row { display: flex; justify-content: center; gap: 16px; margin-top: 4px; }
.a-legend { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #8E8E93; }
.a-dot { width: 8px; height: 8px; border-radius: 50%; }
.a-dot-completed { background: #30D158; }
.a-dot-active    { background: #00D4FF; }

/* ═══════ Rank Lists ═══════ */
.a-rank-list { display: flex; flex-direction: column; gap: 8px; }
.a-rank-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; background: rgba(255, 255, 255, 0.03);
  border-radius: 12px; transition: background 0.2s;
}
.a-rank-row:hover { background: rgba(255, 255, 255, 0.06); }
.a-clickable { cursor: pointer; }
.a-rank-badge {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; flex-shrink: 0;
  color: #fff; background: rgba(255, 255, 255, 0.08);
}
.a-rank-1 { background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a1a1a; }
.a-rank-2 { background: linear-gradient(135deg, #C0C0C0, #A0A0A0); color: #1a1a1a; }
.a-rank-3 { background: linear-gradient(135deg, #CD7F32, #A86B28); color: #fff; }
.a-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.08);
}
.a-course-thumb {
  width: 44px; height: 32px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
}
.a-rank-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.a-rank-name {
  font-size: 13px; font-weight: 600; color: #fff;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.a-rank-meta { font-size: 11px; color: #636366; margin-top: 1px; }
.a-rank-rating { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
.a-rank-rating span { font-size: 12px; font-weight: 700; color: #FFD60A; }
.a-grade-pill {
  font-size: 13px; font-weight: 800; color: #30D158;
  background: rgba(48, 209, 88, 0.12); padding: 3px 10px;
  border-radius: 10px; flex-shrink: 0;
}
.a-empty { text-align: center; padding: 20px; color: #636366; font-size: 13px; }
.a-loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 0; gap: 12px;
}
.a-loading p { color: #8E8E93; font-size: 13px; }

/* ═══════ Keep stat classes for moderation tab ═══════ */
.stats-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; margin-bottom: 20px;
}
.stat-card {
  padding: 16px;
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.96), rgba(18, 18, 20, 0.98));
  border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 32px; font-weight: 800; line-height: 1;
  letter-spacing: 0.02em; color: #fff;
  text-shadow: 0 4px 18px rgba(255, 255, 255, 0.16);
}
.stat-label { font-size: 13px; color: #8E8E93; margin-top: 2px; }

.section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 12px; }

.section-card {
  background: #1C1C1E;
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
  animation: fadeInUp 0.4s ease both;
}

.moderation-card {
  margin-bottom: 0;
  background:
    linear-gradient(180deg, rgba(27, 24, 56, 0.98), rgba(18, 16, 39, 0.98));
  border: 1px solid rgba(130, 112, 255, 0.18);
  box-shadow: 0 18px 28px rgba(8, 7, 24, 0.24);
  transition: box-shadow 0.2s;
}
.moderation-card:not(.is-open):hover { box-shadow: 0 22px 36px rgba(8, 7, 24, 0.38); }

.moderation-card.is-open {
  border-color: rgba(165, 143, 255, 0.34);
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover { background: #2C2C2E; }

.moderation-header {
  min-height: 84px;
  padding: 18px 16px;
}

.moderation-header:hover {
  background: rgba(96, 76, 196, 0.12);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.moderation-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  color: #c4b6ff;
  background: linear-gradient(180deg, rgba(77, 63, 156, 0.32), rgba(47, 35, 97, 0.56));
  border: 1px solid rgba(160, 141, 255, 0.14);
}

.submissions-icon { color: #B8B3FF; background: rgba(184, 179, 255, 0.14); }
.students-icon { color: #4ADE80; background: rgba(74, 222, 128, 0.14); }
.courses-icon { color: #64B5F6; background: rgba(100, 181, 246, 0.14); }
.tasks-icon { color: #FF9500; background: rgba(255, 149, 0, 0.14); }
.reinforcement-icon { color: #FFD700; background: rgba(255, 215, 0, 0.14); }

.section-header h4 {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.section-header p {
  color: #8E8E93;
  font-size: 12px;
  margin: 2px 0 0;
}

.badge {
  background: #64B5F620;
  color: #64B5F6;
  padding: 5px 11px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-right: 12px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.section-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 12px;
}

.section-header-actions .badge {
  margin-right: 0;
}

.badge-mint {
  background: rgba(90, 230, 179, 0.14);
  color: #5AE6B3;
}

.badge-amber {
  background: rgba(255, 201, 77, 0.14);
  color: #FFC94D;
}

.badge-gold {
  background: rgba(255, 201, 77, 0.18);
  color: #ffc94d;
}

.badge-lilac {
  background: rgba(184, 179, 255, 0.14);
  color: #B8B3FF;
}

.badge-indigo {
  background: rgba(139, 127, 255, 0.14);
  color: #8B7FFF;
}

.badge.orange {
  background: rgba(255, 149, 0, 0.14);
  color: #FF9500;
}

.chevron {
  color: #8B7FFF;
  font-size: 11px;
  transition: transform 0.3s;
  margin-left: 10px;
}

.chevron.expanded { transform: rotate(0deg); }
.chevron:not(.expanded) { transform: rotate(-90deg); }

.section-content {
  padding: 0 16px 16px;
}

.moderation-card .section-content {
  padding: 0 18px 20px;
}

.empty-state {
  text-align: center;
  padding: 30px;
}

.empty-state .emoji { font-size: 40px; }
.empty-state p { color: #8E8E93; margin-top: 10px; }

.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card {
  display: flex;
  align-items: center;
  background: rgba(44, 44, 46, 0.8);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
  animation: fadeInUp 0.35s ease both;
}
.item-card:hover {
  background: rgba(58, 58, 62, 0.9);
  transform: translateX(3px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}

.moderation-card .item-card {
  background: rgba(30, 24, 62, 0.7);
  border: 1px solid rgba(139, 127, 255, 0.10);
  border-radius: 16px;
}

.moderation-card .item-card:hover {
  background: rgba(40, 34, 80, 0.9);
}

.item-card:hover {
  transform: translateX(4px);
  background: #3C3C3E;
}

.item-info {
  flex: 1;
}

.item-info h5 {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.progress-bar {
  height: 6px;
  background: #3C3C3E;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B7FFF, #b78cff);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-text {
  color: #8E8E93;
  font-size: 11px;
  margin-top: 4px;
  display: block;
}

.task-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.course-name {
  color: #8E8E93;
  font-size: 12px;
  margin: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}

.meta-separator {
  color: #636366;
  font-size: 12px;
}

.subject-name {
  color: #A78BFA;
  font-size: 11px;
  font-weight: 500;
}

.pending-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-input {
  flex: 1;
  background: rgba(30, 24, 62, 0.7);
  border: 1px solid rgba(139, 127, 255, 0.12);
  border-radius: 12px;
  padding: 8px 12px;
  color: #fff;
  font-size: 12px;
  height: 38px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input::placeholder { color: #6B6B7A; }
.filter-input:focus { border-color: #8B7FFF; }

.task-type-badge {
  background: rgba(139, 127, 255, 0.16);
  color: #c4b6ff;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: capitalize;
  margin-right: 8px;
}

.arrow {
  color: #8B7FFF;
  font-size: 20px;
}

.section-description {
  color: #8E8E93;
  font-size: 13px;
  margin: 0 0 20px;
  padding: 0 16px;
}

.roles-placeholder {
  text-align: center;
  padding: 40px;
}

.roles-placeholder .emoji { font-size: 48px; }
.roles-placeholder p { color: #8E8E93; margin-top: 12px; }

/* Certificados */
.cert-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #1C1C1E;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 12px;
}

.cert-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #FFD70020;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cert-info {
  flex: 1;
}

.cert-info h5 {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
}

.cert-date {
  color: #8E8E93;
  font-size: 12px;
  margin: 0 0 6px;
}

.cert-link {
  color: #6C63FF;
  font-size: 12px;
  text-decoration: none;
  font-weight: 500;
}

.cert-link:hover { text-decoration: underline; }

.cert-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #30D15820;
  color: #30D158;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.certificates-admin-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.certificates-header-card {
  padding: 18px;
}

.certificates-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.certificates-header-description {
  color: #8E8E93;
  font-size: 13px;
  margin: 4px 0 0;
}

.certificates-bulk-btn {
  flex-shrink: 0;
}

.certificates-stats-row {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.certificates-stat-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 14px;
}

.certificates-stat-total { background: rgba(100, 181, 246, 0.12); }
.certificates-stat-pending { background: rgba(255, 149, 0, 0.12); }
.certificates-stat-issued { background: rgba(48, 209, 88, 0.12); }

.certificates-stat-total .stat-number { color: #64B5F6; }
.certificates-stat-pending .stat-number { color: #FF9500; }
.certificates-stat-issued .stat-number { color: #30D158; }

.cert-admin-card {
  align-items: flex-start;
}

.cert-admin-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-left: 12px;
}

/* ── Activación / Matrícula ────────────────────────────── */
.section-header-static {
  padding: 16px 16px 0;
}

.action-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
}

.search-row {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  background: #2C2C2E;
  border: 1px solid #3C3C3E;
  border-radius: 12px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder { color: #636366; }

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #2C2C2E;
  color: #8E8E93;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s;
}
.icon-btn:hover { background: #3C3C3E; color: #fff; }

.expire-btn {
  padding: 10px 16px;
  border-radius: 12px;
  background: #FF950020;
  color: #FF9500;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}
.expire-btn:hover:not(:disabled) { background: #FF950030; }
.expire-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-center {
  display: flex;
  justify-content: center;
  padding: 32px;
}

.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid #3C3C3E;
  border-top-color: #6C63FF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px 16px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #2C2C2E;
  border-radius: 14px;
  padding: 12px;
  transition: background 0.2s;
}

.user-card:hover { background: #3C3C3E; }

.user-inactive { opacity: 0.6; }

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #3C3C3E;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-roles {
  display: block;
  color: #8E8E93;
  font-size: 11px;
  margin-top: 2px;
}

.status-pill {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.pill-active  { background: #30D15820; color: #30D158; }
.pill-inactive { background: #FF453A20; color: #FF453A; }

.toggle-btn {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s;
}

.activate-btn   { background: #30D15820; color: #30D158; }
.activate-btn:hover   { background: #30D15830; }
.deactivate-btn { background: #FF453A20; color: #FF453A; }
.deactivate-btn:hover { background: #FF453A30; }

.enrollment-card { flex-wrap: wrap; gap: 10px; }

.course-tag {
  display: inline-block;
  margin-top: 3px;
  background: #6C63FF20;
  color: #8B7FFF;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.enrollment-btns {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

/* ── Moderation extra sections (rol 3) ─────────────────── */
.badge.red { background: #FF375F20; color: #FF375F; }
.badge.green { background: #30D15820; color: #30D158; }
.badge.purple { background: #BF5AF220; color: #BF5AF2; }

.user-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #3C3C3E;
  margin-right: 12px;
}

.time-ago {
  color: #636366;
  font-size: 11px;
  margin-top: 4px;
  display: block;
}

.reinforcement-stats {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.stat-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #D1D1D6;
}

.reinforcement-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reinforcement-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.reinforcement-summary-pill {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.summary-label {
  font-size: 10px;
  color: #8E8E93;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-value {
  font-size: 18px;
  line-height: 1;
  color: #fff;
  font-weight: 800;
}

.reinforcement-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.reinforcement-list {
  gap: 10px;
}

.reinforcement-card {
  align-items: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(circle at top right, rgba(255, 214, 10, 0.08), transparent 45%), rgba(18, 18, 22, 0.94);
  animation: reinforcementIn 0.45s cubic-bezier(.22, .7, .2, 1) both;
}

.reinforcement-route {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 2px;
}

.time-pill {
  color: #8E8E93;
}

.difficulty-easy {
  color: #34D399;
  border-color: rgba(52, 211, 153, 0.26);
  background: rgba(52, 211, 153, 0.1);
}

.difficulty-medium {
  color: #FBBF24;
  border-color: rgba(251, 191, 36, 0.26);
  background: rgba(251, 191, 36, 0.1);
}

.difficulty-hard {
  color: #FB7185;
  border-color: rgba(251, 113, 133, 0.26);
  background: rgba(251, 113, 133, 0.1);
}

@keyframes reinforcementIn {
  from { opacity: 0; transform: translateY(16px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 680px) {
  .reinforcement-summary-grid {
    grid-template-columns: 1fr;
  }

  .reinforcement-filters {
    grid-template-columns: 1fr;
  }
}

/* ── Activation Section (Redesigned) ─────────────────── */

.activation-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activation-header-card {
  background: #1C1C1E;
  border-radius: 20px;
  padding: 20px;
}

.activation-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.activation-title {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.activation-subtitle {
  color: #8E8E93;
  font-size: 13px;
  margin: 4px 0 0;
}

.reload-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #2C2C2E;
  color: #8E8E93;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.reload-btn:hover {
  background: #3C3C3E;
  color: #fff;
}

.reload-btn.spinning svg {
  animation: spin 0.8s linear infinite;
}

.activation-stats {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.activation-stat-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 14px;
  transition: transform 0.2s ease;
}

.activation-stat-pill:hover {
  transform: translateY(-2px);
}

.active-pill   { background: #30D15812; }
.inactive-pill { background: #FF453A12; }
.total-pill    { background: #8B7FFF12; }

.stat-number {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.active-pill .stat-number   { color: #30D158; }
.inactive-pill .stat-number { color: #FF453A; }
.total-pill .stat-number    { color: #8B7FFF; }

.stat-desc {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 3px;
}

.activation-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1C1C1E;
  border-radius: 14px;
  padding: 0 14px;
  height: 48px;
  transition: box-shadow 0.2s ease;
}

.activation-search-bar:focus-within {
  box-shadow: 0 0 0 2px #6C63FF40;
}

.search-icon-svg {
  flex-shrink: 0;
}

.activation-search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
  height: 100%;
}

.activation-search-input::placeholder { color: #636366; }

.expire-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #FF950010;
  color: #FF9500;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.expire-action-btn:hover:not(:disabled) {
  background: #FF950020;
}

.expire-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expire-icon { font-size: 15px; }

.activation-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.activation-empty {
  text-align: center;
  padding: 48px 20px;
}

.activation-empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.activation-empty p {
  color: #8E8E93;
  font-size: 14px;
}

.activation-user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activation-user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #1C1C1E;
  border-radius: 16px;
  padding: 14px 16px;
  transition: all 0.25s ease;
}

.activation-user-card:hover {
  background: #242426;
}

.activation-user-card.is-inactive {
  opacity: 0.6;
}

.activation-avatar-wrapper {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  padding: 2px;
  flex-shrink: 0;
  background: #3C3C3E;
  transition: background 0.3s ease;
}

.activation-avatar-wrapper.avatar-active {
  background: linear-gradient(135deg, #30D158, #34C759);
}

.activation-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.activation-user-info {
  flex: 1;
  min-width: 0;
}

.activation-user-name {
  display: block;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activation-user-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.activation-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-active   { background: #30D158; }
.dot-inactive { background: #FF453A; }

.activation-status-label {
  color: #8E8E93;
  font-size: 12px;
}

.activation-role-tag {
  background: #6C63FF15;
  color: #8B7FFF;
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

/* Role chips */
.activation-role-chips {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.role-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: #2C2C2E;
  color: #8E8E93;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-chip:hover:not(:disabled) {
  background: #3C3C3E;
}

.role-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.role-chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #636366;
  transition: background 0.2s ease;
}

/* Role 1 - Usuario (blue) */
.role-chip-active.role-chip-1 {
  background: #007AFF15;
  color: #007AFF;
  border-color: #007AFF40;
}
.role-chip-active.role-chip-1 .role-dot-1 { background: #007AFF; }

/* Role 2 - Docente (purple) */
.role-chip-active.role-chip-2 {
  background: #BF5AF215;
  color: #BF5AF2;
  border-color: #BF5AF240;
}
.role-chip-active.role-chip-2 .role-dot-2 { background: #BF5AF2; }

/* Role 3 - Admin (amber) */
.role-chip-active.role-chip-3 {
  background: #FF950015;
  color: #FF9500;
  border-color: #FF950040;
}
.role-chip-active.role-chip-3 .role-dot-3 { background: #FF9500; }

.activation-toggle-btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.toggle-activate {
  background: #30D15815;
  color: #30D158;
}

.toggle-activate:hover {
  background: #30D15825;
}

.toggle-deactivate {
  background: #FF453A12;
  color: #FF453A;
}

.toggle-deactivate:hover {
  background: #FF453A22;
}

/* TransitionGroup animations */
.user-card-enter-active {
  transition: all 0.3s ease;
}

.user-card-leave-active {
  transition: all 0.2s ease;
}

.user-card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.user-card-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.user-card-move {
  transition: transform 0.3s ease;
}

/* ─── Enrollment: Pill sub-tabs ─────────────────────────────────────── */

.enroll-pill-tabs {
  display: flex;
  gap: 6px;
  padding: 0 16px 16px;
}

.enroll-pill-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 16px;
  border-radius: 14px;
  font-size: 13.5px;
  font-weight: 600;
  color: #6B7280;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.4,0,.2,1);
  letter-spacing: -0.01em;
}

.enroll-pill-tab:hover:not(.active) {
  background: rgba(255,255,255,0.07);
  color: #D1D5DB;
  transform: translateY(-1px);
}

.enroll-pill-tab.active {
  background: linear-gradient(135deg, rgba(108,99,255,0.22), rgba(129,140,248,0.16));
  color: #A5B4FC;
  border-color: rgba(129,140,248,0.35);
  box-shadow: 0 0 0 1px rgba(129,140,248,0.12), 0 4px 20px rgba(108,99,255,0.18);
}

.enroll-pill-tab svg { transition: transform 0.2s ease; }
.enroll-pill-tab.active svg { transform: scale(1.1); }

/* ─── Enrollment: Section wrapper ─────────────────────────────────── */

.enroll-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 16px 28px;
  animation: fadeInSection 0.3s ease both;
}

@keyframes fadeInSection {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Enrollment: Hero card ─────────────────────────────────────────── */

.enroll-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(17,20,40,0.97) 0%, rgba(22,22,37,0.96) 100%);
  border: 1px solid rgba(129,140,248,0.14);
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05);
}

.enroll-hero-glow {
  position: absolute;
  top: -60px; right: -40px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(108,99,255,0.22) 0%, transparent 70%);
  pointer-events: none;
}

.enroll-hero-glow--blue {
  background: radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%);
}

.enroll-hero-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.enroll-hero-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(129,140,248,0.12);
  border: 1px solid rgba(129,140,248,0.2);
}

.enroll-hero-icon-wrap--blue {
  background: rgba(56,189,248,0.1);
  border-color: rgba(56,189,248,0.2);
}

.enroll-hero-text { flex: 1; min-width: 0; }

.enroll-hero-title {
  font-size: 18px;
  font-weight: 700;
  color: #F1F1F5;
  margin: 0;
  letter-spacing: -0.02em;
}

.enroll-hero-sub {
  font-size: 12.5px;
  color: #6B7280;
  margin: 4px 0 0;
  line-height: 1.4;
}

.enroll-reload-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.enroll-reload-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #fff;
  transform: rotate(20deg);
}

.enroll-reload-btn.spinning svg {
  animation: spinOnce 0.7s ease-in-out;
}

@keyframes spinOnce {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── KPI row ──────────────────────────────────────────────────────── */

.enroll-kpi-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.enroll-kpi {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 14px;
  border: 1px solid transparent;
  gap: 3px;
  transition: transform 0.2s ease;
}

.enroll-kpi:hover { transform: translateY(-2px); }

.enroll-kpi-num {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
}

.enroll-kpi-lbl {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
  text-align: center;
}

.enroll-kpi.is-amber  { background: rgba(255,159,10,0.1);  border-color: rgba(255,159,10,0.18);  color: #FBBF24; }
.enroll-kpi.is-green  { background: rgba(48,209,88,0.1);   border-color: rgba(48,209,88,0.18);   color: #34D399; }
.enroll-kpi.is-red    { background: rgba(255,69,58,0.1);   border-color: rgba(255,69,58,0.18);   color: #FC8181; }
.enroll-kpi.is-blue   { background: rgba(56,189,248,0.1);  border-color: rgba(56,189,248,0.18);  color: #38BDF8; }
.enroll-kpi.is-indigo { background: rgba(129,140,248,0.1); border-color: rgba(129,140,248,0.18); color: #818CF8; }

/* ─── Filter bar ───────────────────────────────────────────────────── */

.enroll-filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.enroll-filter-field {
  flex: 1;
  min-width: 130px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 11px;
  padding: 9px 12px;
  transition: border-color 0.2s, background 0.2s;
}

.enroll-filter-field:focus-within {
  border-color: rgba(129,140,248,0.4);
  background: rgba(129,140,248,0.05);
}

.enroll-filter-icon { color: #6B7280; flex-shrink: 0; }

.enroll-filter-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #F1F1F5;
  font-size: 13px;
  min-width: 0;
}

.enroll-filter-input::placeholder { color: #4B5563; }

/* ─── Skeletons ────────────────────────────────────────────────────── */

.enroll-skeletons { display: flex; flex-direction: column; gap: 10px; }

.enroll-skeleton-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(255,255,255,0.04);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  animation: fadeInSection 0.4s ease both;
}

.sk-avatar {
  width: 46px; height: 46px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.sk-body { flex: 1; display: flex; flex-direction: column; gap: 7px; }

.sk-line {
  height: 11px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.sk-line.w-40 { width: 40%; }
.sk-line.w-60 { width: 60%; }
.sk-line.w-80 { width: 80%; }
.sk-line.mt-8 { margin-top: 4px; }

/* ─── Empty state ──────────────────────────────────────────────────── */

.enroll-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 52px 24px;
  gap: 10px;
  animation: fadeInSection 0.4s ease both;
}

.enroll-empty-ring {
  width: 72px; height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.enroll-empty-ring.is-green { background: rgba(48,209,88,0.08);  border: 1px solid rgba(48,209,88,0.14); }
.enroll-empty-ring.is-gray  { background: rgba(99,99,102,0.08);  border: 1px solid rgba(99,99,102,0.14); }

.enroll-empty-title { font-size: 16px; font-weight: 700; color: #E5E7EB; }
.enroll-empty-desc  { font-size: 13px; color: #6B7280; text-align: center; max-width: 240px; line-height: 1.5; }

/* ─── Enrollment cards list ────────────────────────────────────────── */

.enroll-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.enroll-card {
  display: flex;
  align-items: stretch;
  background: linear-gradient(170deg, rgba(20,21,38,0.98), rgba(16,17,30,0.96));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s cubic-bezier(.4,0,.2,1);
  animation: cardSlideIn 0.38s cubic-bezier(.25,.8,.25,1) both;
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.enroll-card:hover {
  border-color: rgba(129,140,248,0.25);
  box-shadow: 0 10px 34px rgba(0,0,0,0.28), 0 0 0 1px rgba(129,140,248,0.1);
  transform: translateY(-2px);
}

.enroll-card-accent {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #818CF8, #6C63FF);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.enroll-card:hover .enroll-card-accent { opacity: 1; }

.enroll-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 14px 16px 16px;
  min-width: 0;
}

.enroll-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enroll-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
  background: #1E1E30;
}

.enroll-avatar--sm { width: 38px; height: 38px; }

.enroll-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.enroll-user-name {
  font-size: 14.5px;
  font-weight: 600;
  color: #F1F5F9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enroll-user-handle { font-size: 12px; color: #6B7280; }
.enroll-time-badge  { font-size: 11px; color: #4B5563; flex-shrink: 0; }

.enroll-course-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}

.enroll-course-eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4B5563;
}

.enroll-course-name {
  font-size: 14px;
  font-weight: 700;
  color: #E5E7EB;
  line-height: 1.3;
}

.enroll-roles-row { display: flex; gap: 6px; flex-wrap: wrap; }

.enroll-role-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid transparent;
}

.enroll-role-chip.tone-student { color: #FBBF24; background: rgba(251,191,36,0.1);  border-color: rgba(251,191,36,0.18); }
.enroll-role-chip.tone-teacher { color: #38BDF8; background: rgba(56,189,248,0.1);  border-color: rgba(56,189,248,0.18); }
.enroll-role-chip.tone-admin   { color: #A78BFA; background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.2);  }
.enroll-role-chip.tone-neutral { color: #94A3B8; background: rgba(148,163,184,0.1); border-color: rgba(148,163,184,0.18); }

/* ─── Actions column ───────────────────────────────────────────────── */

.enroll-actions-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 14px 0;
  justify-content: center;
  flex-shrink: 0;
}

.enroll-btn-approve,
.enroll-btn-reject {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 110px;
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  white-space: nowrap;
}

.enroll-btn-approve {
  background: rgba(48,209,88,0.1);
  color: #34D399;
  border: 1px solid rgba(48,209,88,0.2);
}

.enroll-btn-approve:hover {
  background: rgba(48,209,88,0.22);
  box-shadow: 0 4px 16px rgba(48,209,88,0.2);
  transform: translateY(-1px);
}

.enroll-btn-reject {
  background: rgba(255,69,58,0.08);
  color: #FC8181;
  border: 1px solid rgba(255,69,58,0.15);
}

.enroll-btn-reject:hover {
  background: rgba(255,69,58,0.2);
  box-shadow: 0 4px 16px rgba(255,69,58,0.18);
  transform: translateY(-1px);
}

/* ─── Card transition group ────────────────────────────────────────── */
.enroll-card-enter-active { transition: all 0.35s cubic-bezier(.25,.8,.25,1); }
.enroll-card-leave-active  { transition: all 0.28s ease; position: absolute; width: calc(100% - 32px); }
.enroll-card-enter-from    { opacity: 0; transform: translateY(16px); }
.enroll-card-leave-to      { opacity: 0; transform: translateX(-24px) scale(0.98); }
.enroll-card-move          { transition: transform 0.35s cubic-bezier(.25,.8,.25,1); }

/* ─── Course groups (Matrícula) ─────────────────────────────────────── */

.enroll-course-groups { display: flex; flex-direction: column; gap: 12px; }

.enroll-course-group {
  background: linear-gradient(170deg, rgba(20,21,38,0.98), rgba(16,17,30,0.96));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  animation: cardSlideIn 0.38s cubic-bezier(.25,.8,.25,1) both;
  transition: border-color 0.22s ease;
}

.enroll-course-group:hover { border-color: rgba(129,140,248,0.18); }

.enroll-course-group-header {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
}

.enroll-course-group-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.enroll-course-group-icon {
  width: 30px; height: 30px;
  border-radius: 9px;
  background: rgba(129,140,248,0.1);
  border: 1px solid rgba(129,140,248,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.enroll-course-group-name {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: #F1F5F9;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.enroll-course-group-badge {
  font-size: 11px;
  font-weight: 600;
  color: #818CF8;
  background: rgba(129,140,248,0.1);
  border: 1px solid rgba(129,140,248,0.18);
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.enroll-course-group-subjects { display: flex; gap: 6px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px; padding-bottom: 4px; scrollbar-width: none; }
.enroll-course-group-subjects::-webkit-scrollbar { display: none; }

.enroll-subj-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #818CF8;
  background: rgba(99,102,241,0.09);
  border: 1px solid rgba(99,102,241,0.16);
  flex-shrink: 0;
  white-space: nowrap;
}

.enroll-user-rows {
  padding: 8px 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.enroll-enrolled-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 8px;
  border-radius: 14px;
  transition: background 0.15s ease;
}

.enroll-enrolled-row:hover { background: rgba(255,255,255,0.025); }

.enroll-enrolled-row.has-blocked-subjects {
  background: rgba(142,142,147,0.06);
  border: 1px solid rgba(142,142,147,0.18);
  opacity: 0.75;
}
.enroll-enrolled-row.has-blocked-subjects .enroll-user-name {
  color: #8E8E93;
}
.enroll-enrolled-row.has-blocked-subjects .enroll-user-handle {
  color: #636366;
}
.enroll-enrolled-row.has-blocked-subjects .enroll-avatar {
  filter: grayscale(60%) opacity(0.7);
}
.enroll-enrolled-row.has-blocked-subjects:hover { background: rgba(142,142,147,0.09); }

.enroll-enrolled-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.enroll-enrolled-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  align-items: flex-end;
}

.enroll-block-chips { display: flex; gap: 5px; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; justify-content: flex-start; padding-bottom: 4px; scrollbar-width: none; max-width: 220px; }
.enroll-block-chips::-webkit-scrollbar { display: none; }

.enroll-block-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: #818CF8;
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.16);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.enroll-block-chip svg { opacity: 0.4; transition: opacity 0.15s, color 0.15s; }

.enroll-block-chip:hover {
  background: rgba(255,149,0,0.1);
  border-color: rgba(255,149,0,0.3);
  color: #FB923C;
}

.enroll-block-chip:hover svg { opacity: 1; color: #FB923C; }
.enroll-block-chip.is-blocking { opacity: 0.4; pointer-events: none; }
.enroll-block-chip.is-blocked {
  color: #8E8E93;
  background: rgba(142,142,147,0.07);
  border-color: rgba(142,142,147,0.22);
  opacity: 0.75;
  cursor: default;
  pointer-events: none;
}
.enroll-block-chip.is-blocked svg { opacity: 0.6; color: #8E8E93; }
.subj-blocked-text { text-decoration: line-through; opacity: 0.7; }
.enroll-blocked-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #8E8E93;
  background: rgba(142,142,147,0.15);
  border-radius: 4px;
  padding: 1px 4px;
  margin-left: 1px;
}

.enroll-revoke-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #FC8181;
  background: rgba(255,69,58,0.08);
  border: 1px solid rgba(255,69,58,0.14);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.enroll-revoke-btn:hover:not(:disabled) {
  background: rgba(255,69,58,0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(255,69,58,0.16);
}

.enroll-revoke-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.enroll-restore-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #68D391;
  background: rgba(48,209,88,0.08);
  border: 1px solid rgba(48,209,88,0.14);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.enroll-restore-btn:hover:not(:disabled) {
  background: rgba(48,209,88,0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(48,209,88,0.16);
}
.enroll-restore-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.enroll-revoke-reason {
  font-size: 11px;
  color: #FC8181;
  margin-top: 2px;
  font-style: italic;
}

.enroll-hero-glow--red { background: radial-gradient(ellipse at 60% 0%, rgba(255,69,58,0.12), transparent 70%); }
.enroll-hero-icon-wrap--red { background: rgba(255,69,58,0.12); }
.enroll-kpi.is-red .enroll-kpi-num { color: #FF453A; }
.enroll-kpi.is-red { background: rgba(255,69,58,0.06); border-color: rgba(255,69,58,0.12); }

/* ─── Enrollment Dialogs ────────────────────────────────────────────── */

.enroll-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 16px 24px;
  z-index: 9999;
}

@media (min-height: 600px) {
  .enroll-dialog-overlay { align-items: center; }
}

.enroll-dialog {
  background: linear-gradient(160deg, rgba(22,24,44,0.99), rgba(18,20,36,0.98));
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 26px 22px 22px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5);
}

.enroll-dialog-icon-wrap {
  width: 50px; height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.enroll-dialog-icon-wrap.is-red   { background: rgba(255,69,58,0.12);  border: 1px solid rgba(255,69,58,0.22);  }
.enroll-dialog-icon-wrap.is-amber { background: rgba(255,149,0,0.12);  border: 1px solid rgba(255,149,0,0.22);  }
.enroll-dialog-icon-wrap.is-green { background: rgba(48,209,88,0.12);  border: 1px solid rgba(48,209,88,0.22);  }

.enroll-dialog-title {
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #F1F5F9;
  margin: 0 0 8px;
}

.enroll-dialog-desc {
  text-align: center;
  font-size: 13.5px;
  color: #9CA3AF;
  margin: 0 0 18px;
  line-height: 1.5;
}

.enroll-dialog-desc strong { color: #E5E7EB; }

.enroll-dialog-section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6B7280;
  margin-bottom: 8px;
}

.enroll-dialog-chip-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 18px; }

.enroll-dialog-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #9CA3AF;
  cursor: pointer;
  transition: all 0.18s ease;
}

.enroll-dialog-chip:hover {
  background: rgba(255,149,0,0.08);
  border-color: rgba(255,149,0,0.25);
  color: #FBBF24;
}

.enroll-dialog-chip.selected {
  background: rgba(255,149,0,0.14);
  border-color: rgba(255,149,0,0.5);
  color: #FB923C;
  font-weight: 600;
}

.enroll-dialog-textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #F1F5F9;
  font-size: 13.5px;
  resize: vertical;
  margin-bottom: 18px;
  font-family: inherit;
  line-height: 1.5;
  outline: none;
  transition: border-color 0.2s;
}

.enroll-dialog-textarea::placeholder { color: #4B5563; }
.enroll-dialog-textarea:focus { border-color: rgba(129,140,248,0.4); }

.enroll-dialog-actions { display: flex; gap: 10px; }

.enroll-dialog-cancel,
.enroll-dialog-confirm {
  flex: 1;
  height: 46px;
  border-radius: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.enroll-dialog-cancel {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #9CA3AF;
}

.enroll-dialog-cancel:hover { background: rgba(255,255,255,0.1); color: #E5E7EB; }

.enroll-dialog-confirm {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.enroll-dialog-confirm.is-red {
  background: rgba(255,69,58,0.15);
  border: 1px solid rgba(255,69,58,0.3);
  color: #FC8181;
}

.enroll-dialog-confirm.is-red:hover:not(:disabled) {
  background: rgba(255,69,58,0.28);
  box-shadow: 0 4px 20px rgba(255,69,58,0.22);
}

.enroll-dialog-confirm.is-amber {
  background: rgba(255,149,0,0.14);
  border: 1px solid rgba(255,149,0,0.3);
  color: #FB923C;
}

.enroll-dialog-confirm.is-amber:hover:not(:disabled) {
  background: rgba(255,149,0,0.28);
  box-shadow: 0 4px 20px rgba(255,149,0,0.2);
}

.enroll-dialog-confirm.is-green {
  background: rgba(48,209,88,0.14);
  border: 1px solid rgba(48,209,88,0.3);
  color: #34D399;
}

.enroll-dialog-confirm.is-green:hover:not(:disabled) {
  background: rgba(48,209,88,0.28);
  box-shadow: 0 4px 20px rgba(48,209,88,0.2);
}

.enroll-dialog-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

/* ─── Dialog fade transition ───────────────────────────────────────── */
.dialog-fade-enter-active,
.dialog-fade-leave-active { transition: opacity 0.22s ease; }

.dialog-fade-enter-active .enroll-dialog,
.dialog-fade-leave-active .enroll-dialog { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(.4,0,.2,1); }

.dialog-fade-enter-from,
.dialog-fade-leave-to { opacity: 0; }

.dialog-fade-enter-from .enroll-dialog,
.dialog-fade-leave-to .enroll-dialog { opacity: 0; transform: translateY(16px) scale(0.97); }

@media (max-width: 520px) {
  .moderation-summary-grid {
    gap: 8px;
  }

  .moderation-stat-card {
    padding: 12px 10px;
    border-radius: 16px;
  }

  .moderation-stat-value {
    font-size: 17px;
  }

  .moderation-stat-label {
    font-size: 11px;
  }

  .moderation-header {
    min-height: 78px;
    padding: 16px 14px;
  }

  .section-header-actions {
    gap: 8px;
  }

  .badge {
    margin-right: 0;
    padding: 5px 9px;
    font-size: 11px;
  }

  .enrollment-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .enrollment-card-main,
  .enrollment-card-left,
  .enrollment-course-row {
    width: 100%;
  }

  .enrollment-card-actions {
    width: 100%;
    flex-direction: row;
  }

  .enrollment-approve-btn,
  .enrollment-reject-btn {
    flex: 1;
    min-width: 0;
  }
}

/* ══════ ENTRANCE ANIMATIONS ══════ */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Stats grid — staggered */
.a-stats-grid .a-stat-card:nth-child(1) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.05s both; }
.a-stats-grid .a-stat-card:nth-child(2) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.12s both; }
.a-stats-grid .a-stat-card:nth-child(3) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.19s both; }
.a-stats-grid .a-stat-card:nth-child(4) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.26s both; }

/* Analytics cards */
.a-card:nth-child(1) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.15s both; }
.a-card:nth-child(2) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.23s both; }
.a-card:nth-child(3) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.31s both; }
.a-card:nth-child(4) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.39s both; }
.a-card:nth-child(5) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.47s both; }

/* Hover lift on cards */
.a-stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
.a-stat-card:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(5,5,18,.45); border-color: rgba(130,112,255,.35); }
.a-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
.a-card:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(5,5,18,.35); border-color: rgba(130,112,255,.28); }

/* Moderation summary — staggered */
.moderation-stat-card:nth-child(1) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.06s both; }
.moderation-stat-card:nth-child(2) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.13s both; }
.moderation-stat-card:nth-child(3) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.20s both; }
.moderation-stat-card:nth-child(4) { animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2) 0.27s both; }

/* Moderation accordion */
.moderation-stack .moderation-card:nth-child(1) { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) 0.08s both; }
.moderation-stack .moderation-card:nth-child(2) { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) 0.16s both; }
.moderation-stack .moderation-card:nth-child(3) { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) 0.24s both; }
.moderation-stack .moderation-card:nth-child(4) { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) 0.32s both; }
.moderation-stack .moderation-card:nth-child(5) { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) 0.40s both; }

/* Enrollment, cert, user cards */
.enrollment-card { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) both; }
.cert-card        { animation: slideUp 0.35s cubic-bezier(.22,.68,0,1.2) both; }

/* Tab content fade on switch */
.tab-content { animation: fadeIn 0.22s ease both; }

/* Gauge arc entrance */
@keyframes gaugePop { from { opacity: 0; } }
.a-gauge-arc { animation: gaugePop 0.6s ease 0.3s both; }

/* Progress bar fill animation */
@keyframes fillBar { from { width: 0 !important; } }
.progress-fill { animation: fillBar 0.7s cubic-bezier(.22,.68,0,1.2) 0.2s both; }

/* Active tab glow */
.tab-btn.active { box-shadow: 0 0 0 1px rgba(139,127,255,.35), 0 4px 16px rgba(98,0,238,.25); }

/* Stat value entrance */
@keyframes valueIn { from { opacity: 0; transform: translateY(8px); } }
.a-stat-value { animation: valueIn 0.45s ease 0.25s both; }

/* Cert card hover */
.cert-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.cert-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(5,5,18,.38); }

/* ─── Progreso por Materia (sp-*) ──────────────────────────────────────── */
.badge-indigo {
  background: rgba(124, 58, 237, 0.2);
  color: #a78bfa;
}

.sp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sp-filter-wrap {
  position: relative;
  flex: 1;
  min-width: 160px;
}

.sp-filter-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #6b7280;
  pointer-events: none;
}

.sp-filter-input {
  width: 100%;
  padding: 7px 10px 7px 30px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.sp-filter-input::placeholder { color: #6b7280; }
.sp-filter-input:focus { border-color: #7c3aed; }

.sp-results-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
}

.sp-count { color: #9ca3af; }

.sp-clear-btn {
  margin-left: auto;
  padding: 4px 10px;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.35);
  border-radius: 6px;
  color: #a78bfa;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.sp-clear-btn:hover { background: rgba(124, 58, 237, 0.35); }

.sp-table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.07);
}

.sp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sp-table thead th {
  position: sticky;
  top: 0;
  background: #1a1a2e;
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  white-space: nowrap;
}

.sp-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.15s;
}

.sp-table tbody tr:hover { background: rgba(255,255,255,0.03); }

.sp-table td {
  padding: 10px 12px;
  vertical-align: middle;
  white-space: nowrap;
}

.sp-student-cell { display: flex; align-items: center; gap: 8px; }

.sp-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #2d2d4e;
}

.sp-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.sp-student-info { display: flex; flex-direction: column; gap: 1px; }
.sp-username { color: #e2e8f0; font-weight: 500; font-size: 13px; }
.sp-fullname { color: #9ca3af; font-size: 11px; }
.sp-subject-pill-inline {
  display: inline-block;
  padding: 1px 6px;
  background: rgba(99, 102, 241, 0.18);
  border-radius: 4px;
  color: #a5b4fc;
  font-size: 11px;
  font-weight: 500;
}
.sp-id-inline { color: #9ca3af; font-size: 11px; }

.sp-id-cell { color: inherit; }
.sp-id-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 5px;
  color: #a5b4fc;
  font-size: 12px;
  font-family: monospace;
}

.sp-na {
  color: #4b5563;
  font-size: 12px;
  font-style: italic;
}

.sp-course-cell { color: #d1d5db; max-width: 140px; overflow: hidden; text-overflow: ellipsis; }
.sp-subject-cell { color: inherit; }
.sp-subject-pill {
  display: inline-block;
  padding: 3px 9px;
  background: rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  color: #c4b5fd;
  font-size: 12px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sp-tasks-cell { color: inherit; }
.sp-tasks { color: #9ca3af; font-size: 13px; }

.sp-grade-cell { color: inherit; }
.sp-grade-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.sp-grade-good { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
.sp-grade-mid  { background: rgba(251, 146, 60, 0.15); color: #fb923c; }
.sp-grade-low  { background: rgba(248, 113, 113, 0.15); color: #f87171; }
.sp-grade-na   { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }

.sp-progress-cell { min-width: 110px; }
.sp-progress-wrap { display: flex; align-items: center; gap: 6px; }
.sp-progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}
.sp-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.sp-fill-good { background: linear-gradient(90deg, #4ade80, #22c55e); }
.sp-fill-mid  { background: linear-gradient(90deg, #7c3aed, #6d28d9); }
.sp-fill-low  { background: linear-gradient(90deg, #fb923c, #f97316); }
.sp-pct { color: #9ca3af; font-size: 12px; min-width: 36px; text-align: right; }

.sp-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.sp-page-btn {
  padding: 5px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  color: #e2e8f0;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.sp-page-btn:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.25);
  border-color: rgba(124, 58, 237, 0.5);
}
.sp-page-btn:disabled { opacity: 0.35; cursor: default; }

.sp-page-info { color: #9ca3af; font-size: 13px; }
</style>
