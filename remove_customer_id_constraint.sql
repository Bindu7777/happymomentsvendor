-- Remove foreign key constraint on customer_id in contacted_vendors table
-- This allows admin to send customers without creating customer records

-- First, drop the existing foreign key constraint
ALTER TABLE contacted_vendors 
DROP CONSTRAINT IF EXISTS contacted_vendors_customer_id_fkey;

-- Optional: Add a comment explaining the change
COMMENT ON COLUMN contacted_vendors.customer_id IS 'Customer ID - can be 0 for admin-sent customers or reference customers table';
