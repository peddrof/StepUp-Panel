/*
  # Fix Class Logs RLS Policy - Remove Overly Permissive Anonymous Access

  1. Changes
    - Drop the "Public can insert class logs" policy that allows unrestricted anonymous access
    - Retain authenticated user policies for admin access
    - Note: If mentors need to submit class logs via PIN authentication, this should be handled
      through a secure Edge Function that validates the PIN and performs the insert with
      service role credentials, rather than allowing unrestricted anonymous access

  2. Security
    - Removes security vulnerability where anonymous users could insert arbitrary data
    - Class logs can now only be inserted by authenticated admin users
    - For mentor report functionality, implement a secure Edge Function with PIN validation
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can insert class logs" ON class_logs;
