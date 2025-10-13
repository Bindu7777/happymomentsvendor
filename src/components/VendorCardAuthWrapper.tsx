import React, { useState } from 'react';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { User, Lock, ArrowRight, X } from 'lucide-react';

interface VendorCardAuthWrapperProps {
  children: React.ReactNode;
  vendorId?: string;
  vendorName?: string;
}

const VendorCardAuthWrapper: React.FC<VendorCardAuthWrapperProps> = ({ 
  children, 
  vendorId, 
  vendorName 
}) => {
  const { customer } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!customer) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>

      {/* Auth Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-orange-500" />
              Login Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600 mb-2">
                You need to be logged in to view vendor profiles and access all features.
              </p>
              {vendorName && (
                <p className="text-sm text-gray-500">
                  You were trying to view <strong>{vendorName}</strong>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/customer-login';
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <User className="h-5 w-5" />
                Login to Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">or</span>
              </div>
              
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/customer-signup';
                }}
                variant="outline" 
                className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Create New Account
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                By logging in, you can save vendors, track your bookings, and access exclusive features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorCardAuthWrapper;
