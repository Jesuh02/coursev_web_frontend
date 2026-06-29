import type { Recommendation } from '@/domain/ports'

export type ConversationRecommendation = Recommendation & {
  source: 'voice-analysis'
  userId?: number | null
  problem: Recommendation['problem'] & {
    taskId?: number | null
    taskName?: string | null
  }
  analysis?: {
    score: number
    didWell: string[]
    opportunities: string[]
    suggestion: string
  }
}

const STORAGE_KEY = 'coursev_voice_conversation_recommendations'
const MAX_STORED_RECOMMENDATIONS = 8

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readAll(): ConversationRecommendation[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function writeAll(items: ConversationRecommendation[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_STORED_RECOMMENDATIONS)))
  } catch {
    // Storage failures should not block the learning flow.
  }
}

export function getConversationRecommendations(userId?: number | null): ConversationRecommendation[] {
  return readAll().filter(item => {
    if (!userId || !item.userId) return true
    return Number(item.userId) === Number(userId)
  })
}

export function saveConversationRecommendation(item: ConversationRecommendation) {
  const existing = readAll().filter(rec => rec.id !== item.id)
  writeAll([item, ...existing])
}
