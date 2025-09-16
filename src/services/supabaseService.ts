// services/supabaseService.ts
import { supabase, Vendor, VendorMedia } from "../lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

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

    return data as Vendor;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
};

export const addVendor = async (vendorData: Omit<Vendor, 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();

    if (error) {
      console.error("Error adding vendor:", error);
      throw error;
    }

    console.log("Vendor added with ID:", data.vendor_id);
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

// Get all vendors
export const getAllVendors = async (): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('verified', true)
      .eq('currently_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vendors:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category', category)
      .eq('verified', true)
      .eq('currently_available', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching vendors by category:', error);
      return [];
    }

    return data as Vendor[];
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return [];
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

// Update vendor
export const updateVendor = async (vendorId: string, vendorData: Partial<Vendor>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error updating vendor:', error);
      return false;
    }

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
