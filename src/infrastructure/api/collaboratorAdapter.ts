import { api } from './httpClient'

export const collaboratorAdapter = {
  checkAccess: (courseId: number) =>
    api.get<{ hasAccess: boolean }>(`/collaborators/check/${courseId}`),
}
