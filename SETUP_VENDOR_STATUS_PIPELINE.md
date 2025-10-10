# Vendor Status Pipeline Setup Guide

## Overview
This guide explains how to set up the vendor status pipeline system that allows customers to track their vendor interactions through different stages, from initial contact to event completion.

## Pipeline Stages

The system includes the following status stages:

1. **Contacted** - Initial contact made via WhatsApp
2. **In Discussion** - Negotiating details with vendor
3. **Deal Agreed** - Agreement reached on terms
4. **Discount Applied** - Special offer or discount applied
5. **Advance Paid** - Payment made to vendor
6. **Event Scheduled** - Service date confirmed
7. **Event Completed** - Service successfully delivered
8. **Closed - Successful** - Deal completed successfully
9. **Closed - Not Proceeding** - Deal cancelled/dropped

## Database Setup

### Step 1: Update the contacted_vendors table

Run the SQL script to add status constraints:

```sql
-- Run this in your Supabase SQL Editor
-- File: update_contacted_vendors_status.sql

-- Update the status column to use enum-like constraint
ALTER TABLE contacted_vendors DROP CONSTRAINT IF EXISTS contacted_vendors_status_check;

-- Add check constraint for valid status values
ALTER TABLE contacted_vendors 
ADD CONSTRAINT contacted_vendors_status_check 
CHECK (status IN (
  'Contacted',
  'In Discussion', 
  'Deal Agreed',
  'Discount Applied',
  'Advance Paid',
  'Event Scheduled',
  'Event Completed',
  'Closed - Successful',
  'Closed - Not Proceeding'
));

-- Update any existing records to have proper status
UPDATE contacted_vendors 
SET status = 'Contacted' 
WHERE status IS NULL OR status = '';

-- Add an index for status queries
CREATE INDEX IF NOT EXISTS idx_contacted_vendors_status ON contacted_vendors(status);

-- Add a comment to document the pipeline stages
COMMENT ON COLUMN contacted_vendors.status IS 'Pipeline stage: Contacted -> In Discussion -> Deal Agreed -> Discount Applied -> Advance Paid -> Event Scheduled -> Event Completed -> Closed (Successful/Not Proceeding)';
```

### Step 2: Verify the setup

```sql
-- Check the table structure
SELECT 
  'Table updated successfully' as status,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contacted_vendors'
ORDER BY ordinal_position;

-- Show sample data with status
SELECT 
  contact_id,
  customer_id,
  vendor_id,
  status,
  contacted_at,
  created_at
FROM contacted_vendors
LIMIT 5;
```

## Backend API Endpoints

The following endpoints are available for status management:

### Update Vendor Status
```
PUT /api/contacted-vendors/update-status
Body: {
  "customer_id": number,
  "vendor_id": string,
  "status": string
}
```

### Get Status Options
```
GET /api/contacted-vendors/status-options
Returns: Array of available status options with descriptions and colors
```

## Frontend Components

### VendorStatusDropdown Component
- Located at: `src/components/VendorStatusDropdown.tsx`
- Features:
  - Dropdown with all pipeline stages
  - Color-coded status indicators
  - Real-time status updates
  - Loading states and error handling

### MyVendors Page Updates
- Located at: `src/pages/MyVendors.tsx`
- Features:
  - Status dropdown for each vendor
  - Status filtering by pipeline stage
  - Visual indicators for different statuses
  - Real-time status updates

## Usage Instructions

### For Customers:

1. **Contact a Vendor**: Click WhatsApp button on any vendor profile
2. **View Contacted Vendors**: Go to "My Vendors" from the header
3. **Update Status**: Use the status dropdown on each vendor card to update progress
4. **Filter by Status**: Use the filter dropdown to view vendors by specific status
5. **Track Progress**: Follow the pipeline from "Contacted" to "Event Completed"

### Pipeline Flow Example:

```
Customer clicks WhatsApp → Contacted
↓
Customer starts negotiating → In Discussion
↓
Customer agrees to terms → Deal Agreed
↓
Customer applies discount → Discount Applied
↓
Customer makes payment → Advance Paid
↓
Customer schedules event → Event Scheduled
↓
Vendor delivers service → Event Completed
↓
Final outcome → Closed - Successful (or Closed - Not Proceeding)
```

## Features

### Status Management
- ✅ 9 distinct pipeline stages
- ✅ Color-coded visual indicators
- ✅ Real-time status updates
- ✅ Status validation on backend

### Filtering & Organization
- ✅ Filter vendors by status
- ✅ Show/hide vendors based on pipeline stage
- ✅ Status count indicators
- ✅ Empty state handling for filtered results

### User Experience
- ✅ Intuitive dropdown interface
- ✅ Clear status descriptions
- ✅ Loading states and error handling
- ✅ Responsive design for mobile and desktop

## Technical Implementation

### Database Schema
- `contacted_vendors` table with status column
- Check constraints for valid status values
- Indexes for performance optimization
- Row Level Security (RLS) policies

### API Architecture
- RESTful endpoints for status management
- Input validation and error handling
- Consistent response format
- Comprehensive logging

### Frontend Architecture
- React component-based design
- TypeScript for type safety
- Context-based state management
- Responsive UI with Tailwind CSS

## Troubleshooting

### Common Issues:

1. **Status not updating**: Check if the contact exists in the database
2. **Invalid status error**: Ensure status matches one of the valid options
3. **Permission denied**: Verify RLS policies are correctly configured
4. **Filter not working**: Check if status options are loaded correctly

### Debug Steps:

1. Check browser console for API errors
2. Verify backend logs for database queries
3. Confirm database constraints are applied
4. Test API endpoints directly with tools like Postman

## Future Enhancements

Potential improvements for the status pipeline:

1. **Status History**: Track status change history with timestamps
2. **Automated Transitions**: Auto-advance status based on certain triggers
3. **Notifications**: Email/SMS alerts for status changes
4. **Analytics**: Dashboard showing pipeline performance metrics
5. **Custom Statuses**: Allow vendors to define custom pipeline stages
6. **Bulk Operations**: Update multiple vendors' status at once
7. **Status Templates**: Predefined status flows for different vendor types

## Support

For technical support or questions about the vendor status pipeline:

1. Check the console logs for error messages
2. Verify database setup using the provided SQL scripts
3. Test API endpoints independently
4. Review component props and state management

The system is designed to be robust and user-friendly, providing customers with clear visibility into their vendor interaction progress while maintaining data integrity and performance.
