-- SQL script to add new content fields to vendors table
-- Run this script in your Supabase SQL editor to add the new fields

-- Add quick_intro column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'quick_intro') THEN
        ALTER TABLE vendors ADD COLUMN quick_intro TEXT;
        COMMENT ON COLUMN vendors.quick_intro IS 'Short catchy intro line for vendor services (max 60 chars)';
    END IF;
END $$;

-- Add caption column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'caption') THEN
        ALTER TABLE vendors ADD COLUMN caption TEXT;
        COMMENT ON COLUMN vendors.caption IS 'Cultural greeting or tagline (max 60 chars)';
    END IF;
END $$;

-- Add detailed_intro column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'detailed_intro') THEN
        ALTER TABLE vendors ADD COLUMN detailed_intro TEXT;
        COMMENT ON COLUMN vendors.detailed_intro IS 'Detailed description of vendor services (max 300 chars)';
    END IF;
END $$;

-- Add brand_logo_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'brand_logo_url') THEN
        ALTER TABLE vendors ADD COLUMN brand_logo_url TEXT;
        COMMENT ON COLUMN vendors.brand_logo_url IS 'URL to brand/company logo image';
    END IF;
END $$;

-- Add contact_person_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'contact_person_image_url') THEN
        ALTER TABLE vendors ADD COLUMN contact_person_image_url TEXT;
        COMMENT ON COLUMN vendors.contact_person_image_url IS 'URL to contact person photo';
    END IF;
END $$;

-- Add highlight_features column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'highlight_features') THEN
        ALTER TABLE vendors ADD COLUMN highlight_features JSONB;
        COMMENT ON COLUMN vendors.highlight_features IS 'Array of highlight features (max 4 items)';
    END IF;
END $$;

-- Verify the new columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendors' 
    AND column_name IN ('quick_intro', 'caption', 'detailed_intro', 'brand_logo_url', 'contact_person_image_url', 'highlight_features')
ORDER BY column_name;

-- Show a sample of the updated table structure
SELECT 
    brand_name,
    quick_intro,
    caption,
    detailed_intro,
    brand_logo_url,
    contact_person_image_url,
    highlight_features
FROM vendors 
LIMIT 3;
