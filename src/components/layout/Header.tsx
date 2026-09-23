import React from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Breadcrumbs } from './Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { LogOut, ShieldCheck, User } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Breadcrumbs />
      </div>

      {/* Right: Admin User Profile & Actions */}
      <div className="flex items-center gap-4">
        {/* Admin Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Role: {user?.role || 'ADMIN'}</span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs ring-1 ring-slate-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
              {user?.email || 'admin@hajjumrah.com'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            title="Sign Out"
            leftIcon={<LogOut className="h-4 w-4 text-slate-500 hover:text-rose-600" />}
            className="ml-1 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
