import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail } = useCustomerAuth();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [email, setEmail] = useState('');

  const rawToken = searchParams.get('token');
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    if (!token) return;

    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.message);
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/customer-login');
        }, 3000);
      } else {
        if (result.message.includes('expired')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
        setMessage(result.message);
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('An unexpected error occurred during verification.');
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setResendMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const result = await resendVerificationEmail(email);
      
      if (result.success) {
        setResendMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setResendMessage(result.message);
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Mail className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            {verificationStatus === 'loading' && 'Verifying your email address...'}
            {verificationStatus === 'success' && 'Email verified successfully!'}
            {verificationStatus === 'error' && 'Verification failed'}
            {verificationStatus === 'expired' && 'Verification link expired'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className={`text-center ${getStatusColor()}`}>
            <p className="text-sm">{message}</p>
          </div>

          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You will be redirected to the login page in a few seconds...
              </p>
              <Button 
                onClick={() => navigate('/customer-login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}

          {(verificationStatus === 'error' || verificationStatus === 'expired') && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  You can request a new verification email or go back to sign up.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                {resendMessage && (
                  <Alert variant={resendMessage.includes('successfully') ? 'default' : 'destructive'}>
                    <AlertDescription>{resendMessage}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/customer-signup')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign Up
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/customer-login')}
                  className="flex-1"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          {verificationStatus === 'loading' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
