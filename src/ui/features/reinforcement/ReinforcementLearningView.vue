<template>
  <div class="rl-root">

    <!-- ░░ Floating particles ░░ -->
    <div class="particles" aria-hidden="true">
      <span v-for="p in particles" :key="p.id" class="particle" :style="p.style" />
    </div>

    <!-- ░░ Top bar ░░ -->
    <TopBar title="Refuerzo de Aprendizaje" @back="$router.back()" />

    <!-- ════════════════════════════════════ START ════════════════════════════════════ -->
    <Transition name="phase">
      <div v-if="phase === 'start'" key="start" class="screen start-screen">

        <div class="mascot-wrap">
          <div class="mascot">🧠</div>
          <div class="mascot-shadow" />
        </div>

        <h1 class="start-title">¡Modo Refuerzo!</h1>
        <p class="start-sub">Pon a prueba tus conocimientos y sube de nivel</p>

        <div v-if="topicName || taskName" class="ctx-pills">
          <span v-if="topicName" class="ctx-pill topic">📚 {{ topicName }}</span>
          <span v-if="taskName" class="ctx-pill task">📝 {{ taskName }}</span>
        </div>

        <!-- Difficulty selector -->
        <div class="diff-section">
          <p class="diff-label">Nivel de dificultad</p>
          <div class="diff-row">
            <button
              v-for="d in difficultyOptions"
              :key="d.value"
              class="diff-btn"
              :class="{ 'diff-active': selectedDifficulty === d.value }"
              :style="selectedDifficulty === d.value ? { '--diff-color': d.color } : {}"
              @click="selectedDifficulty = d.value"
            >
              <span class="diff-emoji">{{ d.emoji }}</span>
              <span class="diff-name">{{ d.label }}</span>
            </button>
          </div>
        </div>

        <AppButton variant="primary" full @click="startQuiz">
          ¡Comenzar Sesión! 🚀
        </AppButton>
      </div>
    </Transition>

    <!-- ════════════════════════════════════ LOADING ════════════════════════════════════ -->
    <Transition name="phase">
      <div v-if="phase === 'loading'" key="loading" class="screen loading-screen">

        <div class="ai-header">
          <div class="ai-spinner" aria-label="Cargando">
            <span class="ring r1" />
            <span class="ring r2" />
            <span class="ring r3" />
            <span class="ring-icon">🤖</span>
          </div>
          <h2 class="loading-title">Generando preguntas…</h2>
          <p class="loading-sub">{{ loadingMsg }}</p>
        </div>

        <!-- ── Triqui ── -->
        <div class="triqui-card">
          <p class="triqui-label">🎮 Juega Triqui mientras esperas</p>

          <div class="triqui-scoreboard">
            <div class="tscore you">
              <span class="tscore-sym">✕</span>
              <span class="tscore-val">{{ triquiScore.player }}</span>
              <span class="tscore-name">Tú</span>
            </div>
            <div class="tscore-divider">VS</div>
            <div class="tscore cpu">
              <span class="tscore-sym">○</span>
              <span class="tscore-val">{{ triquiScore.cpu }}</span>
              <span class="tscore-name">CPU</span>
            </div>
          </div>

          <div class="triqui-grid">
            <button
              v-for="(cell, i) in triquiBoard"
              :key="i"
              class="tcell"
              :class="tcellClass(i)"
              :disabled="!!cell || !!triquiWinner || triquiIsDraw || !triquiPlayerTurn"
              @click="triquiClick(i)"
            >
              <Transition name="pop">
                <span v-if="cell" class="tcell-sym" :class="cell === 'X' ? 'sym-x' : 'sym-o'">
                  {{ cell === 'X' ? '✕' : '○' }}
                </span>
              </Transition>
            </button>
          </div>

          <Transition name="slide-down">
            <div v-if="triquiWinner || triquiIsDraw" class="triqui-result" :class="triquiWinner ?? 'draw'">
              {{ triquiResultMsg }}
            </div>
          </Transition>

          <p v-if="!triquiPlayerTurn && !triquiWinner && !triquiIsDraw" class="cpu-thinking">
            ⏳ CPU pensando…
          </p>
        </div>
      </div>
    </Transition>

    <!-- ════════════════════════════════════ QUIZ ════════════════════════════════════ -->
    <Transition name="phase">
      <div v-if="phase === 'quiz'" key="quiz" class="screen quiz-screen">

        <!-- Progress -->
        <div class="prog-bar-wrap">
          <div class="prog-track">
            <div class="prog-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="prog-info">
            <span class="prog-count">{{ currentIdx + 1 }} / {{ questions.length }}</span>
            <span class="score-badge">⭐ {{ correctCount }}</span>
          </div>
        </div>

        <!-- Question card -->
        <Transition :name="qTransition" mode="out-in">
          <div :key="currentIdx" class="q-card">
            <div class="q-header">
              <div class="q-tag">Pregunta {{ currentIdx + 1 }}</div>
              <button
                class="tts-btn"
                :class="{ 'tts-active': isSpeaking }"
                :title="isSpeaking ? 'Detener lectura' : 'Leer en voz alta'"
                @click="speakQuestion"
              >
                <span v-if="!isSpeaking" class="tts-icon">🔊</span>
                <span v-else class="tts-icon tts-pulse">🔇</span>
              </button>
            </div>
            <p class="q-text">{{ currentQ.question }}</p>

            <!-- Multiple choice options -->
            <div v-if="currentQ.options && currentQ.options.length >= 2" class="opts-list">
              <button
                v-for="(opt, i) in currentQ.options"
                :key="i"
                class="opt-btn"
                :class="optClass(i)"
                :disabled="answered"
                @click="pick(i)"
              >
                <span class="opt-letter" :class="optLetterClass(i)">{{ letters[i] }}</span>
                <span class="opt-text">{{ opt }}</span>
                <Transition name="pop">
                  <span v-if="answered && i === currentQ.correctIndex" class="opt-icon correct-icon">✓</span>
                  <span v-else-if="answered && i === pickedIdx && i !== currentQ.correctIndex" class="opt-icon wrong-icon">✗</span>
                </Transition>
              </button>
            </div>

            <!-- Ordering type -->
            <div v-else-if="currentQ.type === 'ordering'" class="ordering-wrap">
              <p class="ordering-hint">Toca los pasos en el orden correcto:</p>
              <div class="ordering-items">
                <button
                  v-for="(item, i) in currentQ.items"
                  :key="i"
                  class="ordering-item"
                  :class="orderingItemClass(i)"
                  :disabled="answered"
                  @click="toggleOrderItem(i)"
                >
                  <span class="ordering-pos">
                    {{ orderingUserSeq.includes(i) ? orderingUserSeq.indexOf(i) + 1 : '·' }}
                  </span>
                  <span class="ordering-text">{{ item }}</span>
                </button>
              </div>
              <Transition name="slide-down">
                <div v-if="answered" class="fill-feedback" :class="fillCorrect ? 'fill-ok' : 'fill-err'">
                  <span class="fill-icon">{{ fillCorrect ? '✓' : '✗' }}</span>
                  <span>{{ fillCorrect ? '¡Orden correcto!' : 'Orden incorrecto. Revisa la explicación.' }}</span>
                </div>
              </Transition>
              <AppButton
                v-if="!answered"
                variant="primary"
                full
                :disabled="orderingUserSeq.length !== (currentQ.items?.length ?? 0)"
                @click="checkOrdering"
              >
                Verificar orden
              </AppButton>
            </div>

            <!-- Fill-in-blank input -->
            <div v-else class="fill-wrap">
              <input
                v-model="fillAnswer"
                class="fill-input"
                :disabled="answered"
                placeholder="Escribe tu respuesta…"
                type="text"
                @keyup.enter="!answered && checkFill()"
              />
              <Transition name="slide-down">
                <div v-if="answered" class="fill-feedback" :class="fillCorrect ? 'fill-ok' : 'fill-err'">
                  <span class="fill-icon">{{ fillCorrect ? '✓' : '✗' }}</span>
                  <span>{{ fillCorrect ? '¡Correcto!' : `Respuesta: ${currentQ.correctAnswer ?? currentQ.options?.[currentQ.correctIndex] ?? '—'}` }}</span>
                </div>
              </Transition>
              <AppButton v-if="!answered" variant="primary" full @click="checkFill">Verificar</AppButton>
            </div>

            <!-- Explanation -->
            <Transition name="slide-down">
              <div v-if="answered && currentQ.explanation" class="explanation">
                <span class="exp-tag">💡 Explicación</span>
                <p class="exp-text">{{ currentQ.explanation }}</p>
              </div>
            </Transition>
          </div>
        </Transition>

        <Transition name="slide-down">
          <AppButton v-if="answered" full @click="nextQ">
            {{ isLastQ ? '🏁 Ver Resultados' : 'Siguiente →' }}
          </AppButton>
        </Transition>
      </div>
    </Transition>

    <!-- ════════════════════════════════════ RESULTS ════════════════════════════════════ -->
    <Transition name="phase">
      <div v-if="phase === 'results'" key="results" class="screen results-screen">

        <div class="confetti-wrap" aria-hidden="true">
          <span v-for="c in confetti" :key="c.id" class="confetti-star" :style="c.style">{{ c.sym }}</span>
        </div>

        <div class="trophy">{{ scoreTrophy }}</div>
        <h2 class="result-title">{{ scoreTitle }}</h2>

        <div class="score-ring-wrap">
          <svg viewBox="0 0 110 110" class="score-svg">
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stop-color="#6200EE" />
                <stop offset="100%" stop-color="#00D4FF" />
              </linearGradient>
            </defs>
            <circle cx="55" cy="55" r="46" class="ring-bg" />
            <circle
              cx="55" cy="55" r="46"
              class="ring-arc"
              :stroke-dasharray="`${scoreArc} 289`"
              stroke-dashoffset="0"
            />
          </svg>
          <div class="score-inner">
            <span class="score-pct">{{ scorePct }}%</span>
            <span class="score-detail">{{ correctCount }}/{{ questions.length }}</span>
          </div>
        </div>

        <p class="result-msg">{{ scoreMsg }}</p>

        <div class="result-btns">
          <AppButton variant="secondary" @click="restart">🔄 Repetir</AppButton>
          <AppButton full @click="$router.back()">✅ Finalizar</AppButton>
        </div>
      </div>
    </Transition>

    <!-- ░░ Error toast ░░ -->
    <Transition name="toast">
      <div v-if="errorMsg" class="error-toast" role="alert">⚠️ {{ errorMsg }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Decimal from 'decimal.js'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'
import { api, tokenStorage, HttpError } from '@/infrastructure/api/httpClient'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  correctAnswer?: string
  explanation?: string
  type?: string
  items?: string[]       // ordering type: pasos desordenados
  correctOrder?: number[] // ordering type: índices en orden correcto
}

type Phase = 'start' | 'loading' | 'quiz' | 'results'
type Cell  = '' | 'X' | 'O'
type WinnerType = 'player' | 'cpu' | null
type DifficultyLevel = 'EASY' | 'INTERMEDIATE' | 'HARD'

// ─── Route ─────────────────────────────────────────────────────────────────────
const route     = useRoute()
const courseId  = computed(() => Number(route.params.courseId) || 0)
const topicId   = computed(() => route.query.topicId  ? Number(route.query.topicId)  : null)
const taskId    = computed(() => route.query.taskId    ? Number(route.query.taskId)   : null)
const topicName = computed(() => (route.query.topicName as string) || '')
const taskName  = computed(() => (route.query.taskName  as string) || '')

// ─── Config ────────────────────────────────────────────────────────────────────
const letters = ['A', 'B', 'C', 'D']

const difficultyOptions: Array<{ value: DifficultyLevel; label: string; emoji: string; color: string }> = [
  { value: 'EASY',         label: 'Fácil',      emoji: '🌱', color: '#2ECC71' },
  { value: 'INTERMEDIATE', label: 'Intermedio',  emoji: '⚡', color: '#F39C12' },
  { value: 'HARD',         label: 'Difícil',     emoji: '🔥', color: '#E74C3C' },
]

// ─── State ─────────────────────────────────────────────────────────────────────
const selectedDifficulty = ref<DifficultyLevel>('HARD')
const phase        = ref<Phase>('start')
let   quizStartTime = 0
const questions    = ref<QuizQuestion[]>([])
const currentIdx   = ref(0)
const answered     = ref(false)
const pickedIdx    = ref(-1)
const correctCount = ref(0)
const errorMsg     = ref('')
const qTransition  = ref('slide-left')
const fillAnswer      = ref('')
const fillCorrect     = ref(false)
const orderingUserSeq = ref<number[]>([])

// ─── TTS (Text-to-Speech) ──────────────────────────────────────────────────────
const isSpeaking = ref(false)

function speakQuestion() {
  const synth = window.speechSynthesis
  if (!synth) return

  // If already speaking, stop
  if (synth.speaking || synth.pending) {
    synth.cancel()
    isSpeaking.value = false
    return
  }

  const q = currentQ.value
  const parts: string[] = []

  // Question
  if (q.question) parts.push(`Pregunta: ${q.question}`)

  // Options (multiple choice)
  if (q.options && q.options.length >= 2) {
    q.options.forEach((opt, i) => {
      parts.push(`Opción ${letters[i]}: ${opt}`)
    })
  }

  // Ordering items
  if (q.type === 'ordering' && q.items?.length) {
    parts.push('Pasos a ordenar:')
    q.items.forEach((item, i) => {
      parts.push(`${i + 1}. ${item}`)
    })
  }

  // Explanation (only if answered and visible)
  if (answered.value && q.explanation) {
    parts.push(`Explicación: ${q.explanation}`)
  }

  if (!parts.length) return

  const utterance = new SpeechSynthesisUtterance(parts.join('. '))
  utterance.lang = 'es-ES'
  utterance.rate = 0.95

  // Try to pick a Spanish voice
  const voices = synth.getVoices()
  const esVoice = voices.find(v => v.lang.startsWith('es'))
  if (esVoice) utterance.voice = esVoice

  utterance.onstart = () => { isSpeaking.value = true }
  utterance.onend   = () => { isSpeaking.value = false }
  utterance.onerror = () => { isSpeaking.value = false }

  synth.speak(utterance)
}

function stopSpeaking() {
  window.speechSynthesis?.cancel()
  isSpeaking.value = false
}

// Loading animation
const loadingTick    = ref(0)
let   loadingTimer: ReturnType<typeof setInterval> | null = null
const loadingPhrases = [
  'Analizando el contenido del curso…',
  'Generando ejercicios personalizados…',
  'Procesando archivos y contexto inicial…',
  'Aplicando inteligencia artificial…',
  'Casi listo, aguarda un momento…',
]
const loadingMsg = computed(() => loadingPhrases[loadingTick.value % loadingPhrases.length])

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Particles (decorative) ────────────────────────────────────────────────────
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  style: {
    left:              `${Math.random() * 100}%`,
    top:               `${Math.random() * 100}%`,
    animationDelay:    `${(Math.random() * 6).toFixed(1)}s`,
    animationDuration: `${(3 + Math.random() * 5).toFixed(1)}s`,
    width:             `${Math.round(4 + Math.random() * 8)}px`,
    height:            `${Math.round(4 + Math.random() * 8)}px`,
    opacity:           `${(0.15 + Math.random() * 0.35).toFixed(2)}`,
  },
}))

// ─── Quiz computed ──────────────────────────────────────────────────────────────
const currentQ   = computed(() => questions.value[currentIdx.value] ?? { question: '', options: [], correctIndex: 0 })
const isLastQ    = computed(() => currentIdx.value >= questions.value.length - 1)
const progressPct = computed(() => {
  if (!questions.value.length) return 0
  return ((currentIdx.value + (answered.value ? 1 : 0)) / questions.value.length) * 100
})

// ─── Score computed ─────────────────────────────────────────────────────────────
const scorePct   = computed(() => questions.value.length ? Math.round((correctCount.value / questions.value.length) * 100) : 0)
const scoreArc   = computed(() => (scorePct.value / 100) * 289)
const scoreTrophy = computed(() => {
  if (scorePct.value >= 90) return '🏆'
  if (scorePct.value >= 70) return '🎉'
  if (scorePct.value >= 50) return '💪'
  return '📚'
})
const scoreTitle = computed(() => {
  if (scorePct.value >= 90) return '¡Increíble!'
  if (scorePct.value >= 70) return '¡Muy bien!'
  if (scorePct.value >= 50) return '¡Buen intento!'
  return '¡Sigue practicando!'
})
const scoreMsg = computed(() => {
  if (scorePct.value >= 90) return 'Dominas este tema como un experto 🧠'
  if (scorePct.value >= 70) return 'Vas por muy buen camino, sigue así ✨'
  if (scorePct.value >= 50) return 'Un poco más de práctica y lo dominarás 📖'
  return 'Repasa el material y vuelve a intentarlo 💡'
})

function shouldConvertMathFillQuestion(question: string, correctAnswer?: string) {
  const answer = String(correctAnswer ?? '').trim()
  if (!answer || !/^-?\d+(?:[.,]\d+)?$/.test(answer.replace(/\s+/g, ''))) return false

  const text = String(question ?? '').trim()
  if (!text) return false
  if (/(select\b|function\b|return\b|const\b|let\b|from\b|where\b|class\b|def\b|public\b)/i.test(text)) return false

  return /(suma|sumatoria|calcula|resuelve|aritm[ée]tica|serie)/i.test(text)
    || /[+×÷\-*=Σ∑]/.test(text)
}

function formatMathOption(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(2).replace(/\.00$/, '')
}

function shuffleMultipleChoiceQuestion(question: QuizQuestion): QuizQuestion {
  if (!Array.isArray(question.options) || question.options.length < 2) return question

  const indexedOptions = question.options.map((option, index) => ({
    option,
    isCorrect: index === question.correctIndex,
  }))

  for (let i = indexedOptions.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    const temp = indexedOptions[i]
    indexedOptions[i] = indexedOptions[randomIndex]
    indexedOptions[randomIndex] = temp
  }

  const correctIndex = indexedOptions.findIndex(item => item.isCorrect)
  return {
    ...question,
    options: indexedOptions.map(item => item.option),
    correctIndex: correctIndex >= 0 ? correctIndex : question.correctIndex,
  }
}

Decimal.set({ precision: 64 })

function parseDecimal(str: string): Decimal | null {
  if (!str) return null
  try {
    const d = new Decimal(String(str).replace(/,/g, ''))
    return d.isFinite() ? d : null
  } catch { return null }
}

function verifyMathConsistency(question: QuizQuestion): QuizQuestion | null {
  const text = question.question ?? ''
  const lower = text.toLowerCase()

  const mathSignals = /calcula|suma|total|multiplica|divide|resta|resultado|costo\s+total|precio\s+total|monto\s+total|redondea|¿cuánto|cuántos|cuántas|promedio|media|porcentaje|serie\s+(?:aritm|geom)|progresión|sumatoria|[Σ∑]|derivada|extremo|mínimo\s+local|máximo\s+local|notación\s+científica|dígito|cifra|posición/i
  const hasSignificantNumbers = /\d{3,}/.test(text.replace(/,/g, ''))
  if (!mathSignals.test(lower) && !hasSignificantNumbers) return question

  // ── Digit-position meta-questions: compute answer properly ──
  const metaPatterns = [
    /d[ií]gito\s+(?:(?:de|en|que\s+ocupa)\s+)?(?:las?\s+)?(?:posici[oó]n\s+(?:de\s+(?:las?\s+)?)?)?(?:centenas?|decenas?|unidades?|miles?|millones?|millares?)/i,
    /posici[oó]n\s+(?:de\s+(?:las?\s+)?)?(?:centenas?|decenas?|unidades?|miles?|millones?|millares?)/i,
    /¿cu[aá]l\s+es\s+el\s+d[ií]gito/i,
    /cifra\s+(?:de|en)\s+(?:la\s+)?posici[oó]n/i,
    /d[ií]gito\s+(?:que\s+)?(?:est[aá]|se\s+encuentra|ocupa)\s+en/i,
    /qu[eé]\s+(?:d[ií]gito|n[uú]mero|cifra)\s+(?:hay|est[aá]|se\s+encuentra|ocupa)/i,
    /(?:centenas?|decenas?|unidades?)\s+de\s+(?:mill[oó]n|millar)/i,
  ]
  if (metaPatterns.some(re => re.test(text))) {
    const digitResult = feDigitPositionProblem(text)
    if (digitResult) {
      const digitAnswer = digitResult.value
      if (question.type === 'fill_in_blank') {
        const currentAnswer = parseDecimal(String(question.correctAnswer ?? ''))
        if (currentAnswer && !currentAnswer.eq(digitAnswer)) {
          console.warn(`[FE MathVerify] CORRECTED digit-position fill_in_blank: LLM="${question.correctAnswer}" → Correct="${digitAnswer}"`)
          return { ...question, correctAnswer: digitAnswer.toFixed(), explanation: digitResult.steps.join('. ') + '.' }
        }
        return question
      }
      if (question.type === 'multiple_choice' && Array.isArray(question.options)) {
        const optionValues = question.options.map(opt => parseDecimal(String(opt).replace(/[^\d.-]/g, '')))
        let matchIdx = -1
        for (let i = 0; i < optionValues.length; i++) {
          if (optionValues[i] && optionValues[i]!.eq(digitAnswer)) { matchIdx = i; break }
        }
        if (matchIdx >= 0 && matchIdx !== question.correctIndex) {
          console.warn(`[FE MathVerify] CORRECTED digit-position MC: index ${question.correctIndex}→${matchIdx} (digit=${digitAnswer})`)
          return { ...question, correctIndex: matchIdx, explanation: digitResult.steps.join('. ') + '.' }
        }
        return question
      }
    }
    return question
  }

  // Fill-in-blank sanity: scientific notation coefficient must be in [1, 10)
  if (question.type === 'fill_in_blank') {
    const isSci = /notaci[oó]n\s+cient[ií]fica/i.test(text)
    const wantsCoeff = /coeficiente|mantisa/i.test(text)
    if (isSci && wantsCoeff) {
      const ans = parseDecimal(String(question.correctAnswer ?? ''))
      if (ans && (ans.abs().gte(10) || ans.isZero())) {
        console.warn(`[FE MathVerify] SANITY REJECT: coefficient=${ans} not in [1,10)`)
        return null
      }
    }
  }

  const computed = computeExpectedAnswer(text)
  if (computed === null) return question

  let finalAnswer = computed.value
  const decMatch = text.match(/redonde[ao].*?(\d+)\s*decimal/i)
  const requestedDecimals = decMatch ? parseInt(decMatch[1]) : null
  if (requestedDecimals !== null) {
    finalAnswer = finalAnswer.toDecimalPlaces(requestedDecimals)
  } else if (!finalAnswer.isInteger()) {
    finalAnswer = finalAnswer.toDecimalPlaces(2)
  }

  if (question.type === 'fill_in_blank') {
    const currentAnswer = parseDecimal(String(question.correctAnswer ?? ''))
    if (!currentAnswer) return question
    const tolerance = Decimal.max(finalAnswer.abs().times('0.001'), '0.01')
    if (currentAnswer.minus(finalAnswer).abs().gt(tolerance)) {
      console.warn(`[FE MathVerify] CORRECTED fill_in_blank: LLM="${question.correctAnswer}" → Correct="${finalAnswer}"`)
      return { ...question, correctAnswer: finalAnswer.toFixed(), explanation: `${computed.steps.join('. ')}. Resultado: ${finalAnswer}.` }
    }
  } else if (question.type === 'multiple_choice' && Array.isArray(question.options)) {
    const optionValues = question.options.map(opt => {
      const nums = opt.match(/[\d,]+\.?\d*/g)
      if (!nums) return null
      const parsed = nums.map((n: string) => parseDecimal(n)).filter(Boolean) as Decimal[]
      return parsed.length > 0 ? parsed.reduce((a, b) => a.abs().gt(b.abs()) ? a : b) : null
    })
    let closestIdx = -1
    let closestDiff = new Decimal(Infinity)
    for (let i = 0; i < optionValues.length; i++) {
      if (!optionValues[i]) continue
      const diff = optionValues[i]!.minus(finalAnswer).abs()
      if (diff.lt(closestDiff)) { closestDiff = diff; closestIdx = i }
    }
    const tolerance = Decimal.max(finalAnswer.abs().times('0.001'), '0.01')
    if (closestIdx >= 0 && closestDiff.lte(tolerance)) {
      if (closestIdx !== question.correctIndex) {
        console.warn(`[FE MathVerify] CORRECTED MC: index ${question.correctIndex}→${closestIdx} (computed=${finalAnswer})`)
        return { ...question, correctIndex: closestIdx, explanation: `${computed.steps.join('. ')}. Resultado: ${finalAnswer}.` }
      }
    } else {
      console.warn(`[FE MathVerify] REJECTED: No option ≈ computed=${finalAnswer}`)
      return null
    }
  }
  return question
}

// ─── Frontend digit-position problem solver ──────────────────────────────────

function feDigitPositionProblem(text: string): { value: Decimal; steps: string[] } | null {
  const positionMap: Record<string, number> = {
    'unidades': 0, 'unidad': 0, 'decenas': 1, 'decena': 1,
    'centenas': 2, 'centena': 2, 'miles': 3, 'mil': 3,
    'millares': 3, 'millar': 3, 'decenas de mil': 4,
    'decenas de millar': 4, 'centenas de mil': 5,
    'centenas de millar': 5, 'millones': 6, 'millon': 6,
    'millón': 6, 'unidades de millón': 6, 'unidades de millon': 6,
    'decenas de millón': 7, 'decenas de millon': 7,
    'centenas de millón': 8, 'centenas de millon': 8,
    'miles de millón': 9, 'miles de millon': 9,
  }

  const lower = text.toLowerCase()
    .replace(/í/g, 'i').replace(/ó/g, 'o')
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/ú/g, 'u')
  let position = -1
  let posName = ''

  const sortedKeys = Object.keys(positionMap).sort((a, b) => b.length - a.length)
  for (const key of sortedKeys) {
    const normalized = key.replace(/í/g, 'i').replace(/ó/g, 'o')
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/ú/g, 'u')
    if (lower.includes(normalized)) {
      position = positionMap[key]
      posName = key
      break
    }
  }

  if (position < 0) {
    // Try 10^N with unicode superscripts
    const powMatch = text.match(/10[\u2070\xb9\xb2\xb3\u2074\u2075\u2076\u2077\u2078\u2079]+/)
    if (powMatch) {
      const scMap: Record<string, number> = {
        '\u2070': 0, '\xb9': 1, '\xb2': 2, '\xb3': 3, '\u2074': 4,
        '\u2075': 5, '\u2076': 6, '\u2077': 7, '\u2078': 8, '\u2079': 9,
      }
      let exp = 0
      for (let ci = 2; ci < powMatch[0].length; ci++) {
        const d = scMap[powMatch[0][ci]]
        if (d !== undefined) exp = exp * 10 + d
      }
      position = exp
      posName = `posición 10^${exp}`
    }
  }

  if (position < 0) return null

  // Compute base number
  const cleaned = text.replace(/[$€¥£₡₿]\s*/g, '')
  const allNums: Decimal[] = []
  const numRe = /\d[\d,]*\.?\d*/g
  let nm
  while ((nm = numRe.exec(cleaned)) !== null) {
    const p = parseDecimal(nm[0])
    if (p) allNums.push(p)
  }

  const steps: string[] = []
  let baseNumber: Decimal | null = null

  // Try explicit arithmetic first
  const exprResult = computeExpectedAnswer(text)
  if (exprResult) {
    baseNumber = exprResult.value
    steps.push(...exprResult.steps)
  }

  // Otherwise, sum significant numbers
  if (!baseNumber && allNums.length >= 2) {
    const dataNums = allNums.filter(n => n.abs().gte(10))
    if (dataNums.length >= 2) {
      baseNumber = dataNums.reduce((a, b) => a.plus(b), new Decimal(0))
      steps.push(`Suma: ${dataNums.join(' + ')} = ${baseNumber}`)
    }
  }

  if (!baseNumber && allNums.length === 1 && allNums[0].abs().gte(10)) {
    baseNumber = allNums[0]
    steps.push(`Número base: ${baseNumber}`)
  }

  if (!baseNumber) return null

  const integerPart = baseNumber.abs().floor()
  const intStr = integerPart.toFixed(0)
  const digitIndex = intStr.length - 1 - position
  const digit = digitIndex < 0 ? 0 : parseInt(intStr[digitIndex], 10)

  steps.push(`Número resultado: ${baseNumber.toFixed(baseNumber.dp() || 0)}`)
  steps.push(`Parte entera: ${intStr}`)
  steps.push(`Posición ${posName} (10^${position}): dígito = ${digit}`)

  return { value: new Decimal(digit), steps }
}

function computeExpectedAnswer(text: string): { value: Decimal; steps: string[] } | null {
  const cleaned = text.replace(/[$€¥£₡₿]\s*/g, '')

  // Strategy 1: Explicit inline arithmetic with follow-up operations
  const numberPat = '\\d[\\d,]*\\.?\\d*'
  const opPat = '[+\\-×*÷/]'
  const exprRegex = new RegExp(`(${numberPat})\\s*(${opPat})\\s*(${numberPat}(?:\\s*${opPat}\\s*${numberPat})*)`, 'g')
  const exprMatch = exprRegex.exec(cleaned)
  if (exprMatch) {
    const tokens = exprMatch[0].split(/\s*([+\-×*÷/])\s*/).filter((t: string) => t.trim())
    let result = parseDecimal(tokens[0])
    if (result) {
      const steps: string[] = []
      let valid = true
      const exprNumbers: Decimal[] = []
      for (let i = 0; i < tokens.length; i += 2) {
        const nd = parseDecimal(tokens[i])
        if (nd) exprNumbers.push(nd)
      }
      for (let i = 1; i < tokens.length; i += 2) {
        const op = tokens[i]
        const num = parseDecimal(tokens[i + 1] || '')
        if (!num) { valid = false; break }
        const prev = result!
        switch (op) {
          case '+': result = result!.plus(num); break
          case '-': result = result!.minus(num); break
          case '×': case '*': result = result!.times(num); break
          case '÷': case '/': if (num.isZero()) { valid = false } else { result = result!.div(num) }; break
          default: valid = false
        }
        if (!valid) break
        steps.push(`${prev} ${op} ${num} = ${result}`)
      }
      if (valid && steps.length > 0) {
        const after = cleaned.substring(cleaned.indexOf(exprMatch[0]) + exprMatch[0].length)

        // Follow-up: "resta la suma de los primeros N números"
        const restaSumaRe = /resta[rn]?\s+(?:la\s+)?suma\s+de\s+los\s+primeros?\s+(\d+|un[oa]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s+n[uú]meros?/i
        const restaSumaM = restaSumaRe.exec(after)
        if (restaSumaM && exprNumbers.length >= 2) {
          const wtn: Record<string, number> = { 'un': 1, 'uno': 1, 'una': 1, 'dos': 2, 'tres': 3,
            'cuatro': 4, 'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10 }
          const cap = restaSumaM[1].toLowerCase()
          const nRestar = wtn[cap] || parseInt(cap, 10)
          if (nRestar > 0 && nRestar < exprNumbers.length) {
            let partSum = new Decimal(0)
            for (let pi = 0; pi < nRestar; pi++) partSum = partSum.plus(exprNumbers[pi])
            const prev = result!
            result = result!.minus(partSum)
            steps.push(`Resta suma de primeros ${nRestar}: ${prev} - ${partSum} = ${result}`)
          }
        }

        // Follow-up: percentage/tax/discount
        const pctM = after.match(/(?:impuesto|descuento|incremento|aumento|IVA)\s+(?:del?)?\s*([\d,.]+)\s*%/i)
        if (pctM) {
          const pct = parseDecimal(pctM[1])
          if (pct && pct.gt(0)) {
            const prev = result!
            const factor = /descuento/i.test(pctM[0])
              ? new Decimal(1).minus(pct.div(100))
              : new Decimal(1).plus(pct.div(100))
            result = result!.times(factor)
            steps.push(`${prev} × ${factor} = ${result}`)
          }
        }

        // Follow-up: general subtraction "se le resta N"
        const subM = after.match(/(?:se\s+(?:le\s+)?)?(?:resta[rn]?|quit[ao]?[rn]?|descuent[ao]?[rn]?)\s+(?:(?:un|una|el|la)\s+)?(?:\w+\s+){0,5}?\$?\s*([\d,]+\.?\d*)/i)
        if (subM && !restaSumaM) {
          const subVal = parseDecimal(subM[1])
          if (subVal && subVal.gt(0) && !exprNumbers.some(n => n.equals(subVal))) {
            const prev = result!
            result = result!.minus(subVal)
            steps.push(`Sustracción: ${prev} - ${subVal} = ${result}`)
          }
        }

        // Follow-up: general addition "se le agrega/añade/suma N"
        const addFollowM = after.match(/(?:se\s+(?:le\s+)?)?(?:agrega[rn]?|añad[aeir]+|suma[rn]?|adiciona[rn]?)\s+(?:(?:un|una|el|la)\s+)?(?:\w+\s+){0,5}?\$?\s*([\d,]+\.?\d*)/i)
        if (addFollowM) {
          const addVal = parseDecimal(addFollowM[1])
          if (addVal && addVal.gt(0) && !exprNumbers.some(n => n.equals(addVal))) {
            const prev = result!
            result = result!.plus(addVal)
            steps.push(`Adición: ${prev} + ${addVal} = ${result}`)
          }
        }

        return { value: result!, steps }
      }
    }
  }

  // Strategy 2: Series summation (arithmetic / geometric / combined)
  const seriesResult = feSeriesSummation(text)
  if (seriesResult) return seriesResult

  // Strategy 3: Scientific notation sum
  const sciResult = feScientificNotationSum(text)
  if (sciResult) return sciResult

  // Strategy 4: Derivative extrema (polynomial f(x))
  const derivResult = feDerivativeExtrema(text)
  if (derivResult) return derivResult

  // Strategy 5: Word problem — sum data numbers + rate/percentage
  const lower = text.toLowerCase()
  if (/total|suma|calcula|acumulad|promedio|media|¿cuánto|cuántos|monto|resultado|costo|precio|valor/i.test(lower)) {
    const pctSet = new Set<string>()
    const pctRe = /([\d,.]+)\s*%/g
    let pm
    while ((pm = pctRe.exec(text)) !== null) {
      const d = parseDecimal(pm[1])
      if (d) pctSet.add(d.toString())
    }
    const allMatches = cleaned.match(/\d[\d,]*\.?\d*/g) || []
    const dataNumbers: Decimal[] = []
    for (const raw of allMatches) {
      const num = parseDecimal(raw)
      if (!num || num.lt(10)) continue
      if (pctSet.has(num.toString())) continue
      const n = num.toNumber()
      if (n >= 1900 && n <= 2100 && num.isInteger()) continue
      dataNumbers.push(num)
    }
    if (dataNumbers.length >= 2) {
      const steps: string[] = []
      let result: Decimal
      if (/promedio|media\b/i.test(lower)) {
        const sum = dataNumbers.reduce((a, b) => a.plus(b), new Decimal(0))
        result = sum.div(dataNumbers.length)
        steps.push(`Suma: ${dataNumbers.join(' + ')} = ${sum}`)
        steps.push(`Promedio: ${sum} / ${dataNumbers.length} = ${result}`)
      } else {
        result = dataNumbers.reduce((a, b) => a.plus(b), new Decimal(0))
        steps.push(`Suma: ${dataNumbers.join(' + ')} = ${result}`)
      }
      // Percentage
      if (pctSet.size > 0) {
        const pct = parseDecimal([...pctSet][0])
        if (pct && pct.gt(0) && pct.lte(200)) {
          const prev = result
          if (/descuento/i.test(lower)) {
            const factor = new Decimal(1).minus(pct.div(100))
            result = result.times(factor)
            steps.push(`Descuento ${pct}%: ${prev} × ${factor} = ${result}`)
          } else if (/impuesto|iva|incremento|aumento|interés|recargo/i.test(lower)) {
            const factor = new Decimal(1).plus(pct.div(100))
            result = result.times(factor)
            steps.push(`+ ${pct}%: ${prev} × ${factor} = ${result}`)
          }
        }
      }
      // Rate/cost multiplier
      const rateM = text.match(/(?:multiplic[aá]r?|×)\s*(?:por)?\s*\$?([\d,.]+)/i)
        || text.match(/(?:tasa|tarifa|factor|coeficiente)\s+(?:de\s+)?(?:[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]+\s+)*(?:del?\s+)?\$?([\d,.]+)(?!\s*%)/i)
        || text.match(/(?:se\s+)?aplic[aá]\s+(?:un\s+)?(?:[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]+\s+)*(?:del?\s+)?\$?([\d,.]+)(?!\s*%)/i)
        || text.match(/(?:costo|precio)\s+(?:de\s+(?:[a-zA-ZáéíóúñÁÉÍÓÚÑüÜ]+\s+)*)?(?:de\s*)?\$?([\d,.]+)/i)
      if (rateM) {
        const rate = parseDecimal(rateM[1])
        if (rate && rate.gt(0) && rate.lt(result)) {
          const prev = result
          result = result.times(rate)
          steps.push(`Multiplicación: ${prev} × ${rate} = ${result}`)
        }
      }
      // Post-operation addition
      const addM = text.match(/(?:se\s+)?(?:agrega[rn]?|añad[aeir]+|suma[rn]?|adiciona[rn]?|incorpora[rn]?)\s+(?:\S+\s+){0,8}?([\d,]+\.?\d*)/i)
      if (addM) {
        const addVal = parseDecimal(addM[1])
        if (addVal && addVal.gt(0) && !dataNumbers.some(d => d.equals(addVal))) {
          const prev = result
          result = result.plus(addVal)
          steps.push(`Adición: ${prev} + ${addVal} = ${result}`)
        }
      }
      if (steps.length > 0) return { value: result, steps }
    }
  }
  return null
}

// ─── Frontend series summation ───────────────────────────────────────────────

function feSeriesSummation(text: string): { value: Decimal; steps: string[] } | null {
  // Orden pedagógico (alineado con QuizMathValidator._tryCombinedFormula):
  //   1. Sumatoria polinomial (mayor prioridad)
  //   2. Serie aritmética S  (sigma + keywords)
  //   3. Serie geométrica G  (sigma + keywords)
  //   4. Resultado combinado  S + G

  const results: { value: Decimal; steps: string[] }[] = []

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 1: Sumatoria polinomial — Σ_{i=1}^{n} (ai² + bi + c)
  // ═══════════════════════════════════════════════════════════════════════════
  let polyMatched = false
  const sigmPolyRe = /[Σ∑]\s*\(?(?:de\s+)?i\s*=\s*(\d+)\s+a\s+(\d+)\)?\s*(?:de\s+)?\(([^)]+)\)/i
  const sigmPolyRe2 = /[Σ∑]\s*_?\{?\s*[ij]\s*=\s*(\d+)\s*\}?\s*\^?\{?\s*(\d+)\s*\}?\s*\(([^)]+)\)/i
  const polyM = sigmPolyRe.exec(text) || sigmPolyRe2.exec(text)
  if (polyM) {
    const start = parseInt(polyM[1], 10)
    const end = parseInt(polyM[2], 10)
    if (end >= start && end - start <= 100000) {
      const coeffs = feParsePolyCoeffs(polyM[3])
      if (coeffs) {
        polyMatched = true
        const n = new Decimal(end)
        let sum = new Decimal(0)
        const sumSteps: string[] = [`Sumatoria(i=${start} a ${end}) de (${polyM[3]})`]
        if (!coeffs.a3.isZero()) {
          const s3 = n.times(n.plus(1)).div(2).pow(2)
          sum = sum.plus(coeffs.a3.times(s3))
        }
        if (!coeffs.a2.isZero()) {
          const s2 = n.times(n.plus(1)).times(n.times(2).plus(1)).div(6)
          sum = sum.plus(coeffs.a2.times(s2))
        }
        if (!coeffs.a1.isZero()) {
          const s1 = n.times(n.plus(1)).div(2)
          sum = sum.plus(coeffs.a1.times(s1))
        }
        if (!coeffs.a0.isZero()) {
          sum = sum.plus(coeffs.a0.times(n))
        }
        sumSteps.push(`Resultado: ${sum}`)
        results.push({ value: sum, steps: sumSteps })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 2: Resolver la serie aritmética S
  //   — Usar fórmula de suma aritmética: S = (a₁ + aₙ)·n/2
  //   — Calcular S numéricamente
  // ═══════════════════════════════════════════════════════════════════════════
  if (!polyMatched) {
    // 2a) Sigma notation: Σ_{i=1}^{200} (7i - 12)
    const sigmaLinRe = /[Σ∑]\s*_?\{?\s*[ij]\s*=\s*(\d+)\s*\}?\s*\^?\{?\s*(\d+)\s*\}?\s*\(?(\d+\.?\d*)\s*[ij]\s*([+-]\s*\d+\.?\d*)?\)?/i
    const sigmaLinM = sigmaLinRe.exec(text)
    if (sigmaLinM) {
      const start = parseInt(sigmaLinM[1], 10)
      const end = parseInt(sigmaLinM[2], 10)
      const slope = parseDecimal(sigmaLinM[3])
      const intercept = sigmaLinM[4] ? parseDecimal(sigmaLinM[4].replace(/\s/g, '')) : new Decimal(0)
      if (slope && intercept !== null && end >= start && end - start <= 100000) {
        const n = end - start + 1
        const a1 = slope.times(start).plus(intercept!)
        const an = slope.times(end).plus(intercept!)
        const sum = a1.plus(an).times(n).div(2)
        results.push({
          value: sum,
          steps: [`🔢 Serie aritmética sigma: a₁=${a1}, d=${slope}, n=${n}`, `aₙ = ${an}`, `S = (a₁+aₙ)·n/2 = (${a1}+${an})·${n}/2 = ${sum}`]
        })
      }
    }

    // 2b) Sequence keywords: "serie aritmética ... primeros N términos ... a, b, c"
    if (!sigmaLinM) {
      const arithSeqRe = /(?:serie\s+aritm[eé]trica|progresión\s+aritm[eé]trica)[\s\S]*?(?:primeros?\s+)?(\d+)\s+t[eé]rminos?[\s\S]*?(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/i
      const arithM = arithSeqRe.exec(text)
      if (arithM) {
        const n = parseInt(arithM[1], 10)
        const a1 = new Decimal(arithM[2])
        const second = new Decimal(arithM[3])
        const third = new Decimal(arithM[4])
        const d1 = second.minus(a1)
        const d2 = third.minus(second)
        if (d1.equals(d2) && n >= 1 && n <= 100000) {
          const an = a1.plus(d1.times(n - 1))
          const sum = a1.plus(an).times(n).div(2)
          results.push({
            value: sum,
            steps: [`🔢 Serie aritmética: a₁=${a1}, d=${d1}, n=${n}`, `aₙ = a₁ + (n-1)·d = ${an}`, `S = (a₁+aₙ)·n/2 = (${a1}+${an})·${n}/2 = ${sum}`]
          })
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 3: Resolver la serie geométrica G
  //   — Usar fórmula de suma geométrica: G = a₁·(rⁿ - 1)/(r - 1)
  //   — Calcular rⁿ
  //   — Sustituir y obtener G
  // ═══════════════════════════════════════════════════════════════════════════

  // 3a) Sigma notation: Σ_{j=1}^{25} 4·(3.2)^{j-1}
  const sigmaGeoRe = /[Σ∑]\s*_?\{?\s*[ij]\s*=\s*\d+\s*\}?\s*\^?\{?\s*(\d+)\s*\}?\s*(\d+\.?\d*)\s*[·*×]\s*\(?(\d+\.?\d*)\)?\s*\^\s*\{?\s*(?:\(\s*)?[ij]\s*(?:-\s*1\s*(?:\))?\s*)?\}?/i
  const sigmaGeoM = sigmaGeoRe.exec(text)
  if (sigmaGeoM) {
    const n = parseInt(sigmaGeoM[1], 10)
    const a1 = new Decimal(sigmaGeoM[2])
    const r = new Decimal(sigmaGeoM[3])
    if (a1.gt(0) && !r.equals(1) && n >= 1 && n <= 10000) {
      const rN = r.pow(n)
      const sum = a1.times(rN.minus(1)).div(r.minus(1))
      results.push({
        value: sum,
        steps: [`📈 Serie geométrica sigma: a₁=${a1}, r=${r}, n=${n}`, `rⁿ = ${r}^${n} = ${rN.toExponential(4)}`, `G = a₁·(rⁿ-1)/(r-1) = ${a1}·(${rN.toExponential(4)}-1)/(${r}-1) = ${sum.toExponential(4)}`]
      })
    }
  }

  // 3b) Sequence keywords: "serie geométrica ... primeros N términos ... a, b, c"
  if (!sigmaGeoM) {
    const geoSeqRe = /(?:serie\s+geom[eé]trica|progresión\s+geom[eé]trica|geom[eé]tric)[\s\S]*?(?:primeros?\s+)?(\d+)\s+t[eé]rminos?[\s\S]*?(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)/i
    const geoM = geoSeqRe.exec(text)
    if (geoM) {
      const n = parseInt(geoM[1], 10)
      const a1 = new Decimal(geoM[2])
      const second = new Decimal(geoM[3])
      const third = new Decimal(geoM[4])
      if (!a1.isZero() && !second.isZero()) {
        const r = second.div(a1)
        const r2 = third.div(second)
        if (r.equals(r2) && !r.equals(1) && n >= 1 && n <= 10000) {
          const rN = r.pow(n)
          const sum = a1.times(rN.minus(1)).div(r.minus(1))
          results.push({
            value: sum,
            steps: [`📈 Serie geométrica: a₁=${a1}, r=${r}, n=${n}`, `rⁿ = ${r}^${n} = ${rN.toExponential(4)}`, `G = a₁·(rⁿ-1)/(r-1) = ${a1}·(${rN.toExponential(4)}-1)/(${r}-1) = ${sum.toExponential(4)}`]
          })
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PASO 4: Resultado final — Sumar S + G, redondear si se solicita
  // ═══════════════════════════════════════════════════════════════════════════
  if (results.length >= 2) {
    let total = results[0].value
    const allSteps = results.flatMap(r => r.steps)
    for (let i = 1; i < results.length; i++) total = total.plus(results[i].value)
    allSteps.push(`➕ Resultado final: ${results.map(r => r.value.toExponential(4)).join(' + ')} = ${total.toExponential(4)}`)

    if (/redonde[ao]\s+.*?entero/i.test(text)) {
      total = total.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      allSteps.push(`Redondeado al entero: ${total}`)
    }
    return { value: total, steps: allSteps }
  }

  if (results.length === 1) {
    let val = results[0].value
    if (/redonde[ao]\s+.*?entero/i.test(text)) {
      val = val.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      results[0].steps.push(`Redondeado al entero: ${val}`)
    }
    return { value: val, steps: results[0].steps }
  }

  return null
}

function feParsePolyCoeffs(expr: string): { a3: Decimal; a2: Decimal; a1: Decimal; a0: Decimal } | null {
  let s = expr.trim().replace(/i³/g, 'i^3').replace(/i²/g, 'i^2').replace(/\s+/g, ' ')
  if (/^[\di]/.test(s)) s = '+' + s
  const result = { a3: new Decimal(0), a2: new Decimal(0), a1: new Decimal(0), a0: new Decimal(0) }
  const termRe = /([+-])\s*(\d*\.?\d*)\s*i\s*\^\s*(\d+)|([+-])\s*(\d*\.?\d*)\s*i(?!\s*\^)|([+-])\s*(\d+\.?\d*)/g
  let m: RegExpExecArray | null
  let matched = false
  while ((m = termRe.exec(s)) !== null) {
    matched = true
    if (m[1] !== undefined && m[3] !== undefined) {
      const sign = m[1] === '-' ? -1 : 1
      const coeff = (m[2] === '' || m[2] === undefined) ? 1 : parseFloat(m[2])
      const power = parseInt(m[3], 10)
      if (power <= 3) (result as any)['a' + power] = new Decimal(sign * coeff)
    } else if (m[4] !== undefined) {
      const sign = m[4] === '-' ? -1 : 1
      const coeff = (m[5] === '' || m[5] === undefined) ? 1 : parseFloat(m[5])
      result.a1 = new Decimal(sign * coeff)
    } else if (m[6] !== undefined) {
      const sign = m[6] === '-' ? -1 : 1
      result.a0 = new Decimal(sign * parseFloat(m[7]))
    }
  }
  return matched ? result : null
}

// ─── Frontend scientific notation sum ────────────────────────────────────────

function feScientificNotationSum(text: string): { value: Decimal; steps: string[] } | null {
  if (!/notaci[oó]n\s+cient[ií]fica|[eE]\d+|10\s*\^/i.test(text)) return null

  const numbers: Decimal[] = []
  const steps: string[] = []

  // Match: 5.678912e8
  const sciRe1 = /(\d+\.?\d*)\s*[eE]\s*(\d+)/g
  let m: RegExpExecArray | null
  while ((m = sciRe1.exec(text)) !== null) {
    numbers.push(new Decimal(m[1]).times(new Decimal(10).pow(parseInt(m[2], 10))))
  }
  // Match: 5.678912 × 10^8
  const sciRe2 = /(\d+\.?\d*)\s*[×x]\s*10\s*\^\s*(\d+)/gi
  while ((m = sciRe2.exec(text)) !== null) {
    const val = new Decimal(m[1]).times(new Decimal(10).pow(parseInt(m[2], 10)))
    if (!numbers.some(n => n.equals(val))) numbers.push(val)
  }

  if (numbers.length < 2) return null

  let sum = new Decimal(0)
  for (let i = 0; i < numbers.length; i++) {
    sum = sum.plus(numbers[i])
    steps.push(`Número ${i + 1}: ${numbers[i].toExponential(6)}`)
  }
  steps.push(`Suma: ${sum.toExponential(6)}`)

  // Check for coefficient request
  if (/coeficiente|mantisa/i.test(text)) {
    const sumStr = sum.toExponential()
    const mantissa = parseDecimal(sumStr.split('e')[0])
    if (mantissa) {
      const sfMatch = text.match(/(\d+)\s*(?:cifras?\s+significativas?|dígitos?\s+significativos?)/i)
      let result = mantissa
      if (sfMatch) {
        result = new Decimal(mantissa.toPrecision(parseInt(sfMatch[1], 10)))
        steps.push(`Coeficiente redondeado a ${sfMatch[1]} cifras: ${result}`)
      } else {
        steps.push(`Coeficiente: ${result}`)
      }
      return { value: result, steps }
    }
  }

  if (/redonde[ao]\s+.*?entero/i.test(text)) {
    sum = sum.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    steps.push(`Redondeado: ${sum}`)
  }

  return { value: sum, steps }
}

// ─── Frontend derivative extrema ────────────────────────────────────────────

function feDerivativeExtrema(text: string): { value: Decimal; steps: string[] } | null {
  if (!/derivada|extremo|mínimo\s+local|máximo\s+local|punto\s+crítico/i.test(text)) return null

  const fxMatch = text.match(/f\s*\(\s*x\s*\)\s*=\s*([^.]+?)(?:\.\s|$)/i)
  if (!fxMatch) return null

  // Normalize unicode superscripts
  let polyText = fxMatch[1].trim()
    .replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2')
    .replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6').replace(/⁷/g, '^7').replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9').replace(/−/g, '-').replace(/–/g, '-')

  if (!/^[+-]/.test(polyText)) polyText = '+' + polyText
  const coeffs: Record<number, Decimal> = {}
  const terms = polyText.match(/[+-][^+-]+/g)
  if (!terms) return null

  for (const term of terms) {
    const t = term.trim()
    let m = t.match(/^([+-]?\s*\d*\.?\d*)\s*x\s*\^\s*(\d+)$/)
    if (m) {
      let c = m[1].replace(/\s/g, '')
      if (c === '+' || c === '') c = '1'
      if (c === '-') c = '-1'
      coeffs[parseInt(m[2], 10)] = new Decimal(c)
      continue
    }
    m = t.match(/^([+-]?\s*\d*\.?\d*)\s*x\s*$/)
    if (m) {
      let c = m[1].replace(/\s/g, '')
      if (c === '+' || c === '') c = '1'
      if (c === '-') c = '-1'
      coeffs[1] = new Decimal(c)
      continue
    }
    m = t.match(/^([+-]?\s*\d+\.?\d*)\s*$/)
    if (m) {
      coeffs[0] = new Decimal(m[1].replace(/\s/g, ''))
    }
  }

  const maxPow = Math.max(...Object.keys(coeffs).map(Number))
  if (maxPow < 2 || maxPow > 6) return null

  // Compute derivative
  const deriv: Record<number, Decimal> = {}
  for (const [p, c] of Object.entries(coeffs)) {
    const pi = parseInt(p, 10)
    if (pi === 0) continue
    deriv[pi - 1] = c.times(pi)
  }

  const steps: string[] = [`f(x) = ${fxMatch[1].trim()}`]
  const derivTerms = Object.entries(deriv).sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
    .map(([p, c]) => `${c}x^${p}`).join(' + ')
  steps.push(`f'(x) = ${derivTerms}`)

  // Find roots of derivative
  const derivMax = Math.max(...Object.keys(deriv).map(Number))
  let roots: Decimal[] = []

  if (derivMax === 1) {
    // Linear: ax + b = 0
    const a = deriv[1] || new Decimal(0)
    const b = deriv[0] || new Decimal(0)
    if (!a.isZero()) roots = [b.neg().div(a)]
  } else if (derivMax === 2) {
    // Quadratic: ax² + bx + c = 0
    const a = deriv[2] || new Decimal(0)
    const b = deriv[1] || new Decimal(0)
    const c = deriv[0] || new Decimal(0)
    const disc = b.times(b).minus(a.times(c).times(4))
    if (disc.gte(0)) {
      const sqrtD = disc.sqrt()
      roots.push(b.neg().plus(sqrtD).div(a.times(2)))
      if (disc.gt(0)) roots.push(b.neg().minus(sqrtD).div(a.times(2)))
    }
  } else {
    // Higher degree: try integer roots [-50, 50]
    for (let x = -50; x <= 50; x++) {
      const dx = new Decimal(x)
      let val = new Decimal(0)
      for (const [p, c] of Object.entries(deriv)) {
        val = val.plus(c.times(dx.pow(parseInt(p, 10))))
      }
      if (val.abs().lt('0.0001')) roots.push(dx)
    }
  }

  if (roots.length === 0) return null
  steps.push(`Raíces de f'(x): ${roots.join(', ')}`)

  // Classify using second derivative
  const deriv2: Record<number, Decimal> = {}
  for (const [p, c] of Object.entries(deriv)) {
    const pi = parseInt(p, 10)
    if (pi === 0) continue
    deriv2[pi - 1] = c.times(pi)
  }

  const minima: { x: Decimal; y: Decimal }[] = []
  const maxima: { x: Decimal; y: Decimal }[] = []

  for (const root of roots) {
    let d2val = new Decimal(0)
    for (const [p, c] of Object.entries(deriv2)) {
      d2val = d2val.plus(c.times(root.pow(parseInt(p, 10))))
    }
    let fval = new Decimal(0)
    for (const [p, c] of Object.entries(coeffs)) {
      fval = fval.plus(c.times(root.pow(parseInt(p, 10))))
    }
    if (d2val.gt(0)) {
      minima.push({ x: root, y: fval })
      steps.push(`f''(${root}) = ${d2val} > 0 → mínimo local en x=${root}`)
    } else if (d2val.lt(0)) {
      maxima.push({ x: root, y: fval })
      steps.push(`f''(${root}) = ${d2val} < 0 → máximo local en x=${root}`)
    } else {
      // f''=0: check higher derivatives or leading coefficient
      const leadCoeff = coeffs[maxPow] || new Decimal(0)
      if (maxPow % 2 === 0 && leadCoeff.gt(0)) {
        minima.push({ x: root, y: fval })
        steps.push(`f''(${root})=0, pero grado par con coef. positivo → mínimo en x=${root}`)
      } else if (maxPow % 2 === 0 && leadCoeff.lt(0)) {
        maxima.push({ x: root, y: fval })
        steps.push(`f''(${root})=0, grado par con coef. negativo → máximo en x=${root}`)
      }
    }
  }

  const lower = text.toLowerCase()
  const wantsMin = /mínimo|mín(?:imo)?\s+local/i.test(lower)
  const wantsMax = /máximo|máx(?:imo)?\s+local/i.test(lower) && !wantsMin
  const wantsX = /valor\s+de\s+x|cuál\s+es\s+(?:el\s+)?(?:valor|x)/i.test(lower)

  let result: Decimal | null = null
  if (wantsMin && minima.length > 0) {
    const target = minima.find(p => p.x.isInteger()) || minima[0]
    result = wantsX ? target.x : target.y
    steps.push(`Respuesta (x del mínimo): ${target.x}`)
  } else if (wantsMax && maxima.length > 0) {
    const target = maxima.find(p => p.x.isInteger()) || maxima[0]
    result = wantsX ? target.x : target.y
    steps.push(`Respuesta (x del máximo): ${target.x}`)
  } else if (minima.length > 0 || maxima.length > 0) {
    const all = [...minima, ...maxima]
    result = all[0].x
    steps.push(`Punto crítico: x = ${result}`)
  }

  return result ? { value: result, steps } : null
}

function normalizeQuestionForDisplay(question: QuizQuestion): QuizQuestion {
  // First: verify math consistency — fix or reject wrong math answers
  const verified = verifyMathConsistency(question)
  if (!verified) return { ...question, _rejected: true } as QuizQuestion & { _rejected?: boolean }

  if (verified.type === 'multiple_choice' && Array.isArray(verified.options) && verified.options.length >= 2) {
    // Validate that all options are distinct; if not, keep the question but log
    const uniqueOpts = new Set(verified.options.map(o => o.toLowerCase().trim()))
    if (uniqueOpts.size < verified.options.length) {
      // Deduplicate options by removing duplicates and regenerating distractors
      const correctOpt = verified.options[verified.correctIndex]
      const correctNum = Number(correctOpt?.replace(/[^0-9.\-]/g, '') ?? '')
      if (Number.isFinite(correctNum)) {
        // Generate new unique distractors based on plausible errors
        const distractors = generatePlausibleDistractors(correctNum)
        return shuffleMultipleChoiceQuestion({
          ...verified,
          options: [formatMathOption(correctNum), ...distractors.map(formatMathOption)],
          correctIndex: 0,
        })
      }
    }
    return shuffleMultipleChoiceQuestion(verified)
  }

  if (verified.type !== 'fill_in_blank' || !shouldConvertMathFillQuestion(verified.question, verified.correctAnswer)) {
    return verified
  }

  const numericAnswer = Number(String(verified.correctAnswer ?? '').trim().replace(/,/g, ''))
  if (!Number.isFinite(numericAnswer)) return verified

  const distractors = generatePlausibleDistractors(numericAnswer)
  return shuffleMultipleChoiceQuestion({
    ...verified,
    type: 'multiple_choice',
    options: [
      formatMathOption(numericAnswer),
      ...distractors.map(formatMathOption),
    ],
    correctIndex: 0,
  })
}

/**
 * Generate 3 plausible wrong answers for a numeric correct answer.
 * Each represents a different type of common mistake.
 */
function generatePlausibleDistractors(correct: number): [number, number, number] {
  const abs = Math.abs(correct)
  const used = new Set<number>([correct])

  function addUnique(val: number): number {
    // Ensure the distractor is different from correct and other distractors
    let v = Math.round(val * 100) / 100 // keep max 2 decimals
    if (v === correct) v = correct + (abs >= 100 ? 10 : 1)
    while (used.has(v)) v += (abs >= 100 ? 1 : 0.1)
    v = Math.round(v * 100) / 100
    used.add(v)
    return v
  }

  let d1: number, d2: number, d3: number

  if (Number.isInteger(correct) && abs >= 100) {
    // Integer math: simulate carry errors, off-by-ten, off-by-one
    d1 = addUnique(correct + 10)   // off-by-one-carry (forgot to carry)
    d2 = addUnique(correct - 10)   // subtracted instead of adding carry
    d3 = addUnique(correct + 100)  // carried one extra digit
  } else if (Number.isInteger(correct) && abs >= 10) {
    d1 = addUnique(correct + 1)
    d2 = addUnique(correct - 1)
    d3 = addUnique(correct + 10)
  } else if (Number.isInteger(correct)) {
    d1 = addUnique(correct + 1)
    d2 = addUnique(correct - 1)
    d3 = addUnique(correct + 2)
  } else {
    // Decimal answers: simulate rounding errors
    const step = abs >= 100 ? 1 : abs >= 10 ? 0.5 : 0.1
    d1 = addUnique(Math.ceil(correct * 10) / 10)     // rounded up
    d2 = addUnique(Math.floor(correct * 10) / 10)    // rounded down
    d3 = addUnique(correct + step)
  }

  return [d1, d2, d3]
}

// ─── Confetti ───────────────────────────────────────────────────────────────────
const SYMS = ['⭐', '✨', '🌟', '💫', '🎊', '🎉']
const confetti = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  sym: SYMS[i % SYMS.length],
  style: {
    left:              `${(5 + Math.random() * 90).toFixed(1)}%`,
    top:               `${(Math.random() * 85).toFixed(1)}%`,
    animationDelay:    `${(Math.random() * 1.8).toFixed(2)}s`,
    fontSize:          `${Math.round(14 + Math.random() * 22)}px`,
    animationDuration: `${(1.2 + Math.random() * 0.8).toFixed(2)}s`,
  },
}))

// ─── Triqui (Tic-Tac-Toe) ──────────────────────────────────────────────────────
const WIN_LINES: [number, number, number][] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
]

const triquiBoard       = ref<Cell[]>(Array(9).fill(''))
const triquiWinner      = ref<WinnerType>(null)
const triquiIsDraw      = ref(false)
const triquiPlayerTurn  = ref(true)
const triquiWinLine     = ref<number[]>([])
const triquiScore       = ref({ player: 0, cpu: 0, draw: 0 })
let   triquiResetTimer: ReturnType<typeof setTimeout> | null = null

const triquiResultMsg = computed(() => {
  if (triquiWinner.value === 'player') return '¡Ganaste! 🎉'
  if (triquiWinner.value === 'cpu')    return 'Ganó la CPU 🤖'
  return '¡Empate! 🤝'
})

function findWinner(board: Cell[], sym: Cell): number[] | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] === sym && board[b] === sym && board[c] === sym) return [a, b, c]
  }
  return null
}

function triquiClick(i: number) {
  if (triquiBoard.value[i] || triquiWinner.value || triquiIsDraw.value || !triquiPlayerTurn.value) return
  const board = [...triquiBoard.value]
  board[i] = 'X'
  triquiBoard.value = board

  const wl = findWinner(board, 'X')
  if (wl) { triquiWinLine.value = wl; triquiWinner.value = 'player'; triquiScore.value.player++; scheduleReset(); return }

  const empty = board.reduce<number[]>((acc, c, idx) => (c === '' ? [...acc, idx] : acc), [])
  if (!empty.length) { triquiIsDraw.value = true; triquiScore.value.draw++; scheduleReset(); return }

  triquiPlayerTurn.value = false
  setTimeout(() => cpuMove(board), 700)
}

function cpuMove(board: Cell[]) {
  const empty = board.reduce<number[]>((acc, c, i) => (c === '' ? [...acc, i] : acc), [])
  if (!empty.length) return

  // Try to win → block → center → random
  let move = -1
  for (const idx of empty) {
    const t = [...board]; t[idx] = 'O'
    if (findWinner(t, 'O')) { move = idx; break }
  }
  if (move === -1) {
    for (const idx of empty) {
      const t = [...board]; t[idx] = 'X'
      if (findWinner(t, 'X')) { move = idx; break }
    }
  }
  if (move === -1 && board[4] === '') move = 4
  if (move === -1) move = empty[Math.floor(Math.random() * empty.length)]

  const nb = [...board]; nb[move] = 'O'
  triquiBoard.value = nb

  const wl = findWinner(nb, 'O')
  if (wl) { triquiWinLine.value = wl; triquiWinner.value = 'cpu'; triquiScore.value.cpu++; scheduleReset(); return }

  if (!nb.includes('')) { triquiIsDraw.value = true; triquiScore.value.draw++; scheduleReset(); return }

  triquiPlayerTurn.value = true
}

function scheduleReset() {
  triquiResetTimer = setTimeout(resetTriqui, 2200)
}

function resetTriqui() {
  triquiBoard.value     = Array(9).fill('')
  triquiWinner.value    = null
  triquiIsDraw.value    = false
  triquiPlayerTurn.value = true
  triquiWinLine.value   = []
}

function tcellClass(i: number) {
  return {
    'win-cell': triquiWinLine.value.includes(i),
    'x-cell':   triquiBoard.value[i] === 'X',
    'o-cell':   triquiBoard.value[i] === 'O',
  }
}

// ─── Option classes ─────────────────────────────────────────────────────────────
function optClass(i: number) {
  if (!answered.value) return {}
  return {
    correct: i === currentQ.value.correctIndex,
    wrong:   i === pickedIdx.value && i !== currentQ.value.correctIndex,
    dimmed:  i !== currentQ.value.correctIndex && i !== pickedIdx.value,
  }
}

function optLetterClass(i: number) {
  if (!answered.value) return {}
  return {
    'letter-correct': i === currentQ.value.correctIndex,
    'letter-wrong':   i === pickedIdx.value && i !== currentQ.value.correctIndex,
  }
}

// ─── Ordering helpers ────────────────────────────────────────────────────────────
function toggleOrderItem(i: number) {
  if (answered.value) return
  const idx = orderingUserSeq.value.indexOf(i)
  if (idx !== -1) {
    orderingUserSeq.value.splice(idx, 1)
  } else {
    orderingUserSeq.value.push(i)
  }
}

function checkOrdering() {
  if (answered.value) return
  const q = currentQ.value
  const correct = JSON.stringify(orderingUserSeq.value) === JSON.stringify(q.correctOrder ?? [])
  fillCorrect.value = correct
  if (correct) correctCount.value++
  answered.value = true
}

function orderingItemClass(i: number): Record<string, boolean> {
  const pos = orderingUserSeq.value.indexOf(i)
  if (!answered.value) {
    return { 'ordering-selected': pos !== -1 }
  }
  const correctSeq = currentQ.value.correctOrder ?? []
  const correctPos = correctSeq.indexOf(i)
  if (pos === -1) return { 'ordering-missing': true }
  return {
    'ordering-correct-item': pos === correctPos,
    'ordering-wrong-item':   pos !== correctPos,
  }
}

// ─── Actions ────────────────────────────────────────────────────────────────────
async function startQuiz() {
  if (!courseId.value) { showError('No se especificó un curso'); return }

  // Always reset previous questions to force fresh generation
  questions.value    = []
  currentIdx.value   = 0
  answered.value     = false
  pickedIdx.value    = -1
  correctCount.value = 0
  fillAnswer.value   = ''
  fillCorrect.value  = false

  phase.value = 'loading'
  loadingTimer = setInterval(() => loadingTick.value++, 2000)

  try {
    const userId = tokenStorage.userId
    const body: Record<string, unknown> = {
      courseId:     courseId.value,
      difficulty:   selectedDifficulty.value,
      targetCount:  10,
      forceFresh:   true,
    }
    if (topicId.value) body.topicId = topicId.value
    if (taskId.value)  body.taskId  = taskId.value
    if (userId)        body.userId  = userId

    // Kick off async generation — returns a jobId immediately (no long HTTP connection)
    type StartResp = { jobId: string }
    const startData = await api.post<StartResp>('/reinforcement/start-generation', body)
    let jobId = (startData as unknown as StartResp)?.jobId
    if (!jobId) throw new Error('No se pudo iniciar la generación. Intenta de nuevo.')

    // Poll until done or error. First-time ingestion can be slow, so keep the UI waiting much longer.
    const MAX_POLL_MS   = 110 * 60 * 1000
    const POLL_INTERVAL = 2500
    const pollStart     = Date.now()
    const MAX_GEN_RETRIES = 2
    let   genRetries = 0

    type PollResp = { status: 'pending' | 'done' | 'error'; questions?: QuizQuestion[]; error?: string }

    while (phase.value === 'loading') {
      if (Date.now() - pollStart > MAX_POLL_MS) {
        throw new Error('La generación tardó demasiado. Intenta de nuevo o vuelve a abrir la sesión de refuerzo.')
      }

      try {
        const s = await api.get<PollResp>(`/reinforcement/poll-generation/${jobId}`) as unknown as PollResp

        if (s?.status === 'done') {
          const raw: QuizQuestion[] = Array.isArray(s.questions) ? s.questions : []
          const qs = raw
            .filter(q => q.question)
            .map(normalizeQuestionForDisplay)
            .filter(q => !(q as QuizQuestion & { _rejected?: boolean })._rejected)

          // Backend returned empty questions (insufficient count) — retry generation
          if (!qs.length) {
            if (genRetries >= MAX_GEN_RETRIES) {
              throw new Error('No se pudieron generar suficientes preguntas tras varios intentos. Intenta de nuevo.')
            }
            genRetries++
            const retryData = await api.post<StartResp>('/reinforcement/start-generation', { ...body, forceFresh: true })
            const newJobId = (retryData as unknown as StartResp)?.jobId
            if (!newJobId) throw new Error('No se pudo reintentar la generación.')
            jobId = newJobId
            await wait(POLL_INTERVAL)
            continue
          }

          questions.value = qs
          quizStartTime   = Date.now()
          phase.value     = 'quiz'
          break
        }

        if (s?.status === 'error') {
          throw new Error(s.error || 'Error al generar preguntas')
        }
      } catch (e: unknown) {
        // Only abort the poll loop for terminal job conditions or auth that can't recover.
        // Network glitches, timeouts, and transient 5xx → continue polling.
        if (e instanceof Error) {
          const msg = e.message || ''
          // Terminal: explicit job-level errors
          if (/expir[aoó]|no existe|error al generar|generation failed|no se pudieron generar/i.test(msg)) {
            throw e
          }
          // Terminal: true auth failure (token refresh already attempted by httpClient)
          if (e instanceof HttpError && e.statusCode === 401) {
            throw e
          }
          // Non-terminal: swallow and keep polling
        }
      }

      await wait(POLL_INTERVAL)
    }
  } catch (e: unknown) {
    let msg = 'Error al generar preguntas'
    if (e instanceof Error) msg = e.message
    showError(msg)
    phase.value = 'start'
  } finally {
    if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null }
  }
}

function pick(i: number) {
  if (answered.value) return
  pickedIdx.value = i
  answered.value  = true
  if (i === currentQ.value.correctIndex) correctCount.value++
}

function checkFill() {
  if (answered.value || !fillAnswer.value.trim()) return
  const q = currentQ.value
  const expected = (q.correctAnswer ?? q.options?.[q.correctIndex] ?? '').trim()
  const given    = fillAnswer.value.trim()

  // Normalize both for comparison
  const normExpected = expected.toLowerCase()
  const normGiven    = given.toLowerCase()

  // 1. Exact match (case-insensitive)
  if (normGiven === normExpected) {
    fillCorrect.value = true
    correctCount.value++
    answered.value = true
    return
  }

  // 2. Numeric comparison: strip thousand separators and compare values
  const stripSeparators = (s: string) => s.replace(/[\s,._]/g, '').replace(/\u00a0/g, '')
  const numExpected = Number(stripSeparators(expected))
  const numGiven    = Number(stripSeparators(given))
  if (Number.isFinite(numExpected) && Number.isFinite(numGiven)) {
    // Allow tolerance for rounding: within 0.5% or absolute diff <= 1
    const absDiff = Math.abs(numExpected - numGiven)
    const relDiff = numExpected !== 0 ? absDiff / Math.abs(numExpected) : absDiff
    if (absDiff <= 1 || relDiff <= 0.005) {
      fillCorrect.value = true
      correctCount.value++
      answered.value = true
      return
    }
  }

  // 3. Fallback: partial text match (first word of expected)
  if (normExpected !== '' && normGiven.includes(normExpected.split(' ')[0])) {
    fillCorrect.value = true
    correctCount.value++
    answered.value = true
    return
  }

  fillCorrect.value = false
  answered.value = true
}

async function saveReinforcementResult() {
  const userId = tokenStorage.userId
  if (!userId || !courseId.value || !questions.value.length) return
  const durationSeconds = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0
  try {
    await api.post('/reinforcement-results', {
      userId:         Number(userId),
      courseId:       courseId.value,
      topicId:        topicId.value ?? undefined,
      taskId:         taskId.value  ?? undefined,
      totalQuestions: questions.value.length,
      correctAnswers: correctCount.value,
      difficulty:     selectedDifficulty.value,
      durationSeconds,
    })
  } catch { /* silent – results UI still shown */ }
}

function nextQ() {
  if (isLastQ.value) { void saveReinforcementResult(); phase.value = 'results'; stopSpeaking(); return }
  stopSpeaking()
  qTransition.value = 'slide-left'
  currentIdx.value++
  answered.value       = false
  pickedIdx.value      = -1
  fillAnswer.value     = ''
  fillCorrect.value    = false
  orderingUserSeq.value = []
}

function restart() {
  currentIdx.value      = 0
  answered.value        = false
  pickedIdx.value       = -1
  correctCount.value    = 0
  fillAnswer.value      = ''
  fillCorrect.value     = false
  orderingUserSeq.value = []
  questions.value       = []
  phase.value           = 'start'
}

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => (errorMsg.value = ''), 5000)
}

onUnmounted(() => {
  if (loadingTimer)       clearInterval(loadingTimer)
  if (triquiResetTimer)   clearTimeout(triquiResetTimer)
  stopSpeaking()
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════════════ */
.rl-root {
  min-height: 100vh;
  background: radial-gradient(ellipse at 30% 0%, rgba(98,0,238,0.18) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, rgba(0,212,255,0.10) 0%, transparent 55%),
              #0A0A0F;
  position: relative;
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PARTICLES
═══════════════════════════════════════════════════════════════════════════════ */
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--purple-light);
  animation: floatParticle linear infinite;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SCREEN (shared)
═══════════════════════════════════════════════════════════════════════════════ */
.screen {
  position: relative;
  z-index: 1;
  padding: 16px 16px 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   START SCREEN
═══════════════════════════════════════════════════════════════════════════════ */
.start-screen { padding-top: 24px; }

.mascot-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
}
.mascot {
  font-size: 72px;
  filter: drop-shadow(0 0 24px rgba(139,92,246,0.6));
  animation: mascotBounce 2.4s ease-in-out infinite;
  line-height: 1;
  user-select: none;
}
.mascot-shadow {
  width: 48px;
  height: 10px;
  border-radius: 50%;
  background: rgba(139,92,246,0.3);
  margin-top: 4px;
  animation: shadowPulse 2.4s ease-in-out infinite;
  filter: blur(4px);
}

.start-title {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.5px;
  text-align: center;
  margin: 0;
}
.start-sub {
  font-size: 14px;
  color: #8E8E93;
  text-align: center;
  max-width: 260px;
  line-height: 1.5;
  margin: 0;
}

/* Context pills */
.ctx-pills { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.ctx-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
}
.ctx-pill.topic { background: rgba(98,0,238,0.2); color: #BF5AF2; border: 1px solid rgba(191,90,242,0.3); }
.ctx-pill.task  { background: rgba(0,212,255,0.12); color: #00D4FF; border: 1px solid rgba(0,212,255,0.3); }

/* Difficulty selector */
.diff-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.diff-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #8E8E93;
  margin: 0;
}
.diff-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.diff-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
  color: #8E8E93;
}
.diff-btn:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
}
.diff-btn.diff-active {
  border-color: var(--diff-color, #E74C3C);
  background: color-mix(in srgb, var(--diff-color, #E74C3C) 15%, transparent);
  color: var(--diff-color, #E74C3C);
}
.diff-emoji { font-size: 22px; line-height: 1; }
.diff-name  { font-size: 11px; font-weight: 700; letter-spacing: 0.2px; }

/* ═══════════════════════════════════════════════════════════════════════════════
   LOADING SCREEN
═══════════════════════════════════════════════════════════════════════════════ */
.loading-screen { padding-top: 24px; }

.ai-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.ai-spinner {
  position: relative;
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spinRing 1.6s linear infinite;
}
.r1 { border-top-color: var(--purple-light);  animation-duration: 1.4s; }
.r2 { border-right-color: var(--cyan-accent); animation-duration: 2.1s; animation-direction: reverse; inset: 8px; }
.r3 { border-bottom-color: #FF9500;           animation-duration: 2.6s; inset: 16px; }
.ring-icon {
  font-size: 28px;
  animation: iconPulse 1.8s ease-in-out infinite;
  line-height: 1;
}

.loading-title {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-align: center;
}
.loading-sub {
  font-size: 13px;
  color: #8E8E93;
  text-align: center;
  min-height: 20px;
  transition: opacity 0.4s;
  margin: 0;
}

/* ── Triqui card ── */
.triqui-card {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  backdrop-filter: blur(12px);
}

.triqui-label {
  font-size: 13px;
  font-weight: 700;
  color: #aaa;
  text-align: center;
  letter-spacing: 0.3px;
  margin: 0;
}

.triqui-scoreboard {
  display: flex;
  align-items: center;
  gap: 16px;
}
.tscore {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.tscore-sym { font-size: 22px; font-weight: 900; line-height: 1; }
.tscore.you  .tscore-sym { color: var(--purple-light); }
.tscore.cpu  .tscore-sym { color: var(--cyan-accent);  }
.tscore-val  { font-size: 26px; font-weight: 900; color: #fff; line-height: 1; }
.tscore-name { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
.tscore-divider { font-size: 11px; font-weight: 800; color: #555; letter-spacing: 2px; }

.triqui-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 220px;
}
.tcell {
  aspect-ratio: 1;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(.34,1.56,.64,1);
  font-size: 28px;
  font-weight: 900;
  position: relative;
  overflow: hidden;
}
.tcell:hover:not(:disabled) {
  background: rgba(255,255,255,0.12);
  transform: scale(1.06);
}
.tcell:disabled { cursor: default; }
.tcell.win-cell {
  background: rgba(48,209,88,0.15);
  border-color: #30D158;
  animation: winPulse 0.5s ease;
}
.tcell.x-cell { border-color: rgba(139,92,246,0.4); }
.tcell.o-cell { border-color: rgba(0,212,255,0.4); }

.tcell-sym { display: block; line-height: 1; }
.sym-x { color: var(--purple-light); text-shadow: 0 0 12px rgba(139,92,246,0.6); }
.sym-o { color: var(--cyan-accent);  text-shadow: 0 0 12px rgba(0,212,255,0.5); }

.triqui-result {
  font-size: 15px;
  font-weight: 800;
  padding: 8px 20px;
  border-radius: 20px;
  text-align: center;
}
.triqui-result.player { background: rgba(48,209,88,0.15); color: #30D158; }
.triqui-result.cpu    { background: rgba(255,69,58,0.15);  color: #FF453A; }
.triqui-result.draw   { background: rgba(255,159,10,0.15); color: #FF9F0A; }

.cpu-thinking { font-size: 12px; color: #666; text-align: center; margin: 0; }

/* ═══════════════════════════════════════════════════════════════════════════════
   QUIZ SCREEN
═══════════════════════════════════════════════════════════════════════════════ */
.quiz-screen { padding-top: 12px; }

.prog-bar-wrap { width: 100%; }
.prog-track {
  height: 6px;
  border-radius: 3px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
  margin-bottom: 8px;
}
.prog-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--purple-primary), var(--cyan-accent));
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
  position: relative;
}
.prog-fill::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
  animation: shimmer 1.5s ease-in-out infinite;
}
.prog-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.prog-count  { font-size: 13px; color: #666; font-weight: 600; }
.score-badge {
  font-size: 13px;
  font-weight: 700;
  color: #FFD700;
  background: rgba(255,215,0,0.12);
  padding: 3px 10px;
  border-radius: 10px;
}

/* Question card */
.q-card {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 22px 18px;
  backdrop-filter: blur(8px);
}
.q-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}
.q-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.q-header .q-tag { margin-bottom: 0; }
.tts-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.tts-btn:hover {
  background: rgba(139,92,246,0.18);
  border-color: rgba(139,92,246,0.5);
  transform: scale(1.08);
}
.tts-btn.tts-active {
  background: rgba(139,92,246,0.22);
  border-color: var(--purple-light);
  box-shadow: 0 0 12px rgba(139,92,246,0.35);
}
.tts-icon {
  font-size: 17px;
  line-height: 1;
  user-select: none;
}
.tts-pulse {
  animation: ttsPulse 1s ease-in-out infinite;
}
.q-text {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* Options */
.opts-list { display: flex; flex-direction: column; gap: 10px; }
.opt-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.06);
  text-align: left;
  transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.opt-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background 0.15s;
}
.opt-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.09);
  border-color: rgba(255,255,255,0.15);
  transform: translateX(3px);
}
.opt-btn:active:not(:disabled) { transform: scale(0.98); }
.opt-btn.correct {
  border-color: #30D158;
  background: rgba(48,209,88,0.12);
  animation: correctBounce 0.4s cubic-bezier(.34,1.56,.64,1);
}
.opt-btn.wrong {
  border-color: #FF453A;
  background: rgba(255,69,58,0.12);
  animation: wrongShake 0.35s ease;
}
.opt-btn.dimmed { opacity: 0.45; }

.opt-letter {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #8E8E93;
  transition: all 0.2s;
}
.opt-letter.letter-correct { background: #30D158; color: #fff; }
.opt-letter.letter-wrong   { background: #FF453A; color: #fff; }

.opt-text { flex: 1; font-size: 14px; color: #e0e0e0; line-height: 1.4; }

.opt-icon {
  font-size: 18px;
  font-weight: 900;
  flex-shrink: 0;
}
.correct-icon { color: #30D158; }
.wrong-icon   { color: #FF453A; }

/* Explanation */
.explanation {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(98,0,238,0.12);
  border: 1px solid rgba(139,92,246,0.22);
}
.exp-tag {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--purple-light);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}
.exp-text {
  font-size: 13px;
  color: #ccc;
  line-height: 1.55;
  margin: 0;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RESULTS SCREEN
═══════════════════════════════════════════════════════════════════════════════ */
.results-screen { padding-top: 28px; text-align: center; }

.confetti-wrap { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.confetti-star {
  position: absolute;
  animation: confettiFall ease-in-out infinite alternate;
  user-select: none;
}

.trophy {
  font-size: 76px;
  animation: trophyPop 0.6s cubic-bezier(.34,1.56,.64,1) both;
  line-height: 1;
  position: relative;
  z-index: 1;
}
.result-title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  margin: 0;
  position: relative;
  z-index: 1;
}
.score-ring-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.score-svg {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}
.ring-bg  {
  fill: none;
  stroke: rgba(255,255,255,0.07);
  stroke-width: 10;
}
.ring-arc {
  fill: none;
  stroke: url(#scoreGrad);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1);
}
.score-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.score-pct    { font-size: 36px; font-weight: 900; color: #fff; line-height: 1; }
.score-detail { font-size: 13px; color: #666; }

.result-msg {
  font-size: 14px;
  color: #8E8E93;
  max-width: 260px;
  line-height: 1.5;
  text-align: center;
  margin: 0;
  position: relative;
  z-index: 1;
}
.result-btns {
  display: flex;
  gap: 10px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ERROR TOAST
═══════════════════════════════════════════════════════════════════════════════ */
.error-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,69,58,0.92);
  color: #fff;
  padding: 12px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  z-index: 200;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(255,69,58,0.3);
  white-space: nowrap;
  max-width: calc(100vw - 32px);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════════════════════════════════════════════ */
/* Phase switch */
.phase-enter-active { animation: phaseIn 0.42s cubic-bezier(.34,1.2,.64,1) both; }
.phase-leave-active { animation: phaseOut 0.26s ease both; }

/* Question slide */
.slide-left-enter-active  { animation: slideInLeft  0.35s cubic-bezier(.34,1.2,.64,1) both; }
.slide-left-leave-active  { animation: slideOutLeft 0.25s ease both; }
.slide-right-enter-active { animation: slideInRight  0.35s cubic-bezier(.34,1.2,.64,1) both; }
.slide-right-leave-active { animation: slideOutRight 0.25s ease both; }

/* Pop (symbols, icons) */
.pop-enter-active { animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1) both; }

/* Slide down (explanation, next btn) */
.slide-down-enter-active { animation: slideDown 0.3s cubic-bezier(.4,0,.2,1) both; }
.slide-down-leave-active { animation: slideUp   0.2s ease both; }

/* Toast */
.toast-enter-active { animation: toastIn  0.3s cubic-bezier(.34,1.56,.64,1) both; }
.toast-leave-active { animation: toastOut 0.25s ease both; }

/* ═══════════════════════════════════════════════════════════════════════════════
   KEYFRAMES
═══════════════════════════════════════════════════════════════════════════════ */
@keyframes mascotBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  45%       { transform: translateY(-14px) scale(1.05); }
  55%       { transform: translateY(-14px) scale(1.05); }
}
@keyframes shadowPulse {
  0%, 100% { transform: scale(1);    opacity: 0.6; }
  50%       { transform: scale(0.7); opacity: 0.25; }
}
@keyframes floatParticle {
  0%   { transform: translateY(0)    rotate(0deg);   }
  50%  { transform: translateY(-30px) rotate(180deg); }
  100% { transform: translateY(0)    rotate(360deg);  }
}
@keyframes spinRing {
  to { transform: rotate(360deg); }
}
@keyframes iconPulse {
  0%, 100% { transform: scale(1);    }
  50%       { transform: scale(1.14); }
}
@keyframes correctBounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.04) translateX(4px); }
  100% { transform: scale(1); }
}
@keyframes wrongShake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
@keyframes winPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50%       { opacity: 1; }
}
@keyframes phaseIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes phaseOut {
  to { opacity: 0; transform: translateY(-16px) scale(0.98); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: none; }
}
@keyframes slideOutLeft {
  to { opacity: 0; transform: translateX(-40px); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: none; }
}
@keyframes slideOutRight {
  to { opacity: 0; transform: translateX(40px); }
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.4) rotate(-8deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes slideUp {
  to { opacity: 0; transform: translateY(-8px); }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes toastOut {
  to { opacity: 0; transform: translateX(-50%) translateY(12px); }
}
@keyframes confettiFall {
  from { transform: translateY(-10px) rotate(-8deg); opacity: 0.7; }
  to   { transform: translateY(10px)  rotate(8deg);  opacity: 1; }
}
@keyframes trophyPop {
  from { opacity: 0; transform: scale(0.3) rotate(-15deg); }
  80%  { transform: scale(1.12) rotate(5deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes ttsPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.15); opacity: 0.7; }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FILL-IN-BLANK
═══════════════════════════════════════════════════════════════════════════════ */
.fill-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}
.fill-input {
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.10);
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  color: #fff;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.fill-input:focus {
  border-color: rgba(139,92,246,0.6);
  background: rgba(139,92,246,0.07);
}
.fill-input:disabled {
  opacity: 0.7;
  cursor: default;
}
.fill-input::placeholder { color: #555; }
.fill-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}
.fill-feedback.fill-ok  { background: rgba(48,209,88,0.15);  color: #30D158; }
.fill-feedback.fill-err { background: rgba(255,69,58,0.15);  color: #FF453A; }
.fill-icon { font-size: 16px; font-weight: 900; flex-shrink: 0; }

/* ═══════════════════════════════════════════════════════════════════════════════
   ORDERING
═══════════════════════════════════════════════════════════════════════════════ */
.ordering-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 4px;
}
.ordering-hint {
  font-size: 13px;
  color: #8E8E93;
  margin: 0;
  text-align: center;
}
.ordering-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ordering-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.08);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
  color: #e0e0e0;
}
.ordering-item:hover:not(:disabled) {
  background: rgba(255,255,255,0.09);
  border-color: rgba(255,255,255,0.18);
  transform: translateX(3px);
}
.ordering-item:disabled { cursor: default; }
.ordering-item.ordering-selected {
  border-color: rgba(139,92,246,0.7);
  background: rgba(139,92,246,0.12);
}
.ordering-item.ordering-correct-item {
  border-color: #30D158;
  background: rgba(48,209,88,0.12);
}
.ordering-item.ordering-wrong-item {
  border-color: #FF453A;
  background: rgba(255,69,58,0.12);
}
.ordering-item.ordering-missing {
  opacity: 0.45;
}
.ordering-pos {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  color: #8E8E93;
  transition: all 0.2s;
}
.ordering-selected .ordering-pos {
  background: var(--purple-light);
  color: #fff;
}
.ordering-correct-item .ordering-pos {
  background: #30D158;
  color: #fff;
}
.ordering-wrong-item .ordering-pos {
  background: #FF453A;
  color: #fff;
}
.ordering-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}
</style>
