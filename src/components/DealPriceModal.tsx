import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, DollarSign, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DealPriceModalProps {
  lead: any;
  onClose: () => void;
  onConfirm: (dealAmount: number) => void;
}

type DealPriceFormData = {
  deal_amount: string;
};

const DealPriceModal: React.FC<DealPriceModalProps> = ({ lead, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<DealPriceFormData>({
    defaultValues: {
      deal_amount: lead.deal_amount ? lead.deal_amount.toString() : '',
    }
  });

  const dealAmountValue = watch('deal_amount');

  const onSubmit = async (data: DealPriceFormData) => {
    setLoading(true);
    setError('');

    try {
      const dealAmount = parseFloat(data.deal_amount);
      
      if (isNaN(dealAmount) || dealAmount <= 0) {
        setError('Please enter a valid deal amount');
        setLoading(false);
        return;
      }

      await onConfirm(dealAmount);
      onClose();
    } catch (error) {
      console.error('Error confirming deal:', error);
      setError('Error confirming deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Confirm Deal</h2>
              <p className="text-sm text-gray-600">{lead.customer_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Lead Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Lead Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div><strong>Event:</strong> {lead.event_type || 'Not specified'}</div>
              <div><strong>Date:</strong> {
                lead.event_date ? 
                  new Date(lead.event_date).toLocaleDateString() : 
                  lead.event_date_flexibility ? 
                    lead.event_date_flexibility.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                    'TBD'
              }</div>
              <div><strong>Budget Range:</strong> {
                lead.budget_range ? 
                  lead.budget_range.replace('_', ' - ').replace('k', 'K').replace('l', 'L') : 
                  'Not specified'
              }</div>
            </div>
          </div>

          {/* Deal Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deal Amount (Final Agreed Price) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <Input
                {...register("deal_amount", { 
                  required: "Deal amount is required",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Please enter a valid amount (e.g., 50000 or 50000.50)"
                  }
                })}
                type="text"
                placeholder="50000"
                className="pl-8"
              />
            </div>
            {dealAmountValue && !isNaN(parseFloat(dealAmountValue)) && (
              <p className="mt-1 text-sm text-gray-600">
                Amount: ₹{formatCurrency(dealAmountValue)}
              </p>
            )}
            {errors.deal_amount && (
              <p className="mt-1 text-sm text-red-600">{errors.deal_amount.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Confirming...' : 'Confirm Deal'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This will mark the lead as "Confirmed Booking" with the specified deal amount.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DealPriceModal;
