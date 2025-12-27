import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createUnverifiedUser, createVerifiedUser, verifyEmailWithToken, resendVerificationEmail as resendVerificationEmailService, generateVerificationToken } from '@/services/emailVerificationService';

export interface Customer {
  id: number;  // Changed from string to number for auto-increment integer
  full_name: string;
  email: string;
  password_hash: string;  // Required for authentication
  gender?: string;
  mobile_number: string;
  secondary_phone_number?: string;
  location?: string;
  status: 'unverified' | 'verified';
  verification_token?: string;
  verification_token_expires_at?: string;
  new_email?: string;
  email_change_token?: string;
  email_change_token_expires_at?: string;
  last_login_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerSearchFilter {
  id: number;  // Changed from string to number for auto-increment integer
  customer_id: string;
  filter_data: any;
  filter_name: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSearchHistory {
  id: number;  // Changed from string to number for auto-increment integer
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
  updateProfile: (updates: { full_name?: string; mobile_number?: string; secondary_phone_number?: string; location?: string; email?: string }) => Promise<{ customer: Customer | null; error: any; message?: string; requiresVerification?: boolean }>;
  verifyEmailChange: (token: string) => Promise<{ success: boolean; message: string; customer?: Customer }>;
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
      const result = await resendVerificationEmailService(email);
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred while resending verification email'
      };
    }
  };

  const updateProfile = async (updates: { full_name?: string; mobile_number?: string; secondary_phone_number?: string; location?: string; email?: string }) => {
    if (!customer) {
      return { customer: null, error: new Error('Customer not logged in'), message: 'Please log in to update your profile' };
    }

    try {
      const updateData: any = {};
      let requiresEmailVerification = false;
      let emailChangeToken: string | null = null;

      // Handle email change - requires verification
      if (updates.email && updates.email !== customer.email) {
        // Check if email is already taken
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', updates.email)
          .neq('id', customer.id)
          .single();

        if (existingCustomer) {
          return { 
            customer: null, 
            error: new Error('Email already in use'), 
            message: 'This email address is already registered to another account' 
          };
        }

        // Generate email change token
        const token = generateVerificationToken();
        const tokenExpiration = new Date();
        tokenExpiration.setHours(tokenExpiration.getHours() + 24);

        updateData.new_email = updates.email;
        updateData.email_change_token = token;
        updateData.email_change_token_expires_at = tokenExpiration.toISOString();
        emailChangeToken = token;
        requiresEmailVerification = true;
      }

      // Handle other fields
      if (updates.full_name) updateData.full_name = updates.full_name;
      if (updates.mobile_number) updateData.mobile_number = updates.mobile_number;
      if (updates.secondary_phone_number !== undefined) updateData.secondary_phone_number = updates.secondary_phone_number || null;
      if (updates.location !== undefined) updateData.location = updates.location || null;

      // Update the customer record
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customer.id)
        .select()
        .single();

      if (error) {
        return { customer: null, error, message: 'Failed to update profile' };
      }

      // If email change, send verification email
      if (requiresEmailVerification && emailChangeToken && updates.email) {
        const { sendVerificationEmail } = await import('@/services/smtpEmailService');
        const baseUrl = window.location.origin;
        
        // Send verification email with the token
        await sendVerificationEmail(
          updates.email,
          data.full_name,
          emailChangeToken,
          `${baseUrl}/verify-email-change`
        );
      }

      // Update local state
      setCustomer(data);

      return { 
        customer: data, 
        error: null, 
        message: requiresEmailVerification 
          ? 'Profile updated. Please check your new email for verification link.' 
          : 'Profile updated successfully',
        requiresVerification: requiresEmailVerification
      };
    } catch (error) {
      return { customer: null, error, message: 'An unexpected error occurred' };
    }
  };

  const verifyEmailChange = async (token: string) => {
    if (!customer) {
      return { success: false, message: 'Customer not logged in' };
    }

    try {
      // Find customer by email change token
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email_change_token', token)
        .eq('id', customer.id)
        .single();

      if (error || !data) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      // Check if token is expired
      if (data.email_change_token_expires_at) {
        const now = new Date();
        const tokenExpiration = new Date(data.email_change_token_expires_at);
        
        if (now > tokenExpiration) {
          return { success: false, message: 'Verification token has expired. Please request a new email change.' };
        }
      }

      // Check if new_email exists
      if (!data.new_email) {
        return { success: false, message: 'No pending email change found' };
      }

      // Check if new email is already taken
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.new_email)
        .neq('id', customer.id)
        .single();

      if (existingCustomer) {
        // Clear the pending email change
        await supabase
          .from('customers')
          .update({
            new_email: null,
            email_change_token: null,
            email_change_token_expires_at: null
          })
          .eq('id', customer.id);

        return { success: false, message: 'This email address is already registered to another account' };
      }

      // Update email and clear verification fields
      const { data: updatedData, error: updateError } = await supabase
        .from('customers')
        .update({
          email: data.new_email,
          new_email: null,
          email_change_token: null,
          email_change_token_expires_at: null
        })
        .eq('id', customer.id)
        .select()
        .single();

      if (updateError) {
        return { success: false, message: 'Failed to update email', error: updateError };
      }

      // Update local state
      setCustomer(updatedData);

      return { 
        success: true, 
        message: 'Email updated successfully!', 
        customer: updatedData 
      };
    } catch (error) {
      console.error('Error verifying email change:', error);
      return { success: false, message: 'An unexpected error occurred during verification' };
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
    updateProfile,
    verifyEmailChange,
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
