-- Add address field to vendors table if it doesn't exist
-- This script ensures the address field is properly added to the vendors table

-- Check if address column exists, if not add it
DO $$ 
BEGIN
    -- Check if the address column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vendors' 
        AND column_name = 'address'
    ) THEN
        -- Add the address column
        ALTER TABLE vendors 
        ADD COLUMN address TEXT;
        
        -- Add a comment to the column
        COMMENT ON COLUMN vendors.address IS 'Complete address of the vendor including street, city, state, and pincode';
        
        RAISE NOTICE 'Address column added to vendors table';
    ELSE
        RAISE NOTICE 'Address column already exists in vendors table';
    END IF;
END $$;

-- Update existing records with empty address to have a default value
UPDATE vendors 
SET address = 'Address not provided' 
WHERE address IS NULL OR address = '' OR address = 'EMPTY';

-- Add a check constraint to ensure address is not empty
ALTER TABLE vendors 
ADD CONSTRAINT check_address_not_empty 
CHECK (address IS NOT NULL AND address != '' AND address != 'EMPTY');

-- Create an index on the address column for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_address ON vendors(address);

-- Display the current structure of the vendors table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name IN ('address', 'brand_name', 'phone_number', 'email')
ORDER BY ordinal_position;
