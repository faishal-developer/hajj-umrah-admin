import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { formatBDT } from '@/lib/utils'
import { type MockVendor } from '@/lib/mock-data'

interface VendorExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  vendors: MockVendor[]
  onSubmit: (payload: {
    vendor_id: string
    category: string
    amount: number
    currency: 'SAR' | 'USD' | 'BDT'
    exchange_rate: number
    description: string
    invoice_number: string
  }) => Promise<void>
}

export const VendorExpenseModal: React.FC<VendorExpenseModalProps> = ({
  isOpen,
  onClose,
  vendors,
  onSubmit,
}) => {
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '')
  const [category, setCategory] = useState('HOTEL')
  const [currency, setCurrency] = useState<'SAR' | 'USD' | 'BDT'>('SAR')
  const [amount, setAmount] = useState<number>(10000)
  const [exchangeRate, setExchangeRate] = useState<number>(32.5)
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCurrencyChange = (newCurr: 'SAR' | 'USD' | 'BDT') => {
    setCurrency(newCurr)
    if (newCurr === 'SAR') setExchangeRate(32.5)
    else if (newCurr === 'USD') setExchangeRate(121.5)
    else setExchangeRate(1.0)
  }

  const bdtAmount = amount * exchangeRate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (amount <= 0) {
      setError('Amount must be greater than zero.')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        vendor_id: vendorId || vendors[0]?.id,
        category,
        amount,
        currency,
        exchange_rate: exchangeRate,
        description,
        invoice_number: invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record expense.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Foreign Currency Vendor Expense"
      description="Record payments to Saudi hotel suppliers, airline charter blocks, visa agencies, or transport vendors."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Vendor / Supplier"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            required
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category})
              </option>
            ))}
          </Select>

          <Select
            label="Expense Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: 'Hotel & Makkah/Madinah Accommodation', value: 'HOTEL' },
              { label: 'Airline Tickets & Charter', value: 'AIRLINE' },
              { label: 'Ground VIP Transport (Buses/Yukons)', value: 'TRANSPORT' },
              { label: 'Saudi MoH & Nusuk Visa Processing', value: 'VISA' },
              { label: 'Catering & Pilgrim Food Supply', value: 'CATERING' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value as 'SAR' | 'USD' | 'BDT')}
            options={[
              { label: 'SAR (Saudi Riyal)', value: 'SAR' },
              { label: 'USD (US Dollar)', value: 'USD' },
              { label: 'BDT (Bangladeshi Taka)', value: 'BDT' },
            ]}
          />

          <Input
            label={`Amount (${currency})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />

          <Input
            label="Exchange Rate (to BDT)"
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
            required
          />
        </div>

        {/* Calculated BDT Cost */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex justify-between items-center text-xs">
          <span className="font-semibold text-emerald-900">
            Calculated Local Cost:
          </span>
          <span className="text-sm font-bold text-emerald-800">
            {formatBDT(bdtAmount)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Supplier Invoice / Agreement #"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="e.g. INV-FAIRMONT-1092"
            required
          />

          <Input
            label="Expense Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Advance 30% deposit for 15 Quad rooms"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  )
}
