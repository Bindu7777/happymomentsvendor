import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, Phone, MessageCircle, MapPin, Calendar, DollarSign, FileText, Edit2, Save, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { updateVendorLead } from '../services/supabaseService';

interface CustomerDetailsModalProps {
  lead: any;
  onClose: () => void;
  onLeadUpdated: () => void;
}

type LeadFormData = {
  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string;
  customer_address?: string;
  event_type?: string;
  event_date?: string;
  event_date_flexibility?: string;
  event_venue?: string;
  budget_range?: string;
  budget_min?: string;
  budget_max?: string;
  lead_source?: string;
  priority?: string;
  initial_notes?: string;
  follow_up_notes?: string;
  deal_amount?: string;
};

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ lead, onClose, onLeadUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LeadFormData>({
    defaultValues: {
      customer_name: lead.customer_name || '',
      customer_phone: lead.customer_phone || '',
      customer_whatsapp: lead.customer_whatsapp || '',
      customer_address: lead.customer_address || '',
      event_type: lead.event_type || '',
      event_date: lead.event_date || '',
      event_date_flexibility: lead.event_date_flexibility || '',
      event_venue: lead.event_venue || '',
      budget_range: lead.budget_range || '',
      budget_min: lead.budget_min?.toString() || '',
      budget_max: lead.budget_max?.toString() || '',
      lead_source: lead.lead_source || 'website',
      priority: lead.priority || 'medium',
      initial_notes: lead.initial_notes || '',
      follow_up_notes: lead.follow_up_notes || '',
      deal_amount: lead.deal_amount ? lead.deal_amount.toString() : '',
    }
  });

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    setError('');

    try {
      // Clean the data - convert empty strings to null for optional fields
      const updatedData = {
        ...data,
        // Convert empty strings to null for optional fields
        customer_whatsapp: data.customer_whatsapp && data.customer_whatsapp.trim() !== '' ? data.customer_whatsapp : null,
        customer_address: data.customer_address && data.customer_address.trim() !== '' ? data.customer_address : null,
        event_type: data.event_type && data.event_type.trim() !== '' ? data.event_type : null,
        event_date: data.event_date && data.event_date.trim() !== '' ? data.event_date : null,
        event_date_flexibility: data.event_date_flexibility && data.event_date_flexibility.trim() !== '' ? data.event_date_flexibility : null,
        event_venue: data.event_venue && data.event_venue.trim() !== '' ? data.event_venue : null,
        budget_range: data.budget_range && data.budget_range.trim() !== '' ? data.budget_range : null,
        budget_min: data.budget_min && data.budget_min.trim() !== '' ? parseFloat(data.budget_min) : null,
        budget_max: data.budget_max && data.budget_max.trim() !== '' ? parseFloat(data.budget_max) : null,
        lead_source: data.lead_source && data.lead_source.trim() !== '' ? data.lead_source : 'website',
        priority: data.priority && data.priority.trim() !== '' ? data.priority : 'medium',
        initial_notes: data.initial_notes && data.initial_notes.trim() !== '' ? data.initial_notes : null,
        follow_up_notes: data.follow_up_notes && data.follow_up_notes.trim() !== '' ? data.follow_up_notes : null,
        deal_amount: data.deal_amount && data.deal_amount.trim() !== '' ? parseFloat(data.deal_amount) : null,
      };

      console.log('Updating lead with data:', updatedData);
      const result = await updateVendorLead(lead.id, updatedData);

      if (result.success) {
        setIsEditing(false);
        onLeadUpdated();
      } else {
        setError(result.error || 'Failed to update customer details');
      }
    } catch (error) {
      console.error('Error updating customer details:', error);
      setError('Error updating customer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                {isEditing ? (
                  <Input
                    {...register("customer_name", { required: "Customer name is required" })}
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">{lead.customer_name}</p>
                )}
                {errors.customer_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                {isEditing ? (
                  <Input
                    {...register("customer_phone", { required: "Phone number is required" })}
                    placeholder="+91 98765 43210"
                  />
                ) : (
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
                )}
                {errors.customer_phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.customer_phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                {isEditing ? (
                  <Input
                    {...register("customer_whatsapp")}
                    placeholder="+91 98765 43210"
                  />
                ) : (
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
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                {isEditing ? (
                  <Input
                    {...register("customer_address")}
                    placeholder="Customer address"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {lead.customer_address || 'Not provided'}
                  </p>
                )}
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
                {isEditing ? (
                  <select
                    {...register("event_type")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Event Type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {lead.event_type || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                {isEditing ? (
                  <Input
                    {...register("event_date")}
                    type="date"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatDate(lead.event_date)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Timeline
                </label>
                {isEditing ? (
                  <select
                    {...register("event_date_flexibility")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="next_month">Next Month</option>
                    <option value="next_3_months">Next 3 Months</option>
                    <option value="next_6_months">Next 6 Months</option>
                    <option value="next_year">Next Year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatTimeline(lead.event_date_flexibility)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Venue
                </label>
                {isEditing ? (
                  <Input
                    {...register("event_venue")}
                    placeholder="Event venue"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {lead.event_venue || 'Not specified'}
                  </p>
                )}
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
                {isEditing ? (
                  <select
                    {...register("budget_range")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="under_25k">Under ₹25K</option>
                    <option value="25k_50k">₹25K - ₹50K</option>
                    <option value="50k_1l">₹50K - ₹1L</option>
                    <option value="1l_2l">₹1L - ₹2L</option>
                    <option value="2l_5l">₹2L - ₹5L</option>
                    <option value="above_5l">Above ₹5L</option>
                    <option value="custom">Custom Range</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {formatBudget(lead.budget_range, lead.budget_min, lead.budget_max)}
                  </p>
                )}
              </div>

              {/* Custom Budget Fields */}
              {isEditing && watch('budget_range') === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Budget (₹)
                    </label>
                    <Input
                      {...register("budget_min")}
                      type="number"
                      placeholder="25000"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Budget (₹)
                    </label>
                    <Input
                      {...register("budget_max")}
                      type="number"
                      placeholder="50000"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Source
                </label>
                {isEditing ? (
                  <select
                    {...register("lead_source")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="offline">Offline</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md">
                    {lead.lead_source || 'Website'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    {...register("priority")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md capitalize">
                    {lead.priority || 'Medium'}
                  </p>
                )}
              </div>

              {/* Deal Amount - Only show if status is confirmed or later */}
              {(lead.status === 'confirmed_booking' || lead.status === 'advance_received' || lead.status === 'completed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Amount
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <Input
                        {...register("deal_amount", {
                          pattern: {
                            value: /^\d+(\.\d{1,2})?$/,
                            message: "Please enter a valid amount"
                          }
                        })}
                        type="text"
                        placeholder="50000"
                        className="pl-8"
                      />
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 rounded-md">
                      {lead.deal_amount ? 
                        `₹${lead.deal_amount.toLocaleString()}` : 
                        'Not specified'
                      }
                    </p>
                  )}
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
                {isEditing ? (
                  <textarea
                    {...register("initial_notes")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Initial conversation notes..."
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">
                    {lead.initial_notes || 'No initial notes'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Notes
                </label>
                {isEditing ? (
                  <textarea
                    {...register("follow_up_notes")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Follow-up notes and updates..."
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md min-h-[100px]">
                    {lead.follow_up_notes || 'No follow-up notes'}
                  </p>
                )}
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
        </form>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
