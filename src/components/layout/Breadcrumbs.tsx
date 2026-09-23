import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeNameMap: Record<string, string> = {
  admin: 'Admin',
  packages: 'Packages & Tiers',
  bookings: 'Bookings',
  manifest: 'Pilgrim Manifest',
  payments: 'Payments & Approvals',
  cancellations: 'Cancellations',
  refunds: 'Refunds',
  reconciliation: 'Reconciliation',
  vendors: 'Vendors & Expenses',
  inventory: 'Inventory Supplies',
  reports: 'Reports & Analytics',
  audit: 'Audit Trail',
}

export const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
      <Link
        to="/admin"
        className="flex items-center gap-1 hover:text-emerald-700 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>

      {pathnames.map((value, index) => {
        if (value === 'admin') return null
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const displayName = routeNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1)

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {isLast ? (
              <span className="text-slate-900 font-semibold">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-emerald-700 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
