export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  personaId: number | null
  persona: { id: number; nombres: string; apellidos: string; identificacion: string; telefono: string } | null
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
  creation_date: string | null
  created_at: string
  creator_user_id: number
  creatorUserId: number
  isFree: boolean
  last_modified_by: number | null
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
  createdAt: string | null
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
}

export interface TaskSubmission {
  id: number
  task_id: number
  student_id: number
  file_uri: string | null
  file_name: string | null
  submission_date: number | null
  grade: number | null
  feedback: string | null
  created_at: string
  updated_at: string
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
  certificateUrl: string | null
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

export interface PaginatedResponse<T> {
  data: T[]
  pagination?: { page: number; pageSize: number; total: number; totalPages: number }
}
