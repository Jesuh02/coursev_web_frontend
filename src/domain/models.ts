export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  personaId: number | null
  persona: { id: number; nombres: string; apellidos: string; identificacion: number; cedula?: number | string | null; identificacion_original?: string | null; telefono: string } | null
  roles: { id: number; nombre: string }[]
  isActive: boolean
  emailVerified: boolean
  createdAt: string | null
  updatedAt: string | null
  whatsapp?: { isLinked: boolean; phoneNumber: string; linkedAt: string } | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  isNewUser?: boolean
}

export interface Course {
  id: number
  title: string
  description: string | null
  thumbnail_uri: string | null
  thumbnailUri: string | null
  video_uri: string | null
  category: string
  price: number
  is_premium: boolean
  isPremium: boolean
  is_published: boolean
  is_active: boolean
  isActive: boolean
  creation_date: string | null
  created_at: string
  creator_user_id: number
  creatorUserId: number
  creator_username?: string | null
  creatorUsername?: string | null
  isFree: boolean
  last_modified_by: number | null
  deadline: string | null
  studentCount?: number
}

export interface Topic {
  id: number
  title: string
  description: string
  courseId: number
  orderIndex: number
  createdAt: string | null
  updatedAt: string | null
}

export interface Task {
  id: number
  title: string
  description: string
  topicId: number
  topic_id: number
  dueDate: string | null
  due_date: string | null
  timeLimitMinutes: number | null
  periodId: number | null
  period_id: number | null
  orderIndex: number
  order_index?: number
  createdAt: string | null
  created_at?: string | null
}

export interface Video {
  id: number
  title: string
  description: string | null
  video_uri_string: string | null
  videoUriString: string | null
  thumbnail_uri: string | null
  thumbnailUri: string | null
  is_paid: boolean
  price: number | null
  created_at: string
  remote_id: number | null
  remoteId: number | null
  course_id: number | null
  courseId: number | null
  userId: number | null
  username: string
}

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  sender_username: string | null
  sender_avatar_url: string | null
  thumbnail_url: string | null
  thumbnailUrl: string | null
  related_id: number | null
  is_read: boolean
  created_at: string
  metadata: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  sessionId?: string
  excelUrl?: string | null
}

export interface Subject {
  id: number
  courseId: number
  name: string
  description: string
  code: string | null
  thumbnailUrl: string | null
  orderIndex: number
  isActive: boolean
  createdAt: string | null
  createdBy: number | null
}

export interface TaskSubmissionFile {
  fileUri: string | null
  fileName: string | null
  file_uri?: string | null
  file_name?: string | null
}

export interface TaskSubmission {
  id: number
  task_id: number
  student_id: number
  studentId?: number
  file_uri: string | null
  file_name: string | null
  fileUri?: string | null
  fileName?: string | null
  additionalFiles?: TaskSubmissionFile[] | null
  additional_files?: TaskSubmissionFile[] | null
  submission_date: number | null
  grade: number | null
  feedback: string | null
  created_at: string
  updated_at: string
  studentUsername?: string | null
  studentAvatar?: string | null
  studentFullName?: string | null
  studentCedula?: string | null
}

export interface Subscription {
  subscriber_id: number
  creator_id: number
  subscription_date: number | null
  created_at: string
}

export interface Progress {
  userId: number
  courseId: number
  subjectId: number | null
  completedTasks: number
  totalTasks: number
  averageGrade: number | null
  progressPercentage: number
  status: string
  lastActivityAt: string | null
  certificateIssuedAt: string | null
  /** Path relativo en Supabase Storage. Construir URL pública con el base URL del bucket. */
  certificateUrl: string | null
  enrollmentStatus: 'activo' | 'pendiente_aprobacion' | 'rechazado' | null
  // Enriched fields for Matrícula tab
  courseName?: string
  username?: string
  avatar?: string | null
}

/** Invitado directo a un curso (acceso inmediato sin prematrícula). */
export interface GuestEntry {
  userId: number
  courseId: number
  username: string | null
  avatar: string | null
  requestedAt: string | null
  reviewedBy: number | null
}

/** Certificado emitido a un estudiante al completar un curso. */
export interface Certificate {
  courseId: number
  courseName: string | null
  courseThumbnail: string | null
  /** Path relativo en Supabase Storage. Construir URL pública concatenando el base URL del bucket. */
  certificateUrl: string | null
  certificateIssuedAt: string | null
  /** Código único para verificar la autenticidad del certificado (verification_code). */
  verificationCode: string | null
  status: 'Ganado'
  averageGrade: number | null
}

export interface ContentItem {
  id: number
  taskId: number
  topicId: number | null
  contentType: string
  content: string
  fileUri: string | null
  fileName: string | null
  orderIndex: number
  createdAt: string | null
}

export interface VideoComment {
  id: number
  video_id: number
  usuario_id: number
  comment: string
  created_at: string
  parent_id: number | null
}

export interface LikeResult {
  liked: boolean
  count: number
}

export interface Institucion {
  id: number
  nombre: string
  codigo: string | null
  ciudad: string | null
  departamento: string | null
  /** Which tenant this institution belongs to (only populated by cross-tenant responses) */
  tenantId?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination?: { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }
}
