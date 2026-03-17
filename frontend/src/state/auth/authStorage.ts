import type { AuthState, AuthUser } from './types'

const TOKEN_KEY = 'ps_token'
const USER_KEY = 'ps_user'

export function readAuthState(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)
  let user: AuthUser | null = null
  try {
    user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null
  } catch {
    user = null
  }
  return { token, user }
}

export function writeAuthState(state: AuthState) {
  if (state.token) localStorage.setItem(TOKEN_KEY, state.token)
  else localStorage.removeItem(TOKEN_KEY)

  if (state.user) localStorage.setItem(USER_KEY, JSON.stringify(state.user))
  else localStorage.removeItem(USER_KEY)
}

export function clearAuthState() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

