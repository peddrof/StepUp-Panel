/*
  # Fix RLS Policies - Restrict to Admin Users Only

  1. Changes
    - Drop all overly permissive policies that use USING (true)
    - Replace with admin-only policies that check user role in profiles table
    - Keep public insert policy for class_logs (needed for mentor report form)
    - Keep public read policies (needed for mentor report form and dashboard)

  2. Security
    - Only users with 'admin' role in profiles table can perform CRUD operations
    - Public users (anon) can still insert class logs via mentor report
    - Public users can read necessary data for forms
*/

-- Drop and recreate policies for students table
DROP POLICY IF EXISTS "Authenticated users can insert students" ON students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON students;

CREATE POLICY "Admin users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop and recreate policies for mentors table
DROP POLICY IF EXISTS "Authenticated users can insert mentors" ON mentors;
DROP POLICY IF EXISTS "Authenticated users can update mentors" ON mentors;
DROP POLICY IF EXISTS "Authenticated users can delete mentors" ON mentors;

CREATE POLICY "Admin users can insert mentors"
  ON mentors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update mentors"
  ON mentors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete mentors"
  ON mentors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop and recreate policies for groups table
DROP POLICY IF EXISTS "Authenticated users can insert groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON groups;

CREATE POLICY "Admin users can insert groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete groups"
  ON groups FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop and recreate policies for group_students table
DROP POLICY IF EXISTS "Authenticated users can insert group_students" ON group_students;
DROP POLICY IF EXISTS "Authenticated users can update group_students" ON group_students;
DROP POLICY IF EXISTS "Authenticated users can delete group_students" ON group_students;

CREATE POLICY "Admin users can insert group_students"
  ON group_students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update group_students"
  ON group_students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete group_students"
  ON group_students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop and recreate policies for class_logs table
DROP POLICY IF EXISTS "Authenticated users can insert class_logs" ON class_logs;
DROP POLICY IF EXISTS "Authenticated users can update class_logs" ON class_logs;
DROP POLICY IF EXISTS "Authenticated users can delete class_logs" ON class_logs;

CREATE POLICY "Admin users can insert class_logs"
  ON class_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update class_logs"
  ON class_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete class_logs"
  ON class_logs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
