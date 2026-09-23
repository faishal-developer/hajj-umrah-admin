import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataService } from '@/lib/api-client'
import { formatBDT, formatDateTime } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Boxes, Plus, AlertTriangle, ArrowDownRight, ArrowUpRight, History } from 'lucide-react'

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemId, setItemId] = useState('')
  const [txnType, setTxnType] = useState<'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT'>('ISSUE')
  const [quantity, setQuantity] = useState<number>(10)
  const [recipient, setRecipient] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: inventory = [], isLoading: isInvLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => DataService.getInventory(),
  })

  const { data: txns = [], isLoading: isTxnsLoading } = useQuery({
    queryKey: ['inventory-txns'],
    queryFn: () => DataService.getInventoryTxns(),
  })

  const txnMutation = useMutation({
    mutationFn: (payload: Parameters<typeof DataService.recordInventoryTxn>[0]) =>
      DataService.recordInventoryTxn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-txns'] })
      setIsModalOpen(false)
      setError(null)
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleOpenTxn = (defaultItemId?: string) => {
    setItemId(defaultItemId || inventory[0]?.id || '')
    setQuantity(10)
    setRecipient('')
    setNotes('')
    setError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.')
      return
    }
    txnMutation.mutate({
      item_id: itemId || inventory[0]?.id,
      type: txnType,
      quantity,
      recipient_name: recipient,
      notes,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 flex items-center gap-2.5">
            <Boxes className="h-6 w-6 text-emerald-700" />
            <span>Pilgrim Inventory & Supplies</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track physical inventory on-hand (Ihrams, luggage, Saudi SIM cards) and record issue/return batches.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => handleOpenTxn()}
        >
          Record Stock Transaction
        </Button>
      </div>

      {/* Item Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isInvLoading ? (
          <div className="col-span-4 text-xs text-slate-400">Loading inventory items...</div>
        ) : (
          inventory.map((item) => {
            const isLowStock = item.quantity_on_hand <= item.minimum_threshold
            return (
              <Card key={item.id} className="p-4 space-y-2 border-slate-200 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                    {item.category}
                  </span>
                  {isLowStock ? (
                    <Badge variant="rose" showDot={true}>
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="emerald" showDot={true}>
                      In Stock
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {item.sku}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-slate-900">
                      {item.quantity_on_hand}
                    </span>{' '}
                    <span className="text-xs text-slate-500">{item.unit}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleOpenTxn(item.id)}
                  >
                    Adjust
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Inventory Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <CardTitle>Recent Inventory Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isTxnsLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading inventory logs...</div>
          ) : txns.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <History className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-sm text-slate-800">No stock movements recorded</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Txn ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Recipient / Supplier</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {t.id}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{t.item_name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          t.type === 'PURCHASE'
                            ? 'emerald'
                            : t.type === 'ISSUE'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {t.type === 'ISSUE' ? `-${t.quantity}` : `+${t.quantity}`}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {t.recipient_name || 'Internal Warehouse'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {t.notes || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(t.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Stock Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock Movement"
        description="Issue pilgrim packs, receive vendor stock shipments, or record adjustments."
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <Select
            label="Inventory Item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            required
          >
            {inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} (Stock: {i.quantity_on_hand} {i.unit})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Transaction Type"
              value={txnType}
              onChange={(e) =>
                setTxnType(e.target.value as 'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT')
              }
              options={[
                { label: 'Issue to Pilgrim / Batch', value: 'ISSUE' },
                { label: 'Receive Purchase from Supplier', value: 'PURCHASE' },
                { label: 'Pilgrim Return / Unused', value: 'RETURN' },
                { label: 'Inventory Adjustment (Audit)', value: 'ADJUSTMENT' },
              ]}
            />

            <Input
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <Input
            label="Recipient / Batch Name / Supplier"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. Ramadan Group A / Supplier Name"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Operational Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Distributed during visa handover seminar"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={txnMutation.isPending}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={txnMutation.isPending}>
              Commit Stock Movement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default InventoryPage
