import { api } from './httpClient'
import type { GradeSheet } from './gradeAdapter'

export interface GradePeriod {
  id: number
  courseId: number
  subjectId: number
  periodNumber: number
  name: string
  snapshot: GradeSheet
  closedAt: string
  startsAt: string | null
  endsAt: string | null
  createdBy: number
}

export const periodAdapter = {
  /** Cerrar periodo actual (snapshot + reset notas) */
  closePeriod: (data: { courseId: number; subjectId: number; name?: string }) =>
    api.post<GradePeriod>('/periods', data),

  /** Iniciar nuevo periodo con fechas */
  startPeriod: (data: { courseId: number; subjectId: number; name?: string; startsAt: string; endsAt: string }) =>
    api.post<GradePeriod>('/periods/start', data),

  /** Listar periodos de una materia */
  listBySubject: (subjectId: number) =>
    api.get<GradePeriod[]>(`/periods/subject/${subjectId}`),

  /** Listar periodos de un curso */
  listByCourse: (courseId: number) =>
    api.get<GradePeriod[]>(`/periods/course/${courseId}`),

  /** Obtener un periodo con su snapshot */
  getById: (periodId: number) =>
    api.get<GradePeriod>(`/periods/${periodId}`),

  /** Modificar notas dentro de un periodo */
  updateGrades: (periodId: number, data: { manualGrades?: any[]; taskGrades?: any[] }) =>
    api.put<GradePeriod>(`/periods/${periodId}/grades`, data),

  /** Eliminar un periodo */
  deletePeriod: (periodId: number) =>
    api.delete<void>(`/periods/${periodId}`),
}
