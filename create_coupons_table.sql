-- Create coupons table for discount management

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can view coupons" ON coupons;
DROP POLICY IF EXISTS "Users can insert coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update coupons" ON coupons;

-- Drop the table if it exists (this will also drop all constraints)
DROP TABLE IF EXISTS coupons CASCADE;

-- Create the coupons table
CREATE TABLE coupons (
  coupon_id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  coupon_code VARCHAR(20) UNIQUE NOT NULL,         -- Unique coupon code
  discount_percentage INTEGER NOT NULL,            -- Discount percentage (e.g., 10 for 10%)
  description TEXT,                                 -- Description of the coupon
  status TEXT DEFAULT 'active',                     -- Status: active, inactive, used, expired
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  usage_limit INTEGER DEFAULT 1,                   -- How many times it can be used
  usage_count INTEGER DEFAULT 0,                   -- How many times it has been used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  CHECK (usage_count >= 0),
  CHECK (usage_limit > 0),
  CHECK (valid_until > valid_from),
  CHECK (status IN ('active', 'inactive', 'used', 'expired'))
);

-- Create indexes for performance
CREATE INDEX idx_coupons_code ON coupons(coupon_code);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX idx_coupons_usage ON coupons(usage_count, usage_limit);

-- Enable Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Allow everyone to read active coupons
CREATE POLICY "Allow all operations on coupons" ON coupons
  FOR ALL USING (true) WITH CHECK (true);

-- Insert 20 sample active coupons
INSERT INTO coupons (coupon_code, discount_percentage, description, status) VALUES
('HAPPY10', 10, 'Happy Moments 10% Off - Perfect for your special day!', 'active'),
('WEDDING15', 15, 'Wedding Special 15% Off - Celebrate your love!', 'active'),
('EVENT20', 20, 'Event Planning 20% Off - Make it memorable!', 'active'),
('PHOTO25', 25, 'Photography 25% Off - Capture every moment!', 'active'),
('VENUE30', 30, 'Venue Booking 30% Off - Your dream location awaits!', 'active'),
('CATER35', 35, 'Catering 35% Off - Delicious food for your guests!', 'active'),
('DECOR40', 40, 'Decoration 40% Off - Beautiful ambiance guaranteed!', 'active'),
('MUSIC45', 45, 'Music & Entertainment 45% Off - Party time!', 'active'),
('ATTIRE50', 50, 'Attire & Accessories 50% Off - Look stunning!', 'active'),
('GOLDEN60', 60, 'Golden Hour 60% Off - Limited time offer!', 'active'),
('SILVER70', 70, 'Silver Package 70% Off - Premium experience!', 'active'),
('DIAMOND80', 80, 'Diamond Deal 80% Off - Once in a lifetime!', 'active'),
('PLATINUM85', 85, 'Platinum Special 85% Off - Ultimate luxury!', 'active'),
('ROYAL90', 90, 'Royal Treatment 90% Off - Regal experience!', 'active'),
('MAGIC95', 95, 'Magic Moment 95% Off - Almost free celebration!', 'active'),
('DREAM100', 100, 'Dream Come True - Completely FREE service!', 'active'),
('LOVE12', 12, 'Love Package 12% Off - For the perfect couple!', 'active'),
('FAMILY18', 18, 'Family Special 18% Off - Celebrating together!', 'active'),
('FRIENDS22', 22, 'Friends Forever 22% Off - Friendship celebration!', 'active'),
('CELEBRATE28', 28, 'Celebration Special 28% Off - Mark the occasion!', 'active');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_coupons_updated_at();

-- Verify the table structure and data
SELECT 
  'Coupons table created successfully' as status,
  COUNT(*) as total_coupons,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_coupons
FROM coupons;

-- Show sample coupons
SELECT 
  coupon_code,
  discount_percentage,
  description,
  status,
  valid_until
FROM coupons 
ORDER BY discount_percentage DESC
LIMIT 5;
