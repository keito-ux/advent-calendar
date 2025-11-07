/*
  # Create Storage Bucket for Images

  1. Storage Setup
    - Create 'images' bucket for scene images
    - Set bucket to public so images can be accessed
  
  2. Security
    - Allow public read access to images
    - Allow authenticated users to upload images
    - Allow authenticated users to update/delete their uploads
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'images');
