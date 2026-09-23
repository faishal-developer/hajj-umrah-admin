import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CreatePackageModal } from './components/CreatePackageModal'
import { TierModal } from './components/TierModal'
import { type MockPackage, type MockTier } from '@/lib/mock-data'
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Archive,
  Layers,
  Edit2,
  Calendar,
  Building,
} from 'lucide-react'

export const PackagesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [tierModalState, setTierModalState] = useState<{
    isOpen: boolean
    packageId: string
    tier?: MockTier | null
  }>({ isOpen: false, packageId: '' })

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    action: 'publish' | 'archive'
    packageId: string
    packageName: string
  }>({ isOpen: false, action: 'publish', packageId: '', packageName: '' })

  // Query packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => DataService.getPackages(),
  })

  // Mutations
  const createPackageMutation = useMutation({
    mutationFn: (data: Partial<MockPackage>) => DataService.createPackage(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => DataService.publishPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      setConfirmDialog({ ...confirmDialog, isOpen: false })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => DataService.archivePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      setConfirmDialog({ ...confirmDialog, isOpen: false })
    },
  })

  const addTierMutation = useMutation({
    mutationFn: ({ pkgId, data }: { pkgId: string; data: Partial<MockTier> }) =>
      DataService.addTier(pkgId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })

  const updateTierMutation = useMutation({
    mutationFn: ({ tierId, data }: { tierId: string; data: Partial<MockTier> & { version: number } }) =>
      DataService.updateTier(tierId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || pkg.status === statusFilter
    const matchesType = typeFilter === 'ALL' || pkg.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Package & Tier CMS</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Hajj & Umrah package itineraries, multi-tier pricing, quotas, and publish states.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Create New Package
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search packages by name or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Lifecycle Statuses', value: 'ALL' },
            { label: 'Published (Live)', value: 'PUBLISHED' },
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Archived', value: 'ARCHIVED' },
          ]}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { label: 'All Package Types', value: 'ALL' },
            { label: 'Umrah', value: 'UMRAH' },
            { label: 'Ramadan Umrah', value: 'RAMADAN_UMRAH' },
            { label: 'Hajj', value: 'HAJJ' },
            { label: 'Premium Executive Hajj', value: 'PREMIUM_HAJJ' },
          ]}
        />
      </div>

      {/* Packages List Cards */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading packages...</div>
        ) : filteredPackages.length === 0 ? (
          <Card className="p-12 text-center text-slate-500">
            <Package className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-sm text-slate-800">No packages found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters.</p>
          </Card>
        ) : (
          filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden border-slate-200/90 shadow-xs">
              {/* Package Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-950">{pkg.name}</h3>
                    <Badge status={pkg.status} />
                    <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      {pkg.type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Season {pkg.year} • v{pkg.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    {pkg.description || 'No detailed itinerary description provided.'}
                  </p>
                </div>

                {/* Right Actions & Meta */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {formatDate(pkg.departure_date)} → {formatDate(pkg.return_date)}
                    </span>
                  </div>

                  {pkg.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          action: 'publish',
                          packageId: pkg.id,
                          packageName: pkg.name,
                        })
                      }
                    >
                      Publish
                    </Button>
                  )}

                  {pkg.status === 'PUBLISHED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Archive className="h-3.5 w-3.5 text-rose-600" />}
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          action: 'archive',
                          packageId: pkg.id,
                          packageName: pkg.name,
                        })
                      }
                      className="hover:border-rose-300 hover:text-rose-700"
                    >
                      Archive
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() =>
                      setTierModalState({ isOpen: true, packageId: pkg.id, tier: null })
                    }
                  >
                    Add Tier
                  </Button>
                </div>
              </div>

              {/* Tiers Table inside Package */}
              <CardContent className="p-0">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Package Tiers & Seat Allocation ({pkg.tiers?.length || 0})
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>Total Quota: <strong className="text-slate-900">{pkg.total_quota}</strong></span>
                      <span>•</span>
                      <span>Confirmed: <strong className="text-emerald-700">{pkg.total_confirmed}</strong></span>
                      <span>•</span>
                      <span>Held: <strong className="text-amber-700">{pkg.total_held}</strong></span>
                    </div>
                  </div>

                  {(!pkg.tiers || pkg.tiers.length === 0) ? (
                    <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                      No pricing tiers configured yet. Click "Add Tier" to create Economy, Standard, or VIP options.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tier Name</TableHead>
                          <TableHead>Price (BDT)</TableHead>
                          <TableHead>Quota Capacity</TableHead>
                          <TableHead>Seat Status</TableHead>
                          <TableHead>Hotel Accommodations</TableHead>
                          <TableHead>Airline</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pkg.tiers.map((tier) => {
                          const available = Math.max(0, tier.quota - (tier.confirmed_seats + tier.held_seats))
                          return (
                            <TableRow key={tier.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{tier.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">v{tier.version}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-bold text-emerald-800">
                                {formatBDT(tier.price)}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-slate-900">{tier.quota}</span> Seats
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-emerald-700 font-medium">{tier.confirmed_seats} Conf</span>
                                  <span className="text-slate-300">/</span>
                                  <span className="text-amber-700 font-medium">{tier.held_seats} Held</span>
                                  <span className="text-slate-300">/</span>
                                  <span className="text-slate-600 font-semibold">{available} Left</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <Building className="h-3 w-3 text-slate-400" />
                                    {tier.hotel_makkah || 'Makkah: Unspecified'}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    {tier.hotel_madinah || 'Madinah: Unspecified'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-slate-600">
                                {tier.airline || 'Standard Direct'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Edit2 className="h-3 w-3" />}
                                  onClick={() =>
                                    setTierModalState({
                                      isOpen: true,
                                      packageId: pkg.id,
                                      tier,
                                    })
                                  }
                                >
                                  Edit Tier
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Package Modal */}
      <CreatePackageModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (data) => {
          await createPackageMutation.mutateAsync(data)
        }}
      />

      {/* Tier Create/Edit Modal with Optimistic Lock */}
      <TierModal
        isOpen={tierModalState.isOpen}
        onClose={() => setTierModalState({ ...tierModalState, isOpen: false })}
        packageId={tierModalState.packageId}
        tierToEdit={tierModalState.tier}
        onSubmit={async (data) => {
          if (tierModalState.tier) {
            await updateTierMutation.mutateAsync({
              tierId: tierModalState.tier.id,
              data: { ...data, version: tierModalState.tier.version },
            })
          } else {
            await addTierMutation.mutateAsync({
              pkgId: tierModalState.packageId,
              data,
            })
          }
        }}
      />

      {/* Confirmation Dialog for Publish/Archive */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action === 'publish') {
            publishMutation.mutate(confirmDialog.packageId)
          } else {
            archiveMutation.mutate(confirmDialog.packageId)
          }
        }}
        title={confirmDialog.action === 'publish' ? 'Publish Package?' : 'Archive Package?'}
        description={
          confirmDialog.action === 'publish'
            ? `Publishing "${confirmDialog.packageName}" will make it publicly visible to customers and open seat bookings.`
            : `Archiving "${confirmDialog.packageName}" will close all seat bookings and remove it from public view.`
        }
        confirmText={confirmDialog.action === 'publish' ? 'Publish Now' : 'Archive Package'}
        variant={confirmDialog.action === 'publish' ? 'primary' : 'danger'}
        isLoading={publishMutation.isPending || archiveMutation.isPending}
      />
    </div>
  )
}
export default PackagesPage
