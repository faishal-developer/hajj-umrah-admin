import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatBDT } from '@/lib/utils'
import { type MockRefund } from '@/lib/mock-data'
import { AlertCircle, ShieldAlert } from 'lucide-react'

interface ProcessRefundModalProps {
  isOpen: boolean
  onClose: () => void
  refund: MockRefund | null
  onSubmit: (refundId: string, payload: { refund_amount: number; notes?: string }) => Promise<void>
}

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  isOpen,
  onClose,
  refund,
  onSubmit,
}) => {
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (refund) {
      setRefundAmount(refund.refund_amount)
      setNotes('')
    }
    setError(null)
  }, [refund, isOpen])

  if (!refund) return null

  const maxAllowableRefund = Math.max(0, refund.total_paid - refund.cancellation_fee)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (refundAmount <= 0) {
      setError('Refund amount must be greater than 0.')
      return
    }

    if (refundAmount > maxAllowableRefund) {
      setError(
        `Validation Failed: Refund amount (${formatBDT(refundAmount)}) cannot exceed Total Paid (${formatBDT(refund.total_paid)}) minus Cancellation Fee (${formatBDT(refund.cancellation_fee)}) = ${formatBDT(maxAllowableRefund)}.`
      )
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(refund.id, { refund_amount: refundAmount, notes })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process refund.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Refund: #${refund.id}`}
      description="Disburse approved refund via Bank BEFTN / Gateway reversal."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Financial Rules Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700">
            <ShieldAlert className="h-4 w-4 text-emerald-700" />
            <span>Financial Refund Guard</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Paid</span>
              <strong className="text-slate-900">{formatBDT(refund.total_paid)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Cancellation Fee</span>
              <strong className="text-rose-600">-{formatBDT(refund.cancellation_fee)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Max Allowable</span>
              <strong className="text-emerald-700">{formatBDT(maxAllowableRefund)}</strong>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Disbursed Refund Amount (BDT)"
          type="number"
          value={refundAmount}
          onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
          helperText={`Must be ≤ ${formatBDT(maxAllowableRefund)}`}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Disbursement Reference & Bank Routing
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. BEFTN Trx #982341 dispatched to Islami Bank A/C 2050..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Confirm Disbursement
          </Button>
        </div>
      </form>
    </Modal>
  )
}
