import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Toast } from "primereact/toast";
import { addVendor, checkPhoneUnique } from "@/services/supabaseService";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router-dom";

type VendorFormInputs = {
  vendor_id: string;
  slug: string;
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
  } = useForm<VendorFormInputs>();

  const checkPhoneUniqueness = async (phone: string) => {
    try {
      const isUnique = await checkPhoneUnique(phone);
      setPhoneUnique(isUnique);
    } catch (error) {
      console.error("Error checking phone uniqueness:", error);
      setPhoneUnique(false);
    }
  };

  // Generate slug from brand name
  const generateSlug = (brandName: string) => {
    return brandName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Generate vendor ID from brand name and category
  const generateVendorId = (brandName: string, category: string) => {
    const slug = generateSlug(brandName);
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    return `${slug}-${categorySlug}`;
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
      // Generate IDs
      const slug = generateSlug(data.brand_name);
      const vendorId = generateVendorId(data.brand_name, data.category);

      const vendorData = {
        ...data,
        vendor_id: vendorId,
        slug: slug,
        verified: false,
        currently_available: true,
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

      // Navigate to vendor page after 2 seconds
      setTimeout(() => {
        navigate(`/vendor/${result}`);
      }, 2000);

    } catch (error) {
      console.error("Failed to add vendor:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add vendor. Please try again.",
        life: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#E6E6FA] min-h-screen flex items-center justify-center p-4">
      <Toast ref={toast} />
      <div className="max-w-4xl w-full mx-auto p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Add New Vendor</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Brand Name *</label>
                <input
                  {...register("brand_name", { required: "Brand name is required" })}
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
                  {...register("spoc_name", { required: "Contact person name is required" })}
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
                  {...register("category", { required: "Category is required" })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Photography">Photography</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Catering">Catering</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Venue">Venue</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Transport">Transport</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium mb-2 text-gray-700">Subcategory</label>
                <input
                  {...register("subcategory")}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter subcategory (optional)"
                />
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-2 text-gray-700">Phone Number *</label>
                <input
                  {...register("phone_number", { 
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[0-9]{10,15}$/,
                      message: "Please enter a valid phone number"
                    }
                  })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  onBlur={(e) => {
                    if (e.target.value) {
                      checkPhoneUniqueness(e.target.value);
                    }
                  }}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
                )}
                {phoneUnique === false && (
                  <p className="text-red-500 text-sm mt-1">This phone number is already registered</p>
                )}
                {phoneUnique === true && (
                  <p className="text-green-500 text-sm mt-1">Phone number is available</p>
                )}
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