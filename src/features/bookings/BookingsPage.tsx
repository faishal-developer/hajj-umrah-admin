import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { BookingDetailModal } from './components/BookingDetailModal'
import { type MockBooking } from '@/lib/mock-data'
import { Search, Eye, Users, FileSpreadsheet } from 'lucide-react'
import { Link } from 'react-router-dom'

export const BookingsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => DataService.getBookings(),
  })

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.package_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Bookings Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit all customer package reservations, seat hold timers, and payment progress.
          </p>
        </div>
        <Link to="/admin/manifest">
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
            Open Airline Manifest
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by ID, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:col-span-2"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Booking Statuses', value: 'ALL' },
            { label: 'Confirmed (Paid / Allocated)', value: 'CONFIRMED' },
            { label: 'Partially Paid (Installment)', value: 'PARTIALLY_PAID' },
            { label: 'Held (Pending Initial Pay)', value: 'HELD' },
            { label: 'Defaulted / Expired', value: 'DEFAULTED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
        />
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Loading bookings registry...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No bookings matching criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing search filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package / Tier</TableHead>
                  <TableHead>Pilgrims</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {b.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{b.user_name}</span>
                        <span className="text-[11px] text-slate-500">{b.user_email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{b.package_name}</span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {b.tier_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {b.pilgrim_count} Pax
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {formatBDT(b.total_amount)}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-800">
                      {formatBDT(b.paid_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge status={b.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(b.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                        onClick={() => setSelectedBooking(b)}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
      />
    </div>
  )
}
export default BookingsPage
