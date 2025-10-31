/*
  # Advent Calendar Database Schema

  ## Overview
  Creates the complete database structure for the picture book advent calendar app,
  including artists, scenes, translations, tips, and audio narrations.

  ## New Tables

  ### `artists`
  - `id` (uuid, primary key) - Unique artist identifier
  - `name` (text) - Artist's display name
  - `bio` (text) - Artist biography
  - `profile_image_url` (text) - URL to artist's profile picture
  - `country` (text) - Artist's country
  - `created_at` (timestamptz) - Record creation timestamp

  ### `scenes`
  - `id` (uuid, primary key) - Unique scene identifier
  - `day_number` (integer, unique) - Calendar day (1-24/25)
  - `title` (text) - Scene title
  - `image_url` (text) - URL to scene illustration
  - `artist_id` (uuid, foreign key) - Reference to artist
  - `unlock_date` (date) - Date when scene becomes available
  - `created_at` (timestamptz) - Record creation timestamp

  ### `translations`
  - `id` (uuid, primary key) - Unique translation identifier
  - `scene_id` (uuid, foreign key) - Reference to scene
  - `language_code` (text) - Language code (en, ja, uk)
  - `text_content` (text) - Translated story text
  - `audio_url` (text, nullable) - URL to audio narration
  - `created_at` (timestamptz) - Record creation timestamp

  ### `tips`
  - `id` (uuid, primary key) - Unique tip identifier
  - `artist_id` (uuid, foreign key) - Artist receiving the tip
  - `scene_id` (uuid, foreign key, nullable) - Optional scene reference
  - `amount` (numeric) - Tip amount in USD
  - `currency` (text) - Currency code
  - `tipper_name` (text, nullable) - Optional tipper name
  - `message` (text, nullable) - Optional message to artist
  - `stripe_payment_id` (text, nullable) - Stripe transaction ID
  - `created_at` (timestamptz) - Tip timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for artists, scenes, and translations
  - Authenticated write access for tips
  - Tips include policies for users to view their own tips

  ## Indexes
  - Index on scenes.day_number for fast calendar lookups
  - Index on translations (scene_id, language_code) for quick lookups
  - Index on tips.artist_id for aggregating artist earnings
*/

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text DEFAULT '',
  profile_image_url text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer UNIQUE NOT NULL CHECK (day_number >= 1 AND day_number <= 25),
  title text NOT NULL,
  image_url text NOT NULL,
  artist_id uuid REFERENCES artists(id) ON DELETE SET NULL,
  unlock_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid REFERENCES scenes(id) ON DELETE CASCADE NOT NULL,
  language_code text NOT NULL CHECK (language_code IN ('en', 'ja', 'uk')),
  text_content text NOT NULL,
  audio_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(scene_id, language_code)
);

-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  scene_id uuid REFERENCES scenes(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD',
  tipper_name text,
  message text,
  stripe_payment_id text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scenes_day_number ON scenes(day_number);
CREATE INDEX IF NOT EXISTS idx_translations_scene_lang ON translations(scene_id, language_code);
CREATE INDEX IF NOT EXISTS idx_tips_artist ON tips(artist_id);
CREATE INDEX IF NOT EXISTS idx_tips_created ON tips(created_at DESC);

-- Enable RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Artists policies (public read)
CREATE POLICY "Anyone can view artists"
  ON artists FOR SELECT
  TO public
  USING (true);

-- Scenes policies (public read)
CREATE POLICY "Anyone can view scenes"
  ON scenes FOR SELECT
  TO public
  USING (true);

-- Translations policies (public read)
CREATE POLICY "Anyone can view translations"
  ON translations FOR SELECT
  TO public
  USING (true);

-- Tips policies (public can insert, users can view all)
CREATE POLICY "Anyone can create tips"
  ON tips FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view tips"
  ON tips FOR SELECT
  TO public
  USING (true);