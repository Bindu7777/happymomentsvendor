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

// Utility function to remove duplicates from string arrays (case-insensitive)
const deduplicateStringArray = (array: string[]): string[] => {
  if (!Array.isArray(array)) return [];
  
  return array.filter((item, index, arr) => {
    if (!item || typeof item !== 'string' || item.trim() === '') return false;
    const trimmedLower = item.trim().toLowerCase();
    return arr.findIndex(arrItem => arrItem && typeof arrItem === 'string' && arrItem.trim().toLowerCase() === trimmedLower) === index;
  }).map(item => item.trim());
};

const VendorProfileEdit: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
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
      brand_logo_url: '',
      contact_person_image_url: '',
      phone_number: '',
      alternate_number: '',
      whatsapp_number: '',
      email: '',
      instagram: '',
      address: '',
      experience: '',
      quick_intro: '',
      caption: '',
      detailed_intro: '',
      highlight_features: [],
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

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: "highlight_features" as any
  });

  // Removed duplicate services loading - now handled in loadVendorData function

  useEffect(() => {
    const initializeVendorData = async () => {
      const loggedInVendor = getLoggedInVendor();
      
      if (!loggedInVendor) {
        navigate('/');
        return;
      }

      try {
        console.log('Loading vendor data for profile edit...');
        
        // Set vendor first
        setVendor(loggedInVendor);
        
        // Try to get fresh data from database first
        let finalVendorData = loggedInVendor;
        let catalogImages: string[] = [];
        
        try {
          console.log('Attempting to fetch fresh vendor data...');
          const freshVendorData = await getVendorByFieldId(loggedInVendor.vendor_id);
          if (freshVendorData) {
            console.log('Using fresh vendor data:', freshVendorData);
            finalVendorData = freshVendorData;
            setVendor(freshVendorData);
          }
        } catch (freshDataError) {
          console.log('Could not fetch fresh data, using cached data:', freshDataError);
        }
        
        // Load catalog images
        try {
          catalogImages = await loadCatalogImages(finalVendorData.vendor_id);
          console.log('Catalog images loaded successfully:', catalogImages);
        } catch (catalogError) {
          console.error('Error loading catalog images:', catalogError);
          catalogImages = [];
        }
        
        // Load form with final data - SINGLE CALL ONLY
        console.log('Loading form with final vendor data (single call)');
        console.log('Passing catalogImages to loadVendorData:', catalogImages);
        loadVendorData(finalVendorData, catalogImages);
        
        // Load pending changes
        loadPendingChanges(parseInt(finalVendorData.vendor_id));
        
      } catch (error) {
        console.error('Error in initializeVendorData:', error);
        // Last resort: use localStorage data only
        console.warn('Using localStorage data as last resort');
        setVendor(loggedInVendor);
        loadVendorData(loggedInVendor, []);
        loadPendingChanges(parseInt(loggedInVendor.vendor_id));
      }
    };

    initializeVendorData();
  }, [navigate, forceRefresh]);

  const loadVendorData = (vendorData: Vendor, catalogImagesData?: string[]) => {
    // Prevent multiple simultaneous calls
    if (isLoadingFormData) {
      console.log('Form data is already loading, skipping duplicate call');
      return;
    }
    
    setIsLoadingFormData(true);
    console.log('Loading vendor data...');
    
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
    setValue('brand_logo_url', vendorData.brand_logo_url || '');
    setValue('contact_person_image_url', vendorData.contact_person_image_url || '');
    setValue('phone_number', vendorData.phone_number || '');
    setValue('alternate_number', vendorData.alternate_number || '');
    setValue('whatsapp_number', vendorData.whatsapp_number || '');
    setValue('email', vendorData.email || '');
    setValue('instagram', vendorData.instagram || '');
    setValue('address', vendorData.address || '');
    setValue('experience', vendorData.experience || '');
    setValue('quick_intro', vendorData.quick_intro || '');
    setValue('caption', vendorData.caption || '');
    setValue('detailed_intro', vendorData.detailed_intro || '');
    // Don't set highlight_features here - we'll handle them in the array population section to avoid duplicates
    // setValue('highlight_features', vendorData.highlight_features || []);
    // Don't set services here - we'll handle them in the array population section to avoid duplicates
    // setValue('services', vendorData.services || []);
    setValue('currently_available', vendorData.currently_available || false);
    
    console.log('=== SETTING FORM VALUES ===');
    console.log('Description set to:', vendorData.description);
    console.log('Experience set to:', vendorData.experience);
    
    // Set booking policies - ALWAYS set, even if empty
    console.log('=== BOOKING POLICIES CHECK ===');
    console.log('Booking policies data:', vendorData.booking_policies);
    
    // Always set booking policies, even if they're empty or null
    const bookingPolicies = vendorData.booking_policies || {};
    setValue('booking_policies.cancellation_policy', bookingPolicies.cancellation_policy || '');
    setValue('booking_policies.payment_terms', bookingPolicies.payment_terms || '');
    setValue('booking_policies.booking_requirements', bookingPolicies.booking_requirements || '');
    console.log('Booking policies set:', {
      cancellation: bookingPolicies.cancellation_policy,
      payment: bookingPolicies.payment_terms,
      requirements: bookingPolicies.booking_requirements
    });
    
    // Set additional info - ALWAYS set, even if empty
    console.log('=== ADDITIONAL INFO CHECK ===');
    console.log('Additional info data:', vendorData.additional_info);
    
    const additionalInfo = vendorData.additional_info || {};
    setValue('additional_info.working_hours', additionalInfo.working_hours || '');
    setValue('additional_info.languages', additionalInfo.languages || []);
    setValue('additional_info.awards', additionalInfo.awards || []);
    setValue('additional_info.certifications', additionalInfo.certifications || []);
    console.log('Additional info set:', {
      workingHours: additionalInfo.working_hours,
      languages: additionalInfo.languages,
      awards: additionalInfo.awards,
      certifications: additionalInfo.certifications
    });

    // Handle array fields separately - CLEAR FIRST then populate
    console.log('=== CLEARING AND POPULATING ARRAYS ===');
    
    // Clear all existing array fields first to prevent duplicates
    console.log('Clearing existing array fields...');
    console.log('Current field counts before clearing:', {
      services: serviceFields.length,
      packages: packageFields.length,
      deliverables: deliverableFields.length,
      catalogImages: catalogImageFields.length,
      reviews: reviewFields.length,
      customFields: customFields.length,
      highlights: highlightFields.length
    });
    
    // Clear services
    while (serviceFields.length > 0) {
      removeService(0);
    }
    
    // Clear packages
    while (packageFields.length > 0) {
      removePackage(0);
    }
    
    // Clear deliverables
    while (deliverableFields.length > 0) {
      removeDeliverable(0);
    }
    
    // Clear catalog images
    console.log('Clearing catalog images - current count:', catalogImageFields.length);
    while (catalogImageFields.length > 0) {
      removeCatalogImage(0);
    }
    console.log('Catalog images cleared - new count:', catalogImageFields.length);
    
    // Clear reviews
    while (reviewFields.length > 0) {
      removeReview(0);
    }
    
    // Clear custom fields
    while (customFields.length > 0) {
      removeCustomField(0);
    }
    
    // Clear highlight features
    while (highlightFields.length > 0) {
      removeHighlight(0);
    }
    
    console.log('All arrays cleared. Current field counts after clearing:', {
      services: serviceFields.length,
      packages: packageFields.length,
      deliverables: deliverableFields.length,
      catalogImages: catalogImageFields.length,
      reviews: reviewFields.length,
      customFields: customFields.length,
      highlights: highlightFields.length
    });
    console.log('Now populating with fresh data...');
    
    // Now populate with vendor data
    
    // Handle services - combine both vendorData.services and vendorData.specialties
    console.log('=== PROCESSING SERVICES ===');
    console.log('vendorData.services:', vendorData.services);
    console.log('vendorData.specialties:', vendorData.specialties);
    
    const allServices: Array<{name: string, description: string, price?: string}> = [];
    
    // Add services from vendorData.services
    if (vendorData.services && Array.isArray(vendorData.services) && vendorData.services.length > 0) {
      console.log('Adding services from vendorData.services:', vendorData.services);
      vendorData.services.forEach((service) => {
        if (service && service.name && service.name.trim() !== '') {
          allServices.push({
            name: service.name.trim(),
            description: service.description || '',
            price: service.price || ''
          });
        }
      });
    }
    
    // Add services from specialties (convert to service format)
    if (vendorData.specialties && Array.isArray(vendorData.specialties) && vendorData.specialties.length > 0) {
      console.log('Adding specialties as services:', vendorData.specialties);
      vendorData.specialties.forEach((specialty) => {
        if (specialty && specialty.trim() !== '') {
          allServices.push({
            name: specialty.trim(),
            description: '',
            price: ''
          });
        }
      });
    }
    
    // Remove duplicates based on service name (case-insensitive)
    const uniqueServices = allServices.filter((service, index, array) => {
      const trimmedLowerName = service.name.toLowerCase();
      return array.findIndex(item => item.name.toLowerCase() === trimmedLowerName) === index;
    });
    
    console.log('All services before deduplication:', allServices);
    console.log('Unique services after deduplication:', uniqueServices);
    
    // Add unique services to form
    uniqueServices.forEach((service) => {
      appendService(service);
    });

    if (vendorData.packages && Array.isArray(vendorData.packages) && vendorData.packages.length > 0) {
      console.log('Adding packages:', vendorData.packages);
      
      // Remove duplicates from packages array based on package name (case-insensitive)
      const uniquePackages = vendorData.packages.filter((pkg, index, array) => {
        if (!pkg || !pkg.name || pkg.name.trim() === '') return false;
        const trimmedLowerName = pkg.name.trim().toLowerCase();
        return array.findIndex(item => item && item.name && item.name.trim().toLowerCase() === trimmedLowerName) === index;
      });
      
      console.log('Unique packages after deduplication:', uniquePackages);
      
      uniquePackages.forEach((pkg) => {
        appendPackage(pkg);
      });
    } else if (typeof vendorData.packages === 'string') {
      console.log('Packages is a string, trying to parse...');
      try {
        const parsedPackages = JSON.parse(vendorData.packages);
        console.log('Parsed packages:', parsedPackages);
        if (Array.isArray(parsedPackages) && parsedPackages.length > 0) {
          console.log('Adding parsed packages to form...');
          
          // Remove duplicates from parsed packages based on package name (case-insensitive)
          const uniqueParsedPackages = parsedPackages.filter((pkg, index, array) => {
            if (!pkg || !pkg.name || pkg.name.trim() === '') return false;
            const trimmedLowerName = pkg.name.trim().toLowerCase();
            return array.findIndex(item => item && item.name && item.name.trim().toLowerCase() === trimmedLowerName) === index;
          });
          
          console.log('Unique parsed packages after deduplication:', uniqueParsedPackages);
          
          uniqueParsedPackages.forEach((pkg, index) => {
            console.log(`Unique Parsed Package ${index}:`, pkg);
            appendPackage(pkg);
          });
        }
      } catch (e) {
        console.error('Failed to parse packages JSON:', e);
      }
    }

    if (vendorData.deliverables && Array.isArray(vendorData.deliverables) && vendorData.deliverables.length > 0) {
      console.log('Adding deliverables:', vendorData.deliverables);
      
      const uniqueDeliverables = deduplicateStringArray(vendorData.deliverables);
      console.log('Unique deliverables after deduplication:', uniqueDeliverables);
      
      uniqueDeliverables.forEach((deliverable) => {
        appendDeliverable(deliverable);
      });
    }

    if (vendorData.customer_reviews && Array.isArray(vendorData.customer_reviews) && vendorData.customer_reviews.length > 0) {
      console.log('Adding customer reviews:', vendorData.customer_reviews);
      
      // Remove duplicates from customer reviews based on customer name and review content (case-insensitive)
      const uniqueReviews = vendorData.customer_reviews.filter((review, index, array) => {
        if (!review || !review.customer_name || !review.review) return false;
        const reviewKey = `${review.customer_name.trim().toLowerCase()}-${review.review.trim().toLowerCase()}`;
        return array.findIndex(item => {
          if (!item || !item.customer_name || !item.review) return false;
          const itemKey = `${item.customer_name.trim().toLowerCase()}-${item.review.trim().toLowerCase()}`;
          return itemKey === reviewKey;
        }) === index;
      });
      
      console.log('Unique customer reviews after deduplication:', uniqueReviews);
      
      uniqueReviews.forEach((review) => {
        appendReview(review);
      });
    }

    if (vendorData.additional_info?.custom_fields && Array.isArray(vendorData.additional_info.custom_fields) && vendorData.additional_info.custom_fields.length > 0) {
      console.log('Adding custom fields:', vendorData.additional_info.custom_fields);
      
      // Remove duplicates from custom fields based on field name (case-insensitive)
      const uniqueCustomFields = vendorData.additional_info.custom_fields.filter((field, index, array) => {
        if (!field || !field.field_name || !field.field_value) return false;
        const trimmedLowerName = field.field_name.trim().toLowerCase();
        return array.findIndex(item => item && item.field_name && item.field_name.trim().toLowerCase() === trimmedLowerName) === index;
      });
      
      console.log('Unique custom fields after deduplication:', uniqueCustomFields);
      
      uniqueCustomFields.forEach((field) => {
        appendCustomField(field);
      });
    }

    if (vendorData.highlight_features && Array.isArray(vendorData.highlight_features) && vendorData.highlight_features.length > 0) {
      console.log('Adding highlight features:', vendorData.highlight_features);
      
      const uniqueFeatures = deduplicateStringArray(vendorData.highlight_features);
      console.log('Unique features after deduplication:', uniqueFeatures);
      
      uniqueFeatures.forEach((feature) => {
        appendHighlight(feature);
      });
    }

    // Add catalog images from the parameter (loaded separately)
    const imagesToUse = catalogImagesData || catalogImages;
    console.log('=== CATALOG IMAGES PROCESSING ===');
    console.log('catalogImagesData (parameter):', catalogImagesData);
    console.log('catalogImages (state):', catalogImages);
    console.log('imagesToUse (final):', imagesToUse);
    console.log('imagesToUse length:', imagesToUse ? imagesToUse.length : 'undefined');
    
    if (imagesToUse && imagesToUse.length > 0) {
      console.log('Adding catalog images from parameter/state:', imagesToUse);
      
      const uniqueImages = deduplicateStringArray(imagesToUse);
      console.log('Unique catalog images after deduplication:', uniqueImages);
      
      uniqueImages.forEach((url, index) => {
        console.log(`Adding catalog image ${index + 1}:`, url);
        appendCatalogImage(url);
      });
      console.log(`Successfully added ${uniqueImages.length} catalog images to form`);
      
      // Force a small delay to ensure form updates
      setTimeout(() => {
        console.log('Current catalogImageFields length after adding:', catalogImageFields.length);
      }, 100);
    } else {
      console.log('No catalog images to add - imagesToUse is empty or undefined');
      console.log('Current catalogImageFields length (should be 0):', catalogImageFields.length);
    }

    console.log('=== FORM POPULATION COMPLETE ===');
    console.log('Form populated with vendor data');
    setLoading(false);
    setIsLoadingFormData(false);
  };

  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const loadCatalogImages = async (vendorId: string): Promise<string[]> => {
    try {
      console.log('=== LOADING CATALOG IMAGES ===');
      console.log('Vendor ID:', vendorId);
      console.log('Vendor ID type:', typeof vendorId);
      
      // Test the getVendorMedia function directly
      console.log('Calling getVendorMedia...');
      const media = await getVendorMedia(vendorId, 'catalog');
      console.log('Raw media data returned:', media);
      console.log('Media data type:', typeof media);
      console.log('Media data length:', media ? media.length : 'undefined');
      console.log('Is media an array?', Array.isArray(media));
      
      if (!media || !Array.isArray(media)) {
        console.warn('Media data is not an array:', typeof media);
        console.warn('Media value:', media);
        return [];
      }
      
      if (media.length === 0) {
        console.warn('Media array is empty - no catalog images found for vendor:', vendorId);
        return [];
      }
      
      const imageUrls = media.map((item, index) => {
        console.log(`Processing media item ${index + 1}:`, item);
        console.log(`Media URL ${index + 1}:`, item.media_url);
        return item.media_url;
      });
      console.log('Extracted image URLs:', imageUrls);
      console.log('Image URLs length:', imageUrls.length);
      console.log('Image URLs array:', JSON.stringify(imageUrls, null, 2));
      
      setCatalogImages(imageUrls);
      
      // Return the image URLs for immediate use
      console.log('Catalog images loaded, returning:', imageUrls);
      return imageUrls;
    } catch (error) {
      console.error('Error loading catalog images:', error);
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return [];
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
        experience: vendor.experience || '',
        quick_intro: vendor.quick_intro || '',
        caption: vendor.caption || '',
        detailed_intro: vendor.detailed_intro || '',
        highlight_features: vendor.highlight_features || [],
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
        experience: data.experience || '',
        quick_intro: data.quick_intro || '',
        caption: data.caption || '',
        detailed_intro: data.detailed_intro || '',
        highlight_features: data.highlight_features?.filter(h => h && h.trim() !== '') || [],
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
      console.log('=== CONTENT FIELDS CHECK ===');
      console.log('Form quick_intro:', data.quick_intro);
      console.log('Form caption:', data.caption);
      console.log('Form detailed_intro:', data.detailed_intro);
      console.log('Form brand_logo_url:', data.brand_logo_url);
      console.log('Form contact_person_image_url:', data.contact_person_image_url);
      console.log('Processed quick_intro:', processedFormData.quick_intro);
      console.log('Processed caption:', processedFormData.caption);
      console.log('Processed detailed_intro:', processedFormData.detailed_intro);

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand/Company Logo Image
                  </label>
                  <Input
                    {...register("brand_logo_url")}
                    type="url"
                    placeholder="https://example.com/brand-logo.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload your brand/company logo</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Image
                  </label>
                  <Input
                    {...register("contact_person_image_url")}
                    type="url"
                    placeholder="https://example.com/contact-person.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload contact person's photo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Intro <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("quick_intro", { 
                    required: "Quick intro is required",
                    maxLength: { value: 60, message: "Quick intro must not exceed 60 characters" }
                  })}
                  maxLength={60}
                  placeholder="e.g., Creative wedding photography with artistic vision"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">Short catchy intro line for your services</p>
                  <span className="text-xs text-gray-400">{watch("quick_intro")?.length || 0}/60</span>
                </div>
                {errors.quick_intro && (
                  <p className="text-red-500 text-sm mt-1">{errors.quick_intro.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption <span className="text-sm text-gray-500">(Optional)</span>
                  </label>
                  <Input
                    {...register("caption", {
                      maxLength: { value: 60, message: "Caption must not exceed 60 characters" }
                    })}
                    maxLength={60}
                    placeholder="e.g., Namaskaram! Capturing moments with expertise"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">Cultural greeting or tagline</p>
                    <span className="text-xs text-gray-400">{watch("caption")?.length || 0}/60</span>
                  </div>
                  {errors.caption && (
                    <p className="text-red-500 text-sm mt-1">{errors.caption.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Intro <span className="text-sm text-gray-500">(Optional)</span>
                  </label>
                  <Textarea
                    {...register("detailed_intro", {
                      maxLength: { value: 300, message: "Detailed intro must not exceed 300 characters" }
                    })}
                    maxLength={300}
                    placeholder="Professional services with years of experience..."
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">Detailed description of your services</p>
                    <span className="text-xs text-gray-400">{watch("detailed_intro")?.length || 0}/300</span>
                  </div>
                  {errors.detailed_intro && (
                    <p className="text-red-500 text-sm mt-1">{errors.detailed_intro.message}</p>
                  )}
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

              {/* Highlight Features */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-800">Highlight Features</h4>
                  <Button
                    type="button"
                    onClick={() => {
                      if (highlightFields.length < 4) {
                        appendHighlight("Award-winning service");
                      }
                    }}
                    disabled={highlightFields.length >= 4}
                    variant={highlightFields.length >= 4 ? "secondary" : "outline"}
                    size="sm"
                  >
                    Add Highlight {highlightFields.length >= 4 ? '(Max 4)' : `(${highlightFields.length}/4)`}
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600">Add up to 4 key features that make your service stand out</p>
                
                {highlightFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...register(`highlight_features.${index}` as const)}
                      placeholder={`Highlight feature ${index + 1} (e.g., Award-winning service, Same-day delivery)`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      variant="destructive"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                
                {highlightFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <p>No highlight features added yet. Click "Add Highlight" to start.</p>
                  </div>
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
