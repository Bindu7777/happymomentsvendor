-- Add new field 'events_completed' to vendors table
-- This field will store the number of events completed by the vendor

ALTER TABLE vendors 
ADD COLUMN events_completed INTEGER DEFAULT 0;

-- Add a comment to describe the field
COMMENT ON COLUMN vendors.events_completed IS 'Number of events completed by the vendor';

-- Update existing vendors to have 0 events completed initially
UPDATE vendors 
SET events_completed = 0 
WHERE events_completed IS NULL;

-- Optional: Set some sample data for existing vendors
-- UPDATE vendors 
-- SET events_completed = 50 
-- WHERE vendor_id = 54; -- Photographer Priya
-- 
-- UPDATE vendors 
-- SET events_completed = 75 
-- WHERE vendor_id = 53; -- Photographer Anuu
-- 
-- UPDATE vendors 
-- SET events_completed = 100 
-- WHERE vendor_id = 49; -- Photographers (Siva)
-- 
-- UPDATE vendors 
-- SET events_completed = 25 
-- WHERE vendor_id = 48; -- Hima Bindu Events
