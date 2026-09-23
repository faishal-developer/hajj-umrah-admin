export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'AGENT'
  status: 'ACTIVE' | 'SUSPENDED'
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface LoginDto {
  email: string
  password: string
}
