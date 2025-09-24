-- Add starting_price and languages_spoken fields to vendors table
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS starting_price INTEGER,
ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];

-- Add comments for the new fields
COMMENT ON COLUMN vendors.starting_price IS 'Starting price for vendor services in rupees';
COMMENT ON COLUMN vendors.languages_spoken IS 'Array of languages spoken by the vendor';

-- Update existing vendors with sample data (optional)
-- You can run this to populate some sample data
UPDATE vendors 
SET 
  starting_price = CASE 
    WHEN category = 'Photographers' THEN 35000
    WHEN category = 'Event Planners' THEN 50000
    WHEN category = 'Venues' THEN 100000
    WHEN category = 'Decorators' THEN 25000
    WHEN category = 'Caterers' THEN 20000
    WHEN category = 'Makeup Artists' THEN 15000
    WHEN category = 'DJs, Lighting, and Entertainment' THEN 30000
    WHEN category = 'Anchors' THEN 25000
    WHEN category = 'Transportation Services' THEN 15000
    WHEN category = 'Fashion/Costume Designers' THEN 20000
    WHEN category = 'Tent & Equipment Rentals' THEN 10000
    ELSE 25000
  END,
  languages_spoken = ARRAY['English', 'Hindi', 'Telugu']
WHERE starting_price IS NULL;
