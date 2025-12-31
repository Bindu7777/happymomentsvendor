-- ==============================================
-- COMPLETE SETUP: CUSTOMER REPORTING SYSTEM
-- ==============================================
-- This script creates the customer_flags table (if it doesn't exist)
-- and updates the blocking threshold from 3 to 5 reports.

-- ==============================================
-- STEP 1: Add columns to customers table (if not exists)
-- ==============================================

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_customers_is_blocked ON customers(is_blocked);
CREATE INDEX IF NOT EXISTS idx_customers_flag_count ON customers(flag_count);

-- ==============================================
-- STEP 2: Create customer_flags table (if not exists)
-- ==============================================

CREATE TABLE IF NOT EXISTS customer_flags (
  flag_id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,  -- References vendors.vendor_id
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,  -- Required reason for reporting
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a vendor can only report a customer once
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_flags_customer_id ON customer_flags(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_flags_vendor_id ON customer_flags(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customer_flags_flagged_at ON customer_flags(flagged_at);

-- Enable Row Level Security (RLS)
ALTER TABLE customer_flags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (if not exists)
DROP POLICY IF EXISTS "Allow all operations on customer_flags" ON customer_flags;
CREATE POLICY "Allow all operations on customer_flags" ON customer_flags
  FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- STEP 3: Create/Update function to update flag_count
-- ==============================================

CREATE OR REPLACE FUNCTION update_customer_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update flag_count (report_count) based on the customer_id
  UPDATE customers 
  SET flag_count = (
    SELECT COUNT(*) 
    FROM customer_flags 
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
  ),
  is_blocked = (
    SELECT COUNT(*) >= 5 
    FROM customer_flags 
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop existing first to avoid duplicates)
DROP TRIGGER IF EXISTS update_flag_count_on_insert ON customer_flags;
CREATE TRIGGER update_flag_count_on_insert
  AFTER INSERT ON customer_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_flag_count();

DROP TRIGGER IF EXISTS update_flag_count_on_delete ON customer_flags;
CREATE TRIGGER update_flag_count_on_delete
  AFTER DELETE ON customer_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_flag_count();

-- ==============================================
-- STEP 4: Create/Update function to check and block customer
-- ==============================================

CREATE OR REPLACE FUNCTION check_and_block_customer()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically block customer if flag_count (report_count) >= 5
  IF NEW.flag_count >= 5 THEN
    NEW.is_blocked = TRUE;
  ELSE
    NEW.is_blocked = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop existing first to avoid duplicates)
DROP TRIGGER IF EXISTS block_customer_on_flag_count_update ON customers;
CREATE TRIGGER block_customer_on_flag_count_update
  BEFORE UPDATE OF flag_count ON customers
  FOR EACH ROW
  WHEN (NEW.flag_count IS DISTINCT FROM OLD.flag_count)
  EXECUTE FUNCTION check_and_block_customer();

-- ==============================================
-- STEP 5: Update existing customers with correct counts
-- ==============================================
-- This ensures all customers have correct flag_count and is_blocked status

UPDATE customers 
SET flag_count = (
  SELECT COUNT(*) 
  FROM customer_flags 
  WHERE customer_flags.customer_id = customers.id
),
is_blocked = (
  SELECT COUNT(*) >= 5 
  FROM customer_flags 
  WHERE customer_flags.customer_id = customers.id
)
WHERE EXISTS (
  SELECT 1 FROM customer_flags WHERE customer_flags.customer_id = customers.id
) OR flag_count > 0;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if customer_flags table exists and has correct structure
SELECT 
  'customer_flags table structure' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'customer_flags'
ORDER BY ordinal_position;

-- Check customers with reports
SELECT 
  c.id,
  c.full_name,
  c.flag_count as report_count,
  c.is_blocked,
  COUNT(cf.flag_id) as actual_reports
FROM customers c
LEFT JOIN customer_flags cf ON cf.customer_id = c.id
WHERE c.flag_count > 0 OR cf.flag_id IS NOT NULL
GROUP BY c.id, c.full_name, c.flag_count, c.is_blocked
ORDER BY c.flag_count DESC;

-- Check blocked customers (should only be those with 5+ reports)
SELECT 
  id,
  full_name,
  flag_count as report_count,
  is_blocked
FROM customers 
WHERE is_blocked = TRUE
ORDER BY flag_count DESC;

-- ==============================================
-- NOTES
-- ==============================================
-- 1. The customer_flags table stores individual reports
-- 2. flag_count in customers table represents total report count
-- 3. Customers are automatically blocked when report_count >= 5
-- 4. The triggers automatically update flag_count and is_blocked when reports are added/removed
-- 5. Reason is now required when reporting a customer
