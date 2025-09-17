-- Create vendor_media table for managing vendor catalog images and other media
CREATE TABLE IF NOT EXISTS vendor_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('catalog', 'highlights', 'portfolio', 'gallery', 'avatar', 'cover')),
  title TEXT,
  description TEXT,
  alt_text TEXT,
  order_index INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  public BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_media_vendor_id ON vendor_media(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_media_category ON vendor_media(category);
CREATE INDEX IF NOT EXISTS idx_vendor_media_public ON vendor_media(public);
CREATE INDEX IF NOT EXISTS idx_vendor_media_order ON vendor_media(vendor_id, category, order_index);

-- Add foreign key constraint if vendors table exists
-- Note: This assumes your vendors table uses 'vendor_id' as the primary key
-- Adjust the column name if your vendors table uses a different primary key column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'vendors' 
        AND table_schema = 'public'
    ) THEN
        -- Check if the foreign key doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_vendor_media_vendor_id'
            AND table_name = 'vendor_media'
        ) THEN
            ALTER TABLE vendor_media 
            ADD CONSTRAINT fk_vendor_media_vendor_id 
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE vendor_media ENABLE ROW LEVEL SECURITY;

-- Sample policy for public read access
-- CREATE POLICY "Public can view public vendor media" ON vendor_media
--     FOR SELECT USING (public = true);

-- Sample policy for vendors to manage their own media
-- CREATE POLICY "Vendors can manage their own media" ON vendor_media
--     FOR ALL USING (auth.uid()::text = vendor_id);

COMMENT ON TABLE vendor_media IS 'Stores media files (images/videos) for vendors including catalog images, portfolio, gallery, etc.';
COMMENT ON COLUMN vendor_media.vendor_id IS 'Reference to the vendor who owns this media';
COMMENT ON COLUMN vendor_media.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN vendor_media.category IS 'Category of media: catalog, highlights, portfolio, gallery, avatar, cover';
COMMENT ON COLUMN vendor_media.order_index IS 'Order of display within the category';
COMMENT ON COLUMN vendor_media.featured IS 'Whether this media is featured/highlighted';
COMMENT ON COLUMN vendor_media.public IS 'Whether this media is publicly visible';
