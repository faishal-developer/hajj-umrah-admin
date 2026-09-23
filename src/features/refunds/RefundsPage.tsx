import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProcessRefundModal } from './components/ProcessRefundModal'
import { type MockRefund } from '@/lib/mock-data'
import { RotateCcw, ShieldCheck, ArrowRight } from 'lucide-react'

export const RefundsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [selectedRefund, setSelectedRefund] = useState<MockRefund | null>(null)

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['refunds'],
    queryFn: () => DataService.getRefunds(),
  })

  const processMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { refund_amount: number; notes?: string } }) =>
      DataService.processRefund(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <RotateCcw className="h-6 w-6 text-emerald-700" />
            <span>Refunds Lifecycle</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit approved cancellation refunds and process outward financial disbursements.
          </p>
        </div>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading refund records...
            </div>
          ) : refunds.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <RotateCcw className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No refunds pending</p>
              <p className="text-xs text-slate-400 mt-1">All approved refunds have been disbursed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Refund ID</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Cancellation Fee</TableHead>
                  <TableHead>Refund Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audit Log</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {ref.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      #{ref.booking_id}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{ref.user_name}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(ref.total_paid)}
                    </TableCell>
                    <TableCell className="font-semibold text-rose-600">
                      -{formatBDT(ref.cancellation_fee)}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700">
                      {formatBDT(ref.refund_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge status={ref.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px] text-slate-500">
                        {ref.processed_by && (
                          <span>Processed by: <strong>{ref.processed_by}</strong></span>
                        )}
                        {ref.processed_at && (
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(ref.processed_at)}
                          </span>
                        )}
                        {!ref.processed_by && <span>Awaiting bank disbursement</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {ref.status !== 'COMPLETED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ArrowRight className="h-3.5 w-3.5" />}
                          onClick={() => setSelectedRefund(ref)}
                        >
                          Process Payout
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Disbursed</span>
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

      {/* Process Refund Modal */}
      <ProcessRefundModal
        isOpen={!!selectedRefund}
        onClose={() => setSelectedRefund(null)}
        refund={selectedRefund}
        onSubmit={async (id, payload) => {
          await processMutation.mutateAsync({ id, payload })
        }}
      />
    </div>
  )
}
export default RefundsPage
