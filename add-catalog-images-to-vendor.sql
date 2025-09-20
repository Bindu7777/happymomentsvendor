-- Add sample catalog images to vendor_media table for vendor 14
-- This will make the catalog images appear in both profile and edit form
-- Run this in your Supabase SQL Editor

-- Insert catalog images for vendor 14
INSERT INTO vendor_media (
  id,
  vendor_id, 
  media_url, 
  media_type, 
  category, 
  title, 
  description, 
  alt_text, 
  order_index, 
  featured, 
  public, 
  uploaded_at
) VALUES 
-- Image 1
(
  gen_random_uuid(),
  '14',
  '/images/image1.jpeg',
  'image',
  'catalog',
  'Portfolio Image 1',
  'Professional event photography showcase',
  'Event photography sample 1',
  1,
  true,
  true,
  NOW()
),
-- Image 2
(
  gen_random_uuid(),
  '14',
  '/images/image2.jpeg',
  'image',
  'catalog',
  'Portfolio Image 2',
  'Professional event photography showcase',
  'Event photography sample 2',
  2,
  false,
  true,
  NOW()
),
-- Image 3
(
  gen_random_uuid(),
  '14',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
  'image',
  'catalog',
  'Wedding Ceremony',
  'Beautiful wedding ceremony setup',
  'Wedding ceremony photography',
  3,
  false,
  true,
  NOW()
),
-- Image 4
(
  gen_random_uuid(),
  '14',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop',
  'image',
  'catalog',
  'Event Decoration',
  'Elegant event decoration and setup',
  'Event decoration photography',
  4,
  false,
  true,
  NOW()
);

-- Verify the insertion
SELECT 
  vendor_id,
  media_url,
  category,
  title,
  order_index,
  public
FROM vendor_media 
WHERE vendor_id = '14' AND category = 'catalog'
ORDER BY order_index;
