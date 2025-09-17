import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getLoggedInVendor, submitVendorProfileChange, getVendorPendingChanges, getVendorMedia, updateVendorCatalogImages, getVendorByFieldId, saveVendorSession, refreshVendorSession } from '../services/supabaseService';
import { Vendor } from '../lib/supabase';
import { CATEGORY_LIST } from '@/constants/categories';

type VendorEditForm = {
  // Basic Information
  brand_name: string;
  spoc_name: string;
  category: string;
  subcategory?: string;
  
  // Contact Information
  phone_number: string;
  alternate_number?: string;  // Admin-only field
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  
  // Business Details
  description?: string;
  experience?: string;
  avatar_url?: string;
  cover_image_url?: string;
  
  // JSON Fields
  specialties?: string[];
  services?: Array<{
    name: string;
    description: string;
    price?: string;
  }>;
  packages?: Array<{
    name: string;
    price: string;
    description: string;
    features: string[];
  }>;
  deliverables?: string[];
  catalog_images?: string[];
  customer_reviews?: Array<{
    customer_name: string;
    rating: number;
    review: string;
    date: string;
  }>;
  booking_policies?: {
    cancellation_policy?: string;
    payment_terms?: string;
    booking_requirements?: string;
  };
  additional_info?: {
    working_hours?: string;
    languages?: string[];
    awards?: string[];
    certifications?: string[];
    custom_fields?: Array<{
      field_name: string;
      field_value: string;
    }>;
  };
  
  // Status Fields
  currently_available: boolean;
};

const VendorProfileEdit: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<VendorEditForm>({
    defaultValues: {
      brand_name: '',
      spoc_name: '',
      category: '',
      subcategory: '',
      phone_number: '',
      alternate_number: '',
      whatsapp_number: '',
      email: '',
      instagram: '',
      address: '',
      description: '',
      experience: '',
      avatar_url: '',
      cover_image_url: '',
      specialties: [],
      services: [],
      packages: [],
      deliverables: [],
      catalog_images: [],
      customer_reviews: [],
      booking_policies: {
        cancellation_policy: '',
        payment_terms: '',
        booking_requirements: ''
      },
      additional_info: {
        working_hours: '',
        languages: [],
        awards: [],
        certifications: [],
        custom_fields: []
      },
      currently_available: false
    }
  });

  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
    control,
    name: "specialties" as any
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: "services" as any
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control,
    name: "packages" as any
  });

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: "deliverables" as any
  });

  const { fields: catalogImageFields, append: appendCatalogImage, remove: removeCatalogImage } = useFieldArray({
    control,
    name: "catalog_images" as any
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control,
    name: "customer_reviews" as any
  });

  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: "additional_info.custom_fields" as any
  });

  useEffect(() => {
    const initializeVendorData = async () => {
      const loggedInVendor = getLoggedInVendor();
      
      if (!loggedInVendor) {
        navigate('/');
        return;
      }

      try {
        // Always fetch fresh data from database to ensure we have the latest approved changes
        console.log('Refreshing vendor data for profile edit...');
        const freshVendorData = await refreshVendorSession();
        const vendorToUse = freshVendorData || loggedInVendor;
        
        console.log('Using vendor data:', vendorToUse);
        setVendor(vendorToUse);
        loadVendorData(vendorToUse);
        loadPendingChanges(parseInt(vendorToUse.vendor_id));
        loadCatalogImages(vendorToUse.vendor_id);
      } catch (error) {
        console.error('Error refreshing vendor data:', error);
        // Fallback to localStorage data
        setVendor(loggedInVendor);
        loadVendorData(loggedInVendor);
        loadPendingChanges(parseInt(loggedInVendor.vendor_id));
        loadCatalogImages(loggedInVendor.vendor_id);
      }
    };

    initializeVendorData();
  }, [navigate]);

  const loadVendorData = (vendorData: Vendor) => {
    console.log('Loading vendor data:', vendorData);
    
    // Helper function to check if an object/array is effectively empty
    const isEffectivelyEmpty = (value: any): boolean => {
      if (value === null || value === undefined) return true;
      if (value === '') return true;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return true;
        return keys.every(key => {
          const v = value[key];
          return v === '' || v === null || v === undefined || 
            (Array.isArray(v) && v.length === 0) ||
            (typeof v === 'object' && v !== null && isEffectivelyEmpty(v));
        });
      }
      return false;
    };
    
    // Explicitly set all form values with current vendor data
    setValue('brand_name', vendorData.brand_name || '');
    setValue('spoc_name', vendorData.spoc_name || '');
    setValue('category', vendorData.category || '');
    setValue('subcategory', vendorData.subcategory || '');
    setValue('phone_number', vendorData.phone_number || '');
    setValue('alternate_number', vendorData.alternate_number || '');
    setValue('whatsapp_number', vendorData.whatsapp_number || '');
    setValue('email', vendorData.email || '');
    setValue('instagram', vendorData.instagram || '');
    setValue('address', vendorData.address || '');
    setValue('description', vendorData.description || '');
    setValue('experience', vendorData.experience || '');
    setValue('avatar_url', vendorData.avatar_url || '');
    setValue('cover_image_url', vendorData.cover_image_url || '');
    setValue('currently_available', vendorData.currently_available || false);
    
    // Set booking policies - only if they exist
    if (vendorData.booking_policies && !isEffectivelyEmpty(vendorData.booking_policies)) {
      setValue('booking_policies.cancellation_policy', vendorData.booking_policies.cancellation_policy || '');
      setValue('booking_policies.payment_terms', vendorData.booking_policies.payment_terms || '');
      setValue('booking_policies.booking_requirements', vendorData.booking_policies.booking_requirements || '');
    }
    
    // Set additional info - only if it exists
    if (vendorData.additional_info && !isEffectivelyEmpty(vendorData.additional_info)) {
      setValue('additional_info.working_hours', vendorData.additional_info.working_hours || '');
      setValue('additional_info.languages', vendorData.additional_info.languages || []);
      setValue('additional_info.awards', vendorData.additional_info.awards || []);
      setValue('additional_info.certifications', vendorData.additional_info.certifications || []);
    }

    // Handle array fields separately - only append if data exists
    if (vendorData.specialties && Array.isArray(vendorData.specialties) && vendorData.specialties.length > 0) {
      vendorData.specialties.forEach((specialty) => {
        if (specialty && specialty.trim() !== '') {
          appendSpecialty(specialty);
        }
      });
    }

    if (vendorData.services && Array.isArray(vendorData.services) && vendorData.services.length > 0) {
      vendorData.services.forEach((service) => {
        if (service && service.name) {
          appendService(service);
        }
      });
    }

    if (vendorData.packages && Array.isArray(vendorData.packages) && vendorData.packages.length > 0) {
      vendorData.packages.forEach((pkg) => {
        if (pkg && pkg.name) {
          appendPackage(pkg);
        }
      });
    }

    if (vendorData.deliverables && Array.isArray(vendorData.deliverables) && vendorData.deliverables.length > 0) {
      vendorData.deliverables.forEach((deliverable) => {
        if (deliverable && deliverable.trim() !== '') {
          appendDeliverable(deliverable);
        }
      });
    }

    if (vendorData.customer_reviews && Array.isArray(vendorData.customer_reviews) && vendorData.customer_reviews.length > 0) {
      vendorData.customer_reviews.forEach((review) => {
        if (review && review.customer_name) {
          appendReview(review);
        }
      });
    }

    if (vendorData.additional_info?.custom_fields && Array.isArray(vendorData.additional_info.custom_fields) && vendorData.additional_info.custom_fields.length > 0) {
      vendorData.additional_info.custom_fields.forEach((field) => {
        if (field && field.field_name && field.field_value) {
          appendCustomField(field);
        }
      });
    }

    console.log('Form populated with vendor data');
    setLoading(false);
  };

  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const loadCatalogImages = async (vendorId: string) => {
    try {
      const media = await getVendorMedia(vendorId, 'catalog');
      const imageUrls = media.map(item => item.media_url);
      setCatalogImages(imageUrls);
      
      // Add existing catalog images to form
      imageUrls.forEach(url => {
        appendCatalogImage(url);
      });
    } catch (error) {
      console.error('Error loading catalog images:', error);
    }
  };

  const onSubmit = async (data: VendorEditForm) => {
    if (!vendor) return;

    setSubmitting(true);
    setSubmitMessage('');

    try {
      // Prepare current data and proposed changes
      const currentData = {
        brand_name: vendor.brand_name || '',
        spoc_name: vendor.spoc_name || '',
        category: vendor.category || '',
        subcategory: vendor.subcategory || '',
        phone_number: vendor.phone_number || '',
        alternate_number: vendor.alternate_number || '',
        whatsapp_number: vendor.whatsapp_number || '',
        email: vendor.email || '',
        instagram: vendor.instagram || '',
        address: vendor.address || '',
        description: vendor.description || '',
        experience: vendor.experience || '',
        avatar_url: vendor.avatar_url || '',
        cover_image_url: vendor.cover_image_url || '',
        specialties: vendor.specialties || [],
        services: vendor.services || [],
        packages: vendor.packages || [],
        deliverables: vendor.deliverables || [],
        catalog_images: catalogImages || [],
        customer_reviews: vendor.customer_reviews || [],
        booking_policies: vendor.booking_policies || undefined,
        additional_info: vendor.additional_info || undefined,
        currently_available: vendor.currently_available || false,
      };

      console.log('Current vendor data:', currentData);

      // Process the form data
      const processedFormData = {
        brand_name: data.brand_name || '',
        spoc_name: data.spoc_name || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        phone_number: data.phone_number || '',
        alternate_number: data.alternate_number || '',
        whatsapp_number: data.whatsapp_number || '',
        email: data.email || '',
        instagram: data.instagram || '',
        address: data.address || '',
        description: data.description || '',
        experience: data.experience || '',
        avatar_url: data.avatar_url || '',
        cover_image_url: data.cover_image_url || '',
        specialties: data.specialties?.filter(s => s && s.trim() !== '') || [],
        services: data.services?.filter(s => s.name && s.name.trim() !== '') || [],
        packages: data.packages?.filter(p => p.name && p.name.trim() !== '').map(pkg => ({
          ...pkg,
          features: typeof (pkg.features as unknown) === 'string' 
            ? ((pkg.features as unknown) as string).split(',').map(f => f.trim()).filter(f => f !== '')
            : pkg.features || []
        })) || [],
        deliverables: data.deliverables?.filter(d => d && d.trim() !== '') || [],
        catalog_images: data.catalog_images?.filter(img => img && img.trim() !== '') || [],
        customer_reviews: data.customer_reviews?.filter(r => 
          r.customer_name && r.customer_name.trim() !== '' && r.review && r.review.trim() !== ''
        ) || [],
        booking_policies: data.booking_policies ? {
          cancellation_policy: data.booking_policies.cancellation_policy || '',
          payment_terms: data.booking_policies.payment_terms || '',
          booking_requirements: data.booking_policies.booking_requirements || ''
        } : undefined,
        additional_info: data.additional_info ? {
          working_hours: data.additional_info.working_hours || '',
          languages: data.additional_info.languages || [],
          awards: data.additional_info.awards || [],
          certifications: data.additional_info.certifications || [],
          custom_fields: data.additional_info.custom_fields?.filter(f => 
            f.field_name && f.field_name.trim() !== '' && f.field_value && f.field_value.trim() !== ''
          ) || []
        } : undefined,
        currently_available: data.currently_available || false,
      };

      console.log('Processed form data:', processedFormData);

      // Helper function to check if an object/array is effectively empty
      const isEffectivelyEmpty = (value: any): boolean => {
        if (value === null || value === undefined) return true;
        if (value === '') return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') {
          // Check if object has no keys or all values are empty
          const keys = Object.keys(value);
          if (keys.length === 0) return true;
          return keys.every(key => {
            const v = value[key];
            return v === '' || v === null || v === undefined || 
              (Array.isArray(v) && v.length === 0) ||
              (typeof v === 'object' && v !== null && isEffectivelyEmpty(v));
          });
        }
        return false;
      };

      // Only include fields that actually changed
      const proposedChanges: any = {};
      
      Object.keys(processedFormData).forEach(key => {
        const currentValue = currentData[key as keyof typeof currentData];
        const newValue = processedFormData[key as keyof typeof processedFormData];
        
        console.log(`=== Checking field: ${key} ===`);
        console.log('Current value:', currentValue);
        console.log('New value:', newValue);
        console.log('Current is empty:', isEffectivelyEmpty(currentValue));
        console.log('New is empty:', isEffectivelyEmpty(newValue));
        console.log('JSON current:', JSON.stringify(currentValue));
        console.log('JSON new:', JSON.stringify(newValue));
        console.log('Are equal:', JSON.stringify(currentValue) === JSON.stringify(newValue));
        
        // Skip if both values are effectively empty or both are undefined
        if ((isEffectivelyEmpty(currentValue) && isEffectivelyEmpty(newValue)) ||
            (currentValue === undefined && newValue === undefined)) {
          console.log(`Skipping ${key} - both effectively empty or undefined`);
          return;
        }
        
        // Normalize values for comparison (sort object keys, handle null/undefined)
        const normalizeForComparison = (val: any): any => {
          if (val === null || val === undefined) return null;
          if (Array.isArray(val)) return val.sort();
          if (typeof val === 'object') {
            const sorted: any = {};
            Object.keys(val).sort().forEach(k => {
              sorted[k] = normalizeForComparison(val[k]);
            });
            return sorted;
          }
          return val;
        };

        const normalizedCurrent = normalizeForComparison(currentValue);
        const normalizedNew = normalizeForComparison(newValue);
        
        // Deep comparison for objects and arrays
        if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedNew)) {
          console.log(`Adding ${key} to changes - values differ`);
          proposedChanges[key] = newValue;
        } else {
          console.log(`Skipping ${key} - values are identical`);
        }
      });

      console.log('Only changed fields:', proposedChanges);

      // If no changes detected, don't submit
      if (Object.keys(proposedChanges).length === 0) {
        setSubmitMessage('No changes detected to submit.');
        setSubmitSuccess(false);
        setSubmitting(false);
        return;
      }

      // Submit for approval
      const result = await submitVendorProfileChange(
        parseInt(vendor.vendor_id),
        'profile_update',
        currentData,
        proposedChanges
      );

      if (result.success) {
        // Update catalog images in VendorMedia table if they changed
        const newCatalogImages = data.catalog_images?.filter(img => img && img.trim() !== '') || [];
        if (JSON.stringify(newCatalogImages) !== JSON.stringify(catalogImages)) {
          const catalogUpdateResult = await updateVendorCatalogImages(vendor.vendor_id, newCatalogImages);
          if (catalogUpdateResult) {
            setCatalogImages(newCatalogImages);
            console.log('Catalog images updated successfully');
          } else {
            console.error('Failed to update catalog images');
          }
        }
        
        setSubmitSuccess(true);
        setSubmitMessage(result.message || 'Changes submitted successfully');
        // Reload pending changes
        loadPendingChanges(parseInt(vendor.vendor_id));
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
                    Alternate Number <span className="text-xs text-gray-500">(Admin Only)</span>
                  </label>
                  <Input
                    {...register("alternate_number")}
                    placeholder="Enter alternate number (admin only, not visible in profile)"
                  />
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

          {/* Catalog Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Catalog Images</span>
                <Button
                  type="button"
                  onClick={() => appendCatalogImage("")}
                  variant="outline"
                  size="sm"
                >
                  Add Image URL
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {catalogImageFields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        {...register(`catalog_images.${index}` as const)}
                        placeholder="Enter image URL (https://...)"
                        type="url"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => removeCatalogImage(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    {/* Image Preview */}
                    {watch(`catalog_images.${index}`) && (
                      <div className="border rounded-lg p-2 bg-gray-50">
                        <img
                          src={watch(`catalog_images.${index}`)}
                          alt={`Catalog preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {catalogImageFields.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No catalog images added yet. Click "Add Image URL" to showcase your work.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Services</span>
                <Button
                  type="button"
                  onClick={() => appendService({ name: "", description: "", price: "" })}
                  variant="outline"
                  size="sm"
                >
                  Add Service
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <Input
                        {...register(`services.${index}.name` as const)}
                        placeholder="Service name"
                      />
                      <Input
                        {...register(`services.${index}.price` as const)}
                        placeholder="Price (optional)"
                      />
                    </div>
                    <Textarea
                      {...register(`services.${index}.description` as const)}
                      placeholder="Service description"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => removeService(index)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Remove Service
                    </Button>
                  </div>
                ))}
                {serviceFields.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No services added yet. Click "Add Service" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Packages</span>
                <Button
                  type="button"
                  onClick={() => appendPackage({ name: "", price: "", description: "", features: [] })}
                  variant="outline"
                  size="sm"
                >
                  Add Package
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packageFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <Input
                        {...register(`packages.${index}.name` as const)}
                        placeholder="Package name"
                      />
                      <Input
                        {...register(`packages.${index}.price` as const)}
                        placeholder="Price"
                      />
                    </div>
                    <Textarea
                      {...register(`packages.${index}.description` as const)}
                      placeholder="Package description"
                      rows={2}
                      className="mb-3"
                    />
                    <Textarea
                      {...register(`packages.${index}.features` as const)}
                      placeholder="Features (comma-separated)"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => removePackage(index)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Remove Package
                    </Button>
                  </div>
                ))}
                {packageFields.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No packages added yet. Click "Add Package" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Customer Reviews</span>
                <Button
                  type="button"
                  onClick={() => appendReview({ customer_name: "", rating: 5, review: "", date: new Date().toISOString().split('T')[0] })}
                  variant="outline"
                  size="sm"
                >
                  Add Review
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        {...register(`customer_reviews.${index}.customer_name` as const)}
                        placeholder="Customer name"
                      />
                      <select
                        {...register(`customer_reviews.${index}.rating` as const, { valueAsNumber: true })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={2}>2 Stars</option>
                        <option value={1}>1 Star</option>
                      </select>
                      <Input
                        {...register(`customer_reviews.${index}.date` as const)}
                        type="date"
                      />
                    </div>
                    <Textarea
                      {...register(`customer_reviews.${index}.review` as const)}
                      placeholder="Customer review"
                      rows={3}
                    />
                    <Button
                      type="button"
                      onClick={() => removeReview(index)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Remove Review
                    </Button>
                  </div>
                ))}
                {reviewFields.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No reviews added yet. Click "Add Review" to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <Textarea
                  {...register("booking_policies.cancellation_policy")}
                  placeholder="Describe your cancellation policy"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <Textarea
                  {...register("booking_policies.payment_terms")}
                  placeholder="Describe payment terms and methods"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Requirements
                </label>
                <Textarea
                  {...register("booking_policies.booking_requirements")}
                  placeholder="Any special requirements for booking"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Working Hours
                </label>
                <Input
                  {...register("additional_info.working_hours")}
                  placeholder="9 AM - 6 PM, Monday-Saturday"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <Input
                  {...register("additional_info.languages")}
                  placeholder="e.g., English, Hindi, Telugu (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Awards
                </label>
                <Input
                  {...register("additional_info.awards")}
                  placeholder="List any awards received (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <Input
                  {...register("additional_info.certifications")}
                  placeholder="List any certifications (comma-separated)"
                />
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Fields
                  </label>
                  <Button
                    type="button"
                    onClick={() => appendCustomField({ field_name: "", field_value: "" })}
                    variant="outline"
                    size="sm"
                  >
                    Add Custom Field
                  </Button>
                </div>
                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        {...register(`additional_info.custom_fields.${index}.field_name` as const)}
                        placeholder="Field name"
                        className="flex-1"
                      />
                      <Input
                        {...register(`additional_info.custom_fields.${index}.field_value` as const)}
                        placeholder="Field value"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {customFields.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No custom fields added yet. Click "Add Custom Field" to add flexible information fields.
                    </p>
                  )}
                </div>
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
