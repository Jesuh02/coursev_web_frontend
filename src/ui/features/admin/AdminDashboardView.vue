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
                  <circle cx="40" cy="40" r="34" stroke="#0A84FF" stroke-width="6" fill="none"
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

        <!-- Actividad Semanal — Area Chart estilo dashboard -->
        <div class="a-card a-card-chart">
          <div class="a-card-header">
            <div class="a-chart-title-row">
              <span class="a-chart-metric-label">Inscripciones</span>
              <span class="a-chart-metric-total">{{ weeklyTotal }}</span>
            </div>
            <span class="a-tag a-tag-teal">Últimos 7 días</span>
          </div>
          <div class="a-modern-chart-wrap" @mouseleave="weeklyHover = null">
            <!-- Y-axis labels -->
            <div class="a-yaxis-labels">
              <span v-for="lbl in weeklyYAxisLabels" :key="lbl">{{ lbl }}</span>
            </div>
            <div class="a-chart-area-container">
              <svg
                class="a-modern-area-svg"
                :viewBox="`0 0 ${weeklyAreaWidth} 110`"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="weeklyModernGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgba(100, 181, 246, 0.55)" />
                    <stop offset="60%" stop-color="rgba(100, 181, 246, 0.15)" />
                    <stop offset="100%" stop-color="rgba(100, 181, 246, 0.02)" />
                  </linearGradient>
                </defs>
                <!-- Grid lines -->
                <line v-for="(_, gi) in 4" :key="`wgrid-${gi}`"
                  x1="0" :x2="weeklyAreaWidth" :y1="10 + gi * 25" :y2="10 + gi * 25"
                  stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
                <!-- Area fill -->
                <path :d="weeklySmoothedAreaPath" fill="url(#weeklyModernGrad)" class="a-chart-fill" />
                <!-- Line -->
                <path :d="weeklySmoothedLinePath" fill="none" stroke="#64B5F6" stroke-width="2" stroke-linecap="round" class="a-chart-line" />
                <!-- Hover overlay rects -->
                <rect v-for="(point, idx) in weeklyPoints" :key="`whov-${idx}`"
                  :x="point.x - (weeklyAreaWidth / weeklyValues.length) / 2"
                  y="0" :width="weeklyAreaWidth / weeklyValues.length" height="110"
                  fill="transparent" @mouseenter="weeklyHover = idx" />
                <!-- Hover indicator -->
                <g v-if="weeklyHover != null">
                  <line :x1="weeklyPoints[weeklyHover].x" :x2="weeklyPoints[weeklyHover].x"
                    y1="0" y2="105" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" stroke-dasharray="3,2" />
                  <circle :cx="weeklyPoints[weeklyHover].x" :cy="weeklyPoints[weeklyHover].y"
                    r="4" fill="#64B5F6" stroke="#1C1C1E" stroke-width="2" />
                </g>
              </svg>
              <!-- Tooltip -->
              <div v-if="weeklyHover != null" class="a-chart-tooltip"
                :style="{ left: `${(weeklyPoints[weeklyHover].x / weeklyAreaWidth) * 100}%` }">
                <div class="a-tooltip-date">{{ weeklyLabels[weeklyHover] }}</div>
                <div class="a-tooltip-row">
                  <span class="a-tooltip-dot" style="background:#64B5F6"></span>
                  <span class="a-tooltip-label">Inscripciones</span>
                  <span class="a-tooltip-val">{{ weeklyValues[weeklyHover] }}</span>
                </div>
              </div>
              <!-- X-axis labels -->
              <div class="a-xaxis-labels">
                <span v-for="(label, idx) in weeklyLabels" :key="`wlbl-${idx}`"
                  :class="{ 'a-xaxis-active': weeklyHover === idx }">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actividad Mensual — AreaChart (vue-chrts) -->
        <div class="a-card a-card-chart app-chart-section">
          <div class="a-card-header">
            <div class="a-chart-title-row">
              <span class="a-chart-metric-label">Actividad Mensual</span>
              <span class="a-chart-metric-total">{{ monthlyTotal }}</span>
            </div>
            <span class="a-tag a-tag-teal">6 meses</span>
          </div>
          <AreaChart
            class="w-full"
            :data="monthlyAreaChartData"
            :height="320"
            y-label="Valor"
            x-label="Mes"
            :categories="monthlyAreaCategories"
            :y-num-ticks="4"
            :x-num-ticks="7"
            :y-grid-line="true"
            :legend-position="LegendPosition.TopRight"
            :hide-legend="false"
            :x-formatter="monthlyXFormatter"
          >
            <template #tooltip="{ values }">
              <div
                class="flex max-w-64 items-start justify-start gap-2 rounded-xl border border-default bg-default p-2"
              >
                <div class="a-monthly-tooltip-gauge">
                  <svg viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" stroke="rgba(255,255,255,0.06)" stroke-width="4" fill="none" />
                    <circle cx="30" cy="30" r="24" stroke="#3b82f6" stroke-width="4" fill="none"
                      stroke-linecap="round"
                      :stroke-dasharray="monthlyTooltipGaugeDash(values?.inscripciones ?? 0)"
                      transform="rotate(-90 30 30)" />
                  </svg>
                  <span class="a-monthly-tooltip-gauge-val">{{ monthlyTooltipPct(values?.inscripciones ?? 0) }}%</span>
                </div>
                <div>
                  <div class="text-normal text-default" style="font-weight:600;">
                    {{ getMonthFullName(values?.month ?? '') }}
                  </div>
                  <p style="font-size:0.85rem;opacity:0.8;">
                    En este mes se registraron
                    {{ values?.inscripciones ?? 0 }} inscripciones en total.
                  </p>
                </div>
              </div>
            </template>
          </AreaChart>
        </div>

        <!-- Inscripciones Acumuladas — BarChart (vue-chrts) -->
        <div class="a-card a-card-chart app-chart-section">
          <div class="a-card-header">
            <div class="a-chart-title-row">
              <span class="a-chart-metric-label">Inscripciones Acumuladas</span>
              <span class="a-chart-metric-total">{{ creatorMetrics.enrolledUsersCount }}</span>
            </div>
            <span class="a-tag a-tag-purple">Global</span>
          </div>
          <BarChart
            :data="enrollBarChartData"
            :categories="enrollBarCategories"
            :height="200"
            :xAxis="'label'"
            :yAxis="['inscritos', 'certificados']"
            :radius="4"
            :barPadding="0.3"
            :hideLegend="true"
            :yNumTicks="4"
            :minMaxTicksOnly="true"
            :yGridLine="false"
            :xDomainLine="false"
            :yDomainLine="false"
          />
          <div class="a-legend-row">
            <div class="a-legend"><span class="a-dot" style="background:#42A5F5"></span><span>Inscritos</span></div>
            <div class="a-legend"><span class="a-dot" style="background:#90CAF9"></span><span>Certificados</span></div>
          </div>
        </div>

        <!-- Radar / Spider Chart — Indicadores Clave -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Indicadores Clave</h3>
            <span class="a-tag a-tag-purple">Rendimiento</span>
          </div>
          <div class="a-radar-wrap">
            <svg viewBox="0 0 220 220" class="a-radar-svg" aria-hidden="true">
              <defs>
                <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="rgba(155,143,255,0.38)" />
                  <stop offset="100%" stop-color="rgba(155,143,255,0.04)" />
                </radialGradient>
                <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <!-- Grid rings -->
              <polygon v-for="f in radarGridFractions" :key="f"
                :points="radarGridPolygon(f)"
                fill="none"
                :stroke="f === 1.0 ? 'rgba(155,143,255,0.25)' : 'rgba(255,255,255,0.07)'"
                :stroke-width="f === 1.0 ? 1.5 : 1" />
              <!-- Axis lines -->
              <line v-for="pt in radarAxisPoints" :key="'ax-' + pt.label"
                x1="110" y1="110" :x2="pt.x" :y2="pt.y"
                stroke="rgba(255,255,255,0.1)" stroke-width="1" />
              <!-- Data fill polygon -->
              <polygon :points="radarDataPolygon"
                fill="url(#radarFillGrad)"
                stroke="#BF5AF2"
                stroke-width="2"
                stroke-linejoin="round"
                filter="url(#radarGlow)"
                class="a-radar-polygon" />
              <!-- Data points -->
              <g v-for="(pt, i) in radarDataPoints" :key="'rp-' + i">
                <circle :cx="pt.x" :cy="pt.y" r="8" fill="rgba(155,143,255,0.18)" />
                <circle :cx="pt.x" :cy="pt.y" r="4" fill="#BF5AF2" />
              </g>
              <!-- Axis labels -->
              <text v-for="pt in radarAxisPoints" :key="'lbl-' + pt.label"
                :x="pt.lx" :y="pt.ly"
                text-anchor="middle" dominant-baseline="middle"
                font-size="9.5" fill="#8E8E93" font-family="system-ui, -apple-system, sans-serif">
                {{ pt.label }}
              </text>
            </svg>
            <!-- Legend -->
            <div class="a-radar-legend">
              <div v-for="(pt, i) in radarAxisPoints" :key="'rl-' + i" class="a-radar-leg-item">
                <span class="a-radar-dot"></span>
                <div class="a-radar-leg-info">
                  <span class="a-radar-leg-label">{{ pt.label }}</span>
                  <span class="a-radar-leg-value">{{ Math.round((radarValues[i] ?? 0) * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Donut Chart — Distribución de Métricas -->
        <div class="a-card">
          <div class="a-card-header">
            <h3>Distribución de Métricas</h3>
            <span class="a-tag a-tag-green">3 indicadores</span>
          </div>
          <div class="a-donut-wrap">
            <div class="a-donut-svg-container">
              <svg viewBox="0 0 140 140" class="a-donut-svg" aria-hidden="true">
                <defs>
                  <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <!-- Background ring -->
                <circle cx="70" cy="70" r="48" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="16" />
                <!-- Colored segments -->
                <circle v-for="(seg, i) in donutSegmentsData" :key="'ds-' + i"
                  cx="70" cy="70" r="48"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="14"
                  stroke-linecap="butt"
                  :stroke-dasharray="seg.dasharray"
                  :transform="seg.transform"
                  filter=""
                  class="a-donut-arc" />
                <!-- Center value -->
                <text x="70" y="64" text-anchor="middle" font-size="22" font-weight="700" fill="white" font-family="system-ui, -apple-system">{{ donutCenterValue }}%</text>
                <text x="70" y="81" text-anchor="middle" font-size="9" fill="#636366" font-family="system-ui, -apple-system">Promedio</text>
              </svg>
            </div>
            <!-- Legend -->
            <div class="a-donut-legend">
              <div v-for="(seg, i) in donutSegmentsData" :key="'dl-' + i" class="a-donut-leg-item">
                <span class="a-donut-leg-dot" :style="{ background: seg.color }"></span>
                <div class="a-donut-leg-info">
                  <span class="a-donut-leg-label">{{ seg.label }}</span>
                  <span class="a-donut-leg-pct" :style="{ color: seg.color }">{{ seg.pct }}%</span>
                </div>
                <div class="a-donut-leg-bar-wrap">
                  <div class="a-donut-leg-bar" :style="{ width: seg.pct + '%', background: seg.color }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Embudo de Conversión -->
        <div class="a-card a-funnel-card">
          <div class="a-card-header">
            <h3>Embudo de Conversión</h3>
            <span class="a-tag a-tag-cyan">Pipeline</span>
          </div>
          <div class="a-funnel-body">
            <svg class="a-funnel-svg" viewBox="0 0 280 212" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <filter id="funnel-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <polygon
                v-for="(stage, i) in funnelSvgData"
                :key="i"
                :points="stage.points"
                :fill="stage.color"
                :stroke="stage.color"
                fill-opacity="0.18"
                stroke-opacity="0.7"
                stroke-width="1.5"
                class="a-funnel-polygon"
                :style="{ animationDelay: `${i * 90}ms` }"
              />
              <!-- labels inside the SVG -->
              <g v-for="(stage, i) in funnelSvgData" :key="'lbl-' + i">
                <text x="140" :y="stage.midY - 6" text-anchor="middle" font-size="12" font-weight="700" fill="white" opacity="0.92">{{ stage.label }}</text>
                <text x="140" :y="stage.midY + 9" text-anchor="middle" font-size="10" fill="white" opacity="0.6">{{ stage.count }} &bull; {{ stage.pct }}%</text>
              </g>
            </svg>
            <div class="a-funnel-legend">
              <div v-for="stage in funnelStages" :key="stage.label" class="a-funnel-legend-item">
                <span class="a-funnel-dot" :style="{ background: stage.color }" />
                <div class="a-funnel-leg-info">
                  <span class="a-funnel-legend-label">{{ stage.label }}</span>
                  <span class="a-funnel-legend-pct" :style="{ color: stage.color }">{{ stage.pct }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 5 Creadores -->
        <div class="a-card a-premium-table-card">
          <div class="a-card-header">
            <h3>Top 5 Creadores</h3>
            <span class="a-tag a-tag-gold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M3.5 18h17a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1z"/></svg>
              Ranking
            </span>
          </div>
          <div v-if="topCreators.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="at-table-wrap">
            <table class="at-table">
              <thead>
                <tr>
                  <th class="at-th-rank">#</th>
                  <th>Creador</th>
                  <th class="at-th-right">Cursos</th>
                  <th class="at-th-right">Estudiantes</th>
                  <th class="at-th-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(c, i) in topCreators" :key="c.userId" class="at-row" :class="[i === 0 ? 'at-row-gold' : i === 1 ? 'at-row-silver' : i === 2 ? 'at-row-bronze' : '']" :style="{ animationDelay: (i * 0.06) + 's' }">
                  <td class="at-cell-rank">
                    <span class="at-medal" :class="'at-medal-' + (i + 1)">{{ i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) }}</span>
                  </td>
                  <td>
                    <div class="at-cell-user">
                      <img :src="resolveAvatar(c.avatar)" class="at-avatar" alt="" @error="onAvatarError" />
                      <span class="at-username">{{ c.username }}</span>
                    </div>
                  </td>
                  <td class="at-cell-num"><span class="at-pill at-pill-purple">{{ c.coursesCount }}</span></td>
                  <td class="at-cell-num"><span class="at-pill at-pill-cyan">{{ c.studentsCount }}</span></td>
                  <td class="at-cell-rating">
                    <div class="at-stars">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD60A" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span>{{ c.rating.toFixed(1) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cursos Populares -->
        <div class="a-card a-premium-table-card">
          <div class="a-card-header">
            <h3>Cursos Populares</h3>
            <span class="a-tag a-tag-teal">Top 5</span>
          </div>
          <div v-if="aPopularCourses.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="at-table-wrap">
            <table class="at-table">
              <thead>
                <tr>
                  <th class="at-th-rank">#</th>
                  <th>Curso</th>
                  <th class="at-th-right">Inscritos</th>
                  <th class="at-th-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(course, i) in aPopularCourses" :key="course.id" class="at-row at-row-clickable" :class="[i === 0 ? 'at-row-gold' : i === 1 ? 'at-row-silver' : i === 2 ? 'at-row-bronze' : '']" :style="{ animationDelay: (i * 0.06) + 's' }" @click="goToCourse(course.id)">
                  <td class="at-cell-rank">
                    <span class="at-medal" :class="'at-medal-' + (i + 1)">{{ i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) }}</span>
                  </td>
                  <td>
                    <div class="at-cell-course">
                      <img :src="resolveThumbnail(course.thumbnail)" class="at-course-thumb" alt="" @error="onCourseThumbError" />
                      <div class="at-course-info">
                        <span class="at-course-name">{{ course.title }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="at-cell-num"><span class="at-pill at-pill-cyan">{{ course.enrolledCount }}</span></td>
                  <td class="at-cell-rating">
                    <div class="at-stars">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD60A" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      <span>{{ course.rating.toFixed(1) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Estudiantes Destacados -->
        <div class="a-card a-premium-table-card">
          <div class="a-card-header">
            <h3>Estudiantes Destacados</h3>
            <span class="a-tag a-tag-purple">Top 5</span>
          </div>
          <div v-if="topStudents.length === 0" class="a-empty">Sin datos disponibles</div>
          <div v-else class="at-table-wrap">
            <table class="at-table">
              <thead>
                <tr>
                  <th class="at-th-rank">#</th>
                  <th>Estudiante</th>
                  <th class="at-th-right">Cursos Aprobados</th>
                  <th class="at-th-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in topStudents" :key="s.userId" class="at-row" :class="[i === 0 ? 'at-row-gold' : i === 1 ? 'at-row-silver' : i === 2 ? 'at-row-bronze' : '']" :style="{ animationDelay: (i * 0.06) + 's' }">
                  <td class="at-cell-rank">
                    <span class="at-medal" :class="'at-medal-' + (i + 1)">{{ i < 3 ? ['🥇','🥈','🥉'][i] : (i + 1) }}</span>
                  </td>
                  <td>
                    <div class="at-cell-user">
                      <img :src="resolveAvatar(s.avatar)" class="at-avatar" alt="" @error="onAvatarError" />
                      <span class="at-username">{{ s.username }}</span>
                    </div>
                  </td>
                  <td class="at-cell-num"><span class="at-pill at-pill-green">{{ s.approvedCourses }}</span></td>
                  <td class="at-cell-grade">
                    <span class="at-grade-badge" :class="s.averageGrade >= 4 ? 'at-grade-high' : s.averageGrade >= 3 ? 'at-grade-mid' : 'at-grade-low'">{{ s.averageGrade.toFixed(2) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>

    <!-- Cognitive Digital Twin Tab -->
    <div v-if="activeTab === 'cognitive'" class="tab-content cognitive-tab">
      <section class="cognitive-hero-panel">
        <div class="cognitive-hero-copy">
          <span class="cognitive-eyebrow">Gemelo Cognitivo</span>
          <h2>Usuarios con actividad cognitiva</h2>
          <p>
            Panel basado en sesiones reales de refuerzo y entregas de tareas:
            precision, errores, tiempo por pregunta, horario de estudio, tendencia y riesgo de fatiga.
          </p>
        </div>
        <div class="cognitive-signal" aria-hidden="true">
          <div class="cognitive-signal-total">
            <strong>{{ cognitiveTotalStudents }}</strong>
            <span>usuarios</span>
          </div>
          <div class="cognitive-signal-bars">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <small>actividad registrada</small>
        </div>
      </section>

      <div v-if="cognitiveLoading" class="cognitive-loading">
        <div class="spinner-lg"></div>
        <p>Construyendo perfiles cognitivos...</p>
      </div>

      <div v-else-if="cognitiveLoadError" class="cognitive-empty">
        <h3>No se pudo cargar el gemelo cognitivo</h3>
        <p>{{ cognitiveLoadError }}</p>
        <button class="cognitive-refresh-btn is-text" type="button" @click="loadCognitiveData">
          Reintentar
        </button>
      </div>

      <template v-else>
        <section class="cognitive-kpi-grid">
          <div class="cognitive-kpi">
            <span class="cognitive-kpi-label">Usuarios observados</span>
            <strong>{{ cognitiveTotalStudents }}</strong>
            <small>{{ cognitiveTotalSessions }} actividades guardadas</small>
          </div>
          <div class="cognitive-kpi">
            <span class="cognitive-kpi-label">Precision media</span>
            <strong>{{ cognitiveAverageAccuracy }}%</strong>
            <small>{{ cognitiveAverageGrade }} nota promedio</small>
          </div>
          <div class="cognitive-kpi">
            <span class="cognitive-kpi-label">Van bien</span>
            <strong>{{ cognitiveStrongStudents }}</strong>
            <small>rendimiento fuerte</small>
          </div>
          <div class="cognitive-kpi is-warning">
            <span class="cognitive-kpi-label">Necesitan apoyo</span>
            <strong>{{ cognitiveStudentsNeedingSupport }}</strong>
            <small>fallos, baja precision o declive</small>
          </div>
        </section>

        <section class="cognitive-toolbar">
          <label class="cognitive-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input v-model="cognitiveSearch" type="search" placeholder="Buscar nombre, username o curso" />
          </label>

          <label class="cognitive-select-wrap">
            <span>Curso</span>
            <select v-model="cognitiveCourseFilter">
              <option value="all">Todos los cursos</option>
              <option v-for="course in cognitiveCourseOptions" :key="course.id" :value="String(course.id)">
                {{ course.title }}
              </option>
            </select>
          </label>

          <label class="cognitive-select-wrap">
            <span>Orden</span>
            <select v-model="cognitiveSortBy">
              <option value="recent_activity">Actividad reciente</option>
              <option value="performance">Mejor rendimiento</option>
              <option value="sessions">Mas actividad</option>
              <option value="improvement">Mejora</option>
              <option value="fatigue">Riesgo de fatiga</option>
            </select>
          </label>

          <button class="cognitive-refresh-btn" type="button" title="Actualizar" @click="loadCognitiveData">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v7h-7" />
            </svg>
          </button>
        </section>

        <section v-if="filteredCognitiveStudents.length === 0" class="cognitive-empty">
          <h3>Sin actividad cognitiva</h3>
          <p>No hay refuerzos ni entregas de tareas para los filtros actuales.</p>
        </section>

        <section v-else class="cognitive-workbench">
          <div class="cognitive-student-list">
            <article
              v-for="(student, index) in filteredCognitiveStudents"
              :key="student.id"
              class="cognitive-student-card"
              :class="[getCognitiveStatusClass(student), { 'is-selected': selectedCognitiveStudent?.id === student.id }]"
              :style="{ animationDelay: `${index * 45}ms` }"
              @click="selectCognitiveStudent(student.id)"
            >
              <div class="cognitive-card-main">
                <div class="cognitive-avatar-wrap">
                  <img :src="resolveAvatar(student.avatar || '')" class="cognitive-avatar" alt="" @error="onAvatarError" />
                  <span class="cognitive-avatar-status"></span>
                </div>
                <div class="cognitive-student-copy">
                  <div class="cognitive-name-row">
                    <h3>{{ student.fullName || student.username }}</h3>
                    <span class="cognitive-status-badge">{{ getCognitiveStatusLabel(student) }}</span>
                  </div>
                  <p class="cognitive-username">@{{ student.username || 'sin_username' }}</p>
                  <p class="cognitive-course-line">{{ student.courses.map(course => course.title).join(' / ') }}</p>
                </div>
              </div>

              <div class="cognitive-metric-strip">
                <span><strong>{{ student.performance.accuracy }}%</strong> precision</span>
                <span><strong>{{ student.performance.avgGrade.toFixed(1) }}</strong> nota</span>
                <span><strong>{{ student.performance.totalSessions }}</strong> actividades</span>
              </div>

              <div class="cognitive-card-footer">
                <div class="cognitive-mini-history" aria-hidden="true">
                  <span
                    v-for="(point, pointIndex) in student.recentHistory.slice(-8)"
                    :key="`${student.id}-${point.date}-${pointIndex}`"
                    :style="{ height: getCognitiveHistoryHeight(point.accuracy) }"
                  ></span>
                </div>
                <span class="cognitive-last-seen">{{ formatReinforcementDate(student.lastActivity || '') }}</span>
              </div>
            </article>
          </div>

          <aside v-if="selectedCognitiveStudent" class="cognitive-detail-panel">
            <div class="cognitive-detail-header">
              <img :src="resolveAvatar(selectedCognitiveStudent.avatar || '')" class="cognitive-detail-avatar" alt="" @error="onAvatarError" />
              <div>
                <span class="cognitive-eyebrow">Perfil observado</span>
                <h3>{{ selectedCognitiveStudent.fullName || selectedCognitiveStudent.username }}</h3>
                <p>@{{ selectedCognitiveStudent.username }}</p>
              </div>
            </div>

            <div class="cognitive-score-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" pathLength="100" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  pathLength="100"
                  :stroke-dashoffset="100 - selectedCognitiveStudent.performance.accuracy"
                />
              </svg>
              <div>
                <strong>{{ selectedCognitiveStudent.performance.accuracy }}%</strong>
                <span>{{ getCognitiveStatusLabel(selectedCognitiveStudent) }}</span>
              </div>
            </div>

            <div class="cognitive-detail-grid">
              <div>
                <span>Responde en</span>
                <strong>{{ formatCognitiveDuration(selectedCognitiveStudent.performance.avgTimePerQuestion) }}</strong>
              </div>
              <div>
                <span>Errores</span>
                <strong>{{ selectedCognitiveStudent.cognitiveInsights.errorRate ?? 0 }}%</strong>
              </div>
              <div>
                <span>Horario fuerte</span>
                <strong>{{ formatCognitiveHour(selectedCognitiveStudent.cognitiveInsights.preferredStudyHour) }}</strong>
              </div>
              <div>
                <span>Consistencia</span>
                <strong>{{ selectedCognitiveStudent.cognitiveInsights.consistency }}%</strong>
              </div>
            </div>

            <div class="cognitive-recommendation">
              <span>Lectura del sistema</span>
              <p>{{ getCognitiveRecommendation(selectedCognitiveStudent) }}</p>
            </div>
          </aside>
        </section>

        <!-- ═══════ GEMELO DIGITAL - Knowledge Graph Section ═══════ -->
        <section class="dt-section">
          <div class="dt-header">
            <div class="dt-title-group">
              <div class="dt-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="12" cy="3" r="2"/><circle cx="12" cy="21" r="2"/>
                  <circle cx="3" cy="12" r="2"/><circle cx="21" cy="12" r="2"/>
                  <path d="M12 5v4M12 15v4M5 12h4M15 12h4"/>
                </svg>
              </div>
              <div>
                <h3>Gemelo Digital</h3>
                <p>Knowledge Graph + Curva del Olvido</p>
              </div>
            </div>
            <div class="dt-badges">
              <span class="dt-badge dt-badge-purple">Ebbinghaus</span>
              <span class="dt-badge dt-badge-cyan">{{ knowledgeGraphNodes.length }} nodos</span>
            </div>
          </div>

          <div class="dt-grid">
            <!-- Columna Izquierda: Grafo Principal -->
            <div class="dt-graph-panel">
              <div class="dt-graph-canvas">
                <div class="dt-map-topline">
                  <div>
                    <span class="dt-map-kicker">Mapa de conocimiento</span>
                    <strong>{{ selectedCognitiveStudent?.fullName || selectedCognitiveStudent?.username || 'Estudiante' }}</strong>
                  </div>
                  <div class="dt-map-score">
                    <small>Retencion media</small>
                    <strong>{{ knowledgeSummary.avgRetention }}%</strong>
                  </div>
                </div>

                <svg class="dt-graph-svg" viewBox="0 0 900 500" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <!-- Gradientes -->
                    <radialGradient id="dtCenterGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="rgba(16,185,129,0.28)"/>
                      <stop offset="100%" stop-color="transparent"/>
                    </radialGradient>
                    <linearGradient id="dtConnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="rgba(52,211,153,0.86)"/>
                      <stop offset="55%" stop-color="rgba(56,189,248,0.72)"/>
                      <stop offset="100%" stop-color="rgba(16,185,129,0.64)"/>
                    </linearGradient>
                    <filter id="dtNodeGlow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="4" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <filter id="dtSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="blur"/>
                      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                    <!-- Gradientes por estado -->
                    <linearGradient id="dtGradMastered" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#10B981"/>
                    </linearGradient>
                    <linearGradient id="dtGradProgress" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#64D2FF"/><stop offset="100%" stop-color="#0A84FF"/>
                    </linearGradient>
                    <linearGradient id="dtGradForgetting" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#FF5A66"/><stop offset="100%" stop-color="#DC2626"/>
                    </linearGradient>
                    <linearGradient id="dtGradUnseen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#AEAEB2"/><stop offset="100%" stop-color="#636366"/>
                    </linearGradient>
                  </defs>

                  <rect x="20" y="15" width="860" height="470" rx="30" class="dt-map-frame" />
                  <!-- Fondo con glow central -->
                  <circle cx="410" cy="270" r="190" fill="url(#dtCenterGlow)" class="dt-bg-glow"/>

                  <!-- Anillos orbitales decorativos -->
                  <circle cx="410" cy="270" r="116" class="dt-orbit-ring" style="animation-delay: 0s"/>
                  <circle cx="410" cy="270" r="218" class="dt-orbit-ring dt-orbit-ring-wide" style="animation-delay: 0.5s"/>
                  <text x="68" y="46" class="dt-zone-label">Consolidado</text>
                  <text x="780" y="46" class="dt-zone-label">Riesgo</text>
                  <text x="68" y="456" class="dt-zone-label">Nuevo</text>

                  <!-- Conexiones con curvas bezier -->
                  <g class="dt-connections">
                    <path
                      v-for="(conn, idx) in knowledgeGraphConnections"
                      :key="`dtconn-${idx}`"
                      :d="conn.path"
                      class="dt-conn-path"
                      :class="{
                        'dt-conn-active': conn.active,
                        'dt-conn-inactive': !conn.active,
                        'dt-conn-highlighted': isKnowledgeConnectionHighlighted(conn),
                      }"
                      :style="{ animationDelay: `${idx * 70}ms`, strokeWidth: `${1.2 + conn.strength * 2.8}px` }"
                    />
                  </g>

                  <!-- Partículas de flujo en conexiones activas -->
                  <g class="dt-particles">
                    <circle
                      v-for="(conn, idx) in knowledgeGraphConnections.filter(c => c.active)"
                      :key="`particle-${idx}`"
                      r="3"
                      class="dt-particle"
                      :style="{ offsetPath: `path('${conn.path}')`, animationDelay: `${idx * 200}ms` }"
                    />
                  </g>

                  <!-- Nodos del grafo -->
                  <g
                    v-for="(node, idx) in knowledgeGraphNodes"
                    :key="`dtnode-${idx}`"
                    class="dt-graph-node"
                    :class="{
                      'dt-graph-node-main': node.id === 'overall',
                      'dt-graph-node-selected': selectedKnowledgeNode?.id === node.id,
                      'dt-graph-node-dimmed': isKnowledgeNodeDimmed(node),
                    }"
                    :transform="`translate(${node.x}, ${node.y})`"
                    :style="{ animationDelay: `${idx * 80}ms` }"
                    @mouseenter="hoveredKnowledgeNodeId = node.id"
                    @mouseleave="hoveredKnowledgeNodeId = null"
                    @click="selectKnowledgeNode(node)"
                  >
                    <circle
                      v-if="activeKnowledgeNodeId === node.id"
                      :r="node.size + 21"
                      class="dt-node-focus"
                    />
                    <!-- Aura externa -->
                    <circle
                      :r="node.size + 13"
                      class="dt-node-aura"
                      :class="`dt-aura-${node.status}`"
                    />
                    <circle
                      :r="node.size + 7"
                      class="dt-node-track"
                    />
                    <!-- Anillo de progreso -->
                    <circle
                      :r="node.size + 7"
                      pathLength="100"
                      class="dt-node-ring"
                      :stroke-dasharray="`${node.retention} 100`"
                      :class="`dt-ring-${node.status}`"
                    />
                    <!-- Núcleo -->
                    <circle
                      :r="node.size"
                      class="dt-node-core"
                      :fill="`url(#dtGrad${node.status.charAt(0).toUpperCase() + node.status.slice(1)})`"
                    />
                    <!-- Icono o abreviatura -->
                    <text class="dt-node-text" dy="5" text-anchor="middle">{{ node.abbrev }}</text>

                    <!-- Badge de predicción -->
                    <g v-if="node.prediction" class="dt-pred-badge" :transform="`translate(${node.size - 2}, ${-node.size + 2})`">
                      <circle r="12" :class="`dt-pred-${node.prediction.urgency}`"/>
                      <text class="dt-pred-num" dy="4" text-anchor="middle">{{ node.prediction.days }}</text>
                    </g>

                    <!-- Indicador de retención circular -->
                    <text class="dt-retention-label" :y="node.size + 24" text-anchor="middle">{{ node.retention }}%</text>
                    <g class="dt-node-chip" :transform="`translate(${node.labelOffsetX}, ${node.labelOffsetY})`">
                      <rect :x="-(node.labelWidth / 2)" y="-23" :width="node.labelWidth" height="46" rx="12" />
                      <text y="-5" text-anchor="middle" class="dt-node-label">{{ node.shortName }}</text>
                      <text y="13" text-anchor="middle" class="dt-node-hint">{{ node.level }}</text>
                    </g>
                  </g>
                </svg>

                <div class="dt-map-footer">
                  <button
                    v-for="row in knowledgeStatusRows"
                    :key="row.status"
                    class="dt-leg-card"
                    type="button"
                    :style="`--dt-status-color: ${row.color}; --dt-status-bg: ${row.soft};`"
                  >
                    <span class="dt-leg-dot"></span>
                    <span>{{ row.label }}</span>
                    <strong>{{ row.value }}</strong>
                  </button>
                </div>

                <div v-if="knowledgePriorityNodes.length" class="dt-priority-strip">
                  <span>Prioridad de repaso</span>
                  <button
                    v-for="node in knowledgePriorityNodes"
                    :key="`priority-${node.id}`"
                    type="button"
                    @click="selectKnowledgeNode(node)"
                  >
                    {{ node.shortName }}
                    <strong>{{ node.retention }}%</strong>
                  </button>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Panel de Detalles -->
            <div class="dt-detail-panel">
              <!-- Tarjeta del nodo seleccionado -->
              <div v-if="selectedKnowledgeNode" class="dt-node-card">
                <div class="dt-card-header">
                  <div class="dt-card-icon" :class="`dt-icon-${selectedKnowledgeNode.status}`">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div class="dt-card-titles">
                    <h4>{{ selectedKnowledgeNode.name }}</h4>
                    <span class="dt-card-status" :class="`dt-status-${selectedKnowledgeNode.status}`">
                      {{ getKnowledgeStatusLabel(selectedKnowledgeNode.status) }}
                    </span>
                  </div>
                </div>

                <!-- Gauge de retención grande -->
                <div class="dt-gauge-wrap">
                  <svg class="dt-gauge-svg" viewBox="0 0 120 120">
                    <defs>
                      <linearGradient :id="`gaugeGrad-${selectedKnowledgeNode.id}`" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" :stop-color="getKnowledgeGaugeColor(selectedKnowledgeNode.status, 0)"/>
                        <stop offset="100%" :stop-color="getKnowledgeGaugeColor(selectedKnowledgeNode.status, 1)"/>
                      </linearGradient>
                    </defs>
                    <circle cx="60" cy="60" r="52" class="dt-gauge-bg"/>
                    <circle
                      cx="60" cy="60" r="52"
                      class="dt-gauge-fill"
                      :stroke="`url(#gaugeGrad-${selectedKnowledgeNode.id})`"
                      :stroke-dasharray="`${(selectedKnowledgeNode.retention / 100) * 327} 327`"
                      transform="rotate(-90 60 60)"
                    />
                    <text x="60" y="55" class="dt-gauge-value" text-anchor="middle">{{ selectedKnowledgeNode.retention }}</text>
                    <text x="60" y="72" class="dt-gauge-label" text-anchor="middle">% RETENCIÓN</text>
                  </svg>
                </div>

                <!-- Métricas en grid -->
                <div class="dt-metrics-grid">
                  <div class="dt-metric">
                    <span class="dt-metric-icon">📅</span>
                    <div>
                      <span class="dt-metric-label">Última práctica</span>
                      <strong>{{ formatKnowledgeDate(selectedKnowledgeNode.lastPractice) }}</strong>
                    </div>
                  </div>
                  <div class="dt-metric">
                    <span class="dt-metric-icon">🔄</span>
                    <div>
                      <span class="dt-metric-label">Repeticiones</span>
                      <strong>{{ selectedKnowledgeNode.practiceCount }}</strong>
                    </div>
                  </div>
                  <div v-if="selectedKnowledgeNode.prediction" class="dt-metric dt-metric-warn">
                    <span class="dt-metric-icon">⚠️</span>
                    <div>
                      <span class="dt-metric-label">Predicción</span>
                      <strong>Olvidará en {{ selectedKnowledgeNode.prediction.days }}d</strong>
                    </div>
                  </div>
                </div>

                <!-- Mini chart de curva de retención -->
                <div class="dt-curve-section">
                  <div class="dt-curve-header">
                    <span>Curva del Olvido</span>
                    <span class="dt-curve-formula">R = e<sup>-t/S</sup></span>
                  </div>
                  <AreaChart
                    class="dt-retention-vue-chart app-chart-section"
                    :data="knowledgeRetentionChartData"
                    :height="172"
                    :categories="knowledgeRetentionCategories"
                    :y-num-ticks="4"
                    :x-num-ticks="4"
                    :y-grid-line="true"
                    :hide-legend="true"
                    :x-formatter="knowledgeRetentionXFormatter"
                  >
                    <template #tooltip="{ values }">
                      <div class="dt-chart-tooltip">
                        <strong>{{ values?.day ?? 'Hoy' }}</strong>
                        <span>Retencion: {{ values?.retention ?? 0 }}%</span>
                        <small>Umbral de repaso: {{ values?.umbral ?? 50 }}%</small>
                      </div>
                    </template>
                  </AreaChart>
                  <div class="dt-curve-chart">
                    <svg viewBox="0 0 240 80" preserveAspectRatio="none" class="dt-curve-svg">
                      <defs>
                        <linearGradient id="dtCurveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="rgba(191,90,242,0.4)"/>
                          <stop offset="100%" stop-color="rgba(191,90,242,0.02)"/>
                        </linearGradient>
                      </defs>
                      <!-- Grid lines -->
                      <line x1="0" y1="20" x2="240" y2="20" class="dt-curve-grid"/>
                      <line x1="0" y1="40" x2="240" y2="40" class="dt-curve-grid"/>
                      <line x1="0" y1="60" x2="240" y2="60" class="dt-curve-grid"/>
                      <!-- Area fill -->
                      <path :d="getRetentionAreaPath(selectedKnowledgeNode)" class="dt-curve-area"/>
                      <!-- Line -->
                      <path :d="getRetentionCurvePath(selectedKnowledgeNode)" class="dt-curve-line"/>
                      <!-- Punto actual -->
                      <circle
                        :cx="getRetentionCurveX(selectedKnowledgeNode)"
                        :cy="getRetentionCurveY(selectedKnowledgeNode)"
                        r="5"
                        class="dt-curve-point"
                      />
                      <!-- Línea vertical al punto -->
                      <line
                        :x1="getRetentionCurveX(selectedKnowledgeNode)"
                        y1="0"
                        :x2="getRetentionCurveX(selectedKnowledgeNode)"
                        :y2="getRetentionCurveY(selectedKnowledgeNode)"
                        class="dt-curve-vline"
                      />
                    </svg>
                    <div class="dt-curve-labels">
                      <span>Hoy</span>
                      <span>+3d</span>
                      <span>+7d</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Resumen general -->
              <div class="dt-summary-card">
                <h4>Resumen Cognitivo</h4>
                <BarChart
                  class="dt-status-chart app-chart-section"
                  :data="knowledgeStatusChartData"
                  :categories="knowledgeStatusCategories"
                  :height="132"
                  :xAxis="'label'"
                  :yAxis="['nodos']"
                  :radius="6"
                  :barPadding="0.34"
                  :hideLegend="true"
                  :yNumTicks="3"
                  :minMaxTicksOnly="true"
                  :yGridLine="false"
                  :xDomainLine="false"
                  :yDomainLine="false"
                />
                <div class="dt-summary-bars">
                  <div class="dt-bar-item">
                    <div class="dt-bar-info">
                      <span>Dominados</span>
                      <strong>{{ knowledgeSummary.mastered }}</strong>
                    </div>
                    <div class="dt-bar-track">
                      <div class="dt-bar-fill dt-bar-green" :style="{ width: `${knowledgeSummary.masteredPct}%` }"></div>
                    </div>
                  </div>
                  <div class="dt-bar-item">
                    <div class="dt-bar-info">
                      <span>En progreso</span>
                      <strong>{{ knowledgeSummary.progress }}</strong>
                    </div>
                    <div class="dt-bar-track">
                      <div class="dt-bar-fill dt-bar-yellow" :style="{ width: `${knowledgeSummary.progressPct}%` }"></div>
                    </div>
                  </div>
                  <div class="dt-bar-item">
                    <div class="dt-bar-info">
                      <span>Olvidando</span>
                      <strong>{{ knowledgeSummary.forgetting }}</strong>
                    </div>
                    <div class="dt-bar-track">
                      <div class="dt-bar-fill dt-bar-red" :style="{ width: `${knowledgeSummary.forgettingPct}%` }"></div>
                    </div>
                  </div>
                </div>

                <!-- Retención promedio -->
                <div class="dt-avg-retention">
                  <div class="dt-avg-ring">
                    <svg viewBox="0 0 60 60">
                      <circle cx="30" cy="30" r="26" class="dt-avg-bg"/>
                      <circle
                        cx="30" cy="30" r="26"
                        class="dt-avg-fill"
                        :stroke-dasharray="`${(knowledgeSummary.avgRetention / 100) * 163} 163`"
                        transform="rotate(-90 30 30)"
                      />
                    </svg>
                    <span>{{ knowledgeSummary.avgRetention }}%</span>
                  </div>
                  <div class="dt-avg-text">
                    <strong>Retención Promedio</strong>
                    <p>{{ getRetentionHealthText(knowledgeSummary.avgRetention) }}</p>
                  </div>
                </div>
              </div>

              <!-- Rendimiento por Materia -->
              <div v-if="selectedCognitiveStudent && selectedCognitiveStudent.coursePerformance.size > 0" class="dt-courses-card">
                <h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Rendimiento por Materia
                </h4>
                <div class="dt-course-list">
                  <div
                    v-for="[courseId, courseData] in selectedCognitiveStudent.coursePerformance"
                    :key="courseId"
                    class="dt-course-item"
                    :class="`dt-course-${courseData.dominance}`"
                  >
                    <div class="dt-course-header">
                      <span class="dt-course-title">{{ courseData.courseTitle }}</span>
                      <span class="dt-course-badge" :class="`dt-badge-${courseData.dominance}`">
                        {{ getDominanceLabel(courseData.dominance) }}
                      </span>
                    </div>
                    <div class="dt-course-metrics">
                      <div class="dt-course-metric">
                        <span class="dt-course-metric-value">{{ courseData.tasksSubmitted }}</span>
                        <span class="dt-course-metric-label">Tareas</span>
                      </div>
                      <div class="dt-course-metric">
                        <span class="dt-course-metric-value">{{ courseData.avgGrade.toFixed(1) }}</span>
                        <span class="dt-course-metric-label">Nota</span>
                      </div>
                      <div class="dt-course-metric">
                        <span class="dt-course-metric-value">{{ courseData.accuracy }}%</span>
                        <span class="dt-course-metric-label">Precisión</span>
                      </div>
                    </div>
                    <div class="dt-course-progress">
                      <div class="dt-course-progress-bar">
                        <div
                          class="dt-course-progress-fill"
                          :class="`dt-fill-${courseData.dominance}`"
                          :style="{ width: `${courseData.accuracy}%` }"
                        ></div>
                      </div>
                      <span class="dt-course-last-activity">
                        {{ formatKnowledgeDate(courseData.lastActivity) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Alerta de repaso -->
              <div v-if="knowledgeReviewRecommendation" class="dt-alert">
                <div class="dt-alert-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div class="dt-alert-content">
                  <strong>Acción Recomendada</strong>
                  <p>{{ knowledgeReviewRecommendation }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <div v-if="activeTab === 'cognitive_legacy'" class="tab-content cognitive-tab">
      <div class="cognitive-hero">
        <div class="cognitive-hero-content">
          <div class="cognitive-icon-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.5 2.1-1.2 2.8L12 12l-2.8-3.2A4 4 0 0 1 12 2z"/>
              <path d="M12 12v6"/>
              <circle cx="12" cy="20" r="2"/>
              <path d="M4.93 4.93a8 8 0 0 0 0 11.31"/>
              <path d="M19.07 4.93a8 8 0 0 1 0 11.31"/>
            </svg>
          </div>
          <div class="cognitive-hero-text">
            <h2 class="cognitive-title">Gemelo Cognitivo</h2>
            <p class="cognitive-subtitle">
              Análisis avanzado del comportamiento de aprendizaje de cada estudiante.
              Visualiza patrones, tendencias y optimiza la experiencia educativa.
            </p>
          </div>
        </div>
      </div>

      <div class="cognitive-features">
        <div class="cognitive-feature-card" @click="$router.push('/cognitive-analytics')">
          <div class="feature-icon feature-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Perfiles Cognitivos</h3>
            <p class="feature-desc">
              Visualiza el rendimiento individual de cada estudiante con métricas detalladas,
              historial de sesiones y análisis de tendencias.
            </p>
          </div>
          <div class="feature-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="cognitive-feature-card" @click="$router.push('/cognitive-analytics?sortBy=performance')">
          <div class="feature-icon feature-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Ranking de Rendimiento</h3>
            <p class="feature-desc">
              Identifica a los estudiantes con mejor desempeño y aquellos que
              necesitan apoyo adicional.
            </p>
          </div>
          <div class="feature-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="cognitive-feature-card" @click="$router.push('/cognitive-analytics?sortBy=improvement')">
          <div class="feature-icon feature-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 6l-9.5 9.5-5-5L1 18"/>
              <path d="M17 6h6v6"/>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Análisis de Progreso</h3>
            <p class="feature-desc">
              Descubre qué estudiantes están mejorando y cuáles muestran
              signos de estancamiento o declive.
            </p>
          </div>
          <div class="feature-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>

        <div class="cognitive-feature-card" @click="$router.push('/cognitive-analytics?sortBy=sessions')">
          <div class="feature-icon feature-icon-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Frecuencia de Estudio</h3>
            <p class="feature-desc">
              Analiza los patrones de estudio: horarios preferidos, frecuencia
              de sesiones y engagement general.
            </p>
          </div>
          <div class="feature-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="cognitive-insights">
        <h3 class="insights-title">¿Qué puedes descubrir?</h3>
        <div class="insights-grid">
          <div class="insight-item">
            <span class="insight-emoji">🎯</span>
            <span class="insight-text">Precisión por estudiante</span>
          </div>
          <div class="insight-item">
            <span class="insight-emoji">📈</span>
            <span class="insight-text">Tendencias de mejora</span>
          </div>
          <div class="insight-item">
            <span class="insight-emoji">⏰</span>
            <span class="insight-text">Horarios óptimos</span>
          </div>
          <div class="insight-item">
            <span class="insight-emoji">🧠</span>
            <span class="insight-text">Nivel de habilidad</span>
          </div>
          <div class="insight-item">
            <span class="insight-emoji">📊</span>
            <span class="insight-text">Historial detallado</span>
          </div>
          <div class="insight-item">
            <span class="insight-emoji">⚡</span>
            <span class="insight-text">Tiempo de respuesta</span>
          </div>
        </div>
      </div>

      <button class="cognitive-cta" @click="$router.push('/cognitive-analytics')">
        <span>Explorar Gemelo Cognitivo</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
          <path d="M12 5l7 7-7 7"/>
        </svg>
      </button>
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
              <div class="section-icon moderation-icon" style="background: #0A84FF">
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
                      <th>Estado</th>
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
                      :class="{ 'sp-row-inactive': row.enrollmentStatus === 'inactivo' }"
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
                        <span class="sp-subject-pill" :class="{ 'sp-subject-inactive': row.enrollmentStatus === 'inactivo' }">{{ row.subjectName }}</span>
                      </td>
                      <td class="sp-status-cell">
                        <button
                          class="sp-status-btn"
                          :class="row.enrollmentStatus === 'activo' ? 'sp-status-active' : 'sp-status-inactive'"
                          :disabled="togglingSpEnrollStatus[`${row.userId}-${row.courseId}-${row.subjectId}`]"
                          @click="toggleSpEnrollmentStatus(row)"
                        >
                          <span v-if="togglingSpEnrollStatus[`${row.userId}-${row.courseId}-${row.subjectId}`]" class="sp-status-spinner"></span>
                          <template v-else>
                            {{ row.enrollmentStatus === 'activo' ? '✓ Activo' : '⏸ Inactivo' }}
                          </template>
                        </button>
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

        <div class="section-card moderation-card" :class="{ 'is-open': expandedSections.myProgress }">
          <div class="section-header moderation-header" @click="toggleSection('myProgress')">
            <div class="header-left">
              <div class="section-icon moderation-icon" style="background: #30D158">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <h4>Mi Progreso en Cursos</h4>
                <p>Notas y avance por materia</p>
              </div>
            </div>
            <div class="section-header-actions">
              <span class="badge badge-mint">{{ myCoursesProgress.length }} curso{{ myCoursesProgress.length !== 1 ? 's' : '' }}</span>
              <span class="chevron" :class="{ expanded: expandedSections.myProgress }">▼</span>
            </div>
          </div>
          <div v-if="expandedSections.myProgress" class="section-content">
            <div v-if="loadingMyCoursesProgress" class="loading-center"><div class="spinner-lg"></div></div>
            <template v-else>
              <div v-if="myCoursesProgress.length === 0" class="empty-state">
                <span class="emoji">📚</span>
                <p>No estás inscrito en ningún curso</p>
              </div>
              <div v-else class="mcp-list">
                <div v-for="course in myCoursesProgress" :key="course.courseId" class="mcp-card">
                  <div class="mcp-card-header" style="cursor:pointer" @click="router.push({ name: 'subjectsList', params: { courseId: course.courseId } })">
                    <img :src="resolveThumbnail(course.thumbnail)" class="mcp-thumb" alt="" @error="onCourseThumbError" />
                    <div class="mcp-card-info">
                      <h5 class="mcp-course-title">{{ course.courseName }}</h5>
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: course.progressPercentage + '%' }"></div>
                      </div>
                      <div class="mcp-meta">
                        <span class="mcp-pct">{{ course.progressPercentage }}%</span>
                        <span class="mcp-sep">·</span>
                        <span class="mcp-grade-val" :class="course.averageGrade !== null && Number(course.averageGrade) >= 6 ? 'grade-pass' : 'grade-fail'">
                          Nota: {{ course.averageGrade !== null ? Number(course.averageGrade).toFixed(1) : '—' }}
                        </span>
                        <span class="mcp-sep">·</span>
                        <span class="mcp-tasks">{{ course.completedTasks }}/{{ course.totalTasks }} tareas</span>
                        <span v-if="course.status" class="mcp-status-badge" :class="course.status === 'Ganado' ? 'status-won' : course.status === 'Perdido' ? 'status-lost' : ''">{{ course.status }}</span>
                      </div>
                    </div>
                    <span class="mcp-chevron">›</span>
                  </div>
                  <div v-if="expandedCourseProgressIds.has(course.courseId)" class="mcp-subjects">
                    <div v-if="course.subjects.length === 0" class="mcp-no-subjects">Sin materias registradas</div>
                    <div v-for="subj in course.subjects" :key="subj.subjectId" class="mcp-subject-row">
                      <div class="mcp-subject-left">
                        <span class="mcp-subject-name">{{ subj.subjectName }}</span>
                        <div class="progress-bar mcp-subject-bar">
                          <div class="progress-fill" :style="{ width: subj.progressPercentage + '%' }"></div>
                        </div>
                        <span class="mcp-subject-meta">{{ subj.completedTasks }}/{{ subj.totalTasks }} tareas · {{ subj.progressPercentage }}%</span>
                      </div>
                      <div class="mcp-subject-right">
                        <span class="mcp-grade-val" :class="subj.averageGrade !== null && Number(subj.averageGrade) >= 6 ? 'grade-pass' : 'grade-fail'">
                          {{ subj.averageGrade !== null ? Number(subj.averageGrade).toFixed(1) : '—' }}
                        </span>
                      </div>
                    </div>
                  </div>
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
              <span class="activation-user-name">{{ user.persona ? `${user.persona.nombres} ${user.persona.apellidos}` : user.username }}</span>
              <span class="activation-user-username">@{{ user.username }}</span>
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
              :class="user.id === authStore.user?.id ? 'toggle-self' : (user.isActive ? 'toggle-deactivate' : 'toggle-activate')"
              :disabled="!canManageRoles || user.id === authStore.user?.id"
              :title="user.id === authStore.user?.id ? 'No puedes desactivarte a ti mismo' : ''"
              @click="user.id !== authStore.user?.id && toggleUserActivation(user, !user.isActive)"
            >
              {{ user.id === authStore.user?.id ? 'Eres tú' : (user.isActive ? 'Desactivar' : 'Activar') }}
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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
              <div v-if="req.requestedRole === 'docente'" class="enroll-requested-role-row">
                <span class="enroll-requested-role-badge docente">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  Solicita ingresar como Docente
                </span>
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
            <button
              class="enroll-filter-toggle"
              :class="{ active: approvedOnlyWithoutAccess }"
              @click="approvedOnlyWithoutAccess = !approvedOnlyWithoutAccess"
              title="Mostrar solo cursos/materias sin acceso"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Sin acceso
            </button>
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
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <span class="enroll-course-group-name">{{ group.courseName }}</span>
                <span class="enroll-course-group-badge">{{ group.users.length }} usuario{{ group.users.length !== 1 ? 's' : '' }}</span>
              </div>
              <div v-if="group.subjects.length" class="enroll-course-group-subjects">
                <div v-for="subj in group.subjects" :key="subj.id" class="enroll-subj-card">
                  <img
                    v-if="subj.thumbnailUrl"
                    :src="resolveThumbnail(subj.thumbnailUrl)"
                    class="enroll-subj-card-thumb"
                    alt=""
                    @error="onCourseThumbError"
                  />
                  <div v-else class="enroll-subj-card-thumb enroll-subj-card-thumb--placeholder">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A84FF" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <span class="enroll-subj-card-name">{{ subj.name }}</span>
                </div>
              </div>
            </div>

            <div class="enroll-user-rows">
              <div
                v-for="user in group.users"
                :key="`${user.userId}-${group.courseId}`"
                class="enroll-enrolled-row"
                :class="{
                  'has-blocked-subjects': hasAnyBlockedSubject(user.userId, group.courseId, user.subjects),
                  'is-inactive-course': user.courseEnrollmentStatus === 'inactivo'
                }"
              >
                <div class="enroll-enrolled-left">
                  <img :src="user.avatar || '/default-avatar.png'" class="enroll-avatar enroll-avatar--sm" alt="" @error="onAvatarError" />
                  <div class="enroll-user-info">
                    <span class="enroll-user-name">{{ user.fullName || user.username || `Usuario #${user.userId}` }}</span>
                    <span class="enroll-user-handle">@{{ user.username }}</span>
                    <span v-if="user.courseEnrollmentStatus === 'inactivo'" class="enroll-inactive-badge">⏸ Curso inactivo</span>
                  </div>
                </div>
                <div class="enroll-enrolled-right">
                  <!-- Course activate/deactivate toggle -->
                  <button
                    v-if="user.courseEnrollmentStatus === 'inactivo'"
                    class="enroll-activate-btn"
                    :disabled="togglingEnrollStatus[`c-${user.userId}-${group.courseId}`]"
                    @click="toggleCourseEnrollmentStatus(user.userId, group.courseId, 'activo')"
                    title="Activar acceso al curso"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {{ togglingEnrollStatus[`c-${user.userId}-${group.courseId}`] ? 'Activando...' : 'Activar curso' }}
                  </button>
                  <button
                    v-else
                    class="enroll-deactivate-btn"
                    :disabled="togglingEnrollStatus[`c-${user.userId}-${group.courseId}`]"
                    @click="toggleCourseEnrollmentStatus(user.userId, group.courseId, 'inactivo')"
                    title="Inactivar acceso al curso"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    {{ togglingEnrollStatus[`c-${user.userId}-${group.courseId}`] ? 'Inactivando...' : 'Inactivar curso' }}
                  </button>
                  <div v-if="user.subjects.length" class="enroll-block-chips">
                    <button
                      v-for="subj in user.subjects"
                      :key="subj.id"
                      class="enroll-block-chip"
                      :class="{
                        'is-blocking': blockSubjectDialog.processing && blockSubjectDialog.userId === user.userId && blockSubjectDialog.selectedSubjectId === subj.id,
                        'is-blocked': isSubjectBlocked(user.userId, group.courseId, subj.id),
                      }"
                      @click="isSubjectBlocked(user.userId, group.courseId, subj.id) ? quickUnblockSubject(user.userId, group.courseId, subj.id) : openBlockSubjectDialog(user.userId, group.courseId, user.fullName || user.username || 'Usuario', user.subjects, subj.id)"
                      :title="isSubjectBlocked(user.userId, group.courseId, subj.id) ? `Restaurar acceso a ${subj.name}` : `Quitar acceso a ${subj.name}`"
                    >
                      <img
                        v-if="subj.thumbnailUrl"
                        :src="resolveThumbnail(subj.thumbnailUrl)"
                        class="enroll-block-chip-thumb"
                        alt=""
                        @error="onCourseThumbError"
                      />
                      <div v-else class="enroll-block-chip-thumb enroll-block-chip-thumb--placeholder">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      </div>
                      <!-- Lock icon when blocked -->
                      <svg v-if="isSubjectBlocked(user.userId, group.courseId, subj.id)" class="enroll-block-chip-icon" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span :class="{ 'subj-blocked-text': isSubjectBlocked(user.userId, group.courseId, subj.id) }">{{ subj.name }}</span>
                      <!-- Blocked badge -->
                      <span v-if="isSubjectBlocked(user.userId, group.courseId, subj.id)" class="enroll-blocked-badge">bloqueada</span>
                      <!-- X icon when active -->
                      <svg v-else width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>

                  <!-- Block details: show reason, date and who blocked for each blocked subject -->
                  <div v-if="hasAnyBlockedSubject(user.userId, group.courseId, user.subjects)" class="enroll-block-details">
                    <div
                      v-for="subj in user.subjects.filter(s => isSubjectBlocked(user.userId, group.courseId, s.id))"
                      :key="`block-detail-${subj.id}`"
                      class="enroll-block-detail-row"
                    >
                      <div class="enroll-block-detail-header">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span class="enroll-block-detail-subj">{{ subj.name }}</span>
                      </div>
                      <div v-if="getBlockDetail(user.userId, group.courseId, subj.id)" class="enroll-block-detail-info">
                        <span class="enroll-block-detail-reason">{{ getBlockDetail(user.userId, group.courseId, subj.id)?.reason || 'Sin razón especificada' }}</span>
                        <span v-if="getBlockDetail(user.userId, group.courseId, subj.id)?.blockedAt" class="enroll-block-detail-date">
                          {{ formatDate(getBlockDetail(user.userId, group.courseId, subj.id)?.blockedAt) }}
                        </span>
                        <span v-if="getBlockDetail(user.userId, group.courseId, subj.id)?.blockedByUsername" class="enroll-block-detail-by">
                          por @{{ getBlockDetail(user.userId, group.courseId, subj.id)?.blockedByUsername }}
                        </span>
                      </div>
                    </div>
                  </div>

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
              <p v-if="blockSubjectDialog.errorMsg" class="enroll-dialog-error">{{ blockSubjectDialog.errorMsg }}</p>
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
              <p class="cert-date">Progreso: {{ cert.progressPercentage }}%</p>
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

    <!-- Institutional Interoperability Tab -->
    <div v-if="activeTab === 'standards' && canViewStandards" class="tab-content standards-tab">
      <section class="interop-hero">
        <div class="interop-hero-copy">
          <span class="interop-eyebrow">Interoperabilidad institucional</span>
          <h2>CourseV conectado con LMS, sistemas académicos y analítica de aprendizaje</h2>
          <p>
            Módulo reservado para administración académica y superadministración. Opera
            eventos, exportaciones, validaciones, configuraciones y auditoría para que CourseV integre Caliper, xAPI, QTI, OneRoster y LTI
            sin declarar certificaciones que todavía no existan.
          </p>
        </div>
        <div class="interop-role-grid" aria-label="Permisos del módulo">
          <article v-for="role in institutionalRoleScopes" :key="role.role" class="interop-role-card">
            <span>{{ role.role }}</span>
            <strong>{{ role.title }}</strong>
            <p>{{ role.scope }}</p>
          </article>
        </div>
      </section>

      <section class="interop-note">
        <strong>No declarar certificación sin proceso formal.</strong>
        <span>
          Esta vista separa capacidades en diseño, próximas integraciones y criterios certificables.
          Usar estándares públicos no equivale a estar certificado por 1EdTech o por un LRS.
        </span>
      </section>

      <section class="interop-section interop-live-panel">
        <div class="interop-section-header">
          <div>
            <span class="interop-eyebrow">Centro operativo</span>
            <h3>Estándares con acciones, datos, estado automático e historial</h3>
          </div>
          <button class="interop-refresh-btn" :disabled="interoperabilityLoading" @click="loadInteroperabilityDashboard">
            {{ interoperabilityLoading ? 'Actualizando...' : 'Actualizar datos' }}
          </button>
        </div>

        <div v-if="interoperabilityError" class="interop-alert error">{{ interoperabilityError }}</div>
        <div v-if="interoperabilityActionMessage" class="interop-alert success">{{ interoperabilityActionMessage }}</div>
        <div v-if="lastInteroperabilityActionResult" class="interop-result-panel">
          <div>
            <span>Resultado API</span>
            <strong :class="`interop-result-${lastInteroperabilityActionResult.status}`">
              {{ lastInteroperabilityActionResult.status }}
            </strong>
            <p>{{ lastInteroperabilityActionResult.summary }}</p>
          </div>
          <div v-if="lastInteroperabilityMetrics.length" class="interop-result-metrics">
            <article v-for="[key, value] in lastInteroperabilityMetrics" :key="key">
              <span>{{ key }}</span>
              <strong>{{ formatInteropMetric(value) }}</strong>
            </article>
          </div>
          <ul v-if="lastInteroperabilityErrors.length" class="interop-result-errors">
            <li v-for="error in lastInteroperabilityErrors" :key="error">{{ error }}</li>
          </ul>
        </div>

        <div v-if="interoperabilityDashboard" class="interop-summary-strip">
          <span>Tenant: {{ interoperabilityDashboard.tenantId }}</span>
          <span>{{ interoperabilityDashboard.summary.learningEvents }} eventos</span>
          <span>{{ interoperabilityDashboard.summary.inTests }} en pruebas</span>
          <span>{{ interoperabilityDashboard.summary.recentErrors }} errores recientes</span>
          <span>{{ interoperabilityDashboard.dbPersistence ? 'Persistencia Supabase' : 'Sin persistencia: ejecutar migración SQL' }}</span>
        </div>

        <div v-if="interoperabilityLoading && !liveInteroperabilityStandards.length" class="interop-loading">
          Cargando estándares operativos...
        </div>

        <div v-else class="interop-live-grid">
          <article
            v-for="standard in liveInteroperabilityStandards"
            :key="standard.code"
            class="interop-live-card"
            :style="{ '--standard-accent': standard.accent }"
          >
            <header class="interop-live-card-head">
              <span class="interop-mark">{{ standard.short }}</span>
              <div>
                <h4>{{ standard.name }}</h4>
                <p>{{ standard.coursevUse }}</p>
              </div>
              <span class="interop-status" :class="`interop-status-${standard.stateTone}`">{{ standard.state }}</span>
            </header>

            <div class="interop-progress-row">
              <div><span :style="{ width: `${standard.progress}%` }"></span></div>
              <strong>{{ standard.progress }}%</strong>
            </div>

            <div class="interop-real-metrics">
              <article v-for="metric in standard.metrics" :key="`${standard.code}-${metric.label}`">
                <span>{{ metric.label }}</span>
                <strong>{{ formatInteropMetric(metric.value) }}</strong>
              </article>
            </div>

            <div v-if="standard.code === 'xapi'" class="interop-config-grid">
              <label>
                Endpoint LRS
                <input v-model="xapiLrsEndpoint" type="url" placeholder="https://lrs.institucion.edu/xapi" />
              </label>
              <label>
                Autenticación
                <input v-model="xapiAuthMethod" type="text" placeholder="OAuth / API Key" />
              </label>
            </div>

            <div v-if="standard.code === 'qti'" class="interop-config-grid full">
              <label>
                Curso para exportar o asociar importacion
                <input v-model="qtiExportCourseId" inputmode="numeric" placeholder="ID de curso" />
              </label>
              <label>
                Paquete QTI externo (.xml)
                <input type="file" accept=".xml,.qti,text/xml,application/xml" @change="readInteroperabilityFile($event, 'qti')" />
              </label>
              <label>
                XML QTI para validar/importar
                <textarea v-model="qtiImportXml" rows="6" spellcheck="false"></textarea>
              </label>
            </div>

            <div v-if="standard.code === 'oneroster'" class="interop-config-grid full">
              <div class="interop-file-grid">
                <label>
                  Cargar users.csv
                  <input type="file" accept=".csv,text/csv" @change="readInteroperabilityFile($event, 'oneroster-users')" />
                </label>
                <label>
                  Cargar courses.csv
                  <input type="file" accept=".csv,text/csv" @change="readInteroperabilityFile($event, 'oneroster-courses')" />
                </label>
                <label>
                  Cargar classes.csv
                  <input type="file" accept=".csv,text/csv" @change="readInteroperabilityFile($event, 'oneroster-classes')" />
                </label>
                <label>
                  Cargar enrollments.csv
                  <input type="file" accept=".csv,text/csv" @change="readInteroperabilityFile($event, 'oneroster-enrollments')" />
                </label>
              </div>
              <label>
                users.csv para validar
                <textarea v-model="oneRosterUsersCsv" rows="4"></textarea>
              </label>
              <label>
                courses.csv para validar
                <textarea v-model="oneRosterCoursesCsv" rows="3"></textarea>
              </label>
              <label>
                classes.csv para validar
                <textarea v-model="oneRosterClassesCsv" rows="3"></textarea>
              </label>
              <label>
                enrollments.csv para validar
                <textarea v-model="oneRosterEnrollmentsCsv" rows="3"></textarea>
              </label>
            </div>

            <div v-if="standard.code === 'lti'" class="interop-config-grid lti">
              <label><span>LMS</span><input v-model="ltiProvider" /></label>
              <label><span>Client ID</span><input v-model="ltiClientId" /></label>
              <label><span>Deployment ID</span><input v-model="ltiDeploymentId" /></label>
              <label><span>Issuer</span><input v-model="ltiIssuer" /></label>
              <label><span>JWKS URL</span><input v-model="ltiJwksUrl" /></label>
              <label><span>Redirect URI</span><input v-model="ltiRedirectUri" /></label>
              <label><span>Launch URL</span><input v-model="ltiLaunchUrl" /></label>
            </div>

            <div class="interop-live-actions">
              <button
                v-for="action in standard.actions"
                :key="`${standard.code}-${action.key}`"
                :disabled="interoperabilityActionBusy[interopActionBusyKey(standard.code, action.key)]"
                @click="runInteroperabilityAction(standard.code, action.key)"
              >
                {{ interoperabilityActionBusy[interopActionBusyKey(standard.code, action.key)] ? 'Ejecutando...' : action.label }}
              </button>
            </div>

            <div class="interop-health" :class="`interop-health-${standard.health.tone}`">
              <strong>{{ standard.health.label }}</strong>
              <span>{{ standard.health.detail }}</span>
            </div>

            <div class="interop-checklist-live">
              <strong>Checklist funcional</strong>
              <label v-for="item in standard.checklist" :key="`${standard.code}-${item.itemKey}`">
                <input
                  type="checkbox"
                  :checked="item.done"
                  @change="toggleInteroperabilityChecklist(standard.code, item.itemKey, $event)"
                />
                <span>{{ item.label }}</span>
                <small>{{ item.source === 'auto' ? 'auto' : 'manual' }}</small>
              </label>
            </div>

            <div class="interop-history-live">
              <strong>Historial</strong>
              <p v-if="!standard.history.length">Sin acciones registradas todavía.</p>
              <p v-for="entry in standard.history.slice(0, 3)" :key="entry.id || `${standard.code}-${entry.createdAt}`">
                <span>{{ formatInteropDate(entry.createdAt) }}</span>
                {{ entry.summary }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section class="interop-section interop-map">
        <div class="interop-section-header">
          <div>
            <span class="interop-eyebrow">Mapa de estándares</span>
            <h3>Estado, prioridad y uso real dentro de CourseV</h3>
          </div>
          <span class="interop-pill">Roadmap institucional</span>
        </div>

        <div class="interop-table" role="table" aria-label="Mapa de estándares educativos">
          <div class="interop-table-row interop-table-head" role="row">
            <span role="columnheader">Estándar</span>
            <span role="columnheader">Estado</span>
            <span role="columnheader">Uso en CourseV</span>
            <span role="columnheader">Prioridad</span>
            <span role="columnheader">Responsable</span>
            <span role="columnheader">Acciones</span>
          </div>
          <article
            v-for="standard in interoperabilityMapStandards"
            :key="standard.name"
            class="interop-table-row interop-standard-row"
            :style="{ '--standard-accent': standard.accent }"
            role="row"
          >
            <div class="interop-name-cell" role="cell">
              <span class="interop-mark">{{ standard.short }}</span>
              <div>
                <strong>{{ standard.name }}</strong>
                <small>{{ standard.scope }}</small>
              </div>
            </div>
            <div role="cell">
              <span class="interop-status" :class="`interop-status-${standard.stateTone}`">{{ standard.state }}</span>
            </div>
            <p role="cell">{{ standard.coursevUse }}</p>
            <strong class="interop-priority" role="cell">{{ standard.priority }}</strong>
            <p role="cell">
              {{ standard.owner }}
              <small>{{ standard.updated }}</small>
            </p>
            <div class="interop-actions" role="cell">
              <span v-for="action in standard.actions" :key="`${standard.name}-${action}`">{{ action }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="interop-operational-grid">
        <article class="interop-section interop-events-panel">
          <div class="interop-section-header compact">
            <div>
              <span class="interop-eyebrow">Eventos de aprendizaje</span>
              <h3>Base para Caliper, xAPI y analítica interna</h3>
            </div>
          </div>
          <div class="interop-chip-grid">
            <span v-for="event in learningEventTypes" :key="event">{{ event }}</span>
          </div>
          <div class="interop-config-grid full interop-event-form">
            <div class="interop-file-grid">
              <label>
                Tipo de evento
                <input v-model="learningEventTypeInput" list="learning-event-types" />
              </label>
              <label>
                Origen
                <input v-model="learningEventSourceInput" placeholder="coursev_web" />
              </label>
              <label>
                Usuario
                <input v-model="learningEventUserIdInput" inputmode="numeric" placeholder="ID opcional" />
              </label>
              <label>
                Curso
                <input v-model="learningEventCourseIdInput" inputmode="numeric" placeholder="ID opcional" />
              </label>
            </div>
            <datalist id="learning-event-types">
              <option v-for="event in learningEventTypes" :key="`option-${event}`" :value="event" />
            </datalist>
            <label>
              Payload JSON
              <textarea v-model="learningEventPayloadInput" rows="5" spellcheck="false"></textarea>
            </label>
          </div>
          <div class="interop-panel-actions">
            <button
              :disabled="interoperabilityActionBusy[interopActionBusyKey('caliper', 'record_custom_event')]"
              @click="recordCustomLearningEvent"
            >
              {{ interoperabilityActionBusy[interopActionBusyKey('caliper', 'record_custom_event')] ? 'Registrando...' : 'Registrar evento real' }}
            </button>
            <button
              :disabled="interoperabilityActionBusy[interopActionBusyKey('caliper', 'record_sample_event')]"
              @click="runInteroperabilityAction('caliper', 'record_sample_event')"
            >
              {{ interoperabilityActionBusy[interopActionBusyKey('caliper', 'record_sample_event')] ? 'Registrando...' : 'Registrar evento Caliper' }}
            </button>
            <button
              :disabled="interoperabilityActionBusy[interopActionBusyKey('caliper', 'export_analytics')]"
              @click="runInteroperabilityAction('caliper', 'export_analytics')"
            >
              {{ interoperabilityActionBusy[interopActionBusyKey('caliper', 'export_analytics')] ? 'Exportando...' : 'Descargar eventos CSV' }}
            </button>
          </div>
          <div class="interop-event-feed">
            <strong>Eventos recientes reales</strong>
            <p v-if="!recentLearningEvents.length">Todavia no hay eventos cargados desde el backend.</p>
            <p v-for="event in recentLearningEvents.slice(0, 4)" :key="event.id || `${event.eventType}-${event.createdAt}`">
              <span>{{ formatInteropDate(event.createdAt) }}</span>
              {{ event.eventType }} desde {{ event.eventSource }} para {{ event.standardTarget }}
            </p>
          </div>
          <div class="interop-schema">
            <strong>learning_events</strong>
            <div>
              <code v-for="field in learningEventSchema" :key="field">{{ field }}</code>
            </div>
          </div>
          <pre class="interop-json">{{ learningEventExample }}</pre>
        </article>

        <article class="interop-section interop-analytics-panel">
          <div class="interop-section-header compact">
            <div>
              <span class="interop-eyebrow">Analítica institucional</span>
              <h3>Decisiones académicas, no solo datos técnicos</h3>
            </div>
          </div>
          <div class="interop-filter-row">
            <span v-for="filter in analyticsFilters" :key="filter">{{ filter }}</span>
          </div>
          <div class="interop-metric-list">
            <article v-for="metric in institutionalAnalytics" :key="metric.title">
              <span>{{ metric.kpi }}</span>
              <strong>{{ metric.title }}</strong>
              <p>{{ metric.body }}</p>
            </article>
          </div>
          <div v-if="interoperabilityDashboard" class="interop-live-analytics">
            <article>
              <span>Estandares</span>
              <strong>{{ interoperabilityDashboard.summary.standards }}</strong>
            </article>
            <article>
              <span>Activos</span>
              <strong>{{ interoperabilityDashboard.summary.active }}</strong>
            </article>
            <article>
              <span>En pruebas</span>
              <strong>{{ interoperabilityDashboard.summary.inTests }}</strong>
            </article>
            <article>
              <span>Errores</span>
              <strong>{{ interoperabilityDashboard.summary.recentErrors }}</strong>
            </article>
          </div>
          <div class="interop-event-feed compact">
            <strong>Auditoria reciente</strong>
            <p v-if="!recentInteroperabilityHistory.length">Sin acciones operativas registradas todavia.</p>
            <p
              v-for="entry in recentInteroperabilityHistory.slice(0, 4)"
              :key="entry.id || `${entry.standardCode}-${entry.action}-${entry.createdAt}`"
            >
              <span>{{ formatInteropDate(entry.createdAt) }}</span>
              {{ entry.standardCode }} / {{ entry.action }}: {{ entry.summary }}
            </p>
          </div>
          <div class="interop-export-row">
            <button
              :disabled="interoperabilityActionBusy[interopActionBusyKey('caliper', 'export_analytics')]"
              @click="runInteroperabilityAction('caliper', 'export_analytics')"
            >
              Exportar analitica CSV
            </button>
            <button :disabled="interoperabilityLoading" @click="downloadInteroperabilitySnapshot">
              Descargar snapshot JSON
            </button>
            <button :disabled="interoperabilityLoading" @click="loadInteroperabilityDashboard">
              Recalcular estado
            </button>
          </div>
        </article>
      </section>

      <section class="interop-section">
        <div class="interop-section-header">
          <div>
            <span class="interop-eyebrow">Apartados del módulo</span>
            <h3>Integraciones que necesita una venta institucional seria</h3>
          </div>
        </div>
        <div class="interop-module-grid">
          <article
            v-for="module in interoperabilityModules"
            :key="module.title"
            class="interop-module-card"
          >
            <div>
              <span class="interop-module-phase">{{ module.phase }}</span>
              <h4>{{ module.title }}</h4>
              <p>{{ module.description }}</p>
            </div>
            <div class="interop-module-list">
              <strong>Debe incluir</strong>
              <span v-for="item in module.fields" :key="`${module.title}-${item}`">{{ item }}</span>
            </div>
            <div class="interop-module-list muted">
              <strong>Flujos clave</strong>
              <span v-for="item in module.capabilities" :key="`${module.title}-${item}`">{{ item }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="interop-blueprint-grid">
        <article v-for="block in interoperabilityBlueprint" :key="block.title" class="interop-blueprint-card">
          <span class="interop-eyebrow">{{ block.kicker }}</span>
          <h4>{{ block.title }}</h4>
          <ul>
            <li v-for="item in block.items" :key="`${block.title}-${item}`">{{ item }}</li>
          </ul>
        </article>
      </section>

      <section class="interop-section interop-roadmap">
        <div class="interop-section-header">
          <div>
            <span class="interop-eyebrow">MVP vendible</span>
            <h3>Roadmap por fases</h3>
          </div>
        </div>
        <div class="interop-roadmap-list">
          <article v-for="phase in interoperabilityRoadmap" :key="phase.step">
            <span>{{ phase.step }}</span>
            <div>
              <strong>{{ phase.title }}</strong>
              <p>{{ phase.body }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="interop-assurance-grid">
        <article class="interop-section">
          <div class="interop-section-header compact">
            <div>
              <span class="interop-eyebrow">Seguridad y privacidad</span>
              <h3>Controles obligatorios</h3>
            </div>
          </div>
          <ul class="interop-check-list">
            <li v-for="item in interoperabilitySecurity" :key="item">{{ item }}</li>
          </ul>
        </article>
        <article class="interop-section">
          <div class="interop-section-header compact">
            <div>
              <span class="interop-eyebrow">Criterios de aceptación</span>
              <h3>Cuándo el módulo está listo para piloto</h3>
            </div>
          </div>
          <ul class="interop-check-list">
            <li v-for="item in interoperabilityAcceptance" :key="item">{{ item }}</li>
          </ul>
        </article>
      </section>
    </div>

    <div v-if="activeTab === 'institutions' && hasSuperAdminRole" class="tab-content institutions-tab">
      <div v-if="institutionsLoading" class="a-loading">
        <div class="spinner-lg"></div>
        <p>Cargando instituciones...</p>
      </div>
      <template v-else>
        <!-- Summary cards -->
        <div class="a-stats-grid">
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-cyan">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ institutions.length }}</span>
              <span class="a-stat-upper">INSTITUCIONES</span>
              <span class="a-stat-sub">Total registradas</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ institutions.filter(i => !i.is_suspended).length }}</span>
              <span class="a-stat-upper">ACTIVAS</span>
              <span class="a-stat-sub">En funcionamiento</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon a-icon-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ institutions.filter(i => i.payment_due_date && new Date(i.payment_due_date) < new Date()).length }}</span>
              <span class="a-stat-upper">VENCIDAS</span>
              <span class="a-stat-sub">Pago pendiente</span>
            </div>
          </div>
          <div class="a-stat-card">
            <div class="a-stat-icon" style="background: rgba(255,69,58,0.15); color: #FF453A;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            </div>
            <div class="a-stat-body">
              <span class="a-stat-value">{{ institutions.filter(i => i.is_suspended).length }}</span>
              <span class="a-stat-upper">SUSPENDIDAS</span>
              <span class="a-stat-sub">Acceso bloqueado</span>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="inst-search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="institutionSearch" type="text" placeholder="Buscar institución..." class="inst-search-input" />
        </div>

        <!-- Institution cards -->
        <div class="inst-list">
          <div v-for="inst in filteredInstitutions" :key="`${inst.tenantId || '_'}-${inst.id}`" class="inst-card" :class="{ 'inst-suspended': inst.is_suspended }">
            <div class="inst-card-header">
              <div class="inst-info">
                <h4 class="inst-name">{{ inst.nombre }}</h4>
                <p class="inst-meta">
                  {{ inst.ciudad || 'Sin ciudad' }}, {{ inst.departamento || 'Sin depto' }} · Código: {{ inst.codigo || 'N/A' }}
                  <span v-if="inst.tenantName" class="inst-tenant-badge">{{ inst.tenantName }}</span>
                </p>
              </div>
              <span class="inst-status-badge" :class="inst.is_suspended ? 'badge-red' : 'badge-green'">
                {{ inst.is_suspended ? 'Suspendida' : 'Activa' }}
              </span>
            </div>

            <!-- Payment info -->
            <div class="inst-payment-row">
              <div class="inst-payment-info">
                <span class="inst-payment-label">Precio mensual:</span>
                <span class="inst-monthly-price">
                  ${{ (inst.monthly_price || 0).toLocaleString('es-CO') }} COP
                </span>
                <button class="inst-price-edit-btn" @click="openPriceEditor(inst)" title="Editar precio">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            </div>

            <!-- Payment info -->
            <div class="inst-payment-row">
              <div class="inst-payment-info">
                <span class="inst-payment-label">Ciclo de pago:</span>
                <span class="inst-payment-value" :class="{ 'is-overdue': inst.payment_due_date && new Date(inst.payment_due_date) < new Date() }">
                  {{ formatBillingCycle(inst) }}
                </span>
                <span v-if="inst.payment_due_date" class="inst-payment-next">
                  Próximo cobro: {{ formatDateTime(inst.payment_due_date, inst.billing_cycle_hour, inst.billing_cycle_minute) }}
                  <span v-if="inst.billing_action_mode" :style="{ color: inst.billing_action_mode === 'suspension' ? '#FF3B30' : '#FF9F0A', fontWeight: '600', marginLeft: '6px' }">
                    {{ inst.billing_action_mode === 'suspension' ? '⛔ Suspensión' : '⚠️ Advertencia' }}
                  </span>
                </span>
              </div>
              <div class="inst-actions">
                <button class="inst-action-btn inst-date-btn" @click="openCyclePicker(inst)" title="Configurar ciclo de pago">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </button>
                <button
                  v-if="!inst.is_suspended"
                  class="inst-action-btn inst-suspend-btn"
                  :disabled="institutionProcessing[inst.id]"
                  @click="handleSuspend(inst)"
                  title="Suspender institución"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                </button>
                <button
                  v-else
                  class="inst-action-btn inst-unsuspend-btn"
                  :disabled="institutionProcessing[inst.id]"
                  @click="handleUnsuspend(inst)"
                  title="Reactivar institución"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </button>
              </div>
            </div>

            <!-- Suspended info -->
            <div v-if="inst.is_suspended" class="inst-suspended-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF453A" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span>{{ inst.suspended_reason || 'Sin motivo especificado' }} · {{ inst.suspended_at ? formatDate(inst.suspended_at) : '' }}</span>
            </div>

            <!-- Service payment history -->
            <div v-if="servicePaymentsForInstitution(inst.id).length > 0" class="inst-payments-section">
              <h5 class="inst-payments-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Pagos de servicio
              </h5>
              <div class="inst-payments-list">
                <div v-for="pay in servicePaymentsForInstitution(inst.id).slice(0, 5)" :key="pay.id" class="inst-payment-item">
                  <span class="inst-pay-status" :class="'pay-' + (pay.status || 'PENDING').toLowerCase()">{{ pay.status }}</span>
                  <span class="inst-pay-amount">${{ Number(pay.amount || 0).toLocaleString('es-CO') }}</span>
                  <span class="inst-pay-date">{{ pay.created_at ? formatDate(pay.created_at) : '—' }}</span>
                  <span v-if="pay.billing_period_end" class="inst-pay-period">→ {{ formatDate(pay.billing_period_end) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="inst-payments-section inst-no-payments">
              <span class="inst-no-pay-text">Sin pagos de servicio registrados</span>
            </div>
          </div>

          <div v-if="filteredInstitutions.length === 0" class="empty-state">
            <span class="emoji">🏛️</span>
            <p>No se encontraron instituciones</p>
          </div>
        </div>
      </template>

      <!-- Billing cycle picker modal -->
      <Teleport to="body">
      <div v-if="datePickerTarget" class="inst-modal-overlay" @click.self="datePickerTarget = null">
        <div class="inst-modal">
          <h3>Ciclo de Pago</h3>
          <p class="inst-modal-sub">{{ datePickerTarget.nombre }}</p>

          <div class="cycle-options">
            <label class="cycle-option" :class="{ active: cycleType === 'monthly_start' }">
              <input type="radio" v-model="cycleType" value="monthly_start" />
              <div class="cycle-option-content">
                <span class="cycle-option-title">Inicio de mes</span>
                <span class="cycle-option-desc">Cobro el día 1 de cada mes</span>
              </div>
            </label>
            <label class="cycle-option" :class="{ active: cycleType === 'biweekly' }">
              <input type="radio" v-model="cycleType" value="biweekly" />
              <div class="cycle-option-content">
                <span class="cycle-option-title">Quincenal</span>
                <span class="cycle-option-desc">Cobro el 1 y el 15 de cada mes</span>
              </div>
            </label>
            <label class="cycle-option" :class="{ active: cycleType === 'monthly_day' }">
              <input type="radio" v-model="cycleType" value="monthly_day" />
              <div class="cycle-option-content">
                <span class="cycle-option-title">Día específico del mes</span>
                <span class="cycle-option-desc">Selecciona el día del mes para el cobro</span>
              </div>
            </label>
          </div>

          <!-- Recurrence: en ciclo o desde ese día -->
          <div v-if="cycleType" class="cycle-recurrence-picker">
            <label class="cycle-day-label">Aplicar:</label>
            <div class="cycle-recurrence-row">
              <button
                class="cycle-recurrence-btn"
                :class="{ active: cycleRecurrence === 'every_month' }"
                @click="cycleRecurrence = 'every_month'"
              >🔁 En ciclo (todos los meses)</button>
              <button
                class="cycle-recurrence-btn"
                :class="{ active: cycleRecurrence === 'once' }"
                @click="cycleRecurrence = 'once'"
              >📅 Desde ese día en adelante</button>
            </div>
          </div>

          <!-- Month selector -->
          <div v-if="cycleType" class="cycle-month-picker">
            <label class="cycle-day-label">Mes a aplicar:</label>
            <div class="cycle-month-grid">
              <button
                v-for="(name, idx) in CYCLE_MONTH_NAMES" :key="idx"
                class="cycle-month-btn"
                :class="{ selected: cycleSelectedMonth === idx }"
                @click="cycleSelectedMonth = idx"
              >{{ name }}</button>
            </div>
          </div>

          <div v-if="cycleType === 'monthly_day'" class="cycle-day-picker">
            <label class="cycle-day-label">Día del mes:</label>
            <div class="cycle-day-grid">
              <button
                v-for="d in 28" :key="d"
                class="cycle-day-btn"
                :class="{ selected: cycleDay === d }"
                @click="cycleDay = d"
              >{{ d }}</button>
            </div>
          </div>

          <div v-if="cycleType" class="cycle-hour-picker">
            <label class="cycle-day-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Hora del cobro <span style="font-size:11px;color:#8E8E93;font-weight:400;">(hora Colombia UTC-5)</span>:
            </label>
            <div style="display:flex;align-items:center;gap:6px;">
              <select v-model="cycleHour" class="cycle-hour-select">
                <option v-for="h in 24" :key="h - 1" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
              </select>
              <span style="color:#8E8E93;font-size:16px;font-weight:600;">:</span>
              <select v-model="cycleMinute" class="cycle-hour-select">
                <option v-for="m in 60" :key="m - 1" :value="m - 1">{{ String(m - 1).padStart(2, '0') }}</option>
              </select>
            </div>
          </div>

          <!-- Quick set from now -->
          <div v-if="cycleType" class="cycle-quick-row">
            <label class="cycle-day-label" style="color:#FF9F0A;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Cobro rápido:
            </label>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:13px;color:#8E8E93;font-weight:500;">En</span>
              <input
                type="number"
                v-model.number="cycleQuickMinutes"
                min="1"
                max="1440"
                class="cycle-quick-input"
              />
              <span style="font-size:13px;color:#8E8E93;font-weight:500;">min desde ahora</span>
              <button class="cycle-quick-btn" @click="setCycleQuickFromNow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Aplicar
              </button>
            </div>
          </div>

          <!-- Action mode: Warning / Suspension -->
          <div v-if="cycleType" class="cycle-action-mode">
            <label class="cycle-day-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px;margin-right:5px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Acción al vencer:
            </label>
            <div class="cycle-action-mode-row">
              <button
                class="cycle-action-btn"
                :class="{ active: cycleActionMode === 'warning', 'mode-warning': cycleActionMode === 'warning' }"
                @click="cycleActionMode = 'warning'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Advertencia
              </button>
              <button
                class="cycle-action-btn"
                :class="{ active: cycleActionMode === 'suspension', 'mode-suspend': cycleActionMode === 'suspension' }"
                @click="cycleActionMode = 'suspension'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                Suspensión
              </button>
            </div>
            <p class="cycle-action-hint" v-if="cycleActionMode === 'warning'">Los administradores de la institución verán un aviso de pago pendiente, pero podrán seguir usando la app.</p>
            <p class="cycle-action-hint cycle-action-hint-danger" v-else>Se bloqueará el acceso a todos los usuarios (excepto superadmin). Al ingresar verán el mensaje de suspensión con botón de pago.</p>
          </div>

          <div class="inst-modal-actions">
            <button
              v-if="datePickerTarget.billing_cycle_type"
              class="inst-modal-btn inst-modal-danger-soft"
              :disabled="institutionProcessing[datePickerTarget.id]"
              @click="removeBillingCycle"
            >
              {{ institutionProcessing[datePickerTarget.id] ? 'Eliminando...' : 'Eliminar ciclo' }}
            </button>
            <button class="inst-modal-btn inst-modal-cancel" @click="datePickerTarget = null">Cancelar</button>
            <button class="inst-modal-btn inst-modal-save" :disabled="institutionProcessing[datePickerTarget.id] || !cycleType" @click="saveBillingCycle">
              {{ institutionProcessing[datePickerTarget.id] ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
      </Teleport>

      <!-- Suspend reason modal -->
      <Teleport to="body">
      <div v-if="suspendTarget" class="inst-modal-overlay" @click.self="suspendTarget = null">
        <div class="inst-modal">
          <h3>Suspender Institución</h3>
          <p class="inst-modal-sub">{{ suspendTarget.nombre }}</p>
          <p class="inst-modal-warning">Esta acción bloqueará el acceso de todos los usuarios de esta institución.</p>
          <input v-model="suspendReason" type="text" placeholder="Motivo de suspensión (opcional)" class="inst-reason-input" />
          <div class="inst-modal-actions">
            <button class="inst-modal-btn inst-modal-cancel" @click="suspendTarget = null">Cancelar</button>
            <button class="inst-modal-btn inst-modal-danger" :disabled="institutionProcessing[suspendTarget.id]" @click="confirmSuspend">
              {{ institutionProcessing[suspendTarget.id] ? 'Suspendiendo...' : 'Suspender' }}
            </button>
          </div>
        </div>
      </div>
      </Teleport>

      <!-- Monthly price editor modal -->
      <Teleport to="body">
      <div v-if="priceEditorTarget" class="inst-modal-overlay" @click.self="priceEditorTarget = null">
        <div class="inst-modal">
          <h3>Precio Mensual</h3>
          <p class="inst-modal-sub">{{ priceEditorTarget.nombre }}</p>
          <div style="margin: 12px 0;">
            <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; display: block;">Valor en COP</label>
            <input
              v-model.number="editingPrice"
              type="number"
              min="0"
              step="1000"
              placeholder="Ej: 50000"
              class="inst-reason-input"
              style="font-size: 18px; font-weight: 600; text-align: center;"
            />
            <p v-if="editingPrice > 0" style="text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              ${{ Number(editingPrice).toLocaleString('es-CO') }} COP / mes
            </p>
          </div>
          <div class="inst-modal-actions">
            <button class="inst-modal-btn inst-modal-cancel" @click="priceEditorTarget = null">Cancelar</button>
            <button class="inst-modal-btn" style="background: #7C3AED; color: #fff;" :disabled="savingPrice" @click="saveMonthlyPrice">
              {{ savingPrice ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
      </Teleport>
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
import { institucionAdapter, type InstitutionAdmin, type InstitutionPayment } from '@/infrastructure/api/institucionAdapter'
import {
  interoperabilityAdapter,
  type InteroperabilityActionResult,
  type InteroperabilityDashboard,
  type InteroperabilityStandard,
} from '@/infrastructure/api/interoperabilityAdapter'
import { BarChart, AreaChart, LegendPosition } from 'vue-chrts'
import type { BulletLegendItemInterface } from 'vue-chrts'

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
  requestedRole: string | null
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
    return roleId === 3 || roleId === 4 || roleName === 'admin'
  })
})

const hasTeacherRole = computed(() => roleIds.value.includes(2))
const hasCognitiveAdminRole = computed(() => roleIds.value.includes(3) || roleIds.value.includes(4))
const teacherHasCognitiveInvitation = ref(false)
const cognitiveAccessCourses = ref<CognitiveCourseRef[]>([])
const canViewCognitive = computed(() =>
  hasCognitiveAdminRole.value || (hasTeacherRole.value && teacherHasCognitiveInvitation.value)
)
const isRole1Only = computed(() =>
  roleIds.value.length === 1 &&
  roleIds.value[0] === 1 &&
  !hasAdminRole.value
)

const canViewFullModeration = computed(() => hasAdminRole.value || hasTeacherRole.value)
const canViewCertificates = computed(() => hasAdminRole.value)
const canViewActivation = computed(() => hasAdminRole.value)
const canManageRoles = computed(() => hasAdminRole.value)
const hasSuperAdminRole = computed(() => roleIds.value.includes(4))
const canViewStandards = computed(() => roleIds.value.includes(3) || roleIds.value.includes(4))
const shouldUseCompactTabs = computed(() => isRole1Only.value)

const activeTab = ref('analytics')

const interoperabilityDashboard = ref<InteroperabilityDashboard | null>(null)
const interoperabilityLoading = ref(false)
const interoperabilityError = ref('')
const interoperabilityActionMessage = ref('')
const interoperabilityActionBusy = ref<Record<string, boolean>>({})
const lastInteroperabilityActionResult = ref<InteroperabilityActionResult | null>(null)
const qtiExportCourseId = ref('')
const qtiImportXml = ref(`<?xml version="1.0" encoding="UTF-8"?>
<questestinterop>
  <assessment ident="coursev-import-demo" title="Banco externo">
    <assessmentItem identifier="q1" title="Pregunta de ejemplo">
      <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string"/>
      <itemBody><p>Pregunta importada desde QTI.</p></itemBody>
    </assessmentItem>
  </assessment>
</questestinterop>`)
const xapiLrsEndpoint = ref('https://example.com/')
const xapiAuthMethod = ref('OAuth/API Key')
const ltiProvider = ref('Moodle')
const ltiClientId = ref('coursev-client-demo')
const ltiDeploymentId = ref('coursev-deployment-demo')
const ltiIssuer = ref('https://moodle.example.edu')
const ltiJwksUrl = ref('https://moodle.example.edu/mod/lti/certs.php')
const ltiRedirectUri = ref('https://coursev.app/api/v1/interoperability/lti/redirect')
const ltiLaunchUrl = ref('https://coursev.app/lti/launch')
const oneRosterUsersCsv = ref(`sourcedId,username,givenName,familyName,role,email
student-001,ana.rojas,Ana,Rojas,student,ana.rojas@universidad.edu
teacher-001,carlos.perez,Carlos,Perez,teacher,carlos.perez@universidad.edu`)
const oneRosterCoursesCsv = ref(`sourcedId,title
course-ml-python,Machine Learning con Python`)
const oneRosterClassesCsv = ref(`sourcedId,courseSourcedId,title
class-ml-python-a,course-ml-python,Grupo A`)
const oneRosterEnrollmentsCsv = ref(`classSourcedId,userSourcedId,role
class-ml-python-a,student-001,student
class-ml-python-a,teacher-001,teacher`)
const learningEventTypeInput = ref('lesson_completed')
const learningEventUserIdInput = ref('')
const learningEventCourseIdInput = ref('')
const learningEventSourceInput = ref('coursev_web')
const learningEventPayloadInput = ref(`{
  "lesson": "Validacion de modelos",
  "duration_seconds": 640,
  "progress": 100
}`)

const liveInteroperabilityStandards = computed<InteroperabilityStandard[]>(() =>
  interoperabilityDashboard.value?.standards ?? []
)
const recentLearningEvents = computed(() =>
  interoperabilityDashboard.value?.recentEvents ?? []
)
const recentInteroperabilityHistory = computed(() =>
  interoperabilityDashboard.value?.recentHistory ?? []
)
const lastInteroperabilityMetrics = computed(() =>
  Object.entries(lastInteroperabilityActionResult.value?.metrics ?? {})
)
const lastInteroperabilityErrors = computed(() =>
  lastInteroperabilityActionResult.value?.errors ?? []
)

const institutionalRoleScopes = [
  {
    role: 'Rol 3',
    title: 'Administración académica',
    scope: 'Analítica, eventos, importaciones, exportaciones, cursos institucionales e integraciones.',
  },
  {
    role: 'Rol 4',
    title: 'Superadministración',
    scope: 'Estándares globales, credenciales, instituciones, LMS externos, auditoría y políticas de datos.',
  },
]

const interoperabilityStandards = [
  {
    name: 'Caliper Analytics',
    short: 'CA',
    scope: 'Analítica de aprendizaje',
    state: 'En diseño',
    stateTone: 'design',
    coursevUse: 'Eventos internos de lectura, entrega, quiz, refuerzo con IA, asistencia y uso de recursos.',
    priority: 'Alta',
    owner: 'Producto académico',
    updated: 'Fase 1',
    actions: ['Mapear eventos', 'Definir vocabulario', 'Validar reportes'],
    accent: '#34D399',
  },
  {
    name: 'xAPI',
    short: 'xAPI',
    scope: 'Experiencias dentro y fuera del LMS',
    state: 'En diseño',
    stateTone: 'design',
    coursevUse: 'Simulaciones, prácticas presenciales, actividades offline, recursos externos y experiencias con IA.',
    priority: 'Alta',
    owner: 'Integraciones',
    updated: 'Fase 5',
    actions: ['Configurar LRS', 'Probar statements', 'Auditar errores'],
    accent: '#60A5FA',
  },
  {
    name: 'QTI',
    short: 'QTI',
    scope: 'Evaluaciones portables',
    state: 'Próximo',
    stateTone: 'next',
    coursevUse: 'Bancos de preguntas, quizzes y evidencias generadas por IA exportables a otros LMS.',
    priority: 'Media',
    owner: 'Evaluación IA',
    updated: 'Fase 2',
    actions: ['Exportar paquetes', 'Validar estructura', 'Importar QTI'],
    accent: '#A78BFA',
  },
  {
    name: 'OneRoster',
    short: 'OR',
    scope: 'SIS y sistemas académicos',
    state: 'Próximo',
    stateTone: 'next',
    coursevUse: 'Usuarios, docentes, estudiantes, cursos, clases, matrículas, cohortes y calificaciones.',
    priority: 'Alta',
    owner: 'Datos institucionales',
    updated: 'Fase 3',
    actions: ['Validar CSV', 'Confirmar importacion', 'Detectar duplicados'],
    accent: '#F59E0B',
  },
  {
    name: 'LTI',
    short: 'LTI',
    scope: 'Conexión con LMS',
    state: 'Próximo',
    stateTone: 'next',
    coursevUse: 'CourseV como herramienta externa dentro de Moodle, Canvas o Blackboard.',
    priority: 'Alta',
    owner: 'Plataforma',
    updated: 'Fase 4',
    actions: ['Registrar LMS', 'Launch test', 'Grade passback'],
    accent: '#22D3EE',
  },
]

const interoperabilityMapStandards = computed(() => {
  if (!liveInteroperabilityStandards.value.length) return interoperabilityStandards
  return liveInteroperabilityStandards.value.map((standard) => ({
    name: standard.name,
    short: standard.short,
    scope: standard.area,
    state: standard.state,
    stateTone: standard.stateTone,
    coursevUse: standard.coursevUse,
    priority: standard.priority,
    owner: standard.owner,
    updated: formatInteropDate(standard.updated),
    actions: standard.actions.map((action) => action.label),
    accent: standard.accent,
  }))
})

const learningEventTypes = [
  'lesson_viewed',
  'lesson_completed',
  'resource_opened',
  'quiz_started',
  'quiz_submitted',
  'evidence_submitted',
  'ai_feedback_requested',
  'ai_reinforcement_used',
  'simulation_completed',
  'offline_practice_completed',
  'course_completed',
  'module_abandoned',
  'assessment_failed',
  'attendance_registered',
]

const learningEventSchema = [
  'id',
  'tenant_id',
  'institution_id',
  'user_id',
  'role',
  'course_id',
  'module_id',
  'lesson_id',
  'event_type',
  'event_source',
  'event_payload',
  'standard_target',
  'created_at',
]

const learningEventExample = `{
  "user_id": "student_123",
  "course_id": "ml_python_32w",
  "event_type": "lesson_completed",
  "event_source": "coursev_web",
  "standard_target": "caliper",
  "event_payload": {
    "lesson": "Validación de modelos",
    "duration_seconds": 640,
    "progress": 100
  }
}`

const analyticsFilters = [
  'Institución',
  'Programa',
  'Curso',
  'Docente',
  'Cohorte',
  'Fecha',
]

const institutionalAnalytics = [
  {
    kpi: 'Riesgo',
    title: 'Estudiantes que necesitan acompañamiento',
    body: 'Cruza avance, bajo rendimiento, abandono de módulos y uso de refuerzo con IA.',
  },
  {
    kpi: 'Abandono',
    title: 'Módulos con mayor caída',
    body: 'Detecta lecciones, evidencias o recursos donde se pierde la continuidad académica.',
  },
  {
    kpi: 'Impacto',
    title: 'Recursos y docentes con más actividad',
    body: 'Mide qué materiales funcionan mejor y qué cursos generan más interacción real.',
  },
]

const interoperabilityModules = [
  {
    phase: 'xAPI / Fase 5',
    title: 'xAPI y LRS',
    description: 'Conector para enviar statements de experiencias dentro y fuera de CourseV hacia un Learning Record Store.',
    fields: ['Endpoint del LRS', 'API Key u OAuth', 'Prueba de conexión', 'Historial de statements', 'Errores de sincronización'],
    capabilities: ['Simulaciones', 'Prácticas presenciales', 'Actividades offline', 'Recursos externos', 'Interacción con IA'],
  },
  {
    phase: 'QTI / Fase 2',
    title: 'Banco de preguntas y QTI',
    description: 'Portabilidad de preguntas, quizzes y evidencias generadas por IA sin encerrar el contenido en CourseV.',
    fields: ['Curso', 'Módulo', 'Competencia', 'Dificultad', 'Historial de cambios', 'Validación del paquete'],
    capabilities: ['Crear con IA', 'Exportar QTI', 'Importar QTI', 'Ver incompatibilidades', 'Enviar a LMS'],
  },
  {
    phase: 'OneRoster / Fase 3',
    title: 'OneRoster y sistema académico',
    description: 'Importación inicial por CSV y base para sincronización REST de usuarios, cursos, matrículas y notas.',
    fields: ['users.csv', 'courses.csv', 'classes.csv', 'enrollments.csv', 'academicSessions.csv', 'orgs.csv'],
    capabilities: ['Validación previa', 'Detección de duplicados', 'Mapeo de campos', 'Vista de errores', 'Logs de importación'],
  },
  {
    phase: 'LTI / Fase 4',
    title: 'LTI y conexión con LMS',
    description: 'CourseV como herramienta externa integrada en Moodle, Canvas o Blackboard sin reemplazar el LMS institucional.',
    fields: ['Client ID', 'Deployment ID', 'Issuer URL', 'JWKS URL', 'Redirect URI', 'Launch URL'],
    capabilities: ['Deep Linking', 'Grade Passback', 'Prueba de lanzamiento', 'Logs técnicos', 'Roles LMS'],
  },
  {
    phase: 'Gobierno / Fase 1',
    title: 'Auditoría, privacidad y seguridad',
    description: 'Trazabilidad administrativa para datos de estudiantes, integraciones, IA, exportaciones e importaciones.',
    fields: ['tenant_id', 'institution_id', 'campus_id', 'program_id', 'course_id', 'audit_actor_id'],
    capabilities: ['Historial de accesos', 'Logs de exportación', 'Anonimización', 'Políticas de retención', 'Errores de integración'],
  },
]

const interoperabilityBlueprint = [
  {
    kicker: 'Base de datos',
    title: 'Modelo recomendado',
    items: ['learning_events', 'integration_connections', 'qti_question_banks', 'oneroster_import_jobs', 'lti_platform_registrations', 'audit_logs'],
  },
  {
    kicker: 'API',
    title: 'Endpoints backend necesarios',
    items: ['POST /learning-events', 'GET /institutional-analytics', 'POST /qti/export', 'POST /oneroster/import', 'POST /lti/platforms', 'GET /audit-logs'],
  },
  {
    kicker: 'Frontend',
    title: 'Componentes esperados',
    items: ['Mapa de estándares', 'Eventos de aprendizaje', 'Analítica institucional', 'Configuración LRS', 'Importador OneRoster', 'Registro LTI', 'Panel de auditoría'],
  },
]

const interoperabilityRoadmap = [
  {
    step: 'Fase 1',
    title: 'Eventos internos + analítica + roles 3 y 4',
    body: 'Primer MVP vendible: tracking interno, dashboards académicos, auditoría básica y control de acceso.',
  },
  {
    step: 'Fase 2',
    title: 'Exportación QTI de preguntas IA',
    body: 'Hacer portable el banco de preguntas para Moodle, Canvas u otras plataformas.',
  },
  {
    step: 'Fase 3',
    title: 'Importación OneRoster por CSV',
    body: 'Sincronizar estudiantes, docentes, cursos, clases y matrículas sin digitación manual.',
  },
  {
    step: 'Fase 4',
    title: 'LTI para Moodle o Canvas',
    body: 'Permitir que CourseV viva dentro del LMS actual de la universidad.',
  },
  {
    step: 'Fase 5',
    title: 'xAPI + LRS',
    body: 'Registrar simulaciones, prácticas presenciales, actividades offline y recursos externos como experiencias de aprendizaje.',
  },
]

const interoperabilitySecurity = [
  'Separación estricta por tenant, institución, sede, programa y curso.',
  'Permisos diferenciados: rol 3 opera analítica e importaciones; rol 4 configura credenciales y políticas.',
  'Anonimización para analítica institucional cuando no se necesita identificar estudiantes.',
  'Auditoría de quién importó, exportó, sincronizó, modificó evaluaciones o generó preguntas con IA.',
  'Retención de datos configurable por institución y registro de errores de integración.',
]

const interoperabilityAcceptance = [
  'La pestaña no aparece para estudiantes ni roles fuera de 3 y 4.',
  'El mapa muestra estado, prioridad y acciones sin usar la palabra certificado.',
  'Cada evento de aprendizaje se puede vincular a tenant, usuario, curso, origen y estándar objetivo.',
  'La analítica permite filtrar por institución, programa, curso, docente, cohorte y fecha.',
  'QTI, OneRoster, LTI y xAPI quedan separados como fases con campos técnicos claros.',
]

async function loadInteroperabilityDashboard() {
  if (!canViewStandards.value) return
  interoperabilityLoading.value = true
  interoperabilityError.value = ''
  try {
    interoperabilityDashboard.value = await interoperabilityAdapter.getDashboard()
  } catch (error: any) {
    console.error('Error loading interoperability dashboard:', error)
    interoperabilityError.value = error?.message || 'No se pudo cargar interoperabilidad institucional.'
  } finally {
    interoperabilityLoading.value = false
  }
}

function formatInteropMetric(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Sin datos'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function formatInteropDate(value?: string | null) {
  if (!value) return 'Sin historial'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin historial'
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function interopActionBusyKey(standardCode: string, action: string) {
  return `${standardCode}:${action}`
}

function readInteroperabilityFile(event: Event, target: string) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const content = String(reader.result || '')
    if (target === 'qti') qtiImportXml.value = content
    if (target === 'oneroster-users') oneRosterUsersCsv.value = content
    if (target === 'oneroster-courses') oneRosterCoursesCsv.value = content
    if (target === 'oneroster-classes') oneRosterClassesCsv.value = content
    if (target === 'oneroster-enrollments') oneRosterEnrollmentsCsv.value = content
    interoperabilityActionMessage.value = `${file.name} cargado para validacion.`
    lastInteroperabilityActionResult.value = null
  }
  reader.onerror = () => {
    interoperabilityError.value = `No se pudo leer ${file.name}.`
  }
  reader.readAsText(file)
}

function parseLearningEventPayload() {
  try {
    return learningEventPayloadInput.value.trim()
      ? JSON.parse(learningEventPayloadInput.value)
      : {}
  } catch {
    throw new Error('Payload JSON invalido para el evento de aprendizaje.')
  }
}

function buildInteropActionPayload(standardCode: string, action: string) {
  if (standardCode === 'caliper') {
    return {
      eventType: 'lesson_completed',
      lesson: 'Validación de modelos',
    }
  }
  if (standardCode === 'xapi') {
    return {
      endpoint: xapiLrsEndpoint.value.trim(),
      authMethod: xapiAuthMethod.value.trim() || 'OAuth/API Key',
    }
  }
  if (standardCode === 'qti') {
    const payload: Record<string, unknown> = {
      courseId: Number(qtiExportCourseId.value) || undefined,
    }
    if (action === 'validate_qti' || action === 'import_qti') {
      payload.xml = qtiImportXml.value
      payload.source = 'coursev_admin_upload'
    }
    return payload
  }
  if (standardCode === 'oneroster') {
    return {
      files: {
        'users.csv': oneRosterUsersCsv.value,
        'courses.csv': oneRosterCoursesCsv.value,
        'classes.csv': oneRosterClassesCsv.value,
        'enrollments.csv': oneRosterEnrollmentsCsv.value,
      },
      dryRun: action !== 'commit_oneroster_csv',
    }
  }
  if (standardCode === 'lti') {
    return {
      provider: ltiProvider.value.trim() || 'Moodle',
      clientId: ltiClientId.value.trim(),
      deploymentId: ltiDeploymentId.value.trim(),
      issuer: ltiIssuer.value.trim(),
      jwksUrl: ltiJwksUrl.value.trim(),
      redirectUri: ltiRedirectUri.value.trim(),
      launchUrl: ltiLaunchUrl.value.trim(),
      linkedCourses: 1,
    }
  }
  return {}
}

function downloadInteropContent(fileName: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || `coursev-interoperability-${Date.now()}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function downloadInteroperabilitySnapshot() {
  if (!interoperabilityDashboard.value) {
    await loadInteroperabilityDashboard()
  }
  if (!interoperabilityDashboard.value) return
  downloadInteropContent(
    `coursev-interoperability-snapshot-${Date.now()}.json`,
    'application/json;charset=utf-8',
    JSON.stringify(interoperabilityDashboard.value, null, 2),
  )
}

async function recordCustomLearningEvent() {
  const key = interopActionBusyKey('caliper', 'record_custom_event')
  interoperabilityActionBusy.value = { ...interoperabilityActionBusy.value, [key]: true }
  interoperabilityActionMessage.value = ''
  interoperabilityError.value = ''
  lastInteroperabilityActionResult.value = null
  try {
    const event = await interoperabilityAdapter.recordEvent({
      eventType: learningEventTypeInput.value.trim() || 'lesson_completed',
      eventSource: learningEventSourceInput.value.trim() || 'coursev_web',
      standardTarget: 'caliper',
      userId: Number(learningEventUserIdInput.value) || undefined,
      courseId: Number(learningEventCourseIdInput.value) || undefined,
      eventPayload: parseLearningEventPayload(),
    })
    interoperabilityActionMessage.value = `Evento ${event.eventType} registrado desde ${event.eventSource}.`
    lastInteroperabilityActionResult.value = {
      status: 'success',
      summary: interoperabilityActionMessage.value,
      metrics: {
        eventType: event.eventType,
        eventSource: event.eventSource,
        standardTarget: event.standardTarget,
        courseId: event.courseId ?? null,
        userId: event.userId ?? null,
      },
    }
    await loadInteroperabilityDashboard()
  } catch (error: any) {
    console.error('Error recording learning event:', error)
    interoperabilityError.value = error?.message || 'No se pudo registrar el evento.'
  } finally {
    interoperabilityActionBusy.value = { ...interoperabilityActionBusy.value, [key]: false }
  }
}

async function runInteroperabilityAction(standardCode: string, action: string) {
  const key = interopActionBusyKey(standardCode, action)
  interoperabilityActionBusy.value = { ...interoperabilityActionBusy.value, [key]: true }
  interoperabilityActionMessage.value = ''
  interoperabilityError.value = ''
  lastInteroperabilityActionResult.value = null
  try {
    const result = await interoperabilityAdapter.runAction(
      standardCode,
      action,
      buildInteropActionPayload(standardCode, action),
    )
    lastInteroperabilityActionResult.value = result
    if (result.content) {
      downloadInteropContent(result.fileName || 'coursev-export.txt', result.mimeType || 'text/plain', result.content)
    }
    if (result.dashboard) interoperabilityDashboard.value = result.dashboard
    else await loadInteroperabilityDashboard()
    if (result.status === 'error') {
      interoperabilityError.value = result.summary || 'La accion termino con errores.'
    } else {
      interoperabilityActionMessage.value = result.summary || 'Accion ejecutada.'
    }
  } catch (error: any) {
    console.error('Error running interoperability action:', error)
    interoperabilityError.value = error?.message || 'No se pudo ejecutar la accion.'
  } finally {
    interoperabilityActionBusy.value = { ...interoperabilityActionBusy.value, [key]: false }
  }
}

async function toggleInteroperabilityChecklist(standardCode: string, itemKey: string, event: Event) {
  const input = event.target as HTMLInputElement | null
  if (!input) return
  interoperabilityError.value = ''
  try {
    interoperabilityDashboard.value = await interoperabilityAdapter.toggleChecklist(standardCode, itemKey, input.checked)
  } catch (error: any) {
    input.checked = !input.checked
    interoperabilityError.value = error?.message || 'No se pudo actualizar el requisito.'
  }
}

const educationalStandards = [
  {
    name: 'Caliper',
    short: 'CA',
    scope: 'Analítica de aprendizaje',
    purpose: 'Medir eventos de aprendizaje y actividad digital dentro de recursos educativos.',
    importance: 'Saber qué hace el estudiante, dónde abandona, qué recurso usa y en qué punto falla.',
    accent: '#34D399',
  },
  {
    name: 'xAPI',
    short: 'xAPI',
    scope: 'Experiencias dentro y fuera del LMS',
    purpose: 'Registrar aprendizaje dentro y fuera de la app: simulaciones, prácticas presenciales, actividades offline o recursos externos.',
    importance: 'Medir rutas reales de aprendizaje más allá de CourseV y consolidarlas en un LRS.',
    accent: '#60A5FA',
  },
  {
    name: 'QTI',
    short: 'QTI',
    scope: 'Evaluaciones portables',
    purpose: 'Exportar e importar preguntas, bancos de evaluación y pruebas entre plataformas.',
    importance: 'Permitir que los quizzes generados por IA funcionen en otros LMS sin rehacerlos desde cero.',
    accent: '#A78BFA',
  },
  {
    name: 'OneRoster',
    short: 'OR',
    scope: 'SIS y sistemas académicos',
    purpose: 'Sincronizar estudiantes, cursos, matrículas, listas y calificaciones.',
    importance: 'Integrarte con sistemas académicos reales sin carga manual ni doble digitación.',
    accent: '#F59E0B',
  },
  {
    name: 'LTI',
    short: 'LTI',
    scope: 'Conexión con LMS',
    purpose: 'Conectar CourseV con Moodle, Canvas, Blackboard u otras herramientas institucionales.',
    importance: 'Vender sin obligar a la universidad a cambiar todo ni exigir múltiples inicios de sesión.',
    accent: '#22D3EE',
  },
]

const standardsImplementationSteps = [
  {
    step: '01',
    title: 'Instrumentar eventos',
    body: 'Modelar lectura, entrega, refuerzo, quiz, asistencia, simulaciones y prácticas externas como eventos trazables.',
  },
  {
    step: '02',
    title: 'Normalizar evaluación',
    body: 'Preparar los bancos de preguntas IA para exportación/importación compatible con QTI.',
  },
  {
    step: '03',
    title: 'Abrir integración LMS',
    body: 'Priorizar LTI y OneRoster para pilotos con universidades que ya usan sistemas académicos.',
  },
]

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

const COLOMBIA_TZ = 'America/Bogota'

/** Get Date parts in Colombia timezone */
const getColombiaDateParts = (d: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: COLOMBIA_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value ?? 0)
  return { year: get('year'), month: get('month') - 1, day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') }
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return 'Fecha no disponible'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', timeZone: COLOMBIA_TZ })
}

const formatDateTime = (dateStr?: string | null, overrideHour?: number | null, overrideMinute?: number | null) => {
  if (!dateStr) return 'Fecha no disponible'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const datePart = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', timeZone: COLOMBIA_TZ })
  const col = getColombiaDateParts(d)
  const h = String(overrideHour ?? col.hour).padStart(2, '0')
  const m = String(overrideMinute ?? col.minute).padStart(2, '0')
  return `${datePart} a las ${h}:${m} (COT)`
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
  { id: 'cognitive', label: 'Gemelo Cognitivo', adminOnly: false, cognitiveOnly: true },
  { id: 'standards', label: 'Interoperabilidad', adminOnly: false, standardsOnly: true },
  { id: 'moderation', label: 'Moderación', adminOnly: false },
  { id: 'roles', label: 'Roles', adminOnly: false },
  { id: 'certificates', label: 'Certificados', adminOnly: true },
  { id: 'activation', label: 'Activación', adminOnly: true },
  { id: 'enrollment', label: 'Matrícula', adminOnly: true },
  { id: 'institutions', label: 'Instituciones', adminOnly: true, superAdminOnly: true },
]

const visibleTabs = computed(() => {
  if (shouldUseCompactTabs.value) {
    return allTabs.filter((tab) => tab.id === 'moderation' || tab.id === 'roles')
  }

  return allTabs.filter((tab) => {
    if ((tab as any).cognitiveOnly) return canViewCognitive.value
    if ((tab as any).standardsOnly) return canViewStandards.value
    if ((tab as any).superAdminOnly) return hasSuperAdminRole.value
    return !tab.adminOnly || hasAdminRole.value
  })
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
  if (tab === 'institutions' && institutions.value.length === 0 && !institutionsLoading.value) {
    loadInstitutions()
  }
  if (tab === 'standards' && canViewStandards.value && !interoperabilityDashboard.value && !interoperabilityLoading.value) {
    loadInteroperabilityDashboard()
  }
  if (tab === 'cognitive' && canViewCognitive.value && cognitiveStudents.value.length === 0 && !cognitiveLoading.value) {
    loadCognitiveData()
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
  { id: 1, label: 'Estudiante' },
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
        requestedRole: toNonEmptyString(item.requestedRole, item.requested_role) || 'student',
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
  subjects: { id: number; name: string; thumbnailUrl?: string | null; enrollmentStatus?: string }[]
  status: string
  courseEnrollmentStatus: string
  revokeReason: string | null
}

const approvedEnrollments = ref<ApprovedEnrollmentItem[]>([])
const loadingApproved = ref(false)
const approvedUserFilter = ref('')
const approvedCourseFilter = ref('')
const approvedSubjectFilter = ref('')
const approvedOnlyWithoutAccess = ref(false)
const revokingKeys = ref<Record<string, boolean>>({})
const restoringKeys = ref<Record<string, boolean>>({})
const blockedSubjectKeys = ref<Set<string>>(new Set())
const togglingEnrollStatus = ref<Record<string, boolean>>({})
let approvedLoaded = false

interface SubjectAccessBlockDetail {
  userId: number
  courseId: number
  subjectId: number
  reason: string | null
  blockedAt: string | null
  blockedBy: number | null
  blockedByUsername: string | null
  username: string | null
  fullName: string | null
  subjectName: string | null
  courseName: string | null
}

const subjectBlockDetails = ref<Map<string, SubjectAccessBlockDetail>>(new Map())

const getBlockDetail = (userId: number, courseId: number, subjectId: number): SubjectAccessBlockDetail | null => {
  return subjectBlockDetails.value.get(`${userId}-${courseId}-${subjectId}`) ?? null
}

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
  subjects: { id: number; name: string; thumbnailUrl?: string | null; enrollmentStatus?: string }[]
  users: ApprovedEnrollmentItem[]
}

const filteredApprovedGrouped = computed<ApprovedGrouped[]>(() => {
  const uq = approvedUserFilter.value.toLowerCase()
  const cq = approvedCourseFilter.value.toLowerCase()
  const sq = approvedSubjectFilter.value.toLowerCase()
  const onlyNoAccess = approvedOnlyWithoutAccess.value

  const filtered = activeEnrollments.value.filter(e => {
    const matchUser = matchesFlexibleUserSearch(uq, e.fullName, e.username, e.identificacion)
    const matchCourse = !cq
      || (e.courseName ?? '').toLowerCase().includes(cq)
      || String(e.courseId).includes(cq)
    const matchSubject = !sq || e.subjects.some(s => s.name.toLowerCase().includes(sq))
    const matchNoAccess = !onlyNoAccess
      || e.courseEnrollmentStatus === 'inactivo'
      || e.subjects.some(s => blockedSubjectKeys.value.has(`${e.userId}-${e.courseId}-${s.id}`))
    return matchUser && matchCourse && matchSubject && matchNoAccess
  })

  const grouped = new Map<number, ApprovedGrouped>()
  for (const e of filtered) {
    if (!grouped.has(e.courseId)) {
      grouped.set(e.courseId, {
        courseId: e.courseId,
        courseName: e.courseName || `Curso #${e.courseId}`,
        subjects: [],
        users: [],
      })
    }
    const group = grouped.get(e.courseId)!
    // Merge unique subjects (by id) for the course header — no per-user state
    for (const subj of e.subjects) {
      if (!group.subjects.some(s => s.id === subj.id)) {
        group.subjects.push({ id: subj.id, name: subj.name, thumbnailUrl: subj.thumbnailUrl })
      }
    }
    // Guard: skip duplicate userId entries to prevent identical v-for keys
    if (!group.users.some(u => u.userId === e.userId)) {
      group.users.push(e)
    }
  }
  return Array.from(grouped.values())
})

const loadApprovedEnrollments = async () => {
  loadingApproved.value = true
  try {
    // Load block details in parallel with approved enrollments
    const blockDetailsPromise = (async () => {
      try {
        const blocks = await progressAdapter.getAllSubjectAccessBlocks()
        const arr = Array.isArray(blocks) ? blocks : []
        const detailMap = new Map<string, SubjectAccessBlockDetail>()
        for (const b of arr) {
          const detail: SubjectAccessBlockDetail = {
            userId: Number(b.userId ?? b.user_id) || 0,
            courseId: Number(b.courseId ?? b.course_id) || 0,
            subjectId: Number(b.subjectId ?? b.subject_id) || 0,
            reason: (b.reason as string) || null,
            blockedAt: (b.blockedAt as string) ?? (b.blocked_at as string) ?? null,
            blockedBy: Number(b.blockedBy ?? b.blocked_by) || null,
            blockedByUsername: (b.blockedByUsername as string) ?? (b.blocked_by_username as string) ?? null,
            username: (b.username as string) || null,
            fullName: (b.fullName as string) ?? (b.full_name as string) ?? null,
            subjectName: (b.subjectName as string) ?? (b.subject_name as string) ?? null,
            courseName: (b.courseName as string) ?? (b.course_name as string) ?? null,
          }
          if (detail.userId && detail.courseId && detail.subjectId) {
            detailMap.set(`${detail.userId}-${detail.courseId}-${detail.subjectId}`, detail)
          }
        }
        subjectBlockDetails.value = detailMap
      } catch (e) {
        console.error('Error loading subject block details:', e)
      }
    })()

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
      // Also mark subjects with enrollment_status='inactivo' (from progreso_materia) as blocked
      const subjects: any[] = Array.isArray(item.subjects) ? item.subjects : []
      for (const s of subjects) {
        const enrollStatus = String(s.enrollmentStatus ?? s.enrollment_status ?? 'activo').toLowerCase()
        if (enrollStatus === 'inactivo' && s.id) {
          newBlockedKeys.add(`${uid}-${cid}-${s.id}`)
        }
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
      subjects: Array.isArray(item.subjects) ? item.subjects.map((s: any) => ({
        id: s.id,
        name: s.name,
        thumbnailUrl: s.thumbnailUrl ?? s.thumbnail_url ?? null,
        enrollmentStatus: s.enrollmentStatus ?? s.enrollment_status ?? 'activo',
      })) : [],
      status: String(item.status ?? item.enrollmentStatus ?? item.enrollment_status ?? 'approved'),
      courseEnrollmentStatus: String(item.courseEnrollmentStatus ?? item.course_enrollment_status ?? 'activo'),
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

    const enriched = rows.map((item: any) => {
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
        courseEnrollmentStatus: item.courseEnrollmentStatus,
        revokeReason: item.revokeReason,
      }
    })

    // Deduplicate by userId+courseId: keep the first occurrence (backend should already deduplicate,
    // but guard here against stale data causing duplicate v-for keys that break Vue reconciliation).
    const seenKeys = new Set<string>()
    approvedEnrollments.value = enriched.filter(item => {
      const key = `${item.userId}-${item.courseId}`
      if (seenKeys.has(key)) return false
      seenKeys.add(key)
      return true
    })
    await blockDetailsPromise
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
  errorMsg: '',
})

const openRevokeDialog = (userId: number, courseId: number, userName: string, courseName: string) => {
  revokeDialog.value = { visible: true, userId, courseId, userName, courseName, reason: '', processing: false }
}

const openBlockSubjectDialog = (userId: number, courseId: number, userName: string, subjects: { id: number; name: string }[], preSelectedId: number = 0) => {
  blockSubjectDialog.value = { visible: true, userId, courseId, userName, subjects, selectedSubjectId: preSelectedId, reason: '', processing: false, errorMsg: '' }
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
    // Optimistic local update: mark as revoked immediately
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId
        ? { ...e, status: 'revoked', revokeReason: reason.trim() }
        : e
    )
    revokeDialog.value.visible = false
    // Reload from backend to ensure consistency with persisted state
    approvedLoaded = false
    await loadApprovedEnrollments()
    // Merge optimistic revoked status back in case server returned stale data
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId && e.status !== 'revoked'
        ? { ...e, status: 'revoked', revokeReason: reason.trim() }
        : e
    )
  } catch (e) {
    console.error('Error al revocar matrícula:', e)
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
    console.error('Error al bloquear acceso a la materia:', e)
    blockSubjectDialog.value.errorMsg = e instanceof HttpError ? e.message : 'Error al bloquear acceso. Intenta de nuevo.'
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
    await progressAdapter.unblockSubjectAccess(userId, subjectId, courseId)
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
    console.error('Error al restaurar acceso a la materia:', e)
  } finally {
    unblockSubjectDialog.value.processing = false
  }
}

const quickUnblockSubject = async (userId: number, courseId: number, subjectId: number) => {
  const optimisticKey = `${userId}-${courseId}-${subjectId}`
  // Optimistic local update: remove blocked state immediately
  const newSet = new Set(blockedSubjectKeys.value)
  newSet.delete(optimisticKey)
  blockedSubjectKeys.value = newSet
  try {
    await progressAdapter.unblockSubjectAccess(userId, subjectId, courseId)
    approvedLoaded = false
    await loadApprovedEnrollments()
    if (blockedSubjectKeys.value.has(optimisticKey)) {
      const merged = new Set(blockedSubjectKeys.value)
      merged.delete(optimisticKey)
      blockedSubjectKeys.value = merged
    }
  } catch (e) {
    console.error('Error al restaurar acceso a la materia:', e)
    // Revert optimistic update on error
    const revert = new Set(blockedSubjectKeys.value)
    revert.add(optimisticKey)
    blockedSubjectKeys.value = revert
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
    // Optimistic local update: mark as approved immediately
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId
        ? { ...e, status: 'approved', revokeReason: null }
        : e
    )
    approvedLoaded = false
    await loadApprovedEnrollments()
    // Merge optimistic status back in case server returned stale data
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId && e.status === 'revoked'
        ? { ...e, status: 'approved', revokeReason: null }
        : e
    )
  } catch (e) {
    console.error('Error restoring enrollment:', e)
  } finally {
    delete restoringKeys.value[key]
  }
}

const toggleCourseEnrollmentStatus = async (userId: number, courseId: number, status: 'activo' | 'inactivo') => {
  const key = `c-${userId}-${courseId}`
  togglingEnrollStatus.value[key] = true
  try {
    await progressAdapter.setCourseEnrollmentStatus(userId, courseId, status)
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId
        ? { ...e, courseEnrollmentStatus: status }
        : e
    )
  } catch (e: any) {
    if (e?.statusCode !== 401) console.error('Error toggling course enrollment status:', e)
  } finally {
    delete togglingEnrollStatus.value[key]
  }
}

const toggleSubjectEnrollmentStatus = async (userId: number, courseId: number, subjectId: number, status: 'activo' | 'inactivo') => {
  const key = `s-${userId}-${subjectId}`
  togglingEnrollStatus.value[key] = true
  try {
    await progressAdapter.setSubjectEnrollmentStatus(userId, courseId, subjectId, status)
    // When giving access (activo), also clear any active block in subject_access_blocks.
    // This handles the case where a block forced enrollment_status='inactivo' via the
    // "congruencia" override in findApprovedEnrollments — without clearing the block,
    // the next reload would revert enrollment_status back to 'inactivo'.
    if (status === 'activo') {
      try {
        await progressAdapter.unblockSubjectAccess(userId, subjectId, courseId)
        const blockKey = `${userId}-${courseId}-${subjectId}`
        const newSet = new Set(blockedSubjectKeys.value)
        newSet.delete(blockKey)
        blockedSubjectKeys.value = newSet
      } catch (blockErr: any) {
        // Non-fatal: block may not exist, log only unexpected errors
        if (blockErr?.statusCode !== 404) console.error('Error clearing subject block on activate:', blockErr)
      }
    }
    approvedEnrollments.value = approvedEnrollments.value.map(e =>
      e.userId === userId && e.courseId === courseId
        ? { ...e, subjects: e.subjects.map(s => s.id === subjectId ? { ...s, enrollmentStatus: status } : s) }
        : e
    )
  } catch (e: any) {
    if (e?.statusCode !== 401) console.error('Error toggling subject enrollment status:', e)
  } finally {
    delete togglingEnrollStatus.value[key]
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

type CognitiveSortKey = 'recent_activity' | 'performance' | 'sessions' | 'improvement' | 'fatigue'
type CognitivePerformanceStatus = 'strong' | 'steady' | 'needs_support'

interface CognitiveCourseRef {
  id: number
  title: string
}

interface CoursePerformanceData {
  courseId: number
  courseTitle: string
  tasksSubmitted: number
  tasksGraded: number
  avgGrade: number
  accuracy: number
  lastActivity: string | null
  daysSinceActivity: number
  dominance: 'mastered' | 'progress' | 'developing' | 'needs_support'
  history: CognitiveHistoryPoint[]
}

interface CognitiveInsights {
  skillLevel: string
  skillColor: string
  trend: string
  improvementRate: number
  consistency: number
  engagementLevel: string
  preferredStudyHour: number | null
  difficultyStats: Record<string, { total: number; correct: number }>
  errorRate?: number
  preferredDifficulty?: string | null
  fatigueRiskScore?: number
  fatigueLevel?: 'high' | 'medium' | 'low'
  performanceStatus?: CognitivePerformanceStatus
  recommendedAction?: string
}

interface CognitivePerformance {
  accuracy: number
  avgGrade: number
  totalQuestions: number
  totalCorrect: number
  totalIncorrect: number
  totalSessions: number
  totalDuration: number
  avgTimePerQuestion: number
}

interface CognitiveHistoryPoint {
  date: string
  grade: number
  accuracy: number
  questions: number
}

interface CognitiveStudentProfile {
  id: number
  username: string
  email: string | null
  avatar: string | null
  fullName: string
  firstName: string
  lastName: string
  performance: CognitivePerformance
  cognitiveInsights: CognitiveInsights
  lastActivity: string | null
  daysSinceLastActivity: number
  recentHistory: CognitiveHistoryPoint[]
  firstSession: string | null
  courses: CognitiveCourseRef[]
  coursePerformance: Map<number, CoursePerformanceData>
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
  return new Date(parsed).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: COLOMBIA_TZ })
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

const cognitiveStudents = ref<CognitiveStudentProfile[]>([])
const cognitiveCourseOptions = ref<CognitiveCourseRef[]>([])
const cognitiveLoading = ref(false)
const cognitiveLoadError = ref('')
const cognitiveSearch = ref('')
const cognitiveCourseFilter = ref('all')
const cognitiveSortBy = ref<CognitiveSortKey>('recent_activity')
const selectedCognitiveStudentId = ref<number | null>(null)

const normalizeCognitiveCourse = (course: Record<string, any>): CognitiveCourseRef => ({
  id: parseSafeNumber(course.id ?? course.courseId ?? course.course_id),
  title: String(course.title || course.name || course.courseName || `Curso #${course.id ?? course.courseId ?? course.course_id}`),
})

const loadCognitiveAccess = async () => {
  teacherHasCognitiveInvitation.value = false
  cognitiveAccessCourses.value = []

  if (hasCognitiveAdminRole.value) return
  if (!hasTeacherRole.value) return

  try {
    const access = await reinforcementAdapter.getCognitiveAccess()
    teacherHasCognitiveInvitation.value = Boolean((access as any)?.canView)
    cognitiveAccessCourses.value = Array.isArray((access as any)?.courses)
      ? (access as any).courses
          .map((course: Record<string, any>) => normalizeCognitiveCourse(course))
          .filter((course: CognitiveCourseRef) => course.id > 0)
      : []
  } catch (error) {
    console.error('Error loading cognitive access:', error)
    teacherHasCognitiveInvitation.value = false
    cognitiveAccessCourses.value = []
  }
}

const calculateCourseDominance = (accuracy: number, tasksGraded: number, avgGrade: number): CoursePerformanceData['dominance'] => {
  if (tasksGraded === 0) return 'developing'
  if (accuracy >= 85 && avgGrade >= 8) return 'mastered'
  if (accuracy >= 70 && avgGrade >= 6.5) return 'progress'
  if (accuracy >= 50 && avgGrade >= 5) return 'developing'
  return 'needs_support'
}

const normalizeCognitiveStudent = (raw: Record<string, any>, course: CognitiveCourseRef): CognitiveStudentProfile => {
  const performance = raw.performance || {}
  const insights = raw.cognitiveInsights || {}
  const totalQuestions = parseSafeNumber(performance.totalQuestions)
  const totalCorrect = parseSafeNumber(performance.totalCorrect)
  const totalIncorrect = parseSafeNumber(performance.totalIncorrect)
  const totalDuration = parseSafeNumber(performance.totalDuration)
  const totalSessions = parseSafeNumber(performance.totalSessions)
  const accuracy = parseSafeNumber(performance.accuracy)
  const avgGrade = parseSafeNumber(performance.avgGrade)
  const lastActivity = typeof raw.lastActivity === 'string' ? raw.lastActivity : null
  const daysSinceLastActivity = parseSafeNumber(raw.daysSinceLastActivity)

  const coursePerformance = new Map<number, CoursePerformanceData>()
  coursePerformance.set(course.id, {
    courseId: course.id,
    courseTitle: course.title,
    tasksSubmitted: totalSessions,
    tasksGraded: totalSessions,
    avgGrade,
    accuracy,
    lastActivity,
    daysSinceActivity: daysSinceLastActivity,
    dominance: calculateCourseDominance(accuracy, totalSessions, avgGrade),
    history: Array.isArray(raw.recentHistory)
      ? raw.recentHistory.map((point: any) => ({
          date: String(point.date || ''),
          grade: parseSafeNumber(point.grade),
          accuracy: parseSafeNumber(point.accuracy),
          questions: parseSafeNumber(point.questions),
        }))
      : [],
  })

  return {
    id: parseSafeNumber(raw.id ?? raw.userId ?? raw.user_id),
    username: String(raw.username ?? 'estudiante'),
    email: typeof raw.email === 'string' ? raw.email : null,
    avatar: typeof raw.avatar === 'string' ? raw.avatar : null,
    fullName: String(raw.fullName || raw.full_name || raw.username || 'Estudiante'),
    firstName: String(raw.firstName || ''),
    lastName: String(raw.lastName || ''),
    performance: {
      accuracy,
      avgGrade,
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalSessions,
      totalDuration,
      avgTimePerQuestion: parseSafeNumber(performance.avgTimePerQuestion),
    },
    cognitiveInsights: {
      skillLevel: String(insights.skillLevel || 'beginner'),
      skillColor: String(insights.skillColor || '#8E8E93'),
      trend: String(insights.trend || 'stable'),
      improvementRate: parseSafeNumber(insights.improvementRate),
      consistency: parseSafeNumber(insights.consistency),
      engagementLevel: String(insights.engagementLevel || 'medium'),
      preferredStudyHour: Number.isInteger(Number(insights.preferredStudyHour)) ? Number(insights.preferredStudyHour) : null,
      difficultyStats: (insights.difficultyStats || {}) as Record<string, { total: number; correct: number }>,
      errorRate: Number.isFinite(Number(insights.errorRate)) ? Number(insights.errorRate) : undefined,
      preferredDifficulty: typeof insights.preferredDifficulty === 'string' ? insights.preferredDifficulty : null,
      fatigueRiskScore: Number.isFinite(Number(insights.fatigueRiskScore)) ? Number(insights.fatigueRiskScore) : undefined,
      fatigueLevel: ['high', 'medium', 'low'].includes(String(insights.fatigueLevel)) ? insights.fatigueLevel : undefined,
      performanceStatus: ['strong', 'steady', 'needs_support'].includes(String(insights.performanceStatus)) ? insights.performanceStatus : undefined,
      recommendedAction: typeof insights.recommendedAction === 'string' ? insights.recommendedAction : undefined,
    },
    lastActivity,
    daysSinceLastActivity,
    recentHistory: Array.isArray(raw.recentHistory)
      ? raw.recentHistory.map((point: any) => ({
          date: String(point.date || ''),
          grade: parseSafeNumber(point.grade),
          accuracy: parseSafeNumber(point.accuracy),
          questions: parseSafeNumber(point.questions),
        }))
      : [],
    firstSession: typeof raw.firstSession === 'string' ? raw.firstSession : null,
    courses: [course],
    coursePerformance,
  }
}

const parseCognitiveTimestamp = (...values: unknown[]): number => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value > 10_000_000_000 ? value : value * 1000
    }
    if (typeof value === 'string' && value.trim()) {
      const numeric = Number(value)
      if (Number.isFinite(numeric) && numeric > 0) {
        return numeric > 10_000_000_000 ? numeric : numeric * 1000
      }
      const parsed = Date.parse(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }
  return 0
}

const normalizeTaskGradeToTen = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const grade = Number(value)
  if (!Number.isFinite(grade)) return null
  if (grade <= 5) return Math.max(0, Math.min(10, grade * 2))
  return Math.max(0, Math.min(10, grade))
}

const normalizeTaskSubmissionStudent = (
  raw: Record<string, any>,
  course: CognitiveCourseRef,
  profile?: Record<string, any> | null,
): CognitiveStudentProfile | null => {
  const id = parseSafeNumber(
    raw.studentId
      ?? raw.student_id
      ?? raw.userId
      ?? raw.user_id
      ?? raw.usuario_id
      ?? raw.usuarios?.id
      ?? raw.users?.id
  )
  if (!id) return null

  const normalizedGrade = normalizeTaskGradeToTen(raw.grade ?? raw.calificacion ?? raw.score ?? raw.averageGrade)
  const grade = normalizedGrade ?? 7
  const accuracy = Math.round(grade * 10)
  const totalQuestions = 10
  const totalCorrect = Math.round((accuracy / 100) * totalQuestions)
  const totalIncorrect = Math.max(0, totalQuestions - totalCorrect)
  const timestamp = parseCognitiveTimestamp(
    raw.submissionDate,
    raw.submission_date,
    raw.createdAt,
    raw.created_at,
    raw.updatedAt,
    raw.updated_at,
  )
  const activityDate = timestamp > 0 ? new Date(timestamp).toISOString() : new Date().toISOString()
  const persona = profile?.persona && typeof profile.persona === 'object' ? profile.persona : null
  const firstName = String(raw.studentFirstName ?? persona?.nombres ?? '')
  const lastName = String(raw.studentLastName ?? persona?.apellidos ?? '')
  const profileFullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const rawFullName = String(raw.studentFullName ?? raw.fullName ?? raw.full_name ?? '').trim()
  const username = String(raw.studentUsername ?? raw.username ?? raw.usuarios?.username ?? raw.users?.username ?? profile?.username ?? `estudiante_${id}`)

  return {
    id,
    username,
    email: typeof raw.studentEmail === 'string'
      ? raw.studentEmail
      : typeof profile?.email === 'string'
        ? profile.email
        : null,
    avatar: typeof raw.studentAvatar === 'string'
      ? raw.studentAvatar
      : typeof raw.avatar === 'string'
        ? raw.avatar
        : typeof raw.usuarios?.avatar === 'string'
          ? raw.usuarios.avatar
          : typeof raw.users?.avatar === 'string'
            ? raw.users.avatar
            : typeof profile?.avatar === 'string'
              ? profile.avatar
              : null,
    fullName: rawFullName || profileFullName || username || `Estudiante #${id}`,
    firstName,
    lastName,
    performance: {
      accuracy,
      avgGrade: Math.round(grade * 10) / 10,
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalSessions: 1,
      totalDuration: 0,
      avgTimePerQuestion: 0,
    },
    cognitiveInsights: {
      skillLevel: 'developing',
      skillColor: '#0A84FF',
      trend: 'stable',
      improvementRate: 0,
      consistency: normalizedGrade === null ? 70 : 100,
      engagementLevel: 'medium',
      preferredStudyHour: timestamp > 0 ? new Date(timestamp).getHours() : null,
      difficultyStats: {},
      errorRate: totalQuestions > 0 ? Math.round((totalIncorrect / totalQuestions) * 100) : 0,
      preferredDifficulty: 'tarea general',
      fatigueRiskScore: 10,
      fatigueLevel: 'low',
      performanceStatus: 'steady',
      recommendedAction: normalizedGrade === null
        ? 'Actividad registrada por entrega de tarea: esperar calificacion para afinar precision, errores y riesgo.'
        : undefined,
    },
    lastActivity: activityDate,
    daysSinceLastActivity: timestamp > 0 ? Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000)) : 0,
    recentHistory: [{
      date: activityDate,
      grade,
      accuracy,
      questions: totalQuestions,
    }],
    firstSession: activityDate,
    courses: [course],
    coursePerformance: (() => {
      const map = new Map<number, CoursePerformanceData>()
      const daysSince = timestamp > 0 ? Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000)) : 0
      map.set(course.id, {
        courseId: course.id,
        courseTitle: course.title,
        tasksSubmitted: 1,
        tasksGraded: normalizedGrade !== null ? 1 : 0,
        avgGrade: Math.round(grade * 10) / 10,
        accuracy,
        lastActivity: activityDate,
        daysSinceActivity: daysSince,
        dominance: calculateCourseDominance(accuracy, normalizedGrade !== null ? 1 : 0, grade),
        history: [{
          date: activityDate,
          grade,
          accuracy,
          questions: totalQuestions,
        }],
      })
      return map
    })(),
  }
}

const getCognitiveSkillMeta = (accuracy: number) => {
  if (accuracy >= 85) return { skillLevel: 'advanced', skillColor: '#30D158' }
  if (accuracy >= 70) return { skillLevel: 'intermediate', skillColor: '#0A84FF' }
  if (accuracy >= 50) return { skillLevel: 'developing', skillColor: '#FF9F0A' }
  return { skillLevel: 'beginner', skillColor: '#FF453A' }
}

const buildCognitiveRecommendationText = (
  status: CognitivePerformanceStatus,
  fatigueLevel: 'high' | 'medium' | 'low',
  preferredHour: number | null,
  preferredDifficulty: string | null | undefined,
  avgTimePerQuestion: number,
  errorRate: number,
) => {
  const hourText = preferredHour !== null ? `${String(preferredHour).padStart(2, '0')}:00` : 'su horario de mayor actividad'
  const difficultyText = preferredDifficulty ? preferredDifficulty.toLowerCase() : 'su nivel actual'

  if (status === 'strong') return `Va bien: mantener retos ${difficultyText} cerca de ${hourText} y subir complejidad de forma gradual.`
  if (fatigueLevel === 'high') return `Riesgo de fatiga: dividir sesiones, bajar carga textual y reforzar con ejemplos visuales cerca de ${hourText}.`
  if (errorRate >= 45) return 'Necesita apoyo: revisar patrones de error antes de aumentar dificultad y usar retroalimentacion paso a paso.'
  if (avgTimePerQuestion >= 75) return 'Respuesta lenta: priorizar ejercicios cortos, pistas tempranas y pausas entre bloques.'
  return `En progreso: mantener practica guiada en ${difficultyText} y observar la proxima tendencia.`
}

const deriveCognitiveInsights = (
  performance: CognitivePerformance,
  history: CognitiveHistoryPoint[],
  base: CognitiveInsights,
): CognitiveInsights => {
  const accuracy = performance.accuracy
  const errorRate = performance.totalQuestions > 0
    ? Math.round((performance.totalIncorrect / performance.totalQuestions) * 100)
    : (base.errorRate ?? 0)
  const grades = history.map(point => point.grade).filter(grade => Number.isFinite(grade))

  let consistency = base.consistency || 100
  if (grades.length >= 3) {
    const mean = grades.reduce((acc, grade) => acc + grade, 0) / grades.length
    const variance = grades.reduce((acc, grade) => acc + Math.pow(grade - mean, 2), 0) / grades.length
    consistency = Math.max(0, Math.round(100 - Math.sqrt(variance) * 8))
  }

  let trend = base.trend || 'stable'
  let improvementRate = base.improvementRate || 0
  if (grades.length >= 6) {
    const recent = grades.slice(-5)
    const previous = grades.slice(-10, -5)
    const recentAvg = recent.reduce((acc, grade) => acc + grade, 0) / recent.length
    const previousAvg = previous.reduce((acc, grade) => acc + grade, 0) / previous.length
    improvementRate = Math.round((recentAvg - previousAvg) * 10) / 10
    trend = improvementRate > 0.5 ? 'improving' : improvementRate < -0.5 ? 'declining' : 'stable'
  }

  const avgTime = performance.avgTimePerQuestion
  const fatigueRiskScore = Math.min(100, Math.round(
    (base.fatigueRiskScore ?? 0) * 0.35 +
    (avgTime > 75 ? 30 : avgTime > 45 ? 18 : 6) +
    (trend === 'declining' ? 22 : trend === 'stable' ? 8 : 0) +
    (errorRate > 45 ? 18 : errorRate > 30 ? 9 : 0)
  ))
  const fatigueLevel = fatigueRiskScore >= 68 ? 'high' : fatigueRiskScore >= 38 ? 'medium' : 'low'
  const status: CognitivePerformanceStatus = accuracy >= 80 && performance.avgGrade >= 8 && trend !== 'declining'
    ? 'strong'
    : accuracy < 60 || performance.avgGrade < 6 || trend === 'declining'
      ? 'needs_support'
      : 'steady'

  return {
    ...base,
    ...getCognitiveSkillMeta(accuracy),
    trend,
    improvementRate,
    consistency,
    errorRate,
    fatigueRiskScore,
    fatigueLevel,
    performanceStatus: status,
    recommendedAction: buildCognitiveRecommendationText(
      status,
      fatigueLevel,
      base.preferredStudyHour,
      base.preferredDifficulty,
      avgTime,
      errorRate,
    ),
  }
}

const mergeCoursePerformance = (
  existing: Map<number, CoursePerformanceData>,
  incoming: Map<number, CoursePerformanceData>
): Map<number, CoursePerformanceData> => {
  const merged = new Map(existing)
  for (const [courseId, incomingData] of incoming) {
    const existingData = merged.get(courseId)
    if (!existingData) {
      merged.set(courseId, { ...incomingData, history: [...incomingData.history] })
      continue
    }
    const tasksSubmitted = existingData.tasksSubmitted + incomingData.tasksSubmitted
    const tasksGraded = existingData.tasksGraded + incomingData.tasksGraded
    const avgGrade = tasksGraded > 0
      ? ((existingData.avgGrade * existingData.tasksGraded) + (incomingData.avgGrade * incomingData.tasksGraded)) / tasksGraded
      : Math.max(existingData.avgGrade, incomingData.avgGrade)
    const accuracy = tasksGraded > 0
      ? ((existingData.accuracy * existingData.tasksGraded) + (incomingData.accuracy * incomingData.tasksGraded)) / tasksGraded
      : Math.max(existingData.accuracy, incomingData.accuracy)
    const history = [...existingData.history, ...incomingData.history]
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
      .slice(-10)
    const existingTime = Date.parse(existingData.lastActivity || '')
    const incomingTime = Date.parse(incomingData.lastActivity || '')
    const lastActivity = incomingTime > existingTime ? incomingData.lastActivity : existingData.lastActivity
    const daysSinceActivity = lastActivity ? Math.max(0, Math.floor((Date.now() - Date.parse(lastActivity)) / 86_400_000)) : 0

    merged.set(courseId, {
      courseId,
      courseTitle: existingData.courseTitle || incomingData.courseTitle,
      tasksSubmitted,
      tasksGraded,
      avgGrade: Math.round(avgGrade * 10) / 10,
      accuracy: Math.round(accuracy),
      lastActivity,
      daysSinceActivity,
      dominance: calculateCourseDominance(accuracy, tasksGraded, avgGrade),
      history,
    })
  }
  return merged
}

const mergeCognitiveStudents = (items: CognitiveStudentProfile[]): CognitiveStudentProfile[] => {
  const byUser = new Map<number, CognitiveStudentProfile>()

  for (const item of items) {
    if (!item.id) continue
    const existing = byUser.get(item.id)
    if (!existing) {
      byUser.set(item.id, {
        ...item,
        courses: [...item.courses],
        recentHistory: [...item.recentHistory].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).slice(-10),
        coursePerformance: new Map(item.coursePerformance),
      })
      continue
    }

    const existingPerf = existing.performance
    const nextPerf = item.performance
    const totalSessions = existingPerf.totalSessions + nextPerf.totalSessions
    const totalQuestions = existingPerf.totalQuestions + nextPerf.totalQuestions
    const totalCorrect = existingPerf.totalCorrect + nextPerf.totalCorrect
    const totalIncorrect = existingPerf.totalIncorrect + nextPerf.totalIncorrect
    const totalDuration = existingPerf.totalDuration + nextPerf.totalDuration
    const avgGrade = totalSessions > 0
      ? ((existingPerf.avgGrade * existingPerf.totalSessions) + (nextPerf.avgGrade * nextPerf.totalSessions)) / totalSessions
      : Math.max(existingPerf.avgGrade, nextPerf.avgGrade)
    const history = [...existing.recentHistory, ...item.recentHistory]
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
      .slice(-10)
    const itemLastActivityTime = Date.parse(item.lastActivity || '')
    const existingLastActivityTime = Date.parse(existing.lastActivity || '')
    const lastActivity = item.lastActivity && (!existing.lastActivity || itemLastActivityTime > existingLastActivityTime)
      ? item.lastActivity
      : existing.lastActivity
    const itemFirstSessionTime = Date.parse(item.firstSession || '')
    const existingFirstSessionTime = Date.parse(existing.firstSession || '')
    const firstSession = item.firstSession && (!existing.firstSession || itemFirstSessionTime < existingFirstSessionTime)
      ? item.firstSession
      : existing.firstSession

    const courseMap = new Map<number, CognitiveCourseRef>()
    ;[...existing.courses, ...item.courses].forEach(course => courseMap.set(course.id, course))

    const performance: CognitivePerformance = {
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : Math.max(existingPerf.accuracy, nextPerf.accuracy),
      avgGrade: Math.round(avgGrade * 10) / 10,
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalSessions,
      totalDuration,
      avgTimePerQuestion: totalQuestions > 0 ? Math.round(totalDuration / totalQuestions) : Math.max(existingPerf.avgTimePerQuestion, nextPerf.avgTimePerQuestion),
    }

    existing.performance = performance
    existing.recentHistory = history
    existing.lastActivity = lastActivity
    existing.firstSession = firstSession
    existing.daysSinceLastActivity = lastActivity ? Math.max(0, Math.floor((Date.now() - Date.parse(lastActivity)) / 86_400_000)) : existing.daysSinceLastActivity
    existing.courses = [...courseMap.values()]
    existing.cognitiveInsights = deriveCognitiveInsights(performance, history, existing.cognitiveInsights)
    existing.coursePerformance = mergeCoursePerformance(existing.coursePerformance, item.coursePerformance)
  }

  return [...byUser.values()].map(student => ({
    ...student,
    cognitiveInsights: deriveCognitiveInsights(student.performance, student.recentHistory, student.cognitiveInsights),
  }))
}

const getCognitiveSubmissionStudentId = (raw: Record<string, any>): number => parseSafeNumber(
  raw.studentId
    ?? raw.student_id
    ?? raw.userId
    ?? raw.user_id
    ?? raw.usuario_id
    ?? raw.usuarios?.id
    ?? raw.users?.id
)

const loadCognitiveData = async () => {
  cognitiveLoading.value = true
  cognitiveLoadError.value = ''
  try {
    if (!canViewCognitive.value) {
      cognitiveStudents.value = []
      cognitiveCourseOptions.value = []
      return
    }

    const userId = authStore.user?.id
    if (!userId) {
      cognitiveStudents.value = []
      return
    }

    let courses = await loadManageableCourses(userId)
    if (hasTeacherRole.value && !hasCognitiveAdminRole.value) {
      const accessCourseIds = new Set(cognitiveAccessCourses.value.map(course => course.id))
      courses = courses.filter((course: any) => accessCourseIds.has(parseSafeNumber(course.id)))
      if (courses.length === 0) {
        courses = cognitiveAccessCourses.value
      }
    }
    if (courses.length === 0 && hasAdminRole.value) {
      courses = await courseAdapter.getCourses(1, 300).catch(() => [])
    }

    const normalizedCourses = courses
      .map((course: any) => normalizeCognitiveCourse(course))
      .filter(course => course.id > 0)

    cognitiveCourseOptions.value = normalizedCourses

    const settled = await Promise.allSettled(
      normalizedCourses.map(async (course) => {
        const [analyticsResponse, submissionRows] = await Promise.all([
          reinforcementAdapter.getCognitiveAnalytics(course.id, {
            limit: 120,
            sortBy: 'recent_activity',
          }).catch((error) => {
            console.warn('Error loading cognitive reinforcement analytics:', course.id, error)
            return { students: [] }
          }),
          submissionAdapter.getSubmissionByCourse(course.id).catch((error) => {
            console.warn('Error loading cognitive task submissions:', course.id, error)
            return []
          }),
        ])
        const students = Array.isArray((analyticsResponse as any)?.students) ? (analyticsResponse as any).students : []
        const submissions = Array.isArray(submissionRows) ? submissionRows : []
        return {
          course,
          reinforcementStudents: students.map((student: Record<string, any>) => normalizeCognitiveStudent(student, course)),
          submissions: submissions.map((submission: any) => ({ course, submission: submission as Record<string, any> })),
        }
      })
    )

    const courseResults = settled.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
    const reinforcementItems = courseResults.flatMap(result => result.reinforcementStudents)
    const submissionRefs = courseResults.flatMap(result => result.submissions)

    const submissionStudentIds = [...new Set(
      submissionRefs
        .map(({ submission }) => getCognitiveSubmissionStudentId(submission))
        .filter(id => id > 0)
    )]
    const profileRows = submissionStudentIds.length > 0
      ? await userAdapter.getUsersByIds(submissionStudentIds).catch(() => [])
      : []
    const profilesById = new Map<number, Record<string, any>>()
    if (Array.isArray(profileRows)) {
      for (const profile of profileRows) {
        const profileId = parseSafeNumber((profile as any)?.id ?? (profile as any)?.userId ?? (profile as any)?.user_id)
        if (profileId > 0) profilesById.set(profileId, profile as Record<string, any>)
      }
    }

    const submissionItems = submissionRefs
      .map(({ course, submission }) => normalizeTaskSubmissionStudent(
        submission,
        course,
        profilesById.get(getCognitiveSubmissionStudentId(submission)),
      ))
      .filter((student): student is CognitiveStudentProfile => Boolean(student))

    cognitiveStudents.value = mergeCognitiveStudents([...reinforcementItems, ...submissionItems])
    selectedCognitiveStudentId.value = null
  } catch (error: any) {
    console.error('Error loading cognitive analytics:', error)
    cognitiveStudents.value = []
    cognitiveLoadError.value = error?.message || 'No fue posible leer los refuerzos y entregas de tareas.'
  } finally {
    cognitiveLoading.value = false
  }
}

const cognitiveStudentsForCourse = computed(() => {
  if (cognitiveCourseFilter.value === 'all') return cognitiveStudents.value
  const courseId = Number(cognitiveCourseFilter.value)
  return cognitiveStudents.value.filter(student => student.courses.some(course => course.id === courseId))
})

const filteredCognitiveStudents = computed(() => {
  const query = normalizeSearchText(cognitiveSearch.value)
  const filtered = cognitiveStudentsForCourse.value.filter(student => {
    if (!query) return true
    return matchesFlexibleUserSearch(
      query,
      student.fullName,
      student.username,
      student.email,
      student.courses.map(course => course.title).join(' '),
    )
  })

  return [...filtered].sort((left, right) => {
    if (cognitiveSortBy.value === 'performance') return right.performance.accuracy - left.performance.accuracy
    if (cognitiveSortBy.value === 'sessions') return right.performance.totalSessions - left.performance.totalSessions
    if (cognitiveSortBy.value === 'improvement') return right.cognitiveInsights.improvementRate - left.cognitiveInsights.improvementRate
    if (cognitiveSortBy.value === 'fatigue') return (right.cognitiveInsights.fatigueRiskScore ?? 0) - (left.cognitiveInsights.fatigueRiskScore ?? 0)
    return Date.parse(right.lastActivity || '') - Date.parse(left.lastActivity || '')
  })
})

const selectedCognitiveStudent = computed(() =>
  filteredCognitiveStudents.value.find(student => student.id === selectedCognitiveStudentId.value)
  || filteredCognitiveStudents.value[0]
  || null
)

const cognitiveTotalStudents = computed(() => filteredCognitiveStudents.value.length)
const cognitiveTotalSessions = computed(() => filteredCognitiveStudents.value.reduce((acc, student) => acc + student.performance.totalSessions, 0))
const cognitiveAverageAccuracy = computed(() => {
  if (filteredCognitiveStudents.value.length === 0) return 0
  const totalQuestions = filteredCognitiveStudents.value.reduce((acc, student) => acc + student.performance.totalQuestions, 0)
  const totalCorrect = filteredCognitiveStudents.value.reduce((acc, student) => acc + student.performance.totalCorrect, 0)
  return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
})
const cognitiveAverageGrade = computed(() => {
  if (filteredCognitiveStudents.value.length === 0) return '0.0'
  const totalSessions = filteredCognitiveStudents.value.reduce((acc, student) => acc + student.performance.totalSessions, 0)
  const weighted = filteredCognitiveStudents.value.reduce((acc, student) => acc + (student.performance.avgGrade * student.performance.totalSessions), 0)
  return (totalSessions > 0 ? weighted / totalSessions : 0).toFixed(1)
})
const cognitiveStrongStudents = computed(() => filteredCognitiveStudents.value.filter(student => getCognitivePerformanceStatus(student) === 'strong').length)
const cognitiveStudentsNeedingSupport = computed(() => filteredCognitiveStudents.value.filter(student => getCognitivePerformanceStatus(student) === 'needs_support').length)

const getCognitivePerformanceStatus = (student: CognitiveStudentProfile): CognitivePerformanceStatus => {
  if (student.cognitiveInsights.performanceStatus) return student.cognitiveInsights.performanceStatus
  if (student.performance.accuracy >= 80 && student.performance.avgGrade >= 8 && student.cognitiveInsights.trend !== 'declining') return 'strong'
  if (student.performance.accuracy < 60 || student.performance.avgGrade < 6 || student.cognitiveInsights.trend === 'declining') return 'needs_support'
  return 'steady'
}

const getCognitiveStatusLabel = (student: CognitiveStudentProfile) => {
  const status = getCognitivePerformanceStatus(student)
  if (status === 'strong') return 'Va bien'
  if (status === 'needs_support') return 'Necesita apoyo'
  return 'En observacion'
}

const getCognitiveStatusClass = (student: CognitiveStudentProfile) => `status-${getCognitivePerformanceStatus(student)}`

const selectCognitiveStudent = (studentId: number) => {
  selectedCognitiveStudentId.value = studentId
}

const getCognitiveHistoryHeight = (accuracy: number) => `${Math.max(12, Math.min(100, Math.round(accuracy)))}%`

const formatCognitiveDuration = (seconds: number) => {
  const safe = Math.max(0, Math.round(seconds || 0))
  if (safe < 60) return `${safe}s`
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`
}

const formatCognitiveHour = (hour: number | null | undefined) => {
  if (!Number.isInteger(hour)) return 'Sin patron'
  return `${String(hour).padStart(2, '0')}:00`
}

const getCognitiveRecommendation = (student: CognitiveStudentProfile) =>
  student.cognitiveInsights.recommendedAction
  || buildCognitiveRecommendationText(
    getCognitivePerformanceStatus(student),
    student.cognitiveInsights.fatigueLevel || 'low',
    student.cognitiveInsights.preferredStudyHour,
    student.cognitiveInsights.preferredDifficulty,
    student.performance.avgTimePerQuestion,
    student.cognitiveInsights.errorRate ?? 0,
  )

// ─── Knowledge Graph + Curva del Olvido de Ebbinghaus ─────────────────────
type KnowledgeStatus = 'mastered' | 'progress' | 'forgetting' | 'unseen'
type PredictionUrgency = 'high' | 'medium' | 'low'

interface KnowledgePrediction {
  days: number
  urgency: PredictionUrgency
  retention: number
}

interface KnowledgeNode {
  id: string
  name: string
  abbrev: string
  shortName: string
  level: string
  x: number
  y: number
  size: number
  labelOffsetX: number
  labelOffsetY: number
  labelWidth: number
  status: KnowledgeStatus
  retention: number
  lastPractice: string | null
  practiceCount: number
  prediction: KnowledgePrediction | null
  dominance?: 'mastered' | 'progress' | 'developing' | 'needs_support'
  dominanceLabel?: string
  courseAccuracy?: number
  courseGrade?: number
}

interface KnowledgeConnection {
  from: string
  to: string
  path: string
  active: boolean
  strength: number
}

const selectedKnowledgeNodeId = ref<string | null>(null)
const hoveredKnowledgeNodeId = ref<string | null>(null)

/**
 * Curva del Olvido de Ebbinghaus: R = e^(-t/S)
 * R = retención (0-100%)
 * t = tiempo desde última práctica (días)
 * S = fuerza de la memoria (aumenta con repeticiones)
 */
const calculateEbbinghausRetention = (daysSinceLastPractice: number, practiceCount: number): number => {
  // S aumenta con cada práctica (memoria más fuerte)
  const memoryStrength = 1 + (practiceCount * 0.5)
  const retention = Math.exp(-daysSinceLastPractice / memoryStrength) * 100
  return Math.round(Math.max(0, Math.min(100, retention)))
}

const predictForgettingDate = (currentRetention: number, practiceCount: number): KnowledgePrediction | null => {
  if (currentRetention >= 80) return null // No necesita predicción si retiene bien

  const memoryStrength = 1 + (practiceCount * 0.5)
  // Días hasta caer al 50% de retención
  const targetRetention = 50
  const daysToForget = Math.round(-memoryStrength * Math.log(targetRetention / 100))

  // Calcular días restantes basado en retención actual
  const currentDays = -memoryStrength * Math.log(currentRetention / 100)
  const remainingDays = Math.max(1, Math.round(daysToForget - currentDays))

  let urgency: PredictionUrgency = 'low'
  if (remainingDays <= 2) urgency = 'high'
  else if (remainingDays <= 5) urgency = 'medium'

  return { days: remainingDays, urgency, retention: targetRetention }
}

const getKnowledgeStatus = (retention: number, daysSinceLastPractice: number, hasPracticed: boolean): KnowledgeStatus => {
  void daysSinceLastPractice
  if (!hasPracticed) return 'unseen'
  if (retention >= 80) return 'mastered'
  if (retention >= 50) return 'progress'
  return 'forgetting'
}

const clampKnowledgeValue = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const getStableKnowledgeSeed = (value: string | number): number => {
  const source = String(value || 'coursev')
  let hash = 0
  for (let i = 0; i < source.length; i += 1) {
    hash = ((hash << 5) - hash) + source.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const compactKnowledgeName = (value: string, fallback = 'Nodo'): string => {
  const clean = String(value || fallback).replace(/\s+/g, ' ').trim()
  if (!clean) return fallback
  const words = clean.split(' ').filter(Boolean)
  const compact = words.length <= 2 ? clean : words.slice(0, 2).join(' ')
  return compact.length > 18 ? `${compact.slice(0, 15)}...` : compact
}

const knowledgeGraphNodes = computed((): KnowledgeNode[] => {
  const student = selectedCognitiveStudent.value
  if (!student) return []

  // Generar nodos basados en los cursos y el rendimiento del estudiante
  const courses = student.courses
  const baseNodes: KnowledgeNode[] = []

  // Posiciones predefinidas con margen amplio para nodos, halos y etiquetas.
  // viewBox expandido a 900x500 para mejor visualización
  const centerX = 410
  const centerY = 270
  const positions = [
    { x: 420, y: 92, labelOffsetX: -125, labelOffsetY: 62, labelWidth: 154 },
    { x: 640, y: 160, labelOffsetX: 124, labelOffsetY: 0, labelWidth: 158 },
    { x: 668, y: 286, labelOffsetX: 118, labelOffsetY: 0, labelWidth: 160 },
    { x: 640, y: 398, labelOffsetX: 124, labelOffsetY: 0, labelWidth: 162 },
  ]

  // Nodo central: rendimiento general
  const accuracy = student.performance.accuracy
  const sessions = student.performance.totalSessions
  const daysSinceLast = student.daysSinceLastActivity || 0
  const overallRetention = calculateEbbinghausRetention(daysSinceLast, sessions)
  const overallStatus = getKnowledgeStatus(overallRetention, daysSinceLast, sessions > 0)

  baseNodes.push({
    id: 'overall',
    name: 'Rendimiento General',
    abbrev: 'RG',
    shortName: 'Rendimiento',
    level: 'General',
    x: centerX,
    y: centerY,
    size: 58,
    labelOffsetX: 0,
    labelOffsetY: 124,
    labelWidth: 168,
    status: overallStatus,
    retention: overallRetention,
    lastPractice: student.lastActivity,
    practiceCount: sessions,
    prediction: overallStatus === 'forgetting' || overallStatus === 'progress'
      ? predictForgettingDate(overallRetention, sessions)
      : null,
  })

  // Generar nodos para cada curso usando datos reales de coursePerformance
  courses.slice(0, positions.length).forEach((course, idx) => {
    const pos = positions[idx] || positions[idx % positions.length]
    const courseData = student.coursePerformance.get(course.id)

    // Usar datos reales si existen, o fallback a cálculo estimado
    const courseAccuracy = courseData?.accuracy ?? accuracy
    const courseTasks = courseData?.tasksSubmitted ?? Math.max(1, Math.round(sessions / Math.max(1, courses.length)))
    const courseGrade = courseData?.avgGrade ?? (accuracy / 10)
    const courseDays = courseData?.daysSinceActivity ?? daysSinceLast
    const courseDominance = courseData?.dominance ?? 'progress'

    const courseRetention = calculateEbbinghausRetention(courseDays, courseTasks)
    const courseStatus = getKnowledgeStatus(courseRetention, courseDays, courseTasks > 0)

    // Convertir dominancia a etiqueta visual
    const dominanceLabels: Record<string, string> = {
      mastered: 'Dominado',
      progress: 'En progreso',
      developing: 'Desarrollando',
      needs_support: 'Necesita apoyo',
    }

    baseNodes.push({
      id: `course-${course.id}`,
      name: course.title,
      abbrev: course.title.slice(0, 2).toUpperCase(),
      shortName: compactKnowledgeName(course.title, `Curso ${idx + 1}`),
      level: `${courseTasks} tareas · ${courseGrade.toFixed(1)} nota`,
      x: pos.x,
      y: pos.y,
      size: idx === 0 ? 36 : 34,
      labelOffsetX: pos.labelOffsetX,
      labelOffsetY: pos.labelOffsetY,
      labelWidth: pos.labelWidth,
      status: courseStatus,
      retention: courseRetention,
      lastPractice: courseData?.lastActivity ?? student.lastActivity,
      practiceCount: courseTasks,
      prediction: courseStatus === 'forgetting' || courseStatus === 'progress'
        ? predictForgettingDate(courseRetention, courseTasks)
        : null,
      dominance: courseDominance,
      dominanceLabel: dominanceLabels[courseDominance] || 'En progreso',
      courseAccuracy,
      courseGrade,
    })
  })

  return baseNodes
})

const knowledgeGraphConnections = computed((): KnowledgeConnection[] => {
  const nodes = knowledgeGraphNodes.value
  if (nodes.length < 2) return []

  const connections: KnowledgeConnection[] = []
  const centerNode = nodes.find(n => n.id === 'overall')
  if (!centerNode) return []

  // Conectar nodos periféricos al centro
  nodes.filter(n => n.id !== 'overall').forEach(node => {
    const dx = node.x - centerNode.x
    const dy = node.y - centerNode.y
    const controlX = centerNode.x + dx * 0.58
    const controlY = centerNode.y + dy * 0.42

    connections.push({
      from: centerNode.id,
      to: node.id,
      path: `M ${centerNode.x} ${centerNode.y} Q ${Math.round(controlX)} ${Math.round(controlY)} ${node.x} ${node.y}`,
      active: node.status !== 'unseen',
      strength: Math.max(0.25, node.retention / 100),
    })
  })

  // Algunas conexiones entre nodos periféricos (dependencias)
  return connections
})

const selectedKnowledgeNode = computed((): KnowledgeNode | null => {
  const nodes = knowledgeGraphNodes.value
  if (selectedKnowledgeNodeId.value) {
    return nodes.find(n => n.id === selectedKnowledgeNodeId.value) || nodes[0] || null
  }
  return nodes[0] || null
})

const selectKnowledgeNode = (node: KnowledgeNode) => {
  selectedKnowledgeNodeId.value = node.id
}

const activeKnowledgeNodeId = computed(() => hoveredKnowledgeNodeId.value || selectedKnowledgeNode.value?.id || 'overall')

const isKnowledgeConnectionHighlighted = (connection: KnowledgeConnection): boolean => {
  const activeId = activeKnowledgeNodeId.value
  if (!activeId || activeId === 'overall') return connection.active
  return connection.from === activeId || connection.to === activeId
}

const isKnowledgeNodeDimmed = (node: KnowledgeNode): boolean => {
  const activeId = activeKnowledgeNodeId.value
  if (!activeId || activeId === 'overall') return false
  if (node.id === activeId) return false
  return !knowledgeGraphConnections.value.some(conn =>
    (conn.from === activeId && conn.to === node.id) || (conn.to === activeId && conn.from === node.id)
  )
}

const getKnowledgeStatusLabel = (status: KnowledgeStatus): string => {
  const labels: Record<KnowledgeStatus, string> = {
    mastered: 'Domina',
    progress: 'En progreso',
    forgetting: 'Olvidando',
    unseen: 'No visto',
  }
  return labels[status] || 'Desconocido'
}

const getDominanceLabel = (dominance: CoursePerformanceData['dominance']): string => {
  const labels: Record<CoursePerformanceData['dominance'], string> = {
    mastered: 'Dominado',
    progress: 'En progreso',
    developing: 'Desarrollando',
    needs_support: 'Necesita apoyo',
  }
  return labels[dominance] || 'Sin datos'
}

const knowledgeStatusOrder: KnowledgeStatus[] = ['mastered', 'progress', 'forgetting', 'unseen']

const knowledgeStatusMeta: Record<KnowledgeStatus, { label: string; shortLabel: string; color: string; soft: string }> = {
  mastered: { label: 'Dominados', shortLabel: 'Domina', color: '#30D158', soft: 'rgba(48, 209, 88, 0.14)' },
  progress: { label: 'En progreso', shortLabel: 'Progreso', color: '#0A84FF', soft: 'rgba(10, 132, 255, 0.14)' },
  forgetting: { label: 'Riesgo de olvido', shortLabel: 'Riesgo', color: '#FF9F0A', soft: 'rgba(255, 159, 10, 0.16)' },
  unseen: { label: 'Sin practica', shortLabel: 'Nuevo', color: '#8E8E93', soft: 'rgba(142, 142, 147, 0.13)' },
}

const getKnowledgeNodeColor = (status: KnowledgeStatus): string => knowledgeStatusMeta[status]?.color || '#8E8E93'

const formatKnowledgeDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Nunca'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'Desconocido'
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const getRetentionCurvePath = (node: KnowledgeNode): string => {
  const memoryStrength = 1 + (node.practiceCount * 0.5)
  const points: string[] = []
  const width = 240
  const height = 75

  for (let day = 0; day <= 7; day++) {
    const retention = Math.exp(-day / memoryStrength) * 100
    const x = (day / 7) * width
    const y = height - (retention / 100) * (height - 5)
    points.push(`${day === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }

  return points.join(' ')
}

const getRetentionAreaPath = (node: KnowledgeNode): string => {
  const linePath = getRetentionCurvePath(node)
  return `${linePath} L 240 80 L 0 80 Z`
}

const getRetentionCurveX = (node: KnowledgeNode): number => {
  const daysSince = node.lastPractice
    ? Math.floor((Date.now() - new Date(node.lastPractice).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  return Math.min(240, (daysSince / 7) * 240)
}

const getRetentionCurveY = (node: KnowledgeNode): number => {
  const height = 75
  return height - (node.retention / 100) * (height - 5)
}

const knowledgeReviewRecommendation = computed((): string | null => {
  const nodes = knowledgeGraphNodes.value.filter(n => n.id !== 'overall')
  const forgettingNodes = nodes.filter(n => n.status === 'forgetting')
  const urgentNodes = nodes.filter(n => n.prediction?.urgency === 'high')

  if (urgentNodes.length > 0) {
    return `Repaso urgente: ${urgentNodes.map(n => n.name).join(', ')} perderán retención en menos de 2 días.`
  }

  if (forgettingNodes.length > 0) {
    return `Se recomienda repasar: ${forgettingNodes.map(n => n.name).join(', ')} para evitar el olvido.`
  }

  const progressNodes = nodes.filter(n => n.status === 'progress' && n.prediction)
  if (progressNodes.length > 0) {
    const avgDays = Math.round(progressNodes.reduce((sum, n) => sum + (n.prediction?.days || 0), 0) / progressNodes.length)
    return `Mantén el ritmo: practica en los próximos ${avgDays} días para consolidar ${progressNodes.length} tema${progressNodes.length > 1 ? 's' : ''}.`
  }

  return null
})

// ─── Knowledge Graph: Funciones de utilidad adicionales ─────────────────
const knowledgeSummary = computed(() => {
  const nodes = knowledgeGraphNodes.value.filter(n => n.id !== 'overall')
  const total = Math.max(1, nodes.length)

  const mastered = nodes.filter(n => n.status === 'mastered').length
  const progress = nodes.filter(n => n.status === 'progress').length
  const forgetting = nodes.filter(n => n.status === 'forgetting').length
  const unseen = nodes.filter(n => n.status === 'unseen').length

  const avgRetention = nodes.length > 0
    ? Math.round(nodes.reduce((sum, n) => sum + n.retention, 0) / nodes.length)
    : 0

  return {
    mastered,
    progress,
    forgetting,
    unseen,
    total,
    masteredPct: Math.round((mastered / total) * 100),
    progressPct: Math.round((progress / total) * 100),
    forgettingPct: Math.round((forgetting / total) * 100),
    unseenPct: Math.round((unseen / total) * 100),
    avgRetention,
  }
})

interface KnowledgeRetentionChartPoint {
  day: string
  retention: number
  umbral: number
}

const knowledgeRetentionChartData = computed<KnowledgeRetentionChartPoint[]>(() => {
  const node = selectedKnowledgeNode.value
  if (!node) return []
  const memoryStrength = 1 + (node.practiceCount * 0.5)
  const days = [0, 1, 2, 3, 5, 7, 10]
  return days.map(day => ({
    day: day === 0 ? 'Hoy' : `+${day}d`,
    retention: Math.round(clampKnowledgeValue(node.retention * Math.exp(-day / memoryStrength))),
    umbral: 50,
  }))
})

const knowledgeRetentionCategories: Record<string, BulletLegendItemInterface> = {
  retention: { name: 'Retencion', color: '#0A84FF' },
  umbral: { name: 'Umbral', color: '#FF9F0A' },
}

const knowledgeRetentionXFormatter = (tick: number): string => {
  const data = knowledgeRetentionChartData.value
  return typeof tick === 'number' && data[tick]?.day ? data[tick].day : String(tick)
}

const knowledgeStatusChartData = computed(() =>
  knowledgeStatusOrder.map(status => ({
    label: knowledgeStatusMeta[status].shortLabel,
    nodos: knowledgeGraphNodes.value.filter(node => node.id !== 'overall' && node.status === status).length,
  }))
)

const knowledgeStatusCategories: Record<string, BulletLegendItemInterface> = {
  nodos: { name: 'Nodos', color: '#0A84FF' },
}

const knowledgeStatusRows = computed(() => {
  const summary = knowledgeSummary.value
  const pctByStatus: Record<KnowledgeStatus, number> = {
    mastered: summary.masteredPct,
    progress: summary.progressPct,
    forgetting: summary.forgettingPct,
    unseen: summary.unseenPct,
  }
  return knowledgeStatusOrder.map(status => ({
    status,
    label: knowledgeStatusMeta[status].label,
    value: knowledgeGraphNodes.value.filter(node => node.id !== 'overall' && node.status === status).length,
    pct: pctByStatus[status],
    color: knowledgeStatusMeta[status].color,
    soft: knowledgeStatusMeta[status].soft,
  }))
})

const knowledgePriorityNodes = computed(() =>
  knowledgeGraphNodes.value
    .filter(node => node.id !== 'overall' && (node.status === 'forgetting' || node.prediction?.urgency === 'high'))
    .sort((left, right) => left.retention - right.retention)
    .slice(0, 3)
)

const getKnowledgeGaugeColor = (status: KnowledgeStatus, stop: number): string => {
  const colors: Record<KnowledgeStatus, [string, string]> = {
    mastered: ['#30D158', '#16A34A'],
    progress: ['#64D2FF', '#0A84FF'],
    forgetting: ['#FFD60A', '#FF9F0A'],
    unseen: ['#AEAEB2', '#636366'],
  }
  return colors[status]?.[stop] || colors.unseen[stop]
}

const getRetentionHealthText = (retention: number): string => {
  if (retention >= 80) return 'Excelente memoria. El conocimiento está consolidado.'
  if (retention >= 60) return 'Buena retención. Se recomienda práctica ocasional.'
  if (retention >= 40) return 'Retención moderada. Aumentar frecuencia de repaso.'
  return 'Retención baja. Se requiere repaso urgente.'
}

const expandedSections = ref({
  courses: true,
  tasks: true,
  submissions: false,
  students: false,
  reinforcement: false,
  subjectProgress: false,
  myProgress: true,
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
  enrollmentStatus: string
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
      enrollmentStatus: item.enrollmentStatus ?? item.enrollment_status ?? 'activo',
    }))
  } catch (e) {
    console.error('Error loading subject progress:', e)
  } finally {
    loadingSubjectProgress.value = false
  }
}

const togglingSpEnrollStatus = ref<Record<string, boolean>>({})

const toggleSpEnrollmentStatus = async (row: SubjectProgressItem) => {
  const newStatus = row.enrollmentStatus === 'activo' ? 'inactivo' : 'activo'
  const key = `${row.userId}-${row.courseId}-${row.subjectId}`
  togglingSpEnrollStatus.value[key] = true
  try {
    await progressAdapter.setSubjectEnrollmentStatus(row.userId, row.courseId, row.subjectId!, newStatus)
    row.enrollmentStatus = newStatus
  } catch (e: any) {
    if (e?.statusCode !== 401) console.error('Error toggling subject enrollment status:', e)
  } finally {
    delete togglingSpEnrollStatus.value[key]
  }
}

// ─── Mi Progreso en Cursos (rol 1) ───────────────────────────────────────
interface MySubjectProgressItem {
  subjectId: number
  subjectName: string
  progressPercentage: number
  averageGrade: number | null
  completedTasks: number
  totalTasks: number
  status: string
}

interface MyCourseProgressItem {
  courseId: number
  courseName: string
  thumbnail: string
  status: string
  progressPercentage: number
  averageGrade: number | null
  completedTasks: number
  totalTasks: number
  subjects: MySubjectProgressItem[]
}

const myCoursesProgress = ref<MyCourseProgressItem[]>([])
const loadingMyCoursesProgress = ref(false)
const expandedCourseProgressIds = ref(new Set<number>())

const toggleCourseProgressExpanded = (courseId: number) => {
  const s = new Set(expandedCourseProgressIds.value)
  if (s.has(courseId)) s.delete(courseId)
  else s.add(courseId)
  expandedCourseProgressIds.value = s
}

const loadMyCoursesProgressData = async () => {
  if (loadingMyCoursesProgress.value) return
  loadingMyCoursesProgress.value = true
  try {
    const myProgress = await progressAdapter.getMyProgress()
    if (!Array.isArray(myProgress) || myProgress.length === 0) {
      myCoursesProgress.value = []
      return
    }
    const items = await Promise.all(
      myProgress.map(async (p: any) => {
        const courseId = Number(p.courseId || p.curso_id) || 0
        if (!courseId) return null
        const [courseRes, subjectProgressRes, subjectsRes] = await Promise.allSettled([
          courseAdapter.getCourseById(courseId).catch(() => null),
          progressAdapter.getSubjectProgress(courseId).catch(() => []),
          subjectAdapter.getSubjectsByCourse(courseId).catch(() => []),
        ])
        const course = courseRes.status === 'fulfilled' ? (courseRes.value as any) : null
        const subjectProgressList: any[] =
          subjectProgressRes.status === 'fulfilled' ? ((subjectProgressRes.value as any[]) ?? []) : []
        const subjectsList: any[] =
          subjectsRes.status === 'fulfilled' ? ((subjectsRes.value as any[]) ?? []) : []

        const subjectMap = new Map<number, string>(
          subjectsList.map((s: any) => [Number(s.id), s.name || s.nombre || ''])
        )

        const subjects: MySubjectProgressItem[] = subjectProgressList.map((sp: any) => {
          const sid = Number(sp.subjectId || sp.materia_id || sp.materiaId) || 0
          return {
            subjectId: sid,
            subjectName:
              sp.subjectName || sp.nombre_materia || subjectMap.get(sid) || `Materia ${sid}`,
            progressPercentage: Math.round(Number(sp.progressPercentage || sp.porcentaje_progreso) || 0),
            averageGrade: sp.averageGrade ?? sp.promedio ?? sp.calificacionPonderada ?? null,
            completedTasks: Number(sp.completedTasks || sp.tareas_completadas) || 0,
            totalTasks: Number(sp.totalTasks || sp.tareas_totales) || 0,
            status: sp.status || sp.estado || '',
          }
        })

        const tt = Number(p.totalTasks || p.tareas_totales) || 0
        const tc = Number(p.completedTasks || p.tareas_completadas) || 0
        return {
          courseId,
          courseName:
            course?.title || course?.nombre || p.courseName || p.curso_nombre || p.course_name || `Curso ${courseId}`,
          thumbnail:
            course?.thumbnail || course?.thumbnailUrl || p.thumbnail || p.course_thumbnail || '',
          status: p.status || p.estado || '',
          progressPercentage: Math.round(
            tt > 0 ? (tc / tt) * 100 : Number(p.progressPercentage || p.porcentaje_progreso) || 0
          ),
          averageGrade: p.averageGrade ?? p.promedio ?? p.calificacionPonderada ?? null,
          completedTasks: tc,
          totalTasks: tt,
          subjects,
        } as MyCourseProgressItem
      })
    )
    myCoursesProgress.value = items.filter((c): c is MyCourseProgressItem => c !== null)
  } catch (e) {
    console.error('Error loading my courses progress:', e)
    myCoursesProgress.value = []
  } finally {
    loadingMyCoursesProgress.value = false
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

// ─── Chart hover state ─────────────────────────────────────────────────
const weeklyHover = ref<number | null>(null)
const monthlyHover = ref<number | null>(null)
const enrollBarHover = ref<number | null>(null)

const weeklyTotal = computed(() => weeklyValues.value.reduce((a, b) => a + b, 0))

const weeklyYAxisLabels = computed(() => {
  const max = weeklyMax.value || 1
  return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0].map(String)
})

const monthlyTotal = computed(() => {
  const vals = monthlyChartRaw.value.values
  return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : 0
})

const monthlyYAxisLabels = computed(() => {
  const vals = monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : new Array(6).fill(0)
  const max = Math.max(...vals, 1)
  const totalMax = Math.round(max * 1.6)
  return [totalMax, Math.round(totalMax * 0.75), Math.round(totalMax * 0.5), Math.round(totalMax * 0.25), 0].map(String)
})

const monthlyStackedBars = computed(() => {
  const labels = monthlyChartRaw.value.labels.length > 0 ? monthlyChartRaw.value.labels : MONTHLY_LABELS_FALLBACK
  const vals = monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : new Array(6).fill(0)
  const max = Math.max(...vals, 1)
  const totalMax = max * 1.6
  return labels.map((label, i) => {
    const completedVal = vals[i] ?? 0
    const activeVal = Math.round(completedVal * 0.6)
    return {
      label,
      completedVal,
      activeVal,
      completedPct: Math.max(2, (completedVal / totalMax) * 100),
      activePct: Math.max(2, (activeVal / totalMax) * 100),
    }
  })
})

const enrollStackedBars = computed(() => {
  const labels = monthlyChartRaw.value.labels.length > 0 ? monthlyChartRaw.value.labels : MONTHLY_LABELS_FALLBACK
  const vals = monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : new Array(6).fill(0)
  const enrolled = creatorMetrics.value.enrolledUsersCount || 0
  const certified = creatorMetrics.value.certifiedUsersCount || 0
  const max = Math.max(...vals, 1)
  return labels.map((label, i) => {
    const ratio = (vals[i] ?? 0) / max
    const enrolledVal = Math.round(enrolled * ratio * 0.3) || 0
    const certifiedVal = Math.round(certified * ratio * 0.2) || 0
    const totalMax = Math.max(enrolled * 0.35, 1)
    return {
      label,
      enrolledVal,
      certifiedVal,
      enrolledPct: Math.max(2, (enrolledVal / totalMax) * 100),
      certifiedPct: Math.max(1, (certifiedVal / totalMax) * 100),
    }
  })
})

const enrollBarYAxisLabels = computed(() => {
  const maxVal = Math.max(...enrollStackedBars.value.map(b => b.enrolledVal + b.certifiedVal), 1)
  return [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0].map(String)
})

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

// ─── Radar / Spider Chart ─────────────────────────────────────────────────
const RADAR_CX = 110
const RADAR_CY = 110
const RADAR_R = 88
const RADAR_LABELS = ['Completados', 'Aprobados', 'Satisfacción', 'Certificados', 'Activos']
const radarGridFractions = [0.25, 0.5, 0.75, 1.0]

const radarValues = computed<number[]>(() => {
  const maxUsers = Math.max(creatorMetrics.value.enrolledUsersCount, 1)
  return [
    (creatorMetrics.value.completionRate ?? 0) / 100,
    (creatorMetrics.value.approvalRate ?? 0) / 100,
    (creatorMetrics.value.satisfactionRate ?? 0) / 100,
    Math.min((creatorMetrics.value.certifiedUsersCount ?? 0) / maxUsers, 1),
    1,
  ]
})

const radarAxisPoints = computed(() =>
  RADAR_LABELS.map((label, i) => {
    const angle = (i * 2 * Math.PI / RADAR_LABELS.length) - Math.PI / 2
    return {
      x: (RADAR_CX + RADAR_R * Math.cos(angle)).toFixed(2),
      y: (RADAR_CY + RADAR_R * Math.sin(angle)).toFixed(2),
      lx: (RADAR_CX + (RADAR_R + 22) * Math.cos(angle)).toFixed(2),
      ly: (RADAR_CY + (RADAR_R + 22) * Math.sin(angle)).toFixed(2),
      label,
    }
  })
)

const radarDataPoints = computed(() =>
  radarValues.value.map((v, i) => {
    const angle = (i * 2 * Math.PI / RADAR_LABELS.length) - Math.PI / 2
    return {
      x: (RADAR_CX + RADAR_R * v * Math.cos(angle)).toFixed(2),
      y: (RADAR_CY + RADAR_R * v * Math.sin(angle)).toFixed(2),
    }
  })
)

const radarDataPolygon = computed(() =>
  radarDataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
)

const radarGridPolygon = (fraction: number): string => {
  const N = RADAR_LABELS.length
  return Array.from({ length: N }, (_, i) => {
    const angle = (i * 2 * Math.PI / N) - Math.PI / 2
    const x = (RADAR_CX + RADAR_R * fraction * Math.cos(angle)).toFixed(2)
    const y = (RADAR_CY + RADAR_R * fraction * Math.sin(angle)).toFixed(2)
    return `${x},${y}`
  }).join(' ')
}

// ─── Donut Chart ────────────────────────────────────────────────────────
const DONUT_R_VAL = 48
const DONUT_C = 2 * Math.PI * DONUT_R_VAL

const donutSegmentsData = computed(() => {
  const items = [
    { pct: Math.round(creatorMetrics.value.completionRate ?? 0), color: '#30D158', label: 'Completados' },
    { pct: Math.round(creatorMetrics.value.approvalRate ?? 0), color: '#0A84FF', label: 'Aprobados' },
    { pct: Math.round(creatorMetrics.value.satisfactionRate ?? 0), color: '#BF5AF2', label: 'Satisfacción' },
  ]
  const total = items.reduce((s, v) => s + Math.max(v.pct, 0), 0) || 1
  const GAP_DEG = 5
  let cumulativeDeg = 0
  return items.map(item => {
    const pct = Math.max(item.pct, 0)
    const segDeg = (pct / total) * 360
    const arcLen = Math.max(0, (segDeg - GAP_DEG) / 360 * DONUT_C)
    const startDeg = cumulativeDeg - 90 + GAP_DEG / 2
    cumulativeDeg += segDeg
    return {
      ...item,
      dasharray: `${arcLen.toFixed(2)} ${DONUT_C.toFixed(2)}`,
      transform: `rotate(${startDeg.toFixed(2)} 70 70)`,
    }
  })
})

const donutCenterValue = computed(() => {
  const vals = [
    creatorMetrics.value.completionRate ?? 0,
    creatorMetrics.value.approvalRate ?? 0,
    creatorMetrics.value.satisfactionRate ?? 0,
  ]
  return Math.round(vals.reduce((a, b) => a + b, 0) / 3)
})

const funnelStages = computed(() => {
  const enrolled  = creatorMetrics.value.enrolledUsersCount  ?? 0
  const approved  = Math.round((creatorMetrics.value.approvalRate  ?? 0) * enrolled / 100)
  const completed = Math.round((creatorMetrics.value.completionRate ?? 0) * enrolled / 100)
  const certified = creatorMetrics.value.certifiedUsersCount ?? 0
  const maxVal    = Math.max(enrolled, 1)
  return [
    { label: 'Inscritos',    count: enrolled,  pct: 100,                                      color: '#0A84FF' },
    { label: 'Aprobados',    count: approved,  pct: Math.round(approved  / maxVal * 100),     color: '#BF5AF2' },
    { label: 'Completados',  count: completed, pct: Math.round(completed / maxVal * 100),     color: '#30D158' },
    { label: 'Certificados', count: certified, pct: Math.round(certified / maxVal * 100),     color: '#FFD60A' },
  ]
})

const funnelSvgData = computed(() => {
  const W = 280, H = 212, padX = 12, padTop = 4
  const stageH = (H - padTop * 2) / funnelStages.value.length
  const maxW   = W - padX * 2
  return funnelStages.value.map((stage, i) => {
    const topW  = maxW * (stage.pct / 100)
    const nextPct = funnelStages.value[i + 1]?.pct ?? 0
    const botW  = maxW * (nextPct / 100)
    const topY  = padTop + i * stageH
    const botY  = topY + stageH
    const topL  = (W - topW) / 2
    const topR  = topL + topW
    const botL  = (W - botW) / 2
    const botR  = botL + botW
    return { ...stage, points: `${topL},${topY} ${topR},${topY} ${botR},${botY} ${botL},${botY}`, midY: topY + stageH / 2 + 5 }
  })
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
  if (img.dataset.fallback) return   // ya se aplicó el fallback, evitar bucle
  img.dataset.fallback = '1'
  img.src = '/default-avatar.png'
}
const onCourseThumbError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallback) return   // ya se aplicó el fallback, evitar bucle
  img.dataset.fallback = '1'
  img.src = '/default-course.png'
}
const resolveThumbnail = (url: string) => {
  if (!url) return '/default-course.png'
  if (url.startsWith('http')) return url
  return buildProxyFileUrl?.(url) || url
}

// ─── vue-chrts data for Actividad Mensual (AreaChart) ────────────────────
interface MonthlyAreaItem {
  month: string
  inscripciones: number
}
const monthlyAreaChartData = computed<MonthlyAreaItem[]>(() => {
  const labels = monthlyChartRaw.value.labels.length > 0 ? monthlyChartRaw.value.labels : MONTHLY_LABELS_FALLBACK
  const vals = monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : new Array(6).fill(0)
  return labels.map((label, i) => ({
    month: label,
    inscripciones: vals[i] ?? 0,
  }))
})
const monthlyAreaCategories: Record<string, BulletLegendItemInterface> = {
  inscripciones: { name: 'Inscripciones', color: '#3b82f6' },
}
const monthlyXFormatter = (tick: number, _i?: number, _ticks?: number[]): string => {
  const data = monthlyAreaChartData.value
  if (typeof tick === 'number' && data[tick]?.month) {
    return data[tick].month
  }
  return String(tick)
}
const getMonthFullName = (month: string): string => month || ''
const monthlyTooltipGaugeDash = (val: number) => {
  const max = Math.max(...(monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : [1]), 1)
  const pct = Math.min(100, (val / max) * 100)
  const circ = 2 * Math.PI * 24
  const fill = (pct / 100) * circ
  return `${fill} ${circ - fill}`
}
const monthlyTooltipPct = (val: number) => {
  const max = Math.max(...(monthlyChartRaw.value.values.length > 0 ? monthlyChartRaw.value.values : [1]), 1)
  return Math.round(Math.min(100, (val / max) * 100))
}

// ─── vue-chrts data for Inscripciones Acumuladas ─────────────────────────
const enrollBarChartData = computed(() => {
  return enrollStackedBars.value.map(bar => ({
    label: bar.label,
    inscritos: bar.enrolledVal,
    certificados: bar.certifiedVal,
  }))
})
const enrollBarCategories = {
  inscritos: { name: 'Inscritos', color: '#42A5F5' },
  certificados: { name: 'Certificados', color: '#90CAF9' },
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
  { label: 'Cursos Activos', value: 0, color: '#0A84FF', iconComponent: 'span' },
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

const toggleSection = (section: 'courses' | 'tasks' | 'submissions' | 'students' | 'reinforcement' | 'subjectProgress' | 'myProgress') => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const goToCourse = (courseId: number) => {
  router.push({ name: 'subjectsList', params: { courseId } })
}

const goToTask = (task: PendingTask) => {
  router.push(`/course/${task.courseId}/task/${task.id}`)
}

const getTaskIconBg = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'quiz': return '#BF5AF220'
    case 'document': return '#0A84FF20'
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

// ─── Institutions (SuperAdmin) state ─────────────────────────────────────
const institutions = ref<InstitutionAdmin[]>([])
const institutionsLoading = ref(false)
const institutionSearch = ref('')
const institutionProcessing = ref<Record<number, boolean>>({})
const datePickerTarget = ref<InstitutionAdmin | null>(null)
const cycleType = ref<'monthly_start' | 'biweekly' | 'monthly_day' | 'specific_months' | ''>('')
const cycleDay = ref(1)
const cycleHour = ref(8)
const cycleMinute = ref(0)
const cycleRecurrence = ref<'once' | 'every_month'>('every_month')
const cycleSelectedMonth = ref<number>(getColombiaDateParts(new Date()).month)
const CYCLE_MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const cycleActionMode = ref<'warning' | 'suspension'>('warning')
const cycleQuickMinutes = ref(2)
const suspendTarget = ref<InstitutionAdmin | null>(null)
const suspendReason = ref('')

// Monthly price editor
const priceEditorTarget = ref<InstitutionAdmin | null>(null)
const editingPrice = ref(0)
const savingPrice = ref(false)

const openPriceEditor = (inst: InstitutionAdmin) => {
  priceEditorTarget.value = inst
  editingPrice.value = inst.monthly_price || 0
}

const saveMonthlyPrice = async () => {
  const inst = priceEditorTarget.value
  if (!inst) return
  savingPrice.value = true
  try {
    const updated = await institucionAdapter.setMonthlyPrice(inst.id, editingPrice.value, inst.tenantId)
    const idx = institutions.value.findIndex(i => i.id === inst.id && i.tenantId === inst.tenantId)
    if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...updated, tenantId: inst.tenantId, tenantName: inst.tenantName }
    priceEditorTarget.value = null
  } catch (e) {
    console.error('Error saving monthly price:', e)
  } finally {
    savingPrice.value = false
  }
}

const filteredInstitutions = computed(() => {
  const q = institutionSearch.value.toLowerCase().trim()
  if (!q) return institutions.value
  return institutions.value.filter(i =>
    (i.nombre || '').toLowerCase().includes(q) ||
    (i.codigo || '').toLowerCase().includes(q) ||
    (i.ciudad || '').toLowerCase().includes(q) ||
    (i.departamento || '').toLowerCase().includes(q) ||
    (i.tenantName || '').toLowerCase().includes(q)
  )
})

// ─── Service payments (all institutions) ─────────────────────────────────
const servicePayments = ref<InstitutionPayment[]>([])
const servicePaymentsLoading = ref(false)

const servicePaymentsForInstitution = (instId: number) =>
  servicePayments.value.filter(p => p.institution_id === instId)

const lastApprovedPayment = (instId: number) =>
  servicePaymentsForInstitution(instId).find(p => p.status === 'APPROVED')

const loadServicePayments = async () => {
  servicePaymentsLoading.value = true
  try {
    const data = await institucionAdapter.getAllServicePayments()
    servicePayments.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading service payments:', e)
    servicePayments.value = []
  } finally {
    servicePaymentsLoading.value = false
  }
}

const loadInstitutions = async () => {
  institutionsLoading.value = true
  try {
    const [data] = await Promise.all([
      institucionAdapter.getAllAdmin(),
      loadServicePayments(),
    ])
    institutions.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading institutions:', e)
    institutions.value = []
  } finally {
    institutionsLoading.value = false
  }
}

const openCyclePicker = (inst: InstitutionAdmin) => {
  datePickerTarget.value = inst
  cycleType.value = inst.billing_cycle_type || ''
  cycleDay.value = inst.billing_cycle_day || 1
  cycleHour.value = inst.billing_cycle_hour ?? 8
  cycleMinute.value = inst.billing_cycle_minute ?? 0
  cycleActionMode.value = (inst.billing_action_mode as 'warning' | 'suspension') || (inst.is_suspended ? 'suspension' : 'warning')
  // If the institution has billing_cycle_months set, use 'once' mode
  const savedMonths = (inst as any).billing_cycle_months
  if (Array.isArray(savedMonths) && savedMonths.length > 0 && savedMonths.length < 12) {
    cycleRecurrence.value = 'once'
    cycleSelectedMonth.value = savedMonths[0] ?? getColombiaDateParts(new Date()).month
  } else {
    cycleRecurrence.value = 'every_month'
    cycleSelectedMonth.value = getColombiaDateParts(new Date()).month
  }
}

const formatBillingCycle = (inst: InstitutionAdmin) => {
  if (!inst.billing_cycle_type) return 'No configurado'
  const h = String(inst.billing_cycle_hour ?? 8).padStart(2, '0')
  const m = String(inst.billing_cycle_minute ?? 0).padStart(2, '0')
  const hourStr = ` a las ${h}:${m} (COT)`
  if (inst.billing_cycle_type === 'monthly_start') return `Inicio de mes (día 1)${hourStr}`
  if (inst.billing_cycle_type === 'biweekly') return `Quincenal (1 y 15)${hourStr}`
  const savedMonths = (inst as any).billing_cycle_months as number[] | null
  if (inst.billing_cycle_type === 'specific_months' && Array.isArray(savedMonths) && savedMonths.length > 0) {
    const mLabels = savedMonths.sort((a: number, b: number) => a - b).map((i: number) => CYCLE_MONTH_NAMES[i] || '?').join(', ')
    return `Día ${inst.billing_cycle_day || 1} de ${mLabels}${hourStr}`
  }
  if (inst.billing_cycle_type === 'monthly_day') return `Día ${inst.billing_cycle_day || 1} de cada mes${hourStr}`
  return 'No configurado'
}

const setCycleQuickFromNow = () => {
  const target = new Date(Date.now() + cycleQuickMinutes.value * 60_000)
  const col = getColombiaDateParts(target)
  cycleSelectedMonth.value = col.month
  cycleDay.value = col.day
  cycleHour.value = col.hour
  cycleMinute.value = col.minute
  if (!cycleType.value) cycleType.value = 'monthly_day'
}

const saveBillingCycle = async () => {
  const inst = datePickerTarget.value
  if (!inst || !cycleType.value) return
  institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: true }
  try {
    const isOnce = cycleRecurrence.value === 'once'
    const cyclePayload: { type: string; day?: number | null; hour?: number | null; minute?: number | null; billing_action_mode?: string; months?: number[]; month?: number } = {
      type: isOnce ? 'specific_months' : cycleType.value,
      day: cycleType.value === 'monthly_day' ? cycleDay.value : null,
      hour: cycleHour.value,
      minute: cycleMinute.value,
      billing_action_mode: cycleActionMode.value,
      month: cycleSelectedMonth.value,
    }
    if (isOnce) {
      cyclePayload.months = [cycleSelectedMonth.value]
    }
    // Compute explicit due date so backend doesn't guess with _computeNextDueDate
    // The hour/minute the admin selects is in Colombia time (UTC-5), convert to UTC for storage
    const colNow = getColombiaDateParts(new Date())
    const cycleYear = colNow.year
    const cycleMonth = cycleSelectedMonth.value
    const cycleD = cycleType.value === 'monthly_day' ? cycleDay.value : (cycleType.value === 'biweekly' ? 15 : 1)
    // Build date in Colombia time then shift +5h to get UTC
    const COT_OFFSET_MS = 5 * 60 * 60_000 // Colombia is UTC-5
    let explicitDueDate = new Date(Date.UTC(cycleYear, cycleMonth, cycleD, cycleHour.value, cycleMinute.value) + COT_OFFSET_MS)
    // If the computed date is already in the past and this is a "once" recurrence,
    // keep it as-is (the user explicitly chose it). For recurring, advance to next month.
    if (!isOnce && explicitDueDate.getTime() <= Date.now()) {
      explicitDueDate = new Date(Date.UTC(cycleYear, cycleMonth + 1, cycleD, cycleHour.value, cycleMinute.value) + COT_OFFSET_MS)
    }
    const updated = await institucionAdapter.setPaymentDueDate(
      inst.id,
      explicitDueDate.toISOString(),
      inst.tenantId,
      cyclePayload,
    )
    const idx = institutions.value.findIndex(i => i.id === inst.id && i.tenantId === inst.tenantId)
    if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...updated, tenantId: inst.tenantId, tenantName: inst.tenantName }

    // Immediate suspend only if the due date is already in the past (or warning→unsuspend).
    // Future-dated suspensions are handled automatically by the backend scheduler.
    const dueDatePast = updated.payment_due_date && new Date(updated.payment_due_date) < new Date()
    if (cycleActionMode.value === 'suspension' && dueDatePast && !updated.is_suspended) {
      const suspended = await institucionAdapter.suspendInstitution(inst.id, 'Pago vencido', inst.tenantId)
      if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...suspended, tenantId: inst.tenantId, tenantName: inst.tenantName }
    } else if (cycleActionMode.value === 'warning' && inst.is_suspended) {
      const unsuspended = await institucionAdapter.unsuspendInstitution(inst.id, inst.tenantId)
      if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...unsuspended, tenantId: inst.tenantId, tenantName: inst.tenantName }
    }

    datePickerTarget.value = null
  } catch (e) {
    console.error('Error setting billing cycle:', e)
  } finally {
    institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: false }
  }
}

const removeBillingCycle = async () => {
  const inst = datePickerTarget.value
  if (!inst) return
  institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: true }
  try {
    const updated = await institucionAdapter.setPaymentDueDate(
      inst.id,
      null,
      inst.tenantId,
      undefined,
      true,
    )
    const idx = institutions.value.findIndex(i => i.id === inst.id && i.tenantId === inst.tenantId)
    if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...updated, tenantId: inst.tenantId, tenantName: inst.tenantName }
    datePickerTarget.value = null
  } catch (e) {
    console.error('Error removing billing cycle:', e)
  } finally {
    institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: false }
  }
}

const handleSuspend = (inst: InstitutionAdmin) => {
  suspendTarget.value = inst
  suspendReason.value = ''
}

const confirmSuspend = async () => {
  const inst = suspendTarget.value
  if (!inst) return
  institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: true }
  try {
    const updated = await institucionAdapter.suspendInstitution(inst.id, suspendReason.value || undefined, inst.tenantId)
    const idx = institutions.value.findIndex(i => i.id === inst.id && i.tenantId === inst.tenantId)
    if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...updated, tenantId: inst.tenantId, tenantName: inst.tenantName }
    suspendTarget.value = null
  } catch (e) {
    console.error('Error suspending institution:', e)
  } finally {
    institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: false }
  }
}

const handleUnsuspend = async (inst: InstitutionAdmin) => {
  institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: true }
  try {
    const updated = await institucionAdapter.unsuspendInstitution(inst.id, inst.tenantId)
    const idx = institutions.value.findIndex(i => i.id === inst.id && i.tenantId === inst.tenantId)
    if (idx >= 0) institutions.value[idx] = { ...institutions.value[idx], ...updated, tenantId: inst.tenantId, tenantName: inst.tenantName }
  } catch (e) {
    console.error('Error unsuspending institution:', e)
  } finally {
    institutionProcessing.value = { ...institutionProcessing.value, [inst.id]: false }
  }
}

onMounted(async () => {
  // Ensure user profile (with roles) is loaded before role-gated loads.
  // In Vue, child onMounted fires before parent (App.vue), so authStore.user
  // may still be null on page refresh when App.vue hasn't called fetchProfile() yet.
  if (tokenStorage.isAuthenticated && !authStore.user?.id) {
    await authStore.fetchProfile()
  }

  await loadCognitiveAccess()

  // Launch all independent loads in parallel
  const promises: Promise<any>[] = [loadData(), loadAnalyticsData(), loadMyCoursesProgressData()]
  if (canViewActivation.value) promises.push(loadUsers())
  if (canViewCertificates.value) promises.push(loadCertificates())
  if (hasAdminRole.value) promises.push(loadEnrollments())
  if (hasSuperAdminRole.value) promises.push(loadInstitutions())
  if (canViewFullModeration.value) {
    promises.push(loadPendingSubmissions())
    promises.push(loadStudentProgressData())
    promises.push(loadReinforcementData())
    promises.push(loadSubjectProgress())
  }
  if (canViewCognitive.value) promises.push(loadCognitiveData())
  Promise.allSettled(promises)
  applyAdminQueryNavigation()
})

watch(() => route.query, () => {
  applyAdminQueryNavigation()
})
</script>

<style scoped>
/* ═══════ Apple-style Design System ═══════ */
.admin-dashboard {
  height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 20px 100px;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.tabs-container {
  display: flex;
  gap: 4px;
  padding: 12px 20px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 0.5px solid rgba(255,255,255,0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(0,0,0,0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}
.tabs-container::-webkit-scrollbar { display: none; }

.tab-btn {
  padding: 7px 16px;
  border-radius: 18px;
  background: transparent;
  color: #8E8E93;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  border: none;
}
.tab-btn:hover { background: rgba(255,255,255,0.06); color: #EBEBF5; }

.tab-btn.active {
  background: rgba(255,255,255,0.12);
  color: #FFFFFF;
  font-weight: 600;
  box-shadow: none;
}

.moderation-tab {
  padding-top: 12px;
}

.moderation-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.moderation-stat-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 16px;
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  box-shadow: none;
  animation: fadeInUp 0.35s ease both;
  transition: background 0.2s;
}
.moderation-stat-card:hover { background: #2C2C2E; }

.moderation-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(120,120,128,0.12);
  color: #8E8E93;
}

.moderation-stat-icon.is-cyan { color: #007AFF; background: rgba(0,122,255,0.12); }
.moderation-stat-icon.is-gold { color: #FF9F0A; background: rgba(255,159,10,0.12); }
.moderation-stat-icon.is-mint { color: #30D158; background: rgba(48,209,88,0.12); }
.moderation-stat-icon.is-rose { color: #FF375F; background: rgba(255,55,95,0.12); }

.moderation-stat-value {
  color: #FFFFFF;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  text-shadow: none;
}

.moderation-stat-label {
  color: #8E8E93;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  letter-spacing: -0.01em;
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

/* Cognitive Digital Twin */
.cognitive-tab {
  padding-top: 16px;
  background: #000;
}

.cognitive-hero-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  gap: 24px;
  padding: 28px;
  margin-bottom: 14px;
  border-radius: 24px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(145deg, rgba(28, 28, 30, 0.96), rgba(10, 10, 12, 0.96));
  overflow: hidden;
  animation: fadeInUp 0.38s ease both;
}

.cognitive-hero-copy {
  position: relative;
  z-index: 1;
  max-width: 760px;
}

.cognitive-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5AC8FA;
}

.cognitive-hero-copy h2 {
  margin: 8px 0 8px;
  color: #fff;
  font-size: clamp(28px, 4vw, 46px);
  line-height: 1.02;
  font-weight: 760;
  letter-spacing: 0;
}

.cognitive-hero-copy p {
  max-width: 680px;
  margin: 0;
  color: rgba(235, 235, 245, 0.68);
  font-size: 14.5px;
  line-height: 1.55;
}

.cognitive-signal {
  justify-self: end;
  width: 176px;
  min-height: 148px;
  padding: 16px;
  border-radius: 20px;
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.055);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.cognitive-signal-total strong {
  display: block;
  color: #fff;
  font-size: 36px;
  line-height: 0.95;
  letter-spacing: 0;
}

.cognitive-signal-total span,
.cognitive-signal small {
  color: #8E8E93;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cognitive-signal-bars {
  height: 40px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  align-items: end;
}

.cognitive-signal-bars span {
  min-height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, #5AC8FA, #30D158);
  animation: cognitiveBars 1.8s ease-in-out infinite;
}

.cognitive-signal-bars span:nth-child(1) { height: 38%; animation-delay: 0ms; }
.cognitive-signal-bars span:nth-child(2) { height: 66%; animation-delay: 100ms; }
.cognitive-signal-bars span:nth-child(3) { height: 48%; animation-delay: 200ms; }
.cognitive-signal-bars span:nth-child(4) { height: 86%; animation-delay: 300ms; }
.cognitive-signal-bars span:nth-child(5) { height: 58%; animation-delay: 400ms; }

@keyframes cognitiveBars {
  0%, 100% { transform: scaleY(0.78); opacity: 0.7; }
  50% { transform: scaleY(1); opacity: 1; }
}

.cognitive-orbit {
  position: relative;
  width: 156px;
  aspect-ratio: 1;
  justify-self: end;
  display: grid;
  place-items: center;
}

.cognitive-orbit-ring {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(90, 200, 250, 0.26);
  animation: cognitiveOrbit 9s linear infinite;
}

.cognitive-orbit-ring.ring-two {
  inset: 24px;
  border-color: rgba(48, 209, 88, 0.24);
  animation-duration: 6.5s;
  animation-direction: reverse;
}

.cognitive-orbit-core {
  position: relative;
  z-index: 1;
  width: 98px;
  height: 98px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.cognitive-orbit-core strong {
  color: #fff;
  font-size: 30px;
  line-height: 1;
  letter-spacing: 0;
}

.cognitive-orbit-core span {
  margin-top: 4px;
  color: #8E8E93;
  font-size: 11px;
  font-weight: 600;
}

@keyframes cognitiveOrbit {
  from { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(0.96); }
  to { transform: rotate(360deg) scale(1); }
}

.cognitive-loading,
.cognitive-empty {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: #8E8E93;
}

.cognitive-empty h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  letter-spacing: 0;
}

.cognitive-empty p,
.cognitive-loading p {
  margin: 0;
  color: #8E8E93;
  font-size: 13px;
}

.cognitive-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.cognitive-kpi {
  padding: 16px;
  min-height: 104px;
  border-radius: 18px;
  background: rgba(28, 28, 30, 0.92);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  animation: fadeInUp 0.35s ease both;
}

.cognitive-kpi:nth-child(2) { animation-delay: 50ms; }
.cognitive-kpi:nth-child(3) { animation-delay: 100ms; }
.cognitive-kpi:nth-child(4) { animation-delay: 150ms; }

.cognitive-kpi-label {
  color: #8E8E93;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cognitive-kpi strong {
  color: #fff;
  font-size: 30px;
  line-height: 1;
  letter-spacing: 0;
}

.cognitive-kpi small {
  color: rgba(235, 235, 245, 0.54);
  font-size: 12px;
}

.cognitive-kpi.is-warning strong {
  color: #FF9F0A;
}

.cognitive-toolbar {
  position: sticky;
  top: 0;
  z-index: 18;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(190px, 240px) minmax(190px, 230px) 48px;
  gap: 12px;
  align-items: stretch;
  margin: 0 -20px 16px;
  padding: 12px 20px 13px;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.98), rgba(0, 0, 0, 0.82)),
    rgba(0, 0, 0, 0.88);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.11);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  backdrop-filter: saturate(190%) blur(26px);
  -webkit-backdrop-filter: saturate(190%) blur(26px);
  animation: cognitiveToolbarIn 0.32s ease both;
}

.cognitive-toolbar::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -18px;
  height: 18px;
  background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.98));
  pointer-events: none;
}

.cognitive-toolbar::after {
  content: "";
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(90, 200, 250, 0.42), rgba(48, 209, 88, 0.28), transparent);
  pointer-events: none;
}

.cognitive-toolbar > * {
  position: relative;
  z-index: 1;
}

.cognitive-search-box,
.cognitive-select-wrap {
  min-width: 0;
  height: 48px;
  border-radius: 18px;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.045)),
    rgba(28, 28, 30, 0.72);
  color: #A1A1AA;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 10px 24px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.cognitive-search-box:hover,
.cognitive-select-wrap:hover,
.cognitive-search-box:focus-within,
.cognitive-select-wrap:focus-within {
  transform: translateY(-1px);
  border-color: rgba(90, 200, 250, 0.36);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06)),
    rgba(28, 28, 30, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 12px 28px rgba(0, 0, 0, 0.3);
}

.cognitive-search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.cognitive-search-box svg {
  flex-shrink: 0;
  color: rgba(235, 235, 245, 0.52);
  transition: color 0.18s ease;
}

.cognitive-search-box:focus-within svg {
  color: #5AC8FA;
}

.cognitive-search-box input {
  min-width: 0;
  flex: 1;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0;
}

.cognitive-search-box input::placeholder {
  color: rgba(235, 235, 245, 0.35);
}

.cognitive-select-wrap {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 0 12px 0 14px;
}

.cognitive-select-wrap span {
  color: rgba(235, 235, 245, 0.5);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cognitive-select-wrap select {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-weight: 680;
  cursor: pointer;
}

.cognitive-select-wrap option {
  background: #1C1C1E;
  color: #fff;
}

.cognitive-refresh-btn {
  width: 48px;
  height: 48px;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  color: #EBEBF5;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.045)),
    rgba(28, 28, 30, 0.72);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.09), 0 10px 24px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.cognitive-refresh-btn:hover {
  transform: translateY(-1px) rotate(16deg);
  background:
    linear-gradient(145deg, rgba(90, 200, 250, 0.16), rgba(48, 209, 88, 0.09)),
    rgba(44, 44, 46, 0.88);
  border-color: rgba(90, 200, 250, 0.34);
  color: #FFFFFF;
}

.cognitive-refresh-btn.is-text {
  width: auto;
  padding: 0 16px;
  font-weight: 700;
}

@keyframes cognitiveToolbarIn {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.cognitive-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
  gap: 14px;
  align-items: start;
}

.cognitive-student-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.cognitive-student-card {
  min-width: 0;
  padding: 16px;
  border-radius: 20px;
  background: rgba(28, 28, 30, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  animation: cognitiveCardIn 0.36s ease both;
  animation-delay: var(--row-delay, 0ms);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.cognitive-student-card:hover,
.cognitive-student-card.is-selected {
  transform: translateY(-2px);
  background: rgba(36, 36, 38, 0.96);
  border-color: rgba(90, 200, 250, 0.28);
}

.cognitive-student-card.status-strong { box-shadow: inset 3px 0 0 rgba(48, 209, 88, 0.85); }
.cognitive-student-card.status-steady { box-shadow: inset 3px 0 0 rgba(10, 132, 255, 0.85); }
.cognitive-student-card.status-needs_support { box-shadow: inset 3px 0 0 rgba(255, 159, 10, 0.9); }

@keyframes cognitiveCardIn {
  from { opacity: 0; transform: translateY(14px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.cognitive-card-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.cognitive-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.cognitive-avatar,
.cognitive-detail-avatar {
  border-radius: 50%;
  object-fit: cover;
  background: #2C2C2E;
}

.cognitive-avatar {
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cognitive-avatar-status {
  position: absolute;
  right: 1px;
  bottom: 1px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #30D158;
  border: 2px solid #1C1C1E;
}

.status-needs_support .cognitive-avatar-status { background: #FF9F0A; }
.status-steady .cognitive-avatar-status { background: #0A84FF; }

.cognitive-student-copy {
  flex: 1;
  min-width: 0;
}

.cognitive-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.cognitive-name-row h3 {
  min-width: 0;
  margin: 0;
  color: #fff;
  font-size: 15px;
  line-height: 1.2;
  font-weight: 720;
  letter-spacing: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cognitive-status-badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: #D1D1D6;
  font-size: 10.5px;
  font-weight: 700;
}

.status-strong .cognitive-status-badge {
  color: #30D158;
  background: rgba(48, 209, 88, 0.12);
}

.status-needs_support .cognitive-status-badge {
  color: #FF9F0A;
  background: rgba(255, 159, 10, 0.13);
}

.cognitive-username,
.cognitive-course-line {
  margin: 3px 0 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cognitive-username {
  color: #8E8E93;
  font-size: 12px;
  font-weight: 600;
}

.cognitive-course-line {
  color: rgba(235, 235, 245, 0.45);
  font-size: 11.5px;
}

.cognitive-metric-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.cognitive-metric-strip span {
  min-width: 0;
  padding: 9px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.045);
  color: #8E8E93;
  font-size: 10.5px;
  text-align: center;
}

.cognitive-metric-strip strong {
  display: block;
  color: #fff;
  font-size: 14px;
  line-height: 1;
  margin-bottom: 3px;
}

.cognitive-card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.cognitive-mini-history {
  height: 34px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.cognitive-mini-history span {
  width: 5px;
  min-height: 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #5AC8FA, #30D158);
  opacity: 0.92;
}

.cognitive-last-seen {
  color: #636366;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.cognitive-detail-panel {
  position: sticky;
  top: 72px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(28, 28, 30, 0.94);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.35s ease both;
}

.cognitive-detail-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.cognitive-detail-avatar {
  width: 62px;
  height: 62px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.cognitive-detail-header h3 {
  margin: 4px 0 2px;
  color: #fff;
  font-size: 18px;
  line-height: 1.18;
  letter-spacing: 0;
}

.cognitive-detail-header p {
  margin: 0;
  color: #8E8E93;
  font-size: 12px;
  font-weight: 600;
}

.cognitive-score-ring {
  position: relative;
  width: 164px;
  height: 164px;
  margin: 18px auto;
}

.cognitive-score-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.cognitive-score-ring circle {
  fill: none;
  stroke-width: 10;
  stroke: rgba(255, 255, 255, 0.08);
}

.cognitive-score-ring circle:nth-child(2) {
  stroke: #5AC8FA;
  stroke-linecap: round;
  stroke-dasharray: 100;
  transition: stroke-dashoffset 0.8s cubic-bezier(.4, 0, .2, 1);
}

.cognitive-score-ring > div {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cognitive-score-ring strong {
  color: #fff;
  font-size: 34px;
  line-height: 1;
  letter-spacing: 0;
}

.cognitive-score-ring span {
  margin-top: 6px;
  color: #8E8E93;
  font-size: 12px;
  font-weight: 700;
}

.cognitive-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cognitive-detail-grid > div {
  min-width: 0;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
}

.cognitive-detail-grid span,
.cognitive-recommendation span {
  display: block;
  color: #8E8E93;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cognitive-detail-grid strong {
  display: block;
  margin-top: 6px;
  color: #fff;
  font-size: 15px;
  letter-spacing: 0;
}

.cognitive-recommendation {
  margin-top: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(10, 132, 255, 0.1);
  border: 0.5px solid rgba(10, 132, 255, 0.18);
}

.cognitive-recommendation p {
  margin: 8px 0 0;
  color: rgba(235, 235, 245, 0.82);
  font-size: 13px;
  line-height: 1.5;
}

/* ═══════ Digital Twin - Premium Knowledge Graph ═══════ */
.dt-section {
  margin-top: 20px;
  padding: 24px;
  border-radius: 28px;
  background: linear-gradient(165deg, rgba(28, 28, 30, 0.98), rgba(18, 18, 20, 1));
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 1px 0 rgba(255, 255, 255, 0.04) inset;
  animation: dtSectionIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes dtSectionIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.dt-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dt-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(191, 90, 242, 0.2), rgba(90, 200, 250, 0.15));
  border: 1px solid rgba(191, 90, 242, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #BF5AF2;
}

.dt-title-group h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}

.dt-title-group p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(235, 235, 245, 0.5);
}

.dt-badges {
  display: flex;
  gap: 8px;
}

.dt-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dt-badge-purple {
  background: linear-gradient(135deg, rgba(191, 90, 242, 0.2), rgba(191, 90, 242, 0.1));
  color: #BF5AF2;
  border: 1px solid rgba(191, 90, 242, 0.3);
}

.dt-badge-cyan {
  background: linear-gradient(135deg, rgba(90, 200, 250, 0.2), rgba(90, 200, 250, 0.1));
  color: #5AC8FA;
  border: 1px solid rgba(90, 200, 250, 0.3);
}

.dt-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

/* ═══════ Graph Panel ═══════ */
.dt-graph-panel {
  position: relative;
}

.dt-graph-canvas {
  position: relative;
  background: radial-gradient(ellipse at 50% 50%, rgba(191, 90, 242, 0.08) 0%, transparent 60%);
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.dt-graph-svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Anillos orbitales */
.dt-orbit-ring {
  fill: none;
  stroke: rgba(191, 90, 242, 0.08);
  stroke-width: 1;
  stroke-dasharray: 4, 6;
  animation: dtOrbitRotate 60s linear infinite;
}

@keyframes dtOrbitRotateOld {
  from { transform: rotate(0deg); transform-origin: 410px 270px; }
  to { transform: rotate(360deg); transform-origin: 410px 270px; }
}

.dt-bg-glow {
  animation: dtGlowPulse 4s ease-in-out infinite;
}

@keyframes dtGlowPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Conexiones */
.dt-conn-path {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  animation: dtConnDraw 1s ease-out both;
}

.dt-conn-active {
  stroke: url(#dtConnGrad);
  filter: drop-shadow(0 0 4px rgba(191, 90, 242, 0.4));
}

.dt-conn-inactive {
  stroke: rgba(99, 99, 102, 0.25);
  stroke-dasharray: 6, 4;
}

@keyframes dtConnDraw {
  from { stroke-dasharray: 0, 1000; opacity: 0; }
  to { stroke-dasharray: 1000, 0; opacity: 1; }
}

/* Partículas de flujo */
.dt-particle {
  fill: #BF5AF2;
  filter: drop-shadow(0 0 6px #BF5AF2);
  offset-distance: 0%;
  animation: dtParticleFlow 3s linear infinite;
}

@keyframes dtParticleFlow {
  from { offset-distance: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  to { offset-distance: 100%; opacity: 0; }
}

/* Nodos */
.dt-node {
  cursor: pointer;
  animation: dtNodeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dt-node:hover {
  transform: scale(1.12);
}

.dt-node-selected {
  transform: scale(1.15);
}

@keyframes dtNodeIn {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}

.dt-node-aura {
  fill: none;
  stroke-width: 2;
  opacity: 0.3;
  animation: dtAuraPulse 2s ease-in-out infinite;
}

.dt-aura-mastered { stroke: #34D399; }
.dt-aura-progress { stroke: #FBBF24; }
.dt-aura-forgetting { stroke: #F87171; animation: dtAuraPulse 1s ease-in-out infinite; }
.dt-aura-unseen { stroke: #6B7280; opacity: 0.15; }

@keyframes dtAuraPulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

.dt-node-ring {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
  transition: stroke-dasharray 0.6s ease;
}

.dt-ring-mastered { stroke: #34D399; }
.dt-ring-progress { stroke: #FBBF24; }
.dt-ring-forgetting { stroke: #F87171; }
.dt-ring-unseen { stroke: #4B5563; }

.dt-node-core {
  filter: url(#dtNodeGlow);
  transition: fill 0.3s ease;
}

.dt-node-text {
  fill: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  pointer-events: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.dt-retention-label {
  fill: rgba(235, 235, 245, 0.6);
  font-size: 9px;
  font-weight: 600;
}

/* Badge de predicción */
.dt-pred-badge circle {
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.dt-pred-high { fill: #EF4444; }
.dt-pred-medium { fill: #F59E0B; }
.dt-pred-low { fill: #FBBF24; }

.dt-pred-num {
  fill: #fff;
  font-size: 9px;
  font-weight: 800;
}

/* Leyenda flotante */
.dt-legend {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dt-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.7);
}

.dt-leg-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dt-leg-mastered { background: #34D399; box-shadow: 0 0 8px rgba(52, 211, 153, 0.5); }
.dt-leg-progress { background: #FBBF24; box-shadow: 0 0 8px rgba(251, 191, 36, 0.5); }
.dt-leg-forgetting { background: #F87171; box-shadow: 0 0 8px rgba(248, 113, 113, 0.5); }
.dt-leg-unseen { background: #6B7280; }

/* ═══════ Detail Panel ═══════ */
.dt-detail-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dt-node-card {
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(40, 40, 44, 0.9), rgba(28, 28, 30, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: dtCardIn 0.4s ease both;
}

@keyframes dtCardIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.dt-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.dt-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dt-icon-mastered { background: rgba(52, 211, 153, 0.15); color: #34D399; border: 1px solid rgba(52, 211, 153, 0.3); }
.dt-icon-progress { background: rgba(251, 191, 36, 0.15); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.3); }
.dt-icon-forgetting { background: rgba(248, 113, 113, 0.15); color: #F87171; border: 1px solid rgba(248, 113, 113, 0.3); }
.dt-icon-unseen { background: rgba(107, 114, 128, 0.15); color: #9CA3AF; border: 1px solid rgba(107, 114, 128, 0.3); }

.dt-card-titles h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.dt-card-status {
  display: inline-block;
  margin-top: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dt-status-mastered { background: rgba(52, 211, 153, 0.15); color: #34D399; }
.dt-status-progress { background: rgba(251, 191, 36, 0.15); color: #FBBF24; }
.dt-status-forgetting { background: rgba(248, 113, 113, 0.15); color: #F87171; }
.dt-status-unseen { background: rgba(107, 114, 128, 0.15); color: #9CA3AF; }

/* Gauge de retención */
.dt-gauge-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.dt-gauge-svg {
  width: 120px;
  height: 120px;
}

.dt-gauge-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 8;
}

.dt-gauge-fill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 8px currentColor);
}

.dt-gauge-value {
  fill: #fff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.dt-gauge-label {
  fill: rgba(235, 235, 245, 0.5);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

/* Métricas grid */
.dt-metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.dt-metric {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.dt-metric-warn {
  background: rgba(248, 113, 113, 0.1);
  border-color: rgba(248, 113, 113, 0.2);
}

.dt-metric-warn strong {
  color: #F87171 !important;
}

.dt-metric-icon {
  font-size: 18px;
}

.dt-metric-label {
  display: block;
  font-size: 10px;
  color: rgba(235, 235, 245, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dt-metric strong {
  display: block;
  margin-top: 2px;
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}

/* Curva de retención */
.dt-curve-section {
  margin-top: 16px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.dt-curve-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dt-curve-header span {
  font-size: 11px;
  font-weight: 700;
  color: rgba(235, 235, 245, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dt-curve-formula {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 10px !important;
  color: #BF5AF2 !important;
  padding: 4px 8px;
  background: rgba(191, 90, 242, 0.1);
  border-radius: 6px;
}

.dt-curve-chart {
  position: relative;
}

.dt-curve-svg {
  width: 100%;
  height: 80px;
  display: block;
}

.dt-curve-grid {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 1;
}

.dt-curve-area {
  fill: url(#dtCurveGrad);
  opacity: 0.6;
}

.dt-curve-line {
  fill: none;
  stroke: #BF5AF2;
  stroke-width: 2.5;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(191, 90, 242, 0.5));
}

.dt-curve-point {
  fill: #BF5AF2;
  stroke: #1C1C1E;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(191, 90, 242, 0.6));
}

.dt-curve-vline {
  stroke: rgba(191, 90, 242, 0.3);
  stroke-width: 1;
  stroke-dasharray: 4, 3;
}

.dt-curve-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10px;
  color: rgba(235, 235, 245, 0.4);
}

/* Summary Card */
.dt-summary-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dt-summary-card h4 {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(235, 235, 245, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dt-summary-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dt-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dt-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.dt-bar-info span {
  color: rgba(235, 235, 245, 0.6);
}

.dt-bar-info strong {
  color: #fff;
  font-weight: 700;
}

.dt-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.dt-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.dt-bar-green { background: linear-gradient(90deg, #34D399, #10B981); }
.dt-bar-yellow { background: linear-gradient(90deg, #FBBF24, #F59E0B); }
.dt-bar-red { background: linear-gradient(90deg, #F87171, #EF4444); }

/* Retención promedio */
.dt-avg-retention {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dt-avg-ring {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.dt-avg-ring svg {
  width: 100%;
  height: 100%;
}

.dt-avg-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 5;
}

.dt-avg-fill {
  fill: none;
  stroke: #BF5AF2;
  stroke-width: 5;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(191, 90, 242, 0.5));
  transition: stroke-dasharray 0.6s ease;
}

.dt-avg-ring span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.dt-avg-text strong {
  display: block;
  font-size: 13px;
  color: #fff;
}

.dt-avg-text p {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgba(235, 235, 245, 0.5);
  line-height: 1.4;
}

/* Alert */
.dt-alert {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.08));
  border: 1px solid rgba(251, 191, 36, 0.25);
  animation: dtAlertIn 0.5s ease both 0.3s;
}

@keyframes dtAlertIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dt-alert-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(251, 191, 36, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FBBF24;
  flex-shrink: 0;
}

.dt-alert-content strong {
  display: block;
  font-size: 12px;
  color: #FBBF24;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dt-alert-content p {
  margin: 6px 0 0;
  font-size: 13px;
  color: rgba(235, 235, 245, 0.8);
  line-height: 1.5;
}

/* Rendimiento por Materia */
.dt-courses-card {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.dt-courses-card h4 {
  margin: 0 0 16px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(235, 235, 245, 0.95);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dt-courses-card h4 svg {
  color: #64D2FF;
}

.dt-course-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dt-course-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.dt-course-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

.dt-course-item.dt-course-mastered {
  border-left: 3px solid #30D158;
}

.dt-course-item.dt-course-progress {
  border-left: 3px solid #0A84FF;
}

.dt-course-item.dt-course-developing {
  border-left: 3px solid #FF9F0A;
}

.dt-course-item.dt-course-needs_support {
  border-left: 3px solid #FF453A;
}

.dt-course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dt-course-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.dt-course-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.dt-course-badge.dt-badge-mastered {
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
}

.dt-course-badge.dt-badge-progress {
  background: rgba(10, 132, 255, 0.15);
  color: #0A84FF;
}

.dt-course-badge.dt-badge-developing {
  background: rgba(255, 159, 10, 0.15);
  color: #FF9F0A;
}

.dt-course-badge.dt-badge-needs_support {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
}

.dt-course-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
}

.dt-course-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dt-course-metric-value {
  font-size: 15px;
  font-weight: 700;
  color: rgba(235, 235, 245, 0.95);
}

.dt-course-metric-label {
  font-size: 10px;
  color: rgba(235, 235, 245, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.dt-course-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dt-course-progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.dt-course-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.dt-course-progress-fill.dt-fill-mastered {
  background: linear-gradient(90deg, #30D158, #34D399);
}

.dt-course-progress-fill.dt-fill-progress {
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
}

.dt-course-progress-fill.dt-fill-developing {
  background: linear-gradient(90deg, #FF9F0A, #FBBF24);
}

.dt-course-progress-fill.dt-fill-needs_support {
  background: linear-gradient(90deg, #FF453A, #FF6B6B);
}

.dt-course-last-activity {
  font-size: 10px;
  color: rgba(235, 235, 245, 0.5);
  white-space: nowrap;
}

/* Professional cognitive map refinement */
.dt-section {
  background:
    radial-gradient(circle at 18% 0%, rgba(10, 132, 255, 0.18), transparent 34%),
    radial-gradient(circle at 88% 10%, rgba(48, 209, 88, 0.12), transparent 30%),
    linear-gradient(165deg, rgba(29, 29, 31, 0.98), rgba(12, 12, 14, 1));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.38),
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 0 0 1px rgba(255, 255, 255, 0.025) inset;
}

.dt-icon-wrap {
  background: linear-gradient(145deg, rgba(10, 132, 255, 0.22), rgba(48, 209, 88, 0.12));
  border-color: rgba(100, 210, 255, 0.26);
  color: #64D2FF;
}

.dt-graph-canvas {
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(10, 132, 255, 0.12), transparent 45%),
    radial-gradient(circle at 74% 70%, rgba(48, 209, 88, 0.06), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.24) inset;
  padding: 20px;
}

.dt-map-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.dt-map-topline strong {
  display: block;
  color: #F5F5F7;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}

.dt-map-kicker {
  display: block;
  margin-bottom: 4px;
  color: rgba(235, 235, 245, 0.56);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dt-map-score {
  min-width: 118px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: right;
}

.dt-map-score small {
  display: block;
  color: rgba(235, 235, 245, 0.52);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dt-map-score strong {
  color: #fff;
  font-size: 22px;
}

.dt-graph-svg {
  min-height: 440px;
  max-height: 520px;
  aspect-ratio: 900 / 500;
}

.dt-map-frame {
  fill: rgba(255, 255, 255, 0.018);
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
}

.dt-zone-label {
  fill: rgba(235, 235, 245, 0.34);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dt-orbit-ring {
  stroke: rgba(10, 132, 255, 0.13);
  transform-origin: 410px 270px;
}

.dt-orbit-ring-wide {
  stroke: rgba(48, 209, 88, 0.1);
}

@keyframes dtOrbitRotate {
  from { transform: rotate(0deg); transform-origin: 410px 270px; }
  to { transform: rotate(360deg); transform-origin: 410px 270px; }
}

.dt-particles {
  display: none;
}

.dt-conn-path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.62;
  transition:
    opacity 0.2s ease,
    stroke-width 0.2s ease,
    filter 0.2s ease;
}

.dt-conn-active {
  stroke: url(#dtConnGrad);
  filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.22));
}

.dt-conn-inactive {
  stroke: rgba(142, 142, 147, 0.2);
  stroke-dasharray: 7, 8;
}

.dt-conn-highlighted {
  opacity: 1;
  filter: drop-shadow(0 0 10px rgba(100, 210, 255, 0.34));
}

.dt-graph-node {
  cursor: pointer;
  animation: dtNodeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  transition: opacity 0.2s ease;
}

@keyframes dtNodeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dt-graph-node:hover .dt-node-core,
.dt-graph-node-selected .dt-node-core {
  filter: url(#dtNodeGlow) drop-shadow(0 0 16px rgba(10, 132, 255, 0.34));
}

.dt-graph-node-dimmed {
  opacity: 0.34;
}

.dt-node-focus {
  fill: rgba(16, 185, 129, 0.11);
  stroke: rgba(110, 231, 183, 0.42);
  stroke-width: 1.2;
  stroke-dasharray: 5, 7;
  animation: dtFocusSpin 7s linear infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes dtFocusSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dt-node-aura {
  transform-box: fill-box;
  transform-origin: center;
  fill: none;
  stroke-width: 2.4;
  opacity: 0.34;
}

.dt-aura-mastered {
  stroke: #34D399;
}

.dt-aura-progress {
  stroke: #38BDF8;
}

.dt-aura-forgetting {
  stroke: #FF453A;
  animation: dtAuraPulse 1.6s ease-in-out infinite;
}

.dt-aura-unseen {
  stroke: #8E8E93;
}

.dt-node-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.12);
  stroke-width: 6;
}

.dt-node-ring {
  fill: none;
  stroke-width: 6;
  stroke-linecap: round;
  transform-origin: center;
  transform: rotate(-90deg);
  transition: stroke-dasharray 0.5s ease;
}

.dt-node-core {
  filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.32));
  transition: filter 0.2s ease;
}

.dt-ring-mastered {
  stroke: #30D158;
}

.dt-ring-progress {
  stroke: #38BDF8;
}

.dt-ring-forgetting {
  stroke: #FF453A;
}

.dt-ring-unseen {
  stroke: #8E8E93;
}

.dt-graph-node-main .dt-node-aura {
  stroke-width: 3;
  opacity: 0.46;
}

.dt-graph-node-main .dt-node-track,
.dt-graph-node-main .dt-node-ring {
  stroke-width: 8;
}

.dt-graph-node-main .dt-node-core {
  filter:
    drop-shadow(0 0 24px rgba(52, 211, 153, 0.32))
    drop-shadow(0 8px 22px rgba(0, 0, 0, 0.36));
}

.dt-node-chip rect {
  fill: rgba(8, 13, 24, 0.9);
  stroke: rgba(226, 232, 240, 0.22);
  stroke-width: 1;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.28));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dt-node-label {
  fill: #F5F5F7;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  pointer-events: none;
}

.dt-node-hint {
  fill: rgba(226, 232, 240, 0.68);
  font-size: 10px;
  font-weight: 600;
  pointer-events: none;
}

.dt-node-text {
  fill: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.dt-graph-node-main .dt-node-text {
  font-size: 26px;
  letter-spacing: 0;
}

.dt-retention-label {
  fill: rgba(248, 250, 252, 0.92);
  font-size: 13px;
  font-weight: 800;
  paint-order: stroke;
  stroke: rgba(2, 6, 23, 0.72);
  stroke-width: 3px;
}

.dt-graph-node-main .dt-retention-label {
  font-size: 15px;
}

.dt-map-footer {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.dt-leg-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  min-height: 58px;
  padding: 10px;
  gap: 8px;
  color: #F5F5F7;
  background: var(--dt-status-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  cursor: default;
}

.dt-leg-card .dt-leg-dot {
  background: var(--dt-status-color);
  box-shadow: 0 0 14px var(--dt-status-color);
}

.dt-leg-card span:not(.dt-leg-dot) {
  color: rgba(235, 235, 245, 0.72);
  font-size: 11px;
  font-weight: 650;
}

.dt-leg-card strong {
  color: var(--dt-status-color);
  font-size: 18px;
}

.dt-priority-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 159, 10, 0.09);
  border: 1px solid rgba(255, 159, 10, 0.18);
}

.dt-priority-strip > span {
  margin-right: 4px;
  color: #FF9F0A;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dt-priority-strip button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  color: #F5F5F7;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 159, 10, 0.2);
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
}

.dt-priority-strip strong {
  color: #FF9F0A;
}

.dt-icon-progress {
  background: rgba(10, 132, 255, 0.15);
  color: #64D2FF;
  border-color: rgba(10, 132, 255, 0.3);
}

.dt-icon-forgetting {
  background: rgba(255, 159, 10, 0.15);
  color: #FF9F0A;
  border-color: rgba(255, 159, 10, 0.3);
}

.dt-status-progress {
  background: rgba(10, 132, 255, 0.15);
  color: #64D2FF;
}

.dt-status-forgetting {
  background: rgba(255, 159, 10, 0.15);
  color: #FF9F0A;
}

.dt-metric-warn {
  background: rgba(255, 159, 10, 0.1);
  border-color: rgba(255, 159, 10, 0.22);
}

.dt-metric-warn strong {
  color: #FF9F0A !important;
}

.dt-retention-vue-chart {
  min-height: 172px;
}

.dt-chart-tooltip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  color: #F5F5F7;
  background: #1C1C1E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.dt-chart-tooltip strong {
  font-size: 12px;
}

.dt-chart-tooltip span,
.dt-chart-tooltip small {
  color: rgba(235, 235, 245, 0.68);
  font-size: 11px;
}

.dt-curve-chart {
  display: none;
}

.dt-status-chart {
  margin: -4px 0 14px;
}

.dt-bar-yellow {
  background: linear-gradient(90deg, #64D2FF, #0A84FF);
}

.dt-bar-red {
  background: linear-gradient(90deg, #FFD60A, #FF9F0A);
}

/* Responsive */
@media (max-width: 1100px) {
  .dt-grid {
    grid-template-columns: 1fr;
  }

  .dt-detail-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .dt-alert {
    grid-column: 1 / -1;
  }
}

@media (max-width: 700px) {
  .dt-section {
    padding: 16px;
  }

  .dt-header {
    flex-direction: column;
    gap: 12px;
  }

  .dt-detail-panel {
    grid-template-columns: 1fr;
  }

  .dt-legend {
    position: static;
    transform: none;
    margin-top: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .dt-metrics-grid {
    grid-template-columns: 1fr;
  }

  .dt-map-topline {
    flex-direction: column;
  }

  .dt-map-score {
    width: 100%;
    box-sizing: border-box;
    text-align: left;
  }

  .dt-graph-svg {
    min-height: 320px;
    max-height: 400px;
  }

  .dt-map-footer {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 520px) {
  .dt-map-footer {
    grid-template-columns: 1fr;
  }
}

/* ═══════ Analytics Stats Grid ═══════ */
@media (max-width: 1120px) {
  .cognitive-workbench {
    grid-template-columns: 1fr;
  }

  .cognitive-detail-panel {
    position: static;
  }
}

@media (max-width: 860px) {
  .cognitive-hero-panel {
    grid-template-columns: 1fr;
    padding: 22px;
  }

  .cognitive-orbit {
    justify-self: start;
    width: 128px;
  }

  .cognitive-signal {
    justify-self: stretch;
    width: auto;
  }

  .cognitive-kpi-grid,
  .cognitive-student-list {
    grid-template-columns: 1fr;
  }

  .cognitive-toolbar {
    position: static;
    grid-template-columns: 1fr;
    margin: 0 -20px 16px;
    padding: 12px 20px 14px;
  }

  .cognitive-toolbar::before {
    display: none;
  }

  .cognitive-refresh-btn {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .cognitive-tab {
    padding-left: 12px;
    padding-right: 12px;
  }

  .cognitive-toolbar {
    margin-left: -12px;
    margin-right: -12px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .cognitive-hero-copy h2 {
    font-size: 30px;
  }

  .cognitive-name-row {
    flex-direction: column;
    gap: 6px;
  }

  .cognitive-status-badge {
    align-self: flex-start;
  }

  .cognitive-metric-strip,
  .cognitive-detail-grid {
    grid-template-columns: 1fr;
  }
}

.a-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.a-stat-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  box-shadow: none;
  animation: fadeInUp 0.35s ease both;
  transition: background 0.2s;
}
.a-stat-card:hover { background: #2C2C2E; }
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
.a-icon-cyan   { background: rgba(0,122,255,0.12); color: #0A84FF; }
.a-icon-purple { background: rgba(191,90,242,0.12); color: #BF5AF2; }
.a-icon-gold   { background: rgba(255,159,10,0.12); color: #FF9F0A; }
.a-icon-green  { background: rgba(48,209,88,0.12); color: #30D158; }
.a-stat-body { display: flex; flex-direction: column; min-width: 0; }
.a-stat-value { font-size: 24px; font-weight: 700; color: #FFFFFF; line-height: 1.1; letter-spacing: -0.02em; }
.a-stat-upper { font-size: 10px; font-weight: 600; color: #8E8E93; letter-spacing: 0.06em; margin-top: 3px; text-transform: uppercase; }
.a-stat-sub { font-size: 11px; color: #636366; margin-top: 2px; letter-spacing: -0.01em; }

/* ═══════ Analytics Cards ═══════ */
.a-card {
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: none;
  animation: fadeInUp 0.35s ease both;
  transition: background 0.2s;
}
.a-card:hover { background: #242426; }
.a-card-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.a-card-header h3 { font-size: 15px; font-weight: 600; color: #FFFFFF; margin: 0; letter-spacing: -0.01em; }
.a-tag {
  font-size: 11px; font-weight: 500;
  padding: 4px 10px; border-radius: 6px;
  display: inline-flex; align-items: center; gap: 4px;
  white-space: nowrap;
}
.a-tag-purple { color: #BF5AF2; background: rgba(191,90,242,0.1); border: none; }
.a-tag-cyan   { color: #0A84FF; background: rgba(10,132,255,0.1); border: none; }
.a-tag-green  { color: #30D158; background: rgba(48,209,88,0.1); border: none; }
.a-tag-gold   { color: #FF9F0A; background: rgba(255,159,10,0.1); border: none; }
.a-tag-teal   { color: #64D2FF; background: rgba(100,210,255,0.1); border: none; }

.a-card-chart {
  padding-bottom: 0;
  overflow: hidden;
}

/* ═══════ Gauges ═══════ */
.a-gauges-row { display: flex; justify-content: space-around; gap: 10px; }
.a-gauge-item { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.a-gauge-ring { position: relative; width: 72px; height: 72px; }
.a-gauge-ring svg { width: 100%; height: 100%; }
.a-gauge-arc { transition: stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1); }
.a-gauge-val {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em;
}
.a-gauge-lbl { font-size: 11px; color: #8E8E93; font-weight: 500; text-align: center; letter-spacing: -0.01em; }

/* ═══════ Area Chart ═══════ */
.a-area-chart-wrap { overflow: hidden; margin: 0 -4px; }
.a-area-svg { display: block; width: 100%; height: 100px; }
.a-area-svg-tall { height: 114px; }
.a-chart-labels { display: flex; justify-content: space-between; padding: 8px 8px 0; }
.a-chart-labels span { font-size: 10px; color: #636366; font-weight: 500; letter-spacing: -0.01em; }

/* ═══════ Modern Dashboard Charts ═══════ */
.a-chart-title-row {
  display: flex; align-items: baseline; gap: 10px;
}
.a-chart-metric-label {
  font-size: 13px; font-weight: 500; color: #8E8E93;
  letter-spacing: -0.01em;
}
.a-chart-metric-total {
  font-size: 20px; font-weight: 700; color: #FFFFFF;
  letter-spacing: -0.02em;
}
.a-modern-chart-wrap {
  display: flex; gap: 0; position: relative;
  padding: 4px 0 0;
}
.a-yaxis-labels {
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 0 6px 22px 0; min-width: 32px; text-align: right;
}
.a-yaxis-labels span {
  font-size: 9px; color: #48484A; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.a-chart-area-container {
  flex: 1; position: relative; min-width: 0;
}
.a-modern-area-svg {
  display: block; width: 100%; height: 130px;
}
.a-xaxis-labels {
  display: flex; justify-content: space-between;
  padding: 6px 4px 12px;
}
.a-xaxis-labels span {
  font-size: 9px; color: #48484A; font-weight: 500;
  transition: color 0.15s;
}
.a-xaxis-labels span.a-xaxis-active {
  color: #EBEBF5;
}
.a-xaxis-bars {
  justify-content: space-around;
}
/* Tooltip */
.a-chart-tooltip {
  position: absolute; top: -8px;
  transform: translateX(-50%);
  background: rgba(44,44,46,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 0.5px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 130px;
  z-index: 20;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  animation: tooltipIn 0.15s ease;
}
@keyframes tooltipIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
.a-tooltip-date {
  font-size: 11px; font-weight: 600; color: #EBEBF5;
  margin-bottom: 6px; letter-spacing: -0.01em;
}
.a-tooltip-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: #8E8E93;
  margin-bottom: 2px;
}
.a-tooltip-dot {
  width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
}
.a-tooltip-label { flex: 1; }
.a-tooltip-val {
  font-weight: 700; color: #FFFFFF; font-variant-numeric: tabular-nums;
}

/* ═══════ Stacked Bar Chart ═══════ */
.a-stacked-bars-container {
  position: relative; height: 130px; width: 100%;
}
.a-stacked-bars-grid {
  position: absolute; inset: 0; pointer-events: none;
}
.a-stacked-grid-line {
  position: absolute; left: 0; right: 0; height: 0;
  border-bottom: 0.5px solid rgba(255,255,255,0.05);
}
.a-stacked-bars-row {
  display: flex; align-items: flex-end; gap: 3px;
  height: 100%; padding: 0 2px;
}
.a-stacked-bar-col {
  flex: 1; height: 100%; display: flex; align-items: flex-end;
  justify-content: center; cursor: pointer;
}
.a-stacked-bar-stack {
  width: 65%; max-width: 32px; display: flex;
  flex-direction: column-reverse; align-items: stretch;
  border-radius: 3px 3px 0 0; overflow: hidden;
  transition: opacity 0.15s, filter 0.15s;
}
.a-stacked-bar-col:hover .a-stacked-bar-stack {
  filter: brightness(1.2);
}
.a-stacked-seg {
  transition: height 0.5s cubic-bezier(.4,0,.2,1);
  min-height: 0;
}
.a-seg-completed { background: #FFA726; }
.a-seg-active    { background: #FFD54F; }
.a-seg-enrolled  { background: #42A5F5; }
.a-seg-certified { background: #90CAF9; }

/* ═══════ TradingView Lightweight Charts ═══════ */
.lw-chart-container {
  width: 100%;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
}
.lw-chart-lg {
  height: 260px;
}
.lw-chart-container :deep(table) { border-collapse: collapse; }
.lw-chart-container :deep(td), .lw-chart-container :deep(th) { border: none !important; }

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

/* ═══════ Premium Analytics Tables (.at-) ═══════ */
.a-premium-table-card { overflow: hidden; }

.at-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 143, 255, 0.25) transparent;
}
.at-table-wrap::-webkit-scrollbar { height: 4px; }
.at-table-wrap::-webkit-scrollbar-track { background: transparent; }
.at-table-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }

.at-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.at-table thead tr {
  background: rgba(255,255,255,0.03);
}

.at-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #8E8E93;
  border-bottom: 0.5px solid rgba(255,255,255,0.08);
  white-space: nowrap;
}

.at-th-rank { width: 40px; text-align: center; }
.at-th-right { text-align: right; }

.at-table td {
  padding: 10px 14px;
  vertical-align: middle;
  border-bottom: 0.5px solid rgba(255,255,255,0.04);
}

.at-row {
  transition: background 0.15s;
  animation: atRowSlideIn 0.3s ease both;
}
@keyframes atRowSlideIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.at-row:hover {
  background: rgba(255,255,255,0.04);
}

.at-row-clickable { cursor: pointer; }
.at-row-clickable:hover { background: rgba(255,255,255,0.06); }

.at-row-gold td:first-child { box-shadow: inset 2px 0 0 #FF9F0A; }
.at-row-silver td:first-child { box-shadow: inset 2px 0 0 #8E8E93; }
.at-row-bronze td:first-child { box-shadow: inset 2px 0 0 #AC8E68; }

.at-cell-rank { text-align: center; width: 40px; }

.at-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
}
.at-medal-1 { background: rgba(255,159,10,0.12); }
.at-medal-2 { background: rgba(142,142,147,0.12); }
.at-medal-3 { background: rgba(172,142,104,0.12); }
.at-medal-4, .at-medal-5 {
  font-size: 12px;
  font-weight: 700;
  color: #636366;
  background: rgba(255,255,255,0.04);
}

.at-cell-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.at-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: none;
  box-shadow: none;
}

.at-username {
  font-weight: 500;
  color: #FFFFFF;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
  letter-spacing: -0.01em;
}

.at-cell-num { text-align: right; }

.at-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.at-pill-purple {
  color: #BF5AF2;
  background: rgba(191,90,242,0.1);
  border: none;
}
.at-pill-cyan {
  color: #0A84FF;
  background: rgba(10,132,255,0.1);
  border: none;
}
.at-pill-green {
  color: #30D158;
  background: rgba(48,209,88,0.1);
  border: none;
}

.at-cell-rating { text-align: right; }

.at-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255,214,10,0.08);
}
.at-stars span {
  font-size: 13px;
  font-weight: 600;
  color: #FFD60A;
}

.at-cell-course {
  display: flex;
  align-items: center;
  gap: 10px;
}

.at-course-thumb {
  width: 44px; height: 30px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: rgba(255,255,255,0.04);
  box-shadow: none;
}

.at-course-info { min-width: 0; }

.at-course-name {
  font-weight: 600;
  color: #fff;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 180px;
}

.at-cell-grade { text-align: right; }

.at-grade-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.at-grade-high {
  color: #30D158;
  background: rgba(48, 209, 88, 0.12);
  border: 1px solid rgba(48, 209, 88, 0.18);
}
.at-grade-mid {
  color: #FFD60A;
  background: rgba(255, 214, 10, 0.10);
  border: 1px solid rgba(255, 214, 10, 0.18);
}
.at-grade-low {
  color: #FF453A;
  background: rgba(255, 69, 58, 0.10);
  border: 1px solid rgba(255, 69, 58, 0.18);
}

/* ═══════ Cursos por Terminar thumbnail ═══════ */
.course-finish-thumb {
  width: 52px; height: 38px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}

/* ═══════ Mi Progreso en Cursos (rol 1) ═══════ */
.mcp-list { display: flex; flex-direction: column; gap: 10px; }
.mcp-card {
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  border: 0.5px solid rgba(255,255,255,0.08);
  overflow: hidden;
}
.mcp-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.mcp-card-header:hover { background: rgba(255,255,255,0.04); }
.mcp-thumb {
  width: 44px; height: 44px; border-radius: 8px;
  object-fit: cover; flex-shrink: 0;
  background: rgba(255,255,255,0.06);
}
.mcp-card-info { flex: 1; min-width: 0; }
.mcp-course-title {
  font-size: 13px; font-weight: 600; color: #fff;
  margin: 0 0 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mcp-meta {
  display: flex; align-items: center; gap: 5px;
  flex-wrap: wrap; margin-top: 4px; font-size: 11px; color: #8E8E93;
}
.mcp-pct { color: #EBEBF5; font-weight: 600; }
.mcp-sep { color: rgba(255,255,255,0.2); }
.mcp-grade-val { font-weight: 600; }
.grade-pass { color: #30D158; }
.grade-fail { color: #FF453A; }
.mcp-tasks { color: #8E8E93; }
.mcp-status-badge {
  padding: 2px 7px; border-radius: 6px;
  font-size: 10px; font-weight: 600;
}
.status-won { background: rgba(48,209,88,0.15); color: #30D158; }
.status-lost { background: rgba(255,69,58,0.15); color: #FF453A; }
.mcp-chevron { color: #636366; font-size: 10px; flex-shrink: 0; }
.mcp-subjects {
  background: rgba(0,0,0,0.2);
  border-top: 0.5px solid rgba(255,255,255,0.06);
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 12px;
}
.mcp-no-subjects {
  color: #636366; font-size: 12px;
  text-align: center; padding: 8px 0;
}
.mcp-subject-row {
  display: flex; align-items: flex-start; gap: 10px;
}
.mcp-subject-left { flex: 1; min-width: 0; }
.mcp-subject-name {
  font-size: 12px; color: #EBEBF5;
  display: block; margin-bottom: 5px;
}
.mcp-subject-bar { height: 4px !important; margin-bottom: 3px; }
.mcp-subject-meta {
  font-size: 10px; color: #8E8E93;
  display: block; margin-top: 2px;
}
.mcp-subject-right {
  flex-shrink: 0; padding-top: 2px;
  font-size: 13px; font-weight: 700;
}

/* ═══════ Roles Tab ═══════ */
.roles-tab { padding: 0 16px 80px; }

.roles-self-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px 20px;
  border-radius: 16px;
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
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
  border-radius: 14px;
  border: 0.5px solid rgba(255,255,255,0.06);
  background: #1C1C1E;
}
.roles-summary-card.role-card-1 { border-color: rgba(10,132,255,0.15); }
.roles-summary-card.role-card-2 { border-color: rgba(191,90,242,0.15); }
.roles-summary-card.role-card-3 { border-color: rgba(255,159,10,0.15); }
.roles-summary-count { font-size: 28px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: -0.02em; }
.roles-summary-label { font-size: 11px; color: #8E8E93; font-weight: 500; }
.roles-header-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.roles-header-title { font-size: 15px; font-weight: 600; color: #fff; }
.roles-warning {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 149, 0, 0.10);
  border: 0.5px solid rgba(255, 149, 0, 0.20);
  color: #FF9F0A;
  font-size: 12px;
}
.roles-user-list { display: flex; flex-direction: column; gap: 10px; }
.roles-user-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 0.5px solid rgba(255,255,255,0.06);
}
.roles-avatar-wrap { position: relative; flex-shrink: 0; }
.roles-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.roles-status-dot {
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid #1C1C1E;
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
  transition: height 0.6s cubic-bezier(.4,0,.2,1); min-height: 4px;
}
.a-bar-completed { background: #30D158; }
.a-bar-active    { background: #0A84FF; }
.a-bar-lbl { font-size: 10px; color: #636366; font-weight: 500; }
.a-legend-row { display: flex; justify-content: center; gap: 16px; margin-top: 4px; }
.a-legend { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #8E8E93; }
.a-dot { width: 8px; height: 8px; border-radius: 50%; }
.a-dot-completed { background: #30D158; }
.a-dot-active    { background: #0A84FF; }

/* ═══════ Radar / Spider Chart ═══════ */
.a-radar-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 0;
}
.a-radar-svg {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  filter: none;
}
@keyframes radarReveal {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
.a-radar-polygon { animation: radarReveal 0.7s cubic-bezier(.4,0,.2,1) both; }
.a-radar-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.a-radar-leg-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.a-radar-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #BF5AF2;
  flex-shrink: 0;
  box-shadow: none;
}
.a-radar-leg-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.a-radar-leg-label {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.a-radar-leg-value {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: #BF5AF2;
  letter-spacing: -0.02em;
}

/* ═══════ Donut Chart ═══════ */
.a-donut-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
}
.a-donut-svg-container {
  flex-shrink: 0;
  filter: none;
}
.a-donut-svg {
  width: 140px;
  height: 140px;
  display: block;
}
.a-donut-arc {
  transition: stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1),
              opacity 0.4s ease;
}
.a-donut-legend {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-width: 0;
}
.a-donut-leg-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.a-donut-leg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: none;
}
.a-donut-leg-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 80px;
}
.a-donut-leg-label {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.a-donut-leg-pct {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.a-donut-leg-bar-wrap {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.07);
  border-radius: 2px;
  overflow: hidden;
}
.a-donut-leg-bar {
  height: 100%;
  border-radius: 2px;
  max-width: 100%;
  transition: width 0.8s cubic-bezier(.4,0,.2,1);
}

/* ═══════ Donut legend: portrait layout ═══════ */
@media (orientation: portrait) {
  .a-donut-leg-item {
    flex-wrap: wrap;
  }
  .a-donut-leg-bar-wrap {
    flex-basis: 100%;
    width: 100%;
    height: 5px;
    margin-left: 20px;
  }
}

/* ═══════ Rank Lists ═══════ */
.a-rank-list { display: flex; flex-direction: column; gap: 6px; }
.a-rank-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; background: rgba(255, 255, 255, 0.03);
  border-radius: 10px; transition: background 0.2s ease;
}
.a-rank-row:hover { background: rgba(255, 255, 255, 0.06); }
.a-clickable { cursor: pointer; }
.a-rank-badge {
  width: 24px; height: 24px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  color: #fff; background: rgba(255, 255, 255, 0.08);
}
.a-rank-1 { background: #FFD60A; color: #1a1a1a; }
.a-rank-2 { background: #8E8E93; color: #1a1a1a; }
.a-rank-3 { background: #AC8E68; color: #fff; }
.a-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: none;
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
  letter-spacing: -0.01em;
}
.a-rank-meta { font-size: 11px; color: #636366; margin-top: 1px; }
.a-rank-rating { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
.a-rank-rating span { font-size: 12px; font-weight: 600; color: #FFD60A; }
.a-grade-pill {
  font-size: 13px; font-weight: 700; color: #30D158;
  background: rgba(48, 209, 88, 0.12); padding: 3px 10px;
  border-radius: 8px; flex-shrink: 0;
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
  background: #1C1C1E;
  border-radius: 14px; border: 0.5px solid rgba(255,255,255,0.06);
  box-shadow: none;
}
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 28px; font-weight: 700; line-height: 1;
  letter-spacing: -0.02em; color: #FFFFFF;
  text-shadow: none;
}
.stat-label { font-size: 13px; color: #8E8E93; margin-top: 4px; letter-spacing: -0.01em; }

.section-title { font-size: 17px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; letter-spacing: -0.02em; }

.section-card {
  background: #1C1C1E;
  border-radius: 14px;
  margin-bottom: 12px;
  overflow: hidden;
  animation: fadeInUp 0.3s ease both;
}

.moderation-card {
  margin-bottom: 0;
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  box-shadow: none;
  transition: background 0.2s;
}
.moderation-card:not(.is-open):hover { background: #242426; }

.moderation-card.is-open {
  border-color: rgba(255,255,255,0.1);
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
  min-height: 72px;
  padding: 16px 20px;
}

.moderation-header:hover {
  background: rgba(255,255,255,0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.moderation-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: #8E8E93;
  background: rgba(120,120,128,0.12);
  border: none;
}

.submissions-icon { color: #0A84FF; background: rgba(10,132,255,0.12); }
.students-icon { color: #30D158; background: rgba(48,209,88,0.12); }
.courses-icon { color: #5AC8FA; background: rgba(90,200,250,0.12); }
.tasks-icon { color: #FF9F0A; background: rgba(255,159,10,0.12); }
.reinforcement-icon { color: #FFD60A; background: rgba(255,214,10,0.12); }

.section-header h4 {
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}

.section-header p {
  color: #8E8E93;
  font-size: 12px;
  margin: 2px 0 0;
  letter-spacing: -0.01em;
}

.badge {
  background: rgba(120,120,128,0.12);
  color: #8E8E93;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-right: 0;
  box-shadow: none;
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
  background: rgba(48,209,88,0.1);
  color: #30D158;
}

.badge-amber {
  background: rgba(255,159,10,0.1);
  color: #FF9F0A;
}

.badge-gold {
  background: rgba(255,214,10,0.1);
  color: #FFD60A;
}

.badge-lilac {
  background: rgba(191,90,242,0.1);
  color: #BF5AF2;
}

.badge-indigo {
  background: rgba(94,92,230,0.1);
  color: #5E5CE6;
}

.badge.orange {
  background: rgba(255,159,10,0.1);
  color: #FF9F0A;
}

.chevron {
  color: #636366;
  font-size: 11px;
  transition: transform 0.25s ease;
  margin-left: 8px;
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
  align-items: flex-start;
  gap: 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.15s;
  animation: fadeInUp 0.3s ease both;
}
.item-card:hover {
  background: rgba(255,255,255,0.07);
}

.moderation-card .item-card {
  background: rgba(255,255,255,0.03);
  border: none;
  border-radius: 12px;
}

.moderation-card .item-card:hover {
  background: rgba(255,255,255,0.06);
}

.item-card:hover {
  background: rgba(255,255,255,0.06);
}

.item-info {
  flex: 1;
  min-width: 0;
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
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #0A84FF;
  border-radius: 4px;
  transition: width 0.6s ease;
  width: 100%;
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
  color: #0A84FF;
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 8px 12px;
  color: #fff;
  font-size: 12px;
  height: 38px;
  outline: none;
  transition: border-color 0.2s ease;
}

.filter-input::placeholder { color: #636366; }
.filter-input:focus { border-color: rgba(10,132,255,0.4); }

.task-type-badge {
  background: rgba(10,132,255,0.12);
  color: #0A84FF;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: capitalize;
  margin-right: 8px;
}

.arrow {
  color: #636366;
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
  color: #0A84FF;
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder { color: #636366; }

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #1C1C1E;
  color: #8E8E93;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
}
.icon-btn:hover { background: #2C2C2E; color: #fff; }

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
  border-top-color: #0A84FF;
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
  background: #1C1C1E;
  border-radius: 12px;
  padding: 12px;
  transition: background 0.2s ease;
}

.user-card:hover { background: #2C2C2E; }

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
  background: rgba(10,132,255,0.10);
  color: #0A84FF;
  padding: 2px 8px;
  border-radius: 6px;
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
  border: 0.5px solid rgba(255, 255, 255, 0.06);
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
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
  font-weight: 700;
  letter-spacing: -0.02em;
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
  border: 0.5px solid rgba(255, 255, 255, 0.06);
  background: #1C1C1E;
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
  border-radius: 16px;
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
.total-pill    { background: #0A84FF12; }

.stat-number {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}

.active-pill .stat-number   { color: #30D158; }
.inactive-pill .stat-number { color: #FF453A; }
.total-pill .stat-number    { color: #0A84FF; }

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
  box-shadow: 0 0 0 2px rgba(10,132,255,0.25);
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
  border-radius: 14px;
  padding: 14px 16px;
  transition: background 0.2s ease;
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
  background: #30D158;
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

.activation-user-username {
  display: block;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
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
  background: rgba(10,132,255,0.10);
  color: #0A84FF;
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

.toggle-self {
  background: #3A3A3C;
  color: #636366;
  cursor: default;
  opacity: 0.55;
}

.toggle-self:hover {
  background: #3A3A3C;
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
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
  background: rgba(255,255,255,0.04);
  border: 0.5px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.enroll-pill-tab:hover:not(.active) {
  background: rgba(255,255,255,0.07);
  color: #D1D1D6;
}

.enroll-pill-tab.active {
  background: rgba(10,132,255,0.12);
  color: #0A84FF;
  border-color: rgba(10,132,255,0.20);
  box-shadow: none;
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 20px;
  box-shadow: none;
}

.enroll-hero-glow {
  position: absolute;
  top: -60px; right: -40px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: none;
  pointer-events: none;
}

.enroll-hero-glow--blue {
  background: none;
}

.enroll-hero-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.enroll-hero-icon-wrap {
  width: 44px; height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10,132,255,0.10);
  border: 0.5px solid rgba(10,132,255,0.15);
}

.enroll-hero-icon-wrap--blue {
  background: rgba(90,200,250,0.08);
  border-color: rgba(90,200,250,0.15);
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
  border: 0.5px solid rgba(255,255,255,0.06);
  color: #8E8E93;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.enroll-reload-btn:hover {
  background: rgba(255,255,255,0.10);
  color: #fff;
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
  border-radius: 12px;
  border: 0.5px solid transparent;
  gap: 3px;
}

.enroll-kpi:hover { transform: none; }

.enroll-kpi-num {
  font-size: 24px;
  font-weight: 700;
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
.enroll-kpi.is-indigo { background: rgba(10,132,255,0.08); border-color: rgba(10,132,255,0.15); color: #0A84FF; }

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
  background: rgba(255,255,255,0.04);
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 9px 12px;
  transition: border-color 0.2s ease;
}

.enroll-filter-field:focus-within {
  border-color: rgba(10,132,255,0.30);
  background: rgba(10,132,255,0.04);
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

.enroll-filter-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 11px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  color: #8E8E93;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}
.enroll-filter-toggle:hover { background: rgba(255,69,58,0.08); border-color: rgba(255,69,58,0.3); color: #FF6B6B; }
.enroll-filter-toggle.active { background: rgba(255,69,58,0.12); border-color: rgba(255,69,58,0.45); color: #FF453A; }

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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: background 0.2s ease;
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.enroll-card:hover {
  background: #242426;
  box-shadow: none;
  transform: none;
}

.enroll-card-accent {
  width: 4px;
  flex-shrink: 0;
  background: #0A84FF;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.enroll-card:hover .enroll-card-accent { opacity: 0.8; }

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
  border: none;
  flex-shrink: 0;
  background: #2C2C2E;
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

.enroll-requested-role-row { margin-top: 6px; }
.enroll-requested-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.enroll-requested-role-badge.docente {
  color: #BF5AF2;
  background: rgba(191, 90, 242, 0.12);
  border: 1px solid rgba(191, 90, 242, 0.25);
}

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
.enroll-role-chip.tone-admin   { color: #BF5AF2; background: rgba(191,90,242,0.1); border-color: rgba(191,90,242,0.2);  }
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
  box-shadow: none;
}

.enroll-btn-reject {
  background: rgba(255,69,58,0.08);
  color: #FC8181;
  border: 1px solid rgba(255,69,58,0.15);
}

.enroll-btn-reject:hover {
  background: rgba(255,69,58,0.2);
  box-shadow: none;
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: background 0.2s ease;
}

.enroll-course-group:hover { background: #222224; }

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
  border-radius: 8px;
  background: rgba(10,132,255,0.10);
  border: 0.5px solid rgba(10,132,255,0.15);
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
  color: #0A84FF;
  background: rgba(10,132,255,0.10);
  border: 0.5px solid rgba(10,132,255,0.15);
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.enroll-course-group-subjects { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

.enroll-subj-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 10px;
  background: rgba(10,132,255,0.06);
  border: 0.5px solid rgba(10,132,255,0.10);
  transition: background 0.2s ease;
  max-width: 200px;
}

.enroll-subj-card:hover {
  background: rgba(10,132,255,0.10);
}

.enroll-subj-card-thumb {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.enroll-subj-card-thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10,132,255,0.08);
}

.enroll-subj-card-name {
  font-size: 11.5px;
  font-weight: 600;
  color: #0A84FF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
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

.enroll-block-chips { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; max-width: 320px; }

.enroll-block-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px 4px 4px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #0A84FF;
  background: rgba(10,132,255,0.08);
  border: 0.5px solid rgba(10,132,255,0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.enroll-block-chip-thumb {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.enroll-block-chip-thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10,132,255,0.08);
}

.enroll-block-chip-icon { flex-shrink: 0; }

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
  cursor: pointer;
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
  box-shadow: none;
}
.enroll-restore-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ─── Inactive course/subject enrollment status (dimmed) ─── */

.enroll-enrolled-row.is-inactive-course {
  background: rgba(255,193,7,0.04);
  border: 1px dashed rgba(255,193,7,0.25);
  opacity: 0.6;
}
.enroll-enrolled-row.is-inactive-course .enroll-user-name { color: #A1A1AA; }
.enroll-enrolled-row.is-inactive-course .enroll-user-handle { color: #71717A; }
.enroll-enrolled-row.is-inactive-course .enroll-avatar { filter: grayscale(70%) opacity(0.6); }
.enroll-enrolled-row.is-inactive-course:hover { opacity: 0.8; background: rgba(255,193,7,0.08); }

.enroll-inactive-badge {
  font-size: 10px;
  font-weight: 700;
  color: #FBBF24;
  background: rgba(251,191,36,0.12);
  border-radius: 6px;
  padding: 1px 6px;
  margin-top: 2px;
  display: inline-block;
}

.enroll-activate-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #34D399;
  background: rgba(52,211,153,0.08);
  border: 1px solid rgba(52,211,153,0.18);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.enroll-activate-btn:hover:not(:disabled) {
  background: rgba(52,211,153,0.2);
  box-shadow: none;
}
.enroll-activate-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.enroll-deactivate-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #FBBF24;
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.14);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.enroll-deactivate-btn:hover:not(:disabled) {
  background: rgba(251,191,36,0.2);
  box-shadow: none;
}
.enroll-deactivate-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.enroll-revoke-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #FF453A;
  background: rgba(255,69,58,0.08);
  border: 1px solid rgba(255,69,58,0.14);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.enroll-revoke-btn:hover:not(:disabled) {
  background: rgba(255,69,58,0.2);
  box-shadow: none;
}
.enroll-revoke-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.enroll-deactivate-subj-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: #FBBF24;
  background: rgba(251,191,36,0.06);
  border: 1px solid rgba(251,191,36,0.14);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.enroll-deactivate-subj-btn:hover:not(:disabled) {
  background: rgba(251,191,36,0.16);
}
.enroll-deactivate-subj-btn:disabled { opacity: 0.4; pointer-events: none; }

.enroll-block-chip.is-inactive-subject {
  color: #FBBF24;
  background: rgba(251,191,36,0.06);
  border-color: rgba(251,191,36,0.2);
  opacity: 0.7;
}
.enroll-block-chip.is-inactive-subject svg { opacity: 0.7; color: #FBBF24; }

.enroll-revoke-reason {
  font-size: 11px;
  color: #FC8181;
  margin-top: 2px;
  font-style: italic;
}

.enroll-hero-glow--red { background: none; }
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 26px 22px 22px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
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
.enroll-dialog-textarea:focus { border-color: rgba(10,132,255,0.3); }

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

.enroll-dialog-error {
  font-size: 0.78rem;
  color: #FC8181;
  background: rgba(255,69,58,0.1);
  border: 1px solid rgba(255,69,58,0.25);
  border-radius: 8px;
  padding: 6px 10px;
  margin: 0 0 8px;
}

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
  box-shadow: none;
}

.enroll-dialog-confirm.is-amber {
  background: rgba(255,149,0,0.14);
  border: 1px solid rgba(255,149,0,0.3);
  color: #FB923C;
}

.enroll-dialog-confirm.is-amber:hover:not(:disabled) {
  background: rgba(255,149,0,0.28);
  box-shadow: none;
}

.enroll-dialog-confirm.is-green {
  background: rgba(48,209,88,0.14);
  border: 1px solid rgba(48,209,88,0.3);
  color: #34D399;
}

.enroll-dialog-confirm.is-green:hover:not(:disabled) {
  background: rgba(48,209,88,0.28);
  box-shadow: none;
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
.a-stats-grid .a-stat-card:nth-child(1) { animation: slideUp 0.35s ease 0.05s both; }
.a-stats-grid .a-stat-card:nth-child(2) { animation: slideUp 0.35s ease 0.10s both; }
.a-stats-grid .a-stat-card:nth-child(3) { animation: slideUp 0.35s ease 0.15s both; }
.a-stats-grid .a-stat-card:nth-child(4) { animation: slideUp 0.35s ease 0.20s both; }

/* Analytics cards */
.a-card:nth-child(1) { animation: slideUp 0.35s ease 0.10s both; }
.a-card:nth-child(2) { animation: slideUp 0.35s ease 0.16s both; }
.a-card:nth-child(3) { animation: slideUp 0.35s ease 0.22s both; }
.a-card:nth-child(4) { animation: slideUp 0.35s ease 0.28s both; }
.a-card:nth-child(5) { animation: slideUp 0.35s ease 0.34s both; }

/* Hover lift on cards */
.a-stat-card { transition: transform 0.2s ease, border-color 0.2s ease; }
.a-stat-card:hover { transform: none; box-shadow: none; border-color: rgba(255,255,255,0.10); }
.a-card { transition: border-color 0.2s ease; }
.a-card:hover { transform: none; box-shadow: none; border-color: rgba(255,255,255,0.10); }

/* Moderation summary — staggered */
.moderation-stat-card:nth-child(1) { animation: slideUp 0.35s ease 0.05s both; }
.moderation-stat-card:nth-child(2) { animation: slideUp 0.35s ease 0.10s both; }
.moderation-stat-card:nth-child(3) { animation: slideUp 0.35s ease 0.15s both; }
.moderation-stat-card:nth-child(4) { animation: slideUp 0.35s ease 0.20s both; }

/* Moderation accordion */
.moderation-stack .moderation-card:nth-child(1) { animation: slideUp 0.3s ease 0.05s both; }
.moderation-stack .moderation-card:nth-child(2) { animation: slideUp 0.3s ease 0.10s both; }
.moderation-stack .moderation-card:nth-child(3) { animation: slideUp 0.3s ease 0.15s both; }
.moderation-stack .moderation-card:nth-child(4) { animation: slideUp 0.3s ease 0.20s both; }
.moderation-stack .moderation-card:nth-child(5) { animation: slideUp 0.3s ease 0.25s both; }

/* Enrollment, cert, user cards */
.enrollment-card { animation: slideUp 0.3s ease both; }
.cert-card        { animation: slideUp 0.3s ease both; }

/* Tab content fade on switch */
.tab-content { animation: fadeIn 0.22s ease both; }

/* Gauge arc entrance */
@keyframes gaugePop { from { opacity: 0; } }
.a-gauge-arc { animation: gaugePop 0.6s ease 0.3s both; }

/* Progress bar fill animation */
@keyframes fillBar { from { width: 0 !important; } }
.progress-fill { animation: fillBar 0.6s ease 0.2s both; }

/* Active tab glow */
.tab-btn.active { box-shadow: none; }

/* Stat value entrance */
@keyframes valueIn { from { opacity: 0; transform: translateY(8px); } }
.a-stat-value { animation: valueIn 0.45s ease 0.25s both; }

/* Cert card hover */
.cert-card { transition: background 0.2s ease; }
.cert-card:hover { transform: none; box-shadow: none; background: #242426; }

/* ─── Progreso por Materia (sp-*) ──────────────────────────────────────── */
.badge-indigo {
  background: rgba(10,132,255,0.12);
  color: #0A84FF;
}

.sp-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
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
  background: #1C1C1E;
  border: 0.5px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.sp-filter-input::placeholder { color: #636366; }
.sp-filter-input:focus { border-color: rgba(10,132,255,0.30); }

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
  background: rgba(10,132,255,0.10);
  border: 0.5px solid rgba(10,132,255,0.20);
  border-radius: 6px;
  color: #0A84FF;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s;
}
.sp-clear-btn:hover { background: rgba(10,132,255,0.20); }

.sp-table-wrap {
  overflow-x: auto;
  border-radius: 10px;
  border: 0.5px solid rgba(255,255,255,0.06);
}

.sp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sp-table thead th {
  position: sticky;
  top: 0;
  background: #1C1C1E;
  color: #8E8E93;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.05em;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 0.5px solid rgba(255,255,255,0.06);
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
  background: #2C2C2E;
}

.sp-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0A84FF;
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
  background: rgba(10,132,255,0.12);
  border-radius: 4px;
  color: #0A84FF;
  font-size: 11px;
  font-weight: 500;
}
.sp-id-inline { color: #9ca3af; font-size: 11px; }

.sp-id-cell { color: inherit; }
.sp-id-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(10,132,255,0.10);
  border: 0.5px solid rgba(10,132,255,0.20);
  border-radius: 5px;
  color: #0A84FF;
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
  background: rgba(10,132,255,0.12);
  border-radius: 10px;
  color: #0A84FF;
  font-size: 12px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sp-subject-pill.sp-subject-inactive {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  text-decoration: line-through;
  opacity: 0.75;
}

.sp-status-cell { white-space: nowrap; }
.sp-status-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: none;
  border-radius: 14px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 90px;
  justify-content: center;
}
.sp-status-btn:disabled { opacity: 0.5; cursor: wait; }
.sp-status-active {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}
.sp-status-active:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}
.sp-status-inactive {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}
.sp-status-inactive:hover:not(:disabled) {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}
.sp-status-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.sp-row.sp-row-inactive {
  opacity: 0.55;
}
.sp-row.sp-row-inactive .sp-status-btn {
  opacity: 1;
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
.sp-fill-good { background: #30D158; }
.sp-fill-mid  { background: #0A84FF; }
.sp-fill-low  { background: #FF9F0A; }
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
  background: rgba(10,132,255,0.15);
  border-color: rgba(10,132,255,0.25);
}
.sp-page-btn:disabled { opacity: 0.35; cursor: default; }

.sp-page-info { color: #9ca3af; font-size: 13px; }

/* ═══════════════════════════════════════════════════════
   RESPONSIVE — TABLET 768px+
   ═══════════════════════════════════════════════════════ */
@media (min-width: 768px) {
  .tabs-container {
    padding: 12px 24px;
    gap: 8px;
    justify-content: center;
  }

  .tab-btn {
    padding: 9px 22px;
    font-size: 14px;
  }

  .tab-content {
    padding: 20px 32px 48px;
  }

  .moderation-tab {
    padding-top: 12px;
  }

  .a-stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .moderation-summary-grid {
    gap: 12px;
  }

  .a-gauges-row {
    gap: 32px;
    justify-content: center;
  }

  .a-gauge-ring {
    width: 88px;
    height: 88px;
  }

  .a-gauge-val {
    font-size: 18px;
  }

  .a-gauge-lbl {
    font-size: 13px;
  }

  .a-card {
    padding: 20px;
  }

  .a-grouped-bars {
    gap: 12px;
  }

  .sp-filter-wrap {
    min-width: 200px;
  }

  .enroll-filter-bar {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .enroll-actions-col {
    flex-shrink: 0;
  }

  .activation-user-card {
    padding: 16px 20px;
  }
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE — DESKTOP 1024px+
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1024px) {
  .admin-dashboard {
    display: grid;
    grid-template-columns: 230px 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
    overflow: hidden;
  }

  /* TopBar spans both columns */
  .admin-dashboard :deep(header.top-bar) {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  /* Sidebar nav */
  .tabs-container {
    grid-column: 1;
    grid-row: 2;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 4px;
    padding: 16px 10px;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    overflow-y: auto;
    overflow-x: hidden;
    position: static;
    height: auto;
    scrollbar-width: thin;
  }

  .tab-btn {
    width: 100%;
    text-align: left;
    border-radius: 12px;
    padding: 11px 18px;
    font-size: 14px;
    justify-content: flex-start;
    white-space: nowrap;
  }

  .tab-btn.active {
    box-shadow: 0 2px 12px rgba(108, 99, 255, 0.35);
  }

  /* Content area */
  .tab-content {
    grid-column: 2;
    grid-row: 2;
    padding: 28px 48px 40px;
    overflow-y: auto;
    max-width: none;
  }

  .moderation-tab {
    padding-top: 16px;
  }

  /* Stats: 4 columns */
  .a-stats-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .a-stat-value {
    font-size: 30px;
  }

  .a-card {
    padding: 22px;
    margin-bottom: 16px;
  }

  .a-card-header h3 {
    font-size: 16px;
  }

  /* Rank lists: wider */
  .a-rank-list {
    gap: 10px;
  }

  .a-rank-row {
    padding: 12px 16px;
  }

  /* Moderation grid: 4 cols, more space */
  .moderation-summary-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .moderation-stat-card {
    padding: 20px 12px;
    border-radius: 24px;
  }

  .moderation-stat-value {
    font-size: 30px;
  }

  .moderation-stack {
    gap: 16px;
  }

  .section-header {
    padding: 18px 20px;
  }

  .section-content {
    padding: 16px 20px;
  }

  /* Enrollment: better desktop layout */
  .enroll-hero {
    padding: 24px;
    border-radius: 20px;
  }

  .enroll-kpi-row {
    gap: 16px;
  }

  .enroll-kpi {
    min-width: 100px;
    padding: 14px 20px;
  }

  .enroll-list {
    gap: 12px;
  }

  .enroll-card {
    padding: 20px;
  }

  .enroll-course-groups {
    gap: 16px;
  }

  /* Activation */
  .activation-user-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .activation-user-card {
    padding: 18px 22px;
  }

  .activation-header-card {
    padding: 24px;
  }

  /* Certificates */
  .certificates-admin-section .items-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .cert-card {
    margin-bottom: 0;
  }

  /* Filters: side by side */
  .pending-filters {
    display: flex;
    gap: 12px;
  }

  .pending-filters .filter-input {
    flex: 1;
  }

  .reinforcement-filters {
    gap: 12px;
  }

  /* Progress by subject table: more padding */
  .sp-table td,
  .sp-table thead th {
    padding: 12px 16px;
  }
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE — LARGE DESKTOP 1400px+
   ═══════════════════════════════════════════════════════ */
@media (min-width: 1400px) {
  .admin-dashboard {
    grid-template-columns: 250px 1fr;
  }

  .tab-content {
    padding: 32px 64px 48px;
  }

  .activation-user-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .certificates-admin-section .items-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ─── Block detail rows ─── */
.enroll-block-details {
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(255, 69, 58, 0.06);
  border: 1px solid rgba(255, 69, 58, 0.15);
  border-radius: 10px;
}
.enroll-block-detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 0;
}
.enroll-block-detail-row + .enroll-block-detail-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.enroll-block-detail-header {
  display: flex;
  align-items: center;
  gap: 5px;
}
.enroll-block-detail-subj {
  font-size: 12px;
  font-weight: 600;
  color: #FF453A;
}
.enroll-block-detail-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding-left: 15px;
}
.enroll-block-detail-reason {
  font-size: 11px;
  color: #e5e7eb;
  font-style: italic;
}
.enroll-block-detail-date {
  font-size: 10px;
  color: #6b7280;
}
.enroll-block-detail-by {
  font-size: 10px;
  color: #0A84FF;
}

/* ─── Responsive: enrollment tab (mobile) ──────────────────────────── */
@media (max-width: 600px) {

  /* Pill sub-tabs: full width */
  .enroll-pill-tabs {
    gap: 6px;
    padding: 6px 8px;
  }

  .enroll-pill-tab {
    flex: 1;
    justify-content: center;
    font-size: 12.5px;
    padding: 8px 10px;
  }

  /* Hero card: reduce padding */
  .enroll-hero {
    padding: 14px 14px;
    border-radius: 16px;
  }

  .enroll-hero-top {
    gap: 10px;
    margin-bottom: 12px;
  }

  .enroll-hero-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .enroll-hero-title {
    font-size: 15px;
  }

  .enroll-hero-sub {
    font-size: 11.5px;
  }

  /* KPI row: smaller numbers */
  .enroll-kpi-num {
    font-size: 20px;
  }

  .enroll-kpi-lbl {
    font-size: 10px;
  }

  .enroll-kpi {
    padding: 10px 6px;
    border-radius: 12px;
  }

  /* Filter bar: full-width fields stacked */
  .enroll-filter-bar {
    flex-direction: column;
    gap: 6px;
  }

  .enroll-filter-field {
    min-width: 0;
  }

  /* Pre-matrícula card: stack vertically */
  .enroll-card {
    flex-direction: column;
  }

  .enroll-card-accent {
    width: 100%;
    height: 3px;
  }

  .enroll-card-body {
    padding: 12px 14px 10px;
  }

  .enroll-actions-col {
    flex-direction: row;
    padding: 0 14px 14px;
    gap: 8px;
  }

  .enroll-btn-approve,
  .enroll-btn-reject {
    flex: 1;
    min-width: 0;
    height: 38px;
    font-size: 12.5px;
  }

  /* Course groups: reduce padding & font */
  .enroll-course-group-header {
    padding: 12px 14px;
  }

  .enroll-course-group-name {
    font-size: 13.5px;
  }

  /* Subjects row: horizontal scroll on mobile */
  .enroll-course-group-subjects {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .enroll-course-group-subjects::-webkit-scrollbar { display: none; }

  .enroll-subj-card {
    flex-shrink: 0;
  }

  /* User rows: stack left/right vertically */
  .enroll-user-rows {
    padding: 6px 10px 10px;
    gap: 6px;
  }

  .enroll-enrolled-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 10px;
  }

  .enroll-enrolled-left {
    width: 100%;
  }

  .enroll-enrolled-right {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
  }

  /* Action buttons: full width on mobile */
  .enroll-activate-btn,
  .enroll-deactivate-btn,
  .enroll-revoke-btn,
  .enroll-restore-btn {
    width: 100%;
    justify-content: center;
  }

  /* Subject chips: wrap from left */
  .enroll-block-chips {
    justify-content: flex-start;
    max-width: 100%;
  }

  /* Block details: full width */
  .enroll-block-details {
    width: 100%;
    box-sizing: border-box;
  }

  /* Section padding */
  .enroll-section {
    padding: 0 10px 24px;
    gap: 10px;
  }
}

/* ═══════ Funnel Chart ═══════ */
.a-funnel-card { padding-bottom: 4px; }
.a-funnel-body {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 4px 0;
}
.a-funnel-svg {
  flex-shrink: 0;
  width: 172px;
  height: 132px;
  filter: none;
}
@keyframes funnelSlide {
  from { opacity: 0; clip-path: inset(0 50% 0 50%); }
  to   { opacity: 1; clip-path: inset(0 0% 0 0%); }
}
.a-funnel-polygon {
  animation: funnelSlide 0.5s ease both;
}
.a-funnel-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.a-funnel-legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.a-funnel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: none;
}
.a-funnel-leg-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.a-funnel-legend-label {
  font-size: 12px;
  color: #8E8E93;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.a-funnel-legend-pct {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Institutions Tab Styles (SuperAdmin) */
/* ═══════ Institutions Tab ═══════ */
.institutions-tab {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.inst-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 14px;
}

.inst-search-bar svg {
  opacity: 0.5;
  flex-shrink: 0;
}

.inst-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary, #fff);
  font-size: 14px;
}

.inst-search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.inst-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inst-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.2s, background 0.2s;
}

.inst-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
}

.inst-card.inst-suspended {
  border-color: rgba(255, 69, 58, 0.25);
  background: rgba(255, 69, 58, 0.04);
}

.inst-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.inst-info {
  flex: 1;
  min-width: 0;
}

.inst-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  line-height: 1.3;
}

.inst-meta {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.5);
}

.inst-tenant-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(94, 92, 230, 0.2);
  color: #8E8CE6;
  margin-left: 6px;
  vertical-align: middle;
  letter-spacing: 0.3px;
}

.inst-status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-green {
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
}

.badge-red {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
}

.inst-payment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.inst-payment-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inst-payment-label {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.5);
}

.inst-monthly-price {
  font-size: 14px;
  font-weight: 600;
  color: #A78BFA;
}

.inst-price-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: rgba(167, 139, 250, 0.15);
  color: #A78BFA;
  cursor: pointer;
  transition: background 0.15s;
}

.inst-price-edit-btn:hover {
  background: rgba(167, 139, 250, 0.3);
}

.inst-payment-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #fff);
}

.inst-payment-value.is-overdue {
  color: #FF453A;
  font-weight: 600;
}

.inst-actions {
  display: flex;
  gap: 6px;
}

.inst-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.inst-action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.inst-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.inst-date-btn:hover:not(:disabled) {
  border-color: rgba(10, 132, 255, 0.5);
  color: #0A84FF;
}

.inst-suspend-btn:hover:not(:disabled) {
  border-color: rgba(255, 69, 58, 0.5);
  color: #FF453A;
}

.inst-unsuspend-btn:hover:not(:disabled) {
  border-color: rgba(48, 209, 88, 0.5);
  color: #30D158;
}

.inst-suspended-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 69, 58, 0.08);
  font-size: 12px;
  color: rgba(255, 69, 58, 0.85);
}

/* ─── Service Payments ─── */
.inst-payments-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.inst-payments-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.inst-payments-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.inst-payment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
}
.inst-pay-status {
  font-weight: 700;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.inst-pay-status.pay-approved {
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
}
.inst-pay-status.pay-pending {
  background: rgba(255, 214, 10, 0.15);
  color: #FFD60A;
}
.inst-pay-status.pay-declined, .inst-pay-status.pay-failed {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
}
.inst-pay-amount {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}
.inst-pay-date {
  color: rgba(255, 255, 255, 0.4);
}
.inst-pay-period {
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
}
.inst-no-payments {
  padding-top: 8px;
}
.inst-no-pay-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

/* ─── Modals ─── */
.inst-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: env(safe-area-inset-top, 20px) 16px env(safe-area-inset-bottom, 20px);
  padding-top: max(env(safe-area-inset-top, 0px), 20px);
  padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px);
  overflow-y: auto;
}

.inst-modal {
  background: var(--bg-secondary, #1C1C1E);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  padding-bottom: 16px;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 40px);
  max-height: calc(100dvh - 40px);
  overflow-y: auto;
  margin: auto 0;
}

.inst-modal h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #fff);
}

.inst-modal-sub {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.inst-modal-warning {
  margin: 0;
  font-size: 13px;
  color: #FF453A;
  background: rgba(255, 69, 58, 0.08);
  padding: 10px 12px;
  border-radius: 10px;
}

.inst-date-input,
.inst-reason-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary, #fff);
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.inst-date-input:focus,
.inst-reason-input:focus {
  border-color: rgba(139, 92, 246, 0.5);
}

.inst-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  position: sticky;
  bottom: 0;
  background: var(--bg-secondary, #1C1C1E);
  padding-top: 10px;
  padding-bottom: 4px;
  z-index: 1;
}

.inst-modal-btn {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.inst-modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inst-modal-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}

.inst-modal-save {
  background: linear-gradient(135deg, #0A84FF, #5E5CE6);
  color: #fff;
}

.inst-modal-danger {
  background: linear-gradient(135deg, #FF453A, #FF3B30);
  color: #fff;
}

/* ─── Billing Cycle Picker ─── */
.cycle-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cycle-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.2s;
}

.cycle-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.cycle-option.active {
  border-color: rgba(139, 92, 246, 0.5);
  background: rgba(139, 92, 246, 0.08);
}

.cycle-option input[type="radio"] {
  accent-color: #8B5CF6;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.cycle-option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cycle-option-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.cycle-option-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.cycle-day-picker {
  margin-top: 4px;
}

.cycle-day-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  display: block;
}

.cycle-day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cycle-day-btn {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
}

.cycle-day-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.cycle-day-btn.selected {
  background: linear-gradient(135deg, #0A84FF, #5E5CE6);
  color: #fff;
  border-color: transparent;
  font-weight: 700;
}

/* Recurrence picker (once / every month) */
.cycle-recurrence-picker {
  margin-top: 14px;
  margin-bottom: 4px;
}

.cycle-recurrence-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.cycle-recurrence-btn {
  flex: 1;
  padding: 9px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(60, 60, 62, 0.6);
  background: rgba(44, 44, 46, 0.4);
  color: #8E8E93;
  transition: all 0.2s ease;
  text-align: center;
}

.cycle-recurrence-btn:hover {
  background: rgba(44, 44, 46, 0.7);
  color: #EBEBF5;
}

.cycle-recurrence-btn.active {
  background: rgba(10, 132, 255, 0.15);
  border-color: #0A84FF;
  color: #0A84FF;
}

/* Month selector grid */
.cycle-month-picker {
  margin-top: 14px;
}

.cycle-month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 6px;
}

.cycle-month-btn {
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.15s ease;
}

.cycle-month-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.cycle-month-btn.selected {
  background: linear-gradient(135deg, #0A84FF, #5E5CE6);
  color: #fff;
  border-color: transparent;
  font-weight: 700;
}

.inst-payment-next {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.cycle-hour-picker {
  margin-top: 16px;
}

.cycle-hour-select {
  width: 100%;
  padding: 10px 36px 10px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: border-color 0.15s;
}

.cycle-hour-select:focus {
  border-color: rgba(10, 132, 255, 0.5);
}

.cycle-hour-select option {
  background: #2C2C2E;
  color: #fff;
}

.cycle-action-mode {
  margin-top: 14px;
}

.cycle-action-mode-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.cycle-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(44, 44, 46, 0.5);
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.cycle-action-btn:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.cycle-action-btn.active.mode-warning {
  background: rgba(255, 159, 10, 0.15);
  border-color: rgba(255, 159, 10, 0.5);
  color: #FF9F0A;
}

.cycle-action-btn.active.mode-suspend {
  background: rgba(255, 69, 58, 0.15);
  border-color: rgba(255, 69, 58, 0.5);
  color: #FF453A;
}

.cycle-action-hint {
  font-size: 11px;
  color: #FF9F0A;
  margin-top: 6px;
  line-height: 1.4;
}

.cycle-action-hint-danger {
  color: #FF453A;
}

.inst-modal-danger-soft {
  background: rgba(255, 69, 58, 0.12);
  color: #ff8a84;
  border: 1px solid rgba(255, 69, 58, 0.18);
}

.inst-modal-danger-soft:hover {
  background: rgba(255, 69, 58, 0.18);
}

/* ═══════ Cycle Quick Billing ═══════ */
.cycle-quick-row {
  margin-top: 16px;
  padding: 14px 16px;
  background: rgba(255, 159, 10, 0.06);
  border: 1px solid rgba(255, 159, 10, 0.15);
  border-radius: 12px;
}

.cycle-quick-input {
  width: 64px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: border-color 0.15s;
  -moz-appearance: textfield;
}

.cycle-quick-input::-webkit-outer-spin-button,
.cycle-quick-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cycle-quick-input:focus {
  border-color: rgba(255, 159, 10, 0.5);
}

.cycle-quick-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: rgba(255, 159, 10, 0.15);
  color: #FF9F0A;
  transition: background 0.15s;
}

.cycle-quick-btn:hover {
  background: rgba(255, 159, 10, 0.25);
}

/* ═══════ App Charts (vue-chrts) dark theme ═══════ */
.app-chart-section :deep(.unovis-xy-container) {
  --vis-axis-tick-label-color: #636366;
  --vis-axis-grid-color: rgba(255,255,255,0.06);
  --vis-axis-domain-color: rgba(255,255,255,0.08);
  --vis-tooltip-background-color: #2C2C2E;
  --vis-tooltip-text-color: #EBEBF5;
  --vis-tooltip-border-color: rgba(255,255,255,0.1);
  --vis-crosshair-line-stroke-color: rgba(255,255,255,0.2);
}

.app-chart-section :deep(text) {
  fill: #636366;
  font-size: 11px;
}

.app-chart-section :deep(.unovis-axis line),
.app-chart-section :deep(.unovis-axis path) {
  stroke: rgba(255,255,255,0.08);
}

/* ─── Monthly AreaChart tooltip gauge ─── */
.a-monthly-tooltip-gauge {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}
.a-monthly-tooltip-gauge svg { width: 100%; height: 100%; }
.a-monthly-tooltip-gauge-val {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #EBEBF5;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STANDARDS TAB — Apple Design System
   Typography: SF Pro Display (600) / SF Pro Text (400)
   Colors: Fog Canvas #f5f5f7, Apple Ink #1d1d1f, Electric Blue #0071e3
   Border radius: 28px cards, no shadows
   ═══════════════════════════════════════════════════════════════════════════ */

.standards-tab {
  padding: 0;
  background: #0a0a0a;
  min-height: 100vh;
}

.standards-hero {
  padding: 48px 24px 40px;
  text-align: center;
  background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
}

.standards-hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.standards-eyebrow {
  display: inline-block;
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #0071e3;
  margin-bottom: 12px;
}

.standards-hero h2 {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #f5f5f7;
  margin: 0 0 12px;
  line-height: 1.1;
}

.standards-hero p {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: rgba(245, 245, 247, 0.6);
  line-height: 1.5;
  margin: 0;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 0 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.standards-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.standards-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.standards-card-featured {
  background: linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(0, 113, 227, 0.02) 100%);
  border-color: rgba(0, 113, 227, 0.2);
}

.standards-card-featured:hover {
  border-color: rgba(0, 113, 227, 0.35);
}

.standards-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.standards-icon-caliper {
  background: rgba(52, 199, 89, 0.12);
  color: #34C759;
}

.standards-icon-xapi {
  background: rgba(0, 122, 255, 0.12);
  color: #007AFF;
}

.standards-icon-qti {
  background: rgba(175, 82, 222, 0.12);
  color: #AF52DE;
}

.standards-icon-oneroster {
  background: rgba(255, 149, 0, 0.12);
  color: #FF9500;
}

.standards-icon-lti {
  background: rgba(0, 113, 227, 0.15);
  color: #0071e3;
}

.standards-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.standards-card-body h3 {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #f5f5f7;
  margin: 0;
  letter-spacing: -0.01em;
}

.standards-card-desc {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(245, 245, 247, 0.6);
  line-height: 1.5;
  margin: 0;
}

.standards-features {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.standards-features li {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(245, 245, 247, 0.5);
  padding-left: 18px;
  position: relative;
}

.standards-features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(245, 245, 247, 0.25);
}

.standards-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.standards-status {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 980px;
}

.standards-status-ready {
  background: rgba(52, 199, 89, 0.12);
  color: #34C759;
}

.standards-status-beta {
  background: rgba(255, 159, 10, 0.12);
  color: #FF9F0A;
}

.standards-version {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  font-weight: 500;
  color: rgba(245, 245, 247, 0.35);
  letter-spacing: 0.02em;
}

.standards-info {
  padding: 0 24px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.standards-info-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 24px 28px;
  text-align: center;
}

.standards-info-card h4 {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: #f5f5f7;
  margin: 0 0 8px;
}

.standards-info-card p {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(245, 245, 247, 0.5);
  line-height: 1.6;
  margin: 0;
  max-width: 640px;
  margin: 0 auto;
}

.standards-tab {
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.11), transparent 34%),
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.08), transparent 30%),
    #0A0A0A;
}

.standards-hero {
  max-width: 1180px;
  margin: 0 auto 18px;
  padding: 30px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 18px;
  text-align: left;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 26px;
}

.standards-hero-copy {
  min-width: 0;
}

.standards-hero h2 {
  font-size: clamp(30px, 4vw, 48px);
  max-width: 780px;
}

.standards-hero p {
  max-width: 760px;
}

.standards-hero-panel {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.standards-hero-panel span,
.standards-pill {
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #93C5FD;
}

.standards-hero-panel strong {
  color: #F8FAFC;
  font-size: 24px;
  letter-spacing: -0.02em;
}

.standards-hero-panel p {
  color: rgba(245, 245, 247, 0.56);
  font-size: 13px;
  line-height: 1.45;
}

.standards-matrix,
.standards-info {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0;
}

.standards-matrix {
  background: rgba(255, 255, 255, 0.026);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 24px;
  overflow: hidden;
}

.standards-matrix-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.standards-matrix-header h3 {
  margin: 5px 0 0;
  color: #F5F5F7;
  font-size: 20px;
  letter-spacing: -0.01em;
}

.standards-pill {
  padding: 7px 10px;
  border-radius: 999px;
  color: #A7F3D0;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.18);
  flex-shrink: 0;
}

.standards-table {
  display: grid;
}

.standards-table-row {
  display: grid;
  grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1fr) minmax(260px, 1.15fr);
  gap: 18px;
  align-items: start;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.standards-table-row:last-child {
  border-bottom: 0;
}

.standards-table-head {
  padding-top: 12px;
  padding-bottom: 12px;
  background: rgba(255, 255, 255, 0.028);
}

.standards-table-head span {
  color: rgba(245, 245, 247, 0.48);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.standards-standard-row {
  position: relative;
}

.standards-standard-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 999px;
  background: var(--standard-accent);
}

.standards-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.standards-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: var(--standard-accent);
  background: color-mix(in srgb, var(--standard-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--standard-accent) 24%, transparent);
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.standards-name-cell strong {
  display: block;
  color: #F8FAFC;
  font-size: 15px;
  line-height: 1.2;
}

.standards-name-cell small {
  display: block;
  margin-top: 4px;
  color: rgba(245, 245, 247, 0.45);
  font-size: 12px;
  line-height: 1.35;
}

.standards-standard-row p {
  margin: 0;
  color: rgba(245, 245, 247, 0.66);
  font-size: 14px;
  line-height: 1.55;
}

.standards-info {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 18px;
  margin-top: 18px;
  padding-bottom: 38px;
}

.standards-info-card {
  text-align: left;
  background: rgba(255, 255, 255, 0.028);
  border-color: rgba(255, 255, 255, 0.07);
}

.standards-info-card h4 {
  font-size: 22px;
}

.standards-info-card p {
  margin: 0;
  max-width: none;
  color: rgba(245, 245, 247, 0.62);
}

.standards-next-grid {
  display: grid;
  gap: 10px;
}

.standards-next-item {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.028);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.standards-next-item span {
  color: #60A5FA;
  font-size: 12px;
  font-weight: 800;
}

.standards-next-item h4 {
  margin: 5px 0 5px;
  color: #F8FAFC;
  font-size: 15px;
}

.standards-next-item p {
  margin: 0;
  color: rgba(245, 245, 247, 0.56);
  font-size: 13px;
  line-height: 1.45;
}

/* Standards responsive */
@media (max-width: 768px) {
  .standards-hero {
    grid-template-columns: 1fr;
    padding: 22px;
  }

  .standards-hero h2 {
    font-size: 28px;
  }

  .standards-hero p {
    font-size: 15px;
  }

  .standards-matrix-header,
  .standards-table-row {
    grid-template-columns: 1fr;
  }

  .standards-table-head {
    display: none;
  }

  .standards-table-row {
    gap: 10px;
    padding: 18px;
  }

  .standards-card {
    padding: 22px;
    border-radius: 22px;
  }

  .standards-card-body h3 {
    font-size: 19px;
  }

  .standards-info {
    grid-template-columns: 1fr;
    padding-bottom: 32px;
  }
}

/* Institutional interoperability */
.standards-tab {
  padding: 24px;
  min-height: 100vh;
  background: #101215;
  color: #F7F8FB;
}

.standards-tab *,
.standards-tab *::before,
.standards-tab *::after {
  box-sizing: border-box;
  letter-spacing: 0;
}

.interop-hero,
.interop-note,
.interop-section,
.interop-blueprint-card {
  max-width: 1280px;
  margin-inline: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #171A20;
}

.interop-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 20px;
  padding: 28px;
}

.interop-hero-copy {
  min-width: 0;
}

.interop-eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  color: #7DD3FC;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.interop-hero h2,
.interop-section-header h3,
.interop-blueprint-card h4 {
  margin: 0;
  color: #FFFFFF;
  line-height: 1.12;
  overflow-wrap: anywhere;
}

.interop-hero h2 {
  max-width: 860px;
  font-size: 34px;
  font-weight: 800;
}

.interop-hero p,
.interop-section p,
.interop-blueprint-card li {
  color: rgba(247, 248, 251, 0.68);
  line-height: 1.55;
}

.interop-hero p {
  max-width: 820px;
  margin: 12px 0 0;
  font-size: 15px;
}

.interop-role-grid {
  display: grid;
  gap: 12px;
}

.interop-role-card {
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #111419;
}

.interop-role-card span,
.interop-module-phase,
.interop-roadmap-list article > span {
  color: #A7F3D0;
  font-size: 12px;
  font-weight: 800;
}

.interop-role-card strong {
  display: block;
  margin-top: 4px;
  color: #FFFFFF;
  font-size: 16px;
}

.interop-role-card p {
  margin: 8px 0 0;
  font-size: 13px;
}

.interop-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 14px;
  padding: 14px 16px;
  background: #17120B;
  border-color: rgba(245, 158, 11, 0.24);
}

.interop-note strong {
  flex: 0 0 auto;
  color: #FBBF24;
}

.interop-note span {
  color: rgba(255, 251, 235, 0.78);
  line-height: 1.45;
}

.interop-section {
  margin-top: 14px;
  padding: 22px;
}

.interop-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.interop-section-header.compact {
  margin-bottom: 14px;
}

.interop-section-header h3 {
  font-size: 22px;
}

.interop-pill,
.interop-status,
.interop-actions span,
.interop-filter-row span,
.interop-export-row span,
.interop-chip-grid span,
.interop-module-list span {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  min-height: 26px;
  padding: 5px 9px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.interop-pill {
  color: #A7F3D0;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.interop-table {
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.interop-table-row {
  display: grid;
  grid-template-columns: minmax(170px, 0.9fr) minmax(110px, 0.45fr) minmax(240px, 1.25fr) minmax(80px, 0.35fr) minmax(150px, 0.75fr) minmax(180px, 0.9fr);
  gap: 14px;
  align-items: start;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.interop-table-row:last-child {
  border-bottom: 0;
}

.interop-table-head {
  background: #111419;
}

.interop-table-head span {
  color: rgba(247, 248, 251, 0.5);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.interop-standard-row {
  border-left: 4px solid var(--standard-accent);
}

.interop-name-cell {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.interop-mark {
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 8px;
  color: var(--standard-accent);
  font-size: 12px;
  font-weight: 900;
}

.interop-name-cell strong,
.interop-priority,
.interop-module-card h4,
.interop-metric-list strong,
.interop-roadmap-list strong {
  color: #FFFFFF;
}

.interop-name-cell strong {
  display: block;
  line-height: 1.2;
}

.interop-name-cell small,
.interop-table-row p small {
  display: block;
  margin-top: 4px;
  color: rgba(247, 248, 251, 0.48);
  font-size: 12px;
}

.interop-table-row p {
  margin: 0;
  color: rgba(247, 248, 251, 0.68);
  font-size: 13px;
  line-height: 1.45;
}

.interop-status-design {
  color: #BAE6FD;
  background: rgba(14, 165, 233, 0.14);
  border: 1px solid rgba(14, 165, 233, 0.22);
}

.interop-status-next {
  color: #FDE68A;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.24);
}

.interop-status-active {
  color: #BBF7D0;
  background: rgba(34, 197, 94, 0.14);
  border: 1px solid rgba(34, 197, 94, 0.24);
}

.interop-status-test {
  color: #C4B5FD;
  background: rgba(139, 92, 246, 0.14);
  border: 1px solid rgba(139, 92, 246, 0.24);
}

.interop-status-development {
  color: #FDE68A;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.24);
}

.interop-status-certifiable {
  color: #A7F3D0;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.24);
}

.interop-status-idle {
  color: rgba(247, 248, 251, 0.68);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.interop-actions,
.interop-chip-grid,
.interop-filter-row,
.interop-export-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.interop-actions span,
.interop-chip-grid span {
  color: rgba(247, 248, 251, 0.72);
  background: rgba(255, 255, 255, 0.06);
}

.interop-operational-grid,
.interop-assurance-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 14px;
  max-width: 1280px;
  margin: 14px auto 0;
}

.interop-events-panel,
.interop-analytics-panel {
  margin-top: 0;
}

.interop-schema {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #111419;
}

.interop-schema strong {
  display: block;
  margin-bottom: 10px;
  color: #FFFFFF;
}

.interop-schema div {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.interop-schema code {
  padding: 5px 7px;
  border-radius: 6px;
  color: #BFDBFE;
  background: rgba(96, 165, 250, 0.1);
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 12px;
}

.interop-json {
  max-width: 100%;
  margin: 14px 0 0;
  padding: 14px;
  overflow-x: auto;
  border: 1px solid rgba(125, 211, 252, 0.18);
  border-radius: 8px;
  color: #D1FAE5;
  background: #0B1014;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
}

.interop-panel-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.interop-event-feed {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid rgba(125, 211, 252, 0.14);
  border-radius: 8px;
  background: #0B1014;
}

.interop-event-feed.compact {
  border-color: rgba(167, 139, 250, 0.18);
}

.interop-event-feed strong {
  color: #FFFFFF;
  font-size: 13px;
}

.interop-event-feed p {
  margin: 0;
  color: rgba(247, 248, 251, 0.72);
  font-size: 12px;
  line-height: 1.45;
}

.interop-event-feed p span {
  display: inline-block;
  margin-right: 6px;
  color: #7DD3FC;
  font-weight: 800;
}

.interop-filter-row span,
.interop-export-row span {
  color: #C4B5FD;
  background: rgba(139, 92, 246, 0.12);
}

.interop-metric-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.interop-metric-list article {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #111419;
}

.interop-metric-list span {
  color: #FBBF24;
  font-size: 12px;
  font-weight: 800;
}

.interop-metric-list strong {
  display: block;
  margin-top: 4px;
}

.interop-metric-list p {
  margin: 6px 0 0;
  font-size: 13px;
}

.interop-live-analytics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.interop-live-analytics article {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #0B1014;
}

.interop-live-analytics span {
  display: block;
  color: rgba(247, 248, 251, 0.6);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.interop-live-analytics strong {
  display: block;
  margin-top: 4px;
  color: #FFFFFF;
  font-size: 18px;
}

.interop-export-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.interop-module-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.interop-module-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #111419;
}

.interop-module-card h4 {
  margin: 7px 0 8px;
  font-size: 17px;
  line-height: 1.2;
}

.interop-module-card p {
  margin: 0;
  font-size: 13px;
}

.interop-module-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.interop-module-list strong {
  flex-basis: 100%;
  color: rgba(247, 248, 251, 0.82);
  font-size: 12px;
}

.interop-module-list span {
  color: rgba(247, 248, 251, 0.72);
  background: rgba(255, 255, 255, 0.06);
}

.interop-module-list.muted span {
  color: #A7F3D0;
  background: rgba(16, 185, 129, 0.1);
}

.interop-blueprint-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 1280px;
  margin: 14px auto 0;
}

.interop-blueprint-card {
  padding: 18px;
}

.interop-blueprint-card h4 {
  margin-bottom: 10px;
  font-size: 18px;
}

.interop-blueprint-card ul,
.interop-check-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
}

.interop-blueprint-card li,
.interop-check-list li {
  font-size: 13px;
}

.interop-roadmap-list {
  display: grid;
  gap: 10px;
}

.interop-roadmap-list article {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: #111419;
}

.interop-roadmap-list p {
  margin: 4px 0 0;
  font-size: 13px;
}

.interop-check-list li {
  color: rgba(247, 248, 251, 0.74);
  line-height: 1.45;
}

.interop-refresh-btn,
.interop-live-actions button,
.interop-panel-actions button,
.interop-export-row button {
  min-height: 34px;
  border: 1px solid rgba(125, 211, 252, 0.26);
  border-radius: 8px;
  color: #E0F2FE;
  background: rgba(14, 165, 233, 0.12);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.interop-refresh-btn,
.interop-panel-actions button,
.interop-export-row button {
  padding: 0 12px;
}

.interop-refresh-btn:disabled,
.interop-live-actions button:disabled,
.interop-panel-actions button:disabled,
.interop-export-row button:disabled {
  opacity: 0.55;
  cursor: wait;
}

.interop-alert {
  margin-bottom: 12px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.interop-alert.error {
  color: #FECACA;
  background: rgba(239, 68, 68, 0.13);
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.interop-alert.success {
  color: #BBF7D0;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.22);
}

.interop-result-panel {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-radius: 8px;
  background: #0B1014;
}

.interop-result-panel > div:first-child {
  display: grid;
  gap: 4px;
}

.interop-result-panel span {
  color: rgba(247, 248, 251, 0.52);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.interop-result-panel strong {
  color: #FFFFFF;
  overflow-wrap: anywhere;
}

.interop-result-panel p {
  margin: 0;
  color: rgba(247, 248, 251, 0.72);
  font-size: 13px;
}

.interop-result-success {
  color: #BBF7D0 !important;
}

.interop-result-error {
  color: #FECACA !important;
}

.interop-result-warning {
  color: #FDE68A !important;
}

.interop-result-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.interop-result-metrics article {
  min-width: 0;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.interop-result-metrics strong {
  display: block;
  margin-top: 4px;
  color: #FFFFFF;
  font-size: 12px;
}

.interop-result-errors {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0 0 0 18px;
  color: #FECACA;
  font-size: 12px;
}

.interop-summary-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.interop-summary-strip span {
  padding: 7px 9px;
  border-radius: 8px;
  color: rgba(247, 248, 251, 0.74);
  background: rgba(255, 255, 255, 0.06);
  font-size: 12px;
  font-weight: 700;
}

.interop-loading {
  padding: 18px;
  border-radius: 8px;
  color: rgba(247, 248, 251, 0.64);
  background: #111419;
}

.interop-live-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.interop-live-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid var(--standard-accent);
  border-radius: 8px;
  background: #111419;
}

.interop-live-card-head {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
}

.interop-live-card-head h4 {
  margin: 0;
  color: #FFFFFF;
  font-size: 17px;
  line-height: 1.2;
}

.interop-live-card-head p {
  margin: 5px 0 0;
  color: rgba(247, 248, 251, 0.62);
  font-size: 12px;
  line-height: 1.4;
}

.interop-progress-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px;
  gap: 10px;
  align-items: center;
  margin-top: 14px;
}

.interop-progress-row > div {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.interop-progress-row span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--standard-accent);
}

.interop-progress-row strong {
  color: #FFFFFF;
  font-size: 12px;
  text-align: right;
}

.interop-real-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.interop-real-metrics article {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.interop-real-metrics span {
  display: block;
  color: rgba(247, 248, 251, 0.48);
  font-size: 11px;
  font-weight: 700;
}

.interop-real-metrics strong {
  display: block;
  margin-top: 3px;
  color: #FFFFFF;
  font-size: 15px;
  overflow-wrap: anywhere;
}

.interop-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.interop-config-grid.full,
.interop-config-grid.lti {
  grid-template-columns: 1fr;
}

.interop-event-form {
  margin-top: 14px;
}

.interop-file-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.interop-config-grid label {
  display: grid;
  gap: 5px;
  color: rgba(247, 248, 251, 0.54);
  font-size: 11px;
  font-weight: 800;
}

.interop-config-grid input,
.interop-config-grid textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #FFFFFF;
  background: #0B1014;
  font: inherit;
  font-size: 12px;
}

.interop-config-grid input {
  height: 34px;
  padding: 0 9px;
}

.interop-config-grid input[type="file"] {
  height: auto;
  padding: 8px;
  color: rgba(247, 248, 251, 0.72);
}

.interop-config-grid textarea {
  padding: 9px;
  resize: vertical;
}

.interop-live-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.interop-live-actions button {
  padding: 0 10px;
}

.interop-health {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.interop-health strong {
  color: #FFFFFF;
  font-size: 13px;
}

.interop-health span {
  color: rgba(247, 248, 251, 0.62);
  font-size: 12px;
  line-height: 1.4;
}

.interop-health-success {
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.interop-health-warning {
  border: 1px solid rgba(245, 158, 11, 0.24);
}

.interop-health-test {
  border: 1px solid rgba(96, 165, 250, 0.24);
}

.interop-checklist-live,
.interop-history-live {
  display: grid;
  gap: 7px;
  margin-top: 12px;
}

.interop-checklist-live > strong,
.interop-history-live > strong {
  color: #FFFFFF;
  font-size: 13px;
}

.interop-checklist-live label {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  gap: 7px;
  align-items: center;
  color: rgba(247, 248, 251, 0.74);
  font-size: 12px;
}

.interop-checklist-live input {
  width: 16px;
  height: 16px;
  accent-color: #22C55E;
}

.interop-checklist-live small {
  color: rgba(247, 248, 251, 0.42);
}

.interop-history-live p {
  margin: 0;
  color: rgba(247, 248, 251, 0.62);
  font-size: 12px;
  line-height: 1.4;
}

.interop-history-live p span {
  color: #7DD3FC;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .interop-module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .interop-table-row {
    grid-template-columns: minmax(180px, 1fr) minmax(100px, 0.45fr) minmax(220px, 1fr);
  }

  .interop-live-grid {
    grid-template-columns: 1fr;
  }

  .interop-table-head span:nth-child(n+4),
  .interop-table-row > *:nth-child(n+4) {
    display: none;
  }
}

@media (max-width: 860px) {
  .standards-tab {
    padding: 14px;
  }

  .interop-hero,
  .interop-operational-grid,
  .interop-assurance-grid,
  .interop-blueprint-grid {
    grid-template-columns: 1fr;
  }

  .interop-hero {
    padding: 20px;
  }

  .interop-hero h2 {
    font-size: 26px;
  }

  .interop-note,
  .interop-section-header {
    flex-direction: column;
  }

  .interop-table-head {
    display: none;
  }

  .interop-table-row {
    grid-template-columns: 1fr;
  }

  .interop-table-row > *:nth-child(n+4) {
    display: block;
  }

  .interop-actions {
    display: flex;
  }

  .interop-module-grid {
    grid-template-columns: 1fr;
  }

  .interop-roadmap-list article {
    grid-template-columns: 1fr;
  }

  .interop-live-card-head,
  .interop-real-metrics,
  .interop-live-analytics,
  .interop-config-grid,
  .interop-file-grid,
  .interop-result-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
