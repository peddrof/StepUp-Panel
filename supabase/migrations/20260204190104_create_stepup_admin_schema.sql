/*
  # StepUp Admin OS - Complete Database Schema

  1. New Tables
    - `profiles` - Admin user profiles linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, default 'admin')
      - `created_at` (timestamptz)
    
    - `mentors` - Mentor information
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text, unique)
      - `expertise_level` (text)
      - `pin_code` (text) - For mentor report authentication
      - `created_at` (timestamptz)
    
    - `students` - Student information
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `english_level` (text)
      - `status` (text, default 'active')
      - `created_at` (timestamptz)
    
    - `groups` - Class groups (Groups)
      - `id` (uuid, primary key)
      - `name` (text)
      - `level` (text)
      - `schedule_time` (text)
      - `mentor_id` (uuid, references mentors)
      - `created_at` (timestamptz)
    
    - `group_students` - Junction table for group-student relationships
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `student_id` (uuid, references students)
      - `created_at` (timestamptz)
    
    - `class_logs` - Class session logs
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `date` (date)
      - `topic` (text)
      - `attendance_data` (jsonb) - Array of student IDs who attended
      - `notes` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Profiles: Users can read their own profile
    - Mentors/Students/Groups: Authenticated admins can CRUD
    - Class Logs: Public insert allowed (for mentor reports), admin read/update/delete
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text UNIQUE NOT NULL,
  expertise_level text NOT NULL DEFAULT 'intermediate',
  pin_code text NOT NULL DEFAULT '1234',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mentors"
  ON mentors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mentors"
  ON mentors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mentors"
  ON mentors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mentors"
  ON mentors FOR DELETE
  TO authenticated
  USING (true);

-- Allow public to verify pin codes (for mentor report)
CREATE POLICY "Public can read mentors for verification"
  ON mentors FOR SELECT
  TO anon
  USING (true);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  english_level text NOT NULL DEFAULT 'A1',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Allow public read for mentor report form
CREATE POLICY "Public can read students for attendance"
  ON students FOR SELECT
  TO anon
  USING (true);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text NOT NULL,
  schedule_time text NOT NULL,
  mentor_id uuid REFERENCES mentors(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete groups"
  ON groups FOR DELETE
  TO authenticated
  USING (true);

-- Allow public read for mentor report form
CREATE POLICY "Public can read groups for report form"
  ON groups FOR SELECT
  TO anon
  USING (true);

-- Create group_students junction table
CREATE TABLE IF NOT EXISTS group_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, student_id)
);

ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read group_students"
  ON group_students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert group_students"
  ON group_students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update group_students"
  ON group_students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete group_students"
  ON group_students FOR DELETE
  TO authenticated
  USING (true);

-- Allow public read for mentor report
CREATE POLICY "Public can read group_students for attendance"
  ON group_students FOR SELECT
  TO anon
  USING (true);

-- Create class_logs table
CREATE TABLE IF NOT EXISTS class_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date date NOT NULL,
  topic text NOT NULL,
  attendance_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE class_logs ENABLE ROW LEVEL SECURITY;

-- Public can insert class logs (for mentor reports)
CREATE POLICY "Public can insert class logs"
  ON class_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read class_logs"
  ON class_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert class_logs"
  ON class_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update class_logs"
  ON class_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete class_logs"
  ON class_logs FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_mentor_id ON groups(mentor_id);
CREATE INDEX IF NOT EXISTS idx_group_students_group_id ON group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_group_students_student_id ON group_students(student_id);
CREATE INDEX IF NOT EXISTS idx_class_logs_group_id ON class_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_class_logs_date ON class_logs(date);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_english_level ON students(english_level);