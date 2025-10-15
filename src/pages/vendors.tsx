import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign, ChevronDown, User, Shield, X, Mic, MicOff, Send, Loader2, Edit3, Check, Volume2, Languages, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Header from '../components/layout/Header';
import LikeButton from '@/components/LikeButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Vendor } from '@/lib/supabase';
import { getAllVendors } from '@/services/supabaseService';
import { parseRequest, validateParsedRequest, ParsedRequest } from '../services/requestParser';


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

// States for dropdown (matching the Hero component)
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

const VendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Filter states
  const [serviceType, setServiceType] = useState(searchParams.get('service') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || 'all');
  const [budget, setBudget] = useState(searchParams.get('budget') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [originalSmartRequest, setOriginalSmartRequest] = useState(searchParams.get('original') || '');
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'te-IN' | 'auto'>('auto');
  
  // UI states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch all vendors from Supabase
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        console.log('Fetching all vendors...');
        const vendorData = await getAllVendors();
        console.log('Fetched vendors:', vendorData);
        setVendors(vendorData);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (serviceType !== 'all') params.append('service', serviceType);
    if (location !== 'all') params.append('location', location);
    if (budget !== 'all') params.append('budget', budget);
    
    setSearchParams(params, { replace: true });
  }, [serviceType, location, budget, setSearchParams]);

  // Enhanced filtering and sorting
  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      
      // Service type filter (map service types to categories)
      const serviceCategoryMap: Record<string, string[]> = {
        'photography': ['Photographers', 'Photography/Videography', '03'], // Include category code
        'makeup': ['Makeup Artists', '06'], // Include category code
        'decor': ['Decorators', '04'], // Include category code
        'catering': ['Caterers', '05'], // Include category code
        'venues': ['Venues', '02'], // Include category code
        'music': ['DJs, Lighting, and Entertainment', '07'], // Include category code
        'attire': ['Fashion/Costume Designers', '10'], // Include category code
        'planning': ['Event Planners', '01'] // Include category code
      };
      
      const matchesServiceType = serviceType === 'all' || 
        (serviceCategoryMap[serviceType] && 
         serviceCategoryMap[serviceType].includes(vendor.category));

      // Debug logging for service type filtering
      if (serviceType !== 'all' && serviceType === 'photography') {
        console.log(`🔍 Checking vendor ${vendor.brand_name} for service type "${serviceType}":`, {
          vendor_category: vendor.category,
          expected_categories: serviceCategoryMap[serviceType],
          matches: serviceCategoryMap[serviceType]?.includes(vendor.category)
        });
      }
      
      // Location filter - check both address and service_areas
      const matchesLocation = location === 'all' || 
        (vendor.address && vendor.address.toLowerCase().includes(location.toLowerCase())) ||
        (vendor.additional_info?.service_areas && Array.isArray(vendor.additional_info.service_areas) && 
         vendor.additional_info.service_areas.includes(location));

      // Budget filter - Show vendors whose starting price is within or below the selected budget
      const matchesBudget = (() => {
        if (budget === 'all') return true;
        
        const vendorStartingPrice = vendor.starting_price || 0;
        
        switch (budget) {
          case '10k-50k':
            return vendorStartingPrice <= 50000; // Show vendors with starting price up to ₹50k
          case '50k-1l':
            return vendorStartingPrice <= 100000; // Show vendors with starting price up to ₹1L
          case '1l-3l':
            return vendorStartingPrice <= 300000; // Show vendors with starting price up to ₹3L
          case '3l-10l':
            return vendorStartingPrice <= 1000000; // Show vendors with starting price up to ₹10L
          case '10l-15l':
            return vendorStartingPrice <= 1500000; // Show vendors with starting price up to ₹15L
          case '15l-25l':
            return vendorStartingPrice <= 2500000; // Show vendors with starting price up to ₹25L
          case '25l-50l':
            return vendorStartingPrice <= 5000000; // Show vendors with starting price up to ₹50L
          case '50l-1cr':
            return vendorStartingPrice <= 10000000; // Show vendors with starting price up to ₹1CR
          default:
            return true;
        }
      })();
      
      // Debug logging for location filtering
      if (location !== 'all' && location === 'telangana') {
        console.log(`🔍 Checking vendor ${vendor.brand_name} for location "${location}":`, {
          vendor_address: vendor.address,
          service_areas: vendor.additional_info?.service_areas,
          address_matches: vendor.address?.toLowerCase().includes(location.toLowerCase()),
          service_areas_matches: vendor.additional_info?.service_areas?.includes(location),
          final_location_match: matchesLocation
        });
      }
      
      // Search query filter
      const matchesSearch = searchQuery === '' ||
        vendor.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.spoc_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vendor.specialties && Array.isArray(vendor.specialties) && 
         vendor.specialties.some((specialty: string) => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
         ));
      
      // Price filter
      const matchesPrice = priceFilter === 'all' || 
        (vendor.starting_price && (
          (priceFilter === 'budget' && vendor.starting_price < 35000) ||
          (priceFilter === 'mid' && vendor.starting_price >= 35000 && vendor.starting_price <= 45000) ||
          (priceFilter === 'premium' && vendor.starting_price > 45000)
        ));
      
      // Rating filter
      const matchesRating = ratingFilter === 'all' || (() => {
        const rating = vendor.rating || 0;
        switch (ratingFilter) {
          case '4+': return rating >= 4;
          case '3+': return rating >= 3;
          case '2+': return rating >= 2;
          default: return true;
        }
      })();
      
      const finalMatch = matchesServiceType && matchesLocation && matchesBudget && 
             matchesSearch && matchesPrice && matchesRating;

      // Debug logging for overall filtering
      if (serviceType === 'photography' && location === 'telangana') {
        console.log(`🔍 Final filter result for vendor ${vendor.brand_name}:`, {
          matchesServiceType,
          matchesLocation,
          matchesBudget,
          matchesSearch,
          matchesPrice,
          matchesRating,
          finalMatch
        });
      }

      return finalMatch;
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


  // Clear all filters
  const clearAllFilters = () => {
    setServiceType('all');
    setLocation('all');
    setBudget('all');
    setSearchQuery('');
    setPriceFilter('all');
    setRatingFilter('all');
    setSortBy('rating');
  };

  // Navigate to individual vendor profile
  const handleCardClick = (vendorId: number) => {
    navigate(`/vendor/${vendorId}`);
  };

  // WhatsApp integration - now handled by WhatsAppButton component

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      <Header />
      
      {/* Smart Request Input Section - Compact */}
      <div className="relative py-2 mt-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-white drop-shadow-lg mb-2">
                Your Smart Request
              </h2>
              
              {/* Compact Smart Request Input */}
              <Card className="border border-orange-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Volume2 className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-semibold text-orange-800">Edit your request:</span>
                  </div>
                  
                  {/* Compact Language Selection */}
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-700">Language:</span>
                    <div className="flex gap-1">
                      {[
                        { value: 'auto', label: 'Auto', flag: '🌐' },
                        { value: 'en-IN', label: 'EN', flag: '🇮🇳' },
                        { value: 'te-IN', label: 'TE', flag: '🇮🇳' }
                      ].map((lang) => (
                        <Button
                          key={lang.value}
                          variant={selectedLanguage === lang.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedLanguage(lang.value as any)}
                          className={`text-xs h-5 px-1.5 ${selectedLanguage === lang.value ? 'bg-orange-500 text-white' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}
                        >
                          {lang.flag} {lang.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening...</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {/* Compact Text Input */}
                    <div className="relative">
                      <Textarea
                        value={originalSmartRequest || searchQuery || "wedding photographer in 1 lakhs budget in hyderabad"}
                        onChange={(e) => {
                          setOriginalSmartRequest(e.target.value);
                          setSearchQuery(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            // Re-search with updated query
                            const params = new URLSearchParams(searchParams);
                            params.set('query', originalSmartRequest || searchQuery);
                            setSearchParams(params);
                          }
                        }}
                        placeholder="Describe what you need for your event..."
                        className="min-h-[60px] text-sm pr-16"
                        disabled={loading}
                      />
                        
                      {/* Compact Action Buttons */}
                      <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                        {/* Clear Button */}
                          {(originalSmartRequest || searchQuery) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOriginalSmartRequest('');
                                setSearchQuery('');
                              }}
                              disabled={loading}
                            className="h-5 w-5 p-0 bg-white hover:bg-red-50 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700"
                              title="Clear input"
                            >
                            <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {!isRecording ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                            onClick={() => {
                              // Voice recording functionality would go here
                              console.log('Start recording');
                            }}
                              disabled={loading}
                            className="h-5 w-5 p-0 bg-white hover:bg-gray-50 border-orange-300 hover:border-orange-400"
                              title="Start voice recording"
                            >
                            <Mic className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                            onClick={() => {
                              setIsRecording(false);
                              console.log('Stop recording');
                            }}
                            className="h-5 w-5 p-0 animate-pulse bg-red-500 hover:bg-red-600"
                              title="Stop voice recording"
                            >
                            <MicOff className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            type="button"
                            onClick={() => {
                            // Re-search with updated query
                              const params = new URLSearchParams(searchParams);
                              params.set('query', originalSmartRequest || searchQuery);
                              setSearchParams(params);
                            }}
                            disabled={!originalSmartRequest && !searchQuery}
                          className="h-5 w-5 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                      </div>
                    </div>

                    {/* Compact Voice Transcript */}
                    {transcript && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-700">
                          <strong>Listening:</strong> {transcript}
                        </p>
                      </div>
                    )}

                    {/* Compact Processing Indicator */}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Understanding your request...</span>
                      </div>
                    )}
                  </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white rounded-t-2xl shadow-inner"></div>
      </div>

      {/* Compact Filters Section */}
      <div className="container mx-auto px-4 py-3 -mt-1">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-4 mb-4">
          {/* Clear Filters Button - Moved to top */}
          <div className="text-right mb-4">
            <Button
              onClick={clearAllFilters}
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-sm"
            >
              Clear All Filters
            </Button>
          </div>
          
          {/* Main Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Service Type */}
            <div className="flex-1">
              <label htmlFor="service-type" className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Camera className="h-3 w-3 text-orange-500" />
                What do you need?
              </label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger id="service-type" className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg">
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="rounded-md text-sm">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Location */}
            <div className="flex-1">
              <label htmlFor="city" className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                Where?
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="city" className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg">
                  {cities.map((city) => (
                    <SelectItem key={city.value} value={city.value} className="rounded-md text-sm">
                      {city.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Budget */}
            <div className="flex-1">
              <label htmlFor="budget" className="block text-wedding-navy text-xs font-semibold mb-2 text-left flex items-center gap-1">
                <Users className="h-3 w-3 text-orange-500" />
                Your budget (Optional)
              </label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger id="budget" className="w-full h-9 border border-gray-200 bg-white text-wedding-navy hover:border-orange-300 transition-all duration-200 rounded-lg text-sm">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-lg">
                  {budgetRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="rounded-md text-sm">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Search and Sort Row */}
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  placeholder="Search vendors by name, specialty, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm"
                />
              </div>
              </div>

            {/* Additional Filters Toggle Button */}
            <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-9 border border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 transition-all duration-200 text-sm"
                >
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                  {showAdvancedFilters ? 'Hide' : 'More'}
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
            
          {/* Advanced Filters - Only shown when showAdvancedFilters is true */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-3 mb-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex gap-2 flex-wrap">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="w-28 h-9 border border-gray-200 focus:border-orange-400 text-sm">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Under ₹35k</SelectItem>
                  <SelectItem value="mid">₹35k-45k</SelectItem>
                  <SelectItem value="premium">Above ₹45k</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-28 h-9 border border-gray-200 focus:border-orange-400 text-sm">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="3+">3+ Stars</SelectItem>
                  <SelectItem value="2+">2+ Stars</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 h-9 border border-gray-200 focus:border-orange-400 text-sm">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="price-low">Price ↑</SelectItem>
                  <SelectItem value="price-high">Price ↓</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredAndSortedVendors.length} Vendors Found
            </h2>
            <p className="text-gray-600">
              Showing results for all events
              {serviceType !== 'all' && ` • ${serviceTypes.find(s => s.value === serviceType)?.label}`}
              {location !== 'all' && ` • ${cities.find(c => c.value === location)?.label}`}
              {budget !== 'all' && ` • ${budgetRanges.find(b => b.value === budget)?.label}`}
            </p>
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
            {/* Vendor Cards Grid */}
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
                    {/* Portfolio Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={vendor.avatar_url || vendor.cover_image_url || "/images/vendor-placeholder.jpg"}
                        alt={`${vendor.brand_name} portfolio`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Availability Status */}
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

                      {/* Like Button */}
                      <div className="absolute top-3 right-3 z-10">
                        <LikeButton
                          vendorId={vendor.vendor_id}
                          size="md"
                          className="p-2 bg-white/90 backdrop-blur-xs rounded-full shadow-sm transition-all hover:bg-white relative z-20"
                        />
                      </div>

                      {/* Verified Badge */}
                      {vendor.verified && (
                        <div className="absolute bottom-3 right-3">
                          <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full shadow-lg border-2 border-white/50">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold">Verified Pro</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      {/* Vendor Info */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                          {vendor.brand_name}
                        </h3>
                        <p className="text-xs text-amber-600 font-medium mb-1">{vendor.category}</p>
                        <p className="text-sm text-gray-600">by {vendor.spoc_name}</p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(vendor.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{vendor.rating || 4.5}</span>
                        {vendor.review_count && vendor.review_count > 0 ? (
                          <span className="text-xs text-gray-500">({vendor.review_count})</span>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews yet</span>
                        )}
                      </div>

                      {/* Experience and Availability */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{vendor.experience_years || 1} year{vendor.experience_years !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Available: {vendor.currently_available ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      {/* Specialty Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {vendor.specialties && Array.isArray(vendor.specialties) && 
                         vendor.specialties.slice(0, 3).map((tag: string, index: number) => {
                          const colors = [
                            'bg-pink-100 text-pink-700 border-pink-200',
                            'bg-blue-100 text-blue-700 border-blue-200', 
                            'bg-green-100 text-green-700 border-green-200',
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

                      {/* Location */}
                      {vendor.address && (
                        <div className="flex items-center gap-2 mb-3 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{vendor.address}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-lg font-bold text-amber-600">
                          {vendor.starting_price && vendor.starting_price > 0
                            ? `Starting ₹${vendor.starting_price.toLocaleString()}`
                            : 'Contact for pricing'
                          }
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <WhatsAppButton
                            vendor={vendor}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50 py-2 text-sm font-semibold rounded-lg hover:scale-105 transition-all duration-200"
                            onClick={(e) => { e.stopPropagation(); handleCardClick(vendor.vendor_id); }}
                          >
                            View Profile
                          </Button>
                        </div>
                        
                        {/* Add to Compare Button */}
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 text-sm font-medium rounded-lg"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          Add to Compare
                        </Button>
                      </div>
                      
                      {/* Verified Professional Footer */}
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                          <span>0</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Verified Professional</span>
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
                  onClick={clearAllFilters}
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
            onClick={() => window.open('https://wa.me/1234567890?text=Hi! I need personalized vendor recommendations for my event.', '_blank')}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Get Personalized Recommendations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;
