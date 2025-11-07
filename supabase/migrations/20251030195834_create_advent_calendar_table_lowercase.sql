/*
  # Create advent_calendar table with lowercase name

  1. New Tables
    - `advent_calendar` (lowercase, with underscore)
      - `id` (uuid, primary key, auto-generated)
      - `day_number` (integer, unique, 1-25)
      - `title` (text, required)
      - `image_url` (text, required)
      - `is_unlocked` (boolean, default false)
      - `created_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `advent_calendar` table
    - Add policy for anyone to view advent calendar entries
    - Add policy for anyone to insert advent calendar entries
    - Add policy for anyone to update advent calendar entries

  3. Notes
    - This creates a properly named table to replace "Advent Calendar"
    - The table name follows PostgreSQL naming conventions (lowercase with underscores)
*/

-- Create the advent_calendar table if it doesn't exist
CREATE TABLE IF NOT EXISTS advent_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 25),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  is_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE advent_calendar ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'advent_calendar' 
    AND policyname = 'Anyone can view advent calendar'
  ) THEN
    CREATE POLICY "Anyone can view advent calendar"
      ON advent_calendar
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'advent_calendar' 
    AND policyname = 'Anyone can insert advent calendar entries'
  ) THEN
    CREATE POLICY "Anyone can insert advent calendar entries"
      ON advent_calendar
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'advent_calendar' 
    AND policyname = 'Anyone can update advent calendar'
  ) THEN
    CREATE POLICY "Anyone can update advent calendar"
      ON advent_calendar
      FOR UPDATE
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;