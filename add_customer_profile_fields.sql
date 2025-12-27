-- ==============================================
-- ADD CUSTOMER PROFILE EDIT FIELDS
-- ==============================================
-- This script adds fields to support:
-- 1. Secondary phone number
-- 2. Email change with verification
-- 3. Location field (if not exists)
-- ==============================================

-- Add secondary phone number field
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS secondary_phone_number TEXT;

-- Add location field (if not exists)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add fields for email change verification
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS new_email TEXT;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS email_change_token TEXT;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS email_change_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index on new_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_new_email ON customers(new_email);

-- Create index on email_change_token for verification lookups
CREATE INDEX IF NOT EXISTS idx_customers_email_change_token ON customers(email_change_token);

-- Add comment to document the fields
COMMENT ON COLUMN customers.secondary_phone_number IS 'Secondary/alternate phone number for the customer';
COMMENT ON COLUMN customers.location IS 'Customer location/address';
COMMENT ON COLUMN customers.new_email IS 'Pending new email address awaiting verification';
COMMENT ON COLUMN customers.email_change_token IS 'Token for verifying email change request';
COMMENT ON COLUMN customers.email_change_token_expires_at IS 'Expiration timestamp for email change token';

-- ==============================================
-- VERIFY THE CHANGES
-- ==============================================

-- Check that all columns were added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
  AND column_name IN ('secondary_phone_number', 'location', 'new_email', 'email_change_token', 'email_change_token_expires_at')
ORDER BY ordinal_position;

-- Show current table structure
SELECT 
  'Table structure updated successfully' as status,
  COUNT(*) FILTER (WHERE column_name = 'secondary_phone_number') as has_secondary_phone,
  COUNT(*) FILTER (WHERE column_name = 'location') as has_location,
  COUNT(*) FILTER (WHERE column_name = 'new_email') as has_new_email,
  COUNT(*) FILTER (WHERE column_name = 'email_change_token') as has_email_change_token
FROM information_schema.columns 
WHERE table_name = 'customers';

