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

export interface VideoLearningResult {
  jobId?: string
  title: string
  videoUrl: string
  posterUrl?: string
  durationSeconds?: number
}

export interface LearningContext {
  courseId: number
  topicId: number
  taskId: number
}

export const learningAdapter = {
  async generateComic(ctx: LearningContext): Promise<ComicResult> {
    return api.post<ComicResult>('/learning/comic', ctx)
  },

  async generateVideo(ctx: LearningContext): Promise<VideoLearningResult> {
    return api.post<VideoLearningResult>('/learning/video', ctx)
  },

  async regeneratePanel(jobId: string, panelIndex: number): Promise<ComicPanel> {
    return api.post<ComicPanel>('/learning/comic/regenerate-panel', { jobId, panelIndex })
  },
}
