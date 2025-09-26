-- Simple fix for starting_price constraint issue
-- Run this in your Supabase SQL editor

-- Step 1: Drop the constraint if it exists (in case it was partially created)
ALTER TABLE vendors DROP CONSTRAINT IF EXISTS check_starting_price_positive;

-- Step 2: Update all vendors with NULL or 0 starting_price
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
WHERE starting_price IS NULL OR starting_price <= 0;

-- Step 3: Make the column NOT NULL
ALTER TABLE vendors 
ALTER COLUMN starting_price SET NOT NULL;

-- Step 4: Add the check constraint
ALTER TABLE vendors 
ADD CONSTRAINT check_starting_price_positive 
CHECK (starting_price > 0);

-- Step 5: Verify everything is working
SELECT COUNT(*) as total_vendors, 
       MIN(starting_price) as min_price, 
       MAX(starting_price) as max_price 
FROM vendors;
