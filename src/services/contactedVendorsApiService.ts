// API service for contacted vendors using backend endpoints
const API_BASE_URL = 'http://localhost:3001/api/contacted-vendors';

export interface ContactedVendorResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  contacted_vendor_ids?: string[];
  is_contacted?: boolean;
  already_contacted?: boolean;
}

export interface ContactedVendor {
  contact_id: number;
  customer_id: number;
  vendor_id: string;
  status: string;
  contacted_at: string;
  created_at: string;
  // Additional vendor details when fetched
  brand_name?: string;
  category?: string;
  subcategory?: string;
  phone_number?: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  starting_price?: number;
  rating?: number;
  review_count?: number;
  verified?: boolean;
  avatar_url?: string;
  cover_image_url?: string;
  quick_intro?: string;
  spoc_name?: string;
  // Flag information
  flag_count?: number;
  is_blocked?: boolean;
  is_flagged_by_vendor?: boolean;
}

export interface FlagCustomerResponse {
  success: boolean;
  message?: string;
  data?: {
    flag_id?: number;
    customer_id: number;
    vendor_id: string;
    flag_count: number;
    is_blocked: boolean;
  };
  error?: string;
}

// Save contact vendor API call
export const saveContactVendor = async (customerId: number, vendorId: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Saving contact for customer ${customerId}, vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/save-contact`);
    
    const response = await fetch(`${API_BASE_URL}/save-contact`, {
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
      console.error('❌ API Error saving contact:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to save contact`
      };
    }

    console.log('✅ API: Contact saved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get contacted vendors API call
export const getContactedVendors = async (customerId: number): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Getting contacted vendors for customer ${customerId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/get-contacted-vendors/${customerId}`);
    
    const response = await fetch(`${API_BASE_URL}/get-contacted-vendors/${customerId}`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error getting contacted vendors:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to get contacted vendors`
      };
    }

    console.log('✅ API: Got contacted vendors:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Check if vendor is contacted API call
export const checkVendorContacted = async (customerId: number, vendorId: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Checking if customer ${customerId} has contacted vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/check-contact/${customerId}/${vendorId}`);
    
    const response = await fetch(`${API_BASE_URL}/check-contact/${customerId}/${vendorId}`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error checking contact:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to check contact`
      };
    }

    console.log('✅ API: Contact status checked:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Remove contact vendor API call
export const removeContactVendor = async (customerId: number, vendorId: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Removing contact for customer ${customerId}, vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/remove-contact`);
    
    const response = await fetch(`${API_BASE_URL}/remove-contact`, {
      method: 'DELETE',
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
      console.error('❌ API Error removing contact:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to remove contact`
      };
    }

    console.log('✅ API: Contact removed successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Update vendor status API call
export const updateVendorStatus = async (customerId: number, vendorId: string, status: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Updating status for customer ${customerId}, vendor ${vendorId}, status: ${status}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/update-status`);
    
    const response = await fetch(`${API_BASE_URL}/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        vendor_id: vendorId,
        status
      })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error updating status:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to update status`
      };
    }

    console.log('✅ API: Status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get status options API call
export const getStatusOptions = async (): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Getting status options`);
    console.log(`🔗 API URL: ${API_BASE_URL}/status-options`);
    
    const response = await fetch(`${API_BASE_URL}/status-options`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error getting status options:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to get status options`
      };
    }

    console.log('✅ API: Status options retrieved:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get customers who contacted a specific vendor
export const getVendorCustomers = async (vendorId: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Getting customers who contacted vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/get-vendor-customers/${vendorId}`);
    
    const response = await fetch(`${API_BASE_URL}/get-vendor-customers/${vendorId}`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error getting vendor customers:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to get vendor customers`
      };
    }

    console.log('✅ API: Got vendor customers:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Update vendor status for a contacted customer
export const updateVendorStatusForContact = async (contactId: string, vendorStatus: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Updating vendor status for contact ${contactId} to ${vendorStatus}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/update-vendor-status/${contactId}`);
    
    const response = await fetch(`${API_BASE_URL}/update-vendor-status/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendor_status: vendorStatus })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error updating vendor status:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to update vendor status`
      };
    }

    console.log('✅ API: Vendor status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Update notes for a contact
export const updateNotesForContact = async (contactId: string, notes: string): Promise<ContactedVendorResponse> => {
  try {
    console.log(`🌐 API: Updating notes for contact ${contactId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/update-notes/${contactId}`);
    
    const response = await fetch(`${API_BASE_URL}/update-notes/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error updating notes:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to update notes`
      };
    }

    console.log('✅ API: Notes updated successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Flag a customer (vendor flags a customer)
export const flagCustomer = async (vendorId: string, customerId: number, reason?: string): Promise<FlagCustomerResponse> => {
  try {
    console.log(`🌐 API: Flagging customer ${customerId} by vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/flag-customer`);
    
    const response = await fetch(`${API_BASE_URL}/flag-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        customer_id: customerId,
        reason: reason || null
      })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error flagging customer:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to flag customer`
      };
    }

    console.log('✅ API: Customer flagged successfully:', data);
    return data;
  } catch (error: any) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Unflag a customer (vendor removes their flag)
export const unflagCustomer = async (vendorId: string, customerId: number): Promise<FlagCustomerResponse> => {
  try {
    console.log(`🌐 API: Unflagging customer ${customerId} by vendor ${vendorId}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/unflag-customer`);
    
    const response = await fetch(`${API_BASE_URL}/unflag-customer`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: vendorId,
        customer_id: customerId
      })
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error unflagging customer:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to unflag customer`
      };
    }

    console.log('✅ API: Customer unflagged successfully:', data);
    return data;
  } catch (error: any) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Legacy function names for backward compatibility
export const saveContact = saveContactVendor;
export const removeContact = removeContactVendor;
