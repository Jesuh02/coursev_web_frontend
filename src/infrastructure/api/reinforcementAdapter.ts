import type { ReinforcementPort } from '@/domain/ports'
import { api } from './httpClient'

export const reinforcementAdapter: ReinforcementPort = {
  saveSession: (data) => api.post('/reinforcement', data),
  getHistory: (courseId) => api.get(`/reinforcement/course/${courseId}`),
  getAllHistory: () => api.get('/reinforcement'),
  saveResult: (data) => api.post('/reinforcement-results', data),
  getMyResults: () => api.get('/reinforcement-results/my'),
  getResultsByCourse: (courseId) => api.get(`/reinforcement-results/course/${courseId}`),
  getLearningContext: (data) => api.post('/reinforcement/learning-context', data),
  coachConversation: (data) => api.post('/reinforcement/coach', data),
}
