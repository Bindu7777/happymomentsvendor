import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Save, User, Calendar, DollarSign, MapPin } from 'lucide-react';
import { addVendorLead } from '../services/supabaseService';

interface AddLeadModalProps {
  vendorId: number;
  onClose: () => void;
  onLeadAdded: () => void;
}

type LeadFormData = {
  customer_name: string;        // Mandatory
  customer_phone: string;       // Mandatory (mobile)
  customer_whatsapp?: string;   // Optional
  customer_address?: string;    // Optional
  event_type?: string;          // Optional
  event_date?: string;          // Optional
  event_date_flexibility?: string; // Optional
  event_venue?: string;         // Optional
  budget_range?: string;        // Optional
  lead_source?: string;         // Optional
  priority?: string;            // Optional
  initial_notes?: string;       // Optional
};

const AddLeadModal: React.FC<AddLeadModalProps> = ({ vendorId, onClose, onLeadAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LeadFormData>({
    defaultValues: {
      lead_source: 'website',
      priority: 'medium'
    }
  });

  const fillSampleData = () => {
    const sampleData: LeadFormData = {
      customer_name: "Rajesh & Priya Wedding",
      customer_phone: "+91 98765 43210",
      customer_whatsapp: "+91 98765 43210",
      customer_address: "Jubilee Hills, Hyderabad, Telangana",
      event_type: "Wedding",
      event_date_flexibility: "next_3_months",
      event_venue: "Taj Krishna Hotel, Hyderabad",
      budget_range: "50k_1l",
      lead_source: "website",
      priority: "high",
      initial_notes: "Looking for traditional + candid photography. Prefer experienced photographer with good portfolio. Budget is flexible for quality work."
    };

    Object.keys(sampleData).forEach(key => {
      setValue(key as keyof LeadFormData, sampleData[key as keyof LeadFormData]);
    });
  };

  const onSubmit = async (data: LeadFormData) => {
    setLoading(true);
    setError('');

    try {
      // Clean the data - convert empty strings to null for optional fields
      const leadData = {
        vendor_id: vendorId,
        customer_name: data.customer_name, // Mandatory
        customer_phone: data.customer_phone, // Mandatory
        status: 'new_lead',
        // Convert empty strings to null for optional fields
        event_type: data.event_type && data.event_type.trim() !== '' ? data.event_type : null,
        event_date: data.event_date && data.event_date.trim() !== '' ? data.event_date : null,
        event_date_flexibility: data.event_date_flexibility && data.event_date_flexibility.trim() !== '' ? data.event_date_flexibility : null,
        customer_whatsapp: data.customer_whatsapp && data.customer_whatsapp.trim() !== '' ? data.customer_whatsapp : null,
        customer_address: data.customer_address && data.customer_address.trim() !== '' ? data.customer_address : null,
        event_venue: data.event_venue && data.event_venue.trim() !== '' ? data.event_venue : null,
        budget_range: data.budget_range && data.budget_range.trim() !== '' ? data.budget_range : null,
        lead_source: data.lead_source && data.lead_source.trim() !== '' ? data.lead_source : 'website',
        priority: data.priority && data.priority.trim() !== '' ? data.priority : 'medium',
        initial_notes: data.initial_notes && data.initial_notes.trim() !== '' ? data.initial_notes : null,
      };

      console.log('Cleaned lead data:', leadData);
      const result = await addVendorLead(leadData);

      if (result.success) {
        reset();
        onLeadAdded(); // Refresh the leads list
        onClose(); // Close the modal
      } else {
        setError(result.message || 'Failed to add lead');
      }
    } catch (error) {
      console.error('Error adding lead:', error);
      setError('An error occurred while adding the lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Add New Lead
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={fillSampleData}
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            >
              Sample Data
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Customer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <Input
                    {...register("customer_name", { required: "Customer name is required" })}
                    placeholder="Enter customer name"
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <Input
                    {...register("customer_phone", { required: "Phone number is required" })}
                    placeholder="+91 98765 43210"
                  />
                  {errors.customer_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_phone.message}</p>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <Input
                    {...register("customer_whatsapp")}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Address
                </label>
                <Textarea
                  {...register("customer_address")}
                  placeholder="Enter customer address"
                  rows={2}
                />
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Event Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    {...register("event_type")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Event Type (Optional)</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Birthday Party">Birthday Party</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Engagement">Engagement</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date (Optional)
                  </label>
                  <Input
                    {...register("event_date")}
                    type="date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Timeline (Optional)
                  </label>
                  <select
                    {...register("event_date_flexibility")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select timeline (Optional)</option>
                    <option value="next_month">Next Month</option>
                    <option value="next_3_months">Next 3 Months</option>
                    <option value="next_6_months">Next 6 Months</option>
                    <option value="next_year">Next Year</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Venue
                  </label>
                  <Input
                    {...register("event_venue")}
                    placeholder="Enter event venue"
                  />
                </div>
              </div>
            </div>

            {/* Budget & Lead Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Budget & Lead Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <select
                    {...register("budget_range")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Budget Range</option>
                    <option value="under_25k">Under ₹25,000</option>
                    <option value="25k_50k">₹25,000 - ₹50,000</option>
                    <option value="50k_1l">₹50,000 - ₹1,00,000</option>
                    <option value="1l_2l">₹1,00,000 - ₹2,00,000</option>
                    <option value="2l_5l">₹2,00,000 - ₹5,00,000</option>
                    <option value="above_5l">Above ₹5,00,000</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    {...register("lead_source")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="offline">Offline</option>
                    <option value="phone_call">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Notes
                </label>
                <Textarea
                  {...register("initial_notes")}
                  placeholder="Add any initial notes about this lead..."
                  rows={3}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Lead...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Add Lead
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddLeadModal;
