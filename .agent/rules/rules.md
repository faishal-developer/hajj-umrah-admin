---
trigger: always_on
---

# Antigravity React Admin Panel Engineering & Architecture Rules

## 1. Professional Admin Panel Architecture & Layouting
- Layout Shell Hierarchy:
  - Separate application shells cleanly: `AuthLayout` (login, password reset) vs. `DashboardLayout` (collapsible sidebar, global top bar with breadcrumbs/profile, main content scroll area).
  - Use React Router v6+ nested routes (`<Outlet />`) to prevent shell re-mounting during route transitions.
  - Implement a dedicated `ProtectedRoute` wrapper handling authentication tokens, expiration, and role-based access control (RBAC) redirection.
- Consistent Information Hierarchy:
  - Every page must have a standardized header area: Page Title, Dynamic Breadcrumbs, Contextual Subtitle, and Primary Page Actions (e.g., "Export", "Create New").
  - Maintain a high-density, professional aesthetic: 1px subtle borders (`border-border`), structured data cards, uniform padding scales, and muted helper text.

## 2. Senior React Standards & Best Practices
- Strict Feature-Driven Directory Structure:
  - Organize by business domain, not arbitrary technical roles:
    ```text
    src/
    ├── features/
    │   ├── packages/
    │   │   ├── components/      # Domain-specific UI (tables, filters, modals)
    │   │   ├── hooks/           # Domain-specific React Query hooks
    │   │   ├── api/             # API request functions
    │   │   ├── types.ts         # Domain TypeScript models
    │   │   └── PackagesPage.tsx # Route entry point
    ├── components/
    │   ├── ui/                  # Generic primitives (Button, Dialog, Dropdown, Table)
    │   └── layout/              # Shell, Sidebar, Header, Breadcrumbs
    ├── routes/                  # AppRouter configuration
    └── lib/                     # Axios/Fetch clients, utility functions
    ```
- State Separation:
  - Server State: Use TanStack Query (`@tanstack/react-query`) for all remote data fetching, optimistic updates, and cache invalidation. Never replicate server data in local `useState`.
  - Client/UI State: Keep local state minimal and collocated. Use context/Zustand strictly for global UI states (sidebar collapse state, theme, session user).
- Pragmatic SOLID, DRY, KISS, and YAGNI:
  - Keep components modular with single responsibilities.
  - Avoid unnecessary abstractions or premature utility wrappers. Duplicate minor layout markup rather than building complex, unreadable generic meta-components.

## 3. Code Splitting, Lazy Loading & Performance
- Route-Level Code Splitting:
  - Every route view must be lazily imported using `React.lazy()` to keep initial vendor bundles minimal:
    ```tsx
    const PackagesPage = React.lazy(() => import('@/features/packages/PackagesPage'));
    const BookingsPage = React.lazy(() => import('@/features/bookings/BookingsPage'));
    ```
- Suspense & Shimmer Placeholders:
  - Wrap lazy routes in `<Suspense fallback={<PageSkeletonLoader />}>`.
  - Heavy client components (e.g., interactive charts, rich text editors, CSV export builders) must be lazy-loaded on demand when modals open or tabs switch.
- Performance Hygiene:
  - Use `useCallback` and `useMemo` strictly when passing callbacks to heavy virtualized lists or complex derived data tables, avoiding premature micro-optimizations.

## 4. Polished UX & Data States
- The 4 Essential UI States: Every data-driven component must explicitly handle:
  1. Loading: Skeleton placeholders that mirror the exact table/card layout (no jarring blank pages or solitary spinning wheels).
  2. Error: Human-readable error banner with a clear "Retry" trigger.
  3. Empty: Icon, descriptive headline, explanation, and an actionable primary button (e.g., "No bookings found - Create your first booking").
  4. Success: Interactive data grid or form with immediate feedback.
- Notification Feedback:
  - Use toast notifications (e.g., `sonner`) for all mutations (Create, Update, Delete) with clear success and error messages.
  - Destructive actions (deletions, status revocations) must require explicit confirmation dialogs.

## 5. File Constraints & Readability
- Line Count Limit: No single file may exceed 500 lines of code. Extract table columns, form schemas, and filter bars into local sub-components when a file grows.
- Human-Readable Code:
  - Use descriptive variable and function names (e.g., `handleStatusFilterChange` vs `handleChange`).
  - No cryptic abbreviations, deeply nested ternaries, or unreadable one-liners.
  - Strict TypeScript: Never use `any`. Define exhaustive types for API responses, query params, and table filters.