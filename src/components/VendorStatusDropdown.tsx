import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { updateVendorStatus, getStatusOptions } from '@/services/contactedVendorsApiService';
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
}

const VendorStatusDropdown: React.FC<VendorStatusDropdownProps> = ({
  customerId,
  vendorId,
  currentStatus,
  onStatusUpdate,
  className = '',
  vendorName = "Vendor",
  vendorPhoneNumber,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  // Load status options on component mount
  useEffect(() => {
    const loadStatusOptions = async () => {
      try {
        const result = await getStatusOptions();
        if (result.success && result.data) {
          setStatusOptions(result.data);
        } else {
          setError(result.error || 'Failed to load status options');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load status options');
      }
    };

    loadStatusOptions();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateVendorStatus(customerId, vendorId, newStatus);
      
      if (result.success) {
        console.log('Status updated successfully:', result.data);
        onStatusUpdate?.(newStatus);
        setIsOpen(false);
        
        // Show coupon dialog if "Request Discount Coupon" was selected
        if (newStatus === 'Request Discount Coupon') {
          setShowCouponDialog(true);
        }
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
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
    <div className={`relative ${className}`}>
      <Button
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
            className="fixed inset-0 z-10" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsOpen(false);
            }}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-w-[280px]"
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
                  <div className={`w-2 h-2 rounded-full bg-${option.color}-500`} />
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
    </div>
  );
};

export default VendorStatusDropdown;
