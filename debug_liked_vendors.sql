-- Debug script to check liked vendors functionality
-- Run this after creating the customer_liked_vendors table

-- 1. Check if the table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_liked_vendors'
ORDER BY ordinal_position;

-- 2. Check if there are any customers in the system
SELECT 
  'customers' as table_name,
  COUNT(*) as total_customers,
  MIN(id) as min_customer_id,
  MAX(id) as max_customer_id
FROM customers;

-- 3. Check if there are any vendors in the system
SELECT 
  'vendors' as table_name,
  COUNT(*) as total_vendors,
  MIN(vendor_id) as sample_vendor_id
FROM vendors
LIMIT 1;

-- 4. Check current liked vendors (should be empty initially)
SELECT 
  'customer_liked_vendors' as table_name,
  COUNT(*) as total_likes
FROM customer_liked_vendors;

-- 5. Show sample customer data (if any exists)
SELECT 
  'Sample customer data' as info,
  id,
  full_name,
  email,
  status
FROM customers
LIMIT 3;

-- 6. Show sample vendor data (if any exists)
SELECT 
  'Sample vendor data' as info,
  vendor_id,
  brand_name,
  category
FROM vendors
LIMIT 3;
