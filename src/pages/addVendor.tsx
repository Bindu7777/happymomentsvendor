import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Toast } from "primereact/toast";
import { addVendor, checkPhoneUnique, testConnection } from "@/services/supabaseService";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import { CATEGORY_LIST } from "@/constants/categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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

type VendorFormInputs = {
  // Basic Information
  brand_name?: string;
  spoc_name?: string;
  category?: string[];  // Changed to array for multiple categories
  subcategory?: string;
  
  // Contact Information
  phone_number?: string;
  alternate_number?: string;  // Admin-only field
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  
  // Business Details
  experience?: string;
  events_completed?: number;
  quick_intro?: string;
  caption?: string;
  detailed_intro?: string;
  // highlight_features column was deleted from database
  service_areas?: string[];
  starting_price?: number;
  rating?: number;
  review_count?: number;
  
  // JSON Fields (will be stored as JSON)
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
  deliverables?: string[];  // New deliverables field
  // customer_reviews column was deleted from database
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
  verified?: boolean;
  currently_available?: boolean;
};

export default function AddVendor() {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const [phoneUnique, setPhoneUnique] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [showStatesDropdown, setShowStatesDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Handle state selection
  const handleStateToggle = (stateValue: string) => {
    setSelectedStates(prev => {
      const newStates = prev.includes(stateValue) 
        ? prev.filter(s => s !== stateValue)
        : [...prev, stateValue];
      
      // Update form value
      setValue('service_areas', newStates);
      return newStates;
    });
  };

  const removeState = (stateValue: string) => {
    setSelectedStates(prev => {
      const newStates = prev.filter(s => s !== stateValue);
      setValue('service_areas', newStates);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
    reset,
  } = useForm<VendorFormInputs>({
    defaultValues: {
      // Basic Information
      brand_name: "",
      spoc_name: "",
      category: [],
      subcategory: "",
      
      // Contact Information
      phone_number: "",
      alternate_number: "",
      whatsapp_number: "",
      email: "",
      instagram: "",
      address: "",
      
      // Business Details
      experience: "",
      events_completed: 0,
      quick_intro: "",
      caption: "",
      detailed_intro: "",
      // highlight_features column was deleted from database
      service_areas: [],
      starting_price: 0,
      
      // JSON Fields
      services: [],
      packages: [],
      deliverables: [],
      // customer_reviews column was deleted from database
      booking_policies: {
        cancellation_policy: "",
        payment_terms: "",
        booking_requirements: ""
      },
      additional_info: {
        working_hours: "9 AM - 6 PM, Monday-Saturday",
        languages: [],
        awards: [],
        certifications: [],
        custom_fields: []
      },
      
      // Status Fields
      verified: false,
      currently_available: true,
    }
  });

  // Field arrays for dynamic form fields
  const { fields: services, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: "services"
  });

  // Initialize with one empty service
  useEffect(() => {
    if (services.length === 0) {
      appendService({ name: "", description: "", price: "" });
    }
  }, [services.length, appendService]);


  const checkPhoneUniqueness = async (phone: string) => {
    try {
      const isUnique = await checkPhoneUnique(phone);
      setPhoneUnique(isUnique);
    } catch (error) {
      console.error("Error checking phone uniqueness:", error);
      setPhoneUnique(false);
    }
  };


  const onSubmit = async (data: VendorFormInputs) => {
    // Validate categories
    if (!data.category || !Array.isArray(data.category) || data.category.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please select at least one category.",
        life: 3000,
      });
      return;
    }

    // Validate service areas
    if (!selectedStates || selectedStates.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please select at least one state for service areas.",
        life: 3000,
      });
      return;
    }

    // Validate services - at least one service required
    if (!data.services || data.services.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please add at least one service.",
        life: 3000,
      });
      return;
    }

    // Validate that all services have required fields
    const invalidServices = data.services.filter(service => 
      !service.name || !service.description || service.name.trim() === '' || service.description.trim() === ''
    );
    
    if (invalidServices.length > 0) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all required fields for all services (name and description).",
        life: 3000,
      });
      return;
    }

    if (phoneUnique === false) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Phone number already exists. Please use a different one.",
        life: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Test connection first
      console.log("Testing Supabase connection...");
      const connectionOk = await testConnection();
      if (!connectionOk) {
        throw new Error("Cannot connect to database. Please check your internet connection and try again.");
      }

      // Process JSON fields - convert arrays and objects to proper format
      const processJsonFields = (data: any) => {
        const processedData = { ...data };
        
        // Process services array
        if (processedData.services && Array.isArray(processedData.services)) {
          processedData.services = processedData.services.filter(s => s && (s.name || s).trim() !== '');
        }
        
        // Process deliverables array
        if (processedData.deliverables && Array.isArray(processedData.deliverables)) {
          processedData.deliverables = processedData.deliverables.filter(d => d && d.trim() !== '');
        }
        
        // Process services array
        if (processedData.services && Array.isArray(processedData.services)) {
          processedData.services = processedData.services.filter(s => s.name && s.name.trim() !== '');
        }
        
        // Process packages array
        if (processedData.packages && Array.isArray(processedData.packages)) {
          processedData.packages = processedData.packages.filter(p => p.name && p.name.trim() !== '');
          // Convert features string to array if needed
          processedData.packages = processedData.packages.map(pkg => ({
            ...pkg,
            features: typeof pkg.features === 'string' 
              ? pkg.features.split(',').map(f => f.trim()).filter(f => f !== '')
              : pkg.features || []
          }));
        }
        
        // customer_reviews column was deleted from database - no processing needed
        
        // Process additional_info languages, awards, certifications
        if (processedData.additional_info) {
          const processStringArray = (str: string) => 
            str ? str.split(',').map(s => s.trim()).filter(s => s !== '') : [];
            
          processedData.additional_info = {
            ...processedData.additional_info,
            languages: typeof processedData.additional_info.languages === 'string' 
              ? processStringArray(processedData.additional_info.languages)
              : processedData.additional_info.languages || [],
            awards: typeof processedData.additional_info.awards === 'string'
              ? processStringArray(processedData.additional_info.awards)
              : processedData.additional_info.awards || [],
            certifications: typeof processedData.additional_info.certifications === 'string'
              ? processStringArray(processedData.additional_info.certifications)
              : processedData.additional_info.certifications || []
          };
        }
        
        return processedData;
      };

      const processedData = processJsonFields(data);

      // Process category - ensure it's an array
      const categoryArray = Array.isArray(processedData.category) 
        ? processedData.category 
        : (processedData.category ? [processedData.category] : []);

      // Process service_areas into additional_info
      const { service_areas, ...dataWithoutServiceAreas } = processedData;
      const additional_info = {
        ...processedData.additional_info,
        service_areas: Array.isArray(service_areas) ? service_areas : []
      };

      const vendorData = {
        ...dataWithoutServiceAreas,
        category: categoryArray,  // Ensure category is always an array
        additional_info,
        verified: processedData.verified || false,
        currently_available: processedData.currently_available !== false,
        rating: processedData.rating || 0,
        review_count: processedData.review_count || 0,
        // customer_reviews column was deleted from database
      };

      // Debug: Log the address field specifically
      console.log("Address field in vendorData:", vendorData.address);
      console.log("Full vendorData being sent:", JSON.stringify(vendorData, null, 2));

      const result = await addVendor(vendorData);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor added successfully with credentials generated. Check the vendor list to view credentials.",
        life: 5000,
      });

      // Navigate to vendor page after 2 seconds using the returned vendor_id
      setTimeout(() => {
        navigate(`/vendor/${result}`);
      }, 2000);

    } catch (error) {
      console.error("Failed to add vendor:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add vendor. Please try again.";
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#E6E6FA] min-h-screen flex items-center justify-center p-4">
      <Toast ref={toast} /> 
      <div className="max-w-4xl w-full mx-auto p-8 bg-white shadow-lg rounded-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Add New Vendor</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information - MANDATORY FIELDS ONLY */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information (Required)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Brand Name *</label>
                <input
                  {...register("brand_name", { 
                    required: "Brand name is required",
                    minLength: { value: 2, message: "Brand name must be at least 2 characters" }
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
                {errors.brand_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Contact Person Name *</label>
                <input
                  {...register("spoc_name", { 
                    required: "Contact person name is required",
                    minLength: { value: 2, message: "Contact person name must be at least 2 characters" }
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact person name"
                />
                {errors.spoc_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.spoc_name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Category *</label>
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  {...register("category", {
                    validate: (value) => {
                      if (!value || !Array.isArray(value) || value.length === 0) {
                        return "Please select at least one category";
                      }
                      return true;
                    }
                  })}
                />
                <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[200px] max-h-[300px] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CATEGORY_LIST.map((category) => {
                      const isSelected = selectedCategories.includes(category.name);
                      return (
                        <div key={category.code} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.code}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const newCategories = [...selectedCategories, category.name];
                                setSelectedCategories(newCategories);
                                setValue('category', newCategories, { shouldValidate: true });
                              } else {
                                const newCategories = selectedCategories.filter(cat => cat !== category.name);
                                setSelectedCategories(newCategories);
                                setValue('category', newCategories, { shouldValidate: true });
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${category.code}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {category.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => {
                            const newCategories = selectedCategories.filter(c => c !== cat);
                            setSelectedCategories(newCategories);
                            setValue('category', newCategories, { shouldValidate: true });
                          }}
                          className="hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
                {selectedCategories.length === 0 && !errors.category && (
                  <p className="text-gray-500 text-sm mt-1">Please select at least one category</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Experience *</label>
                <input
                  {...register("experience", { 
                    required: "Experience is required"
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2 years, 9 months, 5+ years"
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Number of Events Completed *</label>
                <input
                  {...register("events_completed", { 
                    required: "Number of events completed is required",
                    min: { value: 0, message: "Number of events cannot be negative" },
                    valueAsNumber: true
                  })}
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50, 100, 200"
                />
                {errors.events_completed && (
                  <p className="text-red-500 text-sm mt-1">{errors.events_completed.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Starting Price (₹) *</label>
                <input
                  {...register("starting_price", { 
                    required: "Starting price is required",
                    min: { value: 1, message: "Starting price must be greater than 0" },
                    valueAsNumber: true
                  })}
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25000"
                />
                <p className="text-sm text-gray-500 mt-1">Enter your starting price in rupees</p>
                {errors.starting_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.starting_price.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Rating (0-5) *</label>
                <input
                  {...register("rating", { 
                    required: "Rating is required",
                    min: { value: 0, message: "Rating must be at least 0" },
                    max: { value: 5, message: "Rating must be at most 5" },
                    valueAsNumber: true
                  })}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 4.5"
                />
                <p className="text-sm text-gray-500 mt-1">Enter vendor rating (0.0 to 5.0)</p>
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Review Count</label>
                <input
                  {...register("review_count", { 
                    min: { value: 0, message: "Review count must be at least 0" },
                    valueAsNumber: true
                  })}
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 25"
                />
                <p className="text-sm text-gray-500 mt-1">Number of reviews received (optional)</p>
                {errors.review_count && (
                  <p className="text-red-500 text-sm mt-1">{errors.review_count.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Content - MANDATORY FIELDS ONLY */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Content (Required)</h3>
            
            <div>
              <label className="block font-medium mb-2 text-gray-700">Quick Intro <span className="text-red-500">*</span></label>
              <input
                {...register("quick_intro", { 
                  required: "Quick intro is required",
                  maxLength: { value: 60, message: "Quick intro must not exceed 60 characters" }
                })}
                maxLength={60}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Caption Field - Only show if user enters data */}
            {watch("quick_intro") && watch("quick_intro").trim() !== "" && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">Caption</label>
                <input
                  {...register("caption")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a catchy tagline or greeting for your services"
                />
                <p className="text-sm text-gray-500 mt-1">A catchy tagline or greeting for your services</p>
              </div>
            )}

            {/* Paragraph about You Field - Only show if user enters data */}
            {watch("quick_intro") && watch("quick_intro").trim() !== "" && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">Paragraph about You</label>
                <textarea
                  {...register("detailed_intro")}
                  rows={4}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter a detailed description about your services and expertise"
                />
                <p className="text-sm text-gray-500 mt-1">Detailed description about your services and expertise</p>
              </div>
            )}
          </section>

          {/* Contact Information - MANDATORY FIELDS ONLY */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information (Required)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Phone Number *</label>
                <input
                  {...register("phone_number", { 
                    required: "Phone number is required"
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  onBlur={(e) => {
                    if (e.target.value) {
                      checkPhoneUniqueness(e.target.value);
                    }
                  }}
                />
                {phoneUnique === false && (
                  <p className="text-red-500 text-sm mt-1">This phone number is already registered</p>
                )}
                {phoneUnique === true && (
                  <p className="text-green-500 text-sm mt-1">Phone number is available</p>
                )}
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">WhatsApp Number *</label>
                <input
                  {...register("whatsapp_number", { 
                    required: "WhatsApp number is required"
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter WhatsApp number"
                />
                {errors.whatsapp_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp_number.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium mb-2 text-gray-700">Address *</label>
                <textarea
                  {...register("address", { 
                    required: "Address is required",
                    minLength: { value: 10, message: "Address must be at least 10 characters" }
                  })}
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter complete address with city, state, and pincode"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Service Areas - MANDATORY FIELD */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Service Areas (Required)</h3>
            
            <div>
              <label className="block font-medium mb-2 text-gray-700">Service Areas *</label>
              
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
              
              <p className="text-sm text-gray-500 mt-1">Select all states where you provide services</p>
              {selectedStates.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Please select at least one state</p>
              )}
            </div>
          </section>

          {/* Services - MANDATORY FIELD */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Services (Required)</h3>
            
            <div>
              <label className="block font-medium mb-2 text-gray-700">Services *</label>
              <p className="text-sm text-gray-500 mb-3">Add at least one service that you provide</p>
              
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Service Name *</label>
                        <input
                          {...register(`services.${index}.name`, { 
                            required: "Service name is required"
                          })}
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Wedding Photography"
                        />
                        {errors.services?.[index]?.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.services[index]?.name?.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Description *</label>
                        <input
                          {...register(`services.${index}.description`, { 
                            required: "Service description is required"
                          })}
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Full day coverage with professional editing"
                        />
                        {errors.services?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">{errors.services[index]?.description?.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Price (Optional)</label>
                        <input
                          {...register(`services.${index}.price`)}
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., ₹50,000"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove Service
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendService({ name: "", description: "", price: "" })}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Add Another Service
                </button>
              </div>
              
              {services.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Please add at least one service</p>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || phoneUnique === false}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Adding Vendor..." : "Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}