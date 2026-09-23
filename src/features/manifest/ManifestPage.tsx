import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Download, Printer, Search, Users, Plane } from 'lucide-react'

export const ManifestPage: React.FC = () => {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('ALL')

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => DataService.getPackages(),
  })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => DataService.getBookings(),
  })

  // Extract all pilgrims across bookings
  const allPilgrims = bookings.flatMap((b) =>
    (b.pilgrims || []).map((p) => ({
      ...p,
      bookingRef: b.id,
      customerName: b.user_name,
      customerEmail: b.user_email,
      packageId: b.package_id,
      packageName: b.package_name,
      tierName: b.tier_name,
      bookingStatus: b.status,
    }))
  )

  const filteredPilgrims = allPilgrims.filter((p) => {
    const matchesPackage = selectedPackageId === 'ALL' || p.packageId === selectedPackageId
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.passport_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter
    return matchesPackage && matchesSearch && matchesGender
  })

  const exportCSV = () => {
    const headers = [
      'Sl No',
      'Pilgrim Name',
      'Passport Number',
      'Nationality',
      'Gender',
      'Date of Birth',
      'Package',
      'Tier',
      'Booking Ref',
      'Primary Contact',
      'Visa Status',
    ]

    const rows = filteredPilgrims.map((p, idx) => [
      idx + 1,
      `"${p.name}"`,
      p.passport_number,
      p.nationality,
      p.gender,
      p.dob,
      `"${p.packageName}"`,
      `"${p.tierName}"`,
      p.bookingRef,
      `"${p.customerName}"`,
      p.status,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `Pilgrim_Manifest_${selectedPackageId}_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <Plane className="h-6 w-6 text-emerald-700" />
            <span>Official Pilgrim Manifest</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Airline passenger manifest, group visa processing records, and immigration export list.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4 text-emerald-700" />}
            onClick={exportCSV}
          >
            Export Manifest (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print Passenger List
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
        <Select
          label="Filter by Package"
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          options={[
            { label: 'All Packages (Master Manifest)', value: 'ALL' },
            ...packages.map((pkg) => ({ label: pkg.name, value: pkg.id })),
          ]}
        />
        <Input
          label="Search Pilgrims / Passports"
          placeholder="Passport no, name, or booking ref..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="sm:col-span-2"
        />
        <Select
          label="Gender"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          options={[
            { label: 'All Genders', value: 'ALL' },
            { label: 'Male', value: 'MALE' },
            { label: 'Female', value: 'FEMALE' },
          ]}
        />
      </div>

      {/* Printable Manifest Header */}
      <div className="hidden print-only mb-6 border-b border-slate-300 pb-4">
        <h2 className="text-xl font-bold text-slate-900">HAJJ & UMRAH PASSENGER MANIFEST</h2>
        <p className="text-xs text-slate-600">
          Generated on: {new Date().toLocaleString()} | Filter: {selectedPackageId}
        </p>
      </div>

      {/* Manifest Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle>Passenger Records ({filteredPilgrims.length} Pilgrims)</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified passport records and flight boarding designations.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              Generating manifest...
            </div>
          ) : filteredPilgrims.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No pilgrim records found</p>
              <p className="text-xs text-slate-400 mt-1">
                Select a package with confirmed registrations or adjust search filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Pilgrim Full Name</TableHead>
                  <TableHead>Passport No</TableHead>
                  <TableHead>Gender / Nationality</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Package / Tier</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Visa / Ticket Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPilgrims.map((p, index) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <span className="font-bold text-slate-900">{p.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-800">
                      {p.passport_number}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {p.gender} • {p.nationality}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{formatDate(p.dob)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{p.packageName}</span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {p.tierName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {p.bookingRef}
                    </TableCell>
                    <TableCell>
                      <Badge
                        status={
                          p.status === 'VISA_ISSUED' || p.status === 'TICKETED'
                            ? 'CONFIRMED'
                            : 'PENDING'
                        }
                      >
                        {p.status.replace('_', ' ')}
                      </Badge>
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
export default ManifestPage
