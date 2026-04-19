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

/**
 * Probes all distinct backend servers in parallel to fetch ALL institutions
 * (including inactive/suspended) for the superadmin view.
 * Tries the authenticated /admin/all endpoint first; falls back to the public
 * /cross-tenant endpoint (active-only, no billing fields) when auth is absent
 * for a given server (e.g. user is only logged into one tenant).
 */
async function fetchAdminAllCrossTenant(): Promise<InstitutionAdmin[]> {
  const servers = Array.from(
    new Map(TENANTS.map(t => [t.serverUrl.replace(/\/+$/, ''), t])).values(),
  )

  const settled = await Promise.allSettled(
    servers.map(async (tenant) => {
      const baseUrl = tenant.serverUrl.replace(/\/+$/, '')

      // Try authenticated admin endpoint (HttpOnly cookie is sent automatically
      // for the matching domain when the user is logged into that server).
      try {
        const res = await fetch(`${baseUrl}/api/v1/instituciones/admin/all`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
        })
        if (res.ok) {
          const json = await res.json()
          const list: InstitutionAdmin[] = json.data ?? json ?? []
          return list.map(inst => ({
            ...inst,
            tenantId: inst.tenantId || tenant.id,
            tenantName: inst.tenantName || tenant.name,
          }))
        }
      } catch { /* fall through to public fallback */ }

      // Fallback: public cross-tenant endpoint (active-only, no billing details)
      try {
        const pubRes = await fetch(`${baseUrl}/api/v1/instituciones/cross-tenant`, {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })
        if (pubRes.ok) {
          const pubJson = await pubRes.json()
          const list: InstitutionAdmin[] = pubJson.data ?? pubJson ?? []
          return list.map(inst => ({
            ...inst,
            tenantId: inst.tenantId || tenant.id,
            tenantName: inst.tenantName || tenant.name,
          }))
        }
      } catch { /* ignore */ }

      return [] as InstitutionAdmin[]
    }),
  )

  const all: InstitutionAdmin[] = []
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

  return all.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
}

export interface InstitutionBillingStatus {
  allowed: boolean
  paymentOverdue?: boolean
  paymentDueDate?: string | null
  billingActionMode?: string | null
  suspended?: boolean
  reason?: string
  institutionId?: number | null
  institutionName?: string | null
  monthlyPrice?: number
}

export interface InstitutionAdmin extends Institucion {
  is_active?: boolean
  payment_due_date?: string | null
  billing_cycle_type?: 'monthly_start' | 'biweekly' | 'monthly_day' | 'specific_months' | null
  billing_cycle_day?: number | null
  billing_cycle_hour?: number | null
  billing_cycle_minute?: number | null
  billing_action_mode?: 'warning' | 'suspension' | null
  is_suspended?: boolean
  suspended_at?: string | null
  suspended_reason?: string | null
  monthly_price?: number
  tenantId?: string
  tenantName?: string
}

export interface InstitutionPayment {
  id: number
  institution_id: number | null
  user_id: number | null
  amount: number
  currency: string
  status: string
  payment_type: 'course' | 'service'
  payment_method?: string
  external_reference?: string
  wompi_transaction_id?: string
  billing_period_start?: string | null
  billing_period_end?: string | null
  created_at?: string
  updated_at?: string
}

export const institucionAdapter: InstitucionPort & {
  getMyBillingStatus(): Promise<InstitutionBillingStatus>
  getAllAdmin(): Promise<InstitutionAdmin[]>
  setPaymentDueDate(id: number, dueDate: string | null, tenantId?: string, billingCycle?: { type: string; day?: number | null; hour?: number | null; minute?: number | null; months?: number[]; billing_action_mode?: string }, clearBillingCycle?: boolean): Promise<InstitutionAdmin>
  suspendInstitution(id: number, reason?: string, tenantId?: string): Promise<InstitutionAdmin>
  unsuspendInstitution(id: number, tenantId?: string): Promise<InstitutionAdmin>
  initiateBillingPayment(id: number, amount: number): Promise<{ checkoutUrl: string; reference: string }>
  getBillingPayments(id: number): Promise<InstitutionPayment[]>
  getAllServicePayments(): Promise<InstitutionPayment[]>
  checkInstitutionStatus(id: number): Promise<InstitutionBillingStatus>
  setMonthlyPrice(id: number, price: number, tenantId?: string): Promise<InstitutionAdmin>
  publicBillingPayment(institutionId: number, serverUrl: string, redirectUrl?: string): Promise<{ checkoutUrl: string; reference: string }>
} = {
  getAll: () => api.publicGet<Institucion[]>('/instituciones'),

  async getAllCrossTenant(): Promise<Institucion[]> {
    try {
      const results = await fetchAllCrossTenant()
      if (results.length > 0) return results
    } catch { /* fallback below */ }
    return api.publicGet<Institucion[]>('/instituciones')
  },

  search: (query: string) => api.publicGet<Institucion[]>(`/instituciones/search?q=${encodeURIComponent(query)}`),

  // ═══ SuperAdmin / Billing endpoints ═══

  getMyBillingStatus: () => api.get<InstitutionBillingStatus>('/instituciones/my/billing-status'),

  async getAllAdmin(): Promise<InstitutionAdmin[]> {
    try {
      return await fetchAdminAllCrossTenant()
    } catch {
      return api.get<InstitutionAdmin[]>('/instituciones/admin/all')
    }
  },

  setPaymentDueDate: (id: number, dueDate: string | null, tenantId?: string, billingCycle?: { type: string; day?: number | null; hour?: number | null; minute?: number | null; months?: number[]; billing_action_mode?: string }, clearBillingCycle?: boolean) =>
    api.put<InstitutionAdmin>(`/instituciones/${id}/payment-due`, {
      payment_due_date: dueDate,
      tenantId,
      clear_billing_cycle: Boolean(clearBillingCycle),
      ...(billingCycle ? { billing_cycle_type: billingCycle.type, billing_cycle_day: billingCycle.day, billing_cycle_hour: billingCycle.hour ?? 8, billing_cycle_minute: billingCycle.minute ?? 0, billing_action_mode: billingCycle.billing_action_mode ?? 'warning', ...(billingCycle.months ? { billing_cycle_months: billingCycle.months } : {}) } : {}),
    }),

  suspendInstitution: (id: number, reason?: string, tenantId?: string) =>
    api.post<InstitutionAdmin>(`/instituciones/${id}/suspend`, { reason, tenantId }),

  unsuspendInstitution: (id: number, tenantId?: string) =>
    api.post<InstitutionAdmin>(`/instituciones/${id}/unsuspend`, { tenantId }),

  initiateBillingPayment: (id: number, amount: number) =>
    api.post<{ checkoutUrl: string; reference: string }>(`/instituciones/${id}/billing/initiate`, { amount }),

  getBillingPayments: (id: number) =>
    api.get<InstitutionPayment[]>(`/instituciones/${id}/billing/payments`),

  getAllServicePayments: () =>
    api.get<InstitutionPayment[]>('/instituciones/admin/service-payments'),

  checkInstitutionStatus: (id: number) =>
    api.publicGet<InstitutionBillingStatus>(`/instituciones/status/${id}`),

  setMonthlyPrice: (id: number, price: number, tenantId?: string) =>
    api.put<InstitutionAdmin>(`/instituciones/${id}/monthly-price`, { monthly_price: price, tenantId }),

  publicBillingPayment: async (institutionId: number, serverUrl: string, redirectUrl?: string) => {
    const url = `${serverUrl.replace(/\/+$/, '')}/api/v1/instituciones/billing/public-initiate`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institutionId, redirectUrl }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error?.message || json.message || 'Error al iniciar pago')
    return json.data as { checkoutUrl: string; reference: string }
  },
}
