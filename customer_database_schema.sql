-- Customer Database Schema
-- Run this SQL in your Supabase SQL editor to create the required tables for customer management

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    mobile_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified')),
    verification_token TEXT,
    verification_token_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_search_filters table
CREATE TABLE IF NOT EXISTS customer_search_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    filter_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    filter_name TEXT NOT NULL DEFAULT 'Saved Filter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_search_history table for tracking recent searches
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
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON customers(verification_token);
CREATE INDEX IF NOT EXISTS idx_customers_last_login ON customers(last_login_at);
CREATE INDEX IF NOT EXISTS idx_customer_search_filters_customer_id ON customer_search_filters(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_customer_id ON customer_search_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_created_at ON customer_search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_search_history_type ON customer_search_history(search_type);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_search_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_search_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
-- Allow all authenticated users to access customers table
-- Note: Since we're using localStorage for session management, we'll use service role for now
-- In production, you might want to implement proper JWT-based authentication

-- Allow all operations for authenticated users (for now)
CREATE POLICY "Allow all operations for authenticated users on customers" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for customer_search_filters table
-- Allow all operations for authenticated users (for now)
CREATE POLICY "Allow all operations for authenticated users on customer_search_filters" ON customer_search_filters
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for customer_search_history table
-- Allow all operations for authenticated users (for now)
CREATE POLICY "Allow all operations for authenticated users on customer_search_history" ON customer_search_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_customer_updated_at_column();

CREATE TRIGGER update_customer_search_filters_updated_at 
    BEFORE UPDATE ON customer_search_filters 
    FOR EACH ROW EXECUTE FUNCTION update_customer_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON customers TO authenticated;
GRANT ALL ON customer_search_filters TO authenticated;
GRANT ALL ON customer_search_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Alternative: If you want to disable RLS for testing (NOT recommended for production)
-- Uncomment the following lines if you encounter RLS issues during development:
-- ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_search_filters DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE customer_search_history DISABLE ROW LEVEL SECURITY;

-- Create a function to validate mobile number format
CREATE OR REPLACE FUNCTION validate_mobile_number(mobile TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if mobile number is exactly 10 digits
    RETURN mobile ~ '^[0-9]{10}$';
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for mobile number validation
ALTER TABLE customers ADD CONSTRAINT check_mobile_number 
    CHECK (validate_mobile_number(mobile_number));

-- Add check constraint for email format
ALTER TABLE customers ADD CONSTRAINT check_email_format 
    CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add check constraint for password hash (should not be empty)
ALTER TABLE customers ADD CONSTRAINT check_password_hash_not_empty 
    CHECK (length(password_hash) > 0);
