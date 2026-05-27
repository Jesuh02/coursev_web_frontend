/**
 * Adapter for the AI Learning pipeline (comic + video generation).
 * Talks to the MCP backend which proxies the OpenRouter image and text models
 * (configured server-side to use the best-in-class providers).
 *
 * Backend endpoints (to be implemented in mcp-backend-deploy):
 *   POST /api/learning/comic   { courseId, topicId, taskId } → { panels: [{ imageUrl, caption, dialogue? }], title }
 *   POST /api/learning/video   { courseId, topicId, taskId } → { videoUrl, posterUrl, durationSeconds, title }
 *   POST /api/learning/comic/regenerate-panel { jobId, panelIndex } → { imageUrl, caption }
 */

import { api } from './httpClient'

export interface ComicPanel {
  imageUrl: string
  caption: string
  dialogue?: string
}

export interface ComicResult {
  jobId?: string
  title: string
  panels: ComicPanel[]
}

export interface VideoSlide {
  imageUrl: string
  narration: string
  duration: number
}

export interface VideoLearningResult {
  jobId?: string
  status?: 'processing' | 'completed' | 'error'
  title: string
  videoUrl: string
  posterUrl?: string
  durationSeconds?: number
  slides?: VideoSlide[]
  error?: string
}

export interface LearningContext {
  courseId: number
  topicId: number
  taskId: number
}

export const learningAdapter = {
  async generateComic(ctx: LearningContext): Promise<ComicResult> {
    return api.postSlow<ComicResult>('/learning/comic', ctx, 600_000)
  },

  async generateVideo(ctx: LearningContext): Promise<VideoLearningResult> {
    return api.postSlow<VideoLearningResult>('/learning/video', ctx, 120_000)
  },

  async pollVideoStatus(jobId: string): Promise<VideoLearningResult> {
    return api.get<VideoLearningResult>(`/learning/video/status/${jobId}`)
  },

  async regeneratePanel(jobId: string, panelIndex: number): Promise<ComicPanel> {
    return api.post<ComicPanel>('/learning/comic/regenerate-panel', { jobId, panelIndex })
  },
}
