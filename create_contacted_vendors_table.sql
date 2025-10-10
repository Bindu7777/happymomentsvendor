-- Create contacted_vendors table for tracking customer-vendor WhatsApp contacts
-- This table tracks which customers have successfully contacted which vendors via WhatsApp

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can view own contacted vendors" ON contacted_vendors;
DROP POLICY IF EXISTS "Users can insert own contacted vendors" ON contacted_vendors;
DROP POLICY IF EXISTS "Users can delete own contacted vendors" ON contacted_vendors;

-- Drop the table if it exists (this will also drop all constraints)
DROP TABLE IF EXISTS contacted_vendors CASCADE;

-- Create the contacted_vendors table
CREATE TABLE contacted_vendors (
  contact_id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,                          -- References vendors.vendor_id
  status TEXT DEFAULT 'Contacted',                  -- Status of the contact
  contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a customer can only contact a vendor once (prevent duplicates)
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX idx_contacted_vendors_customer_id ON contacted_vendors(customer_id);
CREATE INDEX idx_contacted_vendors_vendor_id ON contacted_vendors(vendor_id);
CREATE INDEX idx_contacted_vendors_contacted_at ON contacted_vendors(contacted_at);
CREATE INDEX idx_contacted_vendors_status ON contacted_vendors(status);

-- Enable Row Level Security (RLS)
ALTER TABLE contacted_vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on contacted vendors" ON contacted_vendors
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the table structure
SELECT 
  'Table created successfully' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacted_vendors'
ORDER BY ordinal_position;

-- Show current data (should be empty)
SELECT 
  'Current contacted vendors' as info,
  COUNT(*) as total_contacts
FROM contacted_vendors;

-- Test data insertion (optional - remove in production)
-- INSERT INTO contacted_vendors (customer_id, vendor_id, status) VALUES 
-- (2, '48', 'Contacted'),
-- (2, '49', 'Contacted');

-- Show test data
SELECT 
  'Test data' as info,
  contact_id,
  customer_id,
  vendor_id,
  status,
  contacted_at
FROM contacted_vendors;
