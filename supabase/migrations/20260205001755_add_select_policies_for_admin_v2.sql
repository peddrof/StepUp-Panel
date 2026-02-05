/*
  # Add SELECT Policies for Admin Users

  1. Changes
    - Add SELECT policies for all tables to allow admin users to read data
    - Add public SELECT policies for tables needed by mentor report form

  2. Security
    - Admin users can read all data from all tables
    - Public users can read groups and mentors (needed for mentor report form)
    - Maintains existing INSERT, UPDATE, DELETE restrictions
*/

-- Add SELECT policies for students table
CREATE POLICY "Admin users can select students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add SELECT policies for mentors table
CREATE POLICY "Admin users can select mentors"
  ON mentors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public users can read mentors"
  ON mentors FOR SELECT
  TO anon
  USING (true);

-- Add SELECT policies for groups table
CREATE POLICY "Admin users can select groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public users can read groups"
  ON groups FOR SELECT
  TO anon
  USING (true);

-- Add SELECT policies for group_students table
CREATE POLICY "Admin users can select group_students"
  ON group_students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add SELECT policies for class_logs table
CREATE POLICY "Admin users can select class_logs"
  ON class_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
