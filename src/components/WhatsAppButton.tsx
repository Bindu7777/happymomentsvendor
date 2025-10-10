import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      console.log('No customer logged in, opening WhatsApp without tracking');
      openWhatsApp();
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
    <Button
      onClick={handleWhatsAppClick}
      disabled={loading}
      className={defaultClassName}
      title="Contact via WhatsApp"
    >
      <MessageCircle className={`${getIconSize()} mr-1 ${loading ? 'animate-pulse' : ''}`} />
      {children || 'WhatsApp'}
    </Button>
  );
};

export default WhatsAppButton;
