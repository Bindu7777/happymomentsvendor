-- ==============================================
-- CUSTOMER FLAGGING SYSTEM
-- ==============================================
-- This script creates the customer flagging system that allows vendors
-- to flag customers. If a customer is flagged more than 3 times, their
-- account is automatically blocked.

-- ==============================================
-- STEP 1: Add columns to customers table
-- ==============================================

-- Add flag_count and is_blocked columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on blocked customers
CREATE INDEX IF NOT EXISTS idx_customers_is_blocked ON customers(is_blocked);
CREATE INDEX IF NOT EXISTS idx_customers_flag_count ON customers(flag_count);

-- ==============================================
-- STEP 2: Create customer_flags table
-- ==============================================
-- This table tracks individual flag records (which vendor flagged which customer)

-- Drop existing table if it exists (use with caution in production)
DROP TABLE IF EXISTS customer_flags CASCADE;

CREATE TABLE customer_flags (
  flag_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,  -- References vendors.vendor_id
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,  -- Optional reason for flagging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a vendor can only flag a customer once
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX idx_customer_flags_customer_id ON customer_flags(customer_id);
CREATE INDEX idx_customer_flags_vendor_id ON customer_flags(vendor_id);
CREATE INDEX idx_customer_flags_flagged_at ON customer_flags(flagged_at);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - adjust based on your security needs)
CREATE POLICY "Allow all operations on customer_flags" ON customer_flags
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- STEP 3: Create function to update flag_count
-- ==============================================
-- This function automatically updates the flag_count when a flag is added/removed

CREATE OR REPLACE FUNCTION update_customer_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update flag_count based on the customer_id
  UPDATE customers 
  SET flag_count = (
    SELECT COUNT(*) 
    FROM customer_flags 
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
  ),
  is_blocked = (
    SELECT COUNT(*) >= 3 
    FROM customer_flags 
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update flag_count on INSERT
CREATE TRIGGER update_flag_count_on_insert
  AFTER INSERT ON customer_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_flag_count();

-- Create trigger to update flag_count on DELETE
CREATE TRIGGER update_flag_count_on_delete
  AFTER DELETE ON customer_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_flag_count();

-- ==============================================
-- STEP 4: Create function to check and block customer
-- ==============================================
-- This function ensures customers are blocked when flag_count >= 3

CREATE OR REPLACE FUNCTION check_and_block_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically block customer if flag_count >= 3
  IF NEW.flag_count >= 3 THEN
    NEW.is_blocked = TRUE;
  ELSE
    NEW.is_blocked = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to block customer when flag_count is updated
CREATE TRIGGER block_customer_on_flag_count_update
  BEFORE UPDATE OF flag_count ON customers
  FOR EACH ROW
  WHEN (NEW.flag_count IS DISTINCT FROM OLD.flag_count)
  EXECUTE FUNCTION check_and_block_customer();

-- ==============================================
-- STEP 5: Initialize existing customers (optional)
-- ==============================================
-- Set flag_count for existing customers based on existing flags (if any)

-- This will be automatically handled by the triggers, but if you have existing
-- customer_flags data, you can run this to initialize:

-- UPDATE customers c
-- SET flag_count = (
--   SELECT COUNT(*) 
--   FROM customer_flags cf 
--   WHERE cf.customer_id = c.id
-- ),
-- is_blocked = (
--   SELECT COUNT(*) >= 3 
--   FROM customer_flags cf 
--   WHERE cf.customer_id = c.id
-- );

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
  AND column_name IN ('flag_count', 'is_blocked')
ORDER BY ordinal_position;

-- Check customer_flags table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customer_flags'
ORDER BY ordinal_position;

-- ==============================================
-- USAGE EXAMPLES
-- ==============================================

-- To flag a customer:
-- INSERT INTO customer_flags (customer_id, vendor_id, reason)
-- VALUES (123, '45', 'Inappropriate behavior');

-- To unflag a customer:
-- DELETE FROM customer_flags 
-- WHERE customer_id = 123 AND vendor_id = '45';

-- To check if a customer is flagged by a specific vendor:
-- SELECT * FROM customer_flags 
-- WHERE customer_id = 123 AND vendor_id = '45';

-- To check customer's flag status:
-- SELECT id, full_name, flag_count, is_blocked 
-- FROM customers 
-- WHERE id = 123;

-- To get all flagged customers:
-- SELECT id, full_name, flag_count, is_blocked 
-- FROM customers 
-- WHERE flag_count > 0
-- ORDER BY flag_count DESC;

-- To get all blocked customers:
-- SELECT id, full_name, flag_count, is_blocked 
-- FROM customers 
-- WHERE is_blocked = TRUE;

