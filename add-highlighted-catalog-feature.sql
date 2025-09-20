-- SQL script to add highlighted catalog images feature
-- This allows vendors to highlight up to 3 images for special catalog display

-- 1. Add is_highlighted column to vendor_media table
ALTER TABLE vendor_media 
ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT FALSE;

-- 2. Add index for better performance when querying highlighted images
CREATE INDEX IF NOT EXISTS idx_vendor_media_highlighted 
ON vendor_media (vendor_id, category, is_highlighted, order_index) 
WHERE category = 'catalog' AND public = true;

-- 3. Create a function to enforce max 3 highlighted images per vendor
CREATE OR REPLACE FUNCTION enforce_max_highlighted_images()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if we're setting is_highlighted to TRUE
    IF NEW.is_highlighted = TRUE AND NEW.category = 'catalog' THEN
        -- Count current highlighted images for this vendor (excluding the current record if updating)
        IF (SELECT COUNT(*) 
            FROM vendor_media 
            WHERE vendor_id = NEW.vendor_id 
              AND category = 'catalog' 
              AND is_highlighted = TRUE
              AND (TG_OP = 'INSERT' OR id != NEW.id)
           ) >= 3 THEN
            RAISE EXCEPTION 'Cannot highlight more than 3 catalog images per vendor. Please unhighlight another image first.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to enforce the 3-image limit
DROP TRIGGER IF EXISTS trigger_max_highlighted_images ON vendor_media;
CREATE TRIGGER trigger_max_highlighted_images
    BEFORE INSERT OR UPDATE ON vendor_media
    FOR EACH ROW
    EXECUTE FUNCTION enforce_max_highlighted_images();

-- 5. Add some sample highlighted images for testing (vendor 14)
-- First, let's add some catalog images if they don't exist
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
    is_highlighted,
    uploaded_at
) VALUES 
-- Highlighted Image 1
(
    gen_random_uuid(),
    '14',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
    'image',
    'catalog',
    'Featured Wedding Ceremony',
    'Beautiful outdoor wedding ceremony - highlighted for catalog',
    'Wedding ceremony photography',
    1,
    true,
    true,
    true,  -- HIGHLIGHTED
    NOW()
),
-- Highlighted Image 2
(
    gen_random_uuid(),
    '14',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop',
    'image',
    'catalog',
    'Featured Event Decoration',
    'Elegant event decoration setup - highlighted for catalog',
    'Event decoration photography',
    2,
    false,
    true,
    true,  -- HIGHLIGHTED
    NOW()
),
-- Highlighted Image 3
(
    gen_random_uuid(),
    '14',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
    'image',
    'catalog',
    'Featured Reception Setup',
    'Beautiful reception hall setup - highlighted for catalog',
    'Reception photography',
    3,
    false,
    true,
    true,  -- HIGHLIGHTED
    NOW()
),
-- Regular (non-highlighted) images
(
    gen_random_uuid(),
    '14',
    '/images/image1.jpeg',
    'image',
    'catalog',
    'Portfolio Sample 1',
    'Regular portfolio image',
    'Portfolio sample 1',
    4,
    false,
    true,
    false,  -- NOT HIGHLIGHTED
    NOW()
),
(
    gen_random_uuid(),
    '14',
    '/images/image2.jpeg',
    'image',
    'catalog',
    'Portfolio Sample 2',
    'Regular portfolio image',
    'Portfolio sample 2',
    5,
    false,
    true,
    false,  -- NOT HIGHLIGHTED
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 6. Create helper function to get highlighted catalog images (up to 3)
CREATE OR REPLACE FUNCTION get_highlighted_catalog_images(p_vendor_id TEXT)
RETURNS TABLE (
    id UUID,
    vendor_id TEXT,
    media_url TEXT,
    media_type TEXT,
    category TEXT,
    title TEXT,
    description TEXT,
    alt_text TEXT,
    order_index INTEGER,
    featured BOOLEAN,
    public BOOLEAN,
    is_highlighted BOOLEAN,
    uploaded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- First try to get highlighted images
    RETURN QUERY
    SELECT vm.id, vm.vendor_id, vm.media_url, vm.media_type, vm.category,
           vm.title, vm.description, vm.alt_text, vm.order_index, vm.featured,
           vm.public, vm.is_highlighted, vm.uploaded_at
    FROM vendor_media vm
    WHERE vm.vendor_id = p_vendor_id 
      AND vm.category = 'catalog'
      AND vm.public = true
      AND vm.is_highlighted = true
    ORDER BY vm.order_index ASC, vm.uploaded_at ASC
    LIMIT 3;
    
    -- If no highlighted images found, get first 3 catalog images
    IF NOT FOUND OR (SELECT COUNT(*) FROM vendor_media WHERE vendor_id = p_vendor_id AND category = 'catalog' AND public = true AND is_highlighted = true) = 0 THEN
        RETURN QUERY
        SELECT vm.id, vm.vendor_id, vm.media_url, vm.media_type, vm.category,
               vm.title, vm.description, vm.alt_text, vm.order_index, vm.featured,
               vm.public, vm.is_highlighted, vm.uploaded_at
        FROM vendor_media vm
        WHERE vm.vendor_id = p_vendor_id 
          AND vm.category = 'catalog'
          AND vm.public = true
        ORDER BY vm.order_index ASC, vm.uploaded_at ASC
        LIMIT 3;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Test the function
SELECT * FROM get_highlighted_catalog_images('14');

-- 8. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'vendor_media'
  AND column_name IN ('is_highlighted', 'category', 'vendor_id')
ORDER BY ordinal_position;

-- 9. Show current catalog images for vendor 14
SELECT 
    vendor_id,
    media_url,
    title,
    category,
    is_highlighted,
    order_index,
    public
FROM vendor_media 
WHERE vendor_id = '14' AND category = 'catalog'
ORDER BY is_highlighted DESC, order_index ASC;
