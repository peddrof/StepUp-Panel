/*
  # Lock down SELECT policies

  Closes a data exposure: the public anon key could read all student PII via
  SELECT policies that existed for the old /mentor-report form (which showed
  rosters before any PIN). That form has been retired and now redirects to the
  PIN-gated /mentor portal, which reads only through service-role edge functions
  (mentor-portal-data, submit-mentor-report) that bypass RLS — so no anon read
  path is needed anymore.

  Also drops the redundant "Authenticated users can read ... (USING true)"
  policies, leaving the admin-role-checked "Admin users can select ..." policies
  as the sole SELECT path. Verified safe: the project has a single auth user
  with role='admin' and no non-admin accounts.

  IMPORTANT — apply this only AFTER the /mentor-report redirect is live in
  production, otherwise the old anon-dependent form breaks.
*/

-- Anon (public key) read access — remove entirely.
DROP POLICY IF EXISTS "Public can read students for attendance" ON students;
DROP POLICY IF EXISTS "Public can read group_students for attendance" ON group_students;
DROP POLICY IF EXISTS "Public can read groups for report form" ON groups;
DROP POLICY IF EXISTS "Public users can read groups" ON groups;

-- Broad authenticated read — tighten to admin-only (admin policies remain).
DROP POLICY IF EXISTS "Authenticated users can read students" ON students;
DROP POLICY IF EXISTS "Authenticated users can read mentors" ON mentors;
DROP POLICY IF EXISTS "Authenticated users can read groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can read group_students" ON group_students;
DROP POLICY IF EXISTS "Authenticated users can read class_logs" ON class_logs;
