import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { type MockBooking } from '@/lib/mock-data'
import { formatBDT } from '@/lib/utils'

interface ManualPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  bookings: MockBooking[]
  onSubmit: (payload: {
    booking_id: string
    amount: number
    receipt_number: string
    notes?: string
  }) => Promise<void>
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onSubmit,
}) => {
  const [bookingId, setBookingId] = useState(bookings[0]?.id || '')
  const [amount, setAmount] = useState<number>(50000)
  const [receiptNumber, setReceiptNumber] = useState(`RCPT-${Date.now().toString().slice(-4)}`)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedBooking = bookings.find((b) => b.id === bookingId) || bookings[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amount <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        booking_id: bookingId || bookings[0]?.id,
        amount,
        receipt_number: receiptNumber,
        notes,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record manual payment.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Offline / Manual Payment"
      description="Record bank transfer, cash, or cheque received at head office or branch counter."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <Select
          label="Target Customer Booking"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          required
        >
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>
              #{b.id} — {b.user_name} ({b.package_name}) [Due: {formatBDT(b.total_amount - b.paid_amount)}]
            </option>
          ))}
        </Select>

        {selectedBooking && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex justify-between items-center">
            <span>
              Total Cost: <strong>{formatBDT(selectedBooking.total_amount)}</strong>
            </span>
            <span>
              Already Paid: <strong className="text-emerald-700">{formatBDT(selectedBooking.paid_amount)}</strong>
            </span>
            <span>
              Remaining Balance:{' '}
              <strong className="text-amber-700">
                {formatBDT(Math.max(0, selectedBooking.total_amount - selectedBooking.paid_amount))}
              </strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Received Amount (BDT)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />

          <Input
            label="Physical Receipt / Cheque No."
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Payment Notes & Bank Branch
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Received cash at Banani branch counter / Eastern Bank deposit slip #8910"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Record Payment (Requires Approval)
          </Button>
        </div>
      </form>
    </Modal>
  )
}
