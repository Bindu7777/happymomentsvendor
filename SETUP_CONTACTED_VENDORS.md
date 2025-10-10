# Customer-Vendor Contact Tracking Setup

## Overview
This feature enables customers to contact vendors through WhatsApp and maintains a record of which customers have contacted which vendors.

## Database Setup

### Step 1: Create the contacted_vendors table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create contacted_vendors table for tracking customer-vendor WhatsApp contacts
-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Users can view own contacted vendors" ON contacted_vendors;
DROP POLICY IF EXISTS "Users can insert own contacted vendors" ON contacted_vendors;
DROP POLICY IF EXISTS "Users can delete own contacted vendors" ON contacted_vendors;

-- Drop the table if it exists (this will also drop all constraints)
DROP TABLE IF EXISTS contacted_vendors CASCADE;

-- Create the contacted_vendors table
CREATE TABLE contacted_vendors (
  contact_id SERIAL PRIMARY KEY,                    -- Auto-increment integer ID
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,                          -- References vendors.vendor_id
  status TEXT DEFAULT 'Contacted',                  -- Status of the contact
  contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a customer can only contact a vendor once (prevent duplicates)
  UNIQUE(customer_id, vendor_id)
);

-- Create indexes for performance
CREATE INDEX idx_contacted_vendors_customer_id ON contacted_vendors(customer_id);
CREATE INDEX idx_contacted_vendors_vendor_id ON contacted_vendors(vendor_id);
CREATE INDEX idx_contacted_vendors_contacted_at ON contacted_vendors(contacted_at);
CREATE INDEX idx_contacted_vendors_status ON contacted_vendors(status);

-- Enable Row Level Security (RLS)
ALTER TABLE contacted_vendors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on contacted vendors" ON contacted_vendors
  FOR ALL USING (true) WITH CHECK (true);
```

## Features Implemented

### 1. Backend API Endpoints
- `POST /api/contacted-vendors/save-contact` - Save a contact record
- `GET /api/contacted-vendors/get-contacted-vendors/:customer_id` - Get contacted vendors for a customer
- `GET /api/contacted-vendors/check-contact/:customer_id/:vendor_id` - Check if customer has contacted a vendor
- `DELETE /api/contacted-vendors/remove-contact` - Remove a contact record

### 2. Frontend Components
- **WhatsAppButton Component** - Reusable component that tracks contacts when clicked
- **My Vendors Page** - Displays all vendors a customer has contacted
- **Updated Header** - Added "My Vendors" link to customer dropdown menu

### 3. Contact Tracking Flow
1. Customer clicks WhatsApp button on any vendor
2. WhatsApp opens with pre-filled message
3. Contact is automatically tracked in the database (if customer is logged in)
4. Contacted vendors appear in "My Vendors" section

## Testing the System

### 1. Test Contact Tracking
1. Log in as a customer
2. Browse vendors and click WhatsApp buttons
3. Check that contacts are recorded in the database
4. Visit "My Vendors" page to see contacted vendors

### 2. Test API Endpoints
```bash
# Save a contact
curl -X POST http://localhost:3001/api/contacted-vendors/save-contact \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 2, "vendor_id": "48"}'

# Get contacted vendors for customer
curl http://localhost:3001/api/contacted-vendors/get-contacted-vendors/2

# Check if customer has contacted a vendor
curl http://localhost:3001/api/contacted-vendors/check-contact/2/48
```

## Database Schema

### contacted_vendors table
- `contact_id` - Primary key (auto-increment)
- `customer_id` - Foreign key to customers table
- `vendor_id` - Vendor identifier (text)
- `status` - Contact status (default: 'Contacted')
- `contacted_at` - Timestamp when contact was made
- `created_at` - Record creation timestamp

## Integration Points

### WhatsApp Button Integration
- All WhatsApp buttons now use the `WhatsAppButton` component
- Automatically tracks contacts for logged-in customers
- Opens WhatsApp with pre-filled messages
- Works on vendor cards, vendor profiles, and other locations

### My Vendors Page
- Displays contacted vendors in a grid layout
- Shows vendor details, contact date, and actions
- Allows removing vendors from contacted list
- Provides WhatsApp and profile links

## Notes

- Only successful WhatsApp contacts are tracked (when button is clicked)
- Contacts are tracked per customer-vendor pair (no duplicates)
- System works for both logged-in and anonymous users (anonymous users don't get tracking)
- All existing WhatsApp functionality is preserved
- New tracking is completely transparent to users
