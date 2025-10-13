
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Building2, MapPin, Users, LogIn, Shield, Mic, MessageCircle, Sparkles } from 'lucide-react';
import VendorLogin from '../VendorLogin';
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

// High-quality wedding background images from Downloads
const heroBackgrounds = [
  {
    id: 1,
    url: "images/qbg1.jpg",
    alt: "High-quality celebration moment"
  },
  {
    id: 2,
    url: "images/qbg2.jpg",
    alt: "Beautiful event celebration"
  },
  {
    id: 3,
    url: "images/qbg3.png",
    alt: "Elegant celebration scene"
  },
  {
    id: 4,
    url: "images/qbg4.jpg",
    alt: "Romantic celebration moment"
  },
];

const Hero = () => {
  const [serviceType, setServiceType] = useState('all');
  const [city, setCity] = useState('all');
  const [budget, setBudget] = useState('all');
  const [activeBackground, setActiveBackground] = useState(0);
  const [showVendorLogin, setShowVendorLogin] = useState(false);
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
      
      <div className="container-custom relative z-10 flex flex-col items-center h-full w-full">
        {/* Main content positioned higher up on the hero */}
        <div className="flex flex-col items-center justify-start pt-[8vh] md:pt-[10vh] lg:pt-[12vh] pb-4 w-full px-4">
          <div className="max-w-4xl mx-auto text-center mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold space text-white mb-3 md:mb-4 leading-[1.1] animate-fade-up tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] whitespace-normal">
            Find the Best Event Vendors, Perfect for Your Budget and Vision
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 mb-2 max-w-2xl mx-auto animate-fade-up drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-semibold" style={{ animationDelay: '100ms' }}>
            A–Z Event Tools & Top Vendors with Trusted Reviews!
            </p>
          </div>
          
          {/* Smart Search - Central Focus */}
          <div className="w-full max-w-5xl animate-fade-up px-4" style={{ animationDelay: '200ms' }}>
            {/* Smart Search Panel */}
            <div className="bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-xl p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl border-2 border-orange-200/50 relative overflow-hidden">
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
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-300/60 transition-all duration-300 hover:scale-110">
                      <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Voice Input</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Speak naturally and let our AI understand your exact needs</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                    >
                      <Mic className="h-4 w-4" />
                      Start Speaking
                    </Link>
                  </div>

                  {/* Text Input */}
                  <div className="text-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/95 to-amber-50/95 rounded-xl md:rounded-2xl border border-amber-200/60 shadow-lg hover:shadow-2xl hover:shadow-amber-200/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-amber-300/60 transition-all duration-300 hover:scale-110">
                      <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Text Input</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Type your requirements in plain English, just like chatting</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Start Typing
                    </Link>
                  </div>

                  {/* Smart Matching */}
                  <div className="text-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/95 to-orange-50/95 rounded-xl md:rounded-2xl border border-orange-300/60 shadow-lg hover:shadow-2xl hover:shadow-orange-300/40 transition-all duration-300 hover:scale-105 hover:-translate-y-2 group sm:col-span-2 lg:col-span-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-400/60 transition-all duration-300 hover:scale-110">
                      <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Smart Matching</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed font-medium">Get perfect vendor matches based on your specific requirements</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 hover:-translate-y-1"
                    >
                      <Sparkles className="h-4 w-4" />
                      Get Matches
                    </Link>
                  </div>
                </div>


                {/* Main CTA Button */}
                <div className="text-center">
                  <Link
                    to="/smart-request"
                    className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 hover:-translate-y-2 animate-pulse hover:animate-none group"
                  >
                    <Mic className="h-5 w-5 md:h-6 md:w-6" />
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Make a Smart Request</span>
                    <span className="sm:hidden">Smart Request</span>
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* OR Separator - Redesigned */}
            <div className="flex items-center justify-center my-12 md:my-16 lg:my-20">
              <div className="flex items-center relative">
                {/* Decorative elements */}
                <div className="absolute -left-2 md:-left-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-300 animate-pulse" />
                </div>
                <div className="absolute -right-2 md:-right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                
                {/* Horizontal lines */}
                <div className="h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-blue-500/60 w-20 md:w-32 rounded-full"></div>
                
                {/* OR with pill background */}
                <div className="relative mx-4 md:mx-6">
                  <div className="bg-gradient-to-r from-blue-400/20 to-blue-500/20 backdrop-blur-sm px-6 md:px-8 py-2 md:py-3 rounded-full border border-blue-300/30 shadow-lg">
                    <span className="text-white font-bold text-xl md:text-2xl tracking-wide">OR</span>
                  </div>
                </div>
                
                {/* Horizontal lines */}
                <div className="h-0.5 md:h-1 bg-gradient-to-l from-transparent via-blue-400/40 to-blue-500/60 w-20 md:w-32 rounded-full"></div>
              </div>
            </div>

            {/* Traditional Search - Secondary */}
            <div className="mt-12 md:mt-16 lg:mt-20 bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg border border-white/20">
              <div className="text-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Or search the traditional way</h3>
                <p className="text-sm md:text-base text-gray-600">Use our filters to browse vendors by category and location</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Service Type */}
                <div className="flex-1">
                  <label htmlFor="service-type" className="block text-wedding-navy text-sm font-semibold mb-3 text-left flex items-center gap-2">
                    <Camera className="h-4 w-4 text-orange-500" />
                    What do you need?
                  </label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="service-type" className="w-full h-12 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="rounded-lg">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Location */}
                <div className="flex-1">
                  <label htmlFor="city" className="block text-wedding-navy text-sm font-semibold mb-3 text-left flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    Where?
                  </label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="city" className="w-full h-12 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl">
                      <SelectValue placeholder="Choose location" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value} className="rounded-lg">
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Budget */}
                <div className="flex-1">
                  <label htmlFor="budget" className="block text-wedding-navy text-sm font-semibold mb-3 text-left flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Your budget (Optional)
                  </label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger id="budget" className="w-full h-12 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                      {budgetRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="rounded-lg">
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
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-10 rounded-3xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center gap-2 transition-all duration-300 hover:-translate-y-2 group"
                    aria-label="Find vendors for your event"
                  >
                    <Users className="h-5 w-5" />
                    Browse Vendors
                  </Button>
                </div>
              </div>
            </div>

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
      </div>
    </section>
  );
};

export default Hero;
