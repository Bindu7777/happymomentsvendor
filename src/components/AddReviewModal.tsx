import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { addCustomerReview } from '../services/supabaseService';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  customerId: string;
  customerName: string;
  onReviewSubmitted: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  vendorId,
  customerId,
  customerName,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setError('Please enter your review');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await addCustomerReview(
        vendorId,
        customerId,
        customerName,
        rating,
        reviewText.trim()
      );

      if (result.success) {
        // Reset form
        setRating(0);
        setReviewText('');
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
      setRating(0);
      setReviewText('');
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
          {/* Customer Name Display */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Reviewing as:</p>
            <p className="font-semibold text-blue-800">{customerName}</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Rating (Optional)
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
              placeholder="Share your experience with this vendor..."
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
              disabled={isSubmitting || !reviewText.trim()}
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
