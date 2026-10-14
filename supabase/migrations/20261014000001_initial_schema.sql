-- RideLedger Initial Database Schema Migration
-- Migration ID: 20261014000001_initial_schema.sql
-- Description: Sets up profiles, work_sessions, rides, and expenses tables with Row Level Security (RLS) and constraints.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES & USER SETTINGS
-- Stores Captain profile, partner identifier, vehicle details, and daily targets.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT 'Rapido Captain',
    partner_id TEXT NOT NULL DEFAULT 'RAP-4091',
    phone_number TEXT,
    vehicle_type TEXT NOT NULL DEFAULT 'Two-Wheeler (Motorcycle)',
    vehicle_number TEXT,
    daily_target_inr NUMERIC(10, 2) NOT NULL DEFAULT 1500.00 CHECK (daily_target_inr >= 0),
    initial_odometer NUMERIC(10, 1) NOT NULL DEFAULT 0.0 CHECK (initial_odometer >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. WORK SESSIONS
-- Tracks online/offline lifecycle, odometer readings, and session duration.
CREATE TABLE IF NOT EXISTS public.work_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ,
    starting_odometer NUMERIC(10, 1) NOT NULL CHECK (starting_odometer >= 0),
    ending_odometer NUMERIC(10, 1) CHECK (ending_odometer >= starting_odometer),
    distance_km NUMERIC(10, 1) GENERATED ALWAYS AS (
        CASE WHEN ending_odometer IS NOT NULL THEN (ending_odometer - starting_odometer) ELSE NULL END
    ) STORED,
    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Partial unique index ensuring a user can have at most one ACTIVE work session at any time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_sessions_single_active 
ON public.work_sessions(user_id) 
WHERE (status = 'active');

-- Index for ordering sessions by start time
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_time 
ON public.work_sessions(user_id, start_time DESC);

-- 4. RIDE RECORDS
-- Stores individual ride earnings, incentives, tips, and payment methods.
CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_session_id UUID REFERENCES public.work_sessions(id) ON DELETE SET NULL,
    ride_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    earning_inr NUMERIC(10, 2) NOT NULL CHECK (earning_inr > 0),
    incentive_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (incentive_inr >= 0),
    tip_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tip_inr >= 0),
    total_income_inr NUMERIC(10, 2) GENERATED ALWAYS AS (earning_inr + incentive_inr + tip_inr) STORED,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for rides query performance
CREATE INDEX IF NOT EXISTS idx_rides_user_time 
ON public.rides(user_id, ride_time DESC);

CREATE INDEX IF NOT EXISTS idx_rides_session 
ON public.rides(work_session_id);

-- 5. EXPENSE RECORDS
-- Stores operating costs (fuel, repairs, tolls, etc.) incurred by the Captain.
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_session_id UUID REFERENCES public.work_sessions(id) ON DELETE SET NULL,
    expense_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    category TEXT NOT NULL CHECK (
        category IN (
            'fuel',
            'maintenance',
            'food_water',
            'parking_tolls',
            'mobile_recharge',
            'insurance',
            'vehicle_emi',
            'riding_equipment',
            'platform_charges',
            'other'
        )
    ),
    custom_category TEXT,
    description TEXT NOT NULL,
    amount_inr NUMERIC(10, 2) NOT NULL CHECK (amount_inr > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for expenses query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_time 
ON public.expenses(user_id, expense_time DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_session 
ON public.expenses(work_session_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict data isolation ensuring users can only read, write, update, and delete their own records.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Work Sessions Policies
CREATE POLICY "work_sessions_select_own" ON public.work_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "work_sessions_insert_own" ON public.work_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_sessions_update_own" ON public.work_sessions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "work_sessions_delete_own" ON public.work_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Rides Policies
CREATE POLICY "rides_select_own" ON public.rides
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "rides_insert_own" ON public.rides
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rides_update_own" ON public.rides
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rides_delete_own" ON public.rides
    FOR DELETE USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "expenses_select_own" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "expenses_insert_own" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_update_own" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "expenses_delete_own" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- 7. AUTOMATIC PROFILE CREATION TRIGGER
-- Whenever a user signs up via Supabase Auth, automatically initialize their Captain profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, partner_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Rapido Captain'),
        COALESCE(new.raw_user_meta_data->>'partner_id', 'RAP-' || substr(new.id::text, 1, 4))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. UPDATED_AT TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
    BEFORE UPDATE ON public.work_sessions
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
