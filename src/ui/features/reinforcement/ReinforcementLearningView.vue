<template>
  <div class="reinforcement-view">
    <TopBar title="Refuerzo de Aprendizaje" @back="$router.back()" />

    <div v-if="!started" class="start-section">
      <div class="start-card">
        <div class="start-icon">🧠</div>
        <h2 class="start-title">Sesión de Refuerzo</h2>
        <p class="start-desc">Responde preguntas para fortalecer tu conocimiento del curso</p>
        <div class="difficulty-info">
          <span class="diff-chip">{{ difficultyLabel }}</span>
          <span class="question-count">{{ totalQuestions }} preguntas</span>
        </div>
        <AppButton full @click="start">Comenzar</AppButton>
      </div>
    </div>

    <div v-else class="session-content">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPct}%` }" />
      </div>
      <p class="progress-text">Pregunta {{ currentIndex + 1 }} de {{ totalQuestions }}</p>

      <div class="question-card">
        <p class="question-text">{{ currentQuestion.text }}</p>
        <div class="options">
          <button
            v-for="(opt, i) in currentQuestion.options"
            :key="i"
            class="option-btn"
            :class="optionClass(i)"
            :disabled="answered"
            @click="selectAnswer(i)"
          >
            <span class="option-letter">{{ letters[i] }}</span>
            <span class="option-text">{{ opt }}</span>
          </button>
        </div>
      </div>

      <AppButton v-if="answered" full @click="next">
        {{ isLast ? 'Ver Resultados' : 'Siguiente' }}
      </AppButton>
    </div>

    <div v-if="showResults" class="results-overlay">
      <div class="results-card">
        <div class="results-icon">{{ score >= 70 ? '🎉' : '💪' }}</div>
        <h2 class="results-title">{{ score >= 70 ? '¡Excelente!' : 'Sigue practicando' }}</h2>
        <div class="score-circle">
          <span class="score-value">{{ score }}%</span>
        </div>
        <p class="results-detail">{{ correctCount }}/{{ totalQuestions }} correctas</p>
        <AppButton full @click="$router.back()">Finalizar</AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/ui/shared/components/TopBar.vue'
import AppButton from '@/ui/shared/components/AppButton.vue'

interface Question {
  text: string
  options: string[]
  correctIndex: number
}

const route = useRoute()
const courseId = computed(() => Number(route.params.courseId))
const topicId = computed(() => route.query.topicId ? Number(route.query.topicId) : null)
const taskId = computed(() => route.query.taskId ? Number(route.query.taskId) : null)
const selectedDifficulty = computed(() => (route.query.difficulty as string) || 'medium')

const letters = ['A', 'B', 'C', 'D']
const difficultyLabel = computed(() => {
  const map: Record<string, string> = { easy: 'Fácil', medium: 'Intermedio', hard: 'Difícil' }
  return map[selectedDifficulty.value] || 'Intermedio'
})
const difficulty = ref('Intermedio')
const started = ref(false)
const answered = ref(false)
const selectedIndex = ref(-1)
const currentIndex = ref(0)
const showResults = ref(false)
const correctCount = ref(0)

const questions = ref<Question[]>([
  { text: 'Pregunta de ejemplo', options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correctIndex: 0 }
])

const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLast = computed(() => currentIndex.value >= totalQuestions.value - 1)
const progressPct = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100)
const score = computed(() => Math.round((correctCount.value / totalQuestions.value) * 100))

function optionClass(i: number) {
  if (!answered.value) return ''
  if (i === currentQuestion.value.correctIndex) return 'correct'
  if (i === selectedIndex.value && i !== currentQuestion.value.correctIndex) return 'wrong'
  return ''
}

function start() { started.value = true }

function selectAnswer(i: number) {
  selectedIndex.value = i
  answered.value = true
  if (i === currentQuestion.value.correctIndex) correctCount.value++
}

function next() {
  if (isLast.value) { showResults.value = true; return }
  currentIndex.value++
  answered.value = false
  selectedIndex.value = -1
}
</script>

<style scoped>
.reinforcement-view { min-height: 100vh; background: var(--bg-primary); position: relative; }

.start-section { padding: 40px 16px; display: flex; justify-content: center; }

.start-card {
  width: 100%;
  max-width: 400px;
  padding: 32px 24px;
  background: #1C1C1E;
  border-radius: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.start-icon { font-size: 56px; }
.start-title { font-size: 22px; font-weight: 700; color: #fff; }
.start-desc { font-size: 14px; color: #8E8E93; max-width: 280px; }

.difficulty-info { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
.diff-chip { padding: 4px 12px; border-radius: 12px; background: rgba(255,149,0,0.15); color: #FF9500; font-size: 13px; font-weight: 600; }
.question-count { font-size: 13px; color: #8E8E93; }

.session-content { padding: 16px; }

.progress-bar { height: 4px; border-radius: 2px; background: #333; margin-bottom: 8px; }
.progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--purple-primary), #00D4FF); transition: width 0.3s; }
.progress-text { font-size: 13px; color: #8E8E93; margin-bottom: 20px; }

.question-card { background: #1C1C1E; border-radius: 20px; padding: 24px; margin-bottom: 20px; }
.question-text { font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 20px; line-height: 1.4; }

.options { display: flex; flex-direction: column; gap: 10px; }

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
  text-align: left;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.option-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
.option-btn.correct { border-color: #30D158; background: rgba(48,209,88,0.1); }
.option-btn.wrong { border-color: #FF453A; background: rgba(255,69,58,0.1); }

.option-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #8E8E93;
  flex-shrink: 0;
}

.option-text { font-size: 15px; color: #fff; }

.results-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.results-card {
  width: 100%;
  max-width: 360px;
  padding: 32px 24px;
  background: #1C1C1E;
  border-radius: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.results-icon { font-size: 48px; }
.results-title { font-size: 22px; font-weight: 700; color: #fff; }

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--purple-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
}

.score-value { font-size: 28px; font-weight: 700; color: #fff; }
.results-detail { font-size: 14px; color: #8E8E93; }
</style>
