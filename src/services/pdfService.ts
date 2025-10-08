import jsPDF from 'jspdf';
import { InvoiceQuotation } from './invoiceService';

export interface PDFOptions {
  format?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  fontSize?: number;
  fontFamily?: string;
}

export const generateInvoiceQuotationPDF = async (
  invoiceQuotation: InvoiceQuotation,
  vendor: any,
  options: PDFOptions = {}
): Promise<Blob> => {
  const {
    format = 'A4',
    orientation = 'portrait',
    margin = 20,
    fontSize = 12,
    fontFamily = 'helvetica'
  } = options;

  // Create new PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize: textSize = fontSize, fontStyle = 'normal', color = '#000000', align = 'left' } = options;
    
    doc.setFontSize(textSize);
    doc.setFont(fontFamily, fontStyle);
    doc.setTextColor(color);
    
    if (align === 'center') {
      doc.text(text, pageWidth / 2, y, { align: 'center' });
    } else if (align === 'right') {
      doc.text(text, pageWidth - margin, y, { align: 'right' });
    } else {
      doc.text(text, x, y);
    }
  };

  // Helper function to add line
  const addLine = (x1: number, y1: number, x2: number, y2: number, color = '#000000') => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };

  // Helper function to add rectangle
  const addRect = (x: number, y: number, width: number, height: number, color = '#f0f0f0') => {
    doc.setFillColor(color);
    doc.rect(x, y, width, height, 'F');
  };

  // Header Section
  addRect(margin, yPosition, contentWidth, 30, '#f8f9fa');
  yPosition += 5;
  
  // Business Name
  addText(vendor.brand_name || 'Your Business Name', margin + 10, yPosition, {
    fontSize: 20,
    fontStyle: 'bold',
    color: '#1a365d'
  });
  yPosition += 8;

  // Business Details
  addText(vendor.category || '', margin + 10, yPosition, { fontSize: 14, color: '#4a5568' });
  yPosition += 5;
  addText(vendor.address || '', margin + 10, yPosition, { fontSize: 10, color: '#718096' });
  yPosition += 4;
  addText(`Phone: ${vendor.phone || ''}`, margin + 10, yPosition, { fontSize: 10, color: '#718096' });
  yPosition += 4;
  addText(`Email: ${vendor.email || ''}`, margin + 10, yPosition, { fontSize: 10, color: '#718096' });

  // Document Type and Number (Right side)
  yPosition = margin + 5;
  addText(invoiceQuotation.type === 'invoice' ? 'INVOICE' : 'QUOTATION', pageWidth - margin - 10, yPosition, {
    fontSize: 24,
    fontStyle: 'bold',
    color: '#2d3748',
    align: 'right'
  });
  yPosition += 8;
  addText(`No: ${invoiceQuotation.number}`, pageWidth - margin - 10, yPosition, {
    fontSize: 12,
    color: '#4a5568',
    align: 'right'
  });
  yPosition += 5;
  addText(`Date: ${formatDate(invoiceQuotation.date)}`, pageWidth - margin - 10, yPosition, {
    fontSize: 10,
    color: '#718096',
    align: 'right'
  });

  yPosition = margin + 35;

  // Bill To Section
  addText(invoiceQuotation.type === 'invoice' ? 'Bill To:' : 'Quote To:', margin, yPosition, {
    fontSize: 14,
    fontStyle: 'bold',
    color: '#2d3748'
  });
  yPosition += 8;

  addRect(margin, yPosition, contentWidth, 25, '#f7fafc');
  yPosition += 5;
  addText(invoiceQuotation.customer_name, margin + 10, yPosition, {
    fontSize: 12,
    fontStyle: 'bold',
    color: '#1a202c'
  });
  yPosition += 5;
  addText(invoiceQuotation.customer_mobile, margin + 10, yPosition, { fontSize: 10, color: '#4a5568' });
  yPosition += 4;
  if (invoiceQuotation.customer_email) {
    addText(invoiceQuotation.customer_email, margin + 10, yPosition, { fontSize: 10, color: '#4a5568' });
  }

  yPosition += 15;

  // Services Table Header
  addRect(margin, yPosition, contentWidth, 12, '#e2e8f0');
  yPosition += 8;
  
  const colWidths = [contentWidth * 0.4, contentWidth * 0.15, contentWidth * 0.2, contentWidth * 0.25];
  const colPositions = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];

  addText('Description', colPositions[0], yPosition, { fontSize: 10, fontStyle: 'bold', color: '#2d3748' });
  addText('Qty', colPositions[1], yPosition, { fontSize: 10, fontStyle: 'bold', color: '#2d3748' });
  addText('Rate (₹)', colPositions[2], yPosition, { fontSize: 10, fontStyle: 'bold', color: '#2d3748' });
  addText('Amount (₹)', colPositions[3], yPosition, { fontSize: 10, fontStyle: 'bold', color: '#2d3748' });

  yPosition += 8;

  // Services Table Rows
  invoiceQuotation.services.forEach((service, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    addRect(margin, yPosition - 4, contentWidth, 12, bgColor);
    
    addText(service.description, colPositions[0], yPosition, { fontSize: 9, color: '#2d3748' });
    addText(service.quantity.toString(), colPositions[1], yPosition, { fontSize: 9, color: '#4a5568' });
    addText(service.rate.toFixed(2), colPositions[2], yPosition, { fontSize: 9, color: '#4a5568' });
    addText(service.amount.toFixed(2), colPositions[3], yPosition, { fontSize: 9, color: '#2d3748' });
    
    yPosition += 12;
  });

  yPosition += 10;

  // Totals Section
  const totalsX = pageWidth - margin - 100;
  addText('Subtotal:', totalsX, yPosition, { fontSize: 10, color: '#4a5568' });
  addText(`₹${invoiceQuotation.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, { fontSize: 10, color: '#2d3748', align: 'right' });
  yPosition += 6;

  if (invoiceQuotation.tax_rate && invoiceQuotation.tax_rate > 0) {
    addText(`Tax (${invoiceQuotation.tax_rate}%):`, totalsX, yPosition, { fontSize: 10, color: '#4a5568' });
    addText(`₹${(invoiceQuotation.tax_amount || 0).toFixed(2)}`, pageWidth - margin, yPosition, { fontSize: 10, color: '#2d3748', align: 'right' });
    yPosition += 6;
  }

  addLine(totalsX, yPosition, pageWidth - margin, yPosition, '#e2e8f0');
  yPosition += 6;

  addText('Total:', totalsX, yPosition, { fontSize: 12, fontStyle: 'bold', color: '#1a202c' });
  addText(`₹${invoiceQuotation.total_amount.toFixed(2)}`, pageWidth - margin, yPosition, { fontSize: 12, fontStyle: 'bold', color: '#1a202c', align: 'right' });

  yPosition += 20;

  // Terms & Conditions
  if (invoiceQuotation.terms) {
    addText('Terms & Conditions:', margin, yPosition, {
      fontSize: 12,
      fontStyle: 'bold',
      color: '#2d3748'
    });
    yPosition += 8;

    const termsLines = doc.splitTextToSize(invoiceQuotation.terms, contentWidth);
    termsLines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      addText(line, margin, yPosition, { fontSize: 9, color: '#4a5568' });
      yPosition += 4;
    });
  }

  yPosition += 20;

  // Footer
  addLine(margin, yPosition, pageWidth - margin, yPosition, '#e2e8f0');
  yPosition += 10;

  addText('Thank you for your business!', pageWidth / 2, yPosition, {
    fontSize: 10,
    color: '#718096',
    align: 'center'
  });
  yPosition += 5;

  addText(`For any queries, please contact us at ${vendor.phone || ''} or ${vendor.email || ''}`, pageWidth / 2, yPosition, {
    fontSize: 8,
    color: '#a0aec0',
    align: 'center'
  });

  // Generate and return PDF blob
  return doc.output('blob');
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Function to download PDF
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Function to generate PDF and download
export const generateAndDownloadPDF = async (
  invoiceQuotation: InvoiceQuotation,
  vendor: any,
  options?: PDFOptions
) => {
  try {
    const blob = await generateInvoiceQuotationPDF(invoiceQuotation, vendor, options);
    const filename = `${invoiceQuotation.number}.pdf`;
    downloadPDF(blob, filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
