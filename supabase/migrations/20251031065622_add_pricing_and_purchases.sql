/*
  # Add Pricing and Purchase System

  1. Changes to user_calendars table
    - Add `price` column (decimal) - Price for entire calendar access
    - Add `currency` column (text) - Currency code (USD, JPY, EUR, etc.)
    
  2. Changes to user_calendar_days table
    - Add `price` column (decimal) - Price for individual day access
    - Add `currency` column (text) - Currency code
    
  3. New Tables
    - `calendar_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Buyer's user ID
      - `calendar_id` (uuid) - Calendar being purchased
      - `day_number` (integer, nullable) - If null, full calendar access; if set, specific day access
      - `amount` (decimal) - Amount paid
      - `currency` (text) - Currency used
      - `payment_intent_id` (text) - Stripe payment intent ID
      - `status` (text) - Payment status: 'pending', 'completed', 'failed'
      - `created_at` (timestamp)
      
  4. Security
    - Enable RLS on `calendar_purchases` table
    - Add policies for users to view their own purchases
    - Add policies for calendar creators to view purchases of their calendars
    
  5. Important Notes
    - Prices are stored as decimal for precision
    - Support for both full calendar and per-day purchases
    - Creators can see their earnings
    - Buyers can see what they've purchased
*/

-- Add pricing columns to user_calendars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendars' AND column_name = 'price'
  ) THEN
    ALTER TABLE user_calendars ADD COLUMN price decimal(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendars' AND column_name = 'currency'
  ) THEN
    ALTER TABLE user_calendars ADD COLUMN currency text DEFAULT 'USD';
  END IF;
END $$;

-- Add pricing columns to user_calendar_days
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendar_days' AND column_name = 'price'
  ) THEN
    ALTER TABLE user_calendar_days ADD COLUMN price decimal(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_calendar_days' AND column_name = 'currency'
  ) THEN
    ALTER TABLE user_calendar_days ADD COLUMN currency text DEFAULT 'USD';
  END IF;
END $$;

-- Create calendar_purchases table
CREATE TABLE IF NOT EXISTS calendar_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_id uuid NOT NULL REFERENCES user_calendars(id) ON DELETE CASCADE,
  day_number integer,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_intent_id text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON calendar_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own purchases
CREATE POLICY "Users can create own purchases"
  ON calendar_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Calendar creators can view purchases of their calendars
CREATE POLICY "Creators can view calendar purchases"
  ON calendar_purchases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_calendars
      WHERE user_calendars.id = calendar_purchases.calendar_id
      AND user_calendars.creator_id = auth.uid()
    )
  );

-- Create index for faster purchase lookups
CREATE INDEX IF NOT EXISTS idx_calendar_purchases_user_calendar 
  ON calendar_purchases(user_id, calendar_id);

CREATE INDEX IF NOT EXISTS idx_calendar_purchases_calendar 
  ON calendar_purchases(calendar_id);