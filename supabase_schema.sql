-- ============================================================================
-- HYNAOS — Complete Supabase Database Schema & Setup Queries
-- Hyna Studio Management System
-- Paste and execute this entire script in your Supabase SQL Editor:
-- https://app.supabase.com -> Project -> SQL Editor -> New Query
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: TABLES CREATION (ADMIN & EMPLOYEE PANELS)
-- ============================================================================

-- 1. Profiles Table (Stores Admin & Employee Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    avatar_url TEXT,
    department TEXT DEFAULT 'General',
    position TEXT DEFAULT 'Team Member',
    joining_date DATE DEFAULT CURRENT_DATE,
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    manager_name TEXT,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    deadline DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold', 'archived')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    assigned_to_email TEXT,
    assigned_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    deadline DATE,
    status TEXT DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Review', 'Completed')),
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    working_seconds INT DEFAULT 0,
    status TEXT DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Half Day', 'On Leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- 5. Work Logs Table
CREATE TABLE IF NOT EXISTS public.work_logs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    task_name TEXT,
    log_date TEXT DEFAULT 'Today',
    status TEXT DEFAULT 'Submitted for Review' CHECK (status IN ('Submitted for Review', 'Approved', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('Sick Leave', 'Casual Leave', 'Paid Leave', 'Emergency Leave')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    admin_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Salary Breakdown Table
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    net_amount NUMERIC(12, 2) NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    bonus NUMERIC(12, 2) DEFAULT 0,
    deductions NUMERIC(12, 2) DEFAULT 0,
    payment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Processing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    posted_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================================================
-- SECTION 2: ROW LEVEL SECURITY (RLS) & IDEMPOTENT POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function to Check if Current User is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles read policy" ON public.profiles;
CREATE POLICY "Public profiles read policy" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update all profiles" ON public.profiles;
CREATE POLICY "Admin update all profiles" ON public.profiles FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects Policies
DROP POLICY IF EXISTS "All authenticated view projects" ON public.projects;
CREATE POLICY "All authenticated view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage projects" ON public.projects;
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL USING (public.is_admin());

-- Tasks Policies
DROP POLICY IF EXISTS "All authenticated view tasks" ON public.tasks;
CREATE POLICY "All authenticated view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Employees update assigned tasks" ON public.tasks;
CREATE POLICY "Employees update assigned tasks" ON public.tasks FOR UPDATE USING (assigned_user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage tasks" ON public.tasks;
CREATE POLICY "Admin manage tasks" ON public.tasks FOR ALL USING (public.is_admin());

-- Attendance Policies
DROP POLICY IF EXISTS "User view own attendance" ON public.attendance;
CREATE POLICY "User view own attendance" ON public.attendance FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "User insert own attendance" ON public.attendance;
CREATE POLICY "User insert own attendance" ON public.attendance FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "User update own attendance" ON public.attendance;
CREATE POLICY "User update own attendance" ON public.attendance FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- Work Logs Policies
DROP POLICY IF EXISTS "User view own work logs" ON public.work_logs;
CREATE POLICY "User view own work logs" ON public.work_logs FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "User insert own work logs" ON public.work_logs;
CREATE POLICY "User insert own work logs" ON public.work_logs FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage work logs" ON public.work_logs;
CREATE POLICY "Admin manage work logs" ON public.work_logs FOR ALL USING (public.is_admin());

-- Leave Requests Policies
DROP POLICY IF EXISTS "User view own leaves" ON public.leave_requests;
CREATE POLICY "User view own leaves" ON public.leave_requests FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "User insert own leave" ON public.leave_requests;
CREATE POLICY "User insert own leave" ON public.leave_requests FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin manage leaves" ON public.leave_requests;
CREATE POLICY "Admin manage leaves" ON public.leave_requests FOR ALL USING (public.is_admin());

-- Salary Policies
DROP POLICY IF EXISTS "User view own salary" ON public.salaries;
CREATE POLICY "User view own salary" ON public.salaries FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage salaries" ON public.salaries;
CREATE POLICY "Admin manage salaries" ON public.salaries FOR ALL USING (public.is_admin());

-- Announcements Policies
DROP POLICY IF EXISTS "All authenticated view announcements" ON public.announcements;
CREATE POLICY "All authenticated view announcements" ON public.announcements FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage announcements" ON public.announcements;
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "User view own notifications" ON public.notifications;
CREATE POLICY "User view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "User update own notifications" ON public.notifications;
CREATE POLICY "User update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());


-- ============================================================================
-- SECTION 3: AUTOMATIC USER SIGNUP TRIGGER (LOGIN & ROLE ASSIGNMENT)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT;
  assigned_emp_id TEXT;
  user_count INT;
BEGIN
  IF LOWER(new.email) = 'team.hynastudio@gmail.com' THEN
    assigned_role := 'admin';
    assigned_emp_id := 'EMP-001';
  ELSE
    assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
    SELECT COUNT(*) + 1 INTO user_count FROM public.profiles;
    assigned_emp_id := 'EMP-' || LPAD(user_count::text, 3, '0');
  END IF;

  INSERT INTO public.profiles (
    id,
    employee_id,
    full_name,
    email,
    role,
    department,
    position,
    status
  )
  VALUES (
    new.id,
    assigned_emp_id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role,
    COALESCE(new.raw_user_meta_data->>'department', 'Engineering'),
    COALESCE(new.raw_user_meta_data->>'position', 'Team Member'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution setup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- SECTION 4: ADMIN PROMOTION & SEED DATA QUERIES
-- ============================================================================

-- Promote Administrator Email Account
UPDATE public.profiles
SET role = 'admin',
    employee_id = 'EMP-001',
    full_name = 'Vignesh',
    department = 'Executive Management',
    position = 'Founder & CEO',
    status = 'active'
WHERE LOWER(email) = 'team.hynastudio@gmail.com';

-- Insert Sample Projects
INSERT INTO public.projects (id, name, manager_name, progress, deadline, status, description)
VALUES 
  ('PRJ-101', 'HYNAOS Core Platform', 'Dharshan J M', 85, '2026-09-30', 'active', 'Core enterprise management platform for Hyna Studio.'),
  ('PRJ-102', 'Hyna Studio Rebrand', 'Tharun Krishna', 95, '2026-09-15', 'active', 'Visual identity design update and brand system.'),
  ('PRJ-103', 'AI Content Generator', 'Muhammed Zarif', 60, '2026-10-15', 'active', 'Generative AI marketing copy suite.'),
  ('PRJ-104', 'Client Portal Redesign', 'Linciya', 30, '2026-10-30', 'active', 'Redesign portal layout for studio clients.'),
  ('PRJ-105', 'Mobile Workspace App', 'Rohit V', 40, '2026-11-01', 'active', 'Mobile application for field attendance and tasks.')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Announcements
INSERT INTO public.announcements (title, content, priority, posted_by)
VALUES 
  ('HYNAOS Release 2.0 System Deployment', 'All team members are requested to log into their updated workspace credentials.', 'urgent', 'Vignesh'),
  ('Q3 Team All-Hands Meeting', 'Scheduled for Friday at 4:00 PM IST via Google Meet.', 'important', 'Jashwin J')
ON CONFLICT DO NOTHING;
