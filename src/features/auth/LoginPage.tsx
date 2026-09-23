import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Shield, Lock, Mail, AlertCircle, Sparkles, Building2, UserCheck } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('admin@hajjumrah.com')
  const [password, setPassword] = useState('AdminPassword123!')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid login credentials.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const fillAdmin = () => {
    setEmail('admin@hajjumrah.com')
    setPassword('AdminPassword123!')
    setError(null)
  }

  const fillUser = () => {
    setEmail('user@hajjumrah.com')
    setPassword('UserPassword123!')
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-400 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Hajj & Umrah Platform
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Administrative Operations Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@hajjumrah.com"
                leftIcon={<Mail className="h-4 w-4" />}
                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold shadow-md shadow-emerald-600/30"
            >
              Sign In to Admin Portal
            </Button>
          </form>

          {/* Quick-fill testing buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider text-center">
              Quick Fill Credentials (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-900/40 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={fillUser}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Customer User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>Restricted to authorized Hajj & Umrah administrative staff.</span>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
