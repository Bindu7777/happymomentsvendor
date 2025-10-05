-- Fix Customer Database Schema
-- Run this SQL in your Supabase SQL editor to add missing columns

-- First, check if the columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add last_login_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'last_login_at') THEN
        ALTER TABLE customers ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add login_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'login_count') THEN
        ALTER TABLE customers ADD COLUMN login_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create customer_search_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    search_type TEXT NOT NULL CHECK (search_type IN ('voice', 'manual', 'smart_request')),
    search_query TEXT,
    search_filters JSONB DEFAULT '{}'::jsonb,
    search_results_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_last_login ON customers(last_login_at);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_customer_id ON customer_search_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_created_at ON customer_search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_type ON customer_search_history(search_type);

-- Enable Row Level Security (RLS) for customer_search_history
ALTER TABLE customer_search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_search_history table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_search_history' AND policyname = 'Allow all operations for authenticated users on customer_search_history') THEN
        CREATE POLICY "Allow all operations for authenticated users on customer_search_history" ON customer_search_history
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON customer_search_history TO authenticated;

-- Update existing customers to have default login_count of 0
UPDATE customers SET login_count = 0 WHERE login_count IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
