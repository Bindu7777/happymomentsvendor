import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react';

const CustomerSignup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useCustomerAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    mobileNumber: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Email verification status
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'unverified' | 'sending' | 'sent' | 'verified'>('unverified');
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('');

  // Check if user is coming back from email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    
    if (verified === 'true' && email && token) {
      // Set the email in the form if it's not already set
      setFormData(prev => {
        if (!prev.email) {
          return { ...prev, email };
        }
        return prev;
      });
      
      // Verify the token with the backend
      verifyPreSignupToken(email, token);
    }
  }, []); // Keep empty dependency array since we only want this to run once on mount

  const verifyPreSignupToken = async (email: string, token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/email/verify-pre-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmailVerificationStatus('verified');
        setEmailVerificationMessage('Email verified successfully! You can now create your account.');
        
        // Clear URL parameters after successful verification
        const url = new URL(window.location.href);
        url.searchParams.delete('verified');
        url.searchParams.delete('email');
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      } else {
        setEmailVerificationStatus('unverified');
        setEmailVerificationMessage(result.message || 'Email verification failed.');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('Email verification failed. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (emailVerificationStatus !== 'verified') {
      newErrors.email = 'Please verify your email address before creating account';
    }

    // Password validation - No restrictions, just required
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Mobile Number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Reset email verification status when email changes
    if (field === 'email' && emailVerificationStatus !== 'unverified') {
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('');
    }
  };

  const handleVerifyEmail = async () => {
    if (!formData.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email address first' });
      return;
    }

    setEmailVerificationStatus('sending');
    setEmailVerificationMessage('');

    try {
      // Send pre-signup verification email using the backend API
      const response = await fetch('http://localhost:3001/api/email/pre-signup-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.fullName.trim() || formData.email.split('@')[0] || 'User'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setEmailVerificationStatus('sent');
        setEmailVerificationMessage('Verification email sent! Please check your inbox and click the verification link.');
      } else {
        setEmailVerificationStatus('unverified');
        setEmailVerificationMessage(result.message || 'Failed to send verification email');
        
        // Show specific error messages for common issues
        if (result.error === 'Account already exists') {
          setEmailVerificationMessage('An account with this email already exists. Please use a different email or try logging in.');
        }
      }
    } catch (error) {
      console.error('Send verification email error:', error);
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('Network error. Please check your internet connection and try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { customer, error, message } = await signUp(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.gender || undefined,
        formData.mobileNumber.trim(),
        emailVerificationStatus === 'verified'
      );

      if (error) {
        if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          setErrors({ email: 'An account with this email already exists' });
        } else {
          setErrors({ general: error.message || 'An error occurred during signup' });
        }
      } else {
        if (customer) {
          // Account created and verified successfully - redirect to homepage
          setErrors({ 
            general: 'Account created and verified successfully! Redirecting to homepage...' 
          });
          
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // Account created but needs email verification
          setErrors({ 
            general: 'Account created successfully! Please check your email for the verification link to complete your registration.' 
          });
          
          // Clear form after successful signup
          setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            gender: '',
            mobileNumber: ''
          });
          
          // Reset email verification status
          setEmailVerificationStatus('unverified');
          setEmailVerificationMessage('');
          
          // Redirect to email verification page
          setTimeout(() => {
            navigate('/verify-email');
          }, 3000);
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Customer Account</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Sign up to save your preferences and get personalized recommendations.
          </CardDescription>
          <div className="text-center">
            <span className="text-sm text-red-600 font-medium">Email verification required before login.</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant={errors.general.includes('successfully') ? 'default' : 'destructive'}>
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              
              {/* Email Verification Button and Status */}
              <div className="mt-2">
                {emailVerificationStatus === 'verified' ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    ✔ Verified
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={!formData.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email) || emailVerificationStatus === 'sending' || emailVerificationStatus === 'sent'}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {emailVerificationStatus === 'sending' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : emailVerificationStatus === 'sent' ? (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Verification Email Sent
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Verify Email
                      </>
                    )}
                  </Button>
                )}
                
                {/* Verification Message */}
                {emailVerificationMessage && (
                  <p className={`text-sm mt-2 ${
                    emailVerificationStatus === 'sent' || emailVerificationStatus === 'verified' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {emailVerificationMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                placeholder="Enter your 10-digit mobile number"
                maxLength={10}
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
              disabled={loading || emailVerificationStatus !== 'verified' || !formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword || !formData.mobileNumber.trim() || formData.password !== formData.confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/customer-login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSignup;
