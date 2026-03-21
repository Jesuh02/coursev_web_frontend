import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/domain/models'
import { authAdapter, userAdapter, tokenStorage, HttpError } from '@/infrastructure/api'
import router from '@/router'
import { useCourseStore } from '@/stores/courseStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useProgressStore } from '@/stores/progressStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useVideoStore } from '@/stores/videoStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => tokenStorage.isAuthenticated)

  function hasRole(roleId: number): boolean {
    return user.value?.roles?.some(r => r.id === roleId) ?? false
  }

  async function hydrateAuthoritativeUser(fallbackUser: User) {
    try {
      user.value = await userAdapter.getMyProfile()
    } catch {
      user.value = fallbackUser
    }
  }

  const isAdmin = computed(() => hasRole(3))
  const isDocente = computed(() => hasRole(2))
  const isAdminOrDocente = computed(() => isAdmin.value || isDocente.value)
  const isCreator = computed(() => isAdmin.value || isDocente.value)

  function canModifyCourse(creatorUserId: number): boolean {
    void creatorUserId
    return isAdmin.value
  }

  async function login(usernameOrEmail: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      _resetUserStores()
      tokenStorage.clear()
      const res = await authAdapter.login(usernameOrEmail, password)
      tokenStorage.token = res.accessToken
      tokenStorage.refreshToken = res.refreshToken
      tokenStorage.userId = res.user.id
      await hydrateAuthoritativeUser(res.user)
    } catch (e) {
      error.value = e instanceof HttpError ? e.message : 'Error de conexión'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, password: string, email: string, personaId?: number, personaData?: Record<string, unknown>) {
    loading.value = true
    error.value = ''
    try {
      const res = await authAdapter.register(username, password, email, personaId, personaData)
      tokenStorage.token = res.accessToken
      tokenStorage.refreshToken = res.refreshToken
      tokenStorage.userId = res.user.id
      await hydrateAuthoritativeUser(res.user)
    } catch (e) {
      error.value = e instanceof HttpError ? e.message : 'Error de registro'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loginWithGoogle(email: string, displayName?: string, avatarUrl?: string, usernameHint?: string) {
    loading.value = true
    error.value = ''
    try {
      _resetUserStores()
      tokenStorage.clear()
      const res = await authAdapter.loginWithGoogle(email, displayName, avatarUrl, usernameHint)
      tokenStorage.token = res.accessToken
      tokenStorage.refreshToken = res.refreshToken
      tokenStorage.userId = res.user.id
      await hydrateAuthoritativeUser(res.user)
    } catch (e) {
      error.value = e instanceof HttpError ? e.message : 'Error con Google'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!tokenStorage.isAuthenticated) return
    try {
      user.value = await userAdapter.getMyProfile()
    } catch {
      logout()
    }
  }

  function _resetUserStores() {
    user.value = null
    useCourseStore().$patch({ courses: [], current: null, page: 1, hasMore: true, filterCounts: {}, activeFilter: 'all' })
    useNotificationStore().$patch({ items: [], unreadCount: 0 })
    useProgressStore().$patch({ myProgress: [], enrolledCourseIds: [] })
    useSubscriptionStore().$patch({ subscriptions: [], creators: [] })
    useVideoStore().$patch({ videos: [], current: null, page: 1, lastFetched: 0 })
  }

  function logout() {
    _resetUserStores()
    tokenStorage.clear()
    router.push('/login')
  }

  function setUser(u: User | null) { user.value = u }
  function setToken(t: string | null) { tokenStorage.token = t }

  return {
    user, loading, error,
    isAuthenticated, isAdmin, isDocente, isAdminOrDocente, isCreator,
    hasRole, canModifyCourse,
    login, register, loginWithGoogle, fetchProfile, logout,
    setUser, setToken,
  }
})
