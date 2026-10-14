-- RideLedger Initial Database Schema Rollback
-- Migration ID: 20261014000001_initial_schema_down.sql
-- Description: Reverts 20261014000001_initial_schema.sql cleanly.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
DROP TRIGGER IF EXISTS update_rides_updated_at ON public.rides;
DROP TRIGGER IF EXISTS update_work_sessions_updated_at ON public.work_sessions;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.work_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
