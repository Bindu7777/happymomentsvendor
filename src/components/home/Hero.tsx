
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

// High-quality wedding background images
const heroBackgrounds = [
  {
    id: 1,
    url: "images/birthday-celebration.jpg",
    alt: "Elegant wedding venue with floral decorations"
  },
  {
    id: 2,
    url: "images/celebrations.jpeg",
    alt: "Happy couple at sunset wedding ceremony"
  },
  {
    id: 3,
    url: "images/corporate.jpg",
    alt: "Beautiful corporate event arrangements"
  },
  {
    id: 4,
    url: "images/wedding.webp",
    alt: "Beautiful wedding floral arrangements"
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
      {/* Background image with subtle blur for better text contrast */}
      {heroBackgrounds.map((bg, index) => (
        <div
          key={bg.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 bg-cover bg-center -z-10 ${
            index === activeBackground ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${bg.url})` }}
          aria-hidden="true"
        />
      ))}
      
      {/* Overlay to make text more readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent -z-10"></div>
      
      <div className="container-custom relative z-10 flex flex-col items-center h-full w-full">
        {/* Main content positioned in the upper-middle part of the hero */}
        <div className="flex flex-col items-center justify-center mt-[15vh] md:mt-[20vh] mb-10 w-full">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold space text-white mb-8 leading-[1.1] animate-fade-up tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] whitespace-normal">
            Crafting Celebrations Full of Heart and Magic!
            </h1>
            <p className="text-base md:text-lg text-white/95 mb-4 max-w-2xl mx-auto animate-fade-up drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-medium" style={{ animationDelay: '100ms' }}>
            A–Z Event Tools & Top Vendors with Trusted Reviews!
            </p>
          </div>
          
          {/* Smart Search - Central Focus */}
          <div className="w-full max-w-5xl animate-fade-up" style={{ animationDelay: '200ms' }}>
            {/* Smart Search Panel */}
            <div className="bg-gradient-to-br from-white/95 to-orange-50/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border-2 border-orange-200/50 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-orange-300/10 to-amber-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-gradient-to-br from-amber-200/15 to-orange-200/15 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              <div className="relative z-10">
                {/* Smart Search Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full text-lg font-bold mb-4 shadow-lg">
                    <Mic className="h-6 w-6 animate-pulse" />
                    <MessageCircle className="h-5 w-5" />
                    <span>Smart Search</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                    Tell us what you need - we'll find it!
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Describe your event naturally using voice or text. Our AI will understand and match you with perfect vendors instantly.
                  </p>
                </div>

                {/* Smart Search Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Voice Input */}
                  <div className="text-center p-8 bg-gradient-to-br from-white/90 to-orange-50/90 rounded-2xl border border-orange-200/60 hover:shadow-xl hover:shadow-orange-200/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-300/50 transition-all duration-300 hover:scale-110">
                      <Mic className="h-10 w-10 text-white animate-pulse hover:animate-bounce" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Voice Input</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">Speak naturally and let our AI understand your exact needs</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Mic className="h-4 w-4" />
                      Start Speaking
                    </Link>
                  </div>

                  {/* Text Input */}
                  <div className="text-center p-8 bg-gradient-to-br from-white/90 to-amber-50/90 rounded-2xl border border-amber-200/60 hover:shadow-xl hover:shadow-amber-200/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:shadow-2xl hover:shadow-amber-300/50 transition-all duration-300 hover:scale-110">
                      <MessageCircle className="h-10 w-10 text-white hover:animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Text Input</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">Type your requirements in plain English, just like chatting</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Start Typing
                    </Link>
                  </div>

                  {/* Smart Matching */}
                  <div className="text-center p-8 bg-gradient-to-br from-white/90 to-orange-50/90 rounded-2xl border border-orange-300/60 hover:shadow-xl hover:shadow-orange-300/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl hover:shadow-2xl hover:shadow-orange-400/50 transition-all duration-300 hover:scale-110">
                      <Sparkles className="h-10 w-10 text-white hover:animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Matching</h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">Get perfect vendor matches based on your specific requirements</p>
                    <Link
                      to="/smart-request"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <Sparkles className="h-4 w-4" />
                      Get Matches
                    </Link>
                  </div>
                </div>

                {/* Example Queries */}
                <div className="bg-gradient-to-br from-white/70 to-orange-50/70 backdrop-blur-sm p-8 rounded-2xl border border-orange-200/60 mb-8 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Try these examples:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        "Wedding photographer in Mumbai, budget 50k, traditional style"
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        "Birthday party decorator for 50 guests, Delhi, next month"
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        "Corporate event caterer, vegetarian, 200 people, Bangalore"
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-l-4 border-orange-400 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:bg-gradient-to-r hover:from-orange-100 hover:to-amber-100">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        "Mehendi artist for wedding, traditional designs, Hyderabad"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main CTA Button */}
                <div className="text-center">
                  <Link
                    to="/smart-request"
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 hover:-translate-y-1 animate-pulse hover:animate-none"
                  >
                    <Mic className="h-6 w-6 hover:animate-bounce" />
                    <MessageCircle className="h-5 w-5" />
                    Make a Smart Request
                    <Sparkles className="h-5 w-5 hover:animate-spin" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Traditional Search - Secondary */}
            <div className="mt-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Or search the traditional way</h3>
                <p className="text-gray-600">Use our filters to browse vendors by category and location</p>
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
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-10 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1"
                    aria-label="Find vendors for your event"
                  >
                    <Users className="h-5 w-5 hover:animate-bounce" />
                    Browse Vendors
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/voice-search')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-10 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center gap-2 transition-all duration-300 hover:-translate-y-1"
                    aria-label="Use voice search"
                  >
                    <Mic className="h-5 w-5 hover:animate-pulse" />
                    Voice Search
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  Or try our new voice search feature for a more natural experience
                </p>
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
