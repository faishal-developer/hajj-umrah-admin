import React, { useState, useEffect } from 'react'
import { type User, type LoginDto } from '../types'
import { DataService } from '@/lib/api-client'
import { AuthContext } from './AuthContext'

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
          const profile = (await DataService.getMe()) as User
          setUser(profile)
          localStorage.setItem('admin_user', JSON.stringify(profile))
        } catch {
          setUser(null)
          setToken(null)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials: LoginDto) => {
    const res = await DataService.login(credentials)
    const userObj = res.user as User
    setToken(res.access_token)
    setUser(userObj)
    localStorage.setItem('admin_token', res.access_token)
    localStorage.setItem('admin_user', JSON.stringify(userObj))
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
