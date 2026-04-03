import type { Institucion } from '@/domain/models'
import type { InstitucionPort } from '@/domain/ports'
import { api } from './httpClient'
import { TENANTS } from '@/config/tenants'

/**
 * Probes all distinct backend servers in parallel to fetch institutions
 * from every tenant database, similar to the Android cross-tenant approach.
 * Each result is tagged with its tenantId for deduplication.
 */
async function fetchAllCrossTenant(): Promise<Institucion[]> {
  const urls = [...new Set(TENANTS.map(t => t.serverUrl.replace(/\/+$/, '')))]

  const settled = await Promise.allSettled(
    urls.map(async (serverUrl) => {
      const res = await fetch(`${serverUrl}/api/v1/instituciones/cross-tenant`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) return []
      const json = await res.json()
      const list: Institucion[] = json.data ?? json ?? []
      return list
    }),
  )

  const all: Institucion[] = []
  const seen = new Set<string>()

  for (const r of settled) {
    if (r.status !== 'fulfilled') continue
    for (const inst of r.value) {
      const key = `${inst.tenantId ?? '_'}:${inst.id}`
      if (seen.has(key)) continue
      seen.add(key)
      all.push(inst)
    }
  }

  return all
}

export const institucionAdapter: InstitucionPort = {
  getAll: () => api.publicGet<Institucion[]>('/instituciones'),

  /**
   * Fetches institutions from ALL tenants across all servers.
   * Falls back to single-tenant getAll if cross-tenant fails.
   */
  async getAllCrossTenant(): Promise<Institucion[]> {
    try {
      const results = await fetchAllCrossTenant()
      if (results.length > 0) return results
    } catch { /* fallback below */ }
    return api.publicGet<Institucion[]>('/instituciones')
  },

  search: (query: string) => api.publicGet<Institucion[]>(`/instituciones/search?q=${encodeURIComponent(query)}`),
}
