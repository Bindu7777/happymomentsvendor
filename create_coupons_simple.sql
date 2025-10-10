-- Simple coupons table creation and data insertion (no constraints/indexes)

-- Drop the table if it exists
DROP TABLE IF EXISTS coupons CASCADE;

-- Create the simple coupons table
CREATE TABLE coupons (
  coupon_id SERIAL PRIMARY KEY,
  coupon_code VARCHAR(20) UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  usage_limit INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 20 sample active coupons
INSERT INTO coupons (coupon_code, discount_percentage, description, status, valid_until) VALUES
('HAPPY10', 10, 'Happy Moments 10% Off - Perfect for your special day!', 'active', '2025-12-31 23:59:59+00'),
('WEDDING15', 15, 'Wedding Special 15% Off - Celebrate your love!', 'active', '2025-12-31 23:59:59+00'),
('EVENT20', 20, 'Event Planning 20% Off - Make it memorable!', 'active', '2025-12-31 23:59:59+00'),
('PHOTO25', 25, 'Photography 25% Off - Capture every moment!', 'active', '2025-12-31 23:59:59+00'),
('VENUE30', 30, 'Venue Booking 30% Off - Your dream location awaits!', 'active', '2025-12-31 23:59:59+00'),
('CATER35', 35, 'Catering 35% Off - Delicious food for your guests!', 'active', '2025-12-31 23:59:59+00'),
('DECOR40', 40, 'Decoration 40% Off - Beautiful ambiance guaranteed!', 'active', '2025-12-31 23:59:59+00'),
('MUSIC45', 45, 'Music & Entertainment 45% Off - Party time!', 'active', '2025-12-31 23:59:59+00'),
('ATTIRE50', 50, 'Attire & Accessories 50% Off - Look stunning!', 'active', '2025-12-31 23:59:59+00'),
('GOLDEN60', 60, 'Golden Hour 60% Off - Limited time offer!', 'active', '2025-12-31 23:59:59+00'),
('SILVER70', 70, 'Silver Package 70% Off - Premium experience!', 'active', '2025-12-31 23:59:59+00'),
('DIAMOND80', 80, 'Diamond Deal 80% Off - Once in a lifetime!', 'active', '2025-12-31 23:59:59+00'),
('PLATINUM85', 85, 'Platinum Special 85% Off - Ultimate luxury!', 'active', '2025-12-31 23:59:59+00'),
('ROYAL90', 90, 'Royal Treatment 90% Off - Regal experience!', 'active', '2025-12-31 23:59:59+00'),
('MAGIC95', 95, 'Magic Moment 95% Off - Almost free celebration!', 'active', '2025-12-31 23:59:59+00'),
('DREAM100', 100, 'Dream Come True - Completely FREE service!', 'active', '2025-12-31 23:59:59+00'),
('LOVE12', 12, 'Love Package 12% Off - For the perfect couple!', 'active', '2025-12-31 23:59:59+00'),
('FAMILY18', 18, 'Family Special 18% Off - Celebrating together!', 'active', '2025-12-31 23:59:59+00'),
('FRIENDS22', 22, 'Friends Forever 22% Off - Friendship celebration!', 'active', '2025-12-31 23:59:59+00'),
('CELEBRATE28', 28, 'Celebration Special 28% Off - Mark the occasion!', 'active', '2025-12-31 23:59:59+00');

-- Verify the data was inserted
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
