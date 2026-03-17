import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import { isJwtExpired } from '../../lib/jwt'
import { clearAuthState, readAuthState, writeAuthState } from './authStorage'
import type { AuthState, Role } from './types'
import * as authService from '../../services/authService'
import { setOnUnauthorized } from '../../services/apiClient'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readAuthState())

  const logout = useCallback((opts?: { reason?: string }) => {
    clearAuthState()
    setState({ token: null, user: null })
    if (opts?.reason) toast(opts.reason)
  }, [])

  useEffect(() => {
    setOnUnauthorized(() => logout({ reason: 'Session expired. Please log in again.' }))
    return () => setOnUnauthorized(null)
  }, [logout])

  useEffect(() => {
    // Token expiry handling (initial check + periodic).
    const check = () => {
      const token = readAuthState().token
      if (token && isJwtExpired(token)) logout({ reason: 'Session expired. Please log in again.' })
    }
    check()
    const id = window.setInterval(check, 30_000)
    return () => window.clearInterval(id)
  }, [logout])

  const login = useCallback(
    async (input: { email: string; password: string; remember: boolean }) => {
      const { token, user } = await authService.login(input)
      const next = { token, user }
      writeAuthState(next)
      setState(next)
      toast.success(`Welcome back, ${user.name}`)
    },
    [],
  )

  const register = useCallback(
    async (input: { name: string; email: string; password: string; role?: Role }) => {
      const { token, user } = await authService.register(input)
      const next = { token, user }
      writeAuthState(next)
      setState(next)
      toast.success(`Welcome, ${user.name}`)
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!state.token && !!state.user,
      token: state.token,
      user: state.user,
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

