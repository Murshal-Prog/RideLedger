# RideLedger — Environment & Local Setup Guide

This guide describes how to configure your local development environment and connect RideLedger to a Supabase backend or run with the local persistent storage layer.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (`v10+`)
- **Git**: `v2.40+`

---

## 2. Local Setup Steps

### A. Clone and Install Dependencies
```bash
git clone https://github.com/Murshal-Prog/RideLedger.git
cd RideLedger/App
npm install
```

### B. Environment File Setup
Copy the example environment template:
```bash
copy .env.example .env.local
```

---

## 3. Storage & Authentication Modes

RideLedger supports dual-mode operation:

### Mode 1: Local Storage Isolation (Default for Offline & Testing)
If you leave `.env.local` with the default placeholders, RideLedger will run in **Local Isolation Mode**:
- Zero external database setup or network connection required.
- Pre-seeded Demo Captain account (`captain@rideledger.local` / `password123`).
- Full user data isolation enforced at the repository layer.
- All rides, expenses, work sessions, and settings persist across page refreshes in `localStorage`.
- Explicit logout clears the authentication token while preserving financial records.

### Mode 2: Supabase Cloud / Self-Hosted PostgreSQL
To connect to a live Supabase project:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings -> API** and copy:
   - `Project URL` -> Set as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - `anon public key` -> Set as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
3. Apply database migrations:
   - Open the **SQL Editor** in the Supabase Dashboard.
   - Run the contents of `supabase/migrations/20261014000001_initial_schema.sql`.
   - All 4 tables (`profiles`, `work_sessions`, `rides`, `expenses`) and Row Level Security (RLS) policies will be initialized.
4. Restart the development server:
   ```bash
   npm run dev
   ```

---

## 4. Verification & Testing

Verify that your environment is working:
```bash
# Run TypeScript compilation check
npm run type-check

# Run ESLint code quality checks
npm run lint

# Run Vitest unit & integration test suite
npm run test

# Run Playwright E2E browser test suite
npm run test:e2e
```
