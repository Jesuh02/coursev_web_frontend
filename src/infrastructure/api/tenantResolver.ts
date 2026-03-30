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
 */
export async function resolveGoogleLogin(
  email: string,
  displayName?: string,
  avatarUrl?: string,
  usernameHint?: string,
): Promise<TenantLoginResult> {
  return probeAllServers('/auth/cross-tenant-google', {
    email,
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

async function probeAllServers(
  path: string,
  body: Record<string, unknown>,
): Promise<TenantLoginResult> {
  const servers = getDistinctServerUrls()
  const settled = await Promise.allSettled(servers.map(url => probeSingleServer(url, path, body)))

  const allMatches: TenantLoginResult[] = []
  let lastError: Error | null = null
  let cedulaRequired = false

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allMatches.push(...result.value)
    } else {
      const err = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
      if (err instanceof CedulaRequiredError) {
        cedulaRequired = true
      } else if (!lastError || err.message === 'Failed to fetch') {
        lastError = err
      }
    }
  }

  if (allMatches.length === 0) {
    if (cedulaRequired) throw new CedulaRequiredError()
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
    signal: AbortSignal.timeout(20_000),
  })

  const json: Record<string, unknown> = await res.json().catch(() => ({ success: false }))

  if (!res.ok || json.success === false) {
    const errData = json.error as Record<string, unknown> | undefined
    throw new Error((errData?.message as string) || 'Credenciales inválidas')
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
