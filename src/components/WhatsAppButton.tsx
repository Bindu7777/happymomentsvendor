import React, { useState } from 'react';
import { MessageCircle, User, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { saveContactVendor } from '@/services/contactedVendorsApiService';

interface WhatsAppButtonProps {
  vendor: {
    vendor_id: string;
    spoc_name: string;
    category: string;
    whatsapp_number?: string;
    phone_number?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onClick?: () => void;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  vendor,
  className = '',
  size = 'md',
  children,
  onClick
}) => {
  const { customer } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    }

    // Check if customer is logged in
    if (!customer) {
      console.log('No customer logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    // Track the contact if customer is logged in
    setLoading(true);
    try {
      console.log('Tracking WhatsApp contact for customer:', customer.id, 'vendor:', vendor.vendor_id);
      
      // Save contact in background (don't wait for it)
      saveContactVendor(customer.id, vendor.vendor_id)
        .then(result => {
          if (result.success) {
            console.log('✅ Contact tracked successfully');
            // Dispatch global event to notify other components
            window.dispatchEvent(new CustomEvent('vendorContacted', { 
              detail: { vendorId: vendor.vendor_id } 
            }));
          } else {
            console.error('❌ Failed to track contact:', result.error);
          }
        })
        .catch(error => {
          console.error('❌ Error tracking contact:', error);
        })
        .finally(() => {
          setLoading(false);
        });

      // Open WhatsApp immediately (don't wait for tracking)
      openWhatsApp();
      
    } catch (error) {
      console.error('Error in WhatsApp click handler:', error);
      setLoading(false);
      openWhatsApp(); // Still open WhatsApp even if tracking fails
    }
  };

  const openWhatsApp = () => {
    const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more about your packages. Could you please share your availability and pricing details?`;
    const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
    
    if (!phoneNumber) {
      console.error('No phone number available for WhatsApp');
      alert('Phone number not available for this vendor');
      return;
    }
    
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    console.log('Opening WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  const defaultClassName = `
    bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm 
    hover:scale-105 transition-all duration-200 flex items-center justify-center
    ${getSizeClasses()}
    ${loading ? 'opacity-75 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <>
      <Button
        onClick={handleWhatsAppClick}
        disabled={loading}
        className={defaultClassName}
        title="Contact via WhatsApp"
      >
        <MessageCircle className={`${getIconSize()} mr-1 ${loading ? 'animate-pulse' : ''}`} />
        {children || 'WhatsApp'}
      </Button>

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
                You need to be logged in to contact vendors via WhatsApp.
              </p>
              <p className="text-sm text-gray-500">
                Login to contact {vendor.spoc_name} and access all vendor features.
              </p>
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
                By logging in, you can contact vendors, track bookings, and access exclusive features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppButton;
