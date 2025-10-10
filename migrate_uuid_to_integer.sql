-- Migration script to convert UUID primary keys to auto-increment integers
-- Run this script in your Supabase SQL editor

-- ==============================================
-- STEP 1: Backup existing data (optional but recommended)
-- ==============================================

-- Create backup tables
CREATE TABLE IF NOT EXISTS user_profiles_backup AS SELECT * FROM user_profiles;
CREATE TABLE IF NOT EXISTS vendor_media_backup AS SELECT * FROM vendor_media;

-- ==============================================
-- STEP 2: Update user_profiles table
-- ==============================================

-- First, drop the foreign key constraint from auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Add a new integer id column
ALTER TABLE user_profiles ADD COLUMN new_id SERIAL;

-- Update the new_id to have the same order as the original UUID id
-- This creates a mapping between old UUID and new integer
CREATE TEMP TABLE user_id_mapping AS 
SELECT id as old_uuid, new_id as new_integer 
FROM user_profiles 
ORDER BY created_at;

-- Drop the old UUID primary key and constraints
ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_pkey;
ALTER TABLE user_profiles DROP COLUMN id;

-- Rename the new column to id and make it primary key
ALTER TABLE user_profiles RENAME COLUMN new_id TO id;
ALTER TABLE user_profiles ADD PRIMARY KEY (id);

-- Recreate the foreign key constraint (user_id remains UUID as it references auth.users)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ==============================================
-- STEP 3: Update vendor_media table  
-- ==============================================

-- Add a new integer id column
ALTER TABLE vendor_media ADD COLUMN new_id SERIAL;

-- Create mapping for vendor_media
CREATE TEMP TABLE vendor_media_id_mapping AS 
SELECT id as old_uuid, new_id as new_integer 
FROM vendor_media 
ORDER BY uploaded_at;

-- Drop the old UUID primary key
ALTER TABLE vendor_media DROP CONSTRAINT vendor_media_pkey;
ALTER TABLE vendor_media DROP COLUMN id;

-- Rename the new column to id and make it primary key
ALTER TABLE vendor_media RENAME COLUMN new_id TO id;
ALTER TABLE vendor_media ADD PRIMARY KEY (id);

-- ==============================================
-- STEP 4: Update any foreign key references
-- ==============================================

-- If there are any tables that reference user_profiles.id, update them here
-- For example, if there's a table that has user_profile_id, you'd need to update it

-- If there are any tables that reference vendor_media.id, update them here
-- For example, if there's a table that has media_id, you'd need to update it

-- ==============================================
-- STEP 5: Recreate indexes
-- ==============================================

-- Recreate indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create indexes for vendor_media if needed
CREATE INDEX IF NOT EXISTS idx_vendor_media_vendor_id ON vendor_media(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_media_category ON vendor_media(category);

-- ==============================================
-- STEP 6: Update RLS policies (if needed)
-- ==============================================

-- The existing RLS policies should continue to work as they reference user_id, not the primary key
-- But let's make sure they're still active
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_media ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 7: Update functions that reference the old IDs
-- ==============================================

-- Update the handle_new_user function to work with integer IDs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, full_name, agreed_to_terms)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- STEP 8: Cleanup temporary tables
-- ==============================================

DROP TABLE IF EXISTS user_id_mapping;
DROP TABLE IF EXISTS vendor_media_id_mapping;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify the changes
SELECT 'user_profiles' as table_name, COUNT(*) as row_count, 
       pg_typeof(id) as id_type 
FROM user_profiles 
UNION ALL
SELECT 'vendor_media' as table_name, COUNT(*) as row_count,
       pg_typeof(id) as id_type 
FROM vendor_media;

-- Show sample data
SELECT 'user_profiles sample' as info, id, user_id, email FROM user_profiles LIMIT 3;
SELECT 'vendor_media sample' as info, id, vendor_id, media_url FROM vendor_media LIMIT 3;
