import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Facebook, Heart, Share2, Calendar, Clock, CheckCircle, Camera, Video, Users, Award, MessageCircle, Zap, Trophy, Sparkles, ArrowRight, Play, Pause, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Vendor } from '../lib/supabase';
import { getVendorByFieldId, getVendorMedia, getHighlightedCatalogImages, getAllCatalogImages, getCustomerReviews } from '../services/supabaseService';
import AddReviewModal from '../components/AddReviewModal';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

const VendorProfile = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { customer, isAuthenticated } = useCustomerAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [highlightedImages, setHighlightedImages] = useState<any[]>([]);
  const [allCatalogImages, setAllCatalogImages] = useState<any[]>([]);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    minutes: 60,
    seconds: 0
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [recentClaims, setRecentClaims] = useState(Math.floor(Math.random() * 100) + 1);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);

  // Function to refresh vendor data after review submission
  const refreshVendorData = async () => {
    if (!vendorId) return;
    
    try {
      const vendorIdNum = parseInt(vendorId);
      if (isNaN(vendorIdNum)) return;

      const vendorData = await getVendorByFieldId(vendorIdNum.toString());
      if (vendorData) {
        setVendor(vendorData);
      }

      // Also refresh customer reviews
      const reviews = await getCustomerReviews(vendorIdNum.toString());
      setCustomerReviews(reviews);
    } catch (error) {
      console.error('Error refreshing vendor data:', error);
    }
  };

  // Load vendor data if vendorId is provided
  useEffect(() => {
    const loadVendorData = async () => {
      if (!vendorId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('Loading vendor with ID:', vendorId);
        
        // Convert string vendorId to number
        const vendorIdNum = parseInt(vendorId);
        if (isNaN(vendorIdNum)) {
          throw new Error('Invalid vendor ID');
        }

        // Fetch vendor data
        const vendorData = await getVendorByFieldId(vendorIdNum.toString());
        console.log('Fetched vendor data:', vendorData);
        
        if (!vendorData) {
          throw new Error("Vendor not found");
        }

        setVendor(vendorData);
        
        // Load highlighted catalog images
        try {
          const highlighted = await getHighlightedCatalogImages(vendorData.vendor_id);
          console.log('Loaded highlighted images:', highlighted);
          setHighlightedImages(highlighted);
        } catch (imgError) {
          console.error('Error loading highlighted images:', imgError);
          setHighlightedImages([]);
        }

        // Load all catalog images for gallery
        try {
          const allImages = await getAllCatalogImages(vendorData.vendor_id);
          console.log('Loaded all catalog images:', allImages);
          setAllCatalogImages(allImages);
        } catch (imgError) {
          console.error('Error loading all catalog images:', imgError);
          setAllCatalogImages([]);
        }

        // Load customer reviews from database
        try {
          const reviews = await getCustomerReviews(vendorData.vendor_id);
          console.log('Loaded customer reviews:', reviews);
          setCustomerReviews(reviews);
        } catch (reviewError) {
          console.error('Error loading customer reviews:', reviewError);
          setCustomerReviews([]);
        }

      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
        setError(err instanceof Error ? err.message : 'Failed to load vendor details');
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, [vendorId]);

  // Enhanced photographer data with modern structure (fallback for when no vendorId)
  const defaultPhotographer = {
    name: "Rajesh Kumar Photography",
    tagline: "Capturing Moments That Last Forever",
    bio: "Award-winning wedding and event photographer with 10+ years of capturing candid, creative, and timeless moments. Passionate about telling stories through the lens.",
    avatar: "/images/vendor.jpeg",
    coverImage: "/images/wedding.webp",
    rating: 4.8,
    reviewCount: 128,
    location: "AP and Telangana",
    category: "Photography",
    subcategory: "All Events",
    verified: true,
    responseTime: "2 hours",
    yearsActive: 10,
    experience: "10+ Years",
    additionalInfo: ["Drone Shots", "Photo Editing", "Same Day Delivery", "Award Winner"],
    highlights: [
      {
        image: "/images/image1.jpeg",
        title: "Wedding Photography",
        description: "Timeless moments captured beautifully"
      },
      {
        image: "/images/image2.jpeg",
        title: "Corporate Events",
        description: "Professional event documentation"
      }
    ],
    services: [
      { name: "Wedding Photography", description: "Full day coverage with 500+ edited photos", icon: Camera },
      { name: "Pre-Wedding Shoot", description: "2-3 hour romantic couple session", icon: Heart },
      { name: "Corporate Events", description: "Professional event documentation", icon: Building2 },
      { name: "Birthday Parties", description: "Fun and candid party photography", icon: Sparkles }
    ],
    packages: [
      {
        name: "Essential Package",
        features: ["6 hours coverage", "300+ edited photos", "Online gallery", "USB drive"],
        popular: false
      },
      {
        name: "Premium Package", 
        features: ["10 hours coverage", "600+ edited photos", "Online gallery", "USB drive", "Photo book", "Engagement shoot"],
        popular: true
      },
      {
        name: "Luxury Package",
        features: ["Full day coverage", "1000+ edited photos", "Online gallery", "USB drive", "Photo book", "Engagement shoot", "Video highlights", "Drone shots"],
        popular: false
      }
    ],
    portfolio: [
      "/images/image1.jpeg",
      "/images/image2.jpeg"
    ],
    reviews: [
      {
        name: "Priya & Arjun",
        rating: 5,
        text: "Rajesh captured our wedding beautifully! Every moment was perfect. His attention to detail and creative angles made our photos absolutely stunning.",
        date: "2 weeks ago",
        images: ["/images/wedding.webp"],
        verified: true
      },
      {
        name: "Corporate Client",
        rating: 5,
        text: "Professional, punctual, and amazing quality. Our event photos were outstanding and delivered on time. Highly recommended!",
        date: "1 month ago",
        verified: true
      },
      {
        name: "Sarah & Mike",
        rating: 5,
        text: "The pre-wedding shoot was incredible! Rajesh made us feel comfortable and the photos came out better than we imagined.",
        date: "3 weeks ago",
        verified: true
      }
    ],
    contact: {
      phone: "+91 95507 93699",
      email: "rajesh@photography.com",
      instagram: "@rajeshphotography",
      website: "www.rajeshphotography.com",
      whatsapp: "+91 95507 93699"
    }
  };

  // Use vendor data if available, otherwise fall back to default photographer data
  const photographer = vendor ? {
    name: vendor.brand_name || "Vendor",
    tagline: vendor.quick_intro || "Professional Services",
    bio: vendor.detailed_intro || "Professional vendor services",
    avatar: "/images/vendor.jpeg",
    coverImage: "/images/wedding.webp",
    rating: vendor.rating || 4.8,
    reviewCount: vendor.review_count || 128,
    location: vendor.address || "Location not specified",
    category: vendor.category || "Services",
    subcategory: vendor.subcategory || "All Events",
    verified: vendor.verified || true,
    responseTime: "2 hours",
    yearsActive: 10,
    experience: vendor.experience || "Professional",
    additionalInfo: vendor.highlight_features || [],
    highlights: highlightedImages.length > 0 ? highlightedImages.map(img => ({
      image: img.media_url,
      title: img.title || "Our Work",
      description: img.description || "Professional service delivery"
    })) : [
      {
        image: "/images/image1.jpeg",
        title: "Our Work",
        description: "Professional service delivery"
      }
    ],
    services: vendor.services || [],
    packages: vendor.packages || [],
    portfolio: allCatalogImages.map(img => img.media_url) || [],
    reviews: vendor.customer_reviews || [],
    contact: {
      phone: vendor.phone_number || "",
      email: vendor.email || "",
      instagram: vendor.instagram || "",
      website: "",
      whatsapp: vendor.whatsapp_number || vendor.phone_number || ""
    }
  } : defaultPhotographer;

  const portfolioImages = photographer.portfolio;

  // WhatsApp integration with friendly message
  const openWhatsApp = () => {
    const message = `Hi [Name] I just saw your amazing work and I'm super interested in your wedding photography 📸

💬 I'd love to talk with you and understand more before booking.
👉 Please send me:

My HAPPYMOMENTS10 coupon code

Available slots for a quick call / chat this week

Package details with the discount

How I can move forward after our discussion

I'm really excited to connect and explore working with you soon! ✨`;
    const whatsappUrl = `https://wa.me/${photographer.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { minutes: prevTime.minutes - 1, seconds: 59 };
        } else {
          // Timer expired, reset to 60 minutes
          return { minutes: 60, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photographer.highlights.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, photographer.highlights.length]);

  // Confetti effect
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Coupon reveal with animation
  const revealCoupon = () => {
    setShowCoupon(true);
    triggerConfetti();
    // Increment recent claims
    setRecentClaims(prev => prev + 1);
  };

  // Copy coupon code
  const copyCouponCode = () => {
    navigator.clipboard.writeText('HAPPYMOMENTS10');
    // You could add a toast notification here
  };


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photographer.highlights.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photographer.highlights.length) % photographer.highlights.length);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes ken-burns {
          0% {
            transform: scale(1) translateX(0) translateY(0);
          }
          50% {
            transform: scale(1.05) translateX(-2%) translateY(-1%);
          }
          100% {
            transform: scale(1.1) translateX(-4%) translateY(-2%);
          }
        }
        
        @keyframes card-slide-up {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-ken-burns {
          animation: ken-burns 20s ease-in-out infinite;
        }
        
        .animate-card-slide-up {
          animation: card-slide-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up:nth-child(1) { animation-delay: 0.1s; }
        .animate-fade-in-up:nth-child(2) { animation-delay: 0.2s; }
        .animate-fade-in-up:nth-child(3) { animation-delay: 0.3s; }
        .animate-fade-in-up:nth-child(4) { animation-delay: 0.4s; }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" onClick={openWhatsApp}>
      {/* Mobile Header - Compact */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm lg:hidden">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - Company info */}
            <div className="flex items-center gap-2">
              <img 
                src={photographer.avatar} 
                alt={photographer.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-blue-500"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">{photographer.name}</h1>
                <div className="flex items-center gap-1 -mt-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">{photographer.category}</Badge>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">{photographer.subcategory}</Badge>
                </div>
              </div>
            </div>

            {/* Right side - Rating and actions */}
            <div className="flex items-center gap-2">
              {/* Compact Rating */}
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg border border-amber-200">
                <Star className="w-3 h-3 text-amber-500 fill-current" />
                <span className="text-xs font-bold text-amber-700">{photographer.rating}</span>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex items-center gap-1">
                <Button 
                  onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex-shrink-0"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span className="hidden xs:inline">WA</span>
                </Button>
                <Button 
                  onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex-shrink-0"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  <span className="hidden xs:inline">Chat</span>
                </Button>
                <Button 
                  onClick={(e) => { e.stopPropagation(); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-sm flex-shrink-0"
                >
                  <Phone className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header - Original Rich Version */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm hidden lg:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={photographer.avatar} 
                alt={photographer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{photographer.name}</h1>
                  
                  {/* Premium Animated Rating Widget */}
                  <div 
                    className="relative group cursor-pointer self-end"
                    onMouseEnter={() => setShowRatingTooltip(true)}
                    onMouseLeave={() => setShowRatingTooltip(false)}
                  >
                    <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                      {/* Animated Stars with Shimmer */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => {
                          const starValue = i + 1;
                          const rating = photographer.rating; // 4.8
                          const isFilled = starValue <= Math.floor(rating); // 1,2,3,4
                          const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0; // 5th star half filled
                          
                          return (
                            <div key={i} className="relative group/star">
                              {/* Background star (always gray) */}
                              <Star className="w-5 h-5 text-gray-300" />
                              
                              {/* Filled portion */}
                              {isFilled && (
                                <div className="absolute inset-0">
                                  <Star 
                                    className="w-5 h-5 text-amber-500 fill-current group-hover:animate-pulse transition-all duration-700"
                                    style={{
                                      animationDelay: `${i * 0.15}s`,
                                      filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
                                    }}
                                  />
                  </div>
                              )}
                              
                              {/* Half filled portion */}
                              {isHalfFilled && (
                                <div className="absolute inset-0 overflow-hidden w-1/2">
                                  <Star 
                                    className="w-5 h-5 text-amber-500 fill-current group-hover:animate-pulse transition-all duration-700"
                                    style={{
                                      animationDelay: `${i * 0.15}s`,
                                      filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))'
                                    }}
                                  />
                </div>
                              )}
              </div>
                          );
                        })}
            </div>
                      
                      {/* Fused Rating Pill */}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full shadow-sm">
                        <span className="text-sm font-bold text-amber-800">
                          {photographer.rating}
                        </span>
                        <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                        <span className="text-xs font-semibold text-amber-700">
                          Top Rated
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Tooltip with Animation */}
                    {showRatingTooltip && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl px-4 py-3 shadow-2xl z-50 whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200">
                        <div className="text-center">
                          <div className="font-semibold text-white">Rated by {photographer.reviewCount} verified couples</div>
                          <div className="text-gray-300 mt-1 text-xs">Click to see reviews</div>
                        </div>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900/95 rotate-45"></div>
                      </div>
                    )}
                  </div>
                  
                </div>
                <div className="flex items-center gap-2 -mt-4">
                  <Badge variant="secondary" className="text-xs">{photographer.category}</Badge>
                  <Badge variant="outline" className="text-xs">{photographer.subcategory}</Badge>
                  </div>
                </div>
              </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                <MessageCircle className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">WhatsApp</span>
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                <MessageCircle className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Chat</span>
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); }}
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                <Phone className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Call</span>
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); }}
                className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all duration-200 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-150 rounded-xl"></div>
                <Calendar className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Visit</span>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}
                className="hover:bg-red-50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-red-100 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
                <Heart className={`w-5 h-5 relative z-10 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-blue-100 scale-0 group-active:scale-100 transition-transform duration-150 rounded-lg"></div>
                <Share2 className="w-5 h-5 text-gray-600 relative z-10" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30">
        
        {/* Mobile-First Simple Layout */}
        <div className="block lg:hidden">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Hero Card - Clean and Simple */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-amber-200/50 mb-6">
              {/* Company Name */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-black text-gray-900 mb-2">{photographer.name}</h1>
                <p className="text-amber-600 font-medium">{photographer.tagline}</p>
              </div>

              {/* Owner Info */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-blue-500 shadow-lg">
                  <img 
                    src="/images/vendor.jpeg" 
                    alt={vendor?.spoc_name || "Contact Person"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{vendor?.spoc_name || "Contact Person"}</div>
                  <div className="text-sm text-blue-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Contact Person
                  </div>
                </div>
              </div>

              {/* Category Badges */}
              <div className="flex justify-center gap-2 mb-4">
                <Badge className="px-3 py-1 text-xs bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full">
                  <Camera className="w-3 h-3 mr-1" />
                  {photographer.category}
                </Badge>
                <Badge className="px-3 py-1 text-xs bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full">
                  <Calendar className="w-3 h-3 mr-1" />
                  {photographer.subcategory}
                </Badge>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="font-bold text-amber-600">{photographer.location}</div>
                  <div className="text-xs text-gray-600">Location</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600">{photographer.experience}</div>
                  <div className="text-xs text-gray-600">Experience</div>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 text-lg font-bold rounded-xl shadow-lg"
                onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat to Book Now
              </Button>
            </div>

            {/* Mobile Gallery */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg h-64 mb-6">
              <img 
                src={photographer.highlights[currentSlide].image} 
                alt={photographer.highlights[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold mb-1">{photographer.highlights[currentSlide].title}</h3>
                <p className="text-sm opacity-90">{photographer.highlights[currentSlide].description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout (unchanged) */}
        <div className="hidden lg:block min-h-[80vh]">
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-8xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[60vh]">
              
              {/* Left Side - Main Content Card */}
              <div className="flex justify-center lg:justify-start lg:col-span-7 relative">
                {/* Subtle divider line */}
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                <div className="w-full max-w-[800px] animate-card-slide-up">
                  {/* Main Info Card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border-2 border-amber-200/50">
                    
                    {/* Name and Profile Row */}
                    <div className="flex items-start mb-8">
                      <h1 className="text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight">
                        {photographer.name}
                      </h1>
                      <div className="flex flex-col items-center -ml-6">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 flex-shrink-0 shadow-lg">
                          <img 
                            src="/images/vendor.jpeg" 
                            alt={vendor?.spoc_name || "Contact Person"}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="text-center mt-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-gray-200">
                          <div className="text-lg font-bold text-gray-800">{vendor?.spoc_name || "Contact Person"}</div>
                          <div className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Contact Person
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Badges Row */}
                    <div className="flex items-center gap-4 mb-10 -mt-6">
                      <Badge className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        {photographer.category}
                      </Badge>
                      <Badge className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {photographer.subcategory}
                      </Badge>
                    </div>

                    {/* Tagline */}
                    <p className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8 leading-relaxed relative">
                      <span className="relative z-10">{vendor?.quick_intro || photographer.tagline}</span>
                      <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    </p>
                    
                    {/* Cultural Greeting */}
                    {(vendor?.caption || photographer.name) && (
                      <p className="text-xl text-amber-700 font-medium mb-10 italic">
                        "{vendor?.caption || 'Namaskaram! Capturing your precious moments with expertise'}"
                      </p>
                    )}

                    {/* Bio */}
                    <p className="text-xl text-gray-700 mb-12 leading-relaxed">
                      {vendor?.detailed_intro || photographer.bio}
                    </p>

                    {/* Details Icons Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                      <div className="flex items-center gap-6 text-gray-700 p-8 bg-gradient-to-r from-amber-50/70 to-orange-50/70 rounded-3xl border-2 border-amber-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-lg">
                          <MapPin className="w-10 h-10 text-amber-700" />
                        </div>
                        <div>
                          <span className="font-bold text-2xl text-gray-800">Location</span>
                          <p className="text-lg text-gray-600">
                            {photographer.vendor?.additional_info?.service_areas && photographer.vendor.additional_info.service_areas.length > 0 
                              ? `Serving ${photographer.vendor.additional_info.service_areas.join(', ')}`
                              : photographer.location || "Service areas not specified"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-gray-700 p-8 bg-gradient-to-r from-red-50/70 to-pink-50/70 rounded-3xl border-2 border-red-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-300 shadow-lg">
                          <Trophy className="w-10 h-10 text-red-700" />
                        </div>
                        <div>
                          <span className="font-bold text-2xl text-gray-800">{photographer.experience}</span>
                          <p className="text-lg text-gray-600">Professional Experience</p>
                        </div>
                      </div>
                      
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8">
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white px-12 py-10 text-3xl font-black shadow-2xl hover:scale-105 hover:shadow-green-500/50 active:scale-95 transition-all duration-300 rounded-3xl border-2 border-green-400/30 hover:border-green-300/50 relative overflow-hidden group"
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                      >
                        <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-3xl"></div>
                        <MessageCircle className="w-8 h-8 mr-4 relative z-10" />
                        <span className="relative z-10">Chat to Book Now</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Gallery Carousel */}
              <div className="flex justify-center lg:justify-end lg:col-span-5 h-full">
                <div className="w-full max-w-[600px] h-full flex flex-col animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
                    <img 
                      src={photographer.highlights[currentSlide].image} 
                      alt={photographer.highlights[currentSlide].title}
                      className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
                        style={{ imageRendering: 'crisp-edges' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Image Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{photographer.highlights[currentSlide].title}</h3>
                        <p className="text-base text-white/95 font-medium drop-shadow-md">{photographer.highlights[currentSlide].description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Navigation */}
                  <div className="flex justify-center mt-6 gap-3">
                    {photographer.highlights.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          index === currentSlide ? 'bg-blue-600 scale-125 shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Additional Info Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8">
              {[
                { text: "Drone Shots", icon: Camera, color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", textColor: "text-blue-800" },
                { text: "Photo Editing", icon: Video, color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50", textColor: "text-purple-800" },
                { text: "Same Day Delivery", icon: Clock, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50", textColor: "text-green-800" },
                { text: "Award Winner", icon: Award, color: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", textColor: "text-amber-800" }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r ${item.bg} border-2 border-transparent hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <item.icon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                    </div>
                    <span className={item.textColor}>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights of Vendor Section */}
            {vendor?.highlight_features && vendor.highlight_features.length > 0 && (
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    Highlights of Vendor
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">What makes us stand out from the rest</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vendor.highlight_features.map((feature, index) => (
                      <div 
                        key={index}
                        className="group p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-800 transition-colors duration-300">
                              {feature}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Section */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-amber-100">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-amber-600" />
                  Our Services
                </h2>
                <p className="text-gray-600 mb-8 text-lg">Specialized in traditional ceremonies and modern celebrations</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { name: "Pre-Wedding Shoots", description: "Engagement, Haldi, Mehendi ceremonies", icon: Heart, color: "from-pink-500 to-rose-500", bg: "from-pink-50 to-rose-50" },
                    { name: "Wedding Day Coverage", description: "Full day from Muhurtham to reception", icon: Camera, color: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50" },
                    { name: "Reception Photography", description: "Evening celebrations and ceremonies", icon: Sparkles, color: "from-purple-500 to-indigo-500", bg: "from-purple-50 to-indigo-50" },
                    { name: "Traditional Rituals", description: "Mangalsutra, Oonjal, Kanyadaan", icon: Award, color: "from-red-500 to-pink-500", bg: "from-red-50 to-pink-50" },
                    { name: "Drone Photography", description: "Aerial shots of venue and ceremonies", icon: Zap, color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                    { name: "Photo & Video Package", description: "Complete coverage with editing", icon: Video, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" }
                  ].map((service, index) => (
                    <div 
                      key={index}
                      className={`group p-8 bg-gradient-to-br ${service.bg} rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-4 bg-gradient-to-r ${service.color} rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                          <service.icon className="w-8 h-8 text-white" />
                          </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{service.name}</h3>
                          <p className="text-gray-600 text-base leading-relaxed">{service.description}</p>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Packages Section - Only show if vendor has packages in database */}
            {photographer.packages && photographer.packages.length > 0 && (
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-red-100">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <Award className="w-8 h-8 text-red-600" />
                    South Indian Wedding Packages
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">Complete packages designed for South Indian wedding traditions</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {photographer.packages.map((pkg, index) => (
                      <div 
                        key={index}
                        className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                          pkg.popular 
                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg' 
                            : 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
                        }`}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2 text-sm font-bold">⭐ Most Popular</Badge>
                          </div>
                        )}
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold mb-3 text-gray-800">{pkg.name}</h3>
                          {pkg.price && (
                            <div className="text-lg font-bold text-blue-600 mb-2">{pkg.price}</div>
                          )}
                          <div className="text-sm text-gray-500">
                            {pkg.description || "Complete package for South Indian weddings"}
                          </div>
                        </div>
                        <ul className="space-y-3 mb-8">
                          {(pkg.features || []).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-gray-700">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-sm font-medium">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
                            pkg.popular 
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          }`}
                          onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                        >
                          Select {pkg.name} Package
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Gallery */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Video className="w-8 h-8 text-blue-600" />
                  Catalog
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {allCatalogImages.length} Images
                  </span>
                </h2>
                
                {allCatalogImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photographer.portfolio.map((image, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div 
                          className="relative group cursor-pointer overflow-hidden rounded-xl"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(image); }}
                        >
                          <img 
                            src={image} 
                            alt={`Catalog ${index + 1}`}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="text-white text-center">
                              <Camera className="w-8 h-8 mx-auto mb-2" />
                              <span className="text-sm font-medium">View Full Size</span>
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl">
                        <div className="relative">
                          <img 
                            src={image} 
                            alt={`Catalog ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Catalog Images</h3>
                    <p className="text-gray-500 mb-4">This vendor hasn't added any catalog images yet.</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Refresh Page
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-600" />
                    Customer Reviews
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-4xl font-bold text-green-600">
                        {customerReviews.length > 0 
                          ? (customerReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / customerReviews.filter(r => r.rating).length).toFixed(1)
                          : '0.0'
                        }★
                      </div>
                      <div className="text-sm text-gray-600">
                        from {customerReviews.length} {customerReviews.length === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                    {isAuthenticated && customer && (
                      <Button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add a Review
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {customerReviews && customerReviews.length > 0 ? (
                    customerReviews.map((review, index) => (
                    <div key={index} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {review.customer_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-800">{review.customer_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                              <Badge className="bg-green-600 text-white px-2 py-1 text-xs">✓ Verified</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-lg">{review.review}</p>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500">This vendor hasn't received any reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Contact Card - Enhanced for Maximum Conversions */}
            <Card className="sticky top-4 bg-white/95 backdrop-blur-md border-2 border-white/30 shadow-2xl relative overflow-hidden">
              {/* Confetti Effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="text-6xl">🎉</div>
                  </div>
                  <div className="absolute top-4 left-1/4 animate-bounce" style={{ animationDelay: '0.2s' }}>
                    <div className="text-4xl">✨</div>
                  </div>
                  <div className="absolute top-6 right-1/4 animate-bounce" style={{ animationDelay: '0.4s' }}>
                    <div className="text-4xl">🎊</div>
                  </div>
                </div>
              )}
              
              <CardContent className="p-6 relative z-10">
                {/* Headline Hook */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Best South Indian Wedding Photographer – Limited Spot!</h3>
                  </div>

                {/* Social Proof Badge */}
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-red-700">{recentClaims} people claimed this offer today!</span>
                  </div>
                </div>

                {/* Urgency Banner */}
                <div className="mb-4 p-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-2xl shadow-lg border-2 border-green-400/30">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span className="text-lg font-bold">Contact Now in next 60 minutes & get 10% OFF!</span>
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>

                {/* Starting Price Highlight */}
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-md">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">₹</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-800">
                        {vendor.starting_price 
                          ? `Starting ₹${vendor.starting_price.toLocaleString()}`
                          : 'Contact for pricing'
                        }
                      </div>
                      <div className="text-sm text-blue-600 font-semibold">Premium Wedding Photography</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                </div>

                {/* Animated Countdown Timer */}
                <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 text-center">
                  <div className="text-sm font-semibold text-red-700 mb-2">⏰ Limited Time Offer Ends In:</div>
                  <div className={`text-4xl font-black text-red-800 flex items-center justify-center gap-2 ${timeLeft.minutes < 5 ? 'animate-pulse' : ''}`}>
                    <span className="bg-red-100 px-3 py-2 rounded-lg">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-red-500">:</span>
                    <span className="bg-red-100 px-3 py-2 rounded-lg">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-xs text-red-600 mt-2">Minutes : Seconds</div>
                </div>

                {/* Testimonials */}
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">P&A</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Priya & Arjun</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"Rajesh captured our wedding beautifully! Every moment was perfect."</p>
                </div>

                {/* Coupon Reveal Section */}
                {showCoupon && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-300 animate-bounce">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-yellow-800 mb-3">🎉 Your Secret Coupon Code!</h4>
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-yellow-200 px-4 py-2 rounded-lg border-2 border-yellow-400">
                          <span className="text-2xl font-black text-yellow-800">HAPPYMOMENTS10</span>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                          onClick={copyCouponCode}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">Use this code when you contact us!</p>
                    </div>
                  </div>
                )}
                
                {/* Enhanced CTA Buttons */}
                <div className="space-y-4">
                  {/* WhatsApp Quick Chat Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white py-8 text-2xl font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group animate-pulse"
                    onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  >
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-2xl"></div>
                    <MessageCircle className="w-8 h-8 mr-4 relative z-10" />
                    <span className="relative z-10">💬 WhatsApp Quick Chat</span>
                    <div className="absolute top-0 right-0 text-3xl animate-bounce">🚀</div>
                  </Button>
                  
                  {/* Unlock Secret Offer Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 text-white py-8 text-2xl font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
                    onClick={(e) => { e.stopPropagation(); revealCoupon(); }}
                  >
                    <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 rounded-2xl"></div>
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <span>🔓</span>
                      <span>Unlock My Secret Offer</span>
                      <span>🎁</span>
                    </div>
                  </Button>
                  
                  {/* Request Callback Button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-3 border-purple-500 text-purple-700 hover:bg-purple-50 hover:border-purple-600 py-6 text-lg font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                    onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    Request Callback
                  </Button>
                </div>
                
                {/* Benefits */}
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">Free consultation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">Same day response</span>
                  </div>
                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">Flexible payment options</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-purple-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors border border-purple-200">
                    <Phone className="w-6 h-6 text-purple-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{photographer.contact.phone}</span>
                      <p className="text-sm text-gray-600">Call for immediate response</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg hover:from-amber-100 hover:to-orange-100 transition-colors border border-amber-200">
                    <Mail className="w-6 h-6 text-amber-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{photographer.contact.email}</span>
                      <p className="text-sm text-gray-600">Email for detailed quotes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg hover:from-pink-100 hover:to-rose-100 transition-colors border border-pink-200">
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{photographer.contact.instagram}</span>
                      <p className="text-sm text-gray-600">Follow for latest work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:from-emerald-100 hover:to-teal-100 transition-colors border border-emerald-200">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">Venue Address</div>
                      <p className="text-sm text-gray-600 mb-2">123 Celebration Street, Hyderabad, Telangana 500001</p>
                      <button 
                        onClick={() => window.open('https://maps.google.com/?q=123+Celebration+Street+Hyderabad+Telangana+500001', '_blank')}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 flex items-center gap-1"
                      >
                        View on Google Maps
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies Section */}
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-blue-100">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <Award className="w-6 h-6 text-blue-600" />
                  Booking Policies
                </h3>
                <div className="space-y-6">
                  
                  {/* Payment Terms Policy */}
                  {vendor.booking_policies?.payment_terms && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">₹</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-green-800 mb-2">Payment Terms</h4>
                          <p className="text-sm text-green-700 leading-relaxed">
                            {vendor.booking_policies.payment_terms}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  {vendor.booking_policies?.cancellation_policy && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">↩</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-800 mb-2">Cancellation Policy</h4>
                          <p className="text-sm text-orange-700 leading-relaxed">
                            {vendor.booking_policies.cancellation_policy}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Requirements */}
                  {vendor.booking_policies?.booking_requirements && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-800 mb-2">Booking Requirements</h4>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            {vendor.booking_policies.booking_requirements}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advance Payment */}
                  {vendor.booking_policies?.advance && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-sm font-bold">₹</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-purple-800 mb-2">Advance Payment</h4>
                          <p className="text-sm text-purple-700 leading-relaxed">
                            {vendor.booking_policies.advance}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no policies are available */}
                  {!vendor.booking_policies?.payment_terms && !vendor.booking_policies?.cancellation_policy && !vendor.booking_policies?.booking_requirements && !vendor.booking_policies?.advance && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No booking policies available for this vendor.</p>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
          onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
        >
          <MessageCircle className="w-6 h-6 mr-2" />
          Chat Now
        </Button>
      </div>

      {/* Add Review Modal */}
      {isAuthenticated && customer && vendorId && (
        <AddReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          vendorId={vendorId}
          onReviewSubmitted={refreshVendorData}
        />
      )}

      </div>
    </>
  );
};

export default VendorProfile;

