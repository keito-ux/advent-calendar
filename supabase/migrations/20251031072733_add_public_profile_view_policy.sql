/*
  # Add Public Profile View Policy

  1. Changes
    - Add policy to allow all authenticated users to view other users' public profiles
    - This enables the user search/discovery feature
  
  2. Security
    - Only allows viewing profiles (SELECT)
    - Restricted to authenticated users
    - Does not expose sensitive data
*/

-- Add policy to allow authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
