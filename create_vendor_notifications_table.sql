-- Create vendor notifications table
CREATE TABLE IF NOT EXISTS vendor_notifications (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    customer_id INTEGER,
    notification_type VARCHAR(50) NOT NULL, -- 'profile_view', 'contact', 'status_change', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_vendor_notifications_vendor_id 
        FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    CONSTRAINT fk_vendor_notifications_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_vendor_notifications_vendor_id ON vendor_notifications (vendor_id);
CREATE INDEX idx_vendor_notifications_is_read ON vendor_notifications (is_read);
CREATE INDEX idx_vendor_notifications_created_at ON vendor_notifications (created_at DESC);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendor_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_vendor_notifications_updated_at
    BEFORE UPDATE ON vendor_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_notifications_updated_at();

-- Add comment to the table
COMMENT ON TABLE vendor_notifications IS 'Stores notifications for vendors about customer interactions and system events';
COMMENT ON COLUMN vendor_notifications.notification_type IS 'Type of notification: profile_view, contact, status_change, etc.';
COMMENT ON COLUMN vendor_notifications.title IS 'Short title for the notification';
COMMENT ON COLUMN vendor_notifications.message IS 'Detailed message content';
COMMENT ON COLUMN vendor_notifications.is_read IS 'Whether the vendor has read this notification';
