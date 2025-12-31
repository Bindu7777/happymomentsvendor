import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { addReview } from '../services/supabaseService';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
  vendorId: string | number;
}


const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
  vendorId
}) => {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Check if customer is logged in
    if (!isAuthenticated || !customer) {
      setError('You must be logged in as a customer to add a review');
      return;
    }

    // Validate required fields
    if (!reviewText.trim()) {
      setError('Please enter your review');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a valid rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const customerName = customer.full_name || customer.email?.split('@')[0] || 'Customer';
      
      const result = await addReview(
        vendorId,
        customer.id,
        customerName,
        reviewText.trim(),
        rating
      );

      if (result.success) {
        // Reset form
        setReviewText('');
        setRating(5);
        setError('');
        
        // Close modal and refresh reviews
        onClose();
        onReviewSubmitted();
      } else {
        setError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReviewText('');
      setRating(5);
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Add Your Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Info Display */}
          {customer && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Reviewing as:</span> {customer.full_name || customer.email}
              </p>
            </div>
          )}

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
                  onClick={() => handleStarClick(star)}
                  disabled={isSubmitting}
                  className="p-1 transition-colors duration-200"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Your Review *
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with Happy Moments..."
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isAuthenticated || !customer || !reviewText.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddReviewModal;
