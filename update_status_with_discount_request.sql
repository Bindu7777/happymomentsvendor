-- Update contacted_vendors table to include "Request Discount Coupon" status

-- First, let's check the current constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'contacted_vendors'::regclass 
AND conname LIKE '%status%';

-- Drop existing constraint
ALTER TABLE contacted_vendors DROP CONSTRAINT IF EXISTS contacted_vendors_status_check;

-- Add updated check constraint with new status
ALTER TABLE contacted_vendors 
ADD CONSTRAINT contacted_vendors_status_check 
CHECK (status IN (
  'Contacted',
  'In Discussion', 
  'Deal Agreed',
  'Request Discount Coupon',
  'Discount Applied',
  'Advance Paid',
  'Event Scheduled',
  'Event Completed',
  'Closed - Successful',
  'Closed - Not Proceeding'
));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'contacted_vendors'::regclass 
AND conname LIKE '%status%';

-- Test with a sample update to ensure it works
-- (This will only work if there's existing data)
-- UPDATE contacted_vendors 
-- SET status = 'Request Discount Coupon' 
-- WHERE contact_id = 1 
-- LIMIT 1;

-- Show the updated status pipeline
SELECT 
  'Status pipeline updated successfully' as status,
  'New status "Request Discount Coupon" added between "Deal Agreed" and "Discount Applied"' as description;
