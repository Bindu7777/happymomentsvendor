-- ==============================================
-- FIX CONTACTED_VENDORS STATUS CONSTRAINT
-- ==============================================
-- This script removes or updates the old status constraint
-- to allow the new customer and vendor status values.

-- ==============================================
-- STEP 1: Drop the old constraint
-- ==============================================

ALTER TABLE contacted_vendors 
DROP CONSTRAINT IF EXISTS contacted_vendors_status_check;

-- ==============================================
-- STEP 2: Update existing status values if needed
-- ==============================================
-- If there are any old status values that need to be migrated, do it here
-- For now, we'll keep existing values as they are

-- ==============================================
-- STEP 3: (Optional) Create a new constraint with all valid statuses
-- ==============================================
-- We're NOT creating a new constraint because:
-- 1. We now have separate customer_status and vendor_status fields
-- 2. Validation is handled in the application layer
-- 3. This gives us flexibility to add new statuses without database changes

-- If you want to add a constraint anyway, uncomment below:
/*
ALTER TABLE contacted_vendors 
ADD CONSTRAINT contacted_vendors_status_check 
CHECK (status IN (
  -- Customer statuses
  'Contacted',
  'Discussion in Progress',
  'Discussion going on',
  'Negotiation Ongoing',
  'Deal Finalised',
  'Advance Paid',
  'Event Scheduled',
  'Service in Progress',
  'Event Completed',
  'Not Interested',
  -- Legacy statuses
  'In Discussion', 
  'Deal Agreed',
  'Request Discount Coupon',
  'Discount Applied',
  'Closed - Successful',
  'Closed - Not Proceeding'
));
*/

-- ==============================================
-- STEP 4: Verify the constraint is removed
-- ==============================================

SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'contacted_vendors'::regclass
  AND conname LIKE '%status%';

-- ==============================================
-- NOTES
-- ==============================================
-- 1. The old constraint has been removed
-- 2. Status validation is now handled in the application layer (backend)
-- 3. This allows flexibility to add new statuses without database changes
-- 4. The application validates based on userType (customer/vendor)

