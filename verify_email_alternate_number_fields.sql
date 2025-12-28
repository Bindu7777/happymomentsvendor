-- ==============================================
-- VERIFY EMAIL AND ALTERNATE_NUMBER FIELDS IN VENDORS TABLE
-- ==============================================

-- Check if email and alternate_number columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vendors' 
  AND column_name IN ('email', 'alternate_number')
ORDER BY column_name;

-- If columns don't exist, add them
DO $$
BEGIN
  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'vendors' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE vendors
    ADD COLUMN email TEXT;
    
    COMMENT ON COLUMN vendors.email IS 'Email address of the vendor for contact and communication.';
    
    RAISE NOTICE 'Email column added to vendors table';
  ELSE
    RAISE NOTICE 'Email column already exists in vendors table';
  END IF;

  -- Add alternate_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'vendors' 
    AND column_name = 'alternate_number'
  ) THEN
    ALTER TABLE vendors
    ADD COLUMN alternate_number TEXT;
    
    COMMENT ON COLUMN vendors.alternate_number IS 'Alternate phone number (admin-only field, not visible in public profile).';
    
    RAISE NOTICE 'Alternate number column added to vendors table';
  ELSE
    RAISE NOTICE 'Alternate number column already exists in vendors table';
  END IF;
END $$;

-- Verify the columns after potential addition
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vendors' 
  AND column_name IN ('email', 'alternate_number')
ORDER BY column_name;

