-- ========================================================================
-- ODA TUTORIAL CLASS - COMPLETE SUPABASE CLOUD DATABASE SCHEMA
-- Includes Profiles, Roles, Grades, Subjects, Courses, Chapters, Lessons,
-- Payment Settings, Payments, Subscriptions, Audit Logs, and Row Level Security (RLS)
-- ========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER ROLES & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('owner', 'admin', 'student')),
  grade TEXT NOT NULL DEFAULT 'Grade 12',
  stream TEXT,
  school_name TEXT,
  city_or_region TEXT DEFAULT 'Finfinnee',
  is_registered BOOLEAN NOT NULL DEFAULT TRUE,
  has_all_subjects_access BOOLEAN NOT NULL DEFAULT FALSE,
  enrolled_subject_ids TEXT[] DEFAULT '{}',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GRADES TABLE
CREATE TABLE IF NOT EXISTS public.grades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  order_index INTEGER NOT NULL DEFAULT 1,
  all_subjects_price_etb NUMERIC(10, 2) NOT NULL DEFAULT 800,
  all_subjects_price_usd NUMERIC(10, 2) NOT NULL DEFAULT 18,
  duration_label TEXT DEFAULT 'Semester (6 Months)',
  duration_days INTEGER DEFAULT 180,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  grade TEXT NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
  stream TEXT,
  code TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  price_etb NUMERIC(10, 2) NOT NULL DEFAULT 200,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  instructor_name TEXT DEFAULT 'Mr. Oda Worku',
  instructor_title TEXT DEFAULT 'Senior Mathematics Specialist & Platform Lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  chapter_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  is_premium BOOLEAN NOT NULL DEFAULT TRUE,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LESSONS / LEARNING PARTS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  part_number INTEGER NOT NULL DEFAULT 1,
  topic_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 20,
  is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  video_url TEXT DEFAULT '',
  video_poster TEXT,
  text_notes TEXT,
  exam_time_minutes INTEGER DEFAULT 15,
  concept_breakdown JSONB DEFAULT '[]'::jsonb,
  downloadables JSONB DEFAULT '[]'::jsonb,
  quiz_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PAYMENT SETTINGS TABLE (Single authoritative config row)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'global_payment_settings',
  grade_packages JSONB NOT NULL DEFAULT '{}'::jsonb,
  subject_prices JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  promotions JSONB NOT NULL DEFAULT '[]'::jsonb,
  subscription_durations JSONB NOT NULL DEFAULT '[]'::jsonb,
  active_academic_year TEXT DEFAULT '2025/2026 E.C. (2018 A.L.I)',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Mr. Oda Worku (odaworku174@gmail.com)'
);

-- 8. PAYMENTS & TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT 'pay-' || gen_random_uuid(),
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  student_email TEXT,
  grade TEXT NOT NULL,
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('all_subjects_package', 'individual_subjects')),
  subject_id TEXT,
  subject_title TEXT,
  subject_ids TEXT[] DEFAULT '{}',
  subject_titles TEXT[] DEFAULT '{}',
  amount_etb NUMERIC(10, 2) NOT NULL,
  amount_usd NUMERIC(10, 2) DEFAULT 0,
  payment_method TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. STUDENT SUBSCRIPTIONS & ENROLLMENT
CREATE TABLE IF NOT EXISTS public.student_subscriptions (
  id TEXT PRIMARY KEY DEFAULT 'sub-' || gen_random_uuid(),
  student_id TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject_id TEXT,
  is_all_subjects BOOLEAN NOT NULL DEFAULT FALSE,
  payment_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  granted_by TEXT DEFAULT 'Mr. Oda Worku',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT 'notif-' || gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement',
  target_grade TEXT DEFAULT 'All',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT 'audit-' || gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_email TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_student_id TEXT,
  target_student_name TEXT,
  details TEXT NOT NULL
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin helper function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'odaworku174@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SUBJECTS RLS:
-- Students can only view published subjects
CREATE POLICY "Public and students can view published subjects"
ON public.subjects FOR SELECT
USING (is_published = true OR public.is_super_admin());

-- Only Super Admin can insert/update/delete subjects
CREATE POLICY "Super Admin can manage subjects"
ON public.subjects FOR ALL
USING (public.is_super_admin());

-- CHAPTERS RLS:
-- Students can only view published chapters
CREATE POLICY "Public and students can view published chapters"
ON public.chapters FOR SELECT
USING (is_published = true OR public.is_super_admin());

-- Only Super Admin can manage chapters
CREATE POLICY "Super Admin can manage chapters"
ON public.chapters FOR ALL
USING (public.is_super_admin());

-- LESSONS RLS:
-- Students can only view published lessons
CREATE POLICY "Public and students can view published lessons"
ON public.lessons FOR SELECT
USING (is_published = true OR public.is_super_admin());

-- Only Super Admin can manage lessons
CREATE POLICY "Super Admin can manage lessons"
ON public.lessons FOR ALL
USING (public.is_super_admin());

-- PAYMENT SETTINGS RLS:
-- Everyone can read payment settings (prices, accounts)
CREATE POLICY "Everyone can view active payment settings"
ON public.payment_settings FOR SELECT
USING (true);

-- Only Super Admin can update payment settings
CREATE POLICY "Super Admin can update payment settings"
ON public.payment_settings FOR ALL
USING (public.is_super_admin());

-- PAYMENTS RLS:
-- Students can insert payments and view their own transactions
CREATE POLICY "Students can view their own payments"
ON public.payments FOR SELECT
USING (student_email = auth.jwt() ->> 'email' OR public.is_super_admin());

CREATE POLICY "Students can submit payments"
ON public.payments FOR INSERT
WITH CHECK (true);

-- Only Super Admin can update payment verification status
CREATE POLICY "Super Admin can update payments"
ON public.payments FOR UPDATE
USING (public.is_super_admin());

-- AUDIT LOGS RLS:
-- Only Super Admin can read audit logs
CREATE POLICY "Super Admin can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_super_admin());

CREATE POLICY "Super Admin can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (public.is_super_admin());

-- ========================================================================
-- REALTIME REPLICATION ENABLEMENT
-- ========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
