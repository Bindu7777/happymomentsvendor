-- Complete migration script for customer-related tables
-- This will convert all customer-related tables from UUID to integer IDs

-- ==============================================
-- STEP 1: Backup existing data
-- ==============================================

CREATE TABLE IF NOT EXISTS customers_backup AS SELECT * FROM customers;
CREATE TABLE IF NOT EXISTS customer_search_filters_backup AS SELECT * FROM customer_search_filters;
CREATE TABLE IF NOT EXISTS customer_search_history_backup AS SELECT * FROM customer_search_history;
CREATE TABLE IF NOT EXISTS customer_reviews_backup AS SELECT * FROM customer_reviews;

-- ==============================================
-- STEP 2: Drop all customer-related tables
-- ==============================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS customer_reviews CASCADE;
DROP TABLE IF EXISTS customer_search_history CASCADE;
DROP TABLE IF EXISTS customer_search_filters CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- ==============================================
-- STEP 3: Recreate customers table with integer ID
-- ==============================================

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
-- STEP 4: Recreate customer_search_filters table
-- ==============================================

CREATE TABLE customer_search_filters (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  filter_data JSONB NOT NULL,
  filter_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 5: Recreate customer_search_history table
-- ==============================================

CREATE TABLE customer_search_history (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  search_type TEXT NOT NULL CHECK (search_type IN ('voice', 'manual', 'smart_request')),
  search_query TEXT,
  search_filters JSONB NOT NULL,
  search_results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 6: Recreate customer_reviews table
-- ==============================================

CREATE TABLE customer_reviews (
  id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  vendor_id INTEGER NOT NULL,               -- References vendors table
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- STEP 7: Create indexes for performance
-- ==============================================

-- Customers table indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_mobile_number ON customers(mobile_number);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_verification_token ON customers(verification_token);

-- Customer search filters indexes
CREATE INDEX idx_customer_search_filters_customer_id ON customer_search_filters(customer_id);

-- Customer search history indexes
CREATE INDEX idx_customer_search_history_customer_id ON customer_search_history(customer_id);
CREATE INDEX idx_customer_search_history_created_at ON customer_search_history(created_at);

-- Customer reviews indexes
CREATE INDEX idx_customer_reviews_customer_id ON customer_reviews(customer_id);
CREATE INDEX idx_customer_reviews_vendor_id ON customer_reviews(vendor_id);

-- ==============================================
-- STEP 8: Enable Row Level Security (RLS)
-- ==============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 9: Create RLS policies
-- ==============================================

-- Customers table policies
CREATE POLICY "Allow all operations on customers" ON customers
  FOR ALL USING (true) WITH CHECK (true);

-- Customer search filters policies
CREATE POLICY "Allow all operations on customer_search_filters" ON customer_search_filters
  FOR ALL USING (true) WITH CHECK (true);

-- Customer search history policies
CREATE POLICY "Allow all operations on customer_search_history" ON customer_search_history
  FOR ALL USING (true) WITH CHECK (true);

-- Customer reviews policies
CREATE POLICY "Allow all operations on customer_reviews" ON customer_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- STEP 10: Create triggers for updated_at
-- ==============================================

-- Function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at columns
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_search_filters_updated_at
  BEFORE UPDATE ON customer_search_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- STEP 11: Migrate data from backup (if needed)
-- ==============================================

-- Uncomment and modify this section if you want to restore data:
/*
-- Migrate customers data
INSERT INTO customers (full_name, email, gender, mobile_number, status, verification_token, verification_token_expires_at, last_login_at, login_count, created_at, updated_at)
SELECT full_name, email, gender, mobile_number, status, verification_token, verification_token_expires_at, last_login_at, login_count, created_at, updated_at
FROM customers_backup
ORDER BY created_at;

-- Note: For related tables, you'll need to map the old UUID customer_ids to new integer IDs
-- This requires more complex logic and may not be necessary if you're starting fresh
*/

-- ==============================================
-- STEP 12: Verification queries
-- ==============================================

-- Check table structures
SELECT 'customers' as table_name, COUNT(*) as row_count FROM customers
UNION ALL
SELECT 'customer_search_filters' as table_name, COUNT(*) as row_count FROM customer_search_filters
UNION ALL
SELECT 'customer_search_history' as table_name, COUNT(*) as row_count FROM customer_search_history
UNION ALL
SELECT 'customer_reviews' as table_name, COUNT(*) as row_count FROM customer_reviews;

-- Check the data types of id columns
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('customers', 'customer_search_filters', 'customer_search_history', 'customer_reviews')
  AND column_name = 'id'
ORDER BY table_name;

-- Test inserting a sample customer
INSERT INTO customers (full_name, email, password_hash, mobile_number, status) 
VALUES ('Test Customer', 'test@example.com', 'hashed_password_123', '1234567890', 'verified');

-- Check the new customer record
SELECT 'New customer' as info, id, full_name, email, mobile_number, status FROM customers WHERE email = 'test@example.com';

-- Test related tables
INSERT INTO customer_search_filters (customer_id, filter_data, filter_name) 
VALUES (1, '{"category": "photography"}', 'Photography Filter');

INSERT INTO customer_search_history (customer_id, search_type, search_query, search_filters) 
VALUES (1, 'manual', 'wedding photographers', '{"category": "photography"}');

-- Check related records
SELECT 'Customer filters' as info, id, customer_id, filter_name FROM customer_search_filters WHERE customer_id = 1;
SELECT 'Customer history' as info, id, customer_id, search_type, search_query FROM customer_search_history WHERE customer_id = 1;

-- Clean up test data
DELETE FROM customer_search_history WHERE customer_id = 1;
DELETE FROM customer_search_filters WHERE customer_id = 1;
DELETE FROM customers WHERE email = 'test@example.com';

-- Final verification
SELECT 'Final verification' as info, 
       'customers' as table_name,
       COUNT(*) as total_records
FROM customers;

-- ==============================================
-- STEP 13: Clean up backup tables (after verification)
-- ==============================================

-- Uncomment these lines after verifying everything works:
-- DROP TABLE IF EXISTS customers_backup;
-- DROP TABLE IF EXISTS customer_search_filters_backup;
-- DROP TABLE IF EXISTS customer_search_history_backup;
-- DROP TABLE IF EXISTS customer_reviews_backup;
