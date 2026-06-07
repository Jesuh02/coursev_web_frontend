import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardWithThis } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useVideoStore } from '@/stores/videoStore'
import { extractEnrollmentStatus, progressAdapter } from '@/infrastructure/api/progressAdapter'
import { collaboratorAdapter } from '@/infrastructure/api'

/**
 * Route-level guard: blocks navigation to course-related pages when
 * the user's enrollment_status is 'inactivo' or 'revoked'.
 */
const enrollmentGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const authStore = useAuthStore()
  if (authStore.isAdmin) return true

  const courseId = Number(to.params.courseId ?? to.params.id)
  if (!courseId || courseId <= 0) return true

  // Collaborators bypass enrollment check
  try {
    const access = await collaboratorAdapter.checkAccess(courseId)
    if (access?.hasAccess) return true
  } catch { /* continue to enrollment check */ }

  try {
    const data: any = await progressAdapter.getEnrollmentStatus(courseId)
    const status = extractEnrollmentStatus(data)
    if (status === 'inactivo' || status === 'revoked') {
      const msg = status === 'inactivo'
        ? 'Tu acceso a este curso fue desactivado por el administrador.'
        : 'Tu acceso a este curso fue revocado por el administrador.'
      return { path: '/explore', query: { accessDenied: msg } }
    }
  } catch { /* on error let the component handle it */ }

  return true
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },

  // Auth
  { path: '/login', name: 'login', component: () => import('@/ui/features/auth/LoginView.vue'), meta: { hideNav: true } },
  { path: '/register', name: 'register', component: () => import('@/ui/features/auth/RegisterView.vue'), meta: { hideNav: true } },
  { path: '/splash', name: 'splash', component: () => import('@/ui/features/auth/SplashView.vue'), meta: { hideNav: true } },

  // Main tabs
  { path: '/video', name: 'videoHome', component: () => import('@/ui/features/video/VideoHomeView.vue') },
  { path: '/video/upload', name: 'videoUpload', component: () => import('@/ui/features/video/VideoDetailsView.vue'), meta: { hideNav: true } },
  { path: '/explore', name: 'explore', component: () => import('@/ui/features/explore/ExploreView.vue') },
  { path: '/home', name: 'home', component: () => import('@/ui/features/home/HomeView.vue') },
  { path: '/notifications', name: 'notifications', component: () => import('@/ui/features/notifications/NotificationsView.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/ui/features/profile/ProfileView.vue') },
  { path: '/profile/edit', name: 'editProfile', component: () => import('@/ui/features/profile/EditProfileView.vue'), meta: { hideNav: true } },

  // Content
  { path: '/upload', name: 'contentUpload', component: () => import('@/ui/features/content/ContentUploadView.vue'), meta: { hideNav: true } },
  { path: '/video/:id', name: 'videoDetails', component: () => import('@/ui/features/video/VideoDetailsView.vue'), props: true, meta: { hideNav: true } },

  // Course
  { path: '/course/create', name: 'courseCreation', component: () => import('@/ui/features/course/CourseCreationView.vue'), meta: { hideNav: true } },
  { path: '/course/:id/edit', name: 'courseEdit', component: () => import('@/ui/features/course/CourseCreationView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:id', name: 'courseDetail', component: () => import('@/ui/features/course/CourseDetailView.vue'), props: true, beforeEnter: enrollmentGuard },
  { path: '/course/:courseId/topic/:topicId?', name: 'courseTopic', component: () => import('@/ui/features/course/CourseTopicView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/task/:taskId?', name: 'courseTask', component: () => import('@/ui/features/course/CourseTaskView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/select-topic', name: 'selectTopic', component: () => import('@/ui/features/course/SelectTopicView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/topic/:topicId/select-task', name: 'selectTask', component: () => import('@/ui/features/course/SelectTaskView.vue'), props: true, meta: { hideNav: true } },

  // Submissions
  { path: '/task-submission/:taskId', name: 'taskSubmission', component: () => import('@/ui/features/course/TaskSubmissionView.vue'), props: true, meta: { hideNav: true } },

  // Users
  { path: '/user/:userId', name: 'userProfile', component: () => import('@/ui/features/profile/UserProfileView.vue'), props: true },

  // Chat
  { path: '/chatbot', name: 'chatbot', component: () => import('@/ui/features/chat/ChatBotLLMView.vue'), meta: { hideNav: true } },
  { path: '/chat', name: 'chat', component: () => import('@/ui/features/chat/ChatBotView.vue'), meta: { hideNav: true } },

  // Reinforcement
  { path: '/reinforcement/:courseId', name: 'reinforcementLearning', component: () => import('@/ui/features/reinforcement/ReinforcementLearningView.vue'), props: true, meta: { hideNav: true } },
  { path: '/evaluative-reinforcement', name: 'evaluativeReinforcement', component: () => import('@/ui/features/reinforcement/EvaluativeReinforcementView.vue'), meta: { hideNav: true } },

  // ICFES
  { path: '/icfes', name: 'icfesHome', component: () => import('@/ui/features/icfes/IcfesHomeView.vue') },
  { path: '/icfes/exam/:area', name: 'icfesExam', component: () => import('@/ui/features/icfes/IcfesExamView.vue'), props: true, meta: { hideNav: true } },
  { path: '/icfes/results', name: 'icfesResults', component: () => import('@/ui/features/icfes/IcfesResultsView.vue'), meta: { hideNav: true } },

  { path: '/course-selection', name: 'courseSelection', component: () => import('@/ui/features/reinforcement/CourseSelectionView.vue'), meta: { hideNav: true } },
  { path: '/subject-selection/:courseId', name: 'subjectSelection', component: () => import('@/ui/features/reinforcement/SubjectSelectionView.vue'), props: true, meta: { hideNav: true } },

  // Learning (AI comic & video)
  { path: '/learning', name: 'learningHome', component: () => import('@/ui/features/learning/LearningHomeView.vue'), meta: { hideNav: true } },
  { path: '/learning/course-selection', name: 'learningCourseSelection', component: () => import('@/ui/features/learning/LearningCourseSelectionView.vue'), meta: { hideNav: true } },
  { path: '/learning/course/:courseId/topic-selection', name: 'learningTopicSelection', component: () => import('@/ui/features/learning/LearningTopicSelectionView.vue'), props: true, meta: { hideNav: true } },
  { path: '/learning/course/:courseId/topic/:topicId/task-selection', name: 'learningTaskSelection', component: () => import('@/ui/features/learning/LearningTaskSelectionView.vue'), props: true, meta: { hideNav: true } },
  { path: '/learning/course/:courseId/topic/:topicId/task/:taskId/mode', name: 'learningMode', component: () => import('@/ui/features/learning/LearningModeView.vue'), props: true, meta: { hideNav: true } },
  { path: '/learning/course/:courseId/topic/:topicId/task/:taskId/comic', name: 'learningComic', component: () => import('@/ui/features/learning/LearningComicView.vue'), props: true, meta: { hideNav: true } },
  { path: '/learning/course/:courseId/topic/:topicId/task/:taskId/video', name: 'learningVideo', component: () => import('@/ui/features/learning/LearningVideoView.vue'), props: true, meta: { hideNav: true } },

  // Admin
  { path: '/admin', name: 'adminDashboard', component: () => import('@/ui/features/admin/AdminDashboardView.vue') },
  { path: '/admin/database', name: 'databaseQuery', component: () => import('@/ui/features/admin/DatabaseQueryView.vue'), meta: { hideNav: true } },

  // Payment
  { path: '/payment/:courseId', name: 'paymentForm', component: () => import('@/ui/features/payment/PaymentFormView.vue'), props: true, meta: { hideNav: true } },

  // Subjects
  { path: '/subjects/:courseId', name: 'subjectsList', component: () => import('@/ui/features/subjects/SubjectsListView.vue'), props: true, beforeEnter: enrollmentGuard },
  { path: '/subjects/create', name: 'subjectCreation', component: () => import('@/ui/features/subjects/SubjectCreationView.vue'), meta: { hideNav: true, requiresHigherRole: true } },

  // Misc
  { path: '/subscriptions', name: 'subscriptions', component: () => import('@/ui/features/profile/SubscriptionsView.vue') },
  { path: '/content/upload', name: 'contentUpload2', component: () => import('@/ui/features/content/ContentUploadView.vue'), meta: { hideNav: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const PUBLIC_ROUTES = new Set(['login', 'register', 'splash'])

// Guard: redirect unauthenticated users to /login for any non-public route
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (!PUBLIC_ROUTES.has(to.name as string) && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresHigherRole) {
    const isRole1Only = authStore.hasRole(1) && !authStore.hasRole(2) && !authStore.hasRole(3) && !authStore.hasRole(4)
    if (isRole1Only) {
      next({ name: 'explore' })
      return
    }
  }

  // Prefetch videos al navegar a /video para que ya estén cuando monte la vista
  if (to.name === 'videoHome') {
    useVideoStore().fetchPublicFeed()
  }

  next()
})

// Handle stale chunk errors after a new deployment.
// When Vite rebuilds, chunk hashes change. Old HTML in cache references
// missing chunks → dynamic import fails with "Failed to fetch dynamically
// imported module". The fix is a full page reload so the browser fetches
// the fresh HTML and correct chunk URLs.
router.onError((error, to) => {
  const isChunkLoadError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.message?.includes('Unable to preload CSS') ||
    /Loading chunk .* failed/.test(error?.message ?? '')

  if (isChunkLoadError) {
    // Avoid reload loop: only reload if the URL differs from current location
    if (to?.fullPath && window.location.pathname + window.location.search !== to.fullPath) {
      window.location.href = to.fullPath
    } else {
      window.location.reload()
    }
  }
})

export default router
