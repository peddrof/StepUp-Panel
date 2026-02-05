/*
  # Add Display Fields to Profiles

  1. Changes
    - Add `display_name` column to profiles table for customizable display name
    - Add `avatar_url` column to profiles table for profile photo URL
    - Both fields are optional and can be updated by users

  2. Security
    - Users can update their own display_name and avatar_url through existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;