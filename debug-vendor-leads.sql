-- Debug script to check vendor_leads table and vendor_id issues
-- Run this in Supabase SQL Editor to debug the "Failed to add lead" error

-- Step 1: Check if vendor_leads table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'vendor_leads';

-- Step 2: Check vendors table structure and vendor_id data type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' AND column_name = 'vendor_id';

-- Step 3: Check what vendor_ids exist in vendors table
SELECT vendor_id, brand_name, category 
FROM vendors 
ORDER BY vendor_id 
LIMIT 10;

-- Step 4: If vendor_leads table exists, check its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vendor_leads' 
ORDER BY ordinal_position;

-- Step 5: Test insert with minimal data (adjust vendor_id based on Step 3 results)
-- Uncomment and run after checking vendor_id from Step 3:
-- INSERT INTO vendor_leads (vendor_id, customer_name, event_type, status) 
-- VALUES (1, 'Test Customer', 'Wedding', 'new_lead');

-- Step 6: Check if insert worked
-- SELECT * FROM vendor_leads WHERE customer_name = 'Test Customer';
