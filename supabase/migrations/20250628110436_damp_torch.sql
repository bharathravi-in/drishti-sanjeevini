/*
  # Create media storage bucket

  1. Storage Setup
    - Create 'media' bucket for storing post images and videos
    - Configure bucket to be public for viewing uploaded content
  
  2. Security Policies
    - Allow authenticated users to upload files to their own folder
    - Allow public access to view uploaded media files
    - Restrict file uploads to authenticated users only
*/

-- Create the media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload media to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to view their own uploaded files
CREATE POLICY "Users can view own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow public access to view media files (for sharing posts)
CREATE POLICY "Public can view media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Policy to allow users to delete their own media files
CREATE POLICY "Users can delete own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);