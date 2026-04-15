<template>
  <div class="grade-overlay" @click.self="$emit('close')">
    <div class="grade-panel">
      <div class="panel-header">
        <h2 class="panel-title">Calificar Estudiantes</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Grade type selector -->
      <div class="type-selector">
        <button
          v-for="t in gradeTypes"
          :key="t.value"
          class="type-btn"
          :class="{ active: selectedType === t.value }"
          @click="selectType(t.value)"
        >
          <span class="type-icon">{{ t.icon }}</span>
          <span class="type-label">{{ t.label }}</span>
        </button>
      </div>

      <template v-if="selectedType">
        <!-- Search filter -->
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Buscar por nombre, username o cédula..."
            type="text"
          />
        </div>

        <!-- Bulk action bar -->
        <div class="bulk-bar">
          <button class="bulk-btn default-grade" @click="setAllGrade(6.5)">
            Asignar 6.5 a todos
          </button>
          <div class="bulk-custom">
            <input
              v-model.number="bulkGrade"
              class="bulk-input"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="Nota"
            />
            <button class="bulk-btn apply" :disabled="bulkGrade === null || bulkGrade === undefined" @click="setAllGrade(bulkGrade!)">
              Aplicar a todos
            </button>
          </div>
        </div>

        <!-- Student list -->
        <div class="student-list">
          <div v-if="loading" class="loading-center"><div class="spinner" /></div>
          <div v-else-if="!filteredStudents.length" class="empty-msg">No se encontraron estudiantes</div>
          <div
            v-for="student in filteredStudents"
            :key="student.userId"
            class="student-row"
          >
            <div class="student-avatar">
              <img v-if="student.avatar" :src="student.avatar" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
              <span v-else class="avatar-initials">{{ (student.username ?? 'E').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="student-info">
              <p class="student-name">{{ student.fullName || student.username }}</p>
              <p class="student-meta">@{{ student.username }} <span v-if="student.cedula">· {{ student.cedula }}</span></p>
            </div>
            <div class="grade-input-group">
              <input
                :value="studentGrades[student.userId] ?? ''"
                class="grade-input"
                type="number"
                min="0"
                max="10"
                step="0.5"
                placeholder="—"
                @input="onGradeInput(student.userId, $event)"
              />
              <span class="grade-max">/10</span>
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="panel-footer">
          <button class="save-btn" :disabled="saving" @click="saveGrades">
            {{ saving ? 'Guardando...' : 'Guardar Notas' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { gradeAdapter } from '@/infrastructure/api/gradeAdapter'
import type { ManualGrade } from '@/infrastructure/api/gradeAdapter'
import { progressAdapter } from '@/infrastructure/api/progressAdapter'

interface StudentEntry {
  userId: number
  username: string
  fullName: string | null
  cedula: string | null
  avatar: string | null
}

const props = defineProps<{
  courseId: number
  subjectId: number
  students: StudentEntry[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const gradeTypes = [
  { value: 'comportamiento', label: 'Comportamiento', icon: '🤝' },
  { value: 'participacion', label: 'Participación', icon: '🙋' },
  { value: 'examenes', label: 'Exámenes', icon: '📝' },
] as const

const selectedType = ref<string | null>(null)
const searchQuery = ref('')
const bulkGrade = ref<number | null>(null)
const studentGrades = ref<Record<number, number | null>>({})
const loading = ref(false)
const saving = ref(false)

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return props.students
  const q = searchQuery.value.toLowerCase().trim()
  return props.students.filter(s => {
    const name = (s.fullName || '').toLowerCase()
    const uname = (s.username || '').toLowerCase()
    const cedula = (s.cedula || '').toLowerCase()
    return name.includes(q) || uname.includes(q) || cedula.includes(q)
  })
})

async function selectType(type: string) {
  selectedType.value = type
  loading.value = true
  studentGrades.value = {}
  try {
    const grades = await gradeAdapter.getBySubject(props.subjectId, type)
    for (const g of grades) {
      studentGrades.value[g.studentId] = g.grade
    }
  } catch { /* silent */ }
  loading.value = false
}

function onGradeInput(userId: number, event: Event) {
  const val = parseFloat((event.target as HTMLInputElement).value)
  if (Number.isNaN(val)) {
    studentGrades.value[userId] = null
  } else {
    studentGrades.value[userId] = Math.min(10, Math.max(0, val))
  }
}

function setAllGrade(grade: number) {
  const clamped = Math.min(10, Math.max(0, grade))
  for (const s of props.students) {
    studentGrades.value[s.userId] = clamped
  }
}

async function saveGrades() {
  if (!selectedType.value) return
  saving.value = true
  try {
    const entries = Object.entries(studentGrades.value)
      .filter(([, g]) => g !== null && g !== undefined)
      .map(([uid, g]) => ({ studentId: Number(uid), grade: g! }))

    if (!entries.length) {
      saving.value = false
      return
    }

    await gradeAdapter.bulkSetGrades({
      courseId: props.courseId,
      subjectId: props.subjectId,
      gradeType: selectedType.value,
      entries,
    })
    emit('saved')
  } catch (err) {
    console.error('[GradePanel] Error saving grades:', err)
  }
  saving.value = false
}
</script>

<style scoped>
.grade-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.grade-panel {
  background: #111528;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.type-selector {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #8E8E93;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  background: rgba(191, 90, 242, 0.15);
  border-color: #BF5AF2;
  color: #BF5AF2;
}

.type-icon { font-size: 20px; }
.type-label { font-weight: 600; }

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 20px 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder { color: #8E8E93; }

.bulk-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 12px;
  flex-wrap: wrap;
}

.bulk-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn.default-grade {
  background: rgba(0, 212, 255, 0.12);
  color: #00D4FF;
}

.bulk-btn.apply {
  background: rgba(191, 90, 242, 0.15);
  color: #BF5AF2;
}

.bulk-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.bulk-custom {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bulk-input {
  width: 60px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  text-align: center;
  outline: none;
}

.student-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
  max-height: 400px;
}

.student-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.student-row:last-child { border-bottom: none; }

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(191, 90, 242, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.student-avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-initials {
  color: #BF5AF2;
  font-size: 16px;
  font-weight: 700;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-meta {
  font-size: 12px;
  color: #8E8E93;
  margin: 2px 0 0;
}

.grade-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.grade-input {
  width: 56px;
  padding: 8px 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color 0.2s;
}

.grade-input:focus {
  border-color: #BF5AF2;
}

.grade-max {
  color: #8E8E93;
  font-size: 12px;
}

.panel-footer {
  padding: 16px 20px 20px;
}

.save-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #BF5AF2, #9B6BFF);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-center {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #BF5AF2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-msg {
  text-align: center;
  color: #8E8E93;
  padding: 32px 0;
  font-size: 14px;
}
</style>
