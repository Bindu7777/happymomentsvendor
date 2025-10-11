import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Phone, Send, X } from 'lucide-react';

interface AdminSendCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    vendor_id: number;
    brand_name: string;
    spoc_name: string;
    category: string;
  };
  onSendCustomer: (customerData: { name: string; phone: string }) => Promise<void>;
}

const AdminSendCustomerModal: React.FC<AdminSendCustomerModalProps> = ({
  isOpen,
  onClose,
  vendor,
  onSendCustomer
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Don't render if vendor is null
  if (!vendor) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    
    if (!customerPhone.trim()) {
      setError('Customer phone number is required');
      return;
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerPhone.replace(/\D/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSendCustomer({
        name: customerName.trim(),
        phone: customerPhone.trim()
      });
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      onClose();
    } catch (error) {
      setError('Failed to send customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCustomerName('');
      setCustomerPhone('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-orange-600" />
            Send Customer to Vendor
          </DialogTitle>
        </DialogHeader>

        {/* Vendor Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Target Vendor:</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{vendor.brand_name}</p>
              <p className="text-sm text-gray-600">{vendor.spoc_name} • {vendor.category}</p>
            </div>
          </div>
        </div>

        {/* Customer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Name *
            </Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer full name"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="customerPhone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter 10-digit phone number"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Customer
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> This will create a contact record and notify the vendor about the new customer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSendCustomerModal;
