-- Test queries to verify the migration worked correctly
-- Run these after the migration to ensure everything is working

-- Test 1: Check data types
SELECT 
  'user_profiles' as table_name,
  pg_typeof(id) as id_type,
  COUNT(*) as row_count
FROM user_profiles
UNION ALL
SELECT 
  'vendor_media' as table_name,
  pg_typeof(id) as id_type,
  COUNT(*) as row_count
FROM vendor_media;

-- Test 2: Verify auto-increment is working
SELECT 
  'user_profiles' as table_name,
  MIN(id) as min_id,
  MAX(id) as max_id,
  COUNT(*) as total_rows
FROM user_profiles
UNION ALL
SELECT 
  'vendor_media' as table_name,
  MIN(id) as min_id,
  MAX(id) as max_id,
  COUNT(*) as total_rows
FROM vendor_media;

-- Test 3: Sample data to verify structure
SELECT 'user_profiles sample' as info, id, user_id, email, created_at 
FROM user_profiles 
ORDER BY id 
LIMIT 3;

SELECT 'vendor_media sample' as info, id, vendor_id, media_url, uploaded_at 
FROM vendor_media 
ORDER BY id 
LIMIT 3;

-- Test 4: Check foreign key constraints are working
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('user_profiles', 'vendor_media')
  AND tc.constraint_type = 'FOREIGN KEY';

-- Test 5: Check indexes are in place
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('user_profiles', 'vendor_media')
ORDER BY tablename, indexname;
