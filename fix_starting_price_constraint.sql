-- Step-by-step approach to fix starting_price constraint issue
-- Run these commands one by one in your Supabase SQL editor

-- Step 1: First, let's see what data we have
SELECT vendor_id, brand_name, category, starting_price 
FROM vendors 
WHERE starting_price IS NULL OR starting_price <= 0
ORDER BY category;

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

-- Step 3: Verify all vendors now have positive starting_price
SELECT vendor_id, brand_name, category, starting_price 
FROM vendors 
WHERE starting_price IS NULL OR starting_price <= 0;

-- Step 4: If the above query returns no rows, proceed with making the column NOT NULL
ALTER TABLE vendors 
ALTER COLUMN starting_price SET NOT NULL;

-- Step 5: Add the check constraint
ALTER TABLE vendors 
ADD CONSTRAINT check_starting_price_positive 
CHECK (starting_price > 0);

-- Step 6: Add comment for clarity
COMMENT ON COLUMN vendors.starting_price IS 'Starting price for vendor services in rupees (mandatory field)';

-- Step 7: Verify the constraint is working
SELECT COUNT(*) as total_vendors, 
       MIN(starting_price) as min_price, 
       MAX(starting_price) as max_price 
FROM vendors;
