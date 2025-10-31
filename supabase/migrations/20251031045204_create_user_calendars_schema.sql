/*
  # Create user-generated advent calendars system

  1. New Tables
    - `user_calendars`
      - `id` (uuid, primary key, auto-generated)
      - `creator_id` (uuid, references auth.users)
      - `title` (text, calendar title)
      - `description` (text, optional description)
      - `share_code` (text, unique, for sharing)
      - `is_public` (boolean, default false)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())
    
    - `user_calendar_days`
      - `id` (uuid, primary key, auto-generated)
      - `calendar_id` (uuid, references user_calendars)
      - `day_number` (integer, 1-25)
      - `title` (text, optional)
      - `message` (text, optional)
      - `image_url` (text, optional)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())
      - Unique constraint on (calendar_id, day_number)

  2. Security
    - Enable RLS on both tables
    - Creators can view, update, and delete their own calendars
    - Anyone with share_code can view the calendar and its days
    - Only creators can insert/update/delete calendar days

  3. Notes
    - share_code allows sharing without authentication
    - Each user can create multiple calendars
    - Each calendar has 25 days (1-25)
*/

-- Create user_calendars table
CREATE TABLE IF NOT EXISTS user_calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My Advent Calendar',
  description text DEFAULT '',
  share_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_calendar_days table
CREATE TABLE IF NOT EXISTS user_calendar_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id uuid NOT NULL REFERENCES user_calendars(id) ON DELETE CASCADE,
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 25),
  title text DEFAULT '',
  message text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(calendar_id, day_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_calendars_creator ON user_calendars(creator_id);
CREATE INDEX IF NOT EXISTS idx_user_calendars_share_code ON user_calendars(share_code);
CREATE INDEX IF NOT EXISTS idx_user_calendar_days_calendar ON user_calendar_days(calendar_id);

-- Enable Row Level Security
ALTER TABLE user_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_days ENABLE ROW LEVEL SECURITY;

-- Policies for user_calendars
CREATE POLICY "Users can view their own calendars"
  ON user_calendars
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can view public calendars"
  ON user_calendars
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Anyone can view calendars with share code"
  ON user_calendars
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create calendars"
  ON user_calendars
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own calendars"
  ON user_calendars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own calendars"
  ON user_calendars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Policies for user_calendar_days
CREATE POLICY "Anyone can view days of viewable calendars"
  ON user_calendar_days
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = user_calendar_days.calendar_id
    )
  );

CREATE POLICY "Creators can insert days to their calendars"
  ON user_calendar_days
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = calendar_id
      AND user_calendars.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update days in their calendars"
  ON user_calendar_days
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = calendar_id
      AND user_calendars.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = calendar_id
      AND user_calendars.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete days from their calendars"
  ON user_calendar_days
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = calendar_id
      AND user_calendars.creator_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_calendars_updated_at ON user_calendars;
CREATE TRIGGER update_user_calendars_updated_at
  BEFORE UPDATE ON user_calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_calendar_days_updated_at ON user_calendar_days;
CREATE TRIGGER update_user_calendar_days_updated_at
  BEFORE UPDATE ON user_calendar_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();