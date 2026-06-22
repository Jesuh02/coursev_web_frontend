import type { ReinforcementPort } from '@/domain/ports'
import { api } from './httpClient'

export const reinforcementAdapter: ReinforcementPort = {
  saveSession: (data) => api.post('/reinforcement', data),
  getHistory: (courseId) => api.get(`/reinforcement/course/${courseId}`),
  getAllHistory: () => api.get('/reinforcement'),
  saveResult: (data) => api.post('/reinforcement-results', data),
  getMyResults: () => api.get('/reinforcement-results/my'),
  getResultsByCourse: (courseId) => api.get(`/reinforcement-results/course/${courseId}`),
  getCognitiveAnalytics: (courseId, options = {}) => {
    const params = new URLSearchParams({ courseId: String(courseId) })
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
    })
    return api.get(`/reinforcement/cognitive-analytics?${params.toString()}`)
  },
  getLearningContext: (data) => api.post('/reinforcement/learning-context', data),
  coachConversation: (data) => api.post('/reinforcement/coach', data),
}
