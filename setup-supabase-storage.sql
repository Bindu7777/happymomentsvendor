-- Setup Supabase Storage for centralized vendor images
-- This creates the storage bucket and policies for vendor image uploads

-- 1. Create storage bucket for vendor images
-- (This needs to be done in Supabase Dashboard -> Storage)
-- Bucket name: vendor-images
-- Public: true
-- Allowed file types: image/jpeg, image/jpg, image/png, image/webp
-- File size limit: 10MB

-- 2. Create RLS policies for vendor-images bucket

-- Policy 1: Allow public read access to all images
CREATE POLICY "Public read access for vendor images" ON storage.objects
FOR SELECT USING (bucket_id = 'vendor-images');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload vendor images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vendor-images' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow vendors to update their own images
CREATE POLICY "Vendors can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vendor-images'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow vendors to delete their own images
CREATE POLICY "Vendors can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vendor-images'
  AND auth.role() = 'authenticated'
);

-- 3. Alternative: If you want to allow anonymous uploads (simpler for testing)
-- Uncomment these policies and comment out the ones above

/*
-- Allow anyone to upload (for testing - less secure)
CREATE POLICY "Allow anonymous upload to vendor images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'vendor-images');

-- Allow anyone to update (for testing - less secure)  
CREATE POLICY "Allow anonymous update to vendor images" ON storage.objects
FOR UPDATE USING (bucket_id = 'vendor-images');

-- Allow anyone to delete (for testing - less secure)
CREATE POLICY "Allow anonymous delete to vendor images" ON storage.objects
FOR DELETE USING (bucket_id = 'vendor-images');
*/

-- 4. Update vendor_media table to work with Supabase Storage URLs
-- Add a column to track storage type
ALTER TABLE vendor_media 
ADD COLUMN IF NOT EXISTS storage_type TEXT DEFAULT 'supabase' CHECK (storage_type IN ('supabase', 'google_drive', 'external'));

-- 5. Create function to get vendor storage statistics
CREATE OR REPLACE FUNCTION get_vendor_storage_stats(p_vendor_id TEXT)
RETURNS TABLE (
    total_images INTEGER,
    catalog_images INTEGER,
    highlighted_images INTEGER,
    remaining_slots INTEGER,
    total_file_size BIGINT,
    storage_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        COUNT(CASE WHEN vm.category = 'catalog' THEN 1 END)::INTEGER as catalog_images,
        COUNT(CASE WHEN vm.category = 'catalog' AND vm.is_highlighted = TRUE THEN 1 END)::INTEGER as highlighted_images,
        (13 - COUNT(*))::INTEGER as remaining_slots,
        COALESCE(SUM(vm.file_size), 0)::BIGINT as total_file_size,
        jsonb_build_object(
            'supabase', COUNT(CASE WHEN vm.storage_type = 'supabase' THEN 1 END),
            'google_drive', COUNT(CASE WHEN vm.storage_type = 'google_drive' THEN 1 END),
            'external', COUNT(CASE WHEN vm.storage_type = 'external' THEN 1 END)
        ) as storage_breakdown
    FROM vendor_media vm
    WHERE vm.vendor_id::TEXT = p_vendor_id 
      AND vm.upload_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- 6. Test the storage stats function
SELECT * FROM get_vendor_storage_stats('14');

-- 7. Show current vendor media with storage information
SELECT 
    vendor_id,
    category,
    title,
    storage_type,
    file_size,
    is_highlighted,
    upload_status,
    LEFT(media_url, 50) || '...' as media_url_preview
FROM vendor_media 
WHERE vendor_id::TEXT = '14'
ORDER BY category, order_index;

-- 8. Instructions for Supabase Dashboard setup
SELECT 
    'MANUAL SETUP REQUIRED' as action,
    'Go to Supabase Dashboard -> Storage -> Create Bucket' as instruction,
    'Bucket name: vendor-images' as bucket_name,
    'Public: true' as public_setting,
    'File size limit: 10MB' as size_limit;
