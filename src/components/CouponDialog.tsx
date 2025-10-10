import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, Share2, MessageCircle, CheckCircle, Sparkles, X } from 'lucide-react';
import { Coupon } from '@/services/couponsApiService';
import { getRandomCoupon } from '@/services/couponsApiService';

interface CouponDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName?: string;
  vendorId?: string;
}

const CouponDialog: React.FC<CouponDialogProps> = ({ 
  isOpen, 
  onClose, 
  vendorName = "Vendor",
  vendorId 
}) => {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch random coupon when dialog opens
  useEffect(() => {
    if (isOpen && !coupon) {
      fetchRandomCoupon();
    }
  }, [isOpen]);

  const fetchRandomCoupon = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getRandomCoupon();
      if (result.success && result.data) {
        setCoupon(result.data);
      } else {
        setError(result.error || 'Failed to fetch coupon');
      }
    } catch (err: any) {
      setError('Failed to fetch coupon');
      console.error('Error fetching coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = async () => {
    if (coupon?.coupon_code) {
      try {
        await navigator.clipboard.writeText(coupon.coupon_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy coupon code:', err);
      }
    }
  };

  const shareToVendor = () => {
    if (coupon && vendorId) {
      const message = `🎉 Congratulations! You've received a special 10% discount coupon!\n\n` +
        `Coupon Code: ${coupon.coupon_code}\n` +
        `Description: ${coupon.description}\n\n` +
        `Share this coupon code with ${vendorName} and the discount will be applied to your booking! 🎊`;
      
      // Open WhatsApp with the message
      const whatsappUrl = `https://wa.me/${vendorId}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleClose = () => {
    setCoupon(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  const getDiscountColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (percentage >= 25) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDiscountEmoji = (percentage: number) => {
    if (percentage >= 90) return '🎊';
    if (percentage >= 70) return '🎉';
    if (percentage >= 50) return '🎁';
    if (percentage >= 25) return '✨';
    return '🎈';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-yellow-500" />
              Your Discount Coupon!
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your perfect coupon...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">❌</div>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchRandomCoupon} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {coupon && !loading && (
            <>
              {/* Coupon Display */}
              <div className={`rounded-2xl border-2 p-6 mb-6 text-center ${getDiscountColor(10)}`}>
                <div className="text-4xl mb-2">{getDiscountEmoji(10)}</div>
                <div className="text-4xl font-black mb-2">10% OFF</div>
                <div className="text-lg font-semibold mb-3">{coupon.description}</div>
                
                {/* Coupon Code */}
                <div className="bg-white/80 rounded-lg p-4 border-2 border-dashed border-current">
                  <div className="text-sm text-gray-600 mb-2">Coupon Code</div>
                  <div className="text-2xl font-black tracking-wider">{coupon.coupon_code}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  How to Use Your Coupon
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copy the coupon code above</li>
                  <li>2. Share it with {vendorName} via WhatsApp</li>
                  <li>3. The discount will be applied to your booking!</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={copyCouponCode}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </Button>

                <Button
                  onClick={shareToVendor}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share to Vendor
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span>Valid until {new Date(coupon.valid_until).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDialog;
