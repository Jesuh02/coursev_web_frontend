import { api } from './httpClient'

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

export const gradeAdapter = {
  /** Docente: set a single grade */
  setGrade: (data: { studentId: number; courseId: number; subjectId: number; gradeType: string; grade: number }) =>
    api.post<ManualGrade>('/grades', data),

  /** Docente: bulk set grades for multiple students */
  bulkSetGrades: (data: { courseId: number; subjectId: number; gradeType: string; entries: BulkGradeEntry[] }) =>
    api.post<ManualGrade[]>('/grades/bulk', data),

  /** Docente: set the same grade for all students */
  setGradeForAll: (data: { courseId: number; subjectId: number; gradeType: string; grade: number; studentIds: number[] }) =>
    api.post<ManualGrade[]>('/grades/set-all', data),

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
}
