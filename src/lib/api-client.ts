import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import {
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

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://hajj-umrah-backend.vercel.app/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Inject Bearer Auth Token
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

// Response Interceptor: Handle 401 Unauthorized globally
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

// Helper: Safely extract response data from NestJS standard { data: ..., message: ... } wrapper
function unwrapData<T>(resData: unknown): T {
  if (resData && typeof resData === 'object' && 'data' in resData) {
    return (resData as { data: T }).data
  }
  return resData as T
}

// Normalizers for seamless backend model alignment
function normalizePackage(raw: Record<string, unknown>): MockPackage {
  const tiersRaw = Array.isArray(raw.tiers) ? (raw.tiers as Array<Record<string, unknown>>) : []
  const tiers: MockTier[] = tiersRaw.map((t) => ({
    id: (t.id as string) || `tier_${Date.now()}`,
    package_id: (t.package_id as string) || (t.packageId as string) || (raw.id as string),
    name: (t.name as string) || 'Tier',
    price: Number(t.price) || 0,
    quota: Number(t.quota) || 0,
    confirmed_seats: Number(t.confirmed_seats ?? t.confirmedSeats ?? 0),
    held_seats: Number(t.held_seats ?? t.heldSeats ?? 0),
    hotel_makkah: (t.hotel_makkah as string) || (t.hotelMakkah as string) || '',
    hotel_madinah: (t.hotel_madinah as string) || (t.hotelMadinah as string) || '',
    airline: (t.airline as string) || '',
    description: (t.description as string) || '',
    version: Number(t.version ?? 1),
  }))

  const totalQuota =
    Number(raw.total_quota ?? raw.totalQuota) ||
    tiers.reduce((sum, t) => sum + (t.quota || 0), 0)
  const totalConfirmed =
    Number(raw.total_confirmed ?? raw.totalConfirmed) ||
    tiers.reduce((sum, t) => sum + (t.confirmed_seats || 0), 0)
  const totalHeld =
    Number(raw.total_held ?? raw.totalHeld) ||
    tiers.reduce((sum, t) => sum + (t.held_seats || 0), 0)

  return {
    id: (raw.id as string) || `pkg_${Date.now()}`,
    name: (raw.name as string) || 'Untitled Package',
    type: (raw.type as MockPackage['type']) || 'UMRAH',
    status: (raw.status as MockPackage['status']) || 'PUBLISHED',
    departure_date: (raw.departure_date as string) || (raw.departureDate as string) || '',
    return_date: (raw.return_date as string) || (raw.returnDate as string) || '',
    booking_start_date:
      (raw.booking_start_date as string) || (raw.bookingStartDate as string) || '',
    booking_closing_date:
      (raw.booking_closing_date as string) ||
      (raw.bookingEndDate as string) ||
      (raw.booking_end_date as string) ||
      '',
    description: (raw.description as string) || '',
    year: Number(raw.year || 2026),
    version: Number(raw.version || 1),
    total_quota: totalQuota,
    total_confirmed: totalConfirmed,
    total_held: totalHeld,
    tiers,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
  }
}

function normalizeBooking(raw: Record<string, unknown>): MockBooking {
  const user = raw.user as Record<string, unknown> | undefined
  const pkg = raw.package as Record<string, unknown> | undefined
  const tier = raw.tier as Record<string, unknown> | undefined
  const pilgrims = Array.isArray(raw.pilgrims) ? (raw.pilgrims as Array<Record<string, unknown>>) : []

  return {
    id: (raw.id as string) || '',
    user_id: (raw.user_id as string) || (raw.userId as string) || (user?.id as string) || '',
    user_name:
      (raw.user_name as string) ||
      (user?.name as string) ||
      (raw.customerName as string) ||
      'Customer',
    user_email:
      (raw.user_email as string) ||
      (user?.email as string) ||
      (raw.customerEmail as string) ||
      '',
    package_id:
      (raw.package_id as string) || (raw.packageId as string) || (pkg?.id as string) || '',
    package_name:
      (raw.package_name as string) ||
      (pkg?.name as string) ||
      (tier?.package as Record<string, unknown>)?.name as string ||
      'Package',
    tier_id: (raw.tier_id as string) || (raw.tierId as string) || (tier?.id as string) || '',
    tier_name: (raw.tier_name as string) || (tier?.name as string) || 'Standard Tier',
    pilgrim_count:
      Number(raw.pilgrim_count ?? raw.pilgrimCount) ||
      (pilgrims.length > 0 ? pilgrims.length : 1),
    total_amount: Number(raw.total_amount ?? raw.totalAmount ?? 0),
    paid_amount: Number(raw.paid_amount ?? raw.paidAmount ?? 0),
    payment_mode: (raw.payment_mode as MockBooking['payment_mode']) || 'FULL',
    status: (raw.status as MockBooking['status']) || 'HELD',
    created_at:
      (raw.created_at as string) || (raw.createdAt as string) || new Date().toISOString(),
    expires_at: (raw.expires_at as string) || (raw.expiresAt as string),
    pilgrims: pilgrims.map((p, idx) => ({
      id: (p.id as string) || `plg_${idx}`,
      booking_id: (p.booking_id as string) || (p.bookingId as string) || (raw.id as string),
      name: (p.name as string) || 'Pilgrim',
      passport_number:
        (p.passport_number as string) || (p.passportNumber as string) || '',
      nationality: (p.nationality as string) || 'Bangladeshi',
      gender: (p.gender as 'MALE' | 'FEMALE') || 'MALE',
      dob: (p.dob as string) || (p.dateOfBirth as string) || '',
      status: (p.status as 'REGISTERED' | 'CANCELLED') || 'REGISTERED',
    })),
    installments: Array.isArray(raw.installments)
      ? (raw.installments as Array<Record<string, unknown>>).map((inst) => ({
          id: (inst.id as string) || `inst_${Date.now()}`,
          booking_id: (inst.booking_id as string) || (inst.bookingId as string) || (raw.id as string),
          sequence: Number(inst.sequence || 1),
          due_date: (inst.due_date as string) || (inst.dueDate as string) || '',
          amount_due: Number(inst.amount_due ?? inst.amountDue ?? 0),
          amount_paid: Number(inst.amount_paid ?? inst.amountPaid ?? 0),
          status: (inst.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL') || 'PENDING',
        }))
      : [],
  }
}

function normalizePayment(raw: Record<string, unknown>): MockPayment {
  const user = raw.user as Record<string, unknown> | undefined
  const booking = raw.booking as Record<string, unknown> | undefined
  return {
    id: (raw.id as string) || '',
    booking_id: (raw.booking_id as string) || (raw.bookingId as string) || '',
    user_id: (raw.user_id as string) || (raw.userId as string) || (user?.id as string) || '',
    user_name:
      (raw.user_name as string) ||
      (user?.name as string) ||
      (booking?.user as Record<string, unknown>)?.name as string ||
      'Customer',
    amount: Number(raw.amount || 0),
    provider: (raw.provider as MockPayment['provider']) || 'MANUAL',
    status: (raw.status as MockPayment['status']) || 'PENDING',
    transaction_id:
      (raw.transaction_id as string) ||
      (raw.gateway_transaction_id as string) ||
      (raw.gatewayTransactionId as string) ||
      (raw.receipt_number as string) ||
      (raw.id as string),
    receipt_number:
      (raw.receipt_number as string) || (raw.receiptNumber as string) || (raw.id as string),
    payment_type:
      (raw.payment_type as MockPayment['payment_type']) ||
      (raw.provider === 'MANUAL' ? 'OFFLINE_MANUAL' : 'GATEWAY'),
    recorded_by: (raw.recorded_by as string) || (raw.recordedById as string),
    recorded_by_name: (raw.recorded_by_name as string) || (raw.recordedByName as string),
    approved_by: (raw.approved_by as string) || (raw.approvedById as string),
    approved_by_name: (raw.approved_by_name as string) || (raw.approvedByName as string),
    created_at:
      (raw.created_at as string) || (raw.createdAt as string) || new Date().toISOString(),
    notes: (raw.notes as string) || '',
  }
}

function normalizeCancellation(raw: Record<string, unknown>): MockCancellation {
  const user = raw.user as Record<string, unknown> | undefined
  const booking = raw.booking as Record<string, unknown> | undefined
  return {
    id: (raw.id as string) || '',
    booking_id: (raw.booking_id as string) || (raw.bookingId as string) || '',
    user_name:
      (raw.user_name as string) ||
      (user?.name as string) ||
      (booking?.user as Record<string, unknown>)?.name as string ||
      'Customer',
    package_name:
      (raw.package_name as string) ||
      (booking?.package as Record<string, unknown>)?.name as string ||
      'Package',
    reason: (raw.reason as string) || '',
    total_paid: Number(raw.total_paid ?? raw.totalPaid ?? 0),
    cancellation_fee: Number(raw.cancellation_fee ?? raw.cancellationFee ?? 0),
    estimated_refund: Number(raw.estimated_refund ?? raw.estimatedRefund ?? 0),
    status: (raw.status as MockCancellation['status']) || 'REQUESTED',
    created_at:
      (raw.created_at as string) || (raw.createdAt as string) || new Date().toISOString(),
  }
}

function normalizeRefund(raw: Record<string, unknown>): MockRefund {
  const user = raw.user as Record<string, unknown> | undefined
  const booking = raw.booking as Record<string, unknown> | undefined
  return {
    id: (raw.id as string) || '',
    booking_id: (raw.booking_id as string) || (raw.bookingId as string) || '',
    cancellation_id: (raw.cancellation_id as string) || (raw.cancellationId as string) || '',
    user_name:
      (raw.user_name as string) ||
      (user?.name as string) ||
      (booking?.user as Record<string, unknown>)?.name as string ||
      'Customer',
    package_name:
      (raw.package_name as string) ||
      (booking?.package as Record<string, unknown>)?.name as string ||
      'Package',
    total_paid: Number(raw.total_paid ?? raw.totalPaid ?? 0),
    cancellation_fee: Number(raw.cancellation_fee ?? raw.cancellationFee ?? 0),
    refund_amount: Number(raw.refund_amount ?? raw.refundAmount ?? 0),
    status: (raw.status as MockRefund['status']) || 'REQUESTED',
    created_at:
      (raw.created_at as string) || (raw.createdAt as string) || new Date().toISOString(),
    processed_by: (raw.processed_by as string) || (raw.processedByName as string),
    processed_at: (raw.processed_at as string) || (raw.processedAt as string),
    notes: (raw.notes as string) || '',
  }
}

// ==========================================
// UNIFIED DATA SERVICE (Connected to Live Backend)
// ==========================================
export const DataService = {
  // --- AUTH ---
  async login(credentials: { email: string; password: string }) {
    try {
      const res = await apiClient.post('/auth/login', credentials)
      const data = unwrapData<{
        access_token: string
        user: {
          id: string
          name: string
          email: string
          role: string
          status: string
          createdAt: string
          updatedAt: string
        }
      }>(res.data)

      if (data?.access_token) {
        return data
      }
      throw new Error('No access token returned from backend')
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string; error?: string }>
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        axiosErr.message ||
        'Invalid email or password'
      throw new Error(msg, { cause: err })
    }
  },

  async getMe() {
    const res = await apiClient.get('/auth/me')
    return unwrapData(res.data)
  },

  // --- PACKAGES ---
  async getPackages(): Promise<MockPackage[]> {
    const res = await apiClient.get('/admin/packages')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizePackage)
    }
    return []
  },

  async getClientPublishedPackages(): Promise<MockPackage[]> {
    const res = await apiClient.get('/packages')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizePackage)
    }
    return []
  },

  async getPackageById(id: string): Promise<MockPackage | undefined> {
    const res = await apiClient.get(`/packages/${id}`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return data ? normalizePackage(data) : undefined
  },

  async createPackage(payload: Partial<MockPackage>): Promise<MockPackage> {
    const body = {
      name: payload.name,
      type: payload.type,
      description: payload.description,
      departureDate: payload.departure_date,
      bookingStartDate: payload.booking_start_date,
      bookingEndDate: payload.booking_closing_date,
    }
    const res = await apiClient.post('/admin/packages', body)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePackage(data)
  },

  async updatePackage(
    id: string,
    payload: Partial<MockPackage> & { version: number }
  ): Promise<MockPackage> {
    const body = {
      name: payload.name,
      description: payload.description,
      departureDate: payload.departure_date,
      bookingStartDate: payload.booking_start_date,
      bookingEndDate: payload.booking_closing_date,
      version: payload.version,
    }
    const res = await apiClient.patch(`/admin/packages/${id}`, body)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePackage(data)
  },

  async publishPackage(id: string): Promise<MockPackage> {
    const res = await apiClient.patch(`/admin/packages/${id}/publish`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePackage(data)
  },

  async archivePackage(id: string): Promise<MockPackage> {
    const res = await apiClient.patch(`/admin/packages/${id}/archive`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePackage(data)
  },

  // --- TIERS ---
  async addTier(packageId: string, payload: Partial<MockTier>): Promise<MockTier> {
    const body = {
      name: payload.name,
      price: payload.price,
      quota: payload.quota,
      hotelMakkah: payload.hotel_makkah,
      hotelMadinah: payload.hotel_madinah,
      airline: payload.airline,
      description: payload.description,
    }
    const res = await apiClient.post(`/admin/packages/${packageId}/tiers`, body)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return {
      id: (data.id as string) || '',
      package_id: packageId,
      name: (data.name as string) || payload.name || '',
      price: Number(data.price ?? payload.price ?? 0),
      quota: Number(data.quota ?? payload.quota ?? 0),
      confirmed_seats: Number(data.confirmedSeats ?? 0),
      held_seats: Number(data.heldSeats ?? 0),
      hotel_makkah: (data.hotelMakkah as string) || payload.hotel_makkah || '',
      hotel_madinah: (data.hotelMadinah as string) || payload.hotel_madinah || '',
      airline: (data.airline as string) || payload.airline || '',
      description: (data.description as string) || payload.description || '',
      version: Number(data.version ?? 1),
    }
  },

  async updateTier(
    tierId: string,
    payload: Partial<MockTier> & { version: number }
  ): Promise<MockTier> {
    const body = {
      name: payload.name,
      price: payload.price,
      quota: payload.quota,
      hotelMakkah: payload.hotel_makkah,
      hotelMadinah: payload.hotel_madinah,
      airline: payload.airline,
      description: payload.description,
      version: payload.version,
    }
    const res = await apiClient.patch(`/admin/tiers/${tierId}`, body)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return {
      id: (data.id as string) || tierId,
      package_id: (data.packageId as string) || '',
      name: (data.name as string) || payload.name || '',
      price: Number(data.price ?? payload.price ?? 0),
      quota: Number(data.quota ?? payload.quota ?? 0),
      confirmed_seats: Number(data.confirmedSeats ?? 0),
      held_seats: Number(data.heldSeats ?? 0),
      hotel_makkah: (data.hotelMakkah as string) || payload.hotel_makkah || '',
      hotel_madinah: (data.hotelMadinah as string) || payload.hotel_madinah || '',
      airline: (data.airline as string) || payload.airline || '',
      description: (data.description as string) || payload.description || '',
      version: Number(data.version ?? payload.version + 1),
    }
  },

  // --- BOOKINGS ---
  async getBookings(): Promise<MockBooking[]> {
    const res = await apiClient.get('/bookings')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizeBooking)
    }
    return []
  },

  async getBookingById(id: string): Promise<MockBooking | undefined> {
    const res = await apiClient.get(`/bookings/${id}`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return data ? normalizeBooking(data) : undefined
  },

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

    const res = await apiClient.post('/bookings', formattedPayload, {
      headers: {
        'Idempotency-Key': `idemp_bkg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      },
    })
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizeBooking(data)
  },

  // --- PAYMENTS ---
  async getPayments(): Promise<MockPayment[]> {
    const res = await apiClient.get('/payments')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizePayment)
    }
    return []
  },

  async createManualPayment(payload: {
    booking_id: string
    amount: number
    receipt_number?: string
    notes?: string
    payment_mode?: string
  }): Promise<MockPayment> {
    const res = await apiClient.post('/payments/manual', {
      booking_id: payload.booking_id,
      amount: payload.amount,
      receipt_number: payload.receipt_number,
      notes: payload.notes,
    })
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePayment(data)
  },

  async approvePayment(id: string): Promise<MockPayment> {
    const res = await apiClient.patch(`/payments/${id}/approve`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePayment(data)
  },

  async rejectPayment(id: string): Promise<MockPayment> {
    const res = await apiClient.patch(`/payments/${id}/reject`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizePayment(data)
  },

  // --- CANCELLATIONS & REFUNDS ---
  async getCancellations(): Promise<MockCancellation[]> {
    const res = await apiClient.get('/cancellations')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizeCancellation)
    }
    return []
  },

  async approveCancellation(id: string): Promise<MockCancellation> {
    const res = await apiClient.patch(`/cancellations/${id}/approve`)
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizeCancellation(data)
  },

  async getRefunds(): Promise<MockRefund[]> {
    const res = await apiClient.get('/refunds')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map(normalizeRefund)
    }
    return []
  },

  async processRefund(
    id: string,
    payload: { refund_amount: number; notes?: string }
  ): Promise<MockRefund> {
    const res = await apiClient.patch(`/refunds/${id}/process`, {
      refund_amount: payload.refund_amount,
      notes: payload.notes,
    })
    const data = unwrapData<Record<string, unknown>>(res.data)
    return normalizeRefund(data)
  },

  // --- VENDORS & EXPENSES ---
  async getVendors(): Promise<MockVendor[]> {
    try {
      const res = await apiClient.get('/vendors')
      const data = unwrapData<Array<MockVendor>>(res.data)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getVendorExpenses(): Promise<MockVendorExpense[]> {
    try {
      const res = await apiClient.get('/vendors/expenses')
      const data = unwrapData<Array<MockVendorExpense>>(res.data)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
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
    const res = await apiClient.post('/vendors/expenses', payload)
    return unwrapData<MockVendorExpense>(res.data)
  },

  // --- INVENTORY ---
  async getInventory(): Promise<MockInventoryItem[]> {
    try {
      const res = await apiClient.get('/inventory/items')
      const data = unwrapData<Array<MockInventoryItem>>(res.data)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getInventoryTxns(): Promise<MockInventoryTransaction[]> {
    try {
      const res = await apiClient.get('/inventory/transactions')
      const data = unwrapData<Array<MockInventoryTransaction>>(res.data)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async recordInventoryTxn(payload: {
    item_id: string
    type: 'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT'
    quantity: number
    recipient_name?: string
    notes?: string
  }): Promise<MockInventoryTransaction> {
    const res = await apiClient.post('/inventory/transactions', payload)
    return unwrapData<MockInventoryTransaction>(res.data)
  },

  // --- RECONCILIATION ---
  async getReconciliation(): Promise<MockReconciliation[]> {
    try {
      const res = await apiClient.get('/reconciliation')
      const data = unwrapData<Array<MockReconciliation>>(res.data)
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async resolveReconciliation(id: string): Promise<MockReconciliation> {
    const res = await apiClient.patch(`/reconciliation/${id}/status`, { status: 'RESOLVED' })
    return unwrapData<MockReconciliation>(res.data)
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<MockAuditLog[]> {
    const res = await apiClient.get('/audit-logs')
    const data = unwrapData<Array<Record<string, unknown>>>(res.data)
    if (Array.isArray(data)) {
      return data.map((log) => ({
        id: (log.id as string) || '',
        actor_id: (log.actor_id as string) || (log.actorId as string) || '',
        actor_name:
          (log.actor_name as string) ||
          (log.actorName as string) ||
          (log.actor as Record<string, unknown>)?.name as string ||
          'Administrator',
        actor_email:
          (log.actor_email as string) ||
          (log.actorEmail as string) ||
          (log.actor as Record<string, unknown>)?.email as string ||
          'admin@hajjumrah.com',
        action: (log.action as string) || 'AUDIT_EVENT',
        entity: (log.entity as string) || 'System',
        entity_id: (log.entity_id as string) || (log.entityId as string) || '',
        old_value: (log.old_value as Record<string, unknown>) || (log.oldValue as Record<string, unknown>),
        new_value: (log.new_value as Record<string, unknown>) || (log.newValue as Record<string, unknown>),
        ip_address: (log.ip_address as string) || (log.ipAddress as string) || '127.0.0.1',
        timestamp:
          (log.timestamp as string) || (log.createdAt as string) || new Date().toISOString(),
      }))
    }
    return []
  },

  // --- REPORTING / EXECUTIVE DASHBOARD ---
  async getDashboardSummary() {
    const [colRes, bkgRes, seatsRes, instRes, refRes, pkgRes] = await Promise.allSettled([
      apiClient.get('/reports/collections'),
      apiClient.get('/reports/bookings'),
      apiClient.get('/reports/seats'),
      apiClient.get('/reports/outstanding-installments'),
      apiClient.get('/reports/refunds'),
      apiClient.get('/admin/packages'),
    ])

    const collections =
      colRes.status === 'fulfilled' ? unwrapData<Record<string, unknown>>(colRes.value.data) : null
    const bookings =
      bkgRes.status === 'fulfilled' ? unwrapData<Record<string, unknown>>(bkgRes.value.data) : null
    const seats =
      seatsRes.status === 'fulfilled' ? unwrapData<Record<string, unknown>>(seatsRes.value.data) : null
    const installments =
      instRes.status === 'fulfilled' ? unwrapData<Record<string, unknown>>(instRes.value.data) : null
    const refunds =
      refRes.status === 'fulfilled' ? unwrapData<Record<string, unknown>>(refRes.value.data) : null
    const packages =
      pkgRes.status === 'fulfilled' ? unwrapData<Array<Record<string, unknown>>>(pkgRes.value.data) : []

    const statusCounts = (bookings?.statusCounts as Record<string, number>) || {}
    const activePackagesCount = Array.isArray(packages)
      ? packages.filter((p) => p.status === 'PUBLISHED').length
      : 0

    return {
      totalRevenue: Number(collections?.totalCollected ?? 0),
      totalBookings: Number(bookings?.totalBookings ?? 0),
      confirmedBookings: Number(statusCounts.CONFIRMED ?? 0),
      totalPilgrims: Number(bookings?.totalPilgrims ?? 0),
      confirmedPilgrims: Number(statusCounts.CONFIRMED ?? 0),
      activePackagesCount,
      totalQuota: Number(seats?.totalSystemQuota ?? 0),
      totalConfirmedSeats: Number(seats?.totalConfirmedSeats ?? 0),
      totalHeldSeats: Number(seats?.totalHeldSeats ?? 0),
      pendingInstallments: Number(installments?.totalOutstanding ?? 0),
      totalRefunds: Number(refunds?.totalCompletedAmount ?? 0),
    }
  },
}
