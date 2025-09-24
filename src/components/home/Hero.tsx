
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Building2, MapPin, Users, LogIn, Shield, Mic, MessageCircle, Calendar, Sparkles } from 'lucide-react';
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

// Event types for dropdown
const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday Party' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'baby-shower', label: 'Baby Shower' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'festival', label: 'Festival Celebration' },
  { value: 'graduation', label: 'Graduation' },
];

// Service types for dropdown
const serviceTypes = [
  { value: 'all', label: 'All Services' },
  { value: 'photography', label: 'Photographer' },
  { value: 'makeup', label: 'Makeup Artist' },
  { value: 'decor', label: 'Decorator' },
  { value: 'catering', label: 'Caterer' },
  { value: 'venues', label: 'Venue' },
  { value: 'music', label: 'DJ/Music' },
  { value: 'attire', label: 'Clothing Designer' },
  { value: 'planning', label: 'Event Planner' },
];

// Cities for dropdown
const cities = [
  { value: 'all', label: 'All Locations' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'kolkata', label: 'Kolkata' },
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
  const [eventType, setEventType] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [city, setCity] = useState('all');
  const [eventDate, setEventDate] = useState('');
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
    console.log('Searching for:', { eventType, serviceType, city, eventDate });
    // Navigate to vendors page with search parameters
    const params = new URLSearchParams();
    if (eventType !== 'all') params.append('event', eventType);
    if (serviceType !== 'all') params.append('service', serviceType);
    if (city !== 'all') params.append('location', city);
    if (eventDate) params.append('date', eventDate);
    
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
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold space text-white mb-4 leading-[1.1] animate-fade-up tracking-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] whitespace-normal">
            Crafting Celebrations Full of Heart and Magic!
            </h1>
            <p className="text-sm md:text-base text-white/95 mb-2 max-w-2xl mx-auto animate-fade-up drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" style={{ animationDelay: '100ms' }}>
            A–Z Event Tools & Top Vendors with Trusted Reviews!
            </p>
          </div>
          
          {/* Search section positioned centrally below heading */}
          <div className="w-full max-w-4xl animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Event Type */}
                <div className="flex-1">
                  <label htmlFor="event-type" className="block text-wedding-navy text-sm font-semibold mb-3 text-left flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    What's your event?
                  </label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="event-type" className="w-full h-12 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl">
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="rounded-lg">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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
                
                {/* Event Date */}
                <div className="flex-1">
                  <label htmlFor="event-date" className="block text-wedding-navy text-sm font-semibold mb-3 text-left flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    When? (Optional)
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full h-12 border-2 border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-xl px-3 focus:outline-none focus:border-orange-500"
                    placeholder="Select date"
                  />
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-4 px-8 rounded-xl transition-all duration-300 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                  aria-label="Find vendors for your event"
                >
                  <Users className="h-5 w-5" />
                  Find My Vendors
                </Button>
                
                {/* Smart Request Secondary CTA */}
                <div className="text-center sm:text-left">
                  <p className="text-gray-600 text-sm mb-2">Don't want to search?</p>
                  <Link
                    to="/smart-request"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200"
                  >
                    <Mic className="h-4 w-4" />
                    <MessageCircle className="h-3 w-3" />
                    Try Smart Request → Tell us what you need
                  </Link>
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
