import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Camera, Building2, MapPin, Users, LogIn, Shield, Mic, MessageCircle, Sparkles } from 'lucide-react';
import VendorLogin from '../VendorLogin';
import SmartRequestInput from '../SmartRequestInput';
import { ParsedRequest } from '../services/requestParser';
import { ExtractedEntities } from '../services/enhancedAudioEngine';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CheckCircle, X } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';


// Service types for dropdown
const serviceTypes = [
  { value: 'all', label: 'All Services' },
  { value: 'photography', label: 'Photography/Videography' },
  { value: 'makeup', label: 'Makeup Artist' },
  { value: 'decor', label: 'Decorator' },
  { value: 'catering', label: 'Caterer' },
  { value: 'venues', label: 'Venue' },
  { value: 'music', label: 'DJ/Music' },
  { value: 'attire', label: 'Clothing Designer' },
  { value: 'planning', label: 'Event Planner' },
];

// Budget ranges for dropdown
const budgetRanges = [
  { value: 'all', label: 'All Budgets' },
  { value: '10k-50k', label: '₹10,000 - ₹50,000' },
  { value: '50k-1l', label: '₹50,000 - ₹1L' },
  { value: '1l-3l', label: '₹1L - ₹3L' },
  { value: '3l-10l', label: '₹3L - ₹10L' },
  { value: '10l-15l', label: '₹10L - ₹15L' },
  { value: '15l-25l', label: '₹15L - ₹25L' },
  { value: '25l-50l', label: '₹25L - ₹50L' },
  { value: '50l-1cr', label: '₹50L - ₹1CR' },
];

// States for dropdown
const cities = [
  { value: 'all', label: 'All Locations' },
  { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
  { value: 'arunachal-pradesh', label: 'Arunachal Pradesh' },
  { value: 'assam', label: 'Assam' },
  { value: 'bihar', label: 'Bihar' },
  { value: 'chhattisgarh', label: 'Chhattisgarh' },
  { value: 'goa', label: 'Goa' },
  { value: 'gujarat', label: 'Gujarat' },
  { value: 'haryana', label: 'Haryana' },
  { value: 'himachal-pradesh', label: 'Himachal Pradesh' },
  { value: 'jharkhand', label: 'Jharkhand' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'kerala', label: 'Kerala' },
  { value: 'madhya-pradesh', label: 'Madhya Pradesh' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'manipur', label: 'Manipur' },
  { value: 'meghalaya', label: 'Meghalaya' },
  { value: 'mizoram', label: 'Mizoram' },
  { value: 'nagaland', label: 'Nagaland' },
  { value: 'odisha', label: 'Odisha' },
  { value: 'punjab', label: 'Punjab' },
  { value: 'rajasthan', label: 'Rajasthan' },
  { value: 'sikkim', label: 'Sikkim' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tripura', label: 'Tripura' },
  { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
  { value: 'uttarakhand', label: 'Uttarakhand' },
  { value: 'west-bengal', label: 'West Bengal' },
  { value: 'andaman-nicobar', label: 'Andaman and Nicobar Islands' },
  { value: 'chandigarh', label: 'Chandigarh' },
  { value: 'dadra-nagar-haveli', label: 'Dadra and Nagar Haveli' },
  { value: 'daman-diu', label: 'Daman and Diu' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'jammu-kashmir', label: 'Jammu and Kashmir' },
  { value: 'ladakh', label: 'Ladakh' },
  { value: 'lakshadweep', label: 'Lakshadweep' },
  { value: 'puducherry', label: 'Puducherry' },
];

// High-quality wedding background images
const heroBackgrounds = [
  {
    id: 1,
    url: "images/decor1.jpg",
    alt: "Beautiful decoration setting"
  },
  {
    id: 2,
    url: "images/decor2.png",
    alt: "Elegant decoration scene"
  },
  {
    id: 3,
    url: "images/decor3.jpg",
    alt: "Stunning decoration moment"
  },
  {
    id: 4,
    url: "images/wedding1.jpg",
    alt: "Romantic wedding celebration"
  },
];

const Hero = () => {
  const [serviceType, setServiceType] = useState('all');
  const [city, setCity] = useState('all');
  const [budget, setBudget] = useState('all');
  const [activeBackground, setActiveBackground] = useState(0);
  const [showVendorLogin, setShowVendorLogin] = useState(false);
  const [showSmartRequest, setShowSmartRequest] = useState(false);
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null);
  const { customer } = useCustomerAuth();
  const [searchParams] = useSearchParams();
  
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
  // Show success banner if account was just created
  useEffect(() => {
    if (searchParams.get('accountCreated') === 'true') {
      setShowSuccessBanner(true);
      // Remove the query parameter from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('accountCreated');
      window.history.replaceState({}, '', window.location.pathname + (newSearchParams.toString() ? '?' + newSearchParams.toString() : ''));
      
      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBackground((current) => (current + 1) % heroBackgrounds.length);
    }, 6000); // Change image every 6 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', { serviceType, city, budget });
    // Navigate to vendors page with search parameters
    const params = new URLSearchParams();
    if (serviceType !== 'all') params.append('service', serviceType);
    if (city !== 'all') params.append('location', city);
    if (budget !== 'all') params.append('budget', budget);
    
    navigate(`/vendors?${params.toString()}`);
  };

  const handleSmartRequestClick = () => {
    setShowSmartRequest(true);
  };

  const handleRequestParsed = (request: ParsedRequest) => {
    setParsedRequest(request);
  };

  const handleRequestSubmit = async (request: ParsedRequest) => {
    setIsLoading(true);
    try {
      // Navigate to vendors page with the parsed request parameters
      const params = new URLSearchParams();
      
      if (request.serviceTypes && request.serviceTypes.length > 0) {
        // Map service type to the format expected by vendors page
        const serviceMap: Record<string, string> = {
          'photography': 'photography',
          'makeup': 'makeup',
          'decor': 'decor',
          'catering': 'catering',
          'venues': 'venues',
          'music': 'music',
          'attire': 'attire',
          'planning': 'planning'
        };
        const serviceType = request.serviceTypes[0];
        if (serviceMap[serviceType]) {
          params.append('service', serviceMap[serviceType]);
        }
      }
      
      if (request.location) {
        // Map location to the format expected by vendors page
        const locationMap: Record<string, string> = {
          'telangana': 'telangana',
          'andhra pradesh': 'andhra-pradesh',
          'tamil nadu': 'tamil-nadu',
          'karnataka': 'karnataka',
          'maharashtra': 'maharashtra',
          'kerala': 'kerala',
          'delhi': 'delhi',
          'punjab': 'punjab',
          'rajasthan': 'rajasthan',
          'gujarat': 'gujarat',
          'west bengal': 'west-bengal',
          'uttar pradesh': 'uttar-pradesh'
        };
        const location = request.location.toLowerCase();
        if (locationMap[location]) {
          params.append('location', locationMap[location]);
        }
      }
      
      if (request.budgetRange) {
        const budgetMap: Record<string, string> = {
          '10k-50k': '10k-50k',
          '50k-1l': '50k-1l',
          '1l-3l': '1l-3l',
          '3l-10l': '3l-10l',
          '10l-15l': '10l-15l',
          '15l-25l': '15l-25l',
          '25l-50l': '25l-50l',
          '50l-1cr': '50l-1cr'
        };
        if (budgetMap[request.budgetRange]) {
          params.append('budget', budgetMap[request.budgetRange]);
        }
      }
      
      // Add the original smart request text as a parameter
      if (request.originalText) {
        params.append('original', request.originalText);
        params.append('query', request.originalText);
      }
      
      // Navigate to vendors page with parameters
      const url = `/vendors?${params.toString()}`;
      console.log('Navigating to vendors page with URL:', url);
      navigate(url);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntitiesExtracted = (entities: ExtractedEntities) => {
    // Handle entities extraction if needed
    console.log('Entities extracted:', entities);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background images with high quality rendering */}
      {heroBackgrounds.map((bg, index) => (
        <img
          key={bg.id}
          src={bg.url}
          alt={bg.alt}
          className={`absolute inset-0 w-full h-screen object-cover transition-opacity duration-1000 -z-10 ${
            index === activeBackground ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            imageRendering: 'high-quality',
            WebkitImageRendering: 'high-quality',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            maxHeight: '100vh',
            objectFit: 'cover',
            objectPosition: 'center center'
          }}
          loading="eager"
        />
      ))}
      
      {/* Overlay to make text more readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent -z-10"></div>
      
      {/* Success Banner */}
      {showSuccessBanner && (
        <div 
          className="fixed left-1/2 z-[60]"
          style={{ 
            top: '80px',
            transform: 'translateX(-50%)'
          }}
        >
          <div 
            className="max-w-[420px] w-[calc(100vw-2rem)] mx-auto bg-white rounded-[14px] border-l-[5px] border-[#F7941D] p-4 shadow-lg"
            style={{
              animation: 'slideDownFadeIn 0.3s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-[#F7941D] animate-scale-in" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#001B5E] font-semibold text-base mb-1">
                  Account Created Successfully!
                </h3>
                <p className="text-[#001B5E] text-sm opacity-90">
                  Your account has been verified. Welcome to Happy Moments 🎉
                </p>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="flex-shrink-0 text-[#001B5E] opacity-60 hover:opacity-100 transition-opacity ml-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container-custom relative z-10 flex flex-col items-center h-full w-full">
        {/* Main content positioned higher up on the hero */}
        <div className="flex flex-col items-center justify-start pt-[8vh] md:pt-[10vh] lg:pt-[12vh] pb-4 w-full px-4">
          <div className="max-w-4xl mx-auto text-center mb-4 md:mb-6">
            {/* Welcome message for logged-in customers */}
            {customer && customer.full_name && (
              <div className="mb-4 animate-fade-up">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  Welcome {customer.full_name.split(' ')[0]}!
                </h2>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold space text-white mb-3 md:mb-4 leading-[1.1] animate-fade-up tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] whitespace-normal">
            Find the Best Event Vendors, Perfect for Your Budget and Vision
            </h1>
            <p className="hidden md:block text-base sm:text-lg md:text-xl text-white/95 mb-2 max-w-2xl mx-auto animate-fade-up drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-semibold" style={{ animationDelay: '100ms' }}>
            A–Z Event Tools & Top Vendors with Trusted Reviews!
            </p>
          </div>
          
          {!showSmartRequest && (
            <div className="w-full max-w-5xl animate-fade-up px-4" style={{ animationDelay: '200ms' }}>
              {/* Smart Search Panel */}
              <div className="bg-gradient-to-br from-white/60 to-orange-50/60 backdrop-blur-md p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl border-2 border-orange-200/50 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-orange-300/10 to-amber-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-amber-200/15 to-orange-200/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                
                <div className="relative z-10">
                  {/* Smart Search Header */}
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
                      Tell us what you need - we'll find it!
                    </h2>
                  </div>

                  {/* Smart Search Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Voice Input */}
                    <div className="text-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/95 to-orange-50/95 rounded-xl md:rounded-2xl border border-orange-200/60 shadow-lg hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-300/60 transition-all duration-300 hover:scale-110 group">
                        <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 animate-bounce" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Voice Input</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Speak naturally and let our AI understand your exact needs</p>
                      <button
                        onClick={handleSmartRequestClick}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                      >
                        <Mic className="h-4 w-4" />
                        Start Speaking
                      </button>
                    </div>

                    {/* Text Input */}
                    <div className="text-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-xl md:rounded-2xl border border-amber-200/60 shadow-lg hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-amber-300/60 transition-all duration-300 hover:scale-110 group">
                        <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 animate-pulse" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Text Input</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Type your requirements in plain English, just like chatting</p>
                      <button
                        onClick={handleSmartRequestClick}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Start Typing
                      </button>
                    </div>

                    {/* Smart Matching */}
                    <div className="hidden md:block text-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/95 to-orange-50/95 rounded-xl md:rounded-2xl border border-orange-300/60 shadow-lg hover:shadow-2xl hover:shadow-orange-300/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group sm:col-span-2 lg:col-span-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-400/60 transition-all duration-300 hover:scale-110 group">
                        <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110 animate-spin" style={{ animationDuration: '4s', animationIterationCount: 'infinite' }} />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Smart Matching</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Get perfect vendor matches based on your specific requirements</p>
                      <button
                        onClick={handleSmartRequestClick}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                      >
                        <Sparkles className="h-4 w-4" />
                        Get Matches
                      </button>
                    </div>
                  </div>

                  {/* Main CTA Button */}
                  <div className="text-center">
                    <button
                      onClick={handleSmartRequestClick}
                      className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 animate-pulse hover:animate-none group"
                    >
                      <Mic className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                      <span className="hidden sm:inline">Make a Smart Request</span>
                      <span className="sm:hidden">Smart Request</span>
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!showSmartRequest && (
            <>
              {/* OR Separator - Redesigned */}
              <div className="flex items-center justify-center my-6 md:my-8 w-full">
                <div className="flex items-center relative w-full max-w-md">
                  {/* Decorative elements */}
                  <div className="absolute -left-3 md:-left-4 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-300 animate-pulse" />
                  </div>
                  <div className="absolute -right-3 md:-right-4 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                  
                  {/* Horizontal lines */}
                  <div className="h-1 md:h-1.5 bg-gradient-to-r from-transparent via-blue-400/50 to-blue-500/70 w-24 md:w-40 rounded-full"></div>
                  
                  {/* OR with pill background */}
                  <div className="relative mx-6 md:mx-8">
                    <div className="bg-gradient-to-r from-blue-600/30 to-blue-700/30 backdrop-blur-sm px-8 md:px-12 py-3 md:py-4 rounded-full border-2 border-blue-400/40 shadow-xl">
                      <span className="text-blue-800 font-bold text-2xl md:text-3xl tracking-wide">OR</span>
                    </div>
                  </div>
                  
                  {/* Horizontal lines */}
                  <div className="h-1 md:h-1.5 bg-gradient-to-l from-transparent via-blue-400/50 to-blue-500/70 w-24 md:w-40 rounded-full"></div>
                </div>
              </div>

              {/* Traditional Search - Secondary */}
              <div className="w-full max-w-6xl mx-auto mt-4 md:mt-6 bg-white/95 backdrop-blur-md p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-xl border border-white/30">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-3">Or search the traditional way</h3>
                  <p className="text-base md:text-lg text-gray-600">Use our filters to browse vendors by category and location</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
                  {/* Service Type */}
                  <div className="flex-1">
                    <label htmlFor="service-type" className="block text-wedding-navy text-base md:text-lg font-semibold mb-4 text-left flex items-center gap-2">
                      <Camera className="h-5 w-5 text-orange-500" />
                      What do you need?
                    </label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger id="service-type" className="w-full h-14 md:h-16 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl text-base md:text-lg">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                        {serviceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="rounded-lg text-base">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Location */}
                  <div className="flex-1">
                    <label htmlFor="city" className="block text-wedding-navy text-base md:text-lg font-semibold mb-4 text-left flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      Where?
                    </label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger id="city" className="w-full h-14 md:h-16 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl text-base md:text-lg">
                        <SelectValue placeholder="Choose location" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                        {cities.map((city) => (
                          <SelectItem key={city.value} value={city.value} className="rounded-lg text-base">
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Budget */}
                  <div className="flex-1">
                    <label htmlFor="budget" className="block text-wedding-navy text-base md:text-lg font-semibold mb-4 text-left flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      Your budget (Optional)
                    </label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget" className="w-full h-14 md:h-16 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl text-base md:text-lg">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                        {budgetRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value} className="rounded-lg text-base">
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Search CTAs */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-5 md:py-6 px-12 md:px-16 rounded-3xl text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center gap-3 transition-all duration-300 hover:-translate-y-2 group"
                      aria-label="Find vendors for your event"
                    >
                      <Users className="h-6 w-6 md:h-7 md:w-7" />
                      Browse Vendors
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Smart Request Input Section - Replaces the above when active */}
          {showSmartRequest && (
            <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-up">
              <SmartRequestInput
                onRequestParsed={handleRequestParsed}
                onRequestSubmit={handleRequestSubmit}
                onEntitiesExtracted={handleEntitiesExtracted}
                isLoading={isLoading}
              />
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowSmartRequest(false)}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  ← Back to search options
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Login Modal */}
      {showVendorLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowVendorLogin(false)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 z-10"
            >
              ×
            </button>
            <VendorLogin onClose={() => setShowVendorLogin(false)} />
          </div>
        </div>
      )}
      
      {/* Floating WhatsApp Button - Mobile Only */}
      <a
        href="https://wa.me/917330732710?text=Hi!%20I'm%20interested%20in%20learning%20more%20about%20your%20event%20services.%20Could%20you%20please%20share%20more%20details?"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
      </section>
  );
};

export default Hero;