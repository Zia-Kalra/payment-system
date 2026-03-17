import { createContext } from 'react'
import type { AuthUser, Role } from './types'

export type AuthContextValue = {
  isAuthenticated: boolean
  token: string | null
  user: AuthUser | null
  login: (input: { email: string; password: string; remember: boolean }) => Promise<void>
  register: (input: { name: string; email: string; password: string; role?: Role }) => Promise<void>
  logout: (opts?: { reason?: string }) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

