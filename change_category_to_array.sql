-- ==============================================
-- CHANGE CATEGORY COLUMN TO ARRAY (TEXT[])
-- ==============================================

-- Step 1: Add the categories column (TEXT array)
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Step 2: Migrate existing category data to categories array
-- Use COALESCE and NULLIF to safely handle empty strings and NULLs
UPDATE vendors
SET categories = CASE
  WHEN category IS NULL THEN ARRAY[]::TEXT[]
  WHEN NULLIF(category::text, '') IS NULL THEN ARRAY[]::TEXT[]
  ELSE ARRAY[NULLIF(category::text, '')]::TEXT[]
END
WHERE categories IS NULL OR array_length(categories, 1) IS NULL;

-- Step 3: Ensure all vendors have categories set (handle any remaining NULLs)
UPDATE vendors
SET categories = ARRAY[]::TEXT[]
WHERE categories IS NULL;

-- Step 4: Create GIN index for efficient array searching
CREATE INDEX IF NOT EXISTS idx_vendors_categories ON vendors USING GIN (categories);

-- Step 5: Add comment to document the column
COMMENT ON COLUMN vendors.categories IS 'Array of categories the vendor belongs to. Allows vendors to have multiple categories.';

-- Step 6: Verify the column was created
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors' 
  AND column_name IN ('category', 'categories')
ORDER BY column_name;

-- Note: Keep the old 'category' column for backward compatibility during migration
-- You can drop it later once all code is updated to use 'categories'
