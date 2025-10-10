-- Update contacted_vendors table to support status pipeline

-- First, let's check the current structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'contacted_vendors'
ORDER BY ordinal_position;

-- Update the status column to use enum-like constraint
-- Drop existing constraint if it exists
ALTER TABLE contacted_vendors DROP CONSTRAINT IF EXISTS contacted_vendors_status_check;

-- Add check constraint for valid status values
ALTER TABLE contacted_vendors 
ADD CONSTRAINT contacted_vendors_status_check 
CHECK (status IN (
  'Contacted',
  'In Discussion', 
  'Deal Agreed',
  'Discount Applied',
  'Advance Paid',
  'Event Scheduled',
  'Event Completed',
  'Closed - Successful',
  'Closed - Not Proceeding'
));

-- Update any existing records to have proper status
UPDATE contacted_vendors 
SET status = 'Contacted' 
WHERE status IS NULL OR status = '';

-- Add an index for status queries
CREATE INDEX IF NOT EXISTS idx_contacted_vendors_status ON contacted_vendors(status);

-- Add a comment to document the pipeline stages
COMMENT ON COLUMN contacted_vendors.status IS 'Pipeline stage: Contacted -> In Discussion -> Deal Agreed -> Discount Applied -> Advance Paid -> Event Scheduled -> Event Completed -> Closed (Successful/Not Proceeding)';

-- Verify the changes
SELECT 
  'Table updated successfully' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacted_vendors'
ORDER BY ordinal_position;

-- Show sample data with status
SELECT 
  contact_id,
  customer_id,
  vendor_id,
  status,
  contacted_at,
  created_at
FROM contacted_vendors
LIMIT 5;
