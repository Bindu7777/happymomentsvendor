-- SQL Query to add 'advance' field to booking_policies JSON column in vendors table
-- This allows vendors to specify advance payment requirements

-- Note: Since booking_policies is a JSONB column, we need to update existing records
-- to include the advance field. New records will automatically have it when saved.

-- Update existing vendors to add empty advance field if booking_policies exists
UPDATE vendors
SET booking_policies = COALESCE(booking_policies, '{}'::jsonb) || '{"advance": ""}'::jsonb
WHERE booking_policies IS NOT NULL
  AND (booking_policies->>'advance') IS NULL;

-- Verify the update
SELECT 
  vendor_id,
  brand_name,
  booking_policies->>'advance' as advance_payment,
  booking_policies->>'payment_terms' as payment_terms,
  booking_policies->>'cancellation_policy' as cancellation_policy,
  booking_policies->>'booking_requirements' as booking_requirements
FROM vendors
WHERE booking_policies IS NOT NULL
LIMIT 10;

-- Optional: Add a comment to document the field
COMMENT ON COLUMN vendors.booking_policies IS 'JSON object containing booking policies: cancellation_policy, payment_terms, booking_requirements, and advance (advance payment requirement)';

