import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Instagram, Facebook, Heart, Share2, Calendar, Clock, CheckCircle, Camera, Video, Users, Award, MessageCircle, Zap, Trophy, Sparkles, ArrowRight, Play, Pause, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

const VendorProfile = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Enhanced photographer data with modern structure
  const photographer = {
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
        image: "/images/wedding.webp",
        title: "Wedding Photography",
        description: "Timeless moments captured beautifully"
      },
      {
        image: "/images/celebrations.jpeg",
        title: "Corporate Events",
        description: "Professional event documentation"
      },
      {
        image: "/images/corporate.jpg",
        title: "Pre-Wedding Shoots",
        description: "Romantic couple sessions"
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
      "/images/wedding.webp",
      "/images/celebrations.jpeg", 
      "/images/corporate.jpg",
      "/images/birthday-celebration.jpg",
      "/images/decor.jpg",
      "/images/mandapas.png",
      "/images/mandapas_2.png",
      "/images/SL-113022-54210-38.jpg"
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
      phone: "+91 98765 43210",
      email: "rajesh@photography.com",
      instagram: "@rajeshphotography",
      website: "www.rajeshphotography.com",
      whatsapp: "+91 98765 43210"
    }
  };

  const portfolioImages = photographer.portfolio;

  // WhatsApp integration
  const openWhatsApp = () => {
    const message = `Hi! I'm interested in your photography services.

Please share more details about:
- Available dates
- Package details
- How to confirm my booking

Thanks!`;
    const whatsappUrl = `https://wa.me/${photographer.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % photographer.highlights.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, photographer.highlights.length]);

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
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={photographer.avatar} 
                alt={photographer.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{photographer.name}</h1>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-full shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    <span className="text-sm font-bold text-amber-700">{photographer.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{photographer.category}</Badge>
                  <Badge variant="outline" className="text-xs">{photographer.subcategory}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                Chat Now
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Request Visit
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}
                className="hover:bg-red-50"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="hover:bg-blue-50"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Clean Layout */}
      <div className="relative min-h-[80vh] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-8xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch min-h-[60vh]">
              
              {/* Left Side - Main Content Card */}
              <div className="flex justify-center lg:justify-start lg:col-span-7">
                <div className="w-full max-w-[800px] animate-card-slide-up">
                  {/* Main Info Card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl border-2 border-amber-200/50">
                    
                    {/* Name and Profile Row */}
                    <div className="flex items-start mb-0">
                      <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        {photographer.name}
                      </h1>
                      <div className="flex flex-col items-center -ml-6">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0">
                          <img 
                            src={photographer.avatar} 
                            alt={photographer.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-lg font-bold text-gray-800">Rajesh</div>
                          <div className="text-base font-bold text-gray-500">Contact Person</div>
                        </div>
                      </div>
                    </div>

                    {/* Category Badges Row */}
                    <div className="flex items-center gap-4 mb-8 -mt-6">
                      <Badge className="px-6 py-3 text-base font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full shadow-md">
                        {photographer.category}
                      </Badge>
                      <Badge className="px-6 py-3 text-base font-medium bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-md">
                        {photographer.subcategory}
                      </Badge>
                    </div>

                    {/* Tagline */}
                    <p className="text-3xl lg:text-4xl font-semibold text-gray-800 mb-6 leading-relaxed">
                      {photographer.tagline}
                    </p>
                    
                    {/* Cultural Greeting */}
                    <p className="text-xl text-amber-700 font-medium mb-8 italic">
                      "Namaskaram! Capturing your precious moments with South Indian wedding expertise"
                    </p>

                    {/* Bio */}
                    <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                      Award-winning wedding photographer specializing in South Indian ceremonies. 10+ years of experience capturing Telugu, Tamil, Malayali & Kannada weddings across Hyderabad, Chennai, Bangalore & Mumbai. Expert in traditional rituals like Mangalsutra tying, Oonjal, and Muhurtham ceremonies.
                    </p>

                    {/* Details Icons Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center border-2 border-amber-300">
                          <MapPin className="w-8 h-8 text-amber-700" />
                        </div>
                        <div>
                          <span className="font-bold text-xl text-gray-800">{photographer.location}</span>
                          <p className="text-base text-gray-600">Serving South India</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-300">
                          <Trophy className="w-8 h-8 text-red-700" />
                        </div>
                        <div>
                          <span className="font-bold text-xl text-gray-800">{photographer.experience}</span>
                          <p className="text-base text-gray-600">500+ South Indian Weddings</p>
                        </div>
                      </div>
                      
                    </div>

                    {/* CTA Button */}
                    <div>
                      <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-8 text-2xl font-bold shadow-xl hover:scale-105 hover:shadow-green-500/25 transition-all duration-300 rounded-2xl"
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                      >
                        <MessageCircle className="w-7 h-7 mr-4" />
                        Chat to Book Now
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
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    
                    {/* Image Info Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{photographer.highlights[currentSlide].title}</h3>
                      <p className="text-base opacity-90">{photographer.highlights[currentSlide].description}</p>
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

      {/* Section Divider */}
      <div className="h-16 bg-gradient-to-b from-transparent to-slate-50"></div>

      {/* Quick Info Strip */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-b border-amber-200">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-100">
              <div className="text-3xl font-bold text-amber-700 mb-2">8+</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Hours Coverage</div>
              <div className="text-xs text-gray-500">300+ photos included</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-100">
              <div className="text-3xl font-bold text-red-700 mb-2">10+</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Years Experience</div>
              <div className="text-xs text-gray-500">South Indian Weddings</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <div className="text-3xl font-bold text-green-700 mb-2">128</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">5-Star Reviews</div>
              <div className="text-xs text-gray-500">Happy Couples</div>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-100">
              <div className="text-3xl font-bold text-purple-700 mb-2">500+</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">Weddings Captured</div>
              <div className="text-xs text-gray-500">Across South India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="h-16 bg-gradient-to-b from-slate-50 to-white"></div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Additional Info Badges */}
            <div className="flex flex-wrap gap-3">
              {photographer.additionalInfo.map((info, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-200 hover:to-purple-200 transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {info}
                </Badge>
              ))}
            </div>

            {/* Services Section */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-amber-100">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Camera className="w-8 h-8 text-amber-600" />
                  Our Services
                </h2>
                <p className="text-gray-600 mb-8 text-lg">Specialized in traditional ceremonies and modern celebrations</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "Pre-Wedding Shoots", description: "Engagement, Haldi, Mehendi ceremonies", icon: Camera },
                    { name: "Wedding Day Coverage", description: "Full day from Muhurtham to reception", icon: Camera },
                    { name: "Reception Photography", description: "Evening celebrations and ceremonies", icon: Camera },
                    { name: "Traditional Rituals", description: "Mangalsutra, Oonjal, Kanyadaan", icon: Camera },
                    { name: "Drone Photography", description: "Aerial shots of venue and ceremonies", icon: Camera },
                    { name: "Photo & Video Package", description: "Complete coverage with editing", icon: Camera }
                  ].map((service, index) => (
                    <div 
                      key={index}
                      className="group p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-amber-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg group-hover:from-amber-600 group-hover:to-orange-600 transition-colors">
                          <service.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Packages Section */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-red-100">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Award className="w-8 h-8 text-red-600" />
                  South Indian Wedding Packages
                </h2>
                <p className="text-gray-600 mb-8 text-lg">Complete packages designed for South Indian wedding traditions</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { 
                      name: "Essential", 
                      popular: false,
                      features: [
                        "8 hours coverage",
                        "300+ edited photos",
                        "Pre-wedding shoot",
                        "Wedding day photography",
                        "Basic editing",
                        "Online gallery"
                      ]
                    },
                    { 
                      name: "Premium", 
                      popular: true,
                      features: [
                        "12 hours coverage",
                        "500+ edited photos",
                        "Pre-wedding + Haldi",
                        "Full wedding day",
                        "Reception coverage",
                        "Professional editing",
                        "Drone shots included",
                        "Same day preview"
                      ]
                    },
                    { 
                      name: "Luxury", 
                      popular: false,
                      features: [
                        "16 hours coverage",
                        "800+ edited photos",
                        "All pre-wedding events",
                        "Complete wedding day",
                        "Reception + after-party",
                        "Premium editing",
                        "Drone + video highlights",
                        "Same day preview",
                        "Printed album included"
                      ]
                    }
                  ].map((pkg, index) => (
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
                        <div className="text-sm text-gray-500">Complete package for South Indian weddings</div>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {pkg.features.map((feature, idx) => (
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

            {/* Portfolio Gallery */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Video className="w-8 h-8 text-blue-600" />
                  Catalog
                </h2>
                
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
                    <div className="text-4xl font-bold text-green-600">4.8★</div>
                    <div className="text-sm text-gray-600">from 128 happy couples</div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      name: "Priya & Rajesh",
                      rating: 5,
                      date: "2 weeks ago",
                      verified: true,
                      text: "Rajesh captured our Telugu wedding beautifully! His understanding of our traditions like Mangalsutra tying and Oonjal ceremony was amazing. The photos are stunning and we got them the same day. Highly recommended for South Indian weddings!",
                      location: "Hyderabad"
                    },
                    {
                      name: "Anitha & Suresh",
                      rating: 5,
                      date: "1 month ago",
                      verified: true,
                      text: "Professional photographer who knows South Indian wedding customs perfectly. He captured every moment from Haldi to reception. The drone shots of our venue were incredible. Worth every rupee!",
                      location: "Chennai"
                    },
                    {
                      name: "Deepa & Kumar",
                      rating: 5,
                      date: "2 months ago",
                      verified: true,
                      text: "Rajesh's team was punctual and professional. They understood our Malayali wedding traditions and captured the Muhurtham ceremony beautifully. The editing quality is top-notch. We're so happy with our photos!",
                      location: "Bangalore"
                    }
                  ].map((review, index) => (
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
                            <p className="text-sm text-gray-600">{review.location}</p>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Contact Card */}
            <Card className="sticky top-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Contact Now</h3>
                </div>

                
                <div className="space-y-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-lg font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  >
                    <MessageCircle className="w-6 h-6 mr-3" />
                    Book Now
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-purple-500 text-purple-700 hover:bg-purple-50 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                    onClick={(e) => { e.stopPropagation(); openWhatsApp(); }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call for Free Consultation
                  </Button>
                </div>
                
                {/* Benefits */}
                <div className="mt-6 space-y-3">
                  <div className="text-center space-y-1 pt-2">
                    <p className="text-sm text-gray-600">✓ Free consultation</p>
                    <p className="text-sm text-gray-600">✓ Same day response</p>
                    <p className="text-sm text-gray-600">✓ Flexible payment options</p>
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
      </div>
    </>
  );
};

export default VendorProfile;
