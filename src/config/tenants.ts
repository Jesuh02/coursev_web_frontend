/**
 * tenants.ts — Known backend tenants for the CourseV multi-tenant frontend.
 *
 * IDs must match the `PROJECT_REF_MAP` entries in the backend's tenantRegistry.js.
 * Add a new entry here when onboarding a new institution on a separate server.
 */

import { setApiBase } from '@/infrastructure/api/httpClient'

const SELECTED_TENANT_KEY = 'selected_tenant_id'
const SELECTED_SERVER_KEY = 'selected_server_url'

export interface TenantConfig {
  id: string
  name: string
  serverUrl: string
  supabaseProjectId: string
}

/**
 * All registered backend server instances.
 * Each server may host one or more tenant databases internally.
 * URLs are read from env vars first, then fall back to known defaults.
 */
export const TENANTS: TenantConfig[] = [
  {
    id: 'qa-develop',
    name: 'QA - Develop',
    serverUrl: (import.meta.env.VITE_API_URL_QA as string) || 'https://mcp-backenddeploy-production-4ed0.up.railway.app',
    supabaseProjectId: 'vxuksizvwrkctrvpciyp',
  },
  {
    id: 'incat',
    name: 'Politécnico Institucional del Caribe Incat',
    serverUrl: (import.meta.env.VITE_API_URL_INCAT as string) || 'https://mcp-backenddeploy-production.up.railway.app',
    supabaseProjectId: 'gzckzrocfmhsizlrnqep',
  },
]

/** Returns the currently selected tenant, if any. */
export function getSelectedTenant(): TenantConfig | null {
  const id = localStorage.getItem(SELECTED_TENANT_KEY)
  return id ? (TENANTS.find(t => t.id === id) ?? null) : null
}

/**
 * Marks a tenant as selected and updates the HTTP client base URL
 * so all subsequent API calls go to that tenant's server.
 *
 * `issuingServerUrl` (when provided) overrides the canonical tenant.serverUrl.
 * This is critical in multi-server setups where the same tenant DB is
 * registered on more than one backend: the JWT was signed with the issuing
 * server's JWT_SECRET and is only verifiable there.
 */
export function setSelectedTenant(id: string, issuingServerUrl?: string): void {
  const tenant = TENANTS.find(t => t.id === id)
  if (!tenant) return
  const serverUrl = (issuingServerUrl && issuingServerUrl.trim())
    ? issuingServerUrl.replace(/\/+$/, '')
    : tenant.serverUrl
  localStorage.setItem(SELECTED_TENANT_KEY, id)
  localStorage.setItem(SELECTED_SERVER_KEY, serverUrl)
  setApiBase(serverUrl)
}

/**
 * Restores the previously selected server URL on app startup.
 * Call this once in main.ts before mounting the Vue app.
 */
export function restoreSelectedTenant(): void {
  const serverUrl = localStorage.getItem(SELECTED_SERVER_KEY)
  if (serverUrl) setApiBase(serverUrl)
}
