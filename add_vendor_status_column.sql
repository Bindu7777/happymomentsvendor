-- Add vendor_status column to contacted_vendors table
-- This column will track the vendor's perspective of the customer interaction status

ALTER TABLE contacted_vendors 
ADD COLUMN vendor_status TEXT DEFAULT 'Contacted';

-- Add a comment to explain the column purpose
COMMENT ON COLUMN contacted_vendors.vendor_status IS 'Vendor perspective of customer interaction status';

-- Update existing records to have 'Contacted' as default status
UPDATE contacted_vendors 
SET vendor_status = 'Contacted' 
WHERE vendor_status IS NULL;

-- Optional: Add a check constraint to ensure only valid status values
ALTER TABLE contacted_vendors 
ADD CONSTRAINT check_vendor_status 
CHECK (vendor_status IN (
    'Contacted',
    'Customer Interested', 
    'Deal Made',
    'Advance Received',
    'Event Completed',
    'Full Amount Settled',
    'Closed'
));

-- Create an index on vendor_status for better query performance
CREATE INDEX idx_contacted_vendors_vendor_status ON contacted_vendors(vendor_status);
