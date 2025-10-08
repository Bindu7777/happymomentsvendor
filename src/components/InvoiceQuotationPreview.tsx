import React, { useState, useEffect } from 'react';
import { X, Download, Send, Edit, Print, MessageCircle, Mail, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { InvoiceQuotation } from '../services/invoiceService';

interface InvoiceQuotationPreviewProps {
  invoiceQuotation: InvoiceQuotation;
  vendor: any;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onSend: () => void;
}

const InvoiceQuotationPreview: React.FC<InvoiceQuotationPreviewProps> = ({
  invoiceQuotation,
  vendor,
  onClose,
  onEdit,
  onDownload,
  onSend
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareOptions) {
        const target = event.target as HTMLElement;
        if (!target.closest('.share-dropdown')) {
          setShowShareOptions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleWhatsAppShare = () => {
    const phoneNumber = invoiceQuotation.customer_mobile.replace(/[^0-9]/g, '');
    const documentType = invoiceQuotation.type === 'invoice' ? 'Invoice' : 'Quotation';
    const message = `Hi ${invoiceQuotation.customer_name}! 

Your ${documentType} ${invoiceQuotation.number} is ready.

📄 Document: ${documentType} ${invoiceQuotation.number}
💵 Total Amount: ${formatCurrency(invoiceQuotation.total_amount)}
📅 Date: ${formatDate(invoiceQuotation.date)}

Please review the attached document. For any queries, feel free to contact us.

Best regards,
${vendor.brand_name}`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareOptions(false);
  };

  const handleEmailShare = () => {
    const documentType = invoiceQuotation.type === 'invoice' ? 'Invoice' : 'Quotation';
    const subject = `${documentType} ${invoiceQuotation.number} - ${vendor.brand_name}`;
    const body = `Dear ${invoiceQuotation.customer_name},

Please find attached your ${documentType} ${invoiceQuotation.number}.

📄 Document: ${documentType} ${invoiceQuotation.number}
💵 Total Amount: ${formatCurrency(invoiceQuotation.total_amount)}
📅 Date: ${formatDate(invoiceQuotation.date)}

Please review the document and let us know if you have any questions.

Thank you for your business!

Best regards,
${vendor.brand_name}
${vendor.phone ? `Phone: ${vendor.phone}` : ''}
${vendor.email ? `Email: ${vendor.email}` : ''}`;

    const emailUrl = `mailto:${invoiceQuotation.customer_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
    setShowShareOptions(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {invoiceQuotation.type === 'invoice' ? 'Invoice' : 'Quotation'} Preview
              </h2>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {invoiceQuotation.number}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onEdit}
                size="sm"
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="p-8 max-h-[calc(90vh-120px)] overflow-y-auto bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {vendor.brand_name || 'Your Business Name'}
                  </h1>
                  <p className="text-gray-600 mb-1">{vendor.category}</p>
                  <p className="text-gray-600 mb-1">{vendor.address}</p>
                  <p className="text-gray-600 mb-1">Phone: {vendor.phone}</p>
                  <p className="text-gray-600">Email: {vendor.email}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {invoiceQuotation.type === 'invoice' ? 'INVOICE' : 'QUOTATION'}
                  </h2>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Number:</span> {invoiceQuotation.number}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(invoiceQuotation.date)}</p>
                    {invoiceQuotation.type === 'invoice' && (
                      <p><span className="font-medium">Due Date:</span> {formatDate(invoiceQuotation.date)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {invoiceQuotation.type === 'invoice' ? 'Bill To:' : 'Quote To:'}
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{invoiceQuotation.customer_name}</p>
                <p className="text-gray-600">{invoiceQuotation.customer_mobile}</p>
                {invoiceQuotation.customer_email && (
                  <p className="text-gray-600">{invoiceQuotation.customer_email}</p>
                )}
              </div>
            </div>

            {/* Services Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                      Rate (₹)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceQuotation.services.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">
                        {service.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-gray-900">
                        {service.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                        {service.rate.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                        {service.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoiceQuotation.subtotal)}</span>
                  </div>
                  {invoiceQuotation.tax_rate && invoiceQuotation.tax_rate > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tax ({invoiceQuotation.tax_rate}%):</span>
                      <span className="font-medium">{formatCurrency(invoiceQuotation.tax_amount || 0)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoiceQuotation.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            {invoiceQuotation.terms && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{invoiceQuotation.terms}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-6">
              <div className="text-center text-gray-600">
                <p>Thank you for your business!</p>
                <p className="text-sm mt-2">
                  For any queries, please contact us at {vendor.phone} or {vendor.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            Document Status: <span className="font-medium capitalize">{invoiceQuotation.status || 'draft'}</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
            <Button onClick={onDownload} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            
            {/* Share Options Dropdown */}
            <div className="relative share-dropdown">
              <Button 
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Send to Customer
              </Button>
              
              {showShareOptions && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">WhatsApp</div>
                        <div className="text-sm text-gray-600">Send via WhatsApp</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-sm text-gray-600">Send via Email</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceQuotationPreview;
