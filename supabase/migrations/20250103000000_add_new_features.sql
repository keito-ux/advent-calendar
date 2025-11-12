/*
  # Add New Features: Bookmarks, 3D Model Placements
  
  1. New Tables
    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `calendar_user_id` (uuid, references auth.users) - The user whose calendar is bookmarked
      - `created_at` (timestamp)
      - Unique constraint on (user_id, calendar_user_id)
    
    - `user_3d_placements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `model_url` (text) - 3D model URL
      - `position_x` (float)
      - `position_y` (float)
      - `position_z` (float)
      - `rotation_x` (float, default 0)
      - `rotation_y` (float, default 0)
      - `rotation_z` (float, default 0)
      - `scale` (float, default 1.0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Users can manage their own bookmarks, bonuses, and placements
    - Public can view bookmarks (for sharing)
*/

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, calendar_user_id)
);

-- Create user_3d_placements table
CREATE TABLE IF NOT EXISTS user_3d_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_url text NOT NULL,
  position_x float NOT NULL DEFAULT 0,
  position_y float NOT NULL DEFAULT 0,
  position_z float NOT NULL DEFAULT 0,
  rotation_x float NOT NULL DEFAULT 0,
  rotation_y float NOT NULL DEFAULT 0,
  rotation_z float NOT NULL DEFAULT 0,
  scale float NOT NULL DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_3d_placements ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view bookmarks"
  ON bookmarks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User 3D placements policies
CREATE POLICY "Users can view their own placements"
  ON user_3d_placements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view placements"
  ON user_3d_placements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own placements"
  ON user_3d_placements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own placements"
  ON user_3d_placements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own placements"
  ON user_3d_placements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_calendar_user ON bookmarks(calendar_user_id);
CREATE INDEX IF NOT EXISTS idx_user_3d_placements_user ON user_3d_placements(user_id);

-- Function to update updated_at for user_3d_placements
CREATE OR REPLACE FUNCTION update_user_3d_placements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_3d_placements_updated_at ON user_3d_placements;
CREATE TRIGGER update_user_3d_placements_updated_at
  BEFORE UPDATE ON user_3d_placements
  FOR EACH ROW
  EXECUTE FUNCTION update_user_3d_placements_updated_at();

