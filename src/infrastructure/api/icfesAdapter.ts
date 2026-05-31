/**
 * ICFES adapter.
 *
 * Modo por defecto: habla con el backend real (/icfes/*).
 * Si el backend no está disponible o está sin poblar, se cae automáticamente
 * al banco mock para no bloquear la UI durante desarrollo.
 */

import { api, HttpError } from './httpClient'
import { LC_BANK_2024_2025 } from './icfesLCBank'

export type IcfesArea = 'LC' | 'MAT' | 'SOC' | 'CN' | 'ING'

export interface IcfesAreaInfo {
  code: IcfesArea
  name: string
  short: string
  icon: string
  gradient: [string, string]
  glow: string
  description: string
}

export interface IcfesOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
  imageUrl?: string | null
}

export interface IcfesQuestionImage {
  id: string
  position: 'stem' | 'option_a' | 'option_b' | 'option_c' | 'option_d'
  url: string
  alt?: string
}

export interface IcfesQuestion {
  id: string
  area: IcfesArea
  topic: string
  subtopic: string
  difficulty: 1 | 2 | 3 | 4 | 5
  stem: string
  context?: string
  options: IcfesOption[]
  images?: IcfesQuestionImage[]
  correct?: 'A' | 'B' | 'C' | 'D'   // el backend NO lo devuelve (seguridad)
  explanation?: string
}

export interface IcfesSession {
  id: string
  area: IcfesArea
  createdAt: string
  durationSeconds: number
  questions: IcfesQuestion[]
}

export interface IcfesAnswer {
  questionId: string
  selected: 'A' | 'B' | 'C' | 'D' | null
  timeMs: number
}

export interface IcfesSubtopicBreakdown {
  subtopic: string
  total: number
  correct: number
  accuracy: number
  falenciaScore: number
  status: 'strength' | 'risk' | 'gap'
}

export interface IcfesReviewOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
  isCorrect: boolean
}

export interface IcfesQuestionReview {
  questionId: string
  stem: string
  subtopic: string
  selected: 'A' | 'B' | 'C' | 'D' | null
  correct: 'A' | 'B' | 'C' | 'D' | null
  isCorrect: boolean
  explanation: string | null
  options: IcfesReviewOption[]
}

export interface IcfesResult {
  id: string
  sessionId: string
  area: IcfesArea
  createdAt: string
  total: number
  correct: number
  incorrect: number
  unanswered: number
  grade: number
  durationSeconds: number
  breakdown: IcfesSubtopicBreakdown[]
  recommendations: string[]
  questions?: IcfesQuestionReview[]
}

// ────────────────── ÁREAS (metadata UI fija) ──────────────────
export const ICFES_AREAS: IcfesAreaInfo[] = [
  { code: 'LC',  name: 'Lectura Crítica',       short: 'Lectura',     icon: '📖',
    gradient: ['#6366F1', '#8B5CF6'], glow: 'rgba(139,92,246,.55)',
    description: 'Comprensión, inferencia y argumentación' },
  { code: 'MAT', name: 'Matemáticas',           short: 'Matemáticas', icon: '🧮',
    gradient: ['#F59E0B', '#F97316'], glow: 'rgba(249,115,22,.55)',
    description: 'Álgebra, geometría, estadística' },
  { code: 'SOC', name: 'Sociales y Ciudadanas', short: 'Sociales',    icon: '🌎',
    gradient: ['#10B981', '#059669'], glow: 'rgba(16,185,129,.55)',
    description: 'Historia, política y ciudadanía' },
  { code: 'CN',  name: 'Ciencias Naturales',    short: 'Ciencias',    icon: '🧪',
    gradient: ['#06B6D4', '#0EA5E9'], glow: 'rgba(14,165,233,.55)',
    description: 'Física, química y biología' },
  { code: 'ING', name: 'Inglés',                short: 'Inglés',      icon: '🇬🇧',
    gradient: ['#EC4899', '#F43F5E'], glow: 'rgba(244,63,94,.55)',
    description: 'Reading, grammar y vocabulary' },
]

export function findArea(code: string): IcfesAreaInfo | undefined {
  return ICFES_AREAS.find(a => a.code === (code as IcfesArea))
}

// ────────────────── BACKEND DTOs ──────────────────
interface ServerSession {
  id: string
  area: IcfesArea
  createdAt: string
  durationSeconds: number
  questions: Array<{
    id: string
    area: IcfesArea
    topic: string | null
    subtopic: string | null
    difficulty: number
    stem: string
    options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[]
    images?: IcfesQuestionImage[]
    correct?: 'A' | 'B' | 'C' | 'D' | null
    explanation?: string | null
  }>
}

function normalizeQuestion(q: ServerSession['questions'][number], area: IcfesArea): IcfesQuestion {
  const diff = Math.min(5, Math.max(1, Math.round(q.difficulty || 3))) as 1 | 2 | 3 | 4 | 5
  return {
    id: q.id,
    area,
    topic: q.topic ?? '',
    subtopic: q.subtopic ?? '',
    difficulty: diff,
    stem: q.stem,
    options: q.options,
    images: q.images ?? [],
    correct: q.correct ?? undefined,
    explanation: q.explanation ?? undefined,
  }
}

// ────────────────── MOCK BANK (fallback offline) ──────────────────
// Banco real curado a partir de docs/icfes_content/2024-2025/lectura critica/lecturacritica2024-2025.txt
const MOCK_BANK: Record<IcfesArea, IcfesQuestion[]> = {
  LC:  LC_BANK_2024_2025,
  MAT: buildMockBank('MAT', 'Razonamiento cuantitativo', ['Funciones', 'Geometría', 'Estadística', 'Álgebra']),
  SOC: buildMockBank('SOC', 'Ciudadanía',                ['Constitución', 'Historia de Colombia', 'Democracia', 'Economía']),
  CN:  buildMockBank('CN',  'Ciencias',                  ['Leyes de Newton', 'Química orgánica', 'Genética', 'Ecosistemas']),
  ING: buildMockBank('ING', 'English',                   ['Reading', 'Vocabulary', 'Grammar', 'Listening']),
}

function buildMockBank(area: IcfesArea, topic: string, subtopics: string[]): IcfesQuestion[] {
  const out: IcfesQuestion[] = []
  for (let i = 0; i < 40; i++) {
    const sub = subtopics[i % subtopics.length]
    const diff = ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5
    out.push({
      id: `${area}-${i + 1}`, area, topic, subtopic: sub, difficulty: diff,
      stem: buildStem(area, sub, i),
      options: [
        { id: 'A', text: buildOption(sub, 0) },
        { id: 'B', text: buildOption(sub, 1) },
        { id: 'C', text: buildOption(sub, 2) },
        { id: 'D', text: buildOption(sub, 3) },
      ],
      correct: (['A', 'B', 'C', 'D'] as const)[i % 4],
      explanation: `La respuesta correcta se apoya en los conceptos de ${sub.toLowerCase()}.`,
    })
  }
  return out
}

function buildStem(area: IcfesArea, sub: string, idx: number): string {
  const samples: Record<IcfesArea, string[]> = {
    LC:  [`Según el fragmento, el autor sugiere que la idea principal se relaciona con ${sub.toLowerCase()}.`],
    MAT: [`Dada la función f(x) = 2x + ${idx % 7}, ¿cuál es f(5)? (${sub})`],
    SOC: [`De acuerdo con ${sub.toLowerCase()}, ¿qué entidad vela por los derechos fundamentales?`],
    CN:  [`Un cuerpo sometido a una fuerza neta constante, según ${sub.toLowerCase()}, experimenta…`],
    ING: [`Choose the word that best completes the sentence in the context of ${sub.toLowerCase()}.`],
  }
  return samples[area][idx % samples[area].length]
}

function buildOption(sub: string, i: number): string {
  const tags = ['Definición precisa', 'Aplicación directa', 'Caso límite', 'Interpretación amplia']
  return `${tags[i]} del concepto de ${sub}`
}

function pickAdaptiveMock(bank: IcfesQuestion[], n: number): IcfesQuestion[] {
  const byDiff = [1, 2, 3, 4, 5].map(d => bank.filter(q => q.difficulty === d))
  const plan = [1, 1, 2, 2, 3, 2, 3, 3, 2, 3, 3, 4, 3, 4, 3, 4, 3, 4, 3, 5]
  const used = new Set<string>()
  const out: IcfesQuestion[] = []
  for (const d of plan) {
    const pool = byDiff[d - 1].filter(q => !used.has(q.id))
    const source = pool.length ? pool : bank.filter(q => !used.has(q.id))
    if (!source.length) break
    const q = source[Math.floor(Math.random() * source.length)]
    used.add(q.id); out.push(q)
    if (out.length >= n) break
  }
  return out
}

function computeMockResult(session: IcfesSession, answers: IcfesAnswer[]): IcfesResult {
  const byId = new Map(answers.map(a => [a.questionId, a]))
  let correct = 0, incorrect = 0, unanswered = 0
  const subMap = new Map<string, { total: number; correct: number; time: number }>()
  const review: IcfesQuestionReview[] = []
  for (const q of session.questions) {
    const a = byId.get(q.id)
    const row = subMap.get(q.subtopic) ?? { total: 0, correct: 0, time: 0 }
    row.total++; row.time += a?.timeMs ?? 0
    const isCorrect = !!a && a.selected != null && a.selected === q.correct
    if (!a || a.selected == null) unanswered++
    else if (isCorrect) { correct++; row.correct++ }
    else incorrect++
    subMap.set(q.subtopic, row)
    review.push({
      questionId: q.id,
      stem: q.stem,
      subtopic: q.subtopic,
      selected: a?.selected ?? null,
      correct: q.correct ?? null,
      isCorrect,
      explanation: q.explanation ?? null,
      options: q.options.map(o => ({ id: o.id, text: o.text, isCorrect: o.id === q.correct })),
    })
  }
  const total = session.questions.length
  const grade = total ? +(10 * (correct / total)).toFixed(1) : 0
  const durationSeconds = Math.round(answers.reduce((s, a) => s + (a.timeMs ?? 0), 0) / 1000)
  const breakdown: IcfesSubtopicBreakdown[] = [...subMap.entries()].map(([subtopic, r]) => {
    const accuracy = r.total ? r.correct / r.total : 0
    const avgTime = r.total ? r.time / r.total / 1000 : 0
    const tNorm = Math.min(1, avgTime / 60)
    const falenciaScore = Math.max(0, Math.min(1, 0.6 * (1 - accuracy) + 0.4 * tNorm))
    const status: IcfesSubtopicBreakdown['status'] =
      falenciaScore > 0.65 ? 'gap' : falenciaScore > 0.4 ? 'risk' : 'strength'
    return { subtopic, total: r.total, correct: r.correct, accuracy, falenciaScore, status }
  }).sort((a, b) => b.falenciaScore - a.falenciaScore)
  const gaps = breakdown.filter(b => b.status === 'gap').slice(0, 3)
  const recommendations = gaps.length
    ? gaps.map(g => `Refuerza "${g.subtopic}" — ${Math.round(g.accuracy * 100)}% aciertos.`)
    : ['¡Excelente desempeño! Mantén el ritmo.']
  return {
    id: `res_${session.id}`, sessionId: session.id, area: session.area,
    createdAt: new Date().toISOString(),
    total, correct, incorrect, unanswered, grade, durationSeconds,
    breakdown, recommendations,
    questions: review,
  }
}

// ────────────────── PUBLIC API ──────────────────
function shouldFallback(err: unknown): boolean {
  if (err instanceof HttpError) {
    // 404/501: endpoint no disponible
    // 409: backend sin preguntas suficientes (banco vacío) → usar mock
    // 5xx: errores del servidor → degradar a mock para no bloquear al usuario
    return (
      err.statusCode === 404 ||
      err.statusCode === 409 ||
      err.statusCode === 501 ||
      err.statusCode >= 500
    )
  }
  return true // red caída / timeout / CORS
}

export const icfesAdapter = {
  listAreas(): IcfesAreaInfo[] {
    return ICFES_AREAS
  },

  async startSession(area: IcfesArea): Promise<IcfesSession> {
    try {
      const server = await api.post<ServerSession>('/icfes/exam/start', { area })
      return {
        id: server.id,
        area: server.area,
        createdAt: server.createdAt,
        durationSeconds: server.durationSeconds,
        questions: server.questions.map(q => normalizeQuestion(q, server.area)),
      }
    } catch (err) {
      if (!shouldFallback(err)) throw err
      await delay(250)
      const bank = MOCK_BANK[area] ?? []
      const picked = pickAdaptiveMock(bank, 20)
      return {
        id: `sess_${area}_${Date.now()}`, area,
        createdAt: new Date().toISOString(),
        durationSeconds: 20 * 35,
        questions: picked,
      }
    }
  },

  async submitSession(session: IcfesSession, answers: IcfesAnswer[]): Promise<IcfesResult> {
    try {
      return await api.post<IcfesResult>('/icfes/exam/submit', {
        sessionId: session.id,
        answers: answers.map(a => ({
          questionId: a.questionId,
          selected: a.selected,
          timeMs: Math.max(0, Math.round(a.timeMs || 0)),
        })),
      })
    } catch (err) {
      if (!shouldFallback(err)) throw err
      await delay(300)
      return computeMockResult(session, answers)
    }
  },

  async getHistory(): Promise<IcfesResult[]> {
    try {
      return await api.get<IcfesResult[]>('/icfes/results/my')
    } catch {
      return []
    }
  },
}

function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
