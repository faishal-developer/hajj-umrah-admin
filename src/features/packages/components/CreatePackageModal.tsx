import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { type MockPackage } from '@/lib/mock-data'

interface CreatePackageModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<MockPackage>) => Promise<void>
}

export const CreatePackageModal: React.FC<CreatePackageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<MockPackage['type']>('UMRAH')
  const [year, setYear] = useState(2027)
  const [departureDate, setDepartureDate] = useState('2027-04-10')
  const [returnDate, setReturnDate] = useState('2027-04-25')
  const [bookingStartDate, setBookingStartDate] = useState(new Date().toISOString().split('T')[0])
  const [bookingClosingDate, setBookingClosingDate] = useState('2027-03-25')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (new Date(departureDate) >= new Date(returnDate)) {
      setError('Departure date must be before return date.')
      return
    }

    if (new Date(bookingStartDate) >= new Date(bookingClosingDate)) {
      setError('Booking start date must be before booking closing date.')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        name,
        type,
        year,
        departure_date: departureDate,
        return_date: returnDate,
        booking_start_date: bookingStartDate,
        booking_closing_date: bookingClosingDate,
        description,
      })
      onClose()
      setName('')
      setDescription('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create package')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Package"
      description="Define general package itinerary dates, season year, and flight schedule."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Package Name"
            placeholder="e.g. Ramadan Special 1448H"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Package Type"
            value={type}
            onChange={(e) => setType(e.target.value as MockPackage['type'])}
            options={[
              { label: 'Umrah (Classic)', value: 'UMRAH' },
              { label: 'Ramadan Umrah', value: 'RAMADAN_UMRAH' },
              { label: 'Hajj (Standard)', value: 'HAJJ' },
              { label: 'Premium Executive Hajj', value: 'PREMIUM_HAJJ' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Season Year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || 2027)}
            required
          />

          <Input
            label="Departure Date"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />

          <Input
            label="Return Date"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Booking Opening Date"
            type="date"
            value={bookingStartDate}
            onChange={(e) => setBookingStartDate(e.target.value)}
            required
          />

          <Input
            label="Booking Closing Date"
            type="date"
            value={bookingClosingDate}
            onChange={(e) => setBookingClosingDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Package Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide overview of itinerary, spiritual guidance, and holy site visits..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Create Package (Draft)
          </Button>
        </div>
      </form>
    </Modal>
  )
}
