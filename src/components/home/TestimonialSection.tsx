
import { Star, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import AddReviewModal from '../AddReviewModal';
import { getAllReviews, Review } from '../../services/supabaseService';

// Convert Review to testimonial format for display
const convertReviewToTestimonial = (review: Review) => ({
  id: review.id,
  text: review.review,
  author: review.name,
  location: review.state,
  rating: review.rating,
});

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reviewsPerPage = 3;

  const nextReviews = () => {
    setCurrentIndex((prev) => 
      prev + reviewsPerPage >= testimonials.length ? 0 : prev + reviewsPerPage
    );
  };

  const prevReviews = () => {
    setCurrentIndex((prev) => 
      prev - reviewsPerPage < 0 
        ? Math.max(0, testimonials.length - reviewsPerPage) 
        : prev - reviewsPerPage
    );
  };

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const result = await getAllReviews();
        if (result.success && result.data) {
          const convertedTestimonials = result.data.map(convertReviewToTestimonial);
          setTestimonials(convertedTestimonials);
        } else {
          console.error('Failed to fetch reviews:', result.error);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const refreshReviews = async () => {
    try {
      const result = await getAllReviews();
      if (result.success && result.data) {
        const convertedTestimonials = result.data.map(convertReviewToTestimonial);
        setTestimonials(convertedTestimonials);
        setCurrentIndex(0); // Reset to first page
      }
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    }
  };

  const currentReviews = testimonials.slice(currentIndex, currentIndex + reviewsPerPage);

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-4">What Our Customers Say</h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">Real experiences from Andhra Pradesh & Telangana</p>
          
          {/* Add Review Button */}
          <div className="mt-6">
            <button
              onClick={() => setIsAddReviewOpen(true)}
              className="inline-flex items-center gap-2 bg-wedding-orange hover:bg-wedding-orange-hover text-white px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your Review
            </button>
          </div>
        </div>
        
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevReviews}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-wedding-orange group"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-wedding-orange" />
          </button>
          
          <button
            onClick={nextReviews}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-wedding-orange group"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-wedding-orange" />
          </button>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-12">
            {loading ? (
              // Loading skeleton
              Array.from({ length: reviewsPerPage }).map((_, index) => (
                <div key={index} className="bg-wedding-light rounded-2xl p-6 animate-pulse">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gray-300 rounded mr-1"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-6 w-1/2"></div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded mb-1 w-20"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              currentReviews.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="bg-wedding-light rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all duration-300 animate-fade-up border border-wedding-orange/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-wedding-orange fill-wedding-orange' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                
                <p className="text-wedding-navy mb-6 italic">"{testimonial.text}"</p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-wedding-orange/20 flex items-center justify-center mr-4">
                    <span className="text-wedding-orange font-bold text-lg">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-wedding-navy">{testimonial.author}</h4>
                    <p className="text-sm text-wedding-gray">{testimonial.location}</p>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: Math.ceil(testimonials.length / reviewsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * reviewsPerPage)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / reviewsPerPage) === index
                    ? 'bg-wedding-orange'
                    : 'bg-gray-300 hover:bg-wedding-orange/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Add Review Modal */}
        <AddReviewModal
          isOpen={isAddReviewOpen}
          onClose={() => setIsAddReviewOpen(false)}
          onReviewSubmitted={refreshReviews}
        />
      </div>
    </section>
  );
};

export default TestimonialSection;
