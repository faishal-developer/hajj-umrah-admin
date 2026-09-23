import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { VendorExpenseModal } from './components/VendorExpenseModal'
import { Building2, Plus, DollarSign, Hotel, Plane, Bus, FileCheck } from 'lucide-react'

export const VendorsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => DataService.getVendors(),
  })

  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['vendor-expenses'],
    queryFn: () => DataService.getVendorExpenses(),
  })

  const createExpenseMutation = useMutation({
    mutationFn: (payload: Parameters<typeof DataService.createVendorExpense>[0]) =>
      DataService.createVendorExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })

  const totalExpensesBDT = expenses.reduce((sum, e) => sum + e.bdt_amount, 0)

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'HOTEL':
        return <Hotel className="h-4 w-4 text-amber-600" />
      case 'AIRLINE':
        return <Plane className="h-4 w-4 text-blue-600" />
      case 'TRANSPORT':
        return <Bus className="h-4 w-4 text-emerald-600" />
      default:
        return <FileCheck className="h-4 w-4 text-indigo-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-emerald-700" />
            <span>Vendors & Foreign Expenses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track foreign currency commitments (SAR, USD, BDT), hotel booking deposits, and airline charters.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Record Vendor Expense
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Vendor Outflow
            </CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">
              {formatBDT(totalExpensesBDT)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Converted at recorded exchange rates
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Suppliers
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{vendors.length} Vendors</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Hotels, Airlines, Transport & Nusuk Visa
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Expense Invoices
            </CardTitle>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <FileCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-950">{expenses.length} Records</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Audited against procurement contracts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Overview Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Registered Suppliers ({vendors.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isVendorsLoading ? (
            <div className="col-span-3 text-xs text-slate-400">Loading vendors...</div>
          ) : (
            vendors.map((v) => (
              <Card key={v.id} className="p-4 space-y-2 border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(v.category)}
                    <h4 className="text-sm font-bold text-slate-900">{v.name}</h4>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {v.currency}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>Contact: {v.contact_person}</p>
                  <p className="truncate">Email: {v.email}</p>
                  <p>Phone: {v.phone}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Total BDT Paid:</span>
                  <span className="font-bold text-slate-900">{formatBDT(v.total_expenses_bdt)}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Expenses Breakdown Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle>Foreign Currency Expenses Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isExpensesLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading expenses ledger...</div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileCheck className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No expense records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Foreign Amount</TableHead>
                  <TableHead>Exchange Rate</TableHead>
                  <TableHead>Converted Cost (BDT)</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {e.invoice_number}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">{e.vendor_name}</TableCell>
                    <TableCell>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatCurrency(e.amount, e.currency)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">
                      1 {e.currency} = {e.exchange_rate} BDT
                    </TableCell>
                    <TableCell className="font-bold text-emerald-800">
                      {formatBDT(e.bdt_amount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {e.description}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(e.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Expense Modal */}
      <VendorExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendors={vendors}
        onSubmit={async (payload) => {
          await createExpenseMutation.mutateAsync(payload)
        }}
      />
    </div>
  )
}
export default VendorsPage
