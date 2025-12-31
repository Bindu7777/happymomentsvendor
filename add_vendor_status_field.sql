-- ==============================================
-- ADD VENDOR_STATUS FIELD TO CONTACTED_VENDORS TABLE
-- ==============================================
-- This script adds a separate vendor_status field to store vendor-specific statuses
-- separately from customer statuses.

-- ==============================================
-- STEP 1: Add vendor_status column if it doesn't exist
-- ==============================================

ALTER TABLE contacted_vendors 
ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'Contacted';

-- ==============================================
-- STEP 2: Migrate existing data
-- ==============================================
-- If vendor_status doesn't exist, copy status to vendor_status for existing records
-- This ensures backward compatibility

UPDATE contacted_vendors 
SET vendor_status = COALESCE(vendor_status, status, 'Contacted')
WHERE vendor_status IS NULL;

-- ==============================================
-- STEP 3: Create index for vendor_status
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_contacted_vendors_vendor_status 
ON contacted_vendors(vendor_status);

-- ==============================================
-- STEP 4: Add comment to document the fields
-- ==============================================

COMMENT ON COLUMN contacted_vendors.status IS 'Customer-side status: Contacted, Discussion in Progress, Discussion going on, Negotiation Ongoing, Deal Finalised, Advance Paid, Event Scheduled, Service in Progress, Event Completed, Not Interested';
COMMENT ON COLUMN contacted_vendors.vendor_status IS 'Vendor-side status: Customer Contacted, Discussion in Progress, Quotation Shared, Negotiation Ongoing, Deal Confirmed, Advance Received, Event Scheduled, Service in Progress, Service Completed, Payment Settled, Lost';

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if vendor_status column exists
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'contacted_vendors' 
  AND column_name IN ('status', 'vendor_status')
ORDER BY column_name;

-- Check sample data
SELECT 
  contact_id,
  customer_id,
  vendor_id,
  status as customer_status,
  vendor_status,
  contacted_at
FROM contacted_vendors
LIMIT 5;

