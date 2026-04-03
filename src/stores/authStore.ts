import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// NOTE: tokenStorage is a plain object (non-reactive), so we
// cannot use computed(() => tokenStorage.isAuthenticated) —
// Vue never re-evaluates a computed with zero reactive deps.
import type { User } from '@/domain/models'
import { authAdapter, userAdapter, tokenStorage, HttpError, setOnUnauthorized } from '@/infrastructure/api'
import type { TenantLoginResult } from '@/infrastructure/api/tenantResolver'
import { setSelectedTenant } from '@/config/tenants'
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

  // Reactive ref so the router guard and LoginView always see the real state.
  const isAuthenticated = ref(tokenStorage.isAuthenticated)

  function hasRole(roleId: number): boolean {
    return user.value?.roles?.some(r => r.id === roleId) ?? false
  }

  async function hydrateAuthoritativeUser(fallbackUser: User) {
    try {
      user.value = await userAdapter.getMyProfile()
    } catch {
      user.value = fallbackUser
    }
    tokenStorage.username = user.value?.username ?? null
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
      isAuthenticated.value = true
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
      isAuthenticated.value = true
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
      isAuthenticated.value = true
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
    } catch (e) {
      // Si el httpClient ya llamó _onUnauthorized (logout) para un 401 irrecuperable,
      // no llamamos logout de nuevo para evitar doble-navegación.
      // Para cualquier otro error (red, 5xx) también limpiamos la sesión por seguridad.
      if (!(e instanceof HttpError && e.statusCode === 401)) {
        logout()
      }
    }
  }

  function _resetUserStores() {
    user.value = null
    isAuthenticated.value = false
    useCourseStore().$patch({ courses: [], current: null, page: 1, hasMore: true, filterCounts: {}, activeFilter: 'all' })
    useNotificationStore().$patch({ items: [], unreadCount: 0 })
    useProgressStore().$patch({ myProgress: [], enrolledCourseIds: [] })
    useSubscriptionStore().$patch({ subscriptions: [], creators: [] })
    useVideoStore().$patch({ videos: [], current: null, page: 1, lastFetched: 0 })
  }

  function logout() {
    _resetUserStores()
    tokenStorage.clear()
    router.replace({ name: 'login' })
  }

  // Register global 401 interceptor: any unrecoverable 401 (e.g. refresh fails,
  // invalid signature from wrong server) automatically calls logout() so the user
  // is redirected to /login even when the caller doesn't catch HttpError.
  setOnUnauthorized(logout)

  function setUser(u: User | null) { user.value = u }
  function setToken(t: string | null) { tokenStorage.token = t }

  /**
   * Commits a pre-resolved tenant login result (from tenantResolver.resolveLogin).
   * Used by LoginView when it handles cedula disambiguation or institution selection itself.
   *
   * When credentials are provided, performs a fresh login against the selected
   * tenant's own server instead of reusing the probe token.  This prevents
   * "invalid signature" errors that occur when the probe token was signed by a
   * different server's JWT secret during cross-tenant resolution.
   */
  async function commitAuth(
    result: TenantLoginResult,
    credentials?: { username: string; password: string },
  ) {
    loading.value = true
    error.value = ''
    try {
      _resetUserStores()
      tokenStorage.clear()
      setSelectedTenant(result.tenant.id)

      if (credentials) {
        // Re-login on the target server to get a token signed by the correct secret
        const res = await authAdapter.login(credentials.username, credentials.password)
        tokenStorage.token = res.accessToken
        tokenStorage.refreshToken = res.refreshToken
        tokenStorage.userId = (res.user as User).id
        isAuthenticated.value = true
        await hydrateAuthoritativeUser(res.user as User)
      } else {
        // Fallback: reuse probe token (only when credentials are unavailable)
        const res = result.data
        tokenStorage.token = res.accessToken
        tokenStorage.refreshToken = res.refreshToken
        tokenStorage.userId = (res.user as User).id
        isAuthenticated.value = true
        await hydrateAuthoritativeUser(res.user as User)
      }
    } catch (e) {
      error.value = e instanceof HttpError ? e.message : 'Error al iniciar sesión'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    user, loading, error,
    isAuthenticated, isAdmin, isDocente, isAdminOrDocente, isCreator,
    hasRole, canModifyCourse,
    login, register, loginWithGoogle, fetchProfile, logout,
    setUser, setToken, commitAuth,
  }
})
