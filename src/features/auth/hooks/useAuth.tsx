import React, { createContext, useContext, useState, useEffect } from 'react'
import { type User, type LoginDto } from '../types'
import { DataService } from '@/lib/api-client'
import { INITIAL_ADMIN_USER } from '@/lib/mock-data'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (credentials: LoginDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'))
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('admin_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('admin_token')
      if (savedToken) {
        try {
          const profile = await DataService.getMe()
          setUser(profile)
          localStorage.setItem('admin_user', JSON.stringify(profile))
        } catch {
          if (!user) {
            setUser(INITIAL_ADMIN_USER)
          }
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials: LoginDto) => {
    const res = await DataService.login(credentials)
    setToken(res.access_token)
    setUser(res.user)
    localStorage.setItem('admin_token', res.access_token)
    localStorage.setItem('admin_user', JSON.stringify(res.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    window.location.href = '/admin/login'
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = !!user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
