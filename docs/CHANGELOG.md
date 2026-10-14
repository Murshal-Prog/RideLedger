# Changelog

All notable changes to the RideLedger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-10-14 — Phase 2: Authentication & Data Foundation

### Added
- **Database Schema & Migrations**:
  - `supabase/migrations/20261014000001_initial_schema.sql`: Version-controlled SQL migration defining `profiles`, `work_sessions`, `rides`, and `expenses` tables.
  - Partial unique index `idx_work_sessions_single_active` enforcing exactly one active session per Captain at any time.
  - Strict PostgreSQL Row Level Security (RLS) policies on all tables ensuring user-level data isolation (`auth.uid() = user_id`).
  - Generated columns: `distance_km` (ending - starting odometer) and `total_income_inr` (earning + incentive + tip).
  - Triggers for automatic `profiles` initialization on user signup and automatic `updated_at` timestamps.
  - `supabase/migrations/20261014000001_initial_schema_down.sql`: Reversible rollback migration.
- **Validation Layer (Zod v4)**:
  - `src/lib/validations/auth.ts`: Validation for email login, password length, and profile registration defaults.
  - `src/lib/validations/user-profile.ts`: Captain profile settings updates.
  - `src/lib/validations/work-session.ts`: Starting odometer non-negative, ending odometer `>=` starting odometer.
  - `src/lib/validations/ride.ts`: Earning `> 0`, incentive `>= 0`, tip `>= 0`, payment method (`cash` or `upi`).
  - `src/lib/validations/expense.ts`: 10 standardized expense categories, positive amount, required description.
- **Data Access & Storage Repository Layer**:
  - `src/lib/repositories/storage-adapter.ts`: Isolated persistent storage layer with strict user boundary validation. Throws `SecurityError` on any unauthorized cross-user access.
  - `src/lib/repositories/auth-repository.ts`: Handles sign-in, sign-up, session restoration across refreshes, and explicit sign out.
  - `src/lib/repositories/user-repository.ts`: Profile and Captain settings retrieval and updates.
  - `src/lib/repositories/work-session-repository.ts`: Work session persistence and duplicate active session prevention.
  - `src/lib/repositories/ride-repository.ts`: Ride records with automatic total income calculation.
  - `src/lib/repositories/expense-repository.ts`: Operating expense tracking.
  - `src/lib/supabase/client.ts`: Supabase client and SSR factory with graceful offline/local fallback.
- **Authentication State & UI Integration**:
  - `src/context/auth-context.tsx`: Global auth provider managing persistent user session, profile state, and explicit logout.
  - `src/app/login/page.tsx`: Responsive login screen with brand logo v5, field validation, and one-click demo login.
  - `src/app/signup/page.tsx`: Captain registration screen capturing vehicle number, partner ID, and daily targets.
  - `src/components/layout/header.tsx`: Live Captain profile avatar, partner ID badge, and explicit sign out action.
  - `src/app/settings/page.tsx`: Interactive Captain Profile & Vehicle settings editor with toast confirmations.
  - Confirmation dialog before sign out clearly informing the user that financial records remain preserved.
- **API Route Handlers (Server-Side Isolation)**:
  - `/api/auth/me`: Authenticated user session retrieval.
  - `/api/user/profile`: GET and PUT profile with Zod schema validation.
  - `/api/rides`: GET and POST ride records with user-level data isolation.
  - `/api/expenses`: GET and POST expense records with user-level data isolation.
  - `/api/sessions`: GET, POST, and PATCH session lifecycle with single-active-session validation.
- **Documentation**:
  - `docs/DATABASE_SCHEMA.md`: ER diagram, table columns, constraints, indexes, and RLS policies.
  - `docs/ENVIRONMENT_SETUP.md`: Local setup guide for both Local Storage Isolation mode and Supabase Cloud.
  - Updated `.env.example` with clear comments.
  - `docs/test-reports/PHASE-02-AUTH-DATA-FOUNDATION-TEST.md`: Complete test evidence report.

---

## [0.1.0] - 2026-10-14 — Phase 1: Project Foundation

### Added
- **Project Structure**: Configured Next.js 15 (App Router) with React 19, TypeScript strict mode, and Tailwind CSS.
- **Brand Assets & Guide**: Analyzed all 5 logo variants in `Assets/` and created `docs/BRAND_ASSET_GUIDE.md`. Added mirrored web assets under `public/brand/` for Next.js image optimization.
- **Design System Primitives**:
  - `Button`: Primary teal, secondary slate, captain accent amber, outline, ghost, danger; multiple sizes; loading spinner state.
  - `Input` & `Select`: Form controls with label, validation helper text, error styling, and disabled states.
  - `Card`: Responsive container with subtle elevation, hover states, and glassmorphic styling.
  - `Badge`: Status badges for Online, Offline, Success, Warning, Danger, and Captain Accent.
  - `Modal` & `ConfirmationDialog`: Accessible dialog with backdrop blur, focus trap, and Escape dismissal.
  - `Toast` & `ToastProvider`: Global notification system with ARIA live regions.
  - `Table`: Responsive data table with automatic mobile card fallback.
  - `ChartContainer`: Reusable analytics placeholder with loading, empty, and rendered states.
  - `LoadingState` & `EmptyState`: Skeleton loaders and clear call-to-action empty state cards.
- **Responsive Application Shells**:
  - `DesktopSidebar`: Fixed desktop navigation with brand logo (`v5` expanded, `v4` collapsed) and route highlights.
  - `MobileNav`: Fixed bottom navigation bar with thumb-friendly touch targets (min 44px) and zero horizontal overflow.
  - `Header`: Route title, live online/offline badge, quick theme toggle, and profile placeholder.
- **Theming System**:
  - Persistent Light and Dark themes stored in `localStorage` (`rideledger-theme`) with automatic fallback to system preferences.
  - CSS custom properties in `globals.css` ensuring instantaneous switching without page reloads.
- **Dashboard Shell**:
  - Responsive financial dashboard skeleton displaying clear placeholders (`₹--`, `Awaiting online session data`) rather than deceptive mock figures.
  - Action bar with "Go Online", "Add Ride", and "Add Expense" triggers.
- **Quality & Testing Infrastructure**:
  - ESLint configuration for Next.js and TypeScript.
  - Vitest + React Testing Library unit and component test suites.
  - Playwright browser E2E test suite covering navigation, theme persistence, and zero-overflow mobile layout.
- **Documentation**:
  - `docs/PROJECT_AUDIT.md`
  - `docs/BRAND_ASSET_GUIDE.md`
  - `docs/ARCHITECTURE.md`
  - `docs/IMPLEMENTATION_PLAN.md`
  - `docs/test-reports/phase-1-report.md`
