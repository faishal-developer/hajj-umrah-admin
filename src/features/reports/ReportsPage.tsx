import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { BarChart3, Printer, Download, TrendingUp, Users, Package, CreditCard } from 'lucide-react'

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'COLLECTIONS' | 'BOOKINGS' | 'SEATS'>('COLLECTIONS')

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => DataService.getDashboardSummary(),
  })

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => DataService.getPackages(),
  })

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => DataService.getBookings(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-emerald-700" />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive financial collection ledgers, seat occupancy reports, and operational audits.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Printer className="h-4 w-4" />}
          onClick={() => window.print()}
        >
          Print Report
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveTab('COLLECTIONS')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
            activeTab === 'COLLECTIONS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Financial Collections & Installments</span>
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
            activeTab === 'BOOKINGS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Bookings & Pilgrim Demographics</span>
        </button>
        <button
          onClick={() => setActiveTab('SEATS')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
            activeTab === 'SEATS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Flight Seat Allocation & Remaining</span>
        </button>
      </div>

      {/* Tab: Collections */}
      {activeTab === 'COLLECTIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Revenue Realized</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatBDT(summary?.totalRevenue)}
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-semibold">Outstanding Installments</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {formatBDT(summary?.pendingInstallments)}
              </div>
            </Card>
            <Card className="p-4 border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-semibold">Disbursed Refunds</span>
              <div className="text-2xl font-bold text-rose-700 mt-1">
                {formatBDT(summary?.totalRefunds)}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collections by Package Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Total Bookings</TableHead>
                    <TableHead>Total Contract Value</TableHead>
                    <TableHead>Realized Payments</TableHead>
                    <TableHead>Outstanding Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => {
                    const pkgBookings = bookings.filter((b) => b.package_id === pkg.id)
                    const totalVal = pkgBookings.reduce((s, b) => s + b.total_amount, 0)
                    const totalPaid = pkgBookings.reduce((s, b) => s + b.paid_amount, 0)
                    return (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-bold text-slate-900">{pkg.name}</TableCell>
                        <TableCell>{pkgBookings.length} Bookings</TableCell>
                        <TableCell className="font-semibold text-slate-900">{formatBDT(totalVal)}</TableCell>
                        <TableCell className="font-bold text-emerald-800">{formatBDT(totalPaid)}</TableCell>
                        <TableCell className="font-bold text-amber-700">{formatBDT(Math.max(0, totalVal - totalPaid))}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Bookings */}
      {activeTab === 'BOOKINGS' && (
        <Card>
          <CardHeader>
            <CardTitle>Master Pilgrim Registrations ({bookings.length} Bookings)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Pilgrim Count</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono font-bold text-xs">{b.id}</TableCell>
                    <TableCell className="font-semibold">{b.user_name}</TableCell>
                    <TableCell>{b.package_name}</TableCell>
                    <TableCell>{b.pilgrim_count} Pax</TableCell>
                    <TableCell className="font-bold text-emerald-700">{b.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab: Seats */}
      {activeTab === 'SEATS' && (
        <Card>
          <CardHeader>
            <CardTitle>Flight Seat Quota Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Total Quota Capacity</TableHead>
                  <TableHead>Confirmed Seats</TableHead>
                  <TableHead>Held Seats</TableHead>
                  <TableHead>Available Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => {
                  const available = Math.max(0, (pkg.total_quota || 0) - ((pkg.total_confirmed || 0) + (pkg.total_held || 0)))
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-bold text-slate-900">{pkg.name}</TableCell>
                      <TableCell className="font-semibold">{pkg.total_quota} Seats</TableCell>
                      <TableCell className="font-bold text-emerald-700">{pkg.total_confirmed} Confirmed</TableCell>
                      <TableCell className="font-bold text-amber-700">{pkg.total_held} Held</TableCell>
                      <TableCell className="font-bold text-slate-800">{available} Available</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
export default ReportsPage
