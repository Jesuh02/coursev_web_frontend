const DEFAULT_API_BASE = 'https://mcp-backenddeploy-production-4ed0.up.railway.app'

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

const TOKEN_KEY = 'auth_token'
const REFRESH_KEY = 'refresh_token'
const USER_ID_KEY = 'user_id'

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

export const tokenStorage = {
  get token() { return localStorage.getItem(TOKEN_KEY) },
  set token(v: string | null) { v ? localStorage.setItem(TOKEN_KEY, v) : localStorage.removeItem(TOKEN_KEY) },

  get refreshToken() { return localStorage.getItem(REFRESH_KEY) },
  set refreshToken(v: string | null) { v ? localStorage.setItem(REFRESH_KEY, v) : localStorage.removeItem(REFRESH_KEY) },

  get userId(): number { return Number(localStorage.getItem(USER_ID_KEY)) || 0 },
  set userId(v: number) { v ? localStorage.setItem(USER_ID_KEY, String(v)) : localStorage.removeItem(USER_ID_KEY) },

  get isAuthenticated() { return !!this.token },

  clear() {
    this.token = null
    this.refreshToken = null
    this.userId = 0
  },
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    const rt = tokenStorage.refreshToken
    if (!rt) return false
    try {
      const res = await fetch(`${API_V1}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
      })
      if (!res.ok) return false
      const json = await res.json() as ApiResponse<{ accessToken: string; refreshToken: string }>
      if (json.success && json.data.accessToken) {
        tokenStorage.token = json.data.accessToken
        tokenStorage.refreshToken = json.data.refreshToken
        return true
      }
      return false
    } catch { return false }
    finally { refreshPromise = null }
  })()
  return refreshPromise
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (tokenStorage.token) h['Authorization'] = `Bearer ${tokenStorage.token}`
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

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, INITIAL_BACKOFF_MS * attempt))

    try {
      const headers = isPublic
        ? { 'Content-Type': 'application/json' }
        : authHeaders()
      const res = await fetch(url, { ...options, cache: cachePolicy, headers: { ...headers, ...options?.headers } })

      if (res.status === 401 && !isPublic) {
        const refreshed = await tryRefresh()
        if (refreshed) {
          const retryRes = await fetch(url, { ...options, cache: cachePolicy, headers: authHeaders() })
          return handler(retryRes)
        }
        tokenStorage.clear()
        throw new HttpError(401, 'UNAUTHORIZED', 'Sesión expirada')
      }

      return handler(res)
    } catch (e) {
      lastError = e as Error
      if (e instanceof HttpError) throw e
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
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  publicGet: <T>(path: string) => request<T>(path, undefined, true),
  upload: <T>(path: string, formData: FormData) => {
    const headers: Record<string, string> = {}
    if (tokenStorage.token) headers['Authorization'] = `Bearer ${tokenStorage.token}`
    return fetch(`${API_V1}${path}`, { method: 'POST', headers, body: formData })
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
