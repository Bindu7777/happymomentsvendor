# Supabase Migration Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## How to Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and paste it as `VITE_SUPABASE_URL`
5. Copy the anon/public key and paste it as `VITE_SUPABASE_ANON_KEY`

## Database Schema

Your Supabase database should already have the tables created from the SQL you provided. The schema includes:

### Tables:
- `vendors` - Main vendor information
- `vendor_media` - Media files for vendors

### Sample Data:
The SQL script you provided includes sample data for "Rajesh Kumar Photography" which should be visible in your application.

## Testing the Migration

1. Set up your environment variables
2. Run `npm run dev`
3. Check the homepage - you should see vendors loaded from Supabase
4. Try adding a new vendor using the form
5. Navigate to vendor detail pages

## Key Changes Made

- ✅ Removed Firebase dependencies
- ✅ Added Supabase client and types
- ✅ Updated all service functions for Supabase
- ✅ Updated components to use new field names
- ✅ Created new vendor form matching your schema
- ✅ Added loading states and error handling

## New Field Mappings

| Old Firebase Fields | New Supabase Fields |
|-------------------|-------------------|
| `id` | `vendor_id` |
| `name` | `brand_name` |
| `image` | `avatar_url` |
| `location` | `address` |
| `phone` | `phone_number` |
| `reviews` | `review_count` |

## Available Functions

### Vendor Operations:
- `getAllVendors()` - Get all verified, available vendors
- `getVendorByFieldId(vendorId)` - Get specific vendor
- `getVendorsByCategory(category)` - Filter by category
- `addVendor(vendorData)` - Add new vendor
- `updateVendor(vendorId, data)` - Update vendor
- `deleteVendor(vendorId)` - Delete vendor
- `checkPhoneUnique(phone)` - Validate unique phone

### Media Operations:
- `getVendorMedia(vendorId, category?)` - Get vendor media files
- `addVendorMedia(mediaData)` - Add media file

## Notes

- All vendors must be verified (`verified: true`) to appear on the public site
- Phone numbers must be unique across all vendors
- Vendor IDs are auto-generated from brand name and category
- The system supports JSON fields for services, packages, reviews, etc.
