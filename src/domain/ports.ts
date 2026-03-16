import type {
  User, AuthResponse, Course, Topic, Task, Video, Notification,
  ChatMessage, Subject, TaskSubmission, Subscription, Progress,
  ContentItem, VideoComment, LikeResult, PaginatedResponse, Institucion,
} from './models'

export interface AuthPort {
  login(username: string, password: string): Promise<AuthResponse>
  register(username: string, password: string, email: string, personaId?: number): Promise<AuthResponse>
  loginWithGoogle(email: string, displayName?: string, avatarUrl?: string, username?: string): Promise<AuthResponse>
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
}

export interface UserPort {
  getMyProfile(): Promise<User>
  updateMyProfile(updates: Record<string, unknown>): Promise<User>
  searchUsers(query: string): Promise<User[]>
  getUserById(id: number): Promise<User>
  getUserByUsername(username: string): Promise<User>
  getUsersByIds(ids: number[]): Promise<User[]>
  registerFCMToken(token: string): Promise<void>
  uploadAvatar(file: File): Promise<string>
}

export interface CoursePort {
  getCourses(page?: number, limit?: number): Promise<Course[]>
  getCoursesPaginated(page?: number, limit?: number, excludeUserId?: number): Promise<PaginatedResponse<Course>>
  getFreeCourses(): Promise<Course[]>
  getPremiumCourses(page?: number, limit?: number): Promise<Course[]>
  getPopularCourses(page?: number, limit?: number): Promise<Course[]>
  searchCourses(query: string, page?: number, limit?: number): Promise<PaginatedResponse<Course>>
  getCourseById(id: number): Promise<Course>
  getCoursesByCreatorId(userId: number): Promise<Course[]>
  getEnrolledCoursesPaginated(userId?: number, page?: number, limit?: number): Promise<PaginatedResponse<Course>>
  getPurchasedCourses(userId?: number): Promise<Course[]>
  getCourseFilterCounts(userId?: number): Promise<Record<string, number>>
  createCourse(data: Record<string, unknown>): Promise<Course>
  updateCourse(id: number, data: Record<string, unknown>): Promise<Course>
  deleteCourse(id: number): Promise<void>
}

export interface VideoPort {
  getVideos(page?: number, limit?: number): Promise<Video[]>
  getPublicVideos(page?: number, limit?: number): Promise<Video[]>
  getStreamingFeed(page?: number, limit?: number): Promise<Video[]>
  searchVideos(query: string): Promise<Video[]>
  getVideoById(id: number): Promise<Video>
  getVideosByCourse(courseId: number): Promise<Video[]>
  getVideosByCreator(username: string): Promise<Video[]>
  createVideo(video: Partial<Video>): Promise<Video>
  updateVideo(id: number, updates: Record<string, unknown>): Promise<Video>
  deleteVideo(id: number): Promise<void>
  uploadVideoWithFiles(formData: FormData): Promise<Video>
}

export interface TopicPort {
  getTopicsByCourse(courseId: number): Promise<Topic[]>
  getTopicsBySubject(subjectId: number): Promise<Topic[]>
  getTopicById(id: number): Promise<Topic>
  createTopic(data: Partial<Topic>): Promise<Topic>
  updateTopic(id: number, data: Partial<Topic>): Promise<Topic>
  deleteTopic(id: number): Promise<void>
}

export interface TaskPort {
  getTasksByTopic(topicId: number): Promise<Task[]>
  getTasksByCourse(courseId: number): Promise<Task[]>
  getTaskById(id: number): Promise<Task>
  createTask(data: Partial<Task>): Promise<Task>
  updateTask(id: number, data: Partial<Task>): Promise<Task>
  deleteTask(id: number): Promise<void>
}

export interface SubjectPort {
  getSubjectsByCourse(courseId: number): Promise<Subject[]>
  getSubjectById(id: number): Promise<Subject>
  createSubject(data: Record<string, unknown>): Promise<Subject>
  updateSubject(id: number, data: Record<string, unknown>): Promise<Subject>
  deleteSubject(id: number): Promise<void>
}

export interface ContentItemPort {
  getByTopic(topicId: number): Promise<ContentItem[]>
  getByTask(taskId: number): Promise<ContentItem[]>
  getByCourse(courseId: number): Promise<ContentItem[]>
  getById(id: number): Promise<ContentItem>
  create(data: Partial<ContentItem>): Promise<ContentItem>
  update(id: number, data: Partial<ContentItem>): Promise<ContentItem>
  delete(id: number): Promise<void>
}

export interface SubmissionPort {
  getMySubmissions(page?: number): Promise<TaskSubmission[]>
  getSubmissionsByTask(taskId: number): Promise<TaskSubmission[]>
  getSubmissionByCourse(courseId: number, ungradedOnly?: boolean): Promise<TaskSubmission[]>
  getSubmissionByUserAndTask(taskId: number, studentId?: number): Promise<TaskSubmission | null>
  submitWork(data: Record<string, unknown>): Promise<TaskSubmission>
  gradeSubmission(id: number, grade: number, feedback?: string): Promise<TaskSubmission>
  uploadSubmissionFile(formData: FormData, folder: string): Promise<{ key: string; url: string }>
}

export interface SubscriptionPort {
  getMySubscriptions(): Promise<Subscription[]>
  getMySubscribedCreators(): Promise<User[]>
  getMySubscribers(): Promise<Subscription[]>
  checkSubscription(creatorId: number): Promise<boolean>
  getSubscriberCount(creatorId: number): Promise<number>
  subscribe(creatorId: number): Promise<Subscription>
  unsubscribe(creatorId: number): Promise<void>
}

export interface ProgressPort {
  getMyProgress(): Promise<Progress[]>
  getProgressByCourse(courseId: number): Promise<Progress>
  getAllProgressByCourse(courseId: number): Promise<Progress[]>
  getMyEnrolledCourseIds(): Promise<number[]>
  isEnrolled(courseId: number): Promise<boolean>
  upsertProgress(data: Record<string, unknown>): Promise<Progress>
  getLeaderboard(courseId: number, limit?: number): Promise<Progress[]>
  issueCertificate(courseId: number, userId?: number): Promise<Progress>
  getMyCertificates(): Promise<unknown[]>
  bulkIssueCertificatesForCreator(): Promise<{ issued: number }>
  recalculateProgress(courseId: number): Promise<void>
}

export interface NotificationPort {
  getMyNotifications(page?: number, limit?: number): Promise<Notification[]>
  getUnreadCount(): Promise<number>
  markAsRead(id: number): Promise<void>
  markAllAsRead(): Promise<void>
  sendNotification(data: Record<string, unknown>): Promise<void>
  deleteNotification(id: number): Promise<void>
}

export interface LikePort {
  toggleLike(entityType: string, entityId: number): Promise<LikeResult>
  checkLike(entityType: string, entityId: number): Promise<boolean>
  getLikeCount(entityType: string, entityId: number): Promise<number>
}

export interface CommentPort {
  getCommentsByVideo(videoId: number, page?: number): Promise<VideoComment[]>
  getCommentCount(videoId: number): Promise<number>
  createComment(videoId: number, comment: string, parentId?: number): Promise<VideoComment>
  deleteComment(id: number): Promise<void>
}

export interface PaymentPort {
  initiatePayment(data: Record<string, unknown>): Promise<Record<string, unknown>>
  getPaymentStatus(transactionId: string): Promise<Record<string, unknown>>
  getMyTransactions(): Promise<Record<string, unknown>[]>
  hasPurchasedCourse(courseId: number): Promise<boolean>
}

export interface StoragePort {
  getUploadUrl(fileName: string, contentType: string, folder?: string): Promise<{ uploadUrl: string; key: string }>
  getDownloadUrl(key: string): Promise<{ url: string }>
  uploadFile(formData: FormData): Promise<{ key: string; url: string }>
  deleteFile(key: string): Promise<void>
}

export interface ChatPort {
  upsertMessage(message: Partial<ChatMessage> & { sessionId: string }): Promise<void>
  getMessagesBySession(sessionId: string): Promise<ChatMessage[]>
  getMyMessages(): Promise<ChatMessage[]>
  deleteMessage(id: number): Promise<void>
  deleteSession(sessionId: string): Promise<void>
}

export interface ReinforcementPort {
  saveSession(data: Record<string, unknown>): Promise<void>
  getHistory(courseId: number): Promise<Record<string, unknown>[]>
  getAllHistory(): Promise<Record<string, unknown>[]>
  saveResult(data: Record<string, unknown>): Promise<void>
  getMyResults(): Promise<Record<string, unknown>[]>
  getResultsByCourse(courseId: number): Promise<Record<string, unknown>[]>
  getLearningContext(data: Record<string, unknown>): Promise<Record<string, unknown>>
}

export interface InstitucionPort {
  getAll(): Promise<Institucion[]>
  search(query: string): Promise<Institucion[]>
}
