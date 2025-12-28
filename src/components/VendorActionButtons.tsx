import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  Heart, 
  Share2, 
  Loader2,
  Check
} from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import LikeButton from './LikeButton';
import { Vendor } from '@/lib/supabase';

interface VendorActionButtonsProps {
  vendor: Vendor | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VendorActionButtons: React.FC<VendorActionButtonsProps> = ({ 
  vendor, 
  className = "",
  size = 'md'
}) => {
  // Size-based styling
  const sizeClasses = {
    sm: {
      button: 'px-2 py-1 rounded-md text-xs',
      icon: 'w-3 h-3',
      iconMargin: 'mr-1',
      dropdown: 'w-40'
    },
    md: {
      button: 'px-4 py-2 rounded-lg text-sm',
      icon: 'w-4 h-4',
      iconMargin: 'mr-2',
      dropdown: 'w-48'
    },
    lg: {
      button: 'px-6 py-3 rounded-xl text-base',
      icon: 'w-5 h-5',
      iconMargin: 'mr-3',
      dropdown: 'w-56'
    }
  };

  const currentSize = sizeClasses[size];
  const [isCalling, setIsCalling] = useState(false);
  const [isVisiting, setIsVisiting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareAnimation, setShowShareAnimation] = useState(false);

  // Handle call action with loading animation
  const handleCall = async () => {
    setIsCalling(true);
    // Simulate call action
    setTimeout(() => {
      setIsCalling(false);
    }, 2000);
  };

  // Handle visit action with loading animation
  const handleVisit = async () => {
    setIsVisiting(true);
    // Simulate visit action
    setTimeout(() => {
      setIsVisiting(false);
    }, 1500);
  };

  // Handle share action with animation
  const handleShare = async () => {
    setIsSharing(true);
    setShowShareAnimation(true);
    
    // Simulate share action
    setTimeout(() => {
      setIsSharing(false);
      setShowShareAnimation(false);
    }, 1000);
  };

  // Handle favorite toggle with bounce animation
  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Chat Button - Direct WhatsApp */}
      {vendor && (
        <div className="relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg pointer-events-none"></div>
          <WhatsAppButton
            vendor={vendor}
            size={size}
            className={`bg-green-500 hover:bg-green-600 active:bg-green-700 text-white ${currentSize.button} font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 relative z-10`}
          >
            Chat
          </WhatsAppButton>
        </div>
      )}

      {/* Call Button */}
      <Button 
        onClick={handleCall}
        disabled={isCalling}
        className={`bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-400 text-white ${currentSize.button} font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group`}
        title="Call vendor"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
        {isCalling ? (
          <Loader2 className={`${currentSize.icon} ${currentSize.iconMargin} animate-spin relative z-10`} />
        ) : (
          <Phone className={`${currentSize.icon} ${currentSize.iconMargin} relative z-10`} />
        )}
        <span className="relative z-10">{isCalling ? 'Calling...' : 'Call'}</span>
      </Button>

      {/* Visit Button */}
      <Button 
        onClick={handleVisit}
        disabled={isVisiting}
        className={`bg-purple-500 hover:bg-purple-600 active:bg-purple-700 disabled:bg-purple-400 text-white ${currentSize.button} font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group`}
        title="Schedule a visit"
      >
        <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
        {isVisiting ? (
          <Loader2 className={`${currentSize.icon} ${currentSize.iconMargin} animate-spin relative z-10`} />
        ) : (
          <Calendar className={`${currentSize.icon} ${currentSize.iconMargin} relative z-10`} />
        )}
        <span className="relative z-10">{isVisiting ? 'Scheduling...' : 'Visit'}</span>
      </Button>

      {/* Favorite Button */}
      <Button 
        onClick={handleFavoriteToggle}
        variant="outline"
        size="icon"
        className={`hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-200 border-2 relative overflow-hidden group ${
          isFavorited ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <div className="absolute inset-0 bg-red-100 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
        <Heart 
          className={`${currentSize.icon} relative z-10 transition-all duration-200 ${
            isFavorited 
              ? 'text-red-500 fill-current animate-bounce' 
              : 'text-gray-600 hover:text-red-500'
          }`} 
        />
        {isFavorited && (
          <div className="absolute inset-0 bg-red-200 rounded-lg animate-ping opacity-75"></div>
        )}
      </Button>

      {/* Share Button */}
      <Button 
        onClick={handleShare}
        disabled={isSharing}
        variant="outline"
        size="icon"
        className="hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 relative overflow-hidden group disabled:opacity-50"
        title="Share vendor profile"
      >
        <div className="absolute inset-0 bg-gray-100 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
        <Share2 
          className={`${currentSize.icon} text-gray-600 relative z-10 transition-all duration-200 ${
            showShareAnimation ? 'animate-pulse scale-110' : ''
          }`} 
        />
        {showShareAnimation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
          </div>
        )}
      </Button>
    </div>
  );
};

export default VendorActionButtons;
