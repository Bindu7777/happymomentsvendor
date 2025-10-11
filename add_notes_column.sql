-- Add notes column to contacted_vendors table
ALTER TABLE contacted_vendors
ADD COLUMN notes TEXT DEFAULT '';

-- Create an index on notes for faster text searches
CREATE INDEX idx_contacted_vendors_notes ON contacted_vendors USING gin(to_tsvector('english', notes));

-- Optional: Add a comment to the column
COMMENT ON COLUMN contacted_vendors.notes IS 'Vendor notes about the customer contact';
