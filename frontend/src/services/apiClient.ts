import axios from 'axios'
import { env } from './env'
import { readAuthState } from '../state/auth/authStorage'

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl || 'http://localhost:8000',
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const { token } = readAuthState()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401 && onUnauthorized) onUnauthorized()
    return Promise.reject(err)
  },
)

