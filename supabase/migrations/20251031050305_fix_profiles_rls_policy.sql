/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing restrictive policies
    - Add policy to allow any authenticated user to insert their profile
    - This fixes the issue where new users cannot create their profile

  2. Security
    - Users can only insert profiles with their own user ID
    - Maintains security while allowing account creation
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new INSERT policy that works properly
CREATE POLICY "Authenticated users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure we have proper SELECT and UPDATE policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);