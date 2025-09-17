-- SQL script to create the vendor_events table for calendar functionality
-- This table stores all calendar events, bookings, and availability blocks for vendors

-- Step 1: Drop the table if it already exists to ensure a clean slate
DROP TABLE IF EXISTS vendor_events CASCADE;

-- Step 2: Create the vendor_events table
CREATE TABLE vendor_events (
    id BIGSERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL, -- Foreign key to vendors.vendor_id
    
    -- Event Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location TEXT,
    
    -- Date and Time
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    
    -- Event Type and Status
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'booking', 'blocked', 'personal', 'consultation', 'shoot', 
        'wedding', 'engagement', 'corporate', 'birthday', 'anniversary'
    )),
    status VARCHAR(20) DEFAULT 'tentative' CHECK (status IN (
        'tentative', 'confirmed', 'completed', 'cancelled', 'rescheduled'
    )),
    
    -- Client Information (for bookings)
    client_name VARCHAR(255),
    client_phone VARCHAR(20),
    client_email VARCHAR(255),
    client_whatsapp VARCHAR(20),
    
    -- Booking Details
    lead_id INTEGER, -- Link to vendor_leads table if applicable
    booking_amount DECIMAL(10,2),
    advance_amount DECIMAL(10,2),
    balance_amount DECIMAL(10,2),
    
    -- Recurring Events
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_type VARCHAR(20) CHECK (recurrence_type IN (
        'daily', 'weekly', 'monthly', 'yearly'
    )),
    recurrence_end_date DATE,
    parent_event_id INTEGER, -- For recurring event instances
    
    -- Additional Metadata
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for calendar display
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    reminder_minutes INTEGER DEFAULT 60, -- Minutes before event for reminder
    
    -- Notes and Internal Info
    internal_notes TEXT, -- Private notes for vendor
    client_notes TEXT, -- Notes visible to client
    requirements TEXT, -- Special requirements or equipment needed
    
    -- Tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100), -- Who created the event (vendor/admin)
    
    -- Foreign key constraint to link with the vendors table
    CONSTRAINT fk_vendor_events_vendor_id
        FOREIGN KEY (vendor_id)
        REFERENCES vendors (vendor_id) ON DELETE CASCADE,
        
    -- Foreign key constraint for recurring events
    CONSTRAINT fk_vendor_events_parent
        FOREIGN KEY (parent_event_id)
        REFERENCES vendor_events (id) ON DELETE CASCADE,
        
    -- Ensure end time is after start time
    CONSTRAINT check_event_times
        CHECK (end_datetime > start_datetime)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_events_vendor_id ON vendor_events(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_events_start_datetime ON vendor_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_vendor_events_end_datetime ON vendor_events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_vendor_events_status ON vendor_events(status);
CREATE INDEX IF NOT EXISTS idx_vendor_events_event_type ON vendor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_vendor_events_date_range ON vendor_events(vendor_id, start_datetime, end_datetime);

-- Step 3: Disable RLS for simple access
ALTER TABLE vendor_events DISABLE ROW LEVEL SECURITY;

-- Step 4: Create a trigger function to update 'updated_at' on changes
CREATE OR REPLACE FUNCTION update_vendor_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Attach the trigger to the vendor_events table
CREATE TRIGGER update_vendor_events_updated_at_trigger
BEFORE UPDATE ON vendor_events
FOR EACH ROW EXECUTE FUNCTION update_vendor_events_updated_at();

-- Step 6: Helper Functions

-- Function to check for event conflicts
CREATE OR REPLACE FUNCTION check_event_conflicts(
    p_vendor_id INTEGER,
    p_start_datetime TIMESTAMP WITH TIME ZONE,
    p_end_datetime TIMESTAMP WITH TIME ZONE,
    p_exclude_event_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    conflicting_event_id INTEGER,
    conflicting_title VARCHAR(255),
    conflicting_start TIMESTAMP WITH TIME ZONE,
    conflicting_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id::INTEGER,
        title,
        start_datetime,
        end_datetime
    FROM vendor_events
    WHERE vendor_id = p_vendor_id
    AND status NOT IN ('cancelled', 'completed')
    AND (p_exclude_event_id IS NULL OR id != p_exclude_event_id)
    AND (
        -- New event starts during existing event
        (p_start_datetime >= start_datetime AND p_start_datetime < end_datetime)
        OR 
        -- New event ends during existing event
        (p_end_datetime > start_datetime AND p_end_datetime <= end_datetime)
        OR 
        -- New event completely contains existing event
        (p_start_datetime <= start_datetime AND p_end_datetime >= end_datetime)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor events for a date range
CREATE OR REPLACE FUNCTION get_vendor_events_range(
    p_vendor_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS SETOF vendor_events AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM vendor_events
    WHERE vendor_id = p_vendor_id
    AND start_datetime::DATE BETWEEN p_start_date AND p_end_date
    ORDER BY start_datetime ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor availability for a specific date
CREATE OR REPLACE FUNCTION get_vendor_availability(
    p_vendor_id INTEGER,
    p_date DATE
)
RETURNS TABLE (
    is_available BOOLEAN,
    blocked_slots JSONB,
    booked_slots JSONB
) AS $$
DECLARE
    blocked_events JSONB;
    booked_events JSONB;
    has_availability BOOLEAN;
BEGIN
    -- Get blocked time slots
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'start', start_datetime,
            'end', end_datetime,
            'reason', title
        )
    ), '[]'::jsonb)
    INTO blocked_events
    FROM vendor_events
    WHERE vendor_id = p_vendor_id
    AND start_datetime::DATE = p_date
    AND event_type = 'blocked'
    AND status NOT IN ('cancelled');

    -- Get booked time slots
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'start', start_datetime,
            'end', end_datetime,
            'title', title,
            'client', client_name,
            'status', status
        )
    ), '[]'::jsonb)
    INTO booked_events
    FROM vendor_events
    WHERE vendor_id = p_vendor_id
    AND start_datetime::DATE = p_date
    AND event_type != 'blocked'
    AND status NOT IN ('cancelled');

    -- Determine if vendor has any availability (not completely blocked)
    SELECT NOT EXISTS (
        SELECT 1 FROM vendor_events
        WHERE vendor_id = p_vendor_id
        AND start_datetime::DATE = p_date
        AND event_type = 'blocked'
        AND all_day = TRUE
        AND status NOT IN ('cancelled')
    ) INTO has_availability;

    RETURN QUERY SELECT has_availability, blocked_events, booked_events;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Insert sample data for testing (adjust vendor_id as needed)
INSERT INTO vendor_events (
    vendor_id, title, description, start_datetime, end_datetime,
    event_type, status, client_name, client_phone, color, priority
) VALUES 
    (1, 'Priya & Arjun Wedding', 'Full day wedding photography', 
     '2024-02-15 06:00:00+05:30', '2024-02-15 22:00:00+05:30',
     'wedding', 'confirmed', 'Priya Sharma', '+91 98765 43210', '#10B981', 'high'),
     
    (1, 'Engagement Shoot', 'Pre-wedding engagement photography', 
     '2024-02-18 16:00:00+05:30', '2024-02-18 19:00:00+05:30',
     'engagement', 'confirmed', 'Sneha & Raj', '+91 98765 43211', '#F59E0B', 'medium'),
     
    (1, 'Personal Leave', 'Family vacation - Not available', 
     '2024-02-20 00:00:00+05:30', '2024-02-22 23:59:59+05:30',
     'blocked', 'confirmed', NULL, NULL, '#EF4444', 'high'),
     
    (1, 'Corporate Event', 'Company annual day photography', 
     '2024-02-25 09:00:00+05:30', '2024-02-25 17:00:00+05:30',
     'corporate', 'tentative', 'Tech Corp', '+91 98765 43212', '#8B5CF6', 'medium'),
     
    (1, 'Birthday Party', 'Kids birthday celebration', 
     '2024-02-28 15:00:00+05:30', '2024-02-28 20:00:00+05:30',
     'birthday', 'confirmed', 'Rahul Kumar', '+91 98765 43213', '#EC4899', 'low');

-- Verify the table creation
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public' AND table_name = 'vendor_events'
ORDER BY
    ordinal_position;
