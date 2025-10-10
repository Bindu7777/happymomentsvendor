-- Fix script for customer_liked_vendors table
-- This handles existing policies and creates a clean table

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own liked vendors" ON customer_liked_vendors;
DROP POLICY IF EXISTS "Users can insert own liked vendors" ON customer_liked_vendors;
DROP POLICY IF EXISTS "Users can delete own liked vendors" ON customer_liked_vendors;

-- Drop the table if it exists (this will also drop all constraints)
DROP TABLE IF EXISTS customer_liked_vendors CASCADE;

-- Create the table fresh
CREATE TABLE customer_liked_vendors (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,                  -- References vendors.vendor_id
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a customer can only like a vendor once
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX idx_customer_liked_vendors_customer_id ON customer_liked_vendors(customer_id);
CREATE INDEX idx_customer_liked_vendors_vendor_id ON customer_liked_vendors(vendor_id);
CREATE INDEX idx_customer_liked_vendors_liked_at ON customer_liked_vendors(liked_at);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_liked_vendors ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Allow all operations on liked vendors" ON customer_liked_vendors
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the table structure
SELECT 
  'Table created successfully' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_liked_vendors'
ORDER BY ordinal_position;

-- Show current data (should be empty)
SELECT 
  'Current liked vendors' as info,
  COUNT(*) as total_likes
FROM customer_liked_vendors;
