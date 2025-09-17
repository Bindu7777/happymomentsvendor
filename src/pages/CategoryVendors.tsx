import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('rating');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

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
      
      const matchesPrice = priceFilter === 'all' || true; // We'll implement this based on packages
      
      return matchesSearch && matchesLocation && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          const aPrice = a.packages && Array.isArray(a.packages) && a.packages.length > 0 
            ? parseInt((a.packages[0].price || '0').replace(/[^\d]/g, '')) 
            : 0;
          const bPrice = b.packages && Array.isArray(b.packages) && b.packages.length > 0 
            ? parseInt((b.packages[0].price || '0').replace(/[^\d]/g, '')) 
            : 0;
          return aPrice - bPrice;
        case 'price-high':
          const aPriceHigh = a.packages && Array.isArray(a.packages) && a.packages.length > 0 
            ? parseInt((a.packages[0].price || '0').replace(/[^\d]/g, '')) 
            : 0;
          const bPriceHigh = b.packages && Array.isArray(b.packages) && b.packages.length > 0 
            ? parseInt((b.packages[0].price || '0').replace(/[^\d]/g, '')) 
            : 0;
          return bPriceHigh - aPriceHigh;
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
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{vendor.address || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="text-xs">Languages: {vendor.languages_spoken || 'Not specified'}</span>
                        </div>
                      </div>

                      {/* Experience & Availability */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>{vendor.experience || 'Experience not specified'}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Available: {vendor.currently_available ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {/* Price & Enhanced Response Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-amber-600">
                          {vendor.packages && Array.isArray(vendor.packages) && vendor.packages.length > 0
                            ? `From ${vendor.packages[0].price || 'Contact for pricing'}`
                            : 'Contact for pricing'
                          }
                        </div>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
                          <Clock className="w-3 h-3" />
                          <span>Fast Response</span>
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
                        
                        {/* Project Count & Quick Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{vendor.total_events || 0} completed events</span>
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
