-- Migration script to convert customer table UUID to auto-increment integers
-- This will drop and recreate the customer table with integer IDs

-- ==============================================
-- STEP 1: Backup existing customer data
-- ==============================================

-- Create backup table
CREATE TABLE IF NOT EXISTS customers_backup AS SELECT * FROM customers;

-- ==============================================
-- STEP 2: Drop existing customer table and recreate with integer ID
-- ==============================================

-- Drop the existing customer table (this will also drop all constraints and indexes)
DROP TABLE IF EXISTS customers CASCADE;

-- Recreate customer table with integer ID
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,              -- Required for authentication
  gender TEXT,
  mobile_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unverified',
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 3: Create indexes for performance
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(verification_token);

-- ==============================================
-- STEP 4: Enable Row Level Security (RLS)
-- ==============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 5: Create RLS policies (adjust as needed for your app)
-- ==============================================

-- Allow users to view their own customer record
CREATE POLICY "Users can view own customer record" ON customers
  FOR SELECT USING (true); -- Adjust this policy based on your auth requirements

-- Allow users to update their own customer record  
CREATE POLICY "Users can update own customer record" ON customers
  FOR UPDATE USING (true); -- Adjust this policy based on your auth requirements

-- Allow inserting new customer records
CREATE POLICY "Users can insert customer records" ON customers
  FOR INSERT WITH CHECK (true);

-- Allow deleting customer records (if needed)
CREATE POLICY "Users can delete own customer record" ON customers
  FOR DELETE USING (true); -- Adjust this policy based on your auth requirements

-- ==============================================
-- STEP 6: Create trigger for updated_at timestamp
-- ==============================================

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- ==============================================
-- STEP 7: Migrate data from backup (if needed)
-- ==============================================

-- If you want to restore data from backup, uncomment and modify this section:
/*
INSERT INTO customers (
  full_name, 
  email, 
  gender, 
  mobile_number, 
  status, 
  verification_token, 
  verification_token_expires_at, 
  last_login_at, 
  login_count, 
  created_at, 
  updated_at
)
SELECT 
  full_name, 
  email, 
  gender, 
  mobile_number, 
  status, 
  verification_token, 
  verification_token_expires_at, 
  last_login_at, 
  login_count, 
  created_at, 
  updated_at
FROM customers_backup
ORDER BY created_at; -- This will assign sequential IDs based on creation order
*/

-- ==============================================
-- STEP 8: Drop backup table (after verifying migration)
-- ==============================================

-- Uncomment this line after you've verified everything works:
-- DROP TABLE IF EXISTS customers_backup;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check the new table structure
SELECT 
  'customers' as table_name,
  COUNT(*) as row_count
FROM customers;

-- Check the data type of the id column
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'id';

-- Show sample data
SELECT 'customers sample' as info, id, full_name, email, mobile_number, status, created_at 
FROM customers 
ORDER BY id 
LIMIT 5;

-- Check constraints and indexes
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type
FROM information_schema.table_constraints AS tc 
WHERE tc.table_name = 'customers'
ORDER BY tc.constraint_type, tc.constraint_name;

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'customers'
ORDER BY indexname;
