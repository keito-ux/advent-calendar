/*
  # Create Storage Bucket for Advent Calendar Images

  1. Storage Setup
    - Create 'advent.pics' bucket for advent calendar scene images
    - Set bucket to public so images can be accessed without authentication
  
  2. Security
    - Allow public read access to all images in the bucket
    - Allow public upload access (anyone can upload images)
    - Allow public update access
    - Allow public delete access

  3. Notes
    - This bucket is specifically for the advent calendar images
    - Public access is required for the images to display on the calendar
*/

-- Create the advent.pics storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('advent.pics', 'advent.pics', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access for advent.pics" ON storage.objects;
  DROP POLICY IF EXISTS "Public upload access for advent.pics" ON storage.objects;
  DROP POLICY IF EXISTS "Public update access for advent.pics" ON storage.objects;
  DROP POLICY IF EXISTS "Public delete access for advent.pics" ON storage.objects;
END $$;

-- Create policy for public read access
CREATE POLICY "Public read access for advent.pics"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'advent.pics');

-- Create policy for public upload access
CREATE POLICY "Public upload access for advent.pics"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'advent.pics');

-- Create policy for public update access
CREATE POLICY "Public update access for advent.pics"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'advent.pics')
WITH CHECK (bucket_id = 'advent.pics');

-- Create policy for public delete access
CREATE POLICY "Public delete access for advent.pics"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'advent.pics');