-- Simple script to drop and recreate customer table with integer ID
-- WARNING: This will DELETE ALL existing customer data!

-- ==============================================
-- DROP AND RECREATE CUSTOMER TABLE
-- ==============================================

-- Drop the existing customer table completely
DROP TABLE IF EXISTS customers CASCADE;

-- Create new customer table with integer ID
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID (1, 2, 3, ...)
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
-- CREATE INDEXES
-- ==============================================

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX idx_customers_status ON customers(status);

-- ==============================================
-- ENABLE RLS AND POLICIES
-- ==============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your needs)
CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ==============================================

CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- ==============================================
-- VERIFY THE NEW TABLE
-- ==============================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Test inserting a sample record
INSERT INTO customers (full_name, email, password_hash, mobile_number, status) 
VALUES ('Test User', 'test@example.com', 'hashed_password_123', '1234567890', 'verified');

-- Check the new record
SELECT 'New customer record' as info, id, full_name, email, mobile_number, status 
FROM customers 
WHERE email = 'test@example.com';

-- Clean up test record
DELETE FROM customers WHERE email = 'test@example.com';

-- Show final verification
SELECT 'Final verification' as info, 
       pg_typeof(id) as id_type,
       COUNT(*) as total_records
FROM customers;
