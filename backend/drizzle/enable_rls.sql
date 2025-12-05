-- =====================================================
-- Row Level Security (RLS) Policies for Job Tracker
-- =====================================================
-- This migration enables RLS on all tables and creates policies
-- that work with the current API-first architecture.
--
-- IMPORTANT: Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Enable RLS on all tables
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Create helper function to get current user ID
-- =====================================================
-- This function allows the API to set the current user context
-- The API should execute: SET app.current_user_id = '<user_id>';
-- before running queries.

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- =====================================================
-- 3. Users Table Policies
-- =====================================================

-- Allow PUBLIC SELECT for email lookup during login/registration
-- This is required for authentication to work
CREATE POLICY "Allow public email lookup for authentication"
  ON users
  FOR SELECT
  TO public
  USING (true);

-- Allow users to read their own data
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (id = public.current_user_id());

-- Allow users to update their own data
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- Allow service role (API) to insert new users during registration
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 4. Companies Table Policies
-- =====================================================

-- Allow users to view their own companies
CREATE POLICY "Users can view own companies"
  ON companies
  FOR SELECT
  USING (user_id = public.current_user_id());

-- Allow users to create companies
CREATE POLICY "Users can create companies"
  ON companies
  FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to update their own companies
CREATE POLICY "Users can update own companies"
  ON companies
  FOR UPDATE
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to delete their own companies
CREATE POLICY "Users can delete own companies"
  ON companies
  FOR DELETE
  USING (user_id = public.current_user_id());

-- =====================================================
-- 5. Job Applications Table Policies
-- =====================================================

-- Allow users to view their own job applications
CREATE POLICY "Users can view own applications"
  ON job_applications
  FOR SELECT
  USING (user_id = public.current_user_id());

-- Allow users to create job applications
CREATE POLICY "Users can create applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to update their own job applications
CREATE POLICY "Users can update own applications"
  ON job_applications
  FOR UPDATE
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

-- Allow users to delete their own job applications
CREATE POLICY "Users can delete own applications"
  ON job_applications
  FOR DELETE
  USING (user_id = public.current_user_id());

-- =====================================================
-- 6. OAuth Sessions Table Policies
-- =====================================================

-- Allow users to view their own OAuth sessions
CREATE POLICY "Users can view own oauth sessions"
  ON oauth_sessions
  FOR SELECT
  USING (user_id = public.current_user_id());

-- Allow service role to insert OAuth sessions
CREATE POLICY "Service role can insert oauth sessions"
  ON oauth_sessions
  FOR INSERT
  WITH CHECK (true);

-- Allow automatic cleanup of expired sessions
CREATE POLICY "Service role can delete oauth sessions"
  ON oauth_sessions
  FOR DELETE
  USING (true);

-- =====================================================
-- 7. Grant necessary permissions
-- =====================================================
-- Ensure the authenticated role has the necessary privileges

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also grant to anon role for unauthenticated access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is enabled:
--
-- Check RLS status:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public';
--
-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
--
-- =====================================================
