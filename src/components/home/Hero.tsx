
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Building2, MapPin, Users, LogIn, Shield } from 'lucide-react';
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

// Vendor types for dropdown
const vendorTypes = [
  { value: 'all', label: 'All Categories' },
  { value: 'photography', label: 'Photographers' },
  { value: 'venues', label: 'Venues' },
  { value: 'catering', label: 'Catering' },
  { value: 'decor', label: 'Decor & Design' },
  { value: 'attire', label: 'Attire & Accessories' },
  { value: 'makeup', label: 'Makeup & Hair' },
  { value: 'music', label: 'Music & Entertainment' },
  { value: 'guest', label: 'Guest Tracker' },
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
    alt: "Beautiful wedding floral arrangements"
  },
  {
    id: 3,
    url: "images/wedding.webp",
    alt: "Beautiful wedding floral arrangements"
  },
];

const Hero = () => {
  const [vendorType, setVendorType] = useState('all');
  const [city, setCity] = useState('all');
  const [activeBackground, setActiveBackground] = useState(0);
  const navigate = useNavigate();

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBackground((current) => (current + 1) % heroBackgrounds.length);
    }, 6000); // Change image every 6 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', { vendorType, city });
    // Navigate to search results page (redirects to home for now)
    navigate('/vendors');
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
          <div className="w-full max-w-3xl animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/90 backdrop-blur-md p-5 md:p-7 rounded-2xl shadow-lg">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-5 space-y-5 md:space-y-0">
                {/* Vendor type dropdown with placeholder */}
                <div className="flex-1">
                  <label htmlFor="vendor-type" className="block text-wedding-navy text-sm font-medium mb-2.5 text-left">
                    What are you looking for?
                  </label>
                  <Select value={vendorType} onValueChange={setVendorType}>
                    <SelectTrigger id="vendor-type" className="w-full h-12 border border-gray-200 bg-white/80 text-wedding-navy/80 hover:bg-white transition-colors duration-200">
                      <SelectValue placeholder="Select vendor category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {vendorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* City dropdown with placeholder */}
                <div className="flex-1">
                  <label htmlFor="city" className="block text-wedding-navy text-sm font-medium mb-2.5 text-left">
                    Where?
                  </label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger id="city" className="w-full h-12 border border-gray-200 bg-white/80 text-wedding-navy/80 hover:bg-white transition-colors duration-200">
                      <SelectValue placeholder="Choose a location" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Enhanced CTA button with hover effects */}
                <Button
                  onClick={handleSearch}
                  className="bg-wedding-orange hover:bg-wedding-orange-hover text-white py-4 px-8 rounded-lg transition-all duration-300 text-lg font-semibold h-14 mt-2 md:mt-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  aria-label="Search for wedding vendors"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
