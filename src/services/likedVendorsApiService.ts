// API service for liked vendors using backend endpoints
const API_BASE_URL = 'http://localhost:3001/api/liked-vendors';

export interface LikedVendorResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  liked_vendor_ids?: string[];
  is_liked?: boolean;
  already_liked?: boolean;
}

// Save like vendor API call
export const saveLikeVendor = async (customerId: number, vendorId: string): Promise<LikedVendorResponse> => {
  try {
    console.log(`🌐 API: Saving like for customer ${customerId}, vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/save-like`);
    
    const response = await fetch(`${API_BASE_URL}/save-like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        vendor_id: vendorId
      })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error saving like:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to save like`
      };
    }

    console.log('✅ API: Like saved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Remove like vendor API call
export const removeLikeVendor = async (customerId: number, vendorId: string): Promise<LikedVendorResponse> => {
  try {
    console.log(`API: Removing like for customer ${customerId}, vendor ${vendorId}`);
    
    const response = await fetch(`${API_BASE_URL}/remove-like`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        vendor_id: vendorId
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error removing like:', data);
      return {
        success: false,
        error: data.error || 'Failed to remove like'
      };
    }

    console.log('API: Like removed successfully:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Network error - please check your connection'
    };
  }
};

// Get all liked vendors API call
export const getLikedVendors = async (customerId: number): Promise<LikedVendorResponse> => {
  try {
    console.log(`API: Getting liked vendors for customer ${customerId}`);
    
    const response = await fetch(`${API_BASE_URL}/get-liked-vendors/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error getting liked vendors:', data);
      return {
        success: false,
        error: data.error || 'Failed to get liked vendors'
      };
    }

    console.log('API: Got liked vendors:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Network error - please check your connection'
    };
  }
};

// Check if vendor is liked API call
export const checkVendorLiked = async (customerId: number, vendorId: string): Promise<LikedVendorResponse> => {
  try {
    console.log(`API: Checking if customer ${customerId} likes vendor ${vendorId}`);
    
    const response = await fetch(`${API_BASE_URL}/check-like/${customerId}/${vendorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error checking like status:', data);
      return {
        success: false,
        error: data.error || 'Failed to check like status'
      };
    }

    console.log('API: Like status checked:', data);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: 'Network error - please check your connection'
    };
  }
};
