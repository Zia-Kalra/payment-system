import { env } from './env'
import { apiClient } from './apiClient'
import { mockLogin, mockRegister, type LoginInput, type RegisterInput } from './mock/mockAuth'

export async function login(input: LoginInput) {
  if (env.apiMock) return mockLogin(input)
  const res = await apiClient.post('/auth/login', input)
  return res.data as Awaited<ReturnType<typeof mockLogin>>
}

export async function register(input: RegisterInput) {
  if (env.apiMock) return mockRegister(input)
  const res = await apiClient.post('/auth/register', input)
  return res.data as Awaited<ReturnType<typeof mockRegister>>
}

