import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ban, CheckCircle2, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

export const CancellationsPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: cancellations = [], isLoading } = useQuery({
    queryKey: ['cancellations'],
    queryFn: () => DataService.getCancellations(),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => DataService.approveCancellation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cancellations'] })
      queryClient.invalidateQueries({ queryKey: ['refunds'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <Ban className="h-6 w-6 text-rose-600" />
            <span>Cancellation Requests</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review pilgrim cancellation requests, assess statutory cancellation fees, and trigger refund approval.
          </p>
        </div>
        <Link to="/admin/refunds">
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />}>
            Refunds Management
          </Button>
        </Link>
      </div>

      {/* Cancellations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading cancellation requests...
            </div>
          ) : cancellations.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Ban className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No active cancellation requests</p>
              <p className="text-xs text-slate-400 mt-1">All bookings are in good standing.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Customer / Pilgrim</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Cancellation Fee</TableHead>
                  <TableHead>Est. Refund</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancellations.map((cnl) => (
                  <TableRow key={cnl.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {cnl.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      #{cnl.booking_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{cnl.user_name}</span>
                        {cnl.pilgrim_name && (
                          <span className="text-[11px] text-rose-700 font-medium">
                            Pilgrim: {cnl.pilgrim_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {cnl.reason}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(cnl.total_paid)}
                    </TableCell>
                    <TableCell className="font-semibold text-rose-600">
                      {formatBDT(cnl.cancellation_fee)}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700">
                      {formatBDT(cnl.estimated_refund)}
                    </TableCell>
                    <TableCell>
                      <Badge status={cnl.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(cnl.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {cnl.status === 'REQUESTED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => approveMutation.mutate(cnl.id)}
                          isLoading={approveMutation.isPending}
                        >
                          Approve & Create Refund
                        </Button>
                      ) : (
                        <Link to="/admin/refunds">
                          <Button variant="ghost" size="sm">
                            View Refund
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
export default CancellationsPage
