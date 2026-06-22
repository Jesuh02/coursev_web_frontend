<template>
  <div class="cognitive-dashboard">
    <!-- Header with glassmorphism -->
    <header class="dashboard-header">
      <div class="header-blur" />
      <div class="header-content">
        <div class="header-top">
          <button class="back-button" @click="$router.back()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-title-group">
            <h1 class="header-title">Cognitive Analytics</h1>
            <p class="header-subtitle">Gemelo Cognitivo de Estudiantes</p>
          </div>
        </div>

        <!-- Course selector -->
        <div class="course-selector">
          <select v-model="selectedCourseId" class="course-select" @change="loadAnalytics">
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
          <div class="select-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Stats cards with animation -->
        <div v-if="courseStats" class="stats-grid">
          <div class="stat-card stat-students" :style="{ '--delay': '0s' }">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-value">{{ courseStats.totalStudents }}</div>
            <div class="stat-label">Estudiantes Activos</div>
          </div>

          <div class="stat-card stat-accuracy" :style="{ '--delay': '0.1s' }">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-value">{{ courseStats.avgAccuracy }}%</div>
            <div class="stat-label">Precisin Promedio</div>
          </div>

          <div class="stat-card stat-sessions" :style="{ '--delay': '0.2s' }">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-value">{{ courseStats.totalSessions }}</div>
            <div class="stat-label">Sesiones Totales</div>
          </div>

          <div class="stat-card stat-grade" :style="{ '--delay': '0.3s' }">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-value">{{ courseStats.avgGrade }}</div>
            <div class="stat-label">Nota Promedio</div>
          </div>
        </div>

        <!-- Skill distribution -->
        <div v-if="courseStats" class="distribution-section">
          <h3 class="section-title">Distribucin de Niveles</h3>
          <div class="skill-bars">
            <div class="skill-bar">
              <div class="skill-info">
                <span class="skill-label">Avanzado</span>
                <span class="skill-count">{{ courseStats.skillDistribution.advanced }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-advanced" :style="{ width: `${(courseStats.skillDistribution.advanced / courseStats.totalStudents) * 100}%` }" />
              </div>
            </div>
            <div class="skill-bar">
              <div class="skill-info">
                <span class="skill-label">Intermedio</span>
                <span class="skill-count">{{ courseStats.skillDistribution.intermediate }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-intermediate" :style="{ width: `${(courseStats.skillDistribution.intermediate / courseStats.totalStudents) * 100}%` }" />
              </div>
            </div>
            <div class="skill-bar">
              <div class="skill-info">
                <span class="skill-label">En Desarrollo</span>
                <span class="skill-count">{{ courseStats.skillDistribution.developing }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-developing" :style="{ width: `${(courseStats.skillDistribution.developing / courseStats.totalStudents) * 100}%` }" />
              </div>
            </div>
            <div class="skill-bar">
              <div class="skill-info">
                <span class="skill-label">Principiante</span>
                <span class="skill-count">{{ courseStats.skillDistribution.beginner }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill bar-beginner" :style="{ width: `${(courseStats.skillDistribution.beginner / courseStats.totalStudents) * 100}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Sort controls -->
    <div class="controls-section">
      <div class="sort-chips">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="['sort-chip', { active: sortBy === option.value }]"
          @click="changeSortBy(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner" />
      <p class="loading-text">Analizando patrones cognitivos...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!students.length" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      <h3 class="empty-title">Sin datos de refuerzo</h3>
      <p class="empty-description">Aun no hay estudiantes que hayan completado sesiones de refuerzo en este curso.</p>
    </div>

    <!-- Students list -->
    <div v-else class="students-list">
      <TransitionGroup name="student-list">
        <article
          v-for="(student, index) in students"
          :key="student.id"
          class="student-card"
          :style="{ '--index': index }"
          @click="openStudentDetail(student)"
        >
          <!-- Avatar section -->
          <div class="student-avatar-section">
            <div class="avatar-container">
              <img
                v-if="student.avatar"
                :src="student.avatar"
                :alt="student.fullName"
                class="avatar-image"
              />
              <div v-else class="avatar-fallback" :style="{ background: student.cognitiveInsights.skillColor }">
                {{ getInitials(student.fullName) }}
              </div>
              <div
                class="skill-badge"
                :style="{ background: student.cognitiveInsights.skillColor }"
                :title="student.cognitiveInsights.skillLevel"
              >
                <svg v-if="student.cognitiveInsights.skillLevel === 'advanced'" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor"/>
                </svg>
                <svg v-else-if="student.cognitiveInsights.skillLevel === 'intermediate'" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Info section -->
          <div class="student-info">
            <h3 class="student-name">{{ student.fullName }}</h3>
            <p class="student-username">@{{ student.username }}</p>

            <!-- Trend indicator -->
            <div class="trend-indicator" :class="student.cognitiveInsights.trend">
              <svg v-if="student.cognitiveInsights.trend === 'improving'" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 6H23V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="student.cognitiveInsights.trend === 'declining'" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 18H23V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="trend-text">{{ getTrendText(student.cognitiveInsights.trend) }}</span>
            </div>
          </div>

          <!-- Metrics section -->
          <div class="student-metrics">
            <div class="metric">
              <div class="metric-value">{{ student.performance.accuracy }}%</div>
              <div class="metric-label">Precisin</div>
            </div>
            <div class="metric">
              <div class="metric-value">{{ student.performance.totalSessions }}</div>
              <div class="metric-label">Sesiones</div>
            </div>
            <div class="metric">
              <div class="metric-value">{{ student.performance.avgGrade }}</div>
              <div class="metric-label">Nota Prom.</div>
            </div>
          </div>

          <!-- Mini chart -->
          <div class="mini-chart">
            <svg viewBox="0 0 100 40" class="chart-svg">
              <polyline
                :points="getChartPoints(student.recentHistory)"
                fill="none"
                :stroke="student.cognitiveInsights.skillColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- Last activity -->
          <div class="last-activity">
            <span class="activity-label">ltima actividad</span>
            <span class="activity-time">{{ formatTimeAgo(student.lastActivity) }}</span>
          </div>

          <!-- Chevron -->
          <div class="card-chevron">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <!-- Student detail modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedStudent" class="modal-overlay" @click.self="selectedStudent = null">
          <div class="modal-content">
            <button class="modal-close" @click="selectedStudent = null">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>

            <!-- Modal header -->
            <div class="modal-header">
              <div class="modal-avatar">
                <img
                  v-if="selectedStudent.avatar"
                  :src="selectedStudent.avatar"
                  :alt="selectedStudent.fullName"
                />
                <div v-else class="modal-avatar-fallback" :style="{ background: selectedStudent.cognitiveInsights.skillColor }">
                  {{ getInitials(selectedStudent.fullName) }}
                </div>
              </div>
              <div class="modal-title-group">
                <h2 class="modal-name">{{ selectedStudent.fullName }}</h2>
                <p class="modal-username">@{{ selectedStudent.username }}</p>
                <div class="modal-skill-badge" :style="{ background: selectedStudent.cognitiveInsights.skillColor }">
                  {{ getSkillText(selectedStudent.cognitiveInsights.skillLevel) }}
                </div>
              </div>
            </div>

            <!-- Cognitive insights -->
            <div class="insights-grid">
              <div class="insight-card">
                <div class="insight-icon insight-accuracy">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="insight-value">{{ selectedStudent.performance.accuracy }}%</div>
                <div class="insight-label">Precisin</div>
              </div>

              <div class="insight-card">
                <div class="insight-icon insight-consistency">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="insight-value">{{ selectedStudent.cognitiveInsights.consistency }}%</div>
                <div class="insight-label">Consistencia</div>
              </div>

              <div class="insight-card">
                <div class="insight-icon insight-time">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="insight-value">{{ selectedStudent.performance.avgTimePerQuestion }}s</div>
                <div class="insight-label">Tiempo/Pregunta</div>
              </div>

              <div class="insight-card">
                <div class="insight-icon insight-improvement">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" stroke-width="2"/>
                    <path d="M17 6H23V12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="insight-value" :class="{ positive: selectedStudent.cognitiveInsights.improvementRate > 0, negative: selectedStudent.cognitiveInsights.improvementRate < 0 }">
                  {{ selectedStudent.cognitiveInsights.improvementRate > 0 ? '+' : '' }}{{ selectedStudent.cognitiveInsights.improvementRate }}%
                </div>
                <div class="insight-label">Mejora</div>
              </div>
            </div>

            <!-- Study pattern -->
            <div class="study-pattern" v-if="selectedStudent.cognitiveInsights.preferredStudyHour !== null">
              <h4 class="pattern-title">Patrn de Estudio</h4>
              <div class="pattern-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Hora preferida: <strong>{{ formatHour(selectedStudent.cognitiveInsights.preferredStudyHour) }}</strong></span>
              </div>
            </div>

            <!-- Performance chart -->
            <div class="performance-chart">
              <h4 class="chart-title">Historial de Rendimiento</h4>
              <svg viewBox="0 0 300 100" class="detail-chart">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="selectedStudent.cognitiveInsights.skillColor" stop-opacity="0.3"/>
                    <stop offset="100%" :stop-color="selectedStudent.cognitiveInsights.skillColor" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <polygon
                  :points="getDetailChartArea(selectedStudent.recentHistory)"
                  fill="url(#chartGradient)"
                />
                <polyline
                  :points="getDetailChartPoints(selectedStudent.recentHistory)"
                  fill="none"
                  :stroke="selectedStudent.cognitiveInsights.skillColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <g v-for="(point, i) in selectedStudent.recentHistory" :key="i">
                  <circle
                    :cx="(i / Math.max(selectedStudent.recentHistory.length - 1, 1)) * 280 + 10"
                    :cy="90 - (point.accuracy / 100) * 80"
                    r="4"
                    :fill="selectedStudent.cognitiveInsights.skillColor"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { courseAdapter } from '@/infrastructure/api'

interface CognitiveInsights {
  skillLevel: string
  skillColor: string
  trend: string
  improvementRate: number
  consistency: number
  engagementLevel: string
  preferredStudyHour: number | null
  difficultyStats: Record<string, { total: number; correct: number }>
}

interface Performance {
  accuracy: number
  avgGrade: number
  totalQuestions: number
  totalCorrect: number
  totalIncorrect: number
  totalSessions: number
  totalDuration: number
  avgTimePerQuestion: number
}

interface HistoryPoint {
  date: string
  grade: number
  accuracy: number
  questions: number
}

interface StudentProfile {
  id: number
  username: string
  email: string
  avatar: string | null
  fullName: string
  firstName: string
  lastName: string
  performance: Performance
  cognitiveInsights: CognitiveInsights
  lastActivity: string | null
  daysSinceLastActivity: number
  recentHistory: HistoryPoint[]
  firstSession: string | null
}

interface CourseStats {
  totalStudents: number
  avgAccuracy: number
  avgGrade: number
  totalQuestions: number
  totalSessions: number
  skillDistribution: {
    advanced: number
    intermediate: number
    developing: number
    beginner: number
  }
  trendDistribution: {
    improving: number
    stable: number
    declining: number
  }
  engagementDistribution: {
    high: number
    medium: number
    low: number
  }
}

interface Course {
  id: number
  name: string
}

const route = useRoute()

const loading = ref(true)
const students = ref<StudentProfile[]>([])
const courseStats = ref<CourseStats | null>(null)
const courses = ref<Course[]>([])
const selectedCourseId = ref<number | null>(null)
const selectedStudent = ref<StudentProfile | null>(null)
const sortBy = ref('recent_activity')

const sortOptions = [
  { value: 'recent_activity', label: 'Reciente' },
  { value: 'performance', label: 'Rendimiento' },
  { value: 'sessions', label: 'Sesiones' },
  { value: 'improvement', label: 'Mejora' },
]

const API_URL = import.meta.env.VITE_API_URL || ''

async function loadCourses() {
  try {
    const result = await courseAdapter.getCourses()
    courses.value = result.map((c: any) => ({ id: c.id, name: c.name }))
    if (courses.value.length > 0) {
      selectedCourseId.value = route.query.courseId
        ? parseInt(route.query.courseId as string)
        : courses.value[0].id
    }
  } catch (error) {
    console.error('Error loading courses:', error)
  }
}

async function loadAnalytics() {
  if (!selectedCourseId.value) return

  loading.value = true
  try {
    const response = await fetch(
      `${API_URL}/api/reinforcement/cognitive-analytics?courseId=${selectedCourseId.value}&sortBy=${sortBy.value}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      }
    )

    if (!response.ok) throw new Error('Failed to load analytics')

    const data = await response.json()
    students.value = data.data.students
    courseStats.value = data.data.courseStats
  } catch (error) {
    console.error('Error loading analytics:', error)
    students.value = []
    courseStats.value = null
  } finally {
    loading.value = false
  }
}

function changeSortBy(value: string) {
  sortBy.value = value
  loadAnalytics()
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getTrendText(trend: string): string {
  const texts: Record<string, string> = {
    improving: 'Mejorando',
    stable: 'Estable',
    declining: 'Declinando',
  }
  return texts[trend] || trend
}

function getSkillText(level: string): string {
  const texts: Record<string, string> = {
    advanced: 'Avanzado',
    intermediate: 'Intermedio',
    developing: 'En Desarrollo',
    beginner: 'Principiante',
  }
  return texts[level] || level
}

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Nunca'

  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days}d`
  return new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:00 ${period}`
}

function getChartPoints(history: HistoryPoint[]): string {
  if (!history.length) return '0,40 100,40'

  return history.map((point, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 100
    const y = 40 - (point.accuracy / 100) * 35
    return `${x},${y}`
  }).join(' ')
}

function getDetailChartPoints(history: HistoryPoint[]): string {
  if (!history.length) return '10,90 290,90'

  return history.map((point, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 280 + 10
    const y = 90 - (point.accuracy / 100) * 80
    return `${x},${y}`
  }).join(' ')
}

function getDetailChartArea(history: HistoryPoint[]): string {
  if (!history.length) return '10,90 290,90 290,90 10,90'

  const linePoints = history.map((point, i) => {
    const x = (i / Math.max(history.length - 1, 1)) * 280 + 10
    const y = 90 - (point.accuracy / 100) * 80
    return `${x},${y}`
  })

  return `10,90 ${linePoints.join(' ')} 290,90`
}

function openStudentDetail(student: StudentProfile) {
  selectedStudent.value = student
}

onMounted(async () => {
  await loadCourses()
  await loadAnalytics()
})
</script>

<style scoped>
.cognitive-dashboard {
  min-height: 100vh;
  background: var(--bg-primary, #000);
  padding-bottom: 100px;
}

/* Header */
.dashboard-header {
  position: relative;
  background: linear-gradient(180deg, rgba(88, 86, 214, 0.15) 0%, transparent 100%);
}

.header-blur {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

.header-content {
  position: relative;
  padding: 16px 20px 24px;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-primary, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #fff);
  letter-spacing: -0.5px;
  margin: 0;
}

.header-subtitle {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin: 4px 0 0;
}

/* Course selector */
.course-selector {
  position: relative;
  margin-bottom: 24px;
}

.course-select {
  width: 100%;
  padding: 14px 44px 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: var(--text-primary, #fff);
  font-size: 16px;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.course-select:focus {
  outline: none;
  border-color: rgba(88, 86, 214, 0.5);
  background: rgba(255, 255, 255, 0.12);
}

.select-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  pointer-events: none;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  animation: fadeInUp 0.5s ease backwards;
  animation-delay: var(--delay);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.stat-students .stat-icon { background: rgba(191, 90, 242, 0.2); color: #BF5AF2; }
.stat-accuracy .stat-icon { background: rgba(48, 209, 88, 0.2); color: #30D158; }
.stat-sessions .stat-icon { background: rgba(10, 132, 255, 0.2); color: #0A84FF; }
.stat-grade .stat-icon { background: rgba(255, 214, 10, 0.2); color: #FFD60A; }

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #fff);
  letter-spacing: -1px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  margin-top: 4px;
}

/* Skill distribution */
.distribution-section {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0 0 16px;
}

.skill-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skill-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-label {
  font-size: 13px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
}

.skill-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #fff);
}

.bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.bar-advanced { background: linear-gradient(90deg, #30D158, #34C759); }
.bar-intermediate { background: linear-gradient(90deg, #0A84FF, #5AC8FA); }
.bar-developing { background: linear-gradient(90deg, #FFD60A, #FF9F0A); }
.bar-beginner { background: linear-gradient(90deg, #FF453A, #FF6961); }

/* Controls */
.controls-section {
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-primary, #000);
}

.sort-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sort-chips::-webkit-scrollbar {
  display: none;
}

.sort-chip {
  padding: 10px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-chip.active {
  background: rgba(88, 86, 214, 0.3);
  border-color: rgba(88, 86, 214, 0.5);
  color: #fff;
}

.sort-chip:hover:not(.active) {
  background: rgba(255, 255, 255, 0.12);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(88, 86, 214, 0.2);
  border-top-color: #5856D6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  font-size: 14px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary, rgba(255, 255, 255, 0.3));
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0 0 8px;
}

.empty-description {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  max-width: 280px;
  margin: 0;
}

/* Students list */
.students-list {
  padding: 0 16px;
}

.student-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeInUp 0.4s ease backwards;
  animation-delay: calc(var(--index) * 0.05s);
}

.student-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.student-card:active {
  transform: scale(0.98);
}

/* Avatar */
.student-avatar-section {
  grid-row: span 2;
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  width: 56px;
  height: 56px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.skill-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 2px solid var(--bg-primary, #000);
}

/* Student info */
.student-info {
  min-width: 0;
}

.student-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-username {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  margin: 2px 0 0;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
}

.trend-indicator.improving {
  background: rgba(48, 209, 88, 0.15);
  color: #30D158;
}

.trend-indicator.stable {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
}

.trend-indicator.declining {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
}

/* Metrics */
.student-metrics {
  display: flex;
  gap: 16px;
  align-items: center;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #fff);
}

.metric-label {
  font-size: 10px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.4));
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Mini chart */
.mini-chart {
  grid-column: 2 / 3;
  height: 40px;
}

.chart-svg {
  width: 100%;
  height: 100%;
}

/* Last activity */
.last-activity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.activity-label {
  font-size: 10px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.4));
  text-transform: uppercase;
}

.activity-time {
  font-size: 13px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
}

/* Chevron */
.card-chevron {
  grid-row: span 2;
  display: flex;
  align-items: center;
  color: var(--text-secondary, rgba(255, 255, 255, 0.3));
}

/* List animation */
.student-list-enter-active,
.student-list-leave-active {
  transition: all 0.3s ease;
}

.student-list-enter-from,
.student-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-secondary, #1c1c1e);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.modal-avatar {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  overflow: hidden;
}

.modal-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.modal-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #fff);
  margin: 0;
}

.modal-username {
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  margin: 4px 0 8px;
}

.modal-skill-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

/* Insights grid */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.insight-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.insight-accuracy { background: rgba(48, 209, 88, 0.2); color: #30D158; }
.insight-consistency { background: rgba(10, 132, 255, 0.2); color: #0A84FF; }
.insight-time { background: rgba(255, 159, 10, 0.2); color: #FF9F0A; }
.insight-improvement { background: rgba(191, 90, 242, 0.2); color: #BF5AF2; }

.insight-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary, #fff);
}

.insight-value.positive { color: #30D158; }
.insight-value.negative { color: #FF453A; }

.insight-label {
  font-size: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  margin-top: 4px;
}

/* Study pattern */
.study-pattern {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
}

.pattern-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0 0 12px;
}

.pattern-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  font-size: 14px;
}

.pattern-info strong {
  color: var(--text-primary, #fff);
}

/* Performance chart */
.performance-chart {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #fff);
  margin: 0 0 16px;
}

.detail-chart {
  width: 100%;
  height: 100px;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(100%);
}

/* Responsive */
@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .modal-overlay {
    align-items: center;
  }

  .modal-content {
    border-radius: 24px;
    max-height: 80vh;
  }
}
</style>
