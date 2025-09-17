-- SQL script to create vendor_credentials table
-- Run this script in your Supabase SQL editor

-- First, let's check the data type of vendor_id in vendors table
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'vendor_id';

-- Create vendor_credentials table with matching data types
CREATE TABLE IF NOT EXISTS vendor_credentials (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL UNIQUE,  -- Matching INTEGER type with vendors table
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Foreign key constraint to vendors table
    CONSTRAINT fk_vendor_credentials_vendor_id 
        FOREIGN KEY (vendor_id) 
        REFERENCES vendors(vendor_id) 
        ON DELETE CASCADE
);

-- If the above fails due to data type mismatch, try this alternative:
-- First check what type vendor_id actually is in vendors table:
-- \d vendors;

-- Alternative approach - Create without foreign key first, then add it
-- CREATE TABLE IF NOT EXISTS vendor_credentials (
--     id SERIAL PRIMARY KEY,
--     vendor_id TEXT NOT NULL UNIQUE,  -- Use TEXT if vendors.vendor_id is TEXT/VARCHAR
--     username VARCHAR(100) NOT NULL UNIQUE,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     last_login TIMESTAMP WITH TIME ZONE,
--     is_active BOOLEAN DEFAULT TRUE
-- );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_credentials_vendor_id ON vendor_credentials(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_credentials_username ON vendor_credentials(username);
CREATE INDEX IF NOT EXISTS idx_vendor_credentials_active ON vendor_credentials(is_active);

-- Disable RLS for simple authentication
ALTER TABLE vendor_credentials DISABLE ROW LEVEL SECURITY;

-- Check what vendor_ids exist in your vendors table
SELECT vendor_id, brand_name, category FROM vendors ORDER BY vendor_id;

-- MANUAL CREDENTIAL MANAGEMENT:
-- You will manually add username and password for each vendor
-- Each vendor_id will have their own unique credentials

-- EXAMPLE: Add credentials for HMP002 user
-- Replace [VENDOR_ID] with the actual vendor_id from your vendors table
-- INSERT INTO vendor_credentials (vendor_id, username, password) 
-- VALUES 
--     ([VENDOR_ID], 'HMP002', 'HMP002@777');

-- EXAMPLE: Add credentials for other vendors
-- INSERT INTO vendor_credentials (vendor_id, username, password) VALUES
--     (1, 'HMP001', 'HMP001@123'),
--     (2, 'HMP002', 'HMP002@777'),
--     (3, 'HMP003', 'HMP003@999');

-- HOW TO ADD NEW VENDOR CREDENTIALS:
-- 1. Find vendor_id from vendors table
-- 2. Choose unique username (like HMP003, HMP004, etc.)
-- 3. Set password (like HMP003@123, HMP004@456, etc.)
-- 4. Insert into vendor_credentials table

-- TEMPLATE FOR ADDING NEW CREDENTIALS:
-- INSERT INTO vendor_credentials (vendor_id, username, password) 
-- VALUES ([VENDOR_ID], '[USERNAME]', '[PASSWORD]');

-- The system will automatically:
-- 1. Match username/password in vendor_credentials table
-- 2. Get the linked vendor_id
-- 3. Fetch complete vendor data from vendors table
-- 4. Display that vendor's dashboard with their specific data

-- Function to update last login
CREATE OR REPLACE FUNCTION update_vendor_last_login(p_vendor_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE vendor_credentials 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE vendor_id = p_vendor_id;
END;
$$ LANGUAGE plpgsql;

-- Verify the table creation and data
SELECT 
    vc.vendor_id,
    vc.username,
    v.brand_name,
    v.category
FROM vendor_credentials vc
JOIN vendors v ON vc.vendor_id = v.vendor_id
LIMIT 5;
