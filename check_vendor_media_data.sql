-- Check vendor_media data and vendor_id mapping
-- Run this in Supabase SQL Editor

-- Step 1: Check all vendor_media records
SELECT 'All vendor_media records:' as info;
SELECT 
  id,
  vendor_id,
  category,
  media_url,
  filename,
  is_highlighted,
  public,
  created_at
FROM vendor_media 
ORDER BY created_at DESC;

-- Step 2: Check vendors table structure
SELECT 'Vendors table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendors' 
ORDER BY ordinal_position;

-- Step 3: Check vendor_id mapping between tables
SELECT 'Vendor ID mapping between vendors and vendor_media:' as info;
SELECT 
  v.vendor_id as vendors_vendor_id,
  v.brand_name,
  vm.vendor_id as media_vendor_id,
  vm.category,
  vm.media_url
FROM vendors v
FULL OUTER JOIN vendor_media vm ON v.vendor_id::text = vm.vendor_id::text
ORDER BY v.vendor_id, vm.category;

-- Step 4: Check for orphaned media (media without corresponding vendor)
SELECT 'Orphaned media (media without corresponding vendor):' as info;
SELECT 
  vm.vendor_id,
  vm.category,
  vm.media_url,
  vm.created_at
FROM vendor_media vm
LEFT JOIN vendors v ON vm.vendor_id::text = v.vendor_id::text
WHERE v.vendor_id IS NULL;

-- Step 5: Check for vendors without media
SELECT 'Vendors without media:' as info;
SELECT 
  v.vendor_id,
  v.brand_name,
  v.category
FROM vendors v
LEFT JOIN vendor_media vm ON v.vendor_id::text = vm.vendor_id::text
WHERE vm.vendor_id IS NULL;

-- Step 6: Count media by vendor and category
SELECT 'Media count by vendor and category:' as info;
SELECT 
  vm.vendor_id,
  v.brand_name,
  vm.category,
  COUNT(*) as media_count
FROM vendor_media vm
LEFT JOIN vendors v ON vm.vendor_id::text = v.vendor_id::text
GROUP BY vm.vendor_id, v.brand_name, vm.category
ORDER BY vm.vendor_id, vm.category;
