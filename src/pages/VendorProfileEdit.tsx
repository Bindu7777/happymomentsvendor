import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getLoggedInVendor, submitVendorProfileChange, getVendorPendingChanges } from '../services/supabaseService';
import { Vendor } from '../lib/supabase';
import { CATEGORY_LIST } from '@/constants/categories';

type VendorEditForm = {
  brand_name: string;
  spoc_name: string;
  category: string;
  subcategory?: string;
  phone_number: string;
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  description?: string;
  experience?: string;
  avatar_url?: string;
  cover_image_url?: string;
  specialties?: string[];
  deliverables?: string[];
  currently_available: boolean;
};

const VendorProfileEdit: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<VendorEditForm>();

  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
    control,
    name: "specialties"
  });

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: "deliverables"
  });

  useEffect(() => {
    const loggedInVendor = getLoggedInVendor();
    
    if (!loggedInVendor) {
      navigate('/');
      return;
    }
    
    setVendor(loggedInVendor);
    loadVendorData(loggedInVendor);
    loadPendingChanges(loggedInVendor.vendor_id);
  }, [navigate]);

  const loadVendorData = (vendorData: Vendor) => {
    // Populate form with current vendor data
    Object.keys(vendorData).forEach(key => {
      if (key in vendorData) {
        setValue(key as keyof VendorEditForm, vendorData[key as keyof Vendor]);
      }
    });

    // Handle array fields separately
    if (vendorData.specialties && Array.isArray(vendorData.specialties)) {
      vendorData.specialties.forEach((specialty) => {
        appendSpecialty(specialty);
      });
    }

    if (vendorData.deliverables && Array.isArray(vendorData.deliverables)) {
      vendorData.deliverables.forEach((deliverable) => {
        appendDeliverable(deliverable);
      });
    }

    setLoading(false);
  };

  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const onSubmit = async (data: VendorEditForm) => {
    if (!vendor) return;

    setSubmitting(true);
    setSubmitMessage('');

    try {
      // Prepare current data and proposed changes
      const currentData = {
        brand_name: vendor.brand_name,
        spoc_name: vendor.spoc_name,
        category: vendor.category,
        subcategory: vendor.subcategory,
        phone_number: vendor.phone_number,
        whatsapp_number: vendor.whatsapp_number,
        email: vendor.email,
        instagram: vendor.instagram,
        address: vendor.address,
        description: vendor.description,
        experience: vendor.experience,
        avatar_url: vendor.avatar_url,
        cover_image_url: vendor.cover_image_url,
        specialties: vendor.specialties,
        deliverables: vendor.deliverables,
        currently_available: vendor.currently_available,
      };

      const proposedChanges = {
        ...data,
        specialties: data.specialties?.filter(s => s && s.trim() !== '') || [],
        deliverables: data.deliverables?.filter(d => d && d.trim() !== '') || [],
      };

      // Submit for approval
      const result = await submitVendorProfileChange(
        vendor.vendor_id,
        'profile_update',
        currentData,
        proposedChanges
      );

      if (result.success) {
        setSubmitSuccess(true);
        setSubmitMessage(result.message || 'Changes submitted successfully');
        // Reload pending changes
        loadPendingChanges(vendor.vendor_id);
      } else {
        setSubmitSuccess(false);
        setSubmitMessage(result.message || 'Failed to submit changes');
      }
    } catch (error) {
      console.error('Error submitting changes:', error);
      setSubmitSuccess(false);
      setSubmitMessage('An error occurred while submitting changes');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to edit your profile.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/vendor-dashboard')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-gray-600">Changes require admin approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Changes Alert */}
        {pendingChanges.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    You have {pendingChanges.length} change{pendingChanges.length > 1 ? 's' : ''} pending admin approval
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your changes will be reviewed and applied once approved by admin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success/Error Message */}
        {submitMessage && (
          <Card className={`mb-6 ${submitSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {submitSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`font-medium ${submitSuccess ? 'text-green-800' : 'text-red-800'}`}>
                  {submitMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name *
                  </label>
                  <Input
                    {...register("brand_name", { required: "Brand name is required" })}
                    placeholder="Enter brand name"
                  />
                  {errors.brand_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.brand_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <Input
                    {...register("spoc_name", { required: "Contact person name is required" })}
                    placeholder="Enter contact person name"
                  />
                  {errors.spoc_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.spoc_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {CATEGORY_LIST.map((category) => (
                      <option key={category.code} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <Input
                    {...register("subcategory")}
                    placeholder="Enter subcategory (optional)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    {...register("phone_number", { required: "Phone number is required" })}
                    placeholder="Enter phone number"
                  />
                  {errors.phone_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <Input
                    {...register("whatsapp_number")}
                    placeholder="Enter WhatsApp number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    {...register("email", {
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                    type="email"
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Handle
                  </label>
                  <Input
                    {...register("instagram")}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <Textarea
                  {...register("address")}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <Input
                    {...register("experience")}
                    placeholder="e.g., 5+ Years"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    {...register("currently_available")}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Currently Available for Bookings
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <Input
                  {...register("avatar_url")}
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <Input
                  {...register("cover_image_url")}
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  {...register("description")}
                  placeholder="Describe your services and experience"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Specialties</span>
                <Button
                  type="button"
                  onClick={() => appendSpecialty("")}
                  variant="outline"
                  size="sm"
                >
                  Add Specialty
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {specialtyFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`specialties.${index}` as const)}
                      placeholder="Enter specialty"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Deliverables</span>
                <Button
                  type="button"
                  onClick={() => appendDeliverable("")}
                  variant="outline"
                  size="sm"
                >
                  Add Deliverable
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deliverableFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`deliverables.${index}` as const)}
                      placeholder="Enter what you will deliver"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting for Approval...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Submit Changes for Approval
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfileEdit;
