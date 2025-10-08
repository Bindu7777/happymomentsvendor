// Invoice and Quotation Service
import { supabase } from '../lib/supabase';

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceQuotation {
  id?: number;
  type: 'invoice' | 'quotation';
  vendor_id: number; // Changed from string to number to match database
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  services: ServiceItem[];
  terms: string;
  number: string;
  date: string;
  signature_url?: string;
  template_id: string;
  pdf_url?: string;
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total_amount: number; // Changed from 'total' to 'total_amount' to match database
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'quotation';
  is_default: boolean;
  template_data: any;
}

// Generate invoice/quotation number
export const generateDocumentNumber = async (type: 'invoice' | 'quotation', vendorId: string | number): Promise<string> => {
  const prefix = type === 'invoice' ? 'INV' : 'QTN';
  const vendorIdNum = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
  const vendorCode = vendorIdNum.toString().padStart(3, '0');
  
  // Get the count of existing documents for this vendor and type
  const { count } = await supabase
    .from('invoice_quotations')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendorIdNum)
    .eq('type', type);
  
  const sequenceNumber = (count || 0) + 1;
  const paddedSequence = sequenceNumber.toString().padStart(3, '0');
  
  return `${prefix}-${vendorCode}-${paddedSequence}`;
};

// Create new invoice/quotation
export const createInvoiceQuotation = async (data: Omit<InvoiceQuotation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: InvoiceQuotation; error?: string }> => {
  try {
    console.log('Creating invoice/quotation with data:', data);
    
    // Validate required fields
    if (!data.vendor_id) {
      return { success: false, error: 'Vendor ID is required' };
    }
    if (!data.customer_name?.trim()) {
      return { success: false, error: 'Customer name is required' };
    }
    if (!data.customer_mobile?.trim()) {
      return { success: false, error: 'Customer mobile is required' };
    }
    if (!data.services || data.services.length === 0) {
      return { success: false, error: 'At least one service item is required' };
    }

    // Ensure vendor_id is a number
    const vendorIdNum = typeof data.vendor_id === 'string' ? parseInt(data.vendor_id) : data.vendor_id;

    // Generate unique document number
    const documentNumber = await generateDocumentNumber(data.type, vendorIdNum);
    
    // Prepare data for insertion - ensure vendor_id is number
    const invoiceData = { 
      ...data, 
      vendor_id: vendorIdNum,
      number: documentNumber 
    };

    console.log('Inserting invoice data:', invoiceData);

    const { data: result, error } = await supabase
      .from('invoice_quotations')
      .insert([invoiceData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating invoice/quotation:', error);
      
      // Check if table doesn't exist
      if (error.message.includes('relation "invoice_quotations" does not exist')) {
        return { 
          success: false, 
          error: 'Database table not found. Please run the database_schema.sql file in your Supabase SQL Editor first.' 
        };
      }
      
      // Check for other common errors
      if (error.message.includes('permission denied')) {
        return { 
          success: false, 
          error: 'Permission denied. Please check your Supabase RLS policies.' 
        };
      }
      
      return { success: false, error: `Database error: ${error.message}` };
    }

    console.log('Successfully created invoice/quotation:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Unexpected error creating invoice/quotation:', error);
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Get all invoices/quotations for a vendor
export const getVendorInvoicesQuotations = async (vendorId: string | number): Promise<{ success: boolean; data?: InvoiceQuotation[]; error?: string }> => {
  try {
    const vendorIdNum = typeof vendorId === 'string' ? parseInt(vendorId) : vendorId;
    
    const { data, error } = await supabase
      .from('invoice_quotations')
      .select('*')
      .eq('vendor_id', vendorIdNum)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices/quotations:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching invoices/quotations:', error);
    return { success: false, error: 'Failed to fetch invoices/quotations' };
  }
};

// Get single invoice/quotation
export const getInvoiceQuotation = async (id: number): Promise<{ success: boolean; data?: InvoiceQuotation; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('invoice_quotations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice/quotation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching invoice/quotation:', error);
    return { success: false, error: 'Failed to fetch invoice/quotation' };
  }
};

// Update invoice/quotation
export const updateInvoiceQuotation = async (id: number, updates: Partial<InvoiceQuotation>): Promise<{ success: boolean; data?: InvoiceQuotation; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('invoice_quotations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice/quotation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating invoice/quotation:', error);
    return { success: false, error: 'Failed to update invoice/quotation' };
  }
};

// Delete invoice/quotation
export const deleteInvoiceQuotation = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('invoice_quotations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice/quotation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice/quotation:', error);
    return { success: false, error: 'Failed to delete invoice/quotation' };
  }
};

// Get invoice templates
export const getInvoiceTemplates = async (): Promise<{ success: boolean; data?: InvoiceTemplate[]; error?: string }> => {
  try {
    // For now, return default templates. In production, these would come from database
    const defaultTemplates: InvoiceTemplate[] = [
      {
        id: 'template-1',
        name: 'Modern Invoice',
        type: 'invoice',
        is_default: true,
        template_data: {
          header_style: 'modern',
          color_scheme: 'blue',
          layout: 'standard'
        }
      },
      {
        id: 'template-2',
        name: 'Classic Invoice',
        type: 'invoice',
        is_default: false,
        template_data: {
          header_style: 'classic',
          color_scheme: 'green',
          layout: 'standard'
        }
      },
      {
        id: 'template-3',
        name: 'Elegant Quotation',
        type: 'quotation',
        is_default: true,
        template_data: {
          header_style: 'elegant',
          color_scheme: 'purple',
          layout: 'standard'
        }
      }
    ];

    return { success: true, data: defaultTemplates };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
};

// Calculate totals
export const calculateTotals = (services: ServiceItem[], taxRate: number = 0): { subtotal: number; taxAmount: number; total: number } => {
  const subtotal = services.reduce((sum, service) => sum + service.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  return { subtotal, taxAmount, total };
};

// Generate PDF using jsPDF
export const generatePDF = async (invoiceQuotation: InvoiceQuotation, vendor: any): Promise<{ success: boolean; pdfUrl?: string; error?: string }> => {
  try {
    const { generateInvoiceQuotationPDF } = await import('./pdfService');
    
    // Generate PDF blob
    const pdfBlob = await generateInvoiceQuotationPDF(invoiceQuotation, vendor);
    
    // For now, create a local URL for the blob
    // In production, you would upload this to Supabase Storage
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return { success: true, pdfUrl };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: 'Failed to generate PDF' };
  }
};
