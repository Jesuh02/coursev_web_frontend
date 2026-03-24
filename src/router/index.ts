import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useVideoStore } from '@/stores/videoStore'

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
  { path: '/course/:id', name: 'courseDetail', component: () => import('@/ui/features/course/CourseDetailView.vue'), props: true },
  { path: '/course/:courseId/topic/:topicId?', name: 'courseTopic', component: () => import('@/ui/features/course/CourseTopicView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/task/:taskId?', name: 'courseTask', component: () => import('@/ui/features/course/CourseTaskView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/select-topic', name: 'selectTopic', component: () => import('@/ui/features/course/SelectTopicView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/topic/:topicId/select-task', name: 'selectTask', component: () => import('@/ui/features/course/SelectTaskView.vue'), props: true, meta: { hideNav: true } },
  { path: '/course/:courseId/topic/:topicId/difficulty', name: 'selectDifficulty', component: () => import('@/ui/features/course/DifficultySelectionView.vue'), props: true, meta: { hideNav: true } },

  // Submissions
  { path: '/task-submission/:taskId', name: 'taskSubmission', component: () => import('@/ui/features/course/TaskSubmissionView.vue'), props: true, meta: { hideNav: true } },

  // Users
  { path: '/user/:userId', name: 'userProfile', component: () => import('@/ui/features/profile/UserProfileView.vue'), props: true },

  // Chat
  { path: '/chatbot', name: 'chatbot', component: () => import('@/ui/features/chat/ChatBotView.vue'), meta: { hideNav: true } },

  // Reinforcement
  { path: '/reinforcement/:courseId', name: 'reinforcementLearning', component: () => import('@/ui/features/reinforcement/ReinforcementLearningView.vue'), props: true, meta: { hideNav: true } },
  { path: '/evaluative-reinforcement', name: 'evaluativeReinforcement', component: () => import('@/ui/features/reinforcement/EvaluativeReinforcementView.vue'), meta: { hideNav: true } },
  { path: '/course-selection', name: 'courseSelection', component: () => import('@/ui/features/reinforcement/CourseSelectionView.vue'), meta: { hideNav: true } },
  { path: '/subject-selection/:courseId', name: 'subjectSelection', component: () => import('@/ui/features/reinforcement/SubjectSelectionView.vue'), props: true, meta: { hideNav: true } },

  // Admin
  { path: '/admin', name: 'adminDashboard', component: () => import('@/ui/features/admin/AdminDashboardView.vue') },
  { path: '/admin/database', name: 'databaseQuery', component: () => import('@/ui/features/admin/DatabaseQueryView.vue'), meta: { hideNav: true } },

  // Payment
  { path: '/payment/:courseId', name: 'paymentForm', component: () => import('@/ui/features/payment/PaymentFormView.vue'), props: true, meta: { hideNav: true } },

  // Subjects
  { path: '/subjects/:courseId', name: 'subjectsList', component: () => import('@/ui/features/subjects/SubjectsListView.vue'), props: true },
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
    const isRole1Only = authStore.hasRole(1) && !authStore.hasRole(2) && !authStore.hasRole(3)
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

export default router
