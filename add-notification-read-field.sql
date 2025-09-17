-- Add notification_read field to vendor_profile_changes table if it doesn't exist
-- This field tracks whether a vendor has seen/read their profile change notifications

DO $$
BEGIN
    -- Check if the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vendor_profile_changes' 
        AND column_name = 'notification_read'
        AND table_schema = 'public'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE vendor_profile_changes 
        ADD COLUMN notification_read BOOLEAN DEFAULT FALSE;
        
        -- Update existing records to be unread by default
        UPDATE vendor_profile_changes 
        SET notification_read = FALSE 
        WHERE notification_read IS NULL;
        
        -- Add a comment to document the field
        COMMENT ON COLUMN vendor_profile_changes.notification_read IS 'Tracks whether the vendor has read this notification';
        
        RAISE NOTICE 'Added notification_read column to vendor_profile_changes table';
    ELSE
        RAISE NOTICE 'notification_read column already exists in vendor_profile_changes table';
    END IF;
END $$;

-- Create an index for better performance when filtering by notification_read
CREATE INDEX IF NOT EXISTS idx_vendor_profile_changes_notification_read 
ON vendor_profile_changes(vendor_id, notification_read) 
WHERE status IN ('approved', 'rejected');

COMMENT ON INDEX idx_vendor_profile_changes_notification_read IS 'Index for efficiently querying unread notifications by vendor';
