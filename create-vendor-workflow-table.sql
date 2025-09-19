-- SQL script to create vendor profile change workflow table
-- Run this script in your Supabase SQL editor

-- Create vendor_profile_changes table for approval workflow
CREATE TABLE IF NOT EXISTS vendor_profile_changes (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'profile_update', 'new_profile', 'media_upload', etc.
    
    -- Store the proposed changes as JSON
    current_data JSONB,  -- Current vendor data (before changes)
    proposed_changes JSONB,  -- New/updated data submitted by vendor
    
    -- Workflow status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Admin details
    reviewed_by VARCHAR(100),  -- Admin username who reviewed
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_comments TEXT,  -- Reason for approval/rejection
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to vendors table
    CONSTRAINT fk_vendor_profile_changes_vendor_id 
        FOREIGN KEY (vendor_id) 
        REFERENCES vendors(vendor_id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_profile_changes_vendor_id ON vendor_profile_changes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profile_changes_status ON vendor_profile_changes(status);
CREATE INDEX IF NOT EXISTS idx_vendor_profile_changes_submitted_at ON vendor_profile_changes(submitted_at);
CREATE INDEX IF NOT EXISTS idx_vendor_profile_changes_type ON vendor_profile_changes(change_type);

-- Disable RLS for simple access
ALTER TABLE vendor_profile_changes DISABLE ROW LEVEL SECURITY;

-- Function to submit vendor profile changes
CREATE OR REPLACE FUNCTION submit_vendor_profile_change(
    p_vendor_id INTEGER,
    p_change_type VARCHAR,
    p_current_data JSONB,
    p_proposed_changes JSONB
)
RETURNS INTEGER AS $$
DECLARE
    change_id INTEGER;
BEGIN
    INSERT INTO vendor_profile_changes (
        vendor_id, 
        change_type, 
        current_data, 
        proposed_changes,
        status
    ) VALUES (
        p_vendor_id,
        p_change_type,
        p_current_data,
        p_proposed_changes,
        'pending'
    ) RETURNING id INTO change_id;
    
    RETURN change_id;
END;
$$ LANGUAGE plpgsql;

-- Function to approve/reject changes
CREATE OR REPLACE FUNCTION review_vendor_profile_change(
    p_change_id INTEGER,
    p_status VARCHAR,
    p_admin_username VARCHAR,
    p_admin_comments TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    change_record RECORD;
BEGIN
    -- Validate status
    IF p_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
    END IF;
    
    -- Get the change record
    SELECT * INTO change_record 
    FROM vendor_profile_changes 
    WHERE id = p_change_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Change request not found or already processed.';
    END IF;
    
    -- Update the change record
    UPDATE vendor_profile_changes 
    SET 
        status = p_status,
        reviewed_by = p_admin_username,
        reviewed_at = CURRENT_TIMESTAMP,
        admin_comments = p_admin_comments,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_change_id;
    
    -- If approved, apply the changes to the vendors table
    IF p_status = 'approved' THEN
        -- Update vendors table with approved changes
        UPDATE vendors 
        SET 
            brand_name = COALESCE((change_record.proposed_changes->>'brand_name')::TEXT, brand_name),
            spoc_name = COALESCE((change_record.proposed_changes->>'spoc_name')::TEXT, spoc_name),
            category = COALESCE((change_record.proposed_changes->>'category')::TEXT, category),
            subcategory = COALESCE((change_record.proposed_changes->>'subcategory')::TEXT, subcategory),
            phone_number = COALESCE((change_record.proposed_changes->>'phone_number')::TEXT, phone_number),
            whatsapp_number = COALESCE((change_record.proposed_changes->>'whatsapp_number')::TEXT, whatsapp_number),
            email = COALESCE((change_record.proposed_changes->>'email')::TEXT, email),
            instagram = COALESCE((change_record.proposed_changes->>'instagram')::TEXT, instagram),
            address = COALESCE((change_record.proposed_changes->>'address')::TEXT, address),
            description = COALESCE((change_record.proposed_changes->>'description')::TEXT, description),
            experience = COALESCE((change_record.proposed_changes->>'experience')::TEXT, experience),
            quick_intro = COALESCE((change_record.proposed_changes->>'quick_intro')::TEXT, quick_intro),
            caption = COALESCE((change_record.proposed_changes->>'caption')::TEXT, caption),
            detailed_intro = COALESCE((change_record.proposed_changes->>'detailed_intro')::TEXT, detailed_intro),
            avatar_url = COALESCE((change_record.proposed_changes->>'avatar_url')::TEXT, avatar_url),
            cover_image_url = COALESCE((change_record.proposed_changes->>'cover_image_url')::TEXT, cover_image_url),
            brand_logo_url = COALESCE((change_record.proposed_changes->>'brand_logo_url')::TEXT, brand_logo_url),
            contact_person_image_url = COALESCE((change_record.proposed_changes->>'contact_person_image_url')::TEXT, contact_person_image_url),
            specialties = COALESCE((change_record.proposed_changes->>'specialties')::JSONB, specialties),
            services = COALESCE((change_record.proposed_changes->>'services')::JSONB, services),
            packages = COALESCE((change_record.proposed_changes->>'packages')::JSONB, packages),
            deliverables = COALESCE((change_record.proposed_changes->>'deliverables')::JSONB, deliverables),
            customer_reviews = COALESCE((change_record.proposed_changes->>'customer_reviews')::JSONB, customer_reviews),
            booking_policies = COALESCE((change_record.proposed_changes->>'booking_policies')::JSONB, booking_policies),
            additional_info = COALESCE((change_record.proposed_changes->>'additional_info')::JSONB, additional_info),
            currently_available = COALESCE((change_record.proposed_changes->>'currently_available')::BOOLEAN, currently_available),
            updated_at = CURRENT_TIMESTAMP
        WHERE vendor_id = change_record.vendor_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending changes for admin review
CREATE OR REPLACE FUNCTION get_pending_vendor_changes()
RETURNS TABLE(
    change_id INTEGER,
    vendor_id INTEGER,
    vendor_name TEXT,
    change_type TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    days_pending INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vpc.id as change_id,
        vpc.vendor_id,
        v.brand_name as vendor_name,
        vpc.change_type,
        vpc.submitted_at,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - vpc.submitted_at))::INTEGER as days_pending
    FROM vendor_profile_changes vpc
    JOIN vendors v ON vpc.vendor_id = v.vendor_id
    WHERE vpc.status = 'pending'
    ORDER BY vpc.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Verify the table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vendor_profile_changes' 
ORDER BY ordinal_position;
