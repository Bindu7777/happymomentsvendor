-- Fix invoice_quotations table to use auto-increment ID instead of UUID
-- Run this in Supabase SQL Editor

-- First, let's check the current table structure
SELECT 'CURRENT TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invoice_quotations' 
ORDER BY ordinal_position;

-- Check current data (without uuid column)
SELECT 'CURRENT DATA SAMPLE:' as info;
SELECT id, type, vendor_id, customer_name, customer_mobile
FROM invoice_quotations 
LIMIT 5;

-- Count current records
SELECT 'CURRENT RECORD COUNT:' as info;
SELECT COUNT(*) as total_records FROM invoice_quotations;

-- Step 1: Create a backup of the current data
CREATE TABLE invoice_quotations_backup AS SELECT * FROM invoice_quotations;

-- Step 2: Drop the existing table (this will delete all data)
-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS invoice_quotations CASCADE;

-- Step 3: Recreate the table with auto-increment ID
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

-- Step 4: Create indexes for better performance
CREATE INDEX idx_invoice_quotations_vendor_id ON invoice_quotations(vendor_id);
CREATE INDEX idx_invoice_quotations_type ON invoice_quotations(type);
CREATE INDEX idx_invoice_quotations_status ON invoice_quotations(status);
CREATE INDEX idx_invoice_quotations_created_at ON invoice_quotations(created_at DESC);

-- Step 5: Disable RLS for now (you can enable it later with proper policies)
ALTER TABLE invoice_quotations DISABLE ROW LEVEL SECURITY;

-- Step 6: Insert some sample data with auto-increment IDs
INSERT INTO invoice_quotations (
  type, vendor_id, customer_name, customer_mobile, 
  description, subtotal, tax_amount, total_amount, status
) VALUES 
  ('quotation', 14, 'John & Sarah Wedding', '+91 98765 43210', 'Wedding Photography Package', 50000.00, 9000.00, 59000.00, 'sent'),
  ('invoice', 14, 'Hima', '+91 98765 43210', 'Event Photography', 25000.00, 4500.00, 29500.00, 'paid'),
  ('quotation', 50, 'Siva', '+91 98765 43210', 'Corporate Event', 30000.00, 5400.00, 35400.00, 'draft');

-- Step 7: Verify the new structure and data
SELECT 'NEW TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'invoice_quotations' 
ORDER BY ordinal_position;

SELECT 'NEW DATA WITH AUTO-INCREMENT IDs:' as info;
SELECT id, uuid, type, vendor_id, customer_name, customer_mobile, total_amount, status
FROM invoice_quotations 
ORDER BY id;

SELECT 'BACKUP TABLE CREATED:' as info;
SELECT COUNT(*) as backup_records FROM invoice_quotations_backup;

SELECT 'Table updated successfully! Now using auto-increment IDs instead of UUIDs.' as final_message;
