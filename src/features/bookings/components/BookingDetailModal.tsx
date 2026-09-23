import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { formatBDT, formatDate, formatDateTime } from '@/lib/utils'
import { type MockBooking } from '@/lib/mock-data'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { User, CreditCard, Calendar, ShieldCheck } from 'lucide-react'

interface BookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  booking: MockBooking | null
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  if (!booking) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking Details: #${booking.id}`}
      description={`Created on ${formatDateTime(booking.created_at)}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
              <User className="h-3.5 w-3.5 text-emerald-700" />
              <span>Primary Customer</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{booking.user_name}</p>
            <p className="text-xs text-slate-500">{booking.user_email}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span>Selected Package</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{booking.package_name}</p>
            <p className="text-xs font-semibold text-emerald-700">{booking.tier_name}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase">
              <CreditCard className="h-3.5 w-3.5 text-emerald-700" />
              <span>Payment Progress</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                {formatBDT(booking.paid_amount)} / {formatBDT(booking.total_amount)}
              </span>
              <Badge status={booking.status} />
            </div>
            <p className="text-[11px] text-slate-500">
              Mode: {booking.payment_mode === 'FULL' ? '100% Upfront Payment' : 'Installment Plan'}
            </p>
          </div>
        </div>

        {/* Pilgrims Manifest */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Registered Pilgrims ({booking.pilgrims?.length || 0})</span>
            </h4>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pilgrim Full Name</TableHead>
                <TableHead>Passport No.</TableHead>
                <TableHead>Gender / Nationality</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Visa & Ticket Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {booking.pilgrims?.map((plg) => (
                <TableRow key={plg.id}>
                  <TableCell className="font-bold text-slate-900">{plg.name}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {plg.passport_number}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {plg.gender} • {plg.nationality}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{formatDate(plg.dob)}</TableCell>
                  <TableCell>
                    <Badge
                      status={plg.status === 'VISA_ISSUED' || plg.status === 'TICKETED' ? 'CONFIRMED' : 'PENDING'}
                    >
                      {plg.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Installment Schedule if Applicable */}
        {booking.installments && booking.installments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              <span>Installment Payment Schedule</span>
            </h4>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Installment #</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.installments.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-semibold text-slate-800">
                      Installment #{inst.sequence}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{formatDate(inst.due_date)}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(inst.amount_due)}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {formatBDT(inst.amount_paid)}
                    </TableCell>
                    <TableCell>
                      <Badge status={inst.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Modal>
  )
}
