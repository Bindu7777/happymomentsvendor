import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { getLoggedInVendor } from '../services/supabaseService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Lock, ArrowRight } from 'lucide-react';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthRequired: React.FC<AuthRequiredProps> = ({ children, fallback }) => {
  const { customer } = useCustomerAuth();
  const loggedInVendor = getLoggedInVendor();

  // If user is logged in (customer or vendor), show the protected content
  if (customer || loggedInVendor) {
    return <>{children}</>;
  }

  // If user is not logged in, show login prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            Login Required
          </CardTitle>
          <p className="text-gray-600">
            You need to be logged in to view vendor profiles and access all features.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <Link to="/customer-login" className="block">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                <User className="h-5 w-5" />
                Login to Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <div className="text-sm text-gray-500">or</div>
            
            <Link to="/customer-signup" className="block">
              <Button 
                variant="outline" 
                className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Create New Account
              </Button>
            </Link>
          </div>
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              By logging in, you can save vendors, track your bookings, and access exclusive features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthRequired;
