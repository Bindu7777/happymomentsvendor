import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Shield
} from "lucide-react";
import { Vendor } from "@/lib/supabase";
import { getVendorByFieldId, updateVendor, deleteVendor } from "@/services/supabaseService";
import { CATEGORY_LIST } from "@/constants/categories";

type VendorEditForm = {
  brand_name: string;
  spoc_name: string;
  category: string;
  subcategory?: string;
  brand_logo_url?: string;
  contact_person_image_url?: string;
  phone_number: string;
  whatsapp_number?: string;
  email?: string;
  instagram?: string;
  address?: string;
  description?: string;
  experience?: string;
  quick_intro?: string;
  caption?: string;
  detailed_intro?: string;
  avatar_url?: string;
  cover_image_url?: string;
  deliverables?: string[];
  verified: boolean;
  currently_available: boolean;
  rating?: number;
  review_count?: number;
};

const AdminVendorEdit = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<VendorEditForm>();

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
      const vendorData = await getVendorByFieldId(vendorId);
      if (vendorData) {
        setVendor(vendorData);
        // Populate form with existing data
        Object.keys(vendorData).forEach(key => {
          if (key in vendorData) {
            setValue(key as keyof VendorEditForm, vendorData[key as keyof Vendor]);
          }
        });
        
        // Handle deliverables array separately
        if (vendorData.deliverables && Array.isArray(vendorData.deliverables)) {
          vendorData.deliverables.forEach((deliverable, index) => {
            appendDeliverable(deliverable);
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      setError("Failed to load vendor data");
      setLoading(false);
    }
  };

  const onSubmit = async (data: VendorEditForm) => {
    if (!vendorId) return;

    setSaving(true);
    setError("");

    try {
      await updateVendor(vendorId, data);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating vendor:", error);
      setError("Failed to update vendor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vendorId || !vendor) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${vendor.brand_name}? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteVendor(vendorId);
        navigate("/admin/dashboard");
      } catch (error) {
        console.error("Error deleting vendor:", error);
        setError("Failed to delete vendor");
      }
    }
  };

  const watchedValues = watch();

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
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Vendor not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The vendor you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Vendor: {vendor.brand_name}
                </h1>
                <p className="text-sm text-gray-500">
                  Vendor ID: {vendor.vendor_id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/vendor/${vendor.vendor_id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Vendor
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  {...register("brand_name", { required: "Brand name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.brand_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.brand_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  {...register("spoc_name", { required: "Contact person name is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                <input
                  {...register("subcategory")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subcategory (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand/Company Logo Image
                </label>
                <input
                  {...register("brand_logo_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/brand-logo.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">Upload your brand/company logo</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Image
                </label>
                <input
                  {...register("contact_person_image_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/contact-person.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">Upload contact person's photo</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Content</h3>
            
            {/* Preview Image */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 mb-6">
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
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Intro <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("quick_intro", { 
                    required: "Quick intro is required",
                    maxLength: { value: 60, message: "Quick intro must not exceed 60 characters" }
                  })}
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Creative wedding photography with artistic vision"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">Short catchy intro line for services</p>
                  <span className="text-xs text-gray-400">{watch("quick_intro")?.length || 0}/60</span>
                </div>
                {errors.quick_intro && (
                  <p className="text-red-500 text-sm mt-1">{errors.quick_intro.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption <span className="text-sm text-gray-500">(Optional)</span>
                  </label>
                  <input
                    {...register("caption", {
                      maxLength: { value: 60, message: "Caption must not exceed 60 characters" }
                    })}
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  <textarea
                    {...register("detailed_intro", {
                      maxLength: { value: 300, message: "Detailed intro must not exceed 300 characters" }
                    })}
                    maxLength={300}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Professional services with years of experience..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">Detailed description of services</p>
                    <span className="text-xs text-gray-400">{watch("detailed_intro")?.length || 0}/300</span>
                  </div>
                  {errors.detailed_intro && (
                    <p className="text-red-500 text-sm mt-1">{errors.detailed_intro.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register("phone_number", { required: "Phone number is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <input
                  {...register("whatsapp_number")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle
                </label>
                <input
                  {...register("instagram")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="@username"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <input
                  {...register("experience")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 5+ Years"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <input
                  {...register("rating", { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Count
                </label>
                <input
                  {...register("review_count", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  {...register("avatar_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL
                </label>
                <input
                  {...register("cover_image_url")}
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>


              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
              <button
                type="button"
                onClick={() => appendDeliverable("Professional service delivery")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Add Deliverable
              </button>
            </div>
            
            <div className="space-y-3">
              {deliverableFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`deliverables.${index}` as const)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter what you will deliver (e.g., High-resolution edited photos, Professional album, etc.)"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {deliverableFields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
                  <p>No deliverables added yet</p>
                  <p className="text-sm">Click "Add Deliverable" to specify what this vendor will deliver to clients</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Status & Verification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  {...register("verified")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Verified Vendor
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register("currently_available")}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Currently Available
                </label>
              </div>
            </div>

            {/* Status Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Status Preview:</h4>
              <div className="flex flex-wrap gap-2">
                {watchedValues.verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    Unverified
                  </span>
                )}
                
                {watchedValues.currently_available ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminVendorEdit;
