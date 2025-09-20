-- Add sample catalog images to vendor_media table for testing
-- Replace 'YOUR_VENDOR_ID' with the actual vendor ID you want to test with

-- First, let's see what vendors exist (uncomment to run)
-- SELECT vendor_id, brand_name FROM vendors LIMIT 5;

-- Add sample catalog images for a specific vendor
-- Replace '1' with your actual vendor_id
INSERT INTO vendor_media (vendor_id, media_url, media_type, category, title, description, order_index, featured, public)
VALUES 
  ('1', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', 'image', 'catalog', 'Wedding Setup 1', 'Beautiful wedding decoration with floral arrangements', 1, true, true),
  ('1', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'image', 'catalog', 'Wedding Setup 2', 'Elegant wedding stage decoration', 2, false, true),
  ('1', 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', 'image', 'catalog', 'Birthday Party', 'Colorful birthday party decoration', 3, false, true),
  ('1', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800', 'image', 'catalog', 'Corporate Event', 'Professional corporate event setup', 4, false, true);

-- You can also add highlight images
INSERT INTO vendor_media (vendor_id, media_url, media_type, category, title, description, order_index, featured, public)
VALUES 
  ('1', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', 'image', 'highlights', 'Featured Work 1', 'Our best decoration work', 1, true, true),
  ('1', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800', 'image', 'highlights', 'Featured Work 2', 'Premium event decoration', 2, true, true);

-- To check what was inserted:
-- SELECT * FROM vendor_media WHERE vendor_id = '1' AND category IN ('catalog', 'highlights');

-- To remove all sample data (if needed):
-- DELETE FROM vendor_media WHERE vendor_id = '1' AND media_url LIKE 'https://images.unsplash.com%';
