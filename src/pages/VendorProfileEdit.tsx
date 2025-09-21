import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { ArrowLeft, Save, AlertCircle, CheckCircle, Trash2, X, FileText } from 'lucide-react';
import { getLoggedInVendor, submitVendorProfileChange, getVendorPendingChanges, getVendorMedia, updateVendorCatalogImages, getVendorByFieldId, saveVendorSession, refreshVendorSession, toggleImageHighlight, deleteVendorMedia, clearVendorHardcodedServices } from '../services/supabaseService';
import ImageUpload from '../components/ImageUpload';
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
  const [catalogImagesWithMeta, setCatalogImagesWithMeta] = useState<any[]>([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [highlightMessage, setHighlightMessage] = useState<string>('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [currentHighlightStatus, setCurrentHighlightStatus] = useState<Array<{id: string, media_url: string, is_highlighted: boolean}>>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'brand_logo' | 'contact_person' | 'catalog'>('brand_logo');
  const [deleteConfirmData, setDeleteConfirmData] = useState<any>(null);
  const [sampleDataConfirmOpen, setSampleDataConfirmOpen] = useState(false);
  const [changesSummaryOpen, setChangesSummaryOpen] = useState(false);
  const [submittedChanges, setSubmittedChanges] = useState<any>({});
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
      currently_available: vendorData.currently_available || false,
      
      // Array fields
      highlight_features: vendorData.highlight_features || [],
      services: uniqueServices,
      packages: vendorData.packages || [],
      deliverables: vendorData.deliverables || [],
      catalog_images: catalogImagesData || [],
      customer_reviews: vendorData.customer_reviews || [],
      
      // Object fields - ensure proper structure
      booking_policies: {
        cancellation_policy: vendorData.booking_policies?.cancellation_policy || '',
        payment_terms: vendorData.booking_policies?.payment_terms || '',
        booking_requirements: vendorData.booking_policies?.booking_requirements || ''
      },
      additional_info: {
        working_hours: vendorData.additional_info?.working_hours || '',
        languages: vendorData.additional_info?.languages || [],
        awards: vendorData.additional_info?.awards || [],
        certifications: vendorData.additional_info?.certifications || [],
        custom_fields: vendorData.additional_info?.custom_fields || []
      }
    };
    
    console.log('Resetting form with complete data:', formData);
    
    // Reset the entire form with new data - this clears everything and sets new values
    reset(formData);
    
    console.log('Form reset completed');
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
    while (deliverableFields.length > 0) {
      removeDeliverable(0);
    }
      } catch (e) {
        console.log('Error clearing deliverables:', e);
      }
      
      try {
    while (reviewFields.length > 0) {
      removeReview(0);
        }
      } catch (e) {
        console.log('Error clearing reviews:', e);
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

    // Add sample deliverables
    const sampleDeliverables = [
      "High-resolution edited photos",
      "Online gallery access",
      "USB drive with all photos",
      "Same-day highlight reel",
      "Professional photo album",
      "Social media ready images"
    ];
    sampleDeliverables.forEach(deliverable => {
        appendDeliverable(deliverable);
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
    const sampleReviews = [
      {
        customer_name: "Ananya & Vikram",
        rating: 5,
        review: "Priya captured our wedding beautifully! The candid shots were amazing and she made us feel so comfortable throughout the day.",
        date: "2024-08-15"
      },
      {
        customer_name: "Meera & Rajesh",
        rating: 5,
        review: "Absolutely stunning photography! The traditional ceremony shots and couple portraits were beyond our expectations.",
        date: "2024-07-22"
      },
      {
        customer_name: "Kavya & Arjun",
        rating: 5,
        review: "Professional, creative, and so easy to work with. Our wedding album is a treasure we'll cherish forever!",
        date: "2024-06-10"
      }
    ];
    sampleReviews.forEach(review => {
        appendReview(review);
      });

    // Set sample booking policies
    setValue('booking_policies.cancellation_policy', 'Cancellation allowed up to 30 days before the event with 50% refund. No refund for cancellations within 30 days.');
    setValue('booking_policies.payment_terms', '30% advance to confirm booking, 50% one week before event, remaining 20% on delivery of final photos.');
    setValue('booking_policies.booking_requirements', 'Valid ID proof, signed agreement, and advance payment required to confirm booking.');

    // Set sample additional info
    setValue('additional_info.working_hours', '9:00 AM - 8:00 PM, Available on weekends and holidays');
    setValue('additional_info.languages', ['English', 'Hindi', 'Telugu', 'Tamil']);
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
        setValue('brand_logo_url', '');
        setHighlightMessage('✅ Brand logo removed successfully!');
        setTimeout(() => setHighlightMessage(''), 3000);
      } else if (deleteConfirmType === 'contact_person') {
        setValue('contact_person_image_url', '');
        setHighlightMessage('✅ Contact person image removed successfully!');
        setTimeout(() => setHighlightMessage(''), 3000);
      } else if (deleteConfirmType === 'catalog' && deleteConfirmData) {
        console.log('Deleting catalog image:', deleteConfirmData.id);
        const success = await deleteVendorMedia(deleteConfirmData.id);
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
          
          // Update current highlight status to remove deleted image
          setCurrentHighlightStatus(prev => 
            prev.filter(img => img.id !== deleteConfirmData.id)
          );
          
          setHighlightMessage('✅ Image deleted successfully!');
          setTimeout(() => setHighlightMessage(''), 3000);
          
          // Refresh catalog images to ensure consistency
          if (vendor?.vendor_id) {
            try {
              console.log('Refreshing catalog images...');
              const refreshedImages = await getVendorMedia(vendor.vendor_id, 'catalog');
              setCatalogImagesWithMeta(refreshedImages);
              const refreshedUrls = refreshedImages.map(img => img.media_url);
              setCatalogImages(refreshedUrls);
              
              // Update current highlight status with refreshed data
              setCurrentHighlightStatus(refreshedImages.map(img => ({
                id: img.id,
                media_url: img.media_url,
                is_highlighted: img.is_highlighted || false
              })));
              
              console.log('Catalog images refreshed successfully');
            } catch (refreshError) {
              console.error('Error refreshing after delete:', refreshError);
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
      setCatalogImagesWithMeta(media); // Store full media objects for highlighting
      
      // Store current highlight status for comparison during submission
      setCurrentHighlightStatus(media.map(img => ({
        id: img.id,
        media_url: img.media_url,
        is_highlighted: img.is_highlighted || false
      })));
      
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
        brand_logo_url: vendor.brand_logo_url || '', // Added brand logo
        contact_person_image_url: vendor.contact_person_image_url || '', // Added contact person image
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
        catalog_images: [...(catalogImages || []), ...uploadedImageUrls], // Re-added for comparison
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
        brand_logo_url: data.brand_logo_url || '', // Added brand logo
        contact_person_image_url: data.contact_person_image_url || '', // Added contact person image
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
        catalog_images: [...(data.catalog_images?.filter(img => img && img.trim() !== '') || []), ...uploadedImageUrls], // Re-added to main approval
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
          if (Array.isArray(val)) {
            // Special handling for services array - sort by name for consistent comparison
            if (key === 'services' && val.length > 0 && val[0]?.name) {
              return val.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
        
        // Deep comparison for objects and arrays
        if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedNew)) {
          console.log(`Adding ${key} to changes - values differ`);
          proposedChanges[key] = newValue;
        } else {
          console.log(`Skipping ${key} - values are identical`);
        }
      });

      console.log('Only changed fields:', proposedChanges);

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
        // Store the submitted changes for the summary dialog
        setSubmittedChanges(proposedChanges);
        
        setSubmitSuccess(true);
        setSubmitMessage(result.message || 'Changes submitted successfully');
        
        // Show changes summary dialog
        setChangesSummaryOpen(true);
        
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
              
              {/* Sample Data Button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    console.log('=== VENDOR DATA DEBUG ===');
                    console.log('Current vendor:', vendor);
                    console.log('Vendor services:', vendor?.services);
                    console.log('Vendor services type:', typeof vendor?.services);
                    console.log('Vendor services JSON:', JSON.stringify(vendor?.services, null, 2));
                    setHighlightMessage('✅ Check console for vendor data debug info!');
                    setTimeout(() => setHighlightMessage(''), 3000);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Debug Data
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.log('Quick test button clicked');
                    setValue('brand_name', 'Test Photography');
                    setValue('spoc_name', 'John Doe');
                    setValue('quick_intro', 'Test quick intro');
                    setHighlightMessage('✅ Quick test data filled!');
                    setTimeout(() => setHighlightMessage(''), 3000);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  Quick Test
                </Button>
                <Button
                  type="button"
                  onClick={() => setSampleDataConfirmOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Fill Sample Data
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('This will clear hardcoded services from the DATABASE for this vendor. This action cannot be undone. Are you sure?')) {
                      try {
                        const result = await clearVendorHardcodedServices(vendor?.vendor_id || '');
                        if (result.success) {
                          setHighlightMessage('✅ Hardcoded services cleared from database! Refresh the page to see changes.');
                          setTimeout(() => setHighlightMessage(''), 5000);
                          
                          // Refresh vendor data
                          if (vendor?.vendor_id) {
                            const freshData = await getVendorByFieldId(vendor.vendor_id);
                            if (freshData) {
                              setVendor(freshData);
                              loadVendorData(freshData, catalogImages);
                            }
                          }
                        } else {
                          setHighlightMessage('❌ Failed to clear services: ' + result.message);
                          setTimeout(() => setHighlightMessage(''), 5000);
                        }
                      } catch (error) {
                        console.error('Error clearing services:', error);
                        setHighlightMessage('❌ Error clearing services from database');
                        setTimeout(() => setHighlightMessage(''), 5000);
                      }
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  Clear DB Services
                </Button>
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

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand/Company Logo Image
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {/* Show existing brand logo if it exists */}
                    {watch("brand_logo_url") && (
                      <div className="mb-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current Brand Logo:</p>
                            <div className="relative inline-block">
                              <img
                                src={watch("brand_logo_url")}
                                alt="Current brand logo"
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
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
                      key={`brand-logo-${watch("brand_logo_url") || 'empty'}`}
                      vendorId={vendor?.vendor_id || ''}
                      category="brand_logo"
                      maxImages={1}
                      existingImages={watch("brand_logo_url") ? [watch("brand_logo_url")] : []}
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
                    {watch("contact_person_image_url") && (
                      <div className="mb-4 p-3 bg-white rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current Contact Person Image:</p>
                            <div className="relative inline-block">
                              <img
                                src={watch("contact_person_image_url")}
                                alt="Current contact person"
                                className="w-24 h-24 object-cover rounded-lg border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
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
                      key={`contact-person-${watch("contact_person_image_url") || 'empty'}`}
                      vendorId={vendor?.vendor_id || ''}
                      category="contact_person"
                      maxImages={1}
                      existingImages={watch("contact_person_image_url") ? [watch("contact_person_image_url")] : []}
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
                <div>
                  <span>Catalog Images</span>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    Highlight up to 3 images to feature them prominently in your profile
                  </p>
                </div>
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
                                checked={image.is_highlighted || false}
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
                                    const success = await toggleImageHighlight(image.id, isChecking);
                                    if (success) {
                                      // Update local state
                                      setCatalogImagesWithMeta(prev => 
                                        prev.map(img => 
                                          img.id === image.id 
                                            ? { ...img, is_highlighted: isChecking }
                                            : img
                                        )
                                      );
                                      setHighlightMessage(
                                        isChecking 
                                          ? `✅ Image highlighted successfully!` 
                                          : `✅ Image unhighlighted successfully!`
                                      );
                                      // Clear success message after 3 seconds
                                      setTimeout(() => setHighlightMessage(''), 3000);
                                      
                                      // Refresh the catalog images to ensure UI is in sync
                                      try {
                                        const refreshedImages = await getVendorMedia(vendor?.vendor_id || '', 'catalog');
                                        setCatalogImagesWithMeta(refreshedImages);
                                      } catch (refreshError) {
                                        console.error('Error refreshing catalog images:', refreshError);
                                      }
                                      console.log(`Successfully ${isChecking ? 'highlighted' : 'unhighlighted'} image:`, image.id);
                                    } else {
                                      // Revert checkbox if failed
                                      e.target.checked = !isChecking;
                                      setHighlightMessage('❌ Failed to update highlight status. Please try again.');
                                    }
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
                          loadCatalogImages(vendor.vendor_id).then(refreshedUrls => {
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
                  
                  {/* OR Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-sm text-gray-500 bg-white px-3">OR</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                  
                  {/* URL Input Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Add Image URLs</h4>
                      <Button
                        type="button"
                        onClick={() => appendCatalogImage("")}
                        variant="outline"
                        size="sm"
                      >
                        Add URL Field
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Alternatively, you can provide direct image URLs if you have images hosted elsewhere.
                    </p>
                    
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
                            <div className="text-xs text-gray-500 mt-1">External URL</div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {catalogImageFields.length === 0 && catalogImagesWithMeta.length === 0 && uploadedImageUrls.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No catalog images added yet. Upload images or add URLs to showcase your work.
                      </p>
                    )}
                  </div>
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

      {/* Changes Summary Dialog */}
      <Dialog open={changesSummaryOpen} onOpenChange={setChangesSummaryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Changes Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Your profile changes have been submitted for admin approval. Here's a summary of what you changed:
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-medium text-green-800 mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Changes Submitted ({Object.keys(submittedChanges).length} fields):
              </h5>
              
              <div className="space-y-3 text-sm max-h-60 overflow-y-auto">
                {Object.entries(submittedChanges).map(([key, value]) => {
                  // Field name mapping
                  const getFieldDisplayName = (fieldKey: string) => {
                    const fieldNames: Record<string, string> = {
                      'brand_name': 'Brand Name',
                      'spoc_name': 'Contact Person Name',
                      'category': 'Category',
                      'subcategory': 'Subcategory',
                      'brand_logo_url': 'Brand Logo',
                      'contact_person_image_url': 'Contact Person Image',
                      'phone_number': 'Phone Number',
                      'alternate_number': 'Alternate Number',
                      'whatsapp_number': 'WhatsApp Number',
                      'email': 'Email Address',
                      'instagram': 'Instagram Handle',
                      'address': 'Address',
                      'experience': 'Experience',
                      'quick_intro': 'Quick Intro',
                      'caption': 'Caption',
                      'detailed_intro': 'Detailed Intro',
                      'highlight_features': 'Highlight Features',
                      'services': 'Services',
                      'packages': 'Packages',
                      'deliverables': 'Deliverables',
                      'customer_reviews': 'Customer Reviews',
                      'booking_policies': 'Booking Policies',
                      'additional_info': 'Additional Information',
                      'currently_available': 'Currently Available'
                    };
                    return fieldNames[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };

                  return (
                    <div key={key} className="p-3 bg-white rounded border border-green-200">
                      <div className="font-semibold text-green-800 text-sm mb-1">
                        {getFieldDisplayName(key)}
                      </div>
                      <div className="text-gray-700 text-sm">
                        {(() => {
                          if (Array.isArray(value)) {
                            if (value.length > 0 && typeof value[0] === 'object') {
                              // Handle services, packages, reviews
                              if (key === 'services') {
                                return `${value.length} service(s): ${value.map(s => s.name).join(', ')}`;
                              } else if (key === 'packages') {
                                return `${value.length} package(s): ${value.map(p => p.name).join(', ')}`;
                              } else if (key === 'customer_reviews') {
                                return `${value.length} review(s) from: ${value.map(r => r.customer_name).join(', ')}`;
                              }
                              return `${value.length} items`;
                            }
                            return value.join(', ');
                          } else if (typeof value === 'object' && value !== null) {
                            if (key === 'booking_policies') {
                              const policies = [];
                              const bookingPolicies = value as any;
                              if (bookingPolicies.cancellation_policy) policies.push('Cancellation Policy');
                              if (bookingPolicies.payment_terms) policies.push('Payment Terms');
                              if (bookingPolicies.booking_requirements) policies.push('Booking Requirements');
                              return policies.join(', ') || 'Updated';
                            } else if (key === 'additional_info') {
                              const info = [];
                              const additionalInfo = value as any;
                              if (additionalInfo.working_hours) info.push('Working Hours');
                              if (additionalInfo.languages && additionalInfo.languages.length > 0) info.push('Languages');
                              if (additionalInfo.awards && additionalInfo.awards.length > 0) info.push('Awards');
                              if (additionalInfo.certifications && additionalInfo.certifications.length > 0) info.push('Certifications');
                              return info.join(', ') || 'Updated';
                            }
                            return 'Updated';
                          } else if (typeof value === 'boolean') {
                            return value ? 'Yes' : 'No';
                          } else if (key.includes('_url') && value) {
                            return 'Image updated';
                          }
                          return String(value);
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>⏳ What happens next?</strong><br />
                Your changes are now pending admin approval. You'll be notified once they're reviewed and approved. 
                The changes will then be visible on your public profile.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setChangesSummaryOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sample Data Confirmation Modal */}
      <Dialog open={sampleDataConfirmOpen} onOpenChange={setSampleDataConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Fill Sample Data
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-3">
              This will fill all form fields with sample data for a wedding photography business.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> This will overwrite any existing data in the form. Make sure to save your current work if needed.
              </p>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p><strong>Sample data includes:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Basic information (name, contact, etc.)</li>
                <li>Services and packages</li>
                <li>Customer reviews</li>
                <li>Booking policies</li>
                <li>Sample images and more</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSampleDataConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                fillSampleData();
                setSampleDataConfirmOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Fill Sample Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
