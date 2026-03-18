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
    <div v-if="activeTab === 'analytics'" class="tab-content">
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ background: stat.color + '20', color: stat.color }">
            <component :is="stat.iconComponent" />
          </div>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>

      <div class="quick-actions">
        <h3 class="section-title">Acciones Rápidas</h3>
        <div class="action-grid">
          <button class="action-card" @click="$router.push('/admin/database')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
            <span>Base de Datos</span>
          </button>
          <button class="action-card" @click="$router.push('/subjects')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
            <span>Materias</span>
          </button>
          <button class="action-card" @click="$router.push('/course/create')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            <span>Crear Curso</span>
          </button>
          <button class="action-card" @click="$router.push('/content/upload')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <span>Subir Contenido</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Moderación Tab -->
    <div v-if="activeTab === 'moderation'" class="tab-content">
      <!-- Cursos por Terminar -->
      <div class="section-card">
        <div class="section-header" @click="toggleSection('courses')">
          <div class="header-left">
            <div class="section-icon" style="background: #64B5F620;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64B5F6" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <h4>Cursos por Terminar</h4>
              <p>Contenido pendiente de completar</p>
            </div>
          </div>
          <span class="badge">{{ coursesToFinish.length }}</span>
          <span class="chevron" :class="{ expanded: expandedSections.courses }">▼</span>
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

      <!-- Tareas Pendientes por Enviar -->
      <div class="section-card">
        <div class="section-header" @click="toggleSection('tasks')">
          <div class="header-left">
            <div class="section-icon" style="background: #FF950020;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6" /><path d="M9 16h6" />
              </svg>
            </div>
            <div>
              <h4>Tareas Pendientes</h4>
              <p>Tareas que faltan por enviar</p>
            </div>
          </div>
          <span class="badge orange">{{ filteredPendingTasks.length }}</span>
          <span class="chevron" :class="{ expanded: expandedSections.tasks }">▼</span>
        </div>
        <div v-if="expandedSections.tasks" class="section-content">
          <!-- Filtros -->
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

      <!-- Submissions Pendientes -->
      <div v-if="canViewFullModeration" class="section-card">
        <div class="section-header" @click="toggleSection('submissions')">
          <div class="header-left">
            <div class="section-icon" style="background: #FF375F20;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF375F" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h4>Submissions Pendientes</h4>
              <p>Tareas de estudiantes por calificar</p>
            </div>
          </div>
          <span class="badge red">{{ pendingSubmissions.length }}</span>
          <span class="chevron" :class="{ expanded: expandedSections.submissions }">▼</span>
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
              <img :src="sub.studentAvatar || '/default-avatar.png'" class="user-avatar-sm" alt="" />
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

      <!-- Progreso de Estudiantes -->
      <div v-if="canViewFullModeration" class="section-card">
        <div class="section-header" @click="toggleSection('students')">
          <div class="header-left">
            <div class="section-icon" style="background: #30D15820;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div>
              <h4>Progreso de Estudiantes</h4>
              <p>Seguimiento del avance por curso</p>
            </div>
          </div>
          <span class="badge green">{{ studentProgressList.length }}</span>
          <span class="chevron" :class="{ expanded: expandedSections.students }">▼</span>
        </div>
        <div v-if="expandedSections.students" class="section-content">
          <div v-if="loadingStudentProgress" class="loading-center"><div class="spinner-lg"></div></div>
          <div v-else-if="studentProgressList.length === 0" class="empty-state">
            <span class="emoji">📊</span>
            <p>No hay datos de progreso disponibles</p>
          </div>
          <div v-else class="items-list">
            <div 
              v-for="sp in studentProgressList" 
              :key="`${sp.courseId}-${sp.studentId}`" 
              class="item-card"
            >
              <img :src="sp.avatar || '/default-avatar.png'" class="user-avatar-sm" alt="" />
              <div class="item-info">
                <h5>{{ sp.username }}</h5>
                <p class="course-name">{{ sp.courseName }}</p>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: sp.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ sp.progress }}% · Nota: {{ sp.grade }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados de Refuerzo -->
      <div v-if="canViewFullModeration" class="section-card">
        <div class="section-header" @click="toggleSection('reinforcement')">
          <div class="header-left">
            <div class="section-icon" style="background: #BF5AF220;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="2">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
            </div>
            <div>
              <h4>Resultados de Refuerzo</h4>
              <p>Sesiones de refuerzo de estudiantes</p>
            </div>
          </div>
          <span class="badge purple">{{ reinforcementResults.length }}</span>
          <span class="chevron" :class="{ expanded: expandedSections.reinforcement }">▼</span>
        </div>
        <div v-if="expandedSections.reinforcement" class="section-content">
          <div v-if="loadingReinforcement" class="loading-center"><div class="spinner-lg"></div></div>
          <div v-else-if="reinforcementResults.length === 0" class="empty-state">
            <span class="emoji">🧠</span>
            <p>No hay resultados de refuerzo</p>
          </div>
          <div v-else class="items-list">
            <div 
              v-for="(rr, idx) in reinforcementResults" 
              :key="idx" 
              class="item-card reinforcement-card"
            >
              <div class="item-info">
                <h5>{{ rr.username }} · {{ rr.courseName }}</h5>
                <p class="course-name">{{ rr.subjectName }} › {{ rr.topicName }} › {{ rr.taskName }}</p>
                <div class="reinforcement-stats">
                  <span class="stat-pill">{{ rr.correctAnswers }}/{{ rr.totalQuestions }} correctas</span>
                  <span class="stat-pill" :class="rr.grade >= 3 ? 'pill-active' : 'pill-inactive'">Nota: {{ rr.grade.toFixed(1) }}</span>
                  <span class="stat-pill">{{ rr.difficulty }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Roles Tab -->
    <div v-if="activeTab === 'roles'" class="tab-content">
      <div class="section-card">
        <h3 class="section-title">Sistema de Permisos</h3>
        <p class="section-description">Gestiona los roles y permisos del sistema</p>
        <div class="roles-placeholder">
          <span class="emoji">🔐</span>
          <p>Funcionalidad de roles en desarrollo</p>
        </div>
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
          <input v-model="userSearch" placeholder="Buscar usuario..." class="activation-search-input" />
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
              <img :src="user.avatar || '/default-avatar.png'" class="activation-avatar" alt="" />
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
                  :disabled="assigningRole[user.id + '-' + role.id]"
                >
                  <span class="role-chip-dot" :class="'role-dot-' + role.id"></span>
                  <span>{{ role.label }}</span>
                </button>
              </div>
            </div>
            <button
              class="activation-toggle-btn"
              :class="user.isActive ? 'toggle-deactivate' : 'toggle-activate'"
              @click="toggleUserActivation(user, !user.isActive)"
            >
              {{ user.isActive ? 'Desactivar' : 'Activar' }}
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Matrícula Tab (solo rol 3) -->
    <div v-if="activeTab === 'enrollment'" class="tab-content">
      <div class="enrollment-section">
        <!-- Header con estadísticas -->
        <div class="enrollment-header-card">
          <div class="enrollment-header-top">
            <div>
              <h3 class="enrollment-title">Solicitudes de Matrícula</h3>
              <p class="enrollment-subtitle">Gestiona solicitudes de acceso a cursos para usuarios con matricula pendiente.</p>
            </div>
            <button class="reload-btn" title="Recargar" @click="loadEnrollments" :class="{ spinning: loadingEnrollments }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
          </div>

          <div class="enrollment-filters">
            <input
              v-model="enrollmentUserFilter"
              class="filter-input"
              placeholder="Buscar por usuario..."
            />
            <input
              v-model="enrollmentCourseFilter"
              class="filter-input"
              placeholder="Buscar por curso..."
            />
          </div>

          <div class="enrollment-stats">
            <div class="enrollment-stat-pill pending-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span class="stat-number">{{ filteredEnrollments.length }}</span>
              <span class="stat-desc">Pendientes</span>
            </div>
            <div class="enrollment-stat-pill approved-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span class="stat-number">{{ enrollmentApprovedCount }}</span>
              <span class="stat-desc">Aprobadas hoy</span>
            </div>
            <div class="enrollment-stat-pill rejected-pill">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              <span class="stat-number">{{ enrollmentRejectedCount }}</span>
              <span class="stat-desc">Rechazadas hoy</span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingEnrollments" class="enrollment-loading">
          <div class="enrollment-skeleton" v-for="i in 3" :key="i">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-lines">
              <div class="skeleton-line long"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="pendingEnrollments.length === 0" class="enrollment-empty">
          <div class="enrollment-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#30D158" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h4 class="enrollment-empty-title">Todo en orden</h4>
          <p class="enrollment-empty-desc">No hay solicitudes de matrícula pendientes en este momento.</p>
        </div>

        <!-- Enrollment cards -->
        <div v-else-if="filteredEnrollments.length === 0" class="enrollment-empty">
          <div class="enrollment-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h4 class="enrollment-empty-title">Sin resultados</h4>
          <p class="enrollment-empty-desc">No se encontraron solicitudes con ese filtro.</p>
        </div>

        <div v-else class="enrollment-list">
          <TransitionGroup name="enrollment-card">
            <div
              v-for="req in filteredEnrollments"
              :key="`${req.userId}-${req.courseId}`"
              class="enrollment-card"
            >
              <div class="enrollment-card-main">
                <div class="enrollment-card-left">
                  <img :src="req.avatar || '/default-avatar.png'" class="enrollment-avatar" alt="" />
                  <div class="enrollment-card-info">
                    <span class="enrollment-name">{{ req.displayName }}</span>
                    <span class="enrollment-username">{{ req.usernameLabel }}</span>
                  </div>
                </div>
                <div class="enrollment-course-row">
                  <span class="enrollment-course-label">Curso solicitado</span>
                  <span class="enrollment-course-name">{{ req.courseName || `Curso #${req.courseId}` }}</span>
                </div>
                <div v-if="req.roleChips.length" class="enrollment-role-row">
                  <span
                    v-for="role in req.roleChips"
                    :key="`${req.userId}-${req.courseId}-${role.key}`"
                    class="enrollment-role-chip"
                    :class="`tone-${role.tone}`"
                  >
                    {{ role.label }}
                  </span>
                </div>
                <span class="enrollment-time" v-if="req.requestedAt">{{ formatTimeAgoEnroll(req.requestedAt) }}</span>
              </div>
              <div class="enrollment-card-actions">
                <button class="enrollment-approve-btn" @click="approveEnrollmentReq(req)" title="Aprobar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Aprobar
                </button>
                <button class="enrollment-reject-btn" @click="rejectEnrollmentReq(req)" title="Rechazar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Rechazar
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Certificados Tab -->
    <div v-if="activeTab === 'certificates' && canViewCertificates" class="tab-content">
      <!-- Botón generar certificados masivamente -->
      <div class="bulk-cert-section">
        <button
          class="bulk-cert-btn"
          :disabled="issuingCertificates"
          @click="bulkIssueCertificates"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="6"/>
            <path d="M9 14l-2 8 5-3 5 3-2-8"/>
          </svg>
          <span v-if="issuingCertificates">Generando...</span>
          <span v-else>Generar certificados para todos los aprobados</span>
        </button>
        <p v-if="bulkIssueMessage" class="bulk-cert-message" :class="{ success: bulkIssueSuccess }">{{ bulkIssueMessage }}</p>
      </div>

      <div v-if="loadingCertificates" class="empty-state">
        <p style="color:#8E8E93">Cargando certificados...</p>
      </div>
      <div v-else-if="certificates.length === 0" class="section-card">
        <div class="empty-state">
          <span class="emoji">🎓</span>
          <p>Aún no tienes certificados obtenidos</p>
        </div>
      </div>
      <div v-else class="items-list">
        <div
          v-for="cert in certificates"
          :key="cert.courseId"
          class="cert-card"
        >
          <div class="cert-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>
          </div>
          <div class="cert-info">
            <h5>{{ cert.courseName || `Curso ${cert.courseId}` }}</h5>
            <p class="cert-date">Emitido: {{ formatDate(cert.certificateIssuedAt) }}</p>
            <p v-if="cert.averageGrade" class="cert-date">Promedio: {{ cert.averageGrade }}</p>
            <p v-if="cert.verificationCode" class="cert-date" style="font-size:11px;color:#6C63FF">Código: {{ cert.verificationCode }}</p>
            <a
              v-if="cert.certificateUrl"
              :href="cert.certificateUrl"
              target="_blank"
              class="cert-link"
            >Ver certificado ↗</a>
          </div>
          <div class="cert-badge">✓</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TopBar from '@/ui/shared/components/TopBar.vue'
import { useRouter } from 'vue-router'
import { progressAdapter } from '@/infrastructure/api/progressAdapter'
import { userAdapter } from '@/infrastructure/api/userAdapter'
import { submissionAdapter } from '@/infrastructure/api/submissionAdapter'
import { reinforcementAdapter } from '@/infrastructure/api/reinforcementAdapter'
import { courseAdapter } from '@/infrastructure/api/courseAdapter'
import { subjectAdapter } from '@/infrastructure/api/subjectAdapter'
import { taskAdapter } from '@/infrastructure/api/taskAdapter'
import { topicAdapter } from '@/infrastructure/api/topicAdapter'
import { useAuthStore } from '@/stores/authStore'
import type { Certificate } from '@/domain/models'

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
}

const router = useRouter()
const authStore = useAuthStore()

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
const shouldUseCompactTabs = computed(() => isRole1Only.value)

const activeTab = ref('analytics')

// Certificados
const certificates = ref<Certificate[]>([])
const loadingCertificates = ref(false)

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Fecha no disponible'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

const loadCertificates = async () => {
  loadingCertificates.value = true
  try {
    const data = await progressAdapter.getMyCertificates()
    certificates.value = Array.isArray(data) ? data as Certificate[] : []
  } catch (error) {
    console.error('Error loading certificates:', error)
    certificates.value = []
  } finally {
    loadingCertificates.value = false
  }
}

// Bulk issue certificates
const issuingCertificates = ref(false)
const bulkIssueMessage = ref('')
const bulkIssueSuccess = ref(false)

const bulkIssueCertificates = async () => {
  issuingCertificates.value = true
  bulkIssueMessage.value = ''
  try {
    // Admin (rol 3) usa emisión global; creadores usan la de sus cursos
    const result = hasAdminRole.value
      ? await progressAdapter.bulkIssueCertificatesAll()
      : await progressAdapter.bulkIssueCertificatesForCreator()
    const issued = result?.issued ?? 0
    bulkIssueSuccess.value = true
    bulkIssueMessage.value = issued > 0
      ? `Se generaron ${issued} certificado${issued !== 1 ? 's' : ''} exitosamente`
      : 'Todos los estudiantes aprobados ya tienen certificado'
    await loadCertificates()
  } catch (error) {
    console.error('Error issuing certificates:', error)
    bulkIssueSuccess.value = false
    bulkIssueMessage.value = 'Error al generar certificados'
  } finally {
    issuingCertificates.value = false
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

// ─── User activation state ───────────────────────────────────────────────
const users = ref<any[]>([])
const loadingUsers = ref(false)
const userSearch = ref('')
const processingExpired = ref(false)

const ROLE_META: Record<number, { label: string; tone: EnrollmentTone }> = {
  1: { label: 'Estudiante', tone: 'student' },
  2: { label: 'Docente', tone: 'teacher' },
  3: { label: 'Admin', tone: 'admin' },
}

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter((u: any) =>
    (u.username || '').toLowerCase().includes(q)
  )
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

const assigningRole = ref<Record<string, boolean>>({})

const userHasRole = (user: any, roleId: number): boolean => {
  if (!user.roles?.length) return false
  return user.roles.some((r: any) => Number(r.id) === roleId)
}

const toggleRole = async (user: any, roleId: number) => {
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

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const data = await userAdapter.listAllUsers()
    users.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading users:', e)
  } finally {
    loadingUsers.value = false
  }
}

const toggleUserActivation = async (user: any, activate: boolean) => {
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
    const matchUser = !uq || r.displayName.toLowerCase().includes(uq) || (r.username ?? '').toLowerCase().includes(uq)
    const matchCourse = !cq || (r.courseName ?? '').toLowerCase().includes(cq)
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
          return !hasRoles || !hasIdentity
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

// ─── Moderation: Submissions pendientes (rol 3) ─────────────────────────
interface PendingSubmission {
  id: number
  taskName: string
  courseName: string
  studentName: string
  studentAvatar: string
  timeAgo: string
  taskId: number
  courseId: number
}

const pendingSubmissions = ref<PendingSubmission[]>([])
const loadingSubmissions = ref(false)

const loadManageableCourses = async (userId: number) => {
  const courses = await courseAdapter.getManageableCourses(userId)
  return Array.isArray(courses) ? courses : []
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

    const allUngraded: PendingSubmission[] = []
    for (const course of courses) {
      const subs = await submissionAdapter.getSubmissionByCourse(course.id, true)
      if (!Array.isArray(subs)) continue
      // Agrupar por estudiante+tarea, tomar la última
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
  router.push(`/course/${sub.courseId}/task/${sub.taskId}/submissions`)
}

// ─── Moderation: Progreso de estudiantes (rol 3) ────────────────────────
interface StudentProgressItem {
  studentId: number
  courseId: number
  username: string
  avatar: string
  courseName: string
  progress: number
  grade: string
}

const studentProgressList = ref<StudentProgressItem[]>([])
const loadingStudentProgress = ref(false)

const loadStudentProgressData = async () => {
  loadingStudentProgress.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const courses = await loadManageableCourses(userId)

    const items: StudentProgressItem[] = []
    for (const course of courses) {
      const progressData = await progressAdapter.getAllProgressByCourse(course.id)
      if (!Array.isArray(progressData)) continue
      for (const p of progressData) {
        const tt = p.totalTasks || (p as any).tareas_totales || 0
        const tc = p.completedTasks || (p as any).tareas_completadas || 0
        const pct = tt > 0 ? Math.round((tc / tt) * 100) : (p as any).progressPercentage || (p as any).porcentaje_progreso || 0
        const grade = p.averageGrade || (p as any).promedio || (p as any).calificacion_ponderada || 0
        items.push({
          studentId: (p as any).userId || (p as any).usuario_id || 0,
          courseId: course.id,
          username: (p as any).username || (p as any).usuario || `Estudiante #${(p as any).userId || 0}`,
          avatar: (p as any).avatar || '',
          courseName: course.title || `Curso #${course.id}`,
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
  courseName: string
  subjectName: string
  topicName: string
  taskName: string
  totalQuestions: number
  correctAnswers: number
  grade: number
  difficulty: string
}

const reinforcementResults = ref<ReinforcementResult[]>([])
const loadingReinforcement = ref(false)

const loadReinforcementData = async () => {
  loadingReinforcement.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) return
    const courses = await loadManageableCourses(userId)

    const items: ReinforcementResult[] = []
    for (const course of courses) {
      const results = await reinforcementAdapter.getResultsByCourse(course.id)
      if (!Array.isArray(results)) continue
      for (const r of results) {
        items.push({
          username: (r as any).username || (r as any).usuario || 'Estudiante',
          courseName: course.title || `Curso #${course.id}`,
          subjectName: (r as any).subjectName || (r as any).materia || '',
          topicName: (r as any).topicName || (r as any).tema || '',
          taskName: (r as any).taskName || (r as any).tarea || '',
          totalQuestions: (r as any).totalQuestions || (r as any).total_preguntas || 0,
          correctAnswers: (r as any).correctAnswers || (r as any).respuestas_correctas || 0,
          grade: (r as any).grade || (r as any).calificacion || 0,
          difficulty: (r as any).difficulty || (r as any).dificultad || 'Normal'
        })
      }
    }
    reinforcementResults.value = items
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
  reinforcement: false
})

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

const toggleSection = (section: 'courses' | 'tasks' | 'submissions' | 'students' | 'reinforcement') => {
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
    // Cargar progreso del usuario
    const myProgress = await progressAdapter.getMyProgress()
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
      coursesToFinish.value = myProgress
        .filter((p: any) => {
          const tt = p.totalTasks || p.tareas_totales || 0
          const tc = p.completedTasks || p.tareas_completadas || 0
          const progress = tt > 0 
            ? (tc / tt) * 100 
            : p.progressPercentage || p.porcentaje_progreso || 0
          return progress < 90
        })
        .map((p: any) => {
          const tt = p.totalTasks || p.tareas_totales || 0
          const tc = p.completedTasks || p.tareas_completadas || 0
          return {
            id: p.courseId || p.curso_id,
            title: p.courseName || p.curso_nombre || `Curso ${p.courseId || p.curso_id}`,
            progress: Math.round(tt > 0 
              ? (tc / tt) * 100 
              : p.progressPercentage || p.porcentaje_progreso || 0)
          }
        })

      // Cargar tareas pendientes con información de materia
      const pendingTaskCount = await loadPendingTasksWithSubjects(myProgress)
      stats.value[0].value = pendingTaskCount || totalPendingTasks
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const loadPendingTasksWithSubjects = async (myProgress: any[]) => {
  try {
    const enrolledCourseIds = myProgress
      .map((p: any) => p.courseId || p.curso_id)
      .filter((id: number) => id > 0)

    if (enrolledCourseIds.length === 0) {
      pendingTasks.value = []
      return 0
    }

    const mySubmissions = await submissionAdapter.getMySubmissions(1, 500)
    const submittedTaskIds = new Set(
      (Array.isArray(mySubmissions) ? mySubmissions : (mySubmissions as any)?.data ?? [])
        .map((s: any) => s.taskId || s.task_id)
        .filter((id: unknown) => Number(id) > 0)
    )

    const allPending: PendingTask[] = []

    await Promise.all(enrolledCourseIds.map(async (courseId: number) => {
      const [tasks, subjects, topics] = await Promise.all([
        taskAdapter.getTasksByCourse(courseId),
        subjectAdapter.getSubjectsByCourse(courseId),
        topicAdapter.getTopicsByCourse(courseId)
      ])

      const courseName = myProgress.find(
        (p: any) => (p.courseId || p.curso_id) === courseId
      )?.courseName || myProgress.find(
        (p: any) => (p.courseId || p.curso_id) === courseId
      )?.curso_nombre || `Curso ${courseId}`

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
  loadData()
  if (canViewActivation.value) {
    loadUsers()
  }
  if (canViewCertificates.value) {
    loadCertificates()
  }
  if (hasAdminRole.value) {
    loadEnrollments()
  }
  if (canViewFullModeration.value) {
    loadPendingSubmissions()
    loadStudentProgressData()
    loadReinforcementData()
  }
})
</script>

<style scoped>
.admin-dashboard { min-height: 100vh; background: var(--bg-primary); }

.tabs-container {
  display: flex;
  gap: 8px;
  padding: 16px;
  overflow-x: auto;
}

.tab-btn {
  padding: 10px 20px;
  border-radius: 20px;
  background: #2C2C2E;
  color: #8E8E93;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6C63FF, #8B7FFF);
  color: #fff;
}

.tab-content { padding: 0 16px 100px; }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 16px;
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.96), rgba(18, 18, 20, 0.98));
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #fff;
  text-shadow: 0 4px 18px rgba(255, 255, 255, 0.16);
}
.stat-label { font-size: 13px; color: #8E8E93; margin-top: 2px; }

.quick-actions { margin-top: 20px; }
.section-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 12px; }

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #1C1C1E;
  border-radius: 16px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: transform 0.15s;
}

.action-card:hover { transform: scale(1.02); }

/* Section Cards */
.section-card {
  background: #1C1C1E;
  border-radius: 20px;
  margin-bottom: 16px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover { background: #2C2C2E; }

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

.badge.orange {
  background: #FF950020;
  color: #FF9500;
}

.chevron {
  color: #8B7FFF;
  font-size: 12px;
  transition: transform 0.25s;
}

.chevron.expanded { transform: rotate(0deg); }
.chevron:not(.expanded) { transform: rotate(-90deg); }

.section-content {
  padding: 0 16px 16px;
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
  background: #2C2C2E;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: transform 0.15s, background 0.2s;
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
  background: linear-gradient(90deg, #64B5F6, #4ADE80);
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
  background: #2C2C2E;
  border: 1px solid #3C3C3E;
  border-radius: 10px;
  padding: 8px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-input::placeholder { color: #636366; }
.filter-input:focus { border-color: #6C63FF; }

.task-type-badge {
  background: #FF950020;
  color: #FF9500;
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

/* Bulk Certificate Button */
.bulk-cert-section {
  margin-bottom: 20px;
}

.bulk-cert-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1C1C1E;
  font-size: 14px;
  font-weight: 600;
  border-radius: 14px;
  transition: all 0.2s;
}

.bulk-cert-btn:hover:not(:disabled) {
  transform: scale(1.01);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.bulk-cert-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bulk-cert-message {
  text-align: center;
  font-size: 13px;
  margin-top: 10px;
  color: #FF6B6B;
}

.bulk-cert-message.success {
  color: #30D158;
}

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
  margin-top: 8px;
}

.stat-pill {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: #3C3C3E;
  color: #8E8E93;
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

/* ─── Enrollment Filters ────────────────────────────────────────────── */

.enrollment-filters {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.enrollment-filters .filter-input {
  flex: 1;
  background: #1C1C1E;
  border: 1px solid #2C2C2E;
  border-radius: 10px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.enrollment-filters .filter-input::placeholder { color: #636366; }
.enrollment-filters .filter-input:focus { border-color: #6C63FF; }

/* ─── Enrollment Section Styles ─────────────────────────────────────── */

.enrollment-section {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.enrollment-header-card {
  background: linear-gradient(160deg, rgba(20, 26, 43, 0.96), rgba(28, 28, 30, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
}

.enrollment-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.enrollment-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0;
}

.enrollment-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 6px;
  max-width: 32rem;
  line-height: 1.5;
}

.enrollment-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.enrollment-stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
}

.enrollment-stat-pill .stat-number {
  font-weight: 700;
  font-size: 16px;
}

.enrollment-stat-pill .stat-desc {
  font-size: 12px;
  opacity: 0.8;
}

.pending-pill {
  background: rgba(255, 149, 0, 0.12);
  color: #FF9500;
  border: 1px solid rgba(255, 149, 0, 0.2);
}

.approved-pill {
  background: rgba(48, 209, 88, 0.12);
  color: #30D158;
  border: 1px solid rgba(48, 209, 88, 0.2);
}

.rejected-pill {
  background: rgba(255, 69, 58, 0.12);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.2);
}

/* Loading skeletons */
.enrollment-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enrollment-skeleton {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #1C1C1E;
  border-radius: 14px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #2C2C2E 25%, #3A3A3C 50%, #2C2C2E 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #2C2C2E 25%, #3A3A3C 50%, #2C2C2E 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-line.long { width: 70%; }
.skeleton-line.short { width: 40%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.enrollment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  text-align: center;
}

.enrollment-empty-icon {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: rgba(48, 209, 88, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.enrollment-empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.enrollment-empty-desc {
  font-size: 14px;
  color: #8E8E93;
  max-width: 280px;
  line-height: 1.5;
}

/* Enrollment cards */
.enrollment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enrollment-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(28, 28, 30, 0.98), rgba(24, 24, 27, 0.94));
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
}

.enrollment-card:hover {
  border-color: rgba(148, 163, 184, 0.18);
  transform: translateY(-1px);
}

.enrollment-card-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.enrollment-card-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.enrollment-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  background: #2C2C2E;
}

.enrollment-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.enrollment-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.enrollment-username {
  font-size: 12px;
  color: #9CA3AF;
}

.enrollment-course-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.enrollment-course-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94A3B8;
}

.enrollment-course-name {
  font-size: 16px;
  font-weight: 700;
  color: #F8FAFC;
  line-height: 1.35;
}

.enrollment-role-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.enrollment-role-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.enrollment-role-chip.tone-student {
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.18);
}

.enrollment-role-chip.tone-teacher {
  color: #38BDF8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.18);
}

.enrollment-role-chip.tone-admin {
  color: #A78BFA;
  background: rgba(167, 139, 250, 0.12);
  border-color: rgba(167, 139, 250, 0.2);
}

.enrollment-role-chip.tone-neutral {
  color: #CBD5E1;
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.18);
}

.enrollment-time {
  font-size: 12px;
  color: #6B7280;
}

.enrollment-card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.enrollment-approve-btn,
.enrollment-reject-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 132px;
  min-height: 42px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.enrollment-approve-btn {
  background: rgba(48, 209, 88, 0.12);
  color: #30D158;
  border: 1px solid rgba(48, 209, 88, 0.2);
}

.enrollment-approve-btn:hover {
  background: rgba(48, 209, 88, 0.25);
  transform: translateY(-1px);
}

.enrollment-reject-btn {
  background: rgba(255, 69, 58, 0.1);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.15);
}

.enrollment-reject-btn:hover {
  background: rgba(255, 69, 58, 0.22);
  transform: translateY(-1px);
}

/* Card animations */
.enrollment-card-enter-active {
  transition: all 0.35s ease;
}

.enrollment-card-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: calc(100% - 32px);
}

.enrollment-card-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.enrollment-card-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.enrollment-card-move {
  transition: transform 0.35s ease;
}

@media (max-width: 520px) {
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
</style>
