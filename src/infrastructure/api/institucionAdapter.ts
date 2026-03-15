import type { Institucion } from '@/domain/models'
import type { InstitucionPort } from '@/domain/ports'
import { api } from './httpClient'

export const institucionAdapter: InstitucionPort = {
  getAll: () => api.publicGet<Institucion[]>('/instituciones'),
  search: (query: string) => api.publicGet<Institucion[]>(`/instituciones/search?q=${encodeURIComponent(query)}`),
}
