export type Role = 'user' | 'admin'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'restricted' | 'suspended'
}

export type AuthState = {
  token: string | null
  user: AuthUser | null
}

