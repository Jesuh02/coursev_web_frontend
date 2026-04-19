import { api } from './httpClient'
import { gradeSheetCache } from './gradeSheetCache'

export interface ManualGrade {
  id: number
  studentId: number
  courseId: number
  subjectId: number
  gradeType: 'comportamiento' | 'participacion' | 'examenes'
  grade: number
  gradedBy: number
  createdAt: string
  updatedAt: string
}

export interface GradeAverages {
  comportamiento: number | null
  participacion: number | null
  examenes: number | null
}

export interface BulkGradeEntry {
  studentId: number
  grade: number
}

export interface GradeSheetTask {
  id: number
  title: string
  topicId: number
}

export interface GradeSheetTaskGrade {
  taskId: number
  studentId: number
  grade: number | null
  feedback: string | null
  submissionId: number
  submittedAt: string | null
  gradedAt: string | null
}

export interface GradeSheetStudent {
  userId: number
  username: string | null
  avatar: string | null
  fullName: string | null
  cedula: string | null
}

export interface GradeSheet {
  subjectId: number
  courseId: number
  students: GradeSheetStudent[]
  tasks: GradeSheetTask[]
  manualGrades: ManualGrade[]
  taskGrades: GradeSheetTaskGrade[]
  closedPeriodsCount?: number
  hasActivePeriod?: boolean
}

export const gradeAdapter = {
  /** Docente: set a single grade — also invalidates the grade-sheet cache for that subject. */
  async setGrade(data: { studentId: number; courseId: number; subjectId: number; gradeType: string; grade: number }) {
    const result = await api.post<ManualGrade>('/grades', data)
    gradeSheetCache.invalidate(data.subjectId)
    return result
  },

  /** Docente: bulk set grades for multiple students — invalidates cache for that subject. */
  async bulkSetGrades(data: { courseId: number; subjectId: number; gradeType: string; entries: BulkGradeEntry[] }) {
    const result = await api.post<ManualGrade[]>('/grades/bulk', data)
    gradeSheetCache.invalidate(data.subjectId)
    return result
  },

  /** Docente: set the same grade for all students — invalidates cache for that subject. */
  async setGradeForAll(data: { courseId: number; subjectId: number; gradeType: string; grade: number; studentIds: number[] }) {
    const result = await api.post<ManualGrade[]>('/grades/set-all', data)
    gradeSheetCache.invalidate(data.subjectId)
    return result
  },

  /** Docente: get all grades for a subject (optionally filtered by type) */
  getBySubject: (subjectId: number, gradeType?: string) => {
    const q = gradeType ? `?type=${gradeType}` : ''
    return api.get<ManualGrade[]>(`/grades/subject/${subjectId}${q}`)
  },

  /** Student: get own grades for a subject */
  getMySubjectGrades: (subjectId: number) =>
    api.get<ManualGrade[]>(`/grades/my/subject/${subjectId}`),

  /** Student: get own grades for a course */
  getMyCourseGrades: (courseId: number) =>
    api.get<ManualGrade[]>(`/grades/my/course/${courseId}`),

  /** Student: get own grade averages for a subject */
  getMySubjectAverages: (subjectId: number) =>
    api.get<GradeAverages>(`/grades/my/subject/${subjectId}/averages`),

  /**
   * Docente/Admin: get full grade sheet (Excel-like) for a subject.
   * Results are cached (TTL 5 min) with in-flight deduplication so that
   * concurrent callers share a single HTTP request.
   */
  getGradeSheet: (subjectId: number): Promise<GradeSheet> =>
    gradeSheetCache.fetchOrGet(subjectId, () => api.get<GradeSheet>(`/grades/sheet/${subjectId}`)),

  /** Docente/Admin: grade a task submission directly — invalidates grade-sheet cache. */
  async gradeSubmission(submissionId: number, grade: number, feedback?: string) {
    const result = await api.put<GradeSheetTaskGrade>(`/submissions/${submissionId}/grade`, { grade, feedback: feedback ?? null })
    // Invalidate by submission's subjectId if available in the returned payload
    const subjectId = (result as any)?.subjectId ?? (result as any)?.subject_id
    if (subjectId) gradeSheetCache.invalidate(Number(subjectId))
    return result
  },

  /**
   * Pre-warm the grade-sheet cache for a list of subjects in the background.
   * Fire-and-forget — safe to call without awaiting.
   * Batched (5 at a time) to avoid flooding the server.
   */
  warmUpGradeSheets: (subjectIds: number[]): Promise<void> =>
    gradeSheetCache.warmUp(subjectIds, id => api.get<GradeSheet>(`/grades/sheet/${id}`)),

  /** Invalidate all cached grade sheets for a given course (e.g. after a period is closed). */
  invalidateCourseCache: (courseId: number): void =>
    gradeSheetCache.invalidateByCourse(courseId),
}
