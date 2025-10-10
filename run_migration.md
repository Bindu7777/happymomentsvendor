# UUID to Integer ID Migration Guide

## Overview
This migration converts UUID primary keys to auto-increment integers for better simplicity and performance.

## Tables Affected
- `user_profiles` - id field changed from UUID to SERIAL
- `vendor_media` - id field changed from UUID to SERIAL

## Steps to Run Migration

### 1. Backup Your Data (IMPORTANT!)
Before running the migration, make sure you have a backup of your database.

### 2. Run the Migration Script
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `migrate_uuid_to_integer.sql`
4. Execute the script

### 3. Verify the Migration
After running the migration, check that:
- `user_profiles.id` is now of type `integer`
- `vendor_media.id` is now of type `integer`
- All existing data is preserved
- Foreign key relationships still work

### 4. Test the Application
1. Restart your frontend and backend servers
2. Test user registration/login
3. Test vendor media uploads
4. Test any features that use these tables

## What Changed in the Code

### TypeScript Interfaces Updated:
- `UserProfile.id`: `string` → `number`
- `VendorMedia.id`: `string` → `number`
- `Customer.id`: `string` → `number`
- `CustomerSearchFilter.id`: `string` → `number`
- `CustomerSearchHistory.id`: `string` → `number`

### Functions Updated:
- `addVendorMedia()`: Return type changed from `Promise<string | null>` to `Promise<number | null>`

## Rollback Plan
If you need to rollback:
1. Use the backup tables created during migration: `user_profiles_backup` and `vendor_media_backup`
2. Restore from those tables
3. Revert the TypeScript changes in the code

## Benefits
- Simpler IDs (1, 2, 3, etc. instead of long UUIDs)
- Better performance for indexing and joins
- Easier debugging and database management
- Reduced storage space
