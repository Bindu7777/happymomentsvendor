import React, { useState, useEffect } from 'react';
import { Heart, Lock, User, ArrowRight, X, Loader2 } from 'lucide-react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { saveLikeVendor, removeLikeVendor, checkVendorLiked } from '@/services/likedVendorsApiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useNavigate } from 'react-router-dom';

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
  const { customer, signIn } = useCustomerAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true); // Track if we're still checking initial status

  // Check if vendor is liked function - defined before use
  const checkIfLiked = async () => {
    if (!customer || !vendorId) {
      console.log('⚠️ checkIfLiked: No customer or vendorId', { hasCustomer: !!customer, vendorId });
      setIsLiked(false);
      setInitialized(true);
      setIsChecking(false);
      return;
    }
    
    setIsChecking(true);
    
    try {
      const vendorIdStr = String(vendorId).trim();
      console.log('🔍 Checking if vendor is liked:', { 
        customerId: customer.id, 
        vendorId: vendorIdStr,
        vendorIdType: typeof vendorIdStr
      });
      
      const result = await checkVendorLiked(customer.id, vendorIdStr);
      console.log('📥 Like check API result:', JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error('❌ Error checking if vendor is liked:', result.error);
        setIsLiked(false);
        setInitialized(true);
        setIsChecking(false);
        return;
      }
      
      // Check like status - API returns { success: true, is_liked: boolean, data: ... }
      // If data exists, vendor is liked. Also check is_liked field.
      const liked = result.is_liked === true || (result.data !== null && result.data !== undefined);
      
      console.log('✅ Vendor like status determined:', {
        is_liked: result.is_liked,
        is_liked_type: typeof result.is_liked,
        is_liked_strict: result.is_liked === true,
        data: result.data,
        data_exists: !!result.data,
        data_not_null: result.data !== null,
        success: result.success,
        full_result: JSON.stringify(result),
        finalLiked: liked
      });
      
      // Set like status IMMEDIATELY
      console.log('🎯 Setting isLiked to:', liked);
      setIsLiked(liked);
      
      // FORCE UPDATE - Set it multiple times to ensure React picks it up
      if (liked) {
        console.log('🔴🔴🔴 VENDOR IS LIKED - FORCING RED HEART 🔴🔴🔴');
        // Set immediately
        setIsLiked(true);
        // Force multiple updates using requestAnimationFrame
        requestAnimationFrame(() => {
          console.log('🔄 RAF 1: Setting isLiked to true');
          setIsLiked(true);
          requestAnimationFrame(() => {
            console.log('🔄 RAF 2: Setting isLiked to true');
            setIsLiked(true);
          });
        });
        // Also use setTimeout as backup
        setTimeout(() => {
          console.log('🔄 Timeout 50ms: Setting isLiked to true');
          setIsLiked(true);
        }, 50);
        setTimeout(() => {
          console.log('🔄 Timeout 200ms: Setting isLiked to true');
          setIsLiked(true);
        }, 200);
        setTimeout(() => {
          console.log('🔄 Timeout 500ms: Setting isLiked to true');
          setIsLiked(true);
        }, 500);
        setTimeout(() => {
          console.log('🔄 Timeout 1000ms: Setting isLiked to true');
          setIsLiked(true);
        }, 1000);
      } else {
        console.log('⚪ VENDOR IS NOT LIKED');
        setIsLiked(false);
      }
    } catch (error) {
      console.error('💥 Error checking like status:', error);
      setIsLiked(false);
    } finally {
      setInitialized(true);
      setIsChecking(false);
    }
  };

  // Listen for like/unlike events from other LikeButton instances
  useEffect(() => {
    const handleVendorLiked = (e: CustomEvent) => {
      const eventVendorId = String(e.detail.vendorId).trim();
      const currentVendorId = String(vendorId).trim();
      console.log('🔔 LikeButton: Received vendorLiked event', { 
        eventVendorId, 
        currentVendorId, 
        matches: eventVendorId === currentVendorId,
        eventVendorIdType: typeof eventVendorId,
        currentVendorIdType: typeof currentVendorId
      });
      
      if (eventVendorId === currentVendorId) {
        console.log('✅ LikeButton: Vendor IDs match! Setting isLiked to true immediately');
        setIsLiked(true);
        setInitialized(true);
        // Also re-check from server to be sure
        if (customer) {
          setTimeout(() => {
            console.log('🔄 Re-checking like status after event');
            checkIfLiked();
          }, 200);
        }
      } else {
        console.log('⚠️ LikeButton: Vendor IDs do not match, ignoring event');
      }
    };
    
    const handleVendorUnliked = (e: CustomEvent) => {
      const eventVendorId = String(e.detail.vendorId).trim();
      const currentVendorId = String(vendorId).trim();
      console.log('🔔 LikeButton: Received vendorUnliked event', { 
        eventVendorId, 
        currentVendorId, 
        matches: eventVendorId === currentVendorId
      });
      
      if (eventVendorId === currentVendorId) {
        console.log('✅ LikeButton: Vendor IDs match! Setting isLiked to false immediately');
        setIsLiked(false);
        setInitialized(true);
        // Also re-check from server to be sure
        if (customer) {
          setTimeout(() => {
            console.log('🔄 Re-checking like status after event');
            checkIfLiked();
          }, 200);
        }
      } else {
        console.log('⚠️ LikeButton: Vendor IDs do not match, ignoring event');
      }
    };
    
    // Also listen for generic status change events
    const handleStatusChange = (e: CustomEvent) => {
      const eventVendorId = String(e.detail.vendorId).trim();
      const currentVendorId = String(vendorId).trim();
      if (eventVendorId === currentVendorId) {
        console.log('🔔 LikeButton: Received vendorLikeStatusChanged event', { 
          eventVendorId, 
          currentVendorId, 
          isLiked: e.detail.isLiked 
        });
        setIsLiked(e.detail.isLiked);
        setInitialized(true);
        if (customer) {
          setTimeout(() => checkIfLiked(), 200);
        }
      }
    };
    
    window.addEventListener('vendorLiked', handleVendorLiked as EventListener);
    window.addEventListener('vendorUnliked', handleVendorUnliked as EventListener);
    window.addEventListener('vendorLikeStatusChanged', handleStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('vendorLiked', handleVendorLiked as EventListener);
      window.removeEventListener('vendorUnliked', handleVendorUnliked as EventListener);
      window.removeEventListener('vendorLikeStatusChanged', handleStatusChange as EventListener);
    };
  }, [vendorId, customer]);
  
  // Debug: Log component mount and props
  useEffect(() => {
    console.log('💡 LikeButton mounted/updated:', { 
      vendorId, 
      vendorIdType: typeof vendorId,
      hasCustomer: !!customer,
      customerId: customer?.id,
      isLiked,
      initialized
    });
  }, [vendorId, customer, isLiked, initialized]);

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
      console.log('❌ No customer logged in, showing login modal');
      setShowLoginModal(true);
      return;
    }

    if (loading) {
      console.log('⏳ Already loading, skipping...');
      return;
    }

    setLoading(true);
    
    try {
      // Ensure vendorId is always a string for consistency
      const vendorIdStr = String(vendorId);
      console.log('🔄 Toggling like:', { customerId: customer.id, vendorId: vendorIdStr, currentlyLiked: isLiked });
      
      let result;
      if (isLiked) {
        console.log('❌ Removing like...');
        result = await removeLikeVendor(customer.id, vendorIdStr);
      } else {
        console.log('💖 Adding like...');
        result = await saveLikeVendor(customer.id, vendorIdStr);
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
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      onLikeChange?.(newLikedState);
      
      // Dispatch global event to update header count and sync other LikeButtons
      // CRITICAL: Use consistent string format for vendorId
      const eventName = isLiked ? 'vendorUnliked' : 'vendorLiked';
      const eventVendorId = String(vendorIdStr).trim();
      console.log('📢 Dispatching global event:', { eventName, vendorId: eventVendorId, newLikedState });
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: { vendorId: eventVendorId } 
      }));
      
      // Also dispatch a generic event for any listeners
      window.dispatchEvent(new CustomEvent('vendorLikeStatusChanged', {
        detail: { vendorId: eventVendorId, isLiked: newLikedState }
      }));
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

  // Check if vendor is liked on mount and when customer/vendorId changes
  useEffect(() => {
    console.log('🔄 LikeButton useEffect triggered:', { 
      hasCustomer: !!customer, 
      customerId: customer?.id,
      vendorId,
      vendorIdType: typeof vendorId,
      vendorIdString: String(vendorId)
    });
    
    if (customer && vendorId) {
      // Always check like status when customer or vendorId changes
      console.log('✅ Conditions met, calling checkIfLiked');
      checkIfLiked();
      
      // Also check again after a short delay to ensure customer state is fully loaded
      const timeoutId = setTimeout(() => {
        console.log('🔄 Delayed checkIfLiked call');
        checkIfLiked();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      // If no customer, still mark as initialized so button shows
      console.log('⚠️ No customer or vendorId, setting default state');
      setInitialized(true);
      setIsLiked(false);
    }
  }, [customer?.id, vendorId]); // Use customer?.id to trigger when customer changes

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

  // Handle login in modal
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const { customer: loggedInCustomer, error } = await signIn(
        loginData.email.trim(),
        loginData.password
      );

      if (error) {
        if (error.message?.includes('Invalid credentials') || error.message?.includes('No rows')) {
          setLoginError('Invalid email or password');
        } else {
          setLoginError(error.message || 'An error occurred during login');
        }
        setLoginLoading(false);
        return;
      }

      if (loggedInCustomer) {
        // Close modal
        setShowLoginModal(false);
        setLoginLoading(false);
        
        // Wait a moment for customer state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Automatically like the vendor after login
        try {
          const vendorIdStr = String(vendorId).trim();
          const result = await saveLikeVendor(loggedInCustomer.id, vendorIdStr);
          if (result.success) {
            setIsLiked(true);
            onLikeChange?.(true);
            // Dispatch event to update header count and sync other LikeButtons
            // CRITICAL: Use consistent string format for vendorId
            console.log('📢 Dispatching vendorLiked event after login:', { vendorId: vendorIdStr });
            window.dispatchEvent(new CustomEvent('vendorLiked', { 
              detail: { vendorId: vendorIdStr } 
            }));
            // Also dispatch generic event
            window.dispatchEvent(new CustomEvent('vendorLikeStatusChanged', {
              detail: { vendorId: vendorIdStr, isLiked: true }
            }));
          }
        } catch (error) {
          console.error('Error liking vendor after login:', error);
        }
        
        // Navigate to vendor profile
        navigate(`/vendor/${vendorId}`);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
      setLoginLoading(false);
    }
  };

  // Debug: Log current state before render
  console.log('🎨 LikeButton RENDER:', { 
    isLiked, 
    vendorId, 
    hasCustomer: !!customer,
    customerId: customer?.id,
    initialized,
    loading,
    isChecking,
    willShowRed: isLiked === true
  });
  
  // FORCE RENDER UPDATE if isLiked should be true but isn't
  useEffect(() => {
    if (customer && vendorId && !isChecking && !loading && initialized && !isLiked) {
      // Double-check if we should be liked
      console.log('⚠️ Component rendered but isLiked is false - rechecking...');
      setTimeout(() => checkIfLiked(), 100);
    }
  }, [customer?.id, vendorId, initialized, isChecking, loading]);

  return (
    <>
      <button
        onClick={handleSimpleClick}
        disabled={loading || isChecking}
        className={`flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
          isLiked 
            ? 'text-red-500' 
            : 'text-gray-400 hover:text-red-400'
        } ${className}`}
        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        style={{ zIndex: 50, position: 'relative', cursor: loading || isChecking ? 'wait' : 'pointer' }}
      >
        <Heart 
          className={`${getSizeClasses()} transition-all duration-200 ${
            isLiked 
              ? 'fill-red-500 text-red-500 stroke-red-500' 
              : 'text-gray-400 fill-none stroke-gray-400'
          } ${loading || isChecking ? 'animate-pulse' : ''}`}
          style={isLiked ? { 
            fill: '#ef4444', 
            color: '#ef4444',
            stroke: '#ef4444',
            strokeWidth: 2
          } : { 
            fill: 'none', 
            color: '#9ca3af',
            stroke: '#9ca3af',
            strokeWidth: 2
          }}
        />
        {showText && (
          <span className={`${getTextSizeClasses()} font-medium`}>
            {isLiked ? 'Liked' : 'Like'}
          </span>
        )}
      </button>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-orange-500" />
              Login to Like Vendor
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={loginLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={loginLoading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    Login & Like Vendor
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">or</span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate('/customer-signup');
                }}
                className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
              >
                Create New Account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LikeButton;
