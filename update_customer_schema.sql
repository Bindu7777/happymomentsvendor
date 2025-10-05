-- Update Customer Database Schema
-- Run this SQL in your Supabase SQL editor to add new columns to existing tables

-- Add new columns to customers table if they don't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

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
CREATE POLICY IF NOT EXISTS "Allow all operations for authenticated users on customer_search_history" ON customer_search_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON customer_search_history TO authenticated;

-- Update existing customers to have default login_count of 0
UPDATE customers SET login_count = 0 WHERE login_count IS NULL;
