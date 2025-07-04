-- Clean Database Script - Delete all data but keep structure
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily to ensure we can delete everything
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relationships DISABLE ROW LEVEL SECURITY;

-- Delete data in correct order (respecting foreign key constraints)
DELETE FROM public.parent_student_relationships;
DELETE FROM public.payments;
DELETE FROM public.invoices;
DELETE FROM public.grades;
DELETE FROM public.activities;
DELETE FROM public.attendance;
DELETE FROM public.enrollment;
DELETE FROM public.classes;
DELETE FROM public.students;
DELETE FROM public.parent_accounts;
DELETE FROM public.parents;
DELETE FROM public.schools;

-- Re-enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- Verify all tables are empty
SELECT 'schools' as table_name, COUNT(*) as count FROM public.schools
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'classes', COUNT(*) FROM public.classes
UNION ALL
SELECT 'enrollment', COUNT(*) FROM public.enrollment
UNION ALL
SELECT 'attendance', COUNT(*) FROM public.attendance
UNION ALL
SELECT 'activities', COUNT(*) FROM public.activities
UNION ALL
SELECT 'grades', COUNT(*) FROM public.grades
UNION ALL
SELECT 'invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'parent_accounts', COUNT(*) FROM public.parent_accounts
UNION ALL
SELECT 'parents', COUNT(*) FROM public.parents
UNION ALL
SELECT 'parent_student_relationships', COUNT(*) FROM public.parent_student_relationships
ORDER BY table_name;

-- Also clean up any auth users (optional - be careful with this!)
-- Note: This will delete ALL users including any test accounts
-- Uncomment the lines below if you want to also delete auth users

-- DELETE FROM auth.users;
-- SELECT COUNT(*) as auth_users_count FROM auth.users;