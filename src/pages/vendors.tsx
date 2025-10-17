import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Instagram, Heart, MessageCircle, Camera, Award, Users, Zap, Clock, ChevronLeft, Search, Filter, SlidersHorizontal, TrendingUp, DollarSign, ChevronDown, ChevronUp, User, Shield, X, Mic, MicOff, Send, Loader2, Edit3, Check, Volume2, Languages, Trash2 } from 'lucide-react';
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
import { useVoiceProcessing } from '@/hooks/useVoiceProcessing';

// Local interface for parsed filter data
interface ParsedFilterData {
  serviceType: string;
  location: string;
  budget: string;
  originalQuery: string;
}


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
  const [displayQuery, setDisplayQuery] = useState(searchParams.get('query') || '');
  const [originalSmartRequest, setOriginalSmartRequest] = useState(searchParams.get('original') || '');
  
  const [ratingFilter, setRatingFilter] = useState('all');
  
  // Voice processing hook
  const {
    isListening,
    transcript,
    extractedData,
    startListening,
    stopListening,
    processTranscript,
    clearData,
    error: voiceError
  } = useVoiceProcessing();
  
  // Additional voice states
  const [parsedRequest, setParsedRequest] = useState<ParsedFilterData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-IN' | 'te-IN' | 'auto'>('auto');
  const [isCardMinimized, setIsCardMinimized] = useState(false);
  
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
        console.log('Total vendors fetched:', vendorData.length);
        
        // Debug: Log all photographer vendors
        const photographers = vendorData.filter(v => 
          v.category && v.category.toLowerCase().includes('photograph')
        );
        console.log('Photographers found in database:', photographers.length);
        photographers.forEach((vendor, index) => {
          console.log(`${index + 1}. ${vendor.brand_name} - Category: "${vendor.category}", Verified: ${vendor.verified}, Available: ${vendor.currently_available}, Address: "${vendor.address}"`);
        });
        
        // Debug: Log all vendors with their verification status and ratings
        console.log('All vendors verification status and ratings:');
        vendorData.forEach((vendor, index) => {
          console.log(`${index + 1}. ${vendor.brand_name} - Category: "${vendor.category}", Verified: ${vendor.verified}, Available: ${vendor.currently_available}, Rating: ${vendor.rating} (${typeof vendor.rating})`);
        });
        
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

  // Sync displayQuery with searchQuery when URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('query') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setDisplayQuery(urlQuery);
    }
  }, [searchParams]);

  // Trigger vendor filtering when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      console.log('🔍 Search query changed, filtering vendors:', searchQuery);
      console.log('🔍 Current serviceType state:', serviceType);
      
      // Use the proper request parser instead of simple inline parsing
      const parsedRequest = parseRequest(searchQuery);
      console.log('🔍 Parsed request from requestParser:', parsedRequest);
      
      // Map the parsed service types to filter values
      let extractedServiceType = 'all';
      if (parsedRequest.serviceTypes && parsedRequest.serviceTypes.length > 0) {
        const firstService = parsedRequest.serviceTypes[0].toLowerCase();
        if (firstService.includes('photographer')) {
          extractedServiceType = 'photography';
        } else if (firstService.includes('makeup')) {
          extractedServiceType = 'makeup';
        } else if (firstService.includes('decorator')) {
          extractedServiceType = 'decor';
        } else if (firstService.includes('caterer')) {
          extractedServiceType = 'catering';
        } else if (firstService.includes('venue')) {
          extractedServiceType = 'venues';
        } else if (firstService.includes('dj') || firstService.includes('music') || firstService.includes('entertainment')) {
          extractedServiceType = 'music';
        } else if (firstService.includes('fashion') || firstService.includes('costume')) {
          extractedServiceType = 'attire';
        } else if (firstService.includes('planner')) {
          extractedServiceType = 'planning';
        }
      }
      
      // Map location to filter value
      let extractedLocation = 'all';
      if (parsedRequest.location && parsedRequest.location !== 'Hyderabad') {
        const locationLower = parsedRequest.location.toLowerCase();
        // Map common locations to filter values
        if (locationLower.includes('hyderabad')) {
          extractedLocation = 'hyderabad';
        } else if (locationLower.includes('bangalore')) {
          extractedLocation = 'bangalore';
        } else if (locationLower.includes('chennai')) {
          extractedLocation = 'chennai';
        } else if (locationLower.includes('mumbai')) {
          extractedLocation = 'mumbai';
        } else if (locationLower.includes('delhi')) {
          extractedLocation = 'delhi';
        }
        // Add more location mappings as needed
      }
      
      // Map budget to filter value
      let extractedBudget = 'all';
      if (parsedRequest.budgetRange) {
        const budgetAmount = parsedRequest.budgetRange.min || parsedRequest.budgetRange.max;
        if (budgetAmount <= 50000) {
          extractedBudget = '10k-50k';
        } else if (budgetAmount <= 100000) {
          extractedBudget = '50k-1l';
        } else if (budgetAmount <= 300000) {
          extractedBudget = '1l-3l';
        } else if (budgetAmount <= 1000000) {
          extractedBudget = '3l-10l';
        } else if (budgetAmount <= 1500000) {
          extractedBudget = '10l-15l';
        } else if (budgetAmount <= 2500000) {
          extractedBudget = '15l-25l';
        } else if (budgetAmount <= 5000000) {
          extractedBudget = '25l-50l';
        } else {
          extractedBudget = '50l-1cr';
        }
      }
      
      const parsed = {
          serviceType: extractedServiceType,
          location: extractedLocation,
        budget: extractedBudget,
        originalQuery: searchQuery
      };
      
      console.log('🔍 Final parsed result for filters:', parsed);
      
      // Update the filter states based on parsed data
      if (parsed.serviceType !== 'all') {
        setServiceType(parsed.serviceType);
      }
      if (parsed.location !== 'all') {
        setLocation(parsed.location);
      }
      if (parsed.budget !== 'all') {
        setBudget(parsed.budget);
      }
      
      // Show the "We understood your request" window
      setParsedRequest({
        serviceType: parsed.serviceType,
        location: parsed.location,
        budget: parsed.budget,
        originalQuery: searchQuery
      });
      setIsEditing(false);
    }
  }, [searchQuery]);

  // Handle voice data extraction
  useEffect(() => {
    if (extractedData && transcript) {
      console.log('🎤 Voice data extracted:', extractedData);
      
      // Update the display query with the transcript
      setDisplayQuery(transcript);
      setOriginalSmartRequest(transcript);
      
      // Process the extracted data to update filters
      if (extractedData.serviceType) {
        setServiceType(extractedData.serviceType);
      }
      if (extractedData.location) {
        setLocation(extractedData.location);
      }
      if (extractedData.budget) {
        setBudget(extractedData.budget);
      }
      
      // Auto-trigger search with voice data
      setSearchQuery(transcript);
      const params = new URLSearchParams(searchParams);
      params.set('query', transcript);
      if (extractedData.serviceType) params.set('service', extractedData.serviceType);
      if (extractedData.location) params.set('location', extractedData.location);
      if (extractedData.budget) params.set('budget', extractedData.budget);
      setSearchParams(params);
      
      // Clear voice data after processing
      clearData();
    }
  }, [extractedData, transcript, searchParams, setSearchParams, clearData]);

  // Enhanced filtering and sorting
  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      // Debug: Log all vendors being filtered for photography
      if (serviceType === 'photography') {
        console.log(`🔍 Filtering vendor: ${vendor.brand_name}`, {
          category: vendor.category,
          serviceType,
          location,
          budget
        });
      }
      
      // Service type filter - more flexible matching
      const matchesServiceType = serviceType === 'all' || (() => {
        if (!vendor.category) return false;
        
        const vendorCategory = vendor.category.toLowerCase();
        
        switch (serviceType) {
          case 'photography':
            return vendorCategory.includes('photograph') || 
                   vendorCategory.includes('photo') || 
                   vendorCategory.includes('video') ||
                   vendorCategory.includes('camera') ||
                   vendorCategory === 'photography/videography' ||
                   vendorCategory === '03';
          case 'makeup':
            return vendorCategory.includes('makeup') || 
                   vendorCategory.includes('beauty') ||
                   vendorCategory === 'makeup artists' ||
                   vendorCategory === '06';
          case 'decor':
            return vendorCategory.includes('decor') || 
                   vendorCategory.includes('decoration') ||
                   vendorCategory === 'decorators' ||
                   vendorCategory === '04';
          case 'catering':
            return vendorCategory.includes('cater') || 
                   vendorCategory.includes('food') ||
                   vendorCategory === 'caterers' ||
                   vendorCategory === '05';
          case 'venues':
            return vendorCategory.includes('venue') || 
                   vendorCategory.includes('hall') ||
                   vendorCategory === 'venues' ||
                   vendorCategory === '02';
          case 'music':
            return vendorCategory.includes('music') || 
                   vendorCategory.includes('dj') ||
                   vendorCategory.includes('entertainment') ||
                   vendorCategory === 'djs, lighting, and entertainment' ||
                   vendorCategory === '07';
          case 'attire':
            return vendorCategory.includes('fashion') || 
                   vendorCategory.includes('clothing') ||
                   vendorCategory.includes('designer') ||
                   vendorCategory === 'fashion/costume designers' ||
                   vendorCategory === '10';
          case 'planning':
            return vendorCategory.includes('planning') || 
                   vendorCategory.includes('planner') ||
                   vendorCategory.includes('event management') ||
                   vendorCategory === 'event planners' ||
                   vendorCategory === '01';
          default:
            return false;
        }
      })();

      // Debug logging for service type filtering
      if (serviceType !== 'all') {
        console.log(`🔍 Checking vendor ${vendor.brand_name} for service type "${serviceType}":`, {
          vendor_category: vendor.category,
          vendor_category_lower: vendor.category?.toLowerCase(),
          matches_service_type: matchesServiceType
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
      
      // Price filter - removed as per user request
      
      // Rating filter - SIMPLIFIED FOR DEBUGGING
      const matchesRating = (() => {
        if (ratingFilter === 'all') {
          console.log(`✅ Rating filter: ALL - showing ${vendor.brand_name}`);
          return true;
        }
        
        const rating = vendor.rating || 0;
        const numericRating = parseFloat(rating);
        
        console.log(`🔍 RATING FILTER CHECK:`, {
          vendor: vendor.brand_name,
          original_rating: vendor.rating,
          numeric_rating: numericRating,
          selected_filter: ratingFilter,
          filter_type: typeof ratingFilter
        });
        
        let result = false;
        switch (ratingFilter) {
          case '5':
            result = numericRating >= 5;
            console.log(`${vendor.brand_name}: 5+ filter - rating ${numericRating} >= 5? ${result}`);
            break;
          case '4.5':
            result = numericRating >= 4.5 && numericRating < 5;
            console.log(`${vendor.brand_name}: 4.5+ filter - rating ${numericRating} >= 4.5 and < 5? ${result}`);
            break;
          case '4':
            result = numericRating >= 4 && numericRating < 4.5;
            console.log(`${vendor.brand_name}: 4+ filter - rating ${numericRating} >= 4 and < 4.5? ${result}`);
            break;
          case '3.5':
            result = numericRating >= 3.5 && numericRating < 4;
            break;
          case '3':
            result = numericRating >= 3 && numericRating < 3.5;
            break;
          case '2':
            result = numericRating >= 2 && numericRating < 3;
            break;
          case '1':
            result = numericRating >= 1 && numericRating < 2;
            break;
          default:
            result = true;
        }
        
        console.log(`🎯 FINAL RESULT for ${vendor.brand_name}: ${result ? 'SHOW' : 'HIDE'}`);
        return result;
      })();
      
      const finalMatch = matchesServiceType && matchesLocation && matchesBudget && 
             matchesSearch && matchesRating;

      // Debug logging for overall filtering
      if (serviceType === 'photography' && location === 'telangana') {
        console.log(`🔍 Final filter result for vendor ${vendor.brand_name}:`, {
          vendor_rating: vendor.rating,
          ratingFilter,
          matchesServiceType,
          matchesLocation,
          matchesBudget,
          matchesSearch,
          matchesRating,
          finalMatch
        });
      }
      
      // Debug rating filtering specifically
      if (ratingFilter !== 'all') {
        console.log(`🔍 Rating filter check for ${vendor.brand_name}:`, {
          vendor_rating: vendor.rating,
          ratingFilter,
          matches: matchesRating
        });
      }

      return finalMatch;
    });

  // Debug: Log filtering results
  console.log(`🔍 ===== FILTERING RESULTS =====`);
  console.log(`Current filters: serviceType="${serviceType}", location="${location}", budget="${budget}", ratingFilter="${ratingFilter}"`);
  console.log(`Total vendors in database: ${vendors.length}`);
  console.log(`Vendors after filtering: ${filteredAndSortedVendors.length}`);
  console.log(`Rating filter value: "${ratingFilter}" (type: ${typeof ratingFilter})`);
  
  // Debug: Show rating distribution
  if (ratingFilter !== 'all') {
    const ratingStats = vendors.reduce((acc, vendor) => {
      const rating = parseFloat(vendor.rating) || 0;
      const range = Math.floor(rating);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    console.log('Rating distribution:', ratingStats);
  }

  const sortedVendors = filteredAndSortedVendors
    .sort((a, b) => {
      // Default sorting by rating (highest first)
          return (b.rating || 0) - (a.rating || 0);
    });

  // Debug: Log final results
  if (serviceType === 'photography') {
    console.log('Photography vendors after filtering and sorting:', sortedVendors.map(v => v.brand_name));
  }

  // Clear all filters
  const clearAllFilters = () => {
    setServiceType('all');
    setLocation('all');
    setBudget('all');
    setSearchQuery('');
    setDisplayQuery('');
    setOriginalSmartRequest('');
    setRatingFilter('all');
    setSortBy('rating');
  };

  // Navigate to individual vendor profile
  const handleCardClick = (vendorId: number) => {
    navigate(`/vendor/${vendorId}`);
  };

  // WhatsApp integration - now handled by WhatsAppButton component

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 pb-8">
      {/* Smart Request Input Section - Fixed Layout */}
      <div className="relative py-4 mt-0 overflow-visible min-h-[180px]">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-orange-400"></div>
        
        {/* Back Button - Far Left */}
        <div className="absolute top-4 left-4 z-30">
            <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-white/90 hover:bg-white border-white/50 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
            </Button>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-3">
            {/* Main Content Area */}
            <div className="w-full">
              <Card className="border border-orange-200 shadow-lg mx-0 w-full relative z-20 mb-3">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 py-3 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-orange-800">Your Prompt</span>
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 text-red-600 text-xs mt-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening...</span>
                    </div>
                  )}
                </CardHeader>
                  <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Compact Text Input */}
                    <div className="relative">
                      <Textarea
                        value={originalSmartRequest || displayQuery || ""}
                        onChange={(e) => {
                          setOriginalSmartRequest(e.target.value);
                          setDisplayQuery(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            // Update search query and trigger search
                            const queryToSearch = originalSmartRequest || displayQuery;
                            if (queryToSearch.trim()) {
                              setSearchQuery(queryToSearch);
                            const params = new URLSearchParams(searchParams);
                              params.set('query', queryToSearch);
                            setSearchParams(params);
                            }
                          }
                        }}
                        placeholder="Describe what you need for your event..."
                        className="min-h-[60px] text-sm pr-20"
                        disabled={loading}
                      />
                        
                      {/* Action Buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        {/* Clear Button */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOriginalSmartRequest('');
                            setDisplayQuery('');
                                setSearchQuery('');
                            // Clear URL params as well
                            const params = new URLSearchParams(searchParams);
                            params.delete('query');
                            setSearchParams(params);
                              }}
                          disabled={loading || (!originalSmartRequest?.trim() && !displayQuery?.trim())}
                          className="h-5 w-5 p-0 bg-white hover:bg-red-50 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Clear input"
                            >
                          <Trash2 className="h-3 w-3" />
                            </Button>
                          
                          {!isListening ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                            onClick={() => {
                              startListening();
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
                              stopListening();
                            }}
                            className="h-5 w-5 p-0 animate-pulse bg-red-500 hover:bg-red-600"
                              title="Stop voice recording"
                            >
                            <MicOff className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            type="button"
                          size="sm"
                            onClick={() => {
                            // Update search query and trigger search
                            const queryToSearch = originalSmartRequest || displayQuery;
                            if (queryToSearch.trim()) {
                              setSearchQuery(queryToSearch);
                              const params = new URLSearchParams(searchParams);
                              params.set('query', queryToSearch);
                              setSearchParams(params);
                            }
                            }}
                          disabled={loading || (!originalSmartRequest?.trim() && !displayQuery?.trim())}
                          className="h-5 w-5 p-0 bg-orange-500 hover:bg-orange-600 text-white"
                          title="Send search query"
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

                    {/* Voice Error */}
                    {voiceError && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-xs text-red-700">
                          <strong>Error:</strong> {voiceError}
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

      {/* We Understood Your Request Window */}
      {parsedRequest && !isEditing && (
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <Card className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-6 mb-4">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-3 px-4 rounded-t-lg">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-800">We understood your request!</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCardMinimized(!isCardMinimized)}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                    title={isCardMinimized ? "Expand details" : "Minimize details"}
                  >
                    {isCardMinimized ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-green-300 text-green-600 hover:bg-green-50"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParsedRequest(null);
                      setSearchQuery('');
                      setDisplayQuery('');
                      setOriginalSmartRequest('');
                      const params = new URLSearchParams(searchParams);
                      params.delete('query');
                      setSearchParams(params);
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    title="Close this summary"
                  >
                    <X className="w-4 h-4" />
                </Button>
                </div>
              </div>
            </CardHeader>
            {!isCardMinimized && (
            <CardContent className="p-4">
              {/* Original Prompt Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Original Prompt:</label>
                <p className="text-gray-800 font-medium">"{parsedRequest.originalQuery}"</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Services Needed:</label>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                    {serviceTypes.find(s => s.value === parsedRequest.serviceType)?.label || parsedRequest.serviceType}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location:</label>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                    {parsedRequest.location === 'all' ? 'All Locations' : (cities.find(c => c.value === parsedRequest.location)?.label || parsedRequest.location)}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget:</label>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    {parsedRequest.budget === 'all' ? 'All Budgets' : (budgetRanges.find(b => b.value === parsedRequest.budget)?.label || parsedRequest.budget)}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Trigger search with parsed request
                    setSearchQuery(parsedRequest.originalQuery);
                    const params = new URLSearchParams(searchParams);
                    params.set('query', parsedRequest.originalQuery);
                    params.set('service', parsedRequest.serviceType);
                    params.set('location', parsedRequest.location);
                    params.set('budget', parsedRequest.budget);
                    setSearchParams(params);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Find Vendors
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setParsedRequest(null);
                    setSearchQuery('');
                    setDisplayQuery('');
                    setOriginalSmartRequest('');
                    const params = new URLSearchParams(searchParams);
                    params.delete('query');
                    setSearchParams(params);
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
            )}
            
            {/* Minimized state - show only action buttons */}
            {isCardMinimized && (
              <CardContent className="p-4">
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => {
                      // Trigger search with parsed request
                      setSearchQuery(parsedRequest.originalQuery);
                      const params = new URLSearchParams(searchParams);
                      params.set('query', parsedRequest.originalQuery);
                      params.set('service', parsedRequest.serviceType);
                      params.set('location', parsedRequest.location);
                      params.set('budget', parsedRequest.budget);
                      setSearchParams(params);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Find Vendors
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParsedRequest(null);
                      setSearchQuery('');
                      setDisplayQuery('');
                      setOriginalSmartRequest('');
                      const params = new URLSearchParams(searchParams);
                      params.delete('query');
                      setSearchParams(params);
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Filters Section */}
      <div className="container mx-auto px-4 sm:px-6 py-4 mt-2">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-3 mb-4">
          {/* Main Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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

          {/* Clear Filters and More Filters Buttons - Moved below budget */}
          <div className="flex justify-end gap-2 mb-3 flex-wrap">
            {/* Additional Filters - Only shown when More Filters is clicked */}
            {showAdvancedFilters && (
              <>
                {/* Rating Filter */}
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-32 h-9 border border-gray-200 focus:border-orange-400 text-sm">
                    <SelectValue placeholder="Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    <SelectItem value="3">3+ Stars</SelectItem>
                    <SelectItem value="2">2+ Stars</SelectItem>
                    <SelectItem value="1">1+ Stars</SelectItem>
                  </SelectContent>
                </Select>
                

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 w-48 border border-gray-200 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm"
                />
              </div>
              </>
            )}

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="h-9 border border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 transition-all duration-200 text-sm"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1" />
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 text-sm"
                >
              Clear All Filters
                </Button>
            </div>
            
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between mb-3">
          <div>
                <h2 className="text-2xl font-bold text-gray-900">
              {sortedVendors.length} Vendors Found
            </h2>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading vendors...</p>
          </div>
        ) : (
          <>
            {/* Vendor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedVendors.map((vendor) => (
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
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                          {vendor.brand_name}
                        </h3>
                        
                        {/* Experience */}
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{vendor.experience || 'Not specified'} Experience</span>
                        </div>

                        {/* Events Completed */}
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs text-blue-600 font-bold">✓</span>
                          </div>
                          <span className="font-medium">Completed {vendor.events_completed || 0}+ Events</span>
                        </div>

                        {/* Starting Price */}
                        <div className="mb-2">
                          <div className="text-lg font-bold text-amber-600">
                            {vendor.starting_price && vendor.starting_price > 0
                              ? `Starting from ₹${vendor.starting_price.toLocaleString()}`
                              : 'Contact for pricing'
                            }
                          </div>
                        </div>

                        {/* Service Areas */}
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">
                            {(() => {
                              // Check if service areas exist in additional_info
                              if (vendor.additional_info?.service_areas && Array.isArray(vendor.additional_info.service_areas) && vendor.additional_info.service_areas.length > 0) {
                                // Convert state values to readable labels
                                const stateLabels = vendor.additional_info.service_areas.map(stateValue => {
                                  const stateMap: { [key: string]: string } = {
                                    'andhra-pradesh': 'Andhra Pradesh',
                                    'telangana': 'Telangana',
                                    'karnataka': 'Karnataka',
                                    'tamil-nadu': 'Tamil Nadu',
                                    'kerala': 'Kerala',
                                    'maharashtra': 'Maharashtra',
                                    'goa': 'Goa',
                                    'delhi': 'Delhi',
                                    'punjab': 'Punjab',
                                    'rajasthan': 'Rajasthan',
                                    'gujarat': 'Gujarat',
                                    'madhya-pradesh': 'Madhya Pradesh',
                                    'uttar-pradesh': 'Uttar Pradesh',
                                    'west-bengal': 'West Bengal',
                                    'bihar': 'Bihar',
                                    'jharkhand': 'Jharkhand',
                                    'odisha': 'Odisha',
                                    'chhattisgarh': 'Chhattisgarh',
                                    'haryana': 'Haryana',
                                    'himachal-pradesh': 'Himachal Pradesh',
                                    'jammu-kashmir': 'Jammu & Kashmir',
                                    'ladakh': 'Ladakh',
                                    'uttarakhand': 'Uttarakhand',
                                    'assam': 'Assam',
                                    'arunachal-pradesh': 'Arunachal Pradesh',
                                    'manipur': 'Manipur',
                                    'meghalaya': 'Meghalaya',
                                    'mizoram': 'Mizoram',
                                    'nagaland': 'Nagaland',
                                    'tripura': 'Tripura',
                                    'sikkim': 'Sikkim',
                                    'andaman-nicobar': 'Andaman & Nicobar',
                                    'chandigarh': 'Chandigarh',
                                    'dadra-nagar-haveli': 'Dadra & Nagar Haveli',
                                    'daman-diu': 'Daman & Diu',
                                    'lakshadweep': 'Lakshadweep',
                                    'puducherry': 'Puducherry'
                                  };
                                  return stateMap[stateValue] || stateValue;
                                });
                                
                                const displayText = stateLabels.length > 2 
                                  ? `${stateLabels.slice(0, 2).join(', ')} +${stateLabels.length - 2} more`
                                  : stateLabels.join(', ');
                                return `Servicing ${displayText}`;
                              }
                              // Fallback to address if no service areas
                              return vendor.address ? `Servicing ${vendor.address}` : 'Service area not specified';
                            })()}
                          </span>
                      </div>

                      {/* Rating */}
                        <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                                className={`w-4 h-4 ${i < Math.floor(vendor.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                          <span className="text-sm font-bold text-gray-700">{vendor.rating || 0}★</span>
                        {vendor.review_count && vendor.review_count > 0 ? (
                            <span className="text-xs text-gray-500">({vendor.review_count} reviews)</span>
                        ) : (
                          <span className="text-xs text-gray-400">No reviews yet</span>
                        )}
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
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedVendors.length === 0 && (
              <div className="text-center py-8">
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
