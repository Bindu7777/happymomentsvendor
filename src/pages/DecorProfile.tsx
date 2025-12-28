import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Instagram, Facebook, Heart, Share2, Calendar, Clock, CheckCircle, Camera, Video, Users, Award, MessageCircle, Zap, Trophy, Sparkles, ArrowRight, Play, Pause, Building2, Flower2, Youtube } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const DecorProfile = () => {
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
  const [recentClaims, setRecentClaims] = useState(34);
  const [showRatingTooltip, setShowRatingTooltip] = useState(false);

  // Enhanced decorator data with modern structure
  const decorator = {
    name: "Elegant Events Decorators",
    ownerName: "Rajesh Sharma",
    tagline: "Creating Magical Moments with Elegant Designs",
    bio: "Premier event decoration company with 10+ years of experience in creating stunning wedding and corporate event setups. Specializing in floral arrangements, balloon decorations, and complete venue transformations.",
    avatar: "/images/vendor.jpeg",
    coverImage: "/images/wedding.webp",
    rating: 4.6,
    reviewCount: 120,
    location: "Hyderabad, Telangana",
    category: "Decor & Design",
    subcategory: "All Events",
    verified: true,
    responseTime: "2 hours",
    yearsActive: 10,
    experience: "10+ Years",
    additionalInfo: ["Custom Themes", "Balloon Art", "Floral Design", "Lighting Setup"],
    highlights: [
      {
        image: "/images/image1.jpeg",
        title: "Wedding Stage Decoration",
        description: "Elegant floral arrangements for your special day"
      },
      {
        image: "/images/image2.jpeg",
        title: "Birthday Party Setup",
        description: "Colorful balloon decorations for celebrations"
      }
    ],
    services: [
      { name: "Balloon Decoration", description: "Birthday and anniversary balloon setups", icon: Sparkles },
      { name: "Floral Stage Decoration", description: "Wedding and engagement stage designs", icon: Flower2 },
      { name: "Corporate Event Backdrops", description: "Professional event backdrops", icon: Building2 },
      { name: "Themed Party Decorations", description: "Custom themed party setups", icon: Camera },
      { name: "Lighting & Ambience Setup", description: "Complete lighting solutions", icon: Zap },
      { name: "Customized Entrance Arches", description: "Beautiful entrance decorations", icon: Award }
    ],
    packages: [
      {
        name: "Basic Package",
        features: ["Birthday balloon setup", "Basic lighting", "2-hour setup time", "Standard balloons"],
        popular: false,
        startingPrice: "₹4,999"
      },
      {
        name: "Premium Package", 
        features: ["Wedding stage decoration", "Premium flowers", "Lighting setup", "6-hour service", "Custom theme", "Photography support"],
        popular: true,
        startingPrice: "₹25,000"
      },
      {
        name: "Corporate Package",
        features: ["Corporate backdrop", "Professional setup", "Brand customization", "4-hour service", "Premium materials", "On-site coordination"],
        popular: false,
        startingPrice: "₹15,000"
      }
    ],
    portfolio: [
      "/images/image1.jpeg",
      "/images/image2.jpeg"
    ],
    reviews: [],
    contact: {
      phone: "+91 98765 43210",
      email: "info@elegantevents.com",
      instagram: "@eleganteventsdecor",
      facebook: "/ElegantEventsDecor",
      youtube: "Elegant Events Official",
      website: "www.elegantevents.com",
      whatsapp: "+91 98765 43210",
      address: "3rd Floor, Lotus Plaza, Banjara Hills, Hyderabad, Telangana – 500034"
    }
  };

  const portfolioImages = decorator.portfolio;

  // WhatsApp integration with friendly message
  const openWhatsApp = () => {
    const message = `Hi ${decorator.ownerName}! I just saw your amazing decoration work and I'm super interested in your event decoration services 🎨

💬 I'd love to talk with you and understand more before booking.
👉 Please send me:

My ELEGANTDECOR10 coupon code

Available slots for a quick call / chat this week

Package details with the discount

How I can move forward after our discussion

I'm really excited to connect and explore working with you soon! ✨`;
    const whatsappUrl = `https://wa.me/${decorator.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
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
        setCurrentSlide((prev) => (prev + 1) % decorator.highlights.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, decorator.highlights.length]);

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
    navigator.clipboard.writeText('ELEGANTDECOR10');
    // You could add a toast notification here
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + portfolioImages.length) % portfolioImages.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % decorator.highlights.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + decorator.highlights.length) % decorator.highlights.length);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50" onClick={openWhatsApp}>
      {/* Mobile Header - Compact */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm lg:hidden">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - Company info */}
            <div className="flex items-center gap-2">
              <img 
                src={decorator.avatar} 
                alt={decorator.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-pink-500"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">{decorator.name}</h1>
                <div className="flex items-center gap-1 -mt-1">
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">{decorator.category}</Badge>
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">{decorator.subcategory}</Badge>
                </div>
              </div>
            </div>

            {/* Right side - Rating and actions */}
            <div className="flex items-center gap-2">
              {/* Compact Rating */}

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
                src={decorator.avatar} 
                alt={decorator.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
              />
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900">{decorator.name}</h1>
                  
                  
                </div>
                <div className="flex items-center gap-2 -mt-4">
                  <Badge variant="secondary" className="text-xs">{decorator.category}</Badge>
                  <Badge variant="outline" className="text-xs">{decorator.subcategory}</Badge>
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

      {/* Hero Section - Simplified Mobile Layout */}
      <div className="relative bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/30">
        
        {/* Mobile-First Simple Layout */}
        <div className="block lg:hidden">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Hero Card - Clean and Simple */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-pink-200/50 mb-6">
              {/* Company Name */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-black text-gray-900 mb-2">{decorator.name}</h1>
                <p className="text-pink-600 font-medium">{decorator.tagline}</p>
              </div>

              {/* Owner Info */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-pink-500 shadow-lg">
                  <img 
                    src={decorator.avatar} 
                    alt={decorator.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{decorator.ownerName}</div>
                  <div className="text-sm text-pink-600 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Owner & Designer
                  </div>
                </div>
              </div>

              {/* Category Badges */}
              <div className="flex justify-center gap-2 mb-4">
                <Badge className="px-3 py-1 text-xs bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-full">
                  <Flower2 className="w-3 h-3 mr-1" />
                  {decorator.category}
                </Badge>
                <Badge className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {decorator.subcategory}
                </Badge>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="font-bold text-pink-600">{decorator.location}</div>
                  <div className="text-xs text-gray-600">Location</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600">{decorator.experience}</div>
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
                src={decorator.highlights[currentSlide].image} 
                alt={decorator.highlights[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold mb-1">{decorator.highlights[currentSlide].title}</h3>
                <p className="text-sm opacity-90">{decorator.highlights[currentSlide].description}</p>
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
                  <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                  <div className="w-full max-w-[800px] animate-card-slide-up">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border-2 border-pink-200/50">
                      
                      {/* Name and Profile Row */}
                      <div className="flex items-start mb-8">
                        <div className="flex-1">
                          <h1 className="text-6xl font-black text-gray-900 leading-tight tracking-tight">
                            {decorator.name}
                          </h1>
                        </div>
                        <div className="flex flex-col items-center -ml-6">
                          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-pink-500 flex-shrink-0 shadow-lg">
                            <img 
                              src={decorator.avatar} 
                              alt={decorator.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <div className="text-center mt-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-gray-200">
                            <div className="text-lg font-bold text-gray-800">{decorator.ownerName}</div>
                            <div className="text-sm font-semibold text-pink-600 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Owner & Designer
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Category Badges Row */}
                      <div className="flex items-center gap-4 mb-10 -mt-6">
                        <Badge className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                          <Flower2 className="w-4 h-4" />
                          {decorator.category}
                        </Badge>
                        <Badge className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          {decorator.subcategory}
                        </Badge>
                      </div>

                      {/* Tagline */}
                      <p className="text-4xl font-bold text-gray-800 mb-8 leading-relaxed relative">
                        <span className="relative z-10">{decorator.tagline}</span>
                        <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
                      </p>
                      
                      {/* Cultural Greeting */}
                      <p className="text-xl text-pink-700 font-medium mb-10 italic">
                        "Namaskaram! Creating beautiful memories with elegant decorations for all your special occasions"
                      </p>

                      {/* Bio */}
                      <p className="text-xl text-gray-700 mb-12 leading-relaxed">
                        Premier event decoration specialists with 10+ years of experience in wedding, corporate, and party decorations. Expert in balloon artistry, floral arrangements, themed setups, and complete venue transformations across Hyderabad and Telangana.
                      </p>

                      {/* Details Icons Row */}
                      <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="flex items-center gap-6 text-gray-700 p-8 bg-gradient-to-r from-pink-50/70 to-rose-50/70 rounded-3xl border-2 border-pink-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full flex items-center justify-center border-2 border-pink-300 shadow-lg">
                            <MapPin className="w-10 h-10 text-pink-700" />
                          </div>
                          <div>
                            <span className="font-bold text-2xl text-gray-800">{decorator.location}</span>
                            <p className="text-lg text-gray-600">Serving Telangana</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-gray-700 p-8 bg-gradient-to-r from-purple-50/70 to-indigo-50/70 rounded-3xl border-2 border-purple-200/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-purple-300 shadow-lg">
                            <Trophy className="w-10 h-10 text-purple-700" />
                          </div>
                          <div>
                            <span className="font-bold text-2xl text-gray-800">{decorator.experience}</span>
                            <p className="text-lg text-gray-600">200+ Events Decorated</p>
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
                        src={decorator.highlights[currentSlide].image} 
                        alt={decorator.highlights[currentSlide].title}
                        className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Image Info Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{decorator.highlights[currentSlide].title}</h3>
                          <p className="text-base text-white/95 font-medium drop-shadow-md">{decorator.highlights[currentSlide].description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Navigation */}
                    <div className="flex justify-center mt-6 gap-3">
                      {decorator.highlights.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'bg-pink-600 scale-125 shadow-lg' : 'bg-gray-300 hover:bg-gray-400'
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

      {/* Section Divider */}
      <div className="h-16 bg-gradient-to-b from-transparent to-slate-50"></div>

      {/* Quick Info Strip */}
      <div className="bg-gradient-to-r from-slate-50 via-pink-50/40 to-rose-50/40 border-b border-pink-200/50">
        <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8 text-center">
            <div className="group flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-pink-200 hover:scale-105">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300">
                <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
              <div className="text-2xl sm:text-4xl font-black text-pink-800 mb-1 sm:mb-2">4-8</div>
              <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">Hours Setup</div>
              <div className="text-xs sm:text-sm text-pink-700 font-medium">Complete decoration</div>
            </div>
            <div className="group flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-purple-200 hover:scale-105">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
              <div className="text-2xl sm:text-4xl font-black text-purple-800 mb-1 sm:mb-2">10+</div>
              <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">Years Experience</div>
              <div className="text-xs sm:text-sm text-purple-700 font-medium">Event Decoration</div>
            </div>
            <div className="group flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-green-200 hover:scale-105">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <Star className="w-5 h-5 sm:w-8 sm:h-8 text-white fill-current" />
          </div>
              <div className="text-2xl sm:text-4xl font-black text-green-800 mb-1 sm:mb-2">120</div>
              <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">5-Star Reviews</div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">Happy Clients</div>
            </div>
            <div className="group flex flex-col items-center p-4 sm:p-8 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-orange-200 hover:scale-105">
              <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center mb-2 sm:mb-4 shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="text-2xl sm:text-4xl font-black text-orange-800 mb-1 sm:mb-2">200+</div>
              <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">Events Decorated</div>
              <div className="text-xs sm:text-sm text-orange-700 font-medium">Across Telangana</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-16 bg-gradient-to-b from-slate-50 to-white"></div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            

            {/* Additional Info Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-8">
              {[
                { text: "Custom Themes", icon: Sparkles, color: "from-pink-500 to-rose-500", bg: "from-pink-50 to-rose-50", textColor: "text-pink-800" },
                { text: "Balloon Art", icon: Camera, color: "from-purple-500 to-indigo-500", bg: "from-purple-50 to-indigo-50", textColor: "text-purple-800" },
                { text: "Floral Design", icon: Flower2, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50", textColor: "text-green-800" },
                { text: "Lighting Setup", icon: Zap, color: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", textColor: "text-amber-800" }
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

            {/* Services Section */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-pink-100">
              <CardContent className="p-4 sm:p-8">
                <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Flower2 className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600" />
                  Our Services
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-8 text-sm sm:text-lg">Complete decoration solutions for all your special events</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  {decorator.services.map((service, index) => (
                    <div 
                      key={index}
                      className="group p-4 sm:p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                          <service.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                          </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{service.name}</h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{service.description}</p>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


            {/* Packages Section */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
              <CardContent className="p-4 sm:p-8">
                <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  Event Decoration Packages
                </h2>
                <p className="text-gray-600 mb-4 sm:mb-8 text-sm sm:text-lg">Complete packages designed for different event types and budgets</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                  {decorator.packages.map((pkg, index) => (
                    <div 
                      key={index}
                      className={`relative p-4 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                        pkg.popular 
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg' 
                          : 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 text-sm font-bold">⭐ Most Popular</Badge>
                        </div>
                      )}
                      <div className="text-center mb-4 sm:mb-6">
                        <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">{pkg.name}</h3>
                        <div className="text-xl sm:text-2xl font-black text-purple-600 mb-1 sm:mb-2">{pkg.startingPrice}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Starting price for complete setup</div>
                      </div>
                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-700">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full py-6 text-xl font-black rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl ${
                          pkg.popular 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-500/25' 
                            : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/25'
                        }`}
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                      >
                        Select {pkg.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Gallery */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-blue-600" />
                  Portfolio Gallery
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {decorator.portfolio.map((image, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <div 
                          className="relative group cursor-pointer overflow-hidden rounded-xl"
                          onClick={(e) => { e.stopPropagation(); setSelectedImage(image); }}
                        >
                          <img 
                            src={image} 
                            alt={`Portfolio ${index + 1}`}
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
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-auto rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
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
                  <div className="text-right">
                  </div>
                </div>
                
                <div className="space-y-6">
                  {decorator.reviews && decorator.reviews.length > 0 ? (
                    decorator.reviews.map((review, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {review.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">{review.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                                {review.verified && (
                                  <Badge className="bg-green-600 text-white px-2 py-1 text-xs">✓ Verified</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-lg">{review.text}</p>
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
                  <h3 className="text-lg font-bold text-gray-800">Best Event Decorator in Hyderabad – Limited Slots!</h3>
                  </div>

                {/* Social Proof Badge */}
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full border border-pink-200">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-pink-700">{recentClaims} people booked this month!</span>
                  </div>
                </div>

                {/* Urgency Banner */}
                <div className="mb-4 p-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-2xl shadow-lg border-2 border-green-400/30">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span className="text-lg font-bold">Contact Now & get 10% OFF!</span>
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
                      <div className="text-2xl font-black text-blue-800">Starting ₹4,999</div>
                      <div className="text-sm text-blue-600 font-semibold">Complete Event Decoration</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  </div>
                </div>

                {/* Animated Countdown Timer */}
                <div className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 text-center">
                  <div className="text-sm font-semibold text-pink-700 mb-2">⏰ Limited Time Offer Ends In:</div>
                  <div className={`text-4xl font-black text-pink-800 flex items-center justify-center gap-2 ${timeLeft.minutes < 5 ? 'animate-pulse' : ''}`}>
                    <span className="bg-pink-100 px-3 py-2 rounded-lg">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-pink-500">:</span>
                    <span className="bg-pink-100 px-3 py-2 rounded-lg">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="text-xs text-pink-600 mt-2">Minutes : Seconds</div>
                </div>

                {/* Testimonials */}
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">PR</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Priya R.</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"Elegant Events made my daughter's birthday magical! The balloon theme setup was vibrant and beautiful."</p>
                </div>

                {/* Coupon Reveal Section */}
                {showCoupon && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-300 animate-bounce">
                    <div className="text-center">
                      <h4 className="text-lg font-bold text-yellow-800 mb-3">🎉 Your Secret Coupon Code!</h4>
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-yellow-200 px-4 py-2 rounded-lg border-2 border-yellow-400">
                          <span className="text-2xl font-black text-yellow-800">ELEGANTDECOR10</span>
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
                      <span className="text-sm font-semibold text-gray-700">Custom packages available</span>
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
                      <span className="font-semibold text-gray-800">{decorator.contact.phone}</span>
                      <p className="text-sm text-gray-600">Call for immediate response</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg hover:from-pink-100 hover:to-rose-100 transition-colors border border-pink-200">
                    <Mail className="w-6 h-6 text-pink-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{decorator.contact.email}</span>
                      <p className="text-sm text-gray-600">Email for detailed quotes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg hover:from-rose-100 hover:to-pink-100 transition-colors border border-rose-200">
                    <Instagram className="w-6 h-6 text-rose-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{decorator.contact.instagram}</span>
                      <p className="text-sm text-gray-600">Follow for latest work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors border border-blue-200">
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{decorator.contact.facebook}</span>
                      <p className="text-sm text-gray-600">Like our page for updates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors border border-red-200">
                    <Youtube className="w-6 h-6 text-red-600" />
                    <div>
                      <span className="font-semibold text-gray-800">{decorator.contact.youtube}</span>
                      <p className="text-sm text-gray-600">Watch our decoration videos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:from-emerald-100 hover:to-teal-100 transition-colors border border-emerald-200">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">Office Address</div>
                      <p className="text-sm text-gray-600 mb-2">{decorator.contact.address}</p>
                      <button 
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(decorator.contact.address)}`, '_blank')}
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
                  
                  {/* Advance Payment Policy */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">₹</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800 mb-2">Advance Payment Policy</h4>
                        <p className="text-sm text-green-700 leading-relaxed">
                          40% of the total decoration cost must be paid upfront to confirm the booking. 
                          The remaining 60% should be settled on the day of the event setup.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation & Refund Policy */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">↩</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-800 mb-2">Cancellation & Refund Policy</h4>
                        <p className="text-sm text-orange-700 leading-relaxed">
                          Cancellations made 5 days before the event will receive a 60% refund of the advance. 
                          Cancellations within 5 days are non-refundable due to material procurement.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service Commitment Policy */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-800 mb-2">Service Commitment Policy</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Our team will arrive 2-4 hours before the event for setup. All decorations will be as per 
                          agreed design. Any changes during setup may incur additional charges.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Additional Information - At Bottom */}
      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-16 lg:hidden">
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-blue-100">
          <CardContent className="p-4 sm:p-8">
            <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              Additional Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              {/* Team Size */}
              <div className="group p-4 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">Our Team Size</h3>
                    <p className="text-2xl sm:text-3xl font-black text-blue-600 mb-2">20</p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Experienced decoration professionals ready to make your event spectacular</p>
                  </div>
                </div>
              </div>

              {/* Service Guarantee */}
              <div className="group p-4 sm:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">Service Guarantee</h3>
                    <p className="text-2xl sm:text-3xl font-black text-green-600 mb-2">100%</p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">On-time service guarantee with quality assurance for all events</p>
                  </div>
                </div>
              </div>

              {/* Coverage Area */}
              <div className="group p-4 sm:p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <MapPin className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">Coverage Area</h3>
                    <p className="text-lg font-bold text-purple-600 mb-2">Hyderabad & Telangana</p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">We serve across Hyderabad and all major cities in Telangana state</p>
                  </div>
                </div>
              </div>

              {/* Customization Options */}
              <div className="group p-4 sm:p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-white/50 shadow-lg">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">Custom Packages</h3>
                    <p className="text-lg font-bold text-orange-600 mb-2">Available</p>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Tailored decoration packages to match your specific theme and budget</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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

      </div>
    </>
  );
};

export default DecorProfile;
