-- ============================================================================
-- HYNAOS — Complete Supabase SQL Database Setup Script (All 9 Modules)
-- Self-healing & Idempotent Migration Script
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: CREATE TABLES & MIGRATIONS FOR ALL 9 MODULES
-- ============================================================================

-- 1. Employees / Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'General';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'Team Member';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

UPDATE public.profiles SET id = gen_random_uuid() WHERE id IS NULL;

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    manager_name TEXT,
    progress INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    deadline DATE,
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description TEXT;

-- 3A. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    project_name TEXT,
    assignee_name TEXT,
    priority TEXT DEFAULT 'medium',
    deadline DATE,
    status TEXT DEFAULT 'To Do',
    progress INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'To Do';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS description TEXT;

-- 3B. Work Logs Table
CREATE TABLE IF NOT EXISTS public.work_logs (
    id TEXT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    title TEXT NOT NULL,
    project_name TEXT,
    task_name TEXT,
    log_date TEXT DEFAULT 'Today',
    status TEXT DEFAULT 'Submitted for Review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.work_logs DROP CONSTRAINT IF EXISTS work_logs_status_check;
ALTER TABLE public.work_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS task_name TEXT;
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS log_date TEXT DEFAULT 'Today';

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    working_hours NUMERIC(4, 2) DEFAULT 0,
    status TEXT DEFAULT 'Present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attendance ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS working_hours NUMERIC(4, 2) DEFAULT 0;

-- 5. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id TEXT PRIMARY KEY,
    employee_name TEXT NOT NULL,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    admin_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE public.leave_requests DROP CONSTRAINT IF EXISTS leave_requests_leave_type_check;
ALTER TABLE public.leave_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS leave_type TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS admin_comments TEXT;

-- 6. Salary Table
CREATE TABLE IF NOT EXISTS public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    bonus NUMERIC(12, 2) DEFAULT 0,
    deductions NUMERIC(12, 2) DEFAULT 0,
    net_salary NUMERIC(12, 2) NOT NULL,
    net_amount NUMERIC(12, 2),
    payment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Paid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.salaries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.salaries ALTER COLUMN net_amount DROP NOT NULL;
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS basic_salary NUMERIC(12, 2);
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS bonus NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS deductions NUMERIC(12, 2) DEFAULT 0;
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS net_salary NUMERIC(12, 2);
ALTER TABLE public.salaries ADD COLUMN IF NOT EXISTS net_amount NUMERIC(12, 2);

-- 7. Performance Reviews Table
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    review_period TEXT NOT NULL,
    rating NUMERIC(3, 2),
    goals_completed INT DEFAULT 0,
    feedback TEXT,
    reviewer_name TEXT DEFAULT 'Vignesh',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Analytics Metrics Table
CREATE TABLE IF NOT EXISTS public.analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(12, 2) NOT NULL,
    category TEXT NOT NULL,
    period TEXT DEFAULT 'Q3 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    posted_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================================================
-- SECTION 2: CLEAN DROP PREVIOUS POLICIES & ENABLE RLS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop all existing policy names across all schemas to avoid conflict
DROP POLICY IF EXISTS "Public profiles read policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles access" ON public.profiles;

DROP POLICY IF EXISTS "All authenticated view projects" ON public.projects;
DROP POLICY IF EXISTS "Admin manage projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all projects access" ON public.projects;

DROP POLICY IF EXISTS "All authenticated view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees update assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admin manage tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow all tasks access" ON public.tasks;

DROP POLICY IF EXISTS "User view own work logs" ON public.work_logs;
DROP POLICY IF EXISTS "User insert own work logs" ON public.work_logs;
DROP POLICY IF EXISTS "Admin manage work logs" ON public.work_logs;
DROP POLICY IF EXISTS "Allow all work_logs access" ON public.work_logs;

DROP POLICY IF EXISTS "User view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "User insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "User update own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow all attendance access" ON public.attendance;

DROP POLICY IF EXISTS "User view own leaves" ON public.leave_requests;
DROP POLICY IF EXISTS "User insert own leave" ON public.leave_requests;
DROP POLICY IF EXISTS "Admin manage leaves" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow all leave_requests access" ON public.leave_requests;

DROP POLICY IF EXISTS "User view own salary" ON public.salaries;
DROP POLICY IF EXISTS "Admin manage salaries" ON public.salaries;
DROP POLICY IF EXISTS "Allow all salaries access" ON public.salaries;

DROP POLICY IF EXISTS "Allow all performance_reviews access" ON public.performance_reviews;

DROP POLICY IF EXISTS "Allow all analytics_metrics access" ON public.analytics_metrics;

DROP POLICY IF EXISTS "All authenticated view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow all announcements access" ON public.announcements;

-- Create Clean Access Policies
CREATE POLICY "Allow all profiles access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all projects access" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow all tasks access" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow all work_logs access" ON public.work_logs FOR ALL USING (true);
CREATE POLICY "Allow all attendance access" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow all leave_requests access" ON public.leave_requests FOR ALL USING (true);
CREATE POLICY "Allow all salaries access" ON public.salaries FOR ALL USING (true);
CREATE POLICY "Allow all performance_reviews access" ON public.performance_reviews FOR ALL USING (true);
CREATE POLICY "Allow all analytics_metrics access" ON public.analytics_metrics FOR ALL USING (true);
CREATE POLICY "Allow all announcements access" ON public.announcements FOR ALL USING (true);


-- ============================================================================
-- SECTION 3: SEED MOCK DATA FOR ALL 9 MODULES
-- ============================================================================

-- 1. Seed Employees Roster (13 Team Members) with explicit gen_random_uuid()
INSERT INTO public.profiles (id, employee_id, full_name, email, role, department, position, joining_date, status)
VALUES
  (gen_random_uuid(), 'EMP-001', 'Vignesh', 'team.hynastudio@gmail.com', 'admin', 'Executive', 'Founder & CEO', '2024-01-01', 'active'),
  (gen_random_uuid(), 'EMP-002', 'Jashwin J', 'jashwin@hynastudio.com', 'employee', 'Executive', 'Co-Founder & COO', '2024-01-01', 'active'),
  (gen_random_uuid(), 'EMP-003', 'Dharshan J M', 'dharshan@hynastudio.com', 'employee', 'Executive', 'Co-Founder & CTO', '2024-01-01', 'active'),
  (gen_random_uuid(), 'EMP-004', 'Linciya', 'linciya@hynastudio.com', 'employee', 'Marketing', 'CMO — Chief Marketing Officer', '2024-02-01', 'active'),
  (gen_random_uuid(), 'EMP-005', 'New Appointment', 'cso@hynastudio.com', 'employee', 'Strategy', 'CSO — Chief Strategy Officer', '2024-02-01', 'active'),
  (gen_random_uuid(), 'EMP-006', 'Muhammed Zarif', 'zarif@hynastudio.com', 'employee', 'Growth', 'Director & Growth Manager', '2024-02-10', 'active'),
  (gen_random_uuid(), 'EMP-007', 'Mohamed Arshiya', 'arshiya@hynastudio.com', 'employee', 'Product', 'CPO — Chief Product Officer', '2024-02-15', 'active'),
  (gen_random_uuid(), 'EMP-008', 'Asthamil', 'asthamil@hynastudio.com', 'employee', 'Human Resources', 'HR Manager', '2024-02-20', 'active'),
  (gen_random_uuid(), 'EMP-009', 'Tharun Krishna', 'tharun@hynastudio.com', 'employee', 'Design', 'Designer', '2024-03-01', 'active'),
  (gen_random_uuid(), 'EMP-010', 'Akshaya', 'akshaya@hynastudio.com', 'employee', 'Engineering', 'DevOps Engineer', '2024-03-10', 'active'),
  (gen_random_uuid(), 'EMP-011', 'Thivan', 'thivan@hynastudio.com', 'employee', 'Engineering', 'Full Stack Developer', '2024-03-15', 'active'),
  (gen_random_uuid(), 'EMP-012', 'Rohit V', 'rohit@hynastudio.com', 'employee', 'Engineering', 'Full Stack Developer', '2024-03-20', 'active'),
  (gen_random_uuid(), 'EMP-013', 'Anzarutheen', 'anzar@hynastudio.com', 'employee', 'Engineering', 'Full Stack Developer', '2024-04-01', 'active')
ON CONFLICT (employee_id) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    position = EXCLUDED.position,
    department = EXCLUDED.department,
    joining_date = EXCLUDED.joining_date;

-- Ensure no NULL ids remain anywhere in profiles
UPDATE public.profiles SET id = gen_random_uuid() WHERE id IS NULL;

-- 2. Seed Projects
INSERT INTO public.projects (id, name, manager_name, progress, deadline, status, description)
VALUES 
  ('PRJ-101', 'HYNAOS Core Platform', 'Dharshan J M', 85, '2026-09-30', 'active', 'Core enterprise management platform for Hyna Studio.'),
  ('PRJ-102', 'Hyna Studio Rebrand', 'Tharun Krishna', 95, '2026-09-15', 'active', 'Visual identity design update and brand system.'),
  ('PRJ-103', 'Growth Engine & CRM', 'Muhammed Zarif', 60, '2026-10-15', 'active', 'Generative AI marketing copy suite.'),
  ('PRJ-104', 'Product Design System', 'Mohamed Arshiya', 100, '2026-08-30', 'completed', 'Design token library and Web UI assets.'),
  ('PRJ-105', 'Mobile Workspace App', 'Rohit V', 40, '2026-11-01', 'active', 'Mobile application for field attendance and tasks.')
ON CONFLICT (id) DO NOTHING;

-- 3A. Seed Tasks
INSERT INTO public.tasks (id, title, project_name, assignee_name, priority, deadline, status, progress, description)
VALUES
  ('TSK-01', 'Supabase Auth RLS Policies', 'HYNAOS Core Platform', 'Dharshan J M', 'urgent', '2026-09-10', 'To Do', 20, 'Configure database row level security for profiles.'),
  ('TSK-02', 'Fuzzy Bubbles Font Styling', 'Hyna Studio Rebrand', 'Tharun Krishna', 'low', '2026-09-05', 'Completed', 100, 'Integrate Google Font into header typography.'),
  ('TSK-03', 'Kanban Board Drag & Drop', 'HYNAOS Core Platform', 'Rohit V', 'high', '2026-09-12', 'In Progress', 75, 'Build interactive task movement for Admin Panel.'),
  ('TSK-04', 'Employee Salary Calculator', 'HYNAOS Core Platform', 'Asthamil', 'medium', '2026-09-14', 'Review', 90, 'Auto compute Basic + Bonus - Deductions.'),
  ('TSK-05', 'Data Analytics Dashboard', 'HYNAOS Core Platform', 'Linciya', 'high', '2026-09-18', 'In Progress', 50, 'Create visual analytics charts for team metrics.')
ON CONFLICT (id) DO NOTHING;

-- 3B. Seed Work Logs
INSERT INTO public.work_logs (id, employee_name, title, project_name, task_name, log_date, status)
VALUES
  ('WLOG-1', 'Rohit V', 'Configured Employee Panel Security Scoping', 'HYNAOS Core Platform', 'Security Validation', 'Today, 10:30 AM', 'Submitted for Review'),
  ('WLOG-2', 'Rohit V', 'Built Check-In Attendance Counter', 'HYNAOS Core Platform', 'Attendance Module', 'Yesterday, 04:45 PM', 'Approved')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Attendance Logs
INSERT INTO public.attendance (employee_id, employee_name, date, working_hours, status)
VALUES
  ('EMP-001', 'Vignesh', CURRENT_DATE, 8.5, 'Present'),
  ('EMP-002', 'Jashwin J', CURRENT_DATE, 8.0, 'Present'),
  ('EMP-003', 'Dharshan J M', CURRENT_DATE, 9.0, 'Present'),
  ('EMP-008', 'Asthamil', CURRENT_DATE, 8.0, 'Present'),
  ('EMP-012', 'Rohit V', CURRENT_DATE, 7.5, 'Present')
ON CONFLICT DO NOTHING;

-- 5. Seed Leave Requests
INSERT INTO public.leave_requests (id, employee_name, leave_type, start_date, end_date, reason, status, admin_comments)
VALUES
  ('LV-1', 'Rohit V', 'Sick Leave', '2026-09-10', '2026-09-11', 'Medical Appointment', 'Pending', 'Awaiting HR review'),
  ('LV-2', 'Linciya', 'Casual Leave', '2026-09-15', '2026-09-16', 'Personal Work', 'Pending', 'Awaiting Manager review'),
  ('LV-3', 'Anzarutheen', 'Annual Leave', '2026-08-20', '2026-08-22', 'Vacation', 'Approved', 'Approved by Asthamil')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Salary Table (Supports both net_amount and net_salary)
INSERT INTO public.salaries (employee_id, employee_name, basic_salary, bonus, deductions, net_amount, net_salary, payment_date, status)
VALUES
  ('EMP-001', 'Vignesh', 120000.00, 15000.00, 3000.00, 132000.00, 132000.00, '2026-09-01', 'Paid'),
  ('EMP-002', 'Jashwin J', 100000.00, 10000.00, 2000.00, 108000.00, 108000.00, '2026-09-01', 'Paid'),
  ('EMP-003', 'Dharshan J M', 100000.00, 10000.00, 2000.00, 108000.00, 108000.00, '2026-09-01', 'Paid'),
  ('EMP-004', 'Linciya', 85000.00, 8000.00, 1500.00, 91500.00, 91500.00, '2026-09-01', 'Paid'),
  ('EMP-008', 'Asthamil', 80000.00, 5000.00, 1500.00, 83500.00, 83500.00, '2026-09-01', 'Paid'),
  ('EMP-012', 'Rohit V', 75000.00, 8000.00, 1500.00, 81500.00, 81500.00, '2026-09-01', 'Paid')
ON CONFLICT DO NOTHING;

-- 7. Seed Performance Reviews
INSERT INTO public.performance_reviews (employee_id, employee_name, review_period, rating, goals_completed, feedback, reviewer_name)
VALUES
  ('EMP-003', 'Dharshan J M', 'Q2 2026', 4.9, 12, 'Exemplary architectural leadership and system design execution.', 'Vignesh'),
  ('EMP-006', 'Muhammed Zarif', 'Q2 2026', 4.8, 10, 'Outstanding growth marketing strategy and client acquisition.', 'Vignesh'),
  ('EMP-012', 'Rohit V', 'Q2 2026', 4.7, 9, 'Consistent high-quality UI & Full Stack feature delivery.', 'Dharshan J M')
ON CONFLICT DO NOTHING;

-- 8. Seed Analytics Metrics
INSERT INTO public.analytics_metrics (metric_name, metric_value, category, period)
VALUES
  ('Total Active Projects', 5, 'Projects', 'Q3 2026'),
  ('Project Completion Rate', 92.5, 'Performance', 'Q3 2026'),
  ('Monthly Team Velocity', 148, 'Engineering', 'Q3 2026'),
  ('Client Satisfaction Score', 4.9, 'Quality', 'Q3 2026')
ON CONFLICT DO NOTHING;

-- 9. Seed Announcements
INSERT INTO public.announcements (title, content, priority, posted_by)
VALUES
  ('HYNAOS Release 2.0 System Deployment', 'All team members are requested to log into their updated workspace credentials.', 'urgent', 'Vignesh'),
  ('Q3 Team All-Hands Meeting', 'Scheduled for Friday at 4:00 PM IST via Google Meet.', 'important', 'Jashwin J')
ON CONFLICT DO NOTHING;
