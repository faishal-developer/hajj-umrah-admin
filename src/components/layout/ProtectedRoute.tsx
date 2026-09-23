import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ShieldAlert, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs font-medium text-slate-500">Verifying security session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-slate-950 p-8 text-center shadow-2xl space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white">403 — Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your account ({user?.email}) has the role <strong className="text-amber-400">{user?.role}</strong>, which lacks administrative privileges required to access this portal.
          </p>
          <div className="pt-2">
            <Button
              variant="danger"
              size="md"
              onClick={logout}
              leftIcon={<LogOut className="h-4 w-4" />}
              className="w-full"
            >
              Sign In with Admin Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
