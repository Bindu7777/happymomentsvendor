import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, Save, Download, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { createInvoiceQuotation, generateDocumentNumber, calculateTotals, ServiceItem, InvoiceQuotation } from '../services/invoiceService';

interface InvoiceQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceQuotation: InvoiceQuotation) => void;
  vendor: any;
  type: 'invoice' | 'quotation';
  editData?: InvoiceQuotation | null;
}

const InvoiceQuotationModal: React.FC<InvoiceQuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vendor,
  type,
  editData
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_mobile: '',
    customer_email: '',
    services: [] as ServiceItem[],
    terms: '',
    template_id: 'template-1',
    tax_rate: 18
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (editData) {
      setFormData({
        customer_name: editData.customer_name || '',
        customer_mobile: editData.customer_mobile || '',
        customer_email: editData.customer_email || '',
        services: editData.services || [],
        terms: editData.terms || '',
        template_id: editData.template_id || 'template-1',
        tax_rate: editData.tax_rate || 18
      });
    } else {
      setFormData({
        customer_name: '',
        customer_mobile: '',
        customer_email: '',
        services: [],
        terms: type === 'invoice' 
          ? 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
          : 'This quotation is valid for 30 days from the date of issue. Prices are subject to change without notice.',
        template_id: 'template-1',
        tax_rate: 18
      });
    }
  }, [editData, type, isOpen]);

  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (id: string, field: keyof ServiceItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map(service => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return service;
      })
    }));
  };

  const handleRateChange = (id: string, value: string) => {
    // Remove leading zeros and convert to number
    const numericValue = parseFloat(value.replace(/^0+/, '') || '0');
    updateService(id, 'rate', numericValue);
  };

  const handleQuantityChange = (id: string, value: string) => {
    // Remove leading zeros and convert to number
    const numericValue = parseFloat(value.replace(/^0+/, '') || '0');
    updateService(id, 'quantity', numericValue);
  };

  const loadSampleData = () => {
    setFormData({
      customer_name: 'John & Sarah Wedding',
      customer_mobile: '+91 98765 43210',
      customer_email: 'john.sarah@example.com',
      services: [
        {
          id: '1',
          description: 'Wedding Photography Package',
          quantity: 1,
          rate: 50000,
          amount: 50000
        },
        {
          id: '2',
          description: 'Pre-wedding Shoot',
          quantity: 1,
          rate: 25000,
          amount: 25000
        },
        {
          id: '3',
          description: 'Wedding Album (Premium)',
          quantity: 1,
          rate: 15000,
          amount: 15000
        }
      ],
      terms: type === 'invoice' 
        ? 'Payment is due within 30 days of invoice date. Late payments may incur additional charges. All services include post-processing and delivery within 30 days.'
        : 'This quotation is valid for 30 days from the date of issue. Prices are subject to change without notice. Advance payment of 50% required to confirm booking.',
      template_id: 'template-1',
      tax_rate: 18
    });
    setErrors({});
  };

  const removeService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required';
    }

    if (!formData.customer_mobile.trim()) {
      newErrors.customer_mobile = 'Customer mobile is required';
    }

    if (formData.services.length === 0) {
      newErrors.services = 'At least one service item is required';
    }

    formData.services.forEach((service, index) => {
      if (!service.description.trim()) {
        newErrors[`service_${index}_description`] = 'Service description is required';
      }
      if (service.quantity <= 0) {
        newErrors[`service_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (service.rate < 0) {
        newErrors[`service_${index}_rate`] = 'Rate cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`) || 
                      document.querySelector(`[data-error="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      console.log('Vendor data:', vendor);
      console.log('Form data:', formData);
      
      const totals = calculateTotals(formData.services, formData.tax_rate);
      console.log('Calculated totals:', totals);
      
      const documentNumber = editData?.number || await generateDocumentNumber(type, vendor.vendor_id);
      console.log('Generated document number:', documentNumber);

      const invoiceQuotationData: Omit<InvoiceQuotation, 'id' | 'created_at' | 'updated_at'> = {
        type,
        vendor_id: typeof vendor.vendor_id === 'string' ? parseInt(vendor.vendor_id) : vendor.vendor_id,
        customer_name: formData.customer_name.trim(),
        customer_mobile: formData.customer_mobile.trim(),
        customer_email: formData.customer_email?.trim() || '',
        services: formData.services.map(service => ({
          ...service,
          description: service.description.trim()
        })),
        terms: formData.terms.trim(),
        number: documentNumber,
        date: editData?.date || new Date().toISOString(),
        template_id: formData.template_id,
        subtotal: totals.subtotal,
        tax_rate: formData.tax_rate,
        tax_amount: totals.taxAmount,
        total_amount: totals.total,
        status: editData?.status || 'draft'
      };

      console.log('Saving invoice/quotation:', invoiceQuotationData);
      const result = await createInvoiceQuotation(invoiceQuotationData);
      
      if (result.success && result.data) {
        console.log('Successfully saved:', result.data);
        onSave(result.data);
        onClose();
      } else {
        console.error('Failed to save:', result.error);
        setErrors({ general: result.error || 'Failed to save. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const totals = calculateTotals(formData.services, formData.tax_rate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                {editData ? 'Edit' : 'Create'} {type === 'invoice' ? 'Invoice' : 'Quotation'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!editData && (
                <Button
                  onClick={loadSampleData}
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  📋 Sample Data
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* General Error Display */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 font-medium">{errors.general}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Customer Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <Input
                      value={formData.customer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      placeholder="Enter customer name"
                      className={errors.customer_name ? 'border-red-500' : ''}
                    />
                    {errors.customer_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <Input
                      value={formData.customer_mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_mobile: e.target.value }))}
                      placeholder="Enter mobile number"
                      className={errors.customer_mobile ? 'border-red-500' : ''}
                    />
                    {errors.customer_mobile && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_mobile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <Input
                      value={formData.customer_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      placeholder="Enter email address"
                      type="email"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Services / Items</CardTitle>
                    <Button onClick={addService} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.services.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No services added yet</p>
                      <p className="text-sm">Click "Add Item" to get started</p>
                    </div>
                  ) : (
                    formData.services.map((service, index) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                          <Button
                            onClick={() => removeService(service.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <Input
                            value={service.description}
                            onChange={(e) => updateService(service.id, 'description', e.target.value)}
                            placeholder="Enter service description"
                            className={errors[`service_${index}_description`] ? 'border-red-500' : ''}
                          />
                          {errors[`service_${index}_description`] && (
                            <p className="text-red-500 text-sm mt-1">{errors[`service_${index}_description`]}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Qty *
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={service.quantity === 0 ? '' : service.quantity}
                              onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                              className={errors[`service_${index}_quantity`] ? 'border-red-500' : ''}
                              placeholder="1"
                            />
                            {errors[`service_${index}_quantity`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`service_${index}_quantity`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rate (₹) *
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={service.rate === 0 ? '' : service.rate}
                              onChange={(e) => handleRateChange(service.id, e.target.value)}
                              className={errors[`service_${index}_rate`] ? 'border-red-500' : ''}
                              placeholder="0.00"
                            />
                            {errors[`service_${index}_rate`] && (
                              <p className="text-red-500 text-xs mt-1">{errors[`service_${index}_rate`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Amount (₹)
                            </label>
                            <Input
                              value={service.amount.toFixed(2)}
                              disabled
                              className="bg-gray-50 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {errors.services && (
                    <p className="text-red-500 text-sm">{errors.services}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Totals & Settings */}
            <div className="space-y-6">
              {/* Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Rate (%):</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-right"
                    />
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Amount:</span>
                    <span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>₹{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Enter terms and conditions"
                    rows={6}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={formData.template_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="template-1">Modern {type === 'invoice' ? 'Invoice' : 'Quotation'}</option>
                    <option value="template-2">Classic {type === 'invoice' ? 'Invoice' : 'Quotation'}</option>
                    <option value="template-3">Elegant {type === 'invoice' ? 'Invoice' : 'Quotation'}</option>
                  </select>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            {editData ? 'Editing existing document' : 'Creating new document'}
          </div>
          <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <Button 
              onClick={onClose} 
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none min-w-[120px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">
                {editData ? 'Update' : 'Save'} {type === 'invoice' ? 'Invoice' : 'Quotation'}
              </span>
              <span className="sm:hidden">
                {editData ? 'Update' : 'Save'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceQuotationModal;
