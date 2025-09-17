-- Test script to verify approval workflow functionality

-- Check if vendor_profile_changes table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'vendor_profile_changes' 
ORDER BY ordinal_position;

-- Check current pending changes
SELECT 
    id,
    vendor_id,
    change_type,
    status,
    submitted_at,
    reviewed_by,
    reviewed_at
FROM vendor_profile_changes 
WHERE status = 'pending'
ORDER BY submitted_at DESC;

-- Check if vendors table has all necessary fields
SELECT 
    vendor_id,
    brand_name,
    category,
    verified,
    currently_available,
    updated_at
FROM vendors 
LIMIT 5;

-- Test data - Insert a sample vendor profile change request (for testing)
INSERT INTO vendor_profile_changes (
    vendor_id,
    change_type,
    current_data,
    proposed_changes,
    status,
    submitted_at
) VALUES (
    1, -- Assuming vendor with ID 1 exists
    'profile_update',
    '{"brand_name": "Old Brand Name", "category": "photography", "description": "Old description"}',
    '{"brand_name": "New Brand Name", "category": "photography", "description": "Updated description with new details"}',
    'pending',
    NOW()
) ON CONFLICT DO NOTHING;

-- Verify the test data was inserted
SELECT 
    id,
    vendor_id,
    change_type,
    current_data,
    proposed_changes,
    status,
    submitted_at
FROM vendor_profile_changes 
WHERE status = 'pending'
ORDER BY id DESC
LIMIT 1;
