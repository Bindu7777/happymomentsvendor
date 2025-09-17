-- SQL script to delete and recreate vendor_leads table
-- Run this script in your Supabase SQL editor

-- Step 1: Drop existing table if it exists
DROP TABLE IF EXISTS vendor_leads CASCADE;

-- Step 2: Create fresh vendor_leads table with updated structure
CREATE TABLE vendor_leads (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,  -- Now mandatory
    customer_whatsapp VARCHAR(20),
    customer_address TEXT,
    
    -- Event Information (simplified - no guest_count, no event_duration)
    event_type VARCHAR(100), -- Optional - Wedding, Birthday, Corporate, Anniversary, etc.
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
        'customer_decision_pending', 'confirmed_booking', 'advance_received', 'completed', 'lost'
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
    deal_amount DECIMAL(10,2), -- Deal price when confirmed
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

-- Step 3: Create indexes for better performance
CREATE INDEX idx_vendor_leads_vendor_id ON vendor_leads(vendor_id);
CREATE INDEX idx_vendor_leads_status ON vendor_leads(status);
CREATE INDEX idx_vendor_leads_event_date ON vendor_leads(event_date);
CREATE INDEX idx_vendor_leads_follow_up_date ON vendor_leads(next_follow_up_date);
CREATE INDEX idx_vendor_leads_created_at ON vendor_leads(created_at);
CREATE INDEX idx_vendor_leads_priority ON vendor_leads(priority);
CREATE INDEX idx_vendor_leads_lead_source ON vendor_leads(lead_source);

-- Step 4: Disable RLS for simple access
ALTER TABLE vendor_leads DISABLE ROW LEVEL SECURITY;

-- Step 5: Insert fresh sample leads for testing (adjust vendor_id as needed)
INSERT INTO vendor_leads (
    vendor_id, customer_name, customer_phone, customer_whatsapp,
    event_type, event_date, event_date_flexibility, budget_range,
    status, priority, initial_notes, lead_source, event_venue
) VALUES 
    (1, 'Priya & Arjun Wedding', '+91 98765 43210', '+91 98765 43210', 
     'Wedding', '2024-02-15', NULL, '50k_1l',
     'customer_decision_pending', 'high', 'Sent detailed proposal with 3 packages. Waiting for their decision.', 'website', 'Taj Krishna Hotel'),
     
    (1, 'Sneha Corp Event', '+91 98765 43211', '+91 98765 43211', 
     'Corporate Event', '2024-01-20', NULL, '1l_2l',
     'negotiation', 'medium', 'Annual company celebration event', 'referral', 'Hitex Convention Center'),
     
    (1, 'Rahul Birthday Party', '+91 98765 43212', '+91 98765 43212', 
     'Birthday Party', NULL, 'next_month', '25k_50k',
     'new_lead', 'low', 'Kids birthday party with theme decoration', 'social_media', 'Home'),
     
    (1, 'Anita Anniversary', '+91 98765 43213', '+91 98765 43213', 
     'Anniversary', NULL, 'next_3_months', '50k_1l',
     'proposal_sent', 'medium', 'Sent proposal for anniversary photography package', 'website', 'Park Hyatt'),
     
    (1, 'Tech Corp Launch', '+91 98765 43214', '+91 98765 43214', 
     'Corporate Event', '2024-02-28', NULL, '2l_5l',
     'advance_received', 'urgent', 'Advance payment received. Event confirmed. Preparing equipment.', 'offline', 'HICC Hyderabad'),
     
    (1, 'Meera Engagement', '+91 98765 43215', '+91 98765 43215', 
     'Engagement', NULL, 'next_6_months', '25k_50k',
     'customer_decision_pending', 'medium', 'Customer comparing with 2 other photographers. Sent competitive quote.', 'website', 'Leonia Resort'),
     
    (1, 'Suresh Wedding', '+91 98765 43216', '+91 98765 43216', 
     'Wedding', '2024-03-10', NULL, '1l_2l',
     'confirmed_booking', 'high', 'Booking confirmed. Waiting for advance payment.', 'referral', 'Ramoji Film City');

-- Step 6: Create helper functions
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

-- Step 7: Verify the table creation and sample data
SELECT 
    id,
    vendor_id,
    customer_name,
    event_type,
    event_date,
    event_date_flexibility,
    budget_range,
    status,
    priority,
    event_venue
FROM vendor_leads 
ORDER BY created_at DESC;

-- Step 8: Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendor_leads' 
ORDER BY ordinal_position;
