# RideLedger — Implementation Plan & Roadmap

## Overview

This implementation plan coordinates the phased development of the RideLedger PWA, adhering strictly to `docs/MASTER_SPEC.md`.

---

## Phase Breakdown

### Phase 1: Project Foundation (Current Phase)
- [x] Codebase inspection & environment audit (`docs/PROJECT_AUDIT.md`)
- [x] Brand asset guide & logo mapping (`docs/BRAND_ASSET_GUIDE.md`)
- [x] Architecture specification (`docs/ARCHITECTURE.md`)
- [x] Next.js 15, TypeScript, Tailwind CSS configuration
- [x] Design System primitives (Buttons, Inputs, Cards, Badges, Modals, Tables, Charts, Loading & Empty states)
- [x] Responsive desktop and mobile application shells (zero horizontal overflow)
- [x] Light and dark themes with persistent user preference
- [x] Reusable navigation, headers, status indicators, confirmation dialogs, toast notifications
- [x] Initial dashboard shell with clearly identified placeholders (no mock figures as real data)
- [x] Code quality tooling (ESLint, TypeScript strict mode)
- [x] Testing infrastructure (Vitest + React Testing Library + Playwright E2E)
- [x] Client-side navigation without unnecessary page reloads
- [x] Phase 1 documentation, changelog, and test report

### Phase 2: Authentication & User Profiles (Completed)
- [x] Supabase Auth integration (Email/Password & schema)
- [x] Version-controlled database migrations with RLS (`supabase/migrations/`)
- [x] User profile and Captain settings (Daily target, vehicle info, initial odometer)
- [x] Persistent login session across browser refreshes & PWA restarts
- [x] Explicit logout flow without clearing financial records
- [x] Strict user-level data isolation in database, API routes, and repository layer
- [x] Input validation via Zod on client and data-access layers

### Phase 3: Work Session & Odometer Lifecycle
- [ ] Go Online modal with mandatory starting odometer
- [ ] Online session timer with UTC timestamp persistence
- [ ] Go Offline confirmation with mandatory ending odometer validation
- [ ] Distance travelled & session duration calculations
- [ ] Recovery of active sessions after device reboot or refresh

### Phase 4: Ride & Expense Management
- [ ] Add Ride modal with automatic ID, earnings, incentives, tips, payment method (Cash/UPI)
- [ ] Total income calculation (`earnings + incentives + tips`)
- [ ] Add Expense modal with predefined and custom categories
- [ ] Financial record validation, duplicate submission protection, and edit/audit trails

### Phase 5: Dashboard Analytics & Financial Aggregation
- [ ] Real-time computation of Today's Gross Income, Net Profit, and Expenses
- [ ] Income per online hour calculation with zero-division protection
- [ ] Recharts visualization of daily earnings vs. expenses
- [ ] Cash vs. UPI breakdown indicators

### Phase 6: Monthly Reporting & Historical Insights
- [ ] Selectable month/year financial summaries
- [ ] Average daily income and profit trends
- [ ] Historical month-over-month comparisons

### Phase 7: XLSX Export Engine
- [ ] ExcelJS workbook generator
- [ ] Formatted sheets: Dashboard Summary, Rides, Expenses, Online Sessions, Monthly Summary
- [ ] INR currency formatting and clean print headers

### Phase 8: PWA & Offline Synchronization
- [ ] Web app manifest and service worker caching
- [ ] Offline ride and expense queuing with IndexedDB
- [ ] Idempotent synchronization and conflict resolution when connectivity restores
- [ ] Production deployment smoke tests and verification
