import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';

const PhotographyVendors = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Reset scroll position on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Enhanced photography vendors data
  const photographers = [
    {
      id: 'rajesh-photography',
      name: 'Rajesh Kumar Photography',
      ownerName: 'Rajesh Kumar',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image1.jpeg',
      portfolioThumbnails: ['/images/image1.jpeg', '/images/image2.jpeg', '/images/wedding.webp'],
      rating: 4.8,
      reviewCount: 128,
      category: 'Photography',
      badges: ['Award Winning', 'Wedding Specialist'],
      location: 'Hyderabad, Telangana',
      serviceArea: 'AP and Telangana',
      startingPrice: '₹35,000',
      tagline: 'South India Wedding Specialist',
      introTagline: 'Capturing Moments That Last Forever',
      specialties: ['Candid', 'Bridal', 'Traditional'],
      specialtyTags: ['Candid', 'Bridal', 'Traditional', 'Drone'],
      languagesSpoken: ['Telugu', 'Hindi', 'English'],
      experience: '10+ Years',
      verified: true,
      responseTime: '2 hours',
      responseTimeColor: 'yellow',
      totalProjects: '500+',
      lastActive: '2 hours ago',
      currentlyAvailable: true,
      priceRange: 'mid'
    },
    {
      id: 'creative-lens-studio',
      name: 'Creative Lens Studio',
      ownerName: 'Priya Sharma',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image2.jpeg',
      portfolioThumbnails: ['/images/image2.jpeg', '/images/image1.jpeg', '/images/wedding.webp'],
      rating: 4.7,
      reviewCount: 95,
      category: 'Photography',
      badges: ['Creative Expert', 'Destination Specialist'],
      location: 'Bangalore, Karnataka',
      serviceArea: 'South India',
      startingPrice: '₹40,000',
      tagline: 'Creative Destination Specialist',
      introTagline: 'Creative Stories Through Lens',
      specialties: ['Destination', 'Fashion', 'Portrait'],
      specialtyTags: ['Destination', 'Fashion', 'Portrait', 'Creative'],
      languagesSpoken: ['Kannada', 'Hindi', 'English'],
      experience: '8+ Years',
      verified: true,
      responseTime: '1 hour',
      responseTimeColor: 'green',
      totalProjects: '300+',
      lastActive: '1 hour ago',
      currentlyAvailable: true,
      priceRange: 'mid'
    },
    {
      id: 'moments-photography',
      name: 'Moments Photography',
      ownerName: 'Arjun Reddy',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image1.jpeg',
      portfolioThumbnails: ['/images/image1.jpeg', '/images/image2.jpeg', '/images/wedding.webp'],
      rating: 4.9,
      reviewCount: 156,
      category: 'Photography',
      badges: ['Top Rated', 'Premium Service'],
      location: 'Chennai, Tamil Nadu',
      serviceArea: 'Tamil Nadu & Kerala',
      startingPrice: '₹45,000',
      tagline: 'Tamil Wedding Tradition Expert',
      introTagline: 'Preserving Your Precious Moments',
      specialties: ['Traditional', 'Candid', 'Drone'],
      specialtyTags: ['Traditional', 'Candid', 'Drone', 'Premium'],
      languagesSpoken: ['Tamil', 'Telugu', 'Hindi', 'English'],
      experience: '12+ Years',
      verified: true,
      responseTime: '30 minutes',
      responseTimeColor: 'green',
      totalProjects: '800+',
      lastActive: '30 minutes ago',
      currentlyAvailable: true,
      priceRange: 'premium'
    },
    {
      id: 'elegant-captures',
      name: 'Elegant Captures',
      ownerName: 'Sneha Patel',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image2.jpeg',
      rating: 4.6,
      reviewCount: 87,
      category: 'Photography',
      badges: ['Elegant Style', 'Female Photographer'],
      location: 'Mumbai, Maharashtra',
      serviceArea: 'Maharashtra & Gujarat',
      startingPrice: '₹38,000',
      tagline: 'Elegant Moments, Timeless Memories',
      specialties: ['Bridal Photography', 'Family Portraits', 'Baby Photography'],
      experience: '7+ Years',
      verified: true,
      responseTime: '3 hours',
      totalProjects: '250+'
    },
    {
      id: 'royal-frames',
      name: 'Royal Frames Photography',
      ownerName: 'Vikram Singh',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image1.jpeg',
      rating: 4.5,
      reviewCount: 72,
      category: 'Photography',
      badges: ['Royal Style', 'Heritage Specialist'],
      location: 'Jaipur, Rajasthan',
      serviceArea: 'Rajasthan & Delhi',
      startingPrice: '₹42,000',
      tagline: 'Royal Treatment for Royal Moments',
      specialties: ['Royal Weddings', 'Heritage Photography', 'Palace Shoots'],
      experience: '9+ Years',
      verified: true,
      responseTime: '4 hours',
      totalProjects: '400+'
    },
    {
      id: 'candid-stories',
      name: 'Candid Stories',
      ownerName: 'Rahul Kumar',
      profileImage: '/images/vendor.jpeg',
      portfolioSample: '/images/image2.jpeg',
      rating: 4.7,
      reviewCount: 103,
      category: 'Photography',
      badges: ['Candid Expert', 'Storyteller'],
      location: 'Pune, Maharashtra',
      serviceArea: 'Western India',
      startingPrice: '₹32,000',
      tagline: 'Every Picture Tells a Story',
      specialties: ['Candid Photography', 'Documentary Style', 'Street Photography'],
      experience: '6+ Years',
      verified: true,
      responseTime: '2 hours',
      totalProjects: '200+'
    }
  ];

  // Enhanced filtering and sorting
  const filteredAndSortedPhotographers = photographers
    .filter(photographer => {
      const matchesSearch = photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           photographer.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           photographer.specialties.some(specialty => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                           ) ||
                           photographer.specialtyTags?.some(tag =>
                             tag.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      
      const matchesLocation = locationFilter === 'all' || 
                             photographer.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesPrice = priceFilter === 'all' || photographer.priceRange === priceFilter;
      
      return matchesSearch && matchesLocation && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return parseInt(a.startingPrice.replace(/[^\d]/g, '')) - parseInt(b.startingPrice.replace(/[^\d]/g, ''));
        case 'price-high':
          return parseInt(b.startingPrice.replace(/[^\d]/g, '')) - parseInt(a.startingPrice.replace(/[^\d]/g, ''));
        case 'experience':
          return parseInt(b.experience.replace(/[^\d]/g, '')) - parseInt(a.experience.replace(/[^\d]/g, ''));
        case 'response':
          const responseOrder = { 'green': 1, 'yellow': 2, 'red': 3 };
          return (responseOrder[a.responseTimeColor as keyof typeof responseOrder] || 3) - 
                 (responseOrder[b.responseTimeColor as keyof typeof responseOrder] || 3);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return b.rating - a.rating;
      }
    });

  // Toggle favorite
  const toggleFavorite = (photographerId: string) => {
    setFavorites(prev => 
      prev.includes(photographerId) 
        ? prev.filter(id => id !== photographerId)
        : [...prev, photographerId]
    );
  };

  // Navigate to individual photographer profile
  const handleCardClick = (photographerId: string) => {
    if (photographerId === 'rajesh-photography') {
      navigate('/vendor-profile');
    } else {
      // For other photographers, we'll create individual profiles later
      navigate(`/photography-profile/${photographerId}`);
    }
  };

  // WhatsApp integration
  const openWhatsApp = (photographer: any) => {
    const message = `Hi ${photographer.ownerName}! I found your photography services on HappyMoments and I'm interested in learning more about your packages for my upcoming event. Could you please share your availability and pricing details?`;
    const whatsappUrl = `https://wa.me/919550793699?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      <Header />
      
      {/* Premium Enhanced Header */}
      <div className="relative py-8 sm:py-10 mt-16 overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/80 via-transparent to-orange-300/60"></div>
        
        {/* Sophisticated Overlays */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-full -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-amber-200/15 via-transparent to-transparent rounded-full translate-y-1/3 -translate-x-1/4"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 2px)`,
          backgroundSize: '40px 40px'
        }}></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, white 41%, white 42%, transparent 43%)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header with Typography */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/');
                // Scroll to categories section after navigation
                setTimeout(() => {
                  const categoriesSection = document.getElementById('categories');
                  if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-lg md:text-3xl font-bold text-white drop-shadow-lg">
                Photography Vendors
              </h1>
              {/* Elegant Accent Line */}
              <div className="mt-3 h-1 w-24 bg-gradient-to-r from-white via-amber-200 to-transparent rounded-full shadow-sm mx-auto"></div>
            </div>
          </div>
          
          {/* Compact Horizontal Filter Bar */}
          <div className="max-w-7xl mx-auto">
            {/* Premium Glassmorphism Filter Bar */}
            <div className="hidden md:block bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-5 hover:shadow-3xl transition-all duration-300" style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
            }}>
              <div className="flex items-center gap-3">
                {/* Search Input - Compact */}
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search photographers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 border border-gray-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Compact Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="pl-7 h-10 w-32 border border-gray-300 focus:border-amber-400 text-sm">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cities</SelectItem>
                        <SelectItem value="hyderabad">Hyderabad</SelectItem>
                        <SelectItem value="bangalore">Bangalore</SelectItem>
                        <SelectItem value="chennai">Chennai</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="pl-7 h-10 w-28 border border-gray-300 focus:border-amber-400 text-sm">
                        <SelectValue placeholder="Budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="budget">Under ₹35k</SelectItem>
                        <SelectItem value="mid">₹35k-45k</SelectItem>
                        <SelectItem value="premium">Above ₹45k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <TrendingUp className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 z-10" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="pl-7 h-10 w-32 border border-gray-300 focus:border-amber-400 text-sm">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Top Rated</SelectItem>
                        <SelectItem value="price-low">Price ↑</SelectItem>
                        <SelectItem value="price-high">Price ↓</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="response">Fast Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="h-10 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl relative overflow-hidden group"
                    onClick={() => {/* Trigger search */}}
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Search className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Search</span>
                  </Button>
                </div>
              </div>

              {/* Premium Quick Filter Chips */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
                <span className="text-xs font-semibold text-gray-600 mr-2 bg-white/60 px-2 py-1 rounded-full">Quick Filters:</span>
                <div className="flex flex-wrap gap-2 overflow-x-auto">
                  {[
                    { label: 'Wedding', value: 'wedding', icon: '💒', color: 'bg-gradient-to-r from-pink-500/90 to-rose-500/90 text-white border-pink-300/50' },
                    { label: 'Candid', value: 'candid', icon: '📸', color: 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 text-white border-blue-300/50' },
                    { label: 'Budget', value: 'budget', icon: '💰', color: 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 text-white border-green-300/50' },
                    { label: 'Top Rated', value: 'top-rated', icon: '⭐', color: 'bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-white border-yellow-300/50' },
                    { label: 'Available', value: 'available', icon: '🟢', color: 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white border-emerald-300/50' },
                    { label: 'Drone', value: 'drone', icon: '🚁', color: 'bg-gradient-to-r from-purple-500/90 to-indigo-500/90 text-white border-purple-300/50' }
                  ].map((chip, index) => (
                    <button
                      key={index}
                      className={`text-xs px-4 py-2 rounded-full border font-semibold hover:scale-110 hover:shadow-lg transition-all duration-300 ${chip.color} backdrop-blur-sm flex items-center gap-1.5 shadow-md hover:shadow-xl`}
                      onClick={() => {
                        if (chip.value === 'budget') setPriceFilter('budget');
                        else if (chip.value === 'top-rated') setSortBy('rating');
                        else setSearchQuery(chip.label.toLowerCase());
                      }}
                      style={{
                        boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <span className="text-sm">{chip.icon}</span>
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Enhanced Curved Separator with Shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl shadow-inner" style={{
          boxShadow: 'inset 0 4px 8px -2px rgba(0, 0, 0, 0.1)'
        }}></div>
      </div>

      {/* Compact Results Summary */}
      <div className="container mx-auto px-4 py-4 -mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredAndSortedPhotographers.length} Results Found
            </h2>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{filteredAndSortedPhotographers.filter(p => p.currentlyAvailable).length} available</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>All verified</span>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          <div className="flex items-center gap-2">
            {(searchQuery || locationFilter !== 'all' || priceFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    "{searchQuery}"
                  </Badge>
                )}
                {locationFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    📍 {locationFilter}
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    💰 {priceFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('all');
                    setPriceFilter('all');
                    setSortBy('rating');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 p-1"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Vendor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedPhotographers.map((photographer) => (
            <Card 
              key={photographer.id}
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 bg-white overflow-hidden ${
                photographer.verified 
                  ? 'border-green-200 hover:border-green-400' 
                  : 'border-amber-100 hover:border-amber-300'
              } ${hoveredCard === photographer.id ? 'ring-2 ring-amber-300' : ''}`}
              onClick={() => handleCardClick(photographer.id)}
              onMouseEnter={() => setHoveredCard(photographer.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-0">
                {/* Enhanced Portfolio Gallery */}
                <div className="relative h-48 overflow-hidden">
                  {/* Main Portfolio Image */}
                  <img
                    src={photographer.portfolioSample}
                    alt={`${photographer.name} portfolio`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Portfolio Thumbnails - Show on Hover */}
                  {hoveredCard === photographer.id && (
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      {photographer.portfolioThumbnails?.slice(0, 3).map((thumb, index) => (
                        <div key={index} className="w-8 h-8 rounded border-2 border-white/80 overflow-hidden">
                          <img
                            src={thumb}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded border-2 border-white/80 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">+{photographer.portfolioThumbnails?.length || 0}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Top Left - Availability Status */}
                  <div className="absolute top-3 left-3">
                    {photographer.currentlyAvailable ? (
                      <Badge className="bg-green-500 text-white px-2 py-1 text-xs animate-pulse">
                        🟢 Available Now
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white px-2 py-1 text-xs">
                        Busy
                      </Badge>
                    )}
                  </div>

                  {/* Top Right Actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 transition-all duration-200"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(photographer.id); }}
                    >
                      <Heart className={`w-4 h-4 transition-all duration-200 ${favorites.includes(photographer.id) ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                    </Button>
                  </div>

                  {/* Enhanced Verified Badge */}
                  {photographer.verified && (
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white/50">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold">Verified Pro</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Card Content */}
                <div className="p-4">
                  {/* Vendor Name & Tagline */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                      {photographer.name}
                    </h3>
                    <p className="text-xs text-amber-600 font-medium mb-1">{photographer.tagline}</p>
                    <p className="text-sm text-gray-600">by {photographer.ownerName}</p>
                  </div>

                  {/* Enhanced Rating & Reviews */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(photographer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{photographer.rating}</span>
                      <span className="text-xs text-gray-500">({photographer.reviewCount})</span>
                    </div>
                    {photographer.rating >= 4.7 && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-bold">
                        ⭐ Top Rated
                      </Badge>
                    )}
                  </div>

                  {/* Specialty Tags as Colored Chips */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {photographer.specialtyTags?.slice(0, 4).map((tag, index) => {
                      const colors = [
                        'bg-pink-100 text-pink-700 border-pink-200',
                        'bg-blue-100 text-blue-700 border-blue-200', 
                        'bg-green-100 text-green-700 border-green-200',
                        'bg-purple-100 text-purple-700 border-purple-200'
                      ];
                      return (
                        <span 
                          key={index}
                          className={`text-xs px-2 py-1 rounded-full border font-medium ${colors[index % colors.length]}`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>

                  {/* Location & Languages */}
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{photographer.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Languages: {photographer.languagesSpoken?.join(', ')}</span>
                    </div>
                  </div>

                  {/* Experience & Availability */}
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span>{photographer.experience}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last active: {photographer.lastActive}
                    </div>
                  </div>

                  {/* Price & Enhanced Response Time */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-amber-600">{photographer.startingPrice}</div>
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      photographer.responseTimeColor === 'green' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : photographer.responseTimeColor === 'yellow'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{photographer.responseTime}</span>
                    </div>
                  </div>

                  {/* Enhanced Quick Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 text-sm font-semibold rounded-lg shadow-sm hover:scale-105 transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(photographer); }}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 py-2 text-sm font-semibold rounded-lg hover:scale-105 transition-all duration-200"
                        onClick={(e) => { e.stopPropagation(); handleCardClick(photographer.id); }}
                      >
                        View Profile
                      </Button>
                    </div>
                    
                    {/* Project Count & Quick Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{photographer.totalProjects} completed projects</span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Verified Professional
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg">
            Load More Photographers
          </Button>
        </div>

        {/* No Results */}
        {filteredAndSortedPhotographers.length === 0 && (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No photographers found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all photographers</p>
            <Button 
              onClick={() => { setSearchQuery(''); setLocationFilter('all'); setPriceFilter('all'); }}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't Find the Perfect Photographer?</h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Let us help you find the ideal photography professional for your special event. 
            Our team will connect you with verified photographers in your area.
          </p>
          <Button 
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            onClick={() => openWhatsApp({ ownerName: 'HappyMoments Team' })}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Personalized Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotographyVendors;
