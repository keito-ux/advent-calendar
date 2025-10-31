/*
  # Add username and theme customization to user calendars

  1. Changes to user_calendars table
    - Add `username` field (text, for display name)
    - Add `theme` field (text, for selected theme/design)
    - Add `background_image` field (text, optional custom background)

  2. Create profiles table for user information
    - `id` (uuid, references auth.users)
    - `username` (text, unique, required)
    - `email` (text, required)
    - `created_at` (timestamp)

  3. Security
    - Enable RLS on profiles table
    - Users can view and update their own profile
    - Add policies for profile management

  4. Notes
    - Theme options will include: default, winter, festive, cozy, elegant
    - Username is stored in profiles for reuse across calendars
*/

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add username and theme fields to user_calendars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendars' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_calendars ADD COLUMN username text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendars' AND column_name = 'theme'
  ) THEN
    ALTER TABLE user_calendars ADD COLUMN theme text DEFAULT 'default';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendars' AND column_name = 'background_image'
  ) THEN
    ALTER TABLE user_calendars ADD COLUMN background_image text DEFAULT '';
  END IF;
END $$;

-- Enable Row Level Security on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);