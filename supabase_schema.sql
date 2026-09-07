-- ============================================================================
-- HYNAOS — Supabase Database Schema & Setup Queries
-- Hyna Studio Management System
-- Execute these SQL queries in your Supabase SQL Editor (https://app.supabase.com)
-- ============================================================================

-- 1. Create the 'profiles' Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    employee_id TEXT UNIQUE,
    profile_photo TEXT,
    department TEXT,
    position TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Security Policies
-- Policy A: Allow users to view their own profile
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
CREATE POLICY "Allow users to view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy B: Allow admins to view and manage all profiles
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON public.profiles;
CREATE POLICY "Allow admins to view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.profiles;
CREATE POLICY "Allow admins to insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Allow admins to update profiles" ON public.profiles;
CREATE POLICY "Allow admins to update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Automatic Profile Handler Trigger for New Supabase Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, department, position)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'employee'), -- Default role is employee
    'General',
    'Team Member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. Query to Assign Administrator Role to team.hynastudio@gmail.com
-- ============================================================================
-- Run this query after creating the account in Supabase Authentication:

UPDATE public.profiles
SET role = 'admin',
    full_name = 'Hyna Administrator',
    department = 'Executive Management',
    position = 'System Administrator',
    status = 'active'
WHERE email = 'team.hynastudio@gmail.com';

-- In case the user exists in auth.users but not yet in public.profiles:
INSERT INTO public.profiles (id, full_name, email, role, employee_id, department, position, status)
SELECT 
    id,
    'Hyna Administrator',
    email,
    'admin',
    'ADM-001',
    'Executive Management',
    'System Administrator',
    'active'
FROM auth.users
WHERE email = 'team.hynastudio@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin',
    status = 'active';
