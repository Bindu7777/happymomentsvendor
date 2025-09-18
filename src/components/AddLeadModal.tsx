import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, Save, User, Calendar, DollarSign, MapPin, ArrowRight, ArrowLeft, SkipForward, CheckCircle } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    defaultValues: {
      lead_source: 'website',
      priority: 'medium'
    }
  });

  // Watch phone number and auto-fill WhatsApp number
  const phoneNumber = watch('customer_phone');
  React.useEffect(() => {
    if (phoneNumber && phoneNumber.trim() !== '') {
      setValue('customer_whatsapp', phoneNumber);
    }
  }, [phoneNumber, setValue]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

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

  const validateStep1 = () => {
    // Only customer name and phone are mandatory
    const name = document.querySelector('input[name="customer_name"]') as HTMLInputElement;
    const phone = document.querySelector('input[name="customer_phone"]') as HTMLInputElement;
    
    return name?.value.trim() !== '' && phone?.value.trim() !== '';
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

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return User;
      case 2: return Calendar;
      case 3: return DollarSign;
      default: return User;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Customer Information';
      case 2: return 'Event Details';
      case 3: return 'Budget & Lead Details';
      default: return 'Customer Information';
    }
  };

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
      
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl border-0">
        
        {/* Enhanced Header with Progress */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(getStepIcon(currentStep), { className: "w-6 h-6" })}
              <div>
                <CardTitle className="text-xl font-bold">Add New Lead</CardTitle>
                <p className="text-blue-100 text-sm">Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={fillSampleData}
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all"
              >
                Sample Data
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-white/20 hover:bg-red-500/20 text-white border-white/30 hover:border-red-300/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-white text-blue-600 shadow-lg' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`h-1 w-20 mx-2 rounded-full transition-all duration-300 ${
                      step < currentStep ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-blue-100">
              <span>Customer Info</span>
              <span>Event Details</span>
              <span>Budget & Details</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-gradient-to-br from-gray-50 to-blue-50/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                {error}
              </div>
            )}

            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Customer Information</h3>
                  <p className="text-gray-600 mt-2">Let's start with the basic customer details</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <Input
                      {...register("customer_name", { required: "Customer name is required" })}
                      placeholder="Enter customer name"
                      className="h-12 text-lg rounded-lg border-2 focus:border-blue-500 transition-all"
                    />
                    {errors.customer_name && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.customer_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      {...register("customer_phone", { required: "Phone number is required" })}
                      placeholder="+91 98765 43210"
                      className="h-12 text-lg rounded-lg border-2 focus:border-blue-500 transition-all"
                    />
                    {errors.customer_phone && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.customer_phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Input
                      {...register("customer_whatsapp")}
                      placeholder="+91 98765 43210"
                      className="h-12 rounded-lg border-2 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Address <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Textarea
                      {...register("customer_address")}
                      placeholder="Enter customer address"
                      rows={3}
                      className="rounded-lg border-2 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Event Information */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Event Details</h3>
                  <p className="text-gray-600 mt-2">Tell us about the event <span className="text-sm text-gray-400">(All fields are optional)</span></p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      {...register("event_type")}
                      className="w-full h-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                    >
                      <option value="">Select Event Type</option>
                      <option value="Wedding">Wedding 💒</option>
                      <option value="Birthday Party">Birthday Party 🎂</option>
                      <option value="Anniversary">Anniversary 💕</option>
                      <option value="Corporate Event">Corporate Event 🏢</option>
                      <option value="Engagement">Engagement 💍</option>
                      <option value="Baby Shower">Baby Shower 👶</option>
                      <option value="Other">Other 🎉</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Input
                      {...register("event_date")}
                      type="date"
                      className="h-12 text-lg rounded-lg border-2 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Timeline <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      {...register("event_date_flexibility")}
                      className="w-full h-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                    >
                      <option value="">Select timeline</option>
                      <option value="next_month">Next Month 📅</option>
                      <option value="next_3_months">Next 3 Months 🗓️</option>
                      <option value="next_6_months">Next 6 Months ⏰</option>
                      <option value="next_year">Next Year 📆</option>
                      <option value="flexible">Flexible 🤷‍♀️</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Venue <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Input
                      {...register("event_venue")}
                      placeholder="Enter event venue"
                      className="h-12 text-lg rounded-lg border-2 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Budget & Lead Details */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Budget & Lead Details</h3>
                  <p className="text-gray-600 mt-2">Additional information to help you manage this lead <span className="text-sm text-gray-400">(All fields are optional)</span></p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      {...register("budget_range")}
                      className="w-full h-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                    >
                      <option value="">Select Budget Range</option>
                      <option value="under_25k">Under ₹25,000 💰</option>
                      <option value="25k_50k">₹25,000 - ₹50,000 💵</option>
                      <option value="50k_1l">₹50,000 - ₹1,00,000 💎</option>
                      <option value="1l_2l">₹1,00,000 - ₹2,00,000 💍</option>
                      <option value="2l_5l">₹2,00,000 - ₹5,00,000 👑</option>
                      <option value="above_5l">Above ₹5,00,000 🏆</option>
                      <option value="custom">Custom Range 📝</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Source <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      {...register("lead_source")}
                      className="w-full h-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                    >
                      <option value="website">Website 🌐</option>
                      <option value="referral">Referral 👥</option>
                      <option value="social_media">Social Media 📱</option>
                      <option value="offline">Offline 🤝</option>
                      <option value="phone_call">Phone Call ☎️</option>
                      <option value="whatsapp">WhatsApp 💬</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      {...register("priority")}
                      className="w-full h-12 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                    >
                      <option value="low">Low 🟢</option>
                      <option value="medium">Medium 🟡</option>
                      <option value="high">High 🟠</option>
                      <option value="urgent">Urgent 🔴</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Notes <span className="text-gray-400">(Optional)</span>
                  </label>
                  <Textarea
                    {...register("initial_notes")}
                    placeholder="Add any initial notes about this lead..."
                    rows={4}
                    className="rounded-lg border-2 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
                
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Cancel
                </Button>
              </div>

              <div className="flex gap-3">
                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={skipStep}
                    variant="outline"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !validateStep1()) {
                        setError('Please fill in customer name and phone number before proceeding.');
                        return;
                      }
                      setError('');
                      nextStep();
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding Lead...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create Lead
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default AddLeadModal;
