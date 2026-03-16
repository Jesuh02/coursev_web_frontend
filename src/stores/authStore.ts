import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/domain/models'
import { authAdapter, userAdapter, tokenStorage, HttpError } from '@/infrastructure/api'

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

  async function register(username: string, password: string, email: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await authAdapter.register(username, password, email)
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

  function logout() {
    user.value = null
    tokenStorage.clear()
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
