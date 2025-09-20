-- SQL script to fix vendor_media table permissions
-- This will make the vendor_media table accessible for reading and writing

-- Enable Row Level Security (RLS) on vendor_media table
ALTER TABLE vendor_media ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for vendor_media" ON vendor_media;
DROP POLICY IF EXISTS "Vendors can read their own media" ON vendor_media;
DROP POLICY IF EXISTS "Vendors can insert their own media" ON vendor_media;
DROP POLICY IF EXISTS "Vendors can update their own media" ON vendor_media;
DROP POLICY IF EXISTS "Vendors can delete their own media" ON vendor_media;

-- Create policy for public read access to public media
CREATE POLICY "Public read access for vendor_media" ON vendor_media
    FOR SELECT USING (public = true);

-- Create policy for vendors to read their own media (both public and private)
CREATE POLICY "Vendors can read their own media" ON vendor_media
    FOR SELECT USING (
        vendor_id = current_setting('app.current_vendor_id', true)
        OR 
        vendor_id IN (
            SELECT vendor_id FROM vendors 
            WHERE phone_number = current_setting('app.current_user_phone', true)
        )
    );

-- Create policy for vendors to insert their own media
CREATE POLICY "Vendors can insert their own media" ON vendor_media
    FOR INSERT WITH CHECK (
        vendor_id = current_setting('app.current_vendor_id', true)
        OR 
        vendor_id IN (
            SELECT vendor_id FROM vendors 
            WHERE phone_number = current_setting('app.current_user_phone', true)
        )
    );

-- Create policy for vendors to update their own media
CREATE POLICY "Vendors can update their own media" ON vendor_media
    FOR UPDATE USING (
        vendor_id = current_setting('app.current_vendor_id', true)
        OR 
        vendor_id IN (
            SELECT vendor_id FROM vendors 
            WHERE phone_number = current_setting('app.current_user_phone', true)
        )
    );

-- Create policy for vendors to delete their own media
CREATE POLICY "Vendors can delete their own media" ON vendor_media
    FOR DELETE USING (
        vendor_id = current_setting('app.current_vendor_id', true)
        OR 
        vendor_id IN (
            SELECT vendor_id FROM vendors 
            WHERE phone_number = current_setting('app.current_user_phone', true)
        )
    );

-- Alternative: If you want to completely disable RLS for testing (less secure)
-- Uncomment the line below ONLY for testing purposes
-- ALTER TABLE vendor_media DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT ON vendor_media TO authenticated;
GRANT INSERT ON vendor_media TO authenticated;
GRANT UPDATE ON vendor_media TO authenticated;
GRANT DELETE ON vendor_media TO authenticated;

-- Grant permissions to anonymous users for reading public media only
GRANT SELECT ON vendor_media TO anon;

-- Verify the table structure and current policies
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename = 'vendor_media';

-- Show current policies on vendor_media table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'vendor_media';

-- Test query to see if data is accessible
SELECT 
    vendor_id,
    category,
    media_type,
    public,
    COUNT(*) as media_count
FROM vendor_media 
GROUP BY vendor_id, category, media_type, public
ORDER BY vendor_id, category;

-- If you're still having issues, you can temporarily disable RLS completely
-- (ONLY for debugging - re-enable it afterwards for security)
/*
ALTER TABLE vendor_media DISABLE ROW LEVEL SECURITY;
-- Test your queries here
-- Then re-enable:
-- ALTER TABLE vendor_media ENABLE ROW LEVEL SECURITY;
*/
