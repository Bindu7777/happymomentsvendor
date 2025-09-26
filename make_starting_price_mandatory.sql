-- Make starting_price field mandatory (NOT NULL) in vendors table
-- This will ensure all vendors must have a starting price

-- First, update any existing vendors that have NULL starting_price
UPDATE vendors 
SET starting_price = CASE 
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
END
WHERE starting_price IS NULL;

-- Now make the column NOT NULL
ALTER TABLE vendors 
ALTER COLUMN starting_price SET NOT NULL;

-- Add a check constraint to ensure starting_price is positive
ALTER TABLE vendors 
ADD CONSTRAINT check_starting_price_positive 
CHECK (starting_price > 0);

-- Add comment for clarity
COMMENT ON COLUMN vendors.starting_price IS 'Starting price for vendor services in rupees (mandatory field)';
