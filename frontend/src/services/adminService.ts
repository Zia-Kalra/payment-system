import { env } from './env'
import { apiClient } from './apiClient'
import { mockListUsers, mockUpdateUserStatus } from './mock/mockAdmin'
import type { AuthUser } from '../state/auth/types'

export async function listUsers() {
  if (env.apiMock) return mockListUsers()
  const res = await apiClient.get('/admin/users')
  return res.data as AuthUser[]
}

export async function updateUserStatus(input: { userId: string; status: AuthUser['status'] }) {
  if (env.apiMock) return mockUpdateUserStatus(input)
  const res = await apiClient.patch(`/admin/users/${input.userId}`, { status: input.status })
  return res.data as AuthUser
}

