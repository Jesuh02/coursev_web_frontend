import { api } from './httpClient'

export interface InteroperabilityMetric {
  label: string
  value: string | number | boolean | null
}

export interface InteroperabilityChecklistItem {
  itemKey: string
  label: string
  done: boolean
  source: 'manual' | 'auto' | string
  updatedAt: string | null
}

export interface InteroperabilityAction {
  key: string
  label: string
}

export interface InteroperabilityHistoryItem {
  id?: string
  standardCode: string
  action: string
  status: 'success' | 'error' | 'warning' | string
  summary: string
  payload?: Record<string, unknown>
  error?: string | null
  actorUserId?: number | null
  createdAt: string
}

export interface InteroperabilityStandard {
  code: string
  name: string
  short: string
  area: string
  description: string
  coursevUse: string
  priority: string
  owner: string
  accent: string
  state: string
  stateTone: string
  progress: number
  updated: string
  checklist: InteroperabilityChecklistItem[]
  metrics: InteroperabilityMetric[]
  actions: InteroperabilityAction[]
  history: InteroperabilityHistoryItem[]
  health: {
    label: string
    tone: string
    detail: string
  }
  recommendations: string[]
}

export interface LearningEventRecord {
  id?: string
  userId?: number | null
  courseId?: number | null
  role?: string | null
  eventType: string
  eventSource: string
  standardTarget: string
  eventPayload?: Record<string, unknown>
  createdAt: string
}

export interface InteroperabilityDashboard {
  tenantId: string
  generatedAt: string
  dbPersistence: boolean
  summary: {
    standards: number
    active: number
    inTests: number
    recentErrors: number
    learningEvents: number
  }
  standards: InteroperabilityStandard[]
  recentEvents: LearningEventRecord[]
  recentHistory: InteroperabilityHistoryItem[]
}

export interface InteroperabilityActionResult {
  status: 'success' | 'error' | 'warning' | string
  summary: string
  fileName?: string
  mimeType?: string
  content?: string
  metrics?: Record<string, unknown>
  errors?: string[]
  dashboard?: InteroperabilityDashboard
}

export const interoperabilityAdapter = {
  getDashboard: () => api.get<InteroperabilityDashboard>('/interoperability/dashboard'),
  getEvents: (limit = 80) => api.get<LearningEventRecord[]>(`/interoperability/events?limit=${limit}`),
  recordEvent: (payload: Record<string, unknown>) =>
    api.post<LearningEventRecord>('/interoperability/events', payload),
  runAction: (standardCode: string, action: string, payload: Record<string, unknown> = {}) =>
    api.post<InteroperabilityActionResult>(`/interoperability/actions/${standardCode}/${action}`, payload),
  toggleChecklist: (standardCode: string, itemKey: string, done: boolean) =>
    api.post<InteroperabilityDashboard>(`/interoperability/checklist/${standardCode}/${itemKey}`, { done }),
}
