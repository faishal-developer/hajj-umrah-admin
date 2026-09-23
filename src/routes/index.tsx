import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Loader2 } from 'lucide-react'

// Lazy loaded feature routes for code splitting
const LoginPage = React.lazy(() => import('@/features/auth/LoginPage'))
const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'))
const PackagesPage = React.lazy(() => import('@/features/packages/PackagesPage'))
const BookingsPage = React.lazy(() => import('@/features/bookings/BookingsPage'))
const ManifestPage = React.lazy(() => import('@/features/manifest/ManifestPage'))
const PaymentsPage = React.lazy(() => import('@/features/payments/PaymentsPage'))
const CancellationsPage = React.lazy(() => import('@/features/cancellations/CancellationsPage'))
const RefundsPage = React.lazy(() => import('@/features/refunds/RefundsPage'))
const VendorsPage = React.lazy(() => import('@/features/vendors/VendorsPage'))
const InventoryPage = React.lazy(() => import('@/features/inventory/InventoryPage'))
const ReconciliationPage = React.lazy(() => import('@/features/reconciliation/ReconciliationPage'))
const ReportsPage = React.lazy(() => import('@/features/reports/ReportsPage'))
const AuditPage = React.lazy(() => import('@/features/audit/AuditPage'))

const PageLoader = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      <span className="text-xs font-medium text-slate-500">Loading operational module...</span>
    </div>
  </div>
)

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected Admin Shell */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="manifest" element={<ManifestPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="cancellations" element={<CancellationsPage />} />
          <Route path="refunds" element={<RefundsPage />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reconciliation" element={<ReconciliationPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Suspense>
  )
}
export default AppRouter
