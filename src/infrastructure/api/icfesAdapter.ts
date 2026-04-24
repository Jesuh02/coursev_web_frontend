/**
 * ICFES adapter.
 *
 * Si el backend aún no expone los endpoints, el adapter entrega datos
 * mock realistas para poder construir y validar la experiencia.
 * Cuando el backend esté listo, basta con reemplazar los métodos
 * por llamadas a `api.*` respetando la misma forma de respuesta.
 */

export type IcfesArea = 'LC' | 'MAT' | 'SC' | 'CN' | 'ING'

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
  correct: 'A' | 'B' | 'C' | 'D'
  explanation?: string
}

export interface IcfesSession {
  id: string
  area: IcfesArea
  createdAt: string
  durationSeconds: number // ~35s por pregunta
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
  falenciaScore: number // 0-1
  status: 'strength' | 'risk' | 'gap'
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
  grade: number // 0-10
  durationSeconds: number
  breakdown: IcfesSubtopicBreakdown[]
  recommendations: string[]
}

export const ICFES_AREAS: IcfesAreaInfo[] = [
  {
    code: 'LC',
    name: 'Lectura Crítica',
    short: 'Lectura',
    icon: '📖',
    gradient: ['#6366F1', '#8B5CF6'],
    glow: 'rgba(139,92,246,.55)',
    description: 'Comprensión, inferencia y argumentación',
  },
  {
    code: 'MAT',
    name: 'Matemáticas',
    short: 'Matemáticas',
    icon: '🧮',
    gradient: ['#F59E0B', '#F97316'],
    glow: 'rgba(249,115,22,.55)',
    description: 'Álgebra, geometría, estadística',
  },
  {
    code: 'SC',
    name: 'Sociales y Ciudadanas',
    short: 'Sociales',
    icon: '🌎',
    gradient: ['#10B981', '#059669'],
    glow: 'rgba(16,185,129,.55)',
    description: 'Historia, política y ciudadanía',
  },
  {
    code: 'CN',
    name: 'Ciencias Naturales',
    short: 'Ciencias',
    icon: '🧪',
    gradient: ['#06B6D4', '#0EA5E9'],
    glow: 'rgba(14,165,233,.55)',
    description: 'Física, química y biología',
  },
  {
    code: 'ING',
    name: 'Inglés',
    short: 'Inglés',
    icon: '🇬🇧',
    gradient: ['#EC4899', '#F43F5E'],
    glow: 'rgba(244,63,94,.55)',
    description: 'Reading, grammar y vocabulary',
  },
]

export function findArea(code: string): IcfesAreaInfo | undefined {
  return ICFES_AREAS.find(a => a.code === (code as IcfesArea))
}

// ────────────────── MOCK BANK ──────────────────
const MOCK_BANK: Record<IcfesArea, IcfesQuestion[]> = {
  LC: buildMockBank('LC', 'Comprensión lectora', [
    'Inferencia', 'Tesis y argumentos', 'Tipología textual', 'Cohesión',
  ]),
  MAT: buildMockBank('MAT', 'Razonamiento cuantitativo', [
    'Funciones', 'Geometría', 'Estadística', 'Álgebra',
  ]),
  SC: buildMockBank('SC', 'Ciudadanía', [
    'Constitución', 'Historia de Colombia', 'Democracia', 'Economía',
  ]),
  CN: buildMockBank('CN', 'Ciencias', [
    'Leyes de Newton', 'Química orgánica', 'Genética', 'Ecosistemas',
  ]),
  ING: buildMockBank('ING', 'English', [
    'Reading', 'Vocabulary', 'Grammar', 'Listening',
  ]),
}

function buildMockBank(area: IcfesArea, topic: string, subtopics: string[]): IcfesQuestion[] {
  const out: IcfesQuestion[] = []
  for (let i = 0; i < 40; i++) {
    const sub = subtopics[i % subtopics.length]
    const diff = ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5
    out.push({
      id: `${area}-${i + 1}`,
      area,
      topic,
      subtopic: sub,
      difficulty: diff,
      stem: buildStem(area, sub, i),
      options: [
        { id: 'A', text: buildOption(area, sub, 0) },
        { id: 'B', text: buildOption(area, sub, 1) },
        { id: 'C', text: buildOption(area, sub, 2) },
        { id: 'D', text: buildOption(area, sub, 3) },
      ],
      correct: (['A', 'B', 'C', 'D'] as const)[i % 4],
      explanation: `La respuesta correcta se apoya en los conceptos de ${sub.toLowerCase()}.`,
    })
  }
  return out
}

function buildStem(area: IcfesArea, sub: string, idx: number): string {
  const samples: Record<IcfesArea, string[]> = {
    LC: [
      `Según el fragmento, el autor sugiere que la idea principal se relaciona con ${sub.toLowerCase()} porque el texto enfatiza en los matices del lenguaje empleado.`,
      `El propósito comunicativo del texto expuesto puede interpretarse principalmente desde ${sub.toLowerCase()}.`,
    ],
    MAT: [
      `Dada la función f(x) = 2x + ${idx % 7}, ¿cuál es el valor de f(5) aplicando el concepto de ${sub.toLowerCase()}?`,
      `En un triángulo rectángulo de catetos ${3 + idx % 4} y ${4 + idx % 5}, ¿cuál es la hipotenusa? (${sub})`,
    ],
    SC: [
      `De acuerdo con la Constitución Política de Colombia y el principio de ${sub.toLowerCase()}, ¿qué entidad vela por los derechos fundamentales?`,
      `¿Cuál es el impacto principal de ${sub.toLowerCase()} en la vida democrática colombiana?`,
    ],
    CN: [
      `Un cuerpo sometido a una fuerza neta constante experimenta, según ${sub.toLowerCase()}, una variación en su…`,
      `En un ecosistema tropical, la relación entre productores y consumidores evidencia el principio de ${sub.toLowerCase()}.`,
    ],
    ING: [
      `Read the sentence and select the option that best completes the idea related to ${sub.toLowerCase()}.`,
      `Choose the word that expresses the same meaning in the context of ${sub.toLowerCase()}.`,
    ],
  }
  const list = samples[area]
  return list[idx % list.length]
}

function buildOption(area: IcfesArea, sub: string, i: number): string {
  const tags = ['Definición precisa', 'Aplicación directa', 'Caso límite', 'Interpretación amplia']
  return `${tags[i]} del concepto de ${sub}`
}

// ────────────────── PUBLIC API ──────────────────
export const icfesAdapter = {
  listAreas(): IcfesAreaInfo[] {
    return ICFES_AREAS
  },

  async startSession(area: IcfesArea): Promise<IcfesSession> {
    // Simula latencia de red (~300ms como en el pipeline real)
    await delay(250 + Math.random() * 250)
    const bank = MOCK_BANK[area] ?? []
    const picked = pickAdaptive(bank, 20)
    return {
      id: `sess_${area}_${Date.now()}`,
      area,
      createdAt: new Date().toISOString(),
      durationSeconds: 20 * 35,
      questions: picked,
    }
  },

  async submitSession(
    session: IcfesSession,
    answers: IcfesAnswer[],
  ): Promise<IcfesResult> {
    await delay(350)
    return computeResult(session, answers)
  },

  async getHistory(): Promise<IcfesResult[]> {
    // Por ahora vacío; cuando exista backend → GET /icfes/results/my
    return []
  },
}

function pickAdaptive(bank: IcfesQuestion[], n: number): IcfesQuestion[] {
  // Orden pedagógico: 1-3 fácil, 4-10 medio, 11-16 escalada, 17-19 alta, 20 reto
  const byDiff = [1, 2, 3, 4, 5].map(d => bank.filter(q => q.difficulty === d))
  const plan: number[] = [
    1, 1, 2, // calentamiento
    2, 3, 2, 3, 3, 2, 3, // medio
    3, 4, 3, 4, 3, 4, // escalada
    3, 4, 3, // estable
    5, // reto final
  ]
  const usedIds = new Set<string>()
  const out: IcfesQuestion[] = []
  for (const d of plan) {
    const pool = byDiff[d - 1].filter(q => !usedIds.has(q.id))
    const fallback = bank.filter(q => !usedIds.has(q.id))
    const source = pool.length ? pool : fallback
    if (!source.length) break
    const q = source[Math.floor(Math.random() * source.length)]
    usedIds.add(q.id)
    out.push(q)
    if (out.length >= n) break
  }
  return out
}

function computeResult(session: IcfesSession, answers: IcfesAnswer[]): IcfesResult {
  const byId = new Map(answers.map(a => [a.questionId, a]))
  let correct = 0
  let incorrect = 0
  let unanswered = 0

  const subMap = new Map<string, { total: number; correct: number; time: number }>()

  for (const q of session.questions) {
    const a = byId.get(q.id)
    const row = subMap.get(q.subtopic) ?? { total: 0, correct: 0, time: 0 }
    row.total++
    row.time += a?.timeMs ?? 0
    if (!a || a.selected == null) {
      unanswered++
    } else if (a.selected === q.correct) {
      correct++
      row.correct++
    } else {
      incorrect++
    }
    subMap.set(q.subtopic, row)
  }

  const total = session.questions.length
  const grade = total ? +(10 * (correct / total)).toFixed(1) : 0
  const durationSeconds = Math.round(
    answers.reduce((s, a) => s + (a.timeMs ?? 0), 0) / 1000,
  )

  const breakdown: IcfesSubtopicBreakdown[] = Array.from(subMap.entries())
    .map(([subtopic, r]) => {
      const accuracy = r.total ? r.correct / r.total : 0
      // falencia: invertimos accuracy, subimos si el tiempo promedio es alto
      const avgTime = r.total ? r.time / r.total / 1000 : 0
      const tNorm = Math.min(1, avgTime / 60)
      const falenciaScore = clamp01(0.6 * (1 - accuracy) + 0.4 * tNorm)
      const status: IcfesSubtopicBreakdown['status'] =
        falenciaScore > 0.65 ? 'gap' : falenciaScore > 0.4 ? 'risk' : 'strength'
      return { subtopic, total: r.total, correct: r.correct, accuracy, falenciaScore, status }
    })
    .sort((a, b) => b.falenciaScore - a.falenciaScore)

  const recommendations = buildRecommendations(breakdown, session.area)

  return {
    id: `res_${session.id}`,
    sessionId: session.id,
    area: session.area,
    createdAt: new Date().toISOString(),
    total,
    correct,
    incorrect,
    unanswered,
    grade,
    durationSeconds,
    breakdown,
    recommendations,
  }
}

function buildRecommendations(bd: IcfesSubtopicBreakdown[], area: IcfesArea): string[] {
  const gaps = bd.filter(b => b.status === 'gap').slice(0, 3)
  if (!gaps.length) {
    return [
      '¡Excelente desempeño! Mantén el ritmo con sesiones semanales.',
      `Intenta una sesión con dificultad más alta en ${findArea(area)?.name ?? area}.`,
    ]
  }
  return gaps.map(g =>
    `Refuerza "${g.subtopic}" — solo ${Math.round(g.accuracy * 100)}% acertadas. Sugerencia: 10 min de teoría + 5 ejercicios.`,
  )
}

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)) }
function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)) }
