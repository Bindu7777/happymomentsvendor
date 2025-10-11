import React from 'react';
import { X, User, Phone, MessageCircle, MapPin, Calendar, DollarSign, FileText, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface CustomerDetailsModalProps {
  lead: any;
  onClose: () => void;
  onLeadUpdated: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ lead, onClose, onLeadUpdated }) => {

  const handleWhatsAppChat = () => {
    const phoneNumber = lead.customer_whatsapp || lead.customer_phone;
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const message = `Hi ${lead.customer_name}, this is regarding your ${lead.event_type || 'event'} inquiry. How can I help you?`;
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTimeline = (timeline: string) => {
    if (!timeline) return 'Not specified';
    return timeline.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatBudget = (budgetRange: string, budgetMin?: number, budgetMax?: number) => {
    if (budgetRange) {
      return budgetRange.replace('_', ' - ').replace('k', 'K').replace('l', 'L');
    }
    if (budgetMin) {
      return `₹${budgetMin.toLocaleString()}${budgetMax && budgetMax !== budgetMin ? `-${budgetMax.toLocaleString()}` : ''}`;
    }
    return 'Not specified';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lead.customer_name}</h2>
              <p className="text-gray-600">{lead.event_type || 'Event Type TBD'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>View Only</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{lead.customer_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <p className="px-3 py-2 bg-gray-50 rounded-md flex-1">{lead.customer_phone}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${lead.customer_phone}`)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <div className="flex items-center gap-2">
                  <p className="px-3 py-2 bg-gray-50 rounded-md flex-1">
                    {lead.customer_whatsapp || 'Not provided'}
                  </p>
                  {(lead.customer_whatsapp || lead.customer_phone) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleWhatsAppChat}
                      className="text-green-600 hover:text-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {lead.customer_address || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Event Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {lead.event_type || 'Not specified'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {formatDate(lead.event_date)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Timeline
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {formatTimeline(lead.event_date_flexibility)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Venue
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {lead.event_venue || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Lead Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Range
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {formatBudget(lead.budget_range, lead.budget_min, lead.budget_max)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">
                  {lead.lead_source || 'Website'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md capitalize">
                  {lead.priority || 'Medium'}
                </p>
              </div>

              {/* Deal Amount - Only show if status is confirmed or later */}
              {(lead.status === 'confirmed_booking' || lead.status === 'advance_received' || lead.status === 'completed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Amount
                  </label>
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {lead.deal_amount ? 
                      `₹${lead.deal_amount.toLocaleString()}` : 
                      'Not specified'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Notes & Communication
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Notes
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">
                  {lead.initial_notes || 'No initial notes'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Notes
                </label>
                <p className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">
                  {lead.follow_up_notes || 'No follow-up notes'}
                </p>
              </div>
            </div>
          </div>

          {/* Lead Stats */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Lead Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <p className="font-medium">{new Date(lead.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Contact:</span>
                <p className="font-medium">
                  {lead.last_contact_date ? 
                    new Date(lead.last_contact_date).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-600">Contact Count:</span>
                <p className="font-medium">{lead.contact_count || 0} times</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium capitalize">{lead.status.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
