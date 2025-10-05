import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createUnverifiedUser, createVerifiedUser, verifyEmailWithToken, resendVerificationEmail } from '@/services/emailVerificationService';

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  gender?: string;
  mobile_number: string;
  status: 'unverified' | 'verified';
  verification_token?: string;
  verification_token_expires_at?: string;
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSearchFilter {
  id: string;
  customer_id: string;
  filter_data: any;
  filter_name: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSearchHistory {
  id: string;
  customer_id: string;
  search_type: 'voice' | 'manual' | 'smart_request';
  search_query?: string;
  search_filters: any;
  search_results_count: number;
  created_at: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  loading: boolean;
  signUp: (fullName: string, email: string, password: string, gender?: string, mobileNumber: string, isEmailPreVerified?: boolean) => Promise<{ customer: Customer | null; error: any; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ customer: Customer | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string; customer?: Customer }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  saveSearchFilter: (filterData: any, filterName?: string) => Promise<{ filter: CustomerSearchFilter | null; error: any }>;
  getSearchFilters: () => Promise<{ filters: CustomerSearchFilter[]; error: any }>;
  updateSearchFilter: (filterId: string, filterData: any, filterName?: string) => Promise<{ filter: CustomerSearchFilter | null; error: any }>;
  deleteSearchFilter: (filterId: string) => Promise<{ error: any }>;
  saveSearchHistory: (searchType: 'voice' | 'manual' | 'smart_request', searchQuery?: string, searchFilters?: any, resultsCount?: number) => Promise<{ history: CustomerSearchHistory | null; error: any }>;
  getSearchHistory: (limit?: number) => Promise<{ history: CustomerSearchHistory[]; error: any }>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

interface CustomerAuthProviderProps {
  children: React.ReactNode;
}

export const CustomerAuthProvider: React.FC<CustomerAuthProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if customer is logged in
    const checkCustomerSession = async () => {
      try {
        const customerId = localStorage.getItem('customer_id');
        if (customerId) {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('id', customerId)
            .single();
          
          if (data && !error) {
            setCustomer(data);
          } else {
            localStorage.removeItem('customer_id');
            setCustomer(null);
          }
        }
      } catch (error) {
        console.error('Error checking customer session:', error);
        localStorage.removeItem('customer_id');
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    checkCustomerSession();
  }, []);

  const signUp = async (fullName: string, email: string, password: string, gender?: string, mobileNumber: string, isEmailPreVerified: boolean = false) => {
    try {
      let result;
      
      if (isEmailPreVerified) {
        // Create verified user directly since email is already verified
        result = await createVerifiedUser(fullName, email, password, gender, mobileNumber);
      } else {
        // Use the email verification service to create unverified user
        result = await createUnverifiedUser(fullName, email, password, gender, mobileNumber);
      }
      
      if (result.success) {
        if (isEmailPreVerified) {
          // Auto-login the user since email is already verified
          localStorage.setItem('customer_id', result.customer.id);
          setCustomer(result.customer);
          return { 
            customer: result.customer, 
            error: null, 
            message: 'Account created and verified successfully!'
          };
        } else {
          // Don't automatically log in the user - they need to verify email first
          return { 
            customer: null, 
            error: null, 
            message: result.message 
          };
        }
      } else {
        return { 
          customer: null, 
          error: result.error || new Error(result.message),
          message: result.message 
        };
      }
    } catch (error) {
      return { 
        customer: null, 
        error,
        message: 'An unexpected error occurred during signup'
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const passwordHash = btoa(password); // Simple base64 encoding for demo - use proper hashing in production
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .single();

      if (error || !data) {
        return { customer: null, error: error || new Error('Invalid credentials') };
      }

      // Check if email is verified
      if (data.status !== 'verified') {
        return { 
          customer: null, 
          error: new Error('Please verify your email address before logging in. Check your inbox for the verification link.') 
        };
      }

      // Update login time and increment login count
      const { data: updatedData, error: updateError } = await supabase
        .from('customers')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (data.login_count || 0) + 1
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating login time:', updateError);
        // Continue with login even if update fails
      }

      // Store customer ID in localStorage for session management
      localStorage.setItem('customer_id', data.id);
      setCustomer(updatedData || data);
      
      return { customer: updatedData || data, error: null };
    } catch (error) {
      return { customer: null, error };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('customer_id');
      setCustomer(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const saveSearchFilter = async (filterData: any, filterName: string = 'Saved Filter') => {
    if (!customer) {
      return { filter: null, error: new Error('Customer not logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('customer_search_filters')
        .insert([
          {
            customer_id: customer.id,
            filter_data: filterData,
            filter_name: filterName
          }
        ])
        .select()
        .single();

      if (error) {
        return { filter: null, error };
      }

      return { filter: data, error: null };
    } catch (error) {
      return { filter: null, error };
    }
  };

  const getSearchFilters = async () => {
    if (!customer) {
      return { filters: [], error: new Error('Customer not logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('customer_search_filters')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { filters: [], error };
      }

      return { filters: data || [], error: null };
    } catch (error) {
      return { filters: [], error };
    }
  };

  const updateSearchFilter = async (filterId: string, filterData: any, filterName?: string) => {
    if (!customer) {
      return { filter: null, error: new Error('Customer not logged in') };
    }

    try {
      const updateData: any = { filter_data: filterData };
      if (filterName) {
        updateData.filter_name = filterName;
      }

      const { data, error } = await supabase
        .from('customer_search_filters')
        .update(updateData)
        .eq('id', filterId)
        .eq('customer_id', customer.id)
        .select()
        .single();

      if (error) {
        return { filter: null, error };
      }

      return { filter: data, error: null };
    } catch (error) {
      return { filter: null, error };
    }
  };

  const deleteSearchFilter = async (filterId: string) => {
    if (!customer) {
      return { error: new Error('Customer not logged in') };
    }

    try {
      const { error } = await supabase
        .from('customer_search_filters')
        .delete()
        .eq('id', filterId)
        .eq('customer_id', customer.id);

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const saveSearchHistory = async (
    searchType: 'voice' | 'manual' | 'smart_request',
    searchQuery?: string,
    searchFilters?: any,
    resultsCount?: number
  ) => {
    if (!customer) {
      return { history: null, error: new Error('Customer not logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('customer_search_history')
        .insert([
          {
            customer_id: customer.id,
            search_type: searchType,
            search_query: searchQuery,
            search_filters: searchFilters || {},
            search_results_count: resultsCount || 0
          }
        ])
        .select()
        .single();

      if (error) {
        return { history: null, error };
      }

      return { history: data, error: null };
    } catch (error) {
      return { history: null, error };
    }
  };

  const getSearchHistory = async (limit: number = 20) => {
    if (!customer) {
      return { history: [], error: new Error('Customer not logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('customer_search_history')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { history: [], error };
      }

      return { history: data || [], error: null };
    } catch (error) {
      return { history: [], error };
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const result = await verifyEmailWithToken(token);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred during verification'
      };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const result = await resendVerificationEmail(email);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred while resending verification email'
      };
    }
  };

  const value: CustomerAuthContextType = {
    customer,
    loading,
    signUp,
    signIn,
    signOut,
    verifyEmail,
    resendVerificationEmail,
    saveSearchFilter,
    getSearchFilters,
    updateSearchFilter,
    deleteSearchFilter,
    saveSearchHistory,
    getSearchHistory,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
