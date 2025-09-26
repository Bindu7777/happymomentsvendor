import React, { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Toast } from "primereact/toast";
import { addVendor, checkPhoneUnique, testConnection } from "@/services/supabaseService";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";
import { CATEGORY_LIST } from "@/constants/categories";

type VendorFormInputs = {
  // Basic Information
  brand_name?: string;
  spoc_name?: string;
  category?: string;
  subcategory?: string;
  brand_logo_url?: string;
  contact_person_image_url?: string;
  
  // Contact Information
  phone_number?: string;
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
  service_areas?: string;
  starting_price?: number;
  
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
  verified?: boolean;
  currently_available?: boolean;
};

export default function AddVendor() {
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const [phoneUnique, setPhoneUnique] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      category: "",
      subcategory: "",
      brand_logo_url: "",
      contact_person_image_url: "",
      
      // Contact Information
      phone_number: "",
      alternate_number: "",
      whatsapp_number: "",
      email: "",
      instagram: "",
      address: "",
      
      // Business Details
      experience: "",
      quick_intro: "",
      caption: "",
      detailed_intro: "",
      highlight_features: [],
      service_areas: "",
      starting_price: 0,
      
      // JSON Fields
      services: [],
      packages: [],
      deliverables: [],
      customer_reviews: [],
      booking_policies: {
        cancellation_policy: "",
        payment_terms: "",
        booking_requirements: ""
      },
      additional_info: {
        working_hours: "9 AM - 6 PM, Monday-Saturday",
        languages: "",
        awards: "",
        certifications: "",
        custom_fields: []
      },
      
      // Status Fields
      verified: false,
      currently_available: true,
    }
  });


  const checkPhoneUniqueness = async (phone: string) => {
    try {
      const isUnique = await checkPhoneUnique(phone);
      setPhoneUnique(isUnique);
    } catch (error) {
      console.error("Error checking phone uniqueness:", error);
      setPhoneUnique(false);
    }
  };

  // Function to fill sample data for testing
  const fillSampleData = () => {
    const sampleData: VendorFormInputs = {
      brand_name: "Royal Photography Studio",
      spoc_name: "Rajesh Kumar",
      category: "Photographers",
      subcategory: "Wedding Photography",
      brand_logo_url: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&h=400&fit=crop",
      contact_person_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      phone_number: "+91 98765 43210",
      alternate_number: "+91 87654 32109",
      whatsapp_number: "+91 98765 43210",
      email: "rajesh@royalphotography.com",
      instagram: "@royalphotography",
      address: "123 MG Road, Hyderabad, Telangana 500001",
      description: "Professional wedding photography services with 10+ years of experience. Specializing in candid, traditional, and modern wedding photography.",
      experience: "10+ Years",
      quick_intro: "Creative wedding photography with artistic vision",
      caption: "Namaskaram! Capturing your precious moments with expertise and passion",
      detailed_intro: "Professional photography services with 10+ years of experience. We specialize in creating memorable visual stories for your special occasions with attention to detail and artistic excellence.",
      highlight_features: ["Award-winning photographer", "Same-day delivery", "Professional equipment", "Candid & traditional styles"],
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      cover_image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=400&fit=crop",
      services: [
        { name: "Wedding Photography", description: "Full day coverage with professional editing", price: "₹50,000" },
        { name: "Pre-wedding Shoots", description: "Romantic couple session with multiple locations", price: "₹25,000" },
        { name: "Candid Photography", description: "Natural moments captured beautifully", price: "₹40,000" },
        { name: "Traditional Photography", description: "Classic posed photography for ceremonies", price: "₹35,000" }
      ],
      deliverables: [
        "High-resolution edited photos (500+ images)",
        "Online gallery for easy sharing and downloads", 
        "Professional wedding album (50 pages)",
        "USB drive with all photos and videos",
        "Same-day highlight reel (2-3 minutes)",
        "Pre-wedding consultation and planning session"
      ],
      packages: [
        {
          name: "Premium Wedding Package",
          price: "₹75,000",
          description: "Complete wedding photography with 2 photographers",
          features: ["Full day coverage", "2 photographers", "500+ edited photos", "Online gallery", "USB drive"]
        },
        {
          name: "Basic Wedding Package",
          price: "₹40,000",
          description: "Essential wedding photography services",
          features: ["8 hours coverage", "1 photographer", "300+ edited photos", "Online gallery"]
        }
      ],
      customer_reviews: [],
      booking_policies: {
        cancellation_policy: "50% refund if cancelled 30 days before event. No refund if cancelled within 15 days.",
        payment_terms: "50% advance payment required. Balance to be paid 7 days before the event.",
        booking_requirements: "Signed contract and advance payment required to confirm booking."
      },
      additional_info: {
        working_hours: "9 AM - 7 PM, Monday-Saturday",
        languages: "English, Hindi, Telugu, Tamil",
        awards: "Best Wedding Photographer 2023, Excellence in Photography Award 2022",
        certifications: "Professional Photography Certificate, Adobe Certified Expert",
        custom_fields: [
          { field_name: "Delivery Time", field_value: "7-10 business days" },
          { field_name: "Service Area", field_value: "Hyderabad, Secunderabad, Cyberabad" },
          { field_name: "Equipment", field_value: "Canon 5D Mark IV, Professional Lighting Setup" }
        ]
      },
      verified: true,
      currently_available: true,
    };

    reset(sampleData);
    toast.current?.show({
      severity: "success",
      summary: "Sample Data Loaded",
      detail: "Form has been filled with sample data for testing",
      life: 3000,
    });
  };

  const onSubmit = async (data: VendorFormInputs) => {
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
        
        // Process customer reviews array
        if (processedData.customer_reviews && Array.isArray(processedData.customer_reviews)) {
          processedData.customer_reviews = processedData.customer_reviews.filter(r => 
            r.customer_name && r.customer_name.trim() !== '' && r.review && r.review.trim() !== ''
          );
        }
        
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

      // Process service_areas into additional_info
      const { service_areas, ...dataWithoutServiceAreas } = processedData;
      const additional_info = {
        ...processedData.additional_info,
        service_areas: service_areas ? service_areas.split(',').map(area => area.trim()).filter(area => area !== '') : []
      };

      const vendorData = {
        ...dataWithoutServiceAreas,
        additional_info,
        verified: processedData.verified || false,
        currently_available: processedData.currently_available !== false,
        total_events: 0,
        rating: 0,
        review_count: 0,
        customer_reviews: [], // Ensure no hardcoded reviews
      };

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Add New Vendor</h2>
          <button
            type="button"
            onClick={fillSampleData}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
          >
            Fill Sample Data
          </button>
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
                <select
                  {...register("category", { 
                    required: "Category is required"
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          </section>

          {/* Service Areas - MANDATORY FIELD */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Service Areas (Required)</h3>
            
            <div>
              <label className="block font-medium mb-2 text-gray-700">Service Areas *</label>
              <input
                {...register("service_areas", { 
                  required: "Service areas is required"
                })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hyderabad, Bangalore, Chennai (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">List the cities/areas where you provide services</p>
              {errors.service_areas && (
                <p className="text-red-500 text-sm mt-1">{errors.service_areas.message}</p>
              )}
            </div>
          </section>


          {/* Submit Button */}
          <div className="flex justify-center pt-6">
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