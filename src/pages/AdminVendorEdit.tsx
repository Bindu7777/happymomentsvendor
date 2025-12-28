import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Trash2, X, FileText, Plus, Star } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { getVendorByFieldId, updateVendor, updateVendorVerified, getVendorMedia, updateVendorCatalogImages, toggleImageHighlight, deleteVendorMedia } from '../services/supabaseService';
import ImageUpload from '../components/ImageUpload';
import { Vendor } from '../lib/supabase';
import { CATEGORY_LIST } from '@/constants/categories';

// Indian States and Union Territories
const indianStates = [
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'andaman-nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra-nagar-haveli', label: 'Dadra and Nagar Haveli' },
  { value: 'daman-diu', label: 'Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu-kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];

type VendorEditForm = {
  // Basic Information
  brand_name: string;
  spoc_name: string;
  category: string;
  subcategory?: string;
  brand_logo_url?: string;
  contact_person_image_url?: string;
  
  // Contact Information
  phone_number: string;
  alternate_number?: string;  // Admin-only field
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  
  // Business Details
  experience?: string;
  quick_intro?: string;
  caption?: string;
  detailed_intro?: string;
  highlight_features?: string[];
  starting_price: number;
  languages_spoken?: string[];
  
  // JSON Fields
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
    advance?: string;
  };
  additional_info?: {
    working_hours?: string;
    languages?: string[];
    service_areas?: string[];
    awards?: string[];
    certifications?: string[];
    custom_fields?: Array<{
      field_name: string;
      field_value: string;
    }>;
  };
  
  // Status Fields
  verified: boolean;
  currently_available: boolean;
};

// Utility function to remove duplicates from string arrays (case-insensitive)
const deduplicateStringArray = (array: string[]): string[] => {
  if (!Array.isArray(array)) return [];
  
  return array.filter((item, index, arr) => {
    if (!item || typeof item !== 'string' || item.trim() === '') return false;
    const trimmedLower = item.trim().toLowerCase();
    return arr.findIndex(arrItem => arrItem && typeof arrItem === 'string' && arrItem.trim().toLowerCase() === trimmedLower) === index;
  }).map(item => item.trim());
};

const AdminVendorEdit: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const [originalCatalogImages, setOriginalCatalogImages] = useState<string[]>([]);
  const [catalogImagesWithMeta, setCatalogImagesWithMeta] = useState<any[]>([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [highlightMessage, setHighlightMessage] = useState<string>('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [currentHighlightStatus, setCurrentHighlightStatus] = useState<Array<{id: string, media_url: string, is_highlighted: boolean}>>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'brand_logo' | 'contact_person' | 'catalog'>('brand_logo');
  const [deleteConfirmData, setDeleteConfirmData] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<VendorEditForm>();

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: "services"
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control,
    name: "packages"
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control,
    name: "customer_reviews"
  });

  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: "additional_info.custom_fields"
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: "highlight_features"
  });

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: "deliverables"
  });

  useEffect(() => {
    // Check admin authentication
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin/login");
      return;
    }

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId, navigate]);

  const fetchVendor = async () => {
    if (!vendorId) return;

    try {
      console.log('Fetching vendor data for ID:', vendorId);
      const vendorData = await getVendorByFieldId(vendorId);
      console.log('Fetched vendor data:', vendorData);
      if (vendorData) {
        setVendor(vendorData);
        loadVendorData(vendorData);
        loadCatalogImages();
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      setError("Failed to load vendor data");
      setLoading(false);
    }
  };

  const loadVendorData = async (vendorData: Vendor) => {
    try {
      setIsLoadingFormData(true);
      
      // Process services from both services and specialties
      const allServices: Array<{name: string, description: string, price?: string}> = [];
      
      if (vendorData.services && Array.isArray(vendorData.services)) {
        vendorData.services.forEach(service => {
          if (service && service.name && service.name.trim() !== '') {
            allServices.push({
              name: service.name.trim(),
              description: service.description || '',
              price: service.price || ''
            });
          }
        });
      }

      // Remove duplicates based on service name (case-insensitive)
      const uniqueServices = allServices.filter((service, index, array) => {
        const trimmedLowerName = service.name.toLowerCase();
        return array.findIndex(s => s.name.toLowerCase() === trimmedLowerName) === index;
      });

      const formData = {
        // Basic Information
        brand_name: vendorData.brand_name || '',
        spoc_name: vendorData.spoc_name || '',
        category: vendorData.category || '',
        subcategory: vendorData.subcategory || '',
        brand_logo_url: vendorData.brand_logo_url || '',
        contact_person_image_url: vendorData.contact_person_image_url || '',
        
        // Contact Information
        phone_number: vendorData.phone_number || '',
        alternate_number: vendorData.alternate_number || '',
        whatsapp_number: vendorData.whatsapp_number || '',
        email: vendorData.email || '',
        instagram: vendorData.instagram || '',
        address: vendorData.address || '',
        
        // Business Details
        experience: vendorData.experience || '',
        quick_intro: vendorData.quick_intro || '',
        caption: vendorData.caption || '',
        detailed_intro: vendorData.detailed_intro || '',
        starting_price: vendorData.starting_price || 0,
        languages_spoken: vendorData.languages_spoken || [],
        highlight_features: vendorData.highlight_features || [],
        services: uniqueServices,
        packages: vendorData.packages || [],
        deliverables: vendorData.deliverables || [],
        catalog_images: vendorData.catalog_images || [],
        customer_reviews: vendorData.customer_reviews || [],
        booking_policies: vendorData.booking_policies || {
          cancellation_policy: '',
          payment_terms: '',
          booking_requirements: '',
          advance: ''
        },
        additional_info: vendorData.additional_info || {
          working_hours: '',
          languages: [],
          service_areas: [],
          awards: [],
          certifications: [],
          custom_fields: []
        },
        verified: vendorData.verified || false,
        currently_available: vendorData.currently_available || false,
      };

      // Set form values
      Object.keys(formData).forEach(key => {
        setValue(key as keyof VendorEditForm, formData[key as keyof VendorEditForm]);
      });

      // Load highlight features
      if (formData.highlight_features && Array.isArray(formData.highlight_features)) {
        formData.highlight_features.forEach(feature => {
          if (feature && feature.trim() !== '') {
            appendHighlight(feature.trim());
          }
        });
      }

      // Load deliverables
      if (formData.deliverables && Array.isArray(formData.deliverables)) {
        formData.deliverables.forEach(deliverable => {
          if (deliverable && deliverable.trim() !== '') {
            appendDeliverable(deliverable.trim());
          }
        });
      }

      // Load custom fields
      if (formData.additional_info?.custom_fields && Array.isArray(formData.additional_info.custom_fields)) {
        formData.additional_info.custom_fields.forEach(field => {
          if (field && field.field_name && field.field_value) {
            appendCustomField({
              field_name: field.field_name.trim(),
              field_value: field.field_value.trim()
            });
          }
        });
      }

      setIsLoadingFormData(false);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      setIsLoadingFormData(false);
    }
  };

  const loadCatalogImages = async () => {
    if (!vendorId) return;

    try {
      const mediaData = await getVendorMedia(vendorId);
      const catalogImages = mediaData
        .filter(media => media.category === 'catalog')
        .map(media => media.media_url);
      
      setCatalogImages(catalogImages);
      setOriginalCatalogImages([...catalogImages]);
      setCatalogImagesWithMeta(mediaData.filter(media => media.category === 'catalog'));
      
      // Load highlight status
      const highlightStatus = mediaData
        .filter(media => media.category === 'catalog')
        .map(media => ({
          id: media.id,
          media_url: media.media_url,
          is_highlighted: media.is_highlighted || false
        }));
      setCurrentHighlightStatus(highlightStatus);
    } catch (error) {
      console.error('Error loading catalog images:', error);
    }
  };

  const onSubmit = async (data: VendorEditForm) => {
    if (!vendor) return;

    setSaving(true);
    setError('');

    try {
      console.log('Form data received:', data);
      
      // Process the form data
      const processedData = {
        ...data,
        highlight_features: data.highlight_features?.filter(f => f && f.trim() !== '').slice(0, 4) || [],
        deliverables: data.deliverables?.filter(d => d && d.trim() !== '') || [],
        services: data.services?.filter(s => s && s.name && s.name.trim() !== '') || [],
        packages: data.packages?.filter(p => p && p.name && p.name.trim() !== '') || [],
        customer_reviews: data.customer_reviews?.filter(r => r && r.customer_name && r.review && r.customer_name.trim() !== '' && r.review.trim() !== '') || [],
        additional_info: {
          ...data.additional_info,
          languages: data.additional_info?.languages?.filter(l => l && l.trim() !== '') || [],
          service_areas: data.additional_info?.service_areas?.filter(area => area && area.trim() !== '') || [],
          awards: data.additional_info?.awards?.filter(a => a && a.trim() !== '') || [],
          certifications: data.additional_info?.certifications?.filter(c => c && c.trim() !== '') || [],
          custom_fields: data.additional_info?.custom_fields?.filter(f => f && f.field_name && f.field_value && f.field_name.trim() !== '' && f.field_value.trim() !== '') || []
        }
      };

      console.log('Processed data to save:', processedData);
      console.log('Updating vendor with ID:', vendor.vendor_id);

      // Update vendor directly (no approval workflow for admin)
      const updateResult = await updateVendor(vendor.vendor_id, processedData);
      
      console.log('Update result:', updateResult);
      
      if (updateResult) {
        setSuccessMessage('Vendor profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh vendor data
        await fetchVendor();
      } else {
        setError('Failed to update vendor profile. Please try again.');
      }
      
    } catch (error) {
      console.error('Error updating vendor:', error);
      setError('Failed to update vendor profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (urls: string[]) => {
    if (!vendorId) return;

    try {
      const newCatalogImages = [...catalogImages, ...urls];
      setCatalogImages(newCatalogImages);
      
      // Update in database
      await updateVendorCatalogImages(vendorId, newCatalogImages);
      
      // Refresh the catalog images
      await loadCatalogImages();
      setForceRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const handleToggleHighlight = async (imageUrl: string) => {
    if (!vendorId) return;

    try {
      await toggleImageHighlight(vendorId, imageUrl);
      await loadCatalogImages();
      setHighlightMessage('Highlight status updated successfully!');
      setTimeout(() => setHighlightMessage(''), 3000);
      } catch (error) {
      console.error('Error toggling highlight:', error);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!vendorId) return;

    try {
      await deleteVendorMedia(vendorId, imageUrl);
      await loadCatalogImages();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Vendor Profile</h1>
                <p className="text-sm text-gray-500">Admin Edit - Changes Applied Immediately</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {successMessage && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
              )}
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                  <Input
                    {...register('brand_name', { required: 'Brand name is required' })}
                    placeholder="Enter brand name"
                />
                {errors.brand_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Name *</label>
                  <Input
                    {...register('spoc_name', { required: 'Contact person name is required' })}
                    placeholder="Enter contact person name"
                />
                {errors.spoc_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.spoc_name.message}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {CATEGORY_LIST.map((category) => (
                    <option key={category.code} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <Input
                    {...register('subcategory')}
                  placeholder="Enter subcategory (optional)"
                />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Logo URL</label>
                  <Input
                    {...register('brand_logo_url')}
                    placeholder="https://example.com/logo.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person Image URL</label>
                  <Input
                    {...register('contact_person_image_url')}
                    placeholder="https://example.com/person.jpg"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <Input
                    {...register('phone_number', { required: 'Phone number is required' })}
                    placeholder="Enter phone number"
                />
                {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <Input
                    {...register('whatsapp_number')}
                    placeholder="Enter WhatsApp number"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    {...register('email')}
                  type="email"
                    placeholder="Enter email address"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                  <Input
                    {...register('instagram')}
                  placeholder="@username"
                />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Textarea
                  {...register('address')}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <Input
                    {...register('experience')}
                    placeholder="e.g., 5+ years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹) *</label>
                  <Input
                    {...register('starting_price', { 
                      required: "Starting price is required",
                      min: { value: 1, message: "Starting price must be greater than 0" },
                      valueAsNumber: true 
                    })}
                    type="number"
                    placeholder="e.g., 35000"
                    min="1"
                  />
                  {errors.starting_price && (
                    <p className="text-red-500 text-sm mt-1">{errors.starting_price.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quick Intro</label>
                <Input
                  {...register('quick_intro')}
                  placeholder="Short catchy intro line"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <Input
                  {...register('caption')}
                  placeholder="Cultural greeting or tagline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Intro</label>
                <Textarea
                  {...register('detailed_intro')}
                  placeholder="Detailed description of your services"
                  rows={3}
                />
              </div>

              {/* Status Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    {...register('verified')}
                    type="checkbox"
                    id="verified"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      setValue('verified', checked);
                      if (vendor) {
                        try {
                          const result = await updateVendorVerified(vendor.vendor_id, checked);
                          if (result) {
                            setSuccessMessage(`Vendor ${checked ? 'verified' : 'unverified'} successfully!`);
                            setTimeout(() => setSuccessMessage(''), 3000);
                          } else {
                            setError('Failed to update verification status');
                          }
                        } catch (error) {
                          console.error('Error updating verification:', error);
                          setError('Failed to update verification status');
                        }
                      }
                    }}
                  />
                  <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                    Verified Vendor
                  </label>
                  </div>
                <div className="flex items-center space-x-2">
                      <input
                    {...register('currently_available')}
                    type="checkbox"
                    id="currently_available"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      setValue('currently_available', checked);
                      if (vendor) {
                        try {
                          const result = await updateVendor(vendor.vendor_id, { currently_available: checked });
                          if (result) {
                            setSuccessMessage(`Availability ${checked ? 'enabled' : 'disabled'} successfully!`);
                            setTimeout(() => setSuccessMessage(''), 3000);
                          } else {
                            setError('Failed to update availability status');
                          }
                        } catch (error) {
                          console.error('Error updating availability:', error);
                          setError('Failed to update availability status');
                        }
                      }
                    }}
                  />
                  <label htmlFor="currently_available" className="text-sm font-medium text-gray-700">
                    Currently Available
                  </label>
                </div>
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
                  onClick={() => appendService({ name: '', description: '', price: '' })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      {...register(`services.${index}.name`)}
                      placeholder="Service name"
                    />
                    <Input
                      {...register(`services.${index}.price`)}
                      placeholder="Price (optional)"
                    />
            </div>
                  <Textarea
                    {...register(`services.${index}.description`)}
                    placeholder="Service description"
                    rows={2}
                  />
                  <Button
                    type="button"
                    onClick={() => removeService(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Service
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Packages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Packages</span>
                <Button
                  type="button"
                  onClick={() => appendPackage({ name: '', price: '', description: '', features: [] })}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Package</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {packageFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      {...register(`packages.${index}.name`)}
                      placeholder="Package name"
                    />
                    <Input
                      {...register(`packages.${index}.price`)}
                      placeholder="Package price"
                    />
                  </div>
                  <Textarea
                    {...register(`packages.${index}.description`)}
                    placeholder="Package description"
                    rows={2}
                  />
                  <Input
                    {...register(`packages.${index}.features`)}
                    placeholder="Features (comma-separated)"
                  />
                  <Button
                    type="button"
                    onClick={() => removePackage(index)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Package
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Reviews - Admin Add Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span>Customer Reviews (Admin Add Reviews)</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {reviewFields.length} Review{reviewFields.length !== 1 ? 's' : ''} Added
                  </Badge>
                </div>
                <Button
                  type="button"
                  onClick={() => appendReview({ customer_name: '', rating: 5, review: '', date: new Date().toISOString().split('T')[0] })}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Add customer reviews that will be displayed on the vendor's public profile. 
                These reviews are visible to customers browsing the website.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Reviews Added Yet</h3>
                  <p className="text-gray-500 mb-4">Click "Add Review" to add customer reviews for this vendor.</p>
                  <Button
                    type="button"
                    onClick={() => appendReview({ customer_name: '', rating: 5, review: '', date: new Date().toISOString().split('T')[0] })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Review
                  </Button>
            </div>
              ) : (
                reviewFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 p-6 rounded-lg space-y-4 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-gray-800">Review #{index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeReview(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Review
                      </Button>
          </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                        <Input
                          {...register(`customer_reviews.${index}.customer_name`, { required: 'Customer name is required' })}
                          placeholder="e.g., John & Sarah"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                        <select
                          {...register(`customer_reviews.${index}.rating`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={5.0}>⭐⭐⭐⭐⭐ 5.0 Stars (Excellent)</option>
                          <option value={4.9}>⭐⭐⭐⭐⭐ 4.9 Stars (Outstanding)</option>
                          <option value={4.7}>⭐⭐⭐⭐⭐ 4.7 Stars (Exceptional)</option>
                          <option value={4.5}>⭐⭐⭐⭐⭐ 4.5 Stars (Excellent)</option>
                          <option value={4.2}>⭐⭐⭐⭐⭐ 4.2 Stars (Very Good)</option>
                          <option value={4.1}>⭐⭐⭐⭐⭐ 4.1 Stars (Very Good)</option>
                          <option value={4.0}>⭐⭐⭐⭐ 4.0 Stars (Very Good)</option>
                          <option value={3.5}>⭐⭐⭐⭐ 3.5 Stars (Good)</option>
                          <option value={3.0}>⭐⭐⭐ 3.0 Stars (Good)</option>
                          <option value={2.5}>⭐⭐⭐ 2.5 Stars (Fair)</option>
                          <option value={2.0}>⭐⭐ 2.0 Stars (Fair)</option>
                          <option value={1.5}>⭐⭐ 1.5 Stars (Poor)</option>
                          <option value={1.0}>⭐ 1.0 Star (Poor)</option>
                        </select>
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Date *</label>
                        <Input
                          {...register(`customer_reviews.${index}.date`, { required: 'Review date is required' })}
                          type="date"
                          className="w-full"
                        />
              </div>
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Review Text *</label>
                      <Textarea
                        {...register(`customer_reviews.${index}.review`, { required: 'Review text is required' })}
                        placeholder="Write the customer's review here..."
                        rows={3}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>This review will be visible on the vendor's public profile</span>
              </div>
            </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Catalog Images */}
          <Card>
            <CardHeader>
              <CardTitle>Catalog Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                onUpload={handleImageUpload}
                existingImages={catalogImages}
                onToggleHighlight={handleToggleHighlight}
                onDeleteImage={handleDeleteImage}
                highlightStatus={currentHighlightStatus}
                forceRefresh={forceRefresh}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default AdminVendorEdit;