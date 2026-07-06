import type { SubmissionPort } from '@/domain/ports'
import type { TaskSubmission } from '@/domain/models'
import { api } from './httpClient'

type RawRecord = Record<string, unknown>

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    const text = stringValue(value)
    if (text) return text
  }
  return null
}

function pickFileUri(...values: unknown[]): string | null {
  const candidates = values.map(stringValue).filter((value): value is string => Boolean(value))
  if (candidates.length === 0) return null
  return candidates.find(value => /\.r2\.(cloudflarestorage\.com|dev)/i.test(value))
    ?? candidates.find(value => /^https?:\/\//i.test(value))
    ?? candidates[0]
}

function parseAdditionalFiles(value: unknown): RawRecord[] | null {
  if (Array.isArray(value)) return value.filter((item): item is RawRecord => item !== null && typeof item === 'object') as RawRecord[]
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown
      return Array.isArray(parsed)
        ? parsed.filter((item): item is RawRecord => item !== null && typeof item === 'object') as RawRecord[]
        : null
    } catch {
      return null
    }
  }
  return null
}

function normalizeSubmissionFile(raw: RawRecord) {
  const fileUri = pickFileUri(raw.fileUri, raw.file_uri, raw.publicUrl, raw.url)
  const fileName = pickString(raw.fileName, raw.file_name, raw.name)
  return {
    ...raw,
    fileUri,
    fileName,
    file_uri: fileUri,
    file_name: fileName,
  }
}

function normalizeSubmission(raw: unknown): TaskSubmission | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'object') return raw as TaskSubmission

  const record = raw as RawRecord
  const fileUri = pickFileUri(record.fileUri, record.file_uri, record.publicUrl, record.url)
  const fileName = pickString(record.fileName, record.file_name, record.name)
  const additionalFiles = parseAdditionalFiles(record.additionalFiles)
    ?? parseAdditionalFiles(record.additional_files)
    ?? null
  const normalizedAdditionalFiles = additionalFiles?.map(normalizeSubmissionFile) ?? null

  return {
    ...record,
    file_uri: fileUri,
    file_name: fileName,
    fileUri,
    fileName,
    additionalFiles: normalizedAdditionalFiles,
    additional_files: normalizedAdditionalFiles,
  } as TaskSubmission
}

function normalizeSubmissionList(raw: unknown): TaskSubmission[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map(normalizeSubmission)
    .filter((submission): submission is TaskSubmission => Boolean(submission))
}

export const submissionAdapter: SubmissionPort = {
  getMySubmissions: async (page = 1, limit = 100) =>
    normalizeSubmissionList(await api.get<unknown>(`/submissions/my?page=${page}&pageSize=${limit}`)),

  getSubmissionsByTask: async (taskId) =>
    normalizeSubmissionList(await api.get<unknown>(`/submissions/task/${taskId}`)),

  getSubmissionByCourse: (courseId, ungradedOnly = false) => {
    const param = ungradedOnly ? '&ungradedOnly=true' : ''
    return api.get<unknown>(`/submissions/course/${courseId}?page=1&pageSize=50${param}`).then(normalizeSubmissionList)
  },

  getSubmissionByUserAndTask: async (taskId, studentId) => {
    const query = studentId ? `?studentId=${studentId}` : ''
    return normalizeSubmission(await api.get<unknown>(`/submissions/task/${taskId}/student${query}`))
  },

  getSubmissionById: async (id) => {
    const submission = normalizeSubmission(await api.get<unknown>(`/submissions/${id}`))
    if (!submission) throw new Error('Submission not found')
    return submission
  },

  submitWork: async (data) => {
    const submission = normalizeSubmission(await api.post<unknown>('/submissions', data))
    if (!submission) throw new Error('Submission not found')
    return submission
  },
  // Create a submission in behalf of a student (requires teacher/collaborator permissions)
  submitWorkForStudent: async (data: Record<string, unknown>) => {
    const submission = normalizeSubmission(await api.post<unknown>('/submissions/for-student', data))
    if (!submission) throw new Error('Submission not found')
    return submission
  },

  gradeSubmission: async (id, grade, feedback) => {
    const submission = normalizeSubmission(await api.put<unknown>(`/submissions/${id}/grade`, { grade, feedback }))
    if (!submission) throw new Error('Submission not found')
    return submission
  },

  uploadSubmissionFile: (formData, folder) => {
    formData.append('folder', folder)
    return api.upload<{ key: string; url: string }>('/submissions/upload', formData)
  },
}
