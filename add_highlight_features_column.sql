-- SQL Query to add highlight_features column to vendors table
-- This column stores an array of up to 4 highlighted features for each vendor

-- Check if column exists, if not add it
DO $$ 
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vendors' 
        AND column_name = 'highlight_features'
    ) THEN
        -- Add the column as text array
        ALTER TABLE vendors 
        ADD COLUMN highlight_features TEXT[] DEFAULT '{}';
        
        -- Add comment to document the column
        COMMENT ON COLUMN vendors.highlight_features IS 'Array of up to 4 highlighted features that make the vendor stand out (e.g., Professional Service, Quality Guarantee, On-Time Delivery, Expert Team)';
        
        RAISE NOTICE 'Column highlight_features added successfully';
    ELSE
        RAISE NOTICE 'Column highlight_features already exists';
    END IF;
END $$;

-- Optional: Add a check constraint to limit to max 4 features
-- Uncomment the following if you want to enforce this at database level
/*
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'vendors_highlight_features_max_4'
    ) THEN
        ALTER TABLE vendors 
        ADD CONSTRAINT vendors_highlight_features_max_4 
        CHECK (array_length(highlight_features, 1) IS NULL OR array_length(highlight_features, 1) <= 4);
        
        RAISE NOTICE 'Constraint vendors_highlight_features_max_4 added successfully';
    ELSE
        RAISE NOTICE 'Constraint vendors_highlight_features_max_4 already exists';
    END IF;
END $$;
*/

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    udt_name,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name = 'highlight_features';

