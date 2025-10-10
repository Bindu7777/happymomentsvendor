// API service for coupons management

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api/coupons'
  : 'http://localhost:3001/api/coupons';

export interface Coupon {
  coupon_id: number;
  coupon_code: string;
  discount_percentage: number;
  description: string;
  status: 'active' | 'inactive' | 'used' | 'expired';
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CouponResponse {
  success: boolean;
  data?: Coupon | Coupon[];
  error?: string;
  message?: string;
}

export interface CouponStats {
  total: number;
  active: number;
  used: number;
  inactive: number;
  expired: number;
  totalUsage: number;
  maxDiscount: number;
  avgDiscount: number;
}

// Get all active coupons
export const getActiveCoupons = async (): Promise<CouponResponse> => {
  try {
    console.log(`🌐 API: Fetching active coupons`);
    console.log(`🔗 API URL: ${API_BASE_URL}/active`);
    
    const response = await fetch(`${API_BASE_URL}/active`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error fetching active coupons:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to fetch active coupons`
      };
    }

    console.log('✅ API: Active coupons retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get a random active coupon
export const getRandomCoupon = async (): Promise<CouponResponse> => {
  try {
    console.log(`🌐 API: Fetching random coupon`);
    console.log(`🔗 API URL: ${API_BASE_URL}/random`);
    
    const response = await fetch(`${API_BASE_URL}/random`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error fetching random coupon:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to fetch random coupon`
      };
    }

    console.log('✅ API: Random coupon retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get coupon by code
export const getCouponByCode = async (couponCode: string): Promise<CouponResponse> => {
  try {
    console.log(`🌐 API: Fetching coupon by code: ${couponCode}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/code/${couponCode}`);
    
    const response = await fetch(`${API_BASE_URL}/code/${couponCode}`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error fetching coupon by code:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to fetch coupon`
      };
    }

    console.log('✅ API: Coupon retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Use a coupon (increment usage count)
export const useCoupon = async (couponCode: string): Promise<CouponResponse> => {
  try {
    console.log(`🌐 API: Using coupon: ${couponCode}`);
    console.log(`🔗 API URL: ${API_BASE_URL}/use/${couponCode}`);
    
    const response = await fetch(`${API_BASE_URL}/use/${couponCode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error using coupon:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to use coupon`
      };
    }

    console.log('✅ API: Coupon used successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};

// Get coupon statistics
export const getCouponStats = async (): Promise<{ success: boolean; data?: CouponStats; error?: string }> => {
  try {
    console.log(`🌐 API: Fetching coupon statistics`);
    console.log(`🔗 API URL: ${API_BASE_URL}/stats`);
    
    const response = await fetch(`${API_BASE_URL}/stats`);

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`📦 Response data:`, data);
    
    if (!response.ok) {
      console.error('❌ API Error fetching coupon stats:', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to fetch coupon statistics`
      };
    }

    console.log('✅ API: Coupon statistics retrieved successfully:', data);
    return data;
  } catch (error) {
    console.error('💥 API Error:', error);
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
};
