import { useContext } from 'react'
import { AuthContext, type AuthContextType } from './AuthContext'
import { AuthProvider } from './AuthProvider'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider }
export type { AuthContextType }
