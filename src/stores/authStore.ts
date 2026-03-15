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

  const isAdmin = computed(() => hasRole(3) || user.value?.roles?.some(r => r.nombre === 'admin') === true)
  const isDocente = computed(() => hasRole(2) || user.value?.roles?.some(r => r.nombre === 'docente') === true)
  const isAdminOrDocente = computed(() => isAdmin.value || isDocente.value)
  const isCreator = computed(() => isAdminOrDocente.value)

  function canModifyCourse(creatorUserId: number): boolean {
    if (isAdminOrDocente.value) return true
    return user.value?.id === creatorUserId
  }

  async function login(usernameOrEmail: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await authAdapter.login(usernameOrEmail, password)
      tokenStorage.token = res.accessToken
      tokenStorage.refreshToken = res.refreshToken
      tokenStorage.userId = res.user.id
      user.value = res.user
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
      user.value = res.user
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
      user.value = res.user
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
