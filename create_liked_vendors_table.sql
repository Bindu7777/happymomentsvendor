-- Create customer_liked_vendors table to store customer's liked vendors
-- This table links customers to vendors they have liked

CREATE TABLE IF NOT EXISTS customer_liked_vendors (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,                  -- References vendors.vendor_id
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a customer can only like a vendor once
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_liked_vendors_customer_id ON customer_liked_vendors(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_liked_vendors_vendor_id ON customer_liked_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customer_liked_vendors_liked_at ON customer_liked_vendors(liked_at);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_liked_vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own liked vendors
CREATE POLICY "Users can view own liked vendors" ON customer_liked_vendors
  FOR SELECT USING (true); -- Adjust based on your auth requirements

-- Users can only add their own likes
CREATE POLICY "Users can insert own liked vendors" ON customer_liked_vendors
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth requirements

-- Users can only delete their own likes
CREATE POLICY "Users can delete own liked vendors" ON customer_liked_vendors
  FOR DELETE USING (true); -- Adjust based on your auth requirements

-- Test the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customer_liked_vendors'
ORDER BY ordinal_position;

-- Show sample data (should be empty initially)
SELECT 'customer_liked_vendors sample' as info, id, customer_id, vendor_id, liked_at 
FROM customer_liked_vendors 
LIMIT 5;
