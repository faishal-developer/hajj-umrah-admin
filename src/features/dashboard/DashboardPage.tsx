import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { DataService } from '@/lib/api-client'
import { formatBDT } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import {
  TrendingUp,
  Users,
  Package,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Plane,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

export const DashboardPage: React.FC = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => DataService.getDashboardSummary(),
  })

  const {
    data: bookings = [],
    isLoading: isBookingsLoading,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => DataService.getBookings(),
  })

  const {
    data: packages = [],
    isLoading: isPackagesLoading,
  } = useQuery({
    queryKey: ['packages'],
    queryFn: () => DataService.getPackages(),
  })

  if (summaryError) {
    return <ErrorBanner message={(summaryError as Error).message} onRetry={refetchSummary} />
  }

  // Chart data: Seat Allocation across packages
  const seatData = packages.map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    Confirmed: p.total_confirmed || 0,
    Held: p.total_held || 0,
    Remaining: Math.max(0, (p.total_quota || 0) - ((p.total_confirmed || 0) + (p.total_held || 0))),
  }))

  const pieData = [
    { name: 'Confirmed Seats', value: summary?.totalConfirmedSeats || 0, color: '#059669' },
    { name: 'Held Reserved', value: summary?.totalHeldSeats || 0, color: '#d97706' },
    {
      name: 'Available Quota',
      value: Math.max(
        0,
        (summary?.totalQuota || 0) - ((summary?.totalConfirmedSeats || 0) + (summary?.totalHeldSeats || 0))
      ),
      color: '#64748b',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time flight quotas, financial collections, pilgrim registrations, and operations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/admin/packages">
            <Button variant="outline" size="sm" leftIcon={<Package className="h-4 w-4" />}>
              Manage Packages
            </Button>
          </Link>
          <Link to="/admin/manifest">
            <Button variant="primary" size="sm" leftIcon={<Plane className="h-4 w-4" />}>
              Flight Manifest
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Collections
            </CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  {formatBDT(summary?.totalRevenue)}
                </div>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span>Realized through gateway & verified manual receipts</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmed Pilgrims */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Confirmed Pilgrims
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  {summary?.confirmedPilgrims || 0}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    / {summary?.totalPilgrims || 0} registered
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {summary?.confirmedBookings || 0} fully paid bookings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Packages */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Published Packages
            </CardTitle>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  {summary?.activePackagesCount || 0}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    / {packages.length} total
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {summary?.totalQuota || 0} total allocated seats
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outstanding Installments */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Installments
            </CardTitle>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-700">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  {formatBDT(summary?.pendingInstallments)}
                </div>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  Due across active payment installment plans
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Seat Occupancy by Package */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Seat Utilization by Package</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of Confirmed, Held (Pending Payment), and Remaining Quotas
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {isPackagesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Confirmed" fill="#059669" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Held" fill="#d97706" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Remaining" fill="#cbd5e1" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Quota Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Quota Distribution</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Total capacity across all packages</p>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-[11px] text-slate-600 font-medium mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span>Confirmed ({summary?.totalConfirmedSeats || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
                    <span>Held ({summary?.totalHeldSeats || 0})</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Recent Booking Transactions</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest pilgrim registrations, tier packages, and payment status.
            </p>
          </div>
          <Link to="/admin/bookings">
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
              View All Bookings
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isBookingsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package / Tier</TableHead>
                  <TableHead>Pilgrims</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 5).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs font-semibold text-slate-900">
                      {booking.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{booking.user_name}</span>
                        <span className="text-[11px] text-slate-500">{booking.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{booking.package_name}</span>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          {booking.tier_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {booking.pilgrim_count} Pax
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {formatBDT(booking.total_amount)}
                    </TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {formatBDT(booking.paid_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge status={booking.status} />
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
export default DashboardPage
