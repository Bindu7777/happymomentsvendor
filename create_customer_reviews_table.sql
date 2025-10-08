-- Create customer_reviews table for storing customer reviews
-- Run this in Supabase SQL Editor

-- Step 1: Create the customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  vendor_id INTEGER NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_reviews_vendor_id ON customer_reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_id ON customer_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_rating ON customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_published ON customer_reviews(is_published);

-- Step 3: Create a unique constraint to prevent duplicate reviews from same customer to same vendor
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_reviews_unique 
ON customer_reviews(vendor_id, customer_id);

-- Step 4: Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_reviews_updated_at();

-- Step 5: Disable RLS for now (can be enabled later for security)
ALTER TABLE customer_reviews DISABLE ROW LEVEL SECURITY;

-- Step 6: Insert sample data (optional - remove if not needed)
INSERT INTO customer_reviews (
  vendor_id, customer_id, customer_name, rating, review_text, is_verified
) VALUES 
  (1, (SELECT id FROM customers LIMIT 1), 'John & Sarah', 5, 'Amazing photography! Captured every special moment beautifully. Highly recommended!', true),
  (1, (SELECT id FROM customers LIMIT 1 OFFSET 1), 'Priya & Arjun', 4, 'Great service and professional team. Very happy with the results.', true),
  (1, (SELECT id FROM customers LIMIT 1 OFFSET 2), 'Mike & Lisa', 5, 'Perfect wedding photographer! Made our day even more special.', true);

-- Step 7: Verify the table was created
SELECT 'customer_reviews table created successfully!' as message;

-- Step 8: Show sample data
SELECT 
  id, 
  vendor_id, 
  customer_name, 
  rating, 
  LEFT(review_text, 50) || '...' as review_preview,
  is_verified,
  created_at
FROM customer_reviews 
ORDER BY created_at DESC 
LIMIT 5;
