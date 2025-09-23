# Invoice & Quotation Generation Module

## Overview
This module provides vendors with the ability to generate professional invoices and quotations using predefined templates. The system automatically pre-fills vendor business data and allows customization of customer-specific details.

## Features

### ✅ Implemented Features
- **Document Creation**: Create invoices and quotations with dynamic form validation
- **Template System**: Multiple professional templates (Modern, Classic, Elegant)
- **Auto-numbering**: Automatic generation of unique document numbers (INV-XXX-XXXXXX, QTN-XXX-XXXXXX)
- **Service Items**: Dynamic service/item entry with quantity, rate, and auto-calculation
- **Tax Calculation**: Configurable tax rates with automatic calculation
- **PDF Generation**: Professional PDF generation using jsPDF
- **Document Management**: View, edit, delete, and manage all documents
- **Search & Filter**: Advanced filtering by type, status, customer, and date
- **Preview System**: Real-time preview before final generation

### 🔄 Future Enhancements
- **Email Integration**: Send documents directly to customers via email
- **WhatsApp Integration**: Share documents via WhatsApp
- **Cloud Storage**: Upload PDFs to Supabase Storage for permanent storage
- **Digital Signatures**: Add digital signature support
- **Payment Tracking**: Track payment status and due dates
- **Recurring Invoices**: Set up recurring invoice generation
- **Advanced Templates**: More template options with custom styling

## Technical Architecture

### Database Schema
```sql
-- Main table for storing invoices and quotations
CREATE TABLE invoice_quotations (
    id UUID PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'invoice' or 'quotation'
    vendor_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    services JSONB NOT NULL, -- Array of service items
    terms TEXT,
    number VARCHAR(100) NOT NULL UNIQUE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    signature_url TEXT,
    template_id VARCHAR(50) NOT NULL,
    pdf_url TEXT,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### File Structure
```
src/
├── services/
│   ├── invoiceService.ts          # Backend API calls
│   └── pdfService.ts             # PDF generation logic
├── components/
│   ├── InvoiceQuotationModal.tsx  # Create/Edit modal
│   ├── InvoiceQuotationList.tsx   # Document listing
│   └── InvoiceQuotationPreview.tsx # Document preview
└── pages/
    └── VendorDashboard.tsx        # Integration point
```

## Usage Guide

### 1. Creating a New Document
1. Navigate to the **INVOICES** tab in the vendor dashboard
2. Click **"New Invoice"** or **"New Quotation"**
3. Fill in customer details (name, mobile, email)
4. Add service items with descriptions, quantities, and rates
5. Set tax rate and review terms & conditions
6. Choose a template
7. Click **"Save"** to create the document

### 2. Managing Documents
- **View**: Click the "View" button to preview the document
- **Edit**: Click the "Edit" button to modify the document
- **Delete**: Click the trash icon to delete the document
- **Download**: Use the preview modal to download PDF

### 3. Document Types

#### Invoice
- Used for confirmed bookings and completed services
- Includes payment terms and due dates
- Professional billing format

#### Quotation
- Used for potential clients and estimates
- Valid for 30 days (configurable)
- Focus on service details and pricing

## API Reference

### Invoice Service Functions

```typescript
// Create new invoice/quotation
createInvoiceQuotation(data: InvoiceQuotationData): Promise<Result>

// Get all documents for a vendor
getVendorInvoicesQuotations(vendorId: string): Promise<Result>

// Get single document
getInvoiceQuotation(id: string): Promise<Result>

// Update document
updateInvoiceQuotation(id: string, updates: Partial<InvoiceQuotation>): Promise<Result>

// Delete document
deleteInvoiceQuotation(id: string): Promise<Result>

// Generate PDF
generatePDF(invoiceQuotation: InvoiceQuotation, vendor: any): Promise<Result>
```

### PDF Service Functions

```typescript
// Generate PDF blob
generateInvoiceQuotationPDF(invoiceQuotation: InvoiceQuotation, vendor: any, options?: PDFOptions): Promise<Blob>

// Download PDF
downloadPDF(blob: Blob, filename: string): void

// Generate and download PDF
generateAndDownloadPDF(invoiceQuotation: InvoiceQuotation, vendor: any, options?: PDFOptions): Promise<void>
```

## Configuration

### PDF Options
```typescript
interface PDFOptions {
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  fontSize?: number;
  fontFamily?: string;
}
```

### Document Numbering
- **Format**: `{TYPE}-{VENDOR_CODE}-{TIMESTAMP}`
- **Examples**: `INV-123-456789`, `QTN-123-456789`
- **Uniqueness**: Enforced at database level

## Security

### Row Level Security (RLS)
- Vendors can only access their own documents
- Automatic filtering by vendor_id
- Secure API endpoints with authentication

### Data Validation
- Client-side form validation
- Server-side data sanitization
- Type safety with TypeScript

## Performance Considerations

### Database Indexes
- `vendor_id` - Fast vendor document retrieval
- `type` - Filter by document type
- `status` - Filter by document status
- `date` - Sort by creation date
- `number` - Unique document lookup

### PDF Generation
- Client-side generation using jsPDF
- No server load for PDF creation
- Efficient blob handling
- Memory cleanup after download

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check browser compatibility
   - Ensure jsPDF is properly installed
   - Verify document data integrity

2. **Document Not Saving**
   - Check network connection
   - Verify vendor authentication
   - Check database permissions

3. **Template Not Loading**
   - Verify template_id exists
   - Check template data format
   - Ensure proper JSON structure

### Debug Mode
Enable console logging for detailed error information:
```typescript
// In invoiceService.ts
console.log('Creating invoice/quotation:', data);
console.log('API response:', result);
```

## Future Roadmap

### Phase 2 Features
- [ ] Email integration with SMTP
- [ ] WhatsApp Business API integration
- [ ] Supabase Storage for PDF persistence
- [ ] Advanced template editor
- [ ] Payment gateway integration

### Phase 3 Features
- [ ] Mobile app support
- [ ] Offline document creation
- [ ] Bulk document operations
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: React 18+, TypeScript 4.9+, Supabase 2.x
