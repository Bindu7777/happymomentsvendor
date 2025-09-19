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
  description?: string;
  experience?: string;
  quick_intro?: string;
  caption?: string;
  detailed_intro?: string;
  avatar_url?: string;
  cover_image_url?: string;
  
  // JSON Fields (will be stored as JSON)
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
      description: "",
      experience: "",
      quick_intro: "",
      caption: "",
      detailed_intro: "",
      avatar_url: "",
      cover_image_url: "",
      
      // JSON Fields
      specialties: [],
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

  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
    control,
    name: "specialties"
  });

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

  const { fields: deliverableFields, append: appendDeliverable, remove: removeDeliverable } = useFieldArray({
    control,
    name: "deliverables"
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
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      cover_image_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=400&fit=crop",
      specialties: ["Wedding Photography", "Pre-wedding Shoots", "Candid Photography", "Traditional Photography"],
      deliverables: [
        "High-resolution edited photos (500+ images)",
        "Online gallery for easy sharing and downloads", 
        "Professional wedding album (50 pages)",
        "USB drive with all photos and videos",
        "Same-day highlight reel (2-3 minutes)",
        "Pre-wedding consultation and planning session"
      ],
      services: [
        {
          name: "Full Day Wedding Photography",
          description: "Complete wedding day coverage from morning to night",
          price: "₹50,000"
        },
        {
          name: "Pre-wedding Photography",
          description: "Romantic pre-wedding photo session",
          price: "₹15,000"
        },
        {
          name: "Engagement Photography",
          description: "Engagement ceremony photography",
          price: "₹10,000"
        }
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
      customer_reviews: [
        {
          customer_name: "Priya & Arjun",
          rating: 5,
          review: "Amazing work! Rajesh captured all the special moments beautifully. Highly recommended!",
          date: "2024-01-15"
        },
        {
          customer_name: "Sneha & Vikram",
          rating: 5,
          review: "Professional service and stunning photos. Worth every penny!",
          date: "2024-02-20"
        }
      ],
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

  // Generate slug from brand name
  const generateSlug = (brandName: string) => {
    return brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
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

      // Generate slug (vendor_id will be auto-generated by database)
      const slug = generateSlug(data.brand_name);

      // Process JSON fields - convert arrays and objects to proper format
      const processJsonFields = (data: any) => {
        const processedData = { ...data };
        
        // Process specialties array
        if (processedData.specialties && Array.isArray(processedData.specialties)) {
          processedData.specialties = processedData.specialties.filter(s => s && s.trim() !== '');
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

      const vendorData = {
        ...processedData,
        slug: slug,
        verified: processedData.verified || false,
        currently_available: processedData.currently_available !== false,
        total_events: 0,
        rating: 0,
        review_count: 0,
      };

      const result = await addVendor(vendorData);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Vendor added successfully",
        life: 3000,
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
          
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Brand Name *</label>
                <input
                  {...register("brand_name")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Contact Person Name *</label>
                <input
                  {...register("spoc_name")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Category *</label>
                <select
                  {...register("category")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {CATEGORY_LIST.map((category) => (
                    <option key={category.code} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Subcategory</label>
                <input
                  {...register("subcategory")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subcategory (optional)"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Brand/Company Logo Image</label>
                <input
                  {...register("brand_logo_url")}
                  type="url"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/brand-logo.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">Upload your brand/company logo</p>
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Contact Person Image</label>
                <input
                  {...register("contact_person_image_url")}
                  type="url"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/contact-person.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">Upload contact person's photo</p>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Content</h3>
            
            {/* Preview Image */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Preview: How your content will appear</h4>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Creative floral decorations with unique designs.
                    <div className="w-16 h-1 bg-orange-400 mt-2"></div>
                  </h2>
                  <p className="text-lg text-amber-700 font-medium italic">
                    "Namaskaram! Professional decorators services with South Indian expertise"
                  </p>
                  <p className="text-lg text-gray-700">
                    Professional decorators services with 7+ years years of experience. We specialize in creating memorable experiences for your special occasions with attention to detail and quality service.
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-blue-600">
                <p><strong>Top text</strong> = Quick Intro | <strong>Middle text (italic)</strong> = Caption | <strong>Bottom text</strong> = Detailed Intro</p>
              </div>
            </div>
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Caption <span className="text-sm text-gray-500">(Optional)</span></label>
                <input
                  {...register("caption", {
                    maxLength: { value: 60, message: "Caption must not exceed 60 characters" }
                  })}
                  maxLength={60}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block font-medium mb-2 text-gray-700">Detailed Intro <span className="text-sm text-gray-500">(Optional)</span></label>
                <textarea
                  {...register("detailed_intro", {
                    maxLength: { value: 300, message: "Detailed intro must not exceed 300 characters" }
                  })}
                  maxLength={300}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Phone Number</label>
                <input
                  {...register("phone_number")}
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
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Alternate Number <span className="text-xs text-gray-500">(Admin Only)</span></label>
                <input
                  {...register("alternate_number")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter alternate number (admin only, not visible in profile)"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">WhatsApp Number</label>
                <input
                  {...register("whatsapp_number")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter WhatsApp number (optional)"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Email</label>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                  type="email"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address (optional)"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Instagram Handle</label>
                <input
                  {...register("instagram")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@username (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-700">Address</label>
              <textarea
                {...register("address")}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address (optional)"
                rows={3}
              />
            </div>
          </section>

          {/* Business Details */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Experience</label>
                <input
                  {...register("experience")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5+ Years (optional)"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Avatar URL</label>
                <input
                  {...register("avatar_url")}
                  type="url"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-700">Cover Image URL</label>
              <input
                {...register("cover_image_url")}
                type="url"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/cover.jpg (optional)"
              />
            </div>


            <div>
              <label className="block font-medium mb-2 text-gray-700">Description</label>
              <textarea
                {...register("description")}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your services and experience (optional)"
                rows={4}
              />
            </div>
          </section>

          {/* Specialties */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Specialties</h3>
              <button
                type="button"
                onClick={() => appendSpecialty("Wedding Photography")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Specialty
              </button>
            </div>
            
            {specialtyFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`specialties.${index}` as const)}
                  className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter specialty"
                />
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </section>

          {/* Services */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Services</h3>
              <button
                type="button"
                onClick={() => appendService({ name: "Wedding Photography", description: "Professional wedding photography service", price: "₹25,000" })}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Service
              </button>
          </div>

              {serviceFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    {...register(`services.${index}.name` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Service name"
                  />
                  <input
                    {...register(`services.${index}.price` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Price (optional)"
                  />
                </div>
                <textarea
                  {...register(`services.${index}.description` as const)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Service description"
                  rows={2}
                  />
                  <button
                    type="button"
                  onClick={() => removeService(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                  Remove Service
                  </button>
                </div>
              ))}
          </section>

          {/* Deliverables */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Deliverables</h3>
              <button
                type="button"
                onClick={() => appendDeliverable("Professional service delivery")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Deliverable
              </button>
            </div>
            
            {deliverableFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(`deliverables.${index}` as const)}
                  className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter what you will deliver (e.g., High-resolution edited photos, Professional album, etc.)"
                />
                <button
                  type="button"
                  onClick={() => removeDeliverable(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
            
            {deliverableFields.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>No deliverables added yet</p>
                <p className="text-sm">Click "Add Deliverable" to specify what you will deliver to clients</p>
              </div>
            )}
          </section>

          {/* Packages */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Packages</h3>
              <button
                type="button"
                onClick={() => appendPackage({ name: "Basic Package", price: "₹30,000", description: "Essential photography package", features: ["8 hours coverage", "300+ photos"] })}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Package
              </button>
            </div>
            
            {packageFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    {...register(`packages.${index}.name` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Package name"
                  />
                  <input
                    {...register(`packages.${index}.price` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Package price"
                  />
                </div>
                <textarea
                  {...register(`packages.${index}.description` as const)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Package description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <input
                    {...register(`packages.${index}.features` as const)}
                    className="flex-1 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Features (comma-separated)"
                  />
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
                </div>
              ))}
          </section>

          {/* Customer Reviews */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Customer Reviews</h3>
              <button
                type="button"
                onClick={() => appendReview({ customer_name: "Happy Customer", rating: 5, review: "Excellent service and beautiful photos!", date: "2024-01-15" })}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Add Review
              </button>
            </div>
            
            {reviewFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    {...register(`customer_reviews.${index}.customer_name` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer name"
                  />
                  <select
                    {...register(`customer_reviews.${index}.rating` as const)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                  <input
                    {...register(`customer_reviews.${index}.date` as const)}
                    type="date"
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  {...register(`customer_reviews.${index}.review` as const)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Customer review"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeReview(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Remove Review
                </button>
              </div>
            ))}
          </section>

          {/* Booking Policies */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Booking Policies</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Cancellation Policy</label>
                <textarea
                  {...register("booking_policies.cancellation_policy")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your cancellation policy"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Payment Terms</label>
                <textarea
                  {...register("booking_policies.payment_terms")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe payment terms and methods"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Booking Requirements</label>
                <textarea
                  {...register("booking_policies.booking_requirements")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements for booking"
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Working Hours</label>
                <input
                  {...register("additional_info.working_hours")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 9 AM - 6 PM, Monday-Friday"
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Languages</label>
                <input
                  {...register("additional_info.languages")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., English, Hindi, Telugu (comma-separated)"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-700">Awards</label>
              <input
                {...register("additional_info.awards")}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List any awards received (comma-separated)"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-gray-700">Certifications</label>
              <input
                {...register("additional_info.certifications")}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List any certifications (comma-separated)"
              />
            </div>

            {/* Dynamic Custom Fields */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">Custom Fields</h4>
                <button
                  type="button"
                  onClick={() => appendCustomField({ field_name: "", field_value: "" })}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Custom Field
                </button>
              </div>
              
              {customFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 p-4 rounded-lg space-y-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Field Name</label>
                      <input
                        {...register(`additional_info.custom_fields.${index}.field_name` as const)}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Delivery Time, Service Area, Equipment"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Field Value</label>
                      <input
                        {...register(`additional_info.custom_fields.${index}.field_value` as const)}
                        className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the value for this field"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Field
                  </button>
                </div>
              ))}
              
              {customFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p>No custom fields added yet</p>
                  <p className="text-sm">Click "Add Custom Field" to add flexible information fields</p>
                </div>
              )}
            </div>
          </section>

          {/* Status Fields */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Status Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <input
                  {...register("verified")}
                  type="checkbox"
                  id="verified"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verified" className="text-gray-700 font-medium">
                  Verified Vendor
                </label>
          </div>

              <div className="flex items-center space-x-3">
                <input
                  {...register("currently_available")}
                  type="checkbox"
                  id="currently_available"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="currently_available" className="text-gray-700 font-medium">
                  Currently Available
                </label>
              </div>
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