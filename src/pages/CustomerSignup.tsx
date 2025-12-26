import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, Mail, Camera, Cake, Flower2, Gift, Music, ArrowLeft } from 'lucide-react';

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
  
  // Current step (1 or 2)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  
  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  // Check if user is coming back from email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    
    if (verified === 'true' && email && token) {
      // Set the email from URL
      setFormData(prev => ({
        ...prev,
        email: email
      }));
      
      // Verify the token with the backend (which will return the name)
      verifyPreSignupToken(email, token);
    }
  }, []);

  // Move to step 2 when email is verified
  useEffect(() => {
    if (emailVerificationStatus === 'verified') {
      setCurrentStep(2);
    }
  }, [emailVerificationStatus]);
  
  // Validate password requirements dynamically
  useEffect(() => {
    if (formData.password) {
      setPasswordRequirements({
        minLength: formData.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
      });
    } else {
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
      });
    }
  }, [formData.password]);

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
        // Populate the form with the name returned from backend (the name that was sent in the email)
        if (result.name) {
          setFormData(prev => ({
            ...prev,
            fullName: result.name,
            email: email
          }));
        }
        
        setEmailVerificationStatus('verified');
        setEmailVerificationMessage('Email verified successfully! You can now create your account.');
        setCurrentStep(2);
        
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

    // Step 2 validations only if we're on step 2 or submitting
    if (currentStep === 2 || emailVerificationStatus === 'verified') {
      // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      } else {
        // Check password requirements
        if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          newErrors.password = 'Password must contain at least one number';
        }
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
    
    // Clear confirm password error when password changes
    if (field === 'password' && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    
    // Reset email verification status when email changes
    if (field === 'email' && emailVerificationStatus !== 'unverified') {
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('');
      setCurrentStep(1);
    }
  };
  
  // Check if form is valid for button enablement
  const isFormValid = () => {
    if (currentStep !== 2) return false;
    if (emailVerificationStatus !== 'verified') return false;
    
    // Check full name (should be filled in step 1)
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) return false;
    
    // Check email
    if (!formData.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) return false;
    
    // Check mobile number
    if (!formData.mobileNumber.trim() || !/^[0-9]{10}$/.test(formData.mobileNumber)) return false;
    
    // Check password requirements
    if (!formData.password || 
        formData.password.length < 8 || 
        !/[A-Z]/.test(formData.password) || 
        !/[a-z]/.test(formData.password) || 
        !/[0-9]/.test(formData.password)) return false;
    
    // Check confirm password
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) return false;
    
    return true;
  };

  const handleVerifyEmail = async () => {
    // Validate full name and email before sending verification
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
          setTimeout(() => {
            navigate('/?accountCreated=true');
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
          setCurrentStep(1);
          
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden customer-signup-bg">
      {/* Back Arrow - Mobile Only */}
      <button
        onClick={() => navigate('/')}
        className="md:hidden absolute top-4 left-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Base background - soft gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #FFF8F2 0%, #FFFFFF 50%, #FDF3E7 100%)' }}></div>
        
        {/* Orange decorative blobs - positioned around edges, not behind form */}
        <div className="absolute -top-32 -left-32 w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] bg-[#F7941D] rounded-full blur-3xl blob-animation blob-1" style={{ opacity: 0.08 }}></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] bg-[#F7941D] rounded-full blur-3xl blob-animation blob-2" style={{ opacity: 0.1 }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-[#F7941D] rounded-full blur-3xl blob-animation blob-3" style={{ opacity: 0.07, transform: 'translate(30%, -30%)' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-[#F7941D] rounded-full blur-3xl blob-animation blob-4" style={{ opacity: 0.06, transform: 'translate(-30%, 30%)' }}></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 md:w-64 md:h-64 bg-[#F7941D] rounded-full blur-3xl blob-animation blob-5" style={{ opacity: 0.06 }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 md:w-72 md:h-72 bg-[#F7941D] rounded-full blur-3xl blob-animation blob-6" style={{ opacity: 0.08 }}></div>
        
        {/* Navy wave lines */}
        <svg className="absolute left-0 top-1/4 w-full h-auto wave-animation wave-1 hidden md:block" style={{ transform: 'translateY(-50%)', opacity: 0.05 }} viewBox="0 0 200 50" preserveAspectRatio="none">
          <path d="M0,25 Q50,10 100,25 T200,25" stroke="#001B5E" strokeWidth="2" fill="none" />
        </svg>
        <svg className="absolute right-0 bottom-1/4 w-full h-auto wave-animation wave-2 hidden md:block" style={{ transform: 'translateY(50%)', opacity: 0.05 }} viewBox="0 0 200 50" preserveAspectRatio="none">
          <path d="M0,25 Q50,40 100,25 T200,25" stroke="#001B5E" strokeWidth="2" fill="none" />
        </svg>
        
        {/* Event icons - hidden on mobile, visible on larger screens */}
        <Camera className="absolute top-20 left-10 w-12 h-12 md:w-16 md:h-16 text-[#F7941D] icon-animation icon-1 hidden md:block" strokeWidth={1.5} style={{ opacity: 0.05 }} />
        <Cake className="absolute top-32 right-16 w-10 h-10 md:w-14 md:h-14 text-[#F7941D] icon-animation icon-2 hidden lg:block" strokeWidth={1.5} style={{ opacity: 0.06 }} />
        <Flower2 className="absolute bottom-24 left-20 w-10 h-10 md:w-12 md:h-12 text-[#001B5E] icon-animation icon-3 hidden md:block" strokeWidth={1.5} style={{ opacity: 0.04 }} />
        <Gift className="absolute bottom-40 right-12 w-12 h-12 md:w-16 md:h-16 text-[#F7941D] icon-animation icon-4 hidden lg:block" strokeWidth={1.5} style={{ opacity: 0.05 }} />
        <Music className="absolute top-1/2 right-8 w-10 h-10 md:w-14 md:h-14 text-[#001B5E] icon-animation icon-5 hidden md:block" strokeWidth={1.5} style={{ opacity: 0.04 }} />
        
        {/* Confetti dots */}
        <div className="absolute top-16 right-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F7941D] rounded-full confetti-animation confetti-1" style={{ opacity: 0.2 }}></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 md:w-1.5 md:h-1.5 bg-[#001B5E] rounded-full confetti-animation confetti-2" style={{ opacity: 0.15 }}></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-[#F7941D] rounded-full confetti-animation confetti-3" style={{ opacity: 0.25 }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 md:w-1.5 md:h-1.5 bg-[#001B5E] rounded-full confetti-animation confetti-4" style={{ opacity: 0.2 }}></div>
        <div className="absolute top-1/4 right-16 w-1 h-1 bg-[#F7941D] rounded-full confetti-animation confetti-5 hidden md:block" style={{ opacity: 0.15 }}></div>
        <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-[#001B5E] rounded-full confetti-animation confetti-6 hidden md:block" style={{ opacity: 0.18 }}></div>
      </div>
      
      {/* Content - Card with fade-in and slide-up animation */}
      <Card className="w-full max-w-md relative z-10 signup-card-animate">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Customer Account</CardTitle>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Basic Details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Contact & Security</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant={errors.general.includes('successfully') ? 'default' : 'destructive'}>
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Basic Details */}
            <div className={`space-y-4 ${currentStep === 2 ? 'opacity-60' : ''}`}>
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
                  readOnly={currentStep === 2}
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
                      disabled={!formData.fullName.trim() || formData.fullName.trim().length < 2 || !formData.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email) || emailVerificationStatus === 'sending' || emailVerificationStatus === 'sent' || currentStep === 2}
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
            </div>

            {/* Step 2: Contact & Security - Only shown after email verification */}
            {currentStep === 2 && (
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
                  <p className="text-xs text-gray-500">Enter your 10-digit mobile number</p>
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
                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="text-xs space-y-1 mt-2">
                      <div className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.minLength ? '' : 'opacity-30'}`} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasUpperCase ? '' : 'opacity-30'}`} />
                        <span>One uppercase letter</span>
                      </div>
                      <div className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasLowerCase ? '' : 'opacity-30'}`} />
                        <span>One lowercase letter</span>
                      </div>
                      <div className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasNumber ? '' : 'opacity-30'}`} />
                        <span>One number</span>
                      </div>
                    </div>
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
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading || !isFormValid()}
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
              </div>
            )}
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
