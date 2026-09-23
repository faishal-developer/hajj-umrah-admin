import React from 'react'
import { AlertOctagon, RotateCw } from 'lucide-react'
import { Button } from './Button'

export interface ErrorBannerProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Failed to load data',
  message,
  onRetry,
}) => {
  return (
    <div className="flex items-start justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
      <div className="flex items-start gap-3">
        <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
          <p className="mt-0.5 text-xs text-rose-700 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCw className="h-3.5 w-3.5" />}
          className="border-rose-300 bg-white text-rose-700 hover:bg-rose-100/60 shrink-0"
        >
          Retry
        </Button>
      )}
    </div>
  )
}
