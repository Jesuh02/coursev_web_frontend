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
    <div v-if="activeTab === 'activation'" class="tab-content">
      <div class="section-card">
        <div class="section-header-static">
          <h3 class="section-title">Gestión de Usuarios</h3>
          <p class="section-description">Activa o desactiva el acceso de usuarios. Los colaboradores de cursos expirados se desactivan automáticamente.</p>
        </div>

        <div class="action-row">
          <div class="search-row">
            <input v-model="userSearch" placeholder="Buscar usuario..." class="search-input" />
            <button class="icon-btn" title="Recargar" @click="loadUsers">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6" /><path d="M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
            </button>
          </div>
          <button class="expire-btn" @click="processExpiredCourses" :disabled="processingExpired">
            {{ processingExpired ? 'Procesando...' : 'Procesar cursos expirados' }}
          </button>
        </div>

        <div v-if="loadingUsers" class="loading-center">
          <div class="spinner-lg"></div>
        </div>
        <div v-else class="user-list">
          <div 
            v-for="user in filteredUsers" 
            :key="user.id" 
            class="user-card"
            :class="{ 'user-inactive': !user.isActive }"
          >
            <img :src="user.avatar || '/default-avatar.png'" class="user-avatar" alt="" />
            <div class="user-info">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-roles">{{ formatRoles(user.roles) }}</span>
            </div>
            <span :class="['status-pill', user.isActive ? 'pill-active' : 'pill-inactive']">
              {{ user.isActive ? 'Activo' : 'Inactivo' }}
            </span>
            <button 
              v-if="user.isActive"
              class="toggle-btn deactivate-btn"
              @click="toggleUserActivation(user, false)"
            >Desactivar</button>
            <button 
              v-else
              class="toggle-btn activate-btn"
              @click="toggleUserActivation(user, true)"
            >Activar</button>
          </div>
          <div v-if="filteredUsers.length === 0" class="empty-state">
            <span class="emoji">👥</span>
            <p>No se encontraron usuarios</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrícula Tab (solo rol 3) -->
    <div v-if="activeTab === 'enrollment'" class="tab-content">
      <div class="section-card">
        <div class="section-header-static">
          <h3 class="section-title">Solicitudes de Matrícula</h3>
          <p class="section-description">Aprueba o rechaza las solicitudes de acceso de estudiantes a cursos.</p>
        </div>

        <div v-if="loadingEnrollments" class="loading-center">
          <div class="spinner-lg"></div>
        </div>
        <div v-else>
          <div v-if="pendingEnrollments.length === 0" class="empty-state">
            <span class="emoji">🎓</span>
            <p>No hay solicitudes pendientes</p>
          </div>
          <div v-else class="user-list">
            <div 
              v-for="req in pendingEnrollments" 
              :key="`${req.userId}-${req.courseId}`"
              class="user-card enrollment-card"
            >
              <img :src="req.avatar || '/default-avatar.png'" class="user-avatar" alt="" />
              <div class="user-info">
                <span class="user-name">{{ req.username || `Usuario #${req.userId}` }}</span>
                <span class="course-tag">{{ req.courseName || `Curso #${req.courseId}` }}</span>
              </div>
              <div class="enrollment-btns">
                <button class="toggle-btn activate-btn" @click="approveEnrollmentReq(req)">Aprobar</button>
                <button class="toggle-btn deactivate-btn" @click="rejectEnrollmentReq(req)">Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Certificados Tab -->
    <div v-if="activeTab === 'certificates'" class="tab-content">
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
          :key="cert.courseId || cert.curso_id"
          class="cert-card"
        >
          <div class="cert-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>
          </div>
          <div class="cert-info">
            <h5>{{ cert.courseName || cert.curso_nombre || `Curso ${cert.courseId || cert.curso_id}` }}</h5>
            <p class="cert-date">Emitido: {{ formatDate(cert.certificateIssuedAt || cert.fecha_emision) }}</p>
            <a
              v-if="cert.certificateUrl || cert.url_certificado"
              :href="cert.certificateUrl || cert.url_certificado"
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
import { submissionAdapter as submissionAdapterImport } from '@/infrastructure/api/submissionAdapter'
import { useAuthStore } from '@/stores/authStore'

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
const shouldUseCompactTabs = computed(() => isRole1Only.value)

const activeTab = ref('analytics')

// Certificados
const certificates = ref<any[]>([])
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
    certificates.value = Array.isArray(data) ? data : []
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
    const result = await progressAdapter.bulkIssueCertificatesForCreator()
    const issued = (result as any)?.issued ?? 0
    bulkIssueSuccess.value = true
    bulkIssueMessage.value = issued > 0
      ? `Se generaron ${issued} certificado${issued !== 1 ? 's' : ''} exitosamente`
      : 'Todos los estudiantes aprobados ya tienen certificado'
    // Recargar la lista de certificados
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
  { id: 'certificates', label: 'Certificados', adminOnly: false },
  { id: 'activation', label: 'Activación', adminOnly: false },
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

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter((u: any) =>
    (u.username || '').toLowerCase().includes(q)
  )
})

const formatRoles = (roles: any[]) => {
  if (!roles?.length) return 'Sin rol'
  const names: Record<number, string> = { 1: 'Estudiante', 2: 'Docente', 3: 'Admin' }
  return roles.map((r: any) => names[r.id] || `Rol ${r.id}`).join(', ')
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
const pendingEnrollments = ref<any[]>([])
const loadingEnrollments = ref(false)

const loadEnrollments = async () => {
  loadingEnrollments.value = true
  try {
    const data = await progressAdapter.getPendingEnrollments()
    pendingEnrollments.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error loading enrollments:', e)
  } finally {
    loadingEnrollments.value = false
  }
}

const approveEnrollmentReq = async (req: any) => {
  try {
    await progressAdapter.approveEnrollment(req.userId, req.courseId)
    pendingEnrollments.value = pendingEnrollments.value.filter(
      r => !(r.userId === req.userId && r.courseId === req.courseId)
    )
  } catch (e) {
    console.error('Error approving enrollment:', e)
  }
}

const rejectEnrollmentReq = async (req: any) => {
  try {
    await progressAdapter.rejectEnrollment(req.userId, req.courseId)
    pendingEnrollments.value = pendingEnrollments.value.filter(
      r => !(r.userId === req.userId && r.courseId === req.courseId)
    )
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
    const courses = await courseAdapter.getCoursesByCreatorId(userId)
    if (!Array.isArray(courses)) return

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
    const courses = await courseAdapter.getCoursesByCreatorId(userId)
    if (!Array.isArray(courses)) return

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
    const courses = await courseAdapter.getCoursesByCreatorId(userId)
    if (!Array.isArray(courses)) return

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

      stats.value[0].value = totalPendingTasks
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
      await loadPendingTasksWithSubjects(myProgress)
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

    if (enrolledCourseIds.length === 0) return

    const mySubmissions = await submissionAdapter.getMySubmissions(1)
    const submittedTaskIds = new Set(
      (Array.isArray(mySubmissions) ? mySubmissions : (mySubmissions as any)?.data ?? [])
        .map((s: any) => s.taskId || s.task_id)
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

    pendingTasks.value = allPending
  } catch (e) {
    console.error('Error loading pending tasks with subjects:', e)
  }
}

onMounted(() => {
  loadData()
  if (!shouldUseCompactTabs.value) {
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
  background: #1C1C1E;
  border-radius: 16px;
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

.stat-value { font-size: 24px; font-weight: 700; color: #fff; }
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
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
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
</style>
