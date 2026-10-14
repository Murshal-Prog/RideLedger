# Changelog

All notable changes to the RideLedger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
