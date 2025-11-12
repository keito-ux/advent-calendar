/*
  # Add user_id to advent_calendar table
  
  1. Add user_id column to advent_calendar table
  2. Update existing records (optional, set to NULL for existing records)
  3. Add index for better query performance
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'advent_calendar' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE advent_calendar ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_advent_calendar_user_id ON advent_calendar(user_id);

-- Update RLS policies to allow users to view their own calendars
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own advent calendars" ON advent_calendar;
  DROP POLICY IF EXISTS "Users can insert own advent calendars" ON advent_calendar;
  DROP POLICY IF EXISTS "Users can update own advent calendars" ON advent_calendar;
  DROP POLICY IF EXISTS "Users can delete own advent calendars" ON advent_calendar;
  
  -- Create new policies
  CREATE POLICY "Users can view own advent calendars"
    ON advent_calendar
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Public can view all advent calendars"
    ON advent_calendar
    FOR SELECT
    TO public
    USING (true);
  
  CREATE POLICY "Users can insert own advent calendars"
    ON advent_calendar
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own advent calendars"
    ON advent_calendar
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete own advent calendars"
    ON advent_calendar
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

