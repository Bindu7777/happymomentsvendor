-- Add catalog_images_metadata column to vendors table
-- Run this in Supabase SQL Editor

-- Step 1: Add the catalog_images_metadata column
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS catalog_images_metadata JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add a comment to describe the column
COMMENT ON COLUMN vendors.catalog_images_metadata IS 'Metadata for catalog images including highlight status, filename, and other properties';

-- Step 3: Create an index for better performance when querying highlighted images
CREATE INDEX IF NOT EXISTS idx_vendors_catalog_images_metadata 
ON vendors USING GIN (catalog_images_metadata);

-- Step 4: Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name = 'catalog_images_metadata';

SELECT 'catalog_images_metadata column added successfully!' as message;
