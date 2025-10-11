-- Add notification fields to contacted_vendors table
ALTER TABLE contacted_vendors
ADD COLUMN IF NOT EXISTS vendor_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS customer_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_message TEXT DEFAULT '';

-- Update existing records to mark vendor as notified (since they already contacted)
UPDATE contacted_vendors
SET vendor_notified = TRUE,
    notification_message = 'Customer contacted you'
WHERE vendor_notified IS NULL;

-- Add comments
COMMENT ON COLUMN contacted_vendors.vendor_notified IS 'Whether vendor has been notified about this contact';
COMMENT ON COLUMN contacted_vendors.customer_notified IS 'Whether customer has been notified about status changes';
COMMENT ON COLUMN contacted_vendors.notification_message IS 'Notification message for this contact';
