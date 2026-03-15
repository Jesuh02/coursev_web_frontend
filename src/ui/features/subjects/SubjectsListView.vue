<template>
  <div class="subjects-list">
    <div class="header-section">
      <div class="header-top-row">
        <button class="back-btn" @click="$router.back()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 class="header-title">Mis Materias</h1>
        <button v-if="hasAccess" class="add-btn" @click="navigateToCreate">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <div v-else class="add-btn-placeholder" />
      </div>
      <p v-if="allSubjects.length" class="header-subtitle">• {{ allSubjects.length }} materia{{ allSubjects.length !== 1 ? 's' : '' }}</p>
    </div>

    <div class="search-bar-container">
      <div class="search-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input v-model="search" type="text" placeholder="Buscar materia..." />
      </div>
    </div>

    <div v-if="loadingSubjects" class="loading-center">
      <div class="spinner-lg" />
    </div>

    <div v-else-if="filtered.length" class="subjects-recycler">
      <div
        v-for="subject in filtered"
        :key="subject.id"
        class="subject-card"
        @click="navigateToDetail(subject)"
        @contextmenu.prevent="hasAccess ? openOptions(subject) : undefined"
      >
        <div class="subject-thumb">
          <img v-if="resolveImageUrl(subject.thumbnailUrl)" :src="resolveImageUrl(subject.thumbnailUrl)!" alt="" />
          <div v-else class="thumb-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#BF5AF2" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
          </div>
        </div>
        <div class="subject-body">
          <div class="subject-title-row">
            <h3 class="subject-name">{{ subject.name }}</h3>
            <button v-if="hasAccess" class="options-btn" @click.stop="openOptions(subject)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
            </button>
          </div>
          <p v-if="subject.description" class="subject-desc">{{ subject.description }}</p>
          <div class="subject-stats">
            <div class="stats-left">
              <div class="progress-bar-mini">
                <div class="progress-fill" :style="{ width: getStats(subject.id).progress + '%' }" />
              </div>
              <span class="stat-progress">{{ getStats(subject.id).progress }}%</span>
            </div>
            <span class="stat-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              {{ getStats(subject.id).taskCount }} tarea{{ getStats(subject.id).taskCount !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
      <p class="empty-text">{{ errorMessage || 'Sin materias creadas' }}</p>
      <button v-if="hasAccess" class="empty-add-btn" @click="navigateToCreate">Crear materia</button>
    </div>

    <button v-if="hasAccess && filtered.length" class="fab" @click="navigateToCreate">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    </button>

    <Teleport to="body">
      <div v-if="optionsSubject" class="bottom-sheet-overlay" @click="optionsSubject = null">
        <div class="bottom-sheet" @click.stop>
          <h3 class="sheet-title">{{ optionsSubject.name }}</h3>
          <button class="sheet-option edit" @click="editSubject">Editar materia</button>
          <button class="sheet-option delete" @click="confirmDeleteSubject">Eliminar materia</button>
          <button class="sheet-option cancel" @click="optionsSubject = null">Cancelar</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="bottom-sheet-overlay" @click="showDeleteConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <h3>Eliminar materia</h3>
          <p>¿Estás seguro de eliminar "{{ optionsSubject?.name }}"? Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button class="cancel-btn" @click="showDeleteConfirm = false">Cancelar</button>
            <button class="delete-btn" @click="deleteSubj">Eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { Subject } from '@/domain/models'
import { subjectAdapter, taskAdapter, topicAdapter, courseAdapter, collaboratorAdapter, resolveImageUrl } from '@/infrastructure/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const courseId = computed(() => Number(route.params.courseId) || 0)
const allSubjects = ref<Subject[]>([])
const search = ref('')
const loadingSubjects = ref(true)
const errorMessage = ref('')
const hasAccess = ref(false)
const optionsSubject = ref<Subject | null>(null)
const showDeleteConfirm = ref(false)

interface SubjectStats { taskCount: number; progress: number }
const statsMap = ref<Record<number, SubjectStats>>({})

const filtered = computed(() => {
  if (!search.value) return allSubjects.value
  const q = search.value.toLowerCase()
  return allSubjects.value.filter(s =>
    s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
  )
})

function getStats(subjectId: number): SubjectStats {
  return statsMap.value[subjectId] || { taskCount: 0, progress: 0 }
}

onMounted(async () => {
  await Promise.all([loadSubjects(), checkAccess()])
})

async function checkAccess() {
  if (authStore.isAdminOrDocente) { hasAccess.value = true; return }
  if (!courseId.value) return
  try {
    const course = await courseAdapter.getCourseById(courseId.value)
    if (authStore.user?.id && authStore.user.id === course.creatorUserId) {
      hasAccess.value = true
      return
    }
  } catch { /* silent */ }
  try {
    const res = await collaboratorAdapter.checkAccess(courseId.value)
    if (res.hasAccess) hasAccess.value = true
  } catch { /* silent */ }
}

async function loadSubjects() {
  if (!courseId.value) { loadingSubjects.value = false; return }
  loadingSubjects.value = true
  errorMessage.value = ''
  try {
    allSubjects.value = await subjectAdapter.getSubjectsByCourse(courseId.value)
    loadSubjectStats()
  } catch {
    errorMessage.value = 'Error al cargar materias'
  } finally {
    loadingSubjects.value = false
  }
}

async function loadSubjectStats() {
  if (!courseId.value || !allSubjects.value.length) return
  try {
    const [topics, tasks] = await Promise.all([
      topicAdapter.getTopicsByCourse(courseId.value).catch(() => []),
      taskAdapter.getTasksByCourse(courseId.value).catch(() => []),
    ])

    const newStats: Record<number, SubjectStats> = {}
    for (const subject of allSubjects.value) {
      const subjectTopicIds = new Set(
        topics.filter((t: { courseId: number }) => t.courseId === subject.id).map((t: { id: number }) => t.id)
      )
      const subjectTasks = tasks.filter((t: { topicId: number }) => subjectTopicIds.has(t.topicId))
      const taskCount = subjectTasks.length
      newStats[subject.id] = { taskCount, progress: 0 }
    }
    statsMap.value = newStats
  } catch { /* silent */ }
}

function navigateToCreate() {
  router.push({ path: '/subjects/create', query: { courseId: String(courseId.value) } })
}

function navigateToDetail(subject: Subject) {
  router.push({
    path: `/course/${courseId.value}`,
    query: {
      subjectId: String(subject.id),
      subjectName: subject.name,
    }
  })
}

function openOptions(subject: Subject) {
  optionsSubject.value = subject
}

function editSubject() {
  if (!optionsSubject.value) return
  const s = optionsSubject.value
  router.push({
    path: '/subjects/create',
    query: {
      courseId: String(courseId.value),
      subjectId: String(s.id),
      subjectName: s.name,
      subjectDescription: s.description || '',
      subjectCode: s.code || '',
      subjectThumbnailUrl: s.thumbnailUrl || '',
    }
  })
  optionsSubject.value = null
}

function confirmDeleteSubject() {
  showDeleteConfirm.value = true
}

async function deleteSubj() {
  if (!optionsSubject.value) return
  try {
    await subjectAdapter.deleteSubject(optionsSubject.value.id)
    showDeleteConfirm.value = false
    optionsSubject.value = null
    await loadSubjects()
  } catch { /* silent */ }
}
</script>

<style scoped>
.subjects-list { height: 100%; overflow-y: auto; background: var(--bg-primary); padding-bottom: 80px; }

.header-section { padding: 16px; }
.header-top-row { display: flex; align-items: center; gap: 12px; }
.back-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
.header-title { flex: 1; font-size: 22px; font-weight: 700; color: #fff; }
.add-btn { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #6A1B9A, #BF5AF2); display: flex; align-items: center; justify-content: center; transition: transform 0.2s; }
.add-btn:hover { transform: scale(1.1); }
.add-btn-placeholder { width: 40px; }
.header-subtitle { font-size: 13px; color: #8E8E93; margin-top: 4px; padding-left: 52px; }

.search-bar-container { padding: 0 16px 8px; }
.search-field { display: flex; align-items: center; gap: 10px; background: #1C1C1E; border-radius: 12px; padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06); }
.search-field input { flex: 1; background: transparent; border: none; color: #fff; font-size: 15px; outline: none; }
.search-field input::placeholder { color: #8E8E93; }

.loading-center { display: flex; justify-content: center; padding: 60px 0; }
.spinner-lg { width: 32px; height: 32px; border: 3px solid rgba(191,90,242,0.2); border-top-color: #BF5AF2; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.subjects-recycler { padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }

.subject-card {
  display: flex; flex-direction: column;
  background: #1C1C1E; border-radius: 20px;
  cursor: pointer; transition: background 0.15s; overflow: hidden;
}
.subject-card:hover { background: #2C2C2E; }

.subject-thumb { position: relative; width: 100%; aspect-ratio: 16 / 9; background: rgba(191,90,242,0.08); overflow: hidden; }
.subject-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a2e, #2a1a3e); }

.subject-body { padding: 16px; }
.subject-title-row { display: flex; align-items: center; gap: 8px; }
.subject-name { flex: 1; font-size: 18px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.subject-desc { font-size: 13px; color: #8E8E93; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.subject-stats { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.stats-left { display: flex; align-items: center; gap: 8px; flex: 1; }
.stat-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #BF5AF2; background: rgba(191,90,242,0.12); padding: 4px 10px; border-radius: 10px; flex-shrink: 0; }
.progress-bar-mini { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; max-width: 120px; }
.progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #BF5AF2, #00D4FF); transition: width 0.3s; }
.stat-progress { font-size: 13px; font-weight: 600; color: #BF5AF2; }

.options-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; flex-shrink: 0; }
.options-btn:hover { background: rgba(255,255,255,0.08); }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 40px; text-align: center; }
.empty-text { font-size: 15px; color: #8E8E93; }
.empty-add-btn { padding: 10px 24px; border-radius: 12px; background: linear-gradient(135deg, #6A1B9A, #BF5AF2); color: #fff; font-size: 15px; font-weight: 600; }

.fab {
  position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px;
  border-radius: 50%; background: linear-gradient(135deg, #6A1B9A, #BF5AF2);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(191,90,242,0.4);
  transition: transform 0.2s;
  z-index: 10;
}
.fab:hover { transform: scale(1.1); }

.bottom-sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.bottom-sheet { width: 100%; max-width: 480px; background: #1C1C1E; border-radius: 20px 20px 0 0; padding: 24px 0; }
.sheet-title { font-size: 18px; font-weight: 600; color: #fff; padding: 0 24px 16px; }
.sheet-option { display: block; width: 100%; text-align: left; padding: 14px 24px; font-size: 16px; transition: background 0.15s; }
.sheet-option:hover { background: rgba(255,255,255,0.05); }
.sheet-option.edit { color: #0A84FF; }
.sheet-option.delete { color: #FF453A; }
.sheet-option.cancel { color: #8E8E93; text-align: center; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; }

.confirm-dialog { background: #1C1C1E; border-radius: 16px; padding: 24px; margin: auto 16px; max-width: 400px; width: 100%; }
.confirm-dialog h3 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 8px; }
.confirm-dialog p { font-size: 14px; color: #8E8E93; line-height: 1.5; margin-bottom: 20px; }
.confirm-actions { display: flex; gap: 12px; justify-content: flex-end; }
.cancel-btn { padding: 10px 20px; border-radius: 10px; background: rgba(255,255,255,0.08); color: #fff; font-size: 15px; }
.delete-btn { padding: 10px 20px; border-radius: 10px; background: #FF453A; color: #fff; font-size: 15px; font-weight: 600; }
</style>
