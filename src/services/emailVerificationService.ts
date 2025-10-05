import { supabase } from '@/lib/supabase';
import { sendVerificationEmail, resendVerificationEmail as apiResendVerificationEmail } from './smtpEmailService';

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  customer?: any;
  error?: any;
}

export interface VerificationTokenResult {
  success: boolean;
  message: string;
  customer?: any;
  error?: any;
}

// Generate a secure verification token (browser-compatible)
export const generateVerificationToken = (): string => {
  // Use crypto.getRandomValues for browser compatibility
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to hex string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Create verification token expiration (24 hours from now)
export const getTokenExpiration = (): Date => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
};

// Send verification email using the API service
export const sendVerificationEmailAPI = async (
  email: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Use the new API-based email service
    const result = await sendVerificationEmail(email, name, token);
    
    if (result.success) {
      console.log('✅ Verification email sent successfully to:', email);
      return { success: true };
    } else {
      console.error('❌ Failed to send verification email:', result.error);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};

// Create user with verification token
export const createUnverifiedUser = async (
  fullName: string,
  email: string,
  password: string,
  gender?: string,
  mobileNumber: string
): Promise<EmailVerificationResult> => {
  try {
    // Hash password using a simple approach (in production, use bcrypt or similar)
    const passwordHash = btoa(password); // Simple base64 encoding for demo - use proper hashing in production
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiration = getTokenExpiration();
    
    // Insert user with unverified status
    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          full_name: fullName,
          email: email,
          password_hash: passwordHash,
          gender: gender,
          mobile_number: mobileNumber,
          status: 'unverified',
          verification_token: verificationToken,
          verification_token_expires_at: tokenExpiration.toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return { 
        success: false, 
        message: 'Failed to create account',
        error 
      };
    }

    // Send verification email
    const emailResult = await sendVerificationEmailAPI(email, fullName, verificationToken);
    
    if (!emailResult.success) {
      // If email fails, we should still create the user but log the error
      console.error('Failed to send verification email:', emailResult.error);
      return {
        success: true,
        message: 'Account created but verification email failed to send. Please contact support.',
        customer: data
      };
    }

    return {
      success: true,
      message: 'Account created successfully. Please check your email for verification link.',
      customer: data
    };

  } catch (error) {
    console.error('Error creating unverified user:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
};

// Create verified user (for pre-verified emails)
export const createVerifiedUser = async (fullName: string, email: string, password: string, gender?: string, mobileNumber: string) => {
  try {
    const passwordHash = btoa(password); // Simple base64 encoding for demo - use proper hashing in production
    const verificationToken = generateVerificationToken();

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          full_name: fullName,
          email,
          password_hash: passwordHash,
          gender,
          mobile_number: mobileNumber,
          verification_token: verificationToken,
          status: 'verified', // Mark as verified since email is already verified
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return { 
        success: false, 
        message: 'Failed to create account',
        error 
      };
    }

    return {
      success: true,
      message: 'Account created and verified successfully!',
      customer: data
    };

  } catch (error) {
    console.error('Error creating verified user:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
};

// Verify email with token
export const verifyEmailWithToken = async (token: string): Promise<VerificationTokenResult> => {
  try {
    // Find user by verification token
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: 'Invalid or expired verification token'
      };
    }

    // Check if token is expired
    const now = new Date();
    const tokenExpiration = new Date(data.verification_token_expires_at);
    
    if (now > tokenExpiration) {
      return {
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      };
    }

    // Check if already verified
    if (data.status === 'verified') {
      return {
        success: true,
        message: 'Email is already verified',
        customer: data
      };
    }

    // Update user status to verified and clear token
    const { data: updatedData, error: updateError } = await supabase
      .from('customers')
      .update({
        status: 'verified',
        verification_token: null,
        verification_token_expires_at: null
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        message: 'Failed to verify email',
        error: updateError
      };
    }

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
      customer: updatedData
    };

  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during verification',
      error
    };
  }
};

// Resend verification email using the backend API
export const resendVerificationEmail = async (email: string): Promise<EmailVerificationResult> => {
  try {
    // Use the new API-based resend function
    const result = await apiResendVerificationEmail(email);
    
    if (result.success) {
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send verification email'
      };
    }
    
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error
    };
  }
};
