import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Scale, CheckCircle2, ShieldCheck } from 'lucide-react'

export const ReconciliationPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['reconciliation'],
    queryFn: () => DataService.getReconciliation(),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => DataService.resolveReconciliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] })
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-emerald-700" />
            <span>Payment Gateway Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit discrepancies between internal ledger transactions and gateway settlement reports (bKash, Nagad, Visa).
          </p>
        </div>
      </div>

      {/* Reconciliation Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading reconciliation records...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Scale className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">All gateways fully reconciled</p>
              <p className="text-xs text-slate-400 mt-1">Zero pending settlement discrepancies.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recon ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Gateway Txn ID</TableHead>
                  <TableHead>Internal Ledger</TableHead>
                  <TableHead>Gateway Settlement</TableHead>
                  <TableHead>Discrepancy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Audit Info</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {r.id}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {r.provider}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800">
                      {r.gateway_transaction_id}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(r.internal_amount)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(r.gateway_amount)}
                    </TableCell>
                    <TableCell>
                      {r.difference !== 0 ? (
                        <span className="font-bold text-rose-600">
                          {formatBDT(r.difference)}
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-700">৳0 (Match)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-[11px] text-slate-500">
                        {r.resolved_by && (
                          <span>Resolved by: <strong>{r.resolved_by}</strong></span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(r.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status !== 'RESOLVED' && r.status !== 'MATCHED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => resolveMutation.mutate(r.id)}
                          isLoading={resolveMutation.isPending}
                        >
                          Resolve & Clear
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Cleared</span>
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
    </div>
  )
}
export default ReconciliationPage
