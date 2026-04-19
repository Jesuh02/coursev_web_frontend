/**
 * tenantResolver.ts — Multi-tenant login resolution for the web frontend.
 *
 * Probes all configured backend servers in parallel via the cross-tenant login
 * endpoint, then returns the matching tenant login result.  When multiple
 * results are found (same person in different institutions), throws
 * MultipleTenantError so the UI can show an institution selector.
 * When two distinct users share the same credentials, throws CedulaRequiredError
 * so the UI can show a cédula disambiguation field.
 */
import { TENANTS, setSelectedTenant, type TenantConfig } from '@/config/tenants'
import type { AuthResponse } from '@/domain/models'

export interface TenantLoginResult {
  tenant: TenantConfig
  data: AuthResponse
  /** Hash of persona's cedula (identificacion_original) — used to verify identity across tenants */
  personaCedulaHash?: string | null
}

/**
 * Thrown when the user exists in more than one institution.
 * The consumer (LoginView) must present an institution selection dialog.
 */
export class MultipleTenantError extends Error {
  matches: TenantLoginResult[]
  constructor(matches: TenantLoginResult[]) {
    super('Usuario encontrado en múltiples instituciones')
    this.name = 'MultipleTenantError'
    this.matches = matches
  }
}

/**
 * Thrown when two different users share the same credentials across institutions.
 * The UI must show a cédula field to disambiguate which user is logging in.
 */
export class CedulaRequiredError extends Error {
  constructor() {
    super('Se requiere cédula para identificar su cuenta')
    this.name = 'CedulaRequiredError'
  }
}

/**
 * Thrown when a Google account does not exist in any configured tenant.
 * The UI can redirect the user to the registration flow with prefilled data.
 */
export class GoogleAccountNotFoundError extends Error {
  constructor() {
    super('Usuario no encontrado en ninguna institución')
    this.name = 'GoogleAccountNotFoundError'
  }
}

/**
 * Thrown when the user's institution has been suspended by the super-admin.
 * Login is blocked until the institution is reactivated.
 * Carries institution metadata so the UI can show a payment flow.
 */
export class InstitutionSuspendedError extends Error {
  institutionId: number | null
  institutionName: string | null
  monthlyPrice: number
  serverUrl: string | null
  roles: number[]
  constructor(message?: string, meta?: { institutionId?: number; institutionName?: string; monthlyPrice?: number; serverUrl?: string; roles?: number[] }) {
    super(message || 'La mensualidad se ha vencido, por favor realiza el pago.')
    this.name = 'InstitutionSuspendedError'
    this.institutionId = meta?.institutionId ?? null
    this.institutionName = meta?.institutionName ?? null
    this.monthlyPrice = meta?.monthlyPrice ?? 0
    this.serverUrl = meta?.serverUrl ?? null
    this.roles = meta?.roles ?? []
  }
}

/**
 * Attempts login by probing ALL configured backend servers in parallel.
 * Each server searches its own registered tenant databases via cross-tenant-login.
 * If a user is found on more than one server/tenant, throws MultipleTenantError.
 * If two distinct users share the same credentials, throws CedulaRequiredError
 * (unless cedula is provided, in which case the backend filters by it).
 */
export async function resolveLogin(username: string, password: string, cedula?: string): Promise<TenantLoginResult> {
  return probeAllServers('/auth/cross-tenant-login', { username, password, cedula })
}

/**
 * Attempts Google login by probing ALL configured backend servers in parallel.
 * Sends the raw Google idToken so the backend can verify it server-side.
 */
export async function resolveGoogleLogin(
  idToken: string,
  displayName?: string,
  avatarUrl?: string,
  usernameHint?: string,
): Promise<TenantLoginResult> {
  return probeAllServers('/auth/cross-tenant-google', {
    idToken,
    displayName,
    avatarUrl,
    username: usernameHint,
  })
}

/**
 * Commits a previously resolved match: stores the tenant selection and
 * switches the HTTP client base URL to that tenant's server.
 */
export function commitTenantSelection(result: TenantLoginResult): void {
  setSelectedTenant(result.tenant.id)
}

// ──────────── Internals ─────────────────────────────────────────────────────

function getDistinctServerUrls(): string[] {
  return [...new Set(TENANTS.map(t => t.serverUrl.replace(/\/+$/, '')))]
}

function isGoogleAccountNotFoundError(err: Error): boolean {
  return /usuario no encontrado en ninguna instituci[oó]n/i.test(err.message)
}

function isInstitutionSuspendedError(err: Error): boolean {
  return /suspendida|suspended|INSTITUTION_SUSPENDED/i.test(err.message)
}

/** Parse institution metadata from the INSTITUTION_SUSPENDED:JSON error format. */
export function parseInstitutionSuspendedMeta(message: string): { institutionId?: number; institutionName?: string; monthlyPrice?: number; serverUrl?: string; roles?: number[] } | null {
  const match = message.match(/INSTITUTION_SUSPENDED:(.+)/)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

async function probeAllServers(
  path: string,
  body: Record<string, unknown>,
): Promise<TenantLoginResult> {
  const servers = getDistinctServerUrls()
  const settled = await Promise.allSettled(servers.map(url => probeSingleServer(url, path, body)))

  const allMatches: TenantLoginResult[] = []
  let lastError: Error | null = null
  let cedulaRequired = false
  let googleNotFoundCount = 0
  let suspendedError: InstitutionSuspendedError | null = null

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i]
    if (result.status === 'fulfilled') {
      allMatches.push(...result.value)
    } else {
      const err = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
      if (err instanceof CedulaRequiredError) {
        cedulaRequired = true
      } else if (isInstitutionSuspendedError(err)) {
        const meta = parseInstitutionSuspendedMeta(err.message)
        suspendedError = new InstitutionSuspendedError(
          'La mensualidad se ha vencido, por favor realiza el pago.',
          { ...meta, serverUrl: meta?.serverUrl || servers[i] },
        )
      } else if (path === '/auth/cross-tenant-google' && isGoogleAccountNotFoundError(err)) {
        googleNotFoundCount++
      } else {
        // Priorizar mensajes específicos (como "usuario desactivado") sobre "Failed to fetch"
        if (!lastError || err.message === 'Failed to fetch' || lastError.message === 'Failed to fetch') {
          lastError = err
        }
      }
    }
  }

  // Only block with institution suspension if there are NO valid matches.
  // If the user has access to another non-suspended institution, allow login there.
  if (allMatches.length === 0) {
    if (suspendedError) throw suspendedError
    if (cedulaRequired) throw new CedulaRequiredError()
    if (path === '/auth/cross-tenant-google' && googleNotFoundCount === settled.length) {
      throw new GoogleAccountNotFoundError()
    }
    throw lastError ?? new Error('Credenciales inválidas')
  }

  // Deduplicate by tenant id
  const seen = new Set<string>()
  const unique = allMatches.filter(m => {
    if (seen.has(m.tenant.id)) return false
    seen.add(m.tenant.id)
    return true
  })

  if (unique.length > 1) {
    const hashes = unique.map(m => m.personaCedulaHash).filter(Boolean)
    const uniqueHashes = [...new Set(hashes)]
    // All cedula hashes are identical → same person in multiple institutions → show picker
    // OR Different cedulas → could be different accounts, show picker so user can choose
    if (hashes.length === unique.length && uniqueHashes.length === 1) {
      throw new MultipleTenantError(unique)
    }
    // If cedulas differ or are missing, still show picker instead of auto-selecting
    // This allows the user to manually select the correct institution
    throw new MultipleTenantError(unique)
  }

  setSelectedTenant(unique[0].tenant.id)
  return unique[0]
}

async function probeSingleServer(
  serverUrl: string,
  path: string,
  body: Record<string, unknown>,
): Promise<TenantLoginResult[]> {
  const url = `${serverUrl}/api/v1${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({ success: false }))

  if (!res.ok || json.success === false) {
    const errData = json.error as Record<string, unknown> | undefined
    // Extraer mensaje del error: intentar primero json.error.message, luego json.message, luego usar default
    const errorMessage = (errData?.message as string) || (json.message as string) || 'Credenciales inválidas'
    throw new Error(errorMessage)
  }

  const data = json.data as Record<string, unknown>

  if (data.needsCedula === true) {
    throw new CedulaRequiredError()
  }

  if (data.multipleMatches && Array.isArray(data.matches)) {
    return (data.matches as Record<string, unknown>[]).map(m => mapToTenantLoginResult(m, serverUrl))
  }

  return [mapToTenantLoginResult(data, serverUrl)]
}

function mapToTenantLoginResult(
  match: Record<string, unknown>,
  fallbackServerUrl: string,
): TenantLoginResult {
  const matchTenant = match.tenant as { id?: string; name?: string } | undefined
  const tenantConfig = TENANTS.find(t => t.id === matchTenant?.id)
  const tenant: TenantConfig = tenantConfig ?? {
    id: matchTenant?.id || 'unknown',
    name: matchTenant?.name || 'Desconocida',
    serverUrl: fallbackServerUrl,
    supabaseProjectId: '',
  }

  return {
    tenant,
    data: {
      user: match.user,
      accessToken: match.accessToken,
      refreshToken: match.refreshToken,
    } as AuthResponse,
    personaCedulaHash: (match.personaCedulaHash as string) || null,
  }
}
