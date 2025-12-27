-- ==============================================
-- ADD LANGUAGES FIELD TO VENDORS TABLE
-- ==============================================

-- Add languages column as TEXT array to store multiple languages
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS languages TEXT[];

-- Add a comment to the column
COMMENT ON COLUMN vendors.languages IS 'Array of languages spoken by the vendor (e.g., English, Hindi, Telugu)';

-- Create an index for better query performance (GIN index for array searches)
CREATE INDEX IF NOT EXISTS idx_vendors_languages ON vendors USING GIN(languages);

-- Verify the change
SELECT
  column_name,
  data_type,
  is_nullable,
  udt_name
FROM information_schema.columns
WHERE table_name = 'vendors' AND column_name = 'languages';

