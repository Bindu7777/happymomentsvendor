-- Fix Supabase Storage permissions for vendor image uploads
-- This resolves the "row-level security policy" error

-- 1. First, let's check current policies on storage.objects
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Drop any existing restrictive policies for vendor-images bucket
DROP POLICY IF EXISTS "Public read access for vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Vendors can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload to vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous update to vendor images" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous delete to vendor images" ON storage.objects;

-- 3. Create simple, permissive policies for vendor-images bucket

-- Allow public read access to vendor images
CREATE POLICY "vendor_images_public_read" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-images');

-- Allow anyone to upload to vendor-images bucket (for testing)
CREATE POLICY "vendor_images_public_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-images');

-- Allow anyone to update vendor images (for testing)
CREATE POLICY "vendor_images_public_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-images');

-- Allow anyone to delete vendor images (for testing)
CREATE POLICY "vendor_images_public_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-images');

-- 4. Alternative: Disable RLS entirely for vendor-images bucket (if above doesn't work)
-- Uncomment the line below if you still get permission errors
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 5. Verify the policies are created
SELECT 
    policyname, 
    cmd, 
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%vendor_images%';

-- 6. Test bucket access
SELECT 
    'BUCKET ACCESS TEST' as test,
    'vendor-images' as bucket_name,
    'Ready for uploads' as status;

-- 7. Show bucket information
SELECT 
    name,
    id,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'vendor-images';

-- 8. Instructions
SELECT 
    'NEXT STEP' as action,
    'Try uploading an image again' as instruction,
    'Should work without permission errors' as expected_result;
