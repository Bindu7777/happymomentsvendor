-- Safe setup script for Google Drive sample images
-- This script safely adds sample Google Drive images for testing
-- 
-- IMPORTANT: Run implement-centralized-image-storage.sql FIRST
-- Then run this script to add sample data for testing

-- 1. First, check current state for vendor 14
SELECT 
    'BEFORE CLEANUP' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN is_highlighted = TRUE THEN 1 END) as highlighted_count
FROM vendor_media 
WHERE vendor_id::TEXT = '14';

-- 2. Clean up existing catalog images for vendor 14 to start fresh
DELETE FROM vendor_media 
WHERE vendor_id::TEXT = '14' AND category = 'catalog';

-- 3. Verify cleanup
SELECT 
    'AFTER CLEANUP' as status,
    COUNT(*) as total_images,
    COUNT(CASE WHEN is_highlighted = TRUE THEN 1 END) as highlighted_count
FROM vendor_media 
WHERE vendor_id::TEXT = '14';

-- 4. Add sample Google Drive images for vendor 14
INSERT INTO vendor_media (
    id,
    vendor_id, 
    media_url, 
    gdrive_file_id,
    original_filename,
    file_size,
    compressed_size,
    compression_ratio,
    media_type, 
    category, 
    title, 
    description, 
    alt_text, 
    order_index, 
    featured, 
    public, 
    is_highlighted,
    upload_status,
    uploaded_at
) VALUES 
-- Highlighted Image 1
(
    gen_random_uuid(),
    '14',
    'https://drive.google.com/uc?id=1ABC123_sample_file_id_1',
    '1ABC123_sample_file_id_1',
    'wedding_ceremony_1.jpg',
    2048000, -- 2MB original
    819200,  -- 800KB compressed
    60.00,   -- 60% compression
    'image',
    'catalog',
    'Beautiful Wedding Ceremony',
    'Outdoor wedding ceremony with floral decorations - uploaded via Google Drive',
    'Wedding ceremony photography',
    1,
    true,
    true,
    true,  -- HIGHLIGHTED
    'completed',
    NOW()
),
-- Highlighted Image 2
(
    gen_random_uuid(),
    '14',
    'https://drive.google.com/uc?id=1DEF456_sample_file_id_2',
    '1DEF456_sample_file_id_2',
    'reception_setup.jpg',
    1843200, -- 1.8MB original
    737280,  -- 720KB compressed
    65.00,   -- 65% compression
    'image',
    'catalog',
    'Elegant Reception Setup',
    'Indoor reception with elegant table settings - uploaded via Google Drive',
    'Reception photography',
    2,
    false,
    true,
    true,  -- HIGHLIGHTED
    'completed',
    NOW()
),
-- Highlighted Image 3
(
    gen_random_uuid(),
    '14',
    'https://drive.google.com/uc?id=1GHI789_sample_file_id_3',
    '1GHI789_sample_file_id_3',
    'decoration_details.jpg',
    1536000, -- 1.5MB original
    614400,  -- 600KB compressed
    70.00,   -- 70% compression
    'image',
    'catalog',
    'Decoration Details',
    'Close-up of beautiful floral arrangements - uploaded via Google Drive',
    'Decoration photography',
    3,
    false,
    true,
    true,  -- HIGHLIGHTED
    'completed',
    NOW()
),
-- Regular (non-highlighted) images
(
    gen_random_uuid(),
    '14',
    'https://drive.google.com/uc?id=1JKL012_sample_file_id_4',
    '1JKL012_sample_file_id_4',
    'portfolio_sample_1.jpg',
    1024000, -- 1MB original
    409600,  -- 400KB compressed
    75.00,   -- 75% compression
    'image',
    'catalog',
    'Portfolio Sample 1',
    'Regular portfolio image - uploaded via Google Drive',
    'Portfolio sample 1',
    4,
    false,
    true,
    false,  -- NOT HIGHLIGHTED
    'completed',
    NOW()
),
(
    gen_random_uuid(),
    '14',
    'https://drive.google.com/uc?id=1MNO345_sample_file_id_5',
    '1MNO345_sample_file_id_5',
    'portfolio_sample_2.jpg',
    896000,  -- 875KB original
    358400,  -- 350KB compressed
    80.00,   -- 80% compression
    'image',
    'catalog',
    'Portfolio Sample 2',
    'Regular portfolio image - uploaded via Google Drive',
    'Portfolio sample 2',
    5,
    false,
    true,
    false,  -- NOT HIGHLIGHTED
    'completed',
    NOW()
);

-- 5. Verify the insertion
SELECT 
    'AFTER INSERTION' as status,
    vendor_id,
    COUNT(*) as total_images,
    COUNT(CASE WHEN is_highlighted = TRUE THEN 1 END) as highlighted_count,
    SUM(file_size) as total_original_size,
    SUM(compressed_size) as total_compressed_size,
    AVG(compression_ratio) as avg_compression_ratio
FROM vendor_media 
WHERE vendor_id::TEXT = '14'
GROUP BY vendor_id;

-- 6. Show the inserted images
SELECT 
    vendor_id,
    title,
    original_filename,
    file_size,
    compressed_size,
    compression_ratio,
    is_highlighted,
    upload_status,
    LEFT(media_url, 50) || '...' as media_url_preview
FROM vendor_media 
WHERE vendor_id::TEXT = '14' AND category = 'catalog'
ORDER BY is_highlighted DESC, order_index ASC;

-- 7. Test the helper function
SELECT * FROM get_vendor_image_stats('14');
