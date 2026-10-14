# RIDELEDGER — MASTER SOFTWARE DEVELOPMENT SPECIFICATION

## 1. ROLE AND OBJECTIVE

Act as a senior full-stack engineer, software architect, PWA specialist, database engineer, UI/UX designer, security engineer, and QA automation specialist.

Build and maintain RideLedger, a production-ready, responsive Progressive Web App for an individual Rapido Captain to track rides, earnings, incentives, tips, expenses, online work sessions, odometer readings, profit, and monthly financial performance.

The application must be mobile-first, accessible, reliable, visually polished, secure, and easy to use while working.

## 2. SOURCE OF TRUTH

Before implementing any feature:
- Read this file completely.
- Read `docs/PROJECT_AUDIT.md`, `docs/BRAND_ASSET_GUIDE.md`, `docs/ARCHITECTURE.md`, and `docs/IMPLEMENTATION_PLAN.md` when available.
- Inspect the actual codebase and current Git state.
- Follow the existing framework and architecture unless a documented technical reason requires a change.
- Never assume that an earlier prompt was implemented correctly. Verify the actual source code and tests.

Preserve existing functionality, assets, uncommitted work, and user configuration.

## 3. BRAND AND UI/UX

The product name is RideLedger.

The existing logo variants are stored in the project's Assets folder. Use the verified recommendations in `docs/BRAND_ASSET_GUIDE.md`.

Requirements:
- Use the correct existing logo for each background, screen size, and application context.
- Do not create an unrelated replacement logo.
- Provide a polished light theme and dark theme.
- Use consistent design tokens, typography, spacing, iconography, cards, forms, tables, charts, and modal dialogs.
- Use a professional yellow accent with accessible contrast and restrained green/red semantic colors, unless the existing brand guide specifies an approved alternative.
- Create a responsive desktop sidebar and mobile-friendly navigation.
- Provide clear empty, loading, success, validation, offline, and error states.
- Prevent horizontal overflow and ensure accessible keyboard navigation, focus indicators, labels, and touch targets.
- Store the user's theme preference persistently.

## 4. TECHNICAL ARCHITECTURE

Use the existing stack when suitable. If the repository is not yet initialized, evaluate:
- Next.js with TypeScript.
- Tailwind CSS and an accessible component library.
- React Hook Form and Zod for validated forms.
- PostgreSQL with Supabase Auth and Row Level Security for cloud-backed persistence.
- Recharts for analytics.
- ExcelJS for XLSX export.
- A standards-compliant web app manifest and service worker.
- Automated tests using the most appropriate established test tools in the repository.

Do not add multiple libraries that solve the same problem. Document any significant architectural decision.

Separate presentation, domain calculations, data access, validation, and background synchronization. Use strict TypeScript where applicable.

## 5. AUTHENTICATION AND LOGOUT

- Provide secure authentication appropriate to the selected backend.
- Maintain a valid login session across ordinary refreshes, navigation, backgrounding, and reopening the installed PWA.
- Do not introduce an application-level idle logout when the intended behavior is explicit logout only.
- Refresh credentials securely and handle revocation or authentication failures safely.
- Logout must require the user's explicit action and must not delete financial records.
- Distinguish the login session from a work session.
- Avoid full-page reloads during normal application interactions.

## 6. ONLINE SESSION MANAGEMENT

Implement a persistent work-session lifecycle:
1. Offline.
2. Starting session.
3. Online.
4. Ending session.
5. Session saved.

When Go Online is pressed:
- Open a responsive modal.
- Require a valid starting odometer reading.
- Capture the current local timestamp and an unambiguous UTC timestamp.
- Validate the odometer against the previous recorded reading where applicable.
- Create exactly one active session.
- Persist the session before showing success.
- Start the displayed timer using the stored start timestamp.

While online:
- Show an updating HH:MM:SS elapsed timer.
- Show the current session status and starting odometer.
- Make Add Ride visible and enabled.
- Recover the active session after refresh, browser restart, or device lock.
- Never rely on an in-memory interval as the authoritative elapsed-time source.

When Go Offline is pressed:
- Ask for confirmation.
- Require a valid ending odometer reading.
- Require ending odometer >= starting odometer.
- Capture the end timestamp.
- Calculate duration and distance travelled.
- Persist the completed session and stop displaying it as active.
- Prevent duplicate active sessions and duplicate session-ending submissions.

A browser timer can update while the page is active and recalculate after resuming. Do not claim continuous background execution is guaranteed on every mobile operating system.

The application records the Captain's declared online state. Do not claim it verifies Rapido's actual online status without a supported integration.

## 7. RIDE RECORDS

Only allow new ride creation during an active work session.

Provide an accessible responsive Add Ride modal containing:
- Automatically generated ride ID.
- Automatically captured date and time.
- Mandatory ride earning in INR, greater than zero.
- Optional incentive in INR, defaulting to zero.
- Optional tip in INR, defaulting to zero.
- Required payment method: Cash or UPI.
- Automatically calculated total income.
- Optional notes if useful.

Formula:
Ride total = ride earning + incentive + tip.

Requirements:
- Generate unique, stable ride identifiers.
- Never generate a new ID just because the UI rerenders.
- Store each ride against its user and work session.
- Prevent negative or invalid monetary amounts.
- Prevent duplicate submissions.
- Update totals and history after confirmed persistence.
- Preserve exact values in numeric fields and use INR formatting only for display.
- Provide a safe correction workflow for mistaken entries, with an audit trail where appropriate.

## 8. EXPENSE RECORDS

Expenses can be added while online or offline.

Provide an Add Expense modal with:
- Unique expense ID.
- Automatically captured date and time.
- Required category.
- Required description.
- Required positive amount in INR.
- Optional notes and receipt attachment if supported.

Suggested categories:
- Fuel/Petrol.
- Maintenance/Repairs.
- Food/Water.
- Parking/Tolls.
- Mobile Recharge.
- Insurance.
- Vehicle EMI.
- Riding Equipment.
- Platform Charges, when applicable.
- Other.

Allow an optional custom category where appropriate. Validate inputs and preserve all saved records.

## 9. DASHBOARD AND FINANCIAL CALCULATIONS

Display:
- Today's gross recorded income.
- Yesterday's income and profit.
- Today's expenses.
- Today's net recorded profit.
- Total rides.
- Ride earnings, incentives, and tips separately.
- Cash and UPI totals separately.
- Online duration.
- Distance travelled.
- Average income per ride.
- Gross recorded income per online hour.
- Recent rides and expenses.
- Daily and monthly income/expense charts.

Definitions:
Gross recorded income = ride earnings + incentives + tips.

Net recorded profit = gross recorded income - recorded expenses.

Income per online hour = gross recorded income / online session hours, only when the denominator is greater than zero.

Avoid double-counting rides, incentives, tips, sessions, or expenses. Define date-boundary rules consistently using the user's configured timezone.

Do not label gross income as platform payout or net profit as final take-home pay unless all applicable commissions, taxes, and other costs have actually been accounted for.

## 10. MONTHLY REPORTING

Provide selectable month and year filters.

Display:
- Monthly gross recorded income.
- Monthly recorded expenses.
- Monthly net recorded profit.
- Ride count.
- Average daily income and profit.
- Total incentives and tips.
- Cash and UPI breakdown.
- Total online hours and distance travelled.
- Daily income-versus-expense chart.
- Daily profit trend.
- Monthly historical comparison when prior records exist.

Handle empty months, partial months, timezones, and zero denominators safely.

## 11. XLSX EXPORT

Allow downloads of all records, selected date ranges, and selected months.

Generate a real Excel workbook with:
- Dashboard Summary.
- Ride Records.
- Expense Records.
- Online Sessions.
- Daily Summary.
- Monthly Summary.

Use typed date and numeric cells, INR number formats, clear headers, frozen header rows where appropriate, readable column widths, sensible sheet names, and accurate totals.

Generate exports from authoritative saved data, not merely the currently rendered screen. Apply the user's authorization to every exported record. Never include passwords, access tokens, secrets, or internal authentication data.

Use a consistent report timestamp and selected date range in the workbook metadata.

## 12. PWA AND OFFLINE BEHAVIOR

Provide:
- A valid web app manifest.
- Correct existing brand assets for icons and splash contexts.
- HTTPS in production.
- Service worker and safe application-shell caching.
- Installability on supported platforms.
- Clear network and synchronization status.
- An offline-friendly interface where feasible.
- Persistent local drafts or queued entries when offline entry is supported.
- Reliable synchronization and duplicate prevention when connectivity returns.

Use stable record IDs and an idempotent synchronization strategy. Do not overwrite newer server records with stale offline data. Clearly distinguish locally saved, synchronizing, synchronized, and failed records.

Never cache sensitive API responses indiscriminately or expose another user's data.

## 13. DATA MODEL AND SECURITY

Use a documented schema for:
- Users.
- User settings.
- Work sessions.
- Rides.
- Expenses.

Add any justified tables for synchronization or audit history.

Enforce authentication and record ownership at the database/API layer, not only in the frontend. Use Row Level Security or equivalent authorization controls.

Use migrations, appropriate indexes, server-side validation, secure secret handling, and backup procedures.

Do not commit `.env` files, credentials, service-role keys, private tokens, or production secrets. Provide `.env.example` containing placeholder names only.

## 14. PERFORMANCE AND RELIABILITY

- No unnecessary full-page reloads.
- Avoid duplicate network requests and duplicate record creation.
- Use pagination or bounded queries where appropriate.
- Provide clear save-pending and save-failed states.
- Recover gracefully from network interruptions.
- Avoid silently discarding unsaved changes.
- Use accessible modal focus management.
- Avoid blocking the main UI for XLSX generation when a safe alternative is appropriate.
- Keep dependencies minimal and maintained.

## 15. TESTING REQUIREMENTS

Create unit tests for money calculations, time calculations, timezone boundaries, validation, session lifecycle, and reporting aggregation.

Create integration tests for persistence, ownership, session uniqueness, and synchronization.

Create browser-based end-to-end tests for:
- Authentication and explicit logout.
- Go Online and mandatory odometer.
- Timer recovery after reload.
- Ride creation and computed totals.
- Add Ride hidden while offline.
- Expense creation in both states.
- Go Offline and distance calculation.
- Daily/monthly report reconciliation.
- XLSX export.
- Theme persistence.
- Offline and reconnection behavior.
- Responsive mobile and desktop navigation.
- Production build and deployment smoke tests.

Use deterministic fixtures and clean up only test-owned data. Never delete user records to prepare a test.

## 16. DOCUMENTATION

Maintain:
- `docs/MASTER_SPEC.md`
- `docs/PROJECT_AUDIT.md`
- `docs/BRAND_ASSET_GUIDE.md`
- `docs/ARCHITECTURE.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/ENVIRONMENT_SETUP.md`
- `docs/TESTING_STRATEGY.md`
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/OPERATIONS_AND_BACKUP.md`
- `docs/USER_GUIDE.md`
- `docs/CHANGELOG.md`
- `docs/test-reports/`

Document important assumptions and any limitations.

## 17. DEPLOYMENT

Prepare a reproducible production deployment appropriate to the actual stack.

Verify:
- Correct production build.
- Environment variables configured securely.
- Database migrations applied safely.
- Authentication redirect URLs and authorized origins configured.
- HTTPS and custom domain configured where required.
- PWA manifest, icons, and service worker work in production.
- Data persistence and access control work in production.
- Excel exports contain correct records.
- Error monitoring and backup arrangements are documented.
- Rollback and post-deployment verification steps are available.

Do not claim deployment succeeded unless the actual deployment and production checks confirm it. Never expose production credentials in logs or documentation.

## 18. EXECUTION PROTOCOL

Implement only the module requested by the current implementation prompt.

Before changes:
1. Read the master specification.
2. Inspect relevant source files and current Git state.
3. Identify dependencies and potential regressions.
4. Propose a concise implementation plan.

After changes:
1. Run relevant tests, lint, type checks, and builds.
2. Fix failures caused by the implementation.
3. Review security, responsive behavior, accessibility, and error states.
4. Update documentation and the changelog.
5. Generate a Markdown report under `docs/test-reports/` containing commands executed, evidence, pass/fail results, failures, fixes, and remaining risks.
6. Summarize changed files and the next recommended phase.

Never fabricate passing tests. Never continue to the next module automatically. Stop if a prerequisite is incomplete, a destructive action is proposed, or an external credential or user decision is required.

A phase is complete only when its acceptance criteria are met, tests are reported truthfully, and existing functionality remains intact.