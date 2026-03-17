import type { AuthUser } from '../../state/auth/types'

type StoredUser = AuthUser & { password: string }

const USERS_KEY = 'ps_mock_users'

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const parsed = raw ? (JSON.parse(raw) as StoredUser[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function mockListUsers() {
  await new Promise((r) => setTimeout(r, 450))
  return readUsers().map((u) => {
    const safe = { ...u }
    // @ts-expect-error - password is not part of AuthUser
    delete safe.password
    return safe
  })
}

export async function mockUpdateUserStatus(input: {
  userId: string
  status: AuthUser['status']
}) {
  await new Promise((r) => setTimeout(r, 450))
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === input.userId)
  if (idx < 0) throw new Error('User not found')
  users[idx] = { ...users[idx]!, status: input.status }
  writeUsers(users)
  const safe = { ...users[idx]! }
  // @ts-expect-error - password is not part of AuthUser
  delete safe.password
  return safe
}

