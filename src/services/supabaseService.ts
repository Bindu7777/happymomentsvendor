// services/supabaseService.ts
import { supabase, Vendor, VendorMedia } from "../lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

// Helper function to parse JSON fields in vendor data
const parseVendorJsonFields = (vendorData: any): Vendor => {
  // Parse JSON fields if they are strings
  if (vendorData.services && typeof vendorData.services === 'string') {
    try {
      vendorData.services = JSON.parse(vendorData.services);
    } catch (e) {
      console.warn('Failed to parse services JSON:', e);
    }
  }
  
  if (vendorData.packages && typeof vendorData.packages === 'string') {
    try {
      vendorData.packages = JSON.parse(vendorData.packages);
    } catch (e) {
      console.warn('Failed to parse packages JSON:', e);
    }
  }
  
  if (vendorData.specialties && typeof vendorData.specialties === 'string') {
    try {
      vendorData.specialties = JSON.parse(vendorData.specialties);
    } catch (e) {
      console.warn('Failed to parse specialties JSON:', e);
    }
  }
  
  if (vendorData.customer_reviews && typeof vendorData.customer_reviews === 'string') {
    try {
      vendorData.customer_reviews = JSON.parse(vendorData.customer_reviews);
    } catch (e) {
      console.warn('Failed to parse customer_reviews JSON:', e);
    }
  }
  
  if (vendorData.booking_policies && typeof vendorData.booking_policies === 'string') {
    try {
      vendorData.booking_policies = JSON.parse(vendorData.booking_policies);
    } catch (e) {
      console.warn('Failed to parse booking_policies JSON:', e);
    }
  }
  
  if (vendorData.additional_info && typeof vendorData.additional_info === 'string') {
    try {
      vendorData.additional_info = JSON.parse(vendorData.additional_info);
    } catch (e) {
      console.warn('Failed to parse additional_info JSON:', e);
    }
  }

  return vendorData as Vendor;
};

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection successful. Vendor count:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection test error:", error);
    return false;
  }
};

export const getVendorByFieldId = async (
  vendorId: string
): Promise<Vendor | null> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }

    return parseVendorJsonFields(data);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
};

// Generate simple, memorable password
const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate slug from brand name
const generateSlug = (brandName: string): string => {
  return brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

export const addVendor = async (vendorData: Omit<Vendor, 'created_at' | 'updated_at'>) => {
  try {
    console.log("Attempting to add vendor with data:", vendorData);
    
    // Generate slug if not provided
    const slug = vendorData.slug || generateSlug(vendorData.brand_name);
    
    // Remove vendor_id from the data to let the database auto-generate it
    const { vendor_id, ...dataWithoutVendorId } = vendorData;
    
    // Add slug to the data
    const vendorDataWithSlug = {
      ...dataWithoutVendorId,
      slug: slug
    };
    
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorDataWithSlug])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding vendor:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to add vendor: ${error.message}`);
    }

    console.log("Vendor added successfully with ID:", data.vendor_id);
    
    // Create vendor credentials
    const password = generatePassword();
    const credentialsData = {
      vendor_id: data.vendor_id,
      username: data.vendor_id.toString(), // Use vendor_id as username
      password: password,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: null
    };

    const { error: credentialsError } = await supabase
      .from('vendor_credentials')
      .insert([credentialsData]);

    if (credentialsError) {
      console.error("Error creating vendor credentials:", credentialsError);
      // Don't throw error here, just log it - vendor is already created
      console.warn("Vendor created but credentials creation failed. Credentials can be created manually.");
    } else {
      console.log("Vendor credentials created successfully");
      console.log("Generated credentials:", {
        username: credentialsData.username,
        password: credentialsData.password
      });
    }

    return data.vendor_id;
  } catch (error) {
    console.error("Error adding vendor:", error);
    throw error;
  }
};

export const checkPhoneUnique = async (phone: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('vendor_id')
      .eq('phone_number', phone);

    if (error) {
      console.error('Error checking phone uniqueness:', error);
      return false;
    }

    return data.length === 0; // true if no vendor has this phone
  } catch (error) {
    console.error('Error checking phone uniqueness:', error);
    return false;
  }
};

// Get all vendors (for public display - only verified and available)
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    console.log('=== GET ALL VENDORS DEBUG ===');
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verified', true)
      .eq('currently_available', true)
      .order('created_at', { ascending: false });

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    console.log('Returning all vendors:', data);
    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

// Get all vendors for admin (includes unverified and unavailable)
export const getAllVendorsForAdmin = async (): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors for admin:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors for admin:', error);
    return [];
  }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    console.log('=== GET VENDORS BY CATEGORY DEBUG ===');
    console.log('Looking for category:', category);
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .eq('verified', true)
      .eq('currently_available', true)
      .order('rating', { ascending: false });

    console.log('Supabase query result:', { data, error });

    if (error) {
      console.error('Error fetching vendors by category:', error);
      return [];
    }

    console.log('Returning vendors:', data);
    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
  }
};

// Get vendor counts by category for homepage
export const getVendorCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('category')
      .eq('verified', true)
      .eq('currently_available', true);

    if (error) {
      console.error('Error fetching vendor counts:', error);
      return {};
    }

    // Count vendors by category
    const counts: Record<string, number> = {};
    data.forEach(vendor => {
      if (vendor.category) {
        counts[vendor.category] = (counts[vendor.category] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error fetching vendor counts:', error);
    return {};
  }
};

// Get vendor media
export const getVendorMedia = async (vendorId: string, category?: string): Promise<VendorMedia[]> => {
  try {
    let query = supabase
      .from('vendor_media')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('public', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor media:', error);
      return [];
    }

    return data as VendorMedia[];
  } catch (error) {
    console.error('Error fetching vendor media:', error);
    return [];
  }
};

// Get highlighted catalog images (up to 3) or first 3 if none highlighted
export const getHighlightedCatalogImages = async (vendorId: string): Promise<VendorMedia[]> => {
  try {
    console.log(`Getting ONLY highlighted catalog images for vendor ${vendorId}`);
    
    let { data: highlightedImages, error: highlightedError } = await supabase
      .from('vendor_media')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog')
      .eq('public', true)
      .eq('is_highlighted', true)
      .order('order_index', { ascending: true })
      .order('uploaded_at', { ascending: true })
      .limit(3);

    if (highlightedError) {
      console.error('Error fetching highlighted catalog images:', highlightedError);
      return [];
    }

    console.log(`Found ${highlightedImages?.length || 0} highlighted catalog images for vendor ${vendorId}`);
    return (highlightedImages as VendorMedia[]) || [];

  } catch (error) {
    console.error('Error fetching highlighted catalog images:', error);
    return [];
  }
};

// Get all catalog images (max 10 for display)
export const getAllCatalogImages = async (vendorId: string): Promise<VendorMedia[]> => {
  try {
    console.log(`Getting all catalog images for vendor ${vendorId}`);
    
    let { data: catalogImages, error: catalogError } = await supabase
      .from('vendor_media')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog')
      .eq('public', true)
      .order('order_index', { ascending: true })
      .order('uploaded_at', { ascending: true })
      .limit(10); // Max 10 images for catalog display

    if (catalogError) {
      console.error('Error fetching all catalog images:', catalogError);
      return [];
    }

    console.log(`Found ${catalogImages?.length || 0} total catalog images for vendor ${vendorId}`);
    return (catalogImages as VendorMedia[]) || [];

  } catch (error) {
    console.error('Error in getAllCatalogImages:', error);
    return [];
  }
};

// Toggle highlight status for a catalog image
export const toggleImageHighlight = async (imageId: string, isHighlighted: boolean): Promise<boolean> => {
  try {
    console.log(`Toggling highlight for image ${imageId} to ${isHighlighted}`);
    
    // If trying to highlight, check if vendor already has 3 highlighted images
    if (isHighlighted) {
      const { data: image, error: imageError } = await supabase
        .from('vendor_media')
        .select('vendor_id')
        .eq('id', imageId)
        .single();

      if (imageError) {
        console.error('Error fetching image:', imageError);
        throw new Error('Failed to fetch image information');
      }

      if (image) {
        const { data: highlightedImages, error: highlightedError } = await supabase
          .from('vendor_media')
          .select('id')
          .eq('vendor_id', image.vendor_id)
          .eq('category', 'catalog')
          .eq('is_highlighted', true);

        if (highlightedError) {
          console.error('Error fetching highlighted images:', highlightedError);
          throw new Error('Failed to check highlighted images count');
        }

        if (highlightedImages && highlightedImages.length >= 3) {
          throw new Error('Cannot highlight more than 3 catalog images. Please unhighlight another image first.');
        }
      }
    }

    const { error } = await supabase
      .from('vendor_media')
      .update({ is_highlighted: isHighlighted })
      .eq('id', imageId);

    if (error) {
      console.error('Error updating image highlight:', error);
      throw new Error('Failed to update highlight status: ' + error.message);
    }

    console.log(`Successfully toggled highlight for image ${imageId}`);
    return true;
  } catch (error) {
    console.error('Error toggling image highlight:', error);
    throw error; // Re-throw to let the UI handle the error
  }
};

// Test function to update just verified status
export const updateVendorVerified = async (vendorId: string, verified: boolean): Promise<boolean> => {
  try {
    console.log('Testing verified update for vendor:', vendorId, 'verified:', verified);
    
    const { data, error } = await supabase
      .from('vendors')
      .update({ verified })
      .eq('vendor_id', vendorId)
      .select();

    if (error) {
      console.error('Supabase error updating verified status:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('Verified status updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating verified status:', error);
    return false;
  }
};

// Update vendor
export const updateVendor = async (vendorId: string, vendorData: Partial<Vendor>): Promise<boolean> => {
  try {
    console.log('Updating vendor with ID:', vendorId);
    console.log('Vendor data to update:', vendorData);
    
    // Define allowed fields for update (based on actual database schema)
    const allowedFields = [
      'brand_name', 'spoc_name', 'category', 'subcategory',
      'phone_number', 'alternate_number', 'whatsapp_number', 'email', 'instagram', 'address',
      'experience', 'quick_intro', 'caption', 'detailed_intro', 'highlight_features',
      'starting_price', 'languages_spoken', 'verified', 'currently_available',
      'avatar_url', 'cover_image_url', 'brand_logo_url', 'contact_person_image_url',
      'services', 'packages', 'deliverables', 'customer_reviews', 'booking_policies', 'additional_info'
    ];
    
    // Filter data to only include allowed fields and non-empty values
    const cleanedData = Object.fromEntries(
      Object.entries(vendorData).filter(([key, value]) => 
        allowedFields.includes(key) && 
        value !== undefined && 
        value !== null && 
        value !== ''
      )
    );
    
    console.log('Cleaned vendor data:', cleanedData);
    
    if (Object.keys(cleanedData).length === 0) {
      console.log('No valid fields to update');
      return true; // Nothing to update, consider it successful
    }
    
    const { data, error } = await supabase
      .from('vendors')
      .update(cleanedData)
      .eq('vendor_id', vendorId)
      .select();

    if (error) {
      console.error('Supabase error updating vendor:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Failed data:', cleanedData);
      return false;
    }

    console.log('Vendor updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error updating vendor:', error);
    return false;
  }
};

// Delete vendor
export const deleteVendor = async (vendorId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error deleting vendor:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor:', error);
    return false;
  }
};

// Add vendor media
export const addVendorMedia = async (mediaData: Omit<VendorMedia, 'id' | 'uploaded_at'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('vendor_media')
      .insert([mediaData])
      .select()
      .single();

    if (error) {
      console.error('Error adding vendor media:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding vendor media:', error);
    return null;
  }
};

// Delete vendor media
export const deleteVendorMedia = async (mediaId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting vendor media:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vendor media:', error);
    return false;
  }
};

// Update vendor catalog images (preserving highlight status)
export const updateVendorCatalogImages = async (vendorId: string, imageUrls: string[]): Promise<boolean> => {
  try {
    console.log('Updating catalog images for vendor:', vendorId);
    console.log('New image URLs:', imageUrls);
    
    // First, get existing catalog images to preserve highlight status
    const { data: existingImages, error: fetchError } = await supabase
      .from('vendor_media')
      .select('media_url, is_highlighted')
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog');

    if (fetchError) {
      console.error('Error fetching existing catalog images:', fetchError);
    }

    const existingHighlights = existingImages?.reduce((acc, img) => {
      if (img.is_highlighted) {
        acc[img.media_url] = true;
      }
      return acc;
    }, {} as Record<string, boolean>) || {};

    console.log('Existing highlights to preserve:', existingHighlights);

    // Delete existing catalog images
    const { error: deleteError } = await supabase
      .from('vendor_media')
      .delete()
      .eq('vendor_id', vendorId)
      .eq('category', 'catalog');

    if (deleteError) {
      console.error('Error deleting existing catalog images:', deleteError);
      return false;
    }

    // Then, add new catalog images with preserved highlight status
    if (imageUrls.length > 0) {
      const mediaData = imageUrls.map((url, index) => ({
        vendor_id: vendorId,
        media_url: url,
        media_type: 'image' as const,
        category: 'catalog' as const,
        order_index: index,
        public: true,
        is_highlighted: existingHighlights[url] || false, // Preserve highlight status
        title: `Catalog Image ${index + 1}`
      }));

      console.log('Inserting new catalog images with data:', mediaData);

      const { error: insertError } = await supabase
        .from('vendor_media')
        .insert(mediaData);

      if (insertError) {
        console.error('Error adding new catalog images:', insertError);
        return false;
      }

      console.log('Successfully updated catalog images in vendor_media table');
    }

    return true;
  } catch (error) {
    console.error('Error updating vendor catalog images:', error);
    return false;
  }
};

// Vendor Authentication Functions
export const vendorLogin = async (username: string, password: string): Promise<{success: boolean, vendor?: Vendor, message?: string}> => {
  try {
    // Simple login check against vendor_credentials table
    const { data, error } = await supabase
      .from('vendor_credentials')
      .select(`
        vendor_id,
        username,
        vendors (*)
      `)
      .eq('username', username)
      .eq('password', password)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Update last login
    await supabase
      .from('vendor_credentials')
      .update({ last_login: new Date().toISOString() })
      .eq('vendor_id', data.vendor_id);

    return { 
      success: true, 
      vendor: parseVendorJsonFields(data.vendors),
      message: 'Login successful' 
    };
  } catch (error) {
    console.error('Error during vendor login:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

// Check if vendor is logged in (simple session check)
export const getLoggedInVendor = (): Vendor | null => {
  try {
    const vendorData = localStorage.getItem('loggedInVendor');
    return vendorData ? JSON.parse(vendorData) : null;
  } catch (error) {
    console.error('Error getting logged in vendor:', error);
    return null;
  }
};

// Vendor logout
export const vendorLogout = (): void => {
  localStorage.removeItem('loggedInVendor');
  localStorage.removeItem('vendorLoginTime');
};

// Save vendor session
export const saveVendorSession = (vendor: Vendor): void => {
  localStorage.setItem('loggedInVendor', JSON.stringify(vendor));
  localStorage.setItem('vendorLoginTime', new Date().toISOString());
};

// Refresh vendor session with fresh data from database
export const refreshVendorSession = async (): Promise<Vendor | null> => {
  try {
    const currentVendor = getLoggedInVendor();
    if (!currentVendor) {
      return null;
    }

    console.log('Refreshing vendor session data...');
    const freshVendorData = await getVendorByFieldId(currentVendor.vendor_id);
    
    if (freshVendorData) {
      // Update localStorage with fresh data
      saveVendorSession(freshVendorData);
      console.log('Vendor session refreshed with latest data');
      return freshVendorData;
    }
    
    return currentVendor; // Return current data if refresh fails
  } catch (error) {
    console.error('Error refreshing vendor session:', error);
    return getLoggedInVendor(); // Return current data if refresh fails
  }
};

// Vendor Profile Change Workflow Functions
export const submitVendorProfileChange = async (
  vendorId: number, 
  changeType: string, 
  currentData: any, 
  proposedChanges: any
): Promise<{success: boolean, changeId?: number, message?: string}> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .insert([{
        vendor_id: vendorId,
        change_type: changeType,
        current_data: currentData,
        proposed_changes: proposedChanges,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting profile change:', error);
      return { success: false, message: 'Failed to submit changes for approval' };
    }

    return { 
      success: true, 
      changeId: data.id,
      message: 'Changes submitted for admin approval' 
    };
  } catch (error) {
    console.error('Error submitting profile change:', error);
    return { success: false, message: 'Failed to submit changes for approval' };
  }
};

// Get vendor's pending changes
export const getVendorPendingChanges = async (vendorId: number): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending changes:', error);
    return [];
  }
};

// Clear hardcoded services from vendor (admin function)
export const clearVendorHardcodedServices = async (vendorId: string): Promise<{success: boolean, message?: string}> => {
  try {
    console.log('Clearing hardcoded services for vendor:', vendorId);
    
    // Get current vendor data
    const { data: currentVendor, error: fetchError } = await supabase
      .from('vendors')
      .select('services, specialties')
      .eq('vendor_id', vendorId)
      .single();

    if (fetchError) {
      console.error('Error fetching vendor for services clearing:', fetchError);
      return { success: false, message: 'Vendor not found' };
    }

    console.log('Current vendor services:', currentVendor.services);
    console.log('Current vendor specialties:', currentVendor.specialties);

    // Clear both services and specialties fields, and any other potential hardcoded fields
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        services: [],
        specialties: null,
        updated_at: new Date().toISOString()
      })
      .eq('vendor_id', vendorId);

    if (updateError) {
      console.error('Error clearing services:', updateError);
      return { success: false, message: `Failed to clear services: ${updateError.message}` };
    }

    console.log('Successfully cleared hardcoded services for vendor:', vendorId);
    return { success: true, message: 'Hardcoded services cleared successfully' };
  } catch (error) {
    console.error('Error clearing hardcoded services:', error);
    return { success: false, message: 'Failed to clear services' };
  }
};

// Get vendor notifications (approved/rejected changes)
export const getVendorNotifications = async (vendorId: number, unreadOnly: boolean = false): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('vendor_id', vendorId)
      .in('status', ['approved', 'rejected'])
      .order('reviewed_at', { ascending: false })
      .limit(20); // Get latest 20 notifications

    // If we only want unread notifications (for count)
    if (unreadOnly) {
      query = query.eq('notification_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read (optional - for future use)
export const markNotificationAsRead = async (changeId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_profile_changes')
      .update({ notification_read: true })
      .eq('id', changeId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a vendor
export const markAllNotificationsAsRead = async (vendorId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendor_profile_changes')
      .update({ notification_read: true })
      .eq('vendor_id', vendorId)
      .in('status', ['approved', 'rejected'])
      .eq('notification_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Get all pending changes for admin review
export const getAllPendingChanges = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('vendor_profile_changes')
      .select(`
        *,
        vendors (brand_name, category, spoc_name)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Error fetching all pending changes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all pending changes:', error);
    return [];
  }
};

// Admin approve/reject changes
export const reviewVendorProfileChange = async (
  changeId: number,
  status: 'approved' | 'rejected',
  adminUsername: string,
  adminComments?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    // Get the change record first
    const { data: changeRecord, error: fetchError } = await supabase
      .from('vendor_profile_changes')
      .select('*')
      .eq('id', changeId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !changeRecord) {
      return { success: false, message: 'Change request not found or already processed' };
    }

    // Update the change record status
    const { error: updateError } = await supabase
      .from('vendor_profile_changes')
      .update({
        status: status,
        reviewed_by: adminUsername,
        reviewed_at: new Date().toISOString(),
        admin_comments: adminComments,
        updated_at: new Date().toISOString()
      })
      .eq('id', changeId);

    if (updateError) {
      console.error('Error updating change status:', updateError);
      return { success: false, message: 'Failed to update change status' };
    }

    // If approved, apply changes to vendors table
    if (status === 'approved') {
      const proposedChanges = changeRecord.proposed_changes;
      
      console.log('Applying changes to vendor:', changeRecord.vendor_id);
      console.log('Proposed changes:', proposedChanges);
      
      // First check if vendor exists and get current data
      const { data: existingVendor, error: fetchVendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', changeRecord.vendor_id)
        .single();

      if (fetchVendorError || !existingVendor) {
        console.error('Vendor not found:', fetchVendorError);
        return { success: false, message: 'Vendor not found for update' };
      }

      console.log('Existing vendor found:', existingVendor.brand_name);

      // Clean and validate the proposed changes
      const cleanedChanges = { ...proposedChanges };
      
      // Remove any fields that shouldn't be updated or don't exist in vendors table
      delete cleanedChanges.id;
      delete cleanedChanges.vendor_id;
      delete cleanedChanges.created_at;
      
      // Handle catalog_images separately - don't try to update in vendors table
      const catalogImages = cleanedChanges.catalog_images;
      delete cleanedChanges.catalog_images;
      
      // Handle highlight_status_changes separately - don't try to update in vendors table
      const highlightStatusChanges = cleanedChanges.highlight_status_changes;
      delete cleanedChanges.highlight_status_changes;
      
      // Convert arrays to proper format if needed
      if (cleanedChanges.deliverables && Array.isArray(cleanedChanges.deliverables)) {
        cleanedChanges.deliverables = cleanedChanges.deliverables.filter(item => item && item.trim() !== '');
      }

      console.log('Cleaned changes to apply (without catalog_images and highlight_status_changes):', cleanedChanges);

      // Update vendor profile (excluding catalog_images)
      const { error: vendorUpdateError } = await supabase
        .from('vendors')
        .update({
          ...cleanedChanges,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', changeRecord.vendor_id);

      if (vendorUpdateError) {
        console.error('Error applying approved changes:', vendorUpdateError);
        console.error('Update payload:', { ...cleanedChanges, updated_at: new Date().toISOString() });
        return { success: false, message: `Failed to apply approved changes: ${vendorUpdateError.message}` };
      }

      // Handle catalog_images through vendor_media table if they were included in changes
      if (catalogImages) {
        console.log('=== UPDATING CATALOG IMAGES IN VENDOR_MEDIA ===');
        console.log('Vendor ID:', changeRecord.vendor_id);
        console.log('Catalog images data:', catalogImages);
        console.log('Catalog images type:', typeof catalogImages);
        
        try {
          let finalImageUrls: string[] = [];
          
          // Handle new structured format (added/removed)
          if (typeof catalogImages === 'object' && catalogImages.added && catalogImages.removed) {
            console.log('Processing structured catalog images format');
            console.log('Added images:', catalogImages.added);
            console.log('Removed images:', catalogImages.removed);
            
            // Get current images from vendor_media table
            const { data: currentImages, error: fetchError } = await supabase
              .from('vendor_media')
              .select('media_url')
              .eq('vendor_id', changeRecord.vendor_id)
              .eq('category', 'catalog');
              
            if (fetchError) {
              console.error('Error fetching current catalog images:', fetchError);
              throw fetchError;
            }
            
            const currentImageUrls = currentImages?.map(img => img.media_url) || [];
            console.log('Current catalog images from database:', currentImageUrls);
            
            // Remove deleted images and add new images
            const afterRemoval = currentImageUrls.filter(url => !catalogImages.removed.includes(url));
            finalImageUrls = [...afterRemoval, ...catalogImages.added];
            
            console.log('Final image URLs after processing:', finalImageUrls);
            
          } else if (Array.isArray(catalogImages)) {
            // Handle legacy array format
            console.log('Processing legacy array format');
            finalImageUrls = catalogImages;
          } else {
            console.log('Unknown catalog images format, skipping update');
            return { success: true, message: 'Changes approved but catalog images format not recognized' };
          }
          
          if (finalImageUrls.length >= 0) { // Allow empty arrays (all images removed)
            const catalogUpdateResult = await updateVendorCatalogImages(changeRecord.vendor_id, finalImageUrls);
            if (!catalogUpdateResult) {
              console.error('❌ Failed to update catalog images in vendor_media table');
              // Don't fail the entire approval, just log the error
              console.warn('Vendor profile updated but catalog images update failed');
            } else {
              console.log('✅ Catalog images updated successfully in vendor_media table');
              console.log('Catalog images should now be visible in public profile');
            }
          }
          
        } catch (catalogError) {
          console.error('❌ Error updating catalog images:', catalogError);
          // Don't fail the entire approval, just log the error
          console.warn('Vendor profile updated but catalog images update failed:', catalogError);
        }
      } else {
        console.log('No catalog images to update');
      }

      // Handle highlight status changes
      if (highlightStatusChanges && highlightStatusChanges.changed_images) {
        console.log('=== APPLYING HIGHLIGHT STATUS CHANGES ===');
        console.log('Highlight changes:', highlightStatusChanges);
        
        try {
          for (const changedImg of highlightStatusChanges.changed_images) {
            console.log(`Updating highlight status for image: ${changedImg.media_url} to ${changedImg.is_highlighted}`);
            
            // Find the image in vendor_media table by media_url and vendor_id
            const { data: imageRecord, error: findError } = await supabase
              .from('vendor_media')
              .select('id')
              .eq('vendor_id', changeRecord.vendor_id)
              .eq('media_url', changedImg.media_url)
              .eq('category', 'catalog')
              .single();

            if (findError || !imageRecord) {
              console.error(`Failed to find image record for ${changedImg.media_url}:`, findError);
              continue;
            }

            // Update the highlight status
            const { error: updateError } = await supabase
              .from('vendor_media')
              .update({ is_highlighted: changedImg.is_highlighted })
              .eq('id', imageRecord.id);

            if (updateError) {
              console.error(`Failed to update highlight status for image ${imageRecord.id}:`, updateError);
            } else {
              console.log(`✅ Successfully updated highlight status for image ${imageRecord.id}`);
            }
          }
          
          console.log('✅ All highlight status changes applied successfully');
        } catch (highlightError) {
          console.error('❌ Error applying highlight status changes:', highlightError);
          // Don't fail the entire approval, just log the error
          console.warn('Vendor profile updated but highlight status changes failed:', highlightError);
        }
      }

      console.log('Vendor profile updated successfully');
    }

    return { 
      success: true, 
      message: `Changes ${status} successfully` 
    };
  } catch (error) {
    console.error('Error reviewing profile change:', error);
    return { success: false, message: 'Failed to review changes' };
  }
};

// Vendor CRM Leads Management Functions
export const getVendorLeads = async (vendorId: number, status?: string, priority?: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_leads')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor leads:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching vendor leads:', error);
    return [];
  }
};

export const getVendorLeadStats = async (vendorId: number): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('vendor_leads')
      .select('status, converted_to_booking, final_booking_amount')
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error fetching lead stats:', error);
      return {
        total_leads: 0,
        new_leads: 0,
        contacted_leads: 0,
        negotiation_leads: 0,
        proposal_sent_leads: 0,
        customer_decision_pending_leads: 0,
        confirmed_bookings: 0,
        advance_received_leads: 0,
        completed_leads: 0,
        lost_leads: 0,
        conversion_rate: 0,
        total_revenue: 0
      };
    }

    const leads = data || [];
    const stats = {
      total_leads: leads.length,
      new_leads: leads.filter(l => l.status === 'new_lead').length,
      contacted_leads: leads.filter(l => l.status === 'contacted').length,
      negotiation_leads: leads.filter(l => l.status === 'negotiation').length,
      proposal_sent_leads: leads.filter(l => l.status === 'proposal_sent').length,
      customer_decision_pending_leads: leads.filter(l => l.status === 'customer_decision_pending').length,
      confirmed_bookings: leads.filter(l => l.status === 'confirmed_booking').length,
      advance_received_leads: leads.filter(l => l.status === 'advance_received').length,
      completed_leads: leads.filter(l => l.status === 'completed').length,
      lost_leads: leads.filter(l => l.status === 'lost').length,
      conversion_rate: leads.length > 0 ? 
        Math.round((leads.filter(l => l.converted_to_booking).length / leads.length) * 100 * 100) / 100 : 0,
      total_revenue: leads
        .filter(l => l.status === 'completed' && l.final_booking_amount)
        .reduce((sum, l) => sum + (l.final_booking_amount || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error calculating lead stats:', error);
    return {
      total_leads: 0,
      new_leads: 0,
      contacted_leads: 0,
      negotiation_leads: 0,
      proposal_sent_leads: 0,
      customer_decision_pending_leads: 0,
      confirmed_bookings: 0,
      advance_received_leads: 0,
      completed_leads: 0,
      lost_leads: 0,
      conversion_rate: 0,
      total_revenue: 0
    };
  }
};

export const addVendorLead = async (leadData: any): Promise<{success: boolean, leadId?: number, message?: string}> => {
  try {
    console.log('Adding lead with data:', leadData);

    // Test if vendor_leads table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('vendor_leads')
      .select('count', { count: 'exact' });
    
    if (tableError) {
      console.error('vendor_leads table does not exist or is not accessible:', tableError);
      return { 
        success: false, 
        message: 'vendor_leads table not found. Please run the SQL script to create it.' 
      };
    }

    const { data, error } = await supabase
      .from('vendor_leads')
      .insert([{
        ...leadData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding lead:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        success: false, 
        message: `Failed to add lead: ${error.message}` 
      };
    }

    console.log('Lead added successfully:', data);
    return { 
      success: true, 
      leadId: data.id,
      message: 'Lead added successfully' 
    };
  } catch (error) {
    console.error('Error adding lead:', error);
    return { 
      success: false, 
      message: `Failed to add lead: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

export const updateVendorLead = async (leadId: number, updateData: any): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead:', error);
      return { success: false, message: 'Failed to update lead' };
    }

    return { success: true, message: 'Lead updated successfully' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, message: 'Failed to update lead' };
  }
};

export const updateLeadStatus = async (
  leadId: number, 
  newStatus: string, 
  notes?: string
): Promise<{success: boolean, message?: string}> => {
  try {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      last_contact_date: new Date().toISOString()
    };

    if (notes) {
      updateData.follow_up_notes = notes;
    }

    if (newStatus === 'contacted') {
      // Increment contact count
      const { data: currentLead } = await supabase
        .from('vendor_leads')
        .select('contact_count')
        .eq('id', leadId)
        .single();
      
      updateData.contact_count = (currentLead?.contact_count || 0) + 1;
    }

    if (newStatus === 'confirmed_booking') {
      updateData.converted_to_booking = true;
      updateData.conversion_date = new Date().toISOString();
    }

    const { error } = await supabase
      .from('vendor_leads')
      .update(updateData)
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead status:', error);
      return { success: false, message: 'Failed to update lead status' };
    }

    return { success: true, message: 'Lead status updated successfully' };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, message: 'Failed to update lead status' };
  }
};

export const deleteVendorLead = async (leadId: number): Promise<{success: boolean, message?: string}> => {
  try {
    const { error } = await supabase
      .from('vendor_leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return { success: false, message: 'Failed to delete lead' };
    }

    return { success: true, message: 'Lead deleted successfully' };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, message: 'Failed to delete lead' };
  }
};

// ===== VENDOR CALENDAR FUNCTIONS =====

// Get vendor events for a date range
export const getVendorEvents = async (vendorId: number, startDate?: string, endDate?: string) => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('start_datetime', { ascending: true });

    if (startDate && endDate) {
      query = query
        .gte('start_datetime', startDate)
        .lte('start_datetime', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendor events:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVendorEvents:', error);
    return [];
  }
};

// Create new vendor event
export const createVendorEvent = async (eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts first
    const conflicts = await checkEventConflicts(
      eventData.vendor_id,
      eventData.start_datetime,
      eventData.end_datetime
    );

    if (conflicts.length > 0) {
      return { 
        success: false, 
        error: `Conflict detected with existing event: "${conflicts[0].title}"` 
      };
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .insert([{
        ...eventData,
        created_by: 'vendor'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in createVendorEvent:', error);
    return { success: false, error: 'Failed to create event' };
  }
};

// Update vendor event
export const updateVendorEvent = async (eventId: number, eventData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Check for conflicts (excluding current event)
    if (eventData.start_datetime && eventData.end_datetime && eventData.vendor_id) {
      const conflicts = await checkEventConflicts(
        eventData.vendor_id,
        eventData.start_datetime,
        eventData.end_datetime,
        eventId
      );

      if (conflicts.length > 0) {
        return { 
          success: false, 
          error: `Conflict detected with existing event: "${conflicts[0].title}"` 
        };
      }
    }

    const { data, error } = await supabase
      .from('vendor_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateVendorEvent:', error);
    return { success: false, error: 'Failed to update event' };
  }
};

// Delete vendor event
export const deleteVendorEvent = async (eventId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('vendor_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting vendor event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteVendorEvent:', error);
    return { success: false, error: 'Failed to delete event' };
  }
};

// Check for event conflicts
export const checkEventConflicts = async (
  vendorId: number,
  startDateTime: string,
  endDateTime: string,
  excludeEventId?: number
): Promise<any[]> => {
  try {
    let query = supabase
      .from('vendor_events')
      .select('id, title, start_datetime, end_datetime')
      .eq('vendor_id', vendorId)
      .not('status', 'in', '(cancelled,completed)')
      .or(`and(start_datetime.lte.${startDateTime},end_datetime.gt.${startDateTime}),and(start_datetime.lt.${endDateTime},end_datetime.gte.${endDateTime}),and(start_datetime.gte.${startDateTime},end_datetime.lte.${endDateTime})`);

    if (excludeEventId) {
      query = query.neq('id', excludeEventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking event conflicts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in checkEventConflicts:', error);
    return [];
  }
};

// Get vendor availability for a specific date
export const getVendorAvailability = async (vendorId: number, date: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_vendor_availability', {
        p_vendor_id: vendorId,
        p_date: date
      });

    if (error) {
      console.error('Error getting vendor availability:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getVendorAvailability:', error);
    return null;
  }
};

// Get calendar statistics for vendor
export const getVendorCalendarStats = async (vendorId: number) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('vendor_events')
      .select('event_type, status')
      .eq('vendor_id', vendorId)
      .gte('start_datetime', `${currentMonth}-01`)
      .lt('start_datetime', `${nextMonth}-01`);

    if (error) {
      console.error('Error getting calendar stats:', error);
      return null;
    }

    const stats = {
      total_events: data.length,
      confirmed_bookings: data.filter(e => e.status === 'confirmed' && e.event_type !== 'blocked').length,
      tentative_bookings: data.filter(e => e.status === 'tentative' && e.event_type !== 'blocked').length,
      blocked_days: data.filter(e => e.event_type === 'blocked').length,
      completed_events: data.filter(e => e.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error in getVendorCalendarStats:', error);
    return null;
  }
};
