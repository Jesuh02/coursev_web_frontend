const DEFAULT_API_BASE = (import.meta.env.VITE_API_URL_INCAT as string) || 'https://mcp-backenddeploy-production.up.railway.app'

function normalizeApiBase(value: string | undefined): string {
  const raw = value?.trim() || DEFAULT_API_BASE
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withProtocol.replace(/\/+$/, '')
}

let _apiBase = normalizeApiBase(import.meta.env.VITE_API_URL)
let API_V1 = `${_apiBase}/api/v1`

/** Dynamically updates the API base URL (used by multi-tenant tenant switching). */
export function setApiBase(url: string): void {
  _apiBase = url.replace(/\/+$/, '')
  API_V1 = `${_apiBase}/api/v1`
}

/** Returns the current API v1 base URL (e.g. for XHR-based uploads). */
export function getApiV1(): string {
  return API_V1
}

const TOKEN_KEY = 'auth_token'
const REFRESH_KEY = 'refresh_token'
const USER_ID_KEY = 'user_id'
const USERNAME_KEY = 'username'
const SESSION_ACTIVE_KEY = 'session_active'

const MAX_RETRIES = 2
const INITIAL_BACKOFF_MS = 1000

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  success: false
  error: { code: string; message: string; statusCode: number }
}

export class HttpError extends Error {
  statusCode: number
  errorCode: string
  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

// In-memory access token — fallback for browsers that block cross-site HttpOnly cookies
// (third-party cookie deprecation). Not persisted to localStorage to limit XSS exposure;
// a page reload triggers a transparent refresh that restores it.
let _accessToken: string | null = null

export const tokenStorage = {
  // Access token kept in memory (module variable) so it survives within a session
  // even when cross-origin HttpOnly cookies are blocked by the browser.
  // The setter also keeps the session_active flag so `isAuthenticated` survives page reloads.
  get token() { return _accessToken },
  set token(v: string | null) {
    _accessToken = v
    v ? localStorage.setItem(SESSION_ACTIVE_KEY, 'true') : localStorage.removeItem(SESSION_ACTIVE_KEY)
  },

  // Refresh token stored in localStorage as fallback for browsers that block
  // cross-site HttpOnly cookies (third-party cookie deprecation).
  get refreshToken() { return localStorage.getItem(REFRESH_KEY) },
  set refreshToken(v: string | null) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY) },

  get userId(): number { return Number(localStorage.getItem(USER_ID_KEY)) || 0 },
  set userId(v: number) { v ? localStorage.setItem(USER_ID_KEY, String(v)) : localStorage.removeItem(USER_ID_KEY) },

  get username(): string | null { return localStorage.getItem(USERNAME_KEY) },
  set username(v: string | null) { v ? localStorage.setItem(USERNAME_KEY, v) : localStorage.removeItem(USERNAME_KEY) },

  get isAuthenticated() { return localStorage.getItem(SESSION_ACTIVE_KEY) === 'true' },

  clear() {
    _accessToken = null
    localStorage.removeItem(TOKEN_KEY)        // Clean up any legacy values
    localStorage.removeItem(REFRESH_KEY)      // Clean up any legacy values
    localStorage.removeItem(SESSION_ACTIVE_KEY)
    this.userId = 0
    this.username = null
  },
}

let refreshPromise: Promise<boolean> | null = null

/** Registered by authStore — called when a 401 cannot be recovered (e.g. refresh fails, invalid signature). */
let _onUnauthorized: (() => void) | null = null

/** Register a callback to invoke when the session can no longer be recovered from a 401. */
export function setOnUnauthorized(cb: () => void): void {
  _onUnauthorized = cb
}

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      // Send refresh token both via HttpOnly cookie (credentials: 'include') and
      // in the request body as fallback for browsers that block cross-site cookies.
      const rt = tokenStorage.refreshToken
      const res = await fetch(`${API_V1}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rt ? { refreshToken: rt } : {}),
      })
      if (res.ok) {
        // Persist the rotated refresh token and capture the new access token
        // so Bearer-header auth works when cross-site cookies are blocked.
        try {
          const json = await res.json() as ApiResponse<{ accessToken: string; refreshToken: string }>
          if (json.data?.accessToken) tokenStorage.token = json.data.accessToken
          if (json.data?.refreshToken) tokenStorage.refreshToken = json.data.refreshToken
        } catch { /* response already consumed or malformed — ignore */ }
      }
      return res.ok
    } catch { return false }
    finally { refreshPromise = null }
  })()
  return refreshPromise
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  // Include Bearer token when available (fallback for browsers that block cross-site
  // HttpOnly cookies). The cookie path still works in parallel for browsers that support it.
  if (_accessToken) h['Authorization'] = `Bearer ${_accessToken}`
  // Include X-Tenant-ID header to ensure requests target the correct tenant database
  const selectedTenantId = localStorage.getItem('selected_tenant_id')
  if (selectedTenantId) h['X-Tenant-ID'] = selectedTenantId
  return h
}

async function request<T>(path: string, options?: RequestInit, isPublic = false, raw = false): Promise<T> {
  const url = `${API_V1}${path}`
  const handler = raw ? handleRawResponse<T> : handleResponse<T>
  let lastError: Error | null = null
  // Prevent browser from serving stale cached responses across different user sessions
  const cachePolicy: RequestCache = 'no-store'

  const fetchWithAuthRetry = async (): Promise<T> => {
    const headers = isPublic
      ? { 'Content-Type': 'application/json' }
      : authHeaders()

    const execFetch = () => fetch(url, { ...options, cache: cachePolicy, credentials: 'include', headers: { ...headers, ...options?.headers } })
    const res = await execFetch()

    if (res.status === 401 && !isPublic) {
      // Read body first to detect INVALID_TOKEN_SIGNATURE (token from a different
      // server/tenant): the refresh token is also invalid in that case, so skip the
      // refresh round-trip and redirect to login immediately — mirrors Android logic.
      let errCode: string | undefined
      try {
        const body = await res.clone().json() as { error?: { code?: string } }
        errCode = body?.error?.code
      } catch { /* ignore parse failures, fall through to normal refresh logic */ }

      if (errCode === 'INVALID_TOKEN_SIGNATURE' || errCode === 'invalid signature') {
        tokenStorage.clear()
        _onUnauthorized?.()
        throw new HttpError(401, 'INVALID_TOKEN_SIGNATURE', 'Token inválido: firma incorrecta, vuelve a iniciar sesión')
      }

      const refreshed = await tryRefresh()
      if (refreshed) {
        const retryRes = await fetch(url, { ...options, cache: cachePolicy, credentials: 'include', headers: authHeaders() })
        if (retryRes.status === 401) {
          tokenStorage.clear()
          _onUnauthorized?.()
          throw new HttpError(401, 'UNAUTHORIZED', 'Sesión expirada')
        }
        return handler(retryRes)
      }
      tokenStorage.clear()
      _onUnauthorized?.()
      throw new HttpError(401, 'UNAUTHORIZED', 'Sesión expirada')
    }

    try {
      return await handler(res)
    } catch (error) {
      if (!isPublic && error instanceof HttpError && error.statusCode === 401) {
        // INVALID_TOKEN_SIGNATURE propagated from handleResponse — skip refresh
        if ((error as HttpError).errorCode === 'INVALID_TOKEN_SIGNATURE') {
          tokenStorage.clear()
          _onUnauthorized?.()
          throw error
        }
        const refreshed = await tryRefresh()
        if (refreshed) {
          const retryRes = await fetch(url, { ...options, cache: cachePolicy, credentials: 'include', headers: authHeaders() })
          if (retryRes.status === 401) {
            tokenStorage.clear()
            _onUnauthorized?.()
            throw new HttpError(401, 'UNAUTHORIZED', 'Sesión expirada')
          }
          return handler(retryRes)
        }
        tokenStorage.clear()
        _onUnauthorized?.()
        throw new HttpError(401, 'UNAUTHORIZED', 'Sesión expirada')
      }
      throw error
    }
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, INITIAL_BACKOFF_MS * attempt))

    try {
      return await fetchWithAuthRetry()
    } catch (e) {
      lastError = e as Error
      if (e instanceof HttpError) throw e
      // Do not retry if the request was intentionally aborted (timeout signal)
      if (e instanceof DOMException && e.name === 'AbortError') throw e
    }
  }

  throw lastError ?? new Error('Request failed')
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) {
    if (res.ok) return undefined as T
    throw new HttpError(res.status, 'EMPTY_RESPONSE', 'Respuesta vacía del servidor')
  }

  const json = JSON.parse(text)

  if (!res.ok || json.success === false) {
    const err = json.error || {}
    throw new HttpError(
      err.statusCode || res.status,
      err.code || 'API_ERROR',
      err.message || `Error ${res.status}`,
    )
  }

  return json.data !== undefined ? json.data : json
}

async function handleRawResponse<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) {
    if (res.ok) return undefined as T
    throw new HttpError(res.status, 'EMPTY_RESPONSE', 'Respuesta vacía del servidor')
  }
  const json = JSON.parse(text)
  if (!res.ok || json.success === false) {
    const err = json.error || {}
    throw new HttpError(
      err.statusCode || res.status,
      err.code || 'API_ERROR',
      err.message || `Error ${res.status}`,
    )
  }
  const { success: _, ...rest } = json
  return rest as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  getRaw: <T>(path: string) => request<T>(path, undefined, false, true),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  /** POST with extended timeout for slow LLM endpoints. @param timeoutMs defaults to 120 s. */
  postSlow: <T>(path: string, body: unknown, timeoutMs = 120_000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    return request<T>(path, { method: 'POST', body: JSON.stringify(body), signal: controller.signal })
      .finally(() => clearTimeout(timer))
  },
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  publicGet: <T>(path: string) => {
    const tenantId = localStorage.getItem('selected_tenant_id')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (tenantId) headers['X-Tenant-ID'] = tenantId
    return request<T>(path, { headers }, true)
  },
  upload: <T>(path: string, formData: FormData) => {
    // Don't set Content-Type – the browser sets it automatically with the correct
    // multipart boundary. Authorization is handled via HttpOnly cookie.
    const headers: Record<string, string> = {}
    const selectedTenantId = localStorage.getItem('selected_tenant_id')
    if (selectedTenantId) headers['X-Tenant-ID'] = selectedTenantId
    return fetch(`${API_V1}${path}`, { method: 'POST', headers, body: formData, credentials: 'include' })
      .then(r => r.json())
      .then((json: ApiResponse<T>) => {
        if (json.success === false) throw new HttpError(400, 'UPLOAD_ERROR', (json as unknown as ApiError).error.message)
        return json.data !== undefined ? json.data : json as T
      })
  },
}

export function buildProxyFileUrl(key: string): string {
  return `${API_V1}/public/files/${key}`
}

export function extractR2Key(url: string): string | null {
  if (!url.includes('r2.cloudflarestorage.com') && !url.includes('r2.dev')) return null
  try {
    const { pathname } = new URL(url)
    return pathname.startsWith('/') ? pathname.slice(1) : pathname
  } catch { return null }
}

export function resolveImageUrl(uri: string | null | undefined): string | null {
  if (!uri) return null
  if (uri.startsWith('file:///')) return null
  const r2Key = extractR2Key(uri)
  if (r2Key) return buildProxyFileUrl(r2Key)
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri
  if (/\.\w{2,4}$/.test(uri)) return buildProxyFileUrl(uri)
  return null
}
