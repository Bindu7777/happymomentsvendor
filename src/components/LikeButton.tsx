import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { saveLikeVendor, removeLikeVendor, checkVendorLiked } from '@/services/likedVendorsApiService';

interface LikeButtonProps {
  vendorId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onLikeChange?: (isLiked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  vendorId,
  size = 'md',
  showText = false,
  className = '',
  onLikeChange
}) => {
  const { customer } = useCustomerAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Debug: Log component mount and props
  useEffect(() => {
    console.log('💡 LikeButton mounted/updated:', { 
      vendorId, 
      hasCustomer: !!customer,
      customerId: customer?.id
    });
  }, [vendorId, customer]);

  // Working click handler - now with proper API calls
  const handleSimpleClick = async () => {
    console.log('🖱️ Like button clicked!', { 
      hasCustomer: !!customer, 
      customerId: customer?.id,
      vendorId,
      loading,
      isLiked 
    });

    if (!customer) {
      console.error('❌ No customer logged in, redirecting to login');
      window.location.href = '/customer-login';
      return;
    }

    if (loading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Toggling like:', { customerId: customer.id, vendorId, currentlyLiked: isLiked });
      
      let result;
      if (isLiked) {
        console.log('❌ Removing like...');
        result = await removeLikeVendor(customer.id, vendorId);
      } else {
        console.log('💖 Adding like...');
        result = await saveLikeVendor(customer.id, vendorId);
      }

      console.log('📥 API Response:', result);

      if (result.error) {
        console.error('❌ Error toggling like:', result.error);
        return;
      }

      if (!result.success) {
        console.error('❌ Operation failed:', result);
        return;
      }

      console.log('✅ Like toggled successfully');
      setIsLiked(!isLiked);
      onLikeChange?.(!isLiked);
      
      // Dispatch global event to update header count
      const eventName = isLiked ? 'vendorUnliked' : 'vendorLiked';
      window.dispatchEvent(new CustomEvent(eventName, { detail: { vendorId } }));
    } catch (error) {
      console.error('💥 Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions defined first
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  // Check if vendor is liked on mount
  useEffect(() => {
    if (customer && vendorId) {
      checkIfLiked();
    }
  }, [customer, vendorId]);

  const checkIfLiked = async () => {
    if (!customer) return;
    
    try {
      const result = await checkVendorLiked(customer.id, vendorId);
      if (result.error) {
        console.error('Error checking if vendor is liked:', result.error);
        return;
      }
      setIsLiked(result.is_liked || false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInitialized(true);
    }
  };

  const handleLikeToggle = async () => {
    console.log('🖱️ Like button clicked!', { 
      hasCustomer: !!customer, 
      customerId: customer?.id,
      vendorId,
      loading,
      isLiked 
    });

    if (!customer) {
      console.error('❌ No customer logged in, redirecting to login');
      alert('Please login to like vendors');
      // Redirect to login if not authenticated
      window.location.href = '/customer-login';
      return;
    }

    if (loading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔄 Toggling like:', { customerId: customer.id, vendorId, currentlyLiked: isLiked });
      
      let result;
      if (isLiked) {
        console.log('❌ Removing like...');
        result = await removeLikeVendor(customer.id, vendorId);
      } else {
        console.log('💖 Adding like...');
        result = await saveLikeVendor(customer.id, vendorId);
      }

      console.log('📥 API Response:', result);

      if (result.error) {
        console.error('❌ Error toggling like:', result.error);
        alert(`Error: ${result.error}`); // Show error to user
        return;
      }

      if (!result.success) {
        console.error('❌ Operation failed:', result);
        alert('Failed to save like. Please try again.');
        return;
      }

      console.log('✅ Like toggled successfully');
      setIsLiked(!isLiked);
      onLikeChange?.(!isLiked);
    } catch (error) {
      console.error('💥 Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Show customer status
  if (!initialized) {
    return (
      <div className={`${className} animate-pulse`}>
        <Heart className={`${getSizeClasses()} text-gray-300`} />
        {/* Debug info - remove this later */}
        <div className="text-xs text-red-500 absolute -top-8 left-0 whitespace-nowrap bg-white px-1 rounded">
          {customer ? `C${customer.id}` : 'No Customer'}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSimpleClick}
      disabled={loading}
      className={`flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 ${
        isLiked 
          ? 'text-red-500' 
          : 'text-gray-400 hover:text-red-400'
      } ${className}`}
      title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      style={{ zIndex: 10, position: 'relative' }}
    >
      <Heart 
        className={`${getSizeClasses()} transition-all duration-200 ${
          isLiked ? 'fill-red-500' : ''
        } ${loading ? 'animate-pulse' : ''}`} 
      />
      {showText && (
        <span className={`${getTextSizeClasses()} font-medium`}>
          {isLiked ? 'Liked' : 'Like'}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
