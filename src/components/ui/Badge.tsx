import React from 'react'
import { cn, getStatusBadgeVariant } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'blue'
  showDot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant,
  showDot = true,
  children,
  className,
  ...props
}) => {
  if (status) {
    const styling = getStatusBadgeVariant(status)
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
          styling.bg,
          styling.border,
          className
        )}
        {...props}
      >
        {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', styling.dot)} />}
        {children || status.replace(/_/g, ' ')}
      </span>
    )
  }

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }

  const dotStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    indigo: 'bg-indigo-500',
    blue: 'bg-blue-500',
  }

  const chosenVariant = variant || 'slate'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[chosenVariant],
        className
      )}
      {...props}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[chosenVariant])} />}
      {children}
    </span>
  )
}
