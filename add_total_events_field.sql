-- Add the 'total_events' column to the vendors table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vendors' AND column_name='total_events') THEN
        ALTER TABLE vendors ADD COLUMN total_events INTEGER DEFAULT 0;
        RAISE NOTICE 'Column "total_events" added to "vendors" table.';
    ELSE
        RAISE NOTICE 'Column "total_events" already exists in "vendors" table.';
    END IF;
END
$$;

-- Update existing NULL values to 0 if needed
UPDATE vendors
SET total_events = 0
WHERE total_events IS NULL;

-- Add a NOT NULL constraint if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vendors' AND column_name='total_events' AND is_nullable='YES') THEN
        ALTER TABLE vendors ALTER COLUMN total_events SET NOT NULL;
        RAISE NOTICE 'NOT NULL constraint added to "total_events" column in "vendors" table.';
    ELSE
        RAISE NOTICE 'NOT NULL constraint already exists on "total_events" column in "vendors" table.';
    END IF;
END
$$;

-- Add a CHECK constraint to ensure total_events is not negative (optional, but good for data integrity)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vendors_total_events_non_negative' AND conrelid = 'vendors'::regclass) THEN
        ALTER TABLE vendors ADD CONSTRAINT vendors_total_events_non_negative CHECK (total_events >= 0);
        RAISE NOTICE 'CHECK constraint "vendors_total_events_non_negative" added to "total_events" column.';
    ELSE
        RAISE NOTICE 'CHECK constraint "vendors_total_events_non_negative" already exists on "total_events" column.';
    END IF;
END
$$;

-- Create an index on the total_events column for faster searches (optional)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'vendors' AND indexname = 'idx_vendors_total_events') THEN
        CREATE INDEX idx_vendors_total_events ON vendors (total_events);
        RAISE NOTICE 'Index "idx_vendors_total_events" created on "total_events" column.';
    ELSE
        RAISE NOTICE 'Index "idx_vendors_total_events" already exists on "total_events" column.';
    END IF;
END
$$;
