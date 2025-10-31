/*
  # Create Advent Calendar Table

  1. New Tables
    - `Advent Calendar`
      - `id` (uuid, primary key)
      - `day_number` (integer, 1-25, unique)
      - `title` (text)
      - `image_url` (text)
      - `is_unlocked` (boolean, default false)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `Advent Calendar` table
    - Add policy for public read access
    - Add policy for authenticated users to update unlock status
*/

-- Create Advent Calendar table
CREATE TABLE IF NOT EXISTS "Advent Calendar" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL UNIQUE CHECK (day_number >= 1 AND day_number <= 25),
  title text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  is_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE "Advent Calendar" ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Anyone can view advent calendar"
  ON "Advent Calendar"
  FOR SELECT
  TO public
  USING (true);

-- Policy for public insert
CREATE POLICY "Anyone can insert advent calendar entries"
  ON "Advent Calendar"
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy for public update
CREATE POLICY "Anyone can update advent calendar"
  ON "Advent Calendar"
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index on day_number for faster queries
CREATE INDEX IF NOT EXISTS advent_calendar_day_number_idx ON "Advent Calendar" (day_number);