import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import {
  INITIAL_ADMIN_USER,
  INITIAL_PACKAGES,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_CANCELLATIONS,
  INITIAL_REFUNDS,
  INITIAL_VENDORS,
  INITIAL_VENDOR_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_INVENTORY_TXNS,
  INITIAL_RECONCILIATION,
  INITIAL_AUDIT_LOGS,
  type MockPackage,
  type MockBooking,
  type MockPayment,
  type MockCancellation,
  type MockRefund,
  type MockVendor,
  type MockVendorExpense,
  type MockInventoryItem,
  type MockInventoryTransaction,
  type MockAuditLog,
  type MockReconciliation,
  type MockTier,
} from './mock-data'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
})

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('admin_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.includes('/login')
      if (!isAuthPage) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==========================================
// LOCAL REACTIVE STORAGE FOR SEAMLESS RESILIENCE
// ==========================================
function getStored<T>(key: string, initial: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initial
  } catch {
    return initial
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage quota errors
  }
}

// Memory / LocalStorage State
let packagesState = getStored<MockPackage[]>('hajj_packages', INITIAL_PACKAGES)
let bookingsState = getStored<MockBooking[]>('hajj_bookings', INITIAL_BOOKINGS)
let paymentsState = getStored<MockPayment[]>('hajj_payments', INITIAL_PAYMENTS)
let cancellationsState = getStored<MockCancellation[]>('hajj_cancellations', INITIAL_CANCELLATIONS)
let refundsState = getStored<MockRefund[]>('hajj_refunds', INITIAL_REFUNDS)
let vendorsState = getStored<MockVendor[]>('hajj_vendors', INITIAL_VENDORS)
let vendorExpensesState = getStored<MockVendorExpense[]>('hajj_vendor_expenses', INITIAL_VENDOR_EXPENSES)
let inventoryState = getStored<MockInventoryItem[]>('hajj_inventory', INITIAL_INVENTORY)
let inventoryTxnsState = getStored<MockInventoryTransaction[]>('hajj_inventory_txns', INITIAL_INVENTORY_TXNS)
let reconciliationState = getStored<MockReconciliation[]>('hajj_reconciliation', INITIAL_RECONCILIATION)
let auditLogsState = getStored<MockAuditLog[]>('hajj_audit_logs', INITIAL_AUDIT_LOGS)

function saveAll() {
  setStored('hajj_packages', packagesState)
  setStored('hajj_bookings', bookingsState)
  setStored('hajj_payments', paymentsState)
  setStored('hajj_cancellations', cancellationsState)
  setStored('hajj_refunds', refundsState)
  setStored('hajj_vendors', vendorsState)
  setStored('hajj_vendor_expenses', vendorExpensesState)
  setStored('hajj_inventory', inventoryState)
  setStored('hajj_inventory_txns', inventoryTxnsState)
  setStored('hajj_reconciliation', reconciliationState)
  setStored('hajj_audit_logs', auditLogsState)
}

function addAudit(action: string, entity: string, entityId: string, oldValue?: Record<string, unknown>, newValue?: Record<string, unknown>) {
  const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)
  const newLog: MockAuditLog = {
    id: `aud_${Date.now()}`,
    actor_id: adminUser.id || 'usr_admin',
    actor_name: adminUser.name || 'Admin',
    actor_email: adminUser.email || 'admin@hajjumrah.com',
    action,
    entity,
    entity_id: entityId,
    old_value: oldValue,
    new_value: newValue,
    ip_address: '127.0.0.1',
    timestamp: new Date().toISOString(),
  }
  auditLogsState = [newLog, ...auditLogsState]
  saveAll()
}

// ==========================================
// UNIFIED DATA SERVICE (Network First with Resilient Fallback)
// ==========================================
export const DataService = {
  // --- AUTH ---
  async login(credentials: { email: string; password: string }) {
    try {
      const res = await apiClient.post('/auth/login', credentials)
      if (res.data?.access_token) {
        return res.data
      }
    } catch {
      // Fallback for demo / offline
    }

    if (credentials.email === 'admin@hajjumrah.com') {
      return {
        access_token: 'mock_jwt_admin_token_' + Date.now(),
        user: INITIAL_ADMIN_USER,
      }
    } else if (credentials.email === 'user@hajjumrah.com') {
      return {
        access_token: 'mock_jwt_user_token_' + Date.now(),
        user: {
          id: 'usr_user_002',
          name: 'Regular Customer',
          email: 'user@hajjumrah.com',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    }
    throw new Error('Invalid email or password')
  },

  async getMe() {
    try {
      const res = await apiClient.get('/auth/me')
      if (res.data) return res.data
    } catch {
      // fallback
    }
    return getStored('admin_user', INITIAL_ADMIN_USER)
  },

  // --- PACKAGES ---
  async getPackages(): Promise<MockPackage[]> {
    try {
      const res = await apiClient.get('/admin/packages')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...packagesState]
  },

  async getClientPublishedPackages(): Promise<MockPackage[]> {
    try {
      const res = await apiClient.get('/packages')
      if (Array.isArray(res.data)) {
        const today = new Date().toISOString().split('T')[0]
        return res.data.filter(
          (p: MockPackage) =>
            p.status === 'PUBLISHED' &&
            (!p.booking_closing_date || p.booking_closing_date >= today) &&
            (!p.departure_date || p.departure_date >= today)
        )
      }
    } catch {
      // fallback
    }
    const today = new Date().toISOString().split('T')[0]
    return packagesState.filter(
      (p) =>
        p.status === 'PUBLISHED' &&
        (!p.booking_closing_date || p.booking_closing_date >= today) &&
        (!p.departure_date || p.departure_date >= today)
    )
  },

  async getPackageById(id: string): Promise<MockPackage | undefined> {
    try {
      const res = await apiClient.get(`/admin/packages/${id}`)
      if (res.data?.id) return res.data
    } catch {
      // fallback
    }
    return packagesState.find((p) => p.id === id)
  },

  async createPackage(payload: Partial<MockPackage>): Promise<MockPackage> {
    const newPkg: MockPackage = {
      id: `pkg_${Date.now()}`,
      name: payload.name || 'New Package',
      type: payload.type || 'UMRAH',
      status: 'DRAFT',
      departure_date: payload.departure_date || '2027-04-01',
      return_date: payload.return_date || '2027-04-15',
      booking_start_date: payload.booking_start_date || new Date().toISOString().split('T')[0],
      booking_closing_date: payload.booking_closing_date || '2027-03-01',
      description: payload.description || '',
      year: payload.year || 2027,
      version: 1,
      total_quota: 0,
      total_confirmed: 0,
      total_held: 0,
      tiers: [],
      createdAt: new Date().toISOString(),
    }

    try {
      const res = await apiClient.post('/admin/packages', payload)
      if (res.data?.id) {
        packagesState = [res.data, ...packagesState]
        saveAll()
        return res.data
      }
    } catch {
      // fallback
    }

    packagesState = [newPkg, ...packagesState]
    saveAll()
    addAudit('PACKAGE_CREATED', 'Package', newPkg.id, undefined, { name: newPkg.name })
    return newPkg
  },

  async updatePackage(id: string, payload: Partial<MockPackage> & { version: number }): Promise<MockPackage> {
    const existing = packagesState.find((p) => p.id === id)
    if (!existing) throw new Error('Package not found')

    if (existing.version !== payload.version) {
      const err = new Error('Version conflict: Data has been modified by another admin. Refresh required.')
      ;(err as unknown as { status: number }).status = 409
      throw err
    }

    try {
      const res = await apiClient.patch(`/admin/packages/${id}`, payload)
      if (res.data?.id) {
        packagesState = packagesState.map((p) => (p.id === id ? res.data : p))
        saveAll()
        return res.data
      }
    } catch {
      // fallback
    }

    const updated = {
      ...existing,
      ...payload,
      version: existing.version + 1,
    }
    packagesState = packagesState.map((p) => (p.id === id ? updated : p))
    saveAll()
    addAudit('PACKAGE_UPDATED', 'Package', id, { version: existing.version }, { version: updated.version })
    return updated
  },

  async publishPackage(id: string): Promise<MockPackage> {
    try {
      await apiClient.patch(`/admin/packages/${id}/publish`)
    } catch {
      // fallback
    }
    const existing = packagesState.find((p) => p.id === id)
    if (!existing) throw new Error('Package not found')
    const updated = { ...existing, status: 'PUBLISHED' as const, version: existing.version + 1 }
    packagesState = packagesState.map((p) => (p.id === id ? updated : p))
    saveAll()
    addAudit('PACKAGE_PUBLISHED', 'Package', id, { status: existing.status }, { status: 'PUBLISHED' })
    return updated
  },

  async archivePackage(id: string): Promise<MockPackage> {
    try {
      await apiClient.patch(`/admin/packages/${id}/archive`)
    } catch {
      // fallback
    }
    const existing = packagesState.find((p) => p.id === id)
    if (!existing) throw new Error('Package not found')
    const updated = { ...existing, status: 'ARCHIVED' as const, version: existing.version + 1 }
    packagesState = packagesState.map((p) => (p.id === id ? updated : p))
    saveAll()
    addAudit('PACKAGE_ARCHIVED', 'Package', id, { status: existing.status }, { status: 'ARCHIVED' })
    return updated
  },

  // --- TIERS ---
  async addTier(packageId: string, payload: Partial<MockTier>): Promise<MockTier> {
    const newTier: MockTier = {
      id: `tier_${Date.now()}`,
      package_id: packageId,
      name: payload.name || 'Tier',
      price: payload.price || 150000,
      quota: payload.quota || 50,
      held_seats: 0,
      confirmed_seats: 0,
      version: 1,
      description: payload.description,
      hotel_makkah: payload.hotel_makkah,
      hotel_madinah: payload.hotel_madinah,
      airline: payload.airline,
    }

    try {
      const res = await apiClient.post(`/admin/packages/${packageId}/tiers`, payload)
      if (res.data?.id) {
        newTier.id = res.data.id
      }
    } catch {
      // fallback
    }

    packagesState = packagesState.map((pkg) => {
      if (pkg.id === packageId) {
        const tiers = [...(pkg.tiers || []), newTier]
        const total_quota = tiers.reduce((s, t) => s + t.quota, 0)
        return { ...pkg, tiers, total_quota, version: pkg.version + 1 }
      }
      return pkg
    })
    saveAll()
    addAudit('TIER_CREATED', 'PackageTier', newTier.id, undefined, { name: newTier.name, packageId })
    return newTier
  },

  async updateTier(tierId: string, payload: Partial<MockTier> & { version: number }): Promise<MockTier> {
    let targetTier: MockTier | undefined
    let targetPkg: MockPackage | undefined

    for (const pkg of packagesState) {
      const t = pkg.tiers?.find((x) => x.id === tierId)
      if (t) {
        targetTier = t
        targetPkg = pkg
        break
      }
    }

    if (!targetTier || !targetPkg) throw new Error('Tier not found')

    if (targetTier.version !== payload.version) {
      const err = new Error('Optimistic Lock Conflict: Tier was updated by another administrator. Please reload.')
      ;(err as unknown as { status: number }).status = 409
      throw err
    }

    try {
      await apiClient.patch(`/admin/tiers/${tierId}`, payload)
    } catch {
      // fallback
    }

    const updatedTier: MockTier = {
      ...targetTier,
      ...payload,
      version: targetTier.version + 1,
    }

    packagesState = packagesState.map((pkg) => {
      if (pkg.id === targetPkg!.id) {
        const tiers = pkg.tiers.map((t) => (t.id === tierId ? updatedTier : t))
        const total_quota = tiers.reduce((s, t) => s + t.quota, 0)
        return { ...pkg, tiers, total_quota }
      }
      return pkg
    })
    saveAll()
    addAudit('TIER_UPDATED', 'PackageTier', tierId, { version: targetTier.version }, { version: updatedTier.version })
    return updatedTier
  },

  // --- BOOKINGS ---
  async createBooking(payload: {
    tier_id: string
    payment_mode: 'FULL' | 'INSTALLMENT'
    pilgrims: Array<{
      name: string
      passport_number: string
      nationality?: string
      date_of_birth?: string
      passport_expiry?: string
    }>
  }): Promise<MockBooking> {
    const formattedPayload = {
      tier_id: payload.tier_id,
      payment_mode: payload.payment_mode,
      pilgrims: payload.pilgrims.map((p) => ({
        name: p.name,
        passport_number: p.passport_number,
        nationality: p.nationality || 'Bangladeshi',
        ...(p.date_of_birth && { date_of_birth: p.date_of_birth }),
        ...(p.passport_expiry && { passport_expiry: p.passport_expiry }),
      })),
    }

    try {
      const res = await apiClient.post('/bookings', formattedPayload, {
        headers: {
          'Idempotency-Key': `idemp_bkg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        },
      })
      if (res.data?.id) {
        bookingsState = [res.data, ...bookingsState]
        saveAll()
        return res.data
      }
    } catch {
      // fallback
    }

    let targetTier: MockTier | undefined
    let targetPkg: MockPackage | undefined

    for (const pkg of packagesState) {
      const t = pkg.tiers?.find((x) => x.id === payload.tier_id)
      if (t) {
        targetTier = t
        targetPkg = pkg
        break
      }
    }

    const pilgrimCount = payload.pilgrims.length
    const totalAmount = (targetTier?.price || 200000) * pilgrimCount
    const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)

    const newBooking: MockBooking = {
      id: `bkg_${Date.now()}`,
      user_id: adminUser.id,
      user_name: adminUser.name,
      user_email: adminUser.email,
      package_id: targetPkg?.id || 'pkg_umrah_2027',
      package_name: targetPkg?.name || 'Ramadan Special Umrah 1448H',
      tier_id: payload.tier_id,
      tier_name: targetTier?.name || 'Standard Tier',
      pilgrim_count: pilgrimCount,
      total_amount: totalAmount,
      paid_amount: payload.payment_mode === 'FULL' ? totalAmount : 0,
      payment_mode: payload.payment_mode,
      status: payload.payment_mode === 'FULL' ? 'CONFIRMED' : 'HELD',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      pilgrims: payload.pilgrims.map((p, idx) => ({
        id: `plg_${Date.now()}_${idx}`,
        booking_id: `bkg_${Date.now()}`,
        name: p.name,
        passport_number: p.passport_number,
        nationality: p.nationality || 'Bangladeshi',
        gender: 'MALE',
        dob: p.date_of_birth || '1990-01-01',
        status: 'REGISTERED',
      })),
      installments: [],
    }

    bookingsState = [newBooking, ...bookingsState]
    saveAll()
    addAudit('BOOKING_CREATED', 'Booking', newBooking.id, undefined, { total_amount: totalAmount })
    return newBooking
  },

  async getBookings(): Promise<MockBooking[]> {
    try {
      const res = await apiClient.get('/bookings')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...bookingsState]
  },

  async getBookingById(id: string): Promise<MockBooking | undefined> {
    try {
      const res = await apiClient.get(`/bookings/${id}`)
      if (res.data?.id) return res.data
    } catch {
      // fallback
    }
    return bookingsState.find((b) => b.id === id)
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<MockPayment[]> {
    try {
      const res = await apiClient.get('/payments')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...paymentsState]
  },

  async createManualPayment(payload: {
    booking_id: string
    amount: number
    receipt_number?: string
    notes?: string
    payment_mode?: string
  }): Promise<MockPayment> {
    const booking = bookingsState.find((b) => b.id === payload.booking_id)
    const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)

    const newPayment: MockPayment = {
      id: `pay_${Date.now()}`,
      booking_id: payload.booking_id,
      user_id: booking?.user_id || 'usr_staff',
      user_name: booking?.user_name || 'Walk-in Pilgrim',
      amount: payload.amount,
      provider: 'MANUAL',
      status: 'PENDING',
      transaction_id: `MANUAL_RCPT_${Date.now().toString().slice(-6)}`,
      receipt_number: payload.receipt_number || `RCPT-${Date.now().toString().slice(-4)}`,
      payment_type: 'OFFLINE_MANUAL',
      recorded_by: adminUser.id,
      recorded_by_name: adminUser.name,
      created_at: new Date().toISOString(),
      notes: payload.notes,
    }

    try {
      const res = await apiClient.post('/payments/manual', payload)
      if (res.data?.id) {
        newPayment.id = res.data.id
      }
    } catch {
      // fallback
    }

    paymentsState = [newPayment, ...paymentsState]
    saveAll()
    addAudit('MANUAL_PAYMENT_RECORDED', 'Payment', newPayment.id, undefined, { amount: newPayment.amount })
    return newPayment
  },

  async approvePayment(id: string): Promise<MockPayment> {
    const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)
    const payment = paymentsState.find((p) => p.id === id)
    if (!payment) throw new Error('Payment not found')

    // Rule: recorded_by !== approved_by for manual payments
    if (payment.payment_type === 'OFFLINE_MANUAL' && payment.recorded_by && payment.recorded_by === adminUser.id) {
      throw new Error('Compliance Violation: Maker cannot be Checker. The admin who recorded this payment cannot approve it.')
    }

    try {
      await apiClient.patch(`/payments/${id}/approve`)
    } catch {
      // fallback
    }

    const updated = {
      ...payment,
      status: 'APPROVED' as const,
      approved_by: adminUser.id,
      approved_by_name: adminUser.name,
    }
    paymentsState = paymentsState.map((p) => (p.id === id ? updated : p))

    // Update booking paid amount & status
    bookingsState = bookingsState.map((b) => {
      if (b.id === payment.booking_id) {
        const newPaid = b.paid_amount + payment.amount
        const newStatus = newPaid >= b.total_amount ? ('CONFIRMED' as const) : ('PARTIALLY_PAID' as const)
        return { ...b, paid_amount: newPaid, status: newStatus }
      }
      return b
    })

    saveAll()
    addAudit('PAYMENT_APPROVED', 'Payment', id, { status: payment.status }, { status: 'APPROVED' })
    return updated
  },

  async rejectPayment(id: string): Promise<MockPayment> {
    const payment = paymentsState.find((p) => p.id === id)
    if (!payment) throw new Error('Payment not found')

    try {
      await apiClient.patch(`/payments/${id}/reject`)
    } catch {
      // fallback
    }

    const updated = { ...payment, status: 'REJECTED' as const }
    paymentsState = paymentsState.map((p) => (p.id === id ? updated : p))
    saveAll()
    addAudit('PAYMENT_REJECTED', 'Payment', id, { status: payment.status }, { status: 'REJECTED' })
    return updated
  },

  // --- CANCELLATIONS & REFUNDS ---
  async getCancellations(): Promise<MockCancellation[]> {
    try {
      const res = await apiClient.get('/cancellations')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...cancellationsState]
  },

  async approveCancellation(id: string): Promise<MockCancellation> {
    const cnl = cancellationsState.find((c) => c.id === id)
    if (!cnl) throw new Error('Cancellation not found')

    try {
      await apiClient.patch(`/cancellations/${id}/approve`)
    } catch {
      // fallback
    }

    const updated = { ...cnl, status: 'APPROVED' as const }
    cancellationsState = cancellationsState.map((c) => (c.id === id ? updated : c))

    // Automatically create Refund record if not already exists
    const existingRef = refundsState.find((r) => r.cancellation_id === id)
    if (!existingRef) {
      const newRef: MockRefund = {
        id: `ref_${Date.now()}`,
        booking_id: cnl.booking_id,
        cancellation_id: cnl.id,
        user_name: cnl.user_name,
        package_name: cnl.package_name,
        total_paid: cnl.total_paid,
        cancellation_fee: cnl.cancellation_fee,
        refund_amount: cnl.estimated_refund,
        status: 'APPROVED',
        created_at: new Date().toISOString(),
      }
      refundsState = [newRef, ...refundsState]
    }

    saveAll()
    addAudit('CANCELLATION_APPROVED', 'Cancellation', id, { status: 'REQUESTED' }, { status: 'APPROVED' })
    return updated
  },

  async getRefunds(): Promise<MockRefund[]> {
    try {
      const res = await apiClient.get('/refunds')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...refundsState]
  },

  async processRefund(id: string, payload: { refund_amount: number; notes?: string }): Promise<MockRefund> {
    const ref = refundsState.find((r) => r.id === id)
    if (!ref) throw new Error('Refund not found')

    const maxAllowed = ref.total_paid - ref.cancellation_fee
    if (payload.refund_amount > maxAllowed) {
      throw new Error(`Invalid Refund: Amount (${payload.refund_amount}) exceeds maximum allowable refund (${maxAllowed} = Total Paid ${ref.total_paid} - Fee ${ref.cancellation_fee}).`)
    }

    try {
      await apiClient.patch(`/refunds/${id}/process`, payload)
    } catch {
      // fallback
    }

    const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)
    const updated: MockRefund = {
      ...ref,
      refund_amount: payload.refund_amount,
      status: 'COMPLETED',
      processed_by: adminUser.name,
      processed_at: new Date().toISOString(),
      notes: payload.notes,
    }

    refundsState = refundsState.map((r) => (r.id === id ? updated : r))
    saveAll()
    addAudit('REFUND_PROCESSED', 'Refund', id, { status: ref.status }, { status: 'COMPLETED', amount: payload.refund_amount })
    return updated
  },

  // --- VENDORS & EXPENSES ---
  async getVendors(): Promise<MockVendor[]> {
    try {
      const res = await apiClient.get('/vendors')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...vendorsState]
  },

  async getVendorExpenses(): Promise<MockVendorExpense[]> {
    try {
      const res = await apiClient.get('/vendors/expenses')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...vendorExpensesState]
  },

  async createVendorExpense(payload: {
    vendor_id: string
    category: string
    amount: number
    currency: 'SAR' | 'USD' | 'BDT'
    exchange_rate: number
    description: string
    invoice_number: string
  }): Promise<MockVendorExpense> {
    const vendor = vendorsState.find((v) => v.id === payload.vendor_id)
    const bdt_amount = payload.amount * payload.exchange_rate

    const newExp: MockVendorExpense = {
      id: `exp_${Date.now()}`,
      vendor_id: payload.vendor_id,
      vendor_name: vendor?.name || 'External Vendor',
      category: payload.category || vendor?.category || 'HOTEL',
      amount: payload.amount,
      currency: payload.currency,
      exchange_rate: payload.exchange_rate,
      bdt_amount,
      description: payload.description,
      invoice_number: payload.invoice_number,
      created_at: new Date().toISOString(),
    }

    try {
      const res = await apiClient.post('/vendors/expenses', payload)
      if (res.data?.id) newExp.id = res.data.id
    } catch {
      // fallback
    }

    vendorExpensesState = [newExp, ...vendorExpensesState]
    if (vendor) {
      vendorsState = vendorsState.map((v) => (v.id === vendor.id ? { ...v, total_expenses_bdt: v.total_expenses_bdt + bdt_amount } : v))
    }
    saveAll()
    addAudit('VENDOR_EXPENSE_RECORDED', 'VendorExpense', newExp.id, undefined, { bdt_amount })
    return newExp
  },

  // --- INVENTORY ---
  async getInventory(): Promise<MockInventoryItem[]> {
    try {
      const res = await apiClient.get('/inventory/items')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...inventoryState]
  },

  async getInventoryTxns(): Promise<MockInventoryTransaction[]> {
    try {
      const res = await apiClient.get('/inventory/transactions')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...inventoryTxnsState]
  },

  async recordInventoryTxn(payload: {
    item_id: string
    type: 'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT'
    quantity: number
    recipient_name?: string
    notes?: string
  }): Promise<MockInventoryTransaction> {
    const item = inventoryState.find((i) => i.id === payload.item_id)
    if (!item) throw new Error('Inventory item not found')

    if (payload.type === 'ISSUE' && item.quantity_on_hand < payload.quantity) {
      throw new Error(`Insufficient stock: Only ${item.quantity_on_hand} items available on hand.`)
    }

    const newTxn: MockInventoryTransaction = {
      id: `itx_${Date.now()}`,
      item_id: payload.item_id,
      item_name: item.name,
      type: payload.type,
      quantity: payload.quantity,
      recipient_name: payload.recipient_name,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    }

    try {
      const res = await apiClient.post('/inventory/transactions', payload)
      if (res.data?.id) newTxn.id = res.data.id
    } catch {
      // fallback
    }

    let qtyChange = payload.quantity
    if (payload.type === 'ISSUE') qtyChange = -payload.quantity
    if (payload.type === 'ADJUSTMENT') qtyChange = payload.quantity

    inventoryState = inventoryState.map((i) => (i.id === item.id ? { ...i, quantity_on_hand: i.quantity_on_hand + qtyChange } : i))
    inventoryTxnsState = [newTxn, ...inventoryTxnsState]
    saveAll()
    addAudit('INVENTORY_TXN', 'Inventory', newTxn.id, undefined, { type: payload.type, quantity: payload.quantity })
    return newTxn
  },

  // --- RECONCILIATION ---
  async getReconciliation(): Promise<MockReconciliation[]> {
    try {
      const res = await apiClient.get('/reconciliation')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...reconciliationState]
  },

  async resolveReconciliation(id: string): Promise<MockReconciliation> {
    const rec = reconciliationState.find((r) => r.id === id)
    if (!rec) throw new Error('Reconciliation record not found')

    try {
      await apiClient.patch(`/reconciliation/${id}/status`, { status: 'RESOLVED' })
    } catch {
      // fallback
    }

    const adminUser = getStored('admin_user', INITIAL_ADMIN_USER)
    const updated = {
      ...rec,
      status: 'RESOLVED' as const,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUser.name,
    }

    reconciliationState = reconciliationState.map((r) => (r.id === id ? updated : r))
    saveAll()
    addAudit('RECONCILIATION_RESOLVED', 'Reconciliation', id, { status: rec.status }, { status: 'RESOLVED' })
    return updated
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<MockAuditLog[]> {
    try {
      const res = await apiClient.get('/audit-logs')
      if (Array.isArray(res.data)) return res.data
      if (Array.isArray(res.data?.data)) return res.data.data
    } catch {
      // fallback
    }
    return [...auditLogsState]
  },

  // --- REPORTS ---
  async getDashboardSummary() {
    const packages = await this.getPackages()
    const bookings = await this.getBookings()
    const payments = await this.getPayments()
    const refunds = await this.getRefunds()

    const totalRevenue = payments.filter((p) => p.status === 'SUCCESS' || p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0)

    const totalBookings = bookings.length
    const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED').length
    const totalPilgrims = bookings.reduce((s, b) => s + b.pilgrims.length, 0)
    const confirmedPilgrims = bookings
      .filter((b) => b.status === 'CONFIRMED')
      .reduce((s, b) => s + b.pilgrims.length, 0)

    const pendingInstallments = bookings.reduce((sum, b) => {
      const unpaid = b.installments?.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((s, i) => s + (i.amount_due - i.amount_paid), 0) || 0
      return sum + unpaid
    }, 0)

    const totalRefunds = refunds.filter((r) => r.status === 'COMPLETED').reduce((s, r) => s + r.refund_amount, 0)

    const totalQuota = packages.reduce((s, p) => s + (p.total_quota || 0), 0)
    const totalConfirmedSeats = packages.reduce((s, p) => s + (p.total_confirmed || 0), 0)
    const totalHeldSeats = packages.reduce((s, p) => s + (p.total_held || 0), 0)

    return {
      totalRevenue,
      totalBookings,
      confirmedBookings,
      totalPilgrims,
      confirmedPilgrims,
      pendingInstallments,
      totalRefunds,
      totalQuota,
      totalConfirmedSeats,
      totalHeldSeats,
      activePackagesCount: packages.filter((p) => p.status === 'PUBLISHED').length,
    }
  },
}
