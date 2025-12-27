-- ==============================================
-- ADD GOOGLE MAPS LINK FIELD TO VENDORS TABLE
-- ==============================================
-- This script adds a field to support Google Maps links
-- so vendors can provide their location link and customers
-- can easily view the location on Google Maps.
-- ==============================================

-- Add google_maps_link field
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- Create index on google_maps_link for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_vendors_google_maps_link ON vendors(google_maps_link) WHERE google_maps_link IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN vendors.google_maps_link IS 'Google Maps location link for the vendor. Customers can click to view location on Google Maps.';

-- ==============================================
-- VERIFY THE CHANGES
-- ==============================================

-- Check that the column was added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vendors'
  AND column_name = 'google_maps_link';

-- Show current table structure
SELECT
  'Table structure updated successfully' as status,
  COUNT(*) FILTER (WHERE column_name = 'google_maps_link') as has_google_maps_link
FROM information_schema.columns
WHERE table_name = 'vendors';

