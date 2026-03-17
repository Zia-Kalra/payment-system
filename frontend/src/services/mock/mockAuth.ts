import { createMockJwt } from '../../lib/jwt'
import type { AuthUser, Role } from '../../state/auth/types'

type StoredUser = AuthUser & { password: string }

const USERS_KEY = 'ps_mock_users'

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : []
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function seedIfEmpty() {
  const users = readUsers()
  if (users.length) return
  const seeded: StoredUser[] = [
    {
      id: 'u_admin',
      name: 'Admin',
      email: 'admin@payments.local',
      role: 'admin',
      status: 'active',
      password: 'Admin@1234',
    },
    {
      id: 'u_demo',
      name: 'Demo User',
      email: 'user@payments.local',
      role: 'user',
      status: 'active',
      password: 'User@1234',
    },
  ]
  writeUsers(seeded)
}

export type LoginInput = { email: string; password: string; remember: boolean }
export type RegisterInput = {
  name: string
  email: string
  password: string
  role?: Role
}

export async function mockLogin(input: LoginInput) {
  seedIfEmpty()
  await new Promise((r) => setTimeout(r, 650))

  const users = readUsers()
  const found = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())
  if (!found || found.password !== input.password) {
    throw new Error('Invalid email or password')
  }

  const expSeconds = Math.floor(Date.now() / 1000) + (input.remember ? 60 * 60 * 24 * 7 : 60 * 60)
  const token = createMockJwt({
    sub: found.id,
    email: found.email,
    role: found.role,
    exp: expSeconds,
  })

  const safeUser = { ...found }
  // @ts-expect-error - password is not part of AuthUser
  delete safeUser.password
  return { token, user: safeUser }
}

export async function mockRegister(input: RegisterInput) {
  seedIfEmpty()
  await new Promise((r) => setTimeout(r, 750))

  const users = readUsers()
  const exists = users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())
  if (exists) throw new Error('Email already registered')

  const newUser: StoredUser = {
    id: `u_${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role ?? 'user',
    status: 'active',
    password: input.password,
  }
  users.unshift(newUser)
  writeUsers(users)

  const token = createMockJwt({
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  })

  const safeUser = { ...newUser }
  // @ts-expect-error - password is not part of AuthUser
  delete safeUser.password
  return { token, user: safeUser }
}

