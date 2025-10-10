import { supabase } from '@/lib/supabase';

export interface LikedVendor {
  id: number;
  customer_id: number;
  vendor_id: string;
  liked_at: string;
  created_at: string;
}

// Add a vendor to customer's liked list
export const likeVendor = async (customerId: number, vendorId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('customer_liked_vendors')
      .insert({
        customer_id: customerId,
        vendor_id: vendorId
      });

    if (error) {
      console.error('Error liking vendor:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Remove a vendor from customer's liked list
export const unlikeVendor = async (customerId: number, vendorId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('customer_liked_vendors')
      .delete()
      .eq('customer_id', customerId)
      .eq('vendor_id', vendorId);

    if (error) {
      console.error('Error unliking vendor:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Check if a vendor is liked by a customer
export const isVendorLiked = async (customerId: number, vendorId: string): Promise<{ liked: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customer_liked_vendors')
      .select('id')
      .eq('customer_id', customerId)
      .eq('vendor_id', vendorId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking if vendor is liked:', error);
      return { liked: false, error: error.message };
    }

    return { liked: !!data };
  } catch (error) {
    console.error('Error:', error);
    return { liked: false, error: 'An unexpected error occurred' };
  }
};

// Get all liked vendors for a customer
export const getLikedVendors = async (customerId: number): Promise<{ data?: LikedVendor[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('customer_liked_vendors')
      .select('*')
      .eq('customer_id', customerId)
      .order('liked_at', { ascending: false });

    if (error) {
      console.error('Error fetching liked vendors:', error);
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Get liked vendors with vendor details
export const getLikedVendorsWithDetails = async (customerId: number): Promise<{ data?: any[]; error?: string }> => {
  try {
    // First, get the liked vendor IDs
    const { data: likedData, error: likedError } = await supabase
      .from('customer_liked_vendors')
      .select('vendor_id, liked_at')
      .eq('customer_id', customerId)
      .order('liked_at', { ascending: false });

    if (likedError) {
      console.error('Error fetching liked vendors:', likedError);
      return { error: likedError.message };
    }

    if (!likedData || likedData.length === 0) {
      return { data: [] };
    }

    // Get vendor details for each liked vendor
    const vendorIds = likedData.map(item => item.vendor_id);
    const { data: vendorsData, error: vendorsError } = await supabase
      .from('vendors')
      .select('*')
      .in('vendor_id', vendorIds);

    if (vendorsError) {
      console.error('Error fetching vendor details:', vendorsError);
      return { error: vendorsError.message };
    }

    // Combine liked data with vendor details
    const combinedData = likedData.map(liked => {
      const vendor = vendorsData?.find(v => v.vendor_id === liked.vendor_id);
      return {
        ...vendor,
        liked_at: liked.liked_at
      };
    }).filter(Boolean);

    return { data: combinedData };
  } catch (error) {
    console.error('Error:', error);
    return { error: 'An unexpected error occurred' };
  }
};
