import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { ArrowLeft, ArrowRight, Save, AlertCircle, CheckCircle, Trash2, X, FileText } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { getLoggedInVendor, submitVendorProfileChange, getVendorPendingChanges, getVendorByFieldId, saveVendorSession, refreshVendorSession, clearVendorHardcodedServices, getVendorMedia } from '../services/supabaseService';
import { getVendorCatalogImagesFromStorage, listStorageBuckets, deleteImageFromStorage, getVendorBrandLogoFromStorage, getVendorContactPersonImageFromStorage } from '../services/supabaseStorageService';
import ImageUpload from '../components/ImageUpload';
import { Vendor, supabase } from '../lib/supabase';
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
  category: string[];  // Changed to array for multiple categories
  subcategory?: string;
  brand_logo_url?: string;  // Brand logo URL from vendor_media
  contact_person_image_url?: string;  // Contact person image URL from vendor_media
  
  // Contact Information
  phone_number: string;
  alternate_number?: string;  // Admin-only field
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  google_maps_link?: string;
  
  // Business Details
  experience?: string;
  total_events?: number;  // Form field name, maps to events_completed in database
  quick_intro?: string;
  caption?: string;
  detailed_intro?: string;
  highlight_features?: string[];
  starting_price: number;
  languages?: string[];  // New dedicated languages field
  
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
  catalog_images?: string[];
  catalog_images_metadata?: any[];
  booking_policies?: {
    cancellation_policy?: string;
    payment_terms?: string;
    booking_requirements?: string;
    advance?: string;
  };
  additional_info?: {
    working_hours?: string;
    languages?: string[];
    awards?: string[];
    certifications?: string[];
    service_areas?: string[];
    custom_fields?: Array<{
      field_name: string;
      field_value: string;
    }>;
  };
  
  // Status Fields
  currently_available: boolean;
  
  // Hidden field to track catalog highlight changes
  catalog_highlights_updated?: string;
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
  const [submittedChanges, setSubmittedChanges] = useState<any>({});
  const [submittedCurrentData, setSubmittedCurrentData] = useState<any>({});
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [catalogImages, setCatalogImages] = useState<string[]>([]);
  const [originalCatalogImages, setOriginalCatalogImages] = useState<string[]>([]);
  const [originalBrandLogoUrl, setOriginalBrandLogoUrl] = useState<string>('');
  const [originalContactPersonImageUrl, setOriginalContactPersonImageUrl] = useState<string>('');
  const [originalCategories, setOriginalCategories] = useState<string[]>([]); // Store original categories from form load
  const [catalogImagesWithMeta, setCatalogImagesWithMeta] = useState<any[]>([]);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [highlightMessage, setHighlightMessage] = useState<string>('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [currentHighlightStatus, setCurrentHighlightStatus] = useState<Array<{id: number, media_url: string, is_highlighted: boolean}>>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'brand_logo' | 'contact_person' | 'catalog'>('brand_logo');
  const [deleteConfirmData, setDeleteConfirmData] = useState<any>(null);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showStatesDropdown, setShowStatesDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCategoryDropdown && !(event.target as Element).closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  // Debug useEffect to monitor catalogImagesWithMeta changes
  useEffect(() => {
    console.log('=== CATALOG IMAGES WITH META STATE CHANGED ===');
    console.log('catalogImagesWithMeta:', catalogImagesWithMeta);
    console.log('catalogImagesWithMeta length:', catalogImagesWithMeta.length);
    console.log('catalogImagesWithMeta type:', typeof catalogImagesWithMeta);
    console.log('Is catalogImagesWithMeta an array?', Array.isArray(catalogImagesWithMeta));
  }, [catalogImagesWithMeta]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
    reset,
  } = useForm<VendorEditForm>({
    defaultValues: {
      brand_name: '',
      spoc_name: '',
      category: [],  // Changed to array - validation will be done in onSubmit
      subcategory: '',
      phone_number: '',
      alternate_number: '',
      whatsapp_number: '',
      email: '',
      instagram: '',
      address: '',
      google_maps_link: '',
      experience: '',
      total_events: 0,
      quick_intro: '',
      caption: '',
      detailed_intro: '',
      highlight_features: [],
      starting_price: 0,
      languages: [],
      services: [],
      packages: [],
        catalog_images: [],
        catalog_images_metadata: [],
      booking_policies: {
        cancellation_policy: '',
        payment_terms: '',
        booking_requirements: '',
        advance: ''
      },
      additional_info: {
        working_hours: '',
        languages: [],
        service_areas: [],
        awards: [],
        certifications: [],
        custom_fields: []
      },
      currently_available: false,
      catalog_highlights_updated: ''
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


  const { fields: catalogImageFields, append: appendCatalogImage, remove: removeCatalogImage } = useFieldArray({
    control,
    name: "catalog_images" as any
  });

  // Handle state selection for service areas
  const handleStateToggle = (stateValue: string) => {
    setSelectedStates(prev => {
      const newStates = prev.includes(stateValue) 
        ? prev.filter(s => s !== stateValue)
        : [...prev, stateValue];
      
      // Update form value
      setValue('additional_info.service_areas', newStates);
      return newStates;
    });
  };

  const removeState = (stateValue: string) => {
    setSelectedStates(prev => {
      const newStates = prev.filter(s => s !== stateValue);
      setValue('additional_info.service_areas', newStates);
      return newStates;
    });
  };

  const getStateLabel = (stateValue: string) => {
    return indianStates.find(state => state.value === stateValue)?.label || stateValue;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatesDropdown && !(event.target as Element).closest('.states-dropdown')) {
        setShowStatesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatesDropdown]);


  const { fields: customFields, append: appendCustomField, remove: removeCustomField } = useFieldArray({
    control,
    name: "additional_info.custom_fields" as any
  });

  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: "highlight_features" as any
  });

  // Effect to ensure brand logo and contact person image are set after form loads
  useEffect(() => {
    if (!isLoadingFormData && vendor) {
      // Use a small delay to ensure form is ready
      const timer = setTimeout(() => {
        if (originalBrandLogoUrl) {
          const currentValue = watch('brand_logo_url' as any);
          console.log('Checking brand logo - current:', currentValue, 'original:', originalBrandLogoUrl);
          if (currentValue !== originalBrandLogoUrl) {
            console.log('Setting brand_logo_url from original:', originalBrandLogoUrl);
            setValue('brand_logo_url' as any, originalBrandLogoUrl, { shouldValidate: false, shouldDirty: false });
          }
        }
        if (originalContactPersonImageUrl) {
          const currentValue = watch('contact_person_image_url' as any);
          console.log('Checking contact person - current:', currentValue, 'original:', originalContactPersonImageUrl);
          if (currentValue !== originalContactPersonImageUrl) {
            console.log('Setting contact_person_image_url from original:', originalContactPersonImageUrl);
            setValue('contact_person_image_url' as any, originalContactPersonImageUrl, { shouldValidate: false, shouldDirty: false });
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoadingFormData, vendor, originalBrandLogoUrl, originalContactPersonImageUrl, watch, setValue]);

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
          console.log('=== LOADING CATALOG IMAGES IN INIT ===');
          console.log('Final vendor data vendor_id:', finalVendorData.vendor_id);
          console.log('Final vendor data vendor_id type:', typeof finalVendorData.vendor_id);
          console.log('Vendor catalog_images_metadata:', finalVendorData.catalog_images_metadata);
          // Pass existing metadata to preserve highlight status
          catalogImages = await loadCatalogImages(finalVendorData.vendor_id, finalVendorData.catalog_images_metadata);
          console.log('Catalog images loaded successfully:', catalogImages);
          // Store original catalog images for comparison
          setOriginalCatalogImages(catalogImages);
        } catch (catalogError) {
          console.error('Error loading catalog images:', catalogError);
          catalogImages = [];
          setOriginalCatalogImages([]);
        }
        
        // Load brand logo and contact person image directly from storage (same as catalog images)
        let brandLogoUrl = '';
        let contactPersonImageUrl = '';
        try {
          const vendorIdStr = finalVendorData.vendor_id.toString();
          console.log('=== LOADING BRAND LOGO AND CONTACT PERSON IMAGE FROM STORAGE ===');
          console.log('Vendor ID (string):', vendorIdStr);
          
          // Load brand logo from storage (same approach as catalog images)
          brandLogoUrl = await getVendorBrandLogoFromStorage(vendorIdStr) || '';
          if (brandLogoUrl) {
            console.log('✅ Brand logo loaded from storage:', brandLogoUrl);
            setOriginalBrandLogoUrl(brandLogoUrl);
          } else {
            console.log('⚠️ No brand logo found in storage');
          }
          
          // Load contact person image from storage (same approach as catalog images)
          contactPersonImageUrl = await getVendorContactPersonImageFromStorage(vendorIdStr) || '';
          if (contactPersonImageUrl) {
            console.log('✅ Contact person image loaded from storage:', contactPersonImageUrl);
            setOriginalContactPersonImageUrl(contactPersonImageUrl);
          } else {
            console.log('⚠️ No contact person image found in storage');
          }
        } catch (mediaError) {
          console.error('❌ Error loading brand logo/contact person image from storage:', mediaError);
          console.error('Error stack:', mediaError instanceof Error ? mediaError.stack : 'No stack');
        }
        
        // Load form with final data - SINGLE CALL ONLY
        console.log('Loading form with final vendor data (single call)');
        console.log('Passing catalogImages to loadVendorData:', catalogImages);
        loadVendorData(finalVendorData, catalogImages, brandLogoUrl, contactPersonImageUrl);
        
        // Load pending changes
        loadPendingChanges(parseInt(finalVendorData.vendor_id));
        
      } catch (error) {
        console.error('Error in initializeVendorData:', error);
        // Last resort: use localStorage data only
        console.warn('Using localStorage data as last resort');
        setVendor(loggedInVendor);
        // Try to load media even in last resort - from storage (same as catalog images)
        let brandLogoUrl = '';
        let contactPersonImageUrl = '';
        try {
          const vendorIdStr = loggedInVendor.vendor_id.toString();
          console.log('Loading media in last resort from storage for vendor:', vendorIdStr);
          
          brandLogoUrl = await getVendorBrandLogoFromStorage(vendorIdStr) || '';
          if (brandLogoUrl) {
            console.log('✅ Loaded brand logo in last resort:', brandLogoUrl);
            setOriginalBrandLogoUrl(brandLogoUrl);
          }
          
          contactPersonImageUrl = await getVendorContactPersonImageFromStorage(vendorIdStr) || '';
          if (contactPersonImageUrl) {
            console.log('✅ Loaded contact person image in last resort:', contactPersonImageUrl);
            setOriginalContactPersonImageUrl(contactPersonImageUrl);
          }
        } catch (e) {
          console.error('Error loading media in last resort:', e);
        }
        loadVendorData(loggedInVendor, [], brandLogoUrl, contactPersonImageUrl);
        loadPendingChanges(parseInt(loggedInVendor.vendor_id));
      }
    };

    initializeVendorData();
  }, [navigate]);

  const loadVendorData = (vendorData: Vendor, catalogImagesData?: string[], brandLogoUrl?: string, contactPersonImageUrl?: string) => {
    // Prevent multiple simultaneous calls
    if (isLoadingFormData) {
      console.log('Form data is already loading, skipping duplicate call');
      return;
    }
    
    setIsLoadingFormData(true);
    console.log('Loading vendor data with reset approach...');
    
    // Process services from both services and specialties
    const allServices: Array<{name: string, description: string, price?: string}> = [];
    
    // Add services from vendorData.services
    if (vendorData.services && Array.isArray(vendorData.services) && vendorData.services.length > 0) {
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
    
    // Don't load from specialties - only use services field to avoid hardcoded data
    
    // Remove duplicates based on service name (case-insensitive)
    const uniqueServices = allServices.filter((service, index, array) => {
      const trimmedLowerName = service.name.toLowerCase();
      return array.findIndex(item => item.name.toLowerCase() === trimmedLowerName) === index;
    });
    
    // Prepare complete form data for reset
    const formData = {
      // Basic Information
      brand_name: vendorData.brand_name || '',
      spoc_name: vendorData.spoc_name || '',
      // PRIORITIZE categories field (new field) over category (old field)
      // Also clean malformed entries like ["{Caterers}"] or ["{\"Event Planners\"}"]
      category: (() => {
        const normalizeCategories = (cats: any): string[] => {
          if (!cats) return [];
          if (Array.isArray(cats)) {
            return cats
              .map((cat: any) => {
                if (typeof cat === 'string') {
                  // Remove curly braces, escaped quotes, and trim
                  let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
                  return cleaned;
                }
                return String(cat).trim();
              })
              .filter((cat: string) => cat && cat !== '');
          }
          if (typeof cats === 'string') {
            return [cats.trim()].filter(c => c !== '');
          }
          return [];
        };

        // First check categories field (the new array field) - PRIORITIZE THIS
        if (vendorData.categories !== undefined && vendorData.categories !== null) {
          const normalized = normalizeCategories(vendorData.categories);
          console.log('Loading categories from categories field:', vendorData.categories, '-> normalized:', normalized);
          if (normalized.length > 0) {
            return normalized;
          }
        }
        // Fallback to category field (legacy support)
        if (vendorData.category !== undefined && vendorData.category !== null) {
          const normalized = normalizeCategories(vendorData.category);
          console.log('Loading categories from category field (fallback):', vendorData.category, '-> normalized:', normalized);
          if (normalized.length > 0) {
            return normalized;
          }
        }
        console.log('No categories found, returning empty array');
        return [];
      })(),
      subcategory: vendorData.subcategory || '',
      brand_logo_url: brandLogoUrl || '',
      contact_person_image_url: contactPersonImageUrl || '',
      
      // Contact Information
      phone_number: vendorData.phone_number || '',
      alternate_number: vendorData.alternate_number || '',
      whatsapp_number: vendorData.whatsapp_number || '',
      email: vendorData.email || '',
      instagram: vendorData.instagram || '',
      address: vendorData.address || '',
      google_maps_link: vendorData.google_maps_link || '',
      
      // Business Details
      experience: vendorData.experience || '',
      total_events: vendorData.events_completed || 0,  // Map events_completed from database to total_events in form
      quick_intro: vendorData.quick_intro || '',
      caption: vendorData.caption || '',
      detailed_intro: vendorData.detailed_intro || '',
      starting_price: vendorData.starting_price || 0,
      languages: vendorData.languages || vendorData.languages_spoken || [],  // Use new languages field, fallback to languages_spoken
      currently_available: vendorData.currently_available || false,
      catalog_highlights_updated: '',
      
      // Array fields
      services: uniqueServices,
      packages: vendorData.packages || [],
        catalog_images: catalogImagesData || [],
        catalog_images_metadata: vendorData.catalog_images_metadata || catalogImagesWithMeta || [],
      
      // Object fields - ensure proper structure
      booking_policies: {
        cancellation_policy: vendorData.booking_policies?.cancellation_policy || '',
        payment_terms: vendorData.booking_policies?.payment_terms || '',
        booking_requirements: vendorData.booking_policies?.booking_requirements || '',
        advance: vendorData.booking_policies?.advance || ''
      },
      additional_info: {
        working_hours: vendorData.additional_info?.working_hours || '',
        languages: (() => {
          const lang = vendorData.additional_info?.languages;
          if (Array.isArray(lang)) return lang as string[];
          if (typeof lang === 'string') return (lang as string).split(',').map(l => l.trim()).filter(l => l !== '') as string[];
          return [] as string[];
        })(),
        service_areas: Array.isArray(vendorData.additional_info?.service_areas) 
          ? vendorData.additional_info.service_areas
          : [],
        awards: (() => {
          const awards = vendorData.additional_info?.awards;
          if (Array.isArray(awards)) return awards as string[];
          if (typeof awards === 'string') return (awards as string).split(',').map(a => a.trim()).filter(a => a !== '') as string[];
          return [] as string[];
        })(),
        certifications: (() => {
          const certs = vendorData.additional_info?.certifications;
          if (Array.isArray(certs)) return certs as string[];
          if (typeof certs === 'string') return (certs as string).split(',').map(c => c.trim()).filter(c => c !== '') as string[];
          return [] as string[];
        })(),
        custom_fields: vendorData.additional_info?.custom_fields || []
      }
    };
    
    console.log('Resetting form with complete data:', formData);
    console.log('Brand logo URL being set:', brandLogoUrl);
    console.log('Contact person image URL being set:', contactPersonImageUrl);
    
    // Store original categories for comparison later (before reset)
    const normalizedCategories = formData.category || [];
    setOriginalCategories(normalizedCategories);
    console.log('Storing original categories for comparison:', normalizedCategories);
    
    // Reset the entire form with new data - this clears everything and sets new values
    reset(formData);
    
    // Explicitly set brand logo and contact person image URLs to ensure they're in the form
    if (brandLogoUrl) {
      console.log('Setting brand_logo_url via setValue:', brandLogoUrl);
      setValue('brand_logo_url', brandLogoUrl, { shouldValidate: false, shouldDirty: false });
      // Also update the original state
      setOriginalBrandLogoUrl(brandLogoUrl);
      console.log('✅ brand_logo_url set in form');
    } else {
      console.log('⚠️ No brandLogoUrl to set');
    }
    if (contactPersonImageUrl) {
      console.log('Setting contact_person_image_url via setValue:', contactPersonImageUrl);
      setValue('contact_person_image_url', contactPersonImageUrl, { shouldValidate: false, shouldDirty: false });
      // Also update the original state
      setOriginalContactPersonImageUrl(contactPersonImageUrl);
      console.log('✅ contact_person_image_url set in form');
    } else {
      console.log('⚠️ No contactPersonImageUrl to set');
    }
    
    // CRITICAL: Explicitly set categories to ensure they're populated in the form
    // This is needed because sometimes reset() doesn't properly set array fields
    console.log('Setting categories in form - formData.category:', formData.category, 'Type:', typeof formData.category, 'IsArray:', Array.isArray(formData.category));
    
    // Ensure originalCategories is set (it should already be set above, but double-check)
    if (normalizedCategories && normalizedCategories.length > 0) {
      console.log('✅ originalCategories already set:', normalizedCategories);
    } else if (formData.category && Array.isArray(formData.category) && formData.category.length > 0) {
      // Fallback: set it here if it wasn't set above
      setOriginalCategories(formData.category);
      console.log('Setting originalCategories as fallback:', formData.category);
    }
    
    if (formData.category && Array.isArray(formData.category) && formData.category.length > 0) {
      console.log('Explicitly setting categories via setValue:', formData.category);
      setValue('category', formData.category, { shouldValidate: false, shouldDirty: false });
      // Verify it was set after a short delay
      setTimeout(() => {
        const currentValue = watch('category');
        console.log('Categories after setValue - current value:', currentValue, 'IsArray:', Array.isArray(currentValue), 'Length:', Array.isArray(currentValue) ? currentValue.length : 'N/A');
        if (!Array.isArray(currentValue) || currentValue.length === 0) {
          console.error('WARNING: Categories were not set correctly! Attempting to set again...');
          setValue('category', formData.category, { shouldValidate: false, shouldDirty: false });
        } else {
          console.log('✅ Categories successfully set in form');
        }
      }, 200);
    } else {
      console.warn('⚠️ No categories to set or categories is not an array:', formData.category);
    }
    
    // Verify the values were set
    setTimeout(() => {
      const currentBrandLogo = watch('brand_logo_url');
      const currentContactPerson = watch('contact_person_image_url');
      console.log('Form values after setValue - brand_logo_url:', currentBrandLogo);
      console.log('Form values after setValue - contact_person_image_url:', currentContactPerson);
    }, 100);
    
    // Initialize selectedStates for service areas multi-select
    if (Array.isArray(vendorData.additional_info?.service_areas)) {
      setSelectedStates(vendorData.additional_info.service_areas);
    } else {
      setSelectedStates([]);
    }
    
    console.log('Form reset completed');
    console.log('Form values after reset - brand_logo_url:', watch('brand_logo_url'));
    console.log('Form values after reset - contact_person_image_url:', watch('contact_person_image_url'));
    setLoading(false);
    setIsLoadingFormData(false);
  };


  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const fillSampleData = () => {
    console.log('Fill sample data clicked!');
    
    try {
      // Sample data based on a wedding photographer business
      const sampleData = {
        brand_name: "Elegant Moments Photography",
        spoc_name: "Priya Sharma",
        category: "Photography",
        subcategory: "Wedding Photography",
        brand_logo_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=200",
        contact_person_image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
        phone_number: "+91 98765 43210",
        alternate_number: "+91 87654 32109",
        whatsapp_number: "+91 98765 43210",
        email: "priya@elegantmoments.com",
        instagram: "@elegantmomentsphotography",
        address: "123 Wedding Street, Jubilee Hills, Hyderabad, Telangana 500033",
        experience: "8+ Years",
        total_events: 125,
        quick_intro: "Capturing your special moments with artistic vision and love",
        caption: "Namaskaram! Creating timeless memories through photography",
        detailed_intro: "We are passionate wedding photographers specializing in candid moments and traditional ceremonies. With over 8 years of experience, we have captured hundreds of beautiful weddings across South India.",
        currently_available: true
      };

      console.log('Setting basic form fields...');
      // Fill basic form fields
      Object.entries(sampleData).forEach(([key, value]) => {
        console.log(`Setting ${key} to:`, value);
        setValue(key as any, value);
      });

      console.log('Clearing existing arrays...');
      // Clear existing arrays first - with safety check
      try {
        while (highlightFields.length > 0) {
          removeHighlight(0);
        }
      } catch (e) {
        console.log('Error clearing highlights:', e);
      }
      
      try {
    while (serviceFields.length > 0) {
      removeService(0);
        }
      } catch (e) {
        console.log('Error clearing services:', e);
    }
    
      try {
    while (packageFields.length > 0) {
      removePackage(0);
        }
      } catch (e) {
        console.log('Error clearing packages:', e);
    }
    
    
      try {
    while (customFields.length > 0) {
      removeCustomField(0);
    }
      } catch (e) {
        console.log('Error clearing custom fields:', e);
      }
      
      try {
        while (catalogImageFields.length > 0) {
          removeCatalogImage(0);
        }
      } catch (e) {
        console.log('Error clearing catalog images:', e);
      }

      console.log('Adding sample highlight features...');
      // Add sample highlight features
      const sampleHighlights = [
        "Award-winning photography",
        "Same-day preview delivery",
        "Traditional & candid styles",
        "Drone photography included"
      ];
      sampleHighlights.forEach((highlight, index) => {
        console.log(`Adding highlight ${index + 1}:`, highlight);
        appendHighlight(highlight);
      });

      console.log('Adding sample services...');
      // Add sample services
      const sampleServices = [
        {
          name: "Wedding Day Photography",
          description: "Complete wedding day coverage from pre-wedding rituals to reception",
          price: "75000"
        },
        {
          name: "Pre-Wedding Shoot",
          description: "Romantic couple photoshoot at scenic locations",
          price: "25000"
        },
        {
          name: "Engagement Photography",
          description: "Beautiful engagement ceremony documentation",
          price: "35000"
        }
      ];
      sampleServices.forEach((service, index) => {
        console.log(`Adding service ${index + 1}:`, service);
      appendService(service);
    });

    // Add sample packages
    const samplePackages = [
      {
        name: "Essential Package",
        price: "50000",
        description: "Perfect for intimate weddings",
        features: "6 hours coverage, 300+ edited photos, Online gallery, USB drive"
      },
      {
        name: "Premium Package",
        price: "85000",
        description: "Complete wedding documentation",
        features: "12 hours coverage, 600+ edited photos, Online gallery, USB drive, Photo album, Pre-wedding shoot"
      },
      {
        name: "Luxury Package",
        price: "125000",
        description: "Ultimate wedding photography experience",
        features: "Full day coverage, 1000+ edited photos, Online gallery, USB drive, Premium photo album, Pre-wedding shoot, Drone photography, Same day highlights"
      }
    ];
    samplePackages.forEach(pkg => {
        appendPackage(pkg);
      });


    // Add sample catalog images
    const sampleCatalogImages = [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800"
    ];
    sampleCatalogImages.forEach(imageUrl => {
      appendCatalogImage(imageUrl);
    });

    // Add sample customer reviews

    // Set sample booking policies
    setValue('booking_policies.cancellation_policy', 'Cancellation allowed up to 30 days before the event with 50% refund. No refund for cancellations within 30 days.');
    setValue('booking_policies.payment_terms', '30% advance to confirm booking, 50% one week before event, remaining 20% on delivery of final photos.');
    setValue('booking_policies.booking_requirements', 'Valid ID proof, signed agreement, and advance payment required to confirm booking.');

    // Set sample additional info
    setValue('additional_info.working_hours', '9:00 AM - 8:00 PM, Available on weekends and holidays');
    setValue('additional_info.languages', ['English', 'Hindi', 'Telugu', 'Tamil']);
    setValue('additional_info.service_areas', ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai']);
    setValue('additional_info.awards', ['Best Wedding Photographer 2023 - Hyderabad Wedding Awards', 'Excellence in Photography 2022 - South India Photo Awards']);
    setValue('additional_info.certifications', ['Certified Professional Photographer - Indian Photography Association', 'Wedding Photography Specialist - Creative Arts Institute']);

    // Add sample custom fields
    const sampleCustomFields = [
      {
        field_name: "Backup Equipment",
        field_value: "Yes, we carry backup cameras and lenses for all shoots"
      },
      {
        field_name: "Travel Charges",
        field_value: "Free within Hyderabad, ₹5000 for outstation weddings"
      }
    ];
    sampleCustomFields.forEach(field => {
        appendCustomField(field);
      });

      console.log('Sample data filling completed successfully!');
      setHighlightMessage('✅ Sample data filled successfully! You can now edit or submit this data.');
      setTimeout(() => setHighlightMessage(''), 5000);
    } catch (error) {
      console.error('Error filling sample data:', error);
      setHighlightMessage('❌ Error filling sample data. Please try again.');
      setTimeout(() => setHighlightMessage(''), 5000);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirmType === 'brand_logo') {
        const vendorIdStr = vendor?.vendor_id?.toString() || '';
        const possibleBuckets = ['vendor-images', 'catalog-images', 'images', 'media'];
        let success = false;
        
        // Try to delete from storage
        for (const bucket of possibleBuckets) {
          try {
            // List files in brand_logo folder
            const { data: files, error: listError } = await supabase.storage
              .from(bucket)
              .list(`${vendorIdStr}/brand_logo`);
            
            if (!listError && files && files.length > 0) {
              // Delete all brand logo files
              const filePaths = files.map(file => `${vendorIdStr}/brand_logo/${file.name}`);
              const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove(filePaths);
              
              if (!deleteError) {
                console.log(`✅ Successfully deleted brand logo from bucket: ${bucket}`);
                success = true;
                break;
              }
            }
          } catch (bucketError) {
            console.log(`Error checking bucket ${bucket}:`, bucketError);
            continue;
          }
        }
        
        // Clear form value and original state
        setValue('brand_logo_url', '');
        setOriginalBrandLogoUrl('');
        
        if (success) {
        setHighlightMessage('✅ Brand logo removed successfully!');
        } else {
          setHighlightMessage('⚠️ Brand logo removed from form, but file may still exist in storage.');
        }
        setTimeout(() => setHighlightMessage(''), 3000);
        
      } else if (deleteConfirmType === 'contact_person') {
        const vendorIdStr = vendor?.vendor_id?.toString() || '';
        const possibleBuckets = ['vendor-images', 'catalog-images', 'images', 'media'];
        let success = false;
        
        // Try to delete from storage
        for (const bucket of possibleBuckets) {
          try {
            // List files in contact_person folder
            const { data: files, error: listError } = await supabase.storage
              .from(bucket)
              .list(`${vendorIdStr}/contact_person`);
            
            if (!listError && files && files.length > 0) {
              // Delete all contact person files
              const filePaths = files.map(file => `${vendorIdStr}/contact_person/${file.name}`);
              const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove(filePaths);
              
              if (!deleteError) {
                console.log(`✅ Successfully deleted contact person image from bucket: ${bucket}`);
                success = true;
                break;
              }
            }
          } catch (bucketError) {
            console.log(`Error checking bucket ${bucket}:`, bucketError);
            continue;
          }
        }
        
        // Clear form value and original state
        setValue('contact_person_image_url', '');
        setOriginalContactPersonImageUrl('');
        
        if (success) {
        setHighlightMessage('✅ Contact person image removed successfully!');
        } else {
          setHighlightMessage('⚠️ Contact person image removed from form, but file may still exist in storage.');
        }
        setTimeout(() => setHighlightMessage(''), 3000);
        
      } else if (deleteConfirmType === 'catalog' && deleteConfirmData) {
        console.log('Deleting catalog image:', deleteConfirmData.id);
        console.log('Image data:', deleteConfirmData);
        
        const mediaUrl = deleteConfirmData.media_url || deleteConfirmData.url;
        console.log('Media URL to delete:', mediaUrl);
        
        if (!mediaUrl) {
          setHighlightMessage('❌ Error: Could not find image URL to delete');
          setTimeout(() => setHighlightMessage(''), 5000);
          return;
        }
        
        // Extract file path from Supabase storage URL
        // Format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
        let filePath = '';
        let bucketName = '';
        
        try {
          const urlObj = new URL(mediaUrl);
          const pathParts = urlObj.pathname.split('/').filter(p => p);
          
          // Find the bucket name (usually after 'public')
          const publicIndex = pathParts.findIndex(p => p === 'public');
          if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
            bucketName = pathParts[publicIndex + 1];
            // Everything after bucket name is the file path
            filePath = pathParts.slice(publicIndex + 2).join('/');
          } else {
            // Fallback: try to extract from pathname
            const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
            for (const bucket of possibleBuckets) {
              const bucketIndex = pathParts.findIndex(p => p === bucket);
              if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                bucketName = bucket;
                filePath = pathParts.slice(bucketIndex + 1).join('/');
                break;
              }
            }
          }
          
          console.log('Extracted bucket:', bucketName);
          console.log('Extracted file path:', filePath);
        } catch (e) {
          console.error('Error parsing URL:', e);
          // Fallback: try to extract filename and construct path
          const vendorIdStr = vendor?.vendor_id?.toString() || '';
          const filename = mediaUrl.split('/').pop() || '';
          filePath = `${vendorIdStr}/catalog/${filename}`;
          bucketName = 'vendor-images'; // Default bucket
          console.log('Using fallback path:', filePath);
        }
        
        let success = false;
        
        if (filePath && bucketName) {
          // Try deleting with extracted bucket and path
          success = await deleteImageFromStorage(filePath, bucketName);
          if (success) {
            console.log(`✅ Successfully deleted from bucket: ${bucketName}, path: ${filePath}`);
          }
        }
        
        // If that didn't work, try all possible buckets
        if (!success) {
          const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
          const vendorIdStr = vendor?.vendor_id?.toString() || '';
          const filename = filePath.split('/').pop() || mediaUrl.split('/').pop() || '';
          
          for (const bucket of possibleBuckets) {
            const possiblePaths = [
              filePath, // Use extracted path first
              `${vendorIdStr}/catalog/${filename}`,
              `${vendorIdStr}/${filename}`,
              filename
            ];
            
            for (const path of possiblePaths) {
              if (!path) continue;
              success = await deleteImageFromStorage(path, bucket);
              if (success) {
                console.log(`✅ Successfully deleted from bucket: ${bucket}, path: ${path}`);
                break;
              }
            }
            
            if (success) break;
          }
        }
        
        console.log('Delete result:', success);
        
        if (success) {
          // Remove from local state
          console.log('Removing from local state...');
          setCatalogImagesWithMeta(prev => {
            const newImages = prev.filter(img => img.id !== deleteConfirmData.id);
            console.log('Updated catalogImagesWithMeta:', newImages);
            return newImages;
          });
          setCatalogImages(prev => {
            const newUrls = prev.filter(url => url !== deleteConfirmData.media_url);
            console.log('Updated catalogImages:', newUrls);
            return newUrls;
          });
          
          // Remove from uploadedImageUrls if it exists there
          setUploadedImageUrls(prev => {
            const newUrls = prev.filter(url => url !== deleteConfirmData.media_url);
            console.log('Updated uploadedImageUrls:', newUrls);
            return newUrls;
          });
          
          // Remove from catalog image form fields (URL inputs section)
          // Remove from catalog_images form field (URL fields)
          // Remove from catalog_images form field if it exists
          const currentCatalogImageValues = watch('catalog_images') || [];
          const urlToRemove = deleteConfirmData.media_url;
          const updatedCatalogImageValues = currentCatalogImageValues.filter((url: string) => url !== urlToRemove);
          setValue('catalog_images', updatedCatalogImageValues);
          console.log('Updated catalog_images form field after gallery delete:', updatedCatalogImageValues);
          
          // Update current highlight status to remove deleted image
          setCurrentHighlightStatus(prev => 
            prev.filter(img => img.id !== deleteConfirmData.id)
          );
          
          setHighlightMessage('✅ Image deleted successfully!');
          setTimeout(() => setHighlightMessage(''), 3000);
          
          // Refresh catalog images from storage to update gallery
          if (vendor?.vendor_id) {
            try {
              console.log('Refreshing catalog images from storage after deletion...');
              // Use the existing loadCatalogImages function which properly updates state
              // Pass current metadata to preserve highlight status
              const currentMetadata = watch('catalog_images_metadata') || catalogImagesWithMeta || [];
              await loadCatalogImages(vendor.vendor_id.toString(), currentMetadata);
              console.log('✅ Catalog images refreshed from storage');
            } catch (refreshError) {
              console.error('Error refreshing after delete:', refreshError);
              setHighlightMessage('⚠️ Image deleted but failed to refresh gallery. Please reload the page.');
              setTimeout(() => setHighlightMessage(''), 5000);
            }
          }
        } else {
          setHighlightMessage('❌ Failed to delete image. Please try again.');
          setTimeout(() => setHighlightMessage(''), 5000);
        }
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
      setHighlightMessage('❌ Error: ' + (error as Error).message);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteConfirmData(null);
      setDeleteConfirmType('brand_logo');
      console.log('Delete confirmation dialog closed');
    }
  };

  const loadCatalogImages = async (vendorId: string, existingMetadata?: any[]): Promise<string[]> => {
    try {
      console.log('=== LOADING CATALOG IMAGES FROM STORAGE ===');
      console.log('Vendor ID:', vendorId);
      console.log('Vendor ID type:', typeof vendorId);
      
      // Get metadata from parameter, vendor state, or form field
      const metadata = existingMetadata || vendor?.catalog_images_metadata || watch('catalog_images_metadata') || [];
      console.log('Existing metadata for highlights:', metadata);
      console.log('Metadata count:', metadata.length);
      
      // First, let's see what buckets are available
      console.log('Listing available storage buckets...');
      const buckets = await listStorageBuckets();
      console.log('Available buckets:', buckets);
      
      // Try different bucket names and folder structures
      const possibleBuckets = ['catalog-images', 'vendor-images', 'images', 'media'];
      const possibleFolders = ['catalog', 'gallery', 'images', ''];
      
      let storageImages: any[] = [];
      let bucketUsed = '';
      let folderUsed = '';
      
      // Try to find catalog images in different buckets - ONLY vendor-specific
      const vendorIdStr = vendorId.toString();
      for (const bucket of possibleBuckets) {
        console.log(`Trying bucket: ${bucket} for catalog images (vendor: ${vendorIdStr})`);
        
        // Use the catalog-specific function that filters properly
        const catalogImages = await getVendorCatalogImagesFromStorage(vendorId, bucket);
        if (catalogImages.length > 0) {
          // Double-check that all images belong to this vendor by verifying URL contains vendor ID
          const vendorSpecificImages = catalogImages.filter(img => {
            const urlContainsVendorId = img.url && img.url.includes(`/${vendorIdStr}/`);
            if (!urlContainsVendorId) {
              console.warn(`⚠️ Image URL does not contain vendor ID ${vendorIdStr}:`, img.url);
            }
            return urlContainsVendorId;
          });
          
          if (vendorSpecificImages.length > 0) {
            storageImages = vendorSpecificImages;
            bucketUsed = bucket;
            folderUsed = 'catalog';
            console.log(`✅ Found ${vendorSpecificImages.length} vendor-specific catalog images in bucket ${bucket}`);
            break;
          } else {
            console.warn(`⚠️ No vendor-specific images found in bucket ${bucket}, trying next bucket...`);
          }
        }
      }
      
      if (storageImages.length === 0) {
        console.warn('No catalog images found in any storage bucket for vendor:', vendorId);
        console.log('Tried buckets:', possibleBuckets);
        console.log('Tried folders:', possibleFolders);
        return [];
      }
      
      // Convert storage images to the format expected by the component
      const imageUrls = storageImages.map(img => img.url);
      
      // Helper function to normalize URLs for comparison (remove query params, trailing slashes)
      const normalizeUrl = (url: string): string => {
        if (!url) return '';
        try {
          const urlObj = new URL(url);
          return urlObj.pathname;
        } catch {
          // If URL parsing fails, just remove query params manually
          return url.split('?')[0].replace(/\/$/, '');
        }
      };
      
      // Match storage images with existing metadata to preserve highlight status
      const mediaObjects = storageImages.map(img => {
        // Normalize the storage image URL for comparison
        const normalizedImgUrl = normalizeUrl(img.url);
        const imgFilename = img.name || img.url.split('/').pop()?.split('?')[0] || '';
        
        // Try multiple matching strategies to find existing metadata
        const existingMeta = metadata.find((meta: any) => {
          if (!meta) return false;
          
          // Match by exact URL (most reliable)
          if (meta.media_url && img.url && meta.media_url === img.url) {
            console.log(`✅ Matched by exact URL: ${img.url}`);
            return true;
          }
          
          // Match by normalized URL (removes query params)
          if (meta.media_url) {
            const normalizedMetaUrl = normalizeUrl(meta.media_url);
            if (normalizedMetaUrl && normalizedImgUrl && normalizedMetaUrl === normalizedImgUrl) {
              console.log(`✅ Matched by normalized URL: ${normalizedImgUrl}`);
              return true;
            }
          }
          
          // Match by filename (if URLs differ but filename matches)
          const metaFilename = meta.filename || (meta.media_url ? meta.media_url.split('/').pop()?.split('?')[0] : '') || '';
          if (imgFilename && metaFilename && imgFilename === metaFilename) {
            console.log(`✅ Matched by filename: ${imgFilename}`);
            return true;
          }
          
          // Match by ID (if available)
          if (meta.id && img.id && String(meta.id) === String(img.id)) {
            console.log(`✅ Matched by ID: ${img.id}`);
            return true;
          }
          
          // Match by URL containing the same filename (case-insensitive)
          if (meta.media_url && img.url) {
            const metaUrlFilename = meta.media_url.split('/').pop()?.split('?')[0]?.toLowerCase() || '';
            const imgUrlFilename = img.url.split('/').pop()?.split('?')[0]?.toLowerCase() || '';
            if (metaUrlFilename && imgUrlFilename && metaUrlFilename === imgUrlFilename) {
              console.log(`✅ Matched by URL filename (case-insensitive): ${imgUrlFilename}`);
              return true;
            }
          }
          
          return false;
        });
        
        const isHighlighted = existingMeta?.is_highlighted === true || existingMeta?.is_highlighted === 'true';
        console.log(`Image ${img.url}: Found existing meta:`, existingMeta ? 'YES' : 'NO', isHighlighted ? '(highlighted)' : '(not highlighted)');
        if (existingMeta) {
          console.log('  Meta is_highlighted value:', existingMeta.is_highlighted, 'Type:', typeof existingMeta.is_highlighted);
        }
        
        return {
          id: img.id || `img_${Date.now()}_${Math.random()}`,
          media_url: img.url,
          is_highlighted: isHighlighted, // Use the normalized check
          title: img.name || `Catalog Image`,
          filename: img.name || img.url.split('/').pop() || '',
          size: img.size,
          created_at: img.created_at
        };
      });
      
      console.log('=== CATALOG IMAGES FROM STORAGE ===');
      console.log('Bucket used:', bucketUsed);
      console.log('Folder used:', folderUsed);
      console.log('Images found:', storageImages.length);
      console.log('Image URLs:', imageUrls);
      console.log('Media objects:', mediaObjects);
      
      setCatalogImages(imageUrls);
      setCatalogImagesWithMeta(mediaObjects);
      
      // Update the form field with the metadata
      setValue('catalog_images_metadata', mediaObjects, { shouldDirty: false });
      
      // Store current highlight status from metadata
      setCurrentHighlightStatus(mediaObjects.map(img => ({
        id: img.id,
        media_url: img.media_url,
        is_highlighted: img.is_highlighted
      })));
      
      console.log('=== CATALOG IMAGES STATE UPDATED ===');
      console.log('setCatalogImages called with:', imageUrls);
      console.log('setCatalogImagesWithMeta called with:', mediaObjects);
      console.log('Media objects count:', mediaObjects.length);
      
      return imageUrls;
    } catch (error) {
      console.error('Error loading catalog images from storage:', error);
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return [];
    }
  };

  const onSubmit = async (data: VendorEditForm) => {
    if (!vendor) return;

    // Validate address - required field
    if (!data.address || data.address.trim().length < 10) {
      setSubmitMessage('Please provide a complete address (at least 10 characters).');
      return;
    }

    // Validate services - at least one service required
    if (!data.services || data.services.length === 0) {
      setSubmitMessage('Please add at least one service.');
      return;
    }

    // Validate that all services have required fields
    const invalidServices = data.services.filter(service => 
      !service.name || !service.description || service.name.trim() === '' || service.description.trim() === ''
    );
    
    if (invalidServices.length > 0) {
      setSubmitMessage('Please fill in all required fields for all services (name and description).');
      return;
    }

    setSubmitting(true);
    setSubmitMessage('');

    try {
      // Prepare current data and proposed changes
      const currentData = {
        brand_name: vendor.brand_name || '',
        spoc_name: vendor.spoc_name || '',
        // CRITICAL FIX: Use the EXACT SAME normalization as processedFormData
        // This ensures they match if categories weren't changed
        category: (() => {
          // Use the SAME normalization function as processedFormData.category
          const normalizeCategories = (cats: any): string[] => {
            if (!cats) return [];
            if (Array.isArray(cats)) {
              return cats
                .map((cat: any) => {
                  if (typeof cat === 'string') {
                    // Remove curly braces, escaped quotes, and trim
                    let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
                    return cleaned;
                  }
                  return String(cat).trim();
                })
                .filter((cat: string) => cat && cat !== '')
                .sort(); // Sort for consistent comparison
            }
            if (typeof cats === 'string') {
              return [cats.trim()].filter(c => c !== '').sort();
            }
            return [];
          };
          
          // ALWAYS use the form's current value with the SAME normalization
          const normalized = normalizeCategories(data.category);
          console.log('currentData.category - Using form data.category with same normalization:', data.category, '->', normalized);
          return normalized;
        })(),
        subcategory: vendor.subcategory || '',
        brand_logo_url: originalBrandLogoUrl || '', // Use original value for comparison
        contact_person_image_url: originalContactPersonImageUrl || '', // Use original value for comparison
        phone_number: vendor.phone_number || '',
        alternate_number: vendor.alternate_number || '',
        whatsapp_number: vendor.whatsapp_number || '',
        email: vendor.email || '',
        instagram: vendor.instagram || '',
        address: vendor.address || '',
        google_maps_link: vendor.google_maps_link || '',
        experience: vendor.experience || '',
        events_completed: vendor.events_completed || 0,  // Use events_completed to match processedFormData
        quick_intro: vendor.quick_intro || '',
        caption: vendor.caption || '',
        detailed_intro: vendor.detailed_intro || '',
        starting_price: vendor.starting_price || 0,
        languages: vendor.languages || vendor.languages_spoken || [],  // Include languages field
        services: vendor.services || [],
        packages: vendor.packages || [],
        catalog_images: originalCatalogImages || [],
        catalog_images_metadata: vendor.catalog_images_metadata || [],
        booking_policies: vendor.booking_policies || undefined,
        additional_info: vendor.additional_info || undefined,
        currently_available: vendor.currently_available || false
        // Note: catalog_highlights_updated is excluded - it's only for form change tracking
      };

      console.log('Current vendor data:', currentData);

      // Process the form data
      const processedFormData = {
        brand_name: data.brand_name || '',
        spoc_name: data.spoc_name || '',
        // Normalize categories - ensure it's a sorted array for consistent comparison with currentData
        category: (() => {
          const normalizeCategories = (cats: any): string[] => {
            if (!cats) return [];
            if (Array.isArray(cats)) {
              return cats
                .map((cat: any) => {
                  if (typeof cat === 'string') {
                    // Remove curly braces, escaped quotes, and trim
                    let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
                    return cleaned;
                  }
                  return String(cat).trim();
                })
                .filter((cat: string) => cat && cat !== '')
                .sort(); // Sort for consistent comparison
            }
            if (typeof cats === 'string') {
              return [cats.trim()].filter(c => c !== '').sort();
            }
            return [];
          };
          
          const normalized = normalizeCategories(data.category);
          console.log('processedFormData - Normalizing category:', data.category, '-> normalized:', normalized);
          return normalized;
        })(),
        categories: (() => {
          // Use the same normalization as category
          const normalizeCategories = (cats: any): string[] => {
            if (!cats) return [];
            if (Array.isArray(cats)) {
              return cats
                .map((cat: any) => {
                  if (typeof cat === 'string') {
                    let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
                    return cleaned;
                  }
                  return String(cat).trim();
                })
                .filter((cat: string) => cat && cat !== '')
                .sort(); // Sort for consistent comparison
            }
            if (typeof cats === 'string') {
              return [cats.trim()].filter(c => c !== '').sort();
            }
            return [];
          };
          
          return normalizeCategories(data.category);
        })(),
        subcategory: data.subcategory || '',
        brand_logo_url: data.brand_logo_url || '', // Added brand logo
        contact_person_image_url: data.contact_person_image_url || '', // Added contact person image
        phone_number: data.phone_number || '',
        alternate_number: data.alternate_number || '',
        whatsapp_number: data.whatsapp_number || '',
        email: data.email || '',
        instagram: data.instagram || '',
        address: data.address || '',
        google_maps_link: data.google_maps_link || '',
        experience: data.experience || '',
        events_completed: data.total_events || 0,  // Map total_events to events_completed for database
        quick_intro: data.quick_intro || '',
        caption: data.caption || '',
        detailed_intro: data.detailed_intro || '',
        highlight_features: data.highlight_features?.filter(h => h && h.trim() !== '').slice(0, 4) || [],
        starting_price: data.starting_price || 0,
        languages: data.languages?.filter(l => l && l.trim() !== '') || [],  // Save to new languages field
        services: data.services?.filter(s => s.name && s.name.trim() !== '') || [],
        packages: data.packages?.filter(p => p.name && p.name.trim() !== '').map(pkg => ({
          ...pkg,
          features: typeof (pkg.features as unknown) === 'string' 
            ? ((pkg.features as unknown) as string).split(',').map(f => f.trim()).filter(f => f !== '')
            : pkg.features || []
        })) || [],
        catalog_images: [...(data.catalog_images?.filter(img => img && img.trim() !== '') || []), ...uploadedImageUrls],
        catalog_images_metadata: data.catalog_images_metadata || [],
        booking_policies: data.booking_policies ? {
          cancellation_policy: data.booking_policies.cancellation_policy || '',
          payment_terms: data.booking_policies.payment_terms || '',
          booking_requirements: data.booking_policies.booking_requirements || '',
          advance: data.booking_policies.advance || ''
        } : undefined,
        additional_info: data.additional_info ? {
          working_hours: data.additional_info.working_hours || '',
          languages: (() => {
            const lang: any = data.additional_info.languages;
            if (Array.isArray(lang)) return lang as string[];
            if (typeof lang === 'string') return lang.split(',').map((l: string) => l.trim()).filter((l: string) => l !== '') as string[];
            return [] as string[];
          })(),
          service_areas: Array.isArray(data.additional_info.service_areas) 
            ? data.additional_info.service_areas
            : [],
          awards: (() => {
            const awards = data.additional_info.awards;
            if (Array.isArray(awards)) return awards as string[];
            if (typeof awards === 'string') return (awards as string).split(',').map(a => a.trim()).filter(a => a !== '') as string[];
            return [] as string[];
          })(),
          certifications: (() => {
            const certs = data.additional_info.certifications;
            if (Array.isArray(certs)) return certs as string[];
            if (typeof certs === 'string') return (certs as string).split(',').map(c => c.trim()).filter(c => c !== '') as string[];
            return [] as string[];
          })(),
          custom_fields: data.additional_info.custom_fields?.filter(f => 
            f.field_name && f.field_name.trim() !== '' && f.field_value && f.field_value.trim() !== ''
          ) || []
        } : undefined,
        currently_available: data.currently_available || false
        // Note: catalog_highlights_updated is excluded - it's only for form change tracking
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
        
        // Special debugging for services field
        if (key === 'services') {
          console.log('=== SERVICES DEBUG ===');
          console.log('Current services type:', typeof currentValue);
          console.log('Current services is array:', Array.isArray(currentValue));
          console.log('New services type:', typeof newValue);
          console.log('New services is array:', Array.isArray(newValue));
          if (Array.isArray(currentValue)) {
            console.log('Current services length:', currentValue.length);
            console.log('Current services items:', currentValue);
          }
          if (Array.isArray(newValue)) {
            console.log('New services length:', newValue.length);
            console.log('New services items:', newValue);
          }
        }
        
        // Special debugging for catalog_images field
        if (key === 'catalog_images') {
          console.log('=== CATALOG IMAGES DEBUG ===');
          console.log('Current catalog_images type:', typeof currentValue);
          console.log('Current catalog_images is array:', Array.isArray(currentValue));
          console.log('New catalog_images type:', typeof newValue);
          console.log('New catalog_images is array:', Array.isArray(newValue));
          if (Array.isArray(currentValue)) {
            console.log('Current catalog_images length:', currentValue.length);
            console.log('Current catalog_images items:', currentValue);
          }
          if (Array.isArray(newValue)) {
            console.log('New catalog_images length:', newValue.length);
            console.log('New catalog_images items:', newValue);
          }
          console.log('Uploaded image URLs:', uploadedImageUrls);
        }
        
        // Skip if both values are effectively empty or both are undefined
        // Exception: Always include email and alternate_number if newValue is not empty (even if currentValue is empty)
        if (key !== 'email' && key !== 'alternate_number') {
        if ((isEffectivelyEmpty(currentValue) && isEffectivelyEmpty(newValue)) ||
            (currentValue === undefined && newValue === undefined)) {
          console.log(`Skipping ${key} - both effectively empty or undefined`);
          return;
          }
        } else {
          // For email and alternate_number, only skip if newValue is also empty
          if (isEffectivelyEmpty(newValue) && isEffectivelyEmpty(currentValue)) {
            console.log(`Skipping ${key} - both effectively empty`);
            return;
          }
        }
        
        // Normalize values for comparison (sort object keys, handle null/undefined)
        const normalizeForComparison = (val: any): any => {
          if (val === null || val === undefined) return null;
          if (Array.isArray(val)) {
            // Special handling for services array - sort by name for consistent comparison
            if (key === 'services' && val.length > 0) {
              // Handle both string and object formats for services
              const normalizedServices = val.map(service => {
                if (typeof service === 'string') {
                  return { name: service, description: '', price: '' };
                }
                return {
                  name: service?.name || '',
                  description: service?.description || '',
                  price: service?.price || ''
                };
              }).filter(service => service.name.trim() !== '');
              
              return normalizedServices.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            }
            return val.sort();
          }
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
        
        // Special handling for services - if both are empty arrays, consider them equal
        if (key === 'services') {
          const currentIsEmpty = !normalizedCurrent || (Array.isArray(normalizedCurrent) && normalizedCurrent.length === 0);
          const newIsEmpty = !normalizedNew || (Array.isArray(normalizedNew) && normalizedNew.length === 0);
          
          if (currentIsEmpty && newIsEmpty) {
            console.log(`Skipping ${key} - both are empty arrays`);
            return;
          }
          
          console.log('Normalized current services:', normalizedCurrent);
          console.log('Normalized new services:', normalizedNew);
        }
        
        // Special handling for category/categories - normalize and sort arrays before comparison
        if (key === 'category' || key === 'categories') {
          const normalizeCategories = (cats: any): string[] => {
            if (!cats) return [];
            if (Array.isArray(cats)) {
              return cats
                .map((cat: any) => {
                  if (typeof cat === 'string') {
                    // Remove curly braces, escaped quotes, and trim
                    let cleaned = cat.replace(/^\{+|\}+$/g, '').replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();
                    return cleaned;
                  }
                  return String(cat).trim();
                })
                .filter((cat: string) => cat && cat !== '')
                .sort(); // Sort for consistent comparison
            }
            if (typeof cats === 'string') {
              return [cats.trim()].filter(c => c !== '').sort();
            }
            return [];
          };
          
          const currentArray = normalizeCategories(currentValue);
          const newArray = normalizeCategories(newValue);
          
          // If both are empty, skip (no change)
          if (currentArray.length === 0 && newArray.length === 0) {
            console.log(`✅ Skipping ${key} - both are empty arrays`);
            return;
          }
          
          // Compare sorted arrays
          const currentStr = JSON.stringify(currentArray);
          const newStr = JSON.stringify(newArray);
          
          console.log(`=== CATEGORY COMPARISON DEBUG ===`);
          console.log(`Field: ${key}`);
          console.log(`Current value (raw):`, currentValue);
          console.log(`New value (raw):`, newValue);
          console.log(`Current (normalized & sorted):`, currentArray);
          console.log(`New (normalized & sorted):`, newArray);
          console.log(`Current string:`, currentStr);
          console.log(`New string:`, newStr);
          console.log(`Are equal:`, currentStr === newStr);
          console.log(`Current length:`, currentArray.length);
          console.log(`New length:`, newArray.length);
          
          if (currentStr !== newStr) {
            console.log(`❌ Adding ${key} to changes - categories differ`);
            proposedChanges[key] = newValue;
          } else {
            console.log(`✅ Skipping ${key} - categories are identical (ignoring order and format)`);
          }
          return; // Skip the general comparison for categories
        }
        
        // Deep comparison for objects and arrays
        if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedNew)) {
          console.log(`Adding ${key} to changes - values differ`);
          proposedChanges[key] = newValue;
        } else {
          console.log(`Skipping ${key} - values are identical`);
        }
      });

      console.log('Only changed fields:', proposedChanges);

      // Special handling for catalog images - only include if there are actual changes
      if (proposedChanges.catalog_images) {
        const currentImages = currentData.catalog_images || [];
        const newImages = proposedChanges.catalog_images || [];
        
        console.log('=== CATALOG IMAGES CHANGE ANALYSIS ===');
        console.log('Original images (from database):', originalCatalogImages);
        console.log('Current images (for comparison):', currentImages);
        console.log('New images (from form + uploaded):', newImages);
        console.log('Original images count:', originalCatalogImages.length);
        console.log('Current images count:', currentImages.length);
        console.log('New images count:', newImages.length);
        
        // Check if there are actual differences (added/removed images)
        const currentSet = new Set(currentImages);
        const newSet = new Set(newImages);
        
        const addedImages = newImages.filter(img => !currentSet.has(img));
        const removedImages = currentImages.filter(img => !newSet.has(img));
        
        console.log('Added images:', addedImages);
        console.log('Removed images:', removedImages);
        console.log('Added count:', addedImages.length);
        console.log('Removed count:', removedImages.length);
        
        // Only include catalog_images in changes if there are actual additions or removals
        if (addedImages.length > 0 || removedImages.length > 0) {
          // Create a more descriptive change object
          proposedChanges.catalog_images = {
            added: addedImages,
            removed: removedImages,
            current_count: currentImages.length,
            new_count: newImages.length
          };
          console.log('✅ Including catalog images changes:', proposedChanges.catalog_images);
        } else {
          // No actual changes, remove from proposed changes
          delete proposedChanges.catalog_images;
          console.log('❌ No actual catalog images changes detected, removing from proposed changes');
        }
      }

      // Check for highlight status changes
      console.log('=== CHECKING HIGHLIGHT STATUS CHANGES ===');
      console.log('Current highlight status:', currentHighlightStatus);
      console.log('Current catalog images with meta:', catalogImagesWithMeta);
      
      const currentHighlights = currentHighlightStatus.map(img => ({
        media_url: img.media_url,
        is_highlighted: img.is_highlighted
      }));
      
      const newHighlights = catalogImagesWithMeta.map(img => ({
        media_url: img.media_url,
        is_highlighted: img.is_highlighted || false
      }));
      
      console.log('Current highlights for comparison:', currentHighlights);
      console.log('New highlights for comparison:', newHighlights);
      
      // Compare highlight status
      const highlightsChanged = JSON.stringify(currentHighlights.sort((a, b) => a.media_url.localeCompare(b.media_url))) !== 
                                JSON.stringify(newHighlights.sort((a, b) => a.media_url.localeCompare(b.media_url)));
      
      console.log('Highlights changed:', highlightsChanged);
      
      if (highlightsChanged) {
        console.log('Adding highlight_status_changes to proposed changes');
        proposedChanges.highlight_status_changes = {
          current: currentHighlights,
          proposed: newHighlights,
          changed_images: newHighlights.filter((newImg, index) => {
            const currentImg = currentHighlights.find(curr => curr.media_url === newImg.media_url);
            return currentImg && currentImg.is_highlighted !== newImg.is_highlighted;
          })
        };
      }

      console.log('Final proposed changes with highlights:', proposedChanges);

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
        setSubmitSuccess(true);
        setSubmitMessage('Changes went for approval');
        setSubmittedChanges(proposedChanges); // Store the changes to display
        setSubmittedCurrentData(currentData); // Store current data for before/after comparison
        
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
            <div className="flex items-center justify-between w-full">
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

        {/* Change Review Card - Before/After Comparison */}
        {submitMessage && submitSuccess && Object.keys(submittedChanges).length > 0 && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pb-4">
            <Card className="border-green-300 bg-white shadow-2xl max-w-4xl mx-4 w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Changes Submitted for Approval</h3>
                        <p className="text-sm text-gray-600">
                          {Object.keys(submittedChanges).length} field{Object.keys(submittedChanges).length > 1 ? 's' : ''} changed
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSubmitMessage('');
                        setSubmitSuccess(false);
                        setSubmittedChanges({});
                        setSubmittedCurrentData({});
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>

                  {/* Change Review Cards */}
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {Object.entries(submittedChanges).map(([key, newValue]) => {
                      const currentValue = submittedCurrentData[key];
                      
                      // Field name mapping
                      const getFieldDisplayName = (fieldKey: string) => {
                        const fieldNames: Record<string, string> = {
                          'brand_name': 'Brand Name',
                          'spoc_name': 'Contact Person Name',
                          'category': 'Category',
                          'subcategory': 'Subcategory',
                          'phone_number': 'Phone Number',
                          'alternate_number': 'Alternate Number',
                          'whatsapp_number': 'WhatsApp Number',
                          'email': 'Email Address',
                          'instagram': 'Instagram Handle',
                          'address': 'Address',
                          'google_maps_link': 'Google Maps Link',
                          'experience': 'Experience',
                          'events_completed': 'Events Completed',
                          'quick_intro': 'Quick Intro',
                          'caption': 'Caption',
                          'detailed_intro': 'Detailed Intro',
                          'highlight_features': 'Highlight Features',
                          'starting_price': 'Starting Price',
                          'languages': 'Languages',
                          'services': 'Services',
                          'packages': 'Packages',
                          'booking_policies': 'Booking Policies',
                          'additional_info': 'Additional Information',
                          'currently_available': 'Currently Available',
                          'catalog_images': 'Catalog Images',
                          'highlight_status_changes': 'Image Highlight Changes'
                        };
                        return fieldNames[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      };

                      const formatValue = (val: any, fieldKey: string): string => {
                        if (val === null || val === undefined || val === '') return '(Empty)';
                        if (Array.isArray(val)) {
                          if (val.length === 0) return '(No items)';
                          if (typeof val[0] === 'object') {
                            if (fieldKey === 'services') {
                              return `${val.length} service(s): ${val.map((s: any) => s.name || 'Unnamed').slice(0, 2).join(', ')}${val.length > 2 ? '...' : ''}`;
                            } else if (fieldKey === 'packages') {
                              return `${val.length} package(s): ${val.map((p: any) => p.name || 'Unnamed').slice(0, 2).join(', ')}${val.length > 2 ? '...' : ''}`;
                            }
                            return `${val.length} item(s)`;
                          }
                          return val.slice(0, 3).join(', ') + (val.length > 3 ? ` +${val.length - 3} more` : '');
                        }
                        if (typeof val === 'object') {
                          if (fieldKey === 'catalog_images' && val.added && val.removed) {
                            return `${val.added.length} added, ${val.removed.length} removed`;
                          }
                          if (fieldKey === 'highlight_status_changes' && val.changed_images) {
                            return `${val.changed_images.length} image(s) highlight status changed`;
                          }
                          if (fieldKey === 'booking_policies') {
                            const policies = [];
                            if (val.cancellation_policy) policies.push('Cancellation Policy');
                            if (val.payment_terms) policies.push('Payment Terms');
                            if (val.booking_requirements) policies.push('Booking Requirements');
                            return policies.join(', ') || 'Updated';
                          }
                          if (fieldKey === 'additional_info') {
                            const info = [];
                            if (val.working_hours) info.push('Working Hours');
                            if (val.languages && val.languages.length > 0) info.push('Languages');
                            if (val.service_areas && val.service_areas.length > 0) info.push('Service Areas');
                            if (val.awards && val.awards.length > 0) info.push('Awards');
                            if (val.certifications && val.certifications.length > 0) info.push('Certifications');
                            return info.join(', ') || 'Updated';
                          }
                          return 'Updated';
                        }
                        if (typeof val === 'boolean') {
                          return val ? 'Yes' : 'No';
                        }
                        if (fieldKey.includes('_url') && val) {
                          return 'Image updated';
                        }
                        const strVal = String(val);
                        return strVal.length > 60 ? strVal.substring(0, 60) + '...' : strVal;
                      };

                      return (
                        <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-green-300 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Field Name */}
                            <div className="min-w-[140px] flex-shrink-0">
                              <p className="font-semibold text-gray-900 text-sm">
                                {getFieldDisplayName(key)}
                              </p>
                            </div>
                            
                            {/* Before/After Values */}
                            <div className="flex-1 flex items-center gap-3">
                              {/* Previous Value */}
                              <div className="flex-1 bg-white rounded border border-gray-200 p-2.5">
                                <p className="text-xs text-gray-500 mb-1">Previous</p>
                                <p className="text-sm text-gray-600 line-through">
                                  {formatValue(currentValue, key)}
                                </p>
                              </div>
                              
                              {/* Arrow */}
                              <ArrowRight className="w-5 h-5 text-green-600 flex-shrink-0" />
                              
                              {/* Updated Value */}
                              <div className="flex-1 bg-green-50 rounded border-2 border-green-300 p-2.5">
                                <p className="text-xs text-green-700 mb-1 font-medium">Updated</p>
                                <p className="text-sm text-green-800 font-semibold">
                                  {formatValue(newValue, key)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Error Message */}
        {submitMessage && !submitSuccess && (
          <Card className={`mb-6 border-red-200 bg-red-50`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-medium text-red-800">
                  {submitMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Hidden field to track catalog highlight changes */}
          <input
            type="hidden"
            {...register('catalog_highlights_updated')}
          />
          
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
                    Categories * <span className="text-xs text-gray-500">(Select multiple)</span>
                  </label>
                  <div className="relative category-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
                    >
                      <span className={watch("category")?.length > 0 ? "text-gray-900" : "text-gray-500"}>
                        {watch("category")?.length > 0 
                          ? `${watch("category").length} categor${watch("category").length === 1 ? 'y' : 'ies'} selected`
                          : "Select Categories"}
                      </span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showCategoryDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        <div className="p-2 space-y-1">
                          {CATEGORY_LIST.map((category) => {
                            const currentCategories = watch("category") || [];
                            const isSelected = Array.isArray(currentCategories) && currentCategories.includes(category.name);
                            return (
                              <label
                                key={category.code}
                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const currentCats = watch("category") || [];
                                    if (checked) {
                                      setValue("category", [...currentCats, category.name], { shouldValidate: true });
                                    } else {
                                      setValue("category", currentCats.filter((c: string) => c !== category.name), { shouldValidate: true });
                                    }
                                  }}
                                />
                                <span className="text-sm text-gray-700">{category.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  {watch("category")?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {watch("category").map((cat: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="px-2 py-1">
                          {cat}
                          <button
                            type="button"
                            onClick={() => {
                              const currentCategories = watch("category") || [];
                              setValue("category", currentCategories.filter((c: string) => c !== cat), { shouldValidate: true });
                            }}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand/Company Logo Image
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {/* Show existing brand logo if it exists */}
                    {(watch("brand_logo_url") || originalBrandLogoUrl) && (
                      <div className="mb-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current Brand Logo:</p>
                            <div className="relative inline-block">
                              <img
                                src={watch("brand_logo_url") || originalBrandLogoUrl}
                                alt="Current brand logo"
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  console.error('Brand logo image failed to load:', watch("brand_logo_url") || originalBrandLogoUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Brand logo image loaded successfully:', watch("brand_logo_url") || originalBrandLogoUrl);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteConfirmType('brand_logo');
                              setDeleteConfirmData(null);
                              setDeleteConfirmOpen(true);
                            }}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <ImageUpload
                      key={`brand-logo-${watch("brand_logo_url") || originalBrandLogoUrl || 'empty'}`}
                      vendorId={vendor?.vendor_id || ''}
                      category="brand_logo"
                      maxImages={1}
                      existingImages={(watch("brand_logo_url") || originalBrandLogoUrl) ? [watch("brand_logo_url") || originalBrandLogoUrl] : []}
                      onUploadComplete={(urls) => {
                        console.log('Brand logo uploaded:', urls);
                        if (urls.length > 0) {
                          setValue('brand_logo_url', urls[0]);
                          setHighlightMessage('✅ Brand logo uploaded successfully!');
                          setTimeout(() => setHighlightMessage(''), 3000);
                        }
                      }}
                      onUploadError={(error) => {
                        console.error('Brand logo upload error:', error);
                        setHighlightMessage('❌ Brand logo upload failed: ' + error);
                      }}
                      allowHighlight={false}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Upload your brand/company logo (will be stored in: 14/brand_logo/)
                    </div>
                    
                    {/* Fallback URL input */}
                    <div className="mt-3 pt-3 border-t">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or provide URL:
                      </label>
                      <Input
                        {...register("brand_logo_url")}
                        type="url"
                        placeholder="https://example.com/brand-logo.jpg"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Image
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {/* Show existing contact person image if it exists */}
                    {(watch("contact_person_image_url") || originalContactPersonImageUrl) && (
                      <div className="mb-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current Contact Person Image:</p>
                            <div className="relative inline-block">
                              <img
                                src={watch("contact_person_image_url") || originalContactPersonImageUrl}
                                alt="Current contact person"
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  console.error('Contact person image failed to load:', watch("contact_person_image_url") || originalContactPersonImageUrl);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Contact person image loaded successfully:', watch("contact_person_image_url") || originalContactPersonImageUrl);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteConfirmType('contact_person');
                              setDeleteConfirmData(null);
                              setDeleteConfirmOpen(true);
                            }}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <ImageUpload
                      key={`contact-person-${watch("contact_person_image_url") || originalContactPersonImageUrl || 'empty'}`}
                      vendorId={vendor?.vendor_id || ''}
                      category="contact_person"
                      maxImages={1}
                      existingImages={(watch("contact_person_image_url") || originalContactPersonImageUrl) ? [watch("contact_person_image_url") || originalContactPersonImageUrl] : []}
                      onUploadComplete={(urls) => {
                        console.log('Contact person image uploaded:', urls);
                        if (urls.length > 0) {
                          setValue('contact_person_image_url', urls[0]);
                          setHighlightMessage('✅ Contact person image uploaded successfully!');
                          setTimeout(() => setHighlightMessage(''), 3000);
                        }
                      }}
                      onUploadError={(error) => {
                        console.error('Contact person upload error:', error);
                        setHighlightMessage('❌ Contact person image upload failed: ' + error);
                      }}
                      allowHighlight={false}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      Upload contact person's photo (will be stored in: 14/contact_person/)
                    </div>
                    
                    {/* Fallback URL input */}
                    <div className="mt-3 pt-3 border-t">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or provide URL:
                      </label>
                      <Input
                        {...register("contact_person_image_url")}
                        type="url"
                        placeholder="https://example.com/contact-person.jpg"
                        className="text-sm"
                      />
                    </div>
                  </div>
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
                  Address <span className="text-red-500">*</span>
                </label>
                <Textarea
                  {...register("address", { 
                    required: "Address is required",
                    minLength: { value: 10, message: "Address must be at least 10 characters" }
                  })}
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Link <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <Input
                  {...register("google_maps_link", {
                    pattern: {
                      value: /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)/i,
                      message: "Please enter a valid Google Maps link"
                    }
                  })}
                  type="url"
                  placeholder="https://maps.google.com/... or https://maps.app.goo.gl/..."
                />
                {errors.google_maps_link && (
                  <p className="mt-1 text-sm text-red-600">{errors.google_maps_link.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Paste your Google Maps location link here. Customers can click the map icon to view your location.
                </p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Events Completed
                  </label>
                  <Input
                    {...register("total_events", { 
                      min: { value: 0, message: "Number of events cannot be negative" },
                      valueAsNumber: true
                    })}
                    type="number"
                    min="0"
                    placeholder="e.g., 50, 100, 200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Price (₹) *
                  </label>
                  <Input
                    {...register("starting_price", { 
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages Spoken
                  </label>
                  <Input
                    {...register("languages")}
                    placeholder="e.g., English, Hindi, Telugu (comma separated)"
                    defaultValue={Array.isArray(watch("languages")) ? watch("languages").join(', ') : (watch("languages") || '')}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const languages = value.split(',').map(lang => lang.trim()).filter(lang => lang);
                      setValue('languages', languages);
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter languages separated by commas
                  </p>
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
                <span>Services <span className="text-red-500">*</span></span>
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

          {/* Catalog Images */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div>
                  <span>Catalog Images</span>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Highlight up to 3 images to feature them prominently in your profile
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Highlight message */}
                {highlightMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    highlightMessage.includes('❌') 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : highlightMessage.includes('✅')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {highlightMessage}
                  </div>
                )}
                
                {/* Show existing catalog images with highlight functionality */}
                {catalogImagesWithMeta.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Existing Catalog Images</h4>
                      <Badge variant="outline" className="text-xs">
                        {catalogImagesWithMeta.filter(img => img.is_highlighted).length}/3 Highlighted
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catalogImagesWithMeta.map((image, index) => (
                        <div key={image.id} className="relative border rounded-lg p-3 bg-gray-50">
                          {/* Delete button - positioned at top right */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Delete button clicked for image:', image.id);
                              setDeleteConfirmType('catalog');
                              setDeleteConfirmData(image);
                              setDeleteConfirmOpen(true);
                            }}
                            className="absolute top-1 right-1 z-10 w-8 h-8 p-0 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          
                          <div className="aspect-video mb-3">
                            <img
                              src={image.media_url}
                              alt={image.title || `Catalog image ${index + 1}`}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`highlight-${image.id}`}
                                checked={Boolean(image.is_highlighted)}
                                onChange={async (e) => {
                                  const isChecking = e.target.checked;
                                  
                                  // Clear any previous messages
                                  setHighlightMessage('');
                                  
                                  // If trying to highlight, check current count
                                  if (isChecking) {
                                    const currentHighlighted = catalogImagesWithMeta.filter(img => img.is_highlighted).length;
                                    if (currentHighlighted >= 3) {
                                      setHighlightMessage('You can only highlight up to 3 catalog images. Please unhighlight another image first.');
                                      e.target.checked = false;
                                      return;
                                    }
                                  }
                                  
                                  try {
                                    // For storage-based images, we'll update local state and trigger change detection
                                    console.log(`${isChecking ? 'Highlighting' : 'Unhighlighting'} image:`, image.id);
                                    
                                    // Update local state immediately
                                    setCatalogImagesWithMeta(prev => 
                                      prev.map(img => 
                                        img.id === image.id 
                                          ? { ...img, is_highlighted: isChecking }
                                          : img
                                      )
                                    );
                                    
                                    // Update current highlight status
                                    setCurrentHighlightStatus(prev => 
                                      prev.map(img => 
                                        img.id === image.id 
                                          ? { ...img, is_highlighted: isChecking }
                                          : img
                                      )
                                    );
                                    
                                    // Update the catalog_images_metadata field in the form
                                    const updatedMetadata = catalogImagesWithMeta.map(img => 
                                      img.id === image.id 
                                        ? { ...img, is_highlighted: isChecking }
                                        : img
                                    );
                                    setValue('catalog_images_metadata', updatedMetadata, { shouldDirty: true });
                                    
                                    // Also trigger the hidden field for change detection
                                    setValue('catalog_highlights_updated', Date.now().toString(), { shouldDirty: true });
                                    
                                    setHighlightMessage(
                                      isChecking 
                                        ? `✅ Image highlighted successfully! Changes will be saved on submit.` 
                                        : `✅ Image unhighlighted successfully! Changes will be saved on submit.`
                                    );
                                    
                                    // Clear success message after 3 seconds
                                    setTimeout(() => setHighlightMessage(''), 3000);
                                    
                                    console.log(`Successfully ${isChecking ? 'highlighted' : 'unhighlighted'} image:`, image.id);
                                  } catch (error) {
                                    console.error('Error toggling highlight:', error);
                                    e.target.checked = !isChecking;
                                    setHighlightMessage('❌ Error: ' + (error as Error).message);
                                  }
                                }}
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                              />
                              <label 
                                htmlFor={`highlight-${image.id}`}
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Highlight
                              </label>
                            </div>
                            {image.is_highlighted && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                ⭐ Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            {image.title || 'Untitled'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Upload New Images</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Upload images directly to secure Google Drive storage. Images will be automatically compressed and optimized.
                    </p>
                    <ImageUpload
                      vendorId={vendor?.vendor_id || ''}
                      category="catalog"
                      maxImages={13}
                      existingImages={[...catalogImages, ...uploadedImageUrls]}
                      onUploadComplete={(urls) => {
                        console.log('Upload completed, new URLs:', urls);
                        setUploadedImageUrls(prev => [...prev, ...urls]);
                        setHighlightMessage(`✅ Successfully uploaded ${urls.length} image(s) to Google Drive!`);
                        setTimeout(() => setHighlightMessage(''), 3000);
                        
                        // Refresh the catalog images to show newly uploaded ones
                        if (vendor?.vendor_id) {
                          // Pass current metadata to preserve highlight status
                          const currentMetadata = watch('catalog_images_metadata') || catalogImagesWithMeta || [];
                          loadCatalogImages(vendor.vendor_id.toString(), currentMetadata).then(refreshedUrls => {
                            console.log('Refreshed catalog images after upload:', refreshedUrls);
                          });
                        }
                      }}
                      onUploadError={(error) => {
                        console.error('Upload error:', error);
                        setHighlightMessage(`❌ Upload failed: ${error}`);
                      }}
                      allowHighlight={true}
                    />
                  </div>
                  
                  {catalogImagesWithMeta.length === 0 && uploadedImageUrls.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                      No catalog images added yet. Upload images to showcase your work.
                      </p>
                    )}
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Payment
                </label>
                <Input
                  {...register("booking_policies.advance")}
                  type="text"
                  placeholder="e.g., 30% advance, ₹5000 advance, 50% upfront"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the advance payment amount or percentage required</p>
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
                  Service Areas
                </label>
                
                {/* Selected States Display */}
                {selectedStates.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedStates.map((stateValue) => (
                      <div
                        key={stateValue}
                        className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{getStateLabel(stateValue)}</span>
                        <button
                          type="button"
                          onClick={() => removeState(stateValue)}
                          className="hover:bg-orange-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Multi-select Dropdown */}
                <div className="relative states-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowStatesDropdown(!showStatesDropdown)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left bg-white"
                  >
                    {selectedStates.length === 0 
                      ? "Select states where you provide services..." 
                      : `${selectedStates.length} state${selectedStates.length > 1 ? 's' : ''} selected`
                    }
                  </button>
                  
                  {showStatesDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2">
                        {indianStates.map((state) => {
                          const isSelected = selectedStates.includes(state.value);
                          return (
                            <div
                              key={state.value}
                              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                              onClick={() => {
                                console.log('Clicked state:', state.value, 'Current selection:', selectedStates);
                                handleStateToggle(state.value);
                              }}
                            >
                              <div className="w-4 h-4 border-2 rounded flex items-center justify-center"
                                   style={{ 
                                     borderColor: isSelected ? '#f97316' : '#d1d5db',
                                     backgroundColor: isSelected ? '#f97316' : 'white'
                                   }}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm">{state.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  Select all states where you provide services
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Awards
                </label>
                <Input
                  {...register("additional_info.awards")}
                  placeholder="List any awards received (comma-separated)"
                  onBlur={(e) => {
                    const value = e.target.value;
                    const awards = value.split(',').map(award => award.trim()).filter(award => award);
                    setValue('additional_info.awards', awards);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter awards separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <Input
                  {...register("additional_info.certifications")}
                  placeholder="List any certifications (comma-separated)"
                  onBlur={(e) => {
                    const value = e.target.value;
                    const certifications = value.split(',').map(cert => cert.trim()).filter(cert => cert);
                    setValue('additional_info.certifications', certifications);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter certifications separated by commas
                </p>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              {deleteConfirmType === 'brand_logo' && 'Are you sure you want to remove the current brand logo?'}
              {deleteConfirmType === 'contact_person' && 'Are you sure you want to remove the current contact person image?'}
              {deleteConfirmType === 'catalog' && 'Are you sure you want to delete this catalog image? This action cannot be undone.'}
            </p>
            {deleteConfirmType === 'catalog' && deleteConfirmData && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={deleteConfirmData.media_url}
                  alt="Image to delete"
                  className="w-20 h-20 object-cover rounded border mx-auto"
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteConfirmType === 'catalog' ? 'Delete' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProfileEdit;

