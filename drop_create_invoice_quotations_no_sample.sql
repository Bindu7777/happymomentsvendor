-- Drop and Create invoice_quotations table with CASCADE (No Sample Data)
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing table with CASCADE (removes all dependencies)
DROP TABLE IF EXISTS invoice_quotations CASCADE;

-- Step 2: Create new table with auto-increment ID
CREATE TABLE invoice_quotations (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'quotation')),
  vendor_id INTEGER NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_mobile VARCHAR(20),
  customer_email VARCHAR(255),
  customer_address TEXT,
  event_date DATE,
  event_location VARCHAR(255),
  event_type VARCHAR(100),
  description TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0.00,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_terms TEXT,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by INTEGER REFERENCES vendors(vendor_id)
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_invoice_quotations_vendor_id ON invoice_quotations(vendor_id);
CREATE INDEX idx_invoice_quotations_type ON invoice_quotations(type);
CREATE INDEX idx_invoice_quotations_status ON invoice_quotations(status);
CREATE INDEX idx_invoice_quotations_created_at ON invoice_quotations(created_at DESC);

-- Step 4: Disable RLS for now
ALTER TABLE invoice_quotations DISABLE ROW LEVEL SECURITY;

-- Step 5: Check existing vendors (so you can add sample data manually if needed)
SELECT 'Existing vendors in your database:' as info;
SELECT vendor_id, brand_name, category, phone_number
FROM vendors 
ORDER BY vendor_id 
LIMIT 10;

SELECT 'Table created successfully! Use vendor IDs from above to add sample data.' as final_message;
