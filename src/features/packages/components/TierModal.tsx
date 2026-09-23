import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { type MockTier } from '@/lib/mock-data'
import { AlertCircle, Lock } from 'lucide-react'

interface TierModalProps {
  isOpen: boolean
  onClose: () => void
  packageId: string
  tierToEdit?: MockTier | null
  onSubmit: (tierData: Partial<MockTier> & { version?: number }) => Promise<void>
}

interface TierFormProps {
  tierToEdit?: MockTier | null
  onSubmit: (tierData: Partial<MockTier> & { version?: number }) => Promise<void>
  onClose: () => void
}

const TierForm: React.FC<TierFormProps> = ({ tierToEdit, onSubmit, onClose }) => {
  const [name, setName] = useState(tierToEdit?.name || '')
  const [price, setPrice] = useState(tierToEdit?.price ?? 200000)
  const [quota, setQuota] = useState(tierToEdit?.quota ?? 50)
  const [hotelMakkah, setHotelMakkah] = useState(tierToEdit?.hotel_makkah || '')
  const [hotelMadinah, setHotelMadinah] = useState(tierToEdit?.hotel_madinah || '')
  const [airline, setAirline] = useState(tierToEdit?.airline || 'Saudia Airline')
  const [description, setDescription] = useState(tierToEdit?.description || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (tierToEdit && quota < tierToEdit.confirmed_seats) {
      setError(`Cannot reduce quota below currently confirmed seats (${tierToEdit.confirmed_seats}).`)
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name,
        price,
        quota,
        hotel_makkah: hotelMakkah,
        hotel_madinah: hotelMadinah,
        airline,
        description,
        version: tierToEdit ? tierToEdit.version : 1,
      })
      onClose()
    } catch (err: unknown) {
      const isConflict = (err as { status?: number })?.status === 409
      if (isConflict) {
        setError('Data conflict: This tier was updated by another administrator. Please refresh the page.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save tier.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tierToEdit && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 font-mono">
          <Lock className="h-3.5 w-3.5 text-slate-500" />
          <span>Optimistic Locking Active (Record Version: v{tierToEdit.version})</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Tier Name"
          placeholder="e.g. VIP Royal, Economy, Standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Price per Pilgrim (BDT)"
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
          required
        />

        <Input
          label="Total Seat Quota"
          type="number"
          value={quota}
          onChange={(e) => setQuota(parseInt(e.target.value) || 0)}
          required
          helperText={
            tierToEdit
              ? `Confirmed: ${tierToEdit.confirmed_seats} | Held: ${tierToEdit.held_seats}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Makkah Hotel"
          placeholder="e.g. Fairmont Makkah (5-Star)"
          value={hotelMakkah}
          onChange={(e) => setHotelMakkah(e.target.value)}
        />

        <Input
          label="Madinah Hotel"
          placeholder="e.g. The Oberoi Madinah (5-Star)"
          value={hotelMadinah}
          onChange={(e) => setHotelMadinah(e.target.value)}
        />
      </div>

      <Input
        label="Airline / Flight Partner"
        placeholder="e.g. Saudia Direct / Biman Bangladesh"
        value={airline}
        onChange={(e) => setAirline(e.target.value)}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Tier Inclusions & Room Type
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Room sharing details, Kaaba view, buffet breakfast, VIP bus transfers..."
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
          {tierToEdit ? 'Save Changes' : 'Create Tier'}
        </Button>
      </div>
    </form>
  )
}

export const TierModal: React.FC<TierModalProps> = ({
  isOpen,
  onClose,
  tierToEdit,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tierToEdit ? `Edit Tier: ${tierToEdit.name}` : 'Add Package Tier'}
      description="Configure pricing, seat quota, hotel distance, and flight accommodations."
      size="lg"
    >
      {isOpen && (
        <TierForm
          key={tierToEdit ? tierToEdit.id : 'new'}
          tierToEdit={tierToEdit}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
