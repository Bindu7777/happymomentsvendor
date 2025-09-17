-- SQL script to create vendor CRM leads management table
-- Run this script in your Supabase SQL editor

-- Create vendor_leads table for CRM management
CREATE TABLE IF NOT EXISTS vendor_leads (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    customer_whatsapp VARCHAR(20),
    customer_address TEXT,
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL, -- Wedding, Birthday, Corporate, Anniversary, etc.
    event_date DATE,
    event_date_flexibility VARCHAR(50), -- next_month, next_3_months, next_6_months, next_year, flexible
    event_venue TEXT,
    
    -- Lead Details
    lead_source VARCHAR(100) DEFAULT 'website', -- website, referral, social_media, offline, etc.
    budget_range VARCHAR(50), -- under_25k, 25k_50k, 50k_1l, 1l_2l, 2l_5l, above_5l, custom
    budget_min DECIMAL(10,2), -- Keep for custom ranges
    budget_max DECIMAL(10,2), -- Keep for custom ranges
    budget_currency VARCHAR(10) DEFAULT 'INR',
    
    -- Pipeline Management
    status VARCHAR(50) DEFAULT 'new_lead' CHECK (status IN (
        'new_lead', 'contacted', 'negotiation', 'proposal_sent', 
        'confirmed_booking', 'completed', 'lost'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Communication & Notes
    initial_notes TEXT,
    follow_up_notes TEXT,
    admin_notes TEXT, -- Internal notes not visible to customer
    
    -- Follow-up Management
    next_follow_up_date DATE,
    follow_up_reminder_sent BOOLEAN DEFAULT FALSE,
    last_contact_date DATE,
    contact_count INTEGER DEFAULT 0,
    
    -- Conversion Tracking
    converted_to_booking BOOLEAN DEFAULT FALSE,
    conversion_date DATE,
    final_booking_amount DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    
    -- Lost Lead Analysis
    lost_reason VARCHAR(255), -- budget, timing, competitor, no_response, etc.
    competitor_name VARCHAR(255),
    
    -- Additional Metadata
    lead_tags JSONB DEFAULT '[]'::jsonb, -- Custom tags for categorization
    custom_fields JSONB DEFAULT '{}'::jsonb, -- Flexible additional fields
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to vendors table
    CONSTRAINT fk_vendor_leads_vendor_id 
        FOREIGN KEY (vendor_id) 
        REFERENCES vendors(vendor_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_leads_vendor_id ON vendor_leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_status ON vendor_leads(status);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_event_date ON vendor_leads(event_date);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_follow_up_date ON vendor_leads(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_created_at ON vendor_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_priority ON vendor_leads(priority);
CREATE INDEX IF NOT EXISTS idx_vendor_leads_lead_source ON vendor_leads(lead_source);

-- Disable RLS for simple access
ALTER TABLE vendor_leads DISABLE ROW LEVEL SECURITY;

-- Function to update lead status
CREATE OR REPLACE FUNCTION update_lead_status(
    p_lead_id INTEGER,
    p_new_status VARCHAR,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE vendor_leads 
    SET 
        status = p_new_status,
        follow_up_notes = COALESCE(p_notes, follow_up_notes),
        updated_at = CURRENT_TIMESTAMP,
        last_contact_date = CASE 
            WHEN p_new_status = 'contacted' THEN CURRENT_DATE
            ELSE last_contact_date
        END,
        contact_count = CASE 
            WHEN p_new_status = 'contacted' THEN contact_count + 1
            ELSE contact_count
        END,
        converted_to_booking = CASE 
            WHEN p_new_status = 'confirmed_booking' THEN TRUE
            ELSE converted_to_booking
        END,
        conversion_date = CASE 
            WHEN p_new_status = 'confirmed_booking' THEN CURRENT_DATE
            ELSE conversion_date
        END
    WHERE id = p_lead_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get lead statistics for a vendor
CREATE OR REPLACE FUNCTION get_vendor_lead_stats(p_vendor_id INTEGER)
RETURNS TABLE(
    total_leads BIGINT,
    new_leads BIGINT,
    contacted_leads BIGINT,
    negotiation_leads BIGINT,
    proposal_sent_leads BIGINT,
    confirmed_bookings BIGINT,
    completed_leads BIGINT,
    lost_leads BIGINT,
    conversion_rate DECIMAL,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status = 'new_lead') as new_leads,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
        COUNT(*) FILTER (WHERE status = 'negotiation') as negotiation_leads,
        COUNT(*) FILTER (WHERE status = 'proposal_sent') as proposal_sent_leads,
        COUNT(*) FILTER (WHERE status = 'confirmed_booking') as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_leads,
        COUNT(*) FILTER (WHERE status = 'lost') as lost_leads,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE converted_to_booking = TRUE))::DECIMAL / COUNT(*) * 100, 2)
            ELSE 0
        END as conversion_rate,
        COALESCE(SUM(final_booking_amount) FILTER (WHERE status = 'completed'), 0) as total_revenue
    FROM vendor_leads 
    WHERE vendor_id = p_vendor_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample leads for testing (adjust vendor_id as needed)
INSERT INTO vendor_leads (
    vendor_id, customer_name, customer_phone, customer_whatsapp,
    event_type, event_date, event_date_flexibility, budget_range,
    status, priority, initial_notes, lead_source
) VALUES 
    (1, 'Priya & Arjun Wedding', '+91 98765 43210', '+91 98765 43210', 
     'Wedding', '2024-02-15', NULL, '50k_1l',
     'proposal_sent', 'high', 'Beautiful couple looking for traditional + candid photography', 'website'),
     
    (1, 'Sneha Corp Event', '+91 98765 43211', '+91 98765 43211', 
     'Corporate Event', '2024-01-20', NULL, '1l_2l',
     'negotiation', 'medium', 'Annual company celebration event', 'referral'),
     
    (1, 'Rahul Birthday Party', '+91 98765 43212', '+91 98765 43212', 
     'Birthday Party', NULL, 'next_month', '25k_50k',
     'new_lead', 'low', 'Kids birthday party with theme decoration', 'social_media'),
     
    (1, 'Anita Anniversary', '+91 98765 43213', '+91 98765 43213', 
     'Anniversary', NULL, 'next_3_months', '50k_1l',
     'contacted', 'medium', '25th wedding anniversary celebration', 'website'),
     
    (1, 'Tech Corp Launch', '+91 98765 43214', '+91 98765 43214', 
     'Corporate Event', '2024-02-28', NULL, '2l_5l',
     'confirmed_booking', 'urgent', 'Product launch event with media coverage', 'offline');

-- Function to get leads for a specific vendor with filtering
CREATE OR REPLACE FUNCTION get_vendor_leads(
    p_vendor_id INTEGER,
    p_status VARCHAR DEFAULT NULL,
    p_priority VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id INTEGER,
    customer_name VARCHAR,
    customer_phone VARCHAR,
    customer_email VARCHAR,
    event_type VARCHAR,
    event_date DATE,
    guest_count INTEGER,
    budget_min DECIMAL,
    budget_max DECIMAL,
    status VARCHAR,
    priority VARCHAR,
    next_follow_up_date DATE,
    last_contact_date DATE,
    days_since_contact INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vl.id,
        vl.customer_name,
        vl.customer_phone,
        vl.customer_email,
        vl.event_type,
        vl.event_date,
        vl.guest_count,
        vl.budget_min,
        vl.budget_max,
        vl.status,
        vl.priority,
        vl.next_follow_up_date,
        vl.last_contact_date,
        COALESCE(EXTRACT(DAY FROM (CURRENT_DATE - vl.last_contact_date))::INTEGER, 
                EXTRACT(DAY FROM (CURRENT_DATE - vl.created_at::DATE))::INTEGER) as days_since_contact,
        vl.created_at
    FROM vendor_leads vl
    WHERE vl.vendor_id = p_vendor_id
    AND (p_status IS NULL OR vl.status = p_status)
    AND (p_priority IS NULL OR vl.priority = p_priority)
    ORDER BY vl.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Verify the table creation and sample data
SELECT 
    id,
    vendor_id,
    customer_name,
    event_type,
    event_date,
    status,
    priority,
    budget_min,
    budget_max
FROM vendor_leads 
ORDER BY created_at DESC 
LIMIT 10;
