import { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '@utils/cn';
import { api } from '@services/api';
import { ENDPOINTS } from '@config/apiConfig';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, orderId, storeName }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoveredRating(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(ENDPOINTS.RATINGS, {
        order_id: orderId,
        rating: selectedRating,
        review: review.trim() || null,
      });

      // Show success state
      setShowSuccess(true);

      // Clear localStorage flag
      localStorage.removeItem('pendingRatingOrderId');

      // Close modal after delay
      setTimeout(() => {
        onClose();
        // Reset state for next use
        setShowSuccess(false);
        setSelectedRating(0);
        setReview('');
      }, 2500);

      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    // Keep the pending rating flag so it can be triggered again later
    onClose();
    // Reset state
    setSelectedRating(0);
    setReview('');
  };

  const displayRating = hoveredRating || selectedRating;

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-600">Your rating has been submitted for moderation.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} size="sm" showCloseButton={false}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          You just completed an order purchase
          {storeName && (
            <>
              {' '}from <span className="text-primary">{storeName}</span>
            </>
          )}
          !
        </h2>
        <p className="text-gray-600 mb-6">
          Please rate this seller and tell us your experience. Your feedback helps us improve COVU for everyone.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleStarClick(rating)}
                onMouseEnter={() => handleStarHover(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-10 w-10 transition-colors',
                    rating <= displayRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              </button>
            ))}
          </div>

          {/* Review Textarea */}
          <div className="mb-6">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-gray-900"
              placeholder="Optional review..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="flex-1"
            >
              Later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedRating === 0}
              loading={isSubmitting}
              className="flex-1"
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RatingModal;
