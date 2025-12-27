import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const EmailChangeVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmailChange, customer } = useCustomerAuth();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  const rawToken = searchParams.get('token');
  const token = rawToken ? decodeURIComponent(rawToken) : null;

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    if (!customer) {
      setVerificationStatus('error');
      setMessage('Please log in to verify your email change.');
      return;
    }

    verifyEmailChangeToken();
  }, [token, customer]);

  const verifyEmailChangeToken = async () => {
    if (!token || !customer) return;

    try {
      const result = await verifyEmailChange(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.message);
        
        // Redirect to profile page after 3 seconds
        setTimeout(() => {
          navigate('/customer-profile');
        }, 3000);
      } else {
        if (result.message.includes('expired')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
        setMessage(result.message);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.message || 'An unexpected error occurred during verification.');
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
        return 'bg-green-50 border-green-200';
      case 'error':
      case 'expired':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <CardTitle className="text-2xl">
                {verificationStatus === 'loading' && 'Verifying Email Change...'}
                {verificationStatus === 'success' && 'Email Changed Successfully!'}
                {verificationStatus === 'error' && 'Verification Failed'}
                {verificationStatus === 'expired' && 'Verification Expired'}
              </CardTitle>
              <CardDescription className="mt-2">
                {verificationStatus === 'loading' && 'Please wait while we verify your email change.'}
                {verificationStatus === 'success' && 'Your email address has been successfully updated.'}
                {verificationStatus === 'error' && 'We encountered an issue verifying your email change.'}
                {verificationStatus === 'expired' && 'The verification link has expired.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Alert className={getStatusColor()}>
                <AlertDescription className="text-center">
                  {message}
                </AlertDescription>
              </Alert>

              {verificationStatus === 'success' && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Redirecting to your profile page...
                  </p>
                </div>
              )}

              {verificationStatus !== 'loading' && (
                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer-profile')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                  </Button>
                  {verificationStatus === 'error' && (
                    <Button
                      onClick={() => navigate('/customer-profile')}
                      className="bg-gradient-to-r from-wedding-navy to-wedding-orange"
                    >
                      Go to Profile
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EmailChangeVerification;


