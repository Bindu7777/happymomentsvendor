import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, AlertCircle, Star, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { updateVendorStatus, getStatusOptions } from '@/services/contactedVendorsApiService';
import { addCustomerReview } from '@/services/supabaseService';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import CouponDialog from './CouponDialog';

interface StatusOption {
  value: string;
  label: string;
  description: string;
  color: string;
}

interface VendorStatusDropdownProps {
  customerId: number;
  vendorId: string;
  currentStatus: string;
  onStatusUpdate?: (newStatus: string) => void;
  className?: string;
  vendorName?: string;
  vendorPhoneNumber?: string;
  userType?: 'customer' | 'vendor'; // Add userType prop
  dropdownDirection?: 'up' | 'down'; // Control dropdown direction: 'up' for grid, 'down' for full profile
}

const VendorStatusDropdown: React.FC<VendorStatusDropdownProps> = ({
  customerId,
  vendorId,
  currentStatus,
  onStatusUpdate,
  className = '',
  vendorName = "Vendor",
  vendorPhoneNumber,
  userType = 'customer', // Default to customer (most common use case)
  dropdownDirection = 'down', // Default to down (for full profile)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showNotInterestedDialog, setShowNotInterestedDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [notInterestedFeedback, setNotInterestedFeedback] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { customer } = useCustomerAuth();

  // Load status options on component mount
  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        // Ensure we always use the provided userType, defaulting to 'customer' (most common)
        const effectiveUserType = userType || 'customer';
        console.log('VendorStatusDropdown: Loading status options for userType:', effectiveUserType, 'prop userType:', userType);
        const result = await getStatusOptions(effectiveUserType);
        console.log('VendorStatusDropdown: Status options result:', result);
        if (result.success && result.data) {
          console.log('VendorStatusDropdown: Setting status options:', result.data);
          console.log('VendorStatusDropdown: Number of options:', result.data.length);
          setStatusOptions(result.data);
        } else {
          console.error('VendorStatusDropdown: Failed to load status options:', result.error);
          setError(result.error || 'Failed to load status options');
        }
      } catch (err: any) {
        console.error('VendorStatusDropdown: Error loading status options:', err);
        setError(err.message || 'Failed to load status options');
      }
    };

    loadStatusOptions();
  }, [userType]);

  // Calculate dropdown position when opening (for mobile fixed positioning)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: dropdownDirection === 'up' ? rect.top - 10 : rect.bottom + 10,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen, dropdownDirection]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    // Show popup for "Not Interested" (customer only)
    if (userType === 'customer' && newStatus === 'Not Interested') {
      setShowNotInterestedDialog(true);
      return;
    }

    // Show popup for "Event Completed" (customer only)
    if (userType === 'customer' && newStatus === 'Event Completed') {
      setShowReviewDialog(true);
      return;
    }

    // For other statuses, update directly
    await updateStatus(newStatus);
  };

  const updateStatus = async (newStatus: string, notes?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Updating status:', { customerId, vendorId, newStatus, notes, userType });
      const result = await updateVendorStatus(customerId, vendorId, newStatus, notes, userType);
      console.log('Update result:', result);
      
      if (result.success) {
        console.log('Status updated successfully:', result.data);
        onStatusUpdate?.(newStatus);
        
        // Show coupon dialog if "Request Discount Coupon" was selected
        if (newStatus === 'Request Discount Coupon') {
          setShowCouponDialog(true);
        }
      } else {
        const errorMsg = result.error || 'Failed to update status';
        console.error('Status update failed:', errorMsg);
        setError(errorMsg);
        alert(`Failed to update status: ${errorMsg}`);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update status';
      console.error('Error updating status:', err);
      setError(errorMsg);
      alert(`Error updating status: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNotInterestedSubmit = async () => {
    if (!notInterestedFeedback.trim()) {
      alert('Please provide feedback on why you are not interested.');
      return;
    }
    
    // Update status with feedback in notes
    await updateStatus('Not Interested', notInterestedFeedback);
    setShowNotInterestedDialog(false);
    setNotInterestedFeedback('');
  };

  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      alert('Please provide a rating.');
      return;
    }
    if (!reviewComment.trim()) {
      alert('Please provide feedback about the service.');
      return;
    }
    
    setLoading(true);
    try {
      // First update the status
      await updateStatus('Event Completed');
      
      // Then add the review
      const customerName = customer?.full_name || `Customer ${customerId}`;
      const reviewResult = await addCustomerReview(
        vendorId,
        customerId.toString(),
        customerName,
        reviewRating,
        reviewComment
      );
      
      if (!reviewResult.success) {
        console.error('Failed to add review:', reviewResult.error);
        alert('Status updated but failed to save review. Please try again.');
      }
      
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-500',
      'yellow': 'bg-yellow-500',
      'green': 'bg-green-500',
      'orange': 'bg-orange-500',
      'purple': 'bg-purple-500',
      'indigo': 'bg-indigo-500',
      'pink': 'bg-pink-500',
      'emerald': 'bg-emerald-500',
      'red': 'bg-red-500',
      'gray': 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getStatusBadgeVariant = (status: string) => {
    const color = getStatusColor(status);
    switch (color) {
      case 'blue': return 'default';
      case 'yellow': return 'secondary';
      case 'green': return 'default';
      case 'orange': return 'secondary';
      case 'purple': return 'secondary';
      case 'indigo': return 'default';
      case 'pink': return 'secondary';
      case 'emerald': return 'default';
      case 'red': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const color = getStatusColor(status);
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'pink': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Error loading status</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ zIndex: isOpen ? 50 : 'auto' }}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        disabled={loading}
        className={`flex items-center gap-2 min-w-[140px] justify-between ${getStatusBadgeClass(currentStatus)}`}
      >
        <Badge 
          variant={getStatusBadgeVariant(currentStatus)}
          className={`text-xs font-medium ${getStatusBadgeClass(currentStatus)}`}
        >
          {currentStatus}
        </Badge>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[40]" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(false);
            }}
          />
          
          {/* Dropdown - Use fixed positioning on mobile to avoid overflow clipping */}
          <div 
            className={`hidden sm:block absolute ${
              dropdownDirection === 'up' 
                ? 'bottom-full left-0 mb-1' 
                : 'top-full left-0 mt-1'
            } bg-white border border-gray-200 rounded-lg shadow-xl z-[50] min-w-[200px] max-w-[280px]`}
            style={{ 
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                Update Status
              </div>
              
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleStatusChange(option.value);
                  }}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 ${
                    option.value === currentStatus
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${getColorClass(option.color)}`} />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {option.value === currentStatus && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Dropdown - Fixed positioning to avoid overflow clipping */}
          <div 
            className={`sm:hidden fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[50]`}
            style={{ 
              top: dropdownDirection === 'up' 
                ? `${Math.max(10, dropdownPosition.top - 300)}px` 
                : `${Math.min(window.innerHeight - 200, dropdownPosition.top)}px`,
              left: `${Math.max(10, dropdownPosition.left)}px`,
              right: '10px',
              width: `calc(100% - ${dropdownPosition.left + 10}px - 10px)`,
              maxWidth: '280px',
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                Update Status
              </div>
              
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleStatusChange(option.value);
                  }}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 ${
                    option.value === currentStatus
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${getColorClass(option.color)}`} />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {option.value === currentStatus && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Dropdown - Fixed positioning to avoid overflow clipping */}
          <div 
            className={`sm:hidden fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[50]`}
            style={{ 
              top: dropdownDirection === 'up' 
                ? `${Math.max(10, dropdownPosition.top - 300)}px` 
                : `${Math.min(window.innerHeight - 200, dropdownPosition.top)}px`,
              left: `${Math.max(10, dropdownPosition.left)}px`,
              right: '10px',
              width: `calc(100% - ${dropdownPosition.left + 10}px - 10px)`,
              maxWidth: '280px',
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                Update Status
              </div>
              
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleStatusChange(option.value);
                  }}
                  disabled={loading}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-3 ${
                    option.value === currentStatus
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full ${getColorClass(option.color)}`} />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {option.value === currentStatus && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Coupon Dialog */}
      <CouponDialog
        isOpen={showCouponDialog}
        onClose={() => setShowCouponDialog(false)}
        vendorName={vendorName}
        vendorId={vendorPhoneNumber}
      />

      {/* Not Interested Feedback Dialog */}
      <Dialog open={showNotInterestedDialog} onOpenChange={setShowNotInterestedDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Why are you not interested?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please share your feedback so we can improve our service.
            </p>
            <Textarea
              value={notInterestedFeedback}
              onChange={(e) => setNotInterestedFeedback(e.target.value)}
              placeholder="Please tell us why you are not interested in this vendor..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotInterestedDialog(false);
                  setNotInterestedFeedback('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNotInterestedSubmit}
                disabled={!notInterestedFeedback.trim() || loading}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Completed Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>How was the service?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please share your experience with {vendorName}.
            </p>
            
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-colors duration-200"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-gray-600">
                  {reviewRating === 1 && 'Poor'}
                  {reviewRating === 2 && 'Fair'}
                  {reviewRating === 3 && 'Good'}
                  {reviewRating === 4 && 'Very Good'}
                  {reviewRating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Your Review *
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with the vendor's service..."
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewDialog(false);
                  setReviewRating(0);
                  setReviewComment('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={reviewRating === 0 || !reviewComment.trim() || loading}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorStatusDropdown;
