-- Invoice and Quotation Database Schema
-- Run this SQL in your Supabase SQL editor to create the required tables

-- Create invoice_quotations table
CREATE TABLE IF NOT EXISTS invoice_quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'quotation')),
    vendor_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    terms TEXT,
    number VARCHAR(100) NOT NULL UNIQUE,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    signature_url TEXT,
    template_id VARCHAR(50) NOT NULL DEFAULT 'template-1',
    pdf_url TEXT,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_quotations_vendor_id ON invoice_quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoice_quotations_type ON invoice_quotations(type);
CREATE INDEX IF NOT EXISTS idx_invoice_quotations_status ON invoice_quotations(status);
CREATE INDEX IF NOT EXISTS idx_invoice_quotations_date ON invoice_quotations(date);
CREATE INDEX IF NOT EXISTS idx_invoice_quotations_number ON invoice_quotations(number);

-- Create invoice_templates table (for future template management)
CREATE TABLE IF NOT EXISTS invoice_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'quotation')),
    is_default BOOLEAN DEFAULT FALSE,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO invoice_templates (id, name, type, is_default, template_data) VALUES
('template-1', 'Modern Invoice', 'invoice', true, '{"header_style": "modern", "color_scheme": "blue", "layout": "standard"}'),
('template-2', 'Classic Invoice', 'invoice', false, '{"header_style": "classic", "color_scheme": "green", "layout": "standard"}'),
('template-3', 'Elegant Quotation', 'quotation', true, '{"header_style": "elegant", "color_scheme": "purple", "layout": "standard"}')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE invoice_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoice_quotations
-- Allow vendors to access only their own invoices/quotations
CREATE POLICY "Vendors can view their own invoices and quotations" ON invoice_quotations
    FOR SELECT USING (vendor_id = auth.jwt() ->> 'vendor_id');

CREATE POLICY "Vendors can insert their own invoices and quotations" ON invoice_quotations
    FOR INSERT WITH CHECK (vendor_id = auth.jwt() ->> 'vendor_id');

CREATE POLICY "Vendors can update their own invoices and quotations" ON invoice_quotations
    FOR UPDATE USING (vendor_id = auth.jwt() ->> 'vendor_id');

CREATE POLICY "Vendors can delete their own invoices and quotations" ON invoice_quotations
    FOR DELETE USING (vendor_id = auth.jwt() ->> 'vendor_id');

-- Alternative RLS policies if the above don't work (for testing)
-- Uncomment these if you're still getting RLS errors:

-- DROP POLICY IF EXISTS "Vendors can view their own invoices and quotations" ON invoice_quotations;
-- DROP POLICY IF EXISTS "Vendors can insert their own invoices and quotations" ON invoice_quotations;
-- DROP POLICY IF EXISTS "Vendors can update their own invoices and quotations" ON invoice_quotations;
-- DROP POLICY IF EXISTS "Vendors can delete their own invoices and quotations" ON invoice_quotations;

-- CREATE POLICY "Allow all operations for authenticated users" ON invoice_quotations
--     FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for invoice_templates
-- Allow all authenticated users to read templates
CREATE POLICY "Anyone can view invoice templates" ON invoice_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_invoice_quotations_updated_at 
    BEFORE UPDATE ON invoice_quotations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at 
    BEFORE UPDATE ON invoice_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON invoice_quotations TO authenticated;
GRANT ALL ON invoice_templates TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
