import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  CalendarCheck2,
  Users2,
  CreditCard,
  Ban,
  RotateCcw,
  Scale,
  Building,
  Boxes,
  BarChart3,
  History,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  {
    category: 'Core Operations',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/packages', label: 'Packages & Tiers', icon: Package },
      { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck2 },
      { to: '/admin/manifest', label: 'Pilgrim Manifest', icon: Users2 },
    ],
  },
  {
    category: 'Finance & Compliance',
    items: [
      { to: '/admin/payments', label: 'Payments & Approvals', icon: CreditCard },
      { to: '/admin/cancellations', label: 'Cancellations', icon: Ban },
      { to: '/admin/refunds', label: 'Refunds Processing', icon: RotateCcw },
      { to: '/admin/reconciliation', label: 'Reconciliation', icon: Scale },
    ],
  },
  {
    category: 'Procurement & Logistics',
    items: [
      { to: '/admin/vendors', label: 'Vendors & Expenses', icon: Building },
      { to: '/admin/inventory', label: 'Inventory Supplies', icon: Boxes },
    ],
  },
  {
    category: 'Governance & Analytics',
    items: [
      { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/admin/audit', label: 'Audit Trail', icon: History },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 select-none shadow-xs',
        collapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm shadow-emerald-700/30">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                Hajj & Umrah
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-colors"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {group.category}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      collapsed && 'justify-center px-2 py-2.5'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </div>

      {/* Environment / Backend Status Footer */}
      <div className="p-3 border-t border-slate-100">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600',
            collapsed && 'justify-center p-1.5'
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          {!collapsed && (
            <div className="flex flex-col text-[11px] leading-tight">
              <span className="font-semibold text-slate-800">NestJS API v1</span>
              <span className="text-slate-400 text-[10px]">Connected (Live)</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
