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

export interface InstitutionBillingStatus {
  allowed: boolean
  paymentOverdue?: boolean
  paymentDueDate?: string | null
  suspended?: boolean
  reason?: string
}

export interface InstitutionAdmin extends Institucion {
  is_active?: boolean
  payment_due_date?: string | null
  is_suspended?: boolean
  suspended_at?: string | null
  suspended_reason?: string | null
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
  setPaymentDueDate(id: number, dueDate: string | null, tenantId?: string): Promise<InstitutionAdmin>
  suspendInstitution(id: number, reason?: string, tenantId?: string): Promise<InstitutionAdmin>
  unsuspendInstitution(id: number, tenantId?: string): Promise<InstitutionAdmin>
  initiateBillingPayment(id: number, amount: number): Promise<{ checkoutUrl: string; reference: string }>
  getBillingPayments(id: number): Promise<InstitutionPayment[]>
  getAllServicePayments(): Promise<InstitutionPayment[]>
  checkInstitutionStatus(id: number): Promise<InstitutionBillingStatus>
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

  getAllAdmin: () => api.get<InstitutionAdmin[]>('/instituciones/admin/all'),

  setPaymentDueDate: (id: number, dueDate: string | null, tenantId?: string) =>
    api.put<InstitutionAdmin>(`/instituciones/${id}/payment-due`, { payment_due_date: dueDate, tenantId }),

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
}
