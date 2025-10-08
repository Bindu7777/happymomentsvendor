-- Remove test data from vendor_leads table
-- Run this in Supabase SQL Editor

-- First, let's see what test data exists
SELECT 'CURRENT LEADS IN VENDOR_LEADS TABLE:' as info;
SELECT id, customer_name, event_type, event_date, budget_range, status, vendor_id, created_at
FROM vendor_leads 
ORDER BY created_at DESC;

-- Check if there are any test leads (you can modify the WHERE clause to target specific test data)
SELECT 'CHECKING FOR TEST LEADS...' as info;
SELECT COUNT(*) as total_leads FROM vendor_leads;

-- Remove test leads - you can customize this query based on what you see above
-- Option 1: Remove all leads (if they are all test data)
DELETE FROM vendor_leads;

-- Option 2: Remove specific test leads by name pattern (uncomment if needed)
-- DELETE FROM vendor_leads WHERE customer_name LIKE '%John%' OR customer_name LIKE '%Rahul%' OR customer_name LIKE '%Tech Corp%' OR customer_name LIKE '%Priya%' OR customer_name LIKE '%Kumar%' OR customer_name LIKE '%Rohan%';

-- Option 3: Remove leads created in a specific date range (uncomment if needed)
-- DELETE FROM vendor_leads WHERE created_at >= '2024-09-01' AND created_at <= '2024-09-30';

-- Verify the cleanup
SELECT 'VERIFYING CLEANUP...' as info;
SELECT COUNT(*) as remaining_leads FROM vendor_leads;

SELECT 'Test leads removed successfully!' as final_message;
