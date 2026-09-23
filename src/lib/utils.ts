import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBDT(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatCurrency(amount: number | string | undefined | null, currency: string = 'BDT'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatSAR(amount: number | string | undefined | null): string {
  return formatCurrency(amount, 'SAR')
}

export function formatUSD(amount: number | string | undefined | null): string {
  return formatCurrency(amount, 'USD')
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return String(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return '—'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return String(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getStatusBadgeVariant(status: string): {
  bg: string
  text: string
  border: string
  dot: string
} {
  const normalized = (status || '').toUpperCase()

  switch (normalized) {
    case 'PUBLISHED':
    case 'CONFIRMED':
    case 'APPROVED':
    case 'ACTIVE':
    case 'PAID':
    case 'MATCHED':
    case 'RESOLVED':
    case 'SUCCESS':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      }
    case 'PARTIALLY_PAID':
    case 'HELD':
    case 'PROCESSING':
    case 'REQUESTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return {
        bg: 'bg-amber-50 text-amber-700',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      }
    case 'DRAFT':
    case 'ARCHIVED':
    case 'CANCELLED':
    case 'DEFAULTED':
    case 'FAILED':
    case 'REJECTED':
    case 'MISMATCH':
    case 'SUSPENDED':
      return {
        bg: 'bg-rose-50 text-rose-700',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      }
    default:
      return {
        bg: 'bg-slate-50 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      }
  }
}
