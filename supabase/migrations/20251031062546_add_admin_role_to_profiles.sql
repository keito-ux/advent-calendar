/*
  # Add admin role to profiles table

  1. Changes
    - Add `is_admin` boolean column to profiles table
    - Set default value to false
    - Set atelierkvitka0@gmail.com as admin

  2. Security
    - Only admins can view admin dashboard
    - Regular users cannot modify is_admin field
*/

-- Add is_admin column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Set admin user
UPDATE profiles
SET is_admin = true
WHERE email = 'atelierkvitka0@gmail.com';

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$;