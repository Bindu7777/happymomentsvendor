import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign, ChevronDown, User, Calendar, Shield, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Header from '../components/layout/Header';
import { Vendor } from '@/lib/supabase';
import { getVendorsByCategory } from '@/services/supabaseService';
import { CATEGORY_NAMES } from '@/constants/categories';

const CategoryVendors = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [genderPreference, setGenderPreference] = useState('all');
  const [serviceDuration, setServiceDuration] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [negotiableFilter, setNegotiableFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [comparisonVendors, setComparisonVendors] = useState<Vendor[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Fetch vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      if (!category) return;
      
      try {
        // Convert URL parameter back to proper category name
        let categoryName = category
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Handle special cases for better matching
        const categoryMappings: Record<string, string> = {
          'photographers': 'Photographers',
          'event-planners': 'Event Planners',
          'venues': 'Venues',
          'decorators': 'Decorators',
          'caterers': 'Caterers',
          'makeup-artists': 'Makeup Artists',
          'djs-lighting-and-entertainment': 'DJs, Lighting, and Entertainment',
          'anchors': 'Anchors',
          'transportation-services': 'Transportation Services',
          'fashion-costume-designers': 'Fashion/Costume Designers',
          'tent-equipment-rentals': 'Tent & Equipment Rentals'
        };
        
        // Use mapping if available, otherwise use the converted name
        categoryName = categoryMappings[category] || categoryName;
        
        console.log('Fetching vendors for category:', categoryName);
        const vendorData = await getVendorsByCategory(categoryName);
        console.log('Fetched vendors for category:', vendorData);
        setVendors(vendorData);
      } catch (error) {
        console.error('Error fetching vendors by category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [category]);

  // Enhanced filtering and sorting for real vendor data
  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      const matchesSearch = vendor.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.spoc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (vendor.specialties && Array.isArray(vendor.specialties) && 
                            vendor.specialties.some((specialty: string) => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                            ));
      
      const matchesLocation = locationFilter === 'all' || 
                             (vendor.address && vendor.address.toLowerCase().includes(locationFilter.toLowerCase()));
      
      const matchesPrice = priceFilter === 'all' || 
        (vendor.starting_price && (
          (priceFilter === 'budget' && vendor.starting_price < 35000) ||
          (priceFilter === 'mid' && vendor.starting_price >= 35000 && vendor.starting_price <= 45000) ||
          (priceFilter === 'premium' && vendor.starting_price > 45000)
        ));
      
      const matchesGender = genderPreference === 'all' || 
                           (genderPreference === 'male' && vendor.spoc_name && vendor.spoc_name.toLowerCase().includes('male')) ||
                           (genderPreference === 'female' && vendor.spoc_name && vendor.spoc_name.toLowerCase().includes('female'));
      
      const matchesRating = ratingFilter === 'all' || (() => {
        const rating = vendor.rating || 0;
        switch (ratingFilter) {
          case '4+': return rating >= 4;
          case '3+': return rating >= 3;
          case '2+': return rating >= 2;
          default: return true;
        }
      })();
      
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'available' && vendor.currently_available) ||
                                 (availabilityFilter === 'busy' && !vendor.currently_available);
      
      return matchesSearch && matchesLocation && matchesPrice && matchesGender && matchesRating && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.starting_price || 0) - (b.starting_price || 0);
        case 'price-high':
          return (b.starting_price || 0) - (a.starting_price || 0);
        case 'experience':
          const aExp = parseInt((a.experience || '0').replace(/[^\d]/g, ''));
          const bExp = parseInt((b.experience || '0').replace(/[^\d]/g, ''));
          return bExp - aExp;
        case 'reviews':
          return (b.review_count || 0) - (a.review_count || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  // Toggle favorite
  const toggleFavorite = (vendorId: string) => {
    setFavorites(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setLocationFilter('all');
    setPriceFilter('all');
    setGenderPreference('all');
    setServiceDuration('all');
    setEventType('all');
    setRatingFilter('all');
    setAvailabilityFilter('all');
    setNegotiableFilter('all');
    setSortBy('rating');
  };

  // Comparison functions
  const addToComparison = (vendor: Vendor) => {
    if (comparisonVendors.length >= 3) {
      alert('You can compare maximum 3 vendors at a time');
      return;
    }
    if (!comparisonVendors.find(v => v.vendor_id === vendor.vendor_id)) {
      setComparisonVendors([...comparisonVendors, vendor]);
    }
  };

  const removeFromComparison = (vendorId: number) => {
    setComparisonVendors(comparisonVendors.filter(v => v.vendor_id !== vendorId));
  };

  const clearComparison = () => {
    setComparisonVendors([]);
    setShowComparison(false);
  };

  // Navigate to individual vendor profile
  const handleCardClick = (vendorId: number) => {
    navigate(`/vendor/${vendorId}`);
  };

  // WhatsApp integration
  const openWhatsApp = (vendor: Vendor) => {
    const message = `Hi ${vendor.spoc_name}! I found your ${vendor.category} services and I'm interested in learning more about your packages. Could you please share your availability and pricing details?`;
    const phoneNumber = vendor.whatsapp_number || vendor.phone_number;
    const whatsappUrl = `https://wa.me/${phoneNumber?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatCategoryName = (cat: string) => {
    return cat
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      <Header />
      
      {/* Premium Enhanced Header */}
      <div className="relative py-8 sm:py-10 mt-16 overflow-hidden">
        {/* Enhanced Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/80 via-transparent to-orange-300/60"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header with Typography */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {formatCategoryName(category || '')} Vendors
              </h1>
              {/* Elegant Accent Line */}
              <div className="mt-3 h-1 w-24 bg-gradient-to-r from-white via-amber-200 to-transparent rounded-full shadow-sm"></div>
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
                      placeholder={`Search ${formatCategoryName(category || '')}...`}
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
            </div>
          </div>
        </div>
        
        {/* Enhanced Curved Separator with Shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-3xl shadow-inner" style={{
          boxShadow: 'inset 0 4px 8px -2px rgba(0, 0, 0, 0.1)'
        }}></div>
      </div>

      {/* Advanced Filters Section */}
      <div className="container mx-auto px-4 py-4 -mt-2">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-orange-500" />
              Advanced Filters
            </h3>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 flex items-center gap-2"
            >
              <span>{showAdvancedFilters ? 'Hide' : 'Show'} Options</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gender Preference */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={genderPreference} onValueChange={setGenderPreference}>
                  <SelectTrigger className="pl-10 h-12 w-full border-2 border-gray-200 focus:border-orange-400 text-sm rounded-xl">
                    <SelectValue placeholder="Gender Preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Gender</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Duration */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={serviceDuration} onValueChange={setServiceDuration}>
                  <SelectTrigger className="pl-10 h-12 w-full border-2 border-gray-200 focus:border-orange-400 text-sm rounded-xl">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Duration</SelectItem>
                    <SelectItem value="half-day">Half Day (4-6 hrs)</SelectItem>
                    <SelectItem value="full-day">Full Day (8+ hrs)</SelectItem>
                    <SelectItem value="multi-day">Multi Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="pl-10 h-12 w-full border-2 border-gray-200 focus:border-orange-400 text-sm rounded-xl">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Event</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="pl-10 h-12 w-full border-2 border-gray-200 focus:border-orange-400 text-sm rounded-xl">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4+">4+ Stars</SelectItem>
                    <SelectItem value="3+">3+ Stars</SelectItem>
                    <SelectItem value="2+">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="pl-10 h-12 w-full border-2 border-gray-200 focus:border-orange-400 text-sm rounded-xl">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Status</SelectItem>
                    <SelectItem value="available">Available Now</SelectItem>
                    <SelectItem value="busy">Currently Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compact Results Summary */}
      <div className="container mx-auto px-4 py-4 -mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredAndSortedVendors.length} Results Found
            </h2>
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{filteredAndSortedVendors.filter(v => v.currently_available).length} available</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>All verified</span>
              </div>
            </div>
          </div>

          {/* Comparison Controls */}
          <div className="flex items-center gap-3">
            {comparisonVendors.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {comparisonVendors.length} selected for comparison
                </span>
                <Button
                  onClick={() => setShowComparison(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Compare Now
                </Button>
                <Button
                  onClick={clearComparison}
                  variant="outline"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
          
          {/* Active Filters Display */}
          <div className="flex items-center gap-2">
            {(searchQuery || locationFilter !== 'all' || priceFilter !== 'all' || genderPreference !== 'all' || ratingFilter !== 'all' || availabilityFilter !== 'all') && (
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
                {genderPreference !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    👤 {genderPreference}
                  </Badge>
                )}
                {ratingFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ {ratingFilter}
                  </Badge>
                )}
                {availabilityFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    🟢 {availabilityFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 p-1"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <>
            {/* Enhanced Vendor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedVendors.map((vendor) => (
                <Card 
                  key={vendor.vendor_id}
                  className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 bg-white overflow-hidden ${
                    vendor.verified 
                      ? 'border-green-200 hover:border-green-400' 
                      : 'border-amber-100 hover:border-amber-300'
                  } ${hoveredCard === vendor.vendor_id ? 'ring-2 ring-amber-300' : ''}`}
                  onClick={() => handleCardClick(vendor.vendor_id)}
                  onMouseEnter={() => setHoveredCard(vendor.vendor_id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-0">
                    {/* Enhanced Portfolio Gallery */}
                    <div className="relative h-48 overflow-hidden">
                      {/* Main Portfolio Image */}
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={`${vendor.brand_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Top Left - Availability Status */}
                      <div className="absolute top-3 left-3">
                        {vendor.currently_available ? (
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
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(vendor.vendor_id); }}
                        >
                          <Heart className={`w-4 h-4 transition-all duration-200 ${favorites.includes(vendor.vendor_id) ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                        </Button>
                      </div>

                      {/* Enhanced Verified Badge */}
                      {vendor.verified && (
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
                          {vendor.brand_name}
                        </h3>
                        <p className="text-xs text-amber-600 font-medium mb-1">{vendor.category}</p>
                        <p className="text-sm text-gray-600">by {vendor.spoc_name}</p>
                      </div>

                      {/* Enhanced Rating & Reviews */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(vendor.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{vendor.rating || 4.5}</span>
                          <span className="text-xs text-gray-500">({vendor.review_count || 0})</span>
                        </div>
                        {vendor.rating && vendor.rating >= 4.7 && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-bold">
                            ⭐ Top Rated
                          </Badge>
                        )}
                      </div>

                      {/* Specialty Tags as Colored Chips */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vendor.specialties && Array.isArray(vendor.specialties) && 
                         vendor.specialties.slice(0, 4).map((tag: string, index: number) => {
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
                        {vendor.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{vendor.address}</span>
                          </div>
                        )}
                        {vendor.languages_spoken && Array.isArray(vendor.languages_spoken) && vendor.languages_spoken.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span className="text-xs">
                              Languages: {vendor.languages_spoken.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Experience & Availability */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        {vendor.experience && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Award className="w-4 h-4" />
                            <span>{vendor.experience}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Available: {vendor.currently_available ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-amber-600">
                          {vendor.starting_price 
                            ? `Starting ₹${vendor.starting_price.toLocaleString()}`
                            : 'Contact for pricing'
                          }
                        </div>
                      </div>

                      {/* Enhanced Quick Actions */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 text-sm font-semibold rounded-lg shadow-sm hover:scale-105 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(vendor); }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 py-2 text-sm font-semibold rounded-lg hover:scale-105 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); handleCardClick(vendor.vendor_id); }}
                          >
                            View Profile
                          </Button>
                        </div>
                        
                        <Button
                          variant="outline"
                          className={`w-full py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            comparisonVendors.find(v => v.vendor_id === vendor.vendor_id)
                              ? 'bg-orange-100 border-orange-300 text-orange-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (comparisonVendors.find(v => v.vendor_id === vendor.vendor_id)) {
                              removeFromComparison(vendor.vendor_id);
                            } else {
                              addToComparison(vendor);
                            }
                          }}
                        >
                          {comparisonVendors.find(v => v.vendor_id === vendor.vendor_id) ? 'Remove from Compare' : 'Add to Compare'}
                        </Button>
                        
                        {/* Project Count & Quick Info */}
                        {vendor.total_events && vendor.total_events > 0 && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{vendor.total_events} completed events</span>
                            {vendor.verified && (
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Verified Professional
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedVendors.length === 0 && (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria or browse all vendors</p>
                <Button 
                  onClick={() => { setSearchQuery(''); setLocationFilter('all'); setPriceFilter('all'); }}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Compare Vendors</h2>
              <Button
                onClick={() => setShowComparison(false)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonVendors.map((vendor) => (
                  <div key={vendor.vendor_id} className="border border-gray-200 rounded-xl p-4">
                    <div className="text-center mb-4">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={vendor.brand_name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h3 className="text-lg font-bold text-gray-800">{vendor.brand_name}</h3>
                      <p className="text-sm text-gray-600">{vendor.category}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="font-semibold">{vendor.rating?.toFixed(1) || 'New'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-semibold text-orange-600">
                          {vendor.starting_price ? `₹${vendor.starting_price.toLocaleString()}` : 'Contact for pricing'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Experience:</span>
                        <span className="font-medium">{vendor.experience || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="font-medium">{vendor.location || 'Not specified'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Availability:</span>
                        <span className={`font-medium ${vendor.currently_available ? 'text-green-600' : 'text-red-600'}`}>
                          {vendor.currently_available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      
                      {vendor.languages_spoken && vendor.languages_spoken.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Languages:</span>
                          <p className="text-sm font-medium mt-1">{vendor.languages_spoken.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => handleCardClick(vendor.vendor_id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 text-sm font-semibold rounded-lg"
                      >
                        View Full Profile
                      </Button>
                      <Button
                        onClick={() => openWhatsApp(vendor)}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 py-2 text-sm font-semibold rounded-lg"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <Button
                onClick={clearComparison}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setShowComparison(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't Find the Perfect Vendor?</h2>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Let us help you find the ideal professional for your special event. 
            Our team will connect you with verified vendors in your area.
          </p>
          <Button 
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            onClick={() => openWhatsApp({ spoc_name: 'HappyMoments Team' } as Vendor)}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Personalized Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryVendors;
