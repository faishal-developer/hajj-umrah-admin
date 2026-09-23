import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ManualPaymentModal } from './components/ManualPaymentModal'
import { Plus, Search, CheckCircle2, XCircle, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react'

export const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [providerFilter, setProviderFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [complianceNotice, setComplianceNotice] = useState<string | null>(null)

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => DataService.getPayments(),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => DataService.getBookings(),
  })

  // Approval mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => DataService.approvePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
      setComplianceNotice('Manual payment approved successfully.')
    },
    onError: (err: Error) => {
      setComplianceNotice(`Approval Blocked: ${err.message}`)
    },
  })

  // Rejection mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => DataService.rejectPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setComplianceNotice('Payment marked as rejected.')
    },
  })

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = providerFilter === 'ALL' || p.provider === providerFilter
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesProvider && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Payments & Offline Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit gateway transactions (bKash, Nagad, Visa) and dual-authorize offline counter cash & cheque receipts.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsManualModalOpen(true)}
        >
          Record Offline Payment
        </Button>
      </div>

      {/* Compliance / Maker-Checker Info Banner */}
      {complianceNotice && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 font-medium animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{complianceNotice}</span>
          </div>
          <button
            onClick={() => setComplianceNotice(null)}
            className="text-amber-800 hover:text-amber-950 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by txn ID, receipt, customer or booking..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          options={[
            { label: 'All Payment Providers', value: 'ALL' },
            { label: 'bKash (MFS)', value: 'BKASH' },
            { label: 'Nagad (MFS)', value: 'NAGAD' },
            { label: 'Visa / Mastercard', value: 'VISA' },
            { label: 'Manual Counter / Bank', value: 'MANUAL' },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Payment Statuses', value: 'ALL' },
            { label: 'Approved / Success', value: 'SUCCESS' },
            { label: 'Pending Approval', value: 'PENDING' },
            { label: 'Rejected', value: 'REJECTED' },
          ]}
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading payment transactions...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CreditCard className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No payment records found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Ref / Txn ID</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider / Channel</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Audit Trail (Maker / Checker)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((pay) => (
                  <TableRow key={pay.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {pay.transaction_id}
                        </span>
                        {pay.receipt_number && (
                          <span className="text-[11px] text-slate-500 font-mono">
                            {pay.receipt_number}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      #{pay.booking_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{pay.user_name}</TableCell>
                    <TableCell>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {pay.provider}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-800">
                      {formatBDT(pay.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px] text-slate-500">
                        {pay.recorded_by_name && (
                          <span>Recorded by: <strong>{pay.recorded_by_name}</strong></span>
                        )}
                        {pay.approved_by_name && (
                          <span className="text-emerald-700 font-medium">
                            Approved by: {pay.approved_by_name}
                          </span>
                        )}
                        {!pay.recorded_by_name && <span>Gateway Webhook Verified</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge status={pay.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(pay.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {pay.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="h-3 w-3" />}
                            onClick={() => approveMutation.mutate(pay.id)}
                            isLoading={approveMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<XCircle className="h-3 w-3" />}
                            onClick={() => rejectMutation.mutate(pay.id)}
                            isLoading={rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Finalized</span>
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Manual Payment Modal */}
      <ManualPaymentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        bookings={bookings}
        onSubmit={async (payload) => {
          await DataService.createManualPayment(payload)
          queryClient.invalidateQueries({ queryKey: ['payments'] })
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
        }}
      />
    </div>
  )
}
export default PaymentsPage
