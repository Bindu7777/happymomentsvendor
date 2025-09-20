-- SQL script to implement centralized Google Drive image storage
-- This adds necessary columns and constraints for the new image storage system

-- 1. Add Google Drive metadata columns to vendor_media table
ALTER TABLE vendor_media 
ADD COLUMN IF NOT EXISTS gdrive_file_id TEXT,
ADD COLUMN IF NOT EXISTS original_filename TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS compressed_size INTEGER,
ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'completed' CHECK (upload_status IN ('pending', 'processing', 'uploading', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS compression_ratio DECIMAL(5,2);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_media_gdrive_file_id ON vendor_media (gdrive_file_id);
CREATE INDEX IF NOT EXISTS idx_vendor_media_upload_status ON vendor_media (upload_status);
CREATE INDEX IF NOT EXISTS idx_vendor_media_vendor_category ON vendor_media (vendor_id, category, public);

-- 3. Create function to enforce 13 images per vendor limit
CREATE OR REPLACE FUNCTION enforce_vendor_image_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Count total images for this vendor (handle both text and integer vendor_id types)
    IF (SELECT COUNT(*) 
        FROM vendor_media 
        WHERE vendor_id::TEXT = NEW.vendor_id::TEXT 
          AND upload_status = 'completed'
    ) >= 13 THEN
        RAISE EXCEPTION 'Vendor cannot have more than 13 images total. Current limit: 13 images per vendor.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to enforce image limit
DROP TRIGGER IF EXISTS trigger_vendor_image_limit ON vendor_media;
CREATE TRIGGER trigger_vendor_image_limit
    BEFORE INSERT ON vendor_media
    FOR EACH ROW
    EXECUTE FUNCTION enforce_vendor_image_limit();

-- 5. Update existing highlighted images constraint to work with new system
DROP FUNCTION IF EXISTS enforce_max_highlighted_images() CASCADE;
CREATE OR REPLACE FUNCTION enforce_max_highlighted_images()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if we're setting is_highlighted to TRUE for catalog images
    IF NEW.is_highlighted = TRUE AND NEW.category = 'catalog' AND NEW.upload_status = 'completed' THEN
        -- Count current highlighted images for this vendor (excluding the current record if updating)
        IF (SELECT COUNT(*) 
            FROM vendor_media 
            WHERE vendor_id::TEXT = NEW.vendor_id::TEXT 
              AND category = 'catalog' 
              AND is_highlighted = TRUE
              AND upload_status = 'completed'
              AND (TG_OP = 'INSERT' OR id != NEW.id)
           ) >= 3 THEN
            RAISE EXCEPTION 'Cannot highlight more than 3 catalog images per vendor. Please unhighlight another image first.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger for highlighted images
CREATE TRIGGER trigger_max_highlighted_images
    BEFORE INSERT OR UPDATE ON vendor_media
    FOR EACH ROW
    EXECUTE FUNCTION enforce_max_highlighted_images();

-- 6. Create function to get vendor image statistics
CREATE OR REPLACE FUNCTION get_vendor_image_stats(p_vendor_id TEXT)
RETURNS TABLE (
    total_images INTEGER,
    catalog_images INTEGER,
    highlighted_images INTEGER,
    remaining_slots INTEGER,
    total_file_size BIGINT,
    avg_compression_ratio DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        COUNT(CASE WHEN vm.category = 'catalog' THEN 1 END)::INTEGER as catalog_images,
        COUNT(CASE WHEN vm.category = 'catalog' AND vm.is_highlighted = TRUE THEN 1 END)::INTEGER as highlighted_images,
        (13 - COUNT(*))::INTEGER as remaining_slots,
        COALESCE(SUM(vm.compressed_size), 0)::BIGINT as total_file_size,
        COALESCE(AVG(vm.compression_ratio), 0)::DECIMAL(5,2) as avg_compression_ratio
    FROM vendor_media vm
    WHERE vm.vendor_id::TEXT = p_vendor_id 
      AND vm.upload_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to cleanup failed uploads (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_failed_uploads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete records with failed or pending status older than 1 hour
    DELETE FROM vendor_media 
    WHERE upload_status IN ('failed', 'pending', 'processing', 'uploading')
      AND uploaded_at < (NOW() - INTERVAL '1 hour');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % failed upload records', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Sample data insertion is now in a separate script: setup-sample-google-drive-images.sql
-- This keeps the main implementation script clean and conflict-free

-- 9. Test the new functions
SELECT * FROM get_vendor_image_stats('14');

-- 10. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'vendor_media'
  AND column_name IN ('gdrive_file_id', 'original_filename', 'file_size', 'compressed_size', 'upload_status', 'compression_ratio', 'is_highlighted')
ORDER BY ordinal_position;

-- 11. Show current vendor media with new fields
SELECT 
    vendor_id,
    category,
    title,
    original_filename,
    file_size,
    compressed_size,
    compression_ratio,
    is_highlighted,
    upload_status,
    media_url
FROM vendor_media 
WHERE vendor_id::TEXT = '14'
ORDER BY category, order_index;
