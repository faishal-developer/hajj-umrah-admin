export interface MockUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'AGENT'
  status: 'ACTIVE' | 'SUSPENDED'
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface MockTier {
  id: string
  package_id: string
  name: string
  price: number
  quota: number
  held_seats: number
  confirmed_seats: number
  version: number
  description?: string
  hotel_makkah?: string
  hotel_madinah?: string
  airline?: string
}

export interface MockPackage {
  id: string
  name: string
  type: 'HAJJ' | 'UMRAH' | 'RAMADAN_UMRAH' | 'PREMIUM_HAJJ'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  departure_date: string
  return_date: string
  booking_start_date: string
  booking_closing_date: string
  description: string
  year: number
  version: number
  total_quota: number
  total_confirmed: number
  total_held: number
  tiers: MockTier[]
  createdAt: string
}

export interface MockPilgrim {
  id: string
  booking_id: string
  name: string
  passport_number: string
  nationality: string
  gender: 'MALE' | 'FEMALE'
  dob: string
  status: 'REGISTERED' | 'VISA_ISSUED' | 'TICKETED' | 'CANCELLED'
  emergency_contact?: string
}

export interface MockInstallment {
  id: string
  booking_id: string
  sequence: number
  amount_due: number
  amount_paid: number
  due_date: string
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE'
  paid_at?: string
}

export interface MockBooking {
  id: string
  user_id: string
  user_name: string
  user_email: string
  package_id: string
  package_name: string
  tier_id: string
  tier_name: string
  pilgrim_count: number
  total_amount: number
  paid_amount: number
  payment_mode: 'FULL' | 'INSTALLMENT'
  status: 'HELD' | 'CONFIRMED' | 'PARTIALLY_PAID' | 'DEFAULTED' | 'CANCELLED'
  created_at: string
  expires_at: string
  pilgrims: MockPilgrim[]
  installments: MockInstallment[]
}

export interface MockPayment {
  id: string
  booking_id: string
  user_id: string
  user_name: string
  amount: number
  provider: 'BKASH' | 'NAGAD' | 'VISA' | 'MANUAL' | 'BANK_TRANSFER'
  status: 'PENDING' | 'APPROVED' | 'SUCCESS' | 'FAILED' | 'REJECTED'
  transaction_id: string
  receipt_number?: string
  payment_type: 'ONLINE' | 'OFFLINE_MANUAL'
  recorded_by?: string
  recorded_by_name?: string
  approved_by?: string
  approved_by_name?: string
  created_at: string
  notes?: string
}

export interface MockCancellation {
  id: string
  booking_id: string
  user_name: string
  package_name: string
  pilgrim_id?: string
  pilgrim_name?: string
  reason: string
  cancellation_fee: number
  total_paid: number
  estimated_refund: number
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED'
  created_at: string
}

export interface MockRefund {
  id: string
  booking_id: string
  cancellation_id?: string
  user_name: string
  package_name: string
  total_paid: number
  cancellation_fee: number
  refund_amount: number
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  approved_by?: string
  processed_by?: string
  created_at: string
  processed_at?: string
  notes?: string
}

export interface MockVendor {
  id: string
  name: string
  category: 'HOTEL' | 'AIRLINE' | 'TRANSPORT' | 'VISA' | 'CATERING'
  currency: 'SAR' | 'USD' | 'BDT'
  contact_person: string
  email: string
  phone: string
  total_expenses_bdt: number
}

export interface MockVendorExpense {
  id: string
  vendor_id: string
  vendor_name: string
  category: string
  amount: number
  currency: 'SAR' | 'USD' | 'BDT'
  exchange_rate: number
  bdt_amount: number
  description: string
  invoice_number: string
  created_at: string
}

export interface MockInventoryItem {
  id: string
  name: string
  sku: string
  category: 'CLOTHING' | 'LUGGAGE' | 'TELECOM' | 'ACCESSORIES'
  quantity_on_hand: number
  minimum_threshold: number
  unit_cost: number
  unit: string
}

export interface MockInventoryTransaction {
  id: string
  item_id: string
  item_name: string
  type: 'PURCHASE' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT'
  quantity: number
  recipient_name?: string
  notes?: string
  created_at: string
}

export interface MockAuditLog {
  id: string
  actor_id: string
  actor_name: string
  actor_email: string
  action: string
  entity: string
  entity_id: string
  old_value?: Record<string, unknown>
  new_value?: Record<string, unknown>
  ip_address: string
  timestamp: string
}

export interface MockReconciliation {
  id: string
  provider: string
  gateway_transaction_id: string
  internal_amount: number
  gateway_amount: number
  difference: number
  status: 'MATCHED' | 'MISMATCH' | 'UNDER_REVIEW' | 'RESOLVED'
  created_at: string
  resolved_at?: string
  resolved_by?: string
}

export const INITIAL_ADMIN_USER: MockUser = {
  id: 'usr_admin_001',
  name: 'Admin Supervisor',
  email: 'admin@hajjumrah.com',
  role: 'ADMIN',
  status: 'ACTIVE',
  phone: '+8801812345678',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z',
}

export const INITIAL_TIERS: MockTier[] = [
  {
    id: 'tier_eco_01',
    package_id: 'pkg_umrah_2027',
    name: 'Economy Tier',
    price: 185000,
    quota: 100,
    held_seats: 12,
    confirmed_seats: 64,
    version: 1,
    description: '3-star hotel 600m from Haram, shared 4-person room, Saudia Airline standard economy.',
    hotel_makkah: 'Emaar Grand Makkah (3-Star)',
    hotel_madinah: 'Al Eiman Taibah (3-Star)',
    airline: 'Saudia / Biman Bangladesh',
  },
  {
    id: 'tier_std_02',
    package_id: 'pkg_umrah_2027',
    name: 'Standard Tier',
    price: 260000,
    quota: 60,
    held_seats: 8,
    confirmed_seats: 42,
    version: 1,
    description: '4-star hotel 250m from Haram, double/twin rooms, buffet breakfast included.',
    hotel_makkah: 'Anjum Hotel Makkah (4-Star)',
    hotel_madinah: 'Frontel Al Harithia (4-Star)',
    airline: 'Saudia Airline Direct',
  },
  {
    id: 'tier_vip_03',
    package_id: 'pkg_umrah_2027',
    name: 'VIP Executive Tier',
    price: 420000,
    quota: 30,
    held_seats: 2,
    confirmed_seats: 24,
    version: 2,
    description: '5-star Clock Tower Luxury suite with Kaaba view, private GMC Yukon ground VIP transfer.',
    hotel_makkah: 'Fairmont Makkah Clock Royal (5-Star)',
    hotel_madinah: 'The Oberoi Madina (5-Star)',
    airline: 'Emirates / Qatar Airways Business Class',
  },
  {
    id: 'tier_hajj_prem_01',
    package_id: 'pkg_hajj_2027',
    name: 'Premium Shifting Hajj',
    price: 850000,
    quota: 50,
    held_seats: 4,
    confirmed_seats: 38,
    version: 1,
    description: 'VIP AC tents in Zone A (Mina), Swissotel Makkah, private bus transport, guidance by eminent Muftis.',
    hotel_makkah: 'Swissotel Makkah (5-Star)',
    hotel_madinah: 'Madinah Hilton (5-Star)',
    airline: 'Saudia Airline Dedicated Hajj Flight',
  },
]

export const INITIAL_PACKAGES: MockPackage[] = [
  {
    id: 'pkg_umrah_2027',
    name: 'Ramadan Special Umrah 1448H',
    type: 'RAMADAN_UMRAH',
    status: 'PUBLISHED',
    departure_date: '2027-03-12',
    return_date: '2027-03-27',
    booking_start_date: '2026-08-01',
    booking_closing_date: '2027-02-15',
    description: 'Experience the blessed final 15 nights of Ramadan in the Holy Sanctuaries of Makkah and Madinah.',
    year: 2027,
    version: 3,
    total_quota: 190,
    total_confirmed: 130,
    total_held: 22,
    tiers: [INITIAL_TIERS[0], INITIAL_TIERS[1], INITIAL_TIERS[2]],
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'pkg_hajj_2027',
    name: 'Royal Executive Hajj 2027 (1448H)',
    type: 'PREMIUM_HAJJ',
    status: 'PUBLISHED',
    departure_date: '2027-05-18',
    return_date: '2027-06-12',
    booking_start_date: '2026-09-01',
    booking_closing_date: '2027-04-01',
    description: 'All-inclusive premium Hajj package with VIP Mina zone tents, continuous buffet, and direct flights.',
    year: 2027,
    version: 1,
    total_quota: 50,
    total_confirmed: 38,
    total_held: 4,
    tiers: [INITIAL_TIERS[3]],
    createdAt: '2026-09-01T12:00:00.000Z',
  },
  {
    id: 'pkg_umrah_spring_2027',
    name: 'Spring Blossom Umrah 2027',
    type: 'UMRAH',
    status: 'PUBLISHED',
    departure_date: '2027-04-15',
    return_date: '2027-04-27',
    booking_start_date: '2026-11-01',
    booking_closing_date: '2027-03-30',
    description: 'Pleasant spring weather pilgrimage with comprehensive historical Ziyarah tours included.',
    year: 2027,
    version: 2,
    total_quota: 80,
    total_confirmed: 52,
    total_held: 8,
    tiers: [],
    createdAt: '2026-09-01T08:30:00.000Z',
  },
  {
    id: 'pkg_draft_autumn_2027',
    name: 'Autumn Special Umrah 2027',
    type: 'UMRAH',
    status: 'DRAFT',
    departure_date: '2027-10-10',
    return_date: '2027-10-24',
    booking_start_date: '2027-01-01',
    booking_closing_date: '2027-09-15',
    description: 'Affordable post-Hajj Umrah package tailored for families and first-time pilgrims.',
    year: 2027,
    version: 1,
    total_quota: 60,
    total_confirmed: 0,
    total_held: 0,
    tiers: [],
    createdAt: '2026-09-18T14:20:00.000Z',
  },
]

export const INITIAL_BOOKINGS: MockBooking[] = [
  {
    id: 'bkg_1001',
    user_id: 'usr_cust_01',
    user_name: 'Dr. Mahmudul Hasan',
    user_email: 'mahmud.hasan@gmail.com',
    package_id: 'pkg_umrah_2027',
    package_name: 'Ramadan Special Umrah 1448H',
    tier_id: 'tier_vip_03',
    tier_name: 'VIP Executive Tier',
    pilgrim_count: 2,
    total_amount: 840000,
    paid_amount: 840000,
    payment_mode: 'FULL',
    status: 'CONFIRMED',
    created_at: '2026-09-10T11:20:00.000Z',
    expires_at: '2026-09-12T11:20:00.000Z',
    pilgrims: [
      {
        id: 'plg_01',
        booking_id: 'bkg_1001',
        name: 'Dr. Mahmudul Hasan',
        passport_number: 'A08923411',
        nationality: 'Bangladeshi',
        gender: 'MALE',
        dob: '1978-04-12',
        status: 'VISA_ISSUED',
        emergency_contact: '+8801711223344',
      },
      {
        id: 'plg_02',
        booking_id: 'bkg_1001',
        name: 'Mrs. Rokeya Begum',
        passport_number: 'A09112845',
        nationality: 'Bangladeshi',
        gender: 'FEMALE',
        dob: '1982-09-19',
        status: 'VISA_ISSUED',
        emergency_contact: '+8801711223344',
      },
    ],
    installments: [
      {
        id: 'inst_01',
        booking_id: 'bkg_1001',
        sequence: 1,
        amount_due: 840000,
        amount_paid: 840000,
        due_date: '2026-09-10',
        status: 'PAID',
        paid_at: '2026-09-10T11:35:00.000Z',
      },
    ],
  },
  {
    id: 'bkg_1002',
    user_id: 'usr_cust_02',
    user_name: 'Kazi Tanvir Ahmed',
    user_email: 'tanvir.kazi@outlook.com',
    package_id: 'pkg_umrah_2027',
    package_name: 'Ramadan Special Umrah 1448H',
    tier_id: 'tier_std_02',
    tier_name: 'Standard Tier',
    pilgrim_count: 3,
    total_amount: 780000,
    paid_amount: 390000,
    payment_mode: 'INSTALLMENT',
    status: 'PARTIALLY_PAID',
    created_at: '2026-09-14T09:15:00.000Z',
    expires_at: '2026-09-16T09:15:00.000Z',
    pilgrims: [
      {
        id: 'plg_03',
        booking_id: 'bkg_1002',
        name: 'Kazi Tanvir Ahmed',
        passport_number: 'B01923841',
        nationality: 'Bangladeshi',
        gender: 'MALE',
        dob: '1985-11-05',
        status: 'REGISTERED',
        emergency_contact: '+8801912345678',
      },
      {
        id: 'plg_04',
        booking_id: 'bkg_1002',
        name: 'Nusrat Jahan Tanvir',
        passport_number: 'B02391024',
        nationality: 'Bangladeshi',
        gender: 'FEMALE',
        dob: '1990-03-21',
        status: 'REGISTERED',
        emergency_contact: '+8801912345678',
      },
      {
        id: 'plg_05',
        booking_id: 'bkg_1002',
        name: 'Kazi Aayan Ahmed',
        passport_number: 'B08492019',
        nationality: 'Bangladeshi',
        gender: 'MALE',
        dob: '2018-07-14',
        status: 'REGISTERED',
        emergency_contact: '+8801912345678',
      },
    ],
    installments: [
      {
        id: 'inst_02',
        booking_id: 'bkg_1002',
        sequence: 1,
        amount_due: 390000,
        amount_paid: 390000,
        due_date: '2026-09-14',
        status: 'PAID',
        paid_at: '2026-09-14T09:40:00.000Z',
      },
      {
        id: 'inst_03',
        booking_id: 'bkg_1002',
        sequence: 2,
        amount_due: 390000,
        amount_paid: 0,
        due_date: '2026-11-15',
        status: 'PENDING',
      },
    ],
  },
  {
    id: 'bkg_1003',
    user_id: 'usr_cust_03',
    user_name: 'Al-Haj Sirajul Islam',
    user_email: 'siraj.islam@gmail.com',
    package_id: 'pkg_hajj_2027',
    package_name: 'Royal Executive Hajj 2027 (1448H)',
    tier_id: 'tier_hajj_prem_01',
    tier_name: 'Premium Shifting Hajj',
    pilgrim_count: 1,
    total_amount: 850000,
    paid_amount: 850000,
    payment_mode: 'FULL',
    status: 'CONFIRMED',
    created_at: '2026-09-16T15:30:00.000Z',
    expires_at: '2026-09-18T15:30:00.000Z',
    pilgrims: [
      {
        id: 'plg_06',
        booking_id: 'bkg_1003',
        name: 'Al-Haj Sirajul Islam',
        passport_number: 'C09823190',
        nationality: 'Bangladeshi',
        gender: 'MALE',
        dob: '1962-02-10',
        status: 'TICKETED',
        emergency_contact: '+8801822334455',
      },
    ],
    installments: [
      {
        id: 'inst_04',
        booking_id: 'bkg_1003',
        sequence: 1,
        amount_due: 850000,
        amount_paid: 850000,
        due_date: '2026-09-16',
        status: 'PAID',
        paid_at: '2026-09-16T16:00:00.000Z',
      },
    ],
  },
  {
    id: 'bkg_1004',
    user_id: 'usr_cust_04',
    user_name: 'Mohammad Farooq',
    user_email: 'farooq.m@yahoo.com',
    package_id: 'pkg_umrah_2027',
    package_name: 'Ramadan Special Umrah 1448H',
    tier_id: 'tier_eco_01',
    tier_name: 'Economy Tier',
    pilgrim_count: 1,
    total_amount: 185000,
    paid_amount: 0,
    payment_mode: 'INSTALLMENT',
    status: 'HELD',
    created_at: '2026-09-22T08:00:00.000Z',
    expires_at: '2026-09-24T08:00:00.000Z',
    pilgrims: [
      {
        id: 'plg_07',
        booking_id: 'bkg_1004',
        name: 'Mohammad Farooq',
        passport_number: 'D01829381',
        nationality: 'Bangladeshi',
        gender: 'MALE',
        dob: '1992-06-18',
        status: 'REGISTERED',
      },
    ],
    installments: [
      {
        id: 'inst_05',
        booking_id: 'bkg_1004',
        sequence: 1,
        amount_due: 100000,
        amount_paid: 0,
        due_date: '2026-09-24',
        status: 'PENDING',
      },
      {
        id: 'inst_06',
        booking_id: 'bkg_1004',
        sequence: 2,
        amount_due: 850000,
        amount_paid: 0,
        due_date: '2026-12-01',
        status: 'PENDING',
      },
    ],
  },
]

export const INITIAL_PAYMENTS: MockPayment[] = [
  {
    id: 'pay_101',
    booking_id: 'bkg_1001',
    user_id: 'usr_cust_01',
    user_name: 'Dr. Mahmudul Hasan',
    amount: 840000,
    provider: 'VISA',
    status: 'SUCCESS',
    transaction_id: 'TXN_VISA_9832104',
    payment_type: 'ONLINE',
    created_at: '2026-09-10T11:35:00.000Z',
  },
  {
    id: 'pay_102',
    booking_id: 'bkg_1002',
    user_id: 'usr_cust_02',
    user_name: 'Kazi Tanvir Ahmed',
    amount: 390000,
    provider: 'BKASH',
    status: 'SUCCESS',
    transaction_id: 'BKASH92018390',
    payment_type: 'ONLINE',
    created_at: '2026-09-14T09:40:00.000Z',
  },
  {
    id: 'pay_103',
    booking_id: 'bkg_1003',
    user_id: 'usr_cust_03',
    user_name: 'Al-Haj Sirajul Islam',
    amount: 850000,
    provider: 'MANUAL',
    status: 'APPROVED',
    transaction_id: 'CHQ_EBL_882910',
    receipt_number: 'RCPT-2026-089',
    payment_type: 'OFFLINE_MANUAL',
    recorded_by: 'usr_staff_002',
    recorded_by_name: 'Branch Officer Karim',
    approved_by: 'usr_admin_001',
    approved_by_name: 'Admin Supervisor',
    notes: 'Cheque cleared at Eastern Bank Ltd Banani Branch.',
    created_at: '2026-09-16T15:45:00.000Z',
  },
  {
    id: 'pay_104_pending',
    booking_id: 'bkg_1002',
    user_id: 'usr_cust_02',
    user_name: 'Kazi Tanvir Ahmed',
    amount: 150000,
    provider: 'MANUAL',
    status: 'PENDING',
    transaction_id: 'CASH_DHAKA_092',
    receipt_number: 'RCPT-2026-094',
    payment_type: 'OFFLINE_MANUAL',
    recorded_by: 'usr_staff_002',
    recorded_by_name: 'Branch Officer Karim',
    notes: 'Physical cash received for installment 2 partial advance.',
    created_at: '2026-09-22T14:10:00.000Z',
  },
]

export const INITIAL_CANCELLATIONS: MockCancellation[] = [
  {
    id: 'cnl_201',
    booking_id: 'bkg_1002',
    user_name: 'Kazi Tanvir Ahmed',
    package_name: 'Ramadan Special Umrah 1448H',
    pilgrim_id: 'plg_05',
    pilgrim_name: 'Kazi Aayan Ahmed (Child)',
    reason: 'School examinations rescheduled during Ramadan travel period.',
    cancellation_fee: 25000,
    total_paid: 130000,
    estimated_refund: 105000,
    status: 'REQUESTED',
    created_at: '2026-09-21T16:00:00.000Z',
  },
]

export const INITIAL_REFUNDS: MockRefund[] = [
  {
    id: 'ref_301',
    booking_id: 'bkg_1002',
    cancellation_id: 'cnl_201',
    user_name: 'Kazi Tanvir Ahmed',
    package_name: 'Ramadan Special Umrah 1448H',
    total_paid: 130000,
    cancellation_fee: 25000,
    refund_amount: 105000,
    status: 'REQUESTED',
    created_at: '2026-09-21T16:05:00.000Z',
    notes: 'Pending final accounts verification and BEFTN disbursement.',
  },
]

export const INITIAL_VENDORS: MockVendor[] = [
  {
    id: 'vnd_01',
    name: 'Makkah Clock Royal Tower (Fairmont)',
    category: 'HOTEL',
    currency: 'SAR',
    contact_person: 'Sheikh Ibrahim Al-Zahrani',
    email: 'reservations.makkah@fairmont.com',
    phone: '+966125717777',
    total_expenses_bdt: 4250000,
  },
  {
    id: 'vnd_02',
    name: 'Saudia Cargo & Group Flight Services',
    category: 'AIRLINE',
    currency: 'USD',
    contact_person: 'Tariq Mansoor',
    email: 'hajj.groups@saudia.com',
    phone: '+966126860000',
    total_expenses_bdt: 8600000,
  },
  {
    id: 'vnd_03',
    name: 'Al-Watania Pilgrims Transport Co.',
    category: 'TRANSPORT',
    currency: 'SAR',
    contact_person: 'Adnan Ghamdi',
    email: 'dispatch@alwatania-bus.sa',
    phone: '+966501234567',
    total_expenses_bdt: 1850000,
  },
]

export const INITIAL_VENDOR_EXPENSES: MockVendorExpense[] = [
  {
    id: 'exp_501',
    vendor_id: 'vnd_01',
    vendor_name: 'Makkah Clock Royal Tower (Fairmont)',
    category: 'HOTEL',
    amount: 125000,
    currency: 'SAR',
    exchange_rate: 32.5,
    bdt_amount: 4062500,
    description: 'Advance 50% deposit for 20 Ramadan luxury suites block booking',
    invoice_number: 'INV-FMT-2027-04',
    created_at: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'exp_502',
    vendor_id: 'vnd_02',
    vendor_name: 'Saudia Cargo & Group Flight Services',
    category: 'AIRLINE',
    amount: 68000,
    currency: 'USD',
    exchange_rate: 121.5,
    bdt_amount: 8262000,
    description: 'Charter seat allocation deposit for Ramadan flight SV-3801',
    invoice_number: 'SV-GRP-8921',
    created_at: '2026-09-08T14:30:00.000Z',
  },
]

export const INITIAL_INVENTORY: MockInventoryItem[] = [
  {
    id: 'inv_01',
    name: 'Premium Male Ihram Towel Set (Pure Cotton)',
    sku: 'IHRM-COTTON-01',
    category: 'CLOTHING',
    quantity_on_hand: 340,
    minimum_threshold: 100,
    unit_cost: 1450,
    unit: 'Pieces',
  },
  {
    id: 'inv_02',
    name: 'Female Abaya & Khimar Pilgrimage Pack',
    sku: 'ABYA-PACK-02',
    category: 'CLOTHING',
    quantity_on_hand: 220,
    minimum_threshold: 80,
    unit_cost: 2200,
    unit: 'Sets',
  },
  {
    id: 'inv_03',
    name: 'Branded Hard-Shell Hajj Luggage 28-inch',
    sku: 'LUG-HARDSHELL-28',
    category: 'LUGGAGE',
    quantity_on_hand: 180,
    minimum_threshold: 50,
    unit_cost: 3800,
    unit: 'Bags',
  },
  {
    id: 'inv_04',
    name: 'Saudi Telecom STC 5G Data SIM (Unlimited)',
    sku: 'SIM-STC-5G-UNL',
    category: 'TELECOM',
    quantity_on_hand: 450,
    minimum_threshold: 150,
    unit_cost: 950,
    unit: 'SIM Cards',
  },
]

export const INITIAL_INVENTORY_TXNS: MockInventoryTransaction[] = [
  {
    id: 'itx_101',
    item_id: 'inv_01',
    item_name: 'Premium Male Ihram Towel Set (Pure Cotton)',
    type: 'PURCHASE',
    quantity: 400,
    recipient_name: 'Supplier: Noman Terry Towel Ltd',
    notes: 'Received bulk shipment for upcoming 2026/2027 season.',
    created_at: '2026-08-15T11:00:00.000Z',
  },
  {
    id: 'itx_102',
    item_id: 'inv_01',
    item_name: 'Premium Male Ihram Towel Set (Pure Cotton)',
    type: 'ISSUE',
    quantity: 60,
    recipient_name: 'Pilgrim Batch: Ramadan Group A',
    notes: 'Issued during orientation session at Dhaka Head Office.',
    created_at: '2026-09-12T15:20:00.000Z',
  },
]

export const INITIAL_RECONCILIATION: MockReconciliation[] = [
  {
    id: 'rec_01',
    provider: 'BKASH',
    gateway_transaction_id: 'BKASH92018390',
    internal_amount: 390000,
    gateway_amount: 390000,
    difference: 0,
    status: 'MATCHED',
    created_at: '2026-09-14T10:00:00.000Z',
  },
  {
    id: 'rec_02',
    provider: 'NAGAD',
    gateway_transaction_id: 'NGD_891230491',
    internal_amount: 185000,
    gateway_amount: 182225,
    difference: -2775,
    status: 'MISMATCH',
    created_at: '2026-09-18T18:30:00.000Z',
  },
]

export const INITIAL_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: 'aud_901',
    actor_id: 'usr_admin_001',
    actor_name: 'Admin Supervisor',
    actor_email: 'admin@hajjumrah.com',
    action: 'PACKAGE_PUBLISHED',
    entity: 'Package',
    entity_id: 'pkg_umrah_2027',
    old_value: { status: 'DRAFT', version: 2 },
    new_value: { status: 'PUBLISHED', version: 3 },
    ip_address: '103.114.12.8',
    timestamp: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'aud_902',
    actor_id: 'usr_admin_001',
    actor_name: 'Admin Supervisor',
    actor_email: 'admin@hajjumrah.com',
    action: 'MANUAL_PAYMENT_APPROVED',
    entity: 'Payment',
    entity_id: 'pay_103',
    old_value: { status: 'PENDING' },
    new_value: { status: 'APPROVED', approved_by: 'usr_admin_001' },
    ip_address: '103.114.12.8',
    timestamp: '2026-09-16T16:00:00.000Z',
  },
  {
    id: 'aud_903',
    actor_id: 'usr_admin_001',
    actor_name: 'Admin Supervisor',
    actor_email: 'admin@hajjumrah.com',
    action: 'TIER_UPDATED',
    entity: 'PackageTier',
    entity_id: 'tier_vip_03',
    old_value: { price: 400000, version: 1 },
    new_value: { price: 420000, version: 2 },
    ip_address: '103.114.12.8',
    timestamp: '2026-09-18T14:15:00.000Z',
  },
]
