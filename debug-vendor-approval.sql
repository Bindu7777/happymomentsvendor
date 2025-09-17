-- Debug script for vendor approval issues

-- 1. Check vendors table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
ORDER BY ordinal_position;

-- 2. Check vendor_profile_changes table structure  
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendor_profile_changes' 
ORDER BY ordinal_position;

-- 3. Check if there are any vendors
SELECT id, vendor_id, brand_name, category FROM vendors LIMIT 5;

-- 4. Check pending changes
SELECT 
    id,
    vendor_id,
    change_type,
    current_data,
    proposed_changes,
    status,
    submitted_at
FROM vendor_profile_changes 
WHERE status = 'pending'
ORDER BY submitted_at DESC;

-- 5. Check if vendor IDs match between tables
SELECT 
    v.id as vendor_table_id,
    v.vendor_id as vendor_table_vendor_id,
    vpc.vendor_id as change_table_vendor_id,
    v.brand_name
FROM vendors v
LEFT JOIN vendor_profile_changes vpc ON v.id = vpc.vendor_id
WHERE vpc.status = 'pending'
LIMIT 5;

-- 6. Check for any constraints or triggers on vendors table
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'vendors'::regclass;

-- 7. Test update on a specific vendor (replace ID with actual vendor ID)
-- UPDATE vendors SET description = 'Test update' WHERE id = 1;
-- SELECT id, brand_name, description, updated_at FROM vendors WHERE id = 1;
