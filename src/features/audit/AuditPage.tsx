import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { History, Search } from 'lucide-react'

export const AuditPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState('ALL')

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => DataService.getAuditLogs(),
  })

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEntity = entityFilter === 'ALL' || log.entity === entityFilter
    return matchesSearch && matchesEntity
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <History className="h-6 w-6 text-emerald-700" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all administrative actions, quota adjustments, payment authorizations, and security events.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by action, administrator, or record ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:col-span-2"
        />
        <Select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          options={[
            { label: 'All Audited Entities', value: 'ALL' },
            { label: 'Packages', value: 'Package' },
            { label: 'Package Tiers', value: 'PackageTier' },
            { label: 'Payments', value: 'Payment' },
            { label: 'Refunds', value: 'Refund' },
            { label: 'Cancellations', value: 'Cancellation' },
            { label: 'Inventory', value: 'Inventory' },
            { label: 'Vendor Expenses', value: 'VendorExpense' },
            { label: 'Reconciliation', value: 'Reconciliation' },
          ]}
        />
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading security audit trail...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <History className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No audit records found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing search filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Target ID</TableHead>
                  <TableHead>Administrator</TableHead>
                  <TableHead>Diff / Values</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {log.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{log.entity}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      {log.entity_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{log.actor_name}</span>
                        <span className="text-[11px] text-slate-500">{log.actor_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-mono text-slate-600 max-w-xs truncate">
                        {log.new_value ? JSON.stringify(log.new_value) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {log.ip_address}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(log.timestamp)}
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
export default AuditPage
